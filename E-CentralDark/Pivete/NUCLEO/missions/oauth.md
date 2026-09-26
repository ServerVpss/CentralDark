# MISSAO - oauth.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\centraldark\apps\modulos\mcp\dist\oauth.js
**SHA:** 2178b0e592939be1
**Timestamp:** 2026-08-28T02:54:33.956525
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- gap: 10px;
- gap: 10px;
- .perm{display:flex;gap:10px;align-items:flex-start;padding:8px 0}
- .actions{display:flex;gap:10px}

### Ouro Bruto (primeiros 5000 chars)
```
// OAuth 2.1 do MCP CentralDark.
import crypto from "node:crypto";
import { config } from "./config.js";
import { log } from "./log.js";
import { getCatalogSummary } from "./tools/core/tools-catalog.js";
import { consumeAuthCode, consumeRefreshToken, createAuthRequest, getClient, issueAuthCode, issueTokenPair, registerClient, } from "./sessions.js";
const CLIENT_METADATA_TTL_MS = 1000 * 60 * 10;
const clientMetadataCache = new Map();
function getAdminPassword() {
    return (process.env.MCP_ADMIN_PASSWORD ?? process.env.CENTRALDARK_MCP_ADMIN_PASSWORD ?? "").trim();
}
function getOwnerToolToken() {
    return (process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN ?? process.env.MCP_OWNER_TOOL_TOKEN ?? "").trim();
}
function timingSafeEqualText(a, b) {
    const aa = Buffer.from(a);
    const bb = Buffer.from(b);
    return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}
function param(req, name) {
    const source = req.method === "POST" ? req.body ?? {} : req.query ?? {};
    const value = source[name];
    return Array.isArray(value) ? String(value[0] ?? "") : String(value ?? "");
}
function oauthError(res, status, error, description) {
    res.status(status).json({ error, error_description: description });
}
function basicClientId(req) {
    const header = String(req.headers?.authorization ?? "").trim();
    const match = /^Basic\s+(.+)$/i.exec(header);
    if (!match)
        return "";
    try {
        const decoded = Buffer.from(match[1], "base64").toString("utf8");
        const separator = decoded.indexOf(":");
        const rawId = separator >= 0 ? decoded.slice(0, separator) : decoded;
        return decodeURIComponent(rawId || "");
    }
    catch {
        return "";
    }
}
function tokenClientId(req, body) {
    return String(body.client_id ?? "") || basicClientId(req);
}
function isUrlClientId(client_id) {
    try {
        const url = new URL(client_id);
        // CIMD (Client ID Metadata Document): o client_id é uma URL que PODE ter query string
        // (ex.: ChatGPT usa .../client.json?token_endpoint_auth_method=none). Só fragmento é inválido.
        return url.protocol === "https:" && url.pathname.length > 1 && !url.hash;
    }
    catch {
        return false;
    }
}
function toResolvedClient(input) {
    return {
        client_id: input.client_id,
        client_name: input.client_name,
        redirect_uris: input.redirect_uris,
        token_endpoint_auth_method: input.token_endpoint_auth_method ?? "none",
        grant_types: input.grant_types ?? ["authorization_code", "refresh_token"],
        response_types: input.response_types ?? ["code"],
    };
}
async function fetchClientMetadataDocument(client_id) {
    const cached = clientMetadataCache.get(client_id);
    if (cached && cached.expiresAt > Date.now()) {
        return cached.client;
    }
    // Fetch com timeout + retry manual (substitui fetchWithRetry que não existia)
    let res;
    let lastErr;
    for (let tentativa = 0; tentativa <= 2; tentativa++) {
        try {
            res = await fetch(client_id, {
                headers: {
                    Accept: "application/json",
                    "User-Agent": "MCP-CentralDark/0.4",
                },
                signal: AbortSignal.timeout(5000),
            });
            break;
        }
        catch (err) {
            lastErr = err;
            if (tentativa === 2) {
                log.warn("oauth_client_metadata_fetch_falhou", { client_id, erro: String(err) });
                return undefined;
            }
            await new Promise((r) => setTimeout(r, 200 * (tentativa + 1)));
        }
    }
    if (!res) {
        log.warn("oauth_client_metadata_sem_resposta", { client_id, erro: String(lastErr) });
        return undefined;
    }
    if (!res.ok) {
        log.warn("oauth_client_metadata_http_error", { client_id, status: res.status });
        return undefined;
    }
    const data = (await res.json());
    if (!data || typeof data.client_id !== "string" || data.client_id !== client_id) {
        log.warn("oauth_client_metadata_invalid_id", { client_id });
        return undefined;
    }
    if (!Array.isArray(data.redirect_uris) || !data.redirect_uris.every((u) => typeof u === "string")) {
        log.warn("oauth_client_metadata_invalid_redirects", { client_id });
        return undefined;
    }
    if (Array.isArray(data.grant_types) && !data.grant_types.includes("authorization_code")) {
        log.warn("oauth_client_metadata_missing_code_grant", { client_id });
        return undefined;
    }
    if (Array.isArray(data.response_types) && !data.response_types.includes("code")) {
        log.warn("oauth_client_metadata_missing_code_response", { client_id });
        return undefined;
    }
    const client = toResolvedClient({
        client_id: data.client_id,
        client_name: data.client_name,
        redirect_uris: data.redirect_uris,
        token_endpoint_auth_method: data.token_endpoint_auth_method,
        grant_types
```

