import { get, patch } from "./api";
import type { NotificationOut } from "../types";

export const getNotifications = (): Promise<NotificationOut[]> =>
  get<NotificationOut[]>("/api/notifications/");

export const markAsRead = (id: number): Promise<NotificationOut> =>
  patch<NotificationOut>(`/api/notifications/${id}/read`);
