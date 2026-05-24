import { isAuthenticated, logout } from "./services/auth.service";
import { getAccounts, deleteAccount } from "./services/accounts.service";
import { getTransactions, deleteTransaction } from "./services/transactions.service";
import { getBudgets } from "./services/budgets.service";
import { getMonthlySummary, getExpensesByCategory } from "./services/reports.service";
import { getNotifications, markAsRead } from "./services/notifications.service";
import { loadDashboard } from "./components/dashboard";
import { renderLandingPage } from "./components/landing";
import { setupLoginForm, setupRegisterForm, setupTransactionForm, setupBudgetForm, setupAccountForm } from "./components/forms";
import { escapeHtml as escTx, generateTransactionItemHTML } from "./utils";

import "../styles.css";
import "./landing.css";

// ── Router SPA mínimo ─────────────────────────────────────────────────────────
type Page = "landing" | "login" | "register" | "dashboard" | "transactions" | "accounts" | "budgets" | "reports" | "notifications";

function navigate(page: Page): void {
  if (!isAuthenticated() && page !== "login" && page !== "register" && page !== "landing") {
    renderLandingPage(navigate, setupThemeToggle);
    return;
  }
  switch (page) {
    case "landing":
      renderLandingPage(navigate, setupThemeToggle);
      break;
    case "login":       renderLogin(); break;
    case "register":    renderRegister(); break;
    case "dashboard":   renderDashboard(); break;
    case "transactions":renderTransactions(); break;
    case "accounts":    renderAccounts(); break;
    case "budgets":     renderBudgets(); break;
    case "reports":     renderReports(); break;
    case "notifications": renderNotifications(); break;
  }
}

// ── Páginas ───────────────────────────────────────────────────────────────────
function renderLogin(): void {
  document.getElementById("app")!.innerHTML = `
    <div class="auth-wrap">
      <div class="auth-bg-grid"></div>
      <button class="theme-toggle" id="auth-theme-toggle" title="Cambiar tema">🌙</button>
      <button class="btn-ghost" id="btn-back-login" style="position: absolute; top: 24px; left: 24px; z-index: 10;">&larr; Volver</button>
      <div class="auth-card">
        <div class="auth-logo">
          <div class="auth-logo-icon">💎</div>
          Fin<span>Track</span>
        </div>
        <h2>Bienvenido de vuelta</h2>
        <p class="auth-subtitle">Ingresá tus credenciales para continuar</p>
        <form id="login-form" autocomplete="on">
          <div class="form-group">
            <label class="form-label">Email</label>
            <div class="form-input-wrap">
              <span class="form-input-icon">✉️</span>
              <input class="form-input" type="email" name="email" placeholder="tu@email.com" autocomplete="email">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Contraseña</label>
            <div class="form-input-wrap">
              <span class="form-input-icon">🔒</span>
              <input class="form-input" type="password" name="password" id="login-pass" placeholder="••••••••" autocomplete="current-password">
              <button type="button" class="input-eye" id="toggle-login-pass">👁️</button>
            </div>
          </div>
          <button class="btn-auth" type="submit">Iniciar sesión →</button>
        </form>
        <p class="auth-switch">¿No tenés cuenta? <a href="#" id="go-register">Registrate gratis</a></p>
      </div>
    </div>
  `;
  setupLoginForm(() => navigate("dashboard"));
  document.getElementById("go-register")?.addEventListener("click", (e) => {
    e.preventDefault();
    navigate("register");
  });
  // Password visibility toggle
  document.getElementById("toggle-login-pass")?.addEventListener("click", () => {
    const inp = document.getElementById("login-pass") as HTMLInputElement;
    inp.type = inp.type === "password" ? "text" : "password";
  });
  document.getElementById("btn-back-login")?.addEventListener("click", () => navigate("landing"));
  setupThemeToggle("auth-theme-toggle");
}

