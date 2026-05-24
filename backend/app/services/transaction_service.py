from sqlalchemy.orm import Session
from sqlalchemy import extract
from fastapi import HTTPException, status
from datetime import datetime
from typing import Optional

from app.models.transaction import Transaction, TransactionType
from app.models.account import Account
from app.models.budget import Budget
from app.models.notification import Notification
from app.schemas.transaction import TransactionCreate, TransactionUpdate
from app.config import settings


def get_transactions(
    db: Session,
    owner_id: int,
    account_id: Optional[int] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
) -> list[Transaction]:
    query = (
        db.query(Transaction)
        .join(Account)
        .filter(Account.owner_id == owner_id)
    )
    if account_id:
        query = query.filter(Transaction.account_id == account_id)
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)
    return query.order_by(Transaction.date.desc()).all()


def get_transaction_or_404(db: Session, txn_id: int, owner_id: int) -> Transaction:
    txn = (
        db.query(Transaction)
        .join(Account)
        .filter(Transaction.id == txn_id, Account.owner_id == owner_id)
        .first()
    )
    if not txn:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movimiento no encontrado")
    return txn


def _check_account_ownership(db: Session, account_id: int, owner_id: int) -> Account:
    account = db.query(Account).filter(
        Account.id == account_id,
        Account.owner_id == owner_id,
    ).first()
    if not account:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cuenta no encontrada")
    return account


def _check_budget_alert(db: Session, txn: Transaction, owner_id: int) -> None:
    """Genera notificación si un egreso supera el 80% o el 100% del presupuesto."""
    if txn.type != TransactionType.expense:
        return

    budget = db.query(Budget).filter(
        Budget.owner_id == owner_id,
        Budget.category == txn.category,
        Budget.month == txn.date.month,
        Budget.year == txn.date.year,
    ).first()

    if not budget:
        return

    spent = (
        db.query(Transaction)
        .join(Account)
        .filter(
            Account.owner_id == owner_id,
            Transaction.category == txn.category,
            Transaction.type == TransactionType.expense,
            extract("month", Transaction.date) == txn.date.month,
            extract("year", Transaction.date) == txn.date.year,
        )
        .with_entities(__import__("sqlalchemy").func.sum(Transaction.amount))
        .scalar() or 0.0
    )

    pct = (spent / budget.limit_amount) * 100

    if pct >= 100:
        msg = f"Superaste el 100% del presupuesto de {txn.category} ({pct:.0f}% utilizado)"
    elif pct >= 80:
        msg = f"Alcanzaste el {pct:.0f}% del presupuesto de {txn.category}"
    else:
        return

    notif = Notification(message=msg, owner_id=owner_id)
    db.add(notif)


def create_transaction(db: Session, data: TransactionCreate, owner_id: int) -> Transaction:
    _check_account_ownership(db, data.account_id, owner_id)

    txn = Transaction(**data.model_dump())
    db.add(txn)
    db.flush()  # genera el ID antes del commit para que el trigger se ejecute

    _check_budget_alert(db, txn, owner_id)

    # Alerta por monto alto configurado
    if data.amount > settings.ALERT_THRESHOLD:
        notif = Notification(
            message=f"Movimiento de ${data.amount:,.2f} registrado en categoría {data.category}",
            owner_id=owner_id,
        )
        db.add(notif)

    db.commit()
    db.refresh(txn)
    return txn


def update_transaction(db: Session, txn_id: int, data: TransactionUpdate, owner_id: int) -> Transaction:
    txn = get_transaction_or_404(db, txn_id, owner_id)
    if data.account_id:
        _check_account_ownership(db, data.account_id, owner_id)
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(txn, field, value)
    db.commit()
    db.refresh(txn)
    return txn


def delete_transaction(db: Session, txn_id: int, owner_id: int) -> None:
    txn = get_transaction_or_404(db, txn_id, owner_id)
    db.delete(txn)
    db.commit()
