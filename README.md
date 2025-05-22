# Cloud Cybersecurity Article Summarizer

This application fetches interesting cybersecurity articles about cloud computing, summarizes them using AI, and delivers them on a daily schedule. It can be configured to deliver summaries via Telegram or run as a web service.

## Features

- Automated article fetching from cybersecurity news sources
- AI-powered article summarization using OpenAI GPT
- Daily scheduled delivery of summaries
- Multiple delivery methods (Telegram bot or web interface)
- Configurable news sources and topics

## Setup

1. Clone this repository
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file with your configuration:
   ```
   OPENAI_API_KEY=your_openai_api_key
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token  # Optional
   NEWS_API_KEY=your_newsapi_key  # Optional
   ```
5. Run the application:
   ```bash
   python main.py
   ```

## Configuration

The application can be configured through the `.env` file and `config.py`. You can customize:
- News sources
- Summary preferences
- Delivery schedule
- AI model parameters

## Contributing

Feel free to submit issues and enhancement requests! 