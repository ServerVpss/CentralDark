import { createFileRoute, Outlet, Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useIsSuperAdmin } from "@/hooks/use-super-admin";
import { Shield, ShieldAlert, BarChart3, Building2, Users, ScrollText, Inbox, ArrowLeft, MessageCircle, Crown, Bot, Send, UserSquare, Layers, Settings, LineChart, Globe, Settings2, Map, Tag, Zap, Shuffle, Calendar, Mic, ShoppingCart, Sparkles, Package, Trello, Bell, Radio, Palette, Plug, ShieldCheck, GitBranch, ChevronDown, Activity, Database, Menu, X, PanelLeftClose, PanelLeftOpen, CreditCard, Rocket, HardDrive, Download } from "lucide-react";
import { LoadingDots } from "@/components/ui/loading-dots";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AppTopbar } from "@/components/app-topbar";

export const Route = createFileRoute("/admin")({ component: AdminLayout });


type NavItem = { to: string; label: string; icon: typeof Shield; exact?: boolean };
const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "Visão Geral",
    items: [
      { to: "/admin", label: "Dashboard", icon: BarChart3, exact: true },
      { to: "/admin/dashboard-executivo", label: "Dashboard Executivo", icon: LineChart },
      { to: "/admin/relatorios", label: "Relatórios", icon: LineChart },
    ],
  },
  {
    title: "Empresas & Usuários",
    items: [
      { to: "/admin/workspaces", label: "Empresas", icon: Building2 },
      { to: "/admin/usuarios", label: "Usuários", icon: Users },
      { to: "/admin/super-admins", label: "Super Admins", icon: Crown },
    ],
  },
  {
    title: "Operação",
    items: [
      { to: "/admin/whatsapp", label: "WhatsApp", icon: WhatsAppIcon as unknown as typeof MessageCircle, exact: true },
      { to: "/admin/whatsapp/diagnostico", label: "Diagnóstico WhatsApp", icon: ShieldCheck },
      { to: "/admin/inbox", label: "Inbox global", icon: Inbox },
      { to: "/admin/chat", label: "Chat", icon: MessageCircle },
      { to: "/admin/kanban", label: "Kanban", icon: Trello },
      { to: "/admin/canais", label: "Canais", icon: Radio },
      { to: "/admin/chatbots", label: "ChatBots", icon: Bot },
      { to: "/admin/ia", label: "Agente de IA", icon: Sparkles },
      { to: "/admin/campanhas", label: "Campanhas", icon: Send },
      { to: "/admin/contatos", label: "Contatos", icon: UserSquare },
      { to: "/admin/setores", label: "Setores", icon: Layers },
      { to: "/admin/tickets", label: "Tickets", icon: Inbox },
      { to: "/admin/grupos-acesso", label: "Grupos de Acesso", icon: ShieldCheck },
      { to: "/admin/mapa-atendimentos", label: "Mapa de atendimentos", icon: Map },
    ],
  },
  {
    title: "Utilidades",
    items: [
      { to: "/admin/utilidades/etiquetas", label: "Etiquetas", icon: Tag },
      { to: "/admin/utilidades/mensagens-rapidas", label: "Mensagens Rápidas", icon: Zap },
      { to: "/admin/utilidades/mensagens-aleatorias", label: "Mensagens Aleatórias", icon: Shuffle },
      { to: "/admin/utilidades/agendamentos", label: "Agendamentos", icon: Calendar },
      { to: "/admin/templates", label: "Templates Meta", icon: Sparkles },
      { to: "/admin/utilidades/voice-ia", label: "Voice IA", icon: Mic },
    ],
  },
  {
    title: "Planos & Comercial",
    items: [
      { to: "/admin/planos", label: "Planos", icon: Package },
      { to: "/admin/planos/adicional", label: "Vendas de Adicional", icon: ShoppingCart },
      { to: "/admin/gateway-pix", label: "Gateway Pix", icon: CreditCard },
    ],
  },
  {
    title: "Conteúdo",
    items: [
      { to: "/admin/landing", label: "Landing Page", icon: Globe },
      { to: "/admin/personalizar", label: "Personalizar", icon: Palette },
    ],
  },
  {
    title: "Segurança & Monitoramento",
    items: [
      { to: "/admin/monitor", label: "Monitor ao vivo", icon: Activity },
      { to: "/admin/seguranca", label: "Central de Segurança", icon: ShieldAlert },
      { to: "/admin/seguranca-whatsapp", label: "Segurança WhatsApp", icon: ShieldCheck },
      { to: "/admin/notificacoes", label: "Notificações", icon: Bell },
      { to: "/admin/auditoria", label: "Auditoria", icon: ScrollText },
      { to: "/admin/webhooks-log", label: "Logs de Webhook", icon: Activity },
      { to: "/admin/backups", label: "Backups", icon: HardDrive },
      { to: "/admin/assistente", label: "Assistente (histórico)", icon: Bot },
    ],
  },
  {
    title: "Sistema",
    items: [
      { to: "/admin/configuracoes", label: "Configurações", icon: Settings },
      { to: "/admin/integracao", label: "Integração", icon: Plug },
      { to: "/admin/sistema", label: "Saúde / Crons", icon: Settings2 },
      { to: "/admin/deploys", label: "Deploys do Gateway", icon: Rocket },
      { to: "/admin/mapa", label: "Mapa do sistema", icon: Map },
      { to: "/admin/seed", label: "Dados de demonstração", icon: Database },
      { to: "/admin/migracoes", label: "Migrações", icon: Download },
    ],
  },
];


