// Fluxo "Publicar + Deployar + Validar + Reaplicar Webhook QR"
// Orquestrador master-only: GitHub → Webhook VPS → Health Gateway → QR webhook.
// Sem expor tokens. Tudo audita em github_integration_logs via logAction.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { gatewayCall, gatewayFetch } from "./multizap-gateway.server";
import { buildGithubWebhookRequest, explainWebhookHttp } from "./vps-webhook-signature";

// Reaproveita os mesmos helpers privados via cópia local — manter assinatura
// igual em github.functions.ts. (Evita exportar internals só pra orquestração.)
async function assertSuperAdmin(userId: string) {
  const { data, error } = await supabaseAdmin.rpc("is_super_admin", { _user_id: userId });
  if (error) throw new Error("Falha ao validar permissão");
  if (!data) throw new Error("Acesso negado: apenas Super Admin");
}

async function logAction(
  actorUserId: string | null,
  action: string,
  status: "ok" | "error" | "warning",
  message: string,
  payload: Record<string, unknown> = {},
) {
  const safe = JSON.parse(JSON.stringify(payload));
  if (safe && typeof safe === "object") {
    delete (safe as Record<string, unknown>).access_token;
    delete (safe as Record<string, unknown>).token;
    delete (safe as Record<string, unknown>).webhook_secret;
    delete (safe as Record<string, unknown>).vps_webhook_secret;
  }
  await supabaseAdmin.from("github_integration_logs").insert({
    actor_user_id: actorUserId,
    action,
    status,
    message: message.slice(0, 1000),
    payload: safe,
  });
}

async function loadIntegrationRow() {
  const { data } = await supabaseAdmin
    .from("github_integrations").select("*").limit(1).maybeSingle();
  return data;
}

async function githubFetch(token: string, path: string): Promise<Response> {
  const url = path.startsWith("http") ? path : `https://api.github.com${path}`;
  return fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "MultiZap-Master/1.0",
    },
  });
}

function maskUrl(u: string | null | undefined): string | null {
  if (!u) return null;
  try {
    const url = new URL(u);
    return `${url.protocol}//${url.host}${url.pathname.length > 1 ? "/…" : ""}`;
  } catch { return "***"; }
}

function sanitizeDeployResponse(status: number, body: string): string {
  const explained = explainWebhookHttp(status, body);
  if (status === 0 || explained !== `HTTP ${status} — ${body.slice(0, 200)}`) {
    return explained;
  }
  return body.slice(0, 500);
}

type Step = {
  key: string;
  label: string;
  status: "ok" | "error" | "warning" | "skipped" | "pending";
  detail?: string;
};

// ============================================================
// getRemoteCommit — lê commit atual do GitHub para o repo+branch salvo
// ============================================================
export const getRemoteCommit = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const row = await loadIntegrationRow();
    if (!row?.access_token) throw new Error("GitHub não está conectado");
    if (!row.repo_owner || !row.repo_name) throw new Error("Nenhum repositório selecionado");
    const branch = row.branch ?? "main";
    const res = await githubFetch(
      row.access_token,
      `/repos/${row.repo_owner}/${row.repo_name}/branches/${encodeURIComponent(branch)}`,
    );
    if (!res.ok) throw new Error(`GitHub respondeu ${res.status}`);
    const b = (await res.json()) as {
      commit: { sha: string; commit: { message: string; author: { date: string } } };
    };
    const lastDeploy = await supabaseAdmin
      .from("github_deploys")
      .select("commit_sha, created_at, status")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return {
      repo: `${row.repo_owner}/${row.repo_name}`,
      branch,
      remote_sha: b.commit.sha,
      remote_sha_short: b.commit.sha.slice(0, 7),
      remote_message: b.commit.commit.message.slice(0, 200),
      remote_date: b.commit.commit.author.date,
      last_deployed_sha: lastDeploy.data?.commit_sha ?? null,
      last_deployed_short: lastDeploy.data?.commit_sha?.slice(0, 7) ?? null,
      last_deployed_at: lastDeploy.data?.created_at ?? null,
      last_deployed_status: lastDeploy.data?.status ?? null,
      has_new_commit: lastDeploy.data?.commit_sha !== b.commit.sha,
    };
  });

// ============================================================
// findActiveQrConnection — primeira conexão wuzapi connected
// ============================================================
export const findActiveQrConnection = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const { data } = await supabaseAdmin
      .from("whatsapp_connections")
      .select("id, name, phone, status, workspace_id, provider")
      .eq("provider", "wuzapi")
      .in("status", ["connected", "ready", "online"])
      .order("updated_at", { ascending: false })
      .limit(1);
    const c = data?.[0] ?? null;
    return { connection: c };
  });

