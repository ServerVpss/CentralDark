# OUTRO - github-read.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\mcp\src\tools\github-read.ts
**SHA:** 0a24321e4cfa8fd7
**Timestamp:** 2026-08-26T19:32:45.446729
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- owner: z.string().optional().describe(`Dono do repo. Padrão: ${config.github.owner}`),
- repo: z.string().optional().describe(`Nome do repo. Padrão: ${config.github.repo}`),
- state: z.enum(["open", "closed", "all"]).optional().describe("Filtro de estado (padrão: open)"),
- ref: z.string().optional().describe("Branch, tag ou SHA. Padrão: branch default"),
- branch: z.string().optional().describe("Branch (padrão: main)"),

### Ouro Bruto (primeiros 5000 chars)
```
// Tools MCP read-only do GitHub.
// Todas marcadas como readOnlyHint=true, destructiveHint=false.

import { z } from "zod";
import { config } from "../config.js";
import * as gh from "../github.js";

type Ctx = { token: string };

function ok(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
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
    handler: async (_input: unknown, ctx: Ctx) => ok(await gh.getViewer(ctx.token)),
  },
  {
    name: "github_list_repos",
    description: "Lista repositórios do usuário logado, ordenados por atualização mais recente. Apenas leitura.",
    annotations: { ...READ_ANNOT, title: "Listar meus repositórios" },
    inputSchema: z.object({
      perPage: z.number().int().min(1).max(100).optional().describe("Quantos por página (1-100, padrão 30)"),
      page: z.number().int().min(1).optional().describe("Número da página"),
    }),
    handler: async (input: { perPage?: number; page?: number }, ctx: Ctx) =>
      ok(await gh.listRepos(ctx.token, input)),
  },
  {
    name: "github_get_repo",
    description: "Retorna metadados de um repositório (descrição, stars, branch padrão, etc). Apenas leitura.",
    annotations: { ...READ_ANNOT, title: "Detalhes de um repositório" },
    inputSchema: z.object({
      owner: z.string().optional().describe(`Dono do repo. Padrão: ${config.github.owner}`),
      repo: z.string().optional().describe(`Nome do repo. Padrão: ${config.github.repo}`),
    }),
    handler: async (input: { owner?: string; repo?: string }, ctx: Ctx) =>
      ok(
        await gh.getRepo(
          ctx.token,
          input.owner ?? config.github.owner,
          input.repo ?? config.github.repo
        )
      ),
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
    handler: async (
      input: { owner?: string; repo?: string; state?: "open" | "closed" | "all"; perPage?: number; page?: number },
      ctx: Ctx
    ) =>
      ok(
        await gh.listIssues(
          ctx.token,
          input.owner ?? config.github.owner,
          input.repo ?? config.github.repo,
          { state: input.state, perPage: input.perPage, page: input.page }
        )
      ),
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
    handler: async (
      input: { owner?: string; repo?: string; state?: "open" | "closed" | "all"; perPage?: number; page?: number },
      ctx: Ctx
    ) =>
      ok(
        await gh.listPullRequests(
          ctx.token,
          input.owner ?? config.github.owner,
          input.repo ?? config.github.repo,
          { state: input.state, perPage: input.perPage, page: input.page }
        )
      ),
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
    handler: async (
      input: { path: string; owner?: string; repo?: string; ref?: string },
      ctx: Ctx
    ) =>
      ok(
        await gh.getFileContent(
          ctx.token,
          input.owner ?? config.github.owner,
          input.repo ?? config.github.repo,
          input.path,
          input.ref
        )
      ),
  },
  {
    name: "github_list_commits",
    description: "Lista os últimos N commits de uma branch. Útil pra ver o que mudou recentemente. Apenas leitura.",
    annotations: { ...READ_ANNOT, title: "Últimos commits da branch" },
    inputSchema: z.object({
     
```

---

# OUTRO - github-read.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\centraldark\apps\modulos\mcp\dist\tools\github\github-read.js
**SHA:** 67881e42ec83b8ba
**Timestamp:** 2026-08-28T02:54:53.958065
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- owner: z.string().optional().describe(`Dono do repo. Padrão: ${config.github.owner}`),
- repo: z.string().optional().describe(`Nome do repo. Padrão: ${config.github.repo}`),
- state: z.enum(["open", "closed", "all"]).optional().describe("Filtro de estado (padrão: open)"),
- ref: z.string().optional().describe("Branch, tag ou SHA. Padrão: branch default"),
- branch: z.string().optional().describe("Branch (padrão: main)"),

### Ouro Bruto (primeiros 5000 chars)
```
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
            repo: z.string().optiona
```

---

# OUTRO - github-read.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\centraldark\apps\modulos\mcp\src\tools\github\github-read.js
**SHA:** 61790bf8188dad8a
**Timestamp:** 2026-08-28T02:55:05.816475
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- owner: z.string().optional().describe(`Dono do repo. Padrão: ${config.github.owner}`),
- repo: z.string().optional().describe(`Nome do repo. Padrão: ${config.github.repo}`),
- state: z.enum(["open", "closed", "all"]).optional().describe("Filtro de estado (padrão: open)"),
- ref: z.string().optional().describe("Branch, tag ou SHA. Padrão: branch default"),
- branch: z.string().optional().describe("Branch (padrão: main)"),

### Ouro Bruto (primeiros 5000 chars)
```
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
            repo: z.string().optiona
```