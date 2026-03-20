from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class Transaction(BaseModel):
    date: str
    description: str
    amount: float
    category: str


class CategoryBreakdown(BaseModel):
    category: str
    total: float
    percentage: float
    transaction_count: int


class SpendingSummary(BaseModel):
    total_spent: float
    average_transaction: float
    top_category: str
    categories: list[CategoryBreakdown]
    monthly_totals: dict[str, float]


class FinancialHealth(BaseModel):
    score: int = Field(ge=0, le=100)
    status: str
    summary: str
    savings_rate: float
    essential_spend_ratio: float


class AlertItem(BaseModel):
    title: str
    severity: str
    message: str


class RecommendationItem(BaseModel):
    title: str
    action: str
    impact: str


class AnalysisResponse(BaseModel):
    spending: SpendingSummary
    financial_health: FinancialHealth
    alerts: list[AlertItem]
    recommendations: list[RecommendationItem]
    ai_explanation: str


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    answer: str
    context: dict[str, Any]
