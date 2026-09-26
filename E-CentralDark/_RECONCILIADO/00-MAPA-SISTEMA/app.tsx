import { createFileRoute, Outlet, useNavigate, Link, useLocation, ClientOnly } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/hooks/use-auth";
import { useCurrentWorkspace } from "@/hooks/use-workspace";
import { useIsSuperAdmin } from "@/hooks/use-super-admin";
import { usePermissions } from "@/hooks/use-permissions";
import { useIntroConfig } from "@/hooks/use-intro-config";
import { useActiveTheme } from "@/hooks/use-active-theme";
import { getBranding } from "@/lib/branding.functions";
import { WorkspaceBanner } from "@/components/workspace-banner";
import { AppTopbar } from "@/components/app-topbar";
import { IntroAnimation } from "@/components/landing/IntroAnimation";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { WorkspaceOnboarding } from "@/components/onboarding/WorkspaceOnboarding";
import { GuidedTour } from "@/components/onboarding/GuidedTour";
import { Button } from "@/components/ui/button";
import { LoadingDots } from "@/components/ui/loading-dots";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";
import {
  Home, MessageCircle, Trello, Bell, Radio, Bot, Wrench, Tag, Zap, Shuffle, Calendar, Sparkles, Mic,
  Users, ShieldCheck, Building2, UserCog, Package, Settings2, ListChecks, ShoppingCart,
  BarChart3, History, Headphones, Smile, Palette, Plug, LogOut, Shield, ChevronDown, ChevronRight,
  Inbox as InboxIcon, GitBranch, Map as MapIcon, Menu, X, PanelLeftClose, PanelLeftOpen,
} from "lucide-react";

export const Route = createFileRoute("/app")({ component: AppLayout });

type Item = { to: string; label: string; icon: React.ComponentType<{ className?: string }>; exact?: boolean; perm?: string | string[]; adminOnly?: boolean };
type Group = { id: string; label: string; icon: React.ComponentType<{ className?: string }>; items: Item[]; perm?: string | string[]; adminOnly?: boolean };
type NavEntry = Item | Group;

// `perm` = chave do catálogo de permissões; `adminOnly` = só role=admin do workspace.
// Admin sempre passa (bypass no usePermissions.can).
// 6 itens principais sempre à vista. Tudo o resto fica dentro de "Configurações".
const NAV: NavEntry[] = [
  { to: "/app", label: "Início", icon: Home, exact: true },
  { to: "/app/chat", label: "Chat", icon: MessageCircle, perm: "chat.access" },
  { to: "/app/kanban", label: "Kanban", icon: Trello, perm: "chat.kanban" },
  { to: "/app/contatos", label: "Contatos", icon: Users, perm: "contato.view" },
  { to: "/app/chatbot", label: "ChatBot", icon: Bot, perm: "chatbot.access" },
  { to: "/app/notificacoes", label: "Notificações", icon: Bell },
  {
    id: "configuracoes", label: "Configurações", icon: Settings2,
    items: [
      { to: "/app/dashboard", label: "Dashboard Executivo", icon: BarChart3, perm: "home.view" },
      { to: "/app/mapa", label: "Mapa", icon: MapIcon, adminOnly: true },
      { to: "/app/notificacoes-config", label: "Config. Notificações", icon: Settings2, adminOnly: true },
      { to: "/app/canais", label: "Canais", icon: Radio, adminOnly: true },
      { to: "/app/utilidades/etiquetas", label: "Etiquetas", icon: Tag, perm: "tpl_etiqueta.view" },
      { to: "/app/utilidades/mensagens-rapidas", label: "Mensagens Rápidas", icon: Zap, perm: "tpl_msg.view" },
      { to: "/app/utilidades/mensagens-aleatorias", label: "Mensagens Aleatórias", icon: Shuffle, perm: "msg_aleatoria.view" },
      { to: "/app/utilidades/agendamentos", label: "Agendamentos", icon: Calendar, perm: "agendamento.view" },
      { to: "/app/utilidades/templates", label: "Templates Meta", icon: Sparkles, perm: "tpl_msg.view" },
      { to: "/app/utilidades/agente-ia", label: "Agente de IA", icon: Sparkles, perm: "ia.view" },
      { to: "/app/utilidades/voice-ia", label: "Voice IA", icon: Mic, perm: "ia.view" },
      { to: "/app/grupos-acesso", label: "Grupos de Acesso", icon: ShieldCheck, perm: "grupo_acesso.view" },
      { to: "/app/setores", label: "Setor", icon: Building2, perm: "setor.view" },
      { to: "/app/usuarios", label: "Usuários", icon: UserCog, perm: "usuario.view" },
      { to: "/app/planos/gerenciar", label: "Planos — Gerenciar", icon: Package, perm: "plano.billing" },
      { to: "/app/planos/lista", label: "Planos — Lista", icon: ListChecks, perm: "plano.billing" },
      { to: "/app/planos/adicional", label: "Comprar adicional", icon: ShoppingCart, perm: "plano.billing" },
      { to: "/app/relatorios/historico", label: "Histórico de Conversas", icon: History, perm: "relatorio.conversas" },
      { to: "/app/relatorios/atendimentos", label: "Atendimentos", icon: Headphones, perm: "relatorio.atendimentos" },
      { to: "/app/relatorios/satisfacao", label: "Satisfação", icon: Smile, perm: "relatorio.satisfacao" },
      { to: "/app/personalizar", label: "Personalizar", icon: Palette, perm: "conta.customize" },
      { to: "/app/integracao", label: "Integração", icon: Plug, perm: "integracao.access" },
    ],
  },
];

