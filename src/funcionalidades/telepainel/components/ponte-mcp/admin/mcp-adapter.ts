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
    uptimeSeconds: 0,
    version: "n/d",
    lastError: "Endpoint /health não respondeu — usando fallback",
    lastErrorAt: new Date().toISOString(),
  };
}

export async function fetchTools(): Promise<McpTool[]> {
  try {
    const res = await withTimeout(`${MCP_PUBLIC_URL}/tools.json`);
    if (res.ok) {
      const j = await res.json();
      const raw: any[] = j.tools ?? j ?? [];
      return raw.map((t) => ({
        name: t.name,
        description: t.description ?? "",
        category: t.category ?? inferCategory(t.name),
        risk: t.risk ?? inferRisk(t.name, t.destructive),
        destructive: t.destructive,
        requiresConfirmation: t.requiresConfirmation,
      }));
    }
  } catch {
    /* fallback */
  }
  return FALLBACK_TOOLS;
}

export async function fetchAudit(): Promise<AuditEntry[]> {
  try {
    const res = await withTimeout(`${MCP_PUBLIC_URL}/admin/audit`);
    if (res.ok) {
      const j = await res.json();
      return j.entries ?? [];
    }
  } catch {
    /* fallback */
  }
  return [];
}

export async function fetchOAuthClients(): Promise<OAuthClient[]> {
  try {
    const res = await withTimeout(`${MCP_PUBLIC_URL}/admin/oauth-clients`);
    if (res.ok) {
      const j = await res.json();
      return j.clients ?? [];
    }
  } catch {
    /* fallback */
  }
  return [];
}

// --------- Fallback estático (nomes conhecidos do MCP CentralDark) ---------
const KNOWN_TOOLS = [
  "kit_boas_vindas", "puxar_aprendizados", "registrar_aprendizado", "ler_consciencia",
  "ler_pendencias", "ler_regras_inviolaveis", "ler_instalador", "adicionar_pendencia",
  "fechar_pendencia", "atualizar_consciencia", "skill_listar", "skill_instalar",
  "skill_status", "skill_atualizar", "consultar_memoria_reserva", "consolidar_pensamento",
  "injetar_consciencia_centraldark", "analise_de_estado_cognitivo",
  "github_viewer", "github_list_repos", "github_get_repo", "github_list_issues",
  "github_list_pull_requests", "github_get_file", "github_list_commits",
  "github_list_workflow_runs", "github_search_code", "github_check_token",
  "github_create_issue", "github_comment_issue", "github_close_issue",
  "github_create_pull_request", "github_create_branch", "github_merge_pull_request",
  "github_create_or_update_file", "github_rerun_workflow_run", "github_rerun_failed_jobs",
  "github_cancel_workflow_run", "github_delete_workflow_run", "github_dispatch_workflow",
  "github_list_workflows", "github_upload_base64_file", "github_delete_file_safe",
  "github_delete_branch_safe", "github_create_release_safe", "github_list_webhooks",
  "github_test_webhook", "github_list_secrets_names", "github_list_repo_variables",
  "github_set_repo_variable", "github_list_environments", "github_get_actions_permissions",
  "github_read", "github_commit", "github_dispatch",
  "vps_git_status", "vps_git_diff_safe", "vps_run_once_script", "vps_read_file_safe",
  "vps_write_file_safe", "vps_list_dir_safe", "vps_tree_safe",
  "read_file", "search_files", "execute_command",
  "pendencias_list", "pendencias_add", "pendencias_close",
  "deploy_status", "deploy_validate_mcp_catalog",
  "supabase_projects", "supabase_project_status", "supabase_schema_check", "supabase_contacts_check",
  "code_reviewer", "mcp_status", "mcp_admin_catalog", "mcp_admin_status",
  "mcp_admin_call", "mcp_catalog_diff", "mcp_policy_summary", "mcp_audit_recent_logs",
  "linear_listar_issues", "linear_criar_issue", "linear_atualizar_issue",
  "linear_listar_equipes", "linear_listar_ciclos",
  "notion_buscar", "notion_ler_pagina", "notion_criar_pagina", "notion_anexar_paragrafo",
  "sentry_listar_issues", "sentry_detalhe_issue", "sentry_resolver_issue", "sentry_status_credenciais",
  "atualizar_painel", "elite_gateway_chat", "elite_gateway_status", "elite_gateway_logs",
  "gemini_analisar", "gemini_status", "hermes_status", "hermes_logs", "hermes_dispatch_mission",
  "darkai_chat", "darkai_status",
];

export const FALLBACK_TOOLS: McpTool[] = KNOWN_TOOLS.map((name) => ({
  name,
  description: "",
  category: inferCategory(name),
  risk: inferRisk(name),
}));

// --------- Configuração de conector (para Claude Desktop / Cursor / Codex) ---------
export function buildClaudeDesktopConfig(chave: string): object {
  return {
    mcpServers: {
      centraldark: {
        command: "npx",
        args: ["-y", "@modelcontextprotocol/server-fetch", MCP_ENDPOINT],
        env: {
          MCP_HEADER_X_PONTE_CHAVE: chave || "COLE_SUA_CHAVE_AQUI",
        },
      },
    },
  };
}

export function buildCursorConfig(chave: string): object {
  return {
    mcpServers: {
      centraldark: {
        url: MCP_ENDPOINT,
        transport: "http",
        headers: {
          "x-ponte-chave": chave || "COLE_SUA_CHAVE_AQUI",
        },
      },
    },
  };
}

export function buildCodexConfig(chave: string): object {
  return {
    servers: [
      {
        name: "centraldark",
        endpoint: MCP_ENDPOINT,
        auth: {
          type: "header",
          header: "x-ponte-chave",
          value: chave || "COLE_SUA_CHAVE_AQUI",
        },
      },
    ],
  };
}
