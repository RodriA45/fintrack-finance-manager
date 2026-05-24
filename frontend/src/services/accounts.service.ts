import { get, post, put, del } from "./api";
import type { AccountOut, AccountCreate, AccountUpdate } from "../types";

export const getAccounts = (): Promise<AccountOut[]> =>
  get<AccountOut[]>("/api/accounts/");

export const createAccount = (data: AccountCreate): Promise<AccountOut> =>
  post<AccountOut>("/api/accounts/", data);

export const updateAccount = (id: number, data: AccountUpdate): Promise<AccountOut> =>
  put<AccountOut>(`/api/accounts/${id}`, data);

export const deleteAccount = (id: number): Promise<void> =>
  del<void>(`/api/accounts/${id}`);
