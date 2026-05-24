import { validateTransaction, validateAccount, validateBudget, validateLogin, validateRegister } from "./validation";
import { createTransaction } from "../services/transactions.service";
import { createAccount } from "../services/accounts.service";
import { createBudget } from "../services/budgets.service";
import { login, register } from "../services/auth.service";
import type { TransactionType } from "../types";

// ── Mostrar errores de validación bajo cada campo ─────────────────────────────
function showFieldErrors(errors: Record<string, string>): void {
  document.querySelectorAll(".field-error").forEach((el) => el.remove());
  Object.entries(errors).forEach(([field, msg]) => {
    const input = document.querySelector<HTMLElement>(`[name="${field}"]`);
    if (!input) return;
    const errorEl = document.createElement("span");
    errorEl.className = "field-error";
    errorEl.textContent = msg;
    input.after(errorEl);
  });
}

function clearFieldErrors(): void {
  document.querySelectorAll(".field-error").forEach((el) => el.remove());
}

// ── Formulario: nuevo movimiento ──────────────────────────────────────────────
export function setupTransactionForm(onSuccess: () => void): void {
  const form = document.getElementById("transaction-form") as HTMLFormElement | null;
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFieldErrors();

    const raw = {
      amount: (form.querySelector<HTMLInputElement>('[name="amount"]')?.value ?? "").trim(),
      description: (form.querySelector<HTMLInputElement>('[name="description"]')?.value ?? "").trim(),
      category: (form.querySelector<HTMLSelectElement>('[name="category"]')?.value ?? "").trim(),
      date: (form.querySelector<HTMLInputElement>('[name="date"]')?.value ?? "").trim(),
      account_id: (form.querySelector<HTMLSelectElement>('[name="account_id"]')?.value ?? "").trim(),
    };

    const { valid, errors } = validateTransaction(raw);
    if (!valid) {
      showFieldErrors(errors);
      return;
    }

    const btnSubmit = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = '<div class="spinner" style="width:14px;height:14px;border-width:2px"></div> Procesando...';
    }

    const typeEl = form.querySelector<HTMLInputElement>('[name="type"]:checked');
    const type: TransactionType = typeEl?.value === "expense" ? "expense" : "income";
    const editId = form.dataset.editId;

    try {
      const payload = {
        amount: parseFloat(raw.amount),
        description: raw.description,
        category: raw.category,
        type,
        date: new Date(raw.date).toISOString(),
        account_id: parseInt(raw.account_id),
      };

      if (editId) {
        const { updateTransaction } = await import("../services/transactions.service");
        await updateTransaction(parseInt(editId), payload);
        delete form.dataset.editId;
        const btn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
        if (btn) btn.textContent = "Guardar movimiento";
      } else {
        await createTransaction(payload);
      }
      
      form.reset();
      const dateInput = form.querySelector<HTMLInputElement>('[name="date"]');
      if (dateInput) dateInput.max = new Date().toISOString().split("T")[0];
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.textContent = "Guardar movimiento";
      }
      onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al guardar el movimiento";
      showFieldErrors({ amount: msg });
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.textContent = editId ? "Actualizar movimiento" : "Guardar movimiento";
      }
    }
  });
}

// ── Formulario: nueva cuenta ──────────────────────────────────────────────────
export function setupAccountForm(onSuccess: () => void): void {
  const form = document.getElementById("account-form") as HTMLFormElement | null;
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFieldErrors();

    const name = (form.querySelector<HTMLInputElement>('[name="name"]')?.value ?? "").trim();
    const description = (form.querySelector<HTMLInputElement>('[name="description"]')?.value ?? "").trim();

    const { valid, errors } = validateAccount({ name });
    if (!valid) {
      showFieldErrors(errors);
      return;
    }

    const btnSubmit = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = '<div class="spinner" style="width:14px;height:14px;border-width:2px"></div> Procesando...';
    }

    const editId = form.dataset.editId;

    try {
      const payload = { name, description: description || undefined };
      if (editId) {
        const { updateAccount } = await import("../services/accounts.service");
        await updateAccount(parseInt(editId), payload);
        delete form.dataset.editId;
        const btn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
        if (btn) btn.textContent = "Crear cuenta";
      } else {
        await createAccount(payload);
      }
      form.reset();
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.textContent = "Crear cuenta";
      }
      onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al guardar la cuenta";
      showFieldErrors({ name: msg });
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.textContent = editId ? "Actualizar cuenta" : "Crear cuenta";
      }
    }
  });
}

// ── Formulario: nuevo presupuesto ─────────────────────────────────────────────
export function setupBudgetForm(onSuccess: () => void): void {
  const form = document.getElementById("budget-form") as HTMLFormElement | null;
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFieldErrors();

    const raw = {
      category: (form.querySelector<HTMLSelectElement>('[name="category"]')?.value ?? "").trim(),
      limit_amount: (form.querySelector<HTMLInputElement>('[name="limit_amount"]')?.value ?? "").trim(),
      month: (form.querySelector<HTMLInputElement>('[name="month"]')?.value ?? "").trim(),
      year: (form.querySelector<HTMLInputElement>('[name="year"]')?.value ?? "").trim(),
    };

    const { valid, errors } = validateBudget(raw);
    if (!valid) {
      showFieldErrors(errors);
      return;
    }

    try {
      await createBudget({
        category: raw.category,
        limit_amount: parseFloat(raw.limit_amount),
        month: parseInt(raw.month),
        year: parseInt(raw.year),
      });
      form.reset();
      onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al crear el presupuesto";
      showFieldErrors({ category: msg });
    }
  });
}

// ── Formulario: login ─────────────────────────────────────────────────────────
export function setupLoginForm(onSuccess: () => void): void {
  const form = document.getElementById("login-form") as HTMLFormElement | null;
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFieldErrors();

    const email = (form.querySelector<HTMLInputElement>('[name="email"]')?.value ?? "").trim();
    const password = form.querySelector<HTMLInputElement>('[name="password"]')?.value ?? "";

    const { valid, errors } = validateLogin({ email, password });
    if (!valid) {
      showFieldErrors(errors);
      return;
    }

    try {
      await login({ email, password });
      onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Credenciales incorrectas";
      showFieldErrors({ email: msg });
    }
  });
}

// ── Formulario: registro ──────────────────────────────────────────────────────
export function setupRegisterForm(onSuccess: () => void): void {
  const form = document.getElementById("register-form") as HTMLFormElement | null;
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFieldErrors();

    const email = (form.querySelector<HTMLInputElement>('[name="email"]')?.value ?? "").trim();
    const password = form.querySelector<HTMLInputElement>('[name="password"]')?.value ?? "";
    const full_name = (form.querySelector<HTMLInputElement>('[name="full_name"]')?.value ?? "").trim();

    const { valid, errors } = validateRegister({ email, password, full_name });
    if (!valid) {
      showFieldErrors(errors);
      return;
    }

    try {
      await register({ email, password, full_name });
      onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al registrar el usuario";
      showFieldErrors({ email: msg });
    }
  });
}