function renderRegister(): void {
  document.getElementById("app")!.innerHTML = `
    <div class="auth-wrap">
      <div class="auth-bg-grid"></div>
      <button class="theme-toggle" id="auth-theme-toggle" title="Cambiar tema">🌙</button>
      <button class="btn-ghost" id="btn-back-register" style="position: absolute; top: 24px; left: 24px; z-index: 10;">&larr; Volver</button>
      <div class="auth-card">
        <div class="auth-logo">
          <div class="auth-logo-icon">💎</div>
          Fin<span>Track</span>
        </div>
        <h2>Crear una cuenta</h2>
        <p class="auth-subtitle">Empezá a gestionar tus finanzas hoy mismo</p>
        <form id="register-form" autocomplete="on">
          <div class="form-group">
            <label class="form-label">Nombre completo</label>
            <div class="form-input-wrap">
              <span class="form-input-icon">👤</span>
              <input class="form-input" type="text" name="full_name" placeholder="Tu nombre completo" autocomplete="name">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <div class="form-input-wrap">
              <span class="form-input-icon">✉️</span>
              <input class="form-input" type="email" name="email" placeholder="tu@email.com" autocomplete="email">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Contraseña</label>
            <div class="form-input-wrap">
              <span class="form-input-icon">🔒</span>
              <input class="form-input" type="password" name="password" id="reg-pass" placeholder="Mínimo 8 caracteres" autocomplete="new-password">
              <button type="button" class="input-eye" id="toggle-reg-pass">👁️</button>
            </div>
          </div>
          <button class="btn-auth" type="submit">Crear cuenta →</button>
        </form>
        <p class="auth-switch">¿Ya tenés cuenta? <a href="#" id="go-login">Iniciá sesión</a></p>
      </div>
    </div>
  `;
  setupRegisterForm(() => navigate("login"));
  document.getElementById("go-login")?.addEventListener("click", (e) => {
    e.preventDefault();
    navigate("login");
  });
  document.getElementById("toggle-reg-pass")?.addEventListener("click", () => {
    const inp = document.getElementById("reg-pass") as HTMLInputElement;
    inp.type = inp.type === "password" ? "text" : "password";
  });
  document.getElementById("btn-back-register")?.addEventListener("click", () => navigate("landing"));
  setupThemeToggle("auth-theme-toggle");
}

