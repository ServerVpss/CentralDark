// Provider genérico para um servidor Baileys próprio (self-hosted).
// Esta camada é um CONTRATO/placeholder: não depende de nenhum SaaS de terceiros.
// Quando o usuário plugar o servidor dele, basta configurar em master_settings:
//   baileys_enabled = true
//   baileys_server_url = "https://meu-baileys.exemplo.com"
//   baileys_server_token = "<token bearer>"             (server-only)
//   baileys_webhook_secret = "<segredo do webhook>"     (server-only)
//
// O servidor Baileys do usuário deve expor estes endpoints:
//   POST /send                  → enviar mensagem (texto/mídia/interactive)
//   POST /send-campaign         → disparo em massa
//   GET  /qr?session=...        → devolver QR code (data URL) p/ pareamento
//   GET  /status?session=...    → status atual da sessão
//   POST /disconnect            → encerrar sessão
//
// Variáveis de ambiente (fallback se não estiverem em master_settings):
//   BAILEYS_SERVER_URL
//   BAILEYS_SERVER_TOKEN
//   BAILEYS_WEBHOOK_SECRET

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { DispatchInput, DispatchResult, MediaInput, InteractiveButton } from "@/lib/whatsapp-send.server";

const REQUEST_TIMEOUT_MS = 10_000;

type BaileysServerConfig = {
  url: string;
  token: string;
  webhookSecret: string | null;
};

/**
 * Lê config do master_settings (id=1) + fallback pra env. Retorna null se não
 * estiver configurado — usado pra UI mostrar "Servidor Baileys ainda não configurado".
 */
export async function getBaileysServerConfig(): Promise<BaileysServerConfig | null> {
  const { data } = await supabaseAdmin
    .from("master_settings" as never)
    .select("baileys_enabled, baileys_server_url, baileys_server_token, baileys_webhook_secret")
    .eq("id", 1)
    .maybeSingle();
  const r = data as {
    baileys_enabled?: boolean;
    baileys_server_url?: string | null;
    baileys_server_token?: string | null;
    baileys_webhook_secret?: string | null;
  } | null;

  const url = r?.baileys_server_url || process.env.BAILEYS_SERVER_URL || "";
  const token = r?.baileys_server_token || process.env.BAILEYS_SERVER_TOKEN || "";
  const webhookSecret = r?.baileys_webhook_secret || process.env.BAILEYS_WEBHOOK_SECRET || null;

  if (!r?.baileys_enabled || !url || !token) return null;
  return { url: url.replace(/\/+$/, ""), token, webhookSecret };
}

async function callBaileys(
  cfg: BaileysServerConfig,
  method: "GET" | "POST",
  path: string,
  body?: Record<string, unknown>,
): Promise<{ ok: boolean; status: number; data: unknown; error?: string }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`${cfg.url}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${cfg.token}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  } catch (e) {
    const isTimeout = (e as { name?: string })?.name === "AbortError";
    return {
      ok: false,
      status: 0,
      data: null,
      error: isTimeout ? "Timeout ao contatar o servidor Baileys." : `Falha de rede: ${String(e).slice(0, 200)}`,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

// ====================================================================
// CONTRATO — funções placeholder/genéricas
// ====================================================================

export type CreateBaileysInput = { workspaceId: string; name: string; sessionId?: string };
export type CreateBaileysResult =
  | { ok: true; connectionId: string; sessionId: string }
  | { ok: false; error: string };

export async function createBaileysConnection(input: CreateBaileysInput): Promise<CreateBaileysResult> {
  const cfg = await getBaileysServerConfig();
  if (!cfg) return { ok: false, error: "Servidor Baileys ainda não configurado." };

  const sessionId = input.sessionId ?? `ws_${input.workspaceId.slice(0, 8)}_${Date.now()}`;

  const { data: conn, error } = await supabaseAdmin
    .from("whatsapp_connections")
    .insert({
      workspace_id: input.workspaceId,
      name: input.name,
      provider: "baileys_selfhosted",
      status: "qr_pending",
      onboarding_mode: "manual",
      baileys_session_id: sessionId,
      baileys_server_url: cfg.url,
    })
    .select("id")
    .single();
  if (error || !conn) return { ok: false, error: error?.message ?? "Falha ao criar conexão." };

  // Avisa o servidor Baileys pra inicializar a sessão (best-effort).
  await callBaileys(cfg, "POST", "/sessions", {
    sessionId,
    connectionId: conn.id,
    webhookUrl: `https://multizap.dev/api/public/baileys/webhook/${conn.id}`,
  }).catch(() => null);

  return { ok: true, connectionId: conn.id, sessionId };
}

export type GetQrResult =
  | { ok: true; qrDataUrl: string | null; status: string }
  | { ok: false; error: string };

