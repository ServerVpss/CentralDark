// Hook utilitário do tema NexChat:
// - retorna se o viewport está em modo mobile (<= 767px)
// - garante que, ao voltar pro desktop, qualquer flag de "chat fullscreen mobile"
//   seja zerada (pra lista de conversas reaparecer à esquerda).
import { useEffect, useState } from "react";

const MOBILE_QUERY = "(max-width: 1023.98px)";

export function isMobileViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(MOBILE_QUERY).matches;
}

/**
 * Observa o breakpoint mobile. Quando o usuário arrasta a janela do mobile
 * pro desktop, o callback `onLeaveMobile` é chamado uma vez — útil pra resetar
 * `isMobileChat` e garantir que a lista de conversas volte a aparecer.
 */
export function useIsMobileViewport(onLeaveMobile?: () => void): boolean {
  const [mobile, setMobile] = useState<boolean>(isMobileViewport);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(MOBILE_QUERY);
    const handler = (e: MediaQueryListEvent) => {
      setMobile(e.matches);
      if (!e.matches && onLeaveMobile) onLeaveMobile();
    };
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [onLeaveMobile]);

  return mobile;
}