function renderDashboard(): void {
  document.getElementById("app")!.innerHTML = getAppShell("Dashboard", `
    <!-- Hero: balance total + stats en una fila visual unificada -->
    <div class="m-stat-row" style="margin-bottom: 20px;">
      <div class="m-stat" style="background: var(--bg-card); box-shadow: var(--shadow-sm);">
        <div class="m-stat-title" style="color: var(--text-muted); font-size: 12px; font-weight: 600; letter-spacing: 0.5px;">BALANCE TOTAL</div>
        <div class="m-stat-val" id="stat-net" style="font-size: 32px;">-</div>
      </div>
      <div class="m-stat" style="background: var(--bg-card); box-shadow: var(--shadow-sm);">
        <div class="m-stat-title" style="color: var(--text-muted); font-size: 12px; font-weight: 600; letter-spacing: 0.5px;">INGRESOS</div>
        <div class="m-stat-val positive" id="stat-income" style="font-size: 24px;">-</div>
      </div>
      <div class="m-stat" style="background: var(--bg-card); box-shadow: var(--shadow-sm);">
        <div class="m-stat-title" style="color: var(--text-muted); font-size: 12px; font-weight: 600; letter-spacing: 0.5px;">EGRESOS</div>
        <div class="m-stat-val negative" id="stat-expense" style="font-size: 24px;">-</div>
      </div>
    </div>
    
    <div class="section-header" style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
      <span class="section-title" style="font-size: 18px; font-weight: 600;">Cuentas Activas</span>
      <div style="display: flex; gap: 8px;">
        <button class="btn-quick" id="btn-quick-transaction" style="padding: 6px 12px; font-size: 12px; border-radius: 8px;">
          <span>➕</span> Movimiento
        </button>
        <button class="btn-quick" id="btn-quick-account" style="padding: 6px 12px; font-size: 12px; border-radius: 8px;">
          <span>🏦</span> Nueva Cuenta
        </button>
      </div>
    </div>
    <div class="dash-accounts-strip" id="accounts-container" style="margin-bottom: 24px; display: flex; gap: 16px; overflow-x: auto; padding-bottom: 8px;"></div>

    <!-- Grid principal -->
    <div class="main-grid">
      <!-- Columna Izquierda (Movimientos + Presupuestos) -->
      <div style="display: flex; flex-direction: column; gap: 20px;">
        <div class="glass-card dash-txn-card" style="margin-bottom: 0;">
          <div class="section-header" style="display:flex; justify-content:space-between; align-items:center;">
            <span class="section-title" style="font-size: 18px; font-weight: 600;">Movimientos recientes</span>
            <div id="filter-indicator-wrap"></div>
          </div>
          <div id="transactions-list" class="txn-list"></div>
        </div>
        <div class="glass-card" style="margin-bottom: 0;">
          <div class="section-header"><span class="section-title" style="font-size: 18px; font-weight: 600;">Presupuestos</span></div>
          <div id="budgets-list" class="budget-list"></div>
        </div>
      </div>

      <!-- Columna Derecha (Gráfico + Alertas) -->
      <div class="dash-sidebar-col" style="display: flex; flex-direction: column; gap: 20px;">
        <div class="glass-card dash-chart-card" style="margin-bottom: 0;">
          <div class="section-header"><span class="section-title" style="font-size: 18px; font-weight: 600;">Gastos por categoría</span></div>
          <div class="dash-chart-wrap" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 12px 0;">
            <canvas id="category-chart" width="200" height="200"></canvas>
            <div id="chart-legend" class="chart-legend" style="margin-top: 16px; width: 100%;"></div>
          </div>
        </div>
        <div class="glass-card" style="margin-bottom: 0;">
          <div class="section-header"><span class="section-title" style="font-size: 18px; font-weight: 600;">Alertas</span></div>
          <div id="notifications-list"></div>
        </div>
      </div>
    </div>

    <!-- Quick Transaction Modal -->
    <div class="modal-overlay" id="modal-quick-transaction">
      <div class="modal-card">
        <button class="modal-close-btn" id="btn-close-txn-modal">&times;</button>
        <h3 style="margin-bottom:20px;font-size:16px;font-weight:700;">Registrar Movimiento</h3>
        <form id="transaction-form">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">TIPO</label>
              <div style="display:flex;gap:8px">
                <label style="cursor:pointer"><input type="radio" name="type" value="income" checked> Ingreso</label>
                <label style="cursor:pointer"><input type="radio" name="type" value="expense"> Egreso</label>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">MONTO</label>
              <input class="form-input" type="number" name="amount" placeholder="0.00" step="0.01" min="0.01">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">DESCRIPCIÓN</label>
            <input class="form-input" type="text" name="description" placeholder="Ej: Supermercado">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">CATEGORÍA</label>
              <select class="form-input" name="category">
                <option value="Comida">Comida</option>
                <option value="Transporte">Transporte</option>
                <option value="Entretenimiento">Entretenimiento</option>
                <option value="Salud">Salud</option>
                <option value="Servicios">Servicios</option>
                <option value="Salario">Salario</option>
                <option value="Otros">Otros</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">CUENTA</label>
              <select class="form-input" name="account_id">
                <option value="">Cargando cuentas...</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">FECHA</label>
              <input class="form-input" type="date" name="date">
            </div>
          </div>
          <button class="btn-primary" type="submit" style="margin-top:12px;">Guardar movimiento</button>
        </form>
      </div>
    </div>

    <!-- Quick Account Modal -->
    <div class="modal-overlay" id="modal-quick-account">
      <div class="modal-card">
        <button class="modal-close-btn" id="btn-close-acc-modal">&times;</button>
        <h3 style="margin-bottom:20px;font-size:16px;font-weight:700;">Nueva Cuenta</h3>
        <form id="account-form">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">NOMBRE</label>
              <input class="form-input" type="text" name="name" placeholder="Ej: Ahorros">
            </div>
            <div class="form-group">
              <label class="form-label">DESCRIPCIÓN (opcional)</label>
              <input class="form-input" type="text" name="description" placeholder="Descripción">
            </div>
          </div>
          <button class="btn-primary" type="submit" style="margin-top:12px;">Crear cuenta</button>
        </form>
      </div>
    </div>
  `);

  setupNav("dashboard");

  // Configurar apertura/cierre de modales
  const openModal = (id: string) => {
    document.getElementById(id)?.classList.add("active");
    // Setear fecha máxima hoy en el input del modal rápido
    const dateInput = document.querySelector<HTMLInputElement>('#modal-quick-transaction [name="date"]');
    if (dateInput) dateInput.max = new Date().toISOString().split("T")[0];
  };
  const closeModal = (id: string) => {
    document.getElementById(id)?.classList.remove("active");
  };

  document.getElementById("btn-quick-transaction")?.addEventListener("click", () => openModal("modal-quick-transaction"));
  document.getElementById("btn-quick-account")?.addEventListener("click", () => openModal("modal-quick-account"));

  document.getElementById("btn-close-txn-modal")?.addEventListener("click", () => closeModal("modal-quick-transaction"));
  document.getElementById("btn-close-acc-modal")?.addEventListener("click", () => closeModal("modal-quick-account"));

  // Cerrar modales al hacer clic fuera del modal-card
  document.querySelectorAll<HTMLElement>(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        closeModal(overlay.id);
      }
    });
  });

  loadDashboard();
}

// Las utilidades de formato ahora se importan desde utils.ts

