# MISSAO - mcp-diagnostics.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\mcp\src\tools\mcp-diagnostics.ts
**SHA:** 6fcfbdbc2404f957
**Timestamp:** 2026-08-26T19:32:45.471577
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- publicUrl: z.string().url().optional().describe("URL pública do MCP. Padrão: https://mcp.centralldark.com"),

### Gaps
- const missing = expected.filter((name) => !names.includes(name));

### Ouro Bruto (primeiros 5000 chars)
```
import { z } from "zod";
import { aprendizadoTools } from "./aprendizado.js";
import { conscienciaTools } from "./consciencia.js";
import { deployTools } from "./deploy.js";
import { githubAdminTools } from "./github-admin.js";
import { githubReadTools } from "./github-read.js";
import { githubWriteTools } from "./github-write.js";
import { mcpAdminTools } from "./mcp-admin.js";
import { pendenciasTools } from "./pendencias.js";
import { skillTools } from "./skill.js";
import { supabaseTools } from "./supabase.js";
import { vpsFileTools } from "./vps-files.js";
import { vpsTools } from "./vps.js";
import { vpsRunOnceTools } from "./vps-run-once.js";

type AnyTool = {
  name: string;
  description: string;
  inputSchema: z.ZodType;
  annotations?: Record<string, unknown>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: (input: any, ctx: { token: string }) => Promise<any>;
};

function ok(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

const runtimeTools = [
  ...aprendizadoTools,
  ...conscienciaTools,
  ...skillTools,
  ...githubReadTools,
  ...githubWriteTools,
  ...githubAdminTools,
  ...vpsTools,
  ...vpsRunOnceTools,
  ...vpsFileTools,
  ...pendenciasTools,
  ...deployTools,
  ...supabaseTools,
  ...mcpAdminTools,
] as unknown as AnyTool[];

const EXPECTED_SAFE_FULL_ADMIN = [
  "mcp_admin_call",
  "mcp_admin_catalog",
  "mcp_admin_status",
  "mcp_catalog_diff",
  "deploy_validate_mcp_catalog",
  "github_upload_base64_file",
  "github_delete_file_safe",
  "github_delete_branch_safe",
  "github_create_release_safe",
  "github_list_secrets_names",
  "github_get_actions_permissions",
  "vps_git_status",
  "vps_git_diff_safe",
  "vps_run_once_script",
  "script_execute",
  "vps_run_command",
  "vps_listar_pastas_limpaveis",
  "vps_limpar_pasta_projeto",
  "vps_read_file",
  "vps_read_file_safe",
  "vps_write_file_safe",
  "vps_list_directory",
  "vps_list_dir_safe",
  "vps_tree_safe",
  "mcp_policy_summary",
  "mcp_audit_recent_logs",
];

function runtimeNames() {
  return runtimeTools.map((tool) => tool.name).sort();
}

async function fetchJson(url: string) {
  const res = await fetch(url, { headers: { "User-Agent": "MCP-CentralDark/catalog-validator" } });
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return JSON.parse(text);
}

export const mcpDiagnosticsTools = [
  {
    name: "mcp_catalog_diff",
    description: "Compara o catálogo runtime do MCP com a lista mínima esperada para Full Admin seguro e mostra faltantes.",
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false, title: "Diff catálogo MCP" },
    inputSchema: z.object({
      expected: z.array(z.string()).optional().describe("Lista customizada de tools esperadas"),
      filter: z.string().optional().describe("Filtro opcional para listar tools por nome"),
    }),
    handler: async (input: { expected?: string[]; filter?: string }) => {
      const names = runtimeNames();
      const expected = (input.expected && input.expected.length > 0 ? input.expected : EXPECTED_SAFE_FULL_ADMIN).sort();
      const missing = expected.filter((name) => !names.includes(name));
      const presentExpected = expected.filter((name) => names.includes(name));
      const filter = (input.filter ?? "").toLowerCase().trim();
      const filteredTools = filter ? names.filter((name) => name.toLowerCase().includes(filter)) : undefined;

      return ok({
        ok: missing.length === 0,
        status: missing.length === 0 ? "OK" : "FALTANDO_TOOLS",
        runtimeToolCount: names.length,
        expectedCount: expected.length,
        presentExpected,
        missing,
        filteredTools,
        reconnectHint:
          "Se o /tools.json já mostra uma tool mas o ChatGPT não mostra, reconecte o conector. Depois use mcp_admin_call como porta fixa.",
      });
    },
  },
  {
    name: "deploy_validate_mcp_catalog",
    description: "Valida /health e /tools.json públicos do MCP e compara com o catálogo runtime local esperado.",
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true, title: "Validar catálogo público MCP" },
    inputSchema: z.object({
      publicUrl: z.string().url().optional().describe("URL pública do MCP. Padrão: https://mcp.centralldark.com"),
    }),
    handler: async (input: { publicUrl?: string }) => {
      const base = (input.publicUrl ?? "https://mcp.centralldark.com").replace(/\/+$/, "");
      const health = await fetchJson(`${base}/health`);
      const toolsJson = await fetchJson(`${base}/tools.json`);

      const names = runtimeNames();
      const publicTools: string[] = Array.isArray(toolsJson.tools) ? toolsJson.tools : [];
      const publicMissingFromRuntime = names.filter((name) => !publicTools.includes(name));
      const expectedMissingPublic = EXPECTED_SAFE_FULL_ADMIN.filter((name) => !publicT
```

