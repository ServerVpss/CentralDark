// Helper server-only que decide e dispara saudação e mensagem de ausente
// quando uma nova mensagem chega via webhook. Não bloqueia o webhook —
// roda em fire-and-forget e respeita o limite anti-ban do dispatch.

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { dispatchWhatsAppMessage } from "@/lib/whatsapp-send.server";

type Ctx = {
  connectionId: string;
  workspaceId: string;
  contactPhone: string;
  ticketId: string;
  isFirstMessageInTicket: boolean;
};

// Pega hora local da conexão (timezone configurado) e retorna { weekday, hhmm, dateISO }
function nowInTz(tz: string) {
  const d = new Date();
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: tz, weekday: "short", hour: "2-digit", minute: "2-digit",
    hour12: false, year: "numeric", month: "2-digit", day: "2-digit",
  });
  const parts = Object.fromEntries(fmt.formatToParts(d).map(p => [p.type, p.value]));
  const weekdayMap: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  };
  return {
    weekday: weekdayMap[parts.weekday ?? "Mon"] ?? 1,
    hhmm: `${parts.hour}:${parts.minute}`,
    dateISO: `${parts.year}-${parts.month}-${parts.day}`,
  };
}

export async function dispatchAutoMessages(ctx: Ctx) {
  try {
    const { data: cfg } = await supabaseAdmin
      .from("whatsapp_auto_messages")
      .select("greeting_enabled, greeting_text, away_enabled, away_text, timezone")
      .eq("connection_id", ctx.connectionId).maybeSingle();
    if (!cfg) return;
    if (!cfg.greeting_enabled && !cfg.away_enabled) return;

    const tz = cfg.timezone || "America/Sao_Paulo";
    const now = nowInTz(tz);

    // Está dentro do expediente?
    let withinHours = true;
    if (cfg.away_enabled) {
      // feriado?
      const { data: holiday } = await supabaseAdmin
        .from("whatsapp_holidays")
        .select("id").eq("connection_id", ctx.connectionId)
        .eq("date", now.dateISO).maybeSingle();
      if (holiday) {
        withinHours = false;
      } else {
        const { data: today } = await supabaseAdmin
          .from("whatsapp_business_hours")
          .select("start_time, end_time, enabled")
          .eq("connection_id", ctx.connectionId)
          .eq("weekday", now.weekday).maybeSingle();
        if (!today || !today.enabled) {
          withinHours = false;
        } else {
          withinHours = now.hhmm >= today.start_time.slice(0, 5)
                     && now.hhmm <= today.end_time.slice(0, 5);
        }
      }
    }

    // Saudação: só dispara se for 1ª msg deste ticket E está no horário (ou away desativado)
    if (cfg.greeting_enabled && ctx.isFirstMessageInTicket && withinHours) {
      const result = await dispatchWhatsAppMessage({
        connectionId: ctx.connectionId,
        to: ctx.contactPhone,
        text: cfg.greeting_text,
        ticketId: ctx.ticketId,
      });
      await supabaseAdmin.from("audit_log").insert({
        workspace_id: ctx.workspaceId,
        action: "system:whatsapp_auto_greeting",
        payload: { contact: ctx.contactPhone, ok: result.ok } as never,
      });
    }

    // Ausente: fora do horário ou feriado
    if (cfg.away_enabled && !withinHours) {
      // evita repetir ausente várias vezes na mesma hora pro mesmo contato
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { data: recent } = await supabaseAdmin
        .from("whatsapp_message_log")
        .select("id")
        .eq("connection_id", ctx.connectionId)
        .eq("contact_phone", ctx.contactPhone)
        .eq("direction", "outbound")
        .gte("created_at", oneHourAgo)
        .ilike("body", cfg.away_text.slice(0, 40) + "%")
        .limit(1).maybeSingle();
      if (recent) return;

      const result = await dispatchWhatsAppMessage({
        connectionId: ctx.connectionId,
        to: ctx.contactPhone,
        text: cfg.away_text,
        ticketId: ctx.ticketId,
      });
      await supabaseAdmin.from("audit_log").insert({
        workspace_id: ctx.workspaceId,
        action: "system:whatsapp_auto_away",
        payload: { contact: ctx.contactPhone, ok: result.ok } as never,
      });
    }
  } catch (e) {
    await supabaseAdmin.from("audit_log").insert({
      workspace_id: ctx.workspaceId,
      action: "system:whatsapp_auto_messages_error",
      payload: { error: String(e), contact: ctx.contactPhone } as never,
    });
  }
}
