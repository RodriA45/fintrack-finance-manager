# FinTrack — Sistema Integral de Gestión Financiera

**Trabajo Práctico IV — Programación III**  
Sistema de control de ingresos y egresos con múltiples cuentas, presupuestos, reportes y notificaciones.

---

## Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Backend | Python 3.10+ · FastAPI · Uvicorn |
| Frontend | TypeScript · Vite · CSS puro (sin frameworks) |
| Base de datos | SQLite · SQLAlchemy (ORM) |
| Autenticación | JWT (JSON Web Tokens) |
| Versionado | Git · GitHub |

---

## Características del frontend

- **Diseño glassmorphism premium** — interfaz moderna con tarjetas de vidrio esmerilado y fondos de gradiente animados (Auras de luz).
- **Mini-Demo interactiva en Landing** — simulador de ingresos dinámico con animaciones numéricas (`window.requestAnimationFrame`) y gráficos reactivos en tiempo real.
- **Acciones Rápidas (Quick Actions)** — modales flotantes integrados para registrar movimientos y cuentas sin salir del dashboard.
- **Leyenda Interactiva de Gráficos** — permite filtrar la lista de transacciones del panel simplemente haciendo clic en las categorías de gastos.
- **Alertas de Presupuesto con Shimmer** — indicación de saldo disponible o excedido con animaciones shimmer premium.
- **Modo oscuro / claro** — botón de alternancia persistente en auth y navbar de forma cohesiva.
- **100% responsive** — compatible con celulares, tablets y desktop (menú hamburguesa y colapso de cabeceras en mobile).
- **SPA sin frameworks** — enrutamiento cliente con TypeScript puro.
- **Animaciones fluidas** — transiciones, flotación 3D y micro-interacciones con CSS.

---

## Requisitos previos

### 1. Instalar Python 3.10+

1. Descargá Python desde [python.org/downloads](https://www.python.org/downloads/).
2. En el instalador, marcá **"Add Python to PATH"** antes de continuar.
3. Verificá la instalación:
   ```powershell
   python --version
   ```

### 2. Instalar Node.js 18+

1. Descargá la versión **LTS** desde [nodejs.org](https://nodejs.org/).
2. Ejecutá el instalador con las opciones por defecto.
3. Verificá la instalación:
   ```powershell
   node --version
   npm --version
   ```

### 3. Instalar Git

1. Descargá Git desde [git-scm.com/downloads](https://git-scm.com/downloads).
2. Ejecutá el instalador con las opciones por defecto.
3. Verificá la instalación:
   ```powershell
   git --version
   ```

---

## Instalación y ejecución

### Backend

```bash
# 1. Ir a la carpeta backend
cd backend

# 2. Crear el entorno virtual
python -m venv venv

# 3. Activar el entorno virtual
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Windows CMD:
.\venv\Scripts\activate.bat
# Linux / macOS:
source venv/bin/activate

# 4. Instalar dependencias
pip install -r requirements.txt

# 5. Crear archivo de configuración
# Windows PowerShell:
Copy-Item .env.example .env
# Linux / macOS / CMD:
cp .env.example .env

# 6. Iniciar el servidor
uvicorn app.main:app --reload
```

- **API:** http://localhost:8000  
- **Documentación interactiva (Swagger):** http://localhost:8000/docs

---

### Frontend

> ⚠️ La carpeta `node_modules/` **no se sube a GitHub**. Hay que instalar dependencias manualmente luego de clonar.

```bash
# 1. Ir a la carpeta frontend
cd frontend

# 2. Instalar dependencias (solo la primera vez)
npm install

# 3. Iniciar servidor de desarrollo
npm run dev
```

- **Frontend:** http://localhost:5173

---

### Scripts de Inicio Rápido en Windows (.bat)

Para hacer que la experiencia de desarrollo sea lo más simple posible, el repositorio incluye dos scripts automáticos listos para usar en Windows. Solo necesitás hacer doble clic sobre ellos desde el explorador de archivos:

1. **`setup.bat` (Instalación)**: Ejecutá este archivo **por única vez** luego de descargar o clonar el repositorio. El script se encarga de:
   - Crear y activar el entorno virtual de Python.
   - Instalar las librerías del Backend (`requirements.txt`).
   - Generar tu archivo `.env` base para la base de datos y JWT.
   - Descargar e instalar los paquetes de Node.js del Frontend (`npm install`).

2. **`start.bat` (Arranque)**: Usá este archivo cada vez que quieras trabajar en el proyecto. 
   - Automáticamente abre dos ventanas de consola en paralelo: una corriendo el servidor backend con `uvicorn` y otra con el frontend de Vite.

> 💡 **Tip:** ¡Con solo un doble clic en `start.bat` ya tenés todo el sistema corriendo! Accedé luego a **[http://localhost:5173](http://localhost:5173)** en tu navegador.

---

## Credenciales de prueba

Para ingresar con datos precargados (cuentas, presupuestos y movimientos de ejemplo):

| Campo | Valor |
|-------|-------|
| Email | `test@fintrack.com` |
| Contraseña | `password123` |

---

## Variables de entorno

Crear `backend/.env` a partir de `backend/.env.example`. El archivo `.env` **nunca debe subirse al repositorio** (está en `.gitignore`).

---

## Arquitectura en capas (Backend)

```
backend/app/
├── routers/    → Reciben el request HTTP y devuelven la response
├── services/   → Toda la lógica de negocio
├── models/     → Modelos ORM de SQLAlchemy
└── schemas/    → Esquemas Pydantic (validación y serialización)
```

---

## Triggers SQLite e Integridad Base de Datos

El backend implementa triggers a nivel de base de datos SQLite para mantener la integridad absoluta de los saldos al realizar operaciones con transacciones (Ingresos o Egresos):

1. **`update_account_balance_insert`** (Al insertar una transacción):
   ```sql
   CREATE TRIGGER update_account_balance_insert
   AFTER INSERT ON transactions
   BEGIN
       UPDATE accounts
       SET balance = balance +
           CASE WHEN NEW.type = 'income' THEN NEW.amount
                ELSE -NEW.amount END
       WHERE id = NEW.account_id;
   END;
   ```
2. **`update_account_balance_delete`** (Al borrar una transacción): Restablece el saldo restando o sumando el monto según corresponda.
3. **`update_account_balance_update`** (Al actualizar una transacción): Calcula la diferencia neta y ajusta el saldo de la cuenta automáticamente.

> 🛠️ **Inicialización Segura**: Se corrigió el flujo de arranque de SQLAlchemy. Los triggers se registran de forma explícita e inmediata tras la creación de tablas en `main.py`, resolviendo problemas de inicio en bases de datos vacías.

---

## Endpoints de la API

| Método | Ruta | Auth requerida |
|--------|------|:--------------:|
| POST | `/auth/register` | No |
| POST | `/auth/login` | No |
| GET | `/api/accounts` | JWT |
| POST | `/api/accounts` | JWT |
| PUT | `/api/accounts/{id}` | JWT |
| DELETE | `/api/accounts/{id}` | JWT |
| GET | `/api/transactions` | JWT |
| POST | `/api/transactions` | JWT |
| PUT | `/api/transactions/{id}` | JWT |
| DELETE | `/api/transactions/{id}` | JWT |
| GET | `/api/budgets` | JWT |
| POST | `/api/budgets` | JWT |
| GET | `/api/reports/summary` | JWT |
| GET | `/api/reports/by-category` | JWT |
| GET | `/api/notifications` | JWT |
| PATCH | `/api/notifications/{id}/read` | JWT |
