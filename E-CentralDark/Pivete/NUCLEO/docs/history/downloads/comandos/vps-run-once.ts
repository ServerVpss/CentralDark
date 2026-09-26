import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { config } from "../config.js";
import { runShell, sanitize } from "../vps.js";

const CONFIRM_RUN_ONCE = "CONFIRMO RUN ONCE";
const CONFIRM_SCRIPT_EXECUTE = "CONFIRMO EXECUTAR SCRIPT";
const LOG_BASE = "/root/Multizap/revisoes";
const SCRIPT_ALLOWED_PREFIXES = ["scripts/allowed/", "CentralDark/scripts/allowed/"];
const SCRIPT_ALLOWED_EXTENSIONS = new Set([".sh", ".js", ".mjs", ".cjs"]);

const DENY_SCRIPT_PATTERNS: RegExp[] = [
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
  /\bdocker\s+(restart|rm|rmi|compose\s+down|stop|kill)\b/i,
  /\bcaddy\s+(reload|stop|start|restart|fmt|adapt)\b/i,
  /\bpm2\s+(delete|kill|flush|stop\s+all|restart\s+all)\b/i,
  /(^|\/)(\.env|secrets?|credenciais|tokens?|sessions?|sessao|sessão)(\/|$)/i,
];

function ok(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

function repoRoot() {
  return path.resolve(config.vps.repoPath);
}

type ScriptRoot = "project" | "mcpRepo" | "mcp";

function roots(): Record<ScriptRoot, string> {
  const mcp = path.resolve(process.cwd());
  return {
    project: repoRoot(),
    mcp,
    mcpRepo: path.resolve(mcp, "../../.."),
  };
}

function inside(parent: string, child: string) {
  const rel = path.relative(parent, child);
  return rel === "" || (!!rel && !rel.startsWith("..") && !path.isAbsolute(rel));
}

function safeName(name: string) {
  const clean = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_.-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  if (!clean) throw new Error("Nome inválido.");
  return clean;
}

function findBlocked(script: string) {
  return DENY_SCRIPT_PATTERNS
    .filter((pattern) => pattern.test(script))
    .map((pattern) => String(pattern));
}

function normalizeRelScript(script: string) {
  const rel = script.replace(/\\/g, "/").replace(/^\/+/, "");
  if (!rel || rel.includes("..") || path.isAbsolute(rel)) throw new Error("Script invalido.");
  if (!SCRIPT_ALLOWED_PREFIXES.some((prefix) => rel.startsWith(prefix))) {
    throw new Error("Script fora das pastas permitidas: scripts/allowed/ ou CentralDark/scripts/allowed/.");
  }

  const ext = path.extname(rel).toLowerCase();
  if (!SCRIPT_ALLOWED_EXTENSIONS.has(ext)) {
    throw new Error("Extensao de script nao permitida.");
  }
  return rel;
}

function resolveAllowedScript(rootKey: ScriptRoot | undefined, script: string) {
  const all = roots();
  const rootName = rootKey ?? "project";
  const root = all[rootName];
  if (!root) throw new Error("Root invalido.");

  const rel = normalizeRelScript(script);
  const abs = path.resolve(root, rel);
  if (!inside(root, abs)) throw new Error("Script fora da raiz permitida.");

  return { rootName, root, rel, abs, ext: path.extname(rel).toLowerCase() };
}

async function tailFile(file: string, max = 6000) {
  try {
    const text = await fs.readFile(file, "utf8");
    return sanitize(text.slice(-max));
  } catch {
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
    handler: async (input: { path?: string; staged?: boolean }) => {
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
    description:
      "Cria e executa um script run-once controlado na VPS, com logs em /root/Multizap/revisoes. Por padrão é dry-run. Execução real exige CONFIRMO RUN ONCE. Bloqueia comandos e paths perigosos.",
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false, title: "Run-once seguro" },
    inputSchema: z.object({
      name: z.string().min(1).describe("Nome curto da tarefa"),
      script: z.string().min(1).max(20000).describe("Conteúdo bash do run-once"),
      dryRun: z.boolean().optional().describe("Padrão true"),
      confirm: z.string().optional().describe("Para executar: CONFIRMO RUN ONCE"),
      timeoutMs: z.number().int().min(1000).max(300000).optional(),
    }),
    handler: async (input: { name: string; script: string; dryRun?: boolean; confirm?: string; timeoutMs?: number }) => {
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

      return ok({
        status: res.exitCode === 0 ? "EXECUTADO" : "FALHOU",
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
  {
    name: "script_execute",
    description:
      "Executa script existente em pasta permitida com dry-run padrao, logs em revisoes e confirmacao literal. Permitidos: scripts/allowed/ e CentralDark/scripts/allowed/.",
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false, title: "Executar script controlado" },
    inputSchema: z.object({
      script: z.string().min(1).describe("Caminho relativo dentro de scripts/allowed/ ou CentralDark/scripts/allowed/"),
      args: z.array(z.string().max(500)).max(20).optional(),
      root: z.enum(["project", "mcpRepo", "mcp"]).optional(),
      dryRun: z.boolean().optional().describe("Padrao true"),
      confirm: z.string().optional().describe("Para executar: CONFIRMO EXECUTAR SCRIPT"),
      timeoutMs: z.number().int().min(1000).max(300000).optional(),
    }),
    handler: async (input: {
      script: string;
      args?: string[];
      root?: ScriptRoot;
      dryRun?: boolean;
      confirm?: string;
      timeoutMs?: number;
    }) => {
      const target = resolveAllowedScript(input.root, input.script);
      const st = await fs.stat(target.abs).catch(() => null);
      if (!st) return ok({ status: "NAO_ENCONTRADO", root: target.rootName, script: target.rel });
      if (!st.isFile()) return ok({ status: "BLOQUEADO", reason: "Alvo nao e arquivo.", root: target.rootName, script: target.rel });

      const body = await fs.readFile(target.abs, "utf8");
      const blocked = findBlocked(`${target.rel}\n${body}`);
      if (blocked.length > 0) {
        return ok({
          status: "BLOQUEADO",
          reason: "Script contem padrao perigoso ou caminho sensivel.",
          root: target.rootName,
          script: target.rel,
          blockedPatterns: blocked,
        });
      }

      const dryRun = input.dryRun ?? true;
      if (dryRun || input.confirm !== CONFIRM_SCRIPT_EXECUTE) {
        return ok({
          status: "DRY_RUN",
          root: target.rootName,
          script: target.rel,
          args: input.args ?? [],
          requiredConfirm: CONFIRM_SCRIPT_EXECUTE,
          observacao: "Nada foi executado.",
        });
      }

      const stamp = new Date().toISOString().replace(/[:.]/g, "-");
      const name = safeName(path.basename(target.rel, target.ext));
      const dir = path.join(LOG_BASE, `${stamp}-${name}-script-execute`);
      const stdoutPath = path.join(dir, "stdout.log");
      const stderrPath = path.join(dir, "stderr.log");
      await fs.mkdir(dir, { recursive: true });

      const runner = target.ext === ".sh" ? "bash" : "node";
      const args = (input.args ?? []).map((arg) => JSON.stringify(arg)).join(" ");
      const cmd = `${runner} ${JSON.stringify(target.abs)}${args ? ` ${args}` : ""} > ${JSON.stringify(stdoutPath)} 2> ${JSON.stringify(stderrPath)}; code=$?; echo RUN_EXIT=$code; exit $code`;
      const res = await runShell(cmd, {
        cwd: target.root,
        timeoutMs: input.timeoutMs ?? 120_000,
      });

      return ok({
        status: res.exitCode === 0 ? "EXECUTADO" : "FALHOU",
        root: target.rootName,
        script: target.rel,
        exitCode: res.exitCode,
        logDir: dir,
        stdoutPath,
        stderrPath,
        stdoutTail: await tailFile(stdoutPath),
        stderrTail: await tailFile(stderrPath),
      });
    },
  },
] as const;
