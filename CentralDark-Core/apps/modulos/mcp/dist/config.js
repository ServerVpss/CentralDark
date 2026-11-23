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
 * Resolve a raiz do repositório CentralDark de forma canônica e sem depender
 * de caminhos fixos de VPS (ex.: /root/CentralDark) que falham em contêineres
 * onde o checkout operacional vive em outro diretório (ex.: /data/CentralDark).
 *
 * Ordem de resolucao:
 *   1. `VPS_REPO_PATH` (sobrevive a deploy/host; fallback explicito).
 *   2. Descoberta a partir do modulo `config.js`: sobe ate achar o diretorio
 *      que contem `.git`.
 *   3. Fallback: `process.cwd()/CentralDark` (compatibilidade com servidores antigos).
 */
function repoRootFromEnv() {
    const explicit = opt("VPS_REPO_PATH");
    if (explicit) {
        return path.resolve(explicit);
    }
    // CENTRALDARK_REPO_ROOT (definido no .env do HOSTINGER) como alternativa
    // ao VPS_REPO_PATH. Evita depender de /root/CentralDark em contêineres
    // onde o checkout opera em outro diretório.
    const repoRootEnv = opt("CENTRALDARK_REPO_ROOT");
    if (repoRootEnv) {
        return path.resolve(repoRootEnv);
    }
    const discovered = discoverCentralDarkRoot();
    if (discovered) {
        return discovered;
    }
    return path.resolve(process.cwd(), "CentralDark");
}
function discoverCentralDarkRoot() {
    let dir = _moduleDir;
    for (;;) {
        if (existsSync(path.join(dir, ".git"))) {
            return path.resolve(dir);
        }
        const parent = path.dirname(dir);
        if (parent === dir) {
            break;
        }
        dir = parent;
    }
    return null;
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
        repoPath: repoRootFromEnv(),
        allowedRestart: Array.from(new Set(["MCP-CentralDark", ...csv("PM2_ALLOWED_RESTART")])),
    },
    log: {
        level: opt("LOG_LEVEL", "info"),
        dir: path.join(repoRootFromEnv(), "logs"),
    },
};
//# sourceMappingURL=config.js.map
//# sourceMappingURL=config.js.map