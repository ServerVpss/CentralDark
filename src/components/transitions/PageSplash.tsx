import { useEffect, useState } from "react";

/**
 * Splash estilo Twitter: o logo aparece, dá uma "respirada" (encolhe levemente)
 * e depois escala gigantesco, funcionando como máscara que "rasga" a tela
 * revelando o app por baixo. Roda só uma vez por carregamento da aba.
 */

// Mantido pra compatibilidade com MenuTips (no-op).
export function invalidateTipsCache() {
  /* legado — splash novo não usa dicas */
}

const LOGO_URL = "/icons/icon-512x512.png";
const SESSION_KEY = "__splash_shown__";

export function PageSplash() {
  // Mostra só uma vez por sessão da aba
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    return !sessionStorage.getItem(SESSION_KEY);
  });
  const [phase, setPhase] = useState<"idle" | "reveal" | "done">("idle");

  useEffect(() => {
    if (!visible) return;
    sessionStorage.setItem(SESSION_KEY, "1");

    // Pré-carrega a imagem pra evitar flash
    const img = new Image();
    img.src = LOGO_URL;

    // Sequência: idle (logo aparece) -> reveal (zoom massivo) -> done (some)
    const t1 = window.setTimeout(() => setPhase("reveal"), 900);
    const t2 = window.setTimeout(() => setPhase("done"), 1900);
    const t3 = window.setTimeout(() => setVisible(false), 2300);

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
      {/* Camada de fundo (cor sólida do app) com máscara em formato do logo.
          O logo PNG tem alpha, então onde tem desenho é opaco e o resto fica
          transparente. Ao escalar a máscara, o fundo se afasta e revela o app. */}
      <div
        className="splash-mask"
        style={{
          WebkitMaskImage: `url(${LOGO_URL})`,
          maskImage: `url(${LOGO_URL})`,
          transform:
            phase === "idle"
              ? "scale(1)"
              : phase === "reveal"
              ? "scale(70)"
              : "scale(70)",
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
          -webkit-mask-size: 180px 180px;
          mask-size: 180px 180px;
          transform-origin: center center;
          will-change: transform;
          animation: splashBreath 900ms cubic-bezier(.5,0,.75,0) both;
          transition: transform 1000ms cubic-bezier(.7,0,.84,0);
        }
        @keyframes splashBreath {
          0%   { transform: scale(0.85); }
          55%  { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .splash-mask { animation: none; transition: opacity 200ms linear; }
        }
      `}</style>
    </div>
  );
}
