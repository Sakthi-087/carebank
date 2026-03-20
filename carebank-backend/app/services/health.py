from __future__ import annotations

from app.models.schemas import FinancialHealth, SpendingSummary, Transaction


class FinancialHealthAgent:
    ESSENTIAL_CATEGORIES = {"Housing", "Groceries", "Utilities", "Insurance", "Healthcare", "Transport"}

    def analyze(self, transactions: list[Transaction], spending: SpendingSummary) -> FinancialHealth:
        income = abs(sum(transaction.amount for transaction in transactions if transaction.amount < 0))
        essential_spend = sum(
            category.total for category in spending.categories if category.category in self.ESSENTIAL_CATEGORIES
        )
        discretionary_spend = spending.total_spent - essential_spend
        savings = max(income - spending.total_spent, 0)

        savings_rate = (savings / income) if income else 0
        essential_spend_ratio = (essential_spend / spending.total_spent) if spending.total_spent else 0
        discretionary_ratio = (discretionary_spend / income) if income else 1

        score = 55
        score += int(min(savings_rate * 100, 25))
        score += 10 if essential_spend_ratio >= 0.45 else 0
        score -= int(min(discretionary_ratio * 40, 25))
        score = max(0, min(100, score))

        if score >= 75:
            status = "Good"
            summary = "Your cash flow is healthy, with room to save and controlled discretionary spending."
        elif score >= 50:
            status = "Moderate"
            summary = "Your finances are stable, but a few spending habits should be tightened."
        else:
            status = "Risk"
            summary = "Your spending pattern needs attention to avoid budget pressure."

        return FinancialHealth(
            score=score,
            status=status,
            summary=summary,
            savings_rate=round(savings_rate * 100, 2),
            essential_spend_ratio=round(essential_spend_ratio * 100, 2),
        )
