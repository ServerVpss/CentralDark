import { Search, Sun, Moon, Bell, ChevronDown, User, Terminal, LogOut, Settings, UserCog, Check, Menu } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import NotificationBell from "@/components/dashboard/NotificationBell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Notif = { id: number; title: string; desc: string; time: string; read: boolean };

const initialNotifs: Notif[] = [
  { id: 1, title: "Nova instância conectada", desc: "Instância 06 entrou online", time: "agora", read: false },
  { id: 2, title: "Webhook falhou", desc: "POST /events retornou 500", time: "2m", read: false },
  { id: 3, title: "Backup concluído", desc: "Snapshot diário OK (412MB)", time: "1h", read: true },
];

export function Topbar({ onToggleHacker, onOpenSidebar }: { onToggleHacker?: () => void; onOpenSidebar?: () => void }) {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  const [notifs, setNotifs] = useState(initialNotifs);
  const inputRef = useRef<HTMLInputElement>(null);
  const unread = notifs.filter((n) => !n.read).length;
  const { user, signOut } = useAuth();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const toggleTheme = () => {
    setDark((prevDark) => {
      const nextDark = !prevDark;
      if (nextDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      toast.message(nextDark ? "Modo escuro" : "Modo claro", {
        description: "Tema alternado com sucesso.",
      });
      return nextDark;
    });
  };

  const markAllRead = () => {
    setNotifs((ns) => ns.map((n) => ({ ...n, read: true })));
    toast.success("Notificações marcadas como lidas");
  };

  return (
    <header className="h-16 shrink-0 border-b border-border bg-card/40 backdrop-blur-xl flex items-center px-3 md:px-6 gap-2 md:gap-4">
      <button
        onClick={onOpenSidebar}
        className="lg:hidden w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-primary shrink-0"
        aria-label="Abrir menu"
      >
        <Menu className="w-4 h-4" />
      </button>
      <form
        className="flex-1 max-w-xl relative"
        onSubmit={(e) => {
          e.preventDefault();
          const v = inputRef.current?.value.trim();
          if (v) toast.info(`Buscando: "${v}"`, { description: "Resultados em breve." });
        }}
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Buscar..."
          className="w-full h-10 pl-10 pr-16 bg-input/60 border border-border rounded-lg text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:border-glow transition"
        />
        <kbd className="hidden md:block absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
          Ctrl K
        </kbd>
      </form>
      <div className="flex items-center gap-2 md:gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/40">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
          <span className="text-xs font-medium text-primary">Conectado</span>
        </div>
        <button
          onClick={onToggleHacker}
          title="Ativar Hacker UI Mode"
          className="hidden sm:flex items-center gap-1.5 h-9 px-3 rounded-lg border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary transition font-mono text-xs tracking-wider"
        >
          <Terminal className="w-3.5 h-3.5" />
          H4CK
        </button>
        <button
          onClick={toggleTheme}
          className="hidden md:flex w-9 h-9 rounded-lg border border-border items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition"
        >
          {dark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition relative">
              <NotificationBell />
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground flex items-center justify-center">
                  {unread}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 bg-card/95 border-border backdrop-blur-xl">
            <div className="flex items-center justify-between px-2 py-1.5">
              <DropdownMenuLabel className="text-xs tracking-widest uppercase font-display">
                Notificações
              </DropdownMenuLabel>
              <button
                onClick={markAllRead}
                className="text-[10px] font-mono text-primary hover:underline flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Marcar lidas
              </button>
            </div>
            <DropdownMenuSeparator />
            {notifs.map((n) => (
              <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-0.5 py-2">
                <div className="flex items-center gap-2 w-full">
                  {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                  <span className="text-xs font-semibold flex-1">{n.title}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">{n.time}</span>
                </div>
                <span className="text-[10px] text-muted-foreground pl-3.5">{n.desc}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 pl-1.5 md:pl-2 pr-1.5 md:pr-3 py-1.5 rounded-lg border border-border hover:border-primary/40 transition">
              <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="text-left hidden md:block">
                <p className="text-xs font-semibold leading-tight truncate max-w-[100px]">
                  {user?.email?.split('@')[0] || "Usuário"}
                </p>
                <p className="text-[10px] text-muted-foreground leading-tight">Workspace</p>
              </div>
              <ChevronDown className="w-3 h-3 text-muted-foreground hidden md:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-card/95 border-border backdrop-blur-xl">
            <DropdownMenuLabel className="text-xs truncate">{user?.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => toast.info("Perfil")}>
              <UserCog className="w-3.5 h-3.5 mr-2" /> Meu perfil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info("Configurações")}>
              <Settings className="w-3.5 h-3.5 mr-2" /> Configurações
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut()}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="w-3.5 h-3.5 mr-2" /> Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
