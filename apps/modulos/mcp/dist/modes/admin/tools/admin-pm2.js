import { z } from "zod";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFileSync, existsSync, statSync } from "node:fs";
const pexec = promisify(execFile);
function ok(data) {
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}
function safeTarget(t) {
    if (!t)
        throw new Error("target obrigatorio");
    const s = String(t);
    if (!/^[A-Za-z0-9_\-.]{1,64}$/.test(s))
        throw new Error("target invalido (use nome ou id numerico do PM2)");
    return s;
}
async function pm2Jlist() {
    const { stdout } = await pexec("pm2", ["jlist"], { timeout: 15000, maxBuffer: 8 * 1024 * 1024 });
    return JSON.parse(stdout);
}
export const adminPm2Tools = [
    {
        name: "admin_pm2_list",
        description: "ADMIN: lista todos os processos PM2 (name, id, status, cpu, memoria, restarts, uptime).",
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false, title: "PM2 list" },
        inputSchema: z.object({}),
        handler: async () => {
            const list = await pm2Jlist();
            const procs = list.map((p) => ({
                id: p.pm_id,
                name: p.name,
                status: p.pm2_env?.status,
                restarts: p.pm2_env?.restart_time,
                uptime_ms: p.pm2_env?.pm_uptime ? Date.now() - p.pm2_env.pm_uptime : null,
                cpu: p.monit?.cpu,
                memory_mb: p.monit?.memory ? Math.round(p.monit.memory / 1024 / 1024) : null,
                out_log: p.pm2_env?.pm_out_log_path,
                err_log: p.pm2_env?.pm_err_log_path,
            }));
            return ok({ ok: true, count: procs.length, procs });
        },
    },
    {
        name: "admin_pm2_logs",
        description: "ADMIN: retorna as ultimas N linhas de log (stdout/stderr) de um processo PM2 pelo nome ou id.",
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false, title: "PM2 logs" },
        inputSchema: z.object({
            target: z.string().min(1).describe("Nome ou id numerico do processo PM2"),
            lines: z.number().int().positive().max(2000).optional().describe("Linhas (default 100)"),
            stream: z.enum(["out", "err", "ambos"]).optional().describe("default: ambos"),
        }),
        handler: async (input) => {
            const target = safeTarget(input.target);
            const lines = input.lines ?? 100;
            const stream = input.stream ?? "ambos";
            const list = await pm2Jlist();
            const proc = list.find((p) => String(p.pm_id) === target || p.name === target);
            if (!proc)
                return ok({ ok: false, status: "PROC_NAO_ENCONTRADO", target });
            const outPath = proc.pm2_env?.pm_out_log_path;
            const errPath = proc.pm2_env?.pm_err_log_path;
            const tailFile = (fp) => {
                if (!fp || !existsSync(fp))
                    return "";
                const st = statSync(fp);
                const cap = Math.min(st.size, 512 * 1024);
                const buf = readFileSync(fp);
                const text = buf.slice(buf.length - cap).toString("utf8");
                const arr = text.split(/\r?\n/);
                return arr.slice(-lines).join("\n");
            };
            const result = { ok: true, target, name: proc.name, id: proc.pm_id, lines };
            if (stream === "out" || stream === "ambos")
                result.stdout = tailFile(outPath);
            if (stream === "err" || stream === "ambos")
                result.stderr = tailFile(errPath);
            return ok(result);
        },
    },
    {
        name: "admin_pm2_restart",
        description: "ADMIN DESTRUTIVO: reinicia um processo PM2 pelo nome ou id. Exige confirmAdmin=CONFIRMO ADMIN no dispatcher.",
        annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false, title: "PM2 restart" },
        inputSchema: z.object({
            target: z.string().min(1).describe("Nome ou id do processo PM2"),
        }),
        handler: async (input) => {
            const target = safeTarget(input.target);
            const { stdout, stderr } = await pexec("pm2", ["restart", target, "--update-env"], { timeout: 30000, maxBuffer: 4 * 1024 * 1024 });
            return ok({ ok: true, target, stdout: stdout.slice(-4000), stderr: stderr.slice(-2000) });
        },
    },
];
//# sourceMappingURL=admin-pm2.js.map