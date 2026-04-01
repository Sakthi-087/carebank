from __future__ import annotations

from fastapi import APIRouter, Depends

from app.core.auth import get_current_user
from app.core.config import get_settings
from app.models.schemas import NotificationPreferences, PreferencesResponse, UserContext
from app.services.preferences import PreferenceStore

router = APIRouter(tags=["preferences"])


def get_store() -> PreferenceStore:
    settings = get_settings()
    return PreferenceStore(settings.preferences_path)


@router.get("/preferences", response_model=PreferencesResponse)
async def get_preferences(
    user: UserContext = Depends(get_current_user),
    store: PreferenceStore = Depends(get_store),
) -> PreferencesResponse:
    return PreferencesResponse(preferences=store.get(user.id))


@router.put("/preferences", response_model=PreferencesResponse)
async def update_preferences(
    payload: NotificationPreferences,
    user: UserContext = Depends(get_current_user),
    store: PreferenceStore = Depends(get_store),
) -> PreferencesResponse:
    return PreferencesResponse(preferences=store.save(user.id, payload))
