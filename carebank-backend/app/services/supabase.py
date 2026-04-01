from __future__ import annotations

import csv
import io
import json
import logging
from datetime import UTC, datetime
from pathlib import Path

import httpx
from fastapi import HTTPException, status

from app.core.config import Settings
from app.models.schemas import Transaction, UserContext
from app.services.transaction_utils import normalize_transaction

logger = logging.getLogger(__name__)


class SupabaseService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    async def verify_access_token(self, access_token: str) -> UserContext:
        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                response = await client.get(
                    f"{self.settings.supabase_url}/auth/v1/user",
                    headers=self._headers(access_token),
                )
        except httpx.RequestError as exc:
            logger.exception("Supabase auth request failed while verifying the access token.")
            if self.settings.enable_sample_data_fallback:
                logger.warning("Falling back to demo user because ENABLE_SAMPLE_DATA_FALLBACK is enabled.")
                return UserContext(id="demo-user", email="demo@carebank.local")
            raise self._service_unavailable("Supabase auth is currently unavailable.", exc) from exc

        if response.status_code != status.HTTP_200_OK:
            logger.warning(
                "Supabase auth returned a non-200 response while verifying the access token: status=%s body=%s",
                response.status_code,
                response.text[:300],
            )
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired Supabase token.")

        payload = response.json()
        return UserContext(id=payload["id"], email=payload.get("email"))

    async def fetch_transactions(self, access_token: str) -> list[Transaction]:
        payload = await self.fetch_transaction_history(access_token)
        transactions: list[Transaction] = []
        for item in payload:
            created_at = item.get("created_at") or datetime.now(UTC).isoformat()
            transactions.append(
                normalize_transaction(
                    Transaction(
                        date=str(created_at)[:10],
                        description=item.get("description") or "Imported transaction",
                        amount=float(item.get("amount") or 0),
                        category=item.get("category") or "Uncategorized",
                    )
                )
            )
        return transactions

    async def fetch_transaction_history(self, access_token: str) -> list[dict[str, object]]:
        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                response = await client.get(
                    f"{self.settings.supabase_url}/rest/v1/transactions",
                    params={
                        "select": "amount,category,description,created_at,fraud_risk,fraud_flags",
                        "order": "created_at.asc",
                    },
                    headers=self._headers(access_token),
                )
        except httpx.RequestError as exc:
            logger.exception("Supabase transactions request failed while fetching history.")
            if self.settings.enable_sample_data_fallback:
                logger.warning("Falling back to sample transactions because ENABLE_SAMPLE_DATA_FALLBACK is enabled.")
                return self._load_sample_transactions()
            raise self._service_unavailable("Failed to reach Supabase transactions API.", exc) from exc

        if self._should_fallback_to_sample_data(response):
            logger.warning(
                "Supabase transactions API returned a recoverable server error. Falling back to sample data."
            )
            return self._load_sample_transactions()

        self._raise_for_supabase_error(response, "Failed to fetch transactions from Supabase.")
        return response.json()

    async def insert_transactions(self, access_token: str, rows: list[dict[str, object]]) -> int:
        if not rows:
            return 0

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{self.settings.supabase_url}/rest/v1/transactions",
                headers={
                    **self._headers(access_token),
                    "Content-Type": "application/json",
                    "Prefer": "return=representation",
                },
                json=rows,
            )

        self._raise_for_supabase_error(response, "Failed to insert transactions into Supabase.")
        return len(response.json())

    def parse_csv_upload(self, content: str, user: UserContext) -> tuple[list[dict[str, object]], list[str]]:
        try:
            sample = content[:1024]
            dialect = csv.Sniffer().sniff(sample)
        except csv.Error:
            dialect = csv.excel

        reader = csv.DictReader(io.StringIO(content), dialect=dialect)
        rows: list[dict[str, object]] = []
        errors: list[str] = []

        for index, record in enumerate(reader, start=2):
            try:
                created_at = self._parse_date(self._pick_required(record, ["date", "created_at", "transaction_date", "posted_at"]))
                amount = self._parse_amount(self._pick_required(record, ["amount", "value", "amt", "debit", "credit"]))
                description = self._pick_optional(record, ["description", "details", "narration", "merchant"]) or "Imported transaction"
                category = self._pick_optional(record, ["category", "type"]) or self._infer_category(description)
                rows.append(
                    {
                        "user_id": user.id,
                        "amount": amount,
                        "category": category,
                        "description": description,
                        "created_at": created_at,
                    }
                )
            except ValueError as exc:
                errors.append(f"Row {index}: {exc}")

        return rows, errors

    def _headers(self, access_token: str) -> dict[str, str]:
        return {
            "apikey": self.settings.supabase_anon_key,
            "Authorization": f"Bearer {access_token}",
        }

    def _pick_required(self, record: dict[str, str | None], keys: list[str]) -> str:
        normalized = {str(key).strip().lower(): (value or "").strip() for key, value in record.items() if key}
        for key in keys:
            value = normalized.get(key)
            if value:
                return value
        raise ValueError(f"Missing one of the required CSV columns: {', '.join(keys)}")

    def _pick_optional(self, record: dict[str, str | None], keys: list[str]) -> str:
        normalized = {str(key).strip().lower(): (value or "").strip() for key, value in record.items() if key}
        for key in keys:
            value = normalized.get(key)
            if value:
                return value
        return ""

    def _parse_date(self, value: str) -> str:
        cleaned = value.strip()
        for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y", "%m/%d/%Y", "%Y/%m/%d"):
            try:
                parsed = datetime.strptime(cleaned, fmt)
                return parsed.replace(tzinfo=UTC).isoformat()
            except ValueError:
                continue

        try:
            parsed = datetime.fromisoformat(cleaned.replace("Z", "+00:00"))
            if parsed.tzinfo is None:
                parsed = parsed.replace(tzinfo=UTC)
            return parsed.astimezone(UTC).isoformat()
        except ValueError as exc:
            raise ValueError(f"Invalid date '{value}'.") from exc

    def _parse_amount(self, value: str) -> float:
        cleaned = value.replace(",", "").replace("Rs.", "").replace("Rs", "").replace("INR", "").strip()
        if cleaned.startswith("(") and cleaned.endswith(")"):
            cleaned = f"-{cleaned[1:-1]}"
        try:
            return float(cleaned)
        except ValueError as exc:
            raise ValueError(f"Invalid amount '{value}'.") from exc

    def _infer_category(self, description: str) -> str:
        text = description.lower()
        if any(token in text for token in ["grocery", "food", "dining", "restaurant", "delivery", "mart"]):
            return "Food"
        if any(token in text for token in ["flight", "train", "taxi", "cab", "metro", "travel", "bus"]):
            return "Travel"
        if any(token in text for token in ["bill", "electricity", "water", "broadband", "internet", "rent"]):
            return "Bills"
        if any(token in text for token in ["shop", "fashion", "marketplace", "store", "order"]):
            return "Shopping"
        return "Uncategorized"

    def _raise_for_supabase_error(self, response: httpx.Response, message: str) -> None:
        if response.is_success:
            return

        detail = message
        try:
            payload = response.json()
            detail = payload.get("message") or payload.get("error_description") or payload.get("error") or message
        except ValueError:
            pass

        logger.warning(
            "Supabase API returned a non-success response: status=%s detail=%s body=%s",
            response.status_code,
            detail,
            response.text[:300],
        )

        raise HTTPException(status_code=response.status_code, detail=detail)

    def _should_fallback_to_sample_data(self, response: httpx.Response) -> bool:
        return self.settings.enable_sample_data_fallback and response.status_code >= status.HTTP_500_INTERNAL_SERVER_ERROR

    def _service_unavailable(self, message: str, exc: httpx.RequestError) -> HTTPException:
        request_url = str(exc.request.url) if exc.request else "Supabase"
        return HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"{message} Request target: {request_url}.",
        )

    def _load_sample_transactions(self) -> list[dict[str, object]]:
        sample_path = Path(__file__).resolve().parents[2] / "data" / "transactions.json"
        with sample_path.open("r", encoding="utf-8") as sample_file:
            payload = json.load(sample_file)

        return [
            {
                "amount": item.get("amount", 0),
                "category": item.get("category", "Uncategorized"),
                "description": item.get("description", "Imported transaction"),
                "created_at": item.get("date", datetime.now(UTC).date().isoformat()),
                "fraud_risk": item.get("fraud_risk", "Low"),
                "fraud_flags": item.get("fraud_flags", []),
            }
            for item in payload
        ]
