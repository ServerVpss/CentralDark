// Cliente mínimo da API do GitHub. Usa fetch nativo do Node 20+.
import { log } from "../../log.js";
const GITHUB_API = "https://api.github.com";
export class GitHubError extends Error {
    status;
    body;
    constructor(status, message, body) {
        super(message);
        this.status = status;
        this.body = body;
        this.name = "GitHubError";
    }
}
async function ghFetch(token, path, init) {
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
    if (res.status === 204)
        return null;
    return res.json();
}
async function ghJson(token, method, path, body) {
    return ghFetch(token, path, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });
}
export async function getViewer(token) {
    return ghFetch(token, "/user");
}
// Checa o token: tipo, scopes (classic), permissões no repo, rate limit e se dá pra Actions write.
export async function checkToken(token, owner, repo) {
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
    let user = {};
    try {
        user = (await res.json());
    }
    catch { /* ignora */ }
    let tokenType = "unknown";
    if (token.startsWith("ghp_"))
        tokenType = "classic-pat";
    else if (token.startsWith("github_pat_"))
        tokenType = "fine-grained-pat";
    else if (token.startsWith("gho_"))
        tokenType = "oauth-app";
    else if (token.startsWith("ghs_") || token.startsWith("ghu_"))
        tokenType = "github-app";
    let repoPermissions;
    let actionsWriteHint = "unknown";
    if (owner && repo) {
        try {
            const r = (await ghFetch(token, `/repos/${owner}/${repo}`));
            repoPermissions = r.permissions;
            const hasWorkflowScope = scopes.includes("workflow") || scopes.includes("repo");
            const canPush = !!(repoPermissions?.push || repoPermissions?.maintain || repoPermissions?.admin);
            if (tokenType === "classic-pat")
                actionsWriteHint = hasWorkflowScope && canPush ? "yes" : "no";
            else
                actionsWriteHint = canPush ? "yes" : "no";
        }
        catch {
            actionsWriteHint = "unknown";
        }
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
        advice: actionsWriteHint === "no"
            ? tokenType === "classic-pat"
                ? "PAT classic SEM scope 'workflow'. Regenere em github.com/settings/tokens marcando 'workflow' (e 'repo')."
                : "Token SEM permissão de escrita no repo. Em fine-grained: marque 'Actions: Read and write' e 'Contents: Read and write' pro repo alvo."
            : actionsWriteHint === "yes"
                ? "Token aparenta ter permissão pra reexecutar/disparar workflows."
                : "Passa owner+repo pra checar permissões do repo.",
    };
}
export async function listRepos(token, opts = {}) {
    const perPage = opts.perPage ?? 30;
    const page = opts.page ?? 1;
    return ghFetch(token, `/user/repos?per_page=${perPage}&page=${page}&sort=updated`);
}
export async function getRepo(token, owner, repo) {
    return ghFetch(token, `/repos/${owner}/${repo}`);
}
export async function listIssues(token, owner, repo, opts = {}) {
    const state = opts.state ?? "open";
    const perPage = opts.perPage ?? 30;
    const page = opts.page ?? 1;
    return ghFetch(token, `/repos/${owner}/${repo}/issues?state=${state}&per_page=${perPage}&page=${page}`);
}
export async function listPullRequests(token, owner, repo, opts = {}) {
    const state = opts.state ?? "open";
    const perPage = opts.perPage ?? 30;
    const page = opts.page ?? 1;
    return ghFetch(token, `/repos/${owner}/${repo}/pulls?state=${state}&per_page=${perPage}&page=${page}`);
}
export async function getFileContent(token, owner, repo, path, ref) {
    const q = ref ? `?ref=${encodeURIComponent(ref)}` : "";
    const data = await ghFetch(token, `/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}${q}`);
    if (data && typeof data === "object" && "content" in data && typeof data.content === "string") {
        const decoded = Buffer.from(data.content, "base64").toString("utf-8");
        return { ...data, decoded };
    }
    return data;
}
// ---------- Escrita ----------
export async function createIssue(token, owner, repo, input) {
    return ghJson(token, "POST", `/repos/${owner}/${repo}/issues`, input);
}
export async function getIssue(token, owner, repo, issueNumber) {
    return ghFetch(token, `/repos/${owner}/${repo}/issues/${issueNumber}`);
}
export async function commentIssue(token, owner, repo, issueNumber, body) {
    return ghJson(token, "POST", `/repos/${owner}/${repo}/issues/${issueNumber}/comments`, { body });
}
export async function closeIssue(token, owner, repo, issueNumber, input = {}) {
    if (input.body && input.body.trim()) {
        await commentIssue(token, owner, repo, issueNumber, input.body);
    }
    return ghJson(token, "PATCH", `/repos/${owner}/${repo}/issues/${issueNumber}`, {
        state: "closed",
        state_reason: input.stateReason ?? "completed",
    });
}
export async function createPullRequest(token, owner, repo, input) {
    return ghJson(token, "POST", `/repos/${owner}/${repo}/pulls`, input);
}
export async function mergePullRequest(token, owner, repo, pullNumber, input = {}) {
    return ghJson(token, "PUT", `/repos/${owner}/${repo}/pulls/${pullNumber}/merge`, input);
}
// Pega o SHA de uma branch.
export async function getBranchSha(token, owner, repo, branch) {
    const data = await ghFetch(token, `/repos/${owner}/${repo}/git/ref/heads/${encodeURIComponent(branch)}`);
    return data.object.sha;
}
// Cria uma branch nova a partir de outra (default: main).
export async function createBranch(token, owner, repo, input) {
    const fromSha = await getBranchSha(token, owner, repo, input.fromBranch ?? "main");
    return ghJson(token, "POST", `/repos/${owner}/${repo}/git/refs`, {
        ref: `refs/heads/${input.newBranch}`,
        sha: fromSha,
    });
}
// Últimos N commits de uma branch.
export async function listCommits(token, owner, repo, opts = {}) {
    const sha = opts.branch ?? "main";
    const perPage = opts.perPage ?? 20;
    const page = opts.page ?? 1;
    const path = opts.path ? `&path=${encodeURIComponent(opts.path)}` : "";
    return ghFetch(token, `/repos/${owner}/${repo}/commits?sha=${encodeURIComponent(sha)}&per_page=${perPage}&page=${page}${path}`);
}
// Lista os últimos runs do GitHub Actions.
export async function listWorkflowRuns(token, owner, repo, opts = {}) {
    const perPage = opts.perPage ?? 10;
    const params = new URLSearchParams();
    params.set("per_page", String(perPage));
    if (opts.branch)
        params.set("branch", opts.branch);
    if (opts.status)
        params.set("status", opts.status);
    return ghFetch(token, `/repos/${owner}/${repo}/actions/runs?${params.toString()}`);
}
// Reexecuta um run inteiro do GitHub Actions.
export async function rerunWorkflowRun(token, owner, repo, runId) {
    return ghJson(token, "POST", `/repos/${owner}/${repo}/actions/runs/${runId}/rerun`);
}
// Reexecuta apenas os jobs que falharam de um run.
export async function rerunFailedJobs(token, owner, repo, runId) {
    return ghJson(token, "POST", `/repos/${owner}/${repo}/actions/runs/${runId}/rerun-failed-jobs`);
}
// Cancela um run em andamento.
export async function cancelWorkflowRun(token, owner, repo, runId) {
    return ghJson(token, "POST", `/repos/${owner}/${repo}/actions/runs/${runId}/cancel`);
}
// Deleta um run (limpeza de histórico).
export async function deleteWorkflowRun(token, owner, repo, runId) {
    return ghJson(token, "DELETE", `/repos/${owner}/${repo}/actions/runs/${runId}`);
}
// Dispara workflow_dispatch num workflow (por id numérico ou nome do arquivo, ex: deploy.yml).
export async function dispatchWorkflow(token, owner, repo, workflowIdOrFile, input) {
    return ghJson(token, "POST", `/repos/${owner}/${repo}/actions/workflows/${encodeURIComponent(String(workflowIdOrFile))}/dispatches`, { ref: input.ref, inputs: input.inputs });
}
// Lista workflows do repo (id + nome do arquivo).
export async function listWorkflows(token, owner, repo) {
    return ghFetch(token, `/repos/${owner}/${repo}/actions/workflows?per_page=100`);
}
// Busca de código no repo (GitHub Search API).
export async function searchCode(token, query, opts = {}) {
    const perPage = opts.perPage ?? 20;
    const page = opts.page ?? 1;
    return ghFetch(token, `/search/code?q=${encodeURIComponent(query)}&per_page=${perPage}&page=${page}`);
}
// Cria ou atualiza um arquivo no repo via Contents API.
// Se o arquivo já existe, busca o SHA atual primeiro (UPDATE).
// Senão, faz CREATE puro.
export async function createOrUpdateFile(token, owner, repo, input) {
    // Tenta pegar SHA atual (se arquivo existe)
    let sha;
    try {
        const existing = await ghFetch(token, `/repos/${owner}/${repo}/contents/${encodeURIComponent(input.path)}${input.branch ? `?ref=${encodeURIComponent(input.branch)}` : ""}`);
        if (existing && typeof existing === "object" && "sha" in existing) {
            sha = existing.sha;
        }
    }
    catch (err) {
        if (!(err instanceof GitHubError) || err.status !== 404)
            throw err;
        // 404 = arquivo novo, segue sem sha
    }
    const fullMessage = input.coAuthor
        ? `${input.message}\n\nCo-authored-by: ${input.coAuthor}`
        : input.message;
    const body = {
        message: fullMessage,
        content: Buffer.from(input.content, "utf-8").toString("base64"),
        ...(input.branch ? { branch: input.branch } : {}),
        ...(sha ? { sha } : {}),
    };
    return ghJson(token, "PUT", `/repos/${owner}/${repo}/contents/${encodeURIComponent(input.path)}`, body);
}
//# sourceMappingURL=github.js.map