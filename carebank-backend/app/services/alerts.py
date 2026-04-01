from __future__ import annotations

from app.models.schemas import FinancialHealth


class AlertAgent:
    def analyze(self, spending_context: dict[str, object], health: FinancialHealth) -> list[str]:
        alerts: list[str] = []
        current = spending_context["current_totals"]
        previous = spending_context["previous_totals"]

        shopping_change = self._percentage_change(current["Shopping"], previous["Shopping"])
        food_change = self._percentage_change(current["Food"], previous["Food"])
        travel_change = self._percentage_change(current["Travel"], previous["Travel"])

        if shopping_change > 20:
            alerts.append(f"Shopping spending increased by {round(shopping_change)}% versus last month")
        if current["Food"] >= 4000 or food_change > 15:
            alerts.append("Food category is nearing your recommended monthly budget limit")
        if travel_change > 25 or current["Travel"] >= 1000:
            alerts.append("Travel expenses are unusually high this week compared to your normal pattern")
        if health.risk_indicator == "High":
            alerts.append("Overall financial risk is elevated due to rising discretionary spend")

        return alerts or ["No critical alerts detected in the current cycle"]

    def _percentage_change(self, current: float, previous: float) -> float:
        if previous == 0:
            return 100.0 if current > 0 else 0.0
        return ((current - previous) / previous) * 100
