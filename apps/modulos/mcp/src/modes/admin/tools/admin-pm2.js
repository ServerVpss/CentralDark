import { z } from "zod";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFileSync, existsSync, statSync } from "node:fs";

const pexec = promisify(execFile);

function ok(data) {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

function safeTarget(t) {
  if (!t) throw new Error("target obrigatorio");
  const s = String(t);
  if (!/^[A-Za-z0-9_\-.]{1,64}$/.test(s)) throw new Error("target invalido (use nome ou id numerico do PM2)");
  return s;
}

async function pm2Jlist() {
  const { stdout } = await pexec("pm2", ["jlist"], { timeout: 15000, maxBuffer: 8 * 1024 * 1024 });
  return JSON.parse(stdout);
}

const LIVENESS_PRESETS = {
  vscode: ["code", "code-oss", "codium"],
  cline: ["cline"],
  terminal: ["bash", "zsh", "fish", "pwsh", "powershell", "cmd.exe", "windowsterminal"],
};

function safeNeedle(raw) {
  const s = String(raw);
  if (!/^[A-Za-z0-9_.:-]{1,64}$/.test(s)) throw new Error("match invalido");
  return s.toLowerCase();
}

function parsePsIdentity(stdout) {
  const rows = [];
  for (const line of stdout.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const parts = trimmed.split(/\s+/);
    if (parts.length < 4) continue;
    const [pid, ppid, user, comm] = parts;
    if (!/^\d+$/.test(pid)) continue;
    rows.push({ pid, ppid, user, comm });
  }
  return rows;
}

async function argMatchPids(needles) {
  const { stdout } = await pexec("ps", ["-eo", "pid=,args="], { timeout: 8000, maxBuffer: 4 * 1024 * 1024 });
  const hits = new Set();
  for (const line of stdout.split("\n")) {
    const match = line.trim().match(/^(\d+)\s+(.*)$/);
    if (!match) continue;
    const args = match[2].toLowerCase();
    if (needles.some((needle) => args.includes(needle))) hits.add(match[1]);
  }
  return hits;
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
      if (!proc) return ok({ ok: false, status: "PROC_NAO_ENCONTRADO", target });
      const outPath = proc.pm2_env?.pm_out_log_path;
      const errPath = proc.pm2_env?.pm_err_log_path;
      const tailFile = (fp) => {
        if (!fp || !existsSync(fp)) return "";
        const st = statSync(fp);
        const cap = Math.min(st.size, 512 * 1024);
        const buf = readFileSync(fp);
        const text = buf.slice(buf.length - cap).toString("utf8");
        const arr = text.split(/\r?\n/);
        return arr.slice(-lines).join("\n");
      };
      const result = { ok: true, target, name: proc.name, id: proc.pm_id, lines };
      if (stream === "out" || stream === "ambos") result.stdout = tailFile(outPath);
      if (stream === "err" || stream === "ambos") result.stderr = tailFile(errPath);
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
  {
    name: "admin_process_liveness",
    description: "ADMIN read-only no host do MCP: liveness generalizada por PID. Um preset (vscode, cline, terminal) ou um match cobre VS Code, Cline, varios terminais e qualquer outro processo. Nao imprime args, nao abre porta, nao reinicia. Ausencia medida = NAO_ENCONTRADO. Nao prova Casa, openKylin nem PC :8080.",
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false, title: "Process liveness" },
    inputSchema: z.object({
      preset: z.enum(["vscode", "cline", "terminal"]).optional().describe("Atalho. vscode, cline ou terminal."),
      match: z.string().min(1).max(64).optional().describe("Trecho seguro do nome do processo, ou um pid."),
      limit: z.number().int().positive().max(50).optional().describe("Maximo de linhas. Default 30."),
    }),
    handler: async (input) => {
      const needles = [];
      if (input.preset) needles.push(...LIVENESS_PRESETS[input.preset]);
      if (input.match) needles.push(safeNeedle(input.match));
      if (!needles.length) return ok({ ok: false, status: "MATCH_OBRIGATORIO" });
      const unique = [...new Set(needles)];
      const { stdout } = await pexec("ps", ["-eo", "pid=,ppid=,user=,comm="], { timeout: 8000, maxBuffer: 4 * 1024 * 1024 });
      const identity = parsePsIdentity(stdout);
      const byArgs = await argMatchPids(unique);
      const limit = input.limit ?? 30;
      const procs = [];
      for (const row of identity) {
        const commHit = unique.some((needle) => row.comm.toLowerCase().includes(needle) || row.pid === needle);
        const argsHit = byArgs.has(row.pid);
        if (!commHit && !argsHit) continue;
        procs.push({ ...row, matchedOn: commHit ? "comm" : "args" });
        if (procs.length >= limit) break;
      }
      return ok({
        ok: true,
        status: procs.length ? "ONLINE" : "NAO_ENCONTRADO",
        scope: "MCP_HOST_ONLY",
        doesNotProve: ["CASA", "OPENKYLIN", "PC_LOCAL_8080"],
        preset: input.preset ?? null,
        needles: unique,
        count: procs.length,
        truncated: procs.length >= limit,
        procs,
      });
    },
  },
];
