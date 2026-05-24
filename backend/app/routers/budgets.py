from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.budget import BudgetCreate, BudgetOut
from app.services import budget_service

router = APIRouter()


@router.get(
    "/",
    response_model=List[BudgetOut],
    summary="Ver presupuestos",
    description="Devuelve los presupuestos del mes indicado con el gasto real y porcentaje usado.",
)
def list_budgets(
    month: int = Query(default=datetime.now().month, ge=1, le=12),
    year: int = Query(default=datetime.now().year, ge=2020),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return budget_service.get_budgets(db, current_user.id, month, year)


@router.post(
    "/",
    response_model=BudgetOut,
    status_code=status.HTTP_201_CREATED,
    summary="Crear presupuesto",
    description="Crea un presupuesto mensual por categoría. Devuelve 409 si ya existe.",
)
def create_budget(
    data: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return budget_service.create_budget(db, data, current_user.id)
