# OUTRO - github-write.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\mcp\src\tools\github-write.ts
**SHA:** 9943b634406ea8cc
**Timestamp:** 2026-08-26T19:32:45.464908
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- description: "Cria uma branch nova a partir de outra (padrão: main). Não é destrutivo.",
- fromBranch: z.string().optional().describe("Branch de origem (padrão: main)"),
- "Faz merge de um pull request (padrão: squash). DESTRUTIVO — altera o histórico da branch de destino.",
- branch: z.string().optional().describe("Branch alvo (padrão: main)"),
- ref: z.string().optional().describe("Branch/tag onde rodar (padrão: main)"),

### Ouro Bruto (primeiros 5000 chars)
```
// Tools MCP de escrita no GitHub.
// readOnlyHint=false. As que mexem definitivo (merge) ficam destructiveHint=true.

import { z } from "zod";
import { config } from "../config.js";
import * as gh from "../github.js";

type Ctx = { token: string };

function ok(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
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
    handler: async (
      input: {
        title: string;
        body?: string;
        labels?: string[];
        assignees?: string[];
        owner?: string;
        repo?: string;
      },
      ctx: Ctx
    ) =>
      ok(
        await gh.createIssue(
          ctx.token,
          input.owner ?? config.github.owner,
          input.repo ?? config.github.repo,
          { title: input.title, body: input.body, labels: input.labels, assignees: input.assignees }
        )
      ),
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
    handler: async (
      input: { issueNumber: number; body: string; owner?: string; repo?: string },
      ctx: Ctx
    ) =>
      ok(
        await gh.commentIssue(
          ctx.token,
          input.owner ?? config.github.owner,
          input.repo ?? config.github.repo,
          input.issueNumber,
          input.body
        )
      ),
  },
  {
    name: "github_close_issue",
    description:
      "Fecha uma issue existente no repositório oficial com comentário final opcional. Valida repo alvo, existência da issue e bloqueia PRs. Não lê nem expõe segredo.",
    annotations: { ...WRITE_ANNOT, title: "Fechar issue" },
    inputSchema: z.object({
      issueNumber: z.number().int().positive(),
      body: z.string().optional().describe("Comentário final opcional, sem segredo real."),
      stateReason: z.enum(["completed", "not_planned"]).optional(),
      owner: z.string().optional(),
      repo: z.string().optional(),
    }),
    handler: async (
      input: {
        issueNumber: number;
        body?: string;
        stateReason?: "completed" | "not_planned";
        owner?: string;
        repo?: string;
      },
      ctx: Ctx
    ) => {
      const owner = input.owner ?? "ServerVpss";
      const repo = input.repo ?? "CentralDark";
      const slug = `${owner}/${repo}`;

      if (slug !== "ServerVpss/CentralDark") {
        throw new Error(
          `Repo não permitido para fechar issue: ${slug}. Use ServerVpss/CentralDark.`
        );
      }

      if (
        input.body &&
        /-----BEGIN (?:RSA |OPENSSH |EC |DSA )?PRIVATE KEY-----|\b(?:token|password|passwd|secret|cookie|session|connection_string|database_url|api_key|apikey)\b\s*[:=]\s*['\"]?[^'\"\s<>`]{8,}/i.test(
          input.body
        )
      ) {
        throw new Error("Comentário final bloqueado: parece conter segredo real.");
      }

      const issue = (await gh.getIssue(ctx.token, owner, repo, input.issueNumber)) as {
        number?: number;
        state?: string;
        title?: string;
        html_url?: string;
        pull_request?: unknown;
      };

      if (issue.pull_request) {
        throw new Error(
          `#${input.issueNumber} é Pull Request, não issue. Use fluxo de PR.`
        );
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
      })) as {
        number?: number;
        state?: string;
        title?: string;
        closed_at?: string;
        html_url?: string;
      };

      return ok({
        ok:
```

---

# OUTRO - github-write.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-local\CentralDark\apps\mcp\dist\tools\github-write.js
**SHA:** 6fd20cdc5a521f9d
**Timestamp:** 2026-08-26T19:34:24.940170
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- description: "Cria uma branch nova a partir de outra (padrão: main). Não é destrutivo.",
- fromBranch: z.string().optional().describe("Branch de origem (padrão: main)"),
- description: "Faz merge de um pull request (padrão: squash). DESTRUTIVO — altera o histórico da branch de destino.",
- branch: z.string().optional().describe("Branch alvo (padrão: main)"),
- ref: z.string().optional().describe("Branch/tag onde rodar (padrão: main)"),

### Ouro Bruto (primeiros 5000 chars)
```
// Tools MCP de escrita no GitHub.
// readOnlyHint=false. As que mexem definitivo (merge) ficam destructiveHint=true.
import { z } from "zod";
import { config } from "../config.js";
import * as gh from "../github.js";
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
            title: 
```

---

# OUTRO - github-write.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\centraldark\apps\modulos\mcp\dist\tools\github\github-write.js
**SHA:** 4285a02d91ee9889
**Timestamp:** 2026-08-28T02:54:54.305050
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- description: "Cria uma branch nova a partir de outra (padrão: main). Não é destrutivo.",
- fromBranch: z.string().optional().describe("Branch de origem (padrão: main)"),
- description: "Faz merge de um pull request (padrão: squash). DESTRUTIVO — altera o histórico da branch de destino.",
- branch: z.string().optional().describe("Branch alvo (padrão: main)"),
- ref: z.string().optional().describe("Branch/tag onde rodar (padrão: main)"),

### Ouro Bruto (primeiros 5000 chars)
```
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
            title
```

---

# OUTRO - github-write.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\centraldark\apps\modulos\mcp\src\tools\github\github-write.js
**SHA:** 2c1854bace1d2fe2
**Timestamp:** 2026-08-28T02:55:05.866251
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- description: "Cria uma branch nova a partir de outra (padrão: main). Não é destrutivo.",
- fromBranch: z.string().optional().describe("Branch de origem (padrão: main)"),
- description: "Faz merge de um pull request (padrão: squash). DESTRUTIVO — altera o histórico da branch de destino.",
- branch: z.string().optional().describe("Branch alvo (padrão: main)"),
- ref: z.string().optional().describe("Branch/tag onde rodar (padrão: main)"),

### Ouro Bruto (primeiros 5000 chars)
```
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
            title
```