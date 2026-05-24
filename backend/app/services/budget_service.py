from sqlalchemy.orm import Session
from sqlalchemy import extract, func
from fastapi import HTTPException, status
from datetime import datetime

from app.models.budget import Budget
from app.models.transaction import Transaction, TransactionType
from app.models.account import Account
from app.schemas.budget import BudgetCreate, BudgetOut


def get_budgets(db: Session, owner_id: int, month: int, year: int) -> list[BudgetOut]:
    budgets = db.query(Budget).filter(
        Budget.owner_id == owner_id,
        Budget.month == month,
        Budget.year == year,
    ).all()

    result = []
    for b in budgets:
        spent = (
            db.query(func.sum(Transaction.amount))
            .join(Account)
            .filter(
                Account.owner_id == owner_id,
                Transaction.category == b.category,
                Transaction.type == TransactionType.expense,
                extract("month", Transaction.date) == month,
                extract("year", Transaction.date) == year,
            )
            .scalar() or 0.0
        )
        pct = round((spent / b.limit_amount) * 100, 2) if b.limit_amount else 0.0
        out = BudgetOut.model_validate(b)
        out.spent = round(spent, 2)
        out.percentage = pct
        result.append(out)
    return result


def create_budget(db: Session, data: BudgetCreate, owner_id: int) -> Budget:
    existing = db.query(Budget).filter(
        Budget.owner_id == owner_id,
        Budget.category == data.category,
        Budget.month == data.month,
        Budget.year == data.year,
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Ya existe un presupuesto para {data.category} en {data.month}/{data.year}",
        )
    budget = Budget(**data.model_dump(), owner_id=owner_id)
    db.add(budget)
    db.commit()
    db.refresh(budget)
    return budget
