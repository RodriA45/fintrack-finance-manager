from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine, SessionLocal
from app.seed import seed_data
from app.routers import accounts, transactions, budgets, reports, notifications, auth

# Crear tablas y triggers al iniciar
from app.database import setup_triggers
Base.metadata.create_all(bind=engine)
setup_triggers(engine)

# Sembrar datos de prueba si no existen
db = SessionLocal()
try:
    seed_data(db)
finally:
    db.close()

app = FastAPI(
    title="FinTrack API",
    description="Sistema Integral de Gestión Financiera — TP IV Programación III",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Autenticación"])
app.include_router(accounts.router, prefix="/api/accounts", tags=["Cuentas"])
app.include_router(transactions.router, prefix="/api/transactions", tags=["Movimientos"])
app.include_router(budgets.router, prefix="/api/budgets", tags=["Presupuestos"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reportes"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notificaciones"])


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "FinTrack API corriendo. Docs en /docs"}
