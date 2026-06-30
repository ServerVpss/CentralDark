// Configuração lida do ambiente.
//
// V2.0: imports devem ser fail-safe. O servidor nao deve cair so porque uma
// variavel de OAuth/GitHub esta ausente; endpoints que precisarem dela devem
// falhar em runtime com erro claro. Isso permite build, typecheck, /health e
// catalogo funcionarem em ambientes de teste/CI sem secrets.
function req(name) {
    const v = process.env[name];
    return v && v.trim() !== "" ? v.trim() : `__MISSING_${name}__`;
}
function opt(name, fallback) {
    const v = process.env[name];
    return v && v.trim() !== "" ? v.trim() : fallback;
}
function csv(name) {
    return opt(name, "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
}
export const config = {
    port: Number(opt("MCP_PORT", "9100")),
    publicUrl: opt("MCP_PUBLIC_URL", "https://mcp.centralldark.com"),
    github: {
        clientId: req("GITHUB_CLIENT_ID"),
        clientSecret: process.env.GITHUB_CLIENT_SECRET?.trim() ?? "",
        callbackUrl: req("GITHUB_OAUTH_CALLBACK"),
        scopes: opt("GITHUB_OAUTH_SCOPES", "repo workflow read:org"),
        owner: opt("GITHUB_OWNER", "ServerVpss"),
        repo: opt("GITHUB_REPO", "CentralDark"),
    },
    sessionSecret: req("MCP_SESSION_SECRET"),
    vps: {
        repoPath: opt("VPS_REPO_PATH", "/root/CentralDark"),
        allowedRestart: Array.from(new Set(["MCP-CentralDark", ...csv("PM2_ALLOWED_RESTART")])),
    },
    log: {
        level: opt("LOG_LEVEL", "info"),
        dir: opt("LOG_DIR", "/root/CentralDark/logs"),
    },
};
//# sourceMappingURL=config.js.map