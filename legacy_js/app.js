// ─── FINTRACK APP ─────────────────────────────────────────────────────────────
// State
let state = { accounts: [], transactions: [], budgets: [], notifications: [], user: null, txType: "income" };
const fmt = (n) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 2 }).format(n || 0);
const today = () => new Date().toISOString().split("T")[0];
const COLORS = ["#b4ff64","#c4b5ff","#64ffda","#ff7b7b","#ffc850","#7b9cff","#ff9f64","#64c4ff","#ff64b4","#a0ff64"];
const CAT_ICONS = { Comida:"🍔", Transporte:"🚗", Entretenimiento:"🎮", Salud:"💊", Educación:"📚", Ropa:"👕", Servicios:"💡", Sueldo:"💼", Freelance:"💻", Otros:"📦" };

// ─── INIT ───────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  if (getToken()) showApp();
  else             showAuth();
  bindAuthEvents();
  bindNavEvents();
  bindModalEvents();
});

// ─── AUTH ────────────────────────────────────────────────────────────────────
function showAuth() {
  document.getElementById("auth-screen").classList.remove("hidden");
  document.getElementById("app").classList.add("hidden");
}
function showApp() {
  document.getElementById("auth-screen").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");
  loadAll();
}

function bindAuthEvents() {
  document.getElementById("go-register").addEventListener("click", e => { e.preventDefault(); toggleForms(true); });
  document.getElementById("go-login").addEventListener("click", e => { e.preventDefault(); toggleForms(false); });

  document.getElementById("btn-login").addEventListener("click", async () => {
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    const err = document.getElementById("auth-error");
    if (!email || !password) { showErr(err, "Completá todos los campos"); return; }
    try {
      const res = await Auth.login(email, password);
      setToken(res.access_token);
      state.user = res.user || { full_name: email.split("@")[0] };
      showApp();
    } catch (e) { showErr(err, e.detail || "Error al iniciar sesión"); }
  });

  document.getElementById("btn-register").addEventListener("click", async () => {
    const name  = document.getElementById("reg-name").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const pass  = document.getElementById("reg-password").value;
    const err   = document.getElementById("reg-error");
    if (!name || !email || !pass) { showErr(err, "Completá todos los campos"); return; }
    if (pass.length < 8) { showErr(err, "La contraseña debe tener al menos 8 caracteres"); return; }
    try {
      await Auth.register(name, email, pass);
      const res = await Auth.login(email, pass);
      setToken(res.access_token);
      state.user = { full_name: name };
      showApp();
    } catch (e) { showErr(err, e.detail || "Error al registrarse"); }
  });

  document.getElementById("btn-logout").addEventListener("click", () => {
    clearToken(); state = { accounts:[], transactions:[], budgets:[], notifications:[], user:null, txType:"income" };
    showAuth();
  });
}

function toggleForms(showReg) {
  document.getElementById("login-form").classList.toggle("hidden", showReg);
  document.getElementById("register-form").classList.toggle("hidden", !showReg);
}
function showErr(el, msg) { el.textContent = msg; el.classList.remove("hidden"); }
function hideErr(el) { el.classList.add("hidden"); }

// ─── NAV ─────────────────────────────────────────────────────────────────────
function bindNavEvents() {
  document.querySelectorAll(".nav-item, .link-sm[data-page]").forEach(a => {
    a.addEventListener("click", e => {
      e.preventDefault();
      navigateTo(a.dataset.page);
    });
  });
}

function navigateTo(page) {
  document.querySelectorAll(".nav-item").forEach(a => a.classList.toggle("active", a.dataset.page === page));
  document.querySelectorAll(".page").forEach(p => p.classList.toggle("active", p.id === `page-${page}`));
  if (page === "dashboard") renderDashboard();
  if (page === "transactions") renderTransactionsFull();
  if (page === "accounts") renderAccountsPage();
  if (page === "budgets") renderBudgetsPage();
  if (page === "reports") renderReportsPage();
}

// ─── LOAD DATA ───────────────────────────────────────────────────────────────
async function loadAll() {
  setGreeting();
  try {
    const [accs, txs, budgets, notifs] = await Promise.all([
      Accounts.list(), Transactions.list(), Budgets.list(), Notifications.list()
    ]);
    state.accounts     = accs;
    state.transactions = txs;
    state.budgets      = budgets;
    state.notifications = notifs.filter(n => !n.is_read);
    if (state.user) {
      document.getElementById("user-name-display").textContent = state.user.full_name || "Usuario";
      document.getElementById("user-avatar").textContent = (state.user.full_name || "U")[0].toUpperCase();
    }
    renderDashboard();
    renderNotifications();
  } catch (e) { console.error("Error cargando datos:", e); }
}

