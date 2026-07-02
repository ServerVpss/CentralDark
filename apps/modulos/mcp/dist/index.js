// Entrypoint do servidor MCP CentralDark.
import { readFileSync, writeFileSync } from "node:fs";
import express from "express";
import { config } from "./config.js";
import { log } from "./log.js";
import { ALL_TOOLS } from "./tools/core/tools-catalog.js";
import { handleMcpRequest, PUBLIC_CALLABLE_MCP_TOOLS } from "./mcp-server.js";
import { getAccessToken, getSession } from "./sessions.js";
import { getAuthorizationServerMetadata, getProtectedResourceMetadata, handleAuthorize, handleOAuthCallback, handleOAuthStart, postRegister, postToken, } from "./oauth.js";
import { getStatusHtml, getStatusJson } from "./tools/status.js";
import { getCatalogSummary, CATALOG_VERSION } from "./tools/core/tools-catalog.js";
import { handleSkillsList, handleSkillManifest, handleSkillRaw, handleSkillInstaller, } from "./skills-public.js";
const app = express();
app.disable("x-powered-by");
function setCorsHeaders(res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Authorization,Content-Type,Accept,Mcp-Session-Id,MCP-Protocol-Version,X-MCP-Session");
    res.setHeader("Access-Control-Expose-Headers", "WWW-Authenticate,Mcp-Session-Id");
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
// ─────────────────────────────── Health ──────────────────────────────────
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
// Manifesto público do catálogo de tools
app.get("/tools.json", (_req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.json(getCatalogSummary());
});
// OpenAPI 3.1 spec — compatível com Open WebUI Tool Servers e Builder
app.get("/openapi.json", (_req, res) => {
    res.setHeader("Cache-Control", "no-store");
    const summary = getCatalogSummary();
    const paths = {};
    for (const tool of summary.tools) {
        paths[`/mcp-tools/${tool.name}`] = {
            post: {
                summary: tool.title ?? tool.name,
                description: tool.description ?? "",
                operationId: tool.name,
                "x-openwebui-tool": true,
                requestBody: {
                    required: true,
                    content: { "application/json": { schema: { type: "object" } } },
                },
                responses: { "200": { description: "Tool result", content: { "application/json": { schema: { type: "object" } } } } },
            },
        };
    }
    res.json({
        openapi: "3.1.0",
        info: {
            title: "CentralDark Elite Gateway",
            description: `OpenAI-compatible proxy + ${summary.toolCount} MCP tools. Modelos: bear, sonnet-4.6, opus-4.8, haiku-4.6.`,
            version: "1.6.0",
        },
        servers: [
            { url: "https://mcp.centralldark.com", description: "MCP público" },
            { url: "https://api.centralldark.com", description: "Elite Proxy (OpenAI-compat)" },
        ],
        paths,
    });
});
// ───────────────────────── Status dos conectores ─────────────────────────
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
// ───────────────────────── Skills públicas (sem auth) ────────────────────
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
// ───────────────────────── OAuth discovery (MCP) ─────────────────────────
app.get("/.well-known/oauth-protected-resource", getProtectedResourceMetadata);
app.get("/.well-known/oauth-protected-resource/mcp", getProtectedResourceMetadata);
app.get("/.well-known/oauth-authorization-server", getAuthorizationServerMetadata);
app.get("/.well-known/oauth-authorization-server/mcp", getAuthorizationServerMetadata);
// ───────────────────────── OAuth endpoints (MCP) ─────────────────────────
app.post("/register", postRegister);
app.get("/authorize", handleAuthorize);
app.post("/token", postToken);
// ─────────────────────────── OAuth GitHub bridge ─────────────────────────
app.get("/oauth/start", handleOAuthStart);
app.get("/oauth/callback", handleOAuthCallback);
// ─────────────────────────────── MCP HTTP ────────────────────────────────
function unauthorized(res, msg) {
    setCorsHeaders(res);
    res.setHeader("WWW-Authenticate", `Bearer realm="mcp", resource_metadata="${config.publicUrl}/.well-known/oauth-protected-resource/mcp", scope="mcp"`);
    res.status(401).json({
        jsonrpc: "2.0",
        error: { code: -32000, message: msg },
        id: null,
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
    const bearer = extractBearer(req);
    if (bearer) {
        const directToken = process.env.MCP_CENTRALDARK_TOKEN ||
            process.env.CENTRALDARK_MCP_TOKEN ||
            process.env.MCP_TOKEN;
        // Token direto do MCP (para uso interno / Cline / agentes confiáveis)
        if (directToken && bearer === directToken) {
            const internal = getInternalGhToken();
            if (!internal)
                return { error: "Token interno do servidor não configurado." };
            return { token: internal };
        }
        // Fluxo OAuth normal (ChatGPT / clientes externos)
        const at = getAccessToken(bearer);
        if (!at)
            return { error: "Access token inválido ou expirado." };
        return { token: at.gh_token };
    }
    // Retrocompatibilidade: header x-mcp-session
    const sid = String(req.header("x-mcp-session") ?? "");
    if (sid) {
        const s = getSession(sid);
        if (!s)
            return { error: "Sessão inválida ou expirada." };
        return { token: s.githubAccessToken };
    }
    return { error: "Authorization Bearer ausente." };
}
app.post("/mcp", (req, res) => {
    const r = resolveGhToken(req);
    if ("error" in r) {
        unauthorized(res, r.error);
        return;
    }
    handleMcpRequest(req, res, r.token).catch((err) => {
        log.error("mcp_handler_unhandled", { error: String(err) });
        if (!res.headersSent) {
            res.status(500).json({
                jsonrpc: "2.0",
                error: { code: -32603, message: "Erro interno do servidor MCP" },
                id: null,
            });
        }
    });
});
// GET /mcp — alguns clientes pingam pra checar OAuth via 401
app.get("/mcp", (_req, res) => {
    unauthorized(res, "Authorization Bearer ausente.");
});
// /mcp-public removido em 30/06/2026 — expunha vps_write_file_safe sem Bearer
// (pendência #8). Toda chamada ao MCP agora exige OAuth via /mcp.
// ─────────────────────── Telemetria VPS (vps-reporter) ───────────────────────
const PAINEL_DATA_PATH = "/root/CentralDark/apps/modulos/status/painel-data.json";
const ADMIN_KEY = process.env.CENTRALDARK_ADMIN_KEY || "segredo_obraFullAdmin";
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
// 404 padrão
app.use((_req, res) => {
    res.status(404).json({ error: "not_found" });
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
//# sourceMappingURL=index.js.map