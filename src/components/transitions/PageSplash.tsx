import { useEffect, useState } from "react";

/**
 * Splash estilo Twitter: o logo aparece, dá uma "respirada" e depois escala
 * gigantesco funcionando como máscara que "rasga" a tela e revela o app.
 * Roda só uma vez por sessão da aba.
 */

// Mantido pra compatibilidade com MenuTips (no-op).
export function invalidateTipsCache() {
  /* legado — splash novo não usa dicas */
}

// SVG inline do raio (mesmo do Logo) usado como máscara — não depende de arquivo externo.
const LOGO_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path d="M13.5 2L4 14h7l-1.5 8L19 10h-7l1.5-8z" fill="black"/>
</svg>`.trim();
const LOGO_MASK = `url("data:image/svg+xml;utf8,${encodeURIComponent(LOGO_SVG)}")`;

const SESSION_KEY = "__splash_shown_v2__";

export function PageSplash() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    return !sessionStorage.getItem(SESSION_KEY);
  });
  const [phase, setPhase] = useState<"idle" | "reveal" | "done">("idle");

  useEffect(() => {
    if (!visible) return;
    sessionStorage.setItem(SESSION_KEY, "1");

    // Sequência: idle (respira) → reveal (zoom massivo) → done (some)
    const t1 = window.setTimeout(() => setPhase("reveal"), 850);
    const t2 = window.setTimeout(() => setPhase("done"), 1750);
    const t3 = window.setTimeout(() => setVisible(false), 2150);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      aria-hidden
      className="splash-root"
      style={{ opacity: phase === "done" ? 0 : 1 }}
    >
      <div
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
