// ============================================================
// HUB BROKER — CentralDark
// ============================================================
// Vive na VPS. Frontend (Lovable) fala com ele via hub.centralldark.com.
// Ele cifra API keys e faz o dance OAuth com providers externos,
// gravando tudo no Supabase HUB (lyoigsqluyktoclwdaft).
//
// Zero dependência de framework pesado. Só express + crypto nativo.
// ============================================================

import express from "express";
import crypto from "node:crypto";

// ---------- Config ----------
const PORT = Number(process.env.HUB_BROKER_PORT || 8790);
const HUB_URL = process.env.HUB_SUPABASE_URL;
const HUB_SERVICE_ROLE = process.env.HUB_SUPABASE_SERVICE_ROLE_KEY;
const ENC_KEY_HEX = process.env.HUB_ENCRYPTION_KEY;
const PUBLIC_BASE = process.env.HUB_BROKER_PUBLIC_BASE || "https://hub.centralldark.com";
const ALLOWED_ORIGINS = (process.env.HUB_ALLOWED_ORIGINS ||
  "https://centraldark.lovable.app,http://localhost:8080,http://localhost:5173")
  .split(",")
  .map((s) => s.trim());

// Providers OAuth (client_id/secret vêm de env; ausência = provider desabilitado)
const PROVIDERS = {
  github: {
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_CLIENT_SECRET,
    auth_url: "https://github.com/login/oauth/authorize",
    token_url: "https://github.com/login/oauth/access_token",
    scope: "repo read:user",
  },
  notion: {
    client_id: process.env.NOTION_CLIENT_ID,
    client_secret: process.env.NOTION_CLIENT_SECRET,
    auth_url: "https://api.notion.com/v1/oauth/authorize",
    token_url: "https://api.notion.com/v1/oauth/token",
    scope: "",
  },
  gdrive: {
    client_id: process.env.GDRIVE_CLIENT_ID,
    client_secret: process.env.GDRIVE_CLIENT_SECRET,
    auth_url: "https://accounts.google.com/o/oauth2/v2/auth",
    token_url: "https://oauth2.googleapis.com/token",
    scope: "https://www.googleapis.com/auth/drive.file",
    extra_authorize: { access_type: "offline", prompt: "consent" },
  },
};

// ---------- Sanity ----------
if (!HUB_URL || !HUB_SERVICE_ROLE) {
  console.error("[hub-broker] FATAL: HUB_SUPABASE_URL ou HUB_SUPABASE_SERVICE_ROLE_KEY ausente");
  process.exit(1);
}
if (!ENC_KEY_HEX || ENC_KEY_HEX.length !== 64) {
  console.error("[hub-broker] FATAL: HUB_ENCRYPTION_KEY precisa ser hex de 64 chars (32 bytes)");
  process.exit(1);
}
const ENC_KEY = Buffer.from(ENC_KEY_HEX, "hex");

// ---------- Crypto AES-256-GCM ----------
function encrypt(plain) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", ENC_KEY, iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}.${enc.toString("base64")}.${tag.toString("base64")}`;
}
function decrypt(blob) {
  const [ivB64, encB64, tagB64] = blob.split(".");
  const decipher = crypto.createDecipheriv("aes-256-gcm", ENC_KEY, Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(encB64, "base64")), decipher.final()]).toString("utf8");
}

// ---------- State signing (OAuth state param) ----------
function signState(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", ENC_KEY).update(body).digest("base64url");
  return `${body}.${sig}`;
}
function verifyState(token) {
  const [body, sig] = String(token || "").split(".");
  if (!body || !sig) return null;
  const expected = crypto.createHmac("sha256", ENC_KEY).update(body).digest("base64url");
  if (sig !== expected) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

// ---------- Supabase REST helper ----------
async function sb(path, init = {}) {
  const res = await fetch(`${HUB_URL}/rest/v1${path}`, {
    ...init,
    headers: {
      "apikey": HUB_SERVICE_ROLE,
      "Authorization": `Bearer ${HUB_SERVICE_ROLE}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation",
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Supabase HUB ${res.status}: ${text}`);
  }
  return text ? JSON.parse(text) : null;
}

// ---------- App ----------
const app = express();
app.use(express.json({ limit: "128kb" }));

// CORS enxuto
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,X-User-Id");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// ---------- Health ----------
app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "hub-broker",
    version: "0.1.0",
    ts: new Date().toISOString(),
    providers_enabled: Object.entries(PROVIDERS)
      .filter(([, cfg]) => cfg.client_id && cfg.client_secret)
      .map(([k]) => k),
  });
});