---

# MISSAO - oauth.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\centraldark\apps\modulos\mcp\src\oauth.js
**SHA:** 72be0747787998e9
**Timestamp:** 2026-08-28T02:54:45.309775
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- gap: 10px;
- gap: 10px;
- .perm{display:flex;gap:10px;align-items:flex-start;padding:8px 0}
- .actions{display:flex;gap:10px}

### Ouro Bruto (primeiros 5000 chars)
```
// OAuth 2.1 do MCP CentralDark.
import crypto from "node:crypto";
import { config } from "./config.js";
import { log } from "./log.js";
import { getCatalogSummary } from "./tools/core/tools-catalog.js";
import { consumeAuthCode, consumeRefreshToken, createAuthRequest, getClient, issueAuthCode, issueTokenPair, registerClient, } from "./sessions.js";
const CLIENT_METADATA_TTL_MS = 1000 * 60 * 10;
const clientMetadataCache = new Map();
function getAdminPassword() {
    return (process.env.MCP_ADMIN_PASSWORD ?? process.env.CENTRALDARK_MCP_ADMIN_PASSWORD ?? "").trim();
}
function getOwnerToolToken() {
    return (process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN ?? process.env.MCP_OWNER_TOOL_TOKEN ?? "").trim();
}
function timingSafeEqualText(a, b) {
    const aa = Buffer.from(a);
    const bb = Buffer.from(b);
    return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}
function param(req, name) {
    const source = req.method === "POST" ? req.body ?? {} : req.query ?? {};
    const value = source[name];
    return Array.isArray(value) ? String(value[0] ?? "") : String(value ?? "");
}
function oauthError(res, status, error, description) {
    res.status(status).json({ error, error_description: description });
}
function basicClientId(req) {
    const header = String(req.headers?.authorization ?? "").trim();
    const match = /^Basic\s+(.+)$/i.exec(header);
    if (!match)
        return "";
    try {
        const decoded = Buffer.from(match[1], "base64").toString("utf8");
        const separator = decoded.indexOf(":");
        const rawId = separator >= 0 ? decoded.slice(0, separator) : decoded;
        return decodeURIComponent(rawId || "");
    }
    catch {
        return "";
    }
}
function tokenClientId(req, body) {
    return String(body.client_id ?? "") || basicClientId(req);
}
function isUrlClientId(client_id) {
    try {
        const url = new URL(client_id);
        // CIMD (Client ID Metadata Document): o client_id é uma URL que PODE ter query string
        // (ex.: ChatGPT usa .../client.json?token_endpoint_auth_method=none). Só fragmento é inválido.
        return url.protocol === "https:" && url.pathname.length > 1 && !url.hash;
    }
    catch {
        return false;
    }
}
function toResolvedClient(input) {
    return {
        client_id: input.client_id,
        client_name: input.client_name,
        redirect_uris: input.redirect_uris,
        token_endpoint_auth_method: input.token_endpoint_auth_method ?? "none",
        grant_types: input.grant_types ?? ["authorization_code", "refresh_token"],
        response_types: input.response_types ?? ["code"],
    };
}
async function fetchClientMetadataDocument(client_id) {
    const cached = clientMetadataCache.get(client_id);
    if (cached && cached.expiresAt > Date.now()) {
        return cached.client;
    }
    // Fetch com timeout + retry manual (substitui fetchWithRetry que não existia)
    let res;
    let lastErr;
    for (let tentativa = 0; tentativa <= 2; tentativa++) {
        try {
            res = await fetch(client_id, {
                headers: {
                    Accept: "application/json",
                    "User-Agent": "MCP-CentralDark/0.4",
                },
                signal: AbortSignal.timeout(5000),
            });
            break;
        }
        catch (err) {
            lastErr = err;
            if (tentativa === 2) {
                log.warn("oauth_client_metadata_fetch_falhou", { client_id, erro: String(err) });
                return undefined;
            }
            await new Promise((r) => setTimeout(r, 200 * (tentativa + 1)));
        }
    }
    if (!res) {
        log.warn("oauth_client_metadata_sem_resposta", { client_id, erro: String(lastErr) });
        return undefined;
    }
    if (!res.ok) {
        log.warn("oauth_client_metadata_http_error", { client_id, status: res.status });
        return undefined;
    }
    const data = (await res.json());
    if (!data || typeof data.client_id !== "string" || data.client_id !== client_id) {
        log.warn("oauth_client_metadata_invalid_id", { client_id });
        return undefined;
    }
    if (!Array.isArray(data.redirect_uris) || !data.redirect_uris.every((u) => typeof u === "string")) {
        log.warn("oauth_client_metadata_invalid_redirects", { client_id });
        return undefined;
    }
    if (Array.isArray(data.grant_types) && !data.grant_types.includes("authorization_code")) {
        log.warn("oauth_client_metadata_missing_code_grant", { client_id });
        return undefined;
    }
    if (Array.isArray(data.response_types) && !data.response_types.includes("code")) {
        log.warn("oauth_client_metadata_missing_code_response", { client_id });
        return undefined;
    }
    const client = toResolvedClient({
        client_id: data.client_id,
        client_name: data.client_name,
        redirect_uris: data.redirect_uris,
        token_endpoint_auth_method: data.token_endpoint_auth_method,
        grant_types
```