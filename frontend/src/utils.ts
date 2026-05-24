import type { TransactionOut } from "./types";

export function escapeHtml(str: string): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function formatDate(isoString: string): string {
  if (!isoString) return "";
  return new Date(isoString).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function getCategoryIconAndColor(category: string): { icon: string; bg: string; color: string } {
  const lower = category.toLowerCase();
  if (lower.includes("comida") || lower.includes("restaurante") || lower.includes("alimento") || lower.includes("super")) 
    return { icon: "🍔", bg: "rgba(245, 158, 11, 0.12)", color: "#f59e0b" };
  if (lower.includes("transporte") || lower.includes("viaje") || lower.includes("auto") || lower.includes("nafta")) 
    return { icon: "🚗", bg: "rgba(59, 130, 246, 0.12)", color: "#3b82f6" };
  if (lower.includes("servicio") || lower.includes("luz") || lower.includes("agua") || lower.includes("gas") || lower.includes("internet") || lower.includes("tel")) 
    return { icon: "⚡", bg: "rgba(139, 92, 246, 0.12)", color: "#8b5cf6" };
  if (lower.includes("salud") || lower.includes("farmacia") || lower.includes("medico") || lower.includes("clinica")) 
    return { icon: "💊", bg: "rgba(239, 68, 68, 0.12)", color: "#ef4444" };
  if (lower.includes("entretenimiento") || lower.includes("netflix") || lower.includes("cine") || lower.includes("juego") || lower.includes("suscr")) 
    return { icon: "🎬", bg: "rgba(236, 72, 153, 0.12)", color: "#ec4899" };
  if (lower.includes("ahorro") || lower.includes("inversion") || lower.includes("plazo")) 
    return { icon: "📈", bg: "rgba(16, 185, 129, 0.12)", color: "#10b981" };
  return { icon: "🛍️", bg: "rgba(100, 116, 139, 0.12)", color: "#64748b" };
}

export function generateTransactionItemHTML(t: TransactionOut, showActions: boolean = false): string {
  const isIncome = t.type === "income";
  const sign = isIncome ? "+" : "-";
  const cssClass = isIncome ? "positive" : "negative";
  const amountStr = t.amount.toLocaleString("es-AR", { minimumFractionDigits: 2 });
  const catInfo = getCategoryIconAndColor(t.category);
  
  const actionsHtml = showActions ? `
    <div class="txn-actions" style="margin-left: 12px; display: flex; gap: 8px;">
      <button class="btn-icon btn-edit-txn" data-id="${t.id}" title="Editar" style="background:transparent;border:none;cursor:pointer;font-size:14px;opacity:0.7;padding:4px">✏️</button>
      <button class="btn-icon btn-del-txn" data-id="${t.id}" title="Eliminar" style="background:transparent;border:none;cursor:pointer;font-size:14px;opacity:0.7;padding:4px">🗑️</button>
    </div>
  ` : "";

  return `
    <div class="txn-item" data-id="${t.id}">
      <div class="txn-avatar" style="background: ${catInfo.bg}; color: ${catInfo.color};">
        ${catInfo.icon}
      </div>
      <div class="txn-info">
        <div class="txn-name">${escapeHtml(t.description)}</div>
        <div class="txn-meta">${formatDate(t.date)} · ${escapeHtml(t.category)}</div>
      </div>
      <div style="display: flex; align-items: center;">
        <div class="txn-amount ${cssClass}">
          ${sign}$${amountStr}
        </div>
        ${actionsHtml}
      </div>
    </div>
  `;
}

