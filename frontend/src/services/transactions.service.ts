import { get, post, put, del } from "./api";
import type { TransactionOut, TransactionCreate, TransactionUpdate } from "../types";

interface TransactionFilters {
  account_id?: number;
  start_date?: string;
  end_date?: string;
}

export const getTransactions = (filters?: TransactionFilters): Promise<TransactionOut[]> => {
  const params = new URLSearchParams();
  if (filters?.account_id) params.set("account_id", String(filters.account_id));
  if (filters?.start_date) params.set("start_date", filters.start_date);
  if (filters?.end_date) params.set("end_date", filters.end_date);
  const qs = params.toString();
  return get<TransactionOut[]>(`/api/transactions/${qs ? "?" + qs : ""}`);
};

export const createTransaction = (data: TransactionCreate): Promise<TransactionOut> =>
  post<TransactionOut>("/api/transactions/", data);

export const updateTransaction = (id: number, data: TransactionUpdate): Promise<TransactionOut> =>
  put<TransactionOut>(`/api/transactions/${id}`, data);

export const deleteTransaction = (id: number): Promise<void> =>
  del<void>(`/api/transactions/${id}`);
