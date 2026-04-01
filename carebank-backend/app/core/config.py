from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv


load_dotenv(Path(__file__).resolve().parents[2] / ".env")


class Settings:
    def __init__(self) -> None:
        root = Path(__file__).resolve().parents[2]
        self.supabase_url = os.getenv("SUPABASE_URL", "").rstrip("/")
        self.supabase_anon_key = os.getenv("SUPABASE_ANON_KEY", "")
        self.frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
        self.preferences_path = root / "data" / "preferences.json"
        self.enable_sample_data_fallback = os.getenv("ENABLE_SAMPLE_DATA_FALLBACK", "").strip().lower() in {
            "1",
            "true",
            "yes",
            "on",
        }

    @property
    def supabase_configured(self) -> bool:
        return bool(self.supabase_url and self.supabase_anon_key)


@lru_cache
def get_settings() -> Settings:
    return Settings()
