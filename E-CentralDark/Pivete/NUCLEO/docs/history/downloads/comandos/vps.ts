// Tools MCP de operação na VPS.
// Read-only marcadas como readOnlyHint=true.
// Restart/limpeza real são destrutivos.

import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { config } from "../config.js";
import { allowedServices, canRestart, runShell, sanitize } from "../vps.js";

function text(s: string) {
  return { content: [{ type: "text" as const, text: s }] };
}

function ok(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

const READ_ANNOT = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
};

const WRITE_ANNOT = {
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
  openWorldHint: false,
};

const DESTRUCTIVE_ANNOT = {
  readOnlyHint: false,
  destructiveHint: true,
  idempotentHint: false,
  openWorldHint: false,
};

// Lista branca de comandos "diagnóstico" que não precisam ser PM2/git.
const SAFE_COMMANDS = new Set([
  "pm2 ls",
  "pm2 status",
  "df -h",
  "free -h",
  "uptime",
  "uname -a",
  "node --version",
  "npm --version",
]);

const RUN_COMMAND_CONFIRM_PHRASE = "CONFIRMO EXECUTAR COMANDO";

const RUN_COMMAND_DENY_PATTERNS: RegExp[] = [
  /\brm\s+-rf\s+(\/|\*|~|\.{1,2})(\s|$)/i,
  /\bmkfs(\.| )/i,
  /\bdd\s+if=/i,
  /\b(shutdown|reboot|poweroff|halt)\b/i,
  /\b(passwd|userdel|groupdel)\b/i,
  /\bchmod\s+-R\s+777\s+\//i,
  /\bchown\s+-R\s+\S+\s+\//i,
  /\bdocker\s+(restart|stop|kill|rm|rmi|system\s+prune)\b/i,
  /\bdocker\s+compose\s+(down|restart|rm|kill)\b/i,
  /\bcaddy\s+(reload|restart|stop|start|fmt|adapt)\b/i,
  /\bpm2\s+(delete|kill|flush)\b/i,
  /\bpm2\s+(restart|stop)\s+(all|\*)\b/i,
  /(^|\/)\.env(\.|$|\/)/i,
  /(^|\/)(secrets?|tokens?|sessions?|credenciais?|credentials?|private)(\/|$)/i,
  /(^|\/)\.ssh(\/|$)/i,
  /\.(pem|key|p12|pfx)(\s|$)/i,
];

type RunCommandRoot = "project" | "mcp" | "mcpRepo";

function commandRoot(root: RunCommandRoot = "project") {
  if (root === "mcp") return process.cwd();
  if (root === "mcpRepo") return path.resolve(process.cwd(), "../../..");
  return repoRoot();
}

function blockedCommandPatterns(command: string) {
  return RUN_COMMAND_DENY_PATTERNS.filter((pattern) => pattern.test(command)).map(
    (pattern) => pattern.source,
  );
}

const CLEANABLE_DIR_NAMES = new Set([
  ".cache",
  ".turbo",
  ".vite",
  ".next-cache",
  ".tmp",
  "cache",
  "coverage",
  "tmp",
  "temp",
  "worktrees",
]);

const CLEANUP_CONFIRM_PHRASE = "CONFIRMO LIMPAR";

const CLEANUP_DENY_PATHS = [
  /\/apps\/crm(\/|$)/i,
  /\/credenciais(\/|$)/i,
  /\/secrets?(\/|$)/i,
  /\/sessions?(\/|$)/i,
  /\/sess(?:ao|ão|oes|ões)(\/|$)/i,
  /\/tokens?(\/|$)/i,
];

function normalizeFsPath(p: string): string {
  return path.resolve(p).replace(/\\/g, "/");
}

function repoRoot(): string {
  return normalizeFsPath(config.vps.repoPath);
}

function isInside(parent: string, child: string): boolean {
  const rel = path.relative(parent, child);
  return rel === "" || (!!rel && !rel.startsWith("..") && !path.isAbsolute(rel));
}

function hasDeniedPath(abs: string): boolean {
  const normalized = normalizeFsPath(abs);
  return CLEANUP_DENY_PATHS.some((pattern) => pattern.test(normalized));
}

function cleanupKind(dirName: string): string {
  if (dirName === "worktrees") return "worktrees temporários de agente externo";
  if (["tmp", "temp", ".tmp"].includes(dirName)) return "temporário";
  if ([".cache", "cache", ".turbo", ".vite", ".next-cache"].includes(dirName)) return "cache";
  if (dirName === "coverage") return "relatório temporário de teste";
  return "pasta temporária";
}

