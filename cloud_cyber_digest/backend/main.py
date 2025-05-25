from fetcher import fetch_articles
from summarizer import summarize_article, generate_takeaways
from mongo_handler import save_article
from telegram_sender import send_today_pdf
from pdf_generator import create_one_page_summary
from pdf_generator import OnePageCyberBrief  # for severity detection
from datetime import datetime
from auth_handler import get_current_user
from fastapi import Depends, FastAPI

app = FastAPI()

@app.get("/profile")
async def get_profile(user=Depends(get_current_user)):
    return {"uid": user["uid"], "email": user["email"]}


print("🔍 Fetching real articles...")
articles = fetch_articles(limit=9)

processed_articles = []

for article in articles:
    print(f"📰 Title: {article['title']}")
    summary = summarize_article(article["title"], article["summary"])

    # Determine severity
    severity = OnePageCyberBrief().determine_severity(article["title"], summary)

    # Save to MongoDB
    mongo_ready = {
        "title": article["title"],
        "summary": summary,
        "url": article["link"],
        "severity": severity
    }
    save_article(mongo_ready)

    # Prepare for PDF
    processed_articles.append({
        "title": article["title"],
        "summary": summary,
        "severity": severity
    })

# 🔥 Generate takeaways from summaries
takeaway_text = "\n".join(
    f"{a['title']}\n{a['summary']}" for a in processed_articles
)
takeaways = generate_takeaways(takeaway_text)

# 📊 Build summary stats
stats = {
    "total": len(processed_articles),
    "critical": sum(1 for a in processed_articles if a["severity"] == "critical"),
    "high": sum(1 for a in processed_articles if a["severity"] == "high"),
    "medium": sum(1 for a in processed_articles if a["severity"] == "medium"),
    "low": sum(1 for a in processed_articles if a["severity"] == "low"),
}

# 🧠 Compact key incidents table
incidents = []
for a in processed_articles:
    impact_line = ""
    for line in a["summary"].split("\n"):
        if "⚠" in line or "impact" in line.lower():
            impact_line = line.strip()
            break

    incidents.append({
        "title": a["title"],
        "severity": a["severity"],
        "impact": impact_line
    })

# 📄 Generate the 1-page PDF
pdf = create_one_page_summary(stats, takeaways, incidents)

# 💾 Save and send
filename = pdf.save()
send_today_pdf()

print(f"✅ One-page brief generated and sent: {filename}")
