from __future__ import annotations

import unittest

from app.models.schemas import Transaction
from app.services.simulation import SimulationEngine


class SimulationEngineTests(unittest.TestCase):
    def setUp(self) -> None:
        self.engine = SimulationEngine()

    def test_positive_income_category_counts_as_income(self) -> None:
        transactions = [
            Transaction(date="2026-03-01", description="Salary", amount=80000, category="Income"),
            Transaction(date="2026-03-02", description="Rent", amount=20000, category="Bills"),
            Transaction(date="2026-03-03", description="Groceries", amount=5000, category="Food"),
        ]

        self.assertEqual(self.engine.get_current_balance(transactions), 55000.0)
        self.assertEqual(self.engine.project_income(transactions, 30), 80000.0)
        self.assertEqual(self.engine.project_expenses(transactions, 1), 12500.0)

    def test_empty_transactions_returns_unknown(self) -> None:
        result = self.engine.simulate(transactions=[], simulated_cost=2500)

        self.assertEqual(result.decision, "Unknown")
        self.assertLess(result.future_balance, 0.0)
