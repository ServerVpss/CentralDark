module.exports = [
"[project]/src/shared/constants/managementScopes.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Management API key scopes — the set of API key scopes that authorize a
 * Bearer key on management routes (`/api/*` excluding `/api/v1/*` and the
 * public allowlist).
 *
 * Single source of truth shared by:
 *   - `src/lib/api/requireManagementAuth.ts` (`hasManageScope`)
 *   - `src/shared/utils/apiAuth.ts` (`validateBearerApiKeyForManagement`)
 *
 * Keep both helpers in sync by importing `MANAGEMENT_API_KEY_SCOPES` from
 * here — never re-declare the list inline.
 */ /** Canonical scope name granted to the default environment key. */ __turbopack_context__.s([
    "MANAGEMENT_API_KEY_SCOPES",
    ()=>MANAGEMENT_API_KEY_SCOPES,
    "MANAGE_SCOPE",
    ()=>MANAGE_SCOPE,
    "MCP_CONNECT_SCOPE",
    ()=>MCP_CONNECT_SCOPE,
    "hasManageScope",
    ()=>hasManageScope,
    "hasMcpConnectOrManageScope",
    ()=>hasMcpConnectOrManageScope
]);
const MANAGE_SCOPE = "manage";
const MANAGEMENT_API_KEY_SCOPES = new Set([
    "manage",
    "admin"
]);
const MCP_CONNECT_SCOPE = "mcp:connect";
function hasMcpConnectOrManageScope(scopes = []) {
    if (hasManageScope(scopes)) return true;
    return scopes.includes(MCP_CONNECT_SCOPE);
}
function hasManageScope(scopes = []) {
    for (const scope of scopes){
        if (MANAGEMENT_API_KEY_SCOPES.has(scope)) return true;
    }
    return false;
}
}),
];

//# sourceMappingURL=src_shared_constants_managementScopes_ts_199tueu._.js.map