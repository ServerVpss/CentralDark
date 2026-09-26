import { useEffect } from "react";

/**
 * Auto-recuperação de cache velho do dev server.
 *
 * Sintomas conhecidos (HMR + serverFn split do TanStack Start):
 *  - "Invalid server function ID"
 *  - "Cannot read properties of undefined (reading '_nonReactive')"
 *  - "Failed to fetch dynamically imported module"
 *  - "Importing a module script failed"
 *
 * Quando qualquer um aparecer, recarregamos a aba UMA vez (flag em
 * sessionStorage) pra puxar os chunks novos. Evita tela branca e o usuário
 * tendo que apertar Ctrl+F5 manualmente.
 */
const FLAG = "dev-cache-recovered-at";
const COOLDOWN_MS = 30_000;

const PATTERNS = [
  "Invalid server function ID",
  "_nonReactive",
  "Failed to fetch dynamically imported module",
  "Importing a module script failed",
  "error loading dynamically imported module",
  "(intermediate value) is not a function",
  "SSR rendering failed",
];

function matches(msg: unknown): boolean {
  const s = typeof msg === "string" ? msg : (msg as { message?: string } | null)?.message ?? "";
  return PATTERNS.some((p) => s.includes(p));
}

function tryRecover(reason: string) {
  try {
    const last = Number(sessionStorage.getItem(FLAG) ?? "0");
    if (Date.now() - last < COOLDOWN_MS) return; // já tentei recentemente
    sessionStorage.setItem(FLAG, String(Date.now()));
    // eslint-disable-next-line no-console
    console.warn("[dev-cache-recover] recarregando aba —", reason);
    window.location.reload();
  } catch {
    // sessionStorage indisponível — ignora
  }
}

export function DevCacheRecover() {
  useEffect(() => {
    const onError = (e: ErrorEvent) => {
      if (matches(e.error) || matches(e.message)) tryRecover(e.message || "window.error");
    };
    const onRejection = (e: PromiseRejectionEvent) => {
      if (matches(e.reason)) tryRecover("unhandledrejection");
    };
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);
  return null;
}
