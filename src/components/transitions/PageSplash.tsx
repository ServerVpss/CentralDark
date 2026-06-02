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

// Rotas onde o splash NÃO deve aparecer (públicas / fluxos críticos)
const SKIP_ROUTES = ["/auth", "/result"];

// Duração total do splash (ms)
const SPLASH_DURATION = 2800;

// Cache em memória das dicas (evita refetch a cada transição)
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
  // match exato primeiro, depois prefixo
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
    // primeira renderização: não dispara splash
    if (firstRender.current) {
      firstRender.current = false;
      prevPath.current = location.pathname;
      return;
    }

    // mesmo path → ignora
    if (prevPath.current === location.pathname) return;
    prevPath.current = location.pathname;

    // rotas excluídas
    if (SKIP_ROUTES.some((r) => location.pathname.startsWith(r))) return;

    // usuário desativou splash?
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
      className="fixed inset-0 z-[100] overflow-hidden animate-fade-in"
      onClick={() => setVisible(false)}
    >
      {/* Vídeo em tela cheia como fundo */}
      <video
        src={handVideo.url}
        autoPlay
        muted
        playsInline
        loop
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay escuro com gradiente elegante por cima do vídeo */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1200px circle at 20% 10%, hsl(var(--primary) / 0.25), transparent 55%), radial-gradient(900px circle at 80% 90%, hsl(265 80% 60% / 0.25), transparent 60%), linear-gradient(135deg, hsl(222 47% 6% / 0.85) 0%, hsl(222 47% 4% / 0.7) 50%, hsl(222 47% 6% / 0.9) 100%)",
        }}
      />

      {/* Grid pattern sutil */}
      <div className="absolute inset-0 bg-grid opacity-[0.05]" />

      {/* Orbs flutuantes */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-primary/20 blur-3xl animate-pulse-glow pointer-events-none" />
      <div
        className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full blur-3xl animate-pulse-glow pointer-events-none"
        style={{ background: "hsl(265 80% 60% / 0.18)", animationDelay: "0.8s" }}
      />

      {/* Sparkles */}
      {Array.from({ length: 18 }).map((_, i) => (
        <span
          key={i}
          className="absolute h-1 w-1 rounded-full bg-primary/70 pointer-events-none"
          style={{
            top: `${(i * 53) % 100}%`,
            left: `${(i * 37) % 100}%`,
            animation: `pulse-glow ${1.5 + (i % 5) * 0.3}s ease-in-out ${
              (i % 7) * 0.15
            }s infinite`,
          }}
        />
      ))}

      {/* Botão fechar */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setVisible(false);
        }}
        className="absolute top-6 right-6 h-9 w-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white/80 hover:text-white transition-all backdrop-blur-md z-10"
        aria-label="Pular"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Conteúdo centralizado por cima do vídeo */}
      <div className="relative z-[2] h-full w-full flex items-center justify-center px-6">
        <div className="flex flex-col items-center gap-6 max-w-xl text-center animate-scale-in">
          {tip ? (
            <div className="space-y-3">
              <div className="text-6xl animate-fade-in drop-shadow-[0_0_30px_hsl(var(--primary)/0.6)]" style={{ animationDelay: "0.15s" }}>
                {tip.icon}
              </div>
              <h2
                className="text-2xl md:text-4xl font-bold text-white tracking-tight animate-fade-in drop-shadow-lg"
                style={{ animationDelay: "0.25s" }}
              >
                {tip.title}
              </h2>
              <p
                className="text-sm md:text-base text-white/85 leading-relaxed max-w-md mx-auto animate-fade-in drop-shadow"
                style={{ animationDelay: "0.35s" }}
              >
                {tip.content}
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-white/80">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Carregando...</span>
            </div>
          )}

          <div className="w-48 h-0.5 bg-white/15 rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary-glow rounded-full"
              style={{
                animation: `splashProgress ${SPLASH_DURATION}ms linear forwards`,
              }}
            />
          </div>

          <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">
            Toque em qualquer lugar para pular
          </p>
        </div>
      </div>

      <style>{`
        @keyframes splashProgress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>,
    document.body
  );
}
