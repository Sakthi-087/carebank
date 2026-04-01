from __future__ import annotations

from app.models.schemas import FinancialHealth, SpendingSummary


class AdvisoryAgent:
    def analyze(self, spending: SpendingSummary, alerts: list[str], health: FinancialHealth) -> list[str]:
        if spending.total == 0:
            return [
                "Upload a recent CSV export from your bank or wallet to unlock personalized insights.",
                "Tag core expenses like Food, Bills, Travel, and Shopping for more accurate trend detection.",
                "Once two months of transactions are available, CareBank will compare month-over-month changes automatically.",
            ]

        recommendations: list[str] = []

        if spending.Shopping >= 2000:
            recommendations.append("Reduce shopping budget by Rs 2000 and batch non-essential purchases weekly")
        else:
            recommendations.append("Keep shopping spend on a weekly cap to avoid impulse-led month-end creep")

        if spending.Food >= 3500:
            recommendations.append("Set food budget cap at Rs 3000/month and track dining separately from groceries")
        else:
            recommendations.append("Maintain a fixed meal and grocery limit to keep food expenses predictable")

        if health.savings_rate < 85:
            recommendations.append("Increase savings allocation by 10% right after salary credit")
        else:
            recommendations.append("Continue directing surplus cash into savings before discretionary spending")

        if spending.total < 20000:
            recommendations.append("Consider a fixed deposit or recurring deposit for surplus funds this month")
        else:
            recommendations.append("Move any remaining surplus into a low-risk savings instrument for better discipline")

        return recommendations
