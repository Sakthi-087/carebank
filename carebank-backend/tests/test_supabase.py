from __future__ import annotations

import unittest

import httpx

from app.core.config import Settings
from app.services.supabase import SupabaseService
from app.services.transaction_utils import normalize_transaction
from app.models.schemas import Transaction


class SupabaseServiceTests(unittest.TestCase):
    def test_server_errors_can_fallback_when_enabled(self) -> None:
        settings = Settings()
        settings.enable_sample_data_fallback = True
        service = SupabaseService(settings)
        response = httpx.Response(status_code=503, request=httpx.Request("GET", "https://example.com"))

        self.assertTrue(service._should_fallback_to_sample_data(response))

    def test_transaction_normalization_preserves_income_as_negative(self) -> None:
        transaction = Transaction(date="2026-03-01", description="Salary", amount=80000, category="Income")

        normalized = normalize_transaction(transaction)

        self.assertEqual(normalized.amount, -80000)
