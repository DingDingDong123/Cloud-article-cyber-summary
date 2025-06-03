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
        self.add_font("Noto", "", os.path.join("fonts", "NotoSans-Regular.ttf"), uni=True)
        self.add_font("Noto", "B", os.path.join("fonts", "NotoSans-Bold.ttf"), uni=True)
        self.add_page()

    def rounded_rect(self, x, y, w, h, r, style=''):
        """Draw a rounded rectangle (uses 4 Bézier curves)"""
        k = self.k
        hp = self.h
        if style == 'F':
            op = 'f'
        elif style == 'FD' or style == 'DF':
            op = 'B'
        else:
            op = 'S'

        MyArc = 4/3 * (2**0.5 - 1) * r

        self._out(f'{x * k:.2f} {(hp - y) * k:.2f} m')
        self._out(f'{(x + w) * k:.2f} {(hp - y) * k:.2f} l')
        self._out(f'{(x + w) * k:.2f} {(hp - (y + h)) * k:.2f} l')
        self._out(f'{x * k:.2f} {(hp - (y + h)) * k:.2f} l')
        self._out(f'{x * k:.2f} {(hp - y) * k:.2f} l {op}')

    def draw_header(self):
        # Page border
        self.set_draw_color(50, 90, 200)
        self.set_line_width(1)
        self.rect(8, 8, self.w - 16, self.h - 16)

        # Header background box
        self.set_fill_color(235, 244, 255)
        self.rect(10, 10, self.w - 20, 30, style='F')  # height = 30

        # Logo: vertically centered in 30mm header
        logo_path = "assets/logo.png"
        if os.path.exists(logo_path):
            self.image(logo_path, x=12, y=13.5, w=40)  # 13.5 aligns nicely for 22mm logo

        # Right-aligned title: vertically centered (total height = 2 × 8 = 16)
        # Start around center of header box (10 + 15) minus 8 = ~17
        self.set_font("Noto", "B", 18)
        self.set_text_color(0, 0, 0)

        self.set_xy(self.w - 95, 16.5)
        self.cell(80, 8, "CYBERSECURITY", ln=True, align='L')

        self.set_xy(self.w - 95, 24.5)
        self.cell(80, 8, "BRIEF", ln=True, align='L')

    def add_stats(self, stats):
        # Define stat data with your original colors
        values = [
            ("Total Articles", stats.get("total", 0), (90, 120, 255)),   # Blue
            ("Critical", stats.get("critical", 0), (255, 80, 80)),       # Red
            ("High", stats.get("high", 0), (255, 180, 60)),              # Orange
            ("Medium", stats.get("medium", 0), (90, 200, 120))           # Green
        ]

        # Draw background container
        box_x = 15
        box_y = 48
        box_w = self.w - 30
        box_h = 26
        self.set_fill_color(240, 245, 255)  # light blue background
        self.rect(box_x, box_y, box_w, box_h, style='F')

        # Calculate width of each column
        col_count = len(values)
        col_width = box_w / col_count

        # Start drawing stats
        for i, (label, value, color) in enumerate(values):
            col_x = box_x + i * col_width
            num_y = box_y + 4
            label_y = box_y + 14

            # Draw number
            self.set_xy(col_x, num_y)
            self.set_font("Noto", "B", 26)
            self.set_text_color(*color)
            self.cell(col_width, 6, str(value), ln=True, align='C')

            # Draw label below
            self.set_xy(col_x, label_y)
            self.set_font("Noto", "B", 10)
            self.set_text_color(0, 0, 0)
            self.cell(col_width, 6, label, ln=True, align='C')

    def add_takeaways(self, takeaways):
        box_x = 15
        box_y = 80
        box_w = self.w - 30
        box_h = 90
        self.set_fill_color(250, 250, 255)
        self.rect(box_x, box_y, box_w, box_h, style='F')

        # Title
        self.set_xy(box_x + 2, box_y + 4)
        self.set_font("Noto", "B", 13)
        self.set_text_color(30, 30, 30)
        self.cell(0, 6, "STRATEGIC TAKEAWAYS", ln=True)

        # Start below the title
        current_y = box_y + 12
        max_width = box_w - 8

        self.set_text_color(0, 0, 0)
        self.set_font("Noto", "", 11)

        for item in takeaways[:5]:
            self.set_xy(box_x + 4, current_y)

            # ✅ Extract bold prefix (e.g., "**Title:** rest of sentence")
            if '**' in item and ':' in item:
                try:
                    bold_part = item.split('**')[1].split(':')[0].strip()
                    rest = item.split(':', 1)[1].strip()

                    # Render bold part
                    self.set_font("Noto", "B", 11)
                    self.multi_cell(max_width, 6, f"{bold_part}:", ln=False)

                    # Render normal part
                    self.set_font("Noto", "", 11)
                    self.multi_cell(max_width, 6, rest)
                except Exception as e:
                    # fallback to raw line if parsing fails
                    self.set_font("Noto", "", 11)
                    self.multi_cell(max_width, 6, item.strip())
            else:
                # No bold prefix — just print
                self.set_font("Noto", "", 11)
                self.multi_cell(max_width, 6, item.strip())

            current_y = self.get_y() + 2  # Add space after each block




    # def add_key_incidents(self, incidents):
    #     self.set_fill_color(235, 244, 255)
    #     self.set_font("FreeSerif", "B", 12)
    #     self.cell(0, 10, "KEY INCIDENTS", ln=True, fill=True)

    #     self.set_font("FreeSerif", "B", 11)
    #     self.set_fill_color(210, 210, 210)
    #     self.cell(90, 8, "Title", border=1, fill=True)
    #     self.cell(30, 8, "Severity", border=1, fill=True)
    #     self.cell(60, 8, "Impact", border=1, fill=True, ln=True)

    #     self.set_font("FreeSerif", size=10)
    #     for idx, incident in enumerate(sorted(incidents[:6], key=lambda x: ["critical", "high", "medium", "low"].index(x["severity"]))):
    #         title_lines = textwrap.wrap(incident["title"], width=43)
    #         impact_lines = textwrap.wrap(incident.get("impact", "-"), width=43)
    #         max_lines = max(len(title_lines), len(impact_lines))

    #         self.set_fill_color(255, 255, 255) if idx % 2 == 0 else self.set_fill_color(245, 245, 245)

    #         for i in range(max_lines):
    #             self.cell(90, 6, title_lines[i] if i < len(title_lines) else "", border=1, fill=True)

    #             if i == 0:
    #                 sev = incident["severity"]
    #                 label = {
    #                     "critical": "🟥 Critical",
    #                     "high": "🟧 High",
    #                     "medium": "🟦 Medium",
    #                     "low": "🟩 Low"
    #                 }.get(sev, sev.capitalize())
    #                 self.cell(30, 6, label, border=1, fill=True)
    #             else:
    #                 self.cell(30, 6, "", border=1, fill=True)

    #             self.cell(60, 6, impact_lines[i] if i < len(impact_lines) else "", border=1, fill=True, ln=True)

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
    # pdf.add_key_incidents(incidents)
    return pdf