import { z } from "zod";
const API = "https://api.github.com";
const ALLOWED = new Set(["ServerVpss/CentralDark", "ServerVpss/clone-deck", "segredounlock/clone-deck"]);
const CONFIRM_DELETE = "CONFIRMO DELETAR";
const CONFIRM_RELEASE = "CONFIRMO RELEASE";
const DENY = /(^|\/)(\.env|secrets?|credenciais|tokens?|sessions?|sessao|sessão|\.ssh)(\/|$)|\.(pem|key|p12|pfx)$/i;
function ok(data) {
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}
function pick(owner, repo) {
    const o = owner ?? "ServerVpss";
    const r = repo ?? "CentralDark";
    if (!ALLOWED.has(`${o}/${r}`))
        throw new Error(`Repo não permitido: ${o}/${r}`);
    return { owner: o, repo: r };
}
function safePath(p) {
    const clean = p.replace(/\\/g, "/");
    if (clean.startsWith("/") || clean.includes("..") || DENY.test(clean))
        throw new Error("Path bloqueado por segurança.");
    return clean;
}
async function gh(token, path, init = {}) {
    const res = await fetch(`${API}${path}`, {
        ...init,
        headers: {
            Accept: "application/vnd.github+json",
            Authorization: `Bearer ${token}`,
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "MCP-CentralDark/admin",
            ...(init.headers ?? {}),
        },
    });
    if (res.status === 204)
        return null;
    const txt = await res.text();
    let body = null;
    try {
        body = txt ? JSON.parse(txt) : null;
    }
    catch {
        body = txt.slice(0, 400);
    }
    if (!res.ok)
        throw new Error(`GitHub ${res.status}: ${path}`);
    return body;
}
async function fileSha(token, owner, repo, p, ref) {
    try {
        const out = await gh(token, `/repos/${owner}/${repo}/contents/${encodeURIComponent(p).replace(/%2F/g, "/")}?ref=${encodeURIComponent(ref)}`);
        return out.sha;
    }
    catch {
        return undefined;
    }
}
const repoSchema = {
    owner: z.string().optional(),
    repo: z.string().optional(),
};
export const githubAdminTools = [
    {
        name: "github_upload_base64_file",
        description: "Cria ou atualiza arquivo binário/texto pequeno via Contents API recebendo base64. Serve para PNG/SVG/assets. Bloqueia paths sensíveis.",
        annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false, title: "Upload base64" },
        inputSchema: z.object({
            ...repoSchema,
            path: z.string().min(1),
            base64: z.string().min(1),
            message: z.string().min(1),
            branch: z.string().optional(),
        }),
        handler: async (input, ctx) => {
            const { owner, repo } = pick(input.owner, input.repo);
            const p = safePath(input.path);
            const branch = input.branch ?? "main";
            const content = input.base64.replace(/^data:[^,]+,/, "").replace(/\s+/g, "");
            if (Buffer.byteLength(content, "utf8") > 8 * 1024 * 1024)
                throw new Error("Arquivo grande demais para esta tool.");
            const sha = await fileSha(ctx.token, owner, repo, p, branch);
            const body = {
                message: `${input.message}\n\nCo-authored-by: SegredoiDev <hakimalektheg@gmail.com>`,
                content,
                branch,
            };
            if (sha)
                body.sha = sha;
            const out = await gh(ctx.token, `/repos/${owner}/${repo}/contents/${encodeURIComponent(p).replace(/%2F/g, "/")}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            return ok({
                status: sha ? "ATUALIZADO" : "CRIADO",
                owner,
                repo,
                path: p,
                branch,
                commit_sha: out.commit?.sha,
                commit_url: out.commit?.html_url,
                file_sha: out.content?.sha,
                html_url: out.content?.html_url,
            });
        },
    },
    {
        name: "github_delete_file_safe",
        description: "Deleta arquivo do repo com confirmação literal. Bloqueia secrets, sessões, WhatsApp/WuzAPI e backups.",
        annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false, title: "Deletar arquivo seguro" },
        inputSchema: z.object({
            ...repoSchema,
            path: z.string().min(1),
            branch: z.string().optional(),
            message: z.string().optional(),
            confirm: z.string().optional(),
        }),
        handler: async (input, ctx) => {
            const { owner, repo } = pick(input.owner, input.repo);
            const p = safePath(input.path);
            const branch = input.branch ?? "main";
            const sha = await fileSha(ctx.token, owner, repo, p, branch);
            if (!sha)
                return ok({ status: "NAO_ENCONTRADO", owner, repo, path: p, branch });
            if (input.confirm !== CONFIRM_DELETE)
                return ok({ status: "DRY_RUN", owner, repo, path: p, branch, requiredConfirm: CONFIRM_DELETE });
            const out = await gh(ctx.token, `/repos/${owner}/${repo}/contents/${encodeURIComponent(p).replace(/%2F/g, "/")}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: `${input.message ?? `chore: remover ${p}`}\n\nCo-authored-by: SegredoiDev <hakimalektheg@gmail.com>`,
                    sha,
                    branch,
                }),
            });
            return ok({ status: "DELETADO", owner, repo, path: p, branch, commit_sha: out.commit?.sha, commit_url: out.commit?.html_url });
        },
    },
    {
        name: "github_delete_branch_safe",
        description: "Deleta branch não principal com confirmação literal.",
        annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false, title: "Deletar branch" },
        inputSchema: z.object({
            ...repoSchema,
            branch: z.string().min(1),
            confirm: z.string().optional(),
        }),
        handler: async (input, ctx) => {
            const { owner, repo } = pick(input.owner, input.repo);
            if (["main", "master", "prod", "production"].includes(input.branch))
                throw new Error("Branch principal bloqueada.");
            if (input.confirm !== CONFIRM_DELETE)
                return ok({ status: "DRY_RUN", owner, repo, branch: input.branch, requiredConfirm: CONFIRM_DELETE });
            await gh(ctx.token, `/repos/${owner}/${repo}/git/refs/heads/${encodeURIComponent(input.branch)}`, { method: "DELETE" });
            return ok({ status: "BRANCH_DELETADA", owner, repo, branch: input.branch });
        },
    },
    {
        name: "github_create_release_safe",
        description: "Cria release GitHub com confirmação literal.",
        annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false, title: "Criar release" },
        inputSchema: z.object({
            ...repoSchema,
            tag_name: z.string().min(1),
            name: z.string().optional(),
            body: z.string().optional(),
            target_commitish: z.string().optional(),
            draft: z.boolean().optional(),
            prerelease: z.boolean().optional(),
            confirm: z.string().optional(),
        }),
        handler: async (input, ctx) => {
            const { owner, repo } = pick(input.owner, input.repo);
            if (input.confirm !== CONFIRM_RELEASE)
                return ok({ status: "DRY_RUN", owner, repo, tag_name: input.tag_name, requiredConfirm: CONFIRM_RELEASE });
            const out = await gh(ctx.token, `/repos/${owner}/${repo}/releases`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(input),
            });
            return ok({ status: "RELEASE_CRIADA", owner, repo, id: out.id, html_url: out.html_url });
        },
    },
    {
        name: "github_list_webhooks",
        description: "Lista webhooks sem expor segredo.",
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false, title: "Listar webhooks" },
        inputSchema: z.object(repoSchema),
        handler: async (input, ctx) => {
            const { owner, repo } = pick(input.owner, input.repo);
            const hooks = await gh(ctx.token, `/repos/${owner}/${repo}/hooks`);
            return ok({
                owner,
                repo,
                hooks: hooks.map((h) => ({
                    id: h.id,
                    name: h.name,
                    active: h.active,
                    events: h.events,
                    url: h.config?.url,
                    content_type: h.config?.content_type,
                })),
            });
        },
    },
    {
        name: "github_test_webhook",
        description: "Envia ping para webhook pelo ID.",
        annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true, title: "Testar webhook" },
        inputSchema: z.object({
            ...repoSchema,
            hookId: z.number().int().positive(),
        }),
        handler: async (input, ctx) => {
            const { owner, repo } = pick(input.owner, input.repo);
            await gh(ctx.token, `/repos/${owner}/${repo}/hooks/${input.hookId}/pings`, { method: "POST" });
            return ok({ status: "PING_ENVIADO", owner, repo, hookId: input.hookId });
        },
    },
    {
        name: "github_list_secrets_names",
        description: "Lista somente nomes/metadados de Actions secrets. Nunca retorna valores.",
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false, title: "Nomes de secrets" },
        inputSchema: z.object(repoSchema),
        handler: async (input, ctx) => {
            const { owner, repo } = pick(input.owner, input.repo);
            const out = await gh(ctx.token, `/repos/${owner}/${repo}/actions/secrets`);
            return ok({
                owner,
                repo,
                total_count: out.total_count,
                secrets: out.secrets?.map((s) => ({ name: s.name, updated_at: s.updated_at })),
            });
        },
    },
    {
        name: "github_list_repo_variables",
        description: "Lista GitHub Actions variables.",
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false, title: "Listar variables" },
        inputSchema: z.object(repoSchema),
        handler: async (input, ctx) => {
            const { owner, repo } = pick(input.owner, input.repo);
            const out = await gh(ctx.token, `/repos/${owner}/${repo}/actions/variables`);
            return ok({ owner, repo, variables: out });
        },
    },
    {
        name: "github_set_repo_variable",
        description: "Cria/atualiza Actions variable. Não usar para segredo.",
        annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false, title: "Set variable" },
        inputSchema: z.object({
            ...repoSchema,
            name: z.string().regex(/^[A-Z0-9_]+$/),
            value: z.string(),
        }),
        handler: async (input, ctx) => {
            const { owner, repo } = pick(input.owner, input.repo);
            let exists = true;
            try {
                await gh(ctx.token, `/repos/${owner}/${repo}/actions/variables/${input.name}`);
            }
            catch {
                exists = false;
            }
            await gh(ctx.token, exists ? `/repos/${owner}/${repo}/actions/variables/${input.name}` : `/repos/${owner}/${repo}/actions/variables`, {
                method: exists ? "PATCH" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: input.name, value: input.value }),
            });
            return ok({ status: exists ? "ATUALIZADA" : "CRIADA", owner, repo, name: input.name, value: "***OCULTO_NO_CHAT***" });
        },
    },
    {
        name: "github_list_environments",
        description: "Lista environments do repo.",
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false, title: "Listar environments" },
        inputSchema: z.object(repoSchema),
        handler: async (input, ctx) => {
            const { owner, repo } = pick(input.owner, input.repo);
            const out = await gh(ctx.token, `/repos/${owner}/${repo}/environments`);
            return ok({ owner, repo, environments: out });
        },
    },
    {
        name: "github_get_actions_permissions",
        description: "Mostra permissões de GitHub Actions do repo.",
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false, title: "Actions permissions" },
        inputSchema: z.object(repoSchema),
        handler: async (input, ctx) => {
            const { owner, repo } = pick(input.owner, input.repo);
            const out = await gh(ctx.token, `/repos/${owner}/${repo}/actions/permissions`);
            return ok({ owner, repo, permissions: out });
        },
    },
];
//# sourceMappingURL=github-admin.js.map