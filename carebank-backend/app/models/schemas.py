from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class Transaction(BaseModel):
    date: str
    description: str
    amount: float
    category: str


class FinancialHealth(BaseModel):
    score: int = Field(ge=0, le=100)
    status: str
    risk_indicator: str
    summary: str
    savings_rate: float


class SpendingSummary(BaseModel):
    Food: float
    Shopping: float
    Travel: float
    Bills: float
    total: float
    change_vs_last_month: float
    largest_category: str


class KPIItem(BaseModel):
    title: str
    value: str
    subtitle: str
    tone: str


class AnalysisResponse(BaseModel):
    financial_health: FinancialHealth
    spending: SpendingSummary
    alerts: list[str]
    recommendations: list[str]
    ai_explanation: str
    kpis: list[KPIItem]
    chart_data: list[dict[str, Any]]
    insights: dict[str, Any]


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    answer: str
    context: dict[str, Any]
