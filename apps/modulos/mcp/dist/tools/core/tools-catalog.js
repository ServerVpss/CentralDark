// Catálogo único de tools do MCP CentralDark.
// Centraliza a lista pra que /health, /status.json, /tools.json e o servidor MCP
// vejam exatamente o mesmo conjunto — e gera um hash de versão pra detectar cache antigo.
//
// Auditoria (07/06/2026): conferido que mcp_catalog_diff (mcpDiagnosticsTools),
// vps_run_once_script (vpsRunOnceTools) e github_upload_base64_file (githubWriteTools)
// estão registrados. github_upload_binary_file ainda não existe — listado como
// sugestão em status.ts (criar bumpa CATALOG_VERSION e força replug do cliente).
import { createHash } from "node:crypto";
import { z } from "zod";
import { githubReadTools } from "../github/github-read.js";
import { githubWriteTools } from "../github/github-write.js";
import { githubAdminTools } from "../github/github-admin.js";
import { githubTools } from "../github/github-tools.js";
import { vpsRunOnceTools } from "../vps/vps-run-once.js";
import { vpsFileTools } from "../vps/vps-files.js";
import { vpsLazyTools } from "../vps/vps-lazy.js";
import { conscienciaTools } from "../consciencia/consciencia.js";
import { pendenciasTools } from "../pendencias/pendencias.js";
import { deployTools } from "../deploy/deploy.js";
import { aprendizadoTools } from "../aprendizado/aprendizado.js";
import { skillTools } from "../skills/skill.js";
import { supabaseTools } from "../supabase/supabase.js";
import { mcpAdminTools } from "./mcp-admin.js";
import { mcpDiagnosticsTools } from "./mcp-diagnostics.js";
import { mcpPolicyTools } from "./mcp-policy.js";
import { integrationsTools } from "../integrations.js";
import { painelTools } from "../painel/painel.js";
import { eliteGatewayTools } from "../elite/elite-gateway.js";
import { piveteTools } from "../pivete/pivete-tools.js";
const TOOL_NAME_PATTERN = /^[a-zA-Z0-9_-]{1,64}$/;
const RAW_TOOLS = [
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
    ...mcpDiagnosticsTools,
    ...mcpPolicyTools,
    ...integrationsTools,
    ...painelTools,
    ...eliteGatewayTools,
    ...piveteTools,
];
function isToolDefinition(tool) {
    return (typeof tool === "object" &&
        tool !== null &&
        typeof tool.name === "string" &&
        typeof tool.description === "string" &&
        tool.inputSchema instanceof z.ZodType &&
        typeof tool.handler === "function");
}
export const ALL_TOOLS = RAW_TOOLS.filter(isToolDefinition);
export const CATALOG_PROBLEMS = {
    invalidShape: RAW_TOOLS.length - ALL_TOOLS.length,
    invalidNames: ALL_TOOLS.filter((tool) => !TOOL_NAME_PATTERN.test(tool.name)).map((tool) => tool.name),
    duplicateNames: ALL_TOOLS.map((tool) => tool.name).filter((name, index, all) => all.indexOf(name) !== index),
};
export const TOOL_NAMES = ALL_TOOLS.map((t) => t.name).sort();
function schemaShape(s) {
    if (s instanceof z.ZodObject) {
        const shape = s.shape;
        return Object.keys(shape)
            .sort()
            .map((k) => [k, shape[k] instanceof z.ZodOptional ? "opt" : "req"]);
    }
    return "any";
}
const fingerprint = ALL_TOOLS.map((t) => ({
    name: t.name,
    shape: schemaShape(t.inputSchema),
})).sort((a, b) => a.name.localeCompare(b.name));
export const CATALOG_HASH = createHash("sha256")
    .update(JSON.stringify(fingerprint))
    .digest("hex")
    .slice(0, 12);
export const CATALOG_VERSION = `${TOOL_NAMES.length}-${CATALOG_HASH}`;
export function getCatalogSummary() {
    return {
        toolCount: TOOL_NAMES.length,
        catalogHash: CATALOG_HASH,
        catalogVersion: CATALOG_VERSION,
        problems: CATALOG_PROBLEMS,
        toolNames: TOOL_NAMES,
        tools: ALL_TOOLS.map((tool) => ({
            name: tool.name,
            description: tool.description,
            title: tool.annotations?.title ?? null,
            readOnly: tool.annotations?.readOnlyHint === true,
            destructive: tool.annotations?.destructiveHint === true,
        })).sort((a, b) => a.name.localeCompare(b.name)),
    };
}
//# sourceMappingURL=tools-catalog.js.map