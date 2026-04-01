from __future__ import annotations

from app.models.schemas import Transaction


def is_income_category(category: str) -> bool:
    normalized = category.strip().lower()
    return normalized in {"income", "salary", "credit", "refund", "transfer_in"}


def is_income_transaction(transaction: Transaction) -> bool:
    return is_income_category(transaction.category) or transaction.amount < 0


def normalized_signed_amount(transaction: Transaction) -> float:
    amount = abs(transaction.amount)
    return -amount if is_income_transaction(transaction) else amount


def normalized_expense_amount(transaction: Transaction) -> float:
    return abs(transaction.amount)


def normalize_transaction(transaction: Transaction) -> Transaction:
    signed_amount = normalized_signed_amount(transaction)
    return Transaction(
        date=transaction.date,
        description=transaction.description,
        amount=signed_amount,
        category=transaction.category,
    )
