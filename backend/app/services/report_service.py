from sqlalchemy.orm import Session
from sqlalchemy import extract, func
from datetime import datetime

from app.models.transaction import Transaction, TransactionType
from app.models.account import Account
from app.schemas.report import MonthlySummary, CategoryReport, CategorySummary


def get_monthly_summary(db: Session, owner_id: int, month: int, year: int) -> MonthlySummary:
    base = (
        db.query(Transaction)
        .join(Account)
        .filter(
            Account.owner_id == owner_id,
            extract("month", Transaction.date) == month,
            extract("year", Transaction.date) == year,
        )
    )

    total_income = (
        base.filter(Transaction.type == TransactionType.income)
        .with_entities(func.sum(Transaction.amount))
        .scalar() or 0.0
    )
    total_expense = (
        base.filter(Transaction.type == TransactionType.expense)
        .with_entities(func.sum(Transaction.amount))
        .scalar() or 0.0
    )

    return MonthlySummary(
        month=month,
        year=year,
        total_income=round(total_income, 2),
        total_expense=round(total_expense, 2),
        net_balance=round(total_income - total_expense, 2),
    )


def get_expenses_by_category(db: Session, owner_id: int, month: int, year: int) -> CategorySummary:
    rows = (
        db.query(Transaction.category, func.sum(Transaction.amount).label("total"))
        .join(Account)
        .filter(
            Account.owner_id == owner_id,
            Transaction.type == TransactionType.expense,
            extract("month", Transaction.date) == month,
            extract("year", Transaction.date) == year,
        )
        .group_by(Transaction.category)
        .all()
    )

    grand_total = sum(r.total for r in rows) or 1.0
    categories = [
        CategoryReport(
            category=r.category,
            total=round(r.total, 2),
            percentage=round((r.total / grand_total) * 100, 2),
        )
        for r in rows
    ]

    return CategorySummary(month=month, year=year, categories=categories)
