from __future__ import annotations

from collections import defaultdict

from app.models.schemas import SpendingSummary, Transaction


class SpendingAnalysisAgent:
    TRACKED_CATEGORIES = ["Food", "Shopping", "Travel", "Bills"]

    def analyze(self, transactions: list[Transaction]) -> dict[str, object]:
        expense_transactions = [transaction for transaction in transactions if transaction.amount > 0]
        months = sorted({transaction.date[:7] for transaction in expense_transactions})
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
