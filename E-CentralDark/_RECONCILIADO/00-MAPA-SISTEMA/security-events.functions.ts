// Eventos de segurança para o painel Master (/admin/seguranca).
// Lê audit_log filtrando ações de rate limit. Restrito a super_admin.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function assertSuperAdmin(userId: string) {
  const { data } = await supabaseAdmin.rpc("is_super_admin", { _user_id: userId });
  if (!data) throw new Error("Acesso restrito ao Master.");
}

export type SecurityEventRow = {
  id: string;
  created_at: string;
  action: string;
  actor_user_id: string | null;
  actor_name: string | null;
  workspace_id: string | null;
  workspace_name: string | null;
  operation: string | null;
  bucket: string | null;
  ip_hash: string | null;
  retry_after_seconds: number | null;
  fail_mode: string | null;
  error: string | null;
};

export type SecuritySummary = {
  blocked_24h: number;
  check_failed_24h: number;
  blocked_total: number;
  top_operations: { operation: string; count: number }[];
};

export const listSecurityEvents = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({
    kind: z.enum(["blocked", "check_failed", "all"]).default("all"),
    operation: z.string().max(60).optional().nullable(),
    workspace_id: z.string().uuid().optional().nullable(),
    period_hours: z.number().int().min(1).max(24 * 30).default(24),
    limit: z.number().int().min(1).max(500).default(100),
  }).parse(input))
  .handler(async ({ data, context }): Promise<SecurityEventRow[]> => {
    await assertSuperAdmin(context.userId);

    const since = new Date(Date.now() - data.period_hours * 3600 * 1000).toISOString();
    let q = supabaseAdmin
      .from("audit_log")
      .select("id, created_at, action, actor_user_id, workspace_id, payload")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(data.limit);

    if (data.kind === "blocked") q = q.eq("action", "rate_limit_blocked");
    else if (data.kind === "check_failed") q = q.eq("action", "rate_limit_check_failed");
    else q = q.in("action", ["rate_limit_blocked", "rate_limit_check_failed"]);

    if (data.workspace_id) q = q.eq("workspace_id", data.workspace_id);

    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    let filtered = rows ?? [];
    if (data.operation) {
      filtered = filtered.filter((r: any) => (r.payload as any)?.action === data.operation);
    }

    const userIds = Array.from(new Set(filtered.map((r: any) => r.actor_user_id).filter(Boolean)));
    const wsIds = Array.from(new Set(filtered.map((r: any) => r.workspace_id).filter(Boolean)));
    const [{ data: profiles }, { data: workspaces }] = await Promise.all([
      userIds.length ? supabaseAdmin.from("profiles").select("id, full_name, email").in("id", userIds) : Promise.resolve({ data: [] as any[] }),
      wsIds.length ? supabaseAdmin.from("workspaces").select("id, name").in("id", wsIds) : Promise.resolve({ data: [] as any[] }),
    ]);
    const pMap = new Map((profiles ?? []).map((p: any) => [p.id, p.full_name ?? p.email]));
    const wMap = new Map((workspaces ?? []).map((w: any) => [w.id, w.name]));

    return filtered.map((r: any) => {
      const p = r.payload || {};
      return {
        id: r.id,
        created_at: r.created_at,
        action: r.action,
        actor_user_id: r.actor_user_id,
        actor_name: r.actor_user_id ? (pMap.get(r.actor_user_id) ?? null) : null,
        workspace_id: r.workspace_id,
        workspace_name: r.workspace_id ? (wMap.get(r.workspace_id) ?? null) : null,
        operation: p.action ?? null,
        bucket: p.bucket ?? null,
        ip_hash: p.ip_hash ?? null,
        retry_after_seconds: p.retry_after_seconds ?? null,
        fail_mode: p.fail_mode ?? null,
        error: p.error ?? null,
      };
    });
  });

export const getSecuritySummary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<SecuritySummary> => {
    await assertSuperAdmin(context.userId);
    const since24 = new Date(Date.now() - 24 * 3600 * 1000).toISOString();

    const [{ count: blocked24 }, { count: failed24 }, { count: blockedTotal }, { data: recent }] = await Promise.all([
      supabaseAdmin.from("audit_log").select("id", { count: "exact", head: true })
        .eq("action", "rate_limit_blocked").gte("created_at", since24),
      supabaseAdmin.from("audit_log").select("id", { count: "exact", head: true })
        .eq("action", "rate_limit_check_failed").gte("created_at", since24),
      supabaseAdmin.from("audit_log").select("id", { count: "exact", head: true })
        .eq("action", "rate_limit_blocked"),
      supabaseAdmin.from("audit_log").select("payload")
        .eq("action", "rate_limit_blocked").gte("created_at", since24).limit(500),
    ]);

    const opCounts = new Map<string, number>();
    for (const r of (recent ?? [])) {
      const op = (r.payload as any)?.action ?? "desconhecido";
      opCounts.set(op, (opCounts.get(op) ?? 0) + 1);
    }
    const top = Array.from(opCounts.entries())
      .map(([operation, count]) => ({ operation, count }))
      .sort((a, b) => b.count - a.count).slice(0, 5);

    return {
      blocked_24h: blocked24 ?? 0,
      check_failed_24h: failed24 ?? 0,
      blocked_total: blockedTotal ?? 0,
      top_operations: top,
    };
  });
