import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { createPortal } from "react-dom";
import { supabase } from "@/integrations/supabase/client";
import handVideo from "@/assets/maozinha.webm.asset.json";
import { Loader2, X } from "lucide-react";

interface MenuTip {
  id: string;
  route: string;
  title: string;
  content: string;
  icon: string;
}

const SKIP_ROUTES = ["/auth", "/result"];
const SPLASH_DURATION = 2800;

let tipsCache: MenuTip[] | null = null;

async function loadTips(): Promise<MenuTip[]> {
  if (tipsCache) return tipsCache;
  const { data, error } = await supabase
    .from("menu_tips")
    .select("id, route, title, content, icon")
    .eq("enabled", true)
    .order("sort_order", { ascending: true });
  if (error || !data) return [];
  tipsCache = data as MenuTip[];
  return tipsCache;
}

export function invalidateTipsCache() {
  tipsCache = null;
}

function pickTipForRoute(tips: MenuTip[], pathname: string): MenuTip | null {
  const exact = tips.filter((t) => t.route === pathname);
  if (exact.length) return exact[Math.floor(Math.random() * exact.length)];
  const prefix = tips.filter(
    (t) => t.route !== "/" && pathname.startsWith(t.route)
  );
  if (prefix.length) return prefix[Math.floor(Math.random() * prefix.length)];
  return null;
}

/**
 * Renderiza o vídeo num canvas removendo o fundo verde (chroma key).
 * Usa um <video> escondido como fonte e desenha frame a frame com
 * transparência onde o pixel é verde.
 */
function ChromaVideo({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    video.playbackRate = 1.6;

    const setup = () => {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
    };

    const draw = () => {
      if (video.readyState >= 2 && !video.paused && !video.ended) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = frame.data;
        // Chroma key: remove pixels onde o verde domina
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // verde dominante e brilhante = fundo
          if (g > 90 && g > r * 1.2 && g > b * 1.2) {
            data[i + 3] = 0; // transparente
          } else if (g > 70 && g > r * 1.05 && g > b * 1.05) {
            // borda suave — meia transparência pra suavizar serrilhado
            data[i + 3] = 80;
          }
        }
        ctx.putImageData(frame, 0, 0);
      }
      rafRef.current = requestAnimationFrame(draw);
    };

    video.addEventListener("loadedmetadata", setup);
    video.play().catch(() => {});
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      video.removeEventListener("loadedmetadata", setup);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [src]);

  return (
    <>
      <video
        ref={videoRef}
        src={src}
        autoPlay
        muted
        playsInline
        loop
        crossOrigin="anonymous"
        style={{ display: "none" }}
      />
      <canvas
        ref={canvasRef}
        className="splash-hand-canvas"
        style={{
          filter:
            "drop-shadow(0 0 40px hsl(var(--primary) / 0.7)) drop-shadow(0 0 80px hsl(265 80% 60% / 0.5))",
        }}
      />
    </>
  );
}

