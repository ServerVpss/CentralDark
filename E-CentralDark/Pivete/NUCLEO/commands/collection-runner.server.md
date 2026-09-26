# COMANDO - collection-runner.server.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-local\apps\crm\src\lib\payments\collection-runner.server.ts
**SHA:** 2d5c86a1e861a476
**Timestamp:** 2026-08-26T19:33:49.615645
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- business_hours_start: string;
- function inBusinessHours(start: string, end: string, now = new Date()): boolean {

### Ouro Bruto (primeiros 5000 chars)
```
// Cobrança automática de PIX pendentes.
// Executado pelo cron (/api/public/cron/payment-collection).
// Regras: lê master_settings, workspace_payment_settings, pix_transactions.
// Envia lembretes via dispatchWhatsAppMessage respeitando janela 24h, limites e horário comercial.
// Segurança: server-only. NUNCA exporta credenciais. Idempotente via payment_collection_events.

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { dispatchWhatsAppMessage } from "@/lib/whatsapp-send.server";

type WsSettings = {
  workspace_id: string;
  auto_collection_enabled: boolean;
  auto_regenerate_expired_pix: boolean;
  reminder_intervals_minutes: number[];
  max_reminders_per_payment: number;
  max_reminders_per_day: number;
  business_hours_only: boolean;
  business_hours_start: string;
  business_hours_end: string;
  msg_reminder_template: string | null;
  msg_expired_template: string | null;
};

type PixRow = {
  id: string;
  workspace_id: string;
  contact_id: string | null;
  conversation_id: string | null;
  connection_id: string | null;
  amount: number;
  copy_paste: string | null;
  expires_at: string | null;
  created_at: string;
  status: string;
  metadata: Record<string, unknown>;
};

function fmtBRL(n: number) {
  return Number(n).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtMsg(tpl: string | null, fallback: string, vars: Record<string, string>) {
  const base = (tpl && tpl.trim()) || fallback;
  return Object.entries(vars).reduce((acc, [k, v]) => acc.replaceAll(`{${k}}`, v), base);
}

function inBusinessHours(start: string, end: string, now = new Date()): boolean {
  // Comparação simples por hora local (servidor roda em UTC; consideramos UTC-3 do BR)
  const offsetMin = -180; // America/Sao_Paulo aproximado (sem DST oficial atualmente)
  const local = new Date(now.getTime() + offsetMin * 60_000);
  const hhmm = local.toISOString().slice(11, 16);
  return hhmm >= start.slice(0, 5) && hhmm <= end.slice(0, 5);
}

const REMINDER_FALLBACK = [
  "🔔 *LEMBRETE DE PAGAMENTO*",
  "",
  "Olá, *{nome}*!",
  "",
  "Seu PIX ainda está aguardando pagamento.",
  "",
  "💰 *Valor:* {valor}",
  "⏳ *Validade:* {expira_em}",
  "",
  "📋 *PIX Copia e Cola:*",
  "`{pix_copia_e_cola}`",
  "",
  "Assim que o pagamento for confirmado, você será avisado automaticamente. ✅",
].join("\n");

const EXPIRED_FALLBACK = [
  "⌛ *PIX EXPIRADO*",
  "",
  "O PIX anterior venceu e não pode mais ser pago.",
  "",
  "💰 *Valor:* {valor}",
  "📅 *Vencimento:* {expira_em}",
  "",
  "Se ainda deseja concluir o pagamento, posso gerar uma nova cobrança para você. ✅",
].join("\n");

async function logEvent(opts: {
  workspaceId: string;
  pixId: string;
  contactId: string | null;
  conversationId: string | null;
  connectionId: string | null;
  eventType: string;
  body?: string | null;
  status?: "sent" | "skipped" | "failed";
  error?: string | null;
  metadata?: Record<string, unknown>;
}) {
  await supabaseAdmin.from("payment_collection_events").insert({
    workspace_id: opts.workspaceId,
    payment_request_id: opts.pixId,
    contact_id: opts.contactId,
    conversation_id: opts.conversationId,
    connection_id: opts.connectionId,
    event_type: opts.eventType,
    message_body: opts.body ?? null,
    status: opts.status ?? "sent",
    error_message: opts.error ?? null,
    metadata: (opts.metadata ?? {}) as never,
  });
}

async function countReminders(pixId: string): Promise<number> {
  const { count } = await supabaseAdmin
    .from("payment_collection_events")
    .select("id", { count: "exact", head: true })
    .eq("payment_request_id", pixId)
    .eq("event_type", "reminder")
    .eq("status", "sent");
  return count ?? 0;
}

async function countRemindersTodayWorkspace(workspaceId: string): Promise<number> {
  const since = new Date(Date.now() - 24 * 3600_000).toISOString();
  const { count } = await supabaseAdmin
    .from("payment_collection_events")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .eq("event_type", "reminder")
    .eq("status", "sent")
    .gte("created_at", since);
  return count ?? 0;
}

async function shouldStopByCustomerReply(pixCreatedAt: string, conversationId: string | null): Promise<boolean> {
  if (!conversationId) return false;
  const { data } = await supabaseAdmin
    .from("ticket_messages")
    .select("id")
    .eq("ticket_id", conversationId)
    .eq("author", "contact")
    .gt("created_at", pixCreatedAt)
    .limit(1)
    .maybeSingle();
  return !!data;
}

export type RunResult = {
  scanned: number;
  reminded: number;
  expired: number;
  regenerated: number;
  skipped: number;
  errors: number;
};

export async function runPaymentCollection(): Promise<RunResult> {
  const result: RunResult = { scanned: 0, reminded: 0, expired: 0, regenerated: 0, skipped: 0, errors: 0 };

  // Master gates
  const { data: master } = await supabaseAdmin
    .from("master_settings")
    .select("payments_module
```