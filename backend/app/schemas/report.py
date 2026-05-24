from pydantic import BaseModel, Field
from typing import List


class MonthlySummary(BaseModel):
    month: int
    year: int
    total_income: float = Field(..., description="Total ingresado en el mes")
    total_expense: float = Field(..., description="Total egresado en el mes")
    net_balance: float = Field(..., description="Balance neto (ingresos - egresos)")


class CategoryReport(BaseModel):
    category: str
    total: float = Field(..., description="Total gastado en esta categoría")
    percentage: float = Field(..., description="Porcentaje del total de egresos")


class CategorySummary(BaseModel):
    month: int
    year: int
    categories: List[CategoryReport]
