// Helper de servidor pra disparar push via OneSignal e logar eventos.
// Nunca importar isso direto em componentes — só dentro de serverFn ou rota de API.
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const ONESIGNAL_API = "https://onesignal.com/api/v1/notifications";

type NewMessagePushArgs = {
  workspaceId: string;
  conversationId: string;        // ticket_id
  connectionId?: string | null;
  contactName: string;
  preview: string;
  // Se vier setado, só notifica esse atendente (quando "notify_when_assigned_only" estiver ligado pra ele).
  assigneeUserId?: string | null;
};

/**
 * Dispara push pros membros do workspace (via external_user_id = user_id no OneSignal).
 * Fire-and-forget: erros não estouram, só ficam em notification_events.
 */
export async function sendPushOnNewMessage(args: NewMessagePushArgs): Promise<void> {
  const appId = process.env.ONESIGNAL_APP_ID;
  const apiKey = process.env.ONESIGNAL_REST_API_KEY;
  if (!appId || !apiKey) {
    await supabaseAdmin.from("notification_events").insert({
      workspace_id: args.workspaceId,
      conversation_id: args.conversationId,
      type: "new_message",
      status: "skipped",
      provider: "onesignal",
      error_message: "Variáveis ONESIGNAL_APP_ID / ONESIGNAL_REST_API_KEY ausentes",
    });
    return;
  }

  // Descobre os usuários do workspace que devem receber push.
  const { data: members } = await supabaseAdmin
    .from("workspace_members")
    .select("user_id")
    .eq("workspace_id", args.workspaceId);
  const memberIds = (members ?? []).map((m) => m.user_id).filter(Boolean);
  if (!memberIds.length) return;

  // Preferências: quem desligou push, ou pediu "só atribuídos a mim".
  const { data: prefs } = await supabaseAdmin
    .from("notification_preferences")
    .select("user_id,push_enabled,notify_when_assigned_only,quiet_hours_enabled,quiet_hours_start,quiet_hours_end")
    .eq("workspace_id", args.workspaceId)
    .in("user_id", memberIds);

  const now = new Date();
  const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  const allowed = memberIds.filter((uid) => {
    const p = prefs?.find((x) => x.user_id === uid);
    if (!p) return true; // sem preferência salva, manda
    if (!p.push_enabled) return false;
    if (p.notify_when_assigned_only && args.assigneeUserId && args.assigneeUserId !== uid) return false;
    if (p.quiet_hours_enabled) {
      const s = (p.quiet_hours_start ?? "22:00").slice(0, 5);
      const e = (p.quiet_hours_end ?? "08:00").slice(0, 5);
      // Janela podendo cruzar meia-noite
      const inWindow = s <= e ? (hhmm >= s && hhmm < e) : (hhmm >= s || hhmm < e);
      if (inWindow) return false;
    }
    return true;
  });
  if (!allowed.length) return;

  const previewSafe = (args.preview || "").slice(0, 140);
  const title = "Nova mensagem no MultiZap";
  const message = `${args.contactName}: ${previewSafe}`;

  const body = {
    app_id: appId,
    include_external_user_ids: allowed,
    channel_for_external_user_ids: "push",
    headings: { en: title, pt: title },
    contents: { en: message, pt: message },
    url: `/app/chat?ticketId=${args.conversationId}`,
    data: {
      conversation_id: args.conversationId,
      connection_id: args.connectionId ?? null,
      workspace_id: args.workspaceId,
    },
    chrome_web_icon: "/og-image.jpg",
    chrome_web_badge: "/og-image.jpg",
    web_push_topic: `chat-${args.conversationId}`, // colapsa pushes da mesma conversa
  };

  try {
    const res = await fetch(ONESIGNAL_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${apiKey}`,
      },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    await supabaseAdmin.from("notification_events").insert({
      workspace_id: args.workspaceId,
      conversation_id: args.conversationId,
      type: "new_message",
      status: res.ok ? "sent" : "failed",
      provider: "onesignal",
      error_message: res.ok ? null : `${res.status} ${text.slice(0, 300)}`,
      metadata: { recipients: allowed.length, response: safeJson(text) } as never,
    });
  } catch (e) {
    await supabaseAdmin.from("notification_events").insert({
      workspace_id: args.workspaceId,
      conversation_id: args.conversationId,
      type: "new_message",
      status: "failed",
      provider: "onesignal",
      error_message: String(e),
    });
  }
}

function safeJson(s: string): unknown {
  try { return JSON.parse(s); } catch { return s.slice(0, 300); }
}