function isGroup(e: NavEntry): e is Group { return "items" in e; }

function AppLayout() {
  const navigate = useNavigate();
  const { session, loading, signOut, user } = useAuth();
  const { data: ws, isLoading: wsLoading } = useCurrentWorkspace();
  const { data: sa } = useIsSuperAdmin();
  const perms = usePermissions();
  const loc = useLocation();
  const theme = useActiveTheme();
  const fetchBranding = useServerFn(getBranding);

  const { data: branding } = useQuery({
    queryKey: queryKeys.branding(ws?.id),
    enabled: !!ws?.id,
    queryFn: () => fetchBranding({ data: { workspaceId: ws!.id } }),
  });

  // Filtra NAV conforme permissões reais (admin do workspace passa em tudo)
  const visibleNav = useMemo<NavEntry[]>(() => {
    const allow = (entry: { perm?: string | string[]; adminOnly?: boolean }) => {
      if (entry.adminOnly) return perms.isAdmin;
      if (!entry.perm) return true;
      const keys = Array.isArray(entry.perm) ? entry.perm : [entry.perm];
      return perms.canAny(keys);
    };
    return NAV.flatMap<NavEntry>((entry) => {
      if (!isGroup(entry)) return allow(entry) ? [entry] : [];
      if (!allow(entry)) return [];
      const items = entry.items.filter(allow);
      return items.length ? [{ ...entry, items }] : [];
    });
  }, [perms.isAdmin, perms.permissionKeys]);

  // open groups whose path is active by default
  const initialOpen = useMemo(() => {
    const map: Record<string, boolean> = {};
    visibleNav.forEach((e) => {
      if (isGroup(e) && e.items.some((i) => loc.pathname.startsWith(i.to))) map[e.id] = true;
    });
    return map;
  }, [loc.pathname, visibleNav]);
  const [open, setOpen] = useState<Record<string, boolean>>(initialOpen);

  // Sidebar recolher/expandir (clique fica fixo, igual /admin). Persiste no localStorage.
  const [pinned, setPinned] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const v = window.localStorage.getItem("sidebar-pinned");
    return v === null ? true : v === "1";
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("sidebar-pinned", pinned ? "1" : "0");
    }
  }, [pinned]);
  const expanded = pinned || mobileOpen;

  // close mobile drawer on route change
  useEffect(() => { setMobileOpen(false); }, [loc.pathname]);

  useEffect(() => {
    setOpen((current) => {
      const next = { ...initialOpen, ...current };
      const sameKeys = Object.keys(next).length === Object.keys(current).length;
      const sameValues = sameKeys && Object.keys(next).every((key) => next[key] === current[key]);
      return sameValues ? current : next;
    });
  }, [initialOpen]);

  useEffect(() => {
    if (!loading && !session && loc.pathname !== "/auth") navigate({ to: "/auth" });
  }, [loading, session, navigate, loc.pathname]);

  if (loading || !session) {
    return <LoadingDots fullscreen size="lg" label="Carregando" />;
  }

  // === NexChat fullscreen ===
  // Quando o tema NexChat está ativo e estamos em /app/chat, renderizamos
  // SEM o AppShell antigo (sem sidebar/topbar/banner). Fallback ao layout
  // antigo quando o toggle estiver desligado.
  const isNexChatFullscreen =
    loc.pathname === "/app/chat" && theme.enabled && theme.mode === "nexchat";

  if (isNexChatFullscreen) {
    return (
      <div className="nexchat-fullscreen-shell fixed inset-0 z-30 h-screen w-screen overflow-hidden bg-background">
        <Outlet />
        <ClientOnly fallback={null}>
          <NotificationCenter />
        </ClientOnly>
      </div>
    );
  }


  const sidebarStyle: React.CSSProperties = branding?.sidebar_bg
    ? { backgroundColor: branding.sidebar_bg }
    : {};
  const accentStyle: React.CSSProperties = branding?.primary_color
    ? ({ ["--brand-primary" as string]: branding.primary_color } as React.CSSProperties)
    : {};

  const brandName = branding?.brand_name || ws?.name || (wsLoading ? "..." : "Workspace");
  const logoUrl = branding?.logo_url;

  return (
    <div className="flex h-screen bg-background" style={accentStyle}>
      <AppIntro brandName={brandName} />
      {/* Spacer reserva largura no desktop; em mobile o sidebar é drawer (largura 0) */}
      <div
        className={cn(
          "shrink-0 hidden lg:block transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          expanded ? "w-64" : "w-16",
        )}
      />

      {/* Backdrop mobile */}
      <div
        onClick={() => setMobileOpen(false)}
        className={cn(
          "lg:hidden fixed inset-0 z-40 bg-black/70 transition-opacity duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      />

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen flex-col border-r bg-sidebar text-sidebar-foreground shadow-2xl",
          expanded ? "overflow-hidden" : "overflow-visible",
          "transition-[width,transform] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          // Desktop: largura controla e fica sempre visível
          "lg:translate-x-0 lg:shadow-xl",
          expanded ? "lg:w-64" : "lg:w-16",
          // Mobile: drawer 85vw (máx 20rem) com slide
          "w-[85vw] max-w-[20rem]",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
        style={sidebarStyle}
      >
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-3">
          {logoUrl ? (
            <img src={logoUrl} alt={brandName} className="h-8 w-8 shrink-0 rounded-md object-cover" />
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <MessageCircle className="h-4 w-4" />
            </div>
          )}
          <div className={cn("min-w-0 flex-1 transition-opacity duration-200", expanded ? "opacity-100" : "opacity-0 pointer-events-none")}>
            <p className="truncate text-sm font-semibold">{brandName}</p>
            <p className="truncate text-xs text-sidebar-foreground/60">{ws?.role === "admin" ? "Admin" : "Atendente"}</p>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            title="Fechar menu"
            className="lg:hidden shrink-0 rounded-md p-1.5 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition"
          >
            <X className="h-4 w-4" />
          </button>
          <button
            type="button"
            data-tour="sidebar-pin"
            onClick={() => setPinned((p) => !p)}
            aria-label={pinned ? "Recolher menu" : "Expandir menu"}
            title={pinned ? "Recolher menu" : "Expandir menu"}
            className={cn(
              "hidden lg:inline-flex shrink-0 items-center justify-center rounded-md p-1.5 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition",
              !expanded && "absolute right-1 top-2 h-8 w-8 p-0",
            )}
          >
            {pinned ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
          </button>
        </div>

        <nav className={cn(
          "flex-1 space-y-0.5 p-2 sidebar-nav-scroll",
          expanded ? "overflow-x-hidden overflow-y-auto sidebar-scroll" : "overflow-visible sidebar-scroll-hide",
        )}>

          {(perms.isLoading || wsLoading) ? (
            // Skeleton enquanto workspace/permissões reinvalidam (logout/login/troca).
            // Evita o menu piscar com itens do usuário anterior.
            <div className="space-y-1" aria-label="Carregando menu" aria-busy>
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 rounded-md px-3 py-2">
                  <div className="h-4 w-4 shrink-0 rounded bg-sidebar-accent/40 animate-pulse" />
                  <div
                    className={cn(
                      "h-3 rounded bg-sidebar-accent/40 animate-pulse transition-opacity duration-200",
                      expanded ? "opacity-100" : "opacity-0",
                    )}
                    style={{ width: `${50 + ((i * 13) % 40)}%` }}
                  />
                </div>
              ))}
            </div>
          ) : visibleNav.map((entry) => {
            if (!isGroup(entry)) {
              const active = entry.exact ? loc.pathname === entry.to : loc.pathname === entry.to;
              // Slug pro tour guiado (data-tour="nav-chat", "nav-home" etc.)
              const tourSlug = entry.to === "/app" ? "home" : entry.to.replace(/^\/app\//, "").split("/")[0];
              return (
                <Link key={entry.to} to={entry.to}
                  data-tour={`nav-${tourSlug}`}
                  title={!expanded ? entry.label : undefined}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                      : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                  )}
                >
                  <entry.icon className={cn("h-4 w-4 shrink-0", active && "text-primary")} />
                  <span className={cn("truncate transition-opacity duration-200", expanded ? "opacity-100" : "opacity-0")}>{entry.label}</span>
                  {!expanded && <SidebarTooltip label={entry.label} />}
                </Link>
              );
            }
            const isOpen = (open[entry.id] ?? false) && expanded;
            const groupActive = entry.items.some((i) => loc.pathname.startsWith(i.to));
            return (
              <div key={entry.id}>
                <button
                  type="button"
                  data-tour={`nav-${entry.id}`}
                  onClick={() => expanded && setOpen((p) => ({ ...p, [entry.id]: !(p[entry.id] ?? false) }))}
                  title={!expanded ? entry.label : undefined}
                  className={cn(
                    "group relative flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    groupActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <entry.icon className="h-4 w-4 shrink-0" />
                  <span className={cn("flex-1 text-left truncate transition-opacity duration-200", expanded ? "opacity-100" : "opacity-0")}>{entry.label}</span>
                  {expanded && (isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)}
                  {!expanded && <SidebarTooltip label={entry.label} />}
                </button>
                {isOpen && (
                  <div className="ml-3 mt-0.5 space-y-0.5 border-l border-sidebar-border pl-2">
                    {entry.items.map((i) => {
                      const active = loc.pathname === i.to || loc.pathname.startsWith(i.to + "/");
                      return (
                        <Link key={i.to} to={i.to}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm transition-colors",
                            active
                              ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                              : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                          )}
                        >
                          <i.icon className={cn("h-3.5 w-3.5 shrink-0", active && "text-primary")} /> <span className="truncate">{i.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {sa?.isSuperAdmin && (
          <div className="px-2 pb-2">
            <Link to="/admin"
              data-tour="nav-master"
              title={!expanded ? "Painel Master" : undefined}
              className="group relative flex items-center gap-3 rounded-md bg-red-600/10 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-600/20">
              <Shield className="h-4 w-4 shrink-0" />
              <span className={cn("truncate transition-opacity duration-200", expanded ? "opacity-100" : "opacity-0")}>Painel Master</span>
              {!expanded && <SidebarTooltip label="Painel Master" />}
            </Link>
          </div>
        )}

        <div className="border-t border-sidebar-border p-2">
          <div className={cn("mb-1 px-2 text-xs text-sidebar-foreground/60 truncate transition-opacity", expanded ? "opacity-100" : "opacity-0 h-0 mb-0")}>{user?.email}</div>
          <Button
            variant="ghost"
            size="sm"
            title={!expanded ? "Sair" : undefined}
            className="w-full justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={async () => { await signOut(); navigate({ to: "/auth" }); }}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className={cn("ml-2 transition-opacity duration-200", expanded ? "opacity-100" : "opacity-0")}>Sair</span>
          </Button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-auto">
        <AppTopbar
          mode="app"
          leadingSlot={(
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menu"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border bg-background text-foreground shadow-sm lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
        />
        <WorkspaceBanner />
        <RouteGuard pathname={loc.pathname} perms={perms}>
          <Outlet />
        </RouteGuard>
      </main>
      <ClientOnly fallback={null}>
        <NotificationCenter />
        <WorkspaceOnboarding />
        <GuidedTour />
      </ClientOnly>
    </div>
  );
}

function AppIntro({ brandName }: { brandName: string }) {
  const intro = useIntroConfig();
  if (!intro.introEnabled || !intro.showOnApp) return null;
  return (
    <ClientOnly fallback={null}>
      <IntroAnimation brandName={brandName} durationMs={intro.durationMs} storageKey="app-intro-seen" />
    </ClientOnly>
  );
}

// Bloqueia acesso por URL direta às rotas administrativas usando o mesmo NAV.
// Admin do workspace e super admin passam direto.
function RouteGuard({
  pathname,
  perms,
  children,
}: {
  pathname: string;
  perms: ReturnType<typeof usePermissions>;
  children: React.ReactNode;
}) {
  const guard = useMemo<"loading" | "allowed" | "denied">(() => {
    if (perms.isLoading) return "loading";

    const all: Item[] = [];
    NAV.forEach((e) => {
      if (isGroup(e)) e.items.forEach((i) => all.push(i));
      else all.push(e);
    });
    const match = all
      .filter((i) => (i.exact ? pathname === i.to : pathname === i.to || pathname.startsWith(i.to + "/")))
      .sort((a, b) => b.to.length - a.to.length)[0];
    if (!match) return "allowed";
    if (match.adminOnly) return perms.isAdmin ? "allowed" : "denied";
    if (!match.perm) return "allowed";
    const keys = Array.isArray(match.perm) ? match.perm : [match.perm];
    return perms.canAny(keys) ? "allowed" : "denied";
  }, [pathname, perms]);

  if (guard === "loading") {
    return <div className="flex h-64 items-center justify-center"><LoadingDots size="md" /></div>;
  }

  if (guard === "denied") {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3 p-6 text-center">
        <Shield className="h-10 w-10 text-destructive" />
        <h2 className="text-lg font-semibold">Acesso negado</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          Você não tem permissão para acessar esta página. Fale com o administrador do seu workspace.
        </p>
        <Button asChild variant="outline" size="sm" className="mt-2">
          <Link to="/app">Voltar para o início</Link>
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}

// Tooltip que aparece ao lado do ícone quando a sidebar está colapsada.
// Usa group-hover do Tailwind, sem dependência extra. Mostra também no foco
// pra acessibilidade via teclado.
function SidebarTooltip({ label }: { label: string }) {
  return (
    <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-xs font-medium text-popover-foreground opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
      {label}
    </span>
  );
}