// ---------- User ID resolver ----------
// Enquanto o login real não existe, aceita X-User-Id do frontend (ou "dev-pivete" default).
// Quando o login entrar, aqui a gente valida JWT do Supabase HUB.
function getUserId(req) {
  return req.header("X-User-Id") || "dev-pivete";
}

// ---------- POST /api/keys/store ----------
// Body: { provider: "grok" | "claude" | ..., api_key: "sk-..." }
app.post("/api/keys/store", async (req, res) => {
  try {
    const user_id = getUserId(req);
    const { provider, api_key } = req.body || {};
    if (!provider || typeof provider !== "string") {
      return res.status(400).json({ error: "provider obrigatório" });
    }
    if (!api_key || typeof api_key !== "string" || api_key.length < 8) {
      return res.status(400).json({ error: "api_key inválida" });
    }
    const encrypted = encrypt(api_key);
    const now = new Date().toISOString();

    // upsert em oauth_connections (kind='api_key')
    const rows = await sb(`/oauth_connections?on_conflict=user_id,provider`, {
      method: "POST",
      headers: { "Prefer": "return=representation,resolution=merge-duplicates" },
      body: JSON.stringify([{
        user_id,
        provider,
        kind: "api_key",
        encrypted_token: encrypted,
        status: "connected",
        updated_at: now,
      }]),
    });
    res.json({ ok: true, provider, connection: rows?.[0] || null });
  } catch (err) {
    console.error("[/api/keys/store]", err);
    res.status(500).json({ error: String(err.message || err) });
  }
});

// ---------- GET /oauth/:provider/start ----------
app.get("/oauth/:provider/start", (req, res) => {
  const provider = req.params.provider;
  const cfg = PROVIDERS[provider];
  if (!cfg) return res.status(404).json({ error: `provider desconhecido: ${provider}` });
  if (!cfg.client_id || !cfg.client_secret) {
    return res.status(503).json({ error: `provider ${provider} não configurado no broker` });
  }
  const user_id = getUserId(req);
  const redirect_uri = `${PUBLIC_BASE}/oauth/${provider}/callback`;
  const state = signState({
    user_id,
    provider,
    exp: Date.now() + 10 * 60 * 1000,
    return_to: req.query.return_to || "/",
  });
  const params = new URLSearchParams({
    client_id: cfg.client_id,
    redirect_uri,
    response_type: "code",
    scope: cfg.scope,
    state,
    ...(cfg.extra_authorize || {}),
  });
  res.redirect(`${cfg.auth_url}?${params.toString()}`);
});