function renderTransactions(): void {
  document.getElementById("app")!.innerHTML = getAppShell("Movimientos", `
    <div class="glass-card" style="padding:24px;margin-bottom:20px">
      <h3 style="margin-bottom:16px;font-size:15px">Nuevo movimiento</h3>
      <form id="transaction-form">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">TIPO</label>
            <div style="display:flex;gap:8px">
              <label style="cursor:pointer"><input type="radio" name="type" value="income" checked> Ingreso</label>
              <label style="cursor:pointer"><input type="radio" name="type" value="expense"> Egreso</label>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">MONTO</label>
            <input class="form-input" type="number" name="amount" placeholder="0.00" step="0.01" min="0.01">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">DESCRIPCIÓN</label>
          <input class="form-input" type="text" name="description" placeholder="Ej: Supermercado">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">CATEGORÍA</label>
            <select class="form-input" name="category">
              <option value="Comida">Comida</option>
              <option value="Transporte">Transporte</option>
              <option value="Entretenimiento">Entretenimiento</option>
              <option value="Salud">Salud</option>
              <option value="Servicios">Servicios</option>
              <option value="Salario">Salario</option>
              <option value="Otros">Otros</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">CUENTA</label>
            <select class="form-input" name="account_id">
              <option value="">Cargando cuentas...</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">FECHA</label>
            <input class="form-input" type="date" name="date">
          </div>
        </div>
        <button class="btn-primary" type="submit">Guardar movimiento</button>
      </form>
    </div>
    <div class="glass-card">
      <div class="section-header" style="display:flex; justify-content:space-between; align-items:center;">
        <span class="section-title">Historial</span>
        <div class="txn-filter" style="font-size:13px; display:flex; gap:8px;">
          <label><input type="radio" name="hist-filter" value="all" checked> Todos</label>
          <label><input type="radio" name="hist-filter" value="income"> Ingresos</label>
          <label><input type="radio" name="hist-filter" value="expense"> Egresos</label>
        </div>
      </div>
      <div id="transactions-list" class="txn-list"><div class="loading-container"><div class="spinner"></div>Cargando movimientos...</div></div>
    </div>
  `);
  setupNav("transactions");

  // Setear fecha máxima = hoy
  const dateInput = document.querySelector<HTMLInputElement>('[name="date"]');
  if (dateInput) dateInput.max = new Date().toISOString().split("T")[0];

  let currentTxns: import("./types").TransactionOut[] = [];

  const renderTxList = (): void => {
    const list = document.getElementById("transactions-list");
    if (!list) return;
    
    const filterEl = document.querySelector<HTMLInputElement>('input[name="hist-filter"]:checked');
    const filter = filterEl ? filterEl.value : "all";
    const filtered = filter === "all" ? currentTxns : currentTxns.filter(t => t.type === filter);

    if (filtered.length === 0) {
      list.innerHTML = `<div class="empty-state">No hay movimientos para este filtro</div>`;
      return;
    }
    list.innerHTML = filtered.slice(0, 50).map(t => generateTransactionItemHTML(t, true)).join("");
  };

  document.querySelectorAll('input[name="hist-filter"]').forEach(el => {
    el.addEventListener("change", renderTxList);
  });

  document.getElementById("transactions-list")?.addEventListener("click", async (e) => {
    const target = e.target as HTMLElement;
    
    if (target.closest(".btn-del-txn")) {
      const btn = target.closest(".btn-del-txn") as HTMLButtonElement;
      const id = Number(btn.dataset.id);
      if (confirm("¿Estás seguro de eliminar este movimiento? (Esta acción revertirá tu saldo)")) {
        try {
          await deleteTransaction(id);
          currentTxns = currentTxns.filter(t => t.id !== id);
          renderTxList();
          // Update account select options silently
          getAccounts().then(accounts => {
            const sel = document.querySelector<HTMLSelectElement>('[name="account_id"]');
            if (sel && accounts.length > 0) {
              const currentVal = sel.value;
              sel.innerHTML = accounts.map((a) => `<option value="${a.id}">${escTx(a.name)}</option>`).join("");
              sel.value = currentVal;
            }
          });
        } catch (err) {
          alert("Error al eliminar el movimiento: " + (err instanceof Error ? err.message : "desconocido"));
        }
      }
    } else if (target.closest(".btn-edit-txn")) {
      const btn = target.closest(".btn-edit-txn") as HTMLButtonElement;
      const id = Number(btn.dataset.id);
      const tx = currentTxns.find(t => t.id === id);
      if (tx) {
        const form = document.getElementById("transaction-form") as HTMLFormElement;
        form.dataset.editId = String(tx.id);
        const btnSubmit = form.querySelector('button[type="submit"]');
        if (btnSubmit) btnSubmit.textContent = "Actualizar movimiento";
        
        const typeEl = form.querySelector(`input[name="type"][value="${tx.type}"]`) as HTMLInputElement;
        if (typeEl) typeEl.checked = true;
        
        (form.querySelector('[name="amount"]') as HTMLInputElement).value = String(tx.amount);
        (form.querySelector('[name="description"]') as HTMLInputElement).value = tx.description;
        (form.querySelector('[name="category"]') as HTMLSelectElement).value = tx.category;
        (form.querySelector('[name="account_id"]') as HTMLSelectElement).value = String(tx.account_id);
        (form.querySelector('[name="date"]') as HTMLInputElement).value = tx.date.split("T")[0];
        
        form.scrollIntoView({ behavior: "smooth" });
      }
    }
  });

  Promise.all([
    getAccounts(),
    getTransactions(),
  ]).then(([accounts, txns]) => {
    const sel = document.querySelector<HTMLSelectElement>('[name="account_id"]');
    if (sel && accounts.length > 0) {
      sel.innerHTML = accounts.map((a) => `<option value="${a.id}">${escTx(a.name)}</option>`).join("");
    } else if (sel) {
      sel.innerHTML = `<option value="">Sin cuentas — creá una primero</option>`;
    }
    currentTxns = txns;
    renderTxList();
  }).catch(() => {
    const list = document.getElementById("transactions-list");
    if (list) list.innerHTML = `<div class="empty-state">Error al cargar movimientos</div>`;
  });

  setupTransactionForm(() => {
    getTransactions().then(txns => { currentTxns = txns; renderTxList(); }).catch(console.error);
    getAccounts().then(accounts => {
        const sel = document.querySelector<HTMLSelectElement>('[name="account_id"]');
        if (sel && accounts.length > 0) {
          const currentVal = sel.value;
          sel.innerHTML = accounts.map((a) => `<option value="${a.id}">${escTx(a.name)}</option>`).join("");
          if(currentVal) sel.value = currentVal;
        }
    });
  });
}

