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
    .select("payments_module_enabled, payments_auto_collection_enabled")
    .eq("id", 1)
    .maybeSingle();
  const m = master as { payments_module_enabled?: boolean; payments_auto_collection_enabled?: boolean } | null;
  if (!m?.payments_module_enabled || !m?.payments_auto_collection_enabled) {
    return result;
  }

  // PIX pendentes (não pagos, não cancelados) — limitar batch
  const { data: rows } = await supabaseAdmin
    .from("pix_transactions")
    .select(
      "id, workspace_id, contact_id, conversation_id, connection_id, amount, copy_paste, expires_at, created_at, status, metadata",
    )
    .eq("status", "PENDENTE")
    .not("workspace_id", "is", null)
    .order("created_at", { ascending: true })
    .limit(200);

  const pix = (rows ?? []) as PixRow[];
  result.scanned = pix.length;

  // Pré-carrega settings por workspace
  const wsIds = Array.from(new Set(pix.map((p) => p.workspace_id)));
  const settingsMap = new Map<string, WsSettings>();
  if (wsIds.length) {
    const { data: settings } = await supabaseAdmin
      .from("workspace_payment_settings")
      .select(
        "workspace_id, auto_collection_enabled, auto_regenerate_expired_pix, reminder_intervals_minutes, max_reminders_per_payment, max_reminders_per_day, business_hours_only, business_hours_start, business_hours_end, msg_reminder_template, msg_expired_template",
      )
      .in("workspace_id", wsIds);
    for (const s of (settings ?? []) as unknown as WsSettings[]) settingsMap.set(s.workspace_id, s);
  }

  // Workspaces pausados pelo master
  const { data: ctrls } = await supabaseAdmin
    .from("workspace_controls")
    .select("workspace_id, is_paused, block_whatsapp_send")
    .in("workspace_id", wsIds.length ? wsIds : ["00000000-0000-0000-0000-000000000000"]);
  const ctrlMap = new Map<string, { paused: boolean; blocked: boolean }>();
  for (const c of (ctrls ?? []) as Array<{ workspace_id: string; is_paused: boolean; block_whatsapp_send: boolean }>) {
    ctrlMap.set(c.workspace_id, { paused: !!c.is_paused, blocked: !!c.block_whatsapp_send });
  }

  for (const p of pix) {
    try {
      const ws = settingsMap.get(p.workspace_id);
      if (!ws) { result.skipped++; continue; }
      if (!ws.auto_collection_enabled) { result.skipped++; continue; }
      const ctrl = ctrlMap.get(p.workspace_id);
      if (ctrl?.paused || ctrl?.blocked) { result.skipped++; continue; }

      const optOut = !!(p.metadata as { collection_opt_out?: boolean })?.collection_opt_out;
      const paused = !!(p.metadata as { collection_paused?: boolean })?.collection_paused;
      if (optOut || paused) { result.skipped++; continue; }

      // Stop on customer reply
      if (await shouldStopByCustomerReply(p.created_at, p.conversation_id)) {
        result.skipped++;
        continue;
      }

      const now = new Date();
      const expiresAt = p.expires_at ? new Date(p.expires_at) : null;
      const isExpired = expiresAt && expiresAt.getTime() <= now.getTime();

      // ===== Expirado =====
      if (isExpired) {
        await supabaseAdmin.from("pix_transactions").update({ status: "EXPIRADO" }).eq("id", p.id).eq("status", "PENDENTE");

        const body = fmtMsg(ws.msg_expired_template, EXPIRED_FALLBACK, {
          valor: fmtBRL(Number(p.amount)),
          expira_em: expiresAt!.toLocaleString("pt-BR"),
          nome: "",
        });

        // Enviar aviso (se conexão disponível e contato com telefone)
        const sent = await tryDispatch(p, body);
        await logEvent({
          workspaceId: p.workspace_id, pixId: p.id, contactId: p.contact_id,
          conversationId: p.conversation_id, connectionId: p.connection_id,
          eventType: "expired", body, status: sent.ok ? "sent" : "failed",
          error: sent.ok ? null : sent.error,
        });
        result.expired++;

        if (ws.auto_regenerate_expired_pix) {
          await logEvent({
            workspaceId: p.workspace_id, pixId: p.id, contactId: p.contact_id,
            conversationId: p.conversation_id, connectionId: p.connection_id,
            eventType: "regenerate_requested", status: "skipped",
            metadata: { note: "auto_regenerate_expired_pix=true (regeração será disparada por fluxo dedicado)" },
          });
          result.regenerated++;
        }
        continue;
      }

      // ===== Horário comercial =====
      if (ws.business_hours_only && !inBusinessHours(ws.business_hours_start, ws.business_hours_end)) {
        result.skipped++;
        continue;
      }

      // ===== Régua de lembretes =====
      const sentCount = await countReminders(p.id);
      if (sentCount >= ws.max_reminders_per_payment) { result.skipped++; continue; }

      const intervals = Array.isArray(ws.reminder_intervals_minutes) && ws.reminder_intervals_minutes.length
        ? ws.reminder_intervals_minutes
        : [30, 60];
      const targetMinutes = intervals[sentCount];
      if (typeof targetMinutes !== "number") { result.skipped++; continue; }

      const ageMin = (now.getTime() - new Date(p.created_at).getTime()) / 60_000;
      if (ageMin < targetMinutes) { result.skipped++; continue; }

      // Limite diário por workspace
      const dailyCount = await countRemindersTodayWorkspace(p.workspace_id);
      if (dailyCount >= ws.max_reminders_per_day * Math.max(1, wsIds.length)) {
        result.skipped++;
        continue;
      }

      // Buscar nome do contato
      let nome = "Cliente";
      if (p.contact_id) {
        const { data: c } = await supabaseAdmin
          .from("contacts").select("name").eq("id", p.contact_id).maybeSingle();
        nome = (c?.name as string) || "Cliente";
      }

      const body = fmtMsg(ws.msg_reminder_template, REMINDER_FALLBACK, {
        nome,
        valor: fmtBRL(Number(p.amount)),
        expira_em: expiresAt ? expiresAt.toLocaleString("pt-BR") : "—",
        pix_copia_e_cola: p.copy_paste ?? "(indisponível)",
      });

      const sent = await tryDispatch(p, body);
      await logEvent({
        workspaceId: p.workspace_id, pixId: p.id, contactId: p.contact_id,
        conversationId: p.conversation_id, connectionId: p.connection_id,
        eventType: "reminder", body,
        status: sent.ok ? "sent" : "failed",
        error: sent.ok ? null : sent.error,
        metadata: { interval_minutes: targetMinutes, attempt: sentCount + 1 },
      });
      if (sent.ok) result.reminded++; else result.errors++;
    } catch (e) {
      result.errors++;
      console.error("[collection-runner] erro processando pix", p.id, e);
    }
  }

  return result;
}

async function tryDispatch(p: PixRow, body: string): Promise<{ ok: boolean; error?: string }> {
  if (!p.connection_id || !p.contact_id) {
    return { ok: false, error: "missing_connection_or_contact" };
  }
  const { data: contact } = await supabaseAdmin
    .from("contacts").select("phone").eq("id", p.contact_id).maybeSingle();
  if (!contact?.phone) return { ok: false, error: "missing_contact_phone" };

  const res = await dispatchWhatsAppMessage({
    connectionId: p.connection_id,
    to: contact.phone,
    text: body,
    ticketId: p.conversation_id ?? undefined,
  });
  if (!res.ok) return { ok: false, error: `${res.code}: ${res.message}` };

  // Espelhar como mensagem system no ticket
  if (p.conversation_id) {
    await supabaseAdmin.from("ticket_messages").insert({
      workspace_id: p.workspace_id,
      ticket_id: p.conversation_id,
      author: "system",
      kind: "text",
      body,
      external_id: res.messageId ?? null,
      metadata: { collection: true, pix_id: p.id } as never,
    });
  }
  return { ok: true };
}
