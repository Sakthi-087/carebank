from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from app.models.schemas import AnalysisResponse, KPIItem, Transaction
from app.services.advisory import AdvisoryAgent
from app.services.alerts import AlertAgent
from app.services.health import FinancialHealthAgent
from app.services.llm import LLMService
from app.services.spending import SpendingAnalysisAgent


class CoordinatorAgent:
    def __init__(self) -> None:
        self.spending_agent = SpendingAnalysisAgent()
        self.health_agent = FinancialHealthAgent()
        self.alert_agent = AlertAgent()
        self.advisory_agent = AdvisoryAgent()
        self.llm_service = LLMService()
        self.data_path = Path(__file__).resolve().parents[2] / "data" / "transactions.json"

    def load_transactions(self) -> list[Transaction]:
        with self.data_path.open("r", encoding="utf-8") as file:
            payload = json.load(file)
        return [Transaction(**item) for item in payload]

    async def analyze(self) -> AnalysisResponse:
        transactions = self.load_transactions()
        spending_context = self.spending_agent.analyze(transactions)
        spending = spending_context["summary"]
        health = self.health_agent.analyze(transactions, spending)
        alerts = self.alert_agent.analyze(spending_context, health)
        recommendations = self.advisory_agent.analyze(spending, alerts, health)

        insights = {
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "currency": "INR",
            "current_month": spending_context["current_month"],
            "previous_month": spending_context["previous_month"],
            "risk_indicator": health.risk_indicator,
        }

        structured_payload = {
            "financial_health": health.model_dump(),
            "spending": spending.model_dump(),
            "alerts": alerts,
            "recommendations": recommendations,
            "insights": insights,
        }
        explanation = await self.llm_service.generate_explanation(structured_payload)

        return AnalysisResponse(
            financial_health=health,
            spending=spending,
            alerts=alerts,
            recommendations=recommendations,
            ai_explanation=explanation,
            kpis=self._build_kpis(spending, health, alerts),
            chart_data=spending_context["chart_data"],
            insights=insights,
        )

    async def chat(self, message: str) -> dict[str, Any]:
        analysis = await self.analyze()
        structured_payload = analysis.model_dump()
        answer = await self.llm_service.answer_question(message, structured_payload)
        return {"answer": answer, "context": structured_payload}

    def _build_kpis(self, spending, health, alerts: list[str]) -> list[KPIItem]:
        return [
            KPIItem(
                title="Financial Health",
                value=str(health.score),
                subtitle=f"Status: {health.status}",
                tone="good" if health.status == "Good" else "warning",
            ),
            KPIItem(
                title="Monthly Spending",
                value=f"₹{spending.total:,.0f}",
                subtitle=f"{spending.change_vs_last_month:+.1f}% vs last month",
                tone="neutral" if spending.change_vs_last_month <= 10 else "warning",
            ),
            KPIItem(
                title="Savings Rate",
                value=f"{health.savings_rate:.1f}%",
                subtitle="Saved from current month income",
                tone="good" if health.savings_rate >= 75 else "warning",
            ),
            KPIItem(
                title="Risk Indicator",
                value=health.risk_indicator,
                subtitle=f"{len(alerts)} active alerts",
                tone="good" if health.risk_indicator == "Low" else "danger",
            ),
        ]