async function pathIsDirectory(abs: string): Promise<boolean> {
  try {
    const st = await fs.stat(abs);
    return st.isDirectory();
  } catch {
    return false;
  }
}

async function dirSizeHuman(abs: string): Promise<string> {
  const res = await runShell(`du -sh -- ${JSON.stringify(abs)} 2>/dev/null | awk '{print $1}'`, {
    cwd: repoRoot(),
    timeoutMs: 20_000,
  });
  if (res.exitCode !== 0) return "?";
  return res.stdout.trim().split(/\s+/)[0] || "?";
}

async function collectCleanableDirs(maxDepth: number): Promise<
  Array<{
    path: string;
    name: string;
    size: string;
    kind: string;
    cleanupAllowed: boolean;
  }>
> {
  const root = repoRoot();
  const found: string[] = [];

  async function walk(current: string, depthLeft: number): Promise<void> {
    if (depthLeft < 0 || found.length >= 100) return;
    if (!isInside(root, current) || hasDeniedPath(current)) return;

    let entries: import("node:fs").Dirent[];
    try {
      entries = await fs.readdir(current, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const abs = normalizeFsPath(path.join(current, entry.name));
      if (hasDeniedPath(abs)) continue;

      if (CLEANABLE_DIR_NAMES.has(entry.name)) {
        found.push(abs);
        continue;
      }

      if (entry.name === "node_modules" || entry.name === ".git") continue;
      await walk(abs, depthLeft - 1);
    }
  }

  await walk(root, maxDepth);

  const unique = [...new Set(found)].sort();
  const candidates = [];
  for (const abs of unique) {
    const name = path.basename(abs);
    candidates.push({
      path: abs,
      name,
      size: await dirSizeHuman(abs),
      kind: cleanupKind(name),
      cleanupAllowed: CLEANABLE_DIR_NAMES.has(name) && !hasDeniedPath(abs) && isInside(root, abs),
    });
  }
  return candidates;
}

function validateCleanTarget(rawTarget: string): { ok: true; target: string } | { ok: false; reason: string } {
  const root = repoRoot();
  const target = normalizeFsPath(rawTarget);
  const name = path.basename(target);

  if (target === root) {
    return { ok: false, reason: "Bloqueado: alvo é a raiz do projeto." };
  }

  if (!isInside(root, target)) {
    return { ok: false, reason: "Bloqueado: alvo fora da raiz do projeto configurada no MCP." };
  }

  if (hasDeniedPath(target)) {
    return { ok: false, reason: "Bloqueado: caminho protegido por regra de segurança." };
  }

  if (!CLEANABLE_DIR_NAMES.has(name)) {
    return {
      ok: false,
      reason:
        "Bloqueado: esta tool só limpa pastas temporárias/cache/worktrees listadas por vps_listar_pastas_limpaveis.",
    };
  }

  return { ok: true, target };
}

export const vpsTools = [
  {
    name: "vps_list_allowed_services",
    description: "Lista os serviços PM2 que esta sessão pode reiniciar. Apenas leitura.",
    annotations: { ...READ_ANNOT, title: "Serviços que posso reiniciar" },
    inputSchema: z.object({}),
    handler: async () =>
      ok({ allowed: allowedServices(), note: "Apenas estes serviços podem ser reiniciados." }),
  },
  {
    name: "vps_pm2_ls",
    description: "Lista processos PM2 a partir do dump local da VPS, sem depender do binário pm2 no runtime do MCP. Apenas leitura.",
    annotations: { ...READ_ANNOT, title: "Listar processos PM2" },
    inputSchema: z.object({}),
    handler: async () => {
      const dumpFiles = ["/root/.pm2/dump.pm2", "/root/.pm2/dump.pm2.bak"];
      const processes = [] as Array<{
        name: string;
        status: string;
        script?: string;
        cwd?: string;
        env?: string;
      }>;

      let source: string | null = null;

      for (const dumpFile of dumpFiles) {
        try {
          const raw = await fs.readFile(dumpFile, "utf8");
          const parsed = JSON.parse(raw) as Array<Record<string, unknown>>;

          for (const item of parsed) {
            const env = (item.pm2_env ?? {}) as Record<string, unknown>;
            const name = String(item.name ?? env.name ?? "sem-nome");
            const status = String(env.status ?? "unknown");
            const script = typeof item.pm_exec_path === "string" ? item.pm_exec_path : undefined;
            const cwd = typeof env.pm_cwd === "string" ? env.pm_cwd : undefined;
            const nodeEnv = typeof env.NODE_ENV === "string" ? env.NODE_ENV : undefined;

            processes.push({ name, status, script, cwd, env: nodeEnv });
          }

          source = dumpFile;
          break;
        } catch {
          continue;
        }
      }

      return ok({
        status: processes.length > 0 ? "OK" : "VAZIO",
        source,
        total: processes.length,
        processes,
        note:
          "Leitura feita via dump PM2 local para evitar falha do binário pm2 dentro do runtime MCP.",
      });
    },
  },
  {
    name: "vps_pm2_describe",
    description:
      "Mostra detalhes de um processo PM2 (status, restarts, uptime, memória, CPU). Apenas leitura.",
    annotations: { ...READ_ANNOT, title: "Detalhes de um processo PM2" },
    inputSchema: z.object({
      service: z.string().describe("Nome exato do serviço PM2"),
    }),
    handler: async (input: { service: string }) => {
      const res = await runShell(`pm2 describe ${JSON.stringify(input.service)} --no-color`);
      return text(`exit=${res.exitCode}\n--- stdout ---\n${res.stdout}\n--- stderr ---\n${res.stderr}`);
    },
  },
  {
    name: "vps_read_log",
    description:
      "Lê as últimas N linhas do log de um serviço PM2 (sanitizado). Só serviços da lista branca. Apenas leitura.",
    annotations: { ...READ_ANNOT, title: "Ler log de serviço PM2" },
    inputSchema: z.object({
      service: z.string().describe("Nome exato do serviço PM2"),
      lines: z.number().int().min(1).max(500).optional().describe("Quantas linhas (padrão 120, max 500)"),
    }),
    handler: async (input: { service: string; lines?: number }) => {
      if (!canRestart(input.service)) {
        return text(
          `Serviço "${input.service}" não está na lista branca. Permitidos: ${allowedServices().join(", ") || "(nenhum)"}`
        );
      }
      const n = input.lines ?? 120;
      const res = await runShell(
        `pm2 logs ${JSON.stringify(input.service)} --lines ${n} --nostream --raw`
      );
      return text(`exit=${res.exitCode}\n--- log ---\n${res.stdout}\n--- stderr ---\n${res.stderr}`);
    },
  },
  {
    name: "vps_tail_log_filter",
    description:
      "Lê as últimas linhas do log de um serviço PM2 filtrando por palavra/regex (grep). Sanitizado. Apenas leitura.",
    annotations: { ...READ_ANNOT, title: "Buscar palavra no log" },
    inputSchema: z.object({
      service: z.string().describe("Nome exato do serviço PM2"),
      pattern: z.string().min(1).describe("Texto ou regex pra buscar no log (case-insensitive)"),
      lines: z.number().int().min(50).max(2000).optional().describe("Quantas linhas varrer (padrão 500)"),
    }),
    handler: async (input: { service: string; pattern: string; lines?: number }) => {
      if (!canRestart(input.service)) {
        return text(
          `Serviço "${input.service}" não está na lista branca. Permitidos: ${allowedServices().join(", ") || "(nenhum)"}`
        );
      }
      const n = input.lines ?? 500;
      // Escape do pattern pra shell: passa como argumento via JSON.stringify.
      const cmd = `pm2 logs ${JSON.stringify(input.service)} --lines ${n} --nostream --raw | grep -iE ${JSON.stringify(input.pattern)} | tail -n 100`;
      const res = await runShell(cmd);
      return text(`exit=${res.exitCode}\npattern=${input.pattern}\n--- matches ---\n${res.stdout}\n--- stderr ---\n${res.stderr}`);
    },
  },
  {
    name: "vps_disk_usage",
    description: "Mostra uso de disco da VPS (df -h). Apenas leitura.",
    annotations: { ...READ_ANNOT, title: "Uso de disco" },
    inputSchema: z.object({}),
    handler: async () => {
      const res = await runShell("df -h");
      return text(`exit=${res.exitCode}\n--- df -h ---\n${res.stdout}\n--- stderr ---\n${res.stderr}`);
    },
  },
  {
    name: "vps_memory",
    description:
      "Mostra memória disponível (free -h) e top 5 processos por consumo de RAM. Apenas leitura.",
    annotations: { ...READ_ANNOT, title: "Uso de memória" },
    inputSchema: z.object({}),
    handler: async () => {
      const res = await runShell(
        "free -h && echo '--- top 5 RAM ---' && ps -eo pid,user,%mem,rss,comm --sort=-%mem | head -n 6"
      );
      return text(`exit=${res.exitCode}\n--- saída ---\n${res.stdout}\n--- stderr ---\n${res.stderr}`);
    },
  },
  {
    name: "vps_uptime_load",
    description: "Mostra uptime da VPS e load average (1/5/15min). Apenas leitura.",
    annotations: { ...READ_ANNOT, title: "Uptime e load" },
    inputSchema: z.object({}),
    handler: async () => {
      const res = await runShell("uptime");
      return text(`exit=${res.exitCode}\n--- uptime ---\n${res.stdout}\n--- stderr ---\n${res.stderr}`);
    },
  },
  {
    name: "vps_list_ports",
    description: "Lista as portas em LISTEN na VPS (ss -tlnp, sanitizado). Apenas leitura.",
    annotations: { ...READ_ANNOT, title: "Portas abertas" },
    inputSchema: z.object({}),
    handler: async () => {
      const res = await runShell("ss -tlnp 2>/dev/null || netstat -tlnp 2>/dev/null");
      return text(`exit=${res.exitCode}\n--- ports ---\n${res.stdout}\n--- stderr ---\n${res.stderr}`);
    },
  },
  {
    name: "vps_listar_pastas_limpaveis",
    description:
      "Lista pastas temporárias/cache/worktrees dentro da raiz do projeto que podem ser avaliadas para limpeza. Apenas leitura; não apaga nada.",
    annotations: { ...READ_ANNOT, title: "Listar pastas limpáveis do projeto" },
    inputSchema: z.object({
      maxDepth: z.number().int().min(1).max(8).optional().describe("Profundidade máxima de busca (padrão 5)"),
    }),
    handler: async (input: { maxDepth?: number }) => {
      const maxDepth = input.maxDepth ?? 5;
      const candidates = await collectCleanableDirs(maxDepth);
      return ok({
        status: candidates.length > 0 ? "OK" : "VAZIO",
        repoRoot: repoRoot(),
        maxDepth,
        total: candidates.length,
        candidates,
        observacao:
          "Esta listagem só inclui caches, temporários e worktrees dentro da raiz do projeto. CRM, secrets, sessões, WhatsApp/WuzAPI e backups são bloqueados.",
      });
    },
  },
  {
    name: "vps_limpar_pasta_projeto",
    description:
      "Limpa uma pasta temporária/cache/worktrees retornada por vps_listar_pastas_limpaveis. Por padrão roda em dry-run. Para apagar de verdade exige confirmação literal.",
    annotations: { ...DESTRUCTIVE_ANNOT, title: "Limpar pasta temporária do projeto" },
    inputSchema: z.object({
      path: z.string().min(1).describe("Caminho exato retornado por vps_listar_pastas_limpaveis"),
      dryRun: z.boolean().optional().describe("Padrão true. Use false somente com confirmação explícita."),
      confirm: z
        .string()
        .optional()
        .describe('Para apagar de verdade, precisa ser exatamente "CONFIRMO LIMPAR".'),
    }),
    handler: async (input: { path: string; dryRun?: boolean; confirm?: string }) => {
      const validation = validateCleanTarget(input.path);
      if (!validation.ok) {
        return ok({
          status: "BLOQUEADO",
          path: input.path,
          reason: validation.reason,
        });
      }

      const target = validation.target;
      const exists = await pathIsDirectory(target);
      if (!exists) {
        return ok({ status: "NAO_ENCONTRADA", path: target });
      }

      const sizeBefore = await dirSizeHuman(target);
      const dryRun = input.dryRun ?? true;

      if (dryRun || input.confirm !== CLEANUP_CONFIRM_PHRASE) {
        return ok({
          status: "DRY_RUN",
          path: target,
          sizeBefore,
          wouldRemove: true,
          cleanupAllowed: true,
          requiredConfirm: CLEANUP_CONFIRM_PHRASE,
          observacao:
            "Nada foi apagado. Para limpeza real, chame de novo com dryRun=false e confirmação explícita do usuário.",
        });
      }

      await fs.rm(target, { recursive: true, force: true });
      const existsAfter = await pathIsDirectory(target);
      return ok({
        status: existsAfter ? "ALERTA" : "REMOVIDA",
        path: target,
        sizeBefore,
        existsAfter,
        observacao:
          "Limpeza executada somente porque a confirmação literal foi informada. Caminhos protegidos continuam bloqueados.",
      });
    },
  },
  {
    name: "vps_git_pull",
    description:
      "Roda git pull no repositório principal (VPS_REPO_PATH). Modifica arquivos do repo mas não é destrutivo.",
    annotations: { ...WRITE_ANNOT, title: "git pull no repo da VPS" },
    inputSchema: z.object({
      branch: z.string().optional().describe("Branch específica (padrão: main)"),
    }),
    handler: async (input: { branch?: string }) => {
      const branch = input.branch ?? "main";
      const res = await runShell(`git pull origin ${JSON.stringify(branch)}`, {
        cwd: config.vps.repoPath,
        timeoutMs: 60_000,
      });
      return text(
        `cwd=${config.vps.repoPath}\nexit=${res.exitCode}\n--- stdout ---\n${res.stdout}\n--- stderr ---\n${res.stderr}`
      );
    },
  },
  {
    name: "vps_restart_service",
    description:
      "Reinicia um serviço PM2. Só funciona pra serviços da lista branca (PM2_ALLOWED_RESTART). DESTRUTIVO — derruba e sobe o processo.",
    annotations: { ...DESTRUCTIVE_ANNOT, title: "Reiniciar serviço PM2" },
    inputSchema: z.object({
      service: z.string().describe("Nome exato do serviço PM2"),
      updateEnv: z.boolean().optional().describe("Se true, passa --update-env"),
    }),
    handler: async (input: { service: string; updateEnv?: boolean }) => {
      if (!canRestart(input.service)) {
        return text(
          `Bloqueado. "${input.service}" não está na lista branca. Permitidos: ${allowedServices().join(", ") || "(nenhum)"}`
        );
      }
      const flag = input.updateEnv ? " --update-env" : "";
      const res = await runShell(`pm2 restart ${JSON.stringify(input.service)}${flag}`);
      return text(`exit=${res.exitCode}\n--- stdout ---\n${res.stdout}\n--- stderr ---\n${res.stderr}`);
    },
  },
  {
    name: "vps_run_command",
    description:
      "Executa comando na VPS com confirmacao literal, dry-run padrao e bloqueio de comandos/caminhos sensiveis. Para comandos read-only conhecidos, prefira vps_run_safe_command.",
    annotations: { ...DESTRUCTIVE_ANNOT, title: "Executar comando VPS" },
    inputSchema: z.object({
      command: z.string().min(1).max(2000),
      root: z.enum(["project", "mcp", "mcpRepo"]).optional(),
      timeoutMs: z.number().int().min(1000).max(300000).optional(),
      dryRun: z.boolean().optional(),
      confirm: z.string().optional(),
    }),
    handler: async (input: {
      command: string;
      root?: RunCommandRoot;
      timeoutMs?: number;
      dryRun?: boolean;
      confirm?: string;
    }) => {
      const command = input.command.trim();
      const blocked = blockedCommandPatterns(command);
      if (blocked.length) {
        return ok({
          ok: false,
          status: "BLOQUEADO",
          reason: "Comando bloqueado por politica de seguranca.",
          blockedPatterns: blocked,
        });
      }

      if (input.dryRun !== false || input.confirm !== RUN_COMMAND_CONFIRM_PHRASE) {
        return ok({
          ok: true,
          status: "DRY_RUN",
          commandPreview: command,
          root: input.root || "project",
          requiredConfirm: RUN_COMMAND_CONFIRM_PHRASE,
          note: "Nada foi executado. Envie dryRun=false e confirmacao literal para executar.",
        });
      }

      const res = await runShell(command, {
        cwd: commandRoot(input.root),
        timeoutMs: input.timeoutMs || 60_000,
      });
      return ok({
        ok: res.exitCode === 0,
        status: res.exitCode === 0 ? "OK" : "ERRO",
        exitCode: res.exitCode,
        root: input.root || "project",
        stdout: sanitize(res.stdout),
        stderr: sanitize(res.stderr),
      });
    },
  },
  {
    name: "vps_run_safe_command",
    description:
      "Roda um comando de diagnóstico da lista branca. Comandos aceitos: " +
      [...SAFE_COMMANDS].join(", "),
    annotations: { ...READ_ANNOT, title: "Comando seguro" },
    inputSchema: z.object({
      command: z.string().describe("Comando exato (deve bater com a lista branca)"),
    }),
    handler: async (input: { command: string }) => {
      const cmd = input.command.trim();
      if (!SAFE_COMMANDS.has(cmd)) {
        return text(`Bloqueado. "${cmd}" não está na lista branca de comandos seguros.`);
      }
      const res = await runShell(cmd);
      return text(
        `cmd=${cmd}\nexit=${res.exitCode}\n--- stdout ---\n${res.stdout}\n--- stderr ---\n${sanitize(res.stderr)}`
      );
    },
  },
] as const;
