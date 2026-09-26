# COMANDO - admin.tsx
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\clone-deck\apps\crm\src\routes\admin.tsx
**SHA:** a2ab83aee6788630
**Timestamp:** 2026-08-26T19:31:59.041657
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- const navigate = useNavigate();
- onNavigate={() => setMobileOpen(false)}
- <SidebarContent pathname={loc.pathname} onNavigate={() => setMobileOpen(false)} />

### Ouro Bruto (primeiros 5000 chars)
```
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
      { to: "/admin/seed", label: "Dados de
```