// Configuração transversal do app (query client, chaves de storage, modo).
// Extraído para viver junto de App.tsx dentro de src/app/.
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient();

export const CHAVE_STORAGE_TEMA = "telepanel-theme";

export const MODO_APP =
  (import.meta.env.VITE_APP_MODE as string | undefined) ?? "full";

export const ehModoWeb = MODO_APP === "web";
export const ehModoPortal = MODO_APP === "portal";
export const ehModoFull = !ehModoWeb && !ehModoPortal;
