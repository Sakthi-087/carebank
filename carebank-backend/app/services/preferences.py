from __future__ import annotations

import json
from pathlib import Path
from threading import Lock

from app.models.schemas import NotificationPreferences


class PreferenceStore:
    def __init__(self, path: Path) -> None:
        self.path = path
        self._lock = Lock()

    def get(self, user_id: str) -> NotificationPreferences:
        payload = self._load()
        stored = payload.get(user_id)
        if not isinstance(stored, dict):
            return NotificationPreferences()
        return NotificationPreferences(**stored)

    def save(self, user_id: str, preferences: NotificationPreferences) -> NotificationPreferences:
        with self._lock:
            payload = self._load()
            payload[user_id] = preferences.model_dump()
            self.path.parent.mkdir(parents=True, exist_ok=True)
            self.path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
        return preferences

    def _load(self) -> dict[str, object]:
        if not self.path.exists():
            return {}
        try:
            return json.loads(self.path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            return {}
