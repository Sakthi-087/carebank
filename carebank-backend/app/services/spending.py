from __future__ import annotations

from collections import defaultdict

from app.models.schemas import SpendingSummary, Transaction
from app.services.transaction_utils import is_income_transaction, normalized_expense_amount


class SpendingAnalysisAgent:
    TRACKED_CATEGORIES = ["Food", "Shopping", "Travel", "Bills"]

    def analyze(self, transactions: list[Transaction]) -> dict[str, object]:
        expense_transactions = [
            Transaction(
                date=transaction.date,
                description=transaction.description,
                amount=normalized_expense_amount(transaction),
                category=transaction.category,
            )
            for transaction in transactions
            if not is_income_transaction(transaction)
        ]
        months = sorted({transaction.date[:7] for transaction in expense_transactions})
        if not months:
            summary = SpendingSummary(
                Food=0.0,
                Shopping=0.0,
                Travel=0.0,
                Bills=0.0,
                total=0.0,
                change_vs_last_month=0.0,
                largest_category="Food",
            )
            chart_data = [{"name": category, "value": 0.0, "previous": 0.0, "change": 0.0} for category in self.TRACKED_CATEGORIES]
            return {
                "summary": summary,
                "chart_data": chart_data,
                "current_month": "",
                "previous_month": "",
                "current_totals": {category: 0.0 for category in self.TRACKED_CATEGORIES},
                "previous_totals": {category: 0.0 for category in self.TRACKED_CATEGORIES},
                "current_total": 0.0,
                "previous_total": 0.0,
            }

        current_month = months[-1]
        previous_month = months[-2] if len(months) > 1 else months[-1]

        current_totals = self._totals_for_month(expense_transactions, current_month)
        previous_totals = self._totals_for_month(expense_transactions, previous_month)

        current_total = sum(current_totals.values())
        previous_total = sum(previous_totals.values())
        change_vs_last_month = ((current_total - previous_total) / previous_total * 100) if previous_total else 0.0
        largest_category = max(current_totals, key=current_totals.get) if current_totals else "Food"

        summary = SpendingSummary(
            Food=round(current_totals.get("Food", 0.0), 2),
            Shopping=round(current_totals.get("Shopping", 0.0), 2),
            Travel=round(current_totals.get("Travel", 0.0), 2),
            Bills=round(current_totals.get("Bills", 0.0), 2),
            total=round(current_total, 2),
            change_vs_last_month=round(change_vs_last_month, 2),
            largest_category=largest_category,
        )

        chart_data = [
            {
                "name": category,
                "value": round(current_totals.get(category, 0.0), 2),
                "previous": round(previous_totals.get(category, 0.0), 2),
                "change": round(self._percentage_change(current_totals.get(category, 0.0), previous_totals.get(category, 0.0)), 2),
            }
            for category in self.TRACKED_CATEGORIES
        ]

        return {
            "summary": summary,
            "chart_data": chart_data,
            "current_month": current_month,
            "previous_month": previous_month,
            "current_totals": current_totals,
            "previous_totals": previous_totals,
            "current_total": current_total,
            "previous_total": previous_total,
        }

    def _totals_for_month(self, transactions: list[Transaction], month: str) -> dict[str, float]:
        totals: dict[str, float] = defaultdict(float)
        for transaction in transactions:
            if transaction.date.startswith(month) and transaction.category in self.TRACKED_CATEGORIES:
                totals[transaction.category] += transaction.amount
        return {category: round(totals.get(category, 0.0), 2) for category in self.TRACKED_CATEGORIES}

    def _percentage_change(self, current: float, previous: float) -> float:
        if previous == 0:
            return 100.0 if current > 0 else 0.0
        return ((current - previous) / previous) * 100
