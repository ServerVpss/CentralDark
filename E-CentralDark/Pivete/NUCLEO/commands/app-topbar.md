# COMANDO - app-topbar.tsx
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\clone-deck\apps\crm\src\components\app-topbar.tsx
**SHA:** a4b0a4e11a843c24
**Timestamp:** 2026-08-26T19:31:35.228697
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- const navigate = useNavigate();

### Ouro Bruto (primeiros 5000 chars)
```
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useCurrentWorkspace } from "@/hooks/use-workspace";
import { useIsSuperAdmin } from "@/hooks/use-super-admin";
import { useServerFn } from "@tanstack/react-start";
import { getBranding } from "@/lib/branding.functions";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Popover, PopoverTrigger, PopoverContent,
} from "@/components/ui/popover";
import {
  Sun, Moon, Bell, Languages, Camera, User as UserIcon, Shield, Palette,
  Package, Receipt, LogOut, Check, Settings, Volume2, VolumeX, RefreshCw,
  MessageSquare, MessageCircle, AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

type Mode = "app" | "admin";
type AppTopbarProps = {
  mode?: Mode;
  leadingSlot?: React.ReactNode;
};
const LOCALES = [
  { code: "pt-BR", label: "Português", flag: "🇧🇷" },
  { code: "en-US", label: "English", flag: "🇺🇸" },
  { code: "es-ES", label: "Español", flag: "🇪🇸" },
];
const STATUS = [
  { value: "available", label: "Disponível", color: "bg-emerald-500", chip: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" },
  { value: "busy", label: "Ocupado", color: "bg-amber-500", chip: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300" },
  { value: "away", label: "Ausente", color: "bg-zinc-400", chip: "border-zinc-500/30 bg-zinc-500/10 text-zinc-700 dark:text-zinc-300" },
];

function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    return (localStorage.getItem("theme") as "light" | "dark") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  });
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);
  return { theme, toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")) };
}

export function AppTopbar({ mode = "app", leadingSlot }: AppTopbarProps) {
  const { user, signOut } = useAuth();
  const { data: ws } = useCurrentWorkspace();
  const { data: sa } = useIsSuperAdmin();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { theme, toggle } = useTheme();
  const fetchBranding = useServerFn(getBranding);

  const [status, setStatus] = useState(() => localStorage.getItem("agent-status") || "available");
  const [locale, setLocale] = useState(() => localStorage.getItem("locale") || "pt-BR");
  useEffect(() => localStorage.setItem("agent-status", status), [status]);
  useEffect(() => localStorage.setItem("locale", locale), [locale]);

  // Mute de som de notificação (toggle no topbar)
  const [soundMuted, setSoundMuted] = useState(() => localStorage.getItem("mz_sound_muted") === "1");
  useEffect(() => {
    localStorage.setItem("mz_sound_muted", soundMuted ? "1" : "0");
    window.dispatchEvent(new CustomEvent("mz-sound-muted-changed"));
  }, [soundMuted]);

  // Refresh global — invalida queries principais
  const [refreshing, setRefreshing] = useState(false);
  function handleRefresh() {
    setRefreshing(true);
    qc.invalidateQueries();
    setTimeout(() => setRefreshing(false), 700);
  }

  // Popover de mensagens novas e de anúncios
  const [msgOpen, setMsgOpen] = useState(false);
  const [annOpen, setAnnOpen] = useState(false);

  // Query de anúncios (workspace + master)
  const { data: announcements } = useQuery({
    queryKey: ["announcements-topbar", ws?.id, mode],
    enabled: mode === "admin" || !!ws?.id,
    refetchInterval: 60_000,
    queryFn: async () => {
      const out: Array<{ id: string; title: string; body: string | null; created_at: string; scope: "workspace" | "master" }> = [];
      const { data: master } = await supabase
        .from("master_announcements")
        .select("id, title, body, created_at")
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(10);
      (master ?? []).forEach((a: any) => out.push({ ...a, scope: "master" }));
      if (mode === "app" && ws?.id) {
        const { data: wsAnn } = await supabase
          .from("workspace_announcements")
          .select("id, title, body, created_at")
          .eq("workspace_id", ws.id)
          .eq("active", true)
          .order("created_at", { ascending: false })
          .limit(10);
        (wsAnn ?? []).forEach((a: any) => o
```