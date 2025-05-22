import asyncio
import logging
from datetime import datetime
from typing import List, Dict, Optional
import aiohttp
from bs4 import BeautifulSoup
from openai import AsyncOpenAI
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from config import settings
import telegram
from telegram.ext import Application
import re
from urllib.parse import urljoin
import os

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class ArticleFetcher:
    def __init__(self):
        self.session = None
        self.openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.source_patterns = {
            "bleepingcomputer.com": {
                "article_selector": "article",
                "title_selector": "h2.title",
                "link_selector": "a",
                "date_selector": "time",
                "content_selector": "div.article_section"
            },
            "securityweek.com": {
                "article_selector": "article",
                "title_selector": "h2.article-title",
                "link_selector": "a.article-title",
                "date_selector": "time",
                "content_selector": "div.article-content"
            },
            "darkreading.com": {
                "article_selector": "div.article-list-item",
                "title_selector": "h3.article-title",
                "link_selector": "a.article-title",
                "date_selector": "time",
                "content_selector": "div.article-summary"
            },
            "zdnet.com": {
                "article_selector": "div.article",
                "title_selector": "h3",
                "link_selector": "a",
                "date_selector": "time",
                "content_selector": "div.summary"
            }
        }

    async def init_session(self):
        if not self.session:
            self.session = aiohttp.ClientSession()

    async def close_session(self):
        if self.session:
            await self.session.close()
            self.session = None

    def _get_source_pattern(self, url: str) -> Optional[Dict]:
        for domain, pattern in self.source_patterns.items():
            if domain in url:
                return pattern
        return None

    def _extract_article_data(self, article_element, pattern: Dict, base_url: str) -> Optional[Dict]:
        try:
            title_elem = article_element.select_one(pattern["title_selector"])
            if not title_elem:
                return None

            title = title_elem.text.strip()
            link_elem = article_element.select_one(pattern["link_selector"])
            url = urljoin(base_url, link_elem["href"]) if link_elem and "href" in link_elem.attrs else None
            
            date_elem = article_element.select_one(pattern["date_selector"])
            date = date_elem.text.strip() if date_elem else None
            
            content_elem = article_element.select_one(pattern["content_selector"])
            content = content_elem.text.strip() if content_elem else None

            return {
                'title': title,
                'url': url,
                'date': date,
                'content': content
            }
        except Exception as e:
            logger.error(f"Error extracting article data: {str(e)}")
            return None

    def _is_relevant_article(self, article: Dict) -> bool:
        if not article.get('title') or not article.get('content'):
            return False

        text_to_check = f"{article['title']} {article.get('content', '')}"
        text_to_check = text_to_check.lower()
        
        return any(keyword.lower() in text_to_check for keyword in settings.SEARCH_KEYWORDS)

    async def fetch_articles(self) -> List[Dict]:
        await self.init_session()
        articles = []
        
        for source in settings.NEWS_SOURCES:
            try:
                pattern = self._get_source_pattern(source)
                if not pattern:
                    logger.warning(f"No pattern found for source: {source}")
                    continue

                async with self.session.get(source) as response:
                    if response.status == 200:
                        html = await response.text()
                        soup = BeautifulSoup(html, 'html.parser')
                        
                        for article_elem in soup.select(pattern["article_selector"])[:10]:
                            article_data = self._extract_article_data(article_elem, pattern, source)
                            if article_data and self._is_relevant_article(article_data):
                                article_data['source'] = source
                                articles.append(article_data)
                                
                                if len(articles) >= settings.MAX_ARTICLES_PER_DAY:
                                    return articles
            except Exception as e:
                logger.error(f"Error fetching from {source}: {str(e)}")

        return articles

    async def summarize_article(self, article: Dict) -> str:
        try:
            prompt = f"""Please summarize this cloud security article in a {settings.SUMMARY_LENGTH} format:

Title: {article['title']}
Content: {article.get('content', '')}

Focus on key security implications, vulnerabilities, or best practices mentioned."""

            response = await self.openai_client.chat.completions.create(
                model=settings.GPT_MODEL,
                messages=[
                    {"role": "system", "content": "You are a cybersecurity expert specializing in cloud security. Provide clear, concise summaries focusing on security implications."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=settings.MAX_TOKENS,
                temperature=settings.TEMPERATURE
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Error summarizing article: {str(e)}")
            return "Error generating summary"

class ArticleDeliverer:
    def __init__(self):
        self.telegram_bot = None
        if settings.TELEGRAM_BOT_TOKEN:
            self.telegram_bot = Application.builder().token(settings.TELEGRAM_BOT_TOKEN).build()
        self.latest_summaries = []

    async def deliver_summaries(self, articles: List[Dict]):
        if not articles:
            logger.info("No articles to deliver")
            return

        # Store latest summaries for web interface
        self.latest_summaries = articles

        # Format message for delivery
        message = self._format_summary_message(articles)

        # Deliver via Telegram if configured
        if self.telegram_bot:
            await self._deliver_telegram(message)

        # Log to console as fallback
        logger.info(f"Generated summaries:\n{message}")

    def _format_summary_message(self, articles: List[Dict]) -> str:
        message = "📰 Daily Cloud Security News Summary\n\n"
        for article in articles:
            message += f"🔹 {article['title']}\n"
            if article.get('summary'):
                message += f"{article['summary']}\n"
            if article.get('date'):
                message += f"📅 {article['date']}\n"
            if article.get('url'):
                message += f"🔗 Read more: {article['url']}\n"
            message += "\n"
        return message

    async def _deliver_telegram(self, message: str):
        try:
            chat_id = os.getenv("TELEGRAM_CHAT_ID")
            if not chat_id:
                logger.error("TELEGRAM_CHAT_ID not configured")
                return

            await self.telegram_bot.bot.send_message(
                chat_id=chat_id,
                text=message,
                parse_mode='HTML',
                disable_web_page_preview=True
            )
        except Exception as e:
            logger.error(f"Error sending Telegram message: {str(e)}")

    def get_latest_summaries(self) -> List[Dict]:
        return self.latest_summaries

class ArticleSummarizer:
    def __init__(self):
        self.fetcher = ArticleFetcher()
        self.deliverer = ArticleDeliverer()

    async def process_articles(self):
        try:
            articles = await self.fetcher.fetch_articles()
            for article in articles:
                article['summary'] = await self.fetcher.summarize_article(article)
            await self.deliverer.deliver_summaries(articles)
        except Exception as e:
            logger.error(f"Error processing articles: {str(e)}")
        finally:
            await self.fetcher.close_session()

# FastAPI web interface
from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
import uvicorn

app = FastAPI(title="Cloud Security News Summarizer")
summarizer = ArticleSummarizer()

@app.get("/", response_class=HTMLResponse)
async def get_summaries():
    articles = summarizer.deliverer.get_latest_summaries()
    if not articles:
        return """
        <html>
            <head>
                <title>Cloud Security News</title>
                <style>
                    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
                    .article { margin-bottom: 30px; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
                    .title { color: #2c3e50; margin-bottom: 10px; }
                    .summary { color: #34495e; line-height: 1.6; }
                    .meta { color: #7f8c8d; font-size: 0.9em; }
                    .link { color: #3498db; text-decoration: none; }
                    .link:hover { text-decoration: underline; }
                </style>
            </head>
            <body>
                <h1>No articles available yet</h1>
                <p>Check back later for the latest cloud security news summaries.</p>
            </body>
        </html>
        """

    html = """
    <html>
        <head>
            <title>Cloud Security News</title>
            <style>
                body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
                .article { margin-bottom: 30px; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
                .title { color: #2c3e50; margin-bottom: 10px; }
                .summary { color: #34495e; line-height: 1.6; }
                .meta { color: #7f8c8d; font-size: 0.9em; }
                .link { color: #3498db; text-decoration: none; }
                .link:hover { text-decoration: underline; }
            </style>
        </head>
        <body>
            <h1>Latest Cloud Security News</h1>
    """

    for article in articles:
        html += f"""
            <div class="article">
                <h2 class="title">{article['title']}</h2>
                <div class="summary">{article.get('summary', '')}</div>
                <div class="meta">
                    {f"<div>Date: {article['date']}</div>" if article.get('date') else ""}
                    {f"<div>Source: {article['source']}</div>" if article.get('source') else ""}
                    {f'<div><a href="{article["url"]}" class="link" target="_blank">Read more</a></div>' if article.get('url') else ""}
                </div>
            </div>
        """

    html += """
        </body>
    </html>
    """
    return html

async def main():
    # Start the FastAPI server
    config = uvicorn.Config(app, host="0.0.0.0", port=8000, log_level="info")
    server = uvicorn.Server(config)
    
    # Start the scheduler
    scheduler = AsyncIOScheduler()
    hour, minute = map(int, settings.SCHEDULE_TIME.split(':'))
    scheduler.add_job(
        summarizer.process_articles,
        CronTrigger(hour=hour, minute=minute),
        id='daily_summary'
    )
    scheduler.start()
    
    logger.info("Starting server and scheduler...")
    await server.serve()

if __name__ == "__main__":
    asyncio.run(main()) 