// Configuração lida do ambiente. Validação fail-fast no boot.

function req(name: string): string {
  const v = process.env[name];
  if (!v || v.trim() === "") {
    throw new Error(`[MCP] Variável de ambiente obrigatória ausente: ${name}`);
  }
  return v.trim();
}

function opt(name: string, fallback: string): string {
  const v = process.env[name];
  return v && v.trim() !== "" ? v.trim() : fallback;
}

function csv(name: string): string[] {
  return opt(name, "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export const config = {
  port: Number(opt("MCP_PORT", "9100")),
  publicUrl: opt("MCP_PUBLIC_URL", "http://127.0.0.1:9100"),

  github: {
    clientId: req("GITHUB_CLIENT_ID"),
    clientSecret: process.env.GITHUB_CLIENT_SECRET?.trim() ?? "",
    callbackUrl: req("GITHUB_OAUTH_CALLBACK"),
    scopes: opt("GITHUB_OAUTH_SCOPES", "repo workflow read:org"),
    owner: opt("GITHUB_OWNER", "ServerVpss"),
    repo: opt("GITHUB_REPO", "clone-deck"),
  },

  sessionSecret: req("MCP_SESSION_SECRET"),

  vps: {
    repoPath: opt("VPS_REPO_PATH", "<caminho-vps>"),
    // Modo criação controlado: o próprio MCP fica sempre permitido.
    // Serviços extras continuam dependendo da lista explícita via PM2_ALLOWED_RESTART.
    allowedRestart: Array.from(new Set(["MCP-CentralDark", ...csv("PM2_ALLOWED_RESTART")])),
  },

  log: {
    level: opt("LOG_LEVEL", "info"),
    dir: opt("LOG_DIR", "<caminho-vps>"),
  },
} as const;

export type Config = typeof config;
