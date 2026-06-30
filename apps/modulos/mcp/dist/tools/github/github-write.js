// Tools MCP de escrita no GitHub.
// readOnlyHint=false. As que mexem definitivo (merge) ficam destructiveHint=true.
import { z } from "zod";
import { config } from "../../config.js";
import * as gh from "./github.js";
function ok(data) {
    return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
}
// Annotations padrão pra escrita não-destrutiva (cria coisa nova).
const WRITE_ANNOT = {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
};
// Annotations pra ações destrutivas (merge — modifica o estado da main).
const DESTRUCTIVE_ANNOT = {
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: false,
    openWorldHint: true,
};
export const githubWriteTools = [
    {
        name: "github_create_issue",
        description: "Cria uma nova issue no repositório. Não é destrutivo (só cria).",
        annotations: { ...WRITE_ANNOT, title: "Criar issue" },
        inputSchema: z.object({
            title: z.string().min(1),
            body: z.string().optional(),
            labels: z.array(z.string()).optional(),
            assignees: z.array(z.string()).optional(),
            owner: z.string().optional(),
            repo: z.string().optional(),
        }),
        handler: async (input, ctx) => ok(await gh.createIssue(ctx.token, input.owner ?? config.github.owner, input.repo ?? config.github.repo, { title: input.title, body: input.body, labels: input.labels, assignees: input.assignees })),
    },
    {
        name: "github_comment_issue",
        description: "Adiciona um comentário a uma issue ou pull request existente. Não é destrutivo.",
        annotations: { ...WRITE_ANNOT, title: "Comentar issue/PR" },
        inputSchema: z.object({
            issueNumber: z.number().int().positive(),
            body: z.string().min(1),
            owner: z.string().optional(),
            repo: z.string().optional(),
        }),
        handler: async (input, ctx) => ok(await gh.commentIssue(ctx.token, input.owner ?? config.github.owner, input.repo ?? config.github.repo, input.issueNumber, input.body)),
    },
    {
        name: "github_close_issue",
        description: "Fecha uma issue existente no repositório oficial com comentário final opcional. Valida repo alvo, existência da issue e bloqueia PRs. Não lê nem expõe segredo.",
        annotations: { ...WRITE_ANNOT, title: "Fechar issue" },
        inputSchema: z.object({
            issueNumber: z.number().int().positive(),
            body: z.string().optional().describe("Comentário final opcional, sem segredo real."),
            stateReason: z.enum(["completed", "not_planned"]).optional(),
            owner: z.string().optional(),
            repo: z.string().optional(),
        }),
        handler: async (input, ctx) => {
            const owner = input.owner ?? "ServerVpss";
            const repo = input.repo ?? "CentralDark";
            const slug = `${owner}/${repo}`;
            if (slug !== "ServerVpss/CentralDark") {
                throw new Error(`Repo não permitido para fechar issue: ${slug}. Use ServerVpss/CentralDark.`);
            }
            if (input.body &&
                /-----BEGIN (?:RSA |OPENSSH |EC |DSA )?PRIVATE KEY-----|\b(?:token|password|passwd|secret|cookie|session|connection_string|database_url|api_key|apikey)\b\s*[:=]\s*['\"]?[^'\"\s<>`]{8,}/i.test(input.body)) {
                throw new Error("Comentário final bloqueado: parece conter segredo real.");
            }
            const issue = (await gh.getIssue(ctx.token, owner, repo, input.issueNumber));
            if (issue.pull_request) {
                throw new Error(`#${input.issueNumber} é Pull Request, não issue. Use fluxo de PR.`);
            }
            if (issue.state === "closed") {
                return ok({
                    ok: true,
                    alreadyClosed: true,
                    owner,
                    repo,
                    issueNumber: input.issueNumber,
                    title: issue.title,
                    html_url: issue.html_url,
                });
            }
            const result = (await gh.closeIssue(ctx.token, owner, repo, input.issueNumber, {
                body: input.body,
                stateReason: input.stateReason ?? "completed",
            }));
            return ok({
                ok: true,
                owner,
                repo,
                issueNumber: result.number ?? input.issueNumber,
                title: result.title ?? issue.title,
                state: result.state,
                closed_at: result.closed_at,
                html_url: result.html_url ?? issue.html_url,
            });
        },
    },
    {
        name: "github_create_pull_request",
        description: "Cria um pull request entre duas branches. Não é destrutivo (só abre o PR).",
        annotations: { ...WRITE_ANNOT, title: "Abrir pull request" },
        inputSchema: z.object({
            title: z.string().min(1),
            head: z.string().describe("Branch de origem (ex: feature/x)"),
            base: z.string().describe("Branch de destino (ex: main)"),
            body: z.string().optional(),
            draft: z.boolean().optional(),
            owner: z.string().optional(),
            repo: z.string().optional(),
        }),
        handler: async (input, ctx) => ok(await gh.createPullRequest(ctx.token, input.owner ?? config.github.owner, input.repo ?? config.github.repo, { title: input.title, head: input.head, base: input.base, body: input.body, draft: input.draft })),
    },
    {
        name: "github_create_branch",
        description: "Cria uma branch nova a partir de outra (padrão: main). Não é destrutivo.",
        annotations: { ...WRITE_ANNOT, title: "Criar branch" },
        inputSchema: z.object({
            newBranch: z.string().min(1).describe("Nome da branch nova"),
            fromBranch: z.string().optional().describe("Branch de origem (padrão: main)"),
            owner: z.string().optional(),
            repo: z.string().optional(),
        }),
        handler: async (input, ctx) => ok(await gh.createBranch(ctx.token, input.owner ?? config.github.owner, input.repo ?? config.github.repo, { newBranch: input.newBranch, fromBranch: input.fromBranch })),
    },
    {
        name: "github_merge_pull_request",
        description: "Faz merge de um pull request (padrão: squash). DESTRUTIVO — altera o histórico da branch de destino.",
        annotations: { ...DESTRUCTIVE_ANNOT, title: "Merge de pull request" },
        inputSchema: z.object({
            pullNumber: z.number().int().positive(),
            commitTitle: z.string().optional(),
            commitMessage: z.string().optional(),
            mergeMethod: z.enum(["merge", "squash", "rebase"]).optional(),
            owner: z.string().optional(),
            repo: z.string().optional(),
        }),
        handler: async (input, ctx) => ok(await gh.mergePullRequest(ctx.token, input.owner ?? config.github.owner, input.repo ?? config.github.repo, input.pullNumber, {
            commit_title: input.commitTitle,
            commit_message: input.commitMessage,
            merge_method: input.mergeMethod ?? "squash",
        })),
    },
    {
        name: "github_create_or_update_file",
        description: "Cria ou atualiza um arquivo no repositório via Contents API. Se o arquivo já existe, faz UPDATE (busca SHA atual); senão, CREATE. Commit direto na branch informada (default: main). Bloqueia arquivos sensíveis (.env, *.pem, secrets/, tokens, sessões). Só funciona em repos da allowlist.",
        annotations: { ...WRITE_ANNOT, title: "Criar ou atualizar arquivo" },
        inputSchema: z.object({
            owner: z.string().min(1),
            repo: z.string().min(1),
            path: z.string().min(1).describe("Caminho do arquivo no repo (ex: .github/workflows/x.yml)"),
            content: z.string().describe("Conteúdo em texto puro (será convertido pra base64)"),
            message: z.string().min(1).describe("Mensagem do commit"),
            branch: z.string().optional().describe("Branch alvo (padrão: main)"),
        }),
        handler: async (input, ctx) => {
            const ALLOWED_REPOS = new Set([
                "segredounlock/clone-deck",
                "ServerVpss/clone-deck",
                "ServerVpss/CentralDark",
            ]);
            const slug = `${input.owner}/${input.repo}`;
            if (!ALLOWED_REPOS.has(slug)) {
                throw new Error(`Repo não permitido: ${slug}. Allowlist: ${[...ALLOWED_REPOS].join(", ")}`);
            }
            const path = input.path.replace(/^\/+/, "");
            if (path.includes("..") || path.startsWith("/")) {
                throw new Error(`Path inválido: ${input.path}`);
            }
            const lower = path.toLowerCase();
            const BLOCKED_PATTERNS = [
                /(^|\/)\.env(\..*)?$/,
                /\.pem$/,
                /\.key$/,
                /\.p12$/,
                /\.pfx$/,
                /(^|\/)secrets?\//,
                /(^|\/)credenciais\//,
                /(^|\/)tokens?\//,
                /id_rsa/,
                /id_ed25519/,
                /\.ssh\//,
                /authorized_keys/,
            ];
            const BLOCKED_NAME_HINTS = ["password", "passwd", "senha", "apikey", "api_key", "bearer"];
            if (BLOCKED_PATTERNS.some((re) => re.test(lower)) ||
                BLOCKED_NAME_HINTS.some((h) => lower.includes(h))) {
                throw new Error(`Arquivo sensível bloqueado: ${input.path}`);
            }
            const result = (await gh.createOrUpdateFile(ctx.token, input.owner, input.repo, {
                path,
                content: input.content,
                message: input.message,
                branch: input.branch ?? "main",
                coAuthor: "SegredoiDev <segredounlock@users.noreply.github.com>",
            }));
            return ok({
                owner: input.owner,
                repo: input.repo,
                path,
                branch: input.branch ?? "main",
                commit_sha: result?.commit?.sha,
                commit_url: result?.commit?.html_url,
                file_sha: result?.content?.sha,
                html_url: result?.content?.html_url,
            });
        },
    },
    {
        name: "github_rerun_workflow_run",
        description: "Reexecuta TODOS os jobs de um run do GitHub Actions (equivalente ao botão 'Re-run all jobs'). Não destrutivo — cria nova execução.",
        annotations: { ...WRITE_ANNOT, title: "Re-run all jobs" },
        inputSchema: z.object({
            runId: z.number().int().positive().describe("ID numérico do run (campo 'id' do list_workflow_runs)"),
            owner: z.string().optional(),
            repo: z.string().optional(),
        }),
        handler: async (input, ctx) => {
            await gh.rerunWorkflowRun(ctx.token, input.owner ?? config.github.owner, input.repo ?? config.github.repo, input.runId);
            return ok({ ok: true, runId: input.runId, action: "rerun" });
        },
    },
    {
        name: "github_rerun_failed_jobs",
        description: "Reexecuta APENAS os jobs que falharam de um run. Mais rápido que rerun completo.",
        annotations: { ...WRITE_ANNOT, title: "Re-run failed jobs" },
        inputSchema: z.object({
            runId: z.number().int().positive(),
            owner: z.string().optional(),
            repo: z.string().optional(),
        }),
        handler: async (input, ctx) => {
            await gh.rerunFailedJobs(ctx.token, input.owner ?? config.github.owner, input.repo ?? config.github.repo, input.runId);
            return ok({ ok: true, runId: input.runId, action: "rerun_failed" });
        },
    },
    {
        name: "github_cancel_workflow_run",
        description: "Cancela um run em andamento do GitHub Actions.",
        annotations: { ...WRITE_ANNOT, title: "Cancelar workflow run" },
        inputSchema: z.object({
            runId: z.number().int().positive(),
            owner: z.string().optional(),
            repo: z.string().optional(),
        }),
        handler: async (input, ctx) => {
            await gh.cancelWorkflowRun(ctx.token, input.owner ?? config.github.owner, input.repo ?? config.github.repo, input.runId);
            return ok({ ok: true, runId: input.runId, action: "cancel" });
        },
    },
    {
        name: "github_delete_workflow_run",
        description: "Deleta um run do histórico de Actions. DESTRUTIVO — apaga registro permanentemente.",
        annotations: { ...DESTRUCTIVE_ANNOT, title: "Deletar workflow run" },
        inputSchema: z.object({
            runId: z.number().int().positive(),
            owner: z.string().optional(),
            repo: z.string().optional(),
        }),
        handler: async (input, ctx) => {
            await gh.deleteWorkflowRun(ctx.token, input.owner ?? config.github.owner, input.repo ?? config.github.repo, input.runId);
            return ok({ ok: true, runId: input.runId, action: "delete" });
        },
    },
    {
        name: "github_dispatch_workflow",
        description: "Dispara um workflow via workflow_dispatch (equivalente ao botão 'Run workflow'). Use o nome do arquivo (ex: 'sync-to-segredounlock.yml') ou o ID numérico.",
        annotations: { ...WRITE_ANNOT, title: "Run workflow (dispatch)" },
        inputSchema: z.object({
            workflow: z.string().describe("Nome do arquivo (ex: deploy.yml) ou ID numérico do workflow"),
            ref: z.string().optional().describe("Branch/tag onde rodar (padrão: main)"),
            inputs: z.string().optional().describe("JSON com inputs do workflow, ex: '{\"env\":\"prod\"}'"),
            owner: z.string().optional(),
            repo: z.string().optional(),
        }),
        handler: async (input, ctx) => {
            let parsedInputs;
            if (input.inputs) {
                try {
                    parsedInputs = JSON.parse(input.inputs);
                }
                catch {
                    throw new Error(`inputs não é JSON válido: ${input.inputs}`);
                }
            }
            await gh.dispatchWorkflow(ctx.token, input.owner ?? config.github.owner, input.repo ?? config.github.repo, input.workflow, { ref: input.ref ?? "main", inputs: parsedInputs });
            return ok({ ok: true, workflow: input.workflow, ref: input.ref ?? "main", action: "dispatch" });
        },
    },
    {
        name: "github_list_workflows",
        description: "Lista todos os workflows do repo (id + nome do arquivo + estado). Use pra descobrir o nome a passar pro dispatch.",
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true, title: "Listar workflows" },
        inputSchema: z.object({
            owner: z.string().optional(),
            repo: z.string().optional(),
        }),
        handler: async (input, ctx) => ok(await gh.listWorkflows(ctx.token, input.owner ?? config.github.owner, input.repo ?? config.github.repo)),
    },
];
//# sourceMappingURL=github-write.js.map