from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from app.models.schemas import AnalysisResponse, Transaction
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
        spending = self.spending_agent.analyze(transactions)
        health = self.health_agent.analyze(transactions, spending)
        alerts = self.alert_agent.analyze(spending, health)
        recommendations = self.advisory_agent.analyze(spending, health)

        structured_payload = {
            "spending": spending.model_dump(),
            "financial_health": health.model_dump(),
            "alerts": [item.model_dump() for item in alerts],
            "recommendations": [item.model_dump() for item in recommendations],
        }
        explanation = await self.llm_service.generate_explanation(structured_payload)

        return AnalysisResponse(
            spending=spending,
            financial_health=health,
            alerts=alerts,
            recommendations=recommendations,
            ai_explanation=explanation,
        )

    async def chat(self, message: str) -> dict[str, Any]:
        analysis = await self.analyze()
        structured_payload = analysis.model_dump()
        answer = await self.llm_service.answer_question(message, structured_payload)
        return {"answer": answer, "context": structured_payload}
