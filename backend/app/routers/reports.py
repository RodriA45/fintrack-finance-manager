from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.report import MonthlySummary, CategorySummary
from app.services import report_service

router = APIRouter()


@router.get(
    "/summary",
    response_model=MonthlySummary,
    summary="Resumen mensual",
    description="Devuelve el total ingresado, total egresado y balance neto del mes.",
)
def monthly_summary(
    month: int = Query(default=datetime.now().month, ge=1, le=12),
    year: int = Query(default=datetime.now().year, ge=2020),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return report_service.get_monthly_summary(db, current_user.id, month, year)


@router.get(
    "/by-category",
    response_model=CategorySummary,
    summary="Gastos por categoría",
    description="Devuelve los egresos agrupados por categoría con su porcentaje del total.",
)
def expenses_by_category(
    month: int = Query(default=datetime.now().month, ge=1, le=12),
    year: int = Query(default=datetime.now().year, ge=2020),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return report_service.get_expenses_by_category(db, current_user.id, month, year)
