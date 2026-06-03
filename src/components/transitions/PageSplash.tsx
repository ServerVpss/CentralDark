import { useEffect, useRef, useState } from "react";

/**
 * Splash estilo Twitter (técnica oficial do post do RN 2018):
 * uma camada cobre a tela inteira com a cor da marca; o logo é
 * um BURACO nessa camada (feito com SVG <mask>). O buraco encolhe
 * de leve (antecipação) e depois explode em escala, revelando o
 * app por baixo.
 *
 * Dispara automaticamente no boot da sessão e a cada `playSplash()`
 * (login / logout).
 */

export function invalidateTipsCache() {
  /* legado — splash novo não usa dicas */
}

const SESSION_KEY = "__splash_shown_v3__";
const EVENT = "lovable:splash:play";

/** Dispara o splash de qualquer lugar do app. */
export function playSplash() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EVENT));
}

// Path do raio (mesmo ícone Zap do header). ViewBox 24x24, centro em (12,12).
const LOGO_PATH = "M13.5 2L4 14h7l-1.5 8L19 10h-7l1.5-8z";

export function PageSplash() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    return !sessionStorage.getItem(SESSION_KEY);
  });
  const [phase, setPhase] = useState<"in" | "anticipate" | "explode" | "done">("in");
  const [runId, setRunId] = useState(0);
  const maskId = useRef(`splash-mask-${Math.random().toString(36).slice(2, 8)}`).current;

  // Listener pra disparos imperativos (login/logout).
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

    // Sequência: respira pequeno (antecipação) → explode → fade
    const t1 = window.setTimeout(() => setPhase("anticipate"), 450);
    const t2 = window.setTimeout(() => setPhase("explode"), 850);
    const t3 = window.setTimeout(() => setPhase("done"), 1550);
    const t4 = window.setTimeout(() => setVisible(false), 1900);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [visible, runId]);

  if (!visible) return null;

  // Escala aplicada ao path do logo (o "buraco" da máscara).
  // Tamanho base do path no SVG: ocupa ~20 unidades dentro de viewBox 24.
  // Quando escala pra 80, o buraco engole a tela inteira.
  const scaleByPhase = {
    in: 1,
    anticipate: 0.7,
    explode: 80,
    done: 80,
  } as const;
  const currentScale = scaleByPhase[phase];

  // Duração diferente por fase pra dar o "snap" característico
  const transitionByPhase = {
    in: "transform 400ms cubic-bezier(.2,.8,.2,1)",
    anticipate: "transform 380ms cubic-bezier(.5,0,.75,0)",
    explode: "transform 650ms cubic-bezier(.7,0,.3,1)",
    done: "transform 0ms linear",
  } as const;

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
            {/* branco = visível (cobre tudo) */}
            <rect x="-50" y="-50" width="124" height="124" fill="white" />
            {/* preto = buraco no formato do logo (cresce e revela) */}
            <path
              d={LOGO_PATH}
              fill="black"
              style={{
                transformBox: "fill-box",
                transformOrigin: "center",
                transform: `scale(${currentScale})`,
                transition: transitionByPhase[phase],
              }}
            />
          </mask>
        </defs>

        {/* Camada que tampa a tela (cor da marca) com o logo recortado */}
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
          transition: opacity 320ms ease-out;
          /* sombra suave nas bordas pra dar profundidade */
          filter: drop-shadow(0 0 40px hsl(var(--primary) / 0.35));
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
