from pymongo import MongoClient
from datetime import datetime
from config import MONGO_URI

client = MongoClient(MONGO_URI)
db = client["cyber_digest"]
collection = db["summaries"]

def save_article(article):
    # Add today's date
    article["date"] = datetime.now().strftime("%Y-%m-%d")
    
    # Avoid duplicates by title
    if collection.count_documents({"title": article["title"]}) == 0:
        collection.insert_one(article)
        print(f"[+] Inserted article: {article['title']}")
    else:
        print(f"[-] Skipped (duplicate): {article['title']}")