// ============================================================
// runGatewayDiagnostic — checa health + valida WUZAPI_EVENTS no diag
// ============================================================
export const runGatewayDiagnostic = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const steps: Step[] = [];

    // 1. Health
    const h = await gatewayCall<{ ok?: boolean; service?: string; version?: string; commit?: string }>(
      "/health", {}, { timeoutMs: 8000 },
    );
    steps.push({
      key: "health",
      label: "Health Gateway",
      status: h.ok ? "ok" : "error",
      detail: h.ok
        ? `HTTP ${h.status} · ${(h.data as { service?: string })?.service ?? "ok"}`
        : `${h.error?.kind ?? "erro"}: ${h.error?.message ?? "sem resposta"}`,
    });

    // 2. Valida WuzAPI via /api/system/wuzapi-health (rota nova).
    let diagOk = false;
    let diagDetail = "diagnóstico não disponível";
    try {
      const d = await gatewayCall<{
        wuzapi_ok?: boolean;
        current_wuzapi_image?: string | null;
        gateway_health?: { port?: number | null } | null;
      }>("/api/system/wuzapi-health", {}, { timeoutMs: 8000 });
      if (d.ok && d.data?.wuzapi_ok === true) {
        diagOk = true;
        const img = d.data.current_wuzapi_image ?? "wuzapi";
        diagDetail = `WuzAPI ok · ${img}`;
      } else if (d.ok) {
        diagDetail = "Gateway respondeu mas WuzAPI não está saudável";
      } else {
        diagDetail = `${d.error?.kind ?? "erro"}: ${d.error?.message ?? "sem resposta"}`;
      }
    } catch {
      diagDetail = "diagnóstico não disponível";
    }
    steps.push({
      key: "gateway_code",
      label: "Código WuzAPI validado",
      status: diagOk ? "ok" : "warning",
      detail: diagDetail,
    });

    await logAction(context.userId, "gateway_diagnostic", "ok", "Diagnóstico Gateway executado", {
      health_ok: h.ok, gateway_code_ok: diagOk,
    });

    return { steps };
  });

// ============================================================
// repairQrWebhook — reaplica webhook na 1ª QR ativa (super_admin)
// ============================================================
export const repairQrWebhook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const { data } = await supabaseAdmin
      .from("whatsapp_connections")
      .select("id, name, workspace_id, status, provider")
      .eq("provider", "wuzapi")
      .in("status", ["connected", "ready", "online"])
      .order("updated_at", { ascending: false })
      .limit(1);
    const conn = data?.[0];
    if (!conn) {
      await logAction(context.userId, "qr_webhook_repair", "warning", "Nenhuma conexão QR ativa encontrada");
      return {
        ok: false,
        reason: "no_active_connection" as const,
        message: "Nenhuma conexão QR ativa encontrada. Vá em /app/canais e conecte um WhatsApp QR.",
      };
    }
    try {
      type ReapplyResp = {
        connection_id: string;
        webhook_reapplied: boolean;
        reapplied_at: string;
        diagnostic?: {
          webhook_url_saved: boolean;
          subscribe_saved: string[];
          events_saved: string;
          session_status: string;
          logged_in: boolean;
          jid: string | null;
          subscribed_events_empty_after_fix: boolean;
          auto_fix_applied: boolean;
        };
      };
      const resp = await gatewayFetch<ReapplyResp>(
        `/connections/${encodeURIComponent(conn.id)}/reapply-webhook`,
        { method: "POST" },
      );
      await logAction(context.userId, "qr_webhook_repair", "ok", `Webhook reaplicado na conexão ${conn.id}`, {
        connection_id: conn.id, workspace_id: conn.workspace_id, diagnostic: resp?.diagnostic,
      });
      return {
        ok: true,
        connection_id: conn.id,
        connection_name: conn.name,
        workspace_id: conn.workspace_id,
        applied_at: new Date().toISOString(),
        diagnostic: resp?.diagnostic ?? null,
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Falha desconhecida";
      await logAction(context.userId, "qr_webhook_repair", "error", `Falha ao reaplicar: ${msg}`, {
        connection_id: conn.id,
      });
      throw new Error(msg);
    }
  });

