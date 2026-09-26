# COMANDO - NotificationCenter.tsx
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\apps\crm\src\components\notifications\NotificationCenter.tsx
**SHA:** 76a293a7e6c121a6
**Timestamp:** 2026-08-26T19:31:08.664157
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- const navigate = useNavigate();

### Ouro Bruto (primeiros 5000 chars)
```
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
    try 
```