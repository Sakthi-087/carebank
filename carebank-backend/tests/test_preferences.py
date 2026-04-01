from __future__ import annotations

import shutil
import unittest
import uuid
from pathlib import Path

from app.models.schemas import NotificationPreferences
from app.services.preferences import PreferenceStore


class PreferenceStoreTests(unittest.TestCase):
    def setUp(self) -> None:
        base_dir = Path(__file__).resolve().parent / ".tmp"
        base_dir.mkdir(exist_ok=True)
        self.temp_dir = base_dir / str(uuid.uuid4())
        self.temp_dir.mkdir()

    def tearDown(self) -> None:
        shutil.rmtree(self.temp_dir, ignore_errors=True)

    def test_save_and_load_preferences_for_user(self) -> None:
        store = PreferenceStore(self.temp_dir / "preferences.json")
        saved = store.save(
            "user-1",
            NotificationPreferences(
                overspending_alerts=False,
                weekly_wellness_summary=True,
                ai_assistant_tips=True,
            ),
        )

        loaded = store.get("user-1")
        self.assertFalse(saved.overspending_alerts)
        self.assertEqual(saved, loaded)

    def test_unknown_user_receives_defaults(self) -> None:
        store = PreferenceStore(self.temp_dir / "preferences.json")
        loaded = store.get("missing-user")

        self.assertTrue(loaded.overspending_alerts)
        self.assertTrue(loaded.weekly_wellness_summary)
        self.assertFalse(loaded.ai_assistant_tips)
