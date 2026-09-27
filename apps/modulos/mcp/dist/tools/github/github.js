// Cliente mínimo da API do GitHub. Usa fetch nativo do Node 20+.
import { log } from "../../log.js";
const GITHUB_API = "https://api.github.com";
const LABEL_ALIASES = new Map([
    ["assign:chatgpt", ["🧠 AGENTE-CHATGPT"]],
    ["assign:claude", ["🧠 AGENTE-CLAUDE"]],
    ["assign:codex", ["🧠 AGENTE-CODEX"]],
    ["assign:grok", ["🧠 AGENTE-GROK"]],
    ["assign:supabase-bot", ["🧠 AGENTE-SUPABASE"]],
    ["assign:lovable", ["🎨 FRONTEND"]],
    ["auto", ["🤖 AUTO"]],
    ["bug", ["🐞 BUG"]],
    ["p0", ["🔴 PRIORIDADE-ALTA"]],
    ["p1", ["🔴 PRIORIDADE-ALTA"]],
    ["p2", ["🟡 PRIORIDADE-MÉDIA"]],
    ["p3", ["🟢 PRIORIDADE-BAIXA"]],
    ["severidade:p0", ["🔴 PRIORIDADE-ALTA"]],
    ["severidade:p1", ["🔴 PRIORIDADE-ALTA"]],
    ["severidade:p2", ["🟡 PRIORIDADE-MÉDIA"]],
    ["severidade:p3", ["🟢 PRIORIDADE-BAIXA"]],
    ["sentinela", ["🛡️ SENTINELA"]],
    ["vigia", ["🛡️ SENTINELA"]],
    ["revisao-humana", ["🆘 AJUDA-NECESSÁRIA"]],
    ["needs-codex-review", ["🟡 IA-PRECISA-REVISAR", "🧠 AGENTE-CODEX"]],
    ["permito-segredo", ["👑 PERMITO-SEGREDO"]],
    ["👑 permito-segredo", ["👑 PERMITO-SEGREDO"]],
    ["permito-pivete", []],
    ["stale", ["🧊 PARADO"]],
    ["superseded", ["SUPERSEDED"]],
]);
function foldLabelName(value) {
    return String(value?.name || value || "")
        .trim()
        .toLocaleLowerCase("pt-BR");
}
export function canonicalLabels(labels = []) {
    const out = [];
    for (const raw of labels || []) {
        const name = String(raw?.name || raw || "").trim();
        if (!name)
            continue;
        const mapped = LABEL_ALIASES.get(foldLabelName(name));
        if (mapped)
            out.push(...mapped);
        else if (/^assign:/i.test(name))
            continue;
        else
            out.push(name);
    }
    return [...new Set(out)];
}
export function normalizeRepoRef(owner, repo) {
    const clean = (value) => String(value ?? "").trim().replace(/^\/+|\/+$/g, "");
    const explicitOwner = clean(owner);
    const repoInput = clean(repo);
    if (!repoInput)
        throw new Error("GitHub repo ausente");
    const parts = repoInput.split("/").filter(Boolean);
    if (parts.length > 2)
        throw new Error(`GitHub repo inválido: ${repoInput}`);
    let resolvedOwner = explicitOwner;
    let resolvedRepo = parts[0];
    if (parts.length === 2) {
        const [embeddedOwner, embeddedRepo] = parts;
        if (resolvedOwner && resolvedOwner.toLocaleLowerCase("en-US") !== embeddedOwner.toLocaleLowerCase("en-US")) {
            throw new Error(`GitHub owner/repo conflitantes: owner=${resolvedOwner} repo=${repoInput}`);
        }
        resolvedOwner = embeddedOwner;
        resolvedRepo = embeddedRepo;
    }
    if (!resolvedOwner)
        throw new Error("GitHub owner ausente");
    if (!resolvedRepo)
        throw new Error("GitHub repo ausente");
    return {
        owner: resolvedOwner,
        repo: resolvedRepo,
        fullName: `${resolvedOwner}/${resolvedRepo}`,
    };
}
function repoBase(owner, repo) {
    const normalized = normalizeRepoRef(owner, repo);
    return `/repos/${encodeURIComponent(normalized.owner)}/${encodeURIComponent(normalized.repo)}`;
}
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
            const r = (await ghFetch(token, `${repoBase(owner, repo)}`));
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
    return ghFetch(token, `${repoBase(owner, repo)}`);
}
export async function listIssues(token, owner, repo, opts = {}) {
    const state = opts.state ?? "open";
    const perPage = opts.perPage ?? 30;
    const page = opts.page ?? 1;
    return ghFetch(token, `${repoBase(owner, repo)}/issues?state=${state}&per_page=${perPage}&page=${page}`);
}
export async function listPullRequests(token, owner, repo, opts = {}) {
    const state = opts.state ?? "open";
    const perPage = opts.perPage ?? 30;
    const page = opts.page ?? 1;
    return ghFetch(token, `${repoBase(owner, repo)}/pulls?state=${state}&per_page=${perPage}&page=${page}`);
}
export async function getFileContent(token, owner, repo, path, ref) {
    const q = ref ? `?ref=${encodeURIComponent(ref)}` : "";
    const data = await ghFetch(token, `${repoBase(owner, repo)}/contents/${encodeURIComponent(path)}${q}`);
    if (data && typeof data === "object" && "content" in data && typeof data.content === "string") {
        const decoded = Buffer.from(data.content, "base64").toString("utf-8");
        return { ...data, decoded };
    }
    return data;
}
// ---------- Escrita ----------
export async function createIssue(token, owner, repo, input) {
    const labels = canonicalLabels(input.labels || []);
    return ghJson(token, "POST", `${repoBase(owner, repo)}/issues`, {
        ...input,
        ...(input.labels ? { labels } : {}),
    });
}
export async function getIssue(token, owner, repo, issueNumber) {
    return ghFetch(token, `${repoBase(owner, repo)}/issues/${issueNumber}`);
}
export async function commentIssue(token, owner, repo, issueNumber, body) {
    return ghJson(token, "POST", `${repoBase(owner, repo)}/issues/${issueNumber}/comments`, { body });
}
export async function closeIssue(token, owner, repo, issueNumber, input = {}) {
    if (input.body && input.body.trim()) {
        await commentIssue(token, owner, repo, issueNumber, input.body);
    }
    return ghJson(token, "PATCH", `${repoBase(owner, repo)}/issues/${issueNumber}`, {
        state: "closed",
        state_reason: input.stateReason ?? "completed",
    });
}
export async function createPullRequest(token, owner, repo, input) {
    return ghJson(token, "POST", `${repoBase(owner, repo)}/pulls`, input);
}
export async function mergePullRequest(token, owner, repo, pullNumber, input = {}) {
    return ghJson(token, "PUT", `${repoBase(owner, repo)}/pulls/${pullNumber}/merge`, input);
}
// Pega o SHA de uma branch.
export async function getBranchSha(token, owner, repo, branch) {
    const data = await ghFetch(token, `${repoBase(owner, repo)}/git/ref/heads/${encodeURIComponent(branch)}`);
    return data.object.sha;
}
// Cria uma branch nova a partir de outra (default: main).
export async function createBranch(token, owner, repo, input) {
    const fromSha = await getBranchSha(token, owner, repo, input.fromBranch ?? "main");
    return ghJson(token, "POST", `${repoBase(owner, repo)}/git/refs`, {
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
    return ghFetch(token, `${repoBase(owner, repo)}/commits?sha=${encodeURIComponent(sha)}&per_page=${perPage}&page=${page}${path}`);
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
    return ghFetch(token, `${repoBase(owner, repo)}/actions/runs?${params.toString()}`);
}
// Reexecuta um run inteiro do GitHub Actions.
export async function rerunWorkflowRun(token, owner, repo, runId) {
    return ghJson(token, "POST", `${repoBase(owner, repo)}/actions/runs/${runId}/rerun`);
}
// Reexecuta apenas os jobs que falharam de um run.
export async function rerunFailedJobs(token, owner, repo, runId) {
    return ghJson(token, "POST", `${repoBase(owner, repo)}/actions/runs/${runId}/rerun-failed-jobs`);
}
// Cancela um run em andamento.
export async function cancelWorkflowRun(token, owner, repo, runId) {
    return ghJson(token, "POST", `${repoBase(owner, repo)}/actions/runs/${runId}/cancel`);
}
// Deleta um run (limpeza de histórico).
export async function deleteWorkflowRun(token, owner, repo, runId) {
    return ghJson(token, "DELETE", `${repoBase(owner, repo)}/actions/runs/${runId}`);
}
// Dispara workflow_dispatch num workflow (por id numérico ou nome do arquivo, ex: deploy.yml).
export async function dispatchWorkflow(token, owner, repo, workflowIdOrFile, input) {
    return ghJson(token, "POST", `${repoBase(owner, repo)}/actions/workflows/${encodeURIComponent(String(workflowIdOrFile))}/dispatches`, { ref: input.ref, inputs: input.inputs });
}
// Lista workflows do repo (id + nome do arquivo).
export async function listWorkflows(token, owner, repo) {
    return ghFetch(token, `${repoBase(owner, repo)}/actions/workflows?per_page=100`);
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
        const existing = await ghFetch(token, `${repoBase(owner, repo)}/contents/${encodeURIComponent(input.path)}${input.branch ? `?ref=${encodeURIComponent(input.branch)}` : ""}`);
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
    return ghJson(token, "PUT", `${repoBase(owner, repo)}/contents/${encodeURIComponent(input.path)}`, body);
}
//# sourceMappingURL=github.js.map
//# sourceMappingURL=github.js.map