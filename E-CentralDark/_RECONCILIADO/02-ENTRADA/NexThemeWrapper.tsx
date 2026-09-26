import { useEffect } from "react";
import { useActiveTheme } from "@/hooks/use-active-theme";
import "./styles/nexchat.css";

/**
 * Aplica o tema NexChat de forma global quando o toggle Master estiver ligado.
 * Não altera nenhum componente — apenas adiciona a classe `nexchat-theme-active`
 * no <body>, que reescreve os design tokens em src/components/nexchat/styles/nexchat.css.
 *
 * Quando o toggle está desligado, a classe não é aplicada e o visual antigo
 * permanece intacto. Rollback = desligar toggle em /admin/aparencia.
 *
 * Segurança: este componente é puramente visual. Não toca em backend, RLS,
 * WuzAPI, MultiZap Gateway, PIX, cobrança automática, audit_log ou qualquer
 * lógica sensível.
 */
export function NexThemeWrapper() {
  const { enabled, mode } = useActiveTheme();
  const active = enabled && mode === "nexchat";

  useEffect(() => {
    if (typeof document === "undefined") return;
    const body = document.body;
    if (active) {
      body.classList.add("nexchat-theme-active");
    } else {
      body.classList.remove("nexchat-theme-active");
    }
    return () => {
      body.classList.remove("nexchat-theme-active");
    };
  }, [active]);

  return null;
}
