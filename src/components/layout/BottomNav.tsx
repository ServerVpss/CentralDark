import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Bot,
  MessageSquare,
  CreditCard,
  Plus,
  X,
  Bell,
  Search,
  Megaphone,
  Database,
  Shield,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Barra inferior fixa estilo "notch + FAB central".
 * Só aparece no mobile (lg:hidden).
 */
type Tab = {
  label: string;
  icon: typeof Home;
  path: string;
};

const TABS_LEFT: Tab[] = [
  { label: "Início", icon: Home, path: "/" },
  { label: "Bots", icon: Bot, path: "/bots" },
];

const TABS_RIGHT: Tab[] = [
  { label: "Consultas", icon: MessageSquare, path: "/consultas" },
  { label: "PIX", icon: CreditCard, path: "/pix" },
];

type Shortcut = {
  label: string;
  icon: typeof Plus;
  path: string;
  color: string;
};

const SHORTCUTS: Shortcut[] = [
  { label: "Broadcast", icon: Megaphone, path: "/bots", color: "from-amber-400 to-orange-500" },
  { label: "Logs", icon: Activity, path: "/query-logs", color: "from-sky-400 to-blue-500" },
  { label: "Buscar", icon: Search, path: "/consultas", color: "from-violet-400 to-purple-500" },
  { label: "Segurança", icon: Shield, path: "/security", color: "from-emerald-400 to-green-500" },
  { label: "Backup", icon: Database, path: "/settings", color: "from-rose-400 to-pink-500" },
  { label: "Alertas", icon: Bell, path: "/", color: "from-fuchsia-400 to-pink-500" },
];

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Trava scroll quando o menu de atalhos está aberto
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <>
      {/* Overlay de atalhos do botão "+" */}
      <div
        className={cn(
          "lg:hidden fixed inset-0 z-40 transition-all duration-300",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setOpen(false)}
      >
        <div className="absolute inset-0 bg-background/70 backdrop-blur-xl" />
        <div className="absolute inset-x-0 bottom-28 px-6">
          <p className="text-center text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-5">
            Atalhos rápidos
          </p>
          <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
            {SHORTCUTS.map((s, i) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.label}
                  onClick={(e) => {
                    e.stopPropagation();
                    go(s.path);
                  }}
                  className={cn(
                    "flex flex-col items-center gap-2 transition-all duration-300",
                    open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
                  )}
                  style={{ transitionDelay: open ? `${i * 40}ms` : "0ms" }}
                >
                  <div
                    className={cn(
                      "h-14 w-14 rounded-2xl bg-gradient-to-br shadow-lg flex items-center justify-center",
                      s.color
                    )}
                  >
                    <Icon className="h-6 w-6 text-white" strokeWidth={2.25} />
                  </div>
                  <span className="text-[11px] font-medium text-foreground">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Barra inferior com notch (SVG) */}
      <nav className="lg:hidden fixed inset-x-0 bottom-0 z-40 pointer-events-none">
        <div className="relative h-[78px] pointer-events-auto">
          {/* Fundo com notch desenhado em SVG pra ficar smooth */}
          <svg
            className="absolute inset-0 w-full h-full drop-shadow-[0_-8px_24px_rgba(0,0,0,0.45)]"
            viewBox="0 0 400 78"
            preserveAspectRatio="none"
            aria-hidden
          >
            <defs>
              <linearGradient id="bnav-bg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--card))" />
                <stop offset="100%" stopColor="hsl(var(--background))" />
              </linearGradient>
            </defs>
            <path
              d="M0,14 L160,14 C168,14 172,18 175,24 C182,40 192,48 200,48 C208,48 218,40 225,24 C228,18 232,14 240,14 L400,14 L400,78 L0,78 Z"
              fill="url(#bnav-bg)"
              stroke="hsl(var(--border))"
              strokeWidth="0.5"
            />
          </svg>

          {/* Itens da esquerda */}
          <div className="absolute inset-y-0 left-0 right-1/2 flex items-end justify-around pb-3 pr-12">
            {TABS_LEFT.map((tab) => (
              <TabButton key={tab.path} tab={tab} active={isActive(tab.path)} onClick={go} />
            ))}
          </div>

          {/* Itens da direita */}
          <div className="absolute inset-y-0 left-1/2 right-0 flex items-end justify-around pb-3 pl-12">
            {TABS_RIGHT.map((tab) => (
              <TabButton key={tab.path} tab={tab} active={isActive(tab.path)} onClick={go} />
            ))}
          </div>

          {/* FAB central */}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Abrir atalhos"
            className={cn(
              "absolute left-1/2 -translate-x-1/2 -top-4 h-16 w-16 rounded-full",
              "bg-gradient-to-br from-primary via-primary to-amber-500",
              "shadow-[0_10px_30px_-6px_hsl(var(--primary)/0.6),inset_0_1px_0_hsl(0_0%_100%/0.25)]",
              "flex items-center justify-center text-primary-foreground",
              "transition-transform duration-300 active:scale-95",
              open && "rotate-45"
            )}
          >
            {open ? (
              <X className="h-7 w-7" strokeWidth={2.5} />
            ) : (
              <Plus className="h-7 w-7" strokeWidth={2.5} />
            )}
            {/* Halo pulsante */}
            <span className="absolute inset-0 rounded-full ring-2 ring-primary/30 animate-ping" />
          </button>
        </div>
        {/* Safe-area no iPhone */}
        <div className="h-[env(safe-area-inset-bottom)] bg-card pointer-events-auto" />
      </nav>
    </>
  );
}

function TabButton({
  tab,
  active,
  onClick,
}: {
  tab: Tab;
  active: boolean;
  onClick: (path: string) => void;
}) {
  const Icon = tab.icon;
  return (
    <button
      onClick={() => onClick(tab.path)}
      aria-label={tab.label}
      className="relative flex items-center justify-center h-12 w-12 group"
    >
      <Icon
        className={cn(
          "h-[26px] w-[26px] transition-all duration-200",
          active
            ? "text-primary-foreground scale-110 drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]"
            : "text-primary-foreground/70 group-active:text-primary-foreground"
        )}
        strokeWidth={active ? 2.4 : 2}
        fill={active ? "currentColor" : "none"}
      />
      {active && (
        <span className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-primary-foreground" />
      )}
    </button>
  );
}
