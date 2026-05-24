// Validación dual en el frontend — se re-valida en el backend con Pydantic

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function validateTransaction(data: {
  amount: string;
  description: string;
  category: string;
  date: string;
  account_id: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.amount) {
    errors.amount = "El monto es obligatorio";
  } else if (!/^\d+(\.\d{1,2})?$/.test(data.amount)) {
    errors.amount = "Ingresá un monto válido (hasta 2 decimales)";
  } else if (parseFloat(data.amount) <= 0) {
    errors.amount = "El monto debe ser mayor a cero";
  }

  if (!data.description.trim()) {
    errors.description = "La descripción es obligatoria";
  } else if (data.description.trim().length > 200) {
    errors.description = "Máximo 200 caracteres";
  }

  if (!data.category.trim()) {
    errors.category = "La categoría es obligatoria";
  }

  if (!data.date) {
    errors.date = "La fecha es obligatoria";
  } else {
    const selected = new Date(data.date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (selected > today) {
      errors.date = "La fecha no puede ser futura";
    }
  }

  if (!data.account_id) {
    errors.account_id = "Seleccioná una cuenta";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateAccount(data: { name: string }): ValidationResult {
  const errors: Record<string, string> = {};
  if (!data.name.trim()) {
    errors.name = "El nombre de la cuenta es obligatorio";
  } else if (data.name.trim().length > 50) {
    errors.name = "Máximo 50 caracteres";
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateBudget(data: {
  category: string;
  limit_amount: string;
  month: string;
  year: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.category.trim()) {
    errors.category = "La categoría es obligatoria";
  }

  const limit = parseFloat(data.limit_amount);
  if (!data.limit_amount || isNaN(limit) || limit <= 0) {
    errors.limit_amount = "El límite debe ser mayor a cero";
  }

  const month = parseInt(data.month);
  if (!data.month || isNaN(month) || month < 1 || month > 12) {
    errors.month = "Mes inválido (1-12)";
  }

  const year = parseInt(data.year);
  if (!data.year || isNaN(year) || year < 2020) {
    errors.year = "Año inválido";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateLogin(data: { email: string; password: string }): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.email.trim()) {
    errors.email = "El email es obligatorio";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Formato de email inválido";
  }

  if (!data.password) {
    errors.password = "La contraseña es obligatoria";
  } else if (data.password.length < 8) {
    errors.password = "Mínimo 8 caracteres";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateRegister(data: { email: string; password: string; full_name: string }): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.full_name.trim()) {
    errors.full_name = "El nombre es obligatorio";
  }

  if (!data.email.trim()) {
    errors.email = "El email es obligatorio";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Formato de email inválido";
  }

  if (!data.password) {
    errors.password = "La contraseña es obligatoria";
  } else if (data.password.length < 8) {
    errors.password = "Mínimo 8 caracteres";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