---

# MISSAO - mcp-diagnostics.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-local\CentralDark\apps\mcp\src\tools\mcp-diagnostics.ts
**SHA:** b2e2362eb2f0716d
**Timestamp:** 2026-08-26T19:34:24.493067
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- publicUrl: z.string().url().optional().describe("URL pública do MCP. Padrão: https://mcp.centralldark.com"),

### Gaps
- const missing = expected.filter((name) => !names.includes(name));

### Ouro Bruto (primeiros 5000 chars)
```
import { z } from "zod";
import { aprendizadoTools } from "./aprendizado.js";
import { conscienciaTools } from "./consciencia.js";
import { deployTools } from "./deploy.js";
import { githubAdminTools } from "./github-admin.js";
import { githubReadTools } from "./github-read.js";
import { githubWriteTools } from "./github-write.js";
import { mcpAdminTools } from "./mcp-admin.js";
import { pendenciasTools } from "./pendencias.js";
import { skillTools } from "./skill.js";
import { supabaseTools } from "./supabase.js";
import { vpsTools } from "./vps.js";
import { vpsRunOnceTools } from "./vps-run-once.js";

type AnyTool = {
  name: string;
  description: string;
  inputSchema: z.ZodType;
  annotations?: Record<string, unknown>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: (input: any, ctx: { token: string }) => Promise<any>;
};

function ok(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

const runtimeTools = [
  ...aprendizadoTools,
  ...conscienciaTools,
  ...skillTools,
  ...githubReadTools,
  ...githubWriteTools,
  ...githubAdminTools,
  ...vpsTools,
  ...vpsRunOnceTools,
  ...pendenciasTools,
  ...deployTools,
  ...supabaseTools,
  ...mcpAdminTools,
] as unknown as AnyTool[];

const EXPECTED_SAFE_FULL_ADMIN = [
  "mcp_admin_call",
  "mcp_admin_catalog",
  "mcp_admin_status",
  "mcp_catalog_diff",
  "deploy_validate_mcp_catalog",
  "github_upload_base64_file",
  "github_delete_file_safe",
  "github_delete_branch_safe",
  "github_create_release_safe",
  "github_list_secrets_names",
  "github_get_actions_permissions",
  "vps_git_status",
  "vps_git_diff_safe",
  "vps_run_once_script",
  "vps_listar_pastas_limpaveis",
  "vps_limpar_pasta_projeto",
  "vps_read_file_safe",
  "vps_write_file_safe",
  "vps_list_dir_safe",
  "vps_tree_safe",
  "mcp_policy_summary",
  "mcp_audit_recent_logs",
];

function runtimeNames() {
  return runtimeTools.map((tool) => tool.name).sort();
}

async function fetchJson(url: string) {
  const res = await fetch(url, { headers: { "User-Agent": "MCP-CentralDark/catalog-validator" } });
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return JSON.parse(text);
}

export const mcpDiagnosticsTools = [
  {
    name: "mcp_catalog_diff",
    description: "Compara o catálogo runtime do MCP com a lista mínima esperada para Full Admin seguro e mostra faltantes.",
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false, title: "Diff catálogo MCP" },
    inputSchema: z.object({
      expected: z.array(z.string()).optional().describe("Lista customizada de tools esperadas"),
      filter: z.string().optional().describe("Filtro opcional para listar tools por nome"),
    }),
    handler: async (input: { expected?: string[]; filter?: string }) => {
      const names = runtimeNames();
      const expected = (input.expected && input.expected.length > 0 ? input.expected : EXPECTED_SAFE_FULL_ADMIN).sort();
      const missing = expected.filter((name) => !names.includes(name));
      const presentExpected = expected.filter((name) => names.includes(name));
      const filter = (input.filter ?? "").toLowerCase().trim();
      const filteredTools = filter ? names.filter((name) => name.toLowerCase().includes(filter)) : undefined;

      return ok({
        ok: missing.length === 0,
        status: missing.length === 0 ? "OK" : "FALTANDO_TOOLS",
        runtimeToolCount: names.length,
        expectedCount: expected.length,
        presentExpected,
        missing,
        filteredTools,
        reconnectHint:
          "Se o /tools.json já mostra uma tool mas o ChatGPT não mostra, reconecte o conector. Depois use mcp_admin_call como porta fixa.",
      });
    },
  },
  {
    name: "deploy_validate_mcp_catalog",
    description: "Valida /health e /tools.json públicos do MCP e compara com o catálogo runtime local esperado.",
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true, title: "Validar catálogo público MCP" },
    inputSchema: z.object({
      publicUrl: z.string().url().optional().describe("URL pública do MCP. Padrão: https://mcp.centralldark.com"),
    }),
    handler: async (input: { publicUrl?: string }) => {
      const base = (input.publicUrl ?? "https://mcp.centralldark.com").replace(/\/+$/, "");
      const health = await fetchJson(`${base}/health`);
      const toolsJson = await fetchJson(`${base}/tools.json`);

      const names = runtimeNames();
      const publicTools: string[] = Array.isArray(toolsJson.tools) ? toolsJson.tools : [];
      const publicMissingFromRuntime = names.filter((name) => !publicTools.includes(name));
      const expectedMissingPublic = EXPECTED_SAFE_FULL_ADMIN.filter((name) => !publicTools.includes(name));

      return ok({
        ok: publicMissingFromRuntime.length === 0 && expectedMissingPublic.length === 0,
        base,
      
```