function renderAccounts(): void {
  document.getElementById("app")!.innerHTML = getAppShell("Cuentas", `
    <div class="glass-card" style="padding:24px;margin-bottom:20px">
      <h3 style="margin-bottom:16px;font-size:15px">Nueva cuenta</h3>
      <form id="account-form">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">NOMBRE</label>
            <input class="form-input" type="text" name="name" placeholder="Ej: Ahorros">
          </div>
          <div class="form-group">
            <label class="form-label">DESCRIPCIÓN (opcional)</label>
            <input class="form-input" type="text" name="description" placeholder="Descripción">
          </div>
        </div>
        <button class="btn-primary" type="submit">Crear cuenta</button>
      </form>
    </div>
    <div id="accounts-grid" class="accounts-grid">
      <div class="loading-container" style="grid-column: 1 / -1;"><div class="spinner"></div>Cargando cuentas...</div>
    </div>
  `);
  setupNav("accounts");

  let currentAccounts: import("./types").AccountOut[] = [];

  const loadAccounts = (): void => {
    getAccounts().then((accounts) => {
      currentAccounts = accounts;
      const grid = document.getElementById("accounts-grid");
      if (!grid) return;
      if (accounts.length === 0) {
        grid.innerHTML = `<div class="empty-state">No tenés cuentas. ¡Creá una!</div>`;
        return;
      }
      grid.innerHTML = accounts.map((a) => `
        <div class="glass-card account-card" data-id="${a.id}">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div class="account-card-name">${escTx(a.name)}</div>
            <div style="display:flex; gap:4px;">
              <button class="btn-icon btn-edit-acc" data-id="${a.id}" title="Editar" style="background:transparent;border:none;cursor:pointer;font-size:14px;opacity:0.7;">✏️</button>
              <button class="btn-icon btn-del-acc" data-id="${a.id}" title="Eliminar" style="background:transparent;border:none;cursor:pointer;font-size:14px;opacity:0.7;">🗑️</button>
            </div>
          </div>
          <div class="account-card-balance">$${a.balance.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</div>
          ${a.description ? `<div class="account-card-desc">${escTx(a.description)}</div>` : ""}
        </div>
      `).join("");
    }).catch(() => {
      const grid = document.getElementById("accounts-grid");
      if (grid) grid.innerHTML = `<div class="empty-state">Error al cargar cuentas</div>`;
    });
  };

  document.getElementById("accounts-grid")?.addEventListener("click", async (e) => {
    const target = e.target as HTMLElement;
    if (target.closest(".btn-del-acc")) {
      const btn = target.closest(".btn-del-acc") as HTMLButtonElement;
      const id = Number(btn.dataset.id);
      if (confirm("¿Estás seguro de eliminar esta cuenta? Se perderá todo su historial.")) {
        try {
          await deleteAccount(id);
          loadAccounts();
        } catch (err) {
          alert("Error al eliminar la cuenta: " + (err instanceof Error ? err.message : "desconocido"));
        }
      }
    } else if (target.closest(".btn-edit-acc")) {
      const btn = target.closest(".btn-edit-acc") as HTMLButtonElement;
      const id = Number(btn.dataset.id);
      const acc = currentAccounts.find(a => a.id === id);
      if (acc) {
        const form = document.getElementById("account-form") as HTMLFormElement;
        form.dataset.editId = String(acc.id);
        const btnSubmit = form.querySelector('button[type="submit"]');
        if (btnSubmit) btnSubmit.textContent = "Actualizar cuenta";
        
        (form.querySelector('[name="name"]') as HTMLInputElement).value = acc.name;
        (form.querySelector('[name="description"]') as HTMLInputElement).value = acc.description || "";
        
        form.scrollIntoView({ behavior: "smooth" });
      }
    }
  });

  loadAccounts();
  setupAccountForm(loadAccounts);
}

