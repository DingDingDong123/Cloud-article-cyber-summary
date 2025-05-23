import os
import datetime
import requests
from config import TELEGRAM_TOKEN, TELEGRAM_CHAT_ID

def send_today_pdf():
    today = datetime.date.today().strftime("%Y-%m-%d")
    filename = f"daily_cyber_brief_{today}.pdf"
    filepath = os.path.join("summaries", "pdf_summarizes", filename)

    if not os.path.isfile(filepath):
        print(f"❌ PDF for today ({filename}) not found in 'pdf_summarizes'")
        return

    if not filename.endswith(".pdf"):
        print(f"❌ File is not a valid PDF: {filename}")
        return

    url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendDocument"

    with open(filepath, "rb") as f:
        response = requests.post(
            url,
            data={
                "chat_id": TELEGRAM_CHAT_ID,
                "caption": f"🛡️ Daily Cybersecurity Brief – {today}"
            },
            files={"document": f}
        )

    if response.status_code == 200:
        print("✅ PDF sent successfully to Telegram.")
    else:
        print(f"❌ Failed to send PDF: {response.status_code}")
        print(response.text)
