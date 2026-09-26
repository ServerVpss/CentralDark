# COMANDO - supabase.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\mcp\src\tools\supabase.ts
**SHA:** 2a74c1340c6f0253
**Timestamp:** 2026-08-26T19:32:45.499385
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- projectRef: z.string().optional().describe("Project ref Supabase. Padrão: SUPABASE_PROJECT_REF ou multizap."),
- tables: z.array(z.string()).optional().describe("Tabelas para verificar. Padrão: contacts, profiles, chat_messages."),

### Ouro Bruto (primeiros 5000 chars)
```
import { existsSync, readFileSync } from "node:fs";
import { z } from "zod";

type Ctx = { token: string };
type Json = Record<string, unknown> | unknown[] | string | number | boolean | null;

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

function ok(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

function readEnvFiles(): Record<string, string> {
  const env: Record<string, string> = {};

  for (const file of SECRET_ENV_FILES) {
    if (!existsSync(file)) continue;

    try {
      const raw = readFileSync(file, "utf8");
      for (const originalLine of raw.split(/\r?\n/)) {
        let line = originalLine.trim();
        if (!line || line.startsWith("#") || !line.includes("=")) continue;
        if (line.startsWith("export ")) line = line.slice("export ".length).trim();

        const idx = line.indexOf("=");
        const key = line.slice(0, idx).trim();
        let value = line.slice(idx + 1).trim();
        value = value.replace(/^['\"]|['\"]$/g, "");

        if (!key || !value || value.includes("${")) continue;
        if (!(key in env)) env[key] = value;
      }
    } catch {
      // Mantém a tool resiliente se algum arquivo local não puder ser lido.
    }
  }

  const processEnv = Object.fromEntries(
    Object.entries(process.env).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
  );

  return { ...env, ...processEnv };
}

function getSupabaseEnv() {
  const env = readEnvFiles();

  return {
    accessToken: env.SUPABASE_ACCESS_TOKEN ?? "",
    projectRef: env.SUPABASE_PROJECT_REF ?? "lyoigsqluyktoclwdaft",
    restUrl: (env.SUPABASE_URL || env.VITE_SUPABASE_URL || "").replace(/\/$/, ""),
    serviceKey:
      env.SUPABASE_SERVICE_ROLE_KEY ||
      env.SUPABASE_SERVICE_KEY ||
      env.SUPABASE_KEY ||
      env.VITE_SUPABASE_ANON_KEY ||
      "",
  };
}

function maskHost(url: string): string {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    const [first] = parsed.hostname.split(".");
    return `${parsed.protocol}//${first}...`;
  } catch {
    return `${url.slice(0, 18)}...`;
  }
}

function projectSafe(project: Record<string, unknown>) {
  return {
    id: project.id,
    name: project.name,
    region: project.region,
    status: project.status,
    created_at: project.created_at,
  };
}

async function fetchJson(url: string, headers: Record<string, string>): Promise<{ http: number; data: Json }> {
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
    return { http: res.status, data: JSON.parse(raw) as Json };
  } catch {
    return { http: res.status, data: raw.slice(0, 500) };
  }
}

