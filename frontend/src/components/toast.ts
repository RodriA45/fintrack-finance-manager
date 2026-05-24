// Componente de notificaciones visuales (toast)

type ToastType = "success" | "error" | "warning";

export function showToast(message: string, type: ToastType = "success"): void {
  const existing = document.getElementById("ft-toast");
  if (existing) existing.remove();

  const colors: Record<ToastType, string> = {
    success: "rgba(104,211,145,0.3)",
    error:   "rgba(245,101,101,0.3)",
    warning: "rgba(246,173,85,0.3)",
  };
  const icons: Record<ToastType, string> = {
    success: "✓",
    error:   "✕",
    warning: "⚠",
  };

  const toast = document.createElement("div");
  toast.id = "ft-toast";
  toast.style.cssText = `
    position:fixed;bottom:28px;right:28px;
    background:#111c35;border:1px solid ${colors[type]};
    border-radius:10px;padding:12px 18px;
    display:flex;align-items:center;gap:10px;
    font-size:13px;font-family:'Plus Jakarta Sans',sans-serif;color:#e8edf5;
    box-shadow:0 10px 40px rgba(0,0,0,0.5);z-index:9999;
    transform:translateY(80px);opacity:0;
    transition:all 0.3s cubic-bezier(0.4,0,0.2,1);
  `;
  toast.innerHTML = `<span style="color:${colors[type].replace('0.3','1')};font-size:16px">${icons[type]}</span>${message}`;

  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.transform = "translateY(0)";
    toast.style.opacity = "1";
  });

  setTimeout(() => {
    toast.style.transform = "translateY(80px)";
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
