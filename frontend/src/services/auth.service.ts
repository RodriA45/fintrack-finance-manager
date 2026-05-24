import { post } from "./api";
import type { LoginRequest, UserCreate, UserOut } from "../types";

export function isAuthenticated(): boolean {
  // Ahora la seguridad la maneja la cookie en el backend.
  // Este flag es solo para decidir rápido qué pantalla mostrar en el router frontend.
  return localStorage.getItem("is_logged_in") === "1";
}

export async function login(data: LoginRequest): Promise<void> {
  await post("/auth/login", data);
  localStorage.setItem("is_logged_in", "1");
}

export async function register(data: UserCreate): Promise<UserOut> {
  return post<UserOut>("/auth/register", data);
}

export async function logout(): Promise<void> {
  try {
    await post("/auth/logout", {});
  } catch (err) {
    // Ignore network errors on logout
  }
  localStorage.removeItem("is_logged_in");
  window.location.href = "/login";
}
