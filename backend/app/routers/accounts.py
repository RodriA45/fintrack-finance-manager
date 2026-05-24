from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.account import AccountCreate, AccountUpdate, AccountOut
from app.services import account_service

router = APIRouter()


@router.get(
    "/",
    response_model=List[AccountOut],
    summary="Listar cuentas",
    description="Devuelve todas las cuentas del usuario autenticado con su saldo actual.",
)
def list_accounts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return account_service.get_accounts(db, current_user.id)


@router.post(
    "/",
    response_model=AccountOut,
    status_code=status.HTTP_201_CREATED,
    summary="Crear cuenta",
    description="Crea una nueva cuenta (cartera) para el usuario.",
)
def create_account(
    data: AccountCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return account_service.create_account(db, data, current_user.id)


@router.put(
    "/{account_id}",
    response_model=AccountOut,
    summary="Editar cuenta",
    description="Edita el nombre o descripción de una cuenta existente.",
)
def update_account(
    account_id: int,
    data: AccountUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return account_service.update_account(db, account_id, data, current_user.id)


@router.delete(
    "/{account_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar cuenta",
    description="Elimina una cuenta. Falla con 400 si tiene movimientos asociados.",
)
def delete_account(
    account_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    account_service.delete_account(db, account_id, current_user.id)
