import { useEffect, useRef, useState } from "react";

/**
 * Splash 2026 — Mask Reveal moderno com "breathing":
 * 1. entrada suave com leve respiração (escala oscila entre 0.95 e 1.05)
 * 2. antecipação profunda (encolhe bem mais — quase some)
 * 3. explosão fluida com easing tipo spring revelando o app
 *
 * Camada cobre a tela inteira na cor da marca; o logo é um BURACO
 * (SVG <mask>) que cresce até engolir a tela.
 */

export function invalidateTipsCache() {
  /* legado */
}

const SESSION_KEY = "__splash_shown_v4__";
const EVENT = "lovable:splash:play";

export function playSplash() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EVENT));
}

// Path do raio (Zap). ViewBox 24x24, centro em (12,12).
const LOGO_PATH = "M13.5 2L4 14h7l-1.5 8L19 10h-7l1.5-8z";

type Phase = "in" | "breathe" | "anticipate" | "explode" | "done";

export function PageSplash() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    return !sessionStorage.getItem(SESSION_KEY);
  });
  const [phase, setPhase] = useState<Phase>("in");
  const [runId, setRunId] = useState(0);
  const maskId = useRef(`splash-mask-${Math.random().toString(36).slice(2, 8)}`).current;

  useEffect(() => {
    const handler = () => {
      setPhase("in");
      setVisible(true);
      setRunId((n) => n + 1);
    };
    window.addEventListener(EVENT, handler);
    return () => window.removeEventListener(EVENT, handler);
  }, []);

  useEffect(() => {
    if (!visible) return;
    sessionStorage.setItem(SESSION_KEY, "1");

    // Timeline mais fluida com respiração e antecipação profunda
    const t1 = window.setTimeout(() => setPhase("breathe"), 380);     // expande de leve
    const t2 = window.setTimeout(() => setPhase("anticipate"), 880);  // encolhe quase pra zero
    const t3 = window.setTimeout(() => setPhase("explode"), 1380);    // BOOM
    const t4 = window.setTimeout(() => setPhase("done"), 2080);       // fade
    const t5 = window.setTimeout(() => setVisible(false), 2480);

    return () => [t1, t2, t3, t4, t5].forEach(clearTimeout);
  }, [visible, runId]);

  if (!visible) return null;

  // Escala do "buraco" no logo
  const scaleByPhase: Record<Phase, number> = {
    in: 1,
    breathe: 1.08,       // respira pra fora
    anticipate: 0.28,    // encolhe profundo (quase some)
    explode: 95,         // explode revelando tudo
    done: 95,
  };

  // Easings modernos (spring-like)
  const transitionByPhase: Record<Phase, string> = {
    in: "transform 380ms cubic-bezier(.22,1,.36,1)",
    breathe: "transform 500ms cubic-bezier(.45,.05,.55,.95)",        // ease in-out suave
    anticipate: "transform 500ms cubic-bezier(.65,0,.35,1)",         // recolhe rápido e firme
    explode: "transform 700ms cubic-bezier(.16,1,.3,1)",             // expo-out — explosão fluida
    done: "transform 0ms linear",
  };

  return (
    <div
      aria-hidden
      className="splash-root"
      style={{ opacity: phase === "done" ? 0 : 1 }}
    >
      <svg
        key={runId}
        className="splash-svg"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 24 24"
      >
        <defs>
          <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
            <rect x="-50" y="-50" width="124" height="124" fill="white" />
            <path
              d={LOGO_PATH}
              fill="black"
              style={{
                transformBox: "fill-box",
                transformOrigin: "center",
                transform: `scale(${scaleByPhase[phase]})`,
                transition: transitionByPhase[phase],
              }}
            />
          </mask>
        </defs>

        <rect
          x="-50"
          y="-50"
          width="124"
          height="124"
          fill="hsl(var(--primary))"
          mask={`url(#${maskId})`}
        />
      </svg>

      <style>{`
        .splash-root {
          position: fixed;
          inset: 0;
          z-index: 9999;
          pointer-events: none;
          transition: opacity 400ms cubic-bezier(.4,0,.2,1);
          filter: drop-shadow(0 0 60px hsl(var(--primary) / 0.45));
        }
        .splash-svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
        }
        @media (prefers-reduced-motion: reduce) {
          .splash-root { transition: opacity 200ms linear; }
          .splash-svg path { transition: none !important; }
        }
      `}</style>
    </div>
  );
}
