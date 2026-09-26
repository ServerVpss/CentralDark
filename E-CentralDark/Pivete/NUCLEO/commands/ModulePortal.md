# COMANDO - ModulePortal.tsx
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\apps\bot\src\pages\ModulePortal.tsx
**SHA:** 5e11a0b6415a7aa6
**Timestamp:** 2026-08-26T19:31:02.789849
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- function openModule(slug: string, url: string | null | undefined, navigate: ReturnType<typeof useNavigate>) {
- const navigate = useNavigate();
- const navigate = useNavigate();

### Ouro Bruto (primeiros 5000 chars)
```
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
                    <Sid
```