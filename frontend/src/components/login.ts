import { login } from "../services/auth.service";
import { showToast } from "./toast";
import { validateLogin } from "./validation";

function setupLoginForm(): void {
  const form = document.getElementById("login-form") as HTMLFormElement | null;
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const email = fd.get("email") as string;
    const password = fd.get("password") as string;

    const { valid, errors } = validateLogin({ email, password });
    form.querySelectorAll(".field-error").forEach((el) => el.remove());

    if (!valid) {
      Object.entries(errors).forEach(([field, msg]) => {
        const input = form.querySelector(`[name="${field}"]`);
        if (input) {
          const err = document.createElement("span");
          err.className = "field-error";
          err.textContent = msg;
          input.insertAdjacentElement("afterend", err);
        }
      });
      return;
    }

    try {
      await login({ email, password });
      window.location.href = "/";
    } catch (err) {
      showToast((err as Error).message, "error");
    }
  });
}

setupLoginForm();