---

# MISSAO - mcp-diagnostics.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\centraldark\apps\modulos\mcp\dist\tools\core\mcp-diagnostics.js
**SHA:** 5306edd648896d98
**Timestamp:** 2026-08-28T02:54:39.147386
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- publicUrl: z.string().url().optional().describe("URL pública do MCP. Padrão: https://mcp.centralldark.com"),

### Gaps
- const missing = expected.filter((name) => !names.includes(name));

### Ouro Bruto (primeiros 5000 chars)
```
import { z } from "zod";
import { aprendizadoTools } from "../aprendizado/aprendizado.js";
import { conscienciaTools } from "../consciencia/consciencia.js";
import { deployTools } from "../deploy/deploy.js";
import { githubAdminTools } from "../github/github-admin.js";
import { githubReadTools } from "../github/github-read.js";
import { githubTools } from "../github/github-tools.js";
import { githubWriteTools } from "../github/github-write.js";
import { mcpAdminTools } from "./mcp-admin.js";
import { pendenciasTools } from "../pendencias/pendencias.js";
import { skillTools } from "../skills/skill.js";
import { supabaseTools } from "../supabase/supabase.js";
import { vpsFileTools } from "../vps/vps-files.js";
import { vpsLazyTools } from "../vps/vps-lazy.js";
import { vpsRunOnceTools } from "../vps/vps-run-once.js";
function ok(data) {
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}
const runtimeTools = [
    ...aprendizadoTools,
    ...conscienciaTools,
    ...skillTools,
    ...githubReadTools,
    ...githubWriteTools,
    ...githubAdminTools,
    ...githubTools,
    ...vpsRunOnceTools,
    ...vpsFileTools,
    ...vpsLazyTools,
    ...pendenciasTools,
    ...deployTools,
    ...supabaseTools,
    ...mcpAdminTools,
];
const EXPECTED_SAFE_FULL_ADMIN = [
    "mcp_admin_call",
    "mcp_admin_catalog",
    "mcp_admin_status",
    "mcp_catalog_diff",
    "deploy_validate_mcp_catalog",
    "github_upload_base64_file",
    "github_delete_file_safe",
    "github_delete_branch_safe",
    "github_create_release_safe",
    "github_list_secrets_names",
    "github_get_actions_permissions",
    "vps_git_status",
    "vps_git_diff_safe",
    "vps_run_once_script",
    "vps_listar_pastas_limpaveis",
    "vps_limpar_pasta_projeto",
    "vps_read_file_safe",
    "vps_write_file_safe",
    "vps_list_dir_safe",
    "vps_tree_safe",
    "mcp_policy_summary",
    "mcp_audit_recent_logs",
];
function runtimeNames() {
    return runtimeTools.map((tool) => tool.name).sort();
}
async function fetchJson(url) {
    const res = await fetch(url, { headers: { "User-Agent": "MCP-CentralDark/catalog-validator" } });
    const text = await res.text();
    if (!res.ok)
        throw new Error(`HTTP ${res.status}: ${url}`);
    return JSON.parse(text);
}
export const mcpDiagnosticsTools = [
    {
        name: "mcp_catalog_diff",
        description: "Compara o catálogo runtime do MCP com a lista mínima esperada para Full Admin seguro e mostra faltantes.",
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false, title: "Diff catálogo MCP" },
        inputSchema: z.object({
            expected: z.array(z.string()).optional().describe("Lista customizada de tools esperadas"),
            filter: z.string().optional().describe("Filtro opcional para listar tools por nome"),
        }),
        handler: async (input) => {
            const names = runtimeNames();
            const expected = (input.expected && input.expected.length > 0 ? input.expected : EXPECTED_SAFE_FULL_ADMIN).sort();
            const missing = expected.filter((name) => !names.includes(name));
            const presentExpected = expected.filter((name) => names.includes(name));
            const filter = (input.filter ?? "").toLowerCase().trim();
            const filteredTools = filter ? names.filter((name) => String(name || "").toLowerCase().includes(filter)) : undefined;
            return ok({
                ok: missing.length === 0,
                status: missing.length === 0 ? "OK" : "FALTANDO_TOOLS",
                runtimeToolCount: names.length,
                expectedCount: expected.length,
                presentExpected,
                missing,
                filteredTools,
                reconnectHint: "Se o /tools.json já mostra uma tool mas o ChatGPT não mostra, reconecte o conector. Depois use mcp_admin_call como porta fixa.",
            });
        },
    },
    {
        name: "deploy_validate_mcp_catalog",
        description: "Valida /health e /tools.json públicos do MCP e compara com o catálogo runtime local esperado.",
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true, title: "Validar catálogo público MCP" },
        inputSchema: z.object({
            publicUrl: z.string().url().optional().describe("URL pública do MCP. Padrão: https://mcp.centralldark.com"),
        }),
        handler: async (input) => {
            const base = (input.publicUrl ?? "https://mcp.centralldark.com").replace(/\/+$/, "");
            const health = await fetchJson(`${base}/health`);
            const toolsJson = await fetchJson(`${base}/tools.json`);
            const names = runtimeNames();
            const publicTools = Array.isArray(toolsJson.toolNames)
                ? toolsJson.toolNames
                : Array.isArray(toolsJson.tools)
                    ? toolsJson.tools
                        .map((tool) => type
```

