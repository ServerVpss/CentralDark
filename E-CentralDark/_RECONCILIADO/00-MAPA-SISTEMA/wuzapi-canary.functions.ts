// Fase 3 — Canary / Teste isolado antes de atualizar produção.
// Um canary roda a nova imagem do WuzAPI em paralelo (porta/container separado)
// e só depois de TODOS os health checks passarem é que o master pode promover.
//
// Modos:
//  - "gateway": chama endpoints opcionais no Gateway da VPS
//      POST /api/system/wuzapi-canary/start  → sobe container canary
//      GET  /api/system/wuzapi-canary/status → status do container
//      POST /api/system/wuzapi-canary/promote → swap canary → prod
//      POST /api/system/wuzapi-canary/abort  → derruba canary
//  - "manual": se o Gateway responder 404/501 (endpoint não existe),
//      o master valida manualmente via checkboxes e promove sob responsabilidade.
//
// Tudo grava em wuzapi_canary_runs + audit_log (via trigger).

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { gatewayCall } from "@/lib/multizap-gateway.server";

type CanaryStatus =
  | "pending" | "starting" | "running" | "healthy"
  | "failed" | "promoted" | "aborted";

type HealthChecks = {
  build_ok: boolean;
  service_up: boolean;
  qr_generated: boolean;
  test_message_sent: boolean;
};

export type CanaryRun = {
  id: string;
  started_by: string | null;
  started_by_email: string | null;
  started_at: string;
  finished_at: string | null;
  target_sha: string | null;
  target_ref: string | null;
  whatsmeow_ref: string | null;
  status: CanaryStatus;
  mode: "gateway" | "manual";
  gateway_endpoint: string | null;
  health_checks: HealthChecks;
  notes: string | null;
  last_error: string | null;
  promoted_at: string | null;
  aborted_at: string | null;
  abort_reason: string | null;
};

async function assertSuperAdmin(userId: string) {
  const { data, error } = await supabaseAdmin.rpc("is_super_admin", { _user_id: userId });
  if (error) throw new Error("Falha ao validar permissão.");
  if (!data) throw new Error("Acesso negado: apenas Super Admin.");
}

async function attachEmail(rows: any[]): Promise<CanaryRun[]> {
  const ids = Array.from(new Set(rows.map((r) => r.started_by).filter(Boolean))) as string[];
  const emails = new Map<string, string>();
  if (ids.length) {
    const { data: profs } = await supabaseAdmin
      .from("profiles").select("id, email").in("id", ids);
    for (const p of profs ?? []) emails.set(p.id, p.email ?? "");
  }
  return rows.map((r) => ({
    ...r,
    started_by_email: r.started_by ? emails.get(r.started_by) ?? null : null,
  })) as CanaryRun[];
}

// ── Start canary ─────────────────────────────────────────────────────────────

export const startCanaryRun = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    target_sha: z.string().min(4).max(64).nullable().optional(),
    whatsmeow_ref: z.string().max(200).nullable().optional(),
    notes: z.string().max(500).optional(),
  }).parse)
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    await assertSuperAdmin(context.userId);

    // Bloqueia se já houver canary "em voo"
    const { data: existing } = await supabaseAdmin
      .from("wuzapi_canary_runs")
      .select("id, status")
      .in("status", ["pending", "starting", "running", "healthy"])
      .limit(1)
      .maybeSingle();
    if (existing) {
      throw new Error("Já existe um canary em andamento. Promova ou aborte antes de iniciar outro.");
    }

    // Tenta acionar o Gateway
    let mode: "gateway" | "manual" = "manual";
    let status: CanaryStatus = "pending";
    let last_error: string | null = null;
    let gateway_endpoint: string | null = null;

    const res = await gatewayCall<{ ok?: boolean; endpoint?: string; container?: string }>(
      "/api/system/wuzapi-canary/start",
      { method: "POST", body: JSON.stringify({ target_sha: data.target_sha ?? null }) },
      { timeoutMs: 30_000 },
    );

    if (res.ok && res.data?.ok !== false) {
      mode = "gateway";
      status = "starting";
      gateway_endpoint = res.data?.endpoint ?? null;
    } else {
      // 404/501 → modo manual; outros erros → grava mas em pending pra master decidir
      const code = res.status ?? 0;
      if (code === 404 || code === 501 || code === 0) {
        mode = "manual";
        status = "pending";
        last_error = "Gateway sem suporte a canary automático — modo manual ativado.";
      } else {
        mode = "manual";
        status = "pending";
        last_error = res.error?.message || `Gateway HTTP ${code} — caiu em modo manual.`;
      }
    }

    const { data: row, error } = await supabaseAdmin
      .from("wuzapi_canary_runs")
      .insert({
        started_by: context.userId,
        target_sha: data.target_sha ?? null,
        whatsmeow_ref: data.whatsmeow_ref ?? null,
        notes: data.notes ?? null,
        status,
        mode,
        gateway_endpoint,
        last_error,
      })
      .select("*")
      .single();
    if (error) throw new Error("Falha ao criar canary: " + error.message);

    const [withEmail] = await attachEmail([row]);
    return withEmail;
  });

