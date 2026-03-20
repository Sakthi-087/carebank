from __future__ import annotations

from app.models.schemas import FinancialHealth, SpendingSummary, Transaction


class FinancialHealthAgent:
    def analyze(self, transactions: list[Transaction], spending: SpendingSummary) -> FinancialHealth:
        months = sorted({transaction.date[:7] for transaction in transactions if transaction.amount > 0})
        current_month = months[-1]

        income = abs(
            sum(transaction.amount for transaction in transactions if transaction.amount < 0 and transaction.date.startswith(current_month))
        )
        total_spend = spending.total
        savings = max(income - total_spend, 0)
        savings_rate = (savings / income * 100) if income else 0.0
        shopping_pressure = (spending.Shopping / total_spend * 100) if total_spend else 0.0
        travel_pressure = (spending.Travel / total_spend * 100) if total_spend else 0.0

        score = 92
        score -= int(min(max(spending.change_vs_last_month, 0), 20))
        score -= 8 if shopping_pressure > 25 else 0
        score -= 5 if travel_pressure > 18 else 0
        score += 4 if savings_rate >= 80 else 0
        score = max(0, min(100, score))

        if score >= 80:
            status = "Good"
            risk_indicator = "Low"
            summary = "Your income is stable and your spending remains manageable, but discretionary categories need monitoring."
        elif score >= 60:
            status = "Moderate"
            risk_indicator = "Medium"
            summary = "Your finances are stable overall, though increased discretionary spending is starting to reduce efficiency."
        else:
            status = "Risk"
            risk_indicator = "High"
            summary = "Your current spending trend is putting noticeable pressure on savings and deserves attention."

        return FinancialHealth(
            score=score,
            status=status,
            risk_indicator=risk_indicator,
            summary=summary,
            savings_rate=round(savings_rate, 2),
        )
