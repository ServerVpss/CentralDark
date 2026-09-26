import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Rotas internas por slug — quando o módulo mora dentro DESTE app,
// abrir via SPA (navigate) em vez de window.location.href pra URL externa.
const INTERNAL_ROUTE: Record<string, string> = {
  bot: "/",
};

function openModule(slug: string, url: string | null | undefined, navigate: ReturnType<typeof useNavigate>) {
  const internal = INTERNAL_ROUTE[slug];
  if (internal) {
    navigate(internal);
    return;
  }
  if (url) window.location.href = url;
}
import {
  ExternalLink,
  Lock,
  Loader2,
  Shield,
  Crown,
  Bot,
  MessageSquare,
  LayoutGrid,
  Package,
  LogOut,
  ChevronRight,
  Activity,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import {
  subscriptionService,
  Module,
  Subscription,
} from "@/services/subscriptionService";

// Mapa de ícones por slug — substitui emojis por glifos Lucide profissionais
const MODULE_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  bot: Bot,
  crm: MessageSquare,
};

// Paleta travada do sistema (WhatsApp dark) — mantida no redesign
const PALETTE = {
  bg: "#0b141a",
  surface: "#111b21",
  surfaceAlt: "#202c33",
  border: "#2a3942",
  borderSoft: "#1f2c33",
  primary: "#00a884",
  primaryDim: "#008f70",
  text: "#e9edef",
  muted: "#8696a0",
};

export default function ModulePortal() {
  return (
    <SidebarProvider defaultOpen>
      <PortalShell />
    </SidebarProvider>
  );
}

