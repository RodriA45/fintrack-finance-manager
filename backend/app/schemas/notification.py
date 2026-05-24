from pydantic import BaseModel, Field
from datetime import datetime


class NotificationOut(BaseModel):
    id: int
    message: str
    is_read: bool
    owner_id: int
    created_at: datetime

    model_config = {"from_attributes": True}
