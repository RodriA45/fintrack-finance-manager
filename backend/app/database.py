from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from app.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False},  # necesario para SQLite
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


# ── Trigger: actualizar saldo de cuenta al insertar un movimiento ──────────────
# Se ejecuta AFTER INSERT ON transactions. Suma el monto si es ingreso,
# lo resta si es egreso. Garantiza integridad del saldo a nivel de BD.
TRIGGER_UPDATE_BALANCE = """
CREATE TRIGGER IF NOT EXISTS update_account_balance
AFTER INSERT ON transactions
BEGIN
    UPDATE accounts
    SET balance = balance +
        CASE WHEN NEW.type = 'income' THEN NEW.amount
             ELSE -NEW.amount END
    WHERE id = NEW.account_id;
END;
"""

# Trigger: restaurar saldo al eliminar un movimiento
TRIGGER_RESTORE_BALANCE = """
CREATE TRIGGER IF NOT EXISTS restore_account_balance_on_delete
AFTER DELETE ON transactions
BEGIN
    UPDATE accounts
    SET balance = balance +
        CASE WHEN OLD.type = 'income' THEN -OLD.amount
             ELSE OLD.amount END
    WHERE id = OLD.account_id;
END;
"""

# Trigger: actualizar saldo al editar un movimiento (revertir viejo y aplicar nuevo)
TRIGGER_EDIT_BALANCE = """
CREATE TRIGGER IF NOT EXISTS update_account_balance_on_edit
AFTER UPDATE ON transactions
BEGIN
    -- 1. Si cambia la cuenta: Revertir en la cuenta vieja
    UPDATE accounts
    SET balance = balance +
        CASE WHEN OLD.type = 'income' THEN -OLD.amount
             ELSE OLD.amount END
    WHERE id = OLD.account_id AND OLD.account_id != NEW.account_id;

    -- 2. Si cambia la cuenta: Aplicar en la cuenta nueva
    UPDATE accounts
    SET balance = balance +
        CASE WHEN NEW.type = 'income' THEN NEW.amount
             ELSE -NEW.amount END
    WHERE id = NEW.account_id AND OLD.account_id != NEW.account_id;

    -- 3. Si es la misma cuenta: Aplicar ambos deltas simultáneamente
    UPDATE accounts
    SET balance = balance +
        (CASE WHEN OLD.type = 'income' THEN -OLD.amount ELSE OLD.amount END) +
        (CASE WHEN NEW.type = 'income' THEN NEW.amount ELSE -NEW.amount END)
    WHERE id = NEW.account_id AND OLD.account_id = NEW.account_id;
END;
"""


@event.listens_for(engine, "connect")
def create_triggers(dbapi_connection, connection_record):
    """Crea los triggers cada vez que se abre una conexión SQLite."""
    cursor = dbapi_connection.cursor()
    try:
        cursor.execute("DROP TRIGGER IF EXISTS update_account_balance_on_edit")
        cursor.execute(TRIGGER_UPDATE_BALANCE)
        cursor.execute(TRIGGER_RESTORE_BALANCE)
        cursor.execute(TRIGGER_EDIT_BALANCE)
    except Exception:
        # Ignorar si las tablas aún no existen (p. ej. durante Base.metadata.create_all)
        pass
    finally:
        cursor.close()


def setup_triggers(bind_engine):
    """Crea explícitamente los triggers en la base de datos."""
    with bind_engine.begin() as conn:
        conn.execute(text("DROP TRIGGER IF EXISTS update_account_balance_on_edit"))
        conn.execute(text(TRIGGER_UPDATE_BALANCE))
        conn.execute(text(TRIGGER_RESTORE_BALANCE))
        conn.execute(text(TRIGGER_EDIT_BALANCE))



def get_db():
    """Dependencia de FastAPI para inyectar la sesión de BD."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
