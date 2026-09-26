// Log completo e unificado de uma conexão WhatsApp.
// Agrega 4 fontes: meta_phone_number_events, whatsapp_webhook_events,
// whatsapp_message_log e audit_log (entity = whatsapp_connections).
// Sanitiza qualquer valor sensível antes de devolver pro front.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { logAction } from "@/lib/audit.server";

export type LogCategory = "meta" | "webhook" | "message" | "audit";
export type LogStatus = "ok" | "error" | "started" | "info";

export type ConnectionLogItem = {
  id: string;
  category: LogCategory;
  action: string;
  status: LogStatus;
  message: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  payload: string | null;
  createdAt: string;
};

const SENSITIVE_KEY = /token|pin|password|passwd|secret|authorization|cookie|access[-_]?token/i;

function sanitize(value: unknown, depth = 0): unknown {
  if (depth > 6 || value == null) return value;
  if (Array.isArray(value)) return value.map((v) => sanitize(v, depth + 1));
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (SENSITIVE_KEY.test(k)) {
        out[k] = "[oculto]";
        continue;
      }
      out[k] = sanitize(v, depth + 1);
    }
    return out;
  }
  return value;
}

async function assertCanRead(userId: string, connectionId: string): Promise<{ workspaceId: string; isMaster: boolean }> {
  const { data: sa } = await supabaseAdmin
    .from("user_roles").select("role")
    .eq("user_id", userId).eq("role", "super_admin").maybeSingle();
  const isMaster = !!sa;

  const { data: conn } = await supabaseAdmin
    .from("whatsapp_connections")
    .select("workspace_id,phone_number_id")
    .eq("id", connectionId).single();
  if (!conn) throw new Error("Conexão não encontrada.");

  if (!isMaster) {
    const { data: m } = await supabaseAdmin
      .from("workspace_members").select("id")
      .eq("user_id", userId).eq("workspace_id", conn.workspace_id).maybeSingle();
    if (!m) throw new Error("Acesso negado a esta conexão.");
  }
  return { workspaceId: conn.workspace_id, isMaster };
}