// ── Active canary (single) ────────────────────────────────────────────────────

export const getActiveCanaryRun = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<CanaryRun | null> => {
    await assertSuperAdmin(context.userId);
    const { data } = await supabaseAdmin
      .from("wuzapi_canary_runs")
      .select("*")
      .in("status", ["pending", "starting", "running", "healthy"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!data) return null;
    const [withEmail] = await attachEmail([data]);
    return withEmail;
  });

// ── Toggle health check (modo manual) ─────────────────────────────────────────

export const setCanaryHealthCheck = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    canary_id: z.string().uuid(),
    key: z.enum(["build_ok", "service_up", "qr_generated", "test_message_sent"]),
    value: z.boolean(),
  }).parse)
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    await assertSuperAdmin(context.userId);
    const { data: row, error: e1 } = await supabaseAdmin
      .from("wuzapi_canary_runs")
      .select("id, status, health_checks")
      .eq("id", data.canary_id)
      .single();
    if (e1 || !row) throw new Error("Canary não encontrado.");
    if (["promoted", "aborted", "failed"].includes(row.status)) {
      throw new Error("Canary já finalizado — não dá pra mexer.");
    }

    const hc = { ...(row.health_checks as HealthChecks), [data.key]: data.value };
    const allOk = hc.build_ok && hc.service_up && hc.qr_generated && hc.test_message_sent;
    const newStatus: CanaryStatus = allOk ? "healthy" : (hc.service_up ? "running" : row.status as CanaryStatus);

    const { data: updated, error } = await supabaseAdmin
      .from("wuzapi_canary_runs")
      .update({ health_checks: hc, status: newStatus })
      .eq("id", data.canary_id)
      .select("*").single();
    if (error) throw new Error(error.message);

    const [withEmail] = await attachEmail([updated]);
    return withEmail;
  });

// ── Refresh from gateway (modo gateway) ───────────────────────────────────────

export const refreshCanaryFromGateway = createServerFn({ method: "POST" })
  .inputValidator(z.object({ canary_id: z.string().uuid() }).parse)
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    await assertSuperAdmin(context.userId);
    const { data: row } = await supabaseAdmin
      .from("wuzapi_canary_runs").select("*").eq("id", data.canary_id).single();
    if (!row) throw new Error("Canary não encontrado.");
    if (row.mode !== "gateway") {
      throw new Error("Esse canary está em modo manual — atualize via checklist.");
    }

    const res = await gatewayCall<{
      status?: string;
      health?: Partial<HealthChecks>;
      error?: string;
    }>("/api/system/wuzapi-canary/status", { method: "GET" }, { timeoutMs: 10_000 });

    if (!res.ok) {
      const [withEmail] = await attachEmail([{
        ...row,
        last_error: res.error?.message || "Gateway sem resposta.",
      }]);
      await supabaseAdmin.from("wuzapi_canary_runs")
        .update({ last_error: withEmail.last_error }).eq("id", data.canary_id);
      return withEmail;
    }

    const hc: HealthChecks = {
      build_ok: !!res.data?.health?.build_ok,
      service_up: !!res.data?.health?.service_up,
      qr_generated: !!res.data?.health?.qr_generated,
      test_message_sent: !!res.data?.health?.test_message_sent,
    };
    const allOk = hc.build_ok && hc.service_up && hc.qr_generated && hc.test_message_sent;
    const status: CanaryStatus = (res.data?.status as CanaryStatus)
      || (allOk ? "healthy" : "running");

    const { data: updated } = await supabaseAdmin
      .from("wuzapi_canary_runs")
      .update({ health_checks: hc, status, last_error: res.data?.error ?? null })
      .eq("id", data.canary_id).select("*").single();
    const [withEmail] = await attachEmail([updated]);
    return withEmail;
  });

