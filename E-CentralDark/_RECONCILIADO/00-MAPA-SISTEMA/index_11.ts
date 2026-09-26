// Entrypoint do servidor MCP CentralDark.


// === PATCH TOKEN AUTO (adicionado automaticamente) ===
const getMcpToken = () => {
  return process.env.MCP_CENTRALDARK_TOKEN ||
         process.env.CENTRALDARK_MCP_TOKEN ||
         process.env.MCP_TOKEN ||
         process.env.GITHUB_TOKEN;
};


import express from "express";
import { config } from "./config.js";
import { log } from "./log.js";
import { handleMcpRequest } from "./mcp-server.js";
import {
  getAuthorizationServerMetadata,
  getProtectedResourceMetadata,
  handleAuthorize,
  handleOAuthCallback,
  handleOAuthStart,
  postRegister,
  postToken,
} from "./oauth.js";
import { getAccessToken, getSession } from "./sessions.js";
import { getStatusHtml, getStatusJson } from "./status.js";
import { getCatalogSummary, CATALOG_VERSION } from "./tools-catalog.js";
import {
  handleSkillsList,
  handleSkillManifest,
  handleSkillRaw,
  handleSkillInstaller,
} from "./skills-public.js";

const app = express();

app.disable("x-powered-by");
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

// Manifesto público do catálogo de tools — pra provar do lado servidor
// qual conjunto está publicado agora (sem precisar abrir o ChatGPT).
app.get("/tools.json", (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.json(getCatalogSummary());
});

// ───────────────────────── Status dos conectores ─────────────────────────
app.get("/status", (req, res) => {
  getStatusHtml(req, res).catch(() => {
    if (!res.headersSent) res.status(500).send("Erro ao gerar status.");
  });
});
app.get("/status.json", (req, res) => {
  getStatusJson(req, res).catch(() => {
    if (!res.headersSent) res.status(500).json({ ok: false });
  });
});


// ───────────────────────── Skills públicas (sem auth) ────────────────────
// Qualquer IA externa puxa via curl: 1 comando instala a Consciência.
app.get("/skills", (req, res) => {
  handleSkillsList(req, res, config.publicUrl).catch(() => {
    if (!res.headersSent) res.status(500).json({ ok: false });
  });
});
app.get("/skills/:nome", (req, res) => {
  handleSkillManifest(req, res, config.publicUrl).catch(() => {
    if (!res.headersSent) res.status(500).json({ ok: false });
  });
});
app.get("/skills/:nome/SKILL.md", (req, res) => {
  handleSkillRaw(req, res).catch(() => {
    if (!res.headersSent) res.status(500).type("text/plain").send("erro");
  });
});
app.get("/skills/:nome/install.sh", (req, res) => {
  handleSkillInstaller(req, res, config.publicUrl).catch(() => {
    if (!res.headersSent) res.status(500).type("text/plain").send("# erro\nexit 1\n");
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
app.get("/oauth/start", handleOAuthStart);           // legado
app.get("/oauth/callback", handleOAuthCallback);     // serve novo E legado

// ─────────────────────────────── MCP HTTP ────────────────────────────────
// Resposta 401 com WWW-Authenticate apontando pro resource_metadata é como
// o ChatGPT descobre o OAuth do servidor.
function unauthorized(res: express.Response, msg: string) {
  res.setHeader(
    "WWW-Authenticate",
    `Bearer realm="mcp", resource_metadata="${config.publicUrl}/.well-known/oauth-protected-resource"`
  );
  res.status(401).json({
    jsonrpc: "2.0",
    error: { code: -32000, message: msg },
    id: null,
  });
}

function extractBearer(req: express.Request): string | undefined {
  const h = req.header("authorization") ?? req.header("Authorization");
  if (!h) return undefined;
  const m = /^Bearer\s+(.+)$/i.exec(h.trim());
  return m ? m[1].trim() : undefined;
}

function getMcpDirectToken(): string {
  return process.env.MCP_CENTRALDARK_TOKEN ||
    process.env.CENTRALDARK_MCP_TOKEN ||
    process.env.MCP_TOKEN ||
    "";
}

function getInternalGhToken(): string {
  return process.env.GITHUB_TOKEN ||
    process.env.GH_TOKEN ||
    "";
}

function resolveGhToken(req: express.Request): { token: string } | { error: string } {
  const bearer = extractBearer(req);
  if (bearer) {
    const direct = getMcpDirectToken();

    // Token direto do MCP Connector: autentica a entrada, mas usa token interno para operar.
    if (direct && bearer === direct) {
      const internal = getInternalGhToken();
      if (!internal) return { error: "Token interno do servidor não configurado." };
      return { token: internal };
    }

    // Fluxo OAuth original continua intacto.
    const at = getAccessToken(bearer);
    if (!at) return { error: "Access token inválido ou expirado." };
    return { token: at.gh_token };
  }
  // Retrocompat: header x-mcp-session continua funcionando
  const sid = String(req.header("x-mcp-session") ?? "");
  if (sid) {
    const s = getSession(sid);
    if (!s) return { error: "Sessão inválida ou expirada." };
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
