// OAuth 2.1 do MCP CentralDark.
//
// O ChatGPT (e qualquer cliente MCP padrão) implementa OAuth 2.1 conforme
// a MCP Authorization Spec. Nosso servidor expõe os endpoints de discovery,
// faz Dynamic Client Registration (RFC 7591), e por baixo do pano usa o
// GitHub OAuth pra autenticar o usuário e validar quem ele é.

import crypto from "node:crypto";
import type { Request, Response } from "express";
import { config } from "./config.js";
import { fetchWithRetry } from "./fetch-retry.js";
import { log } from "./log.js";
import {
  consumeAuthCode,
  consumeAuthRequest,
  consumePendingState,
  consumeRefreshToken,
  createAuthRequest,
  createPendingState,
  createSession,
  getClient,
  issueAuthCode,
  issueTokenPair,
  registerClient,
} from "./sessions.js";

const GITHUB_AUTHORIZE = "https://github.com/login/oauth/authorize";
const GITHUB_TOKEN = "https://github.com/login/oauth/access_token";
const GITHUB_USER = "https://api.github.com/user";

// Logins do GitHub permitidos. Vazio = qualquer um.
const allowedLogins = (process.env.MCP_ALLOWED_GH_LOGINS ?? "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

// ─────────────────────────── Discovery endpoints ─────────────────────────

export function getProtectedResourceMetadata(_req: Request, res: Response) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.json({
    resource: `${config.publicUrl}/mcp`,
    authorization_servers: [config.publicUrl],
    bearer_methods_supported: ["header"],
  });
}

export function getAuthorizationServerMetadata(_req: Request, res: Response) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.json({
    issuer: config.publicUrl,
    authorization_endpoint: `${config.publicUrl}/authorize`,
    token_endpoint: `${config.publicUrl}/token`,
    registration_endpoint: `${config.publicUrl}/register`,
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    code_challenge_methods_supported: ["S256"],
    token_endpoint_auth_methods_supported: ["none", "client_secret_post"],
    scopes_supported: ["mcp"],
  });
}

// ─────────────── Dynamic Client Registration (RFC 7591) ──────────────────

export function postRegister(req: Request, res: Response) {
  const body = (req.body ?? {}) as {
    client_name?: string;
    redirect_uris?: unknown;
    token_endpoint_auth_method?: string;
    grant_types?: string[];
    response_types?: string[];
  };

  const redirect_uris = Array.isArray(body.redirect_uris)
    ? (body.redirect_uris as unknown[]).filter((u): u is string => typeof u === "string")
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

// ─────────────────────── /authorize (ChatGPT → nós) ──────────────────────

export function handleAuthorize(req: Request, res: Response) {
  const client_id = String(req.query.client_id ?? "");
  const redirect_uri = String(req.query.redirect_uri ?? "");
  const response_type = String(req.query.response_type ?? "");
  const code_challenge = String(req.query.code_challenge ?? "");
  const code_challenge_method = String(req.query.code_challenge_method ?? "");
  const client_state = req.query.state ? String(req.query.state) : undefined;
  const scope = req.query.scope ? String(req.query.scope) : undefined;

  const client = getClient(client_id);
  if (!client) {
    res.status(400).send("client_id desconhecido. Faça /register antes.");
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
    client_id,
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
    client_id,
    redirect_uri,
    state: authReq.state.slice(0, 8) + "...",
  });
  res.redirect(url.toString());
}

// ─────────────────────── /oauth/callback (GitHub → nós) ──────────────────

export async function handleOAuthCallback(req: Request, res: Response) {
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

  // Decidir se é fluxo novo (ChatGPT) ou legado (/oauth/start)
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

    const data = (await tokenRes.json()) as {
      access_token?: string;
      scope?: string;
      error?: string;
      error_description?: string;
    };

    if (!data.access_token) {
      log.error("oauth_token_error", { error: data.error, desc: data.error_description });
      res.status(400).send(`GitHub recusou o token: ${data.error_description ?? data.error}`);
      return;
    }

    // Quem é esse usuário?
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
    const user = (await userRes.json()) as { login?: string };
    const login = (user.login ?? "").toLowerCase();

    if (allowedLogins.length > 0 && !allowedLogins.includes(login)) {
      log.warn("oauth_user_not_allowed", { login });
      res.status(403).send(`Usuário GitHub "${login}" não está autorizado neste MCP.`);
      return;
    }

    // ───── Fluxo NOVO (ChatGPT): emitir code próprio e redirecionar ─────
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
      if (authReq.client_state) back.searchParams.set("state", authReq.client_state);

      log.info("oauth_code_issued", {
        client_id: authReq.client_id,
        gh_login: login,
        redirect_uri: authReq.redirect_uri,
      });
      res.redirect(back.toString());
      return;
    }

    // ───── Fluxo LEGADO (x-mcp-session) ─────
    const session = createSession(data.access_token, data.scope ?? "");
    log.info("oauth_session_created", { id: session.id.slice(0, 8) + "...", scope: data.scope });

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(`<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><title>MCP — Login OK</title>
<style>body{font-family:system-ui,sans-serif;max-width:640px;margin:40px auto;padding:0 20px;color:#111}
code{background:#f3f4f6;padding:6px 10px;border-radius:6px;word-break:break-all;display:block;margin:8px 0}
.ok{color:#059669}</style></head>
<body><h1 class="ok">Login feito com sucesso</h1>
<p>Session ID (header <code>x-mcp-session</code>):</p>
<code>${session.id}</code>
<p>Validade: 12h. Pode fechar essa aba.</p>
</body></html>`);
  } catch (err) {
    log.error("oauth_callback_exception", { error: String(err) });
    res.status(500).send("Erro interno no callback OAuth.");
  }
}

// ─────────────────────── /token (ChatGPT troca code) ─────────────────────

export function postToken(req: Request, res: Response) {
  const body = (req.body ?? {}) as Record<string, string | undefined>;
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
    // PKCE: SHA256(verifier) base64url == challenge
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

// ───────────── Legado: /oauth/start (mantido pra retrocompat) ────────────

export function handleOAuthStart(_req: Request, res: Response) {
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
