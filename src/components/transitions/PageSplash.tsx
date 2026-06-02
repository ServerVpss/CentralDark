import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { createPortal } from "react-dom";
import { supabase } from "@/integrations/supabase/client";
import handVideo from "@/assets/maozinha-clean.webm.asset.json";
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

  return createPortal(
    <div
      className="fixed inset-0 z-[100] overflow-hidden splash-root"
      onClick={() => setVisible(false)}
    >
      {/* Fundo cinematográfico estático (sem animação pesada) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1000px circle at 20% 10%, hsl(var(--primary) / 0.28), transparent 55%), radial-gradient(800px circle at 80% 90%, hsl(265 80% 60% / 0.28), transparent 60%), linear-gradient(135deg, hsl(222 47% 5%) 0%, hsl(222 47% 3%) 50%, hsl(222 47% 6%) 100%)",
        }}
      />

      {/* Botão fechar */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setVisible(false);
        }}
        className="absolute top-6 right-6 h-9 w-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white/80 hover:text-white transition-colors backdrop-blur-md z-30"
        aria-label="Pular"
      >
        <X className="h-4 w-4" />
      </button>

      {/* MÃO — vídeo webm já com transparência, sem chroma key em JS */}
      <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
        <video
          src={handVideo.url}
          autoPlay
          muted
          playsInline
          loop
          preload="auto"
          className="splash-hand-video"
        />
      </div>

      {/* Dica */}
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
        .splash-root { animation: splashFadeIn 220ms ease-out; }
        @keyframes splashFadeIn { from { opacity: 0; } to { opacity: 1; } }

        .splash-hand-video {
          width: 100vw;
          max-width: 100vw;
          height: auto;
          object-fit: contain;
          filter: drop-shadow(0 10px 40px hsl(var(--primary) / 0.45));
          animation: handEntrance 600ms cubic-bezier(.2,.9,.25,1.1) both;
        }
        @media (min-width: 768px) {
          .splash-hand-video {
            width: min(70vw, 600px);
            max-width: 600px;
          }
        }
        @keyframes handEntrance {
          from { transform: scale(.85); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }

        .splash-tip { animation: tipRise 500ms ease-out 150ms both; }
        @keyframes tipRise {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .splash-progress {
          width: 0%;
          animation: splashProgressBar ${SPLASH_DURATION}ms linear forwards;
        }
        @keyframes splashProgressBar { from { width: 0%; } to { width: 100%; } }
      `}</style>
    </div>,
    document.body
  );
}
