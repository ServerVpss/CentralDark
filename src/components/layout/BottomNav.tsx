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
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/components/auth/AuthProvider";

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

// Item separado pro logout (ação especial, não navegação)
const LOGOUT_COLOR = "from-zinc-600 to-zinc-800";

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuthContext();
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

            {/* Sair da conta */}
            <button
              onClick={async (e) => {
                e.stopPropagation();
                setOpen(false);
                await signOut();
                navigate("/auth");
              }}
              className={cn(
                "flex flex-col items-center gap-2 transition-all duration-300",
                open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
              )}
              style={{ transitionDelay: open ? `${SHORTCUTS.length * 40}ms` : "0ms" }}
            >
              <div
                className={cn(
                  "h-14 w-14 rounded-2xl bg-gradient-to-br shadow-lg flex items-center justify-center ring-1 ring-destructive/40",
                  LOGOUT_COLOR
                )}
              >
                <LogOut className="h-6 w-6 text-destructive" strokeWidth={2.25} />
              </div>
              <span className="text-[11px] font-medium text-destructive">Sair</span>
            </button>
          </div>
        </div>
      </div>

      {/* Barra inferior com notch (SVG) — fundo escuro premium */}
      <nav className="lg:hidden fixed inset-x-0 bottom-0 z-40 pointer-events-none">
        <div className="relative h-[82px] pointer-events-auto">
          {/* Fundo com notch arredondado */}
          <svg
            className="absolute inset-0 w-full h-full drop-shadow-[0_-10px_28px_rgba(0,0,0,0.55)]"
            viewBox="0 0 400 82"
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
              d="M0,18 L155,18 C164,18 168,22 172,30 C180,46 190,52 200,52 C210,52 220,46 228,30 C232,22 236,18 245,18 L400,18 L400,82 L0,82 Z"
              fill="url(#bnav-bg)"
              stroke="hsl(var(--border) / 0.6)"
              strokeWidth="0.5"
            />
          </svg>

          {/* Itens da esquerda — centralizados verticalmente, abaixo do notch */}
          <div className="absolute left-0 right-1/2 bottom-3 flex items-center justify-around pr-14">
            {TABS_LEFT.map((tab) => (
              <TabButton key={tab.path} tab={tab} active={isActive(tab.path)} onClick={go} />
            ))}
          </div>

          {/* Itens da direita */}
          <div className="absolute left-1/2 right-0 bottom-3 flex items-center justify-around pl-14">
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
          </button>
        </div>
        {/* Safe-area no iPhone */}
        <div className="h-[env(safe-area-inset-bottom)] bg-background pointer-events-auto" />
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
            ? "text-primary scale-110"
            : "text-muted-foreground group-active:text-foreground"
        )}
        strokeWidth={active ? 2.4 : 2}
        fill={active ? "currentColor" : "none"}
      />
      {active && (
        <span className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-primary" />
      )}
    </button>
  );
}
