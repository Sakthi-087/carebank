from __future__ import annotations

import os

from fastapi import APIRouter

from app.core.config import get_settings

router = APIRouter(tags=["health"])


@router.get("/health")
async def health() -> dict[str, object]:
    settings = get_settings()
    llm_configured = bool(os.getenv("OPENAI_API_KEY") or os.getenv("OPENROUTER_API_KEY"))
    return {
        "status": "ok",
        "supabase_configured": settings.supabase_configured,
        "sample_data_fallback_enabled": settings.enable_sample_data_fallback,
        "llm_configured": llm_configured,
    }
