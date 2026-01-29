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
  Wallet,
  Shield,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const menuItems = [
  { 
    icon: LayoutDashboard, 
    label: "Dashboard", 
    path: "/",
    gradient: "from-amber-500 to-orange-500",
    glowColor: "amber"
  },
  { 
    icon: Bot, 
    label: "Meu Bot", 
    path: "/bots",
    gradient: "from-cyan-500 to-blue-500",
    glowColor: "cyan"
  },
  { 
    icon: Users, 
    label: "Usuários", 
    path: "/telegram-users",
    gradient: "from-emerald-500 to-green-500",
    glowColor: "emerald"
  },
  { 
    icon: CreditCard, 
    label: "Planos", 
    path: "/plans",
    gradient: "from-violet-500 to-purple-500",
    glowColor: "violet"
  },
  { 
    icon: Wallet, 
    label: "Transações PIX", 
    path: "/pix",
    gradient: "from-green-500 to-emerald-500",
    glowColor: "green"
  },
  { 
    icon: History, 
    label: "Consultas", 
    path: "/logs",
    gradient: "from-blue-500 to-indigo-500",
    glowColor: "blue"
  },
  { 
    icon: Search, 
    label: "Testar", 
    path: "/consultas",
    gradient: "from-pink-500 to-rose-500",
    glowColor: "pink"
  },
  { 
    icon: Shield, 
    label: "Segurança", 
    path: "/security",
    gradient: "from-red-500 to-orange-500",
    glowColor: "red"
  },
  { 
    icon: Settings, 
    label: "Configurações", 
    path: "/settings",
    gradient: "from-slate-400 to-slate-500",
    glowColor: "slate"
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [activeBots, setActiveBots] = useState(0);
  const [activeSubscribers, setActiveSubscribers] = useState(0);
  const location = useLocation();

  // Fetch real data from database
  useEffect(() => {
    const fetchData = async () => {
      const [{ count: botsCount }, { count: subsCount }] = await Promise.all([
        supabase
          .from("telegram_bots")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true),
        supabase
          .from("telegram_subscriptions")
          .select("*", { count: "exact", head: true })
          .gte("expires_at", new Date().toISOString()),
      ]);
      
      setActiveBots(botsCount || 0);
      setActiveSubscribers(subsCount || 0);
    };

    fetchData();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("sidebar_stats")
      .on("postgres_changes", { event: "*", schema: "public", table: "telegram_bots" }, fetchData)
      .on("postgres_changes", { event: "*", schema: "public", table: "telegram_subscriptions" }, fetchData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-out",
        "border-r border-border/50",
        "lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
        collapsed ? "lg:w-[72px]" : "lg:w-72",
        "w-72"
      )}
      style={{
        background: "linear-gradient(180deg, hsl(220 20% 6%) 0%, hsl(220 20% 4%) 100%)",
      }}
    >
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-1/2 -right-12 w-32 h-32 rounded-full bg-accent/5 blur-3xl" />
      </div>

      {/* Logo */}
      <div className="relative flex h-20 items-center justify-between px-5 border-b border-border/30">
        <div className={cn("flex items-center gap-3", collapsed && "lg:justify-center lg:w-full")}>
          <div className="relative group">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary to-amber-600 blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-amber-600 shadow-lg">
              <Zap className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <div className={cn("flex flex-col", collapsed && "lg:hidden")}>
            <span className="text-xl font-bold text-gradient-gold">
              TelePanel
            </span>
            <span className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">
              Premium Admin
            </span>
          </div>
        </div>
        
        {/* Close button on mobile */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 lg:hidden hover:bg-white/5"
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Collapse button on desktop */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "h-7 w-7 hidden lg:flex rounded-full hover:bg-white/5 border border-border/50",
            collapsed && "absolute -right-3.5 top-1/2 -translate-y-1/2 bg-card shadow-lg"
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="relative flex flex-col gap-1 p-3 mt-2 overflow-y-auto" style={{ height: "calc(100vh - 200px)" }}>
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path || 
            (item.path !== "/" && location.pathname.startsWith(item.path));
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200",
                "hover:bg-white/5",
                isActive && "bg-white/5",
                collapsed && "lg:justify-center lg:px-2"
              )}
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 rounded-r-full bg-gradient-to-b from-primary to-amber-600 shadow-lg shadow-primary/50" />
              )}

              {/* Icon with gradient background */}
              <div className={cn(
                "relative flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200",
                isActive 
                  ? `bg-gradient-to-br ${item.gradient} shadow-lg` 
                  : "bg-white/5 group-hover:bg-white/10"
              )}>
                <item.icon className={cn(
                  "h-[18px] w-[18px] transition-colors",
                  isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground"
                )} />
              </div>

              {/* Label */}
              <span className={cn(
                "text-sm font-medium transition-colors",
                isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground",
                collapsed && "lg:hidden"
              )}>
                {item.label}
              </span>

              {/* Hover glow effect */}
              <div className={cn(
                "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none",
                isActive && "opacity-50"
              )} style={{
                background: `radial-gradient(circle at left, hsl(38 95% 55% / 0.1), transparent 70%)`,
              }} />
            </NavLink>
          );
        })}
      </nav>

      {/* Status Card */}
      <div className={cn(
        "absolute bottom-4 left-3 right-3 rounded-2xl p-4 overflow-hidden",
        collapsed && "lg:left-2 lg:right-2 lg:p-2"
      )} style={{
        background: "linear-gradient(135deg, hsl(220 20% 10%) 0%, hsl(220 20% 8%) 100%)",
        border: "1px solid hsl(38 95% 55% / 0.15)",
      }}>
        {/* Decorative element */}
        <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-xl" />
        
        <div className={cn("relative flex items-center gap-3", collapsed && "lg:justify-center")}>
          <div className="relative">
            <div className="h-2 w-2 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 shadow-lg shadow-emerald-500/50 animate-pulse-glow" />
          </div>
          
          <div className={cn("flex-1 min-w-0", collapsed && "lg:hidden")}>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-3 w-3 text-primary" />
              <span className="text-xs font-semibold text-foreground">Sistema Online</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Bot className="h-3 w-3" />
                {activeBots} bots
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {activeSubscribers} ativos
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}