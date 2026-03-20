from __future__ import annotations

import json
import os
from typing import Any

import httpx


class LLMService:
    def __init__(self) -> None:
        self.api_key = os.getenv("OPENAI_API_KEY") or os.getenv("OPENROUTER_API_KEY")
        self.base_url = os.getenv("LLM_BASE_URL", "https://openrouter.ai/api/v1")
        self.model = os.getenv("LLM_MODEL", "openai/gpt-4o-mini")
        self.provider = os.getenv("LLM_PROVIDER", "openrouter")

    async def generate_explanation(self, payload: dict[str, Any]) -> str:
        prompt = (
            "Convert this financial analysis into a clean, human explanation in 3-4 sentences. "
            "Mention score, strengths, biggest concern, and practical next step.\n\n"
            f"Analysis:\n{json.dumps(payload, indent=2)}"
        )
        response = await self._chat_completion(prompt)
        return response or self._fallback_explanation(payload)

    async def answer_question(self, question: str, payload: dict[str, Any]) -> str:
        prompt = (
            "You are CareBank, a financial wellness assistant. Answer using the analysis below. "
            "Explain numeric drivers and stay concise.\n\n"
            f"Analysis:\n{json.dumps(payload, indent=2)}\n\n"
            f"User question: {question}"
        )
        response = await self._chat_completion(prompt)
        return response or self._fallback_chat(question, payload)

    async def _chat_completion(self, prompt: str) -> str | None:
        if not self.api_key:
            return None

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        if self.provider == "openrouter":
            headers["HTTP-Referer"] = os.getenv("APP_URL", "http://localhost:5173")
            headers["X-Title"] = "CareBank"

        body = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": "You are a precise financial wellness assistant."},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.3,
        }

        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                response = await client.post(f"{self.base_url.rstrip('/')}/chat/completions", headers=headers, json=body)
                response.raise_for_status()
                payload = response.json()
                return payload["choices"][0]["message"]["content"].strip()
        except Exception:
            return None

    def _fallback_explanation(self, payload: dict[str, Any]) -> str:
        health = payload["financial_health"]
        spending = payload["spending"]
        top_alert = payload["alerts"][0] if payload["alerts"] else "No major alerts were detected"
        return (
            f"Your financial health is {health['status'].upper()} (Score: {health['score']}). "
            f"This month your total spending was ₹{spending['total']:.0f}, with {spending['largest_category'].lower()} driving the highest outflow. "
            f"The biggest signal right now is that {top_alert.lower()}. "
            "Maintaining discipline in discretionary categories can improve your savings rate further."
        )

    def _fallback_chat(self, question: str, payload: dict[str, Any]) -> str:
        spending = payload["spending"]
        if "why" in question.lower() and "spend" in question.lower():
            return (
                f"You spent more this month because total expenses rose by {spending['change_vs_last_month']:.1f}% versus last month. "
                f"The main driver was {spending['largest_category'].lower()}, especially shopping at ₹{spending['Shopping']:.0f} and food at ₹{spending['Food']:.0f}."
            )
        return (
            f"Your current financial health score is {payload['financial_health']['score']}. "
            f"Focus first on shopping and food controls, since they are driving most of the month-over-month increase."
        )
