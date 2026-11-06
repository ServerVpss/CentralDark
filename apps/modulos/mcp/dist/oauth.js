// OAuth 2.1 do MCP CentralDark.
import crypto from "node:crypto";
import { redirectUriRegistered } from "./oauth-redirect-match.js";
import { config } from "./config.js";
import { isAdmin } from "./admin.js";
// Mesmo /authorize: o client_id canônico seleciona o modo de dispositivo.
// Os demais clientes seguem OAuth 2.1+PKCE original, sem segunda tela.
export const VSCODE_DEVICE_CLIENT_ID = "centraldark.centraldark-vscode-restore";
let devicePairingStore = null;
export function configureDevicePairingForOAuth(store) {
    if (!store || typeof store.pendingConsent !== "function" || typeof store.approveWeb !== "function")
        throw new Error("DEVICE_PAIRING_STORE_INVALID");
    devicePairingStore = store;
}
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
        grant_types: data.grant_types,
        response_types: data.response_types,
    });
    clientMetadataCache.set(client_id, {
        client,
        expiresAt: Date.now() + CLIENT_METADATA_TTL_MS,
    });
    return client;
}
async function resolveClientRegistration(client_id, redirect_uri) {
    const registered = getClient(client_id);
    if (registered) {
        return toResolvedClient(registered);
    }
    if (!isUrlClientId(client_id)) {
        return undefined;
    }
    const metadata = await fetchClientMetadataDocument(client_id);
    if (!metadata) {
        return undefined;
    }
    if (!redirectUriRegistered(metadata, redirect_uri)) {
        log.warn("oauth_client_metadata_redirect_rejected", { client_id, redirect_uri });
        return undefined;
    }
    return metadata;
}
export function getProtectedResourceMetadata(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    const isAdmin = String((req && (req.path || req.url)) || "").includes("/admin");
    res.json({
        resource: config.publicUrl + "/api/mcp",
        authorization_servers: [config.publicUrl],
        bearer_methods_supported: ["header"],
        scopes_supported: isAdmin ? ["mcp", "admin"] : ["mcp"],
        resource_documentation: "https://admin.centralldark.com/sala-controle",
    });
}
export function getAuthorizationServerMetadata(_req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.json({
        issuer: config.publicUrl,
        authorization_endpoint: `${config.publicUrl}/authorize`,
        token_endpoint: `${config.publicUrl}/token`,
        registration_endpoint: `${config.publicUrl}/register`,
        client_id_metadata_document_supported: true,
        response_types_supported: ["code"],
        grant_types_supported: ["authorization_code", "refresh_token"],
        code_challenge_methods_supported: ["S256"],
        token_endpoint_auth_methods_supported: ["none", "client_secret_post", "client_secret_basic"],
        scopes_supported: ["mcp", "admin"],
        authorization_response_iss_parameter_supported: true,
    });
}
function redirectWithOAuthError(res, redirect_uri, error, state, description) {
    const back = new URL(redirect_uri);
    back.searchParams.set("error", error);
    if (description)
        back.searchParams.set("error_description", description);
    if (state)
        back.searchParams.set("state", state);
    back.searchParams.set("iss", config.publicUrl);
    res.redirect(302, back.toString());
}
function sendOwnerConsentPage(res, input) {
    const url = new URL("https://admin.centralldark.com/mcp-autorizar");
    const values = {
        client_id: input.client_id,
        client_name: input.client_name,
        redirect_uri: input.redirect_uri,
        response_type: input.response_type,
        code_challenge: input.code_challenge,
        code_challenge_method: input.code_challenge_method,
        state: input.client_state,
        scope: input.scope,
        pair_id: input.device?.pairId,
        pair_code: input.device?.code,
        pair_nonce: input.device?.nonce,
        error: input.error,
        success: input.success === true ? "1" : undefined,
    };
    for (const [key, value] of Object.entries(values)) {
        if (value !== undefined && value !== null)
            url.searchParams.set(key, String(value));
    }
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.redirect(302, url.toString());
}
export function postRegister(req, res) {
    const body = (req.body ?? {});
    const redirect_uris = Array.isArray(body.redirect_uris)
        ? body.redirect_uris.filter((u) => typeof u === "string")
        : [];
    if (redirect_uris.length === 0) {
        res.status(400).json({ error: "invalid_redirect_uri", error_description: "redirect_uris obrigatório" });
        return;
    }
    const client = registerClient({
        client_name: body.client_name,
        redirect_uris,
        token_endpoint_auth_method: body.token_endpoint_auth_method ?? "none",
        grant_types: body.grant_types,
        response_types: body.response_types,
    });
    log.info("oauth_dcr_registered", {
        cid: req.cid,
        client_id: client.client_id,
        client_name: client.client_name,
        redirect_uris: client.redirect_uris,
    });
    res.status(201).json({
        client_id: client.client_id,
        client_id_issued_at: Math.floor(client.createdAt / 1000),
        client_name: client.client_name,
        redirect_uris: client.redirect_uris,
        token_endpoint_auth_method: client.token_endpoint_auth_method,
        grant_types: client.grant_types,
        response_types: client.response_types,
        cid: req.cid,
    });
}
export async function handleAuthorize(req, res) {
    try {
        // Cliente VS Code usa o MESMO /authorize, sem callback paralelo.
        if (param(req, "client_id") === VSCODE_DEVICE_CLIENT_ID) {
            if (!devicePairingStore)
                return oauthError(res, 503, "server_error", "Registro de dispositivos indisponível.");
            const pairId = param(req, "pair_id");
            const pair = devicePairingStore.pendingConsent(pairId);
            if (!pair || pair.executor !== "vscode" || pair.approved)
                return oauthError(res, 404, "invalid_request", "Pareamento expirado ou já concluído.");
            const details = {
                client_id: VSCODE_DEVICE_CLIENT_ID,
                client_name: "CentralDark · Vibe Coding",
                scope: "mcp",
                isAdmin: isAdmin(req),
                device: { pairId: pair.pairId, code: pair.code, nonce: pair.nonce }
            };
            if (req.method !== "POST") {
                sendOwnerConsentPage(res, details);
                return;
            }
            // Token de dispositivo só é entregue via /device/pair/status
            // ao solicitante que possui o segredo de posse, nunca ao navegador.
            if (!isAdmin(req))
                return oauthError(res, 403, "access_denied", "Sessão administrativa necessária.");
            const result = devicePairingStore.approveWeb({
                pairId, code: param(req, "pair_code"), nonce: param(req, "pair_nonce")
            });
            if (!result.ok)
                return oauthError(res, 403, "access_denied", "Código inválido, expirado ou já confirmado.");
            sendOwnerConsentPage(res, { ...details, success: true });
            return;
        }
        const client_id = param(req, "client_id");
        const redirect_uri = param(req, "redirect_uri");
        const response_type = param(req, "response_type");
        const code_challenge = param(req, "code_challenge");
        const code_challenge_method = param(req, "code_challenge_method");
        const client_state = param(req, "state") || undefined;
        const resource = param(req, "resource");
        const requestedScope = param(req, "scope");
        const isAdminResource = /(?:^|\s)admin(?:\s|$)/.test(requestedScope)
            || /\/admin\/mcp(?:$|[?#])/.test(resource);
        const scope = isAdminResource
            ? (requestedScope && /\badmin\b/.test(requestedScope) ? requestedScope : "mcp admin")
            : (requestedScope || "mcp");
        const client = await resolveClientRegistration(client_id, redirect_uri);
        if (!client) {
            oauthError(res, 400, "invalid_client", "client_id desconhecido. Faça /register antes ou use Client ID Metadata Document compatível.");
            return;
        }
        if (!redirectUriRegistered(client, redirect_uri)) {
            oauthError(res, 400, "invalid_request", "redirect_uri não registrado pra esse client.");
            return;
        }
        if (response_type !== "code") {
            redirectWithOAuthError(res, redirect_uri, "unsupported_response_type", client_state, "só response_type=code é suportado");
            return;
        }
        if (!code_challenge || code_challenge_method !== "S256") {
            redirectWithOAuthError(res, redirect_uri, "invalid_request", client_state, "PKCE S256 é obrigatório");
            return;
        }
        const payload = { client_id, redirect_uri, response_type, code_challenge, code_challenge_method, client_state, scope, client_name: client.client_name };
        if (req.method !== "POST") {
            sendOwnerConsentPage(res, payload);
            return;
        }
        const configuredPassword = getAdminPassword();
        const submittedPassword = param(req, "password");
        if (!configuredPassword) {
            log.error("oauth_admin_password_missing", { cid: req.cid, client_id: client.client_id });
            sendOwnerConsentPage(res, { ...payload, error: "MCP_ADMIN_PASSWORD ausente no servidor." });
            return;
        }
        if (!submittedPassword || !timingSafeEqualText(submittedPassword, configuredPassword)) {
            log.warn("oauth_admin_password_invalid", { cid: req.cid, client_id: client.client_id });
            sendOwnerConsentPage(res, { ...payload, error: "Senha inválida." });
            return;
        }
        const ownerToken = getOwnerToolToken();
        if (!ownerToken) {
            log.error("oauth_owner_tool_token_missing", { cid: req.cid, client_id: client.client_id });
            sendOwnerConsentPage(res, { ...payload, error: "Token interno do dono ausente no servidor." });
            return;
        }
        const authReq = createAuthRequest({ client_id: client.client_id, redirect_uri, client_state, code_challenge, code_challenge_method, scope });
        const ac = issueAuthCode({
            client_id: authReq.client_id,
            redirect_uri: authReq.redirect_uri,
            code_challenge: authReq.code_challenge,
            code_challenge_method: authReq.code_challenge_method,
            gh_token: ownerToken,
            gh_scope: "owner-admin",
            gh_login: "centraldark-admin",
            oauth_scope: authReq.scope || "mcp admin",
        });
        const back = new URL(authReq.redirect_uri);
        back.searchParams.set("code", ac.code);
        if (authReq.client_state)
            back.searchParams.set("state", authReq.client_state);
        back.searchParams.set("iss", config.publicUrl);
        log.info("oauth_authorize", {
            cid: req.cid,
            client_id: client.client_id,
            redirect_uri,
            mode: "owner_password",
        });
        res.redirect(302, back.toString());
    }
    catch (err) {
        log.error("oauth_authorize_exception", { cid: req.cid, error: String(err) });
        if (!res.headersSent) {
            res.status(500).send("Erro interno no authorize OAuth.");
        }
    }
}
export async function handleOAuthCallback(req, res) {
    res.status(410).type("text/plain").send("OAuth via GitHub foi removido. Use /authorize do MCP CentralDark.");
}
export function postToken(req, res) {
    const body = (req.body ?? {});
    const grant_type = String(body.grant_type ?? "");
    if (grant_type === "authorization_code") {
        const code = String(body.code ?? "");
        const code_verifier = String(body.code_verifier ?? "");
        const client_id = tokenClientId(req, body);
        const redirect_uri = String(body.redirect_uri ?? "");
        const ac = consumeAuthCode(code);
        if (!ac) {
            log.warn("oauth_token_invalid_code", { cid: req.cid, client_id_present: Boolean(client_id) });
            res.status(400).json({ error: "invalid_grant", error_description: "code inválido ou expirado" });
            return;
        }
        if (ac.client_id !== client_id) {
            log.warn("oauth_token_client_mismatch", { cid: req.cid, expected_client_id: ac.client_id, received_client_id_present: Boolean(client_id) });
            res.status(400).json({ error: "invalid_grant", error_description: "client_id não bate" });
            return;
        }
        if (ac.redirect_uri !== redirect_uri) {
            log.warn("oauth_token_redirect_mismatch", { cid: req.cid, client_id });
            res.status(400).json({ error: "invalid_grant", error_description: "redirect_uri não bate" });
            return;
        }
        const expected = crypto.createHash("sha256").update(code_verifier).digest("base64url");
        if (expected !== ac.code_challenge) {
            log.warn("oauth_token_pkce_mismatch", { cid: req.cid, client_id });
            res.status(400).json({ error: "invalid_grant", error_description: "PKCE verifier inválido" });
            return;
        }
        const pair = issueTokenPair({
            client_id: ac.client_id,
            gh_token: ac.gh_token,
            gh_scope: ac.gh_scope,
            gh_login: ac.gh_login,
            oauth_scope: ac.oauth_scope || "mcp admin",
        });
        log.info("oauth_token_issued", { cid: req.cid, client_id, gh_login: ac.gh_login, oauth_scope: ac.oauth_scope });
        res.json({
            access_token: pair.access.token,
            token_type: "Bearer",
            expires_in: Math.floor((pair.access.expiresAt - Date.now()) / 1000),
            refresh_token: pair.refresh.token,
            scope: ac.oauth_scope || "mcp",
            cid: req.cid,
        });
        return;
    }
    if (grant_type === "refresh_token") {
        const refresh_token = String(body.refresh_token ?? "");
        const client_id = tokenClientId(req, body);
        const rt = consumeRefreshToken(refresh_token, client_id);
        if (!rt) {
            log.warn("oauth_refresh_invalid", { cid: req.cid, client_id_present: Boolean(client_id) });
            res.status(400).json({ error: "invalid_grant", error_description: "refresh_token inválido ou expirado" });
            return;
        }
        if (client_id && rt.client_id !== client_id) {
            log.warn("oauth_refresh_client_mismatch", { cid: req.cid, expected_client_id: rt.client_id, received_client_id_present: true });
            res.status(400).json({ error: "invalid_grant", error_description: "client_id não bate" });
            return;
        }
        const pair = issueTokenPair({
            client_id: rt.client_id,
            gh_token: rt.gh_token,
            gh_scope: rt.gh_scope,
            gh_login: rt.gh_login,
            oauth_scope: rt.oauth_scope || "mcp",
        });
        log.info("oauth_token_refreshed", { cid: req.cid, client_id: rt.client_id, gh_login: rt.gh_login, oauth_scope: rt.oauth_scope });
        res.json({
            access_token: pair.access.token,
            token_type: "Bearer",
            expires_in: Math.floor((pair.access.expiresAt - Date.now()) / 1000),
            refresh_token: pair.refresh.token,
            scope: rt.oauth_scope || "mcp",
            cid: req.cid,
        });
        return;
    }
    res.status(400).json({ error: "unsupported_grant_type" });
}
export function handleOAuthStart(_req, res) {
    res.status(410).type("text/plain").send("OAuth via GitHub foi removido. Cadastre o cliente em /register e autorize por /authorize.");
}
// Emissão administrativa de chave — substitui a antiga tentativa (Ponte MCP/Lovable)
// de "injetar" token numa rota /set-token que nunca existiu. Autenticada com a
// mesma senha do admin usada em /authorize, gera um token real via issueTokenPair
// (o mesmo mecanismo de sessões pareadas access+refresh já usado pelo /token).
export function handleIssueKey(req, res) {
    const configuredPassword = getAdminPassword();
    if (!configuredPassword) {
        res.status(500).json({ error: "server_error", error_description: "MCP_ADMIN_PASSWORD ausente no servidor." });
        return;
    }
    const submittedPassword = String(req.body?.password ?? "");
    if (!submittedPassword || !timingSafeEqualText(submittedPassword, configuredPassword)) {
        log.warn("issue_key_password_invalid", { cid: req.cid });
        res.status(401).json({ error: "invalid_password" });
        return;
    }
    const agentName = String(req.body?.agent_name ?? "").trim().slice(0, 80) || "Agente sem nome";
    const scope = String(req.body?.scope ?? "mcp").trim() || "mcp";
    const pair = issueTokenPair({
        client_id: "issued_" + crypto.randomBytes(8).toString("hex"),
        gh_token: "",
        gh_scope: "issued-key",
        gh_login: agentName,
        oauth_scope: scope,
    });
    log.info("issue_key_created", { cid: req.cid, agent_name: agentName, scope });
    res.json({
        access_token: pair.access.token,
        token_type: "Bearer",
        expires_in: Math.floor((pair.access.expiresAt - Date.now()) / 1000),
        refresh_token: pair.refresh.token,
        scope,
        agent_name: agentName,
    });
}
//# sourceMappingURL=oauth.js.map
//# sourceMappingURL=oauth.js.map