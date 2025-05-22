import os
import re
import unicodedata
from datetime import datetime
from fpdf import FPDF


def sanitize_text(text):
    # Remove bold/italic markdown
    text = re.sub(r"\*\*(.*?)\*\*", r"\1", text)
    text = re.sub(r"\*(.*?)\*", r"\1", text)

    # Normalize to ASCII-like characters (remove emojis, symbols)
    text = unicodedata.normalize('NFKD', text)
    text = ''.join(c for c in text if not unicodedata.category(c).startswith('So'))  # Symbol, Other
    text = ''.join(c for c in text if c.isprintable())

    # Break long words (no space within 50+ characters)
    def break_long_words(match):
        word = match.group(0)
        return ' '.join([word[i:i + 30] for i in range(0, len(word), 30)])

    text = re.sub(r"(\S{50,})", break_long_words, text)

    return text


class CyberPDF(FPDF):
    def __init__(self):
        super().__init__()
        self.add_font("FreeSerif", "", os.path.join("fonts", "FreeSerif.ttf"), uni=True)
        self.add_font("FreeSerif", "B", os.path.join("fonts", "FreeSerifBold.ttf"), uni=True)
        self.set_auto_page_break(auto=True, margin=15)
        self.add_page()

    def header(self):
        self.set_font("FreeSerif", "B", 14)
        self.cell(0, 10, "Daily Cloud Security Brief", ln=True, align="C")
        self.set_font("FreeSerif", "", 11)
        self.cell(0, 10, datetime.now().strftime("%B %d, %Y"), ln=True, align="C")
        self.ln(5)

    def add_article(self, title, summary):
        self.set_font("FreeSerif", "B", 12)
        self.multi_cell(0, 7, f"🔹 {sanitize_text(title)}")
        self.ln(1)
        self.set_font("FreeSerif", "", 10.5)

        for line in summary.split("\n"):
            try:
                clean_line = sanitize_text(line).strip()
                self.multi_cell(0, 5, clean_line or "[Empty Line]")
            except Exception:
                try:
                    self.set_font("FreeSerif", "B", 10)
                    self.multi_cell(0, 5, "[Render error: Skipped unreadable line]")
                    self.set_font("FreeSerif", "", 10.5)
                except Exception:
                    # Fallback if even that fails (rare)
                    pass
        self.ln(2)

    def add_takeaways(self, takeaways):
        self.set_font("FreeSerif", "B", 12)
        self.cell(0, 10, "🔥 Top 5 Takeaways", ln=True)
        self.set_font("FreeSerif", "", 10.5)
        for i, takeaway in enumerate(takeaways, start=1):
            try:
                self.multi_cell(0, 5, f"{i}. {sanitize_text(takeaway)}")
                self.ln(1)
            except Exception:
                self.multi_cell(0, 5, f"{i}. [Takeaway could not be rendered]")
                self.ln(1)

    def save(self, filename="daily_cyber_brief.pdf"):
        self.output(filename)