function PortalShell() {
  const navigate = useNavigate();
  const { workspace, user, signOut } = useAuth();
  const [allModules, setAllModules] = useState<Module[]>([]);
  const [unlockedSlugs, setUnlockedSlugs] = useState<Set<string>>(new Set());
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (workspace?.id) loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspace?.id]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [modules, sub, unlocked] = await Promise.all([
        subscriptionService.getAllModules(),
        subscriptionService.getWorkspaceSubscription(workspace!.id),
        subscriptionService.getWorkspaceModules(workspace!.id),
      ]);
      setAllModules(modules);
      setSubscription(sub);
      setUnlockedSlugs(new Set(unlocked.map((m) => m.slug)));
    } catch (err) {
      console.error("Erro ao carregar módulos:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center w-full"
        style={{ backgroundColor: PALETTE.bg }}
      >
        <Loader2 className="w-7 h-7 animate-spin" style={{ color: PALETTE.primary }} />
      </div>
    );
  }

  const planName = (subscription as any)?.plan?.name || "Sem plano";
  const userInitial = user?.email?.[0]?.toUpperCase() || "?";
  const userLabel = user?.email || "Usuário";
  const activeCount = unlockedSlugs.size;
  const totalCount = allModules.length;

  return (
    <div className="flex min-h-screen w-full" style={{ backgroundColor: PALETTE.bg, color: PALETTE.text }}>
      {/* SIDEBAR */}
      <Sidebar
        collapsible="icon"
        className="border-r"
        style={{ borderColor: PALETTE.border, backgroundColor: PALETTE.surface }}
      >
        <SidebarHeader className="px-3 pt-4 pb-3" style={{ backgroundColor: PALETTE.surface }}>
          <BrandMark />
        </SidebarHeader>

        <SidebarContent style={{ backgroundColor: PALETTE.surface }}>
          {/* Workspace card */}
          <div className="px-3 pb-2">
            <WorkspaceCard
              name={workspace?.name || "Workspace"}
              planName={planName}
              activeCount={activeCount}
              totalCount={totalCount}
            />
          </div>

          {/* Lista de módulos como navegação */}
          <SidebarGroup>
            <SidebarGroupLabel
              className="px-3 text-[10px] uppercase tracking-[0.18em] font-semibold"
              style={{ color: PALETTE.muted }}
            >
              Módulos
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {allModules.map((mod) => {
                  const Icon = MODULE_ICON[mod.slug] || Package;
                  const isUnlocked = unlockedSlugs.has(mod.slug);
                  return (
                    <SidebarMenuItem key={mod.id}>
                      <SidebarMenuButton
                        tooltip={mod.name}
                        disabled={!isUnlocked}
                        onClick={() => {
                          if (isUnlocked) openModule(mod.slug, mod.url, navigate);
                        }}
                        className="data-[active=true]:bg-transparent"
                        style={{ color: isUnlocked ? PALETTE.text : PALETTE.muted }}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-[13px] font-medium">{mod.name}</span>
                        {!isUnlocked && <Lock className="ml-auto h-3 w-3" />}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter style={{ backgroundColor: PALETTE.surface }}>
          <div
            className="mx-2 mb-2 rounded-lg p-2 flex items-center gap-2"
            style={{ backgroundColor: PALETTE.surfaceAlt }}
          >
            <div
              className="h-8 w-8 rounded-md flex items-center justify-center text-sm font-semibold shrink-0"
              style={{ backgroundColor: PALETTE.primary, color: "#001a13" }}
            >
              {userInitial}
            </div>
            <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
              <p className="text-[12px] font-medium truncate" style={{ color: PALETTE.text }}>
                {userLabel}
              </p>
              <p className="text-[10px] truncate" style={{ color: PALETTE.muted }}>
                Conta ativa
              </p>
            </div>
            <button
              onClick={() => signOut()}
              className="p-1.5 rounded-md hover:bg-black/30 transition-colors group-data-[collapsible=icon]:hidden"
              title="Sair"
              style={{ color: PALETTE.muted }}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </SidebarFooter>
      </Sidebar>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header
          className="h-14 flex items-center gap-3 px-5 border-b shrink-0"
          style={{ borderColor: PALETTE.border, backgroundColor: PALETTE.surface }}
        >
          <SidebarTrigger style={{ color: PALETTE.muted }} />
          <Separator orientation="vertical" className="h-5" style={{ backgroundColor: PALETTE.border }} />
          <nav className="flex items-center gap-1.5 text-[12px]" style={{ color: PALETTE.muted }}>
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>Portal</span>
            <ChevronRight className="h-3 w-3" />
            <span style={{ color: PALETTE.text }} className="font-medium">
              Módulos
            </span>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Badge
              className="border px-2.5 py-0.5 text-[11px] font-medium gap-1.5"
              style={{
                backgroundColor: `${PALETTE.primary}15`,
                color: PALETTE.primary,
                borderColor: `${PALETTE.primary}40`,
              }}
            >
              <Crown className="h-3 w-3" />
              {planName}
            </Badge>
          </div>
        </header>

        {/* Conteúdo */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-6 py-10">
            {/* Cabeçalho da seção */}
            <div className="mb-8 flex items-end justify-between gap-6 flex-wrap">
              <div>
                <p
                  className="text-[11px] uppercase tracking-[0.18em] font-semibold mb-2"
                  style={{ color: PALETTE.primary }}
                >
                  Workspace
                </p>
                <h1
                  className="text-[28px] font-semibold tracking-tight leading-tight"
                  style={{ color: PALETTE.text }}
                >
                  {workspace?.name || "Seu workspace"}
                </h1>
                <p className="text-[13px] mt-1.5" style={{ color: PALETTE.muted }}>
                  Acesse os módulos disponíveis no seu plano.
                </p>
              </div>

              <StatStrip
                active={activeCount}
                total={totalCount}
                planName={planName}
              />
            </div>

            {/* Grid de cards densos */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {allModules.map((mod, i) => {
                const isUnlocked = unlockedSlugs.has(mod.slug);
                const Icon = MODULE_ICON[mod.slug] || Package;
                return (
                  <ModuleCard
                    key={mod.id}
                    mod={mod}
                    Icon={Icon}
                    isUnlocked={isUnlocked}
                    index={i}
                  />
                );
              })}
            </div>

            {/* Rodapé sutil */}
            <div className="mt-10 flex items-center gap-2 text-[11px]" style={{ color: PALETTE.muted }}>
              <Shield className="h-3.5 w-3.5" />
              <span>Sessão segura · Conexão criptografada</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ----------------- Subcomponentes ----------------- */

function BrandMark() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  return (
    <div className="flex items-center gap-2.5 px-1">
      <div
        className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
        style={{
          background: `linear-gradient(135deg, ${PALETTE.primary}, ${PALETTE.primaryDim})`,
          boxShadow: `0 0 0 1px ${PALETTE.primary}40, 0 8px 24px -8px ${PALETTE.primary}80`,
        }}
      >
        <Activity className="h-4 w-4" style={{ color: "#001a13" }} strokeWidth={2.5} />
      </div>
      {!collapsed && (
        <div className="min-w-0">
          <p className="text-[14px] font-semibold tracking-tight leading-tight" style={{ color: PALETTE.text }}>
            MultiZap
          </p>
          <p className="text-[10px] uppercase tracking-[0.16em]" style={{ color: PALETTE.muted }}>
            Console
          </p>
        </div>
      )}
    </div>
  );
}

function WorkspaceCard({
  name,
  planName,
  activeCount,
  totalCount,
}: {
  name: string;
  planName: string;
  activeCount: number;
  totalCount: number;
}) {
  const { state } = useSidebar();
  if (state === "collapsed") return null;

  return (
    <div
      className="rounded-lg p-3 border"
      style={{
        backgroundColor: PALETTE.surfaceAlt,
        borderColor: PALETTE.border,
      }}
    >
      <p className="text-[10px] uppercase tracking-[0.16em] font-semibold mb-1" style={{ color: PALETTE.muted }}>
        Workspace
      </p>
      <p className="text-[13px] font-semibold truncate" style={{ color: PALETTE.text }}>
        {name}
      </p>
      <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t" style={{ borderColor: PALETTE.border }}>
        <div className="flex items-center gap-1.5 text-[11px]" style={{ color: PALETTE.primary }}>
          <Crown className="h-3 w-3" />
          <span className="font-medium">{planName}</span>
        </div>
        <span className="text-[11px] tabular-nums" style={{ color: PALETTE.muted }}>
          {activeCount}/{totalCount}
        </span>
      </div>
    </div>
  );
}

function StatStrip({
  active,
  total,
  planName,
}: {
  active: number;
  total: number;
  planName: string;
}) {
  const stats = [
    { label: "Ativos", value: `${active}` },
    { label: "Total", value: `${total}` },
    { label: "Plano", value: planName },
  ];
  return (
    <div
      className="flex rounded-lg overflow-hidden border"
      style={{ borderColor: PALETTE.border, backgroundColor: PALETTE.surface }}
    >
      {stats.map((s, i) => (
        <div
          key={s.label}
          className="px-4 py-2.5 min-w-[88px]"
          style={{
            borderLeft: i === 0 ? "none" : `1px solid ${PALETTE.border}`,
          }}
        >
          <p className="text-[10px] uppercase tracking-[0.16em] font-semibold" style={{ color: PALETTE.muted }}>
            {s.label}
          </p>
          <p className="text-[15px] font-semibold tabular-nums mt-0.5" style={{ color: PALETTE.text }}>
            {s.value}
          </p>
        </div>
      ))}
    </div>
  );
}

function ModuleCard({
  mod,
  Icon,
  isUnlocked,
  index,
}: {
  mod: Module;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  isUnlocked: boolean;
  index: number;
}) {
  const navigate = useNavigate();
  const handleOpen = () => {
    if (isUnlocked) openModule(mod.slug, mod.url, navigate);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35, ease: "easeOut" }}
      className="group relative rounded-xl border overflow-hidden transition-all"
      style={{
        backgroundColor: PALETTE.surface,
        borderColor: PALETTE.border,
      }}
      whileHover={
        isUnlocked
          ? {
              y: -2,
              transition: { duration: 0.2 },
            }
          : undefined
      }
    >
      {/* Faixa de destaque no topo do card ativo */}
      <div
        className="h-[2px] w-full"
        style={{
          backgroundColor: isUnlocked ? PALETTE.primary : PALETTE.border,
          opacity: isUnlocked ? 1 : 0.4,
        }}
      />

      <div className="p-5">
        <div className="flex items-start gap-3 mb-4">
          <div
            className="h-11 w-11 rounded-lg flex items-center justify-center shrink-0 border"
            style={{
              backgroundColor: isUnlocked ? `${PALETTE.primary}14` : PALETTE.surfaceAlt,
              borderColor: isUnlocked ? `${PALETTE.primary}35` : PALETTE.border,
            }}
          >
            <Icon
              className="h-5 w-5"
              strokeWidth={1.75}
              {...({ style: { color: isUnlocked ? PALETTE.primary : PALETTE.muted } } as any)}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-[15px] font-semibold tracking-tight truncate" style={{ color: PALETTE.text }}>
                {mod.name}
              </h3>
              {isUnlocked ? (
                <span
                  className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: `${PALETTE.primary}18`,
                    color: PALETTE.primary,
                  }}
                >
                  Ativo
                </span>
              ) : (
                <span
                  className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded flex items-center gap-1"
                  style={{
                    backgroundColor: PALETTE.surfaceAlt,
                    color: PALETTE.muted,
                  }}
                >
                  <Lock className="h-2.5 w-2.5" /> Bloqueado
                </span>
              )}
            </div>
            <p
              className="text-[12.5px] leading-relaxed mt-1 line-clamp-2"
              style={{ color: PALETTE.muted }}
            >
              {mod.description}
            </p>
          </div>
        </div>

        <Separator className="my-4" style={{ backgroundColor: PALETTE.border }} />

        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-[0.14em] font-medium" style={{ color: PALETTE.muted }}>
            {isUnlocked ? "Pronto para uso" : "Indisponível no plano"}
          </span>

          {isUnlocked ? (
            <Button
              onClick={handleOpen}
              size="sm"
              className="h-8 px-3 text-[12px] font-medium gap-1.5 transition-colors"
              style={{
                backgroundColor: "transparent",
                color: PALETTE.primary,
                border: `1px solid ${PALETTE.primary}40`,
              }}
            >
              Abrir <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              disabled
              className="h-8 px-3 text-[12px] font-medium gap-1.5"
              style={{ color: PALETTE.muted }}
            >
              <Lock className="h-3.5 w-3.5" /> Upgrade
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
