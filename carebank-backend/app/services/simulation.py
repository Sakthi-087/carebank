from __future__ import annotations

from collections import defaultdict

from app.models.schemas import SimulationResponse, Transaction
from app.services.transaction_utils import is_income_transaction, normalized_expense_amount


class SimulationEngine:
    DEFAULT_WINDOW_DAYS = 30
    DEFAULT_SAFETY_THRESHOLD = 5000.0

    def simulate(
        self,
        transactions: list[Transaction],
        simulated_cost: float,
        window_days: int = DEFAULT_WINDOW_DAYS,
        safety_threshold: float = DEFAULT_SAFETY_THRESHOLD,
    ) -> SimulationResponse:
        if not transactions:
            return SimulationResponse(
                current_balance=0.0,
                projected_income=0.0,
                projected_expenses=0.0,
                simulated_cost=round(simulated_cost, 2),
                future_balance=round(-simulated_cost, 2),
                decision="Unknown",
                reason="No transaction data available.",
                suggestion="Upload recent transactions before relying on a simulation result.",
                window_days=window_days,
                safety_threshold=round(safety_threshold, 2),
                ai_explanation="There is not enough transaction data to explain the impact reliably. Upload recent activity before using this simulation.",
            )

        current_balance = self.get_current_balance(transactions)
        projected_income = self.project_income(transactions, window_days)
        projected_expenses = self.project_expenses(transactions, window_days)
        future_balance = current_balance + projected_income - projected_expenses - simulated_cost

        decision, reason = self.decision_logic(future_balance, safety_threshold)
        suggestion = self.generate_suggestion(future_balance, projected_expenses, safety_threshold)

        return SimulationResponse(
            current_balance=round(current_balance, 2),
            projected_income=round(projected_income, 2),
            projected_expenses=round(projected_expenses, 2),
            simulated_cost=round(simulated_cost, 2),
            future_balance=round(future_balance, 2),
            decision=decision,
            reason=reason,
            suggestion=suggestion,
            window_days=window_days,
            safety_threshold=round(safety_threshold, 2),
            ai_explanation="",
        )

    def get_current_balance(self, transactions: list[Transaction]) -> float:
        income = 0.0
        expenses = 0.0

        for transaction in transactions:
            if is_income_transaction(transaction):
                income += normalized_expense_amount(transaction)
            else:
                expenses += normalized_expense_amount(transaction)

        return income - expenses

    def project_income(self, transactions: list[Transaction], window_days: int) -> float:
        monthly_income: dict[str, float] = defaultdict(float)
        for transaction in transactions:
            if is_income_transaction(transaction):
                monthly_income[transaction.date[:7]] += normalized_expense_amount(transaction)

        if not monthly_income:
            return 0.0

        average_monthly_income = sum(monthly_income.values()) / len(monthly_income)
        return average_monthly_income * (window_days / 30.0)

    def project_expenses(self, transactions: list[Transaction], window_days: int) -> float:
        daily_expenses: dict[str, float] = defaultdict(float)
        for transaction in transactions:
            if not is_income_transaction(transaction):
                daily_expenses[transaction.date] += normalized_expense_amount(transaction)

        if not daily_expenses:
            return 0.0

        average_daily_expense = sum(daily_expenses.values()) / len(daily_expenses)
        return average_daily_expense * window_days

    def decision_logic(self, future_balance: float, safety_threshold: float) -> tuple[str, str]:
        if future_balance < 0:
            return "Not Safe", "Your balance will go negative within the projection window."
        if future_balance < safety_threshold:
            return "Risky", "Your balance will fall below the configured safety threshold."
        return "Safe", "You can afford this expense within the current projection window."

    def generate_suggestion(self, future_balance: float, projected_expenses: float, safety_threshold: float) -> str:
        if future_balance < 0:
            return "Delay the purchase or reduce planned expenses before taking this action."
        if future_balance < safety_threshold:
            return "Consider lowering discretionary spending or reducing the purchase amount this month."
        if projected_expenses > 0:
            return "The projection stays healthy, so maintain your current spending discipline after the purchase."
        return "Projection data is limited, so monitor new spending after the purchase."
