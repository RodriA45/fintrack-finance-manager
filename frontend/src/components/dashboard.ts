import { getAccounts } from "../services/accounts.service";
import { getTransactions } from "../services/transactions.service";
import { getMonthlySummary, getExpensesByCategory } from "../services/reports.service";
import { getBudgets } from "../services/budgets.service";
import { getNotifications, markAsRead } from "../services/notifications.service";
import { escapeHtml, formatDate, generateTransactionItemHTML } from "../utils";
import type {
  AccountOut,
  TransactionOut,
  MonthlySummary,
  CategorySummary,
  BudgetOut,
  NotificationOut,
} from "../types";

// ── Estado local del dashboard ────────────────────────────────────────────────
let accounts: AccountOut[] = [];
let transactions: TransactionOut[] = [];
let summary: MonthlySummary | null = null;
let categorySummary: CategorySummary | null = null;
let budgets: BudgetOut[] = [];
let notifications: NotificationOut[] = [];
let activeCategoryFilter: string | null = null;


// ── Carga de datos ────────────────────────────────────────────────────────────
export async function loadDashboard(): Promise<void> {
  const now = new Date();
  // RESET state before every load to prevent duplication across re-navigations
  accounts = [];
  transactions = [];
  summary = null;
  categorySummary = null;
  budgets = [];
  notifications = [];
  activeCategoryFilter = null;

  // Render skeleton loaders before fetching data
  renderSkeletonLoaders();

  const filterWrap = document.getElementById("filter-indicator-wrap");
  if (filterWrap) filterWrap.innerHTML = "";

  try {
    [accounts, transactions, summary, categorySummary, budgets, notifications] =
      await Promise.all([
        getAccounts(),
        getTransactions(),
        getMonthlySummary(now.getMonth() + 1, now.getFullYear()),
        getExpensesByCategory(now.getMonth() + 1, now.getFullYear()),
        getBudgets(now.getMonth() + 1, now.getFullYear()),
        getNotifications(),
      ]);

    renderAccounts();
    renderSummary();
    renderTransactions();
    renderBudgets();
    renderNotifications();
    renderCategoryChart();

    // Configurar formularios en los modales rápidos
    const { setupTransactionForm, setupAccountForm } = await import("./forms");
    
    const quickTxForm = document.getElementById("transaction-form") as HTMLFormElement | null;
    const quickAccForm = document.getElementById("account-form") as HTMLFormElement | null;

    if (quickTxForm) {
      const sel = quickTxForm.querySelector<HTMLSelectElement>('[name="account_id"]');
      if (sel) {
        if (accounts.length > 0) {
          sel.innerHTML = accounts.map((a) => `<option value="${a.id}">${escapeHtml(a.name)}</option>`).join("");
        } else {
          sel.innerHTML = `<option value="">Sin cuentas — creá una primero</option>`;
        }
      }
      
      setupTransactionForm(() => {
        document.getElementById("modal-quick-transaction")?.classList.remove("active");
        loadDashboard();
      });
    }

    if (quickAccForm) {
      setupAccountForm(() => {
        document.getElementById("modal-quick-account")?.classList.remove("active");
        loadDashboard();
      });
    }

  } catch (err) {
    console.error("Error cargando dashboard:", err);
    const grid = document.querySelector(".main-grid");
    if (grid) {
      grid.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1; color: var(--danger);">Ocurrió un error al cargar los datos del panel. Por favor, intentá de nuevo más tarde.</div>`;
    }
  }
}

// ── Skeleton Loaders ──────────────────────────────────────────────────────────
function renderSkeletonLoaders(): void {
  const skelCard = `<div class="skeleton skeleton-card"></div>`;
  const skelText = `<div class="skeleton skeleton-text"></div>`;

  const accCont = document.getElementById("accounts-container");
  if (accCont) accCont.innerHTML = skelCard + skelCard;

  const txCont = document.getElementById("transactions-list");
  if (txCont) txCont.innerHTML = skelCard + skelCard + skelCard;

  const bCont = document.getElementById("budgets-list");
  if (bCont) bCont.innerHTML = skelCard + skelCard;

  const nCont = document.getElementById("notifications-list");
  if (nCont) nCont.innerHTML = skelCard + skelCard;

  const leg = document.getElementById("chart-legend");
  if (leg) leg.innerHTML = skelText + skelText + skelText;
}

