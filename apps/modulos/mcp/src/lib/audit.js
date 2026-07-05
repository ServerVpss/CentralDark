// Auditoria unificada do MCP CentralDark.
// Toda ação executável (execute_command, vps_run_once_script) grava aqui.
// Formato JSONL por dia em /root/CentralDark/logs/mcp-audit-YYYY-MM-DD.jsonl
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const AUDIT_DIR = process.env.MCP_AUDIT_DIR || "/root/CentralDark/logs";
const HOSTNAME = os.hostname();
const PID = process.pid;

function callerUser() {
    return process.env.MCP_CALLER_USER || process.env.MCP_CALLER || "mcp-local";
}

function callerIp() {
    return process.env.MCP_CALLER_IP || process.env.MCP_REMOTE_IP || "local-stdio";
}

function truncar(s, max = 4000) {
    if (typeof s !== "string") return s;
    return s.length > max ? s.slice(0, max) + "…(truncado)" : s;
}

export function auditLog(evento) {
    try {
        const timestamp = new Date().toISOString();
        const registro = {
            timestamp,
            usuario: callerUser(),
            ip: callerIp(),
            hostname: HOSTNAME,
            pid: PID,
            tool: evento.tool,
            status: evento.status,
            command: truncar(evento.command),
            cwd: evento.cwd,
            root: evento.root,
            exitCode: evento.exitCode ?? null,
            durationMs: evento.durationMs ?? null,
            stdoutBytes: evento.stdoutBytes ?? null,
            stderrBytes: evento.stderrBytes ?? null,
            blockedPatterns: evento.blockedPatterns || null,
            reason: evento.reason || null,
            extra: evento.extra || null,
        };
        fs.mkdirSync(AUDIT_DIR, { recursive: true });
        const dia = timestamp.slice(0, 10);
        const arquivo = path.join(AUDIT_DIR, `mcp-audit-${dia}.jsonl`);
        fs.appendFileSync(arquivo, JSON.stringify(registro) + "\n", { mode: 0o600 });
    }
    catch (e) {
        // Nunca quebrar fluxo por causa de auditoria.
    }
}
