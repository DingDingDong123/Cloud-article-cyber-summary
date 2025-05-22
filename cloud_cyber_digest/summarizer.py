import os
import hashlib
import google.generativeai as genai
from config import GEMINI_API_KEY

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("models/gemini-1.5-flash")

def summarize_article(title: str, content: str) -> str:
    cache_dir = "summaries"
    os.makedirs(cache_dir, exist_ok=True)

    key = hashlib.md5(f"{title}{content}".encode()).hexdigest()
    cache_path = os.path.join(cache_dir, f"{key}.txt")

    if os.path.exists(cache_path):
        with open(cache_path, "r") as f:
            return f.read()

    prompt = f"""Summarize the following article in 3 parts:

Title: {title}
Content: {content}

Format:
1. 📰 Summary:
2. ⚠️ Impact:
3. ✅ Takeaways:
"""
    try:
        response = model.generate_content(prompt)
        result = response.text.strip()
        with open(cache_path, "w") as f:
            f.write(result)
        return result

    except Exception as e:
        return f"❌ Error from Gemini: {e}"


def generate_takeaways(all_summaries: str):
    prompt = f"""You are an AI cybersecurity analyst.

Based on the following article summaries, extract 5 short but impactful takeaways for CISO and SOC leaders:

{all_summaries}

Return a numbered list of 5 insights.
"""
    try:
        response = model.generate_content(prompt)
        return response.text.strip().split("\n")
    except Exception as e:
        return [f"❌ Error from Gemini: {e}"]
