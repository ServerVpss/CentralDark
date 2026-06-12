import { ReactNode, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { setRevealOrigin } from "@/lib/menuReveal";
import { playSplash } from "@/components/transitions/PageSplash";

interface Props {
  children: ReactNode;
}

/**
 * Wrapper que aplica uma transição "ink/mask reveal" sempre que a rota muda.
 * - Estado é atualizado UMA vez por troca (runId).
 * - Animação é 100% CSS via classe `.menu-reveal-play`.
 * - Respeita prefers-reduced-motion (cai pra fade curto).
 * - Origem do efeito vem de --reveal-x / --reveal-y, capturadas via
 *   um único listener global de pointerdown (sem instrumentar botões).
 */
export function MenuRevealTransition({ children }: Props) {
  const location = useLocation();
  const [runId, setRunId] = useState(0);
  const firstRender = useRef(true);
  const lastPath = useRef(location.pathname);

  // Captura a posição do último clique/toque em qualquer lugar.
  // É barato (apenas escreve CSS vars no <html>, sem re-render).
  useEffect(() => {
    const handler = (e: PointerEvent) => {
      setRevealOrigin({ clientX: e.clientX, clientY: e.clientY });
    };
    window.addEventListener("pointerdown", handler, { capture: true, passive: true });
    return () => window.removeEventListener("pointerdown", handler, { capture: true } as any);
  }, []);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (location.pathname === lastPath.current) return;
    lastPath.current = location.pathname;
    setRunId((n) => n + 1);
    // Dispara a splash do raio (versão rápida) a cada navegação entre menus
    playSplash({ quick: true });
  }, [location.pathname]);

  return (
    <div
      key={runId}
      className="menu-reveal-play"
      style={{ contain: "paint" } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