function renderBudgets(): void {
  const now = new Date();
  document.getElementById("app")!.innerHTML = getAppShell("Presupuestos", `
    <div class="glass-card" style="padding:24px;margin-bottom:20px">
      <h3 style="margin-bottom:16px;font-size:15px">Nuevo presupuesto</h3>
      <form id="budget-form">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">CATEGORÍA</label>
            <select class="form-input" name="category">
              <option value="Comida">Comida</option>
              <option value="Transporte">Transporte</option>
              <option value="Entretenimiento">Entretenimiento</option>
              <option value="Salud">Salud</option>
              <option value="Servicios">Servicios</option>
              <option value="Otros">Otros</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">LÍMITE ($)</label>
            <input class="form-input" type="number" name="limit_amount" placeholder="50000" min="1" step="0.01">
          </div>
          <div class="form-group">
            <label class="form-label">MES</label>
            <input class="form-input" type="number" name="month" value="${now.getMonth() + 1}" min="1" max="12">
          </div>
          <div class="form-group">
            <label class="form-label">AÑO</label>
            <input class="form-input" type="number" name="year" value="${now.getFullYear()}" min="2020">
          </div>
        </div>
        <button class="btn-primary" type="submit">Crear presupuesto</button>
      </form>
    </div>
    <div class="glass-card">
      <div class="section-header"><span class="section-title">Presupuestos del mes</span></div>
      <div id="budgets-list" class="budget-list"></div>
    </div>
  `);
  setupNav("budgets");

  const loadBudgets = (): void => {
    getBudgets(now.getMonth() + 1, now.getFullYear()).then((budgets) => {
      const list = document.getElementById("budgets-list");
      if (!list) return;
      if (budgets.length === 0) {
        list.innerHTML = `<div class="empty-state">No hay presupuestos este mes</div>`;
        return;
      }
      list.innerHTML = budgets.map((b) => {
        const pct = Math.min(b.percentage, 100);
        const cls = b.percentage >= 100 ? "danger" : b.percentage >= 80 ? "warn" : "ok";
        return `
          <div class="budget-item">
            <div class="budget-header">
              <span class="budget-name">${escTx(b.category)}</span>
              <span class="budget-amounts">$${b.spent.toLocaleString("es-AR")} / $${b.limit_amount.toLocaleString("es-AR")}</span>
            </div>
            <div class="progress-track"><div class="progress-fill ${cls}" style="width:${pct}%"></div></div>
            <div class="budget-pct">${b.percentage.toFixed(1)}% utilizado</div>
          </div>`;
      }).join("");
    }).catch(() => {
      const list = document.getElementById("budgets-list");
      if (list) list.innerHTML = `<div class="empty-state">Error al cargar presupuestos</div>`;
    });
  };

  loadBudgets();
  setupBudgetForm(loadBudgets);
}