// ============================================================
// runPublishAndDeploy — orquestrador completo, retorna checklist
// ============================================================
export const runPublishAndDeploy = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const t0 = Date.now();
    const steps: Step[] = [];
    const summary: { commit_sha?: string; commit_message?: string; deploy_http?: number } = {};

    // 1. GitHub configurado
    const row = await loadIntegrationRow();
    if (!row?.access_token) {
      steps.push({ key: "github", label: "GitHub conectado", status: "error", detail: "Token não configurado" });
      await logAction(context.userId, "publish_deploy", "error", "GitHub não conectado");
      return { steps, ok: false, duration_ms: Date.now() - t0 };
    }
    if (!row.repo_owner || !row.repo_name) {
      steps.push({ key: "github", label: "Repositório configurado", status: "error", detail: "Selecione um repositório primeiro" });
      return { steps, ok: false, duration_ms: Date.now() - t0 };
    }
    if (!row.vps_webhook_url) {
      steps.push({ key: "vps_config", label: "Webhook VPS configurado", status: "error", detail: "Cole a URL do webhook da VPS" });
      return { steps, ok: false, duration_ms: Date.now() - t0 };
    }
    const branch = row.branch ?? "main";
    steps.push({
      key: "github", label: "GitHub conectado", status: "ok",
      detail: `${row.repo_owner}/${row.repo_name}@${branch}`,
    });

    // 1.5. Empurra arquivos locais do Gateway pro GitHub (cria commit se houver diff)
    try {
      const { runGithubAutoSync } = await import("./github-sync.server");
      const pushed = await runGithubAutoSync({
        token: row.access_token,
        owner: row.repo_owner,
        repo: row.repo_name,
        branch,
        commitAuthor: "publish-and-deploy",
      });
      steps.push({
        key: "github_push",
        label: "Mudanças enviadas pro GitHub",
        status: "ok",
        detail: pushed.skipped
          ? `sem mudança (${pushed.reason ?? "sem diff"})`
          : `${pushed.changed.length} arquivo(s) · ${pushed.commit?.slice(0, 7) ?? "ok"}`,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "erro";
      steps.push({
        key: "github_push",
        label: "Mudanças enviadas pro GitHub",
        status: "error",
        detail: msg,
      });
      await logAction(context.userId, "publish_deploy", "error", `Falha no push pro GitHub: ${msg}`);
      return { steps, ok: false, duration_ms: Date.now() - t0 };
    }


    // 2. Lê commit remoto
    let commitSha: string | null = null;
    try {
      const r = await githubFetch(row.access_token, `/repos/${row.repo_owner}/${row.repo_name}/branches/${encodeURIComponent(branch)}`);
      if (!r.ok) throw new Error(`GitHub HTTP ${r.status}`);
      const b = (await r.json()) as { commit: { sha: string; commit: { message: string } } };
      commitSha = b.commit.sha;
      summary.commit_sha = commitSha;
      summary.commit_message = b.commit.commit.message.slice(0, 200);
      steps.push({
        key: "remote_commit", label: "Commit remoto lido", status: "ok",
        detail: `${commitSha.slice(0, 7)} · ${b.commit.commit.message.slice(0, 80)}`,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "erro";
      steps.push({ key: "remote_commit", label: "Commit remoto lido", status: "error", detail: msg });
      await logAction(context.userId, "publish_deploy", "error", `Falha lendo commit: ${msg}`);
      return { steps, ok: false, duration_ms: Date.now() - t0 };
    }

    // 3. Comparar com último deploy
    const lastDeploy = await supabaseAdmin
      .from("github_deploys").select("commit_sha").order("created_at", { ascending: false }).limit(1).maybeSingle();
    const hasNew = lastDeploy.data?.commit_sha !== commitSha;
    steps.push({
      key: "compare", label: "Novo commit a deployar",
      status: hasNew ? "ok" : "warning",
      detail: hasNew ? "sim — vai deployar" : "nenhum commit novo, vai reaplicar do mesmo SHA",
    });

    // 4. Dispara webhook VPS (formato GitHub: HMAC SHA256)
    let httpStatus = 0; let responseText = ""; let deployOk = false;
    try {
      const built = buildGithubWebhookRequest({
        url: row.vps_webhook_url,
        secret: row.vps_webhook_secret,
        event: "push",
        repoFullName: `${row.repo_owner}/${row.repo_name}`,
        branch,
        commitSha,
        commitMessage: summary.commit_message ?? null,
        triggeredBy: context.userId,
      });
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 45_000);
      const res = await fetch(built.url, { ...built.init, signal: ctrl.signal });
      clearTimeout(timer);
      httpStatus = res.status;
      responseText = (await res.text()).slice(0, 500);
      deployOk = res.ok || httpStatus === 202;
    } catch (e) {
      responseText = e instanceof Error ? e.message : "Falha de rede";
    }
    const deployMessage = sanitizeDeployResponse(httpStatus, responseText);
    summary.deploy_http = httpStatus;
    steps.push({
      key: "deploy", label: "Deploy disparado na VPS",
      status: deployOk ? "ok" : "error",
      detail: deployOk
        ? `HTTP ${httpStatus} · ${responseText.slice(0, 80) || "queued"}`
        : deployMessage,
    });

    await supabaseAdmin.from("github_deploys").insert({
      triggered_by: context.userId,
      trigger_type: "manual_publish_deploy",
      commit_sha: commitSha,
      commit_message: summary.commit_message?.slice(0, 500) ?? null,
      status: deployOk ? "success" : "error",
      http_status: httpStatus || null,
      response_message: deployMessage,
      duration_ms: Date.now() - t0,
    });

    await supabaseAdmin.from("github_integrations").update({
      vps_last_deploy_at: new Date().toISOString(),
      vps_last_deploy_status: deployOk ? "success" : "error",
      vps_last_deploy_message: deployMessage.slice(0, 500),
    }).eq("id", row.id);

    if (!deployOk) {
      await logAction(context.userId, "publish_deploy", "error", `Webhook VPS retornou ${httpStatus}`, {
        webhook_url_masked: maskUrl(row.vps_webhook_url), http_status: httpStatus,
      });
      return { steps, ok: false, summary, duration_ms: Date.now() - t0 };
    }

    // 5. Aguarda 5s e valida health do Gateway
    await new Promise((r) => setTimeout(r, 5000));
    const h = await gatewayCall<{ ok?: boolean }>("/health", {}, { timeoutMs: 10000 });
    steps.push({
      key: "health", label: "Health Gateway OK",
      status: h.ok ? "ok" : "warning",
      detail: h.ok ? `HTTP ${h.status}` : `${h.error?.kind ?? "erro"}: ${h.error?.message ?? "sem resposta"}`,
    });

    // 6. Valida código via /api/system/wuzapi-health (rota nova)
    let codeOk = false;
    let codeDetail = "diagnóstico não disponível";
    try {
      const d = await gatewayCall<{
        wuzapi_ok?: boolean;
        current_wuzapi_image?: string | null;
      }>("/api/system/wuzapi-health", {}, { timeoutMs: 8000 });
      if (d.ok && d.data?.wuzapi_ok === true) {
        codeOk = true;
        const img = d.data.current_wuzapi_image ?? "wuzapi";
        codeDetail = `WuzAPI ok · ${img}`;
      } else if (d.ok) {
        codeDetail = "Gateway respondeu mas WuzAPI não está saudável";
      } else {
        codeDetail = `${d.error?.kind ?? "erro"}: ${d.error?.message ?? "sem resposta"}`;
      }
    } catch { /* skipped */ }
    steps.push({
      key: "gateway_code", label: "Código WuzAPI validado",
      status: codeOk ? "ok" : "warning",
      detail: codeDetail,
    });

    // 7. Acha conexão QR
    const { data: conns } = await supabaseAdmin
      .from("whatsapp_connections")
      .select("id, name, status, workspace_id, provider")
      .eq("provider", "wuzapi")
      .in("status", ["connected", "ready", "online"])
      .order("updated_at", { ascending: false }).limit(1);
    const qr = conns?.[0];
    if (!qr) {
      steps.push({
        key: "qr_found", label: "Conexão QR encontrada",
        status: "skipped", detail: "Sem QR ativo no momento",
      });
      steps.push({
        key: "qr_webhook", label: "Webhook QR reaplicado",
        status: "skipped", detail: "Pulado — nenhuma conexão QR ativa",
      });
    } else {
      steps.push({
        key: "qr_found", label: "Conexão QR encontrada",
        status: "ok", detail: `${qr.name ?? qr.id.slice(0, 8)}`,
      });
      try {
        await gatewayFetch(`/connections/${encodeURIComponent(qr.id)}/reapply-webhook`, { method: "POST" });
        steps.push({
          key: "qr_webhook", label: "Webhook QR reaplicado",
          status: "ok", detail: `connection_id=${qr.id.slice(0, 8)}…`,
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "erro";
        steps.push({ key: "qr_webhook", label: "Webhook QR reaplicado", status: "error", detail: msg });
      }
    }

    steps.push({
      key: "test_msg", label: "Mensagem de teste",
      status: "pending", detail: "envie uma mensagem manualmente no WhatsApp pareado",
    });

    await logAction(context.userId, "publish_deploy", "ok", "Fluxo Publicar+Deployar concluído", {
      commit: commitSha?.slice(0, 7), http_status: httpStatus, qr_connection_id: qr?.id ?? null,
    });

    return { steps, ok: true, summary, duration_ms: Date.now() - t0 };
  });
