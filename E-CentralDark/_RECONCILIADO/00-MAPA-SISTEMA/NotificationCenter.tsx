// Provider central de notificações: inicializa OneSignal, escuta realtime do workspace,
// toca som e mostra toast quando chega mensagem nova.
import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Bell, MessageCircle, Eye, UserCheck, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useCurrentWorkspace } from "@/hooks/use-workspace";
import { Button } from "@/components/ui/button";
import { playNotificationSound, unlockSound, isSoundUnlocked } from "@/lib/notification-sound";
import { claimTicket } from "@/lib/tickets.functions";
import { formatDateBR, formatTimeBR } from "@/lib/datetime";
import {
  getNotificationsConfig,
  getMyPreferences,
  registerPushSubscription,
} from "@/lib/notifications.functions";

declare global {
  interface Window {
    OneSignalDeferred?: Array<(os: OneSignalLike) => void>;
    OneSignal?: OneSignalLike;
  }
}

type OneSignalLike = {
  init: (opts: Record<string, unknown>) => Promise<void>;
  login?: (externalId: string) => Promise<void>;
  User?: {
    PushSubscription?: {
      id?: string | null;
      addEventListener?: (event: string, cb: () => void) => void;
    };
    addTag?: (k: string, v: string) => void;
  };
  Notifications?: {
    requestPermission?: () => Promise<boolean>;
    permission?: boolean;
  };
};