function setGreeting() {
  const h = new Date().getHours();
  const g = h < 12 ? "Buenos días" : h < 18 ? "Buenas tardes" : "Buenas noches";
  document.getElementById("greeting").textContent = g;
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
function renderDashboard() {
  renderStats();
  renderPieChart();
  renderRecentTransactions();
  renderAccountsSummary();
  renderBudgetPreview();
}

function renderStats() {
  const now = new Date();
  const thisMonth = state.transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const income   = thisMonth.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expenses = thisMonth.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const total    = state.accounts.reduce((s, a) => s + (a.balance || 0), 0);
  const net      = income - expenses;

  document.getElementById("stat-total").textContent    = fmt(total);
  document.getElementById("stat-income").textContent   = fmt(income);
  document.getElementById("stat-expenses").textContent = fmt(expenses);
  document.getElementById("stat-net").textContent      = fmt(net);
  document.getElementById("stat-net").className        = "stat-value " + (net >= 0 ? "green" : "red");
}

function renderPieChart() {
  const canvas = document.getElementById("pie-chart");
  const legend = document.getElementById("chart-legend");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const now = new Date();
  const expenses = state.transactions.filter(t => {
    const d = new Date(t.date);
    return t.type === "expense" && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const byCategory = {};
  expenses.forEach(t => { byCategory[t.category] = (byCategory[t.category] || 0) + t.amount; });
  const entries = Object.entries(byCategory).sort((a,b) => b[1]-a[1]);
  const total   = entries.reduce((s,[,v]) => s+v, 0);
  ctx.clearRect(0, 0, 260, 260);
  if (!entries.length) {
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.beginPath(); ctx.arc(130, 130, 100, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.15)"; ctx.font = "13px DM Sans"; ctx.textAlign = "center";
    ctx.fillText("Sin gastos este mes", 130, 135);
    legend.innerHTML = "";
    return;
  }
  let startAngle = -Math.PI / 2;
  entries.forEach(([cat, val], i) => {
    const slice = (val / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(130, 130);
    ctx.arc(130, 130, 110, startAngle, startAngle + slice);
    ctx.closePath();
    ctx.fillStyle = COLORS[i % COLORS.length];
    ctx.fill();
    ctx.strokeStyle = "rgba(8,11,20,0.8)"; ctx.lineWidth = 2; ctx.stroke();
    startAngle += slice;
  });
  // donut hole
  ctx.beginPath(); ctx.arc(130, 130, 55, 0, Math.PI*2);
  ctx.fillStyle = "#080b14"; ctx.fill();

  legend.innerHTML = entries.slice(0,6).map(([cat, val], i) =>
    `<div class="legend-item">
       <div class="legend-dot" style="background:${COLORS[i % COLORS.length]}"></div>
       <span class="legend-label">${cat}</span>
       <span class="legend-pct">${((val/total)*100).toFixed(0)}%</span>
     </div>`).join("");
}

function renderRecentTransactions() {
  const list = document.getElementById("recent-list");
  const recent = [...state.transactions].sort((a,b) => new Date(b.date)-new Date(a.date)).slice(0, 5);
  if (!recent.length) { list.innerHTML = '<div class="empty-state">Sin movimientos aún</div>'; return; }
  list.innerHTML = recent.map(txCard).join("");
  bindTxActions(list);
}

function txCard(t) {
  const acc = state.accounts.find(a => a.id === t.account_id);
  const icon = CAT_ICONS[t.category] || "📦";
  const dateStr = new Date(t.date).toLocaleDateString("es-AR", { day:"2-digit", month:"short" });
  return `<div class="tx-item" data-id="${t.id}">
    <div class="tx-icon ${t.type}">${icon}</div>
    <div class="tx-info">
      <div class="tx-cat">${t.category}</div>
      <div class="tx-desc">${t.description || acc?.name || "—"}</div>
    </div>
    <div class="tx-right">
      <div class="tx-amount ${t.type}">${t.type==="income" ? "+" : "-"}${fmt(t.amount)}</div>
      <div class="tx-date">${dateStr}</div>
    </div>
    <div class="tx-actions">
      <button class="tx-action-btn edit-tx" data-id="${t.id}" title="Editar">✏️</button>
      <button class="tx-action-btn del delete-tx" data-id="${t.id}" title="Eliminar">🗑</button>
    </div>
  </div>`;
}

function bindTxActions(container) {
  container.querySelectorAll(".edit-tx").forEach(b => b.addEventListener("click", () => openEditTx(+b.dataset.id)));
  container.querySelectorAll(".delete-tx").forEach(b => b.addEventListener("click", () => deleteTx(+b.dataset.id)));
}

function renderAccountsSummary() {
  const el = document.getElementById("accounts-summary");
  if (!state.accounts.length) { el.innerHTML = '<div class="empty-state">Sin cuentas creadas</div>'; return; }
  el.innerHTML = state.accounts.map(a => {
    const cls = (a.balance||0) > 0 ? "positive" : (a.balance||0) < 0 ? "negative" : "zero";
    return `<div class="acc-row">
      <div><div class="acc-row-name">${a.name}</div><div class="acc-row-desc">${a.description||""}</div></div>
      <div class="acc-row-balance ${cls}">${fmt(a.balance||0)}</div>
    </div>`;
  }).join("");
}

function renderBudgetPreview() {
  const el = document.getElementById("budget-preview");
  if (!state.budgets.length) { el.innerHTML = '<div class="empty-state">Sin presupuestos</div>'; return; }
  const now = new Date();
  const spent = {};
  state.transactions.filter(t => {
    const d = new Date(t.date);
    return t.type === "expense" && d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear();
  }).forEach(t => { spent[t.category] = (spent[t.category]||0) + t.amount; });

  el.innerHTML = state.budgets.map(b => {
    const used = spent[b.category] || 0;
    const pct  = Math.min((used / b.monthly_limit) * 100, 100);
    const cls  = pct >= 100 ? "over" : pct >= 80 ? "warn" : "";
    return `<div class="budget-item">
      <div class="budget-header">
        <span class="budget-cat">${CAT_ICONS[b.category]||"📦"} ${b.category}</span>
        <span class="budget-amounts">${fmt(used)} / ${fmt(b.monthly_limit)}</span>
      </div>
      <div class="budget-bar"><div class="budget-fill ${cls}" style="width:${pct}%"></div></div>
      <div class="budget-pct">${pct.toFixed(0)}%</div>
    </div>`;
  }).join("");
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
function renderNotifications() {
  const bar = document.getElementById("notifications-bar");
  if (!state.notifications.length) { bar.classList.add("hidden"); return; }
  bar.classList.remove("hidden");
  bar.innerHTML = state.notifications.map(n =>
    `<div class="notif-item ${n.type||''}" data-id="${n.id}">
       <span>${n.message}</span>
       <button class="notif-read-btn" data-id="${n.id}">Marcar leída</button>
     </div>`).join("");
  bar.querySelectorAll(".notif-read-btn").forEach(b => b.addEventListener("click", async () => {
    await Notifications.read(+b.dataset.id).catch(()=>{});
    state.notifications = state.notifications.filter(n => n.id !== +b.dataset.id);
    renderNotifications();
  }));
}

// ─── TRANSACTIONS PAGE ────────────────────────────────────────────────────────
function renderTransactionsFull(filtered) {
  const list = document.getElementById("tx-list-full");
  const data = (filtered || state.transactions).sort((a,b) => new Date(b.date)-new Date(a.date));
  if (!data.length) { list.innerHTML = '<div class="empty-state">Sin movimientos</div>'; return; }
  list.innerHTML = data.map(txCard).join("");
  bindTxActions(list);
  populateAccountFilter();
}

function populateAccountFilter() {
  const sel = document.getElementById("filter-account");
  const cur = sel.value;
  sel.innerHTML = '<option value="">Todas las cuentas</option>' +
    state.accounts.map(a => `<option value="${a.id}" ${a.id==cur?'selected':''}>${a.name}</option>`).join("");
}

// ─── ACCOUNTS PAGE ────────────────────────────────────────────────────────────
function renderAccountsPage() {
  const grid = document.getElementById("accounts-grid");
  if (!state.accounts.length) { grid.innerHTML = '<div class="empty-state">Sin cuentas aún</div>'; return; }
  grid.innerHTML = state.accounts.map(a => {
    const cls = (a.balance||0) > 0 ? "positive" : (a.balance||0) < 0 ? "negative" : "zero";
    return `<div class="acc-card glass">
      <div class="acc-card-name">${a.name}</div>
      <div class="acc-card-desc">${a.description||"Sin descripción"}</div>
      <div class="acc-card-balance ${cls}">${fmt(a.balance||0)}</div>
      <div class="acc-card-actions">
        <button class="btn-icon edit-acc" data-id="${a.id}" title="Editar">✏️</button>
        <button class="btn-icon del delete-acc" data-id="${a.id}" title="Eliminar">🗑</button>
      </div>
    </div>`;
  }).join("");
  document.querySelectorAll(".edit-acc").forEach(b => b.addEventListener("click", () => openEditAccount(+b.dataset.id)));
  document.querySelectorAll(".delete-acc").forEach(b => b.addEventListener("click", () => deleteAccount(+b.dataset.id)));
}

// ─── BUDGETS PAGE ─────────────────────────────────────────────────────────────
function renderBudgetsPage() {
  const el = document.getElementById("budgets-list");
  if (!state.budgets.length) { el.innerHTML = '<div class="empty-state">Sin presupuestos configurados</div>'; return; }
  const now = new Date();
  const spent = {};
  state.transactions.filter(t => {
    const d = new Date(t.date);
    return t.type==="expense" && d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear();
  }).forEach(t => { spent[t.category] = (spent[t.category]||0) + t.amount; });

  el.innerHTML = state.budgets.map(b => {
    const used = spent[b.category]||0;
    const pct  = (used / b.monthly_limit) * 100;
    const cls  = pct >= 100 ? "over" : pct >= 80 ? "warn" : "";
    const alert = pct >= 100 ? `<div class="budget-alert over">⚠️ Límite superado</div>` :
                  pct >= 80  ? `<div class="budget-alert warn">⚡ Cerca del límite</div>` : "";
    return `<div class="budget-full-card glass-sm">
      <div class="budget-full-header">
        <div class="budget-full-cat">${CAT_ICONS[b.category]||"📦"} ${b.category}</div>
        <div class="budget-full-actions">
          <button class="btn-icon del delete-budget" data-id="${b.id}" title="Eliminar">🗑</button>
        </div>
      </div>
      <div class="budget-header">
        <span style="color:var(--text-secondary);font-size:13px">Gastado: ${fmt(used)}</span>
        <span style="color:var(--text-muted);font-size:13px">Límite: ${fmt(b.monthly_limit)}</span>
      </div>
      <div class="budget-bar" style="height:8px;margin:10px 0">
        <div class="budget-fill ${cls}" style="width:${Math.min(pct,100)}%"></div>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between">
        <span class="budget-pct" style="text-align:left">${pct.toFixed(1)}% utilizado</span>
        ${alert}
      </div>
    </div>`;
  }).join("");
  document.querySelectorAll(".delete-budget").forEach(b => b.addEventListener("click", () => deleteBudget(+b.dataset.id)));
}

// ─── REPORTS PAGE ─────────────────────────────────────────────────────────────
async function renderReportsPage() {
  try {
    const [summary, byCat] = await Promise.all([Reports.summary(), Reports.byCategory()]);
    const sumEl = document.getElementById("report-summary");
    sumEl.innerHTML = `
      <div class="report-row"><span class="report-row-label">Total ingresado</span><span class="report-row-value green">${fmt(summary.total_income)}</span></div>
      <div class="report-row"><span class="report-row-label">Total egresado</span><span class="report-row-value red">${fmt(summary.total_expenses)}</span></div>
      <div class="report-row"><span class="report-row-label">Balance neto</span><span class="report-row-value ${summary.net_balance>=0?'green':'red'}">${fmt(summary.net_balance)}</span></div>
      <div class="report-row"><span class="report-row-label">Movimientos</span><span class="report-row-value">${summary.transaction_count||0}</span></div>
    `;
    const catEl = document.getElementById("report-categories");
    const maxVal = Math.max(...Object.values(byCat), 1);
    catEl.innerHTML = Object.entries(byCat).sort((a,b)=>b[1]-a[1]).map(([cat, val]) =>
      `<div class="report-cat-item">
         <span class="report-cat-name">${CAT_ICONS[cat]||"📦"} ${cat}</span>
         <div class="report-cat-bar"><div class="report-cat-fill" style="width:${(val/maxVal*100).toFixed(0)}%"></div></div>
         <span class="report-cat-amount">${fmt(val)}</span>
       </div>`).join("") || '<div class="empty-state">Sin datos</div>';
  } catch { }
}

// ─── MODALS ───────────────────────────────────────────────────────────────────
function bindModalEvents() {
  // Open
  document.getElementById("btn-new-tx").addEventListener("click", () => openTxModal());
  document.getElementById("btn-new-tx2").addEventListener("click", () => openTxModal());
  document.getElementById("btn-new-account").addEventListener("click", () => openAccountModal());
  document.getElementById("btn-new-budget").addEventListener("click", () => openBudgetModal());

  // Close overlay
  document.getElementById("modal-overlay").addEventListener("click", e => {
    if (e.target === document.getElementById("modal-overlay")) closeAllModals();
  });

  // Data-close buttons
  document.querySelectorAll("[data-close]").forEach(b => b.addEventListener("click", () => closeAllModals()));

  // Toggle income/expense
  document.querySelectorAll(".toggle-btn").forEach(b => b.addEventListener("click", () => {
    document.querySelectorAll(".toggle-btn").forEach(x => x.classList.remove("active"));
    b.classList.add("active");
    state.txType = b.dataset.type;
  }));

  // Filters
  document.getElementById("btn-filter").addEventListener("click", applyFilters);
  document.getElementById("btn-clear-filter").addEventListener("click", () => {
    document.getElementById("filter-account").value = "";
    document.getElementById("filter-type").value = "";
    document.getElementById("filter-from").value = "";
    document.getElementById("filter-to").value = "";
    renderTransactionsFull();
  });

  // Save handlers
  document.getElementById("btn-save-tx").addEventListener("click", saveTx);
  document.getElementById("btn-save-account").addEventListener("click", saveAccount);
  document.getElementById("btn-save-budget").addEventListener("click", saveBudget);
}

function openTxModal(tx) {
  const modal = document.getElementById("modal-transaction");
  document.getElementById("tx-id").value = tx?.id || "";
  document.getElementById("modal-tx-title").textContent = tx ? "Editar movimiento" : "Nuevo movimiento";
  document.getElementById("tx-amount").value = tx?.amount || "";
  document.getElementById("tx-category").value = tx?.category || "Comida";
  document.getElementById("tx-date").value = tx?.date?.split("T")[0] || today();
  document.getElementById("tx-description").value = tx?.description || "";

  // Set type toggle
  const t = tx?.type || "income";
  state.txType = t;
  document.querySelectorAll(".toggle-btn").forEach(b => b.classList.toggle("active", b.dataset.type === t));

  // Populate account select
  const sel = document.getElementById("tx-account");
  sel.innerHTML = state.accounts.map(a => `<option value="${a.id}" ${a.id==tx?.account_id?'selected':''}>${a.name}</option>`).join("");
  if (!state.accounts.length) sel.innerHTML = '<option value="">Sin cuentas — crea una primero</option>';

  hideErr(document.getElementById("tx-error"));
  showModal("modal-transaction");
}

function openAccountModal(acc) {
  document.getElementById("acc-id").value = acc?.id || "";
  document.getElementById("modal-acc-title").textContent = acc ? "Editar cuenta" : "Nueva cuenta";
  document.getElementById("acc-name").value = acc?.name || "";
  document.getElementById("acc-desc").value = acc?.description || "";
  hideErr(document.getElementById("acc-error"));
  showModal("modal-account");
}

function openBudgetModal() {
  document.getElementById("budget-limit").value = "";
  hideErr(document.getElementById("budget-error"));
  showModal("modal-budget");
}

function openEditTx(id) {
  const tx = state.transactions.find(t => t.id === id);
  if (tx) openTxModal(tx);
}
function openEditAccount(id) {
  const acc = state.accounts.find(a => a.id === id);
  if (acc) openAccountModal(acc);
}

function showModal(id) {
  document.getElementById("modal-overlay").classList.remove("hidden");
  document.getElementById(id).classList.remove("hidden");
}
function closeAllModals() {
  document.getElementById("modal-overlay").classList.add("hidden");
  document.querySelectorAll(".modal").forEach(m => m.classList.add("hidden"));
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────
async function saveTx() {
  const err = document.getElementById("tx-error");
  const id  = document.getElementById("tx-id").value;
  const amount = parseFloat(document.getElementById("tx-amount").value);
  const category = document.getElementById("tx-category").value;
  const date = document.getElementById("tx-date").value;
  const account_id = parseInt(document.getElementById("tx-account").value);
  const description = document.getElementById("tx-description").value.trim();

  if (!amount || amount <= 0) { showErr(err, "El monto debe ser mayor a 0"); return; }
  if (!date) { showErr(err, "Seleccioná una fecha"); return; }
  if (date > today()) { showErr(err, "No se permiten fechas futuras"); return; }
  if (!account_id) { showErr(err, "Seleccioná una cuenta"); return; }

  const payload = { type: state.txType, amount: parseFloat(amount.toFixed(2)), category, date, account_id, description };
  try {
    if (id) {
      const updated = await Transactions.update(+id, payload);
      state.transactions = state.transactions.map(t => t.id === +id ? updated : t);
    } else {
      const created = await Transactions.create(payload);
      state.transactions.unshift(created);
    }
    const updatedAccs = await Accounts.list();
    state.accounts = updatedAccs;
    closeAllModals();
    loadAll();
  } catch (e) { showErr(err, e.detail || "Error al guardar"); }
}

async function deleteTx(id) {
  if (!confirm("¿Eliminar este movimiento?")) return;
  try {
    await Transactions.remove(id);
    state.transactions = state.transactions.filter(t => t.id !== id);
    state.accounts = await Accounts.list();
    renderDashboard();
    renderTransactionsFull();
  } catch (e) { alert(e.detail || "Error al eliminar"); }
}

async function saveAccount() {
  const err  = document.getElementById("acc-error");
  const id   = document.getElementById("acc-id").value;
  const name = document.getElementById("acc-name").value.trim();
  const desc = document.getElementById("acc-desc").value.trim();

  if (!name) { showErr(err, "El nombre es obligatorio"); return; }
  if (name.length > 50) { showErr(err, "Máximo 50 caracteres"); return; }

  try {
    if (id) {
      const updated = await Accounts.update(+id, name, desc);
      state.accounts = state.accounts.map(a => a.id === +id ? updated : a);
    } else {
      const created = await Accounts.create(name, desc);
      state.accounts.push(created);
    }
    closeAllModals();
    renderAccountsPage();
    renderAccountsSummary();
  } catch (e) { showErr(err, e.detail || "Error al guardar cuenta"); }
}

async function deleteAccount(id) {
  if (!confirm("¿Eliminar esta cuenta? Solo es posible si no tiene movimientos.")) return;
  try {
    await Accounts.remove(id);
    state.accounts = state.accounts.filter(a => a.id !== id);
    renderAccountsPage();
    renderAccountsSummary();
  } catch (e) { alert(e.detail || "No se puede eliminar: tiene movimientos asociados"); }
}

async function saveBudget() {
  const err   = document.getElementById("budget-error");
  const cat   = document.getElementById("budget-category").value;
  const limit = parseFloat(document.getElementById("budget-limit").value);

  if (!limit || limit <= 0) { showErr(err, "El límite debe ser mayor a 0"); return; }
  if (state.budgets.find(b => b.category === cat)) { showErr(err, "Ya existe un presupuesto para esa categoría"); return; }

  try {
    const created = await Budgets.create(cat, parseFloat(limit.toFixed(2)));
    state.budgets.push(created);
    closeAllModals();
    renderBudgetsPage();
    renderBudgetPreview();
  } catch (e) { showErr(err, e.detail || "Error al guardar presupuesto"); }
}

async function deleteBudget(id) {
  if (!confirm("¿Eliminar este presupuesto?")) return;
  try {
    await Budgets.remove(id);
    state.budgets = state.budgets.filter(b => b.id !== id);
    renderBudgetsPage();
    renderBudgetPreview();
  } catch (e) { alert(e.detail || "Error al eliminar"); }
}

// ─── FILTERS ─────────────────────────────────────────────────────────────────
function applyFilters() {
  const accId = document.getElementById("filter-account").value;
  const type  = document.getElementById("filter-type").value;
  const from  = document.getElementById("filter-from").value;
  const to    = document.getElementById("filter-to").value;

  let filtered = [...state.transactions];
  if (accId) filtered = filtered.filter(t => t.account_id === +accId);
  if (type)  filtered = filtered.filter(t => t.type === type);
  if (from)  filtered = filtered.filter(t => t.date >= from);
  if (to)    filtered = filtered.filter(t => t.date <= to);
  renderTransactionsFull(filtered);
}