function renderReports(): void {
  const now = new Date();
  document.getElementById("app")!.innerHTML = getAppShell("Reportes", `
    <div id="reports-content">
      <div class="glass-card" style="padding:24px;margin-bottom:20px">
        <div class="stat-label" style="margin-bottom:8px">RESUMEN MENSUAL — ${now.toLocaleDateString("es-AR", { month: "long", year: "numeric" }).toUpperCase()}</div>
        <div class="stats-row">
          <div class="stat-card glass-card"><div class="stat-label">TOTAL INGRESADO</div><div class="stat-value positive" id="rep-income"><div class="spinner" style="width:16px;height:16px;border-width:2px"></div></div></div>
          <div class="stat-card glass-card"><div class="stat-label">TOTAL EGRESADO</div><div class="stat-value negative" id="rep-expense"><div class="spinner" style="width:16px;height:16px;border-width:2px"></div></div></div>
          <div class="stat-card glass-card"><div class="stat-label">BALANCE NETO</div><div class="stat-value" id="rep-net"><div class="spinner" style="width:16px;height:16px;border-width:2px"></div></div></div>
        </div>
      </div>
      <div class="glass-card">
        <div class="section-header"><span class="section-title">Gastos por categoría</span></div>
        <div id="rep-categories" style="padding:16px"></div>
      </div>
    </div>
  `);
  setupNav("reports");

  Promise.all([
    getMonthlySummary(now.getMonth() + 1, now.getFullYear()),
    getExpensesByCategory(now.getMonth() + 1, now.getFullYear()),
  ]).then(([summary, catSummary]) => {
    const fmt = (n: number): string => `$${n.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`;
    // FIX: null-safe access + dynamic color for net balance
    const incEl = document.getElementById("rep-income");
    const expEl = document.getElementById("rep-expense");
    const netEl = document.getElementById("rep-net");
    if (incEl) incEl.textContent = fmt(summary.total_income);
    if (expEl) expEl.textContent = fmt(summary.total_expense);
    if (netEl) {
      netEl.textContent = fmt(summary.net_balance);
      netEl.className = "stat-value " + (summary.net_balance >= 0 ? "positive" : "negative");
    }

    const catEl = document.getElementById("rep-categories");
    if (catEl) {
      if (catSummary.categories.length === 0) {
        catEl.innerHTML = `<div class="empty-state">Sin egresos este mes</div>`;
      } else {
        catEl.innerHTML = catSummary.categories.map((c) => `
          <div style="margin-bottom:14px">
            <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:13px">
              <span>${escTx(c.category)}</span>
              <span><strong>${fmt(c.total)}</strong> <span style="color:var(--text-dim)">(${c.percentage.toFixed(1)}%)</span></span>
            </div>
            <div class="progress-track" style="height:8px">
              <div class="progress-fill ok" style="width:${Math.min(c.percentage, 100)}%"></div>
            </div>
          </div>
        `).join("");
      }
    }
  }).catch(() => {
    ["rep-income", "rep-expense", "rep-net"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = "Error al cargar";
    });
  });
}

function renderNotifications(): void {
  document.getElementById("app")!.innerHTML = getAppShell("Notificaciones", `
    <div class="glass-card">
      <div class="section-header">
        <span class="section-title">Centro de notificaciones</span>
        <button class="section-action" id="mark-all-btn">Marcar todas leídas</button>
      </div>
      <div id="notifications-list"></div>
    </div>
  `);
  setupNav("notifications");

  getNotifications().then((notifs) => {
    // FIX: XSS escape message text; also add .catch() for network errors
    const renderList = (list: typeof notifs): void => {
      const el = document.getElementById("notifications-list");
      if (!el) return;
      if (list.length === 0) {
        el.innerHTML = `<div class="empty-state" style="padding:20px">Sin notificaciones</div>`;
        return;
      }
      el.innerHTML = list.map((n) => `
        <div class="notif-item ${n.is_read ? "read" : ""}" data-id="${n.id}">
          <div class="notif-dot" style="background:${n.is_read ? "var(--text-muted)" : "var(--primary)"}"></div>
          <div class="notif-body">
            <div class="notif-text">${escTx(n.message)}</div>
            <div class="notif-time">${new Date(n.created_at).toLocaleString("es-AR")}</div>
          </div>
          ${!n.is_read ? `<button class="section-action notif-read-btn" data-id="${n.id}">Leída</button>` : ""}
        </div>
      `).join("");

      el.querySelectorAll<HTMLButtonElement>(".notif-read-btn").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const id = Number(btn.dataset.id);
          await markAsRead(id);
          notifs = notifs.map((n) => (n.id === id ? { ...n, is_read: true } : n));
          renderList(notifs);
        });
      });
    };

    renderList(notifs);

    document.getElementById("mark-all-btn")?.addEventListener("click", async () => {
      const unread = notifs.filter((n) => !n.is_read);
      await Promise.all(unread.map((n) => markAsRead(n.id)));
      notifs = notifs.map((n) => ({ ...n, is_read: true }));
      renderList(notifs);
    });
  }).catch(() => {
    const el = document.getElementById("notifications-list");
    if (el) el.innerHTML = `<div class="empty-state">Error al cargar notificaciones</div>`;
  });
}