export function NotificationCenter() {
  const { user, session } = useAuth();
  const { data: ws } = useCurrentWorkspace();
  const loc = useLocation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fetchConfig = useServerFn(getNotificationsConfig);
  const fetchPrefs = useServerFn(getMyPreferences);
  const registerSub = useServerFn(registerPushSubscription);
  const claim = useServerFn(claimTicket);

  const { data: cfg } = useQuery({
    queryKey: ["notifications-config"],
    queryFn: () => fetchConfig(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: prefs } = useQuery({
    queryKey: ["notif-prefs", ws?.id],
    enabled: !!ws?.id && !!user,
    queryFn: () => fetchPrefs({ data: { workspace_id: ws!.id } }),
  });

  const [soundReady, setSoundReady] = useState(false);
  const [notifPerm, setNotifPerm] = useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "denied",
  );
  const [showBanner, setShowBanner] = useState(false);
  const lastSoundAt = useRef(0);

  // Estado inicial: detecta se o navegador já liberou som/notificação.
  // Se já liberou tudo → não mostra banner.
  // Se o usuário clicou "Agora não" recentemente (7 dias) → não mostra banner.
  // Se o navegador BLOQUEOU permissão de notificação → não pede de novo (sem chance no JS).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const alreadyEnabled = localStorage.getItem("mz_sound_enabled") === "1";
    const ready = isSoundUnlocked();
    setSoundReady(ready);

    const perm: NotificationPermission =
      typeof Notification !== "undefined" ? Notification.permission : "denied";
    setNotifPerm(perm);

    const needSound = !ready;
    // Só precisa pedir notificação se ainda está em "default" (nem aceito, nem negado)
    const needNotif = typeof Notification !== "undefined" && perm === "default";

    if (alreadyEnabled && needSound) {
      // Reativa silenciosamente no primeiro gesto
      const reactivate = async () => {
        const ok = await unlockSound();
        if (ok) setSoundReady(true);
        window.removeEventListener("pointerdown", reactivate);
        window.removeEventListener("keydown", reactivate);
      };
      window.addEventListener("pointerdown", reactivate, { once: true });
      window.addEventListener("keydown", reactivate, { once: true });
    }

    // Respeita "Agora não" por 7 dias
    const dismissedAt = Number(localStorage.getItem("mz_notif_banner_dismissed_at") || 0);
    const dismissedRecently = dismissedAt > 0 && Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000;

    // Banner aparece só se faltar algo E não foi dispensado recentemente
    if ((needSound || needNotif) && !dismissedRecently) setShowBanner(true);
  }, []);



  // Inicializa OneSignal — só uma vez por sessão
  useEffect(() => {
    if (!cfg?.onesignal_app_id || !user?.id || typeof window === "undefined") return;
    if (window.OneSignal) return; // já carregado
    // OneSignal é restrito ao domínio de produção configurado no painel deles.
    // Em preview/iframe do Lovable a init sempre falha — pular silenciosamente.
    const host = window.location.hostname;
    const isPreview =
      host.includes("lovableproject.com") ||
      host.includes("lovable.app") ||
      host === "localhost" ||
      host === "127.0.0.1";
    let inIframe = false;
    try { inIframe = window.self !== window.top; } catch { inIframe = true; }
    if (isPreview || inIframe) return;

    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async (OneSignal) => {
      try {
        await OneSignal.init({
          appId: cfg.onesignal_app_id,
          serviceWorkerPath: "/OneSignalSDKWorker.js",
          serviceWorkerParam: { scope: "/" },
          allowLocalhostAsSecureOrigin: true,
          notifyButton: { enable: false },
        });
        if (OneSignal.login) await OneSignal.login(user.id);
        if (ws?.id) OneSignal.User?.addTag?.("workspace_id", ws.id);

        // Após init, tenta capturar o subscription id e registra no backend
        const sub = OneSignal.User?.PushSubscription;
        const subId = sub?.id ?? null;
        if (subId) {
          await registerSub({
            data: {
              provider: "onesignal",
              external_id: subId,
              workspace_id: ws?.id ?? null,
              device_type: /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? "mobile" : "desktop",
              browser: navigator.userAgent.slice(0, 100),
              os: (navigator as Navigator & { platform?: string }).platform ?? null,
            },
          }).catch(() => {});
        }
        sub?.addEventListener?.("change", async () => {
          const id = OneSignal.User?.PushSubscription?.id;
          if (id) {
            registerSub({
              data: {
                provider: "onesignal",
                external_id: id,
                workspace_id: ws?.id ?? null,
                device_type: /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? "mobile" : "desktop",
                browser: navigator.userAgent.slice(0, 100),
                os: (navigator as Navigator & { platform?: string }).platform ?? null,
              },
            }).catch(() => {});
          }
        });
      } catch (e) {
        console.warn("[OneSignal] init falhou:", e);
      }
    });

    // Carrega o SDK
    const script = document.createElement("script");
    script.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
    script.defer = true;
    document.head.appendChild(script);
  }, [cfg?.onesignal_app_id, user?.id, ws?.id, registerSub]);

  // Atualiza badge do título quando chega mensagem nova
  const unreadCount = useRef(0);
  const baseTitle = useRef<string>(typeof document !== "undefined" ? document.title : "");
  const updateTitle = useCallback(() => {
    if (typeof document === "undefined") return;
    const base = baseTitle.current || "MultiZap";
    document.title = unreadCount.current > 0 ? `(${unreadCount.current}) ${base}` : base;
  }, []);

  // Limpa badge quando a aba volta a ficar visível
  useEffect(() => {
    if (typeof document === "undefined") return;
    const onVis = () => {
      if (document.visibilityState === "visible") {
        unreadCount.current = 0;
        updateTitle();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [updateTitle]);

  // Realtime: mensagens novas do workspace
  useEffect(() => {
    if (!ws?.id || !session?.user?.id) return;
    const channel = supabase
      .channel(`ws:${ws.id}:notifications`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ticket_messages",
          filter: `workspace_id=eq.${ws.id}`,
        },
        (payload) => {
          const row = payload.new as {
            author?: string;
            ticket_id?: string;
            body?: string;
            is_internal_note?: boolean;
            created_at?: string;
            message_type?: string;
          };
          // Só notifica mensagens recebidas de clientes
          if (row.author !== "contact" || row.is_internal_note) return;

          // Não notifica se já está olhando a conversa
          const currentParams = new URLSearchParams(loc.search);
          const openTicket = currentParams.get("ticketId");
          const chatOpen = loc.pathname.startsWith("/app/chat") && openTicket === row.ticket_id;
          const allowWhenOpen = prefs?.notify_when_chat_open ?? false;
          if (chatOpen && !allowWhenOpen) return;

          // Invalida lista de tickets e mensagens IMEDIATAMENTE, pra UI atualizar
          // junto com o toast (e não depois do realtime do inbox/chat).
          qc.invalidateQueries({ queryKey: ["nex-chat-tickets"] });
          qc.invalidateQueries({ queryKey: ["nex-chat-messages", row.ticket_id] });
          qc.invalidateQueries({ queryKey: ["nex-inbox-tickets"] });
          qc.invalidateQueries({ queryKey: ["nex-inbox-messages", row.ticket_id] });
          qc.invalidateQueries({ queryKey: ["inbox-tickets-all"] });
          qc.invalidateQueries({ queryKey: ["inbox-messages", row.ticket_id] });
          qc.invalidateQueries({ queryKey: ["ticket-timeline", row.ticket_id] });

          // Anti-spam de som (no máx 1 a cada 2s)
          const now = Date.now();
          const canPlay = now - lastSoundAt.current > 2000;
          const muted = typeof window !== "undefined" && localStorage.getItem("mz_sound_muted") === "1";
          if (canPlay && !muted && (prefs?.sound_enabled ?? true) && soundReady) {
            playNotificationSound(
              (prefs?.sound_choice as "suave" | "classico" | "alerta") ?? "suave",
              prefs?.sound_volume ?? 70,
            );
            lastSoundAt.current = now;
          }

          // Buscar dados do ticket pra montar o card rico
          (async () => {
            const { data: ticket } = await supabase
              .from("tickets")
              .select("id, assignee_id, status, channel_type, chat_id, contact:contacts(name, phone, avatar_url), group:whatsapp_groups(name, picture_url)")
              .eq("id", row.ticket_id!)
              .maybeSingle();

            const contact = (ticket as any)?.contact ?? null;
            const group = (ticket as any)?.group ?? null;
            const isJid = (s?: string | null) => !!s && /@(g\.us|lid|s\.whatsapp\.net|c\.us|broadcast)$/i.test(String(s).trim());
            const isGroupTicket =
              (ticket as any)?.channel_type === "group" ||
              (typeof (ticket as any)?.chat_id === "string" && (ticket as any).chat_id.endsWith("@g.us"));
            const groupNameSafe = group?.name && !isJid(group.name) ? group.name : null;
            const contactNameSafe = contact?.name && !isJid(contact.name) ? contact.name : null;
            const name = isGroupTicket
              ? (groupNameSafe ?? contactNameSafe ?? "Grupo WhatsApp")
              : (contactNameSafe ?? (contact?.phone && !isJid(contact.phone) ? contact.phone : "Contato sem nome"));
            const phone = (contact?.phone && !isJid(contact.phone)) ? contact.phone : "—";
            const initials = (name || "?")
              .split(" ").map((p: string) => p[0]).slice(0, 2).join("").toUpperCase();
            const when = new Date(row.created_at ?? Date.now());
            const hh = formatTimeBR(when);
            const dd = formatDateBR(when, { day: "2-digit", month: "2-digit", year: undefined });
            const alreadyClaimed = !!(ticket as any)?.assignee_id;
            const claimedByMe = (ticket as any)?.assignee_id === session?.user?.id;
            const preview =
              row.message_type && row.message_type !== "text"
                ? `[${row.message_type}]`
                : (row.body?.slice(0, 140) ?? "");

            const goToChat = () => {
              navigate({ to: "/app/chat", search: { ticketId: row.ticket_id } as any });
            };

            toast.custom(
              (t) => (
                <div className="w-[360px] overflow-hidden rounded-xl border bg-card shadow-xl ring-1 ring-black/5">
                  {/* Cabeçalho colorido */}
                  <div className="flex items-center gap-2 border-b bg-primary/5 px-3 py-2">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-70" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
                      Nova mensagem no WhatsApp
                    </p>
                    <div className="ml-auto flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {hh} · {dd}
                    </div>
                  </div>

                  {/* Corpo */}
                  <div className="flex gap-3 p-3">
                    <div className="relative h-11 w-11 shrink-0">
                      {(isGroupTicket ? group?.picture_url : contact?.avatar_url) ? (
                        <img
                          src={isGroupTicket ? group?.picture_url : contact?.avatar_url}
                          alt={name}
                          className="h-11 w-11 rounded-full object-cover"
                        />
                      ) : (
                        <div className="grid h-11 w-11 place-items-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                          {initials}
                        </div>
                      )}
                      <span className="absolute -bottom-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full bg-emerald-500 ring-2 ring-card">
                        <MessageCircle className="h-2.5 w-2.5 text-white" />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold">{name}</p>
                        {alreadyClaimed && (
                          <span
                            className={
                              "rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase " +
                              (claimedByMe
                                ? "bg-emerald-500/15 text-emerald-600"
                                : "bg-amber-500/15 text-amber-600")
                            }
                          >
                            {claimedByMe ? "Você atende" : "Em atendimento"}
                          </span>
                        )}
                      </div>
                      <p className="truncate text-[11px] text-muted-foreground">{phone}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-foreground/80">{preview}</p>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex gap-2 border-t bg-muted/30 px-3 py-2">
                    {!alreadyClaimed && (
                      <Button
                        size="sm"
                        className="h-8 flex-1 gap-1.5"
                        onClick={async () => {
                          try {
                            await claim({ data: { ticketId: row.ticket_id! } });
                            qc.invalidateQueries({ queryKey: ["tickets"] });
                            toast.success("Atendimento assumido");
                            goToChat();
                          } catch (e: any) {
                            toast.error(e?.message || "Não consegui assumir");
                          } finally {
                            toast.dismiss(t);
                          }
                        }}
                      >
                        <UserCheck className="h-3.5 w-3.5" />
                        Aceitar
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant={alreadyClaimed ? "default" : "outline"}
                      className="h-8 flex-1 gap-1.5"
                      onClick={() => { goToChat(); toast.dismiss(t); }}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Ver conversa
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2 text-xs"
                      onClick={() => toast.dismiss(t)}
                    >
                      Fechar
                    </Button>
                  </div>
                </div>
              ),
              { duration: 8000 },
            );
          })().catch(() => {});

          // Badge do título quando a aba não está visível
          if (typeof document !== "undefined" && document.visibilityState !== "visible") {
            unreadCount.current += 1;
            updateTitle();
          }
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [ws?.id, session?.user?.id, prefs?.sound_enabled, prefs?.sound_choice, prefs?.sound_volume, prefs?.notify_when_chat_open, soundReady, loc.pathname, loc.search, updateTitle, navigate, claim, qc]);

  const handleEnable = async () => {
    // 1) Desbloqueia som
    const ok = await unlockSound();
    setSoundReady(ok);
    if (ok) {
      localStorage.setItem("mz_sound_enabled", "1");
      playNotificationSound("suave", prefs?.sound_volume ?? 70);
    }
    // 2) Pede permissão de notificação do navegador (se ainda em "default")
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      try {
        const perm = await Notification.requestPermission();
        setNotifPerm(perm);
      } catch {
        // ignora — alguns navegadores bloqueiam fora de gesto
      }
    }
    setShowBanner(false);
  };

  const handleDismiss = () => {
    // Persiste por 7 dias pra não ficar aparecendo toda hora
    try { localStorage.setItem("mz_notif_banner_dismissed_at", String(Date.now())); } catch {}
    setShowBanner(false);
  };


  if (!showBanner) return null;
  const needSound = !soundReady;
  const needNotif = typeof Notification !== "undefined" && notifPerm === "default";
  const title = needSound && needNotif
    ? "Ativar som e notificações"
    : needSound
      ? "Ativar som de novas mensagens"
      : "Ativar notificações do navegador";
  return (
    <div className="fixed bottom-4 left-1/2 z-[90] w-[min(92vw,420px)] -translate-x-1/2 rounded-lg border bg-card p-3 shadow-xl">
      <div className="flex items-start gap-3">
        <Bell className="mt-0.5 h-5 w-5 text-primary" />
        <div className="flex-1">
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">
            Seu navegador precisa de um clique pra liberar. Toque uma vez e tá tudo certo.
          </p>
        </div>
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={handleDismiss}>Agora não</Button>
        <Button size="sm" onClick={handleEnable}>Ativar</Button>
      </div>
    </div>
  );
}

