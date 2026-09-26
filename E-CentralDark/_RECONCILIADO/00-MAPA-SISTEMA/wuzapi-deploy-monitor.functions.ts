// Fase 4 — Snapshot + monitoramento pós-deploy + rollback automático da WuzAPI.
//
// Fluxo:
//  1) startProductionDeploy: grava snapshot (SHA atual, Whatsmeow ref, compose hash),
//     chama Gateway /api/system/wuzapi-update (mesmo endpoint do trigger antigo),
//     em sucesso transita pra "monitoring".
//  2) runHealthCheck: polling a cada 30s por 5min (10 checks). Cada ciclo chama
//     Gateway /api/system/wuzapi-health. Falha 2x seguidas → rollback automático.
//  3) triggerRollback: força rollback (manual ou automático). Chama Gateway
//     /api/system/wuzapi-rollback com SHA anterior. Cooldown de 30min após rollback.
//
// Tudo grava em audit_log com prefixo admin:wuzapi_deploy_*.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { gatewayCall } from "@/lib/multizap-gateway.server";

const MAX_CHECKS = 10;            // 10 ciclos × 30s = 5 min
const FAIL_THRESHOLD = 2;         // 2 falhas seguidas → rollback
const COOLDOWN_MINUTES = 30;      // bloqueio de novo deploy após rollback

type HealthMetric = {
  ts: string;
  ok: boolean;
  service_up: boolean;
  sessions_up: number | null;
  sessions_baseline: number | null;
  webhook_error_rate: number | null;
  messages_per_min: number | null;
  error: string | null;
};

export type ProductionDeploy = {
  id: string;
  triggered_by: string | null;
  triggered_by_email: string | null;
  triggered_at: string;
  previous_sha: string | null;
  previous_whatsmeow_ref: string | null;
  previous_compose_hash: string | null;
  target_sha: string | null;
  target_whatsmeow_ref: string | null;
  status: "deploying" | "monitoring" | "healthy" | "degraded" | "rolled_back" | "rollback_failed";
  health_metrics: HealthMetric[];
  consecutive_failures: number;
  check_count: number;
  rollback_reason: string | null;
  rollback_triggered_manually: boolean;
  rolled_back_at: string | null;
  finished_at: string | null;
  monitoring_started_at: string | null;
  last_check_at: string | null;
};

async function assertSuperAdmin(userId: string) {
  const { data, error } = await supabaseAdmin.rpc("is_super_admin", { _user_id: userId });
  if (error) throw new Error("Falha ao validar permissão.");
  if (!data) throw new Error("Acesso negado: apenas Super Admin.");
}

async function attachEmail(rows: any[]): Promise<ProductionDeploy[]> {
  const ids = Array.from(new Set(rows.map((r) => r.triggered_by).filter(Boolean))) as string[];
  const emails = new Map<string, string>();
  if (ids.length) {
    const { data } = await supabaseAdmin.from("profiles").select("id, email").in("id", ids);
    for (const p of data ?? []) emails.set(p.id, p.email ?? "");
  }
  return rows.map((r) => ({
    ...r,
    triggered_by_email: r.triggered_by ? emails.get(r.triggered_by) ?? null : null,
  })) as ProductionDeploy[];
}

