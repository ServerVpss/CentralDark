import { createServerFn } from "@tanstack/react-start";
import { setCookie } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { buildGithubWebhookRequest, explainWebhookHttp } from "./vps-webhook-signature";

// ============================================================
// Helpers internos (server-only) — token NUNCA volta pro frontend
// ============================================================

async function assertSuperAdmin(userId: string) {
  const { data, error } = await supabaseAdmin.rpc("is_super_admin", { _user_id: userId });
  if (error) {
    console.error("[github.functions] is_super_admin RPC error:", { userId, error });
    throw new Error(`Falha ao validar permissão: ${error.message || error.code || "erro desconhecido"}`);
  }
  if (!data) throw new Error("Acesso negado: apenas Super Admin");
}

async function logAction(
  actorUserId: string | null,
  action: string,
  status: "ok" | "error" | "warning",
  message: string,
  payload: Record<string, unknown> = {}
) {
  // sanitiza payload — nunca grava token
  const safe = JSON.parse(JSON.stringify(payload));
  if (safe && typeof safe === "object") {
    delete (safe as Record<string, unknown>).access_token;
    delete (safe as Record<string, unknown>).token;
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
    .from("github_integrations")
    .select("*")
    .limit(1)
    .maybeSingle();
  return data;
}

function maskToken(token: string | null | undefined): string | null {
  if (!token) return null;
  if (token.length < 10) return "***";
  return `${token.slice(0, 4)}…${token.slice(-4)}`;
}

function sanitizeDeployResponse(status: number, body: string): string {
  const explained = explainWebhookHttp(status, body);
  if (status === 0 || explained !== `HTTP ${status} — ${body.slice(0, 200)}`) {
    return explained;
  }
  return body.slice(0, 1000);
}

async function githubFetch(
  token: string,
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const url = path.startsWith("http") ? path : `https://api.github.com${path}`;
  return fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "MultiZap-Master/1.0",
      ...(init.headers ?? {}),
    },
  });
}

// ============================================================
// getGithubIntegrationStatus
// ============================================================
export const getGithubIntegrationStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const row = await loadIntegrationRow();
    if (!row) {
      return {
        configured: false,
        status: "not_connected" as const,
        repo_owner: null as string | null,
        repo_name: null as string | null,
        branch: "main",
        auth_type: "pat" as const,
        token_preview: null as string | null,
        permissions: {} as Record<string, string | number | boolean | null>,
        last_sync_at: null as string | null,
        last_error: null as string | null,
        connected_at: null as string | null,
      };
    }
    return {
      configured: !!row.access_token,
      status: row.status,
      repo_owner: row.repo_owner,
      repo_name: row.repo_name,
      branch: row.branch ?? "main",
      auth_type: row.auth_type,
      token_preview: maskToken(row.access_token),
      permissions: (row.permissions ?? {}) as Record<string, string | number | boolean | null>,
      last_sync_at: row.last_sync_at,
      last_error: row.last_error,
      connected_at: row.connected_at,
    };
  });

// ============================================================
// connectGithub — salva token (PAT) e valida contra a API
// ============================================================
export const connectGithub = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        auth_type: z.enum(["pat", "app"]).default("pat"),
        access_token: z.string().min(20).max(500),
      })
      .parse(input)
  )
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);

    // valida token consultando /user
    const res = await githubFetch(data.access_token, "/user");
    if (!res.ok) {
      const errMsg =
        res.status === 401
          ? "Token inválido ou expirado"
          : `GitHub respondeu ${res.status}`;
      await logAction(context.userId, "connect", "error", errMsg, { status: res.status });
      throw new Error(errMsg);
    }
    const ghUser = (await res.json()) as { login: string; id: number };

    // upsert da linha singleton
    const existing = await loadIntegrationRow();
    const payload = {
      auth_type: data.auth_type,
      access_token: data.access_token,
      status: "connected" as const,
      connected_by: context.userId,
      connected_at: new Date().toISOString(),
      last_error: null,
      permissions: { user: ghUser.login },
    };

    if (existing) {
      await supabaseAdmin
        .from("github_integrations")
        .update(payload)
        .eq("id", existing.id);
    } else {
      await supabaseAdmin.from("github_integrations").insert(payload);
    }

    await logAction(context.userId, "connect", "ok", `Conectado como ${ghUser.login}`, {
      gh_login: ghUser.login,
    });

    return { ok: true, gh_login: ghUser.login };
  });

// ============================================================
// disconnectGithubIntegration
// ============================================================
export const disconnectGithubIntegration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const existing = await loadIntegrationRow();
    if (!existing) return { ok: true };

    await supabaseAdmin
      .from("github_integrations")
      .update({
        access_token: null,
        status: "not_connected",
        repo_owner: null,
        repo_name: null,
        last_sync_at: null,
        last_error: null,
        permissions: {},
        connected_at: null,
        connected_by: null,
      })
      .eq("id", existing.id);

    await logAction(context.userId, "disconnect", "ok", "Integração desconectada");
    return { ok: true };
  });

// ============================================================
// listGithubRepositories
// ============================================================
export const listGithubRepositories = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const row = await loadIntegrationRow();
    if (!row?.access_token) throw new Error("GitHub não está conectado");

    const res = await githubFetch(
      row.access_token,
      "/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator,organization_member"
    );
    if (!res.ok) {
      const msg = `Falha ao listar repositórios (${res.status})`;
      await logAction(context.userId, "list_repos", "error", msg);
      throw new Error(msg);
    }
    const repos = (await res.json()) as Array<{
      full_name: string;
      name: string;
      owner: { login: string };
      default_branch: string;
      private: boolean;
      permissions?: { admin?: boolean; push?: boolean; pull?: boolean };
    }>;

    return repos.map((r) => ({
      full_name: r.full_name,
      owner: r.owner.login,
      name: r.name,
      default_branch: r.default_branch,
      private: r.private,
      can_push: !!r.permissions?.push,
      can_admin: !!r.permissions?.admin,
    }));
  });

// ============================================================
// listGithubBranches
// ============================================================
export const listGithubBranches = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        owner: z.string().min(1).max(100),
        name: z.string().min(1).max(200),
      })
      .parse(input)
  )
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    const row = await loadIntegrationRow();
    if (!row?.access_token) throw new Error("GitHub não está conectado");

    const res = await githubFetch(
      row.access_token,
      `/repos/${encodeURIComponent(data.owner)}/${encodeURIComponent(data.name)}/branches?per_page=100`
    );
    if (!res.ok) {
      const msg = `Falha ao listar branches (${res.status})`;
      await logAction(context.userId, "list_branches", "error", msg);
      throw new Error(msg);
    }
    const branches = (await res.json()) as Array<{ name: string; protected: boolean }>;
    return branches.map((b) => ({ name: b.name, protected: b.protected }));
  });

// ============================================================
// selectGithubRepository
// ============================================================
export const selectGithubRepository = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        owner: z.string().min(1).max(100),
        name: z.string().min(1).max(200),
        branch: z.string().min(1).max(100).default("main"),
      })
      .parse(input)
  )
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    const row = await loadIntegrationRow();
    if (!row?.access_token) throw new Error("GitHub não está conectado");

    // valida acesso ao repo + branch
    const repoRes = await githubFetch(row.access_token, `/repos/${data.owner}/${data.name}`);
    if (!repoRes.ok) {
      const msg =
        repoRes.status === 404
          ? "Repositório não encontrado ou sem permissão"
          : `Falha ao verificar repositório (${repoRes.status})`;
      await logAction(context.userId, "select_repo", "error", msg, {
        owner: data.owner,
        name: data.name,
      });
      throw new Error(msg);
    }
    const repo = (await repoRes.json()) as {
      permissions?: { admin?: boolean; push?: boolean; pull?: boolean };
      default_branch: string;
    };
    const perms = repo.permissions ?? {};
    if (!perms.push) {
      const msg =
        "Permissão insuficiente. O GitHub App precisa de leitura e escrita no repositório selecionado.";
      await supabaseAdmin
        .from("github_integrations")
        .update({
          repo_owner: data.owner,
          repo_name: data.name,
          branch: data.branch,
          status: "permission_error",
          permissions: perms,
          last_error: msg,
        })
        .eq("id", row.id);
      await logAction(context.userId, "select_repo", "warning", msg, {
        owner: data.owner,
        name: data.name,
        permissions: perms,
      });
      throw new Error(msg);
    }

    await supabaseAdmin
      .from("github_integrations")
      .update({
        repo_owner: data.owner,
        repo_name: data.name,
        branch: data.branch,
        status: "ready",
        permissions: perms,
        last_error: null,
      })
      .eq("id", row.id);

    await logAction(context.userId, "select_repo", "ok", `Repositório selecionado: ${data.owner}/${data.name}@${data.branch}`);
    return { ok: true };
  });

// ============================================================
// syncGithubRepository — testa conectividade e atualiza status
// ============================================================
export const syncGithubRepository = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const row = await loadIntegrationRow();
    if (!row?.access_token) throw new Error("GitHub não está conectado");
    if (!row.repo_owner || !row.repo_name) throw new Error("Nenhum repositório selecionado");

    await supabaseAdmin
      .from("github_integrations")
      .update({ status: "syncing", last_error: null })
      .eq("id", row.id);

    const branch = row.branch ?? "main";

    // 1. Empurra mudanças locais do Gateway pro GitHub (cria commit se houver diff).
    const { runGithubAutoSync } = await import("./github-sync.server");
    let pushed: Awaited<ReturnType<typeof runGithubAutoSync>>;
    try {
      pushed = await runGithubAutoSync({
        token: row.access_token,
        owner: row.repo_owner,
        repo: row.repo_name,
        branch,
        commitAuthor: "master-panel",
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Falha ao sincronizar arquivos";
      await supabaseAdmin
        .from("github_integrations")
        .update({ status: "failed", last_error: msg })
        .eq("id", row.id);
      await logAction(context.userId, "sync", "error", msg);
      throw new Error(msg);
    }

    // 2. Lê commit atual (depois do push, se houve) pra retornar o hash certo.
    const branchRes = await githubFetch(
      row.access_token,
      `/repos/${row.repo_owner}/${row.repo_name}/branches/${encodeURIComponent(branch)}`
    );
    if (!branchRes.ok) {
      const msg =
        branchRes.status === 404
          ? `Branch "${branch}" não encontrada no repositório`
          : `Falha ao consultar branch (${branchRes.status})`;
      await supabaseAdmin
        .from("github_integrations")
        .update({ status: "failed", last_error: msg })
        .eq("id", row.id);
      await logAction(context.userId, "sync", "error", msg);
      throw new Error(msg);
    }

    const branchData = (await branchRes.json()) as {
      commit: { sha: string; commit: { message: string; author: { date: string; name: string } } };
    };

    await supabaseAdmin
      .from("github_integrations")
      .update({
        status: "ready",
        last_sync_at: new Date().toISOString(),
        last_error: null,
      })
      .eq("id", row.id);

    const pushedNew = !pushed.skipped && !!pushed.commit;
    const changedCount = pushed.changed.length;

    await logAction(
      context.userId,
      "sync",
      "ok",
      pushedNew
        ? `Commit criado com ${changedCount} arquivo(s)`
        : `Nenhuma mudança a enviar (${pushed.reason ?? "sem diff"})`,
      {
        commit_sha: branchData.commit.sha.slice(0, 7),
        commit_msg: branchData.commit.commit.message.slice(0, 200),
        commit_date: branchData.commit.commit.author.date,
        pushed_new_commit: pushedNew,
        scanned: pushed.scanned,
        changed_files: pushed.changed.slice(0, 20),
      }
    );

    return {
      ok: true,
      pushed_new_commit: pushedNew,
      changed_files: pushed.changed,
      scanned: pushed.scanned,
      skipped_reason: pushed.skipped ? pushed.reason ?? null : null,
      commit_sha: branchData.commit.sha,
      commit_short: branchData.commit.sha.slice(0, 7),
      commit_message: branchData.commit.commit.message,
      commit_date: branchData.commit.commit.author.date,
    };
  });


// ============================================================
// listGithubIntegrationLogs
// ============================================================
export const listGithubIntegrationLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const { data } = await supabaseAdmin
      .from("github_integration_logs")
      .select("id, action, status, message, payload, actor_user_id, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    return data ?? [];
  });

// ============================================================
// DEPLOY VPS — configuração + disparo do webhook
// ============================================================

function maskSecret(s: string | null | undefined): string | null {
  if (!s) return null;
  if (s.length < 8) return "***";
  return `${s.slice(0, 3)}…${s.slice(-3)}`;
}

export const getVpsDeployConfig = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const row = await loadIntegrationRow();
    return {
      webhook_url: row?.vps_webhook_url ?? "",
      target_path: row?.vps_target_path ?? "",
      pm2_process: row?.vps_pm2_process ?? "",
      auto_deploy: row?.vps_auto_deploy ?? true,
      secret_preview: maskSecret(row?.vps_webhook_secret),
      has_secret: !!row?.vps_webhook_secret,
      last_deploy_at: row?.vps_last_deploy_at ?? null,
      last_deploy_status: row?.vps_last_deploy_status ?? null,
      last_deploy_message: row?.vps_last_deploy_message ?? null,
    };
  });

export const saveVpsDeployConfig = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        webhook_url: z.string().url().max(500).or(z.literal("")),
        webhook_secret: z.string().max(500).optional(),
        target_path: z.string().max(300).optional(),
        pm2_process: z.string().max(100).optional(),
        auto_deploy: z.boolean().default(true),
      })
      .parse(input)
  )
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    const row = await loadIntegrationRow();
    if (!row) throw new Error("Conecte o GitHub antes de configurar o deploy");

    const update: {
      vps_webhook_url: string | null;
      vps_target_path: string | null;
      vps_pm2_process: string | null;
      vps_auto_deploy: boolean;
      vps_webhook_secret?: string;
    } = {
      vps_webhook_url: data.webhook_url || null,
      vps_target_path: data.target_path || null,
      vps_pm2_process: data.pm2_process || null,
      vps_auto_deploy: data.auto_deploy,
    };
    if (typeof data.webhook_secret === "string" && data.webhook_secret.trim().length > 0) {
      const trimmed = data.webhook_secret.trim();
      if (trimmed.length < 16) {
        throw new Error("Segredo muito curto (mínimo 16 caracteres). Gere um novo na VPS com `openssl rand -hex 32`.");
      }
      update.vps_webhook_secret = trimmed;
    }

    await supabaseAdmin.from("github_integrations").update(update).eq("id", row.id);
    await logAction(context.userId, "vps_config", "ok", "Configuração de deploy VPS atualizada", {
      webhook_url: data.webhook_url,
      target_path: data.target_path,
      pm2_process: data.pm2_process,
      auto_deploy: data.auto_deploy,
      secret_changed: !!data.webhook_secret,
    });
    return { ok: true };
  });

export const triggerVpsDeploy = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const row = await loadIntegrationRow();
    if (!row?.vps_webhook_url) throw new Error("Webhook da VPS não configurado");
    if (!row.repo_owner || !row.repo_name) throw new Error("Nenhum repositório selecionado");

    // pega o último commit pra logar
    let commitSha: string | null = null;
    let commitMsg: string | null = null;
    if (row.access_token) {
      try {
        const r = await githubFetch(
          row.access_token,
          `/repos/${row.repo_owner}/${row.repo_name}/branches/${encodeURIComponent(row.branch ?? "main")}`
        );
        if (r.ok) {
          const b = (await r.json()) as { commit: { sha: string; commit: { message: string } } };
          commitSha = b.commit.sha;
          commitMsg = b.commit.commit.message;
        }
      } catch { /* ignora */ }
    }

    const t0 = Date.now();
    let httpStatus = 0;
    let responseText = "";
    let success = false;

    try {
      const built = buildGithubWebhookRequest({
        url: row.vps_webhook_url,
        secret: row.vps_webhook_secret,
        event: "push",
        repoFullName: `${row.repo_owner}/${row.repo_name}`,
        branch: row.branch ?? "main",
        commitSha,
        commitMessage: commitMsg,
        triggeredBy: context.userId,
      });
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 30_000);
      const res = await fetch(built.url, { ...built.init, signal: ctrl.signal });
      clearTimeout(timer);
      httpStatus = res.status;
      responseText = (await res.text()).slice(0, 1000);
      // Listener responde 202 "deploy queued" em sucesso
      success = res.ok || httpStatus === 202;
    } catch (e) {
      responseText = e instanceof Error ? e.message : "Falha desconhecida";
    }

    const userMessage = sanitizeDeployResponse(httpStatus, responseText);

    const duration = Date.now() - t0;
    const status = success ? "success" : "error";

    await supabaseAdmin.from("github_deploys").insert({
      triggered_by: context.userId,
      trigger_type: "manual",
      commit_sha: commitSha,
      commit_message: commitMsg?.slice(0, 500),
      status,
      http_status: httpStatus || null,
      response_message: userMessage,
      duration_ms: duration,
    });

    await supabaseAdmin
      .from("github_integrations")
      .update({
        vps_last_deploy_at: new Date().toISOString(),
        vps_last_deploy_status: status,
        vps_last_deploy_message: userMessage.slice(0, 500),
      })
      .eq("id", row.id);

    await logAction(
      context.userId,
      "vps_deploy",
      success ? "ok" : "error",
      success ? `Deploy disparado (${httpStatus})` : `Falha no deploy: ${userMessage}`,
      { http_status: httpStatus, duration_ms: duration, commit: commitSha?.slice(0, 7) }
    );

    if (!success) {
      throw new Error(userMessage);
    }
    return { ok: true, http_status: httpStatus, duration_ms: duration, commit_short: commitSha?.slice(0, 7) ?? null };
  });

// ============================================================
// testVpsWebhookSignature — manda evento "ping" assinado (sem deploy real)
// Listener valida assinatura e retorna 204 se segredo bate, 401 se não.
// ============================================================
export const testVpsWebhookSignature = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const row = await loadIntegrationRow();
    if (!row?.vps_webhook_url) throw new Error("Webhook da VPS não configurado");
    if (!row.vps_webhook_secret) throw new Error("Salve o segredo do webhook primeiro");
    if (!row.repo_owner || !row.repo_name) throw new Error("Selecione um repositório primeiro");

    let httpStatus = 0;
    let responseText = "";
    const t0 = Date.now();
    try {
      const built = buildGithubWebhookRequest({
        url: row.vps_webhook_url,
        secret: row.vps_webhook_secret,
        event: "ping",
        repoFullName: `${row.repo_owner}/${row.repo_name}`,
        branch: row.branch ?? "main",
        commitSha: null,
        commitMessage: null,
        triggeredBy: context.userId,
      });
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 15_000);
      const res = await fetch(built.url, { ...built.init, signal: ctrl.signal });
      clearTimeout(timer);
      httpStatus = res.status;
      responseText = (await res.text()).slice(0, 500);
    } catch (e) {
      responseText = e instanceof Error ? e.message : "Falha desconhecida";
    }

    // 204 (e 200) = listener aceitou a assinatura (evento ping ignorado).
    // 202 também conta como "aceito" se algum proxy traduzir.
    const ok = httpStatus === 204 || httpStatus === 200 || httpStatus === 202;
    const message = explainWebhookHttp(httpStatus, responseText);

    await logAction(
      context.userId,
      "vps_signature_test",
      ok ? "ok" : "error",
      ok ? "Segredo confere com a VPS" : `Teste falhou: ${message}`,
      { http_status: httpStatus, duration_ms: Date.now() - t0 }
    );

    return { ok, http_status: httpStatus, message };
  });

export const listVpsDeploys = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const { data } = await supabaseAdmin
      .from("github_deploys")
      .select("id, trigger_type, commit_sha, commit_message, status, http_status, response_message, duration_ms, created_at")
      .order("created_at", { ascending: false })
      .limit(30);
    return data ?? [];
  });

// ============================================================
// OAuth GitHub App — login com 1 clique
// ============================================================
export const startGithubOAuth = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
    if (!clientId) throw new Error("GITHUB_OAUTH_CLIENT_ID não configurado");

    const state = crypto.randomUUID() + "." + crypto.randomUUID();

    // cookie httpOnly de 10 min com state + userId pra validar no callback
    setCookie("gh_oauth_state", `${state}::${context.userId}`, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });

    const redirectUri = `${process.env.GITHUB_OAUTH_REDIRECT_URI ?? "https://multizap.dev/api/public/github/callback"}`;
    const url = new URL("https://github.com/login/oauth/authorize");
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("state", state);
    url.searchParams.set("scope", "repo");

    return { url: url.toString() };
  });
