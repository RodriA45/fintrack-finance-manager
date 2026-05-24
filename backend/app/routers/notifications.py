from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.notification import NotificationOut
from app.services import notification_service

router = APIRouter()


@router.get(
    "/",
    response_model=List[NotificationOut],
    summary="Listar notificaciones",
    description="Devuelve todas las notificaciones del usuario ordenadas por fecha.",
)
def list_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return notification_service.get_notifications(db, current_user.id)


@router.patch(
    "/{notification_id}/read",
    response_model=NotificationOut,
    summary="Marcar como leída",
    description="Marca una notificación específica como leída.",
)
def mark_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return notification_service.mark_as_read(db, notification_id, current_user.id)
