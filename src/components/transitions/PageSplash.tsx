import { useEffect, useMemo, useRef, useState } from "react";

export function invalidateTipsCache() {
  /* legado */
}

const SESSION_KEY = "__splash_shown_v6__";
const EVENT = "lovable:splash:play";

export function playSplash() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EVENT));
}

const LOGO_PATH = "M13.5 2L4 14h7l-1.5 8L19 10h-7l1.5-8z";

type Phase = "enter" | "settle" | "press" | "reveal" | "finish";

const PHASE_TIMELINE: Array<[Phase, number]> = [
  ["settle", 220],
  ["press", 640],
  ["reveal", 860],
  ["finish", 1420],
];

const SCALE_BY_PHASE: Record<Phase, number> = {
  enter: 0.78,
  settle: 1,
  press: 0.72,
  reveal: 92,
  finish: 92,
};

const EASE_BY_PHASE: Record<Phase, string> = {
  enter: "none",
  settle: "transform 420ms cubic-bezier(.16,1,.3,1), opacity 220ms ease-out",
  press: "transform 220ms cubic-bezier(.7,0,.84,0)",
  reveal: "transform 620ms cubic-bezier(.16,1,.3,1), opacity 160ms ease-out",
  finish: "transform 0ms linear",
};

export function PageSplash() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    return !sessionStorage.getItem(SESSION_KEY);
  });
  const [phase, setPhase] = useState<Phase>("enter");
  const [runId, setRunId] = useState(0);
  const timeoutRef = useRef<number[]>([]);
  const maskId = useMemo(
    () => `splash-mask-${Math.random().toString(36).slice(2, 9)}`,
    [],
  );

  useEffect(() => {
    const clearTimeline = () => {
      timeoutRef.current.forEach(window.clearTimeout);
      timeoutRef.current = [];
    };

    const start = () => {
      clearTimeline();
      setPhase("enter");
      setVisible(true);
      setRunId((current) => current + 1);
    };

    window.addEventListener(EVENT, start);
    return () => {
      clearTimeline();
      window.removeEventListener(EVENT, start);
    };
  }, []);

  useEffect(() => {
    if (!visible) return;

    sessionStorage.setItem(SESSION_KEY, "1");
    timeoutRef.current.forEach(window.clearTimeout);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      timeoutRef.current = [window.setTimeout(() => setVisible(false), 260)];
      return () => timeoutRef.current.forEach(window.clearTimeout);
    }

    timeoutRef.current = [
      ...PHASE_TIMELINE.map(([nextPhase, delay]) =>
        window.setTimeout(() => setPhase(nextPhase), delay),
      ),
      window.setTimeout(() => setVisible(false), 1700),
    ];

    return () => timeoutRef.current.forEach(window.clearTimeout);
  }, [visible, runId]);

  if (!visible) return null;

  const logoScale = SCALE_BY_PHASE[phase];
  const logoOpacity = phase === "reveal" || phase === "finish" ? 0 : 1;
  const rootOpacity = phase === "finish" ? 0 : 1;

  return (
    <div aria-hidden className="splash-root" style={{ opacity: rootOpacity }}>
      <svg
        key={runId}
        className="splash-stage"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <mask id={maskId} maskUnits="userSpaceOnUse" x="-120" y="-120" width="264" height="264">
            <rect x="-120" y="-120" width="264" height="264" fill="white" />
            <path
              d={LOGO_PATH}
              fill="black"
              style={{
                transformBox: "fill-box",
                transformOrigin: "center",
                transform: `scale(${logoScale})`,
                transition: EASE_BY_PHASE[phase],
              }}
            />
          </mask>
          <filter id="splash-soft-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="0.9" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect x="-120" y="-120" width="264" height="264" fill="hsl(var(--primary))" />
        <rect
          x="-120"
          y="-120"
          width="264"
          height="264"
          fill="hsl(var(--primary))"
          mask={`url(#${maskId})`}
        />
        <path
          d={LOGO_PATH}
          fill="hsl(var(--primary-foreground))"
          filter="url(#splash-soft-glow)"
          style={{
            opacity: logoOpacity,
            transformBox: "fill-box",
            transformOrigin: "center",
            transform: `scale(${logoScale})`,
            transition: EASE_BY_PHASE[phase],
          }}
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
          transition: opacity 280ms cubic-bezier(.4,0,.2,1);
          contain: layout paint style;
        }

        .splash-stage {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
          transform: translateZ(0);
          will-change: transform, opacity;
        }

        @media (prefers-reduced-motion: reduce) {
          .splash-root {
            transition: opacity 180ms linear;
          }

          .splash-stage path {
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}