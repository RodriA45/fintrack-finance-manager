from fastapi import APIRouter, Depends, status, Response
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.user import UserCreate, UserOut, Token, LoginRequest
from app.services import auth_service
from app.dependencies import get_current_user
from app.models.user import User

router = APIRouter()


@router.post(
    "/register",
    response_model=UserOut,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar nuevo usuario",
    description="Crea un usuario nuevo. Devuelve 409 si el email ya está registrado.",
)
def register(data: UserCreate, db: Session = Depends(get_db)):
    return auth_service.register_user(db, data)


@router.post(
    "/login",
    summary="Iniciar sesión",
    description="Valida las credenciales y devuelve un JWT de acceso en una cookie HttpOnly.",
)
def login(data: LoginRequest, response: Response, db: Session = Depends(get_db)):
    token = auth_service.login_user(db, data.email, data.password)
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        samesite="lax",
        secure=False,
    )
    return {"message": "Login exitoso", "access_token": token, "token_type": "bearer"}

@router.post("/logout", summary="Cerrar sesión")
def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Sesión cerrada exitosamente"}

@router.get("/me", response_model=UserOut, summary="Obtener perfil")
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
