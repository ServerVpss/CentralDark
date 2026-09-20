import { existsSync, readFileSync } from "node:fs";
import { z } from "zod";
const SECRET_ENV_FILES = [
    // === COFRE OFICIAL (PRIORIDADE MÁXIMA) ===
    "/root/CentralDark/secrets/supabase-mcp.env",
    "/root/CentralDark/secrets/supabase.env",
    "/root/CentralDark/secrets/mcp.env",
    // === FALLBACKS LEGADOS ===
    "/root/Multizap/secrets/supabase-mcp.env",
    "/root/Multizap/gateway/.env",
    "/root/Multizap/wuzapi/.env",
    "/root/whatsapp-server/console/.env",
    "/root/whatsapp-server/whatsapp-server/.env",
];
function ok(data) {
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}
function readEnvFiles() {
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
                value = value.replace(/^['\"]|['\"]$/g, "");
                if (!key || !value || value.includes("${"))
                    continue;
                if (!(key in env))
                    env[key] = value;
            }
        }
        catch {
            // Mantém a tool resiliente se algum arquivo local não puder ser lido.
        }
    }
    const processEnv = Object.fromEntries(Object.entries(process.env).filter((entry) => typeof entry[1] === "string"));
    return { ...env, ...processEnv };
}
function getSupabaseEnv() {
    const env = readEnvFiles();
    return {
        accessToken: env.SUPABASE_ACCESS_TOKEN ?? "",
        projectRef: env.SUPABASE_PROJECT_REF ?? "lyoigsqluyktoclwdaft",
        restUrl: (env.SUPABASE_URL || env.VITE_SUPABASE_URL || "").replace(/\/$/, ""),
        serviceKey: env.SUPABASE_SERVICE_ROLE_KEY ||
            env.SUPABASE_SERVICE_KEY ||
            env.SUPABASE_KEY ||
            env.VITE_SUPABASE_ANON_KEY ||
            "",
    };
}
function maskHost(url) {
    if (!url)
        return "";
    try {
        const parsed = new URL(url);
        const [first] = parsed.hostname.split(".");
        return `${parsed.protocol}//${first}...`;
    }
    catch {
        return `${url.slice(0, 18)}...`;
    }
}
function projectSafe(project) {
    return {
        id: project.id,
        name: project.name,
        region: project.region,
        status: project.status,
        created_at: project.created_at,
    };
}
async function fetchJson(url, headers) {
    const res = await fetch(url, {
        method: "GET",
        headers: {
            Accept: "application/json",
            "User-Agent": "CentralDark-MCP/0.1",
            ...headers,
        },
    });
    const raw = await res.text();
    try {
        return { http: res.status, data: JSON.parse(raw) };
    }
    catch {
        return { http: res.status, data: raw.slice(0, 500) };
    }
}
function getRestConfig(projectRef) {
    const env = getSupabaseEnv();
    const ref = projectRef || env.projectRef;
    const restUrl = env.restUrl || (ref ? `https://${ref}.supabase.co` : "");
    return { restUrl: restUrl.replace(/\/$/, ""), serviceKey: env.serviceKey, projectRef: ref };
}
export const supabaseTools = [
    {
        name: "supabase_projects",
        description: "Lista projetos Supabase via Management API usando token local seguro da VPS. Apenas leitura; nunca retorna token.",
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: true,
            title: "Listar projetos Supabase",
        },
        inputSchema: z.object({}),
        handler: async (_input, _ctx) => {
            const { accessToken } = getSupabaseEnv();
            if (!accessToken) {
                return ok({ ok: false, error: "SUPABASE_ACCESS_TOKEN ausente no ambiente/secrets da VPS" });
            }
            const res = await fetchJson("https://api.supabase.com/v1/projects", {
                Authorization: `Bearer ${accessToken}`,
            });
            const projects = Array.isArray(res.data)
                ? res.data
                    .filter((p) => typeof p === "object" && p !== null)
                    .map(projectSafe)
                : [];
            return ok({ ok: res.http >= 200 && res.http < 300, http: res.http, projects_count: projects.length, projects });
        },
    },
    {
        name: "supabase_project_status",
        description: "Mostra status sanitizado de um projeto Supabase pelo project_ref. Apenas leitura; não altera banco.",
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: true,
            title: "Status projeto Supabase",
        },
        inputSchema: z.object({
            projectRef: z.string().optional().describe("Project ref Supabase. Padrão: SUPABASE_PROJECT_REF ou multizap."),
        }),
        handler: async (input, _ctx) => {
            const env = getSupabaseEnv();
            const projectRef = input.projectRef || env.projectRef;
            if (!env.accessToken) {
                return ok({ ok: false, error: "SUPABASE_ACCESS_TOKEN ausente no ambiente/secrets da VPS" });
            }
            const res = await fetchJson(`https://api.supabase.com/v1/projects/${encodeURIComponent(projectRef)}`, {
                Authorization: `Bearer ${env.accessToken}`,
            });
            const project = typeof res.data === "object" && res.data !== null && !Array.isArray(res.data)
                ? projectSafe(res.data)
                : res.data;
            return ok({ ok: res.http >= 200 && res.http < 300, http: res.http, projectRef, project });
        },
    },
    {
        name: "supabase_schema_check",
        description: "Consulta OpenAPI REST do Supabase para verificar se tabelas existem no schema exposto. Apenas leitura.",
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: true,
            title: "Checar schema Supabase",
        },
        inputSchema: z.object({
            projectRef: z.string().optional().describe("Project ref usado para montar URL REST se SUPABASE_URL estiver ausente."),
            tables: z.array(z.string()).optional().describe("Tabelas para verificar. Padrão: contacts, profiles, chat_messages."),
        }),
        handler: async (input, _ctx) => {
            const { restUrl, serviceKey, projectRef } = getRestConfig(input.projectRef);
            const tables = input.tables?.length ? input.tables : ["contacts", "profiles", "chat_messages", "workspaces", "whatsapp_connections"];
            if (!restUrl || !serviceKey) {
                return ok({
                    ok: false,
                    error: "SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY ausentes no ambiente/secrets da VPS",
                    restUrl_set: Boolean(restUrl),
                    key_set: Boolean(serviceKey),
                });
            }
            const authHeaders = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` };
            const openapi = await fetchJson(`${restUrl}/rest/v1/`, authHeaders);
            const definitions = typeof openapi.data === "object" && openapi.data !== null && !Array.isArray(openapi.data)
                ? openapi.data.definitions ?? {}
                : {};
            const tableChecks = [];
            for (const table of tables) {
                const check = await fetchJson(`${restUrl}/rest/v1/${encodeURIComponent(table)}?select=*&limit=1`, authHeaders);
                tableChecks.push({ table, http: check.http, exists: check.http >= 200 && check.http < 300 });
            }
            return ok({
                ok: true,
                projectRef,
                restUrl: maskHost(restUrl),
                openapi_http: openapi.http,
                openapi_table_count: Object.keys(definitions).length,
                openapi_has_contacts: Object.prototype.hasOwnProperty.call(definitions, "contacts"),
                tableChecks,
            });
        },
    },
    {
        name: "supabase_contacts_check",
        description: "Verifica especificamente a tabela contacts e conta amostra por workspace. Apenas leitura; não importa contatos.",
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: true,
            title: "Checar contacts Supabase",
        },
        inputSchema: z.object({
            projectRef: z.string().optional(),
            workspaceId: z.string().optional().describe("Workspace para filtro opcional."),
        }),
        handler: async (input, _ctx) => {
            const { restUrl, serviceKey, projectRef } = getRestConfig(input.projectRef);
            if (!restUrl || !serviceKey) {
                return ok({ ok: false, error: "SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY ausentes", restUrl_set: Boolean(restUrl), key_set: Boolean(serviceKey) });
            }
            const filter = input.workspaceId ? `&workspace_id=eq.${encodeURIComponent(input.workspaceId)}` : "";
            const res = await fetchJson(`${restUrl}/rest/v1/contacts?select=id,workspace_id,name,phone,source&limit=5${filter}`, {
                apikey: serviceKey,
                Authorization: `Bearer ${serviceKey}`,
            });
            const sample = Array.isArray(res.data)
                ? res.data.map((row) => {
                    const r = row;
                    return {
                        id: r.id,
                        workspace_id: r.workspace_id,
                        name_present: Boolean(r.name),
                        phone_present: Boolean(r.phone),
                        source: r.source,
                    };
                })
                : [];
            return ok({
                ok: res.http >= 200 && res.http < 300,
                http: res.http,
                projectRef,
                restUrl: maskHost(restUrl),
                workspace_filter: Boolean(input.workspaceId),
                sample_count: sample.length,
                sample,
            });
        },
    },
];
//# sourceMappingURL=supabase.js.map