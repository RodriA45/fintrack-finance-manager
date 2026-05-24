from sqlalchemy.orm import Session
from app.models.user import User
from app.models.account import Account
from app.models.transaction import Transaction
from app.models.budget import Budget
from app.models.notification import Notification
from app.services.auth_service import hash_password
from datetime import datetime
import calendar
def seed_data(db: Session):
    # Verificar si el usuario de prueba ya existe
    test_email = "test@fintrack.com"
    existing_user = db.query(User).filter(User.email == test_email).first()
    if existing_user:
        return  # Ya está sembrado
    
    print("Sembrando base de datos con datos de prueba dinámicos...")
    
    # 1. Crear usuario
    user = User(
        email=test_email,
        hashed_password=hash_password("password123"),
        full_name="Usuario de Prueba"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # 2. Crear cuentas
    efectivo = Account(name="Efectivo", description="Bolsillo diario", balance=0.0, owner_id=user.id)
    banco = Account(name="Banco", description="Santander Río", balance=0.0, owner_id=user.id)
    mp = Account(name="Mercado Pago", description="Billetera virtual", balance=0.0, owner_id=user.id)
    
    db.add(efectivo)
    db.add(banco)
    db.add(mp)
    db.commit()
    db.refresh(efectivo)
    db.refresh(banco)
    db.refresh(mp)
    
    # Obtener mes y año actuales para que siempre se vea poblado el panel del mes en curso
    now = datetime.now()
    y = now.year
    m = now.month
    
    def safe_date(day, hour, minute):
        max_day = calendar.monthrange(y, m)[1]
        return datetime(y, m, min(day, max_day), hour, minute)
    
    # 3. Crear movimientos (los saldos se actualizan automáticamente mediante el trigger)
    txs = [
        # Ingresos
        Transaction(type="income", amount=150000.0, category="Salario", description="Sueldo Mensual", account_id=banco.id, date=safe_date(1, 10, 0)),
        Transaction(type="income", amount=35000.0, category="Otros", description="Venta de campera vieja", account_id=mp.id, date=safe_date(5, 15, 30)),
        Transaction(type="income", amount=12000.0, category="Otros", description="Reembolso de compra", account_id=mp.id, date=safe_date(8, 12, 0)),
        
        # Egresos
        Transaction(type="expense", amount=8500.0, category="Comida", description="Cena en pizzería", account_id=efectivo.id, date=safe_date(10, 21, 0)),
        Transaction(type="expense", amount=4200.0, category="Transporte", description="Carga de SUBE", account_id=efectivo.id, date=safe_date(12, 9, 15)),
        Transaction(type="expense", amount=12500.0, category="Comida", description="Supermercado Semanal", account_id=banco.id, date=safe_date(14, 18, 45)),
        Transaction(type="expense", amount=6700.0, category="Entretenimiento", description="Suscripción Netflix", account_id=mp.id, date=safe_date(15, 23, 0)),
        Transaction(type="expense", amount=3500.0, category="Salud", description="Farmacia - Medicamentos", account_id=efectivo.id, date=safe_date(18, 11, 0)),
        Transaction(type="expense", amount=18000.0, category="Servicios", description="Pago Luz y Gas", account_id=banco.id, date=safe_date(19, 16, 0)),
    ]
    
    for tx in txs:
        db.add(tx)
    db.commit()
    
    # 4. Crear presupuestos
    budgets = [
        Budget(category="Comida", limit_amount=45000.0, owner_id=user.id, month=m, year=y),
        Budget(category="Transporte", limit_amount=15000.0, owner_id=user.id, month=m, year=y),
        Budget(category="Entretenimiento", limit_amount=10000.0, owner_id=user.id, month=m, year=y),
    ]
    
    for b in budgets:
        db.add(b)
    db.commit()
    
    # 5. Crear notificaciones
    notifications = [
        Notification(message="¡Bienvenido a FinTrack! Tu saldo ha sido inicializado correctamente.", is_read=False, owner_id=user.id),
        Notification(message="Has alcanzado el 46.6% de tu presupuesto de Comida.", is_read=False, owner_id=user.id),
    ]
    
    for n in notifications:
        db.add(n)
    db.commit()
    
    print("Base de datos sembrada con éxito.")
