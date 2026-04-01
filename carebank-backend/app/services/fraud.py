from __future__ import annotations

from datetime import UTC, datetime, timedelta


class FraudDetectionService:
    HIGH_AMOUNT_MULTIPLIER = 3.0
    FREQUENCY_WINDOW_MINUTES = 10
    FREQUENCY_THRESHOLD = 3

    def detect_fraud(self, history: list[dict[str, object]], new_transaction: dict[str, object]) -> dict[str, object]:
        if not history:
            return {"risk": "Low", "flags": []}

        flags: list[str] = []

        expense_amounts = [
            abs(float(item.get("amount") or 0))
            for item in history
            if str(item.get("category") or "").lower() != "income"
        ]
        average_spend = sum(expense_amounts) / len(expense_amounts) if expense_amounts else 0.0
        amount = abs(float(new_transaction.get("amount") or 0))

        if average_spend > 0 and amount > average_spend * self.HIGH_AMOUNT_MULTIPLIER:
            flags.append("High amount anomaly")

        known_merchants = {
            str(item.get("description") or "").strip().lower()
            for item in history
            if str(item.get("description") or "").strip()
        }
        description = str(new_transaction.get("description") or "").strip().lower()
        if description and description not in known_merchants:
            flags.append("Unknown merchant")

        current_time = self._parse_timestamp(new_transaction.get("created_at"))
        window_start = current_time - timedelta(minutes=self.FREQUENCY_WINDOW_MINUTES)
        recent_count = 0
        for item in history:
            created_at = self._parse_timestamp(item.get("created_at"))
            if created_at >= window_start:
                recent_count += 1

        if recent_count >= self.FREQUENCY_THRESHOLD:
            flags.append("Unusual transaction frequency")

        if len(flags) >= 2:
            risk = "High"
        elif len(flags) == 1:
            risk = "Medium"
        else:
            risk = "Low"

        return {"risk": risk, "flags": flags}

    def _parse_timestamp(self, value: object) -> datetime:
        if isinstance(value, datetime):
            return value.astimezone(UTC) if value.tzinfo else value.replace(tzinfo=UTC)

        raw = str(value or "").strip()
        if not raw:
            return datetime.now(UTC)

        try:
            parsed = datetime.fromisoformat(raw.replace("Z", "+00:00"))
            return parsed.astimezone(UTC) if parsed.tzinfo else parsed.replace(tzinfo=UTC)
        except ValueError:
            return datetime.now(UTC)
