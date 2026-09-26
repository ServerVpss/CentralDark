# COMANDO - mcp-adapter.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\src\apps\modulos\telepainel\components\ponte-mcp\admin\mcp-adapter.ts
**SHA:** 948d41b2c02fcad1
**Timestamp:** 2026-08-28T02:57:42.769913
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
- export type ToolRisk = "leitura" | "escrita" | "execucao" | "deploy" | "protegida";
- risk: ToolRisk;
- risk: t.risk ?? inferRisk(t.name, t.destructive),
- risk: inferRisk(name),

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Camada de dados do painel admin do MCP.
 * Tenta buscar dados reais do MCP público (mcp.centralldark.com) via endpoints
 * conhecidos. Se não existirem, cai em fallback tipado — build nunca quebra.
 *
 * Endpoints esperados (documentação):
 *  - GET  https://mcp.centralldark.com/health           → { status, uptime, version, ... }
 *  - GET  https://mcp.centralldark.com/tools.json       → { tools: [{name, description, ...}] }
 *  - GET  https://mcp.centralldark.com/admin/audit      → { entries: [...] }
 *  - GET  https://mcp.centralldark.com/admin/oauth-clients → { clients: [...] }
 *
 * Nenhum secret é enviado — chamadas são anônimas de leitura pública.
 */

export const MCP_PUBLIC_URL = "https://mcp.centralldark.com";
export const MCP_ENDPOINT = `${MCP_PUBLIC_URL}/mcp`;

export type ToolRisk = "leitura" | "escrita" | "execucao" | "deploy" | "protegida";
export type ToolCategory =
  | "VPS"
  | "GitHub"
  | "Consciência"
  | "Supabase"
  | "Deploy"
  | "Logs"
  | "Admin"
  | "Cognitivas"
  | "Integrações"
  | "Outras";

export interface McpTool {
  name: string;
  description: string;
  category: ToolCategory;
  risk: ToolRisk;
  destructive?: boolean;
  requiresConfirmation?: boolean;
}

export interface McpHealth {
  status: "online" | "degraded" | "offline";
  totalTools: number;
  activeTools: number;
  blockedTools: number;
  uptimeSeconds: number;
  version: string;
  lastError?: string | null;
  lastErrorAt?: string | null;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  tool: string;
  client: string;
  status: "ok" | "erro" | "bloqueado";
  durationMs: number;
  errorSanitized?: string | null;
}

export interface OAuthClient {
  id: string;
  name: string;
  scopes: string[];
  categoriesAllowed: ToolCategory[];
  expiresAt: string | null;
  partialAccess?: boolean;
}

// --------- Heurísticas de categoria/risco (aplicadas a nomes de tools) ---------
export function inferCategory(name: string): ToolCategory {
  const n = name.toLowerCase();
  if (n.startsWith("vps_")) return "VPS";
  if (n.startsWith("github_")) return "GitHub";
  if (n.startsWith("supabase_")) return "Supabase";
  if (n.startsWith("deploy_")) return "Deploy";
  if (n.startsWith("mcp_admin") || n.startsWith("mcp_")) return "Admin";
  if (n.includes("log") || n.includes("audit")) return "Logs";
  if (
    n.startsWith("ler_") ||
    n.startsWith("skill_") ||
    n.includes("consciencia") ||
    n.includes("aprendizado") ||
    n.includes("pendencia") ||
    n.includes("memoria") ||
    n.includes("pensamento") ||
    n.includes("cognitivo") ||
    n.includes("boas_vindas")
  )
    return "Consciência";
  if (
    n.startsWith("notion_") ||
    n.startsWith("linear_") ||
    n.startsWith("sentry_") ||
    n.startsWith("gemini_") ||
    n.startsWith("darkai_") ||
    n.startsWith("elite_") ||
    n.startsWith("hermes_")
  )
    return "Integrações";
  if (n === "execute_command" || n === "read_file" || n === "search_files") return "VPS";
  return "Outras";
}

export function inferRisk(name: string, destructive?: boolean): ToolRisk {
  const n = name.toLowerCase();
  if (destructive) return "protegida";
  if (n.includes("delete") || n.includes("apagar") || n.includes("drop")) return "protegida";
  if (n === "execute_command" || n.startsWith("vps_run") || n.startsWith("hermes_dispatch")) return "execucao";
  if (n.startsWith("deploy_") || n.includes("dispatch") || n.includes("rerun") || n.includes("merge")) return "deploy";
  if (
    n.includes("write") ||
    n.includes("commit") ||
    n.includes("create") ||
    n.includes("update") ||
    n.includes("set") ||
    n.includes("close") ||
    n.includes("add") ||
    n.includes("atualizar") ||
    n.includes("registrar") ||
    n.includes("consolidar")
  )
    return "escrita";
  return "leitura";
}

const withTimeout = async (url: string, timeoutMs = 4000): Promise<Response> => {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: ctrl.signal, headers: { accept: "application/json" } });
  } finally {
    clearTimeout(t);
  }
};

// --------- FETCHERS (com fallback) ---------
export async function fetchHealth(): Promise<McpHealth> {
  try {
    const res = await withTimeout(`${MCP_PUBLIC_URL}/health`);
    if (res.ok) {
      const j = await res.json();
      return {
        status: j.status ?? "online",
        totalTools: j.totalTools ?? j.tools_total ?? FALLBACK_TOOLS.length,
        activeTools: j.activeTools ?? j.tools_active ?? FALLBACK_TOOLS.length,
        blockedTools: j.blockedTools ?? 0,
        uptimeSeconds: j.uptime ?? j.uptimeSeconds ?? 0,
        version: j.version ?? "desconhecida",
        lastError: j.lastError ?? null,
        lastErrorAt: j.lastErrorAt ?? null,
      };
    }
  } catch {
    /* fallback */
  }
  return {
    status: "degraded",
    totalTools: FALLBACK_TOOLS.length,
    activeTools: FALLBACK_TOOLS.length,
    blockedTools: 0,
    up
```