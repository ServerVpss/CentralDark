import { useLocation, useNavigate } from "react-router-dom";
import { Bell, User, LogOut, Settings, Crown, Search, Command, CreditCard, Shield, MessageSquare, CheckCircle, Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useNotifications } from "@/hooks/useNotifications";

const routeNames: Record<string, { title: string; section?: string }> = {
  "/": { title: "Dashboard" },
  "/bots": { title: "Meu Bot", section: "Operações" },
  "/consultas": { title: "Consultas", section: "Operações" },
  "/logs": { title: "Logs de Consultas", section: "Operações" },
  "/telegram-users": { title: "Usuários", section: "Gestão" },
  "/plans": { title: "Planos", section: "Gestão" },
  "/pix": { title: "Transações PIX", section: "Gestão" },
  "/security": { title: "Segurança", section: "Sistema" },
  "/settings": { title: "Configurações", section: "Sistema" },
};

const iconMap = {
  payment: CreditCard,
  subscription: CreditCard,
  query: MessageSquare,
  security: Shield,
  message: MessageSquare,
  success: CheckCircle,
  warning: Shield,
};

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const { user, profile, signOut } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadActivities, unreadCount, loading, refresh, markAsRead, markAllAsRead, activities } = useNotifications();

  const getRouteInfo = () => {
    const exact = routeNames[location.pathname];
    if (exact) return exact;
    for (const [path, info] of Object.entries(routeNames)) {
      if (path !== "/" && location.pathname.startsWith(path)) return info;
    }
    return { title: "TelePanel" };
  };

  const route = getRouteInfo();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth", { replace: true });
  };

  const openSearch = () => {
    const event = new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true });
    document.dispatchEvent(event);
  };

  return (
    <header className={cn(
      "sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border/40 glass px-6",
      className
    )}>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        {route.section && (
          <>
            <span className="text-muted-foreground/70 font-medium">{route.section}</span>
            <span className="text-muted-foreground/30">/</span>
          </>
        )}
        <span className="font-semibold text-foreground tracking-tight">{route.title}</span>
      </div>

      {/* Right side */}
      <div className="gap-2 flex items-center justify-end">
        {/* Search */}
        <button
          onClick={openSearch}
          className="hidden gap-2 h-9 bg-muted/40 border border-border/60 rounded-xl text-xs text-muted-foreground hover:bg-muted/60 hover:border-primary/30 transition-all group flex-row sm:flex items-start justify-start px-0 pr-0 pl-0"
        >
          <Search className="h-3.5 w-3.5 group-hover:text-primary transition-colors" strokeWidth={2.25} />
          <span className="font-medium">Buscar...</span>
          <kbd className="h-5 items-center gap-0.5 rounded-md border border-border bg-background/80 px-1.5 font-mono text-[9px] hidden md:inline-flex">
            <Command className="h-2.5 w-2.5" />K
          </kbd>
        </button>

        <ThemeToggle />

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9 hover:bg-muted/60">
              <Bell className="h-[18px] w-[18px] text-muted-foreground" strokeWidth={2.25} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-primary text-[9px] font-bold text-primary-foreground flex items-center justify-center shadow-[0_0_10px_hsl(var(--primary)/0.6)] animate-pulse-glow">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span className="text-xs">Notificações {unreadCount > 0 && `(${unreadCount})`}</span>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={(e) => { e.stopPropagation(); markAllAsRead(); }}>
                    Limpar
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); refresh(); }}>
                  <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} />
                </Button>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {loading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2" />
              </div>
            ) : activities.length === 0 ? (
              <div className="p-6 text-center">
                <Clock className="h-6 w-6 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-xs text-muted-foreground">Nenhuma notificação</p>
              </div>
            ) : (
              <ScrollArea className="h-[250px]">
                <div className="p-1">
                  {(unreadActivities.length > 0 ? unreadActivities : activities).slice(0, 10).map((activity) => {
                    const Icon = iconMap[activity.type] || MessageSquare;
                    return (
                      <div
                        key={activity.id}
                        onClick={() => markAsRead(activity.id)}
                        className="flex items-start gap-2.5 rounded-lg p-2 hover:bg-muted/50 transition-colors cursor-pointer"
                      >
                        <Icon className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium leading-tight">{activity.title}</p>
                          <p className="text-[10px] text-muted-foreground truncate mt-0.5">{activity.description}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground shrink-0">{activity.time}</span>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 px-2 gap-2 rounded-lg">
              <div className="relative h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-lg shadow-primary/30">
                <User className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="hidden lg:flex flex-col items-start">
                <span className="text-xs font-medium text-foreground leading-tight">
                  {profile?.full_name || user?.email?.split("@")[0] || "Usuário"}
                </span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 leading-tight">
                  <Crown className="h-2.5 w-2.5 text-primary" />
                  Admin
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="text-xs">
              {profile?.full_name || "Usuário"}
              <p className="text-[10px] text-muted-foreground font-normal truncate">{user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/settings")} className="cursor-pointer text-xs">
              <Settings className="mr-2 h-3.5 w-3.5" />
              Configurações
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive text-xs">
              <LogOut className="mr-2 h-3.5 w-3.5" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