export const listConnectionFullLog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    connectionId: z.string().uuid(),
    categories: z.array(z.enum(["meta", "webhook", "message", "audit"])).optional(),
    onlyErrors: z.boolean().optional(),
    search: z.string().max(120).optional(),
    sinceMinutes: z.number().int().min(1).max(60 * 24 * 30).optional(),
    limit: z.number().int().min(10).max(500).default(200),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { workspaceId, isMaster } = await assertCanRead(context.userId, data.connectionId);

    const cats = new Set(data.categories ?? ["meta", "webhook", "message", "audit"]);
    const since = data.sinceMinutes
      ? new Date(Date.now() - data.sinceMinutes * 60_000).toISOString()
      : null;

    // pega phone_number_id pra cruzar com webhook_events caso o connection_id não esteja preenchido
    const { data: conn } = await supabaseAdmin
      .from("whatsapp_connections")
      .select("phone_number_id")
      .eq("id", data.connectionId).single();
    const phoneNumberId = conn?.phone_number_id ?? null;

    const items: ConnectionLogItem[] = [];

    // 1) meta_phone_number_events
    if (cats.has("meta")) {
      let q = supabaseAdmin
        .from("meta_phone_number_events")
        .select("id,action,status,message,meta_error_code,meta_error_message,metadata,created_at")
        .eq("connection_id", data.connectionId)
        .order("created_at", { ascending: false })
        .limit(data.limit);
      if (since) q = q.gte("created_at", since);
      const { data: rows } = await q;
      for (const r of rows ?? []) {
        items.push({
          id: `meta:${r.id}`,
          category: "meta",
          action: r.action,
          status: (r.status as LogStatus) ?? "info",
          message: r.message,
          errorCode: r.meta_error_code,
          errorMessage: r.meta_error_message,
          payload: r.metadata ? JSON.stringify(sanitize(r.metadata)) : null,
          createdAt: r.created_at,
        });
      }
    }

    // 2) whatsapp_webhook_events
    if (cats.has("webhook")) {
      let q = supabaseAdmin
        .from("whatsapp_webhook_events")
        .select("id,event_type,signature_valid,http_method,status_code,error,raw_payload,created_at,connection_id,phone_number_id")
        .order("created_at", { ascending: false })
        .limit(data.limit);
      if (phoneNumberId) {
        q = q.or(`connection_id.eq.${data.connectionId},phone_number_id.eq.${phoneNumberId}`);
      } else {
        q = q.eq("connection_id", data.connectionId);
      }
      if (since) q = q.gte("created_at", since);
      const { data: rows } = await q;
      for (const r of rows ?? []) {
        const ok = r.signature_valid !== false && !r.error;
        items.push({
          id: `wh:${r.id}`,
          category: "webhook",
          action: `webhook:${r.event_type ?? "evento"}`,
          status: ok ? "ok" : "error",
          message: r.error
            ? `Webhook com erro: ${r.error}`
            : r.signature_valid === false
              ? "Assinatura inválida"
              : `Recebido ${r.event_type ?? "evento"} (HTTP ${r.status_code ?? "?"})`,
          errorCode: r.status_code != null ? String(r.status_code) : null,
          errorMessage: r.error ?? null,
          payload: r.raw_payload ? JSON.stringify(sanitize(r.raw_payload)) : null,
          createdAt: r.created_at,
        });
      }
    }

    // 3) whatsapp_message_log
    if (cats.has("message")) {
      let q = supabaseAdmin
        .from("whatsapp_message_log")
        .select("id,direction,status,message_type,template_name,is_template,body,error_code,error_message,contact_phone,created_at")
        .eq("connection_id", data.connectionId)
        .order("created_at", { ascending: false })
        .limit(data.limit);
      if (since) q = q.gte("created_at", since);
      const { data: rows } = await q;
      for (const r of rows ?? []) {
        const ok = r.status !== "failed" && r.status !== "error" && !r.error_code;
        items.push({
          id: `msg:${r.id}`,
          category: "message",
          action: `${r.direction === "out" ? "envio" : "recebimento"}:${r.message_type ?? "text"}`,
          status: ok ? "ok" : "error",
          message: ok
            ? `${r.direction === "out" ? "Enviado" : "Recebido"} ${r.is_template ? `template ${r.template_name ?? ""}` : ""}${r.body ? `: ${r.body.slice(0, 80)}` : ""}`.trim()
            : `Falha (${r.status})${r.error_message ? `: ${r.error_message}` : ""}`,
          errorCode: r.error_code,
          errorMessage: r.error_message,
          payload: JSON.stringify({ contact_phone: r.contact_phone, status: r.status, template: r.template_name }),
          createdAt: r.created_at,
        });
      }
    }

    // 4) audit_log (entity = whatsapp_connections)
    if (cats.has("audit")) {
      let q = supabaseAdmin
        .from("audit_log")
        .select("id,action,category,payload,created_at,entity,entity_id")
        .eq("entity", "whatsapp_connections")
        .eq("entity_id", data.connectionId)
        .order("created_at", { ascending: false })
        .limit(data.limit);
      if (since) q = q.gte("created_at", since);
      const { data: rows } = await q;
      for (const r of rows ?? []) {
        const payload = (r.payload ?? {}) as Record<string, unknown>;
        const hasError = !!payload.error || /fail|error|denied/i.test(r.action);
        items.push({
          id: `audit:${r.id}`,
          category: "audit",
          action: r.action,
          status: hasError ? "error" : "ok",
          message: typeof payload.error === "string"
            ? `${r.action} — ${payload.error}`
            : r.action,
          errorCode: null,
          errorMessage: typeof payload.error === "string" ? payload.error : null,
          payload: JSON.stringify(sanitize(payload)),
          createdAt: r.created_at,
        });
      }
    }

    // ordena consolidado
    items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    // filtros pós
    let filtered = items;
    if (data.onlyErrors) filtered = filtered.filter((i) => i.status === "error");
    if (data.search) {
      const q = data.search.toLowerCase();
      filtered = filtered.filter((i) =>
        i.action.toLowerCase().includes(q) ||
        (i.message ?? "").toLowerCase().includes(q) ||
        (i.errorMessage ?? "").toLowerCase().includes(q) ||
        (i.errorCode ?? "").toLowerCase().includes(q),
      );
    }

    // contadores
    const last24h = items.filter((i) => Date.now() - new Date(i.createdAt).getTime() < 24 * 3600_000);
    const stats = {
      total: items.length,
      errors24h: last24h.filter((i) => i.status === "error").length,
      events24h: last24h.length,
      byCategory: {
        meta: items.filter((i) => i.category === "meta").length,
        webhook: items.filter((i) => i.category === "webhook").length,
        message: items.filter((i) => i.category === "message").length,
        audit: items.filter((i) => i.category === "audit").length,
      },
    };

    // Nota: NÃO auditamos visualização de logs (read-only e a tela faz polling,
    // o que gerava centenas de entradas "admin:viewed_connection_logs" inúteis).

    return {
      items: filtered.slice(0, data.limit),
      stats,
      connectionId: data.connectionId,
    };
  });