export function PageSplash() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [tip, setTip] = useState<MenuTip | null>(null);
  const firstRender = useRef(true);
  const prevPath = useRef(location.pathname);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      prevPath.current = location.pathname;
      return;
    }
    if (prevPath.current === location.pathname) return;
    prevPath.current = location.pathname;
    if (SKIP_ROUTES.some((r) => location.pathname.startsWith(r))) return;
    if (localStorage.getItem("splash_disabled") === "1") return;

    let cancelled = false;
    (async () => {
      const tips = await loadTips();
      if (cancelled) return;
      const chosen = pickTipForRoute(tips, location.pathname);
      setTip(chosen);
      setVisible(true);

      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        setVisible(false);
      }, SPLASH_DURATION);
    })();

    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  if (!visible) return null;

  // 24 partículas convergindo pra mão (efeito de atração)
  const attractors = Array.from({ length: 24 });
  // 16 raios de explosão saindo do centro
  const burst = Array.from({ length: 16 });

  return createPortal(
    <div
      className="fixed inset-0 z-[100] overflow-hidden splash-root"
      onClick={() => setVisible(false)}
    >
      {/* CENA DE FUNDO — gradiente cinematográfico */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1200px circle at 20% 10%, hsl(var(--primary) / 0.35), transparent 55%), radial-gradient(900px circle at 80% 90%, hsl(265 80% 60% / 0.35), transparent 60%), linear-gradient(135deg, hsl(222 47% 5%) 0%, hsl(222 47% 3%) 50%, hsl(222 47% 6%) 100%)",
        }}
      />
      <div className="absolute inset-0 bg-grid opacity-[0.06]" />

      {/* ORBS */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-primary/20 blur-3xl splash-orb pointer-events-none" />
      <div
        className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full blur-3xl splash-orb pointer-events-none"
        style={{ background: "hsl(265 80% 60% / 0.22)", animationDelay: "0.8s" }}
      />

      {/* RAIOS DE EXPLOSÃO partindo do centro */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-2 h-2">
          {burst.map((_, i) => (
            <span
              key={`ray-${i}`}
              className="splash-ray"
              style={
                {
                  ["--angle" as any]: `${(i * 360) / burst.length}deg`,
                  ["--delay" as any]: `${0.1 + (i % 4) * 0.05}s`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      </div>

      {/* PARTÍCULAS sendo atraídas pro centro */}
      <div className="absolute inset-0 pointer-events-none">
        {attractors.map((_, i) => {
          const angle = (i * 360) / attractors.length;
          const dist = 45 + (i % 5) * 8; // % do viewport
          return (
            <span
              key={`p-${i}`}
              className="splash-particle"
              style={
                {
                  ["--angle" as any]: `${angle}deg`,
                  ["--dist" as any]: `${dist}vmin`,
                  ["--delay" as any]: `${(i % 8) * 0.08}s`,
                  ["--hue" as any]: i % 2 === 0 ? "var(--primary)" : "265 80% 65%",
                } as React.CSSProperties
              }
            />
          );
        })}
      </div>

      {/* Botão fechar */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setVisible(false);
        }}
        className="absolute top-6 right-6 h-9 w-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white/80 hover:text-white transition-all backdrop-blur-md z-30"
        aria-label="Pular"
      >
        <X className="h-4 w-4" />
      </button>

      {/* MÃO EM PRIMEIRO PLANO — vídeo com chroma key */}
      <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
        <div className="splash-hand-wrap">
          <ChromaVideo src={handVideo.url} />
          {/* Onda de dissolução em volta da mão */}
          <span className="splash-shockwave" />
          <span className="splash-shockwave" style={{ animationDelay: "0.4s" }} />
        </div>
      </div>

      {/* CONTEÚDO — dica embaixo */}
      <div className="absolute bottom-10 left-0 right-0 z-30 px-6 flex flex-col items-center pointer-events-none">
        <div className="flex flex-col items-center gap-3 max-w-xl text-center splash-tip">
          {tip ? (
            <>
              <h2 className="text-xl md:text-3xl font-bold text-white tracking-tight drop-shadow-[0_2px_20px_rgba(0,0,0,0.8)]">
                <span className="mr-2">{tip.icon}</span>
                {tip.title}
              </h2>
              <p className="text-xs md:text-sm text-white/85 leading-relaxed max-w-md drop-shadow">
                {tip.content}
              </p>
            </>
          ) : (
            <div className="flex items-center gap-2 text-white/80">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Carregando...</span>
            </div>
          )}

          <div className="w-48 h-0.5 bg-white/15 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-gradient-to-r from-primary to-primary-glow rounded-full splash-progress" />
          </div>

          <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">
            Toque em qualquer lugar para pular
          </p>
        </div>
      </div>

      <style>{`
        .splash-root { animation: splashFadeIn 250ms ease-out; }
        @keyframes splashFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* Mão (canvas) em primeiro plano — ocupa 100% da largura no mobile */
        .splash-hand-wrap {
          position: relative;
          width: 100vw;
          max-width: 100vw;
          aspect-ratio: 1 / 1;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: handEntrance 700ms cubic-bezier(.2,.9,.25,1.2) both;
        }
        @media (min-width: 768px) {
          .splash-hand-wrap {
            width: min(72vw, 620px);
            max-width: 620px;
          }
        }
        .splash-hand-canvas {
          width: 100%;
          height: 100%;
          object-fit: cover;
          animation: handFloat 3s ease-in-out infinite;
        }
        @keyframes handEntrance {
          0%   { transform: scale(.2) rotate(-25deg); opacity: 0; filter: blur(20px); }
          60%  { transform: scale(1.08) rotate(4deg); opacity: 1; filter: blur(0); }
          100% { transform: scale(1) rotate(0); opacity: 1; }
        }
        @keyframes handFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }

        /* Onda de choque (dissolução) saindo da mão */
        .splash-shockwave {
          position: absolute;
          inset: 25%;
          border-radius: 50%;
          border: 2px solid hsl(var(--primary) / 0.6);
          opacity: 0;
          animation: shockwave 1.8s ease-out infinite;
          pointer-events: none;
        }
        @keyframes shockwave {
          0%   { transform: scale(.3); opacity: .9; border-width: 3px; }
          80%  { opacity: .15; border-width: 1px; }
          100% { transform: scale(2.2); opacity: 0; border-width: 1px; }
        }

        /* Raios da explosão central */
        .splash-ray {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 2px;
          height: 36vmin;
          background: linear-gradient(to top, hsl(var(--primary) / 0.9), transparent);
          transform-origin: 50% 0;
          transform: translate(-50%, 0) rotate(var(--angle)) scaleY(0);
          opacity: 0;
          animation: rayBurst 1.4s cubic-bezier(.15,.85,.2,1) var(--delay) forwards;
          filter: drop-shadow(0 0 8px hsl(var(--primary) / 0.8));
        }
        @keyframes rayBurst {
          0%   { transform: translate(-50%, 0) rotate(var(--angle)) scaleY(0); opacity: 0; }
          30%  { opacity: 1; }
          100% { transform: translate(-50%, 0) rotate(var(--angle)) scaleY(1); opacity: 0; }
        }

        /* Partículas convergindo (atração) */
        .splash-particle {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 6px;
          height: 6px;
          margin: -3px 0 0 -3px;
          border-radius: 50%;
          background: hsl(var(--hue));
          box-shadow: 0 0 12px hsl(var(--hue)), 0 0 24px hsl(var(--hue) / 0.6);
          transform: rotate(var(--angle)) translateY(calc(var(--dist) * -1)) rotate(calc(var(--angle) * -1));
          opacity: 0;
          animation: particleAttract 1.6s cubic-bezier(.55,.1,.25,1) var(--delay) forwards;
        }
        @keyframes particleAttract {
          0%   { transform: rotate(var(--angle)) translateY(calc(var(--dist) * -1)) rotate(calc(var(--angle) * -1)) scale(0); opacity: 0; }
          25%  { opacity: 1; }
          100% { transform: rotate(var(--angle)) translateY(0) rotate(calc(var(--angle) * -1)) scale(.2); opacity: 0; }
        }

        .splash-orb { animation: splashPulse 2.4s ease-in-out infinite; }
        @keyframes splashPulse {
          0%, 100% { opacity: .55; transform: scale(1); }
          50% { opacity: .9; transform: scale(1.08); }
        }

        .splash-tip {
          animation: tipRise 600ms ease-out 200ms both;
        }
        @keyframes tipRise {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .splash-progress {
          width: 0%;
          animation: splashProgressBar ${SPLASH_DURATION}ms linear forwards;
        }
        @keyframes splashProgressBar {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>,
    document.body
  );
}
