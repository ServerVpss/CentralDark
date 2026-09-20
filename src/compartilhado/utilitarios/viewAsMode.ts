// "Ver como usuário" — modo espelho read-only.
// Mantém o admin logado, mas a UI passa a se comportar como se ele fosse
// usuário comum (esconde menus admin, bloqueia rotas admin). Sem permissão real
// no backend muda, é puramente visual — RLS continua sendo a verdade.
const KEY = "viewAsUser";

export interface ViewAsState {
  userId: string;
  email: string | null;
  name?: string | null;
  startedAt: number;
}

export function getViewAs(): ViewAsState | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) as ViewAsState : null;
  } catch { return null; }
}

export function startViewAs(s: Omit<ViewAsState, "startedAt">) {
  sessionStorage.setItem(KEY, JSON.stringify({ ...s, startedAt: Date.now() }));
  window.dispatchEvent(new Event("viewas-change"));
}

export function stopViewAs() {
  sessionStorage.removeItem(KEY);
  window.dispatchEvent(new Event("viewas-change"));
}

export function isViewAsActive(): boolean {
  return !!getViewAs();
}
