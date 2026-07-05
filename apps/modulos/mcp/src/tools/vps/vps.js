// Helpers de execução na VPS. Usados pelos tools do Estágio 3.
// Tudo aqui assume que o MCP roda DENTRO da VPS (cwd e shell locais).
import { exec as execCb } from "node:child_process";
import { promisify } from "node:util";
import { config } from "../../config.js";
import { log } from "../../log.js";
const exec = promisify(execCb);
const MAX_BUFFER = 4 * 1024 * 1024; // 4MB
const DEFAULT_TIMEOUT_MS = 30_000;
// Regex que mascara tokens/senhas/secrets em qualquer log antes de devolver pro modelo.
const SECRET_PATTERNS = [
    /(token|password|authorization|apikey|api_key|secret|bot_token|client_secret)[=: ]+["']?[A-Za-z0-9_\-./+]+/gi,
    /(SUPABASE[^=\s]*=)[^ ,"\s]+/gi,
    /(TELEGRAM[^=\s]*=)[^ ,"\s]+/gi,
    /(GITHUB[^=\s]*=)[^ ,"\s]+/gi,
    /\beyJ[A-Za-z0-9_\-]{20,}\.[A-Za-z0-9_\-]{20,}\.[A-Za-z0-9_\-]{20,}\b/g, // JWT
    /\bghp_[A-Za-z0-9]{20,}\b/g, // GitHub PAT clássico
    /\bgithub_pat_[A-Za-z0-9_]{20,}\b/g,
];
export function sanitize(text) {
    let out = text;
    for (const r of SECRET_PATTERNS) {
        out = out.replace(r, (match) => {
            const eq = match.indexOf("=");
            if (eq !== -1)
                return match.slice(0, eq + 1) + "***OCULTO***";
            const sp = match.indexOf(" ");
            if (sp !== -1)
                return match.slice(0, sp + 1) + "***OCULTO***";
            return "***OCULTO***";
        });
    }
    return out;
}
export async function runShell(command, opts = {}) {
    const cwd = opts.cwd ?? config.vps.repoPath;
    const timeout = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    log.info("shell_exec", { cwd, cmd: command.slice(0, 200) });
    try {
        const { stdout, stderr } = await exec(command, {
            cwd,
            timeout,
            maxBuffer: MAX_BUFFER,
            shell: "/bin/bash",
        });
        return { stdout: sanitize(stdout), stderr: sanitize(stderr), exitCode: 0 };
    }
    catch (err) {
        const e = err;
        return {
            stdout: sanitize(e.stdout ?? ""),
            stderr: sanitize(e.stderr ?? String(err)),
            exitCode: typeof e.code === "number" ? e.code : 1,
        };
    }
}
// Lista branca dura de serviços que podem ser reiniciados via MCP.
// A intersecção entre PM2_ALLOWED_RESTART (env/config) e esta lista é o que vale.
// "Grok" não é serviço PM2; quem aciona o Grok por tarefa é o monitor_tarefas.
const HARD_ALLOWLIST = new Set([
    "CloneDeck-Supabase-Sync",
    "MultiZap-TelegramBot",
    "MCP-CentralDark",
    "monitor_tarefas",
]);
export function canRestart(service) {
    if (!HARD_ALLOWLIST.has(service))
        return false;
    if (config.vps.allowedRestart.length === 0)
        return false;
    return config.vps.allowedRestart.includes(service);
}
export function allowedServices() {
    return config.vps.allowedRestart.filter((s) => HARD_ALLOWLIST.has(s));
}
// ============================================
// Export agrupado para compatibilidade com mcp-admin.ts
// ============================================
export const vpsTools = {
    sanitize,
    runShell,
    canRestart,
    allowedServices,
};
//# sourceMappingURL=vps.js.map