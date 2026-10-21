import { z } from "zod";
function ok(data) {
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}
// Espelha os grupos registrados no dispatcher mcp_admin_call.
// Superfícies distintas são reportadas explicitamente, não ocultadas.
const EXPECTED_PUBLIC_FULL_ADMIN = [
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
const EXPECTED_SAFE_DISPATCHER = EXPECTED_PUBLIC_FULL_ADMIN;
const PUBLIC_ONLY_SURFACE_TOOLS = new Set([
    "mcp_catalog_diff", "deploy_validate_mcp_catalog", "mcp_policy_summary", "mcp_audit_recent_logs",
]);

function nameSet(values) {
    return [...new Set(values.filter((name) => typeof name === "string" && name.length > 0))].sort();
}
export function reconcileCatalogNames(runtimeNames, publicNames, expectedNames = EXPECTED_PUBLIC_FULL_ADMIN) {
    const runtime = nameSet(runtimeNames);
    const published = nameSet(publicNames);
    const expected = nameSet(expectedNames);
    const runtimeDuplicates = runtimeNames.filter((name, index) => runtimeNames.indexOf(name) !== index);
    const publicDuplicates = publicNames.filter((name, index) => publicNames.indexOf(name) !== index);
    const dispatcherMissingFromPublic = runtime.filter((name) => !published.includes(name));
    const publicOnly = published.filter((name) => !runtime.includes(name));
    const expectedMissingPublic = expected.filter((name) => !published.includes(name));
    const classifiedPublicOnly = publicOnly.filter((name) => PUBLIC_ONLY_SURFACE_TOOLS.has(name));
    const unclassifiedPublicOnly = publicOnly.filter((name) => !PUBLIC_ONLY_SURFACE_TOOLS.has(name));
    const duplicateRuntime = nameSet(runtimeDuplicates);
    const duplicatePublic = nameSet(publicDuplicates);
    const ok = dispatcherMissingFromPublic.length === 0 && expectedMissingPublic.length === 0
        && unclassifiedPublicOnly.length === 0 && duplicateRuntime.length === 0 && duplicatePublic.length === 0;
    return { ok, status: ok ? "OK" : "CATALOG_DIVERGENCE", runtimeToolCount: runtime.length,
        publicToolCount: published.length, expectedCount: expected.length,
        dispatcherMissingFromPublic, publicOnly, classifiedPublicOnly, unclassifiedPublicOnly, expectedMissingPublic,
        runtimeDuplicates: duplicateRuntime, publicDuplicates: duplicatePublic };
}
async function runtimeNames() {
    const mod = await import("./mcp-admin.js");
    return mod.getDispatcherRuntimeTools().map((tool) => tool.name);
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
            const names = await runtimeNames();
            const expected = nameSet(input.expected && input.expected.length > 0 ? input.expected : EXPECTED_SAFE_DISPATCHER);
            const missing = expected.filter((name) => !names.includes(name));
            const presentExpected = expected.filter((name) => names.includes(name));
            const filter = (input.filter ?? "").toLowerCase().trim();
            const filteredTools = filter ? nameSet(names).filter((name) => name.toLowerCase().includes(filter)) : undefined;
            return ok({ ok: missing.length === 0, status: missing.length === 0 ? "OK" : "FALTANDO_TOOLS",
                runtimeToolCount: nameSet(names).length,
                runtimeDuplicates: nameSet(names.filter((name, index) => names.indexOf(name) !== index)),
                expectedCount: expected.length, presentExpected, missing, filteredTools,
                reconnectHint: "Se o /tools.json já mostra uma tool mas o cliente não mostra, reconecte o conector. Depois use mcp_admin_call como porta fixa." });
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
            const names = await runtimeNames();
            const publicTools = Array.isArray(toolsJson.toolNames) ? toolsJson.toolNames
                : Array.isArray(toolsJson.tools) ? toolsJson.tools.map((tool) => typeof tool === "string"
                    ? tool : typeof tool === "object" && tool !== null && "name" in tool ? String(tool.name ?? "") : "").filter(Boolean) : [];
            const comparison = reconcileCatalogNames(names, publicTools, EXPECTED_PUBLIC_FULL_ADMIN);
            return ok({ ...comparison, base, surface: "mcp.centralldark.com", apiDeployRoute: false,
                health, dispatcherSurface: "mcp_admin_call runtimeTools", publicSurface: "/tools.json",
                catalogMatchesRuntime: comparison.dispatcherMissingFromPublic.length === 0 && comparison.unclassifiedPublicOnly.length === 0,
                checkedAt: new Date().toISOString(),
                evidenceBoundary: "CATALOG_DECLARATION != CLIENT_READBACK != EXECUTION_PROOF" });
        },
    },
];
//# sourceMappingURL=mcp-diagnostics.js.map