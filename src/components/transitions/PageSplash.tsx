import { useEffect, useMemo, useRef, useState } from "react";

export function invalidateTipsCache() {
  /* legado */
}

const SESSION_KEY = "__splash_shown_v7__";
const EVENT = "lovable:splash:play";
const DURATION = 1600; // duração total em ms

export function playSplash() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EVENT));
}

const LOGO_PATH = "M13.5 2L4 14h7l-1.5 8L19 10h-7l1.5-8z";

export function PageSplash() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    return !sessionStorage.getItem(SESSION_KEY);
  });
  const [runId, setRunId] = useState(0);
  const timeoutRef = useRef<number | null>(null);
  const maskId = useMemo(
    () => `splash-mask-${Math.random().toString(36).slice(2, 9)}`,
    [],
  );

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

  useEffect(() => {
    if (!visible) return;
    sessionStorage.setItem(SESSION_KEY, "1");
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dur = reduceMotion ? 280 : DURATION;

    timeoutRef.current = window.setTimeout(() => setVisible(false), dur);
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [visible, runId]);

  if (!visible) return null;

  return (
    <div aria-hidden className="splash-root" key={runId}>
      <svg
        className="splash-stage"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <mask id={maskId} maskUnits="userSpaceOnUse" x="-200" y="-200" width="424" height="424">
            <rect x="-200" y="-200" width="424" height="424" fill="white" />
            <path
              d={LOGO_PATH}
              fill="black"
              className="splash-logo splash-logo--mask"
            />
          </mask>
        </defs>

        <rect
          x="-200"
          y="-200"
          width="424"
          height="424"
          fill="hsl(var(--primary))"
          mask={`url(#${maskId})`}
          className="splash-bg"
        />
        <path
          d={LOGO_PATH}
          fill="hsl(var(--primary-foreground))"
          className="splash-logo splash-logo--fill"
        />
      </svg>

      <style>{`
        .splash-root {
          position: fixed;
          inset: 0;
          z-index: 9999;
          pointer-events: none;
          background: hsl(var(--background));
          overflow: hidden;
          contain: layout paint style;
          animation: splash-root-fade 1600ms cubic-bezier(.4,0,.2,1) forwards;
          will-change: opacity;
        }

        .splash-stage {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
          transform: translateZ(0);
        }

        .splash-logo {
          transform-box: fill-box;
          transform-origin: center;
          will-change: transform, opacity;
          animation: splash-logo-pulse 1600ms cubic-bezier(.4,0,.2,1) forwards;
        }

        .splash-logo--mask {
          animation-name: splash-logo-mask;
        }

        .splash-logo--fill {
          animation-name: splash-logo-fill;
        }

        @keyframes splash-root-fade {
          0%, 78% { opacity: 1; }
          100% { opacity: 0; }
        }

        /* Logo "fill" — escala leve, encolhe e some antes do reveal */
        @keyframes splash-logo-fill {
          0%   { transform: scale(0.82); opacity: 0; }
          12%  { transform: scale(1);    opacity: 1; }
          42%  { transform: scale(1);    opacity: 1; }
          55%  { transform: scale(0.74); opacity: 1; }
          70%  { transform: scale(0.74); opacity: 0; }
          100% { transform: scale(0.74); opacity: 0; }
        }

        /* Máscara — sincronizada com fill, depois explode pra revelar */
        @keyframes splash-logo-mask {
          0%   { transform: scale(0.82); }
          12%  { transform: scale(1); }
          42%  { transform: scale(1); }
          55%  { transform: scale(0.74); }
          85%  { transform: scale(60); }
          100% { transform: scale(120); }
        }

        @media (prefers-reduced-motion: reduce) {
          .splash-root,
          .splash-logo {
            animation-duration: 280ms !important;
          }
        }
      `}</style>
    </div>
  );
}
