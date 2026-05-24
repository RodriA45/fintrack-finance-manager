// ─── API SERVICE ─────────────────────────────────────────────────────────────
const API_BASE = "http://localhost:8000";

let _token = localStorage.getItem("ft_token") || "";

function setToken(t) {
  _token = t;
  localStorage.setItem("ft_token", t);
}
function clearToken() {
  _token = "";
  localStorage.removeItem("ft_token");
}
function getToken() { return _token; }

async function apiFetch(path, opts = {}) {
  const headers = { "Content-Type": "application/json" };
  if (_token) headers["Authorization"] = `Bearer ${_token}`;
  const res = await fetch(API_BASE + path, { ...opts, headers });
  if (res.status === 401) { clearToken(); location.reload(); }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw { status: res.status, detail: data.detail || "Error desconocido" };
  return data;
}

// AUTH
const Auth = {
  login:    (email, password) => apiFetch("/auth/login",    { method: "POST", body: JSON.stringify({ email, password }) }),
  register: (full_name, email, password) => apiFetch("/auth/register", { method: "POST", body: JSON.stringify({ full_name, email, password }) }),
};

// ACCOUNTS
const Accounts = {
  list:   ()                    => apiFetch("/api/accounts"),
  create: (name, description)   => apiFetch("/api/accounts",     { method: "POST",   body: JSON.stringify({ name, description }) }),
  update: (id, name, description) => apiFetch(`/api/accounts/${id}`, { method: "PUT", body: JSON.stringify({ name, description }) }),
  remove: (id)                  => apiFetch(`/api/accounts/${id}`, { method: "DELETE" }),
};

// TRANSACTIONS
const Transactions = {
  list:   (params = {})    => apiFetch("/api/transactions?" + new URLSearchParams(params).toString()),
  create: (tx)             => apiFetch("/api/transactions",     { method: "POST",   body: JSON.stringify(tx) }),
  update: (id, tx)         => apiFetch(`/api/transactions/${id}`, { method: "PUT", body: JSON.stringify(tx) }),
  remove: (id)             => apiFetch(`/api/transactions/${id}`, { method: "DELETE" }),
};

// BUDGETS
const Budgets = {
  list:   ()              => apiFetch("/api/budgets"),
  create: (category, monthly_limit) => apiFetch("/api/budgets", { method: "POST", body: JSON.stringify({ category, monthly_limit }) }),
  remove: (id)            => apiFetch(`/api/budgets/${id}`, { method: "DELETE" }),
};

// REPORTS
const Reports = {
  summary:    () => apiFetch("/api/reports/summary"),
  byCategory: () => apiFetch("/api/reports/by-category"),
};

// NOTIFICATIONS
const Notifications = {
  list: ()   => apiFetch("/api/notifications"),
  read: (id) => apiFetch(`/api/notifications/${id}/read`, { method: "PATCH" }),
};
