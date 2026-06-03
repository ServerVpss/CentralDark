import { useEffect, useMemo, useRef, useState } from "react";

export function invalidateTipsCache() {
  /* legado */
}

const SESSION_KEY = "__splash_shown_v8__";
const EVENT = "lovable:splash:play";
const DURATION = 1850; // duração total em ms
const ROOT_SCALE_CLASS = "splash-app-scaling";

// Path do raio (mesmo do <Logo />)
const LOGO_PATH = "M13.5 2L4 14h7l-1.5 8L19 10h-7l1.5-8z";

export function playSplash() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EVENT));
}

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

  // Ouve disparos manuais (playSplash())
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

  // Ciclo de vida da splash: aplica classe no <html> pra escalar o app
  // por baixo, marca sessão, agenda remoção.
  useEffect(() => {
    if (!visible) return;
    sessionStorage.setItem(SESSION_KEY, "1");
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dur = reduceMotion ? 280 : DURATION;

    const html = document.documentElement;
    html.classList.add(ROOT_SCALE_CLASS);

    timeoutRef.current = window.setTimeout(() => {
      setVisible(false);
      html.classList.remove(ROOT_SCALE_CLASS);
    }, dur);

    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      html.classList.remove(ROOT_SCALE_CLASS);
    };
  }, [visible, runId]);

  if (!visible) return null;

  return (
    <>
      {/*
        Overlay da splash. O fundo é transparente: quem cobre a tela é o
        <rect> dentro do SVG, que tem um BURACO em forma de logo (via mask).
        Quando o logo-máscara explode, o buraco vira a tela inteira e o
        app real (renderizado abaixo) aparece por trás.
      */}
      <div aria-hidden className="splash-root" key={runId}>
        {/* Flash branco bem rápido — sensação de "brilho" no momento do reveal */}
        <div className="splash-flash" />

        <svg
          className="splash-stage"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <mask id={maskId} maskUnits="userSpaceOnUse" x="-200" y="-200" width="424" height="424">
              {/* Tudo branco = visível; o logo preto vira BURACO */}
              <rect x="-200" y="-200" width="424" height="424" fill="white" />
              <path
                d={LOGO_PATH}
                fill="black"
                className="splash-logo splash-logo--mask"
              />
            </mask>
          </defs>

          {/* Camada colorida que cobre a tela, com o buraco do logo */}
          <rect
            x="-200"
            y="-200"
            width="424"
            height="424"
            fill="hsl(var(--primary))"
            mask={`url(#${maskId})`}
            className="splash-bg"
          />

          {/* Logo branco visível por cima — pulsa, encolhe e some logo
              antes do buraco explodir, dando a ilusão de continuidade */}
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
            background: transparent;
            overflow: hidden;
            contain: layout paint style;
            will-change: opacity;
            animation: splash-root-exit 1850ms cubic-bezier(.4,0,.2,1) forwards;
          }

          /* Flash branco curto, sumindo antes da explosão terminar */
          .splash-flash {
            position: absolute;
            inset: 0;
            background: #fff;
            opacity: 0;
            mix-blend-mode: screen;
            animation: splash-flash 1850ms cubic-bezier(.4,0,.2,1) forwards;
          }

          .splash-stage {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            display: block;
            transform: translateZ(0);
            filter: drop-shadow(0 8px 24px hsl(var(--primary) / 0.35));
          }

          .splash-logo {
            transform-box: fill-box;
            transform-origin: center;
            will-change: transform, opacity;
            animation-duration: 1850ms;
            animation-timing-function: cubic-bezier(.4,0,.2,1);
            animation-fill-mode: forwards;
          }

          .splash-logo--fill {
            animation-name: splash-logo-fill;
          }

          .splash-logo--mask {
            animation-name: splash-logo-mask;
          }

          /* App por baixo escala suave de 1.06 → 1 (estilo Twitter) */
          :root.${ROOT_SCALE_CLASS} body {
            transform-origin: center center;
            animation: splash-app-zoom 1850ms cubic-bezier(.22,1,.36,1) forwards;
            will-change: transform, opacity;
          }

          @keyframes splash-app-zoom {
            0%   { transform: scale(1.06); opacity: 0; }
            22%  { opacity: 0; }
            55%  { opacity: 1; }
            100% { transform: scale(1);    opacity: 1; }
          }

          /* Overlay segura até o final e some no último instante,
             porque o reveal real é a máscara explodindo */
          @keyframes splash-root-exit {
            0%, 92% { opacity: 1; }
            100%    { opacity: 0; }
          }

          @keyframes splash-flash {
            0%   { opacity: 0; }
            55%  { opacity: 0; }
            66%  { opacity: 0.55; }
            82%  { opacity: 0; }
            100% { opacity: 0; }
          }

          /* Logo branco: aparece, pulsa, encolhe e some antes da explosão */
          @keyframes splash-logo-fill {
            0%   { transform: scale(0.86); opacity: 0; }
            14%  { transform: scale(1);    opacity: 1; }
            44%  { transform: scale(1);    opacity: 1; }
            58%  { transform: scale(0.78); opacity: 1; }
            68%  { transform: scale(0.78); opacity: 0; }
            100% { transform: scale(0.78); opacity: 0; }
          }

          /* Máscara: mesmo movimento do logo, e depois EXPLODE pra revelar o app */
          @keyframes splash-logo-mask {
            0%   { transform: scale(0.86); }
            14%  { transform: scale(1); }
            44%  { transform: scale(1); }
            58%  { transform: scale(0.78); }
            86%  { transform: scale(48); }
            100% { transform: scale(140); }
          }

          @media (prefers-reduced-motion: reduce) {
            .splash-root,
            .splash-flash,
            .splash-logo,
            :root.${ROOT_SCALE_CLASS} body {
              animation-duration: 280ms !important;
            }
          }
        `}</style>
      </div>
    </>
  );
}
