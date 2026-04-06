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
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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
      { title: "Transações PIX", icon: DollarSign, path: "/pix" },
    ],
  },
  {
    label: "SISTEMA",
    items: [
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
        "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-border/40 bg-card transition-all duration-300",
        collapsed ? "lg:w-[68px]" : "lg:w-64",
        "w-64",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex h-14 items-center border-b border-border/40 px-4",
        collapsed ? "lg:justify-center" : "justify-between"
      )}>
        <div className={cn("flex items-center gap-2.5", collapsed && "lg:justify-center")}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <span className={cn("text-base font-bold text-foreground tracking-tight", collapsed && "lg:hidden")}>
            TelePanel
          </span>
        </div>

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
      <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-4">
        {menuGroups.map((group, gi) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="px-2.5 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                {group.label}
              </p>
            )}
            {collapsed && gi > 0 && (
              <Separator className="mx-auto w-8 mb-2" />
            )}
            <ul className="space-y-0.5">
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
                        "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                        collapsed && "lg:justify-center lg:px-0"
                      )}
                    >
                      <item.icon className={cn("h-4 w-4 shrink-0", active && "text-primary")} />
                      <span className={cn(collapsed && "lg:hidden")}>{item.title}</span>
                    </button>
                  </li>
                );

                if (collapsed) {
                  return (
                    <Tooltip key={item.path} delayDuration={0}>
                      <TooltipTrigger asChild>{btn}</TooltipTrigger>
                      <TooltipContent side="right" className="text-xs">
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
      <div className="hidden lg:flex items-center justify-center border-t border-border/40 py-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => onCollapsedChange?.(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </aside>
  );
}