async function getCooldownInfo(): Promise<{ active: boolean; until: string | null; reason: string | null }> {
  const { data } = await supabaseAdmin
    .from("wuzapi_production_deploys")
    .select("rolled_back_at, rollback_reason")
    .eq("status", "rolled_back")
    .order("rolled_back_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data?.rolled_back_at) return { active: false, until: null, reason: null };
  const until = new Date(new Date(data.rolled_back_at).getTime() + COOLDOWN_MINUTES * 60_000);
  return {
    active: until.getTime() > Date.now(),
    until: until.toISOString(),
    reason: data.rollback_reason,
  };
}

// ── Start production deploy ──────────────────────────────────────────────────

export const startProductionDeploy = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    target_sha: z.string().min(4).max(64).nullable().optional(),
    target_whatsmeow_ref: z.string().max(200).nullable().optional(),
    bypass_cooldown: z.boolean().optional(),
  }).parse)
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    await assertSuperAdmin(context.userId);

    // Bloqueio: cooldown ativo
    const cd = await getCooldownInfo();
    if (cd.active && !data.bypass_cooldown) {
      throw new Error(`Cooldown ativo até ${cd.until} (último rollback: ${cd.reason ?? "sem motivo"}).`);
    }

    // Bloqueio: deploy em andamento
    const { data: active } = await supabaseAdmin
      .from("wuzapi_production_deploys")
      .select("id, status")
      .in("status", ["deploying", "monitoring"])
      .limit(1)
      .maybeSingle();
    if (active) throw new Error("Já existe um deploy em andamento. Aguarde finalizar.");

    // 1) Snapshot do que tá rodando hoje
    const verRes = await gatewayCall<{ repo_digest?: string; digest?: string; whatsmeow_ref?: string; compose_hash?: string }>(
      "/api/system/wuzapi-version", { method: "GET" }, { timeoutMs: 10_000 },
    );
    const previous_sha = verRes.data?.repo_digest || verRes.data?.digest || null;
    const previous_whatsmeow_ref = verRes.data?.whatsmeow_ref || null;
    const previous_compose_hash = verRes.data?.compose_hash || null;

    // 2) Cria registro deploying
    const { data: row, error } = await supabaseAdmin
      .from("wuzapi_production_deploys")
      .insert({
        triggered_by: context.userId,
        previous_sha, previous_whatsmeow_ref, previous_compose_hash,
        target_sha: data.target_sha ?? null,
        target_whatsmeow_ref: data.target_whatsmeow_ref ?? null,
        status: "deploying",
      })
      .select("*").single();
    if (error) throw new Error("Falha ao criar deploy: " + error.message);

    // 3) Chama Gateway pra rodar update-wuzapi.sh
    const upRes = await gatewayCall<{ ok?: boolean; pulled_digest?: string; logs?: string }>(
      "/api/system/wuzapi-update",
      { method: "POST", body: JSON.stringify({}) },
      { timeoutMs: 180_000 },
    );

    const ok = upRes.ok && upRes.data?.ok !== false;

    await supabaseAdmin.from("audit_log").insert({
      actor_user_id: context.userId,
      action: ok ? "admin:wuzapi_deploy_started" : "admin:wuzapi_deploy_failed",
      payload: {
        deploy_id: row.id,
        previous_sha,
        pulled_digest: upRes.data?.pulled_digest ?? null,
        error: ok ? null : (upRes.error?.message || "update falhou"),
        logs_tail: (upRes.data?.logs ?? "").slice(-1500),
      },
    });

    if (!ok) {
      const errMsg = upRes.error?.message || "Falha ao executar update no Gateway.";
      await supabaseAdmin.from("wuzapi_production_deploys")
        .update({ status: "degraded", rollback_reason: errMsg, finished_at: new Date().toISOString() })
        .eq("id", row.id);
      throw new Error(errMsg);
    }

    // 4) Transita pra monitoring
    const { data: updated } = await supabaseAdmin
      .from("wuzapi_production_deploys")
      .update({ status: "monitoring", monitoring_started_at: new Date().toISOString() })
      .eq("id", row.id).select("*").single();

    const [withEmail] = await attachEmail([updated]);
    return withEmail;
  });

// ── Run a single health check ────────────────────────────────────────────────

export const runHealthCheck = createServerFn({ method: "POST" })
  .inputValidator(z.object({ deploy_id: z.string().uuid() }).parse)
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    await assertSuperAdmin(context.userId);
    const { data: row } = await supabaseAdmin
      .from("wuzapi_production_deploys").select("*").eq("id", data.deploy_id).single();
    if (!row) throw new Error("Deploy não encontrado.");
    if (row.status !== "monitoring") {
      const [withEmail] = await attachEmail([row]);
      return withEmail;
    }

    // Chama Gateway /api/system/wuzapi-health
    const res = await gatewayCall<{
      service_up?: boolean;
      sessions_up?: number;
      sessions_baseline?: number;
      webhook_error_rate?: number;
      messages_per_min?: number;
      ok?: boolean;
      error?: string;
    }>("/api/system/wuzapi-health", { method: "GET" }, { timeoutMs: 10_000 });

    const m: HealthMetric = {
      ts: new Date().toISOString(),
      ok: res.ok && (res.data?.ok !== false) && (res.data?.service_up !== false),
      service_up: !!res.data?.service_up,
      sessions_up: res.data?.sessions_up ?? null,
      sessions_baseline: res.data?.sessions_baseline ?? null,
      webhook_error_rate: res.data?.webhook_error_rate ?? null,
      messages_per_min: res.data?.messages_per_min ?? null,
      error: res.ok ? (res.data?.error ?? null) : (res.error?.message ?? "gateway off"),
    };

    // Critério "ok": serviço up, sessões não caíram > 30%, erro webhook < 5%
    const baseline = m.sessions_baseline ?? 0;
    const sessionsDrop = baseline > 0 && (m.sessions_up ?? 0) < baseline * 0.7;
    const webhookHigh = (m.webhook_error_rate ?? 0) > 0.05;
    const healthy = m.ok && !sessionsDrop && !webhookHigh;
    m.ok = healthy;

    const newMetrics = [...(row.health_metrics as HealthMetric[]), m];
    const newCount = row.check_count + 1;
    const newFailures = healthy ? 0 : row.consecutive_failures + 1;

    // Detecta degradação → rollback automático
    if (newFailures >= FAIL_THRESHOLD) {
      await supabaseAdmin.from("wuzapi_production_deploys").update({
        health_metrics: newMetrics, check_count: newCount,
        consecutive_failures: newFailures,
        status: "degraded", last_check_at: m.ts,
      }).eq("id", data.deploy_id);

      // dispara rollback automático
      return await internalRollback(context.userId, data.deploy_id,
        `Auto: ${newFailures} health checks falharam em sequência (${m.error ?? "sessões/webhook"}).`,
        false);
    }

    // Finalizou os 10 ciclos sem falha grave → healthy
    if (newCount >= MAX_CHECKS) {
      const { data: updated } = await supabaseAdmin.from("wuzapi_production_deploys").update({
        health_metrics: newMetrics, check_count: newCount,
        consecutive_failures: newFailures,
        status: "healthy", last_check_at: m.ts, finished_at: m.ts,
      }).eq("id", data.deploy_id).select("*").single();

      await supabaseAdmin.from("audit_log").insert({
        actor_user_id: context.userId,
        action: "admin:wuzapi_deploy_healthy",
        payload: { deploy_id: data.deploy_id, checks: newCount },
      });
      const [withEmail] = await attachEmail([updated]);
      return withEmail;
    }

    const { data: updated } = await supabaseAdmin.from("wuzapi_production_deploys").update({
      health_metrics: newMetrics, check_count: newCount,
      consecutive_failures: newFailures, last_check_at: m.ts,
    }).eq("id", data.deploy_id).select("*").single();
    const [withEmail] = await attachEmail([updated]);
    return withEmail;
  });

