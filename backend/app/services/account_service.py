from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.account import Account
from app.models.transaction import Transaction
from app.schemas.account import AccountCreate, AccountUpdate


def get_accounts(db: Session, owner_id: int) -> list[Account]:
    return db.query(Account).filter(Account.owner_id == owner_id).all()


def get_account_or_404(db: Session, account_id: int, owner_id: int) -> Account:
    account = db.query(Account).filter(
        Account.id == account_id,
        Account.owner_id == owner_id,
    ).first()
    if not account:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cuenta no encontrada")
    return account


def create_account(db: Session, data: AccountCreate, owner_id: int) -> Account:
    account = Account(**data.model_dump(), owner_id=owner_id)
    db.add(account)
    db.commit()
    db.refresh(account)
    return account


def update_account(db: Session, account_id: int, data: AccountUpdate, owner_id: int) -> Account:
    account = get_account_or_404(db, account_id, owner_id)
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(account, field, value)
    db.commit()
    db.refresh(account)
    return account


def delete_account(db: Session, account_id: int, owner_id: int) -> None:
    account = get_account_or_404(db, account_id, owner_id)
    
    # Eliminar primero todos los movimientos asociados en cascada
    db.query(Transaction).filter(Transaction.account_id == account_id).delete()
    
    db.delete(account)
    db.commit()
