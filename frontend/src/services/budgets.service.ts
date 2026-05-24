import { get, post } from "./api";
import type { BudgetOut, BudgetCreate } from "../types";

export const getBudgets = (month: number, year: number): Promise<BudgetOut[]> =>
  get<BudgetOut[]>(`/api/budgets/?month=${month}&year=${year}`);

export const createBudget = (data: BudgetCreate): Promise<BudgetOut> =>
  post<BudgetOut>("/api/budgets/", data);