function getRestConfig(projectRef?: string) {
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
    handler: async (_input: Record<string, never>, _ctx: Ctx) => {
      const { accessToken } = getSupabaseEnv();
      if (!accessToken) {
        return ok({ ok: false, error: "SUPABASE_ACCESS_TOKEN ausente no ambiente/secrets da VPS" });
      }

      const res = await fetchJson("https://api.supabase.com/v1/projects", {
        Authorization: `Bearer ${accessToken}`,
      });

      const projects = Array.isArray(res.data)
        ? res.data
            .filter((p): p is Record<string, unknown> => typeof p === "object" && p !== null)
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
    inputSchema: z.objec
```

---

# COMANDO - supabase.yaml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\infrastructure\tools\mcp\supabase.yaml
**SHA:** 350bd31537dfef9c
**Timestamp:** 2026-08-28T02:02:16.707936
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- - pattern: authenticated_user
- - pattern: user_owned_rows
- - pattern: role_based_access
- - pattern: team_member_access
- - pattern: table_changes
- - pattern: filtered_changes
- - pattern: user_specific_changes
- - pattern: missing_rls_policies
- - pattern: overly_permissive_policies
- - pattern: hardcoded_uuids_in_migrations

### Ouro Bruto (primeiros 5000 chars)
```
tool:
  schema_version: 2.0
  id: supabase
  type: mcp
  name: Supabase Platform Management
  version: 1.0.0
  description: Supabase project and database management with SQL execution, migrations, RLS policies, and real-time subscriptions
  knowledge_strategy: executable

  executable_knowledge:
    validators:
      # Validator for execute_sql
      - id: validate-execute-sql
        validates: execute_sql
        language: javascript
        checks:
          - required_fields: [project_id, query]
          - sql_injection_prevention: true
        function: |
          (function() {
            const errors = [];

            // 1. Required fields
            if (!args.args.project_id) {
              errors.push("project_id is required");
            }
            if (!args.args.query) {
              errors.push("query is required");
            }

            // 2. Validate project_id format (proj_xxx)
            if (args.args.project_id && !/^proj_[a-z0-9_]+$/i.test(args.args.project_id)) {
              errors.push("project_id must match format: proj_[id]");
            }

            // 3. Basic SQL injection prevention
            if (args.args.query) {
              const query = args.args.query.toLowerCase();
              // Check for dangerous patterns
              if (query.includes('drop table') || query.includes('drop database')) {
                errors.push("DROP operations not allowed via execute_sql - use apply_migration");
              }
              // Check for DDL operations
              if (query.match(/\b(create|alter|drop)\s+(table|index|view|function|trigger)/)) {
                errors.push("DDL operations not allowed in execute_sql - use apply_migration instead");
              }
            }

            return {
              valid: errors.length === 0,
              errors: errors
            };
          })();

      # Validator for apply_migration
      - id: validate-apply-migration
        validates: apply_migration
        language: javascript
        checks:
          - required_fields: [project_id, name, query]
          - migration_name_format: snake_case
        function: |
          (function() {
            const errors = [];

            // 1. Required fields
            if (!args.args.project_id) {
              errors.push("project_id is required");
            }
            if (!args.args.name) {
              errors.push("name is required");
            }
            if (!args.args.query) {
              errors.push("query is required");
            }

            // 2. Validate migration name format (snake_case)
            if (args.args.name && !/^[a-z0-9_]+$/.test(args.args.name)) {
              errors.push("migration name must be snake_case (lowercase letters, numbers, underscores only)");
            }

            // 3. Check for hardcoded IDs in data migrations
            if (args.args.query && args.args.query.match(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i)) {
              errors.push("WARNING: Migration contains hardcoded UUID - consider using generated IDs instead");
            }

            return {
              valid: errors.length === 0,
              errors: errors
            };
          })();

      # Validator for create_branch
      - id: validate-create-branch
        validates: create_branch
        language: javascript
        checks:
          - required_fields: [project_id, confirm_cost_id]
          - branch_name_format: true
        function: |
          (function() {
            const errors = [];

            // 1. Required fields
            if (!args.args.project_id) {
              errors.push("project_id is required");
            }
            if (!args.args.confirm_cost_id) {
              errors.push("confirm_cost_id is required - call confirm_cost first");
            }

            // 2. Validate branch name if provided
            if (args.args.name && !/^[a-z0-9-]+$/.test(args.args.name)) {
              errors.push("branch name must be lowercase letters, numbers, and hyphens only");
            }

            return {
              valid: errors.length === 0,
              errors: errors
            };
          })();

      # Validator for deploy_edge_function
      - id: validate-deploy-edge-function
        validates: deploy_edge_function
        language: javascript
        checks:
          - required_fields: [project_id, name, files]
          - file_structure: true
        function: |
          (function() {
            const errors = [];

            // 1. Required fields
            if (!args.args.project_id) {
              errors.push("project_id is required");
            }
            if (!args.args.name) {
              errors.push("name is required");
            }
            if (!args.args.files) {
              errors.push("files array is required");
            }

            // 2. Validate files structure
            if (args.args.files) {
              if (!Arra
```

---

# COMANDO - supabase.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\centraldark\apps\modulos\mcp\dist\tools\supabase\supabase.js
**SHA:** 19b07a0212360f65
**Timestamp:** 2026-08-28T02:54:41.826364
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- projectRef: z.string().optional().describe("Project ref Supabase. Padrão: SUPABASE_PROJECT_REF ou multizap."),
- tables: z.array(z.string()).optional().describe("Tabelas para verificar. Padrão: contacts, profiles, chat_messages."),

### Ouro Bruto (primeiros 5000 chars)
```
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
   
```

---

# COMANDO - supabase.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\centraldark\apps\modulos\mcp\src\tools\supabase\supabase.js
**SHA:** 1f1115eb6706bc56
**Timestamp:** 2026-08-28T02:54:50.880083
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- projectRef: z.string().optional().describe("Project ref Supabase. Padrão: SUPABASE_PROJECT_REF ou multizap."),
- tables: z.array(z.string()).optional().describe("Tabelas para verificar. Padrão: contacts, profiles, chat_messages."),

### Ouro Bruto (primeiros 5000 chars)
```
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
   
```