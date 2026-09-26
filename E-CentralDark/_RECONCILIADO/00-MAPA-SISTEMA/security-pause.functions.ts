// ServerFns para gerenciar pausa de segurança WhatsApp (janela 24h).
// Liberar incidentes é restrito a super_admin com confirmação dupla.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type SecurityIncident = {
  id: string;
  workspace_id: string;
  workspace_name: string | null;
  actor_user_id: string | null;
  actor_name: string | null;
  actor_email: string | null;
  ticket_id: string | null;
  connection_id: string | null;
  provider: string | null;
  payload: Record<string, string | number | boolean | null>;
  severity: "low" | "medium" | "high" | "critical";
  tamper_count: number;
  status: "pendente" | "liberado" | "reincidente" | "bloqueado_manual";
  released_by: string | null;
  released_at: string | null;
  released_reason: string | null;
  created_at: string;
};

async function assertSuperAdmin(userId: string) {
  const { data } = await supabaseAdmin.rpc("is_super_admin", { _user_id: userId });
  if (!data) throw new Error("Acesso restrito ao Master.");
}

export const listSecurityIncidents = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        workspaceId: z.string().uuid().optional().nullable(),
        status: z.enum(["pendente", "liberado", "reincidente", "bloqueado_manual", "all"]).default("all"),
        limit: z.number().int().min(1).max(500).default(100),
      })
      .parse(input),
  )
  .handler(async ({ data, context }): Promise<SecurityIncident[]> => {
    await assertSuperAdmin(context.userId);

    let q = supabaseAdmin
      .from("workspace_security_incidents")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(data.limit);

    if (data.workspaceId) q = q.eq("workspace_id", data.workspaceId);
    if (data.status !== "all") q = q.eq("status", data.status);

    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    const wsIds = Array.from(new Set((rows ?? []).map((r) => r.workspace_id)));
    const userIds = Array.from(new Set((rows ?? []).map((r) => r.actor_user_id).filter(Boolean) as string[]));

    const [{ data: ws }, { data: users }] = await Promise.all([
      wsIds.length
        ? supabaseAdmin.from("workspaces").select("id,name").in("id", wsIds)
        : Promise.resolve({ data: [] as { id: string; name: string }[] }),
      userIds.length
        ? supabaseAdmin.from("profiles").select("id,full_name,email").in("id", userIds)
        : Promise.resolve({ data: [] as { id: string; full_name: string | null; email: string | null }[] }),
    ]);

    const wsMap = new Map((ws ?? []).map((w) => [w.id, w.name]));
    const userMap = new Map((users ?? []).map((u) => [u.id, u]));

    return (rows ?? []).map((r) => ({
      id: r.id,
      workspace_id: r.workspace_id,
      workspace_name: wsMap.get(r.workspace_id) ?? null,
      actor_user_id: r.actor_user_id,
      actor_name: r.actor_user_id ? userMap.get(r.actor_user_id)?.full_name ?? null : null,
      actor_email: r.actor_user_id ? userMap.get(r.actor_user_id)?.email ?? null : null,
      ticket_id: r.ticket_id,
      connection_id: r.connection_id,
      provider: r.provider,
      payload: (r.payload as SecurityIncident["payload"]) ?? {},
      severity: r.severity as SecurityIncident["severity"],
      tamper_count: r.tamper_count,
      status: r.status as SecurityIncident["status"],
      released_by: r.released_by,
      released_at: r.released_at,
      released_reason: r.released_reason,
      created_at: r.created_at,
    }));
  });

export const releaseSecurityPause = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        workspaceId: z.string().uuid(),
        incidentId: z.string().uuid(),
        confirmText: z.string(),
        reason: z.string().min(20).max(1000),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);

    const { error } = await supabaseAdmin.rpc("release_security_pause", {
      _workspace_id: data.workspaceId,
      _incident_id: data.incidentId,
      _confirm_text: data.confirmText,
      _reason: data.reason,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

// Status da janela 24h de um ticket (pra cronômetro e botão).
export const getTicketWindowStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ ticketId: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { getTicketWindow } = await import("@/lib/whatsapp-send.server");
    return getTicketWindow(data.ticketId);
  });

// Verifica se o workspace está pausado por segurança (pra mostrar banner ao dono).
export const getSecurityPauseStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ workspaceId: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { data: ctrl } = await supabaseAdmin
      .from("workspace_controls")
      .select("paused_by_security, paused_at, paused_reason, block_whatsapp_send")
      .eq("workspace_id", data.workspaceId)
      .maybeSingle();
    if (!ctrl || !ctrl.paused_by_security) {
      return { paused: false as const };
    }
    return {
      paused: true as const,
      paused_at: ctrl.paused_at,
      reason: ctrl.paused_reason,
    };
  });
