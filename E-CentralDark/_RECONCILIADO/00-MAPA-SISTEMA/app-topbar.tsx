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
        (wsAnn ?? []).forEach((a: any) => out.push({ ...a, scope: "workspace" }));
      }
      return out;
    },
  });
  const annCount = announcements?.length ?? 0;

  const { data: branding } = useQuery({
    queryKey: ["branding", ws?.id],
    enabled: !!ws?.id && mode === "app",
    queryFn: () => fetchBranding({ data: { workspaceId: ws!.id } }),
  });

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("full_name, avatar_url, email").eq("id", user!.id).maybeSingle();
      return data;
    },
  });

  // Notifications + conversas com mensagens novas (tudo no sino, em tempo real)
  const [bellOpen, setBellOpen] = useState(false);
  const { data: notifData } = useQuery({
    queryKey: ["bell-feed", ws?.id, mode],
    enabled: mode === "admin" || !!ws?.id,
    refetchInterval: 30_000,
    queryFn: async () => {
      // 1) Notificações do sistema (não lidas)
      let nq = supabase
        .from("notifications")
        .select("id, title, body, created_at, workspace_id", { count: "exact" })
        .is("read_at", null)
        .order("created_at", { ascending: false })
        .limit(50);
      if (mode === "app" && ws?.id) nq = nq.eq("workspace_id", ws.id);
      const { data: notifs, count: notifCount } = await nq;

      // 2) Conversas com mensagens novas
      let tq = supabase
        .from("tickets")
        .select("id, last_message_preview, last_message_at, unread_count, contact:contacts(name, phone)")
        .gt("unread_count", 0)
        .order("last_message_at", { ascending: false })
        .limit(50);
      if (mode === "app" && ws?.id) tq = tq.eq("workspace_id", ws.id);
      const { data: tickets } = await tq;

      const totalUnread = (notifCount ?? notifs?.length ?? 0)
        + (tickets ?? []).reduce((acc, t: any) => acc + (t.unread_count ?? 0), 0);

      return { notifs: notifs ?? [], tickets: tickets ?? [], totalUnread };
    },
  });
  useEffect(() => {
    // Canal segmentado: por workspace no app, global "admin:" no painel master.
    // RLS controla o que cada cliente recebe; o nome é só identificador.
    const channelName = mode === "app" && ws?.id
      ? `ws:${ws.id}:topbar-bell`
      : "admin:topbar-bell";
    const ch = supabase
      .channel(channelName)
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" },
        () => qc.invalidateQueries({ queryKey: ["bell-feed"] }))
      .on("postgres_changes", { event: "*", schema: "public", table: "tickets" },
        () => qc.invalidateQueries({ queryKey: ["bell-feed"] }))
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "ticket_messages" },
        () => qc.invalidateQueries({ queryKey: ["bell-feed"] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc, mode, ws?.id]);

  const notifs = notifData?.notifs ?? [];
  const ticketsUnread = notifData?.tickets ?? [];
  const unread = notifData?.totalUnread ?? 0;

  const brandName = mode === "admin"
    ? "Painel Master"
    : (branding?.brand_name || ws?.name || "Workspace");
  const logoUrl = mode === "admin" ? null : branding?.logo_url;
  const roleLabel = sa?.isSuperAdmin ? "Master" : ws?.role === "admin" ? "Admin" : "Atendente";
  const userName = profile?.full_name || user?.email?.split("@")[0] || "Usuário";
  const userInitials = useMemo(() => userName.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase(), [userName]);

  const currentStatus = STATUS.find((s) => s.value === status) ?? STATUS[0];
  const currentLocale = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  async function markAllRead() {
    if (!notifs?.length) return;
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).in("id", notifs.map((n) => n.id));
    qc.invalidateQueries({ queryKey: ["notifications-recent"] });
  }

  return (
    <>
      <div
        className="sticky top-0 z-30 flex min-h-14 items-center gap-3 border-b bg-card/95 px-3 backdrop-blur sm:px-4 [&_button]:touch-manipulation"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >

        {/* Esquerda: nome + status */}


        {leadingSlot}
        <div className="flex min-w-0 items-center gap-2">
          {logoUrl && <img src={logoUrl} alt={brandName} className="h-7 w-7 shrink-0 rounded-md object-cover" />}
          <span className="hidden sm:inline truncate text-sm font-bold uppercase tracking-wide">{brandName}</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.button
                aria-label={`Status: ${currentStatus.label}`}
                title={currentStatus.label}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                className={cn(
                  "ml-1 inline-flex shrink-0 items-center gap-1.5 rounded-full border px-1.5 py-1 text-xs font-medium shadow-sm transition-shadow hover:shadow-md sm:px-2.5",
                  currentStatus.chip,
                )}
              >
                <span className="relative flex h-2.5 w-2.5 items-center justify-center">
                  {/* Halo externo (mais lento e suave) */}
                  <motion.span
                    className={cn("absolute inline-flex h-full w-full rounded-full", currentStatus.color)}
                    animate={{ scale: [1, 2.4, 2.4], opacity: [0.55, 0, 0] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
                  />
                  {/* Halo interno (mais rápido) */}
                  <motion.span
                    className={cn("absolute inline-flex h-full w-full rounded-full", currentStatus.color)}
                    animate={{ scale: [1, 1.8, 1.8], opacity: [0.4, 0, 0] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut", delay: 0.4 }}
                  />
                  {/* Bolinha sólida com brilho sutil */}
                  <motion.span
                    className={cn("relative inline-flex h-2 w-2 rounded-full shadow-[0_0_6px_currentColor]", currentStatus.color)}
                    animate={{ scale: [1, 1.12, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  />
                </span>
                <span className="hidden sm:inline">{currentStatus.label}</span>
              </motion.button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Meu status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {STATUS.map((s) => (
                <DropdownMenuItem key={s.value} onClick={() => setStatus(s.value)} className="gap-2">
                  <span className={cn("h-2 w-2 rounded-full", s.color)} />
                  {s.label}
                  {status === s.value && <Check className="ml-auto h-3.5 w-3.5" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex-1" />

        {/* Direita: idioma + sino + avatar */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Idioma" className="h-9 w-9">
              <Languages className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Idioma</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {LOCALES.map((l) => (
              <DropdownMenuItem key={l.code} onClick={() => setLocale(l.code)} className="gap-2">
                <span>{l.flag}</span>{l.label}
                {locale === l.code && <Check className="ml-auto h-3.5 w-3.5" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Engrenagem — Configurações */}
        <Button
          variant="ghost"
          size="icon"
          aria-label="Configurações"
          title="Configurações"
          onClick={() => navigate({ to: mode === "admin" ? "/admin/configuracoes" : "/app/configuracoes" })}
          className="hidden h-9 w-9 shrink-0 lg:inline-flex"
        >
          <Settings className="h-4 w-4" />
        </Button>

        {/* Som — Mute toggle */}
        <Button
          variant="ghost"
          size="icon"
          aria-label={soundMuted ? "Ativar som de notificação" : "Silenciar notificações"}
          title={soundMuted ? "Som desativado" : "Som ativo"}
          onClick={() => setSoundMuted((v) => !v)}
          className="h-9 w-9 shrink-0"
        >
          {soundMuted ? <VolumeX className="h-4 w-4 text-muted-foreground" /> : <Volume2 className="h-4 w-4" />}
        </Button>

        {/* Refresh — recarregar dados */}
        <Button
          variant="ghost"
          size="icon"
          aria-label="Recarregar"
          title="Recarregar dados"
          onClick={handleRefresh}
          className="hidden h-9 w-9 shrink-0 sm:inline-flex"
        >
          <RefreshCw className={cn("h-4 w-4 transition-transform", refreshing && "animate-spin")} />
        </Button>

        {/* Mensagens novas — popover dedicado */}
        <Popover open={msgOpen} onOpenChange={setMsgOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Mensagens novas" className="relative h-9 w-9 shrink-0">
              <MessageSquare className="h-4 w-4" />
              {ticketsUnread.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white shadow-sm ring-2 ring-card">
                  {ticketsUnread.length > 99 ? "99+" : ticketsUnread.length}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-96 p-0">
            <div className="flex items-center justify-between border-b px-3 py-2">
              <p className="text-sm font-semibold">Mensagens novas</p>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">tempo real</span>
            </div>
            <div className="max-h-[26rem] overflow-auto">
              {ticketsUnread.length === 0 ? (
                <p className="p-6 text-center text-xs text-muted-foreground">Nenhuma conversa nova.</p>
              ) : ticketsUnread.map((t: any) => {
                const name = t.contact?.name || t.contact?.phone || "Sem nome";
                return (
                  <Link
                    key={t.id}
                    to="/app/chat"
                    search={{ ticketId: t.id } as any}
                    onClick={() => setMsgOpen(false)}
                    className="flex items-start gap-2 border-b px-3 py-2 last:border-0 hover:bg-muted/50"
                  >
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-500/15 text-[11px] font-bold text-emerald-600">
                      {(name || "?").split(" ").map((p: string) => p[0]).slice(0, 2).join("").toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-medium">{name}</p>
                        <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-white">
                          {t.unread_count > 99 ? "99+" : t.unread_count}
                        </span>
                      </div>
                      {t.last_message_preview && (
                        <p className="line-clamp-1 text-xs text-muted-foreground">{t.last_message_preview}</p>
                      )}
                      {t.last_message_at && (
                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(t.last_message_at), { addSuffix: true, locale: ptBR })}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>

        {/* Anúncios / alertas */}
        <Popover open={annOpen} onOpenChange={setAnnOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Avisos" className="relative hidden h-9 w-9 shrink-0 sm:inline-flex">
              <AlertTriangle className="h-4 w-4" />
              {annCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold leading-none text-white shadow-sm ring-2 ring-card">
                  {annCount > 99 ? "99+" : annCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-96 p-0">
            <div className="flex items-center justify-between border-b px-3 py-2">
              <p className="text-sm font-semibold">Avisos e anúncios</p>
            </div>
            <div className="max-h-[26rem] overflow-auto">
              {annCount === 0 ? (
                <p className="p-6 text-center text-xs text-muted-foreground">Nenhum aviso no momento.</p>
              ) : (announcements ?? []).map((a) => (
                <div key={`${a.scope}-${a.id}`} className="border-b px-3 py-2 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                      a.scope === "master" ? "bg-violet-500/15 text-violet-600" : "bg-emerald-500/15 text-emerald-600",
                    )}>
                      {a.scope === "master" ? "Plataforma" : "Workspace"}
                    </span>
                    <p className="truncate text-sm font-medium">{a.title}</p>
                  </div>
                  {a.body && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{a.body}</p>}
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(a.created_at), { addSuffix: true, locale: ptBR })}
                  </p>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Atalho rápido pro chat */}
        <Button
          variant="ghost"
          size="icon"
          aria-label="Ir para o chat"
          title="Chat"
          onClick={() => navigate({ to: mode === "admin" ? "/admin/chat" : "/app/chat" })}
          className="hidden h-9 w-9 shrink-0 lg:inline-flex"
        >
          <MessageCircle className="h-4 w-4" />
        </Button>


        {/* Botão de alternar tema — ao lado do sino */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          aria-label="Alternar tema"
          title={theme === "dark" ? "Tema claro" : "Tema escuro"}
          className="h-9 w-9 shrink-0"
        >
          {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4 text-amber-500" />}
        </Button>


        <Popover
          open={bellOpen}
          onOpenChange={(o) => {
            setBellOpen(o);
            // Ao abrir, zera o contador imediatamente marcando as notificações como lidas.
            // Conversas com mensagens novas continuam contabilizadas até o atendente abrir o chat.
            if (o && notifs.length > 0) {
              void markAllRead();
            }
          }}
        >
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Notificações" data-tour="topbar-bell" className="relative h-9 w-9">
              <Bell className={cn("h-4 w-4", unread > 0 && "animate-bell-shake text-primary")} />
              {unread > 0 && (
                <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white shadow-sm ring-2 ring-card">
                  {unread > 99 ? "99+" : unread}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-96 p-0">
            <div className="flex items-center justify-between border-b px-3 py-2">
              <p className="text-sm font-semibold">Central de notificações</p>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                tempo real
              </span>
            </div>
            <div className="max-h-[26rem] overflow-auto">
              {ticketsUnread.length === 0 && notifs.length === 0 && (
                <p className="p-6 text-center text-xs text-muted-foreground">Sem novidades por aqui.</p>
              )}

              {ticketsUnread.length > 0 && (
                <div>
                  <p className="bg-muted/40 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Conversas novas ({ticketsUnread.length})
                  </p>
                  {ticketsUnread.map((t: any) => {
                    const name = t.contact?.name || t.contact?.phone || "Sem nome";
                    return (
                      <Link
                        key={t.id}
                        to="/app/chat"
                        search={{ ticketId: t.id } as any}
                        onClick={() => setBellOpen(false)}
                        className="flex items-start gap-2 border-b px-3 py-2 last:border-0 hover:bg-muted/50"
                      >
                        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-500/15 text-[11px] font-bold text-emerald-600">
                          {(name || "?").split(" ").map((p: string) => p[0]).slice(0, 2).join("").toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-sm font-medium">{name}</p>
                            <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-white">
                              {t.unread_count > 99 ? "99+" : t.unread_count}
                            </span>
                          </div>
                          {t.last_message_preview && (
                            <p className="line-clamp-1 text-xs text-muted-foreground">{t.last_message_preview}</p>
                          )}
                          {t.last_message_at && (
                            <p className="mt-0.5 text-[10px] text-muted-foreground">
                              {formatDistanceToNow(new Date(t.last_message_at), { addSuffix: true, locale: ptBR })}
                            </p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}

              {notifs.length > 0 && (
                <div>
                  <p className="bg-muted/40 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Avisos do sistema
                  </p>
                  {notifs.map((n: any) => (
                    <Link
                      key={n.id}
                      to={mode === "admin" ? "/admin/notificacoes" : "/app/notificacoes"}
                      onClick={() => setBellOpen(false)}
                      className="block border-b px-3 py-2 last:border-0 hover:bg-muted/50"
                    >
                      <p className="text-sm font-medium">{n.title}</p>
                      {n.body && <p className="line-clamp-2 text-xs text-muted-foreground">{n.body}</p>}
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ptBR })}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <div className="border-t p-2">
              <Link
                to={mode === "admin" ? "/admin/notificacoes" : "/app/notificacoes"}
                onClick={() => setBellOpen(false)}
                className="block rounded-md py-1.5 text-center text-xs font-medium text-primary hover:bg-muted/50"
              >
                Ver todas
              </Link>
            </div>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button data-tour="topbar-profile" className="relative ml-1 rounded-full ring-2 ring-transparent transition hover:ring-primary/30">
              <Avatar className="h-9 w-9">
                <AvatarImage src={profile?.avatar_url ?? undefined} alt={userName} />
                <AvatarFallback className="bg-primary/15 text-xs font-bold text-primary">{userInitials}</AvatarFallback>
              </Avatar>
              <span className={cn("absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-card", currentStatus.color)} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex items-center gap-3 p-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={profile?.avatar_url ?? undefined} alt={userName} />
                <AvatarFallback className="bg-primary/15 text-sm font-bold text-primary">{userInitials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{userName}</p>
                <p className="truncate text-xs text-muted-foreground">{roleLabel}</p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link to={mode === "admin" ? "/admin/configuracoes" : "/app/configuracoes"}><Camera className="mr-2 h-4 w-4" />Alterar Foto</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link to={mode === "admin" ? "/admin/configuracoes" : "/app/configuracoes"}><UserIcon className="mr-2 h-4 w-4" />Conta</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link to={mode === "admin" ? "/admin/configuracoes" : "/app/configuracoes"}><Shield className="mr-2 h-4 w-4" />Segurança</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link to={mode === "admin" ? "/admin/personalizar" : "/app/personalizar"}><Palette className="mr-2 h-4 w-4" />Personalizar</Link></DropdownMenuItem>
            {mode === "app" && (
              <>
                <DropdownMenuItem asChild><Link to="/app/planos/gerenciar"><Package className="mr-2 h-4 w-4" />Planos</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/app/planos/gerenciar"><Receipt className="mr-2 h-4 w-4" />Faturas</Link></DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={async () => { await signOut(); navigate({ to: "/auth" }); }} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {unread > 0 && notifs[0] && (
        <Link
          to={mode === "admin" ? "/admin/notificacoes" : "/app/notificacoes"}
          className="flex items-center gap-3 border-b bg-blue-50 px-4 py-2 text-sm hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/15"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/15">
            <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
              {unread} novidade{unread > 1 ? "s" : ""} no sino
            </p>
            <p className="truncate text-xs text-blue-900/70 dark:text-blue-200/70">{notifs[0].title}</p>
          </div>
        </Link>
      )}
    </>
  );
}