---

# MISSAO - mcp-diagnostics.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\centraldark\apps\modulos\mcp\src\tools\core\mcp-diagnostics.js
**SHA:** 869cf0f9d41c5589
**Timestamp:** 2026-08-28T02:54:49.046575
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- publicUrl: z.string().url().optional().describe("URL pública do MCP. Padrão: https://mcp.centralldark.com"),

### Gaps
- const missing = expected.filter((name) => !names.includes(name));

### Ouro Bruto (primeiros 5000 chars)
```
import { z } from "zod";
import { aprendizadoTools } from "../aprendizado/aprendizado.js";
import { conscienciaTools } from "../consciencia/consciencia.js";
import { deployTools } from "../deploy/deploy.js";
import { githubAdminTools } from "../github/github-admin.js";
import { githubReadTools } from "../github/github-read.js";
import { githubTools } from "../github/github-tools.js";
import { githubWriteTools } from "../github/github-write.js";
import { mcpAdminTools } from "./mcp-admin.js";
import { pendenciasTools } from "../pendencias/pendencias.js";
import { skillTools } from "../skills/skill.js";
import { supabaseTools } from "../supabase/supabase.js";
import { vpsFileTools } from "../vps/vps-files.js";
import { vpsLazyTools } from "../vps/vps-lazy.js";
import { vpsRunOnceTools } from "../vps/vps-run-once.js";
function ok(data) {
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}
const runtimeTools = [
    ...aprendizadoTools,
    ...conscienciaTools,
    ...skillTools,
    ...githubReadTools,
    ...githubWriteTools,
    ...githubAdminTools,
    ...githubTools,
    ...vpsRunOnceTools,
    ...vpsFileTools,
    ...vpsLazyTools,
    ...pendenciasTools,
    ...deployTools,
    ...supabaseTools,
    ...mcpAdminTools,
];
const EXPECTED_SAFE_FULL_ADMIN = [
    "mcp_admin_call",
    "mcp_admin_catalog",
    "mcp_admin_status",
    "mcp_catalog_diff",
    "deploy_validate_mcp_catalog",
    "github_upload_base64_file",
    "github_delete_file_safe",
    "github_delete_branch_safe",
    "github_create_release_safe",
    "github_list_secrets_names",
    "github_get_actions_permissions",
    "vps_git_status",
    "vps_git_diff_safe",
    "vps_run_once_script",
    "vps_listar_pastas_limpaveis",
    "vps_limpar_pasta_projeto",
    "vps_read_file_safe",
    "vps_write_file_safe",
    "vps_list_dir_safe",
    "vps_tree_safe",
    "mcp_policy_summary",
    "mcp_audit_recent_logs",
];
function runtimeNames() {
    return runtimeTools.map((tool) => tool.name).sort();
}
async function fetchJson(url) {
    const res = await fetch(url, { headers: { "User-Agent": "MCP-CentralDark/catalog-validator" } });
    const text = await res.text();
    if (!res.ok)
        throw new Error(`HTTP ${res.status}: ${url}`);
    return JSON.parse(text);
}
export const mcpDiagnosticsTools = [
    {
        name: "mcp_catalog_diff",
        description: "Compara o catálogo runtime do MCP com a lista mínima esperada para Full Admin seguro e mostra faltantes.",
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false, title: "Diff catálogo MCP" },
        inputSchema: z.object({
            expected: z.array(z.string()).optional().describe("Lista customizada de tools esperadas"),
            filter: z.string().optional().describe("Filtro opcional para listar tools por nome"),
        }),
        handler: async (input) => {
            const names = runtimeNames();
            const expected = (input.expected && input.expected.length > 0 ? input.expected : EXPECTED_SAFE_FULL_ADMIN).sort();
            const missing = expected.filter((name) => !names.includes(name));
            const presentExpected = expected.filter((name) => names.includes(name));
            const filter = (input.filter ?? "").toLowerCase().trim();
            const filteredTools = filter ? names.filter((name) => String(name || "").toLowerCase().includes(filter)) : undefined;
            return ok({
                ok: missing.length === 0,
                status: missing.length === 0 ? "OK" : "FALTANDO_TOOLS",
                runtimeToolCount: names.length,
                expectedCount: expected.length,
                presentExpected,
                missing,
                filteredTools,
                reconnectHint: "Se o /tools.json já mostra uma tool mas o ChatGPT não mostra, reconecte o conector. Depois use mcp_admin_call como porta fixa.",
            });
        },
    },
    {
        name: "deploy_validate_mcp_catalog",
        description: "Valida /health e /tools.json públicos do MCP e compara com o catálogo runtime local esperado.",
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true, title: "Validar catálogo público MCP" },
        inputSchema: z.object({
            publicUrl: z.string().url().optional().describe("URL pública do MCP. Padrão: https://mcp.centralldark.com"),
        }),
        handler: async (input) => {
            const base = (input.publicUrl ?? "https://mcp.centralldark.com").replace(/\/+$/, "");
            const health = await fetchJson(`${base}/health`);
            const toolsJson = await fetchJson(`${base}/tools.json`);
            const names = runtimeNames();
            const publicTools = Array.isArray(toolsJson.toolNames)
                ? toolsJson.toolNames
                : Array.isArray(toolsJson.tools)
                    ? toolsJson.tools
                        .map((tool) => type
```