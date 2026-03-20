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
        prompt = self._build_explanation_prompt(payload)
        response = await self._chat_completion(prompt)
        if response:
            return response
        return self._fallback_explanation(payload)

    async def answer_question(self, question: str, payload: dict[str, Any]) -> str:
        prompt = (
            "You are CareBank, an AI financial wellness assistant. Answer the user's question using the provided financial analysis. "
            "Stay specific, practical, and concise.\n\n"
            f"Financial analysis:\n{json.dumps(payload, indent=2)}\n\n"
            f"User question: {question}"
        )
        response = await self._chat_completion(prompt)
        if response:
            return response
        return (
            "Based on your latest transactions, your largest spending pressure comes from "
            f"{payload['spending']['top_category'].lower()}, while alerts highlight areas to watch. "
            "Try lowering flexible spending and reviewing recurring expenses."
        )

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
                {"role": "system", "content": "You are a helpful financial wellness assistant."},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.4,
        }

        url = f"{self.base_url.rstrip('/')}/chat/completions"
        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                response = await client.post(url, headers=headers, json=body)
                response.raise_for_status()
                payload = response.json()
                return payload["choices"][0]["message"]["content"].strip()
        except Exception:
            return None

    def _build_explanation_prompt(self, payload: dict[str, Any]) -> str:
        return (
            "Explain the user's financial behavior in friendly, professional language. Include strengths, risks, and next steps.\n\n"
            f"Structured analysis:\n{json.dumps(payload, indent=2)}"
        )

    def _fallback_explanation(self, payload: dict[str, Any]) -> str:
        health = payload["financial_health"]
        spending = payload["spending"]
        alerts = payload["alerts"]
        recommendations = payload["recommendations"]
        return (
            f"Your financial health score is {health['score']} ({health['status']}). "
            f"This month you spent ${spending['total_spent']:.2f}, with {spending['top_category']} as the top category. "
            f"Key watch-outs include {alerts[0]['title'].lower()}. "
            f"A smart next step is to {recommendations[0]['action'].lower()}"
        )
