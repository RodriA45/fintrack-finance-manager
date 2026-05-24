from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional
from app.models.transaction import TransactionType


class TransactionCreate(BaseModel):
    amount: float = Field(..., gt=0, description="Monto en pesos argentinos (mayor a 0)")
    description: str = Field(..., min_length=1, max_length=200, description="Descripción del movimiento")
    category: str = Field(..., min_length=1, max_length=50, description="Categoría del movimiento")
    type: TransactionType = Field(..., description="'income' para ingreso, 'expense' para egreso")
    date: datetime = Field(..., description="Fecha del movimiento (no puede ser futura)")
    account_id: int = Field(..., description="ID de la cuenta asociada")

    @field_validator("amount")
    @classmethod
    def round_amount(cls, v: float) -> float:
        return round(v, 2)

    @field_validator("date")
    @classmethod
    def no_future_dates(cls, v: datetime) -> datetime:
        now = datetime.now(v.tzinfo) if v.tzinfo is not None else datetime.now()
        if v > now:
            raise ValueError("La fecha no puede ser futura")
        return v


class TransactionUpdate(BaseModel):
    amount: Optional[float] = Field(None, gt=0)
    description: Optional[str] = Field(None, min_length=1, max_length=200)
    category: Optional[str] = Field(None, min_length=1, max_length=50)
    type: Optional[TransactionType] = None
    date: Optional[datetime] = None
    account_id: Optional[int] = None


class TransactionOut(BaseModel):
    id: int
    amount: float
    description: str
    category: str
    type: TransactionType
    date: datetime
    account_id: int
    created_at: datetime

    model_config = {"from_attributes": True}
