from __future__ import annotations

from app.models.schemas import AlertItem, FinancialHealth, SpendingSummary


class AlertAgent:
    def analyze(self, spending: SpendingSummary, health: FinancialHealth) -> list[AlertItem]:
        alerts: list[AlertItem] = []
        categories = {item.category: item for item in spending.categories}

        shopping = categories.get("Shopping")
        dining = categories.get("Dining")
        housing = categories.get("Housing")

        if shopping and shopping.percentage > 18:
            alerts.append(
                AlertItem(
                    title="Shopping spend is elevated",
                    severity="medium",
                    message="Shopping is taking a notable share of your budget this month. Consider postponing non-urgent purchases.",
                )
            )

        if dining and dining.total > spending.average_transaction * 3:
            alerts.append(
                AlertItem(
                    title="Dining costs are trending up",
                    severity="low",
                    message="Dining expenses are higher than your normal ticket size and may be worth capping weekly.",
                )
            )

        if housing and housing.percentage > 40:
            alerts.append(
                AlertItem(
                    title="Housing dominates your spend",
                    severity="medium",
                    message="Fixed housing costs consume a large part of total spending, leaving less room for flexible savings.",
                )
            )

        if health.status == "Risk":
            alerts.append(
                AlertItem(
                    title="Financial health requires action",
                    severity="high",
                    message="Your financial health score suggests your current spending pace may become difficult to sustain.",
                )
            )

        if not alerts:
            alerts.append(
                AlertItem(
                    title="No major alerts",
                    severity="info",
                    message="Your current spending pattern does not show critical warning signals.",
                )
            )

        return alerts
