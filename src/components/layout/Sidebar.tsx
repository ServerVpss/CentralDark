import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Bot,
  Search,
  FileText,
  Users,
  CreditCard,
  DollarSign,
  Shield,
  ShieldAlert,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Logo } from "./Logo";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

const menuGroups = [
  {
    label: "PRINCIPAL",
    items: [
      { title: "Dashboard", icon: LayoutDashboard, path: "/" },
    ],
  },
  {
    label: "OPERAÇÕES",
    items: [
      { title: "Meu Bot", icon: Bot, path: "/bots" },
      { title: "Consultas", icon: Search, path: "/consultas" },
      { title: "Logs", icon: FileText, path: "/logs" },
    ],
  },
  {
    label: "GESTÃO",
    items: [
      { title: "Usuários", icon: Users, path: "/telegram-users" },
      { title: "Planos", icon: CreditCard, path: "/plans" },
      { title: "Lucros PIX", icon: DollarSign, path: "/pix" },
    ],
  },
  {
    label: "SISTEMA",
    items: [
      { title: "Auditoria", icon: ShieldAlert, path: "/audit" },
      { title: "Segurança", icon: Shield, path: "/security" },
      { title: "Configurações", icon: Settings, path: "/settings" },
    ],
  },
];

export function Sidebar({ isOpen = true, onClose, collapsed = false, onCollapsedChange }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
        collapsed ? "lg:w-[72px]" : "lg:w-72",
        "w-72",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex h-16 items-center border-b border-sidebar-border px-4",
        collapsed ? "lg:justify-center" : "justify-between"
      )}>
        <button
          onClick={() => navigate("/")}
          className={cn("flex items-center gap-3 group", collapsed && "lg:justify-center")}
        >
          <Logo size={36} className="transition-transform group-hover:scale-105" />
          <div className={cn("flex flex-col items-start", collapsed && "lg:hidden")}>
            <span className="text-base font-bold text-sidebar-foreground tracking-tight leading-none">
              TelePanel
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mt-1">
              Premium
            </span>
          </div>
        </button>

        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-8 w-8"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {menuGroups.map((group, gi) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-sidebar-foreground/40">
                {group.label}
              </p>
            )}
            {collapsed && gi > 0 && (
              <Separator className="mx-auto w-8 mb-3 bg-sidebar-border" />
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const active = isActive(item.path);
                const btn = (
                  <li key={item.path}>
                    <button
                      onClick={() => {
                        navigate(item.path);
                        onClose?.();
                      }}
                      className={cn(
                        "relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                        active
                          ? "bg-gradient-to-r from-primary/15 via-primary/8 to-transparent text-primary"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                        collapsed && "lg:justify-center lg:px-0"
                      )}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-7 w-1 rounded-r-full bg-gradient-to-b from-primary to-primary-glow shadow-[0_0_12px_hsl(var(--primary)/0.6)]" />
                      )}
                      <item.icon
                        className={cn(
                          "h-[18px] w-[18px] shrink-0 transition-all",
                          active ? "text-primary" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground"
                        )}
                        strokeWidth={active ? 2.5 : 2}
                      />
                      <span className={cn(collapsed && "lg:hidden")}>{item.title}</span>
                    </button>
                  </li>
                );

                if (collapsed) {
                  return (
                    <Tooltip key={item.path} delayDuration={0}>
                      <TooltipTrigger asChild>{btn}</TooltipTrigger>
                      <TooltipContent side="right" className="text-xs font-medium">
                        {item.title}
                      </TooltipContent>
                    </Tooltip>
                  );
                }
                return btn;
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="hidden lg:flex items-center justify-center border-t border-sidebar-border py-2.5">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={() => onCollapsedChange?.(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </aside>
  );
}