export async function getBaileysQrCode(connectionId: string): Promise<GetQrResult> {
  const cfg = await getBaileysServerConfig();
  if (!cfg) return { ok: false, error: "Servidor Baileys ainda não configurado." };

  const { data: conn } = await supabaseAdmin
    .from("whatsapp_connections")
    .select("id,baileys_session_id,status")
    .eq("id", connectionId)
    .maybeSingle();
  if (!conn?.baileys_session_id) return { ok: false, error: "Sessão Baileys não encontrada." };

  const r = await callBaileys(cfg, "GET", `/qr?session=${encodeURIComponent(conn.baileys_session_id)}`);
  if (!r.ok) return { ok: false, error: r.error ?? `HTTP ${r.status}` };

  const payload = r.data as { qr?: string; status?: string } | null;
  return { ok: true, qrDataUrl: payload?.qr ?? null, status: payload?.status ?? conn.status };
}

export async function disconnectBaileysConnection(connectionId: string): Promise<{ ok: boolean; error?: string }> {
  const cfg = await getBaileysServerConfig();
  const { data: conn } = await supabaseAdmin
    .from("whatsapp_connections")
    .select("id,baileys_session_id")
    .eq("id", connectionId)
    .maybeSingle();
  if (!conn) return { ok: false, error: "Conexão não encontrada." };

  if (cfg && conn.baileys_session_id) {
    await callBaileys(cfg, "POST", "/disconnect", { sessionId: conn.baileys_session_id }).catch(() => null);
  }
  await supabaseAdmin
    .from("whatsapp_connections")
    .update({ status: "disconnected" })
    .eq("id", connectionId);
  return { ok: true };
}

export async function baileysHealthCheck(): Promise<{ ok: boolean; configured: boolean; error?: string }> {
  const cfg = await getBaileysServerConfig();
  if (!cfg) return { ok: false, configured: false, error: "Servidor Baileys ainda não configurado." };
  const r = await callBaileys(cfg, "GET", "/health");
  return { ok: r.ok, configured: true, error: r.ok ? undefined : (r.error ?? `HTTP ${r.status}`) };
}

// ====================================================================
// Dispatcher de envio (chamado pelo roteador em whatsapp-send.server.ts)
// ====================================================================

type BaileysSendBody = {
  sessionId: string;
  connectionId: string;
  to: string;
  text?: string;
  media?: MediaInput;
  interactive?: { bodyText: string; buttons: InteractiveButton[] };
};

export async function sendBaileysMessage(input: DispatchInput): Promise<DispatchResult> {
  const cfg = await getBaileysServerConfig();
  if (!cfg) {
    return { ok: false, code: "BLOCKED", message: "Servidor Baileys ainda não configurado." };
  }

  const { data: conn } = await supabaseAdmin
    .from("whatsapp_connections")
    .select("id,workspace_id,baileys_session_id,status")
    .eq("id", input.connectionId)
    .maybeSingle();
  if (!conn) return { ok: false, code: "NOT_FOUND", message: "Conexão não encontrada." };
  if (!conn.baileys_session_id) {
    return { ok: false, code: "BLOCKED", message: "Sessão Baileys não inicializada." };
  }

  const body: BaileysSendBody = {
    sessionId: conn.baileys_session_id,
    connectionId: conn.id,
    to: input.to,
    text: input.text,
    media: input.media,
    interactive: input.interactive,
  };

  const r = await callBaileys(cfg, "POST", "/send", body as unknown as Record<string, unknown>);

  const logBase = {
    workspace_id: conn.workspace_id,
    connection_id: conn.id,
    direction: "outbound" as const,
    contact_phone: input.to,
    ticket_id: input.ticketId ?? null,
    body: input.text ?? input.media?.caption ?? input.interactive?.bodyText ?? null,
    message_type: input.media?.type ?? (input.interactive ? "interactive" : "text"),
    is_template: false,
  };

  if (!r.ok) {
    const errMsg = r.error ?? (r.data as { error?: string })?.error ?? `HTTP ${r.status}`;
    await supabaseAdmin.from("whatsapp_message_log").insert({
      ...logBase,
      status: "failed",
      error_code: r.status ? String(r.status) : "NETWORK",
      error_message: errMsg,
    });
    return { ok: false, code: r.status === 0 ? "NETWORK" : "META_ERROR", message: errMsg };
  }

  const messageId = (r.data as { messageId?: string; id?: string } | null)?.messageId
    ?? (r.data as { id?: string } | null)?.id
    ?? null;

  await supabaseAdmin.from("whatsapp_message_log").insert({
    ...logBase,
    status: "sent",
    message_id: messageId,
  });

  return { ok: true, messageId };
}
