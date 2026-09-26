// Server functions do "Histórico do atendimento" e dos erros do sistema.
// - getTicketTimeline: usado na lateral do chat (/app/chat) e no espelho master (/admin).
// - listSystemErrors / resolveSystemError: usados na auditoria.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { logSystemError } from "@/lib/system-error.server";

// ---------- Timeline do ticket ----------

export const getTicketTimeline = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      ticketId: z.string().uuid(),
      limit: z.number().int().min(1).max(500).optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // valida acesso: precisa ser membro do workspace do ticket
    const { data: ticket, error: tErr } = await supabase
      .from("tickets")
      .select("id, workspace_id")
      .eq("id", data.ticketId)
      .maybeSingle();

    if (tErr || !ticket) {
      throw new Error("Atendimento não encontrado ou sem permissão");
    }

    const { data: rows, error } = await supabase
      .from("ticket_timeline_v")
      .select("kind, id, ticket_id, created_at, actor_user_id, severity, area, title, payload")
      .eq("ticket_id", data.ticketId)
      .order("created_at", { ascending: true })
      .limit(data.limit ?? 300);

    if (error) {
      await logSystemError({
        area: "timeline.read",
        message: error.message,
        code: error.code,
        workspaceId: ticket.workspace_id,
        ticketId: data.ticketId,
        actorUserId: userId,
        context: { details: error.details ?? null },
      });
      throw new Error("Falha ao carregar histórico do atendimento");
    }

    // resolve nomes dos atores
    const actorIds = Array.from(new Set((rows ?? []).map((r: any) => r.actor_user_id).filter(Boolean))) as string[];
    let actorMap = new Map<string, string>();
    if (actorIds.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", actorIds);
      (profs ?? []).forEach((p: any) => actorMap.set(p.id, p.full_name ?? ""));
    }

    return {
      timeline: (rows ?? []).map((r: any) => ({
        ...r,
        actor_name: r.actor_user_id ? (actorMap.get(r.actor_user_id) ?? null) : null,
      })),
    };
  });

// ---------- Erros do sistema (auditoria) ----------

export const listSystemErrors = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      workspaceId: z.string().uuid().optional(),
      severity: z.enum(["info", "warning", "error", "critical"]).optional(),
      area: z.string().min(1).max(100).optional(),
      onlyUnresolved: z.boolean().optional(),
      limit: z.number().int().min(1).max(500).optional(),
      cursor: z.string().datetime().optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Sem workspaceId = consulta global → exige super admin
    if (!data.workspaceId) {
      const { data: isAdmin } = await supabaseAdmin.rpc("is_super_admin", { _user_id: userId });
      if (!isAdmin) throw new Error("Acesso negado: informe um workspace ou seja Super Admin.");
    }

    let q = supabase
      .from("system_error_log")
      .select(
        "id, workspace_id, ticket_id, actor_user_id, severity, area, code, message, context, created_at, resolved_at, resolution_note",
      )
      .order("created_at", { ascending: false })
      .limit(data.limit ?? 100);

    if (data.workspaceId) q = q.eq("workspace_id", data.workspaceId);

    if (data.severity) q = q.eq("severity", data.severity);
    if (data.area) q = q.ilike("area", `${data.area}%`);
    if (data.onlyUnresolved) q = q.is("resolved_at", null);
    if (data.cursor) q = q.lt("created_at", data.cursor);

    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    return { errors: rows ?? [] };
  });

export const resolveSystemError = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      id: z.string().uuid(),
      note: z.string().max(2000).optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;

    // Verifica super admin no servidor (a policy UPDATE também valida)
    const { data: isAdmin } = await supabaseAdmin.rpc("is_super_admin", { _user_id: userId });
    if (!isAdmin) throw new Error("Apenas o master pode marcar erros como resolvidos");

    const { error } = await supabaseAdmin
      .from("system_error_log")
      .update({
        resolved_at: new Date().toISOString(),
        resolved_by: userId,
        resolution_note: data.note ?? null,
      } as never)
      .eq("id", data.id);

    if (error) throw new Error(error.message);
    return { ok: true };
  });
