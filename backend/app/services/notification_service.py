from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.notification import Notification


def get_notifications(db: Session, owner_id: int) -> list[Notification]:
    return (
        db.query(Notification)
        .filter(Notification.owner_id == owner_id)
        .order_by(Notification.created_at.desc())
        .all()
    )


def mark_as_read(db: Session, notif_id: int, owner_id: int) -> Notification:
    notif = db.query(Notification).filter(
        Notification.id == notif_id,
        Notification.owner_id == owner_id,
    ).first()
    if not notif:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notificación no encontrada")
    notif.is_read = True
    db.commit()
    db.refresh(notif)
    return notif
