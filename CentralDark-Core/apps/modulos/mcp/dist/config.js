// Configuração lida do ambiente.
//
// V2.0: imports devem ser fail-safe. O servidor nao deve cair so porque uma
// variavel de OAuth/GitHub esta ausente; endpoints que precisarem dela devem
// falhar em runtime com erro claro. Isso permite build, typecheck, /health e
// catalogo funcionarem em ambientes de teste/CI sem secrets.
import { fileURLToPath } from "node:url";
import path from "node:path";
import { existsSync } from "node:fs";
const _moduleDir = path.dirname(fileURLToPath(import.meta.url));
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
/**
 * Resolve a raiz real do produto, ancorada no modulo e nos marcadores do Core.
 * VPS_REPO_PATH continua aceito como alias legado. Nunca depende do cwd.
 */
function isCentralDarkRoot(dir) {
    return ["agent", "gateway", "CentralDark-Core/CENTRALDARK_AI_BOOT.yaml",
        "CentralDark-Core/LEIA-ME-IA.md"].every(marker => existsSync(path.join(dir, marker)));
}
function normalizeRoot(candidate) {
    const resolved = path.resolve(candidate);
    if (isCentralDarkRoot(resolved))
        return resolved;
    if (path.basename(resolved) === "CentralDark-Core" && isCentralDarkRoot(path.dirname(resolved))) {
        return path.dirname(resolved);
    }
    return null;
}
function discoverCentralDarkRoot(start = _moduleDir) {
    let dir = path.resolve(start);
    for (;;) {
        const root = normalizeRoot(dir);
        if (root)
            return root;
        const parent = path.dirname(dir);
        if (parent === dir)
            return null;
        dir = parent;
    }
}
function repoRootFromEnv() {
    const discovered = discoverCentralDarkRoot();
    for (const name of ["CENTRALDARK_REPO_ROOT", "VPS_REPO_PATH"]) {
        const value = opt(name, "");
        if (!value || value.toLowerCase() === "auto")
            continue;
        // A Windows drive path is not a relative Linux path, or vice versa.
        if (!path.isAbsolute(value) && (path.win32.isAbsolute(value) || path.posix.isAbsolute(value)))
            continue;
        const candidate = path.isAbsolute(value) ? value : discovered && path.resolve(discovered, value);
        if (candidate) {
            const root = normalizeRoot(candidate);
            if (root)
                return root;
        }
    }
    if (discovered)
        return discovered;
    throw new Error("CENTRALDARK_REPO_ROOT_NOT_FOUND: use a validated CentralDark checkout or explicit root");
}
const repoRoot = repoRootFromEnv();
const coreRoot = path.join(repoRoot, "CentralDark-Core");
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
        repoPath: repoRoot,
        corePath: coreRoot,
        allowedRestart: Array.from(new Set(["MCP-CentralDark", ...csv("PM2_ALLOWED_RESTART")])),
    },
    log: {
        level: opt("LOG_LEVEL", "info"),
        dir: path.join(repoRoot, "logs"),
    },
};
//# sourceMappingURL=config.js.map
//# sourceMappingURL=config.js.map