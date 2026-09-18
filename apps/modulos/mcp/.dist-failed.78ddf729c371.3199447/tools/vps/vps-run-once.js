import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { config } from "../../config.js";
import { runShell, sanitize } from "./vps.js";
import { auditLog } from "../../lib/audit.js";
const CONFIRM_RUN_ONCE = "CONFIRMO RUN ONCE";
const LOG_BASE = "/root/CentralDark/revisoes";
const DENY_SCRIPT_PATTERNS = [
    /\brm\s+-rf\s+\/(\s|$)/i,
    /\brm\s+-rf\s+\*/i,
    /\bmkfs\b/i,
    /\bdd\s+if=/i,
    /\bshutdown\b/i,
    /\breboot\b/i,
    /\bpoweroff\b/i,
    /\bdo-release-upgrade\b/i,
    /\bpasswd\b/i,
    /\buserdel\b/i,
    /\bchmod\s+-R\s+777\s+\//i,
    /\bchown\s+-R\s+[^ ]+\s+\//i,
    // 🔓 Liberado 04/07/2026 (ordem do Pivete): docker/caddy/pm2 restart livres pra acelerar deploy.
    // Nenhum usuário externo no sistema — risco controlado.
    /(^|\/)(\.env|secrets?|credenciais|tokens?|sessions?|sessao|sessão)(\/|$)/i,
];
function ok(data) {
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}
function repoRoot() {
    return path.resolve(config.vps.repoPath);
}
function safeName(name) {
    const clean = name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_.-]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80);
    if (!clean)
        throw new Error("Nome inválido.");
    return clean;
}
function findBlocked(script) {
    return DENY_SCRIPT_PATTERNS
        .filter((pattern) => pattern.test(script))
        .map((pattern) => String(pattern));
}
async function tailFile(file, max = 6000) {
    try {
        const text = await fs.readFile(file, "utf8");
        return sanitize(text.slice(-max));
    }
    catch {
        return "";
    }
}
export const vpsRunOnceTools = [
    {
        name: "vps_git_status",
        description: "Mostra git status curto, branch e último commit do repo da VPS. Apenas leitura.",
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false, title: "Git status VPS" },
        inputSchema: z.object({}),
        handler: async () => {
            const res = await runShell("git status --short && echo '--- branch ---' && git branch --show-current && echo '--- last commit ---' && git log -1 --oneline", {
                cwd: repoRoot(),
                timeoutMs: 20_000,
            });
            return ok({
                cwd: repoRoot(),
                exitCode: res.exitCode,
                stdout: res.stdout,
                stderr: res.stderr,
            });
        },
    },
    {
        name: "vps_git_diff_safe",
        description: "Mostra git diff sanitizado de arquivos do repo. Apenas leitura. Limita tamanho da saída.",
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false, title: "Git diff seguro" },
        inputSchema: z.object({
            path: z.string().optional().describe("Arquivo/pasta opcional dentro do repo"),
            staged: z.boolean().optional().describe("Se true, mostra diff staged"),
        }),
        handler: async (input) => {
            const target = input.path ? input.path.replace(/\\/g, "/") : "";
            if (target.includes("..") || target.startsWith("/") || /(^|\/)(\.env|secrets?|tokens?|sessions?|credenciais)(\/|$)/i.test(target)) {
                return ok({ status: "BLOQUEADO", reason: "Path inseguro.", path: input.path });
            }
            const staged = input.staged ? "--cached " : "";
            const cmd = target
                ? `git diff ${staged}-- ${JSON.stringify(target)} | head -c 50000`
                : `git diff ${staged}| head -c 50000`;
            const res = await runShell(cmd, { cwd: repoRoot(), timeoutMs: 20_000 });
            return ok({ cwd: repoRoot(), exitCode: res.exitCode, diff: res.stdout, stderr: res.stderr });
        },
    },
    {
        name: "vps_run_once_script",
        description: "Cria e executa um script run-once controlado na VPS, com logs em /root/CentralDark/revisoes. Por padrão é dry-run. Execução real exige CONFIRMO RUN ONCE. Bloqueia comandos e paths perigosos.",
        annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false, title: "Run-once seguro" },
        inputSchema: z.object({
            name: z.string().min(1).describe("Nome curto da tarefa"),
            script: z.string().min(1).max(20000).describe("Conteúdo bash do run-once"),
            dryRun: z.boolean().optional().describe("Padrão true"),
            confirm: z.string().optional().describe("Para executar: CONFIRMO RUN ONCE"),
            timeoutMs: z.number().int().min(1000).max(300000).optional(),
        }),
        handler: async (input) => {
            const _t0 = Date.now();
            const _auditBase = { tool: "vps_run_once_script", command: `[run-once:${input.name}]`, root: "project", cwd: repoRoot() };
            const name = safeName(input.name);
            const blocked = findBlocked(input.script);
            const stamp = new Date().toISOString().replace(/[:.]/g, "-");
            const dir = path.join(LOG_BASE, `${stamp}-${name}`);
            const scriptPath = path.join(dir, "run.sh");
            const stdoutPath = path.join(dir, "stdout.log");
            const stderrPath = path.join(dir, "stderr.log");
            await fs.mkdir(dir, { recursive: true });
            const scriptBody = `#!/usr/bin/env bash
set -euo pipefail

# Gerado pelo MCP CentralDark.
# cwd esperado: ${repoRoot()}

${input.script}
`;
            await fs.writeFile(scriptPath, scriptBody, { mode: 0o700 });
            if (blocked.length > 0) {
                auditLog({ ..._auditBase, status: "BLOQUEADO", reason: "padrao perigoso no script", blockedPatterns: blocked, durationMs: Date.now() - _t0, extra: { logDir: dir } });
                return ok({
                    status: "BLOQUEADO",
                    reason: "Script contém padrão perigoso ou caminho sensível.",
                    blockedPatterns: blocked,
                    logDir: dir,
                    scriptPath,
                });
            }
            const dryRun = input.dryRun ?? true;
            if (dryRun || input.confirm !== CONFIRM_RUN_ONCE) {
                auditLog({ ..._auditBase, status: "DRY_RUN", durationMs: Date.now() - _t0, extra: { logDir: dir } });
                return ok({
                    status: "DRY_RUN",
                    logDir: dir,
                    scriptPath,
                    cwd: repoRoot(),
                    requiredConfirm: CONFIRM_RUN_ONCE,
                    observacao: "Nada foi executado. Revise o script salvo e chame novamente com dryRun=false + confirmação literal.",
                });
            }
            const cmd = `bash ${JSON.stringify(scriptPath)} > ${JSON.stringify(stdoutPath)} 2> ${JSON.stringify(stderrPath)}; code=$?; echo RUN_EXIT=$code; exit $code`;
            const res = await runShell(cmd, {
                cwd: repoRoot(),
                timeoutMs: input.timeoutMs ?? 120_000,
            });
            const status = res.exitCode === 0 ? "EXECUTADO" : "FALHOU";
            auditLog({ ..._auditBase, status, exitCode: res.exitCode, durationMs: Date.now() - _t0, extra: { logDir: dir, scriptPath } });
            return ok({
                status,
                cwd: repoRoot(),
                exitCode: res.exitCode,
                logDir: dir,
                scriptPath,
                stdoutPath,
                stderrPath,
                stdoutTail: await tailFile(stdoutPath),
                stderrTail: await tailFile(stderrPath),
            });
        },
    },
];
//# sourceMappingURL=vps-run-once.js.map
//# sourceMappingURL=vps-run-once.js.map