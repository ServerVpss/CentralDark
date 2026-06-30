// Tools de integração: Linear, Notion e Sentry.
//
// Estratégia de credenciais (FALLBACK):
//   1) Tenta token direto do provedor (cofre /root/CentralDark/secrets/mcp.env ou process.env)
//      - LINEAR_API_KEY  → chama https://api.linear.app/graphql direto
//      - NOTION_API_KEY  → chama https://api.notion.com/v1 direto
//      - SENTRY_AUTH_TOKEN (+ SENTRY_ORG) → chama https://sentry.io/api/0 direto
//   2) Se faltar, cai pro Lovable Connector Gateway usando LOVABLE_API_KEY +
//      <PROV>_API_KEY (formato esperado pelo gateway).
//
// Tudo read-friendly. Operações de escrita estão marcadas como destrutivas.
//
// Os tokens NUNCA aparecem em log ou resposta — só são lidos pra montar headers.
import { existsSync, readFileSync } from "node:fs";
import { z } from "zod";
// ─────────────────────────────────────────────────────────────────────────────
// Cofre + fallback
// ─────────────────────────────────────────────────────────────────────────────
const SECRET_ENV_FILES = [
    "/root/CentralDark/secrets/mcp.env",
    "/root/CentralDark/secrets/integrations.env",
    "/root/Multizap/secrets/mcp.env",
];
let _cachedEnv = null;
export function readCofre() {
    if (_cachedEnv)
        return _cachedEnv;
    const env = {};
    for (const file of SECRET_ENV_FILES) {
        if (!existsSync(file))
            continue;
        try {
            const raw = readFileSync(file, "utf8");
            for (const originalLine of raw.split(/\r?\n/)) {
                let line = originalLine.trim();
                if (!line || line.startsWith("#") || !line.includes("="))
                    continue;
                if (line.startsWith("export "))
                    line = line.slice("export ".length).trim();
                const idx = line.indexOf("=");
                const key = line.slice(0, idx).trim();
                let value = line.slice(idx + 1).trim();
                value = value.replace(/^['"]|['"]$/g, "");
                if (!key || !value || value.includes("${"))
                    continue;
                if (!(key in env))
                    env[key] = value;
            }
        }
        catch {
            /* arquivo ilegível — ignora silenciosamente */
        }
    }
    const fromProcess = Object.fromEntries(Object.entries(process.env).filter((e) => typeof e[1] === "string"));
    _cachedEnv = { ...env, ...fromProcess };
    return _cachedEnv;
}
export function pick(...names) {
    const env = readCofre();
    for (const n of names) {
        const v = env[n];
        if (v && v.trim())
            return v.trim();
    }
    return undefined;
}
const GATEWAY_URL = "https://connector-gateway.lovable.dev";
// ─────────────────────────────────────────────────────────────────────────────
// Helpers de resposta
// ─────────────────────────────────────────────────────────────────────────────
function jsonBlock(obj) {
    return {
        content: [{ type: "text", text: JSON.stringify(obj, null, 2) }],
    };
}
function textBlock(text) {
    return { content: [{ type: "text", text }] };
}
const READ = {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
};
const WRITE = {
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: false,
    openWorldHint: true,
};
// ─────────────────────────────────────────────────────────────────────────────
// LINEAR — GraphQL
// ─────────────────────────────────────────────────────────────────────────────
async function linearGql(query, variables = {}) {
    const direct = pick("LINEAR_API_KEY", "LINEAR_TOKEN");
    const lovable = pick("LOVABLE_API_KEY");
    let url;
    let headers;
    if (direct) {
        url = "https://api.linear.app/graphql";
        headers = {
            Authorization: direct,
            "Content-Type": "application/json",
        };
    }
    else if (lovable) {
        url = `${GATEWAY_URL}/linear/graphql`;
        const conn = pick("LINEAR_GATEWAY_KEY") ?? lovable;
        headers = {
            Authorization: `Bearer ${lovable}`,
            "X-Connection-Api-Key": conn,
            "Content-Type": "application/json",
        };
    }
    else {
        throw new Error("Linear: nem LINEAR_API_KEY nem LOVABLE_API_KEY disponíveis. " +
            "Cadastre uma das duas em /root/CentralDark/secrets/mcp.env.");
    }
    const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({ query, variables }),
    });
    const text = await res.text();
    if (!res.ok)
        throw new Error(`Linear ${res.status}: ${text.slice(0, 400)}`);
    const data = JSON.parse(text);
    if (data.errors) {
        throw new Error(`Linear GraphQL: ${JSON.stringify(data.errors).slice(0, 400)}`);
    }
    return data.data;
}
const linearTools = [
    {
        name: "linear_listar_issues",
        description: "Lista issues do Linear. Filtros opcionais por equipe (teamKey), estado (stateName) e limite.",
        annotations: { ...READ, title: "Linear — listar issues" },
        inputSchema: z.object({
            teamKey: z.string().optional().describe("Sigla da equipe, ex: 'ENG'"),
            stateName: z
                .string()
                .optional()
                .describe("Nome do estado: 'Todo', 'In Progress', 'Done'…"),
            limit: z.number().int().min(1).max(100).default(25),
        }),
        handler: async (input) => {
            const filter = [];
            const vars = { first: input.limit ?? 25 };
            if (input.teamKey) {
                filter.push(`team: { key: { eq: $teamKey } }`);
                vars.teamKey = input.teamKey;
            }
            if (input.stateName) {
                filter.push(`state: { name: { eq: $stateName } }`);
                vars.stateName = input.stateName;
            }
            const filterStr = filter.length
                ? `, filter: { ${filter.join(", ")} }`
                : "";
            const query = `
        query Issues($first: Int!${input.teamKey ? ", $teamKey: String!" : ""}${input.stateName ? ", $stateName: String!" : ""}) {
          issues(first: $first${filterStr}, orderBy: updatedAt) {
            nodes {
              id identifier title priority
              state { name } team { key name }
              assignee { name email }
              url updatedAt
            }
          }
        }`;
            const data = await linearGql(query, vars);
            return jsonBlock(data.issues.nodes);
        },
    },
    {
        name: "linear_criar_issue",
        description: "Cria uma issue no Linear. Precisa do teamId (use linear_listar_equipes pra descobrir).",
        annotations: { ...WRITE, title: "Linear — criar issue" },
        inputSchema: z.object({
            teamId: z.string().describe("ID da equipe (UUID)"),
            title: z.string().min(1),
            description: z.string().optional(),
            priority: z.number().int().min(0).max(4).optional().describe("0=none,1=urgent,2=high,3=medium,4=low"),
        }),
        handler: async (input) => {
            const data = await linearGql(`mutation Create($input: IssueCreateInput!) {
          issueCreate(input: $input) {
            success
            issue { id identifier title url }
          }
        }`, {
                input: {
                    teamId: input.teamId,
                    title: input.title,
                    description: input.description,
                    priority: input.priority,
                },
            });
            return jsonBlock(data.issueCreate);
        },
    },
    {
        name: "linear_atualizar_issue",
        description: "Atualiza título, descrição, estado ou prioridade de uma issue.",
        annotations: { ...WRITE, title: "Linear — atualizar issue" },
        inputSchema: z.object({
            issueId: z.string().describe("ID UUID da issue"),
            title: z.string().optional(),
            description: z.string().optional(),
            stateId: z.string().optional(),
            priority: z.number().int().min(0).max(4).optional(),
        }),
        handler: async (input) => {
            const { issueId, ...rest } = input;
            const data = await linearGql(`mutation Upd($id: String!, $input: IssueUpdateInput!) {
          issueUpdate(id: $id, input: $input) {
            success
            issue { id identifier title state { name } url }
          }
        }`, { id: issueId, input: rest });
            return jsonBlock(data.issueUpdate);
        },
    },
    {
        name: "linear_listar_equipes",
        description: "Lista equipes do workspace Linear (id, key, name) — útil pra criar issues.",
        annotations: { ...READ, title: "Linear — listar equipes" },
        inputSchema: z.object({}),
        handler: async () => {
            const data = await linearGql(`query { teams(first: 50) { nodes { id key name } } }`);
            return jsonBlock(data.teams.nodes);
        },
    },
    {
        name: "linear_listar_ciclos",
        description: "Lista ciclos (sprints) de uma equipe.",
        annotations: { ...READ, title: "Linear — listar ciclos" },
        inputSchema: z.object({
            teamId: z.string().describe("ID da equipe"),
        }),
        handler: async (input) => {
            const data = await linearGql(`query Cy($teamId: String!) {
          team(id: $teamId) {
            cycles(first: 20) {
              nodes { id number name startsAt endsAt progress }
            }
          }
        }`, { teamId: input.teamId });
            return jsonBlock(data.team.cycles.nodes);
        },
    },
];
// ─────────────────────────────────────────────────────────────────────────────
// NOTION — REST
// ─────────────────────────────────────────────────────────────────────────────
async function notionCall(path, method = "GET", body) {
    const direct = pick("NOTION_API_KEY", "NOTION_TOKEN");
    const lovable = pick("LOVABLE_API_KEY");
    let url;
    let headers;
    if (direct) {
        url = `https://api.notion.com/v1${path}`;
        headers = {
            Authorization: `Bearer ${direct}`,
            "Notion-Version": "2022-06-28",
            "Content-Type": "application/json",
        };
    }
    else if (lovable) {
        url = `${GATEWAY_URL}/notion/v1${path}`;
        const conn = pick("NOTION_GATEWAY_KEY") ?? lovable;
        headers = {
            Authorization: `Bearer ${lovable}`,
            "X-Connection-Api-Key": conn,
            "Content-Type": "application/json",
        };
    }
    else {
        throw new Error("Notion: nem NOTION_API_KEY nem LOVABLE_API_KEY disponíveis. " +
            "Cadastre uma das duas em /root/CentralDark/secrets/mcp.env.");
    }
    const res = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    if (!res.ok)
        throw new Error(`Notion ${res.status}: ${text.slice(0, 400)}`);
    return JSON.parse(text);
}
const notionTools = [
    {
        name: "notion_buscar",
        description: "Busca páginas/databases no Notion por texto livre.",
        annotations: { ...READ, title: "Notion — buscar" },
        inputSchema: z.object({
            query: z.string().min(1),
            limit: z.number().int().min(1).max(50).default(10),
        }),
        handler: async (input) => {
            const data = await notionCall("/search", "POST", {
                query: input.query,
                page_size: input.limit ?? 10,
            });
            const slim = data.results.map((r) => ({
                id: r.id,
                object: r.object,
                url: r.url,
                title: (r.properties
                    ?.title?.title?.[0]?.plain_text) ??
                    (r.child_page?.title) ??
                    null,
                last_edited_time: r.last_edited_time,
            }));
            return jsonBlock(slim);
        },
    },
    {
        name: "notion_ler_pagina",
        description: "Lê uma página do Notion (propriedades + blocos filhos).",
        annotations: { ...READ, title: "Notion — ler página" },
        inputSchema: z.object({
            pageId: z.string().describe("ID da página (com ou sem traços)"),
        }),
        handler: async (input) => {
            const id = input.pageId.replace(/-/g, "");
            const page = await notionCall(`/pages/${id}`);
            const blocks = await notionCall(`/blocks/${id}/children?page_size=100`);
            return jsonBlock({ page, blocks: blocks.results });
        },
    },
    {
        name: "notion_criar_pagina",
        description: "Cria uma página no Notion. Passe parentPageId (página) OU parentDatabaseId (database).",
        annotations: { ...WRITE, title: "Notion — criar página" },
        inputSchema: z.object({
            parentPageId: z.string().optional(),
            parentDatabaseId: z.string().optional(),
            title: z.string().min(1),
            content: z.string().optional().describe("Texto livre (vira parágrafos)"),
        }),
        handler: async (input) => {
            if (!input.parentPageId && !input.parentDatabaseId) {
                throw new Error("Informe parentPageId OU parentDatabaseId.");
            }
            const parent = input.parentDatabaseId
                ? { database_id: input.parentDatabaseId }
                : { page_id: input.parentPageId };
            const properties = input.parentDatabaseId
                ? {
                    Name: {
                        title: [{ text: { content: input.title } }],
                    },
                }
                : {
                    title: [{ text: { content: input.title } }],
                };
            const children = input.content
                ? input.content.split(/\n\n+/).map((p) => ({
                    object: "block",
                    type: "paragraph",
                    paragraph: {
                        rich_text: [{ type: "text", text: { content: p.slice(0, 1900) } }],
                    },
                }))
                : undefined;
            const data = await notionCall("/pages", "POST", {
                parent,
                properties,
                children,
            });
            return jsonBlock({
                id: data.id,
                url: data.url,
                created_time: data.created_time,
            });
        },
    },
    {
        name: "notion_anexar_paragrafo",
        description: "Adiciona um parágrafo no final de uma página Notion existente.",
        annotations: { ...WRITE, title: "Notion — anexar parágrafo" },
        inputSchema: z.object({
            pageId: z.string(),
            text: z.string().min(1).max(1900),
        }),
        handler: async (input) => {
            const id = input.pageId.replace(/-/g, "");
            const data = await notionCall(`/blocks/${id}/children`, "PATCH", {
                children: [
                    {
                        object: "block",
                        type: "paragraph",
                        paragraph: {
                            rich_text: [{ type: "text", text: { content: input.text } }],
                        },
                    },
                ],
            });
            return jsonBlock({ ok: true, results: data.results?.length ?? 0 });
        },
    },
];
// ─────────────────────────────────────────────────────────────────────────────
// SENTRY — REST
// ─────────────────────────────────────────────────────────────────────────────
async function sentryCall(path, method = "GET", body) {
    const direct = pick("SENTRY_AUTH_TOKEN", "SENTRY_TOKEN");
    const lovable = pick("LOVABLE_API_KEY");
    let url;
    let headers;
    if (direct) {
        url = `https://sentry.io/api/0${path}`;
        headers = {
            Authorization: `Bearer ${direct}`,
            "Content-Type": "application/json",
        };
    }
    else if (lovable) {
        url = `${GATEWAY_URL}/sentry/api/0${path}`;
        const conn = pick("SENTRY_GATEWAY_KEY") ?? lovable;
        headers = {
            Authorization: `Bearer ${lovable}`,
            "X-Connection-Api-Key": conn,
            "Content-Type": "application/json",
        };
    }
    else {
        throw new Error("Sentry: nem SENTRY_AUTH_TOKEN nem LOVABLE_API_KEY disponíveis. " +
            "Cadastre um dos dois em /root/CentralDark/secrets/mcp.env.");
    }
    const res = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    if (!res.ok)
        throw new Error(`Sentry ${res.status}: ${text.slice(0, 400)}`);
    return text ? JSON.parse(text) : {};
}
function sentryOrg() {
    const org = pick("SENTRY_ORG", "SENTRY_ORG_SLUG");
    if (!org)
        throw new Error("Defina SENTRY_ORG no /root/CentralDark/secrets/mcp.env (ex: 'centraldark').");
    return org;
}
const sentryTools = [
    {
        name: "sentry_listar_issues",
        description: "Lista issues do Sentry. Filtros opcionais: project (slug), query (sintaxe Sentry), limit.",
        annotations: { ...READ, title: "Sentry — listar issues" },
        inputSchema: z.object({
            project: z.string().optional().describe("Slug do projeto (ex: 'install-callback')"),
            query: z.string().optional().default("is:unresolved"),
            limit: z.number().int().min(1).max(100).default(25),
        }),
        handler: async (input) => {
            const org = sentryOrg();
            const qs = new URLSearchParams();
            qs.set("query", input.query ?? "is:unresolved");
            qs.set("limit", String(input.limit ?? 25));
            if (input.project)
                qs.set("project", input.project);
            const path = input.project
                ? `/projects/${org}/${input.project}/issues/?${qs}`
                : `/organizations/${org}/issues/?${qs}`;
            const data = await sentryCall(path);
            const slim = data.map((i) => ({
                id: i.id,
                shortId: i.shortId,
                title: i.title,
                culprit: i.culprit,
                level: i.level,
                status: i.status,
                count: i.count,
                userCount: i.userCount,
                lastSeen: i.lastSeen,
                permalink: i.permalink,
            }));
            return jsonBlock(slim);
        },
    },
    {
        name: "sentry_detalhe_issue",
        description: "Detalhes de uma issue do Sentry pelo ID (numérico ou shortId).",
        annotations: { ...READ, title: "Sentry — detalhe issue" },
        inputSchema: z.object({
            issueId: z.string(),
        }),
        handler: async (input) => {
            const data = await sentryCall(`/issues/${input.issueId}/`);
            return jsonBlock(data);
        },
    },
    {
        name: "sentry_resolver_issue",
        description: "Marca uma issue do Sentry como resolvida.",
        annotations: { ...WRITE, title: "Sentry — resolver issue" },
        inputSchema: z.object({
            issueId: z.string(),
        }),
        handler: async (input) => {
            const data = await sentryCall(`/issues/${input.issueId}/`, "PUT", {
                status: "resolved",
            });
            return jsonBlock(data);
        },
    },
    {
        name: "sentry_status_credenciais",
        description: "Diagnóstico: mostra de onde o MCP vai pegar credencial do Sentry/Linear/Notion (cofre direto ou gateway), sem expor valores.",
        annotations: { ...READ, title: "Integrações — status credenciais" },
        inputSchema: z.object({}),
        handler: async () => {
            return jsonBlock({
                linear: pick("LINEAR_API_KEY") ? "cofre direto" : pick("LOVABLE_API_KEY") ? "gateway" : "AUSENTE",
                notion: pick("NOTION_API_KEY") ? "cofre direto" : pick("LOVABLE_API_KEY") ? "gateway" : "AUSENTE",
                sentry: pick("SENTRY_AUTH_TOKEN")
                    ? `cofre direto (org=${pick("SENTRY_ORG") ?? "NÃO DEFINIDA"})`
                    : pick("LOVABLE_API_KEY")
                        ? `gateway (org=${pick("SENTRY_ORG") ?? "NÃO DEFINIDA"})`
                        : "AUSENTE",
                cofre_lido: SECRET_ENV_FILES.filter((f) => existsSync(f)),
            });
        },
    },
];
// ─────────────────────────────────────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────────────────────────────────────
export const integrationsTools = [
    ...linearTools,
    ...notionTools,
    ...sentryTools,
];
//# sourceMappingURL=integrations.js.map