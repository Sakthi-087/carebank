from __future__ import annotations

from app.models.schemas import FinancialHealth, RecommendationItem, SpendingSummary


class AdvisoryAgent:
    def analyze(self, spending: SpendingSummary, health: FinancialHealth) -> list[RecommendationItem]:
        recommendations: list[RecommendationItem] = []

        top_flexible = [item for item in spending.categories if item.category in {"Shopping", "Dining", "Entertainment"}]
        if top_flexible:
            top_item = top_flexible[0]
            recommendations.append(
                RecommendationItem(
                    title=f"Trim {top_item.category.lower()} spending",
                    action=f"Reduce {top_item.category.lower()} spend by 10-15% next month using a simple weekly cap.",
                    impact="Creates quick savings without affecting essential bills.",
                )
            )

        if health.savings_rate < 20:
            recommendations.append(
                RecommendationItem(
                    title="Increase savings buffer",
                    action="Auto-transfer part of income into savings right after payday.",
                    impact="Improves resilience for emergencies and large bills.",
                )
            )

        recommendations.append(
            RecommendationItem(
                title="Review subscriptions and recurring costs",
                action="Check recurring services and cancel any low-value subscriptions.",
                impact="Reduces passive monthly leakage from your budget.",
            )
        )

        return recommendations
