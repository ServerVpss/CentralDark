// OAuth 2.1 do MCP CentralDark.
import crypto from "node:crypto";
import { config } from "./config.js";
import { fetchWithRetry } from "./lib/fetch-retry.js";
import { log } from "./log.js";
import { getCatalogSummary } from "./tools/core/tools-catalog.js";
import { consumeAuthCode, consumeAuthRequest, consumePendingState, consumeRefreshToken, createAuthRequest, createPendingState, createSession, getClient, issueAuthCode, issueTokenPair, registerClient, } from "./sessions.js";
const GITHUB_AUTHORIZE = "https://github.com/login/oauth/authorize";
const GITHUB_TOKEN = "https://github.com/login/oauth/access_token";
const GITHUB_USER = "https://api.github.com/user";
const CLIENT_METADATA_TTL_MS = 1000 * 60 * 10;
const allowedLogins = (process.env.MCP_ALLOWED_GH_LOGINS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
const clientMetadataCache = new Map();
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
    const res = await fetchWithRetry(client_id, {
        headers: {
            Accept: "application/json",
            "User-Agent": "MCP-CentralDark/0.4",
        },
        retries: 2,
        label: "client_id_metadata",
    });
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
    if (!metadata.redirect_uris.includes(redirect_uri)) {
        log.warn("oauth_client_metadata_redirect_rejected", { client_id, redirect_uri });
        return undefined;
    }
    return metadata;
}
function escapeHtml(value) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
function jsonForInlineScript(value) {
    return JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e");
}
function sendOAuthSuccessPage(res, input) {
    const catalog = getCatalogSummary();
    const readOnlyTools = catalog.tools.filter((tool) => tool.readOnly).length;
    const writeTools = Math.max(catalog.toolCount - readOnlyTools, 0);
    const safeLogin = escapeHtml(input.login || "usuario autorizado");
    const hasRedirect = Boolean(input.redirectUrl);
    const safeRedirect = input.redirectUrl ? escapeHtml(input.redirectUrl) : "";
    const redirectScript = input.redirectUrl
        ? `<script>setTimeout(function(){ window.location.replace(${jsonForInlineScript(input.redirectUrl)}); }, 1800);</script>`
        : "";
    const redirectMeta = input.redirectUrl
        ? `<meta http-equiv="refresh" content="3;url=${safeRedirect}">`
        : "";
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.send(`<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  ${redirectMeta}
  <title>CENTRAL DARK - Conector autorizado</title>
  <style>
    :root {
      --bg: #070b16;
      --panel: rgba(12, 19, 36, 0.78);
      --panel-line: rgba(148, 163, 184, 0.18);
      --text: #f8fafc;
      --muted: #9aa8bd;
      --cyan: #32d3ff;
      --green: #1ed49a;
      --amber: #f5c451;
      --ink: #0b1020;
    }

    * { box-sizing: border-box; }

    body {
      min-height: 100vh;
      margin: 0;
      color: var(--text);
      background:
        radial-gradient(circle at 50% 44%, rgba(30, 212, 154, 0.18), transparent 18rem),
        radial-gradient(circle at 72% 22%, rgba(50, 211, 255, 0.12), transparent 20rem),
        linear-gradient(135deg, #080d1b 0%, #111a30 46%, #07101e 100%);
      font-family: "Aptos", "Segoe UI", sans-serif;
      overflow: hidden;
    }

    body::before {
      content: "";
      position: fixed;
      inset: 0;
      pointer-events: none;
      background-image:
        linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
      background-size: 56px 56px;
      mask-image: linear-gradient(to bottom, transparent, #000 20%, #000 78%, transparent);
    }

    main {
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 28px;
    }

    .shell {
      width: min(760px, 100%);
      text-align: center;
      position: relative;
      animation: rise 560ms cubic-bezier(.2,.8,.2,1) both;
    }

    .logo {
      width: 98px;
      height: 98px;
      margin: 0 auto 26px;
      border-radius: 28px;
      display: grid;
      place-items: center;
      position: relative;
      background: linear-gradient(145deg, #111827, #07111f);
      border: 1px solid rgba(255, 255, 255, 0.16);
      box-shadow: 0 28px 80px rgba(0, 0, 0, 0.45), 0 0 0 8px rgba(50, 211, 255, 0.05);
    }

    .logo::before {
      content: "";
      position: absolute;
      inset: 12px;
      border-radius: 22px;
      background: conic-gradient(from 210deg, var(--cyan), var(--green), #ffffff, var(--cyan));
      opacity: .92;
      filter: saturate(1.08);
    }

    .logo span {
      position: relative;
      width: 62px;
      height: 62px;
      border-radius: 18px;
      display: grid;
      place-items: center;
      color: var(--ink);
      background: #f8fafc;
      font-family: Georgia, "Times New Roman", serif;
      font-weight: 800;
      font-size: 24px;
      letter-spacing: 0;
    }

    .eyebrow {
      margin: 0 0 12px;
      color: var(--green);
      font-size: 13px;
      font-weight: 800;
      letter-spacing: .14em;
      text-transform: uppercase;
    }

    h1 {
      margin: 0;
      font-family: Georgia, "Times New Roman", serif;
      font-size: clamp(40px, 7vw, 76px);
      letter-spacing: 0;
      line-height: .9;
    }

    .subtitle {
      max-width: 610px;
      margin: 22px auto 0;
      color: #dbeafe;
      font-size: clamp(17px, 2vw, 21px);
      line-height: 1.55;
    }

    .panel {
      margin: 34px auto 0;
      width: min(620px, 100%);
      padding: 18px;
      border-radius: 8px;
      background: var(--panel);
      border: 1px solid var(--panel-line);
      box-shadow: 0 28px 110px rgba(0, 0, 0, .34);
      backdrop-filter: blur(18px);
    }

    .metrics {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }

    .metric {
      min-height: 92px;
      padding: 16px 12px;
      border-radius: 8px;
      background: rgba(255, 255, 255, .045);
      border: 1px solid rgba(255, 255, 255, .08);
    }

    .metric strong {
      display: block;
      font-size: 28px;
      line-height: 1;
      color: var(--text);
    }

    .metric span {
      display: block;
      margin-top: 9px;
      color: var(--muted);
      font-size: 13px;
      line-height: 1.25;
    }

    .status {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin-top: 18px;
      color: var(--muted);
      font-size: 14px;
    }

    .pulse {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--green);
      box-shadow: 0 0 0 0 rgba(30, 212, 154, .55);
      animation: pulse 1.4s infinite;
      flex: none;
    }

    .foot {
      margin-top: 22px;
      color: rgba(203, 213, 225, .72);
      font-size: 13px;
    }

    @keyframes rise {
      from { opacity: 0; transform: translateY(18px) scale(.985); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    @keyframes pulse {
      70% { box-shadow: 0 0 0 14px rgba(30, 212, 154, 0); }
      100% { box-shadow: 0 0 0 0 rgba(30, 212, 154, 0); }
    }

    @media (max-width: 620px) {
      body { overflow: auto; }
      main { padding: 22px; }
      .metrics { grid-template-columns: 1fr; }
      .metric { min-height: 78px; }
    }
  </style>
</head>
<body>
  <main>
    <section class="shell" aria-label="Central Dark OAuth autorizado">
      <div class="logo" aria-hidden="true"><span>CD</span></div>
      <p class="eyebrow">Conector autorizado</p>
      <h1>CENTRAL DARK</h1>
      <p class="subtitle">
        Login confirmado para <strong>${safeLogin}</strong>. O MCP CentralDark esta pronto para operar com as ferramentas autorizadas neste conector.
      </p>

      <div class="panel">
        <div class="metrics" aria-label="Resumo do conector">
          <div class="metric"><strong>${catalog.toolCount}</strong><span>ferramentas MCP</span></div>
          <div class="metric"><strong>${readOnlyTools}</strong><span>somente leitura</span></div>
          <div class="metric"><strong>${writeTools}</strong><span>acoes controladas</span></div>
        </div>
        <div class="status">
          <span class="pulse" aria-hidden="true"></span>
          <span>${hasRedirect ? "Retornando ao seu app para finalizar a conexao..." : "Sessao criada. Pode fechar esta aba."}</span>
        </div>
      </div>

      <p class="foot">OAuth MCP ativo - catalogo ${escapeHtml(catalog.catalogVersion)}${input.legacySessionCreated ? " - modo legado" : ""}</p>
    </section>
  </main>
  ${redirectScript}
</body>
</html>`);
}
export function getProtectedResourceMetadata(_req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.json({
        resource: `${config.publicUrl}/mcp`,
        authorization_servers: [config.publicUrl],
        bearer_methods_supported: ["header"],
        scopes_supported: ["mcp"],
        resource_documentation: `${config.publicUrl}/status`,
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
        scopes_supported: ["mcp"],
        authorization_response_iss_parameter_supported: true,
    });
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
        client_id: client.client_id,
        client_name: client.client_name,
        redirect_uris: client.redirect_uris,
    });
    res.status(201).json({
        client_id: client.client_id,
        client_name: client.client_name,
        redirect_uris: client.redirect_uris,
        token_endpoint_auth_method: client.token_endpoint_auth_method,
        grant_types: client.grant_types,
        response_types: client.response_types,
    });
}
export async function handleAuthorize(req, res) {
    try {
        const client_id = String(req.query.client_id ?? "");
        const redirect_uri = String(req.query.redirect_uri ?? "");
        const response_type = String(req.query.response_type ?? "");
        const code_challenge = String(req.query.code_challenge ?? "");
        const code_challenge_method = String(req.query.code_challenge_method ?? "");
        const client_state = req.query.state ? String(req.query.state) : undefined;
        const scope = req.query.scope ? String(req.query.scope) : undefined;
        const client = await resolveClientRegistration(client_id, redirect_uri);
        if (!client) {
            res.status(400).send("client_id desconhecido. Faça /register antes ou use Client ID Metadata Document compatível.");
            return;
        }
        if (!client.redirect_uris.includes(redirect_uri)) {
            res.status(400).send("redirect_uri não registrado pra esse client.");
            return;
        }
        if (response_type !== "code") {
            res.status(400).send("response_type inválido — só 'code' é suportado.");
            return;
        }
        if (!code_challenge || code_challenge_method !== "S256") {
            res.status(400).send("PKCE S256 é obrigatório.");
            return;
        }
        const authReq = createAuthRequest({
            client_id: client.client_id,
            redirect_uri,
            client_state,
            code_challenge,
            code_challenge_method,
            scope,
        });
        const url = new URL(GITHUB_AUTHORIZE);
        url.searchParams.set("client_id", config.github.clientId);
        url.searchParams.set("redirect_uri", config.github.callbackUrl);
        url.searchParams.set("scope", config.github.scopes);
        url.searchParams.set("state", authReq.state);
        url.searchParams.set("allow_signup", "false");
        log.info("oauth_authorize", {
            client_id: client.client_id,
            redirect_uri,
            state: authReq.state.slice(0, 8) + "...",
        });
        res.redirect(url.toString());
    }
    catch (err) {
        log.error("oauth_authorize_exception", { error: String(err) });
        if (!res.headersSent) {
            res.status(500).send("Erro interno no authorize OAuth.");
        }
    }
}
export async function handleOAuthCallback(req, res) {
    const code = String(req.query.code ?? "");
    const state = String(req.query.state ?? "");
    if (!code || !state) {
        res.status(400).send("Faltando parâmetros code/state.");
        return;
    }
    if (!config.github.clientSecret) {
        log.error("oauth_callback_missing_secret");
        res.status(500).send("Servidor mal configurado: GITHUB_CLIENT_SECRET ausente.");
        return;
    }
    const authReq = consumeAuthRequest(state);
    const legacyOk = !authReq && consumePendingState(state);
    if (!authReq && !legacyOk) {
        res.status(400).send("State inválido ou expirado. Tente entrar de novo.");
        return;
    }
    try {
        const tokenRes = await fetchWithRetry(GITHUB_TOKEN, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "User-Agent": "MCP-CentralDark/0.3",
            },
            body: JSON.stringify({
                client_id: config.github.clientId,
                client_secret: config.github.clientSecret,
                code,
                redirect_uri: config.github.callbackUrl,
            }),
            retries: 3,
            label: "github_token_exchange",
        });
        if (!tokenRes.ok) {
            log.error("oauth_token_http_error", { status: tokenRes.status });
            res.status(502).send("Erro ao trocar code por token no GitHub.");
            return;
        }
        const data = (await tokenRes.json());
        if (!data.access_token) {
            log.error("oauth_token_error", { error: data.error, desc: data.error_description });
            res.status(400).send(`GitHub recusou o token: ${data.error_description ?? data.error}`);
            return;
        }
        const userRes = await fetchWithRetry(GITHUB_USER, {
            headers: {
                Authorization: `Bearer ${data.access_token}`,
                Accept: "application/vnd.github+json",
                "User-Agent": "MCP-CentralDark/0.3",
            },
            retries: 3,
            label: "github_user",
        });
        if (!userRes.ok) {
            log.error("oauth_user_http_error", { status: userRes.status });
            res.status(502).send("Não consegui consultar o GitHub pra confirmar o usuário.");
            return;
        }
        const user = (await userRes.json());
        const login = (user.login ?? "").toLowerCase();
        if (allowedLogins.length > 0 && !allowedLogins.includes(login)) {
            log.warn("oauth_user_not_allowed", { login });
            res.status(403).send(`Usuário GitHub "${login}" não está autorizado neste MCP.`);
            return;
        }
        if (authReq) {
            const ac = issueAuthCode({
                client_id: authReq.client_id,
                redirect_uri: authReq.redirect_uri,
                code_challenge: authReq.code_challenge,
                code_challenge_method: authReq.code_challenge_method,
                gh_token: data.access_token,
                gh_scope: data.scope ?? "",
                gh_login: login,
            });
            const back = new URL(authReq.redirect_uri);
            back.searchParams.set("code", ac.code);
            if (authReq.client_state)
                back.searchParams.set("state", authReq.client_state);
            back.searchParams.set("iss", config.publicUrl);
            log.info("oauth_code_issued", {
                client_id: authReq.client_id,
                gh_login: login,
                redirect_uri: authReq.redirect_uri,
            });
            // Redirect HTTP 302 real (RFC 6749 §4.1.2). Clients que processam a resposta
            // de autorização no backend (ex.: ChatGPT) não executam JS, então a antiga
            // página de sucesso com redirect via window.location nunca os levava de volta.
            res.redirect(302, back.toString());
            return;
        }
        const session = createSession(data.access_token, data.scope ?? "");
        log.info("oauth_session_created", { id: session.id.slice(0, 8) + "...", scope: data.scope });
        sendOAuthSuccessPage(res, { login, legacySessionCreated: true });
    }
    catch (err) {
        log.error("oauth_callback_exception", { error: String(err) });
        res.status(500).send("Erro interno no callback OAuth.");
    }
}
export function postToken(req, res) {
    const body = (req.body ?? {});
    const grant_type = String(body.grant_type ?? "");
    if (grant_type === "authorization_code") {
        const code = String(body.code ?? "");
        const code_verifier = String(body.code_verifier ?? "");
        const client_id = String(body.client_id ?? "");
        const redirect_uri = String(body.redirect_uri ?? "");
        const ac = consumeAuthCode(code);
        if (!ac) {
            res.status(400).json({ error: "invalid_grant", error_description: "code inválido ou expirado" });
            return;
        }
        if (ac.client_id !== client_id) {
            res.status(400).json({ error: "invalid_grant", error_description: "client_id não bate" });
            return;
        }
        if (ac.redirect_uri !== redirect_uri) {
            res.status(400).json({ error: "invalid_grant", error_description: "redirect_uri não bate" });
            return;
        }
        const expected = crypto.createHash("sha256").update(code_verifier).digest("base64url");
        if (expected !== ac.code_challenge) {
            res.status(400).json({ error: "invalid_grant", error_description: "PKCE verifier inválido" });
            return;
        }
        const pair = issueTokenPair({
            client_id: ac.client_id,
            gh_token: ac.gh_token,
            gh_scope: ac.gh_scope,
            gh_login: ac.gh_login,
        });
        log.info("oauth_token_issued", { client_id, gh_login: ac.gh_login });
        res.json({
            access_token: pair.access.token,
            token_type: "Bearer",
            expires_in: Math.floor((pair.access.expiresAt - Date.now()) / 1000),
            refresh_token: pair.refresh.token,
            scope: "mcp",
        });
        return;
    }
    if (grant_type === "refresh_token") {
        const refresh_token = String(body.refresh_token ?? "");
        const rt = consumeRefreshToken(refresh_token);
        if (!rt) {
            res.status(400).json({ error: "invalid_grant", error_description: "refresh_token inválido ou expirado" });
            return;
        }
        const pair = issueTokenPair({
            client_id: rt.client_id,
            gh_token: rt.gh_token,
            gh_scope: rt.gh_scope,
            gh_login: rt.gh_login,
        });
        log.info("oauth_token_refreshed", { client_id: rt.client_id, gh_login: rt.gh_login });
        res.json({
            access_token: pair.access.token,
            token_type: "Bearer",
            expires_in: Math.floor((pair.access.expiresAt - Date.now()) / 1000),
            refresh_token: pair.refresh.token,
            scope: "mcp",
        });
        return;
    }
    res.status(400).json({ error: "unsupported_grant_type" });
}
export function handleOAuthStart(_req, res) {
    const state = createPendingState();
    const url = new URL(GITHUB_AUTHORIZE);
    url.searchParams.set("client_id", config.github.clientId);
    url.searchParams.set("redirect_uri", config.github.callbackUrl);
    url.searchParams.set("scope", config.github.scopes);
    url.searchParams.set("state", state);
    url.searchParams.set("allow_signup", "false");
    log.info("oauth_start_legacy", { state: state.slice(0, 8) + "..." });
    res.redirect(url.toString());
}
//# sourceMappingURL=oauth.js.map