function AdminLayout() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const loc = useLocation();
  const { data, isLoading } = useIsSuperAdmin();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("admin-sidebar-collapsed") === "1";
  });
  const toggleDesktop = () => {
    setDesktopCollapsed((v) => {
      const nv = !v;
      try { window.localStorage.setItem("admin-sidebar-collapsed", nv ? "1" : "0"); } catch { /* ignore */ }
      return nv;
    });
  };

  // Hover-expand: quando a barra tá recolhida e o mouse encosta, ela
  // expande temporariamente sem mudar a preferência salva.
  // IMPORTANTE: declarar ANTES dos early returns abaixo, senão o nº de
  // hooks muda entre renders ("Rendered more hooks than during the previous render").
  const [hoverExpanded, setHoverExpanded] = useState(false);
  const effectiveCollapsed = desktopCollapsed && !hoverExpanded;

  useEffect(() => { setMobileOpen(false); }, [loc.pathname]);

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth" });
  }, [loading, session, navigate]);

  if (loading || isLoading) {
    return <LoadingDots fullscreen size="lg" label="Verificando acesso" />;
  }
  if (!data?.isSuperAdmin) {
    return (
      <div className="flex h-screen items-center justify-center p-6">
        <div className="max-w-md text-center space-y-4">
          <Shield className="mx-auto h-12 w-12 text-destructive" />
          <h1 className="text-xl font-semibold">Acesso restrito</h1>
          <p className="text-sm text-muted-foreground">
            Esta área é exclusiva do Super Admin (master) do sistema.
          </p>
          <Button asChild variant="outline"><Link to="/app">Voltar ao app</Link></Button>
        </div>
      </div>
    );
  }




  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar fixa no desktop (≥ md) */}
      <aside
        onMouseEnter={() => desktopCollapsed && setHoverExpanded(true)}
        onMouseLeave={() => setHoverExpanded(false)}
        className={cn(
          "hidden md:flex flex-col border-r bg-zinc-950 text-zinc-100 transition-[width] duration-200 ease-out",
          effectiveCollapsed ? "w-16" : "w-72",
        )}
      >
        <SidebarContent
          pathname={loc.pathname}
          onNavigate={() => setMobileOpen(false)}
          collapsed={effectiveCollapsed}
          onToggleCollapsed={toggleDesktop}
        />
      </aside>


      {/* Backdrop mobile */}
      <div
        onClick={() => setMobileOpen(false)}
        className={cn(
          "md:hidden fixed inset-0 z-40 bg-black/70 transition-opacity duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      />

      {/* Drawer mobile (slide-in) */}
      <aside
        className={cn(
          "md:hidden fixed left-0 top-0 z-50 flex h-screen w-[85vw] max-w-[20rem] flex-col border-r bg-zinc-950 text-zinc-100 shadow-2xl",
          "transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          aria-label="Fechar menu"
          className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-300 hover:bg-zinc-800"
        >
          <X className="h-4 w-4" />
        </button>
        <SidebarContent pathname={loc.pathname} onNavigate={() => setMobileOpen(false)} />
      </aside>

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AppTopbar
          mode="admin"
          leadingSlot={(
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menu"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border bg-background text-foreground shadow-sm md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
        />

        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function SidebarContent({
  pathname,
  onNavigate,
  collapsed = false,
  onToggleCollapsed,
}: {
  pathname: string;
  onNavigate?: () => void;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}) {
  return (
    <>
      <div className={cn(
        "flex h-16 items-center gap-2 border-b border-zinc-800",
        collapsed ? "justify-center px-2" : "px-5",
      )}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-red-600">
          <Shield className="h-5 w-5" />
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold">Painel Master</p>
            <p className="truncate text-sm text-zinc-400">MultiZap</p>
          </div>
        )}
        {onToggleCollapsed && (
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
            title={collapsed ? "Expandir menu" : "Recolher menu"}
            className={cn(
              "hidden md:inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-800 hover:text-white",
              collapsed && "absolute right-1 top-2",
            )}
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        )}
      </div>
      <nav className={cn(
        "admin-sidebar-scroll flex-1 space-y-1 overflow-y-auto",
        collapsed ? "p-2" : "p-3",
      )}>
        {NAV_GROUPS.map((group) => {
          const isItemActive = (it: any) =>
            it.exact
              ? pathname === it.to
              : pathname === it.to || pathname.startsWith(it.to + "/");
          const groupActive = group.items.some((it: any) => isItemActive(it));
          if (collapsed) {
            return (
              <div key={group.title} className="space-y-1">
                {group.items.map((item) => {
                  const active = isItemActive(item);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={onNavigate}
                      title={item.label}
                      aria-label={item.label}
                      className={cn(
                        "flex h-10 w-full items-center justify-center rounded-md transition-colors",
                        active ? "bg-red-600 text-white" : "text-zinc-300 hover:bg-zinc-800",
                      )}
                    >
                      <item.icon className="h-[18px] w-[18px]" />
                    </Link>
                  );
                })}
                <div className="my-1 h-px bg-zinc-800/70" />
              </div>
            );
          }
          return (
            <NavGroup key={group.title} title={group.title} defaultOpen={groupActive}>
              {group.items.map((item) => {
                const active = isItemActive(item);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2.5 text-[15px] font-medium transition-colors",
                      active ? "bg-red-600 text-white" : "text-zinc-300 hover:bg-zinc-800",
                    )}
                  >
                    <item.icon className="h-[18px] w-[18px] shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </NavGroup>
          );
        })}
      </nav>
      <div className={cn("border-t border-zinc-800", collapsed ? "p-2" : "p-3")}>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className={cn(
            "text-zinc-300 hover:bg-zinc-800 hover:text-white",
            collapsed ? "w-full justify-center px-0" : "w-full justify-start",
          )}
          title="Voltar ao app"
        >
          <Link to="/app">
            <ArrowLeft className={cn("h-4 w-4", !collapsed && "mr-2")} />
            {!collapsed && "Voltar ao app"}
          </Link>
        </Button>
      </div>
    </>
  );
}





function NavGroup({ title, defaultOpen, children }: { title: string; defaultOpen: boolean; children: React.ReactNode }) {
  const storageKey = `admin-nav-open:${title}`;
  const [open, setOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") return defaultOpen;
    const saved = window.localStorage.getItem(storageKey);
    return saved === null ? defaultOpen : saved === "1";
  });
  useEffect(() => { if (defaultOpen) setOpen(true); }, [defaultOpen]);
  const toggle = () => {
    setOpen((v) => {
      const nv = !v;
      try { window.localStorage.setItem(storageKey, nv ? "1" : "0"); } catch { /* ignore */ }
      return nv;
    });
  };
  return (
    <div className="pb-1">
      <button
        type="button"
        onClick={toggle}
        className="flex w-full items-center justify-between rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"
      >
        <span>{title}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", !open && "-rotate-90")} />
      </button>
      {open && <div className="mt-1 space-y-1">{children}</div>}
    </div>
  );
}
