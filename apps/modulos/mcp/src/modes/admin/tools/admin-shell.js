// admin-shell.js — versao endurecida
// - Allowlist estrita (sem shell, sem pipes, sem redirects)
// - Timeout rigido (limite 60s, padrao 30s), com SIGKILL apos estouro
// - Limites de recursos via prlimit: memoria (AS), CPU-time, numero de processos, tamanho de arquivo
// - Comandos read-only (ls, cat, df, free) executam como usuario nao-root "mcp-admin"
// - Comandos privilegiados (pm2, git no repo root, systemctl) continuam como root pois exigem
// - Log estruturado JSONL em logs/admin-shell.jsonl (quem, o que, quando, saida, duracao, exit)

import { z } from "zod";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { appendFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const pexec = promisify(execFile);

const __dirname = dirname(fileURLToPath(import.meta.url));
// dist/modes/admin/tools -> mcp root
const MCP_ROOT = resolve(__dirname, "..", "..", "..", "..");
const LOG_PATH = resolve(MCP_ROOT, "logs", "admin-shell.jsonl");

// Limites rigidos (aplicados via prlimit)
const LIMITS = {
  AS_BYTES: 512 * 1024 * 1024, // 512 MB de memoria virtual
  CPU_SECONDS: 60,             // 60s de CPU
  NPROC: 128,                  // no maximo 128 processos
  FSIZE_BYTES: 32 * 1024 * 1024, // arquivos criados no maximo 32 MB
};

const TIMEOUT_MAX_MS = 60_000;
const TIMEOUT_DEFAULT_MS = 30_000;

// Allowlist: cada entrada define subcomandos permitidos e se roda como nao-root.
// runAs: "mcp-admin" para read-only; "root" para privilegiados.
const ALLOWLIST = {
  pm2:       { sub: ["list","jlist","status","describe","logs","restart","reload","stop","start","save","flush","info","prettylist"], runAs: "root" },
  git:       { sub: ["status","pull","log","diff","branch","remote","fetch","rev-parse","show"], runAs: "root" },
  systemctl: { sub: ["reload"], runAs: "root", extra: (argv) => argv[0] === "reload" && argv[1] === "caddy" && argv.length === 2 },
  ls:        { sub: ["*"], runAs: "mcp-admin" },
  cat:       { sub: ["*"], runAs: "mcp-admin" },
  df:        { sub: ["*"], runAs: "mcp-admin" },
  free:      { sub: ["*"], runAs: "mcp-admin" },
};

const FORBIDDEN_CHARS = /[;&|`$><\n\r\\]/;

function ok(data) {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

function validate(command, args) {
  if (!command || typeof command !== "string") throw new Error("command obrigatorio");
  if (FORBIDDEN_CHARS.test(command)) throw new Error("caractere proibido no command");
  const rule = ALLOWLIST[command];
  if (!rule) throw new Error(`comando bloqueado: ${command} (fora da allowlist)`);
  const argv = Array.isArray(args) ? args.map((a) => String(a)) : [];
  for (const a of argv) {
    if (FORBIDDEN_CHARS.test(a)) throw new Error(`argumento proibido: ${a}`);
  }
  if (rule.sub[0] !== "*") {
    const sub = argv[0];
    if (!sub || !rule.sub.includes(sub)) throw new Error(`subcomando bloqueado: ${command} ${sub ?? ""}`);
  }
  if (rule.extra && !rule.extra(argv)) {
    throw new Error(`argumentos fora da politica para ${command}`);
  }
  return { command, argv, runAs: rule.runAs };
}

// Constroi a chamada final: prlimit ... [-- runuser -u mcp-admin --] cmd argv
function buildWrapped(command, argv, runAs) {
  const prlimitArgs = [
    `--as=${LIMITS.AS_BYTES}`,
    `--cpu=${LIMITS.CPU_SECONDS}`,
    `--nproc=${LIMITS.NPROC}`,
    `--fsize=${LIMITS.FSIZE_BYTES}`,
    "--",
  ];
  if (runAs === "mcp-admin" && process.getuid && process.getuid() === 0) {
    // runuser -u mcp-admin -- <cmd> <argv...>
    return {
      bin: "/usr/bin/prlimit",
      args: [...prlimitArgs, "/usr/sbin/runuser", "-u", "mcp-admin", "--", command, ...argv],
      effectiveUser: "mcp-admin",
    };
  }
  return {
    bin: "/usr/bin/prlimit",
    args: [...prlimitArgs, command, ...argv],
    effectiveUser: runAs,
  };
}

async function auditLog(entry) {
  try {
    await mkdir(dirname(LOG_PATH), { recursive: true });
    await appendFile(LOG_PATH, JSON.stringify(entry) + "\n", { encoding: "utf8" });
  } catch {
    // log e best-effort; nao derruba a execucao
  }
}

export const adminShellTools = [
  {
    name: "admin_shell_exec",
    description: "ADMIN DESTRUTIVO endurecido: allowlist estrita (pm2, git, ls, cat, df, free, systemctl reload caddy). Sem shell/pipes/redirects. Timeout maximo 60s. Limites: 512MB RAM, 60s CPU, 128 procs, 32MB por arquivo. ls/cat/df/free rodam como usuario mcp-admin (nao-root). Log JSONL em logs/admin-shell.jsonl.",
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false, title: "Shell exec (endurecido)" },
    inputSchema: z.object({
      command: z.string().min(1).describe("Binario permitido (pm2, git, ls, cat, df, free, systemctl)"),
      args: z.array(z.string()).optional().describe("Argumentos (subcomando primeiro). Sem metacaracteres de shell."),
      cwd: z.string().optional().describe("Diretorio de trabalho absoluto (opcional)"),
      timeoutMs: z.number().int().positive().max(TIMEOUT_MAX_MS).optional().describe(`Timeout em ms (max ${TIMEOUT_MAX_MS})`),
    }),
    handler: async (input) => {
      const startedAt = new Date();
      const t0 = Date.now();
      let validated;
      try {
        validated = validate(input.command, input.args);
      } catch (e) {
        const entry = { ts: startedAt.toISOString(), phase: "reject", command: input.command, args: input.args ?? [], error: String(e?.message || e) };
        await auditLog(entry);
        return ok({ ok: false, ...entry });
      }
      const { command, argv, runAs } = validated;
      const cwd = input.cwd && input.cwd.startsWith("/") ? input.cwd : undefined;
      const timeout = Math.min(input.timeoutMs ?? TIMEOUT_DEFAULT_MS, TIMEOUT_MAX_MS);
      const wrapped = buildWrapped(command, argv, runAs);

      let result;
      try {
        const { stdout, stderr } = await pexec(wrapped.bin, wrapped.args, {
          timeout,
          killSignal: "SIGKILL",
          maxBuffer: 4 * 1024 * 1024,
          cwd,
        });
        result = { ok: true, stdout: stdout.slice(-8000), stderr: stderr.slice(-2000), exitCode: 0, killed: false };
      } catch (e) {
        result = {
          ok: false,
          stdout: (e?.stdout || "").slice(-4000),
          stderr: (e?.stderr || "").slice(-2000),
          exitCode: e?.code ?? null,
          signal: e?.signal ?? null,
          killed: !!e?.killed,
          error: String(e?.message || e),
        };
      }
      const durationMs = Date.now() - t0;
      const entry = {
        ts: startedAt.toISOString(),
        phase: "exec",
        command,
        args: argv,
        cwd: cwd ?? null,
        runAs: wrapped.effectiveUser,
        timeoutMs: timeout,
        limits: LIMITS,
        durationMs,
        ok: result.ok,
        exitCode: result.exitCode,
        signal: result.signal ?? null,
        killed: result.killed,
        stdoutBytes: result.stdout.length,
        stderrBytes: result.stderr.length,
        error: result.error ?? null,
      };
      await auditLog(entry);
      return ok({ ...entry, stdout: result.stdout, stderr: result.stderr });
    },
  },
];