// ── Shell de la aplicación (sidebar + topbar) ─────────────────────────────────

// ── Theme toggle helper ───────────────────────────────────────────────────────
function applyTheme(): void {
  const isDark = localStorage.getItem("theme") === "dark";
  document.documentElement.classList.toggle("dark-mode", isDark);
  document.querySelectorAll<HTMLElement>(".theme-toggle, .sidebar-theme-toggle, .topbar-theme-btn").forEach(btn => {
    btn.textContent = isDark ? "☀️" : "🌙";
  });
}

function setupThemeToggle(id: string): void {
  applyTheme();
  document.getElementById(id)?.addEventListener("click", () => {
    const isDark = document.documentElement.classList.toggle("dark-mode");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    document.querySelectorAll<HTMLElement>(".theme-toggle, .sidebar-theme-toggle").forEach(btn => {
      btn.textContent = isDark ? "☀️" : "🌙";
    });
  });
}

function getAppShell(title: string, content: string): string {
  return `
    <div class="app">
      <button class="mobile-menu-btn" id="mobile-menu-btn">☰</button>
      <div class="sidebar-overlay" id="sidebar-overlay"></div>
      <aside class="sidebar" id="main-sidebar">
        <div class="sidebar-brand">
          <div class="sidebar-logo-icon">💎</div>
          <span class="sidebar-brand-name">Fin<em>Track</em></span>
        </div>

        <nav class="nav-section">
          <div class="nav-group-label">MENÚ</div>
          <a class="nav-item" data-page="dashboard">
            <span class="nav-icon">⊞</span>
            <span class="nav-label">Dashboard</span>
          </a>
          <a class="nav-item" data-page="transactions">
            <span class="nav-icon">⇄</span>
            <span class="nav-label">Movimientos</span>
          </a>
          <a class="nav-item" data-page="accounts">
            <span class="nav-icon">◉</span>
            <span class="nav-label">Cuentas</span>
          </a>
          <a class="nav-item" data-page="budgets">
            <span class="nav-icon">◎</span>
            <span class="nav-label">Presupuestos</span>
          </a>
          <a class="nav-item" data-page="reports">
            <span class="nav-icon">↗</span>
            <span class="nav-label">Reportes</span>
          </a>
          <a class="nav-item" data-page="notifications">
            <span class="nav-icon">◌</span>
            <span class="nav-label">Notificaciones</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <button class="logout-btn" id="logout-btn">
            <span class="nav-icon">⎋</span>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      <main class="main">
        <div class="topbar">
          <div class="page-title">${title}</div>
          <div class="topbar-right">
            <button class="topbar-theme-btn" id="topbar-theme-btn" title="Cambiar tema">🌙</button>
          </div>
        </div>
        <div class="content">${content}</div>
      </main>
    </div>
  `;
}

function setupNav(current: string): void {
  // Mobile sidebar references
  const sidebar = document.getElementById("main-sidebar");
  const overlay = document.getElementById("sidebar-overlay");

  const closeSidebar = (): void => {
    sidebar?.classList.remove("open");
    overlay?.classList.remove("active");
  };

  // FIX: single forEach — set active class AND attach listeners in one pass
  document.querySelectorAll<HTMLElement>(".nav-item[data-page]").forEach((el) => {
    el.classList.toggle("active", el.dataset.page === current);
    el.addEventListener("click", () => {
      closeSidebar();
      navigate(el.dataset.page as Page);
    });
  });

  document.getElementById("logout-btn")?.addEventListener("click", () => {
    closeSidebar();
    logout();
    navigate("login");
  });

  // Mobile hamburger
  document.getElementById("mobile-menu-btn")?.addEventListener("click", () => {
    sidebar?.classList.add("open");
    overlay?.classList.add("active");
  });
  overlay?.addEventListener("click", closeSidebar);

  // Apply saved theme and hook ALL theme toggles (sidebar + topbar)
  applyTheme();
  const toggleTheme = (): void => {
    const isDark = document.documentElement.classList.toggle("dark-mode");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    document.querySelectorAll<HTMLElement>(".sidebar-theme-toggle, .topbar-theme-btn").forEach(btn => {
      btn.textContent = isDark ? "☀️" : "🌙";
    });
  };
  document.getElementById("topbar-theme-btn")?.addEventListener("click", toggleTheme);
}

// ── Arranque ──────────────────────────────────────────────────────────────// ── Arranque ──
navigate(isAuthenticated() ? "dashboard" : "landing");
