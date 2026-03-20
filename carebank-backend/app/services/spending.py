from __future__ import annotations

from collections import defaultdict

from app.models.schemas import CategoryBreakdown, SpendingSummary, Transaction


class SpendingAnalysisAgent:
    ESSENTIAL_CATEGORIES = {"Housing", "Groceries", "Utilities", "Insurance", "Healthcare", "Transport"}

    def analyze(self, transactions: list[Transaction]) -> SpendingSummary:
        expense_transactions = [transaction for transaction in transactions if transaction.amount > 0]
        total_spent = sum(transaction.amount for transaction in expense_transactions)
        average_transaction = total_spent / len(expense_transactions) if expense_transactions else 0.0

        category_totals: dict[str, float] = defaultdict(float)
        category_counts: dict[str, int] = defaultdict(int)
        monthly_totals: dict[str, float] = defaultdict(float)

        for transaction in expense_transactions:
            category_totals[transaction.category] += transaction.amount
            category_counts[transaction.category] += 1
            month_key = transaction.date[:7]
            monthly_totals[month_key] += transaction.amount

        breakdown = [
            CategoryBreakdown(
                category=category,
                total=round(total, 2),
                percentage=round((total / total_spent) * 100, 2) if total_spent else 0.0,
                transaction_count=category_counts[category],
            )
            for category, total in sorted(category_totals.items(), key=lambda item: item[1], reverse=True)
        ]

        top_category = breakdown[0].category if breakdown else "N/A"

        return SpendingSummary(
            total_spent=round(total_spent, 2),
            average_transaction=round(average_transaction, 2),
            top_category=top_category,
            categories=breakdown,
            monthly_totals={month: round(total, 2) for month, total in monthly_totals.items()},
        )
