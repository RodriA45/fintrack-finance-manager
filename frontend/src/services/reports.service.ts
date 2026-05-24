import { get } from "./api";
import type { MonthlySummary, CategorySummary } from "../types";

export const getMonthlySummary = (month: number, year: number): Promise<MonthlySummary> =>
  get<MonthlySummary>(`/api/reports/summary?month=${month}&year=${year}`);

export const getExpensesByCategory = (month: number, year: number): Promise<CategorySummary> =>
  get<CategorySummary>(`/api/reports/by-category?month=${month}&year=${year}`);
