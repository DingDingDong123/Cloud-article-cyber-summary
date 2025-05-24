from fpdf import FPDF
from datetime import datetime
import os
import textwrap

class OnePageCyberBrief(FPDF):
    def __init__(self):
        super().__init__(orientation='P', unit='mm', format='A4')
        self.set_auto_page_break(auto=False)
        self.set_margins(10, 10, 10)
        self.add_font("FreeSerif", "", os.path.join("fonts", "FreeSerif.ttf"), uni=True)
        self.add_font("FreeSerif", "B", os.path.join("fonts", "FreeSerifBold.ttf"), uni=True)
        self.add_page()
        self.set_font("FreeSerif", size=11)

    def draw_header(self):
        self.set_fill_color(230, 245, 255)
        self.rect(10, 10, self.w - 20, 20, style='F')

        logo_path = "assets/logo.png"
        if os.path.exists(logo_path):
            self.image(logo_path, x=12, y=12, w=16)

        self.set_xy(30, 12)
        self.set_font("FreeSerif", "B", 16)
        self.set_text_color(0, 51, 102)
        self.cell(0, 8, "CYBERSECURITY BRIEF", ln=True)

        self.set_font("FreeSerif", size=12)
        self.set_text_color(80, 80, 80)
        self.cell(0, 8, datetime.today().strftime("%B %d, %Y"), ln=True)
        self.set_text_color(0, 0, 0)
        self.ln(6)

    def add_stats(self, stats):
        labels = [
            ("CRITICAL", stats["critical"], (220, 53, 69)),
            ("HIGH", stats["high"], (255, 159, 67)),
            ("MEDIUM", stats["medium"], (30, 144, 255)),
            ("LOW", stats["low"], (40, 167, 69))
        ]
        box_width = (self.w - 20 - 3 * 5) / 4
        y = self.get_y()
        x = 10

        self.set_font("FreeSerif", "B", 11)
        for label, value, color in labels:
            self.set_xy(x, y)
            self.set_fill_color(*color)
            self.set_text_color(255, 255, 255)
            self.cell(box_width, 10, f"{label}: {value}", ln=0, align="C", fill=True)
            x += box_width + 5

        self.ln(14)
        self.set_text_color(0, 0, 0)

    def add_takeaways(self, takeaways):
        self.set_fill_color(240, 240, 240)
        self.set_font("FreeSerif", "B", 12)
        self.cell(0, 10, "STRATEGIC TAKEAWAYS", ln=True, fill=True)

        self.set_font("FreeSerif", size=11)
        bullets = ["[Insight]", "[Alert]", "[Idea]", "[Threat]", "[Secure]"]
        for i, takeaway in enumerate(takeaways[:5]):
            clean = takeaway.replace("•", "-").replace("\u2022", "-").strip()
            prefix = bullets[i % len(bullets)]
            wrapped_lines = textwrap.wrap(f"{prefix} {clean}", width=100)
            for line in wrapped_lines:
                self.cell(0, 6, line, ln=True)
            self.ln(1)

    def add_key_incidents(self, incidents):
        self.set_fill_color(240, 240, 240)
        self.set_font("FreeSerif", "B", 12)
        self.cell(0, 10, "KEY INCIDENTS", ln=True, fill=True)

        self.set_font("FreeSerif", "B", 11)
        self.set_fill_color(220, 220, 220)
        self.cell(90, 8, "Title", border=1, fill=True)
        self.cell(30, 8, "Severity", border=1, fill=True)
        self.cell(60, 8, "Impact", border=1, fill=True, ln=True)

        self.set_font("FreeSerif", size=10)
        for idx, incident in enumerate(sorted(incidents[:6], key=lambda x: ["critical", "high", "medium", "low"].index(x["severity"]))):
            title_lines = textwrap.wrap(incident["title"], width=45)
            impact_lines = textwrap.wrap(incident.get("impact", "-"), width=45)
            max_lines = max(len(title_lines), len(impact_lines))
            self.set_fill_color(255, 255, 255) if idx % 2 == 0 else self.set_fill_color(248, 248, 248)

            for i in range(max_lines):
                self.cell(90, 6, title_lines[i] if i < len(title_lines) else "", border=1, fill=True)

                if i == 0:
                    sev = incident["severity"]
                    label = {
                        "critical": "🟥 Critical",
                        "high": "🟧 High",
                        "medium": "🟦 Medium",
                        "low": "🟩 Low"
                    }.get(sev, sev)
                    self.cell(30, 6, label, border=1, fill=True)
                else:
                    self.cell(30, 6, "", border=1, fill=True)

                self.cell(60, 6, impact_lines[i] if i < len(impact_lines) else "", border=1, fill=True, ln=True)

    def save(self):
        path = f"summaries/pdf_summaries/brief_{datetime.today().strftime('%Y-%m-%d')}_onepage.pdf"
        self.output(path)
        return path

    def determine_severity(self, title, summary):
        text = f"{title} {summary}".lower()
        if any(k in text for k in ["data breach", "ransomware", "critical", "zero-day", "hacked", "exploit"]):
            return "critical"
        elif any(k in text for k in ["vulnerability", "malware", "phishing", "attack"]):
            return "high"
        elif any(k in text for k in ["privacy", "leak", "patch", "alert"]):
            return "medium"
        else:
            return "low"

def create_one_page_summary(stats, takeaways, incidents):
    pdf = OnePageCyberBrief()
    pdf.draw_header()
    pdf.add_stats(stats)
    pdf.add_takeaways(takeaways)
    pdf.add_key_incidents(incidents)
    return pdf