// ── Manual rollback ──────────────────────────────────────────────────────────

export const triggerRollback = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    deploy_id: z.string().uuid(),
    reason: z.string().min(5).max(500),
    confirm: z.literal("ROLLBACK WUZAPI"),
  }).parse)
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    await assertSuperAdmin(context.userId);
    return internalRollback(context.userId, data.deploy_id, data.reason, true);
  });

async function internalRollback(userId: string, deployId: string, reason: string, manual: boolean): Promise<ProductionDeploy> {
  const { data: row } = await supabaseAdmin
    .from("wuzapi_production_deploys").select("*").eq("id", deployId).single();
  if (!row) throw new Error("Deploy não encontrado.");
  if (["rolled_back", "rollback_failed"].includes(row.status)) {
    const [w] = await attachEmail([row]);
    return w;
  }

  // Chama Gateway pra reverter pra previous_sha
  const res = await gatewayCall<{ ok?: boolean; error?: string }>(
    "/api/system/wuzapi-rollback",
    { method: "POST", body: JSON.stringify({ target_sha: row.previous_sha }) },
    { timeoutMs: 120_000 },
  );
  const rolledOk = res.ok && res.data?.ok !== false;
  const now = new Date().toISOString();

  const { data: updated } = await supabaseAdmin.from("wuzapi_production_deploys").update({
    status: rolledOk ? "rolled_back" : "rollback_failed",
    rollback_reason: reason,
    rollback_triggered_manually: manual,
    rolled_back_at: now,
    finished_at: now,
  }).eq("id", deployId).select("*").single();

  await supabaseAdmin.from("audit_log").insert({
    actor_user_id: userId,
    action: rolledOk ? "admin:wuzapi_rollback_success" : "admin:wuzapi_rollback_failed",
    payload: {
      deploy_id: deployId, manual, reason,
      previous_sha: row.previous_sha,
      gateway_error: rolledOk ? null : (res.error?.message || res.data?.error || "sem detalhe"),
    },
  });

  const [withEmail] = await attachEmail([updated]);
  return withEmail;
}

// ── Read APIs ────────────────────────────────────────────────────────────────

export const getActiveDeployment = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ProductionDeploy | null> => {
    await assertSuperAdmin(context.userId);
    const { data } = await supabaseAdmin
      .from("wuzapi_production_deploys").select("*")
      .in("status", ["deploying", "monitoring", "degraded", "rollback_failed"])
      .order("triggered_at", { ascending: false }).limit(1).maybeSingle();
    if (!data) return null;
    const [w] = await attachEmail([data]);
    return w;
  });

export const listProductionDeploys = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ProductionDeploy[]> => {
    await assertSuperAdmin(context.userId);
    const { data } = await supabaseAdmin
      .from("wuzapi_production_deploys").select("*")
      .order("triggered_at", { ascending: false }).limit(10);
    return attachEmail(data ?? []);
  });

export const getDeployCooldown = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    return getCooldownInfo();
  });
