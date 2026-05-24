// ── Autenticación ─────────────────────────────────────────────────────────────

export interface UserOut {
  id: number;
  email: string;
  full_name: string;
  created_at: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserCreate {
  email: string;
  password: string;
  full_name: string;
}

// ── Cuentas ───────────────────────────────────────────────────────────────────

export interface AccountOut {
  id: number;
  name: string;
  description: string | null;
  balance: number;
  owner_id: number;
  created_at: string;
}

export interface AccountCreate {
  name: string;
  description?: string;
  balance?: number;
}

export interface AccountUpdate {
  name?: string;
  description?: string;
}

// ── Movimientos ───────────────────────────────────────────────────────────────

export type TransactionType = "income" | "expense";

export interface TransactionOut {
  id: number;
  amount: number;
  description: string;
  category: string;
  type: TransactionType;
  date: string;
  account_id: number;
  created_at: string;
}

export interface TransactionCreate {
  amount: number;
  description: string;
  category: string;
  type: TransactionType;
  date: string;
  account_id: number;
}

export interface TransactionUpdate {
  amount?: number;
  description?: string;
  category?: string;
  type?: TransactionType;
  date?: string;
  account_id?: number;
}

// ── Presupuestos ──────────────────────────────────────────────────────────────

export interface BudgetOut {
  id: number;
  category: string;
  limit_amount: number;
  month: number;
  year: number;
  owner_id: number;
  created_at: string;
  spent: number;
  percentage: number;
}

export interface BudgetCreate {
  category: string;
  limit_amount: number;
  month: number;
  year: number;
}

// ── Reportes ──────────────────────────────────────────────────────────────────

export interface MonthlySummary {
  month: number;
  year: number;
  total_income: number;
  total_expense: number;
  net_balance: number;
}

export interface CategoryReport {
  category: string;
  total: number;
  percentage: number;
}

export interface CategorySummary {
  month: number;
  year: number;
  categories: CategoryReport[];
}

// ── Notificaciones ────────────────────────────────────────────────────────────

export interface NotificationOut {
  id: number;
  message: string;
  is_read: boolean;
  owner_id: number;
  created_at: string;
}

// ── Errores de API ────────────────────────────────────────────────────────────

export interface ApiError {
  detail: string;
}
