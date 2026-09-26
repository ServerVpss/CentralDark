// Server functions master — estatísticas globais, jobs em background e auditoria.
// Todas exigem super_admin.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";

async function assertSuperAdmin(userId: string) {
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "super_admin")
    .maybeSingle();
  if (!data) throw new Error("Acesso negado.");
}

// ───────────────────────── Stats globais ─────────────────────────
export const adminGetGlobalStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);

    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [
      workspaces,
      users,
      connections,
      messages24h,
      aiCalls24h,
      aiCost7d,
      webhookErrors24h,
    ] = await Promise.all([
      supabaseAdmin.from("workspaces").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("whatsapp_connections").select("id", { count: "exact", head: true }),
      supabaseAdmin
        .from("whatsapp_message_log")
        .select("id", { count: "exact", head: true })
        .gte("created_at", since24h),
      supabaseAdmin
        .from("ai_usage_log")
        .select("id", { count: "exact", head: true })
        .gte("created_at", since24h),
      supabaseAdmin
        .from("ai_usage_log")
        .select("cost_usd")
        .gte("created_at", since7d),
      supabaseAdmin
        .from("whatsapp_webhook_events")
        .select("id", { count: "exact", head: true })
        .gte("created_at", since24h)
        .eq("signature_valid", false),
    ]);

    const totalCost7d =
      (aiCost7d.data ?? []).reduce(
        (acc, r: { cost_usd: number | string }) => acc + Number(r.cost_usd ?? 0),
        0
      ) || 0;

    return {
      workspaces: workspaces.count ?? 0,
      users: users.count ?? 0,
      connections: connections.count ?? 0,
      messages24h: messages24h.count ?? 0,
      aiCalls24h: aiCalls24h.count ?? 0,
      aiCost7dUsd: Number(totalCost7d.toFixed(4)),
      webhookErrors24h: webhookErrors24h.count ?? 0,
    };
  });

// ───────────────────────── Background jobs ─────────────────────────
export const adminListBackgroundJobs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const { data } = await supabaseAdmin
      .from("system_jobs")
      .select(
        "id, name, description, cron_expr, endpoint_path, enabled, last_run_at, last_status, last_duration_ms, last_error, run_count, error_count"
      )
      .order("name", { ascending: true });
    return (data ?? []) as Array<{
      id: string;
      name: string;
      description: string | null;
      cron_expr: string;
      endpoint_path: string;
      enabled: boolean;
      last_run_at: string | null;
      last_status: string | null;
      last_duration_ms: number | null;
      last_error: string | null;
      run_count: number;
      error_count: number;
    }>;
  });

// ───────────────────────── Auditoria ─────────────────────────
export const adminListAuditLogs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      limit: z.number().int().min(1).max(500).optional(),
      workspaceId: z.string().uuid().nullable().optional(),
      category: z.string().min(1).max(64).nullable().optional(),
      search: z.string().min(1).max(200).nullable().optional(),
    }).parse
  )
  .handler(async ({ context, data }) => {
    await assertSuperAdmin(context.userId);
    let q = supabaseAdmin
      .from("audit_log")
      .select(
        "id, workspace_id, actor_user_id, action, category, entity, entity_id, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(data.limit ?? 100);

    if (data.workspaceId) q = q.eq("workspace_id", data.workspaceId);
    if (data.category) q = q.eq("category", data.category);
    if (data.search) q = q.ilike("action", `%${data.search}%`);

    const { data: rows } = await q;
    return (rows ?? []) as Array<{
      id: string;
      workspace_id: string | null;
      actor_user_id: string | null;
      action: string;
      category: string | null;
      entity: string | null;
      entity_id: string | null;
      created_at: string;
    }>;
  });

// ───────────────────────── Telemetria IA ─────────────────────────
export const adminListAiUsage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      limit: z.number().int().min(1).max(500).optional(),
      workspaceId: z.string().uuid().nullable().optional(),
      provider: z.string().min(1).max(64).nullable().optional(),
    }).parse
  )
  .handler(async ({ context, data }) => {
    await assertSuperAdmin(context.userId);

    let q = supabaseAdmin
      .from("ai_usage_log")
      .select(
        "id, workspace_id, provider, model, operation, context, total_tokens, cost_usd, latency_ms, status, error, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(data.limit ?? 200);

    if (data.workspaceId) q = q.eq("workspace_id", data.workspaceId);
    if (data.provider) q = q.eq("provider", data.provider);

    const { data: rows } = await q;

    // Agregado simples últimos 7 dias
    const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: agg } = await supabaseAdmin
      .from("ai_usage_log")
      .select("provider, total_tokens, cost_usd")
      .gte("created_at", since7d);

    type AggRow = { provider: string; total_tokens: number; cost_usd: number | string };
    const byProvider: Record<string, { calls: number; tokens: number; costUsd: number }> = {};
    for (const r of (agg ?? []) as AggRow[]) {
      const k = r.provider;
      if (!byProvider[k]) byProvider[k] = { calls: 0, tokens: 0, costUsd: 0 };
      byProvider[k].calls += 1;
      byProvider[k].tokens += Number(r.total_tokens ?? 0);
      byProvider[k].costUsd += Number(r.cost_usd ?? 0);
    }

    return {
      rows: (rows ?? []) as Array<{
        id: string;
        workspace_id: string | null;
        provider: string;
        model: string;
        operation: string;
        context: string | null;
        total_tokens: number;
        cost_usd: number | string;
        latency_ms: number | null;
        status: string;
        error: string | null;
        created_at: string;
      }>,
      byProvider,
    };
  });
