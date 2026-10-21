import { z } from "zod";
function ok(data) {
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}
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
    "vps_read_file_safe",
    "vps_write_file_safe",
    "vps_list_dir_safe",
    "vps_tree_safe",
    "mcp_policy_summary",
    "mcp_audit_recent_logs",
];
// #OBSERVACOES# @owner apps/modulos/mcp/src/tools/core/mcp-admin.js
// @doc_ref docs/CONSCIENCIA/RECEIPTS/2026-10-06-mcp-unified-capability-catalog-metabolism.md
// @last_updated 2026-10-21T20:00:00Z
// @implementado comparison of dispatcher/HTTP scopes and the 17-route canary gate
// @pendente CI exact SHA, runtime promotion, route readback and rollback receipt
// @estado SOURCE_ONLY @next_cursor CANARY_PR_CI_THEN_RUNTIME_READBACK
// Retired legacy destructive capabilities stay visible in diagnostics, NEVER implicitly re-enabled.
const LEGACY_REQUIRES_SAFETY_REVIEW = Object.freeze([
    "vps_listar_pastas_limpaveis",
    "vps_limpar_pasta_projeto",
]);
const EXPECTED_CANARY_ROUTES = Object.freeze([
    "ZENDRIVE_VSCODE_REMOTE_SSH",
    "FIGMA_MCP_ACCOUNT",
    "FIGMA_CENTRALDARK_FIGJAM",
    "RDC_VPS_CENTRALDARK_OS",
]);
async function runtimeSnapshot() {
    // Read the SAME live dispatcher registry and its canonical catalog handler.
    // A public /tools.json list and a 86-tool legacy registry are NOT equal scopes.
    const mod = await import("./mcp-admin.js");
    const tools = mod.getDispatcherRuntimeTools();
    const names = [...new Set(tools.map((tool) => tool.name))].sort();
    const catalogTool = tools.find((tool) => tool.name === "mcp_admin_catalog");
    if (!catalogTool?.handler) throw new Error("MCP_ADMIN_CATALOG_UNAVAILABLE");
    const result = await catalogTool.handler({});
    const catalog = JSON.parse(result?.content?.find((part) => part.type === "text")?.text ?? "{}");
    if (catalog.ok !== true || !Array.isArray(catalog.routes)) {
        throw new Error("MCP_ADMIN_CATALOG_INVALID");
    }
    const routeNames = [...new Set(catalog.routes.map((route) => route.id))].sort();
    return {
        names, routeNames,
        catalogScope: catalog.catalogScope,
        catalogFingerprint: catalog.catalogFingerprint,
        advertisedToolCount: catalog.totalRuntimeTools,
        routeCount: catalog.routeCount,
        routeParity: catalog.routeCount === routeNames.length,
        missingCanaryRoutes: EXPECTED_CANARY_ROUTES.filter((id) => !routeNames.includes(id)),
        legacySafetyReview: LEGACY_REQUIRES_SAFETY_REVIEW.map((name) => ({
            name, present: names.includes(name), reviewRequired: true,
        })),
    };
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
            const snapshot = await runtimeSnapshot();
            const names = snapshot.names;
            const expected = (input.expected && input.expected.length > 0 ? input.expected : EXPECTED_SAFE_FULL_ADMIN).sort();
            const missing = expected.filter((name) => !names.includes(name));
            const presentExpected = expected.filter((name) => names.includes(name));
            const filter = (input.filter ?? "").toLowerCase().trim();
            const filteredTools = filter ? names.filter((name) => String(name || "").toLowerCase().includes(filter)) : undefined;
            return ok({
                ok: missing.length === 0 && snapshot.missingCanaryRoutes.length === 0 && snapshot.routeParity,
                status: missing.length || snapshot.missingCanaryRoutes.length || !snapshot.routeParity ? "DRIFT" : "OK",
                runtimeToolCount: names.length,
                catalogScope: snapshot.catalogScope,
                catalogFingerprint: snapshot.catalogFingerprint,
                routeCount: snapshot.routeCount,
                routeIds: snapshot.routeNames,
                routeParity: snapshot.routeParity,
                missingCanaryRoutes: snapshot.missingCanaryRoutes,
                legacySafetyReview: snapshot.legacySafetyReview,
                expectedCount: expected.length,
                presentExpected,
                missing,
                filteredTools,
                reconnectHint: "Se o /tools.json já mostra uma tool mas o cliente não mostra, reconecte o conector. Depois use mcp_admin_call como porta fixa.",
            });
        },
    },
    {
        name: "deploy_validate_mcp_catalog",
        description: "Valida /health e /tools.json públicos do MCP (mcp.centralldark.com) e compara com o catálogo do dispatcher. Não cria rota de deploy na API.",
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true, title: "Validar catálogo público MCP" },
        inputSchema: z.object({
            publicUrl: z.string().url().optional().describe("URL pública do MCP. Padrão: https://mcp.centralldark.com"),
        }),
        handler: async (input) => {
            const base = (input.publicUrl ?? "https://mcp.centralldark.com").replace(/\/+$/, "");
            const health = await fetchJson(`${base}/health`);
            const toolsJson = await fetchJson(`${base}/tools.json`);
            const snapshot = await runtimeSnapshot();
            const names = snapshot.names;
            const publicTools = Array.isArray(toolsJson.toolNames)
                ? toolsJson.toolNames
                : Array.isArray(toolsJson.tools)
                    ? toolsJson.tools
                        .map((tool) => typeof tool === "string"
                        ? tool
                        : typeof tool === "object" && tool !== null && "name" in tool
                            ? String(tool.name ?? "")
                            : "")
                        .filter(Boolean)
                    : [];
            const publicMissingFromRuntime = names.filter((name) => !publicTools.includes(name));
            const publicOnly = publicTools.filter((name) => !names.includes(name));
            const expectedMissingPublic = EXPECTED_SAFE_FULL_ADMIN.filter((name) => !publicTools.includes(name));
            return ok({
                ok: publicMissingFromRuntime.length === 0 && expectedMissingPublic.length === 0 && snapshot.missingCanaryRoutes.length === 0 && snapshot.routeParity,
                base,
                surface: "mcp.centralldark.com",
                apiDeployRoute: false,
                health,
                runtimeToolCount: names.length,
                catalogScope: snapshot.catalogScope,
                catalogFingerprint: snapshot.catalogFingerprint,
                routeCount: snapshot.routeCount,
                routeIds: snapshot.routeNames,
                routeParity: snapshot.routeParity,
                missingCanaryRoutes: snapshot.missingCanaryRoutes,
                legacySafetyReview: snapshot.legacySafetyReview,
                publicToolCount: publicTools.length,
                catalogMatchesRuntime: publicMissingFromRuntime.length === 0,
                comparisonSemantics: "RUNTIME_SUBSET_OF_PUBLIC_NOT_EQUAL_SCOPE",
                publicOnlyCount: publicOnly.length,
                publicOnly,
                publicMissingFromRuntime,
                expectedMissingPublic,
                checkedAt: new Date().toISOString(),
            });
        },
    },
];
