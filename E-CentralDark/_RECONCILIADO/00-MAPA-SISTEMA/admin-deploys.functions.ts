// Painel Master /admin/deploys — lista histórico de deploys do gateway e permite rollback.
// Restrito a super_admin. Toda ação grava em audit_log com prefixo `admin:deploy:`.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { gatewayFetch } from "./multizap-gateway.server";

async function assertSuperAdmin(userId: string) {
  const { data, error } = await supabaseAdmin.rpc("is_super_admin", { _user_id: userId });
  if (error) throw new Error("Falha ao validar permissão.");
  if (!data) throw new Error("Acesso negado: apenas Super Admin.");
}

async function logAdminAction(params: {
  actorUserId: string;
  action: string;
  extra?: Record<string, unknown>;
}) {
  try {
    await supabaseAdmin.from("audit_log").insert({
      workspace_id: null,
      actor_user_id: params.actorUserId,
      action: params.action,
      category: "deploy",
      entity: "gateway_deploy",
      entity_id: null,
      payload: (params.extra ?? {}) as never,
    });
  } catch {
    // log não pode quebrar a ação
  }
}

export type DeployEntry = {
  id: string;
  started_at: string;
  duration_s: number;
  status: "success" | "rolled_back" | "failed" | "skipped" | "parse_error";
  prev_commit: string | null;
  new_commit: string | null;
  author: string | null;
  message: string | null;
  health_ok: "true" | "false" | "unknown";
  canary_ok: "true" | "false" | "skipped";
  rollback: boolean;
  error: string | null;
};

export type DeployListResult = {
  deploys: DeployEntry[];
  current_commit: string | null;
  last_good_commit: string | null;
  log_path: string;
};

export type DeployStatus = {
  current_commit: string | null;
  last_good_commit: string | null;
  gateway_started_at: string | null;
  uptime_s: number;
  pid: number;
};

function isNotDeployedYet(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /HTTP 404/i.test(msg);
}

// GET /deploys/list — últimos N deploys
export const adminListDeploys = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ limit: z.number().int().min(1).max(200).optional() }).parse(data))
  .handler(async ({ data, context }): Promise<DeployListResult & { gateway_outdated?: boolean }> => {
    await assertSuperAdmin(context.userId);
    const limit = data.limit ?? 50;
    try {
      return await gatewayFetch<DeployListResult>(
        `/deploys/list?limit=${limit}`,
        { method: "GET" },
        { timeoutMs: 6000 },
      );
    } catch (err) {
      if (isNotDeployedYet(err)) {
        return { deploys: [], current_commit: null, last_good_commit: null, log_path: "", gateway_outdated: true };
      }
      throw err;
    }
  });

// GET /deploys/status — versão atual e uptime do gateway
export const adminDeployStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<DeployStatus & { gateway_outdated?: boolean }> => {
    await assertSuperAdmin(context.userId);
    try {
      return await gatewayFetch<DeployStatus>(
        `/deploys/status`,
        { method: "GET" },
        { timeoutMs: 5000 },
      );
    } catch (err) {
      if (isNotDeployedYet(err)) {
        return { current_commit: null, last_good_commit: null, gateway_started_at: null, uptime_s: 0, pid: 0, gateway_outdated: true };
      }
      throw err;
    }
  });

// POST /deploys/rollback — dispara rollback pra commit específico
export const adminDeployRollback = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({
      commit: z
        .string()
        .min(7)
        .max(40)
        .regex(/^[a-f0-9]+$/i, "Commit hash deve ser hex (7-40 chars)"),
    }).parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    await logAdminAction({
      actorUserId: context.userId,
      action: "admin:deploy:rollback_requested",
      extra: { target_commit: data.commit },
    });
    const result = await gatewayFetch<{ queued: boolean; commit: string; message: string }>(
      `/deploys/rollback`,
      { method: "POST", body: JSON.stringify({ commit: data.commit }) },
      { timeoutMs: 8000 },
    );
    return result;
  });