// ---------- GET /oauth/:provider/callback ----------
app.get("/oauth/:provider/callback", async (req, res) => {
  try {
    const provider = req.params.provider;
    const cfg = PROVIDERS[provider];
    if (!cfg) return res.status(404).send("provider desconhecido");
    const { code, state } = req.query;
    const payload = verifyState(state);
    if (!payload || payload.provider !== provider) {
      return res.status(400).send("state inválido ou expirado");
    }
    if (!code) return res.status(400).send("code ausente");

    const redirect_uri = `${PUBLIC_BASE}/oauth/${provider}/callback`;
    const tokenRes = await fetch(cfg.token_url, {
      method: "POST",
      headers: { "Accept": "application/json", "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: cfg.client_id,
        client_secret: cfg.client_secret,
        code: String(code),
        redirect_uri,
        grant_type: "authorization_code",
      }).toString(),
    });
    const tokenJson = await tokenRes.json().catch(() => ({}));
    if (!tokenRes.ok || tokenJson.error) {
      console.error(`[oauth/${provider}/callback] token fail`, tokenJson);
      return res.status(502).send(`Falha ao trocar code por token: ${JSON.stringify(tokenJson).slice(0, 300)}`);
    }
    const access_token = tokenJson.access_token;
    const refresh_token = tokenJson.refresh_token || null;
    const expires_in = tokenJson.expires_in || null;
    if (!access_token) return res.status(502).send("Provider não retornou access_token");

    const now = new Date().toISOString();
    await sb(`/oauth_connections?on_conflict=user_id,provider`, {
      method: "POST",
      headers: { "Prefer": "return=representation,resolution=merge-duplicates" },
      body: JSON.stringify([{
        user_id: payload.user_id,
        provider,
        kind: "oauth",
        encrypted_token: encrypt(access_token),
        encrypted_refresh: refresh_token ? encrypt(refresh_token) : null,
        expires_at: expires_in ? new Date(Date.now() + expires_in * 1000).toISOString() : null,
        status: "connected",
        raw_scope: tokenJson.scope || cfg.scope,
        updated_at: now,
      }]),
    });

    // Fecha popup / redireciona
    const returnTo = payload.return_to || "/";
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(`<!doctype html><html lang="pt-BR"><body style="background:#0a0a0a;color:#10b981;font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
<div style="text-align:center"><h1>✅ ${provider} conectado</h1><p style="opacity:.6">Pode fechar esta janela.</p></div>
<script>
  try { window.opener && window.opener.postMessage({ type: "hub-oauth-done", provider: "${provider}" }, "*"); } catch(e){}
  setTimeout(() => { if (window.opener) window.close(); else window.location.href = ${JSON.stringify(returnTo)}; }, 800);
</script>
</body></html>`);
  } catch (err) {
    console.error("[oauth callback]", err);
    res.status(500).send("erro interno: " + String(err.message || err));
  }
});

// ---------- POST /api/get-token ----------
// Auth interno: chamador precisa mandar HUB_INTERNAL_TOKEN no header.
// Só edge functions do HUB devem chamar isso — nunca o frontend.
const INTERNAL_TOKEN = process.env.HUB_INTERNAL_TOKEN;
app.post("/api/get-token", async (req, res) => {
  try {
    if (!INTERNAL_TOKEN || req.header("X-Internal-Token") !== INTERNAL_TOKEN) {
      return res.status(401).json({ error: "unauthorized" });
    }
    const { user_id, provider } = req.body || {};
    if (!user_id || !provider) return res.status(400).json({ error: "user_id e provider obrigatórios" });
    const rows = await sb(`/oauth_connections?user_id=eq.${encodeURIComponent(user_id)}&provider=eq.${encodeURIComponent(provider)}&limit=1`);
    if (!rows?.length) return res.status(404).json({ error: "sem conexão" });
    const row = rows[0];
    const token = decrypt(row.encrypted_token);
    res.json({ ok: true, provider, kind: row.kind, token, expires_at: row.expires_at });
  } catch (err) {
    console.error("[/api/get-token]", err);
    res.status(500).json({ error: String(err.message || err) });
  }
});

// ---------- GET /api/connections ----------
// Lista o que o user tem conectado (só metadata, sem tokens).
app.get("/api/connections", async (req, res) => {
  try {
    const user_id = getUserId(req);
    const rows = await sb(`/oauth_connections?user_id=eq.${encodeURIComponent(user_id)}&select=provider,kind,status,expires_at,updated_at`);
    res.json({ ok: true, connections: rows || [] });
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
});

// ---------- Start ----------
app.listen(PORT, "127.0.0.1", () => {
  console.log(`[hub-broker] 🚀 escutando em 127.0.0.1:${PORT}`);
  console.log(`[hub-broker] providers OAuth ativos:`, Object.entries(PROVIDERS).filter(([, c]) => c.client_id).map(([k]) => k).join(", ") || "(nenhum)");
});
