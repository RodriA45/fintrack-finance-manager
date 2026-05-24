from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.transaction import TransactionCreate, TransactionUpdate, TransactionOut
from app.services import transaction_service

router = APIRouter()


@router.get(
    "/",
    response_model=List[TransactionOut],
    summary="Listar movimientos",
    description="Devuelve movimientos del usuario. Soporta filtros por cuenta y rango de fechas.",
)
def list_transactions(
    account_id: Optional[int] = Query(None, description="Filtrar por cuenta"),
    start_date: Optional[datetime] = Query(None, description="Fecha inicio (ISO 8601)"),
    end_date: Optional[datetime] = Query(None, description="Fecha fin (ISO 8601)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return transaction_service.get_transactions(db, current_user.id, account_id, start_date, end_date)


@router.post(
    "/",
    response_model=TransactionOut,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar movimiento",
    description="Registra un ingreso o egreso. El saldo de la cuenta se actualiza via trigger.",
)
def create_transaction(
    data: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return transaction_service.create_transaction(db, data, current_user.id)


@router.put(
    "/{transaction_id}",
    response_model=TransactionOut,
    summary="Editar movimiento",
)
def update_transaction(
    transaction_id: int,
    data: TransactionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return transaction_service.update_transaction(db, transaction_id, data, current_user.id)


@router.delete(
    "/{transaction_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar movimiento",
)
def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    transaction_service.delete_transaction(db, transaction_id, current_user.id)