// ── Promote ──────────────────────────────────────────────────────────────────

export const promoteCanary = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    canary_id: z.string().uuid(),
    confirm: z.literal("PROMOVER CANARY"),
  }).parse)
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    await assertSuperAdmin(context.userId);
    const { data: row } = await supabaseAdmin
      .from("wuzapi_canary_runs").select("*").eq("id", data.canary_id).single();
    if (!row) throw new Error("Canary não encontrado.");
    if (row.status !== "healthy") {
      throw new Error("Canary precisa estar saudável (todos os checks ok) antes de promover.");
    }

    let gatewayOk = true;
    let gatewayError: string | null = null;
    if (row.mode === "gateway") {
      const res = await gatewayCall<{ ok?: boolean; error?: string }>(
        "/api/system/wuzapi-canary/promote",
        { method: "POST", body: JSON.stringify({ canary_id: row.id }) },
        { timeoutMs: 120_000 },
      );
      gatewayOk = res.ok && res.data?.ok !== false;
      gatewayError = gatewayOk ? null : (res.error?.message || res.data?.error || "Falha ao promover no Gateway.");
    }

    const newStatus: CanaryStatus = gatewayOk ? "promoted" : "failed";
    const { data: updated } = await supabaseAdmin
      .from("wuzapi_canary_runs")
      .update({
        status: newStatus,
        promoted_by: gatewayOk ? context.userId : null,
        promoted_at: gatewayOk ? new Date().toISOString() : null,
        finished_at: new Date().toISOString(),
        last_error: gatewayError,
      })
      .eq("id", data.canary_id).select("*").single();

    if (!gatewayOk) throw new Error(gatewayError || "Falha ao promover canary.");
    const [withEmail] = await attachEmail([updated]);
    return withEmail;
  });

// ── Abort ────────────────────────────────────────────────────────────────────

export const abortCanary = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    canary_id: z.string().uuid(),
    reason: z.string().min(5).max(500),
  }).parse)
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    await assertSuperAdmin(context.userId);
    const { data: row } = await supabaseAdmin
      .from("wuzapi_canary_runs").select("*").eq("id", data.canary_id).single();
    if (!row) throw new Error("Canary não encontrado.");
    if (["promoted", "aborted", "failed"].includes(row.status)) {
      throw new Error("Canary já finalizado.");
    }

    if (row.mode === "gateway") {
      // best-effort: derruba o container canary
      await gatewayCall("/api/system/wuzapi-canary/abort",
        { method: "POST", body: JSON.stringify({ canary_id: row.id }) },
        { timeoutMs: 30_000 });
    }

    const { data: updated, error } = await supabaseAdmin
      .from("wuzapi_canary_runs")
      .update({
        status: "aborted",
        aborted_by: context.userId,
        aborted_at: new Date().toISOString(),
        abort_reason: data.reason,
        finished_at: new Date().toISOString(),
      })
      .eq("id", data.canary_id).select("*").single();
    if (error) throw new Error(error.message);
    const [withEmail] = await attachEmail([updated]);
    return withEmail;
  });

// ── History ──────────────────────────────────────────────────────────────────

export const listCanaryRuns = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<CanaryRun[]> => {
    await assertSuperAdmin(context.userId);
    const { data } = await supabaseAdmin
      .from("wuzapi_canary_runs").select("*")
      .order("created_at", { ascending: false }).limit(15);
    return attachEmail(data ?? []);
  });
