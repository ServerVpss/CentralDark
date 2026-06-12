import { ReactNode, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { setRevealOrigin } from "@/lib/menuReveal";
// Obs.: o splash do raio agora é disparado pelo SplashController global
// (escuta troca de rota + cliques em menus). Esse wrapper cuida só do
// efeito "ink reveal" do conteúdo da página.

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
    // O splash do raio é disparado pelo SplashController (global).
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

