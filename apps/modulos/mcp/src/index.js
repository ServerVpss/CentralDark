// Entrypoint do servidor MCP CentralDark.
import { readFileSync, writeFileSync } from "node:fs";
import express from "express";
import { config } from "./config.js";
import { log } from "./log.js";
import { ALL_TOOLS } from "./tools/core/tools-catalog.js";
import { handleMcpRequest, PUBLIC_CALLABLE_MCP_TOOLS } from "./mcp-server.js";
import { getAccessToken, getSession, getStateStats } from "./sessions.js";
import { getAuthorizationServerMetadata, getProtectedResourceMetadata, handleAuthorize, handleIssueKey, handleOAuthCallback, handleOAuthStart, postRegister, postToken, } from "./oauth.js";
import { getStatusHtml, getStatusJson } from "./tools/status.js";
import { getCatalogSummary, CATALOG_VERSION } from "./tools/core/tools-catalog.js";
import { handleSkillsList, handleSkillManifest, handleSkillRaw, handleSkillInstaller, } from "./skills-public.js";
import { correlationMiddleware, withCid } from "./correlation.js";
import { healthDeep } from "./health-deep.js";
import { startHubMissionConsumer } from "./hub-mission-consumer.js";
import { providerAdminBridge } from "./provider-admin-bridge.js";
import { adminGet, adminLogin, adminLogout, adminRotas, adminTools, adminLogsStream, adminTestarSse, adminBuscarLogs, adminMetricas, adminE2E, adminE2EPublico, bootstrapAdminLogCapture, } from "./admin.js";
process.on("uncaughtException", (err) => {
    console.error("[FATAL] uncaughtException:", err?.stack || err);
    try {
        writeFileSync("/root/CentralDark/logs/mcp-crash.log", `[${new Date().toISOString()}] uncaughtException\n${err?.stack || String(err)}\n\n`, { flag: "a" });
    }
    catch { }
    process.exit(1);
});
process.on("unhandledRejection", (reason) => {
    console.error("[FATAL] unhandledRejection:", reason?.stack || reason);
    try {
        writeFileSync("/root/CentralDark/logs/mcp-crash.log", `[${new Date().toISOString()}] unhandledRejection\n${reason?.stack || String(reason)}\n\n`, { flag: "a" });
    }
    catch { }
    process.exit(1);
});
function validarEnvsObrigatorias() {
    const envsObrigatorias = [
        "CENTRALDARK_ADMIN_KEY",
        "MCP_SESSION_SECRET",
    ];
    const faltando = envsObrigatorias.filter((n) => !process.env[n] || process.env[n].trim() === "");
    if (faltando.length > 0) {
        const msg = `[BOOT] MCP não pode iniciar. Variáveis de ambiente ausentes: ${faltando.join(", ")}. Configure no ecosystem.config.cjs ou export antes de subir o PM2.`;
        console.error(msg);
        try {
            writeFileSync("/root/CentralDark/logs/mcp-crash.log", `[${new Date().toISOString()}] BOOT ABORTADO — envs faltando: ${faltando.join(", ")}\n\n`, { flag: "a" });
        }
        catch { }
        process.exit(2);
    }
    console.log("[BOOT] Todas envs obrigatórias presentes ✓");
}
validarEnvsObrigatorias();
bootstrapAdminLogCapture();
startHubMissionConsumer();
const app = express();
app.disable("x-powered-by");
function setCorsHeaders(res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Authorization,Content-Type,Accept,Mcp-Session-Id,MCP-Protocol-Version,X-MCP-Session,X-Correlation-Id,X-Request-Id");
    res.setHeader("Access-Control-Expose-Headers", "WWW-Authenticate,Mcp-Session-Id,X-Correlation-Id,X-Request-Id");
}
app.use((_req, res, next) => {
    setCorsHeaders(res);
    next();
});
app.options("*", (_req, res) => {
    res.sendStatus(204);
});
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));
app.use(correlationMiddleware);
app.get("/health", (_req, res) => {
    res.json({
        ok: true,
        service: "mcp-centraldark",
        version: "0.4.0",
        catalogVersion: CATALOG_VERSION,
        toolCount: getCatalogSummary().toolCount,
        time: new Date().toISOString(),
    });
});
app.get("/health/deep", healthDeep);
const FAVICON_PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAdElEQVR42mNgkxShKWIYARYI7GzEgyiyAL/RRFrDQLnp+O1goNxo/NYQZQHxviRsAalxSFALA4WmE9SI0wJS0zthC8h2PrH5gBamj1owasFQtoAmGY3mRQU9CjuaF9f0qHDoUWXSvNKnU7OFHg2v0cYvGAEAow7TzjWyeR0AAAAASUVORK5CYII=", "base64");
const serveFavicon = (_req, res) => {
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.status(200).end(FAVICON_PNG);
};
app.get("/favicon.ico", serveFavicon);
app.get("/favicon.png", serveFavicon);
app.all("/sse", (_req, res) => {
    res.status(410).json({
        ok: false,
        error: "sse_transport_gone",
        message: "O transporte SSE foi aposentado. Use POST /mcp (MCP Streamable HTTP, protocolo 2025-06-18).",
        replacement: "/mcp",
        documentation: "/.well-known/oauth-protected-resource",
    });
});
const somentePost = (rota) => (_req, res) => {
    res.setHeader("Allow", "POST");
    res.status(405).json({
        ok: false,
        error: "method_not_allowed",
        message: `${rota} aceita somente POST.`,
        allow: ["POST"],
    });
};
app.get("/token", somentePost("/token"));
app.get("/register", somentePost("/register"));
app.get("/admin", adminGet);
app.post("/admin/login", adminLogin);
app.get("/admin/logout", adminLogout);
app.get("/admin/api/rotas", adminRotas);
app.get("/admin/api/tools", adminTools);
app.get("/admin/api/logs", adminBuscarLogs);
app.get("/admin/api/metricas", adminMetricas);
app.post("/admin/api/e2e", adminE2E);
app.get("/admin/api/e2e/publico", adminE2EPublico);
app.get("/admin/logs/stream", adminLogsStream);
app.post("/admin/api/testar-sse", adminTestarSse);
app.post("/admin/provider", providerAdminBridge);
app.post("/admin/api/issue-key", handleIssueKey);
app.get("/tools.json", (_req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.json(getCatalogSummary());
});
app.get("/openapi.json", (_req, res) => {
    res.setHeader("Cache-Control", "no-store");
    const summary = getCatalogSummary();
    const jsonRpcBody = {
        required: true,
        content: {
            "application/json": {
                schema: {
                    type: "object",
                    required: ["jsonrpc", "method"],
                    properties: {
                        jsonrpc: { type: "string", const: "2.0" },
                        id: { type: ["string", "number", "null"] },
                        method: { type: "string", examples: ["initialize", "tools/list", "tools/call"] },
                        params: { type: "object" },
                    },
                },
            },
        },
    };
    const respostaJson = { "200": { description: "Resposta JSON-RPC", content: { "application/json": { schema: { type: "object" } } } } };
    const paths = {
        "/mcp": {
            post: {
                summary: "Endpoint MCP publico (JSON-RPC 2.0, Streamable HTTP)",
                description: "Exige Authorization: Bearer com escopo mcp. Nao anuncia nem executa ferramentas destrutivas.",
                operationId: "mcpJsonRpc",
                security: [{ oauth2: ["mcp"] }],
                requestBody: jsonRpcBody,
                responses: { ...respostaJson, "401": { description: "Bearer ausente ou invalido (ver header WWW-Authenticate)" } },
            },
        },
        "/admin/mcp": {
            post: {
                summary: "Endpoint MCP administrativo (JSON-RPC 2.0)",
                description: "Exige Authorization: Bearer com escopo admin. Toda destrutiva passa pelo dispatcher auditado mcp_admin_call.",
                operationId: "mcpAdminJsonRpc",
                security: [{ oauth2: ["admin"] }],
                requestBody: jsonRpcBody,
                responses: { ...respostaJson, "401": { description: "Bearer com escopo admin ausente" }, "403": { description: "Token sem escopo admin" } },
            },
        },
        "/tools.json": { get: { summary: "Manifesto publico do catalogo de tools", operationId: "toolsCatalog", responses: respostaJson } },
        "/health": { get: { summary: "Healthcheck", operationId: "health", responses: respostaJson } },
        "/health/deep": { get: { summary: "Healthcheck profundo", operationId: "healthDeep", responses: respostaJson } },
        "/status.json": { get: { summary: "Status dos conectores", operationId: "statusJson", responses: respostaJson } },
        "/register": { post: { summary: "OAuth 2.1 Dynamic Client Registration", operationId: "oauthRegister", responses: respostaJson } },
        "/authorize": { get: { summary: "OAuth 2.1 authorize (PKCE S256)", operationId: "oauthAuthorize", responses: { "200": { description: "Tela de consentimento" }, "302": { description: "Redirect com code" } } } },
        "/token": { post: { summary: "OAuth 2.1 token endpoint", operationId: "oauthToken", responses: respostaJson } },
        "/.well-known/oauth-protected-resource": { get: { summary: "RFC 9728 protected resource metadata", operationId: "protectedResourceMetadata", responses: respostaJson } },
        "/.well-known/oauth-authorization-server": { get: { summary: "RFC 8414 authorization server metadata", operationId: "authorizationServerMetadata", responses: respostaJson } },
    };
    res.json({
        openapi: "3.1.0",
        info: {
            title: "CentralDark Elite Gateway",
            description: `OpenAI-compatible proxy + ${summary.toolCount} MCP tools. Modelos: bear, sonnet-4.6, opus-4.8, haiku-4.6.`,
            version: "1.6.0",
        },
        servers: [
            { url: "https://mcp.centralldark.com", description: "MCP público" },
        ],
        components: {
            securitySchemes: {
                oauth2: {
                    type: "oauth2",
                    description: "OAuth 2.1 + PKCE S256 + Dynamic Client Registration",
                    flows: {
                        authorizationCode: {
                            authorizationUrl: "https://mcp.centralldark.com/authorize",
                            tokenUrl: "https://mcp.centralldark.com/token",
                            scopes: { mcp: "Ferramentas nao destrutivas", admin: "Dispatcher administrativo auditado" },
                        },
                    },
                },
            },
        },
        paths,
        "x-mcp-tools": summary.tools.map((tool) => ({
            name: tool.name,
            title: tool.title ?? tool.name,
            description: tool.description ?? "",
            destructive: tool.annotations?.destructiveHint === true,
        })),
        "x-mcp-tool-count": summary.toolCount,
    });
});
app.get("/status", (req, res) => {
    getStatusHtml(req, res).catch(() => {
        if (!res.headersSent)
            res.status(500).send("Erro ao gerar status.");
    });
});
app.get("/status.json", (req, res) => {
    getStatusJson(req, res).catch(() => {
        if (!res.headersSent)
            res.status(500).json({ ok: false });
    });
});
app.get("/skills", (req, res) => {
    handleSkillsList(req, res, config.publicUrl).catch(() => {
        if (!res.headersSent)
            res.status(500).json({ ok: false });
    });
});
app.get("/skills/:nome", (req, res) => {
    handleSkillManifest(req, res, config.publicUrl).catch(() => {
        if (!res.headersSent)
            res.status(500).json({ ok: false });
    });
});
app.get("/skills/:nome/SKILL.md", (req, res) => {
    handleSkillRaw(req, res).catch(() => {
        if (!res.headersSent)
            res.status(500).type("text/plain").send("erro");
    });
});
app.get("/skills/:nome/install.sh", (req, res) => {
    handleSkillInstaller(req, res, config.publicUrl).catch(() => {
        if (!res.headersSent)
            res.status(500).type("text/plain").send("# erro\nexit 1\n");
    });
});
app.get("/.well-known/oauth-protected-resource", getProtectedResourceMetadata);
app.get("/.well-known/oauth-protected-resource/mcp", getProtectedResourceMetadata);
app.get("/mcp/.well-known/oauth-protected-resource", getProtectedResourceMetadata);
app.get("/.well-known/oauth-protected-resource/admin", getProtectedResourceMetadata);
app.get("/.well-known/oauth-protected-resource/admin/mcp", getProtectedResourceMetadata);
app.get("/.well-known/oauth-authorization-server", getAuthorizationServerMetadata);
app.get("/.well-known/oauth-authorization-server/mcp", getAuthorizationServerMetadata);
app.get("/mcp/.well-known/oauth-authorization-server", getAuthorizationServerMetadata);
app.get("/.well-known/oauth-authorization-server/admin", getAuthorizationServerMetadata);
app.post("/register", postRegister);
app.get("/authorize", handleAuthorize);
app.post("/authorize", handleAuthorize);
app.post("/token", postToken);
app.get("/oauth/start", handleOAuthStart);
app.get("/oauth/callback", handleOAuthCallback);
function unauthorized(req, res, msg) {
    setCorsHeaders(res);
    res.setHeader("WWW-Authenticate", `Bearer realm="mcp", resource_metadata="${config.publicUrl}/.well-known/oauth-protected-resource", scope="mcp"`);
    res.status(401).json({
        jsonrpc: "2.0",
        error: { code: -32000, message: msg, data: { cid: req.cid } },
        id: null,
        cid: req.cid,
    });
}
function unauthorizedAdmin(req, res, msg, status = 401) {
    setCorsHeaders(res);
    res.setHeader("WWW-Authenticate", `Bearer realm="mcp-admin", resource_metadata="${config.publicUrl}/.well-known/oauth-protected-resource/admin/mcp", scope="admin"`);
    res.status(status).json({
        jsonrpc: "2.0",
        error: { code: status === 403 ? -32001 : -32000, message: msg, data: { cid: req.cid } },
        id: null,
        cid: req.cid,
    });
}
function redactHeadersForDebug(headers) {
    const sensitive = /authorization|cookie|token|secret|session|key/i;
    return Object.fromEntries(Object.entries(headers).map(([key, value]) => [
        key,
        sensitive.test(key) && value !== undefined ? "[REDACTED]" : value,
    ]));
}
function redactRawHeadersForDebug(rawHeaders) {
    const sensitive = /authorization|cookie|token|secret|session|key/i;
    return rawHeaders.map((value, index) => {
        const isName = index % 2 === 0;
        if (isName)
            return value;
        return sensitive.test(rawHeaders[index - 1] ?? "") ? "[REDACTED]" : value;
    });
}
function headerValueToString(value) {
    if (Array.isArray(value))
        return value.find(Boolean);
    return value;
}
function findHeaderCaseInsensitive(req, name) {
    const expected = name.toLowerCase();
    for (const [key, value] of Object.entries(req.headers)) {
        if (key.toLowerCase() === expected)
            return headerValueToString(value);
    }
    for (let i = 0; i < req.rawHeaders.length; i += 2) {
        if ((req.rawHeaders[i] ?? "").toLowerCase() === expected)
            return req.rawHeaders[i + 1];
    }
    return undefined;
}
function extractBearer(req) {
    log.debug("mcp_headers_debug", {
        headers: redactHeadersForDebug(req.headers),
        rawHeaders: redactRawHeadersForDebug(req.rawHeaders),
    });
    const h = findHeaderCaseInsensitive(req, "authorization") ??
        findHeaderCaseInsensitive(req, "x-forwarded-authorization") ??
        findHeaderCaseInsensitive(req, "x-original-authorization");
    if (!h) {
        log.warn("mcp_authorization_missing", {
            reason: "nenhum header authorization-like chegou ao Express",
        });
        return undefined;
    }
    const m = /^Bearer\s+(.+)$/i.exec(h.trim());
    if (!m) {
        log.warn("mcp_authorization_invalid_scheme", {});
        return undefined;
    }
    return m ? m[1].trim() : undefined;
}
function getInternalGhToken() {
    return process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";
}
function resolveGhToken(req) {
    const l = withCid(req.cid);
    const rawAuth = findHeaderCaseInsensitive(req, "authorization") ??
        findHeaderCaseInsensitive(req, "x-forwarded-authorization") ??
        findHeaderCaseInsensitive(req, "x-original-authorization");
    const hasAuthHeader = Boolean(rawAuth);
    const schemeMatch = rawAuth ? /^(\S+)\s+(.+)$/.exec(String(rawAuth).trim()) : null;
    const authScheme = schemeMatch ? schemeMatch[1] : (rawAuth ? "raw" : "none");
    const bearer = extractBearer(req);
    const tokenPrefix = bearer ? bearer.slice(0, 8) : null;
    const stats = (() => { try { return getStateStats(); } catch { return { accessTokens: -1 }; } })();
    const logAuth = (lookupResult, extra = {}) => {
        l.info("mcp_auth_diagnostic", {
            has_auth_header: hasAuthHeader,
            auth_scheme: authScheme,
            token_prefix: tokenPrefix,
            token_lookup_result: lookupResult,
            store_size: stats.accessTokens,
            ...extra,
        });
    };
    if (bearer) {
        const directToken = process.env.MCP_CENTRALDARK_TOKEN ||
            process.env.CENTRALDARK_MCP_TOKEN ||
            process.env.MCP_TOKEN;
        if (directToken && bearer === directToken) {
            const internal = getInternalGhToken();
            if (!internal) {
                logAuth("direct_token_but_gh_missing");
                return { error: "Token interno do servidor não configurado." };
            }
            logAuth("direct_token_ok");
            return {
                token: internal,
                callerUser: process.env.MCP_CALLER_USER || "mcp-direct-token",
                oauthScope: "",
            };
        }
        const at = getAccessToken(bearer);
        if (!at) {
            logAuth("not_found_or_expired");
            return { error: "Access token inválido ou expirado." };
        }
        logAuth("found_in_store", { ttl_ms: at.expiresAt - Date.now(), gh_login: at.gh_login });
        return {
            token: at.gh_token,
            callerUser: at.gh_login || "github-oauth",
            oauthScope: String(at.oauth_scope || ""),
        };
    }
    const sid = String(req.header("x-mcp-session") ?? "");
    if (sid) {
        const s = getSession(sid);
        if (!s) {
            logAuth("session_header_invalid");
            return { error: "Sessão inválida ou expirada." };
        }
        logAuth("session_header_ok");
        return {
            token: s.githubAccessToken,
            callerUser: s.githubLogin || "mcp-session",
            oauthScope: "",
        };
    }
    logAuth(hasAuthHeader ? "bad_scheme" : "missing_header");
    return { error: "Authorization Bearer ausente." };
}
app.post("/mcp", (req, res) => {
    const l = withCid(req.cid);
    const r = resolveGhToken(req);
    if ("error" in r) {
        l.warn("mcp_unauthorized", { reason: r.error });
        unauthorized(req, res, r.error);
        return;
    }
    l.info("mcp_request_authorized", { method: req.body?.method || "unknown" });
    handleMcpRequest(req, res, r.token, {
        cid: req.cid,
        admin: false,
        callerUser: r.callerUser,
        oauthScope: r.oauthScope,
    }).catch((err) => {
        l.error("mcp_handler_unhandled", { error: String(err) });
        if (!res.headersSent) {
            res.status(500).json({
                jsonrpc: "2.0",
                error: { code: -32603, message: "Erro interno do servidor MCP", data: { cid: req.cid } },
                id: null,
                cid: req.cid,
            });
        }
    });
});
app.get("/mcp", (req, res) => {
    unauthorized(req, res, "Authorization Bearer ausente.");
});
function requireAdminScope(req, res) {
    const bearer = extractBearer(req);
    if (!bearer) { unauthorizedAdmin(req, res, "Authorization Bearer com escopo admin ausente."); return null; }
    const at = getAccessToken(bearer);
    if (!at) { unauthorizedAdmin(req, res, "Access token admin inválido ou expirado."); return null; }
    const scope = String(at.oauth_scope || "");
    if (!/\badmin\b/.test(scope)) {
        unauthorizedAdmin(req, res, "escopo admin obrigatório", 403);
        return null;
    }
    return {
        token: at.gh_token,
        callerUser: at.gh_login || "github-admin",
        oauthScope: scope,
    };
}
app.post("/admin/mcp", (req, res) => {
    const l = withCid(req.cid);
    const auth = requireAdminScope(req, res);
    if (!auth) return;
    l.info("mcp_admin_request_authorized", { method: req.body?.method || "unknown", actor: auth.callerUser });
    handleMcpRequest(req, res, auth.token, {
        cid: req.cid,
        admin: true,
        callerUser: auth.callerUser,
        oauthScope: auth.oauthScope,
    }).catch((err) => {
        l.error("mcp_admin_handler_unhandled", { error: String(err) });
        if (!res.headersSent) {
            res.status(500).json({
                jsonrpc: "2.0",
                error: { code: -32603, message: "Erro interno do servidor MCP admin", data: { cid: req.cid } },
                id: null,
                cid: req.cid,
            });
        }
    });
});
app.get("/admin/mcp", (req, res) => {
    unauthorizedAdmin(req, res, "Authorization Bearer com escopo admin ausente.");
});
const PAINEL_DATA_PATH = "/root/CentralDark/apps/modulos/status/painel-data.json";
const ADMIN_KEY = process.env.CENTRALDARK_ADMIN_KEY;
app.post("/api/telemetry-ingest", (req, res) => {
    const auth = req.headers["authorization"] ?? "";
    const token = /^Bearer\s+(.+)$/i.exec(String(auth).trim())?.[1]?.trim();
    if (token !== ADMIN_KEY) {
        res.status(401).json({ ok: false, error: "unauthorized" });
        return;
    }
    const { cpu, ram, ramPercent, disco, load, timestamp, brtTimestamp } = req.body ?? {};
    if (!cpu || !ram) {
        res.status(400).json({ ok: false, error: "payload inválido" });
        return;
    }
    try {
        const raw = readFileSync(PAINEL_DATA_PATH, "utf-8");
        const data = JSON.parse(raw);
        data.telemetry = { cpu, ram, ramPercent, disco, load, timestamp, brtTimestamp, receivedAt: new Date().toISOString() };
        writeFileSync(PAINEL_DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
        res.json({ ok: true });
    }
    catch (err) {
        log.error("telemetry_ingest_error", { error: String(err) });
        res.status(500).json({ ok: false, error: "erro ao salvar telemetria" });
    }
});
app.use((_req, res) => {
    res.status(404).json({ ok: false, error: "not_found" });
});
app.listen(config.port, "127.0.0.1", () => {
    log.info("mcp_listening", {
        port: config.port,
        publicUrl: config.publicUrl,
        githubOwner: config.github.owner,
        githubRepo: config.github.repo,
    });
});
export { codeReviewerToolDefinition } from "./tools/code-reviewer.js";