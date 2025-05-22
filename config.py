from pydantic_settings import BaseSettings
from typing import List, Optional
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # API Keys
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    TELEGRAM_BOT_TOKEN: Optional[str] = os.getenv("TELEGRAM_BOT_TOKEN")
    NEWS_API_KEY: Optional[str] = os.getenv("NEWS_API_KEY")

    # News Sources
    NEWS_SOURCES: List[str] = [
        "https://www.bleepingcomputer.com/",
        "https://www.securityweek.com/",
        "https://www.darkreading.com/",
        "https://www.zdnet.com/security/"
    ]

    # Search Keywords
    SEARCH_KEYWORDS: List[str] = [
        "cloud security",
        "cloud computing security",
        "AWS security",
        "Azure security",
        "Google Cloud security",
        "cloud data breach",
        "cloud vulnerability"
    ]

    # AI Settings
    GPT_MODEL: str = "gpt-3.5-turbo"
    MAX_TOKENS: int = 500
    TEMPERATURE: float = 0.7

    # Scheduling
    SCHEDULE_TIME: str = "08:00"  # Daily delivery time
    MAX_ARTICLES_PER_DAY: int = 5

    # Summary Settings
    SUMMARY_LENGTH: str = "medium"  # short, medium, long
    INCLUDE_SOURCE: bool = True
    INCLUDE_DATE: bool = True

    class Config:
        env_file = ".env"

settings = Settings() 