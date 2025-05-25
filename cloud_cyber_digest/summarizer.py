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

    prompt = f"""
You are a cybersecurity analyst. Summarize the following article in 3 clear, structured sections.

Each section must begin with a label (**bolded**) and a colon. Avoid emojis or numbering. Keep the writing concise and actionable.

Title: {title}
Content: {content}

Output format (MUST match this exactly):

**Summary:** One short paragraph summarizing the main incident or theme.

**Impact:** A short explanation of how it affects organizations or users.

**Takeaways:** 2–3 action-oriented recommendations (one paragraph or bullet list).
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