// ── Renderizado de cuentas ────────────────────────────────────────────────────
function renderAccounts(): void {
  const container = document.getElementById("accounts-container");
  if (!container) return;

  if (accounts.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="width: 100%; padding: 24px; display: flex; flex-direction: column; align-items: center;">
        <span style="font-size:32px; display:block; margin-bottom:8px;">🏦</span>
        <div style="font-weight:600; font-size:13px; color:var(--text-secondary);">No tienes cuentas activas</div>
        <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">Crea una cuenta para comenzar a registrar movimientos</div>
      </div>`;
    return;
  }

  // Icon map for common account names
  const iconMap: Record<string, string> = {
    efectivo: "💵", banco: "🏦", mercado: "📱", ahorro: "🏷️",
    tarjeta: "💳", wallet: "👜", virtual: "📱",
  };
  const getIcon = (name: string): string => {
    const lower = name.toLowerCase();
    for (const [key, icon] of Object.entries(iconMap)) {
      if (lower.includes(key)) return icon;
    }
    return "🪙";
  };

  container.innerHTML = accounts.map((a) => {
    const isNeg = a.balance < 0;
    return `
      <div class="dash-account-card">
        <div class="dash-account-icon">${getIcon(a.name)}</div>
        <div class="dash-account-info">
          <div class="dash-account-name">${escapeHtml(a.name)}</div>
          ${a.description ? `<div class="dash-account-desc">${escapeHtml(a.description)}</div>` : ""}
        </div>
        <div class="dash-account-amount ${isNeg ? "negative" : ""}">
          $${a.balance.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
        </div>
      </div>
    `;
  }).join("");
}

// ── Renderizado del resumen mensual ───────────────────────────────────────────
function renderSummary(): void {
  if (!summary) return;

  const incomeEl = document.getElementById("stat-income");
  if (incomeEl) {
    incomeEl.innerHTML = `$${summary.total_income.toLocaleString("es-AR", { minimumFractionDigits: 2 })} <span class="trend-badge positive" title="Inclinación positiva">↗ +12.3%</span>`;
  }

  const expenseEl = document.getElementById("stat-expense");
  if (expenseEl) {
    expenseEl.innerHTML = `$${summary.total_expense.toLocaleString("es-AR", { minimumFractionDigits: 2 })} <span class="trend-badge negative" title="Inclinación negativa">↘ -4.5%</span>`;
  }
  
  const netEl = document.getElementById("stat-net");
  if (netEl) {
    const sign = summary.net_balance >= 0 ? "" : "-";
    const absVal = Math.abs(summary.net_balance).toLocaleString("es-AR", { minimumFractionDigits: 2 });
    const trendClass = summary.net_balance >= 0 ? "positive" : "negative";
    const trendIcon = summary.net_balance >= 0 ? "↗ +5.4%" : "↘ -2.1%";
    netEl.innerHTML = `${sign}$${absVal} <span class="trend-badge ${trendClass}">${trendIcon}</span>`;
    netEl.className = "m-stat-val " + (summary.net_balance >= 0 ? "positive" : "negative");
  }
}

// ── Renderizado de movimientos recientes ──────────────────────────────────────
function renderTransactions(filter: string = "all"): void {
  const container = document.getElementById("transactions-list");
  if (!container) return;

  let filtered = transactions;
  
  // Filtrar por categoría interactiva
  if (activeCategoryFilter) {
    filtered = transactions.filter((t) => t.category === activeCategoryFilter);
  } else if (filter !== "all") {
    filtered = transactions.filter((t) => t.type === filter);
  }
  
  const recent = filtered.slice(0, 10);

  if (recent.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 32px;">
        <span style="font-size:32px; display:block; margin-bottom:8px;">🔍</span>
        <div style="font-weight:600; font-size:13px; color:var(--text-secondary);">No hay movimientos registrados</div>
        <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">Registra ingresos o egresos para verlos en tu historial</div>
      </div>`;
    return;
  }

  container.innerHTML = recent.map((t) => generateTransactionItemHTML(t)).join("");
}

// ── Renderizado de presupuestos ───────────────────────────────────────────────
function renderBudgets(): void {
  const container = document.getElementById("budgets-list");
  if (!container) return;

  if (budgets.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 24px;">
        <span style="font-size:32px; display:block; margin-bottom:8px;">🎯</span>
        <div style="font-weight:600; font-size:13px; color:var(--text-secondary);">Sin presupuestos este mes</div>
        <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">Establece límites por categoría para cuidar tus gastos</div>
      </div>`;
    return;
  }

  container.innerHTML = budgets
    .map((b) => {
      const pct = Math.min(b.percentage, 100);
      const progressClass = b.percentage >= 100 ? "danger" : b.percentage >= 80 ? "warn" : "ok";
      const alertMsg =
        b.percentage >= 100
          ? "Límite superado"
          : b.percentage >= 80
          ? "Cerca del límite"
          : "";

      const remaining = b.limit_amount - b.spent;
      const remainingText = remaining >= 0 
        ? `Te quedan $${remaining.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` 
        : `Excedido por $${Math.abs(remaining).toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

      return `
      <div class="budget-item">
        <div class="budget-header">
          <span class="budget-name">${escapeHtml(b.category)}</span>
          ${alertMsg ? `<span class="budget-alert ${progressClass}">${alertMsg}</span>` : ""}
          <span class="budget-amounts">
            $${b.spent.toLocaleString("es-AR")} / $${b.limit_amount.toLocaleString("es-AR")}
          </span>
        </div>
        <div class="progress-track">
          <div class="progress-fill ${progressClass}" style="width:${pct}%"></div>
        </div>
        <div class="budget-pct">${b.percentage.toFixed(1)}% utilizado · ${remainingText}</div>
      </div>
    `;
    })
    .join("");
}

// ── Renderizado de notificaciones ─────────────────────────────────────────────
function renderNotifications(): void {
  const container = document.getElementById("notifications-list");
  if (!container) return;

  const unread = notifications.filter((n) => !n.is_read).slice(0, 5);

  if (unread.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 24px;">
        <span style="font-size:32px; display:block; margin-bottom:8px;">🔔</span>
        <div style="font-weight:600; font-size:13px; color:var(--text-secondary);">Sin notificaciones nuevas</div>
        <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">Te avisaremos cuando alcances límites de presupuestos</div>
      </div>`;
    return;
  }

  container.innerHTML = unread
    .map(
      (n) => `
    <div class="notif-item" data-id="${n.id}">
      <div class="notif-dot"></div>
      <div class="notif-body">
        <div class="notif-text">${escapeHtml(n.message)}</div>
        <div class="notif-time">${formatDate(n.created_at)}</div>
      </div>
      <button class="section-action notif-read-btn" data-id="${n.id}">Marcar leída</button>
    </div>
  `
    )
    .join("");

  container.querySelectorAll<HTMLButtonElement>(".notif-read-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = Number(btn.dataset.id);
      await markAsRead(id);
      notifications = notifications.map((n) =>
        n.id === id ? { ...n, is_read: true } : n
      );
      renderNotifications();
    });
  });
}

// ── Gráfico de categorías (canvas simple) ─────────────────────────────────────
function renderCategoryChart(): void {
  const canvas = document.getElementById("category-chart") as HTMLCanvasElement | null;
  if (!canvas || !categorySummary) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const colors = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#3B82F6", "#8B5CF6", "#06B6D4"];
  const data = categorySummary.categories;

  if (data.length === 0) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const legendEl = document.getElementById("chart-legend");
    if (legendEl) {
      legendEl.innerHTML = `
        <div style="text-align:center; color:var(--text-muted); font-size:12px; margin-top:12px;">
          Registra egresos para ver el análisis de categorías.
        </div>`;
    }
    return;
  }

  const total = data.reduce((s, c) => s + c.total, 0);
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const radius = Math.min(cx, cy) - 8;
  const borderColor = getComputedStyle(document.documentElement).getPropertyValue("--bg-card").trim() || "#ffffff";
  
  // Animation variables
  let progress = 0;
  const duration = 800; // ms
  const startTime = performance.now();

  function drawFrame(time: number) {
    const elapsed = time - startTime;
    progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const easeProgress = 1 - Math.pow(1 - progress, 3);

    ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
    let startAngle = -Math.PI / 2;

    data.forEach((cat, i) => {
      const slice = (cat.total / total) * 2 * Math.PI * easeProgress;
      ctx!.beginPath();
      ctx!.moveTo(cx, cy);
      ctx!.arc(cx, cy, radius, startAngle, startAngle + slice);
      ctx!.closePath();
      ctx!.fillStyle = colors[i % colors.length];
      ctx!.fill();
      
      // Clean SaaS slice gap
      ctx!.strokeStyle = borderColor;
      ctx!.lineWidth = 4;
      ctx!.stroke();
      
      startAngle += slice;
    });

    // Hole center
    ctx!.globalCompositeOperation = "destination-out";
    ctx!.beginPath();
    ctx!.arc(cx, cy, radius * 0.52, 0, 2 * Math.PI);
    ctx!.fill();
    
    // Reset to normal drawing and draw brutalist border
    ctx!.globalCompositeOperation = "source-over";
    ctx!.beginPath();
    ctx!.arc(cx, cy, radius * 0.52, 0, 2 * Math.PI);
    ctx!.lineWidth = 3;
    const isDarkChart = document.documentElement.classList.contains("dark-mode");
    ctx!.strokeStyle = isDarkChart ? "rgba(255, 255, 255, 0.1)" : "rgba(15, 23, 42, 0.08)";
    ctx!.stroke();

    if (progress < 1) {
      requestAnimationFrame(drawFrame);
    }
  }

  requestAnimationFrame(drawFrame);

  // Render legend
  const legendEl = document.getElementById("chart-legend");
  if (legendEl) {
    legendEl.innerHTML = data.slice(0, 6).map((c, i) => {
      const isActiveStyle = activeCategoryFilter === c.category 
        ? 'style="background: var(--bg-hover); font-weight:700; border: 1px solid var(--primary); border-radius: 10px;"' 
        : '';
      return `
        <div class="chart-legend-item" data-category="${escapeHtml(c.category)}" ${isActiveStyle}>
          <span class="chart-legend-dot" style="background:${colors[i % colors.length]}"></span>
          <span class="chart-legend-label">${escapeHtml(c.category)}</span>
          <span class="chart-legend-pct">${c.percentage.toFixed(0)}%</span>
        </div>
      `;
    }).join("");

    legendEl.querySelectorAll<HTMLElement>(".chart-legend-item").forEach((item) => {
      item.addEventListener("click", () => {
        const cat = item.dataset.category || null;
        // Toggle filter
        activeCategoryFilter = activeCategoryFilter === cat ? null : cat;
        
        // Re-render components
        renderCategoryChart();
        renderTransactions();
        renderFilterIndicator();
      });
    });
  }
}

// ── Indicador de filtro activo ────────────────────────────────────────────────
function renderFilterIndicator(): void {
  const wrap = document.getElementById("filter-indicator-wrap");
  if (!wrap) return;

  if (!activeCategoryFilter) {
    wrap.innerHTML = "";
    return;
  }

  wrap.innerHTML = `
    <div class="filter-active-bar" style="margin-bottom:0; padding: 4px 12px; font-size:12px; gap:8px;">
      <span>Filtrado: <strong>${escapeHtml(activeCategoryFilter)}</strong></span>
      <button class="btn-clear-filter" id="btn-clear-category-filter">Quitar</button>
    </div>
  `;

  document.getElementById("btn-clear-category-filter")?.addEventListener("click", () => {
    activeCategoryFilter = null;
    renderCategoryChart();
    renderTransactions();
    renderFilterIndicator();
  });
}

export { renderTransactions };
