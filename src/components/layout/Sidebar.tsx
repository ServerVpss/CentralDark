import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Bot,
  Users,
  Settings,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Zap,
  Search,
  X,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Bot, label: "Meu Bot", path: "/bots" },
  { icon: Users, label: "Usuários", path: "/telegram-users" },
  { icon: CreditCard, label: "Planos", path: "/plans" },
  { icon: History, label: "Consultas", path: "/logs" },
  { icon: Search, label: "Testar", path: "/consultas" },
  { icon: Settings, label: "Configurações", path: "/settings" },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [activeBots, setActiveBots] = useState(0);
  const location = useLocation();

  // Fetch real bot count from database
  useEffect(() => {
    const fetchBotCount = async () => {
      const { count } = await supabase
        .from("telegram_bots")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);
      
      setActiveBots(count || 0);
    };

    fetchBotCount();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("sidebar_bots_count")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "telegram_bots" },
        () => {
          fetchBotCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleNavClick = () => {
    // Close sidebar on mobile when clicking a link
    if (onClose) {
      onClose();
    }
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out",
        "bg-sidebar border-r border-sidebar-border",
        // Mobile: slide in/out
        "lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
        // Desktop: collapse behavior
        collapsed ? "lg:w-20" : "lg:w-64",
        // Mobile: always full width when open
        "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
        <div className={cn("flex items-center gap-3", collapsed && "lg:justify-center lg:w-full")}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 glow-primary">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <span className={cn(
            "text-lg font-bold gradient-text",
            collapsed && "lg:hidden"
          )}>
            TelePanel
          </span>
        </div>
        
        {/* Close button on mobile */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 lg:hidden"
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Collapse button on desktop */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "h-8 w-8 hidden lg:flex",
            collapsed && "absolute -right-4 top-4 bg-card border border-border rounded-full"
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-3 mt-4">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200",
                "hover:bg-sidebar-accent text-sidebar-foreground",
                isActive && "bg-primary/10 text-primary border border-primary/20",
                collapsed && "lg:justify-center lg:px-2"
              )}
            >
              <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-primary")} />
              <span className={cn(
                "text-sm font-medium",
                isActive && "text-primary",
                collapsed && "lg:hidden"
              )}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </nav>

      {/* Status indicator */}
      <div className={cn(
        "absolute bottom-4 left-3 right-3 rounded-lg p-3 glass",
        collapsed && "lg:left-2 lg:right-2"
      )}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-3 w-3 rounded-full bg-success animate-pulse" />
            <div className="absolute inset-0 h-3 w-3 rounded-full bg-success animate-ping opacity-50" />
          </div>
          <div className={cn(
            "flex-1 min-w-0",
            collapsed && "lg:hidden"
          )}>
            <p className="text-xs font-medium text-foreground truncate">Sistema Online</p>
            <p className="text-xs text-muted-foreground">
              {activeBots} {activeBots === 1 ? "bot ativo" : "bots ativos"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
