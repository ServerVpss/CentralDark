import { useEffect, useRef, useState } from "react";

/**
 * Splash 2026 Fluid — Revelação tipo Twitter App Loader
 * 5 fases contemplativas com duração generosa:
 * 1. in        → logo aparece suavemente (aparece + respira)
 * 2. breathe   → pulsação orgânica, visível (3 ciclos)
 * 3. hold      → pausa dramática, tudo congelado
 * 4. anticipate→ encolhe profundo, quase some (queda visível)
 * 5. explode   → BOOM expansivo, revela o app por trás
 * 6. done      → fade elegante
 *
 * Total: ~5.2s — tempo suficiente para o olho acompanhar cada movimento
 */

export function invalidateTipsCache() {
  /* legado */
}

const SESSION_KEY = "__splash_shown_v5__";
const EVENT = "lovable:splash:play";

export function playSplash() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EVENT));
}

// Raio (Zap) — ViewBox 24x24, centro em (12,12)
const LOGO_PATH = "M13.5 2L4 14h7l-1.5 8L19 10h-7l1.5-8z";

type Phase = "in" | "breathe" | "hold" | "anticipate" | "explode" | "done";

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

    // Timeline enxuta tipo Twitter (~1.4s total) — fluido sem travar
    const t1 = window.setTimeout(() => setPhase("breathe"), 120);    // 0.12s
    const t2 = window.setTimeout(() => setPhase("hold"), 380);       // 0.38s
    const t3 = window.setTimeout(() => setPhase("anticipate"), 620); // 0.62s
    const t4 = window.setTimeout(() => setPhase("explode"), 880);    // 0.88s
    const t5 = window.setTimeout(() => setPhase("done"), 1180);      // 1.18s
    const t6 = window.setTimeout(() => setVisible(false), 1450);     // 1.45s

    return () => [t1, t2, t3, t4, t5, t6].forEach(clearTimeout);
  }, [visible, runId]);

  if (!visible) return null;

  // Escala do "buraco" do logo — cada fase tem escala distinta
  const scaleByPhase: Record<Phase, number> = {
    in: 0.85,          // nasce pequeno, cresce
    breathe: 1.12,     // pulsação para fora
    hold: 1.12,        // congelado no ápice
    anticipate: 0.18,  // encolhe QUASE a zero (queda dramática)
    explode: 120,      // BOOM — explode além da tela
    done: 120,         // mantém expandido enquanto some
  };

  // Easings teatrais e orgânicos
  const transitionByPhase: Record<Phase, string> = {
    in: "transform 500ms cubic-bezier(.22,1,.36,1)",                    // suave entrada
    breathe: "transform 1500ms cubic-bezier(.45,.05,.55,.95)",             // respiração lenta, ondulante
    hold: "transform 1200ms cubic-bezier(.45,.05,.55,.95)",              // congelado (mesmo easing, não muda)
    anticipate: "transform 1000ms cubic-bezier(.68,-0.3,.32,1)",         // recolhe com "overshoot" invertido (rápido no início, lento no fim)
    explode: "transform 1000ms cubic-bezier(.16,1,.3,1)",                // expo-out — explosão grandiosa
    done: "transform 0ms linear",
  };

  return (
    <div
      aria-hidden
      className="splash-root"
      style={{ opacity: phase === "done" ? 0 : 1 }}
    >
      {/* Camada escura por trás para dar profundidade teatral */}
      <div className="splash-backdrop" />

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

          {/* Glow filter para o logo brilhar */}
          <filter id="splash-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Fundo primário com mask — o buraco é o logo */}
        <rect
          x="-50"
          y="-50"
          width="124"
          height="124"
          fill="hsl(var(--primary))"
          mask={`url(#${maskId})`}
        />

        {/* Logo em cima, com glow, para dar brilho no buraco */}
        <path
          d={LOGO_PATH}
          fill="white"
          filter="url(#splash-glow)"
          style={{
            transformBox: "fill-box",
            transformOrigin: "center",
            transform: `scale(${scaleByPhase[phase]})`,
            transition: transitionByPhase[phase],
            opacity: phase === "explode" || phase === "done" ? 0 : 1,
          }}
        />
      </svg>

      <style>{`
        .splash-root {
          position: fixed;
          inset: 0;
          z-index: 9999;
          pointer-events: none;
          transition: opacity 600ms cubic-bezier(.4,0,.2,1);
        }
        .splash-backdrop {
          position: absolute;
          inset: 0;
          background: hsl(var(--background) / 0.85);
          backdrop-filter: blur(8px);
          transition: opacity 600ms cubic-bezier(.4,0,.2,1);
        }
        .splash-svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
          filter: drop-shadow(0 0 80px hsl(var(--primary) / 0.6))
                  drop-shadow(0 0 40px hsl(var(--primary) / 0.4));
        }
        @media (prefers-reduced-motion: reduce) {
          .splash-root { transition: opacity 200ms linear; }
          .splash-backdrop { transition: opacity 200ms linear; }
          .splash-svg path { transition: none !important; }
        }
      `}</style>
    </div>
  );
}

