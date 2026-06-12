import { ReactNode, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { setRevealOrigin } from "@/lib/menuReveal";

interface Props {
  children: ReactNode;
}

/**
 * Wrapper que aplica uma transição "ink/mask reveal" sempre que a rota muda.
 * - A animação SÓ é aplicada em troca de rota — nunca no primeiro render.
 *   (evita tela branca caso o navegador pause animações).
 * - A classe é removida logo após o término, garantindo que o conteúdo
 *   nunca fique preso em `opacity:0` ou `clip-path: circle(0)`.
 */
const REVEAL_MS = 700; // bate com --reveal-duration no index.css + folga

export function MenuRevealTransition({ children }: Props) {
  const location = useLocation();
  const [runId, setRunId] = useState(0);
  const [playing, setPlaying] = useState(false);
  const firstRender = useRef(true);
  const lastPath = useRef(location.pathname);
  const timeoutRef = useRef<number | null>(null);

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
    setPlaying(true);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    // Safety: remove a classe depois da anim — conteúdo nunca fica invisível.
    timeoutRef.current = window.setTimeout(() => setPlaying(false), REVEAL_MS);
  }, [location.pathname]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div
      key={runId}
      className={playing ? "menu-reveal-play" : undefined}
    >
      {children}
    </div>
  );
}
