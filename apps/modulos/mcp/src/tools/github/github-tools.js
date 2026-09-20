import { z } from "zod";
const API = "https://api.github.com";
const ALLOWED_REPOS = new Set(["ServerVpss/CentralDark", "ServerVpss/clone-deck", "segredounlock/clone-deck"]);
const CO_AUTHOR = "SegredoiDev <segredounlock@users.noreply.github.com>";
const MAX_GITHUB_READ_BYTES = 120_000;
const MAX_COMMIT_FILE_BYTES = 500_000;
const MAX_COMMIT_FILES = 25;
const DENY_PATH = /(^|\/)(\.env|secrets?|credenciais|tokens?|sessions?|sessao|sessão|cofre|\.ssh)(\/|$)|\.(pem|key|p12|pfx|sqlite|sqlite3|db|dump|bak|backup)$/i;
function ok(data) {
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}
function effectiveToken(ctx) {
    const token = ctx.token || process.env.GH_TOKEN || process.env.GITHUB_TOKEN || "";
    if (!token)
        throw new Error("Token GitHub ausente. Configure GH_TOKEN/GITHUB_TOKEN ou use OAuth.");
    return token;
}
function pick(owner, repo) {
    const o = owner ?? "ServerVpss";
    const r = repo ?? "CentralDark";
    const slug = `${o}/${r}`;
    if (!ALLOWED_REPOS.has(slug))
        throw new Error(`Repo nao permitido: ${slug}`);
    return { owner: o, repo: r, slug };
}
function safePath(p) {
    const clean = p.replace(/\\/g, "/").replace(/^\/+/, "");
    if (!clean || clean.includes("..") || clean.startsWith("/") || DENY_PATH.test(clean)) {
        throw new Error("Path bloqueado por seguranca.");
    }
    return clean;
}
async function gh(token, apiPath, init = {}) {
    const res = await fetch(`${API}${apiPath}`, {
        ...init,
        headers: {
            Accept: "application/vnd.github+json",
            Authorization: `Bearer ${token}`,
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "MCP-CentralDark/github-tools-v2",
            ...(init.headers ?? {}),
        },
    });
    if (res.status === 204)
        return null;
    const text = await res.text();
    let body = null;
    try {
        body = text ? JSON.parse(text) : null;
    }
    catch {
        body = text.slice(0, 500);
    }
    if (!res.ok) {
        throw new Error(`GitHub ${res.status}: ${apiPath}`);
    }
    return body;
}
async function ghJson(token, method, apiPath, body) {
    return gh(token, apiPath, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
}
function encodePath(p) {
    return encodeURIComponent(p).replace(/%2F/g, "/");
}
async function getBranchHead(token, owner, repo, branch) {
    const ref = (await gh(token, `/repos/${owner}/${repo}/git/ref/heads/${encodeURIComponent(branch)}`));
    const sha = ref.object?.sha;
    if (!sha)
        throw new Error(`Branch sem SHA: ${branch}`);
    return sha;
}
async function ensureBranch(token, owner, repo, branch, createFrom) {
    try {
        return await getBranchHead(token, owner, repo, branch);
    }
    catch (err) {
        if (!createFrom)
            throw err;
        const fromSha = await getBranchHead(token, owner, repo, createFrom);
        await ghJson(token, "POST", `/repos/${owner}/${repo}/git/refs`, {
            ref: `refs/heads/${branch}`,
            sha: fromSha,
        });
        return fromSha;
    }
}
async function getCommitTree(token, owner, repo, sha) {
    const commit = (await gh(token, `/repos/${owner}/${repo}/git/commits/${sha}`));
    const treeSha = commit.tree?.sha;
    if (!treeSha)
        throw new Error("Nao foi possivel obter tree do commit base.");
    return treeSha;
}
export const githubTools = [
    {
        name: "github_read",
        description: "Le arquivo do GitHub via API com limite de bytes. Default: ServerVpss/CentralDark. Nao retorna arquivo sensivel.",
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true, title: "GitHub read" },
        inputSchema: z.object({
            path: z.string().min(1),
            owner: z.string().optional(),
            repo: z.string().optional(),
            ref: z.string().optional(),
            maxBytes: z.number().int().min(1).max(MAX_GITHUB_READ_BYTES).optional(),
        }),
        handler: async (input, ctx) => {
            const token = effectiveToken(ctx);
            const { owner, repo } = pick(input.owner, input.repo);
            const filePath = safePath(input.path);
            const q = input.ref ? `?ref=${encodeURIComponent(input.ref)}` : "";
            const out = (await gh(token, `/repos/${owner}/${repo}/contents/${encodePath(filePath)}${q}`));
            if (!out.content || out.encoding !== "base64") {
                return ok({ status: "NAO_E_ARQUIVO_TEXTO", owner, repo, path: filePath, meta: out });
            }
            const maxBytes = input.maxBytes ?? 60_000;
            const decoded = Buffer.from(out.content, "base64").toString("utf8");
            const truncated = Buffer.byteLength(decoded, "utf8") > maxBytes;
            return ok({
                status: "OK",
                owner,
                repo,
                path: filePath,
                ref: input.ref ?? null,
                sizeBytes: out.size ?? Buffer.byteLength(decoded, "utf8"),
                sha: out.sha,
                html_url: out.html_url,
                truncated,
                warning: truncated ? "Arquivo truncado por seguranca." : null,
                content: decoded.slice(0, maxBytes),
            });
        },
    },
    {
        name: "github_commit",
        description: "Cria um commit GitHub multi-arquivo e atualiza a branch. Bloqueia secrets e paths sensiveis. Default: ServerVpss/CentralDark.",
        annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true, title: "GitHub commit" },
        inputSchema: z.object({
            message: z.string().min(1),
            branch: z.string().min(1).optional(),
            createBranchFrom: z.string().optional(),
            owner: z.string().optional(),
            repo: z.string().optional(),
            files: z
                .array(z.object({
                path: z.string().min(1),
                content: z.string().max(MAX_COMMIT_FILE_BYTES),
            }))
                .min(1)
                .max(MAX_COMMIT_FILES),
        }),
        handler: async (input, ctx) => {
            const token = effectiveToken(ctx);
            const { owner, repo } = pick(input.owner, input.repo);
            const branch = input.branch ?? "main";
            const safeFiles = input.files.map((file) => ({
                path: safePath(file.path),
                content: file.content,
            }));
            const headSha = await ensureBranch(token, owner, repo, branch, input.createBranchFrom);
            const baseTreeSha = await getCommitTree(token, owner, repo, headSha);
            const tree = await Promise.all(safeFiles.map(async (file) => {
                const blob = (await ghJson(token, "POST", `/repos/${owner}/${repo}/git/blobs`, {
                    content: file.content,
                    encoding: "utf-8",
                }));
                if (!blob.sha)
                    throw new Error(`Falha ao criar blob: ${file.path}`);
                return {
                    path: file.path,
                    mode: "100644",
                    type: "blob",
                    sha: blob.sha,
                };
            }));
            const newTree = (await ghJson(token, "POST", `/repos/${owner}/${repo}/git/trees`, {
                base_tree: baseTreeSha,
                tree,
            }));
            if (!newTree.sha)
                throw new Error("Falha ao criar tree Git.");
            const commit = (await ghJson(token, "POST", `/repos/${owner}/${repo}/git/commits`, {
                message: `${input.message}\n\nCo-authored-by: ${CO_AUTHOR}`,
                tree: newTree.sha,
                parents: [headSha],
            }));
            if (!commit.sha)
                throw new Error("Falha ao criar commit Git.");
            await ghJson(token, "PATCH", `/repos/${owner}/${repo}/git/refs/heads/${encodeURIComponent(branch)}`, {
                sha: commit.sha,
                force: false,
            });
            return ok({
                status: "COMMIT_PUBLICADO",
                owner,
                repo,
                branch,
                files: safeFiles.map((file) => file.path),
                commit_sha: commit.sha,
                commit_url: commit.html_url ?? `https://github.com/${owner}/${repo}/commit/${commit.sha}`,
            });
        },
    },
    {
        name: "github_dispatch",
        description: "Dispara workflow_dispatch no GitHub Actions. Use para vps-ssh-exec.yml, deploys e automacoes com inputs.",
        annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true, title: "GitHub dispatch" },
        inputSchema: z.object({
            workflow: z.string().min(1),
            ref: z.string().optional(),
            owner: z.string().optional(),
            repo: z.string().optional(),
            inputs: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
        }),
        handler: async (input, ctx) => {
            const token = effectiveToken(ctx);
            const { owner, repo } = pick(input.owner, input.repo);
            const inputs = input.inputs
                ? Object.fromEntries(Object.entries(input.inputs).map(([key, value]) => [key, String(value)]))
                : undefined;
            await ghJson(token, "POST", `/repos/${owner}/${repo}/actions/workflows/${encodeURIComponent(input.workflow)}/dispatches`, {
                ref: input.ref ?? "main",
                inputs,
            });
            return ok({
                status: "WORKFLOW_DISPATCHED",
                owner,
                repo,
                workflow: input.workflow,
                ref: input.ref ?? "main",
                inputs: inputs ? Object.keys(inputs) : [],
            });
        },
    },
];
//# sourceMappingURL=github-tools.js.map