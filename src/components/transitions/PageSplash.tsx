import { useEffect, useState } from "react";

/**
 * Splash estilo Twitter: o logo respira e depois escala como máscara,
 * revelando o app por baixo. Roda uma vez por sessão no boot e também
 * sempre que `playSplash()` é chamado (login / logout).
 */

export function invalidateTipsCache() {
  /* legado — splash novo não usa dicas */
}

const LOGO_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path d="M13.5 2L4 14h7l-1.5 8L19 10h-7l1.5-8z" fill="black"/>
</svg>`.trim();
const LOGO_MASK = `url("data:image/svg+xml;utf8,${encodeURIComponent(LOGO_SVG)}")`;

const SESSION_KEY = "__splash_shown_v2__";
const EVENT = "lovable:splash:play";

/** Dispara o splash de qualquer lugar do app. */
export function playSplash() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function PageSplash() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    return !sessionStorage.getItem(SESSION_KEY);
  });
  const [phase, setPhase] = useState<"idle" | "reveal" | "done">("idle");
  const [runId, setRunId] = useState(0);

  // Listener pra disparos imperativos (login/logout).
  useEffect(() => {
    const handler = () => {
      setPhase("idle");
      setVisible(true);
      setRunId((n) => n + 1);
    };
    window.addEventListener(EVENT, handler);
    return () => window.removeEventListener(EVENT, handler);
  }, []);

  useEffect(() => {
    if (!visible) return;
    sessionStorage.setItem(SESSION_KEY, "1");

    const t1 = window.setTimeout(() => setPhase("reveal"), 850);
    const t2 = window.setTimeout(() => setPhase("done"), 1750);
    const t3 = window.setTimeout(() => setVisible(false), 2150);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [visible, runId]);

  if (!visible) return null;

  return (
    <div
      aria-hidden
      className="splash-root"
      style={{ opacity: phase === "done" ? 0 : 1 }}
    >
      <div
        key={runId}
        className="splash-mask"
        style={{
          WebkitMaskImage: LOGO_MASK,
          maskImage: LOGO_MASK,
          transform: phase === "reveal" || phase === "done" ? "scale(60)" : "scale(1)",
        }}
      />

      <style>{`
        .splash-root {
          position: fixed;
          inset: 0;
          z-index: 9999;
          pointer-events: none;
          transition: opacity 380ms ease-out;
        }
        .splash-mask {
          position: absolute;
          inset: 0;
          background: #0a0a0c;
          -webkit-mask-repeat: no-repeat;
          mask-repeat: no-repeat;
          -webkit-mask-position: center;
          mask-position: center;
          -webkit-mask-size: 160px 160px;
          mask-size: 160px 160px;
          transform-origin: center center;
          will-change: transform;
          animation: splashBreath 850ms cubic-bezier(.5,0,.75,0) both;
          transition: transform 900ms cubic-bezier(.7,0,.84,0);
        }
        @keyframes splashBreath {
          0%   { transform: scale(0.88); }
          55%  { transform: scale(1.06); }
          100% { transform: scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .splash-mask { animation: none; transition: opacity 200ms linear; }
        }
      `}</style>
    </div>
  );
}
