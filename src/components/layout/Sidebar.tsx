import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Bot,
  Shield,
  Users,
  Trophy,
  Settings,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Zap,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Search, label: "Consultas", path: "/consultas" },
  { icon: Bot, label: "Bots", path: "/bots" },
  { icon: Shield, label: "Segurança", path: "/security" },
  { icon: Users, label: "Assinantes", path: "/subscribers" },
  { icon: Trophy, label: "Gamificação", path: "/gamification" },
  { icon: CreditCard, label: "Planos", path: "/plans" },
  { icon: Settings, label: "Configurações", path: "/settings" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out",
        "bg-sidebar border-r border-sidebar-border",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center w-full")}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 glow-primary">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold gradient-text">TelePanel</span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn("h-8 w-8", collapsed && "absolute -right-4 top-4 bg-card border border-border rounded-full")}
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
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200",
                "hover:bg-sidebar-accent text-sidebar-foreground",
                isActive && "bg-primary/10 text-primary border border-primary/20",
                collapsed && "justify-center px-2"
              )}
            >
              <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-primary")} />
              {!collapsed && (
                <span className={cn("text-sm font-medium", isActive && "text-primary")}>
                  {item.label}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Status indicator */}
      <div className={cn(
        "absolute bottom-4 left-3 right-3 rounded-lg p-3 glass",
        collapsed && "left-2 right-2"
      )}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-3 w-3 rounded-full bg-success animate-pulse" />
            <div className="absolute inset-0 h-3 w-3 rounded-full bg-success animate-ping opacity-50" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">Sistema Online</p>
              <p className="text-xs text-muted-foreground">3 bots ativos</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
