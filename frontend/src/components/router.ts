// Router SPA minimalista — renderiza la página correcta sin recargar

type PageRenderer = () => void;

const routes: Record<string, PageRenderer> = {};

export function registerRoute(path: string, renderer: PageRenderer): void {
  routes[path] = renderer;
}

export function navigate(path: string): void {
  history.pushState({}, "", path);
  renderCurrent();
}

export function renderCurrent(): void {
  const path = window.location.pathname;
  const renderer = routes[path] ?? routes["/404"] ?? routes["/"];
  if (renderer) renderer();
}

window.addEventListener("popstate", renderCurrent);
