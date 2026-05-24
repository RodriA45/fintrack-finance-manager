from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class BudgetCreate(BaseModel):
    category: str = Field(..., min_length=1, max_length=50, description="Categoría del presupuesto")
    limit_amount: float = Field(..., gt=0, description="Límite de gasto mensual en pesos argentinos")
    month: int = Field(..., ge=1, le=12, description="Mes (1-12)")
    year: int = Field(..., ge=2020, description="Año del presupuesto")


class BudgetOut(BaseModel):
    id: int
    category: str
    limit_amount: float
    month: int
    year: int
    owner_id: int
    created_at: datetime
    spent: float = Field(default=0.0, description="Total gastado en esta categoría este mes")
    percentage: float = Field(default=0.0, description="Porcentaje del límite utilizado")

    model_config = {"from_attributes": True}
