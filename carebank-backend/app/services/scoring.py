from __future__ import annotations

from collections import defaultdict
from statistics import pstdev

from app.models.schemas import FinancialScoreResponse, ScoreBreakdown, ScoreMetrics, Transaction
from app.services.transaction_utils import is_income_transaction, normalized_expense_amount


class FinancialScoringEngine:
    HIGH_VALUE_THRESHOLD = 2000.0
    IMPULSE_THRESHOLD = 750.0
    IMPULSE_CATEGORIES = {"shopping", "food", "travel"}

    def calculate(self, transactions: list[Transaction]) -> FinancialScoreResponse:
        if not transactions:
            breakdown = ScoreBreakdown(
                savings_score=0.0,
                stability_score=50.0,
                discipline_score=50.0,
                risk_score=20.0,
            )
            metrics = ScoreMetrics(
                savings_ratio=0.0,
                income=0.0,
                expenses=0.0,
                expense_volatility=0.0,
                high_value_expense_count=0,
                impulse_spend_count=0,
                expense_ratio=0.0,
                net_balance_trend=0.0,
            )
            return FinancialScoreResponse(
                score=24.0,
                status="Risky",
                breakdown=breakdown,
                metrics=metrics,
                summary="No transactions were available, so the score defaults to a conservative baseline until financial activity is uploaded.",
            )

        income, expenses, expense_transactions = self._split_transactions(transactions)
        savings_ratio = ((income - expenses) / income) if income > 0 else 0.0
        savings_score = self._score_savings_ratio(savings_ratio)

        daily_expense_totals = self._daily_expense_totals(expense_transactions)
        expense_volatility = pstdev(daily_expense_totals) if len(daily_expense_totals) > 1 else 0.0
        stability_score = self._score_stability(daily_expense_totals, expense_volatility)

        high_value_expense_count = sum(1 for transaction in expense_transactions if transaction.amount >= self.HIGH_VALUE_THRESHOLD)
        impulse_spend_count = sum(
            1
            for transaction in expense_transactions
            if transaction.amount >= self.IMPULSE_THRESHOLD and transaction.category.lower() in self.IMPULSE_CATEGORIES
        )
        discipline_score = self._score_discipline(high_value_expense_count, impulse_spend_count)

        expense_ratio = (expenses / income) if income > 0 else 1.0
        net_balance_trend = self._net_balance_trend(transactions)
        risk_score = self._score_risk(expense_ratio, net_balance_trend, income, expenses)

        final_score = (
            savings_score * 0.4
            + stability_score * 0.2
            + discipline_score * 0.2
            + risk_score * 0.2
        )

        breakdown = ScoreBreakdown(
            savings_score=round(savings_score, 2),
            stability_score=round(stability_score, 2),
            discipline_score=round(discipline_score, 2),
            risk_score=round(risk_score, 2),
        )
        metrics = ScoreMetrics(
            savings_ratio=round(savings_ratio, 4),
            income=round(income, 2),
            expenses=round(expenses, 2),
            expense_volatility=round(expense_volatility, 2),
            high_value_expense_count=high_value_expense_count,
            impulse_spend_count=impulse_spend_count,
            expense_ratio=round(expense_ratio, 4) if income > 0 else 0.0,
            net_balance_trend=round(net_balance_trend, 2),
        )

        score = round(final_score, 2)
        status = self.get_status(score)
        return FinancialScoreResponse(
            score=score,
            status=status,
            breakdown=breakdown,
            metrics=metrics,
            summary=self._build_summary(status, breakdown, metrics),
        )

    def get_status(self, score: float) -> str:
        if score >= 75:
            return "Healthy"
        if score >= 50:
            return "Moderate"
        return "Risky"

    def get_risk_indicator(self, score: float) -> str:
        if score >= 75:
            return "Low"
        if score >= 50:
            return "Medium"
        return "High"

    def _split_transactions(self, transactions: list[Transaction]) -> tuple[float, float, list[Transaction]]:
        income = 0.0
        expenses = 0.0
        expense_transactions: list[Transaction] = []

        for transaction in transactions:
            if is_income_transaction(transaction):
                income += normalized_expense_amount(transaction)
            else:
                expense_amount = normalized_expense_amount(transaction)
                expenses += expense_amount
                expense_transactions.append(
                    Transaction(
                        date=transaction.date,
                        description=transaction.description,
                        amount=expense_amount,
                        category=transaction.category,
                    )
                )

        return income, expenses, expense_transactions

    def _score_savings_ratio(self, savings_ratio: float) -> float:
        if savings_ratio >= 0.4:
            return 100.0
        if savings_ratio >= 0.2:
            return 60.0 + ((savings_ratio - 0.2) / 0.2) * 40.0
        if savings_ratio > 0:
            return (savings_ratio / 0.2) * 60.0
        return 0.0

    def _daily_expense_totals(self, transactions: list[Transaction]) -> list[float]:
        grouped: dict[str, float] = defaultdict(float)
        for transaction in transactions:
            grouped[transaction.date] += transaction.amount
        return list(grouped.values())

    def _score_stability(self, daily_totals: list[float], expense_volatility: float) -> float:
        if len(daily_totals) <= 1:
            return 50.0

        average_daily_spend = sum(daily_totals) / len(daily_totals)
        if average_daily_spend <= 0:
            return 50.0

        variability_ratio = expense_volatility / average_daily_spend
        return max(0.0, min(100.0, 100.0 - variability_ratio * 100.0))

    def _score_discipline(self, high_value_count: int, impulse_spend_count: int) -> float:
        penalty = high_value_count * 8.0 + max(0, impulse_spend_count - 2) * 4.0
        return max(0.0, 100.0 - penalty)

    def _net_balance_trend(self, transactions: list[Transaction]) -> float:
        monthly_net: dict[str, float] = defaultdict(float)
        for transaction in transactions:
            month = transaction.date[:7]
            if is_income_transaction(transaction):
                monthly_net[month] += normalized_expense_amount(transaction)
            else:
                monthly_net[month] -= normalized_expense_amount(transaction)

        months = sorted(monthly_net)
        if len(months) < 2:
            return 0.0
        return monthly_net[months[-1]] - monthly_net[months[-2]]

    def _score_risk(self, expense_ratio: float, net_balance_trend: float, income: float, expenses: float) -> float:
        if income <= 0:
            return 20.0

        base_score = max(0.0, 100.0 - expense_ratio * 100.0)
        if expenses > income:
            base_score -= 20.0
        if net_balance_trend < 0:
            base_score -= min(20.0, abs(net_balance_trend) / max(income, 1.0) * 100.0)
        return max(0.0, min(100.0, base_score))

    def _build_summary(self, status: str, breakdown: ScoreBreakdown, metrics: ScoreMetrics) -> str:
        return (
            f"Status is {status.lower()} with savings contributing {breakdown.savings_score:.0f}/100, "
            f"stability at {breakdown.stability_score:.0f}/100, discipline at {breakdown.discipline_score:.0f}/100, "
            f"and risk at {breakdown.risk_score:.0f}/100. Savings ratio is {metrics.savings_ratio:.0%} "
            f"and expense-to-income ratio is {metrics.expense_ratio:.0%}."
        )
