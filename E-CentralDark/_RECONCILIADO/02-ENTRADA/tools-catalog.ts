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
import { githubReadTools } from "./tools/github-read.js";
import { githubWriteTools } from "./tools/github-write.js";
import { githubAdminTools } from "./tools/github-admin.js";
import { vpsTools } from "./tools/vps.js";
import { vpsRunOnceTools } from "./tools/vps-run-once.js";
import { vpsFileTools } from "./tools/vps-files.js";
import { conscienciaTools } from "./tools/consciencia.js";
import { pendenciasTools } from "./tools/pendencias.js";
import { deployTools } from "./tools/deploy.js";
import { aprendizadoTools } from "./tools/aprendizado.js";
import { skillTools } from "./tools/skill.js";
import { supabaseTools } from "./tools/supabase.js";
import { mcpAdminTools } from "./tools/mcp-admin.js";
import { mcpDiagnosticsTools } from "./tools/mcp-diagnostics.js";
import { mcpPolicyTools } from "./tools/mcp-policy.js";
import { integrationsTools } from "./tools/integrations.js";

type AnyTool = {
  name: string;
  description: string;
  inputSchema: z.ZodType;
  annotations?: Record<string, unknown>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: (input: any, ctx: { token: string }) => Promise<any>;
};

export const ALL_TOOLS = [
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
  ...mcpDiagnosticsTools,
  ...mcpPolicyTools,
  ...integrationsTools,
] as unknown as AnyTool[];

export const TOOL_NAMES: ReadonlyArray<string> = ALL_TOOLS.map((t) => t.name).sort();

function schemaShape(s: z.ZodType): unknown {
  if (s instanceof z.ZodObject) {
    const shape = s.shape as Record<string, z.ZodType>;
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

export const CATALOG_HASH: string = createHash("sha256")
  .update(JSON.stringify(fingerprint))
  .digest("hex")
  .slice(0, 12);

export const CATALOG_VERSION = `${TOOL_NAMES.length}-${CATALOG_HASH}`;

export function getCatalogSummary() {
  return {
    toolCount: TOOL_NAMES.length,
    catalogHash: CATALOG_HASH,
    catalogVersion: CATALOG_VERSION,
    tools: TOOL_NAMES,
  };
}
