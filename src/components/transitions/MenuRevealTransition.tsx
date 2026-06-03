import { ReactNode, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

interface Props {
  children: ReactNode;
}

/**
 * Wrapper que aplica uma transição "ink/mask reveal" sempre que a rota muda.
 * - Estado é atualizado UMA vez por troca (runId).
 * - Animação é 100% CSS via classe `.menu-reveal-play`.
 * - Respeita prefers-reduced-motion (cai pra fade curto).
 * - Origem do efeito vem de --reveal-x / --reveal-y definidos no clique.
 */
export function MenuRevealTransition({ children }: Props) {
  const location = useLocation();
  const [runId, setRunId] = useState(0);
  const firstRender = useRef(true);
  const lastPath = useRef(location.pathname);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (location.pathname === lastPath.current) return;
    lastPath.current = location.pathname;
    setRunId((n) => n + 1);
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
