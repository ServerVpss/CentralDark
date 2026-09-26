// Atualização da WuzAPI (asternic/wuzapi:latest) pelo painel master.
// - checkWuzapiUpdate: pergunta pro Docker Hub a última versão publicada
//   pelo autor + pergunta pro Gateway na VPS qual está rodando hoje, compara
//   e salva o resultado em master_settings.wuzapi_update_status.
// - getWuzapiUpdateStatus: lê o último resultado guardado.
// - triggerWuzapiUpdate: chama o Gateway pra fazer docker pull + restart
//   seguro (preservando volumes/sessões), grava o resultado em audit_log.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { gatewayCall } from "@/lib/multizap-gateway.server";

const DOCKER_HUB_URL =
  "https://hub.docker.com/v2/repositories/asternic/wuzapi/tags/latest";

type WuzapiStatus = {
  current_digest: string | null;
  current_short: string | null;
  latest_digest: string | null;
  latest_short: string | null;
  latest_published_at: string | null;
  update_available: boolean;
  checked_at: string;
  check_error: string | null;
  last_update_at: string | null;
  last_update_status: "ok" | "error" | null;
  last_update_error: string | null;
};

const EMPTY: WuzapiStatus = {
  current_digest: null,
  current_short: null,
  latest_digest: null,
  latest_short: null,
  latest_published_at: null,
  update_available: false,
  checked_at: new Date(0).toISOString(),
  check_error: null,
  last_update_at: null,
  last_update_status: null,
  last_update_error: null,
};

function shortDigest(d: string | null | undefined): string | null {
  if (!d) return null;
  // ex: sha256:40b065b491ab... -> sha-40b065b
  const m = d.match(/[a-f0-9]{40,}/i);
  if (m) return `sha-${m[0].slice(0, 7)}`;
  return d.length > 16 ? d.slice(0, 16) : d;
}

async function assertSuperAdmin(userId: string) {
  const { data, error } = await supabaseAdmin.rpc("is_super_admin", {
    _user_id: userId,
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Acesso negado: apenas Super Admin.");
}

async function readStatus(): Promise<WuzapiStatus> {
  const { data } = await supabaseAdmin
    .from("master_settings")
    .select("wuzapi_update_status")
    .eq("id", 1)
    .maybeSingle();
  const raw = (data?.wuzapi_update_status ?? {}) as Partial<WuzapiStatus>;
  return { ...EMPTY, ...raw };
}

async function saveStatus(patch: Partial<WuzapiStatus>) {
  const prev = await readStatus();
  const next: WuzapiStatus = { ...prev, ...patch };
  const { error } = await supabaseAdmin
    .from("master_settings")
    .update({ wuzapi_update_status: next as never })
    .eq("id", 1);
  if (error) throw new Error(error.message);
  return next;
}

/**
 * Pergunta pro Docker Hub o digest atual da tag `latest`.
 */
async function fetchLatestFromDockerHub(): Promise<{
  digest: string | null;
  published_at: string | null;
}> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(DOCKER_HUB_URL, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      throw new Error(`Docker Hub HTTP ${res.status}`);
    }
    const json = (await res.json()) as {
      digest?: string;
      images?: Array<{ digest?: string }>;
      last_updated?: string;
    };
    const digest =
      json.digest || json.images?.find((i) => i.digest)?.digest || null;
    return { digest, published_at: json.last_updated ?? null };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Pergunta pro Gateway na VPS qual o digest da imagem do container WuzAPI
 * que está rodando agora.
 */
async function fetchCurrentFromGateway(): Promise<{
  digest: string | null;
  image: string | null;
  error: string | null;
}> {
  const res = await gatewayCall<{
    image?: string;
    digest?: string;
    repo_digest?: string;
  }>("/api/system/wuzapi-version", { method: "GET" }, { timeoutMs: 8000 });
  if (!res.ok) {
    return {
      digest: null,
      image: null,
      error: res.error?.message || "Falha ao falar com o Gateway.",
    };
  }
  return {
    digest: res.data?.repo_digest || res.data?.digest || null,
    image: res.data?.image || null,
    error: null,
  };
}

async function runCheck(): Promise<WuzapiStatus> {
  const checked_at = new Date().toISOString();
  let latest: { digest: string | null; published_at: string | null } = {
    digest: null,
    published_at: null,
  };
  let current: { digest: string | null; image: string | null; error: string | null } = {
    digest: null,
    image: null,
    error: null,
  };
  let check_error: string | null = null;

  try {
    latest = await fetchLatestFromDockerHub();
  } catch (e) {
    check_error = `Docker Hub: ${e instanceof Error ? e.message : String(e)}`;
  }

  current = await fetchCurrentFromGateway();
  if (current.error && !check_error) check_error = `Gateway: ${current.error}`;

  const update_available =
    !!latest.digest && !!current.digest && latest.digest !== current.digest;

  return saveStatus({
    current_digest: current.digest,
    current_short: shortDigest(current.digest),
    latest_digest: latest.digest,
    latest_short: shortDigest(latest.digest),
    latest_published_at: latest.published_at,
    update_available,
    checked_at,
    check_error,
  });
}

export const checkWuzapiUpdate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    return runCheck();
  });

export const getWuzapiUpdateStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    return readStatus();
  });

/**
 * Executa o update na VPS: pull + up -d (sem -v, preservando sessões).
 * Após o restart, reroda a checagem pra atualizar o status na UI.
 */
export const triggerWuzapiUpdate = createServerFn({ method: "POST" })
  .inputValidator(z.object({ confirm: z.literal(true) }).parse)
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const before = await readStatus();

    const res = await gatewayCall<{
      ok: boolean;
      pulled_digest?: string;
      previous_digest?: string;
      logs?: string;
    }>(
      "/api/system/wuzapi-update",
      { method: "POST", body: JSON.stringify({}) },
      { timeoutMs: 120_000 },
    );

    const ok = res.ok && res.data?.ok !== false;
    const error = ok ? null : res.error?.message || "Falha ao atualizar WuzAPI.";
    const now = new Date().toISOString();

    await supabaseAdmin.from("audit_log").insert({
      actor_user_id: context.userId,
      action: ok ? "admin:wuzapi_update_success" : "admin:wuzapi_update_failed",
      payload: {
        before_digest: before.current_digest,
        latest_digest: before.latest_digest,
        pulled_digest: res.data?.pulled_digest ?? null,
        gateway_status: res.status ?? null,
        error,
        logs_tail: (res.data?.logs ?? "").slice(-2000),
      },
    });

    await saveStatus({
      last_update_at: now,
      last_update_status: ok ? "ok" : "error",
      last_update_error: error,
    });

    // Re-checa pra atualizar current_digest na UI
    const fresh = await runCheck();
    if (!ok) {
      throw new Error(error || "Falha ao atualizar WuzAPI.");
    }
    return fresh;
  });

/**
 * Versão sem auth pro cron rodar (chamada apenas pelo endpoint cron protegido).
 */
export async function runWuzapiUpdateCheckForCron() {
  return runCheck();
}
