import { useEffect, useRef, useState } from "react";

export function invalidateTipsCache() {
  /* legado — mantido pra compatibilidade */
}

const SESSION_KEY = "__splash_shown_v9__";
const EVENT = "lovable:splash:play";
const DURATION = 1600; // ms

// Path do raio (mesmo do <Logo />)
const LOGO_PATH = "M13.5 2L4 14h7l-1.5 8L19 10h-7l1.5-8z";

// SVG inline pra usar como mask-image (em data: URL)
const LOGO_MASK_SVG = encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='${LOGO_PATH}' fill='black'/></svg>`,
);
const LOGO_MASK_URL = `url("data:image/svg+xml;utf8,${LOGO_MASK_SVG}")`;

export function playSplash() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EVENT));
}

/**
 * Splash de abertura/login.
 * - Fundo verde cobre a tela (div puro, sem SVG esticado).
 * - Logo branco em tamanho FIXO (ícone) no centro, com pulse leve.
 * - No final, um círculo branco "explode" do centro revelando o app por baixo.
 * - Funciona em qualquer viewport (mobile, tablet, desktop, notch).
 */
export function PageSplash() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    return !sessionStorage.getItem(SESSION_KEY);
  });
  const [runId, setRunId] = useState(0);
  const timeoutRef = useRef<number | null>(null);

  // Disparo manual via playSplash()
  useEffect(() => {
    const start = () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      setVisible(true);
      setRunId((c) => c + 1);
    };
    window.addEventListener(EVENT, start);
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      window.removeEventListener(EVENT, start);
    };
  }, []);

  // Agenda o fim
  useEffect(() => {
    if (!visible) return;
    sessionStorage.setItem(SESSION_KEY, "1");
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dur = reduceMotion ? 260 : DURATION;

    timeoutRef.current = window.setTimeout(() => {
      setVisible(false);
    }, dur);

    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [visible, runId]);

  if (!visible) return null;

  return (
    <div aria-hidden className="splash-root" key={runId}>
      {/* Fundo verde da marca cobrindo a tela toda */}
      <div className="splash-bg" />

      {/* Logo branco em tamanho fixo (ícone) — pulsa no centro */}
      <div className="splash-logo" />

      {/* Reveal: círculo branco que cresce do centro pra revelar o app */}
      <div className="splash-reveal" />

      <style>{`
        .splash-root {
          position: fixed;
          inset: 0;
          z-index: 9999;
          pointer-events: none;
          overflow: hidden;
          contain: layout paint style;
        }

        .splash-bg {
          position: absolute;
          inset: 0;
          background: hsl(var(--primary));
          animation: splash-bg-out ${DURATION}ms cubic-bezier(.4,0,.2,1) forwards;
        }

        /* Logo branco — desenhado via mask-image num quadrado fixo de 112px */
        .splash-logo {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 112px;
          height: 112px;
          margin: -56px 0 0 -56px;
          background: #fff;
          -webkit-mask-image: ${LOGO_MASK_URL};
                  mask-image: ${LOGO_MASK_URL};
          -webkit-mask-repeat: no-repeat;
                  mask-repeat: no-repeat;
          -webkit-mask-position: center;
                  mask-position: center;
          -webkit-mask-size: contain;
                  mask-size: contain;
          filter: drop-shadow(0 8px 24px hsl(var(--primary) / 0.5));
          transform-origin: center;
          will-change: transform, opacity;
          animation: splash-logo ${DURATION}ms cubic-bezier(.4,0,.2,1) forwards;
        }

        /* Círculo branco que explode do centro no final, revelando o app */
        .splash-reveal {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 120px;
          height: 120px;
          margin: -60px 0 0 -60px;
          border-radius: 50%;
          background: #fff;
          opacity: 0;
          transform: scale(0);
          will-change: transform, opacity;
          animation: splash-reveal ${DURATION}ms cubic-bezier(.7,0,.3,1) forwards;
        }

        @keyframes splash-bg-out {
          0%, 70% { opacity: 1; }
          90%, 100% { opacity: 0; }
        }

        @keyframes splash-logo {
          0%   { transform: scale(0.7);  opacity: 0; }
          18%  { transform: scale(1.06); opacity: 1; }
          32%  { transform: scale(1);    opacity: 1; }
          55%  { transform: scale(1.04); opacity: 1; }
          70%  { transform: scale(0.92); opacity: 1; }
          80%  { transform: scale(0.6);  opacity: 0; }
          100% { transform: scale(0.4);  opacity: 0; }
        }

        @keyframes splash-reveal {
          0%, 70%  { transform: scale(0);  opacity: 0; }
          75%      { transform: scale(0.5); opacity: 1; }
          100%     { transform: scale(30); opacity: 0; }
        }

        @media (prefers-reduced-motion: reduce) {
          .splash-bg, .splash-logo, .splash-reveal {
            animation-duration: 260ms !important;
          }
        }
      `}</style>
    </div>
  );
}
