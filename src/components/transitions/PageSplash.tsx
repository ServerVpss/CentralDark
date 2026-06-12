import { useEffect, useRef, useState } from "react";

export function invalidateTipsCache() {
  /* legado — mantido pra compatibilidade */
}

const SESSION_KEY = "__splash_shown_v10__";
const EVENT = "lovable:splash:play";
const DURATION = 900; // ms — splash padrão (era 1600, longo demais)
const MAX_DURATION = 2200; // ms — safety: nunca fica preso mais que isso

// Path do raio (mesmo do <Logo />)
const LOGO_PATH = "M13.5 2L4 14h7l-1.5 8L19 10h-7l1.5-8z";
const LOGO_MASK_SVG = encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='${LOGO_PATH}' fill='black'/></svg>`,
);
const LOGO_MASK_URL = `url("data:image/svg+xml;utf8,${LOGO_MASK_SVG}")`;

export type SplashStyle = "flash" | "fade" | "pulse" | "wipe";

export interface SplashOptions {
  /** Atalho para duração padrão rápida (~750ms). */
  quick?: boolean;
  /** Duração explícita em ms (sobrescreve quick e o padrão). */
  duration?: number;
  /** Estilo visual. Default: 'flash' (raio + reveal). */
  style?: SplashStyle;
  /** Identificador opcional (útil pra debug/teste). */
  key?: string;
}

export function playSplash(opts?: SplashOptions) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EVENT, { detail: opts ?? {} }));
}

/**
 * Splash de abertura/login + transição entre menus.
 *
 * - Estilos: flash (raio), fade, pulse, wipe.
 * - Coalesce: se já tem splash rodando, novos dispatchs NÃO cortam pela metade —
 *   substituem apenas o "próximo" da fila (mantém só o último pedido).
 * - Debounce curto (40ms) pra agrupar burst de cliques.
 */
export function PageSplash() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    return !sessionStorage.getItem(SESSION_KEY);
  });
  const [runId, setRunId] = useState(0);
  const [duration, setDuration] = useState(DURATION);
  const [style, setStyle] = useState<SplashStyle>("flash");

  const endTimeoutRef = useRef<number | null>(null);
  const debounceRef = useRef<number | null>(null);
  const runningRef = useRef(false);
  const pendingRef = useRef<SplashOptions | null>(null);

  // Helper que efetivamente começa um splash com opts resolvidos.
  const start = (opts: SplashOptions) => {
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const base = opts.duration ?? (opts.quick ? 750 : DURATION);
    const dur = reduceMotion ? Math.min(base, 280) : base;

    sessionStorage.setItem(SESSION_KEY, "1");
    runningRef.current = true;
    setStyle(opts.style ?? "flash");
    setDuration(dur);
    setVisible(true);
    setRunId((c) => c + 1);

    if (endTimeoutRef.current) window.clearTimeout(endTimeoutRef.current);
    endTimeoutRef.current = window.setTimeout(() => {
      runningRef.current = false;
      setVisible(false);

      // Se chegou pedido durante a anim, dispara o último (coalesce).
      const next = pendingRef.current;
      pendingRef.current = null;
      if (next) {
        // próximo tick — deixa React limpar antes
        window.setTimeout(() => start(next), 16);
      }
    }, dur);
  };

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<SplashOptions>;
      const opts = ce.detail ?? {};

      // Se já tá rodando, só atualiza o "próximo" (coalesce — mantém só o último).
      if (runningRef.current) {
        pendingRef.current = opts;
        return;
      }

      // Debounce burst de cliques (40ms).
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      pendingRef.current = opts;
      debounceRef.current = window.setTimeout(() => {
        const next = pendingRef.current;
        pendingRef.current = null;
        if (next) start(next);
      }, 40);
    };

    window.addEventListener(EVENT, handler);
    return () => {
      window.removeEventListener(EVENT, handler);
      if (endTimeoutRef.current) window.clearTimeout(endTimeoutRef.current);
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, []);

  // Splash inicial (login/abertura) — usa o default 'flash'.
  useEffect(() => {
    if (!visible || runningRef.current) return;
    // visível mas sem run rodando = primeiro render (login splash)
    runningRef.current = true;
    if (endTimeoutRef.current) window.clearTimeout(endTimeoutRef.current);
    endTimeoutRef.current = window.setTimeout(() => {
      runningRef.current = false;
      setVisible(false);
    }, duration);
    sessionStorage.setItem(SESSION_KEY, "1");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden
      className={`splash-root splash-style-${style}`}
      data-splash-style={style}
      data-testid="page-splash"
      key={runId}
      style={{ ["--splash-duration" as any]: `${duration}ms` }}
    >
      <div className="splash-bg" />
      {(style === "flash" || style === "pulse") && <div className="splash-logo" />}
      {style === "flash" && <div className="splash-reveal" />}
      {style === "wipe" && <div className="splash-wipe" />}

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
          animation: splash-bg-out var(--splash-duration) cubic-bezier(.4,0,.2,1) forwards;
        }

        .splash-logo {
          position: absolute;
          top: 50%; left: 50%;
          width: 112px; height: 112px;
          margin: -56px 0 0 -56px;
          background: #fff;
          -webkit-mask-image: ${LOGO_MASK_URL};
                  mask-image: ${LOGO_MASK_URL};
          -webkit-mask-repeat: no-repeat;  mask-repeat: no-repeat;
          -webkit-mask-position: center;   mask-position: center;
          -webkit-mask-size: contain;      mask-size: contain;
          filter: drop-shadow(0 8px 24px hsl(var(--primary) / 0.5));
          transform-origin: center;
          will-change: transform, opacity;
          animation: splash-logo var(--splash-duration) cubic-bezier(.4,0,.2,1) forwards;
        }

        .splash-reveal {
          position: absolute;
          top: 50%; left: 50%;
          width: 120px; height: 120px;
          margin: -60px 0 0 -60px;
          border-radius: 50%;
          background: #fff;
          opacity: 0;
          transform: scale(0);
          will-change: transform, opacity;
          animation: splash-reveal var(--splash-duration) cubic-bezier(.7,0,.3,1) forwards;
        }

        .splash-wipe {
          position: absolute; inset: 0;
          background: linear-gradient(120deg,
            transparent 0%,
            #fff 45%,
            #fff 55%,
            transparent 100%);
          transform: translateX(-100%);
          animation: splash-wipe var(--splash-duration) cubic-bezier(.4,0,.2,1) forwards;
        }

        /* ===== estilo: fade ===== (só o bg) ===== */
        .splash-style-fade .splash-bg {
          animation: splash-fade var(--splash-duration) ease-out forwards;
        }

        /* ===== estilo: pulse ===== (logo pulsa, sem reveal circular) ===== */
        .splash-style-pulse .splash-bg {
          animation: splash-fade var(--splash-duration) ease-out forwards;
        }
        .splash-style-pulse .splash-logo {
          animation: splash-pulse var(--splash-duration) ease-in-out forwards;
        }

        @keyframes splash-bg-out {
          0%, 70% { opacity: 1; }
          90%, 100% { opacity: 0; }
        }
        @keyframes splash-fade {
          0% { opacity: 1; }
          100% { opacity: 0; }
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
        @keyframes splash-pulse {
          0%   { transform: scale(0.85); opacity: 0; }
          30%  { transform: scale(1.08); opacity: 1; }
          60%  { transform: scale(0.96); opacity: 1; }
          100% { transform: scale(1.2);  opacity: 0; }
        }
        @keyframes splash-reveal {
          0%, 70%  { transform: scale(0);  opacity: 0; }
          75%      { transform: scale(0.5); opacity: 1; }
          100%     { transform: scale(30); opacity: 0; }
        }
        @keyframes splash-wipe {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @media (prefers-reduced-motion: reduce) {
          .splash-bg, .splash-logo, .splash-reveal, .splash-wipe {
            animation-duration: 260ms !important;
          }
        }
      `}</style>
    </div>
  );
}
