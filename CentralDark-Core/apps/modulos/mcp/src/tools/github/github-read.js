// Tools MCP read-only do GitHub.
// Todas marcadas como readOnlyHint=true, destructiveHint=false.
import { z } from "zod";
import { config } from "../../config.js";
import * as gh from "./github.js";
import { sanitizeOutgoingDeep } from "../../lib/sanitize.js";
function ok(data) {
    return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
}
// Annotations padrão pra tools só-leitura.
const READ_ANNOT = {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
};
export const githubReadTools = [
    {
        name: "github_viewer",
        description: "Mostra qual usuário GitHub está logado nesta sessão do MCP. Use pra confirmar identidade.",
        annotations: { ...READ_ANNOT, title: "Quem está logado no GitHub" },
        inputSchema: z.object({}),
        handler: async (_input, ctx) => ok(await gh.getViewer(ctx.token)),
    },
    {
        name: "github_list_repos",
        description: "Lista repositórios do usuário logado, ordenados por atualização mais recente. Apenas leitura.",
        annotations: { ...READ_ANNOT, title: "Listar meus repositórios" },
        inputSchema: z.object({
            perPage: z.number().int().min(1).max(100).optional().describe("Quantos por página (1-100, padrão 30)"),
            page: z.number().int().min(1).optional().describe("Número da página"),
        }),
        handler: async (input, ctx) => ok(await gh.listRepos(ctx.token, input)),
    },
    {
        name: "github_get_repo",
        description: "Retorna metadados de um repositório (descrição, stars, branch padrão, etc). Apenas leitura.",
        annotations: { ...READ_ANNOT, title: "Detalhes de um repositório" },
        inputSchema: z.object({
            owner: z.string().optional().describe(`Dono do repo. Padrão: ${config.github.owner}`),
            repo: z.string().optional().describe(`Nome do repo. Padrão: ${config.github.repo}`),
        }),
        handler: async (input, ctx) => ok(sanitizeOutgoingDeep(await gh.getRepo(ctx.token, input.owner ?? config.github.owner, input.repo ?? config.github.repo))),
    },
    {
        name: "github_list_issues",
        description: "Lista issues de um repositório. Apenas leitura.",
        annotations: { ...READ_ANNOT, title: "Listar issues" },
        inputSchema: z.object({
            owner: z.string().optional(),
            repo: z.string().optional(),
            state: z.enum(["open", "closed", "all"]).optional().describe("Filtro de estado (padrão: open)"),
            perPage: z.number().int().min(1).max(100).optional(),
            page: z.number().int().min(1).optional(),
        }),
        handler: async (input, ctx) => ok(await gh.listIssues(ctx.token, input.owner ?? config.github.owner, input.repo ?? config.github.repo, { state: input.state, perPage: input.perPage, page: input.page })),
    },
    {
        name: "github_list_pull_requests",
        description: "Lista pull requests de um repositório. Apenas leitura.",
        annotations: { ...READ_ANNOT, title: "Listar pull requests" },
        inputSchema: z.object({
            owner: z.string().optional(),
            repo: z.string().optional(),
            state: z.enum(["open", "closed", "all"]).optional(),
            perPage: z.number().int().min(1).max(100).optional(),
            page: z.number().int().min(1).optional(),
        }),
        handler: async (input, ctx) => ok(await gh.listPullRequests(ctx.token, input.owner ?? config.github.owner, input.repo ?? config.github.repo, { state: input.state, perPage: input.perPage, page: input.page })),
    },
    {
        name: "github_get_file",
        description: "Lê o conteúdo de um arquivo do repositório (decodificado em texto). Apenas leitura.",
        annotations: { ...READ_ANNOT, title: "Ler arquivo do repo" },
        inputSchema: z.object({
            path: z.string().describe("Caminho do arquivo no repo, ex: docs/PENDENCIAS.md"),
            owner: z.string().optional(),
            repo: z.string().optional(),
            ref: z.string().optional().describe("Branch, tag ou SHA. Padrão: branch default"),
        }),
        handler: async (input, ctx) => ok(await gh.getFileContent(ctx.token, input.owner ?? config.github.owner, input.repo ?? config.github.repo, input.path, input.ref)),
    },
    {
        name: "github_list_commits",
        description: "Lista os últimos N commits de uma branch. Útil pra ver o que mudou recentemente. Apenas leitura.",
        annotations: { ...READ_ANNOT, title: "Últimos commits da branch" },
        inputSchema: z.object({
            branch: z.string().optional().describe("Branch (padrão: main)"),
            perPage: z.number().int().min(1).max(100).optional().describe("Quantos commits (padrão 20)"),
            page: z.number().int().min(1).optional(),
            path: z.string().optional().describe("Filtrar por arquivo/pasta"),
            owner: z.string().optional(),
            repo: z.string().optional(),
        }),
        handler: async (input, ctx) => ok(await gh.listCommits(ctx.token, input.owner ?? config.github.owner, input.repo ?? config.github.repo, { branch: input.branch, perPage: input.perPage, page: input.page, path: input.path })),
    },
    {
        name: "github_list_workflow_runs",
        description: "Lista os últimos runs do GitHub Actions (CI/CD), com status e conclusão. Apenas leitura.",
        annotations: { ...READ_ANNOT, title: "Status dos workflows" },
        inputSchema: z.object({
            perPage: z.number().int().min(1).max(100).optional().describe("Quantos runs (padrão 10)"),
            branch: z.string().optional().describe("Filtrar por branch"),
            status: z.string().optional().describe("Filtrar por status: queued, in_progress, completed, etc"),
            owner: z.string().optional(),
            repo: z.string().optional(),
        }),
        handler: async (input, ctx) => ok(await gh.listWorkflowRuns(ctx.token, input.owner ?? config.github.owner, input.repo ?? config.github.repo, { perPage: input.perPage, branch: input.branch, status: input.status })),
    },
    {
        name: "github_search_code",
        description: "Busca por código dentro do(s) repositório(s). Use a sintaxe de busca do GitHub. Exemplo: 'foo repo:dono/repo language:typescript'. Apenas leitura.",
        annotations: { ...READ_ANNOT, title: "Buscar código no GitHub" },
        inputSchema: z.object({
            query: z.string().min(1).describe("Query estilo GitHub Search"),
            perPage: z.number().int().min(1).max(100).optional(),
            page: z.number().int().min(1).optional(),
        }),
        handler: async (input, ctx) => ok(await gh.searchCode(ctx.token, input.query, { perPage: input.perPage, page: input.page })),
    },
    {
        name: "github_check_token",
        description: "Checa o token do GitHub atual: tipo (classic-pat / fine-grained-pat / oauth / github-app), scopes concedidos, expiração, rate limit, permissões no repo informado e dá um veredito se dá pra rodar Actions write (rerun, dispatch, cancel). USE ISSO ANTES de tentar rerun/dispatch se der 403.",
        annotations: { ...READ_ANNOT, title: "Checar permissões do token" },
        inputSchema: z.object({
            owner: z.string().optional().describe("Dono do repo pra checar permissões específicas"),
            repo: z.string().optional().describe("Nome do repo pra checar permissões específicas"),
        }),
        handler: async (input, ctx) => ok(await gh.checkToken(ctx.token, input.owner ?? config.github.owner, input.repo ?? config.github.repo)),
    },
];
//# sourceMappingURL=github-read.js.map