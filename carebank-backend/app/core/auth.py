from __future__ import annotations

import logging

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import Settings, get_settings
from app.models.schemas import UserContext
from app.services.supabase import SupabaseService

security = HTTPBearer(auto_error=False)
logger = logging.getLogger(__name__)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    settings: Settings = Depends(get_settings),
) -> UserContext:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token.")

    logger.info(
        "Received bearer token for auth verification: prefix=%s... length=%s",
        credentials.credentials[:12],
        len(credentials.credentials),
    )

    if not settings.supabase_configured:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Supabase environment variables are not configured on the backend.",
        )

    service = SupabaseService(settings)
    user = await service.verify_access_token(credentials.credentials)
    logger.info("Resolved current user from access token: user_id=%s email=%s", user.id, user.email)
    return user
