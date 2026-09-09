import { createHash } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import { isAbsolute } from "node:path";
import { mcpAdminTools } from "./tools/core/mcp-admin.js";
import { sanitizeOutgoingText } from "./lib/sanitize.js";
const PROVIDER_TOOLS = new Set([
    "provider_capabilities",
    "provider_credentials_status",
    "provider_read",
    "provider_mutate",
]);
const MAX_BODY_BYTES = 25_000;
const MAX_LOCAL_CREDENTIAL_FILE_BYTES = 64_000;
const PROVIDER_CREDENTIAL_KEYS = Object.freeze([
    "CLOUDFLARE_API_TOKEN",
    "CF_API_TOKEN",
    "CONTABO_CLIENT_ID",
    "CONTABO_CLIENT_SECRET",
    "CONTABO_API_USER",
    "CONTABO_API_PASSWORD",
]);
function hubConfig() {
    const url = String(process.env.HUB_SUPABASE_URL || process.env.SUPABASE_URL || "").replace(/\/$/, "");
    const serviceRoleKey = String(process.env.HUB_SUPABASE_SERVICE_ROLE_KEY ||
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.SUPABASE_SERVICE_KEY ||
        "").trim();
    return { url, serviceRoleKey };
}
export function extractBearer(value) {
    const match = /^Bearer\s+(.+)$/i.exec(String(value || "").trim());
    return match?.[1]?.trim() || null;
}
function safeError(error) {
    return sanitizeOutgoingText(String(error?.message || error || "provider_admin_bridge_error")).slice(0, 400);
}
function readSmallAbsoluteFile(pathValue) {
    const path = String(pathValue || "").trim();
    if (!path || !isAbsolute(path))
        return null;
    try {
        const stat = statSync(path);
        if (!stat.isFile() || stat.size <= 0 || stat.size > MAX_LOCAL_CREDENTIAL_FILE_BYTES)
            return null;
        return readFileSync(path, "utf8").trim() || null;
    }
    catch {
        return null;
    }
}
function parseEnvFile(content) {
    const parsed = {};
    for (const rawLine of String(content || "").split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line || line.startsWith("#"))
            continue;
        const idx = line.indexOf("=");
        if (idx < 1)
            continue;
        const key = line.slice(0, idx).trim();
        if (!PROVIDER_CREDENTIAL_KEYS.includes(key))
            continue;
        let value = line.slice(idx + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        if (value)
            parsed[key] = value;
    }
    return parsed;
}
export function loadProviderCredentialPointers(env = process.env) {
    const loaded = [];
    const configuredPointers = [];
    for (const key of PROVIDER_CREDENTIAL_KEYS) {
        if (String(env[key] || "").trim())
            continue;
        const pointerName = `${key}_FILE`;
        const pointer = String(env[pointerName] || "").trim();
        if (!pointer)
            continue;
        configuredPointers.push(pointerName);
        const value = readSmallAbsoluteFile(pointer);
        if (!value)
            continue;
        process.env[key] = value;
        loaded.push(key);
    }
    const envFilePath = String(env.CENTRALDARK_PROVIDER_ENV_FILE || "").trim();
    if (envFilePath) {
        configuredPointers.push("CENTRALDARK_PROVIDER_ENV_FILE");
        const content = readSmallAbsoluteFile(envFilePath);
        if (content) {
            const fromFile = parseEnvFile(content);
            for (const key of PROVIDER_CREDENTIAL_KEYS) {
                if (String(process.env[key] || "").trim())
                    continue;
                if (!fromFile[key])
                    continue;
                process.env[key] = fromFile[key];
                loaded.push(key);
            }
        }
    }
    return {
        configured: configuredPointers.length > 0,
        configuredPointers,
        loadedKeys: loaded,
    };
}
async function hubRequest(path, { method = "GET", bearer, body } = {}) {
    const { url, serviceRoleKey } = hubConfig();
    if (!url || !serviceRoleKey)
        throw new Error("HUB_ADMIN_BRIDGE_CONFIG_MISSING");
    const headers = {
        Accept: "application/json",
        apikey: serviceRoleKey,
        Authorization: `Bearer ${bearer || serviceRoleKey}`,
    };
    if (body !== undefined)
        headers["Content-Type"] = "application/json";
    const response = await fetch(`${url}${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(15_000),
    });
    const text = await response.text();
    let parsed = null;
    try {
        parsed = text ? JSON.parse(text) : null;
    }
    catch {
        parsed = null;
    }
    if (!response.ok)
        throw new Error(`HUB_ADMIN_BRIDGE_${response.status}`);
    return parsed;
}
async function authenticateHubAdmin(bearer) {
    if (!bearer)
        return { ok: false, status: "AUTH_REQUIRED" };
    let user;
    try {
        user = await hubRequest("/auth/v1/user", { bearer });
    }
    catch {
        return { ok: false, status: "AUTH_INVALID" };
    }
    const userId = String(user?.id || "").trim();
    if (!userId)
        return { ok: false, status: "AUTH_INVALID" };
    let isAdmin = false;
    try {
        const result = await hubRequest("/rest/v1/rpc/has_role", {
            method: "POST",
            body: { _user_id: userId, _role: "admin" },
        });
        isAdmin = result === true;
    }
    catch {
        return { ok: false, status: "ADMIN_ROLE_UNPROVEN" };
    }
    if (!isAdmin)
        return { ok: false, status: "ADMIN_REQUIRED" };
    return {
        ok: true,
        userId,
        actor: `hub-admin:${createHash("sha256").update(userId).digest("hex").slice(0, 24)}`,
    };
}
function unwrapDispatcherResult(result) {
    const text = result?.content?.find?.((item) => item?.type === "text" && typeof item.text === "string")?.text;
    if (!text)
        return { ok: false, status: "PROVIDER_DISPATCH_RESULT_INVALID" };
    try {
        return JSON.parse(text);
    }
    catch {
        return { ok: false, status: "PROVIDER_DISPATCH_RESULT_UNSTRUCTURED" };
    }
}
export async function providerAdminBridge(req, res) {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Pragma", "no-cache");
    const bearer = extractBearer(req.headers.authorization);
    const auth = await authenticateHubAdmin(bearer);
    if (!auth.ok) {
        const code = auth.status === "AUTH_REQUIRED" || auth.status === "AUTH_INVALID" ? 401 : 403;
        return res.status(code).json({ ok: false, status: auth.status });
    }
    // Carrega somente valores apontados por arquivos locais da VPS. O caminho vem
    // do ambiente do serviço; valores nunca entram em request, log, receipt ou GitHub.
    loadProviderCredentialPointers(process.env);
    const body = req.body && typeof req.body === "object" && !Array.isArray(req.body) ? req.body : {};
    if (Buffer.byteLength(JSON.stringify(body), "utf8") > MAX_BODY_BYTES) {
        return res.status(413).json({ ok: false, status: "PROVIDER_ADMIN_INPUT_TOO_LARGE" });
    }
    const toolName = String(body.tool || "").trim();
    if (!PROVIDER_TOOLS.has(toolName)) {
        return res.status(403).json({ ok: false, status: "PROVIDER_TOOL_NOT_ALLOWED" });
    }
    const dispatcher = mcpAdminTools.find((tool) => tool.name === "mcp_admin_call");
    if (!dispatcher)
        return res.status(503).json({ ok: false, status: "MCP_ADMIN_DISPATCHER_NOT_LOADED" });
    try {
        const result = await dispatcher.handler({
            tool: toolName,
            input: body.input && typeof body.input === "object" && !Array.isArray(body.input) ? body.input : {},
            confirmAdmin: typeof body.confirmAdmin === "string" ? body.confirmAdmin : undefined,
        }, {
            admin: true,
            autoMission: false,
            callerUser: auth.actor,
            oauthScope: "admin",
            correlationId: String(req.cid || req.headers["x-correlation-id"] || "provider-admin").slice(0, 160),
            token: "",
        });
        const payload = unwrapDispatcherResult(result);
        const status = payload?.ok === false && /REQUIRED|INVALID|BLOCKED|DIVERGENCIA|UNPROVEN|UNSUPPORTED|NOT_ALLOWED/i.test(String(payload.status || ""))
            ? 409
            : 200;
        return res.status(status).json(payload);
    }
    catch (error) {
        return res.status(500).json({ ok: false, status: "PROVIDER_ADMIN_BRIDGE_ERROR", error: safeError(error) });
    }
}
export const __test = Object.freeze({
    PROVIDER_TOOLS,
    PROVIDER_CREDENTIAL_KEYS,
    MAX_BODY_BYTES,
    MAX_LOCAL_CREDENTIAL_FILE_BYTES,
    hubConfig,
    parseEnvFile,
    loadProviderCredentialPointers,
    unwrapDispatcherResult,
    safeError,
});
//# sourceMappingURL=provider-admin-bridge.js.map
