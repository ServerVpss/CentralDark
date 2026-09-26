// Cliente mínimo da API do GitHub. Usa fetch nativo do Node 20+.

import { log } from "./log.js";

const GITHUB_API = "https://api.github.com";

export class GitHubError extends Error {
  constructor(public status: number, message: string, public body?: unknown) {
    super(message);
    this.name = "GitHubError";
  }
}

async function ghFetch(token: string, path: string, init?: RequestInit) {
  const res = await fetch(`${GITHUB_API}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "MCP-CentralDark/0.1",
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    log.warn("github_api_error", { path, status: res.status });
    throw new GitHubError(res.status, `GitHub API ${res.status}: ${path}`, text);
  }

  if (res.status === 204) return null;
  return res.json();
}

async function ghJson(
  token: string,
  method: "POST" | "PATCH" | "PUT" | "DELETE",
  path: string,
  body?: unknown
) {
  return ghFetch(token, path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export async function getViewer(token: string) {
  return ghFetch(token, "/user");
}

// Checa o token: tipo, scopes (classic), permissões no repo, rate limit e se dá pra Actions write.
export async function checkToken(token: string, owner?: string, repo?: string) {
  const res = await fetch(`${GITHUB_API}/user`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "MCP-CentralDark/0.1",
    },
  });

  const scopes = (res.headers.get("x-oauth-scopes") ?? "")
    .split(",").map((s) => s.trim()).filter(Boolean);
  const acceptedScopes = (res.headers.get("x-accepted-oauth-scopes") ?? "")
    .split(",").map((s) => s.trim()).filter(Boolean);
  const tokenExpiration = res.headers.get("github-authentication-token-expiration");

  let user: { login?: string } = {};
  try { user = (await res.json()) as { login?: string }; } catch { /* ignora */ }

  let tokenType: "classic-pat" | "fine-grained-pat" | "oauth-app" | "github-app" | "unknown" = "unknown";
  if (token.startsWith("ghp_")) tokenType = "classic-pat";
  else if (token.startsWith("github_pat_")) tokenType = "fine-grained-pat";
  else if (token.startsWith("gho_")) tokenType = "oauth-app";
  else if (token.startsWith("ghs_") || token.startsWith("ghu_")) tokenType = "github-app";

  let repoPermissions: Record<string, boolean> | undefined;
  let actionsWriteHint: "yes" | "no" | "unknown" = "unknown";
  if (owner && repo) {
    try {
      const r = (await ghFetch(token, `/repos/${owner}/${repo}`)) as { permissions?: Record<string, boolean> };
      repoPermissions = r.permissions;
      const hasWorkflowScope = scopes.includes("workflow") || scopes.includes("repo");
      const canPush = !!(repoPermissions?.push || repoPermissions?.maintain || repoPermissions?.admin);
      if (tokenType === "classic-pat") actionsWriteHint = hasWorkflowScope && canPush ? "yes" : "no";
      else actionsWriteHint = canPush ? "yes" : "no";
    } catch { actionsWriteHint = "unknown"; }
  }

  return {
    ok: res.ok,
    status: res.status,
    user: user.login ?? null,
    tokenType,
    tokenPrefix: token.slice(0, 4) + "…",
    expiresAt: tokenExpiration || null,
    scopes,
    acceptedScopesForUserEndpoint: acceptedScopes,
    rateLimit: {
      limit: res.headers.get("x-ratelimit-limit"),
      remaining: res.headers.get("x-ratelimit-remaining"),
      reset: res.headers.get("x-ratelimit-reset"),
    },
    repoCheck: owner && repo ? { owner, repo, permissions: repoPermissions } : undefined,
    actionsWriteHint,
    advice:
      actionsWriteHint === "no"
        ? tokenType === "classic-pat"
          ? "PAT classic SEM scope 'workflow'. Regenere em github.com/settings/tokens marcando 'workflow' (e 'repo')."
          : "Token SEM permissão de escrita no repo. Em fine-grained: marque 'Actions: Read and write' e 'Contents: Read and write' pro repo alvo."
        : actionsWriteHint === "yes"
          ? "Token aparenta ter permissão pra reexecutar/disparar workflows."
          : "Passa owner+repo pra checar permissões do repo.",
  };
}

export async function listRepos(token: string, opts: { perPage?: number; page?: number } = {}) {
  const perPage = opts.perPage ?? 30;
  const page = opts.page ?? 1;
  return ghFetch(token, `/user/repos?per_page=${perPage}&page=${page}&sort=updated`);
}

export async function getRepo(token: string, owner: string, repo: string) {
  return ghFetch(token, `/repos/${owner}/${repo}`);
}

export async function listIssues(
  token: string,
  owner: string,
  repo: string,
  opts: { state?: "open" | "closed" | "all"; perPage?: number; page?: number } = {}
) {
  const state = opts.state ?? "open";
  const perPage = opts.perPage ?? 30;
  const page = opts.page ?? 1;
  return ghFetch(
    token,
    `/repos/${owner}/${repo}/issues?state=${state}&per_page=${perPage}&page=${page}`
  );
}

export async function listPullRequests(
  token: string,
  owner: string,
  repo: string,
  opts: { state?: "open" | "closed" | "all"; perPage?: number; page?: number } = {}
) {
  const state = opts.state ?? "open";
  const perPage = opts.perPage ?? 30;
  const page = opts.page ?? 1;
  return ghFetch(
    token,
    `/repos/${owner}/${repo}/pulls?state=${state}&per_page=${perPage}&page=${page}`
  );
}

export async function getFileContent(
  token: string,
  owner: string,
  repo: string,
  path: string,
  ref?: string
) {
  const q = ref ? `?ref=${encodeURIComponent(ref)}` : "";
  const data = await ghFetch(token, `/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}${q}`);
  if (data && typeof data === "object" && "content" in data && typeof data.content === "string") {
    const decoded = Buffer.from(data.content, "base64").toString("utf-8");
    return { ...data, decoded };
  }
  return data;
}

// ---------- Escrita ----------

export async function createIssue(
  token: string,
  owner: string,
  repo: string,
  input: { title: string; body?: string; labels?: string[]; assignees?: string[] }
) {
  return ghJson(token, "POST", `/repos/${owner}/${repo}/issues`, input);
}


export async function getIssue(
  token: string,
  owner: string,
  repo: string,
  issueNumber: number
) {
  return ghFetch(token, `/repos/${owner}/${repo}/issues/${issueNumber}`);
}

export async function commentIssue(
  token: string,
  owner: string,
  repo: string,
  issueNumber: number,
  body: string
) {
  return ghJson(token, "POST", `/repos/${owner}/${repo}/issues/${issueNumber}/comments`, { body });
}


export async function closeIssue(
  token: string,
  owner: string,
  repo: string,
  issueNumber: number,
  input: { body?: string; stateReason?: "completed" | "not_planned" } = {}
) {
  if (input.body && input.body.trim()) {
    await commentIssue(token, owner, repo, issueNumber, input.body);
  }

  return ghJson(token, "PATCH", `/repos/${owner}/${repo}/issues/${issueNumber}`, {
    state: "closed",
    state_reason: input.stateReason ?? "completed",
  });
}

export async function createPullRequest(
  token: string,
  owner: string,
  repo: string,
  input: { title: string; head: string; base: string; body?: string; draft?: boolean }
) {
  return ghJson(token, "POST", `/repos/${owner}/${repo}/pulls`, input);
}

export async function mergePullRequest(
  token: string,
  owner: string,
  repo: string,
  pullNumber: number,
  input: { commit_title?: string; commit_message?: string; merge_method?: "merge" | "squash" | "rebase" } = {}
) {
  return ghJson(token, "PUT", `/repos/${owner}/${repo}/pulls/${pullNumber}/merge`, input);
}

// Pega o SHA de uma branch.
export async function getBranchSha(token: string, owner: string, repo: string, branch: string) {
  const data = await ghFetch(token, `/repos/${owner}/${repo}/git/ref/heads/${encodeURIComponent(branch)}`);
  return (data as { object: { sha: string } }).object.sha;
}

// Cria uma branch nova a partir de outra (default: main).
export async function createBranch(
  token: string,
  owner: string,
  repo: string,
  input: { newBranch: string; fromBranch?: string }
) {
  const fromSha = await getBranchSha(token, owner, repo, input.fromBranch ?? "main");
  return ghJson(token, "POST", `/repos/${owner}/${repo}/git/refs`, {
    ref: `refs/heads/${input.newBranch}`,
    sha: fromSha,
  });
}

// Últimos N commits de uma branch.
export async function listCommits(
  token: string,
  owner: string,
  repo: string,
  opts: { branch?: string; perPage?: number; page?: number; path?: string } = {}
) {
  const sha = opts.branch ?? "main";
  const perPage = opts.perPage ?? 20;
  const page = opts.page ?? 1;
  const path = opts.path ? `&path=${encodeURIComponent(opts.path)}` : "";
  return ghFetch(
    token,
    `/repos/${owner}/${repo}/commits?sha=${encodeURIComponent(sha)}&per_page=${perPage}&page=${page}${path}`
  );
}

// Lista os últimos runs do GitHub Actions.
export async function listWorkflowRuns(
  token: string,
  owner: string,
  repo: string,
  opts: { perPage?: number; branch?: string; status?: string } = {}
) {
  const perPage = opts.perPage ?? 10;
  const params = new URLSearchParams();
  params.set("per_page", String(perPage));
  if (opts.branch) params.set("branch", opts.branch);
  if (opts.status) params.set("status", opts.status);
  return ghFetch(token, `/repos/${owner}/${repo}/actions/runs?${params.toString()}`);
}

// Reexecuta um run inteiro do GitHub Actions.
export async function rerunWorkflowRun(token: string, owner: string, repo: string, runId: number) {
  return ghJson(token, "POST", `/repos/${owner}/${repo}/actions/runs/${runId}/rerun`);
}

// Reexecuta apenas os jobs que falharam de um run.
export async function rerunFailedJobs(token: string, owner: string, repo: string, runId: number) {
  return ghJson(token, "POST", `/repos/${owner}/${repo}/actions/runs/${runId}/rerun-failed-jobs`);
}

// Cancela um run em andamento.
export async function cancelWorkflowRun(token: string, owner: string, repo: string, runId: number) {
  return ghJson(token, "POST", `/repos/${owner}/${repo}/actions/runs/${runId}/cancel`);
}

// Deleta um run (limpeza de histórico).
export async function deleteWorkflowRun(token: string, owner: string, repo: string, runId: number) {
  return ghJson(token, "DELETE", `/repos/${owner}/${repo}/actions/runs/${runId}`);
}

// Dispara workflow_dispatch num workflow (por id numérico ou nome do arquivo, ex: deploy.yml).
export async function dispatchWorkflow(
  token: string,
  owner: string,
  repo: string,
  workflowIdOrFile: string | number,
  input: { ref: string; inputs?: Record<string, string> }
) {
  return ghJson(
    token,
    "POST",
    `/repos/${owner}/${repo}/actions/workflows/${encodeURIComponent(String(workflowIdOrFile))}/dispatches`,
    { ref: input.ref, inputs: input.inputs }
  );
}

// Lista workflows do repo (id + nome do arquivo).
export async function listWorkflows(token: string, owner: string, repo: string) {
  return ghFetch(token, `/repos/${owner}/${repo}/actions/workflows?per_page=100`);
}

// Busca de código no repo (GitHub Search API).
export async function searchCode(
  token: string,
  query: string,
  opts: { perPage?: number; page?: number } = {}
) {
  const perPage = opts.perPage ?? 20;
  const page = opts.page ?? 1;
  return ghFetch(
    token,
    `/search/code?q=${encodeURIComponent(query)}&per_page=${perPage}&page=${page}`
  );
}

// Cria ou atualiza um arquivo no repo via Contents API.
// Se o arquivo já existe, busca o SHA atual primeiro (UPDATE).
// Senão, faz CREATE puro.
export async function createOrUpdateFile(
  token: string,
  owner: string,
  repo: string,
  input: {
    path: string;
    content: string; // texto puro (será convertido pra base64)
    message: string;
    branch?: string;
    coAuthor?: string; // ex: "SegredoDev <segredounlock@users.noreply.github.com>"
  }
) {
  // Tenta pegar SHA atual (se arquivo existe)
  let sha: string | undefined;
  try {
    const existing = await ghFetch(
      token,
      `/repos/${owner}/${repo}/contents/${encodeURIComponent(input.path)}${
        input.branch ? `?ref=${encodeURIComponent(input.branch)}` : ""
      }`
    );
    if (existing && typeof existing === "object" && "sha" in existing) {
      sha = (existing as { sha: string }).sha;
    }
  } catch (err) {
    if (!(err instanceof GitHubError) || err.status !== 404) throw err;
    // 404 = arquivo novo, segue sem sha
  }

  const fullMessage = input.coAuthor
    ? `${input.message}\n\nCo-authored-by: ${input.coAuthor}`
    : input.message;

  const body: Record<string, unknown> = {
    message: fullMessage,
    content: Buffer.from(input.content, "utf-8").toString("base64"),
    ...(input.branch ? { branch: input.branch } : {}),
    ...(sha ? { sha } : {}),
  };

  return ghJson(
    token,
    "PUT",
    `/repos/${owner}/${repo}/contents/${encodeURIComponent(input.path)}`,
    body
  );
}
