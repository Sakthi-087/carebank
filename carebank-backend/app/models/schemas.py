from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class UserContext(BaseModel):
    id: str
    email: str | None = None


class Transaction(BaseModel):
    date: str
    description: str
    amount: float
    category: str


class ScoreBreakdown(BaseModel):
    savings_score: float = Field(ge=0, le=100)
    stability_score: float = Field(ge=0, le=100)
    discipline_score: float = Field(ge=0, le=100)
    risk_score: float = Field(ge=0, le=100)


class ScoreMetrics(BaseModel):
    savings_ratio: float
    income: float
    expenses: float
    expense_volatility: float
    high_value_expense_count: int
    impulse_spend_count: int
    expense_ratio: float
    net_balance_trend: float


class FinancialScoreResponse(BaseModel):
    score: float = Field(ge=0, le=100)
    status: str
    breakdown: ScoreBreakdown
    metrics: ScoreMetrics
    summary: str


class SimulationRequest(BaseModel):
    amount: float = Field(gt=0)
    window_days: int = Field(default=30, ge=1, le=365)
    safety_threshold: float = Field(default=5000.0, ge=0)


class SimulationResponse(BaseModel):
    current_balance: float
    projected_income: float
    projected_expenses: float
    simulated_cost: float
    future_balance: float
    decision: str
    reason: str
    suggestion: str
    window_days: int
    safety_threshold: float
    ai_explanation: str


class FraudFinding(BaseModel):
    description: str
    amount: float
    risk: str
    flags: list[str]


class FraudCheckResponse(BaseModel):
    flagged_transactions: list[FraudFinding]


class FinancialHealth(BaseModel):
    score: int = Field(ge=0, le=100)
    status: str
    risk_indicator: str
    summary: str
    savings_rate: float
    breakdown: ScoreBreakdown
    metrics: ScoreMetrics


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


class CsvUploadRequest(BaseModel):
    filename: str
    content: str


class CsvUploadResponse(BaseModel):
    inserted_count: int
    skipped_count: int
    errors: list[str]
    fraud_summary: list[FraudFinding] = []


class NotificationPreferences(BaseModel):
    overspending_alerts: bool = True
    weekly_wellness_summary: bool = True
    ai_assistant_tips: bool = False


class PreferencesResponse(BaseModel):
    preferences: NotificationPreferences
