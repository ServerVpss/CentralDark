import { useEffect, useState } from "react";
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
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LayoutGrid,
  Wrench,
  Briefcase,
  Cpu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Logo } from "./Logo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

const menuGroups = [
  {
    label: "Principal",
    icon: LayoutGrid,
    items: [
      { title: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    ],
  },
  {
    label: "Operações",
    icon: Wrench,
    items: [
      { title: "Meu Bot", icon: Bot, path: "/bots" },
      { title: "Consultas", icon: Search, path: "/consultas" },
      { title: "Logs", icon: FileText, path: "/logs" },
    ],
  },
  {
    label: "Gestão",
    icon: Briefcase,
    items: [
      { title: "Usuários", icon: Users, path: "/telegram-users" },
      { title: "Planos", icon: CreditCard, path: "/plans" },
      { title: "Lucros PIX", icon: DollarSign, path: "/pix" },
    ],
  },
  {
    label: "Sistema",
    icon: Cpu,
    items: [
      { title: "Auditoria", icon: ShieldAlert, path: "/audit" },
      { title: "Segurança", icon: Shield, path: "/security" },
      { title: "Dicas Splash", icon: Lightbulb, path: "/menu-tips" },
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

  // Categoria aberta — só uma por vez. Abre automaticamente a do item ativo.
  const activeGroup = menuGroups.find((g) => g.items.some((i) => isActive(i.path)))?.label ?? null;
  const [openGroup, setOpenGroup] = useState<string | null>(activeGroup);

  useEffect(() => {
    if (activeGroup) setOpenGroup(activeGroup);
  }, [activeGroup]);

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
          onClick={() => navigate("/dashboard")}
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

        <div className={cn("flex items-center gap-1", collapsed && "lg:hidden")}>
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-8 w-8"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5">
        {menuGroups.map((group, gi) => {
          const groupHasActive = group.items.some((i) => isActive(i.path));
          const isExpanded = !collapsed && openGroup === group.label;

          // Modo recolhido (desktop): mostra só os ícones dos itens, sem cabeçalho de categoria.
          if (collapsed) {
            return (
              <div key={group.label}>
                {gi > 0 && <Separator className="mx-auto w-8 mb-2 mt-2 bg-sidebar-border" />}
                <ul className="space-y-1">
                  {group.items.map((item) => {
                    const active = isActive(item.path);
                    return (
                      <Tooltip key={item.path} delayDuration={0}>
                        <TooltipTrigger asChild>
                          <li>
                            <button
                              onClick={() => {
                                navigate(item.path);
                                onClose?.();
                              }}
                              className={cn(
                                "relative flex w-full items-center justify-center rounded-md py-2 text-[13px] font-medium transition-colors duration-150",
                                active
                                  ? "bg-sidebar-accent text-foreground"
                                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-foreground"
                              )}
                            >
                              <item.icon
                                className={cn("h-4 w-4 shrink-0", active ? "text-primary" : "text-sidebar-foreground/60")}
                                strokeWidth={2}
                              />
                            </button>
                          </li>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="text-xs font-medium">
                          {item.title}
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </ul>
              </div>
            );
          }

          // Modo expandido: só botão da categoria; clica e abre os subitens ao lado/abaixo.
          return (
            <div key={group.label}>
              <button
                onClick={() => setOpenGroup(isExpanded ? null : group.label)}
                className={cn(
                  "group relative flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-semibold transition-colors duration-150",
                  isExpanded || groupHasActive
                    ? "bg-sidebar-accent/70 text-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-foreground"
                )}
              >
                {groupHasActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-r-full bg-primary" />
                )}
                <group.icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    groupHasActive ? "text-primary" : "text-sidebar-foreground/60"
                  )}
                  strokeWidth={2}
                />
                <span className="flex-1 text-left tracking-wide">{group.label}</span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-sidebar-foreground/50 transition-transform duration-200",
                    isExpanded && "rotate-180 text-primary"
                  )}
                  strokeWidth={2}
                />
              </button>

              {/* Subitens — slide pra dentro, recuados pra parecer "embutidos" no botão */}
              <div
                className={cn(
                  "grid transition-[grid-template-rows] duration-200 ease-out",
                  isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                )}
              >
                <ul className="overflow-hidden pl-4 ml-3 mt-1 space-y-0.5 border-l border-sidebar-border/60">
                  {group.items.map((item) => {
                    const active = isActive(item.path);
                    return (
                      <li key={item.path}>
                        <button
                          onClick={() => {
                            navigate(item.path);
                            onClose?.();
                          }}
                          className={cn(
                            "relative flex w-full items-center gap-2.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors duration-150",
                            active
                              ? "bg-sidebar-accent text-foreground"
                              : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-foreground"
                          )}
                        >
                          <item.icon
                            className={cn(
                              "h-4 w-4 shrink-0",
                              active ? "text-primary" : "text-sidebar-foreground/50"
                            )}
                            strokeWidth={2}
                          />
                          <span>{item.title}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          );
        })}
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
