from fetcher import fetch_articles
from summarizer import summarize_article

print("🔍 Fetching real articles...")
articles = fetch_articles(limit=3)

for i, article in enumerate(articles, start=1):
    print(f"\n--- Article {i} ---")
    print(f"🔗 {article['link']}")
    print(f"📰 Title: {article['title']}")
    
    summary = summarize_article(article["title"], article["summary"])
    print(f"\n🧠 Summary:\n{summary}")
from pdf_generator import CyberPDF
from summarizer import summarize_article, generate_takeaways

# Build PDF
pdf = CyberPDF()

for article in articles:
    summary = summarize_article(article['title'], article['summary'])
    pdf.add_article(article['title'], summary)

# 🔥 Ask Gemini to generate 5 key takeaways
takeaway_text = "\n".join([f"{a['title']}\n{a['summary']}" for a in articles])
takeaways = generate_takeaways(takeaway_text)
pdf.add_takeaways(takeaways)

# Save it
pdf.save()
