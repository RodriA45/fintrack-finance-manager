from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class AccountCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=50, description="Nombre de la cuenta")
    description: Optional[str] = Field(None, max_length=200, description="Descripción opcional")
    balance: float = Field(default=0.0, ge=0, description="Saldo inicial en pesos argentinos")


class AccountUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    description: Optional[str] = Field(None, max_length=200)


class AccountOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    balance: float
    owner_id: int
    created_at: datetime

    model_config = {"from_attributes": True}
