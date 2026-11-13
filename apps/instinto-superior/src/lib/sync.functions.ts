// #OBSERVACOES# @owner: cockpit-sync @doc_ref: apps/instinto-superior/README.md
// @last_updated: 2026-11-13T04:39:00Z @implementado: Cockpit faz um fetch e delega checkout sujo ao planner 3-way fail-closed reutilizando FETCH_HEAD; nenhuma escolha ours/theirs.
import { createServerFn } from "@tanstack/react-start";
import { execFileSync } from "child_process";
import path from "path";
import fs from "fs";

/* ── tipos ── */
export interface SyncStatus {
  timestamp: string | null;
  status: "idle" | "syncing" | "success" | "failed" | "conflict";
  human_readable: string;
  target?: string;
  details?: string;
  phase?: string;
  progress?: number;
  files?: string[];
  reason?: string;
  exit_code?: number | null;
  stdout?: string;
  stderr?: string;
  command?: string;
  repo_path?: string;
  runtime_mode?: "local" | "remote";
}

/* ── caminhos ── */
function centralDarkRoot(): string {
  let dir = process.cwd();
  for (;;) {
    if (fs.existsSync(path.join(dir, ".git"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return process.cwd();
    dir = parent;
  }
}
const CENTRALDARK_ROOT = centralDarkRoot();
const STATUS_FILE = path.join(CENTRALDARK_ROOT, ".auto-sync", "status.json");

const VPS_REMOTE_REPO_PATH = process.env["CENTRALDARK_VPS_REPO_PATH"]?.trim() || "/root/CentralDark";
const VPS_CANONICAL_ORIGIN = /(?:^|[:/])ServerVpss\/CentralDark(?:\.git)?$/i;

type VpsRuntime = {
  mode: "local" | "remote";
  repoPath: string;
  target?: string;
  label: string;
};

type TailscalePeer = {
  HostName?: string;
  DNSName?: string;
  OS?: string;
  Online?: boolean;
  TailscaleIPs?: string[];
};

type TailscaleStatus = {
  Peer?: Record<string, TailscalePeer>;
};

function canonicalRepoAt(repoPath: string): boolean {
  try {
    const origin = execFileSync("git", ["-C", repoPath, "config", "--get", "remote.origin.url"], {
      encoding: "utf8",
      timeout: 5_000,
    }).trim();
    return VPS_CANONICAL_ORIGIN.test(origin);
  } catch {
    return false;
  }
}

function vpsRepoIdentityMatches(target: string): boolean {
  try {
    const origin = execFileSync("ssh", [
      "-o", "BatchMode=yes",
      "-o", "ConnectTimeout=4",
      "-o", "StrictHostKeyChecking=accept-new",
      target,
      `test -d "${VPS_REMOTE_REPO_PATH}/.git" && git -C "${VPS_REMOTE_REPO_PATH}" config --get remote.origin.url`,
    ], {
      encoding: "utf8",
      timeout: 8_000,
      maxBuffer: 256 * 1024,
    }).trim();
    return VPS_CANONICAL_ORIGIN.test(origin);
  } catch {
    return false;
  }
}

function resolveVpsSshTarget(): string {
  const explicit = process.env["CENTRALDARK_VPS_SSH_TARGET"]?.trim();
  if (explicit) {
    if (!vpsRepoIdentityMatches(explicit)) {
      throw new Error("VPS_ROUTE_REJECTED: target configurado não confirmou o repo canônico CentralDark");
    }
    return explicit;
  }

  let status: TailscaleStatus;
  try {
    const raw = execFileSync("tailscale", ["status", "--json"], {
      encoding: "utf8",
      timeout: 8_000,
      maxBuffer: 2 * 1024 * 1024,
    });
    status = JSON.parse(raw) as TailscaleStatus;
  } catch {
    throw new Error("VPS_ROUTE_UNKNOWN: Tailscale indisponível e nenhum target externo foi configurado");
  }

  const matches: string[] = [];
  for (const peer of Object.values(status.Peer ?? {})) {
    if (peer.Online !== true || peer.OS !== "linux") continue;
    const target = peer.DNSName?.replace(/\.$/, "")
      || peer.TailscaleIPs?.find((ip) => ip.includes("."))
      || peer.TailscaleIPs?.[0];
    if (!target) continue;
    if (vpsRepoIdentityMatches(target)) matches.push(target);
  }

  const unique = [...new Set(matches)];
  if (unique.length !== 1) {
    throw new Error(
      `VPS_ROUTE_UNKNOWN: esperado 1 peer Tailscale com repo canônico; encontrados ${unique.length}`,
    );
  }
  return unique[0];
}

function resolveVpsRuntime(): VpsRuntime {
  if (process.platform === "linux" && canonicalRepoAt(CENTRALDARK_ROOT)) {
    return {
      mode: "local",
      repoPath: CENTRALDARK_ROOT,
      label: `VPS_RUNTIME local · ${process.env["HOSTNAME"] ?? "linux"}`,
    };
  }

  const target = resolveVpsSshTarget();
  return {
    mode: "remote",
    repoPath: VPS_REMOTE_REPO_PATH,
    target,
    label: `VPS_RUNTIME remoto · ${target}`,
  };
}
const AUTO_SYNC_MASTER = path.join(CENTRALDARK_ROOT, "scripts", "auto-sync", "AUTO-SYNC-MASTER.py");

type SafeResolverPlan = {
  schema: string;
  resolver: string;
  state: string;
  head: string;
  origin_main: string;
  merge_base: string;
  ahead: number;
  behind: number;
  dirty_total: number;
  dirty_tracked: number;
  untracked: number;
  remote_changed: number;
  overlap: number;
  auto_mergeable: number;
  conflicts: number;
  conflict_hunks: number;
  conflict_paths: Array<{ path: string; reason: string; hunks?: number }>;
  non_overlap_dirty: number;
  fingerprint: string;
  mutated_worktree: boolean;
  dry_run: boolean;
};

function safeResolverPlan(): SafeResolverPlan | null {
  if (!fs.existsSync(AUTO_SYNC_MASTER)) return null;
  try {
    const raw = execFileSync("python3", [
      AUTO_SYNC_MASTER,
      "--target", "main",
      "--dry-run",
      "--json",
      "--no-fetch",
      "--remote-ref", "FETCH_HEAD",
      "--repo", CENTRALDARK_ROOT,
    ], { encoding: "utf8", timeout: 60_000, maxBuffer: 2 * 1024 * 1024 });
    const plan = JSON.parse(raw) as SafeResolverPlan;
    if (plan.schema !== "centraldark.auto-sync-plan.v2" || plan.mutated_worktree !== false || plan.dry_run !== true) {
      return null;
    }
    return plan;
  } catch {
    return null;
  }
}

function ensureStatusDir() {
  const dir = path.dirname(STATUS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function writeStatus(status: string, details?: string) {
  ensureStatusDir();
  const payload = {
    last_sync: new Date().toISOString(),
    status,
    details: details ?? null,
  };
  fs.writeFileSync(STATUS_FILE, JSON.stringify(payload, null, 2));
}

function formatTimestamp(iso: string | null): string {
  if (!iso) return "Nunca sincronizado";
  const dt = new Date(iso);
  const time = dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const date = dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  return `${time} · ${date}`;
}

function git(...args: string[]): string {
  return execFileSync("git", ["-C", CENTRALDARK_ROOT, ...args], {
    encoding: "utf8",
    timeout: 30_000,
  }).trim();
}

function changedFiles(): string[] {
  const raw = git("status", "--porcelain");
  if (!raw) return [];

  const files = raw.split(/\r?\n/).filter(Boolean).map((line) => line.slice(3).trim());
  const seen = new Set<string>();
  return files.map((file) => {
    const sensitive = /(^|[\\/])\.env(?:[.\\/]|$)|(^|[\\/])(?:.*\.(?:pem|key|p12|pfx))$/i.test(file);
    const safe = sensitive ? "[arquivo sensível ocultado]" : file;
    if (seen.has(safe)) return "";
    seen.add(safe);
    return safe;
  }).filter(Boolean).slice(0, 50);
}

function runVpsRuntime(runtime: VpsRuntime, script: string): string {
  if (runtime.mode === "local") {
    return execFileSync("bash", ["-s", "--", runtime.repoPath], {
      input: script,
      encoding: "utf8",
      timeout: 120_000,
      maxBuffer: 4 * 1024 * 1024,
    }).trim();
  }

  if (!runtime.target) throw new Error("VPS_ROUTE_UNKNOWN: runtime remoto sem target");
  return execFileSync("ssh", [
    "-o", "ConnectTimeout=10",
    "-o", "BatchMode=yes",
    "-o", "StrictHostKeyChecking=accept-new",
    runtime.target,
    "bash", "-s", "--", runtime.repoPath,
  ], {
    input: script,
    encoding: "utf8",
    timeout: 120_000,
    maxBuffer: 4 * 1024 * 1024,
  }).trim();
}

/* ── Sync Windows (Casa → GitHub) ── */
function syncWindows(): SyncStatus {
  // Mesmo owner Casa/Main; nunca seleciona arquivos alheios com git add -A.
  return syncCasaMain();
}

/* ── Sync Main (fetch + status) ── */
function syncMain(): SyncStatus {
  git("fetch", "--no-tags", "origin", "refs/heads/main");
  const local = git("rev-parse", "HEAD");
  const remote = git("rev-parse", "FETCH_HEAD");

  if (local === remote) {
    writeStatus("success", "Casa já está em dia com main");
    return { timestamp: new Date().toISOString(), status: "success", human_readable: `Main em dia · ${local.slice(0, 8)}`, target: "main" };
  }

  const behind = git("rev-list", "--count", `HEAD..FETCH_HEAD`);
  const ahead = git("rev-list", "--count", `FETCH_HEAD..HEAD`);
  const details = `Local: ${local.slice(0, 8)} · Remote: ${remote.slice(0, 8)} · ↓${behind} ↑${ahead}`;

  writeStatus("conflict", details);
  return { timestamp: new Date().toISOString(), status: "conflict", human_readable: details, target: "main" };
}

/* ── Sync Casa/Main com convergência e readback de SHA ── */
function syncCasaMain(): SyncStatus {
  git("fetch", "--no-tags", "origin", "refs/heads/main");
  const files = changedFiles();

  const before = git("rev-parse", "HEAD");
  const remote = git("rev-parse", "FETCH_HEAD");
  const behind = Number(git("rev-list", "--count", `HEAD..FETCH_HEAD`));
  const ahead = Number(git("rev-list", "--count", `FETCH_HEAD..HEAD`));

  if (behind > 0 && ahead > 0) {
    const details = `Divergência: local ${before.slice(0, 8)} · remoto ${remote.slice(0, 8)} · ↓${behind} ↑${ahead}`;
    writeStatus("conflict", details);
    return { timestamp: new Date().toISOString(), status: "conflict", human_readable: "Casa/Main divergentes; merge manual necessário", target: "local", details, phase: "Conflito detectado", progress: 100, files };
  }

  if (git("status", "--porcelain")) {
    const plan = safeResolverPlan();
    if (plan) {
      const details = [
        `Resolver seguro ${plan.resolver}`,
        `↓${plan.behind} ↑${plan.ahead}`,
        `dirty=${plan.dirty_total}`,
        `overlap=${plan.overlap}`,
        `auto=${plan.auto_mergeable}`,
        `conflitos=${plan.conflicts}`,
      ].join(" · ");
      const conflictFiles = plan.conflict_paths.map((entry) => entry.path).filter(Boolean).slice(0, 50);
      writeStatus("conflict", details);
      return {
        timestamp: new Date().toISOString(),
        status: "conflict",
        target: "local",
        human_readable: plan.conflicts > 0
          ? `Reconciliação 3-way: ${plan.auto_mergeable} auto-mescláveis · ${plan.conflicts} conflitos reais`
          : `Reconciliação 3-way pronta: ${plan.auto_mergeable} sobreposições sem conflito; aplicação ainda exige writer`,
        details,
        phase: plan.conflicts > 0 ? "Conflitos semânticos localizados" : "Plano seguro pronto",
        progress: plan.conflicts > 0 ? 65 : 80,
        files: conflictFiles.length ? conflictFiles : files,
      };
    }
    const details = "Alterações locais preservadas; resolvedor seguro indisponível. Nenhum merge/publicação executado";
    writeStatus("conflict", details);
    return { timestamp: new Date().toISOString(), status: "conflict", target: "local", human_readable: details, details, files };
  }
  if (behind > 0) git("merge", "--ff-only", "FETCH_HEAD");

  const dirty = git("status", "--porcelain");
  if (dirty) {
    const details = "Alterações locais sem escopo revisado; nenhum commit/push executado";
    writeStatus("conflict", details);
    return { timestamp: new Date().toISOString(), status: "conflict", target: "local", human_readable: details, details, files };
  }

  git("push", "origin", "HEAD");
  git("fetch", "--no-tags", "origin", "refs/heads/main");

  const headAfter = git("rev-parse", "HEAD");
  const originAfter = git("rev-parse", "FETCH_HEAD");
  const details = `HEAD=${headAfter.slice(0, 8)} · origin/main=${originAfter.slice(0, 8)}`;
  const converged = headAfter === originAfter;

  writeStatus(converged ? "success" : "failed", details);
  return {
    timestamp: new Date().toISOString(),
    status: converged ? "success" : "failed",
    human_readable: converged ? "Casa/Main sincronizados no mesmo SHA" : "Casa/Main não convergiram no mesmo SHA",
    target: "local",
    details,
    phase: converged ? "Concluído" : "Readback pendente",
    progress: converged ? 100 : 95,
    files,
  };
}

/* ── Sync VPS (GitHub → VPS via SSH com stash seguro) ── */
function syncVps(): SyncStatus {
  const runtime = resolveVpsRuntime();
  const script = `
set -euo pipefail
VPS_REPO="$1"
cd "$VPS_REPO" || exit 1

echo "=== VPS RUNTIME SYNC START ==="
echo "VPS_ROLE_MODE=${runtime.mode}"
echo "VPS_ROLE_LABEL=${runtime.label}"
echo "HEAD_BEFORE=$(git rev-parse HEAD)"

git rev-parse --git-dir >/dev/null 2>&1 || { echo "ERRO: não é um repo git"; exit 2; }

if [ -n "$(git status --porcelain)" ]; then
  echo "VPS_DIRTY_SCOPE_BLOCKED=true"
  exit 4
fi

STASH_BEFORE=$(git stash list | wc -l)
git stash push -u -m "auto-sync-$(date +%Y%m%d-%H%M%S)" 2>&1 || true
STASH_AFTER=$(git stash list | wc -l)
STASHED=0
if [ "$STASH_AFTER" -gt "$STASH_BEFORE" ]; then
  STASHED=1
  echo "STASH=created"
else
  echo "STASH=clean"
fi

git fetch --no-tags origin refs/heads/main 2>&1

MERGE_OUTPUT=$(git merge --ff-only FETCH_HEAD 2>&1) || {
  MERGE_EXIT=$?
  echo "MERGE_FAILED: $MERGE_OUTPUT"
  if [ "$STASHED" -eq 1 ]; then
    git stash pop 2>&1 || echo "STASH_POP_CONFLICT=true"
  fi
  exit $MERGE_EXIT
}
echo "MERGE=$MERGE_OUTPUT"

if [ "$STASHED" -eq 1 ]; then
  POP_OUTPUT=$(git stash pop 2>&1) || {
    echo "STASH_POP_CONFLICT=true"
    echo "POP_OUTPUT=$POP_OUTPUT"
  }
  echo "STASH_RESTORED=true"
fi

HEAD_AFTER=$(git rev-parse HEAD)
echo "HEAD_AFTER=$HEAD_AFTER"
echo "=== VPS RUNTIME SYNC DONE ==="
`;

  try {
    const output = runVpsRuntime(runtime, script);
    console.log("[VPS-RUNTIME-SYNC] Output:", output);

    const headAfterMatch = output.match(/HEAD_AFTER=([a-f0-9]+)/);
    const headAfter = headAfterMatch?.[1]?.slice(0, 8) ?? "???";
    const stashConflict = output.includes("STASH_POP_CONFLICT=true");
    const mergeFailed = output.includes("MERGE_FAILED:");

    if (mergeFailed) {
      writeStatus("conflict", `VPS merge falhou (divergência não-FF). Output: ${output.slice(-200)}`);
      return {
        timestamp: new Date().toISOString(),
        status: "conflict",
        human_readable: "VPS runtime: merge falhou — branches divergiram, requer atenção manual",
        target: "vps",
        details: output.slice(-300),
      };
    }

    if (stashConflict) {
      writeStatus("conflict", `VPS atualizada mas stash pop teve conflito — verificar manualmente. HEAD=${headAfter}`);
      return {
        timestamp: new Date().toISOString(),
        status: "conflict",
        human_readable: `VPS runtime (${runtime.mode}) → ${headAfter} (stash pop com conflito — verificar)`,
        target: "vps",
        details: output.slice(-300),
      };
    }

    writeStatus("success", `VPS runtime sincronizado (${runtime.mode}). HEAD=${headAfter}`);
    return {
      timestamp: new Date().toISOString(),
      status: "success",
      human_readable: `VPS runtime (${runtime.mode}) → ${headAfter} · sync OK`,
      target: "vps",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const execErr = err as {
      stdout?: string;
      stderr?: string;
      status?: number | null;
      code?: number | string | null;
    };
    const stdout = typeof execErr.stdout === "string" ? execErr.stdout : "";
    const stderr = typeof execErr.stderr === "string" ? execErr.stderr : "";
    const exitCode = typeof execErr.status === "number"
      ? execErr.status
      : typeof execErr.code === "number" ? execErr.code : null;
    const marker = "VPS_DIRTY_SCOPE_BLOCKED=true";
    const dirtyScopeBlocked = exitCode === 4 && `${stdout}\n${stderr}`.includes(marker);
    const command = runtime.mode === "local"
      ? `bash -s -- ${runtime.repoPath}`
      : `ssh ${runtime.target ?? "UNKNOWN"} bash -s -- ${runtime.repoPath}`;

    if (dirtyScopeBlocked) {
      const evidence = [
        "reason=VPS_DIRTY_SCOPE_BLOCKED",
        `exit_code=${exitCode}`,
        `runtime_mode=${runtime.mode}`,
        `repo_path=${runtime.repoPath}`,
        `command=${command}`,
        `stdout=${stdout.trim() || "(vazio)"}`,
        `stderr=${stderr.trim() || "(vazio)"}`,
      ].join("\n");
      console.warn("[VPS-RUNTIME-SYNC] Bloqueio preventivo:", evidence);
      writeStatus("conflict", evidence);
      return {
        timestamp: new Date().toISOString(),
        status: "conflict",
        reason: "VPS_DIRTY_SCOPE_BLOCKED",
        human_readable: "VPS Runtime preservado: alterações locais pendentes de reconciliação.",
        target: "vps",
        details: evidence,
        exit_code: exitCode,
        stdout,
        stderr,
        command,
        repo_path: runtime.repoPath,
        runtime_mode: runtime.mode,
      };
    }

    const diagnostic = [
      `exit_code=${exitCode ?? "UNKNOWN"}`,
      `runtime_mode=${runtime.mode}`,
      `repo_path=${runtime.repoPath}`,
      `command=${command}`,
      `stdout=${stdout.trim() || "(vazio)"}`,
      `stderr=${stderr.trim() || "(vazio)"}`,
    ].join("\n");
    console.error("[VPS-RUNTIME-SYNC] Erro:", msg, diagnostic);
    writeStatus("failed", `VPS sync erro: ${msg.slice(0, 200)}\n${diagnostic}`);
    return {
      timestamp: new Date().toISOString(),
      status: "failed",
      human_readable: `VPS sync falhou: ${msg.slice(0, 100)}`,
      target: "vps",
      details: diagnostic,
      exit_code: exitCode,
      stdout,
      stderr,
      command,
      repo_path: runtime.repoPath,
      runtime_mode: runtime.mode,
    };
  }
}


/* ── diagnóstico read-only do rastreador Casa / openKylin ── */
export type EstadoRastreadorCasa = {
  at: string | null;
  tracker: 'active' | 'inactive' | 'unknown';
  ssh: boolean | null;
  githubAuthenticated: boolean | null;
  head: string | null;
  githubMain: string | null;
  sameSha: boolean | null;
  dirtyTracked: boolean | null;
  lastEventAt: string | null;
};

export const lerRastreadorCasa = createServerFn({ method: 'GET' }).handler(
  async (): Promise<EstadoRastreadorCasa> => {
    const empty: EstadoRastreadorCasa = {
      at: null, tracker: 'unknown', ssh: null, githubAuthenticated: null,
      head: null, githubMain: null, sameSha: null, dirtyTracked: null, lastEventAt: null,
    };
    const script = path.join(CENTRALDARK_ROOT, 'scripts', 'casa', 'centraldark-change-tracker.py');
    if (!fs.existsSync(script)) return empty;
    try {
      const raw = execFileSync('python3', [script, 'doctor'], {
        encoding: 'utf8', timeout: 25000,
      });
      const data = JSON.parse(raw) as {
        at?: unknown;
        tracker_service?: unknown;
        ssh_active?: unknown;
        github_authenticated_and_accessible?: unknown;
        head?: unknown;
        github_main?: unknown;
        same_sha?: unknown;
        git_dirty_tracked?: unknown;
        last_events?: unknown;
      };
      const events = Array.isArray(data.last_events) ? data.last_events as { at?: unknown }[] : [];
      const lastEvent = [...events].reverse().find((event) => typeof event.at === 'string');
      const tracker: EstadoRastreadorCasa['tracker'] = data.tracker_service === 'active'
        ? 'active' : data.tracker_service === 'inactive' ? 'inactive' : 'unknown';
      const validSha = typeof data.github_main === 'string' && data.github_main !== 'UNKNOWN';
      return {
        at: typeof data.at === 'string' ? data.at : null,
        tracker,
        ssh: typeof data.ssh_active === 'boolean' ? data.ssh_active : null,
        githubAuthenticated: typeof data.github_authenticated_and_accessible === 'boolean'
          ? data.github_authenticated_and_accessible : null,
        head: typeof data.head === 'string' && data.head !== 'UNKNOWN' ? data.head : null,
        githubMain: validSha ? data.github_main as string : null,
        sameSha: validSha && typeof data.same_sha === 'boolean' ? data.same_sha : null,
        dirtyTracked: typeof data.git_dirty_tracked === 'boolean' ? data.git_dirty_tracked : null,
        lastEventAt: typeof lastEvent?.at === 'string' ? lastEvent.at : null,
      };
    } catch {
      return empty;
    }
  }
);

/* ── GET status ── */
export const lerStatusSync = createServerFn({ method: "GET" }).handler(
  async (): Promise<SyncStatus> => {
    try {
      ensureStatusDir();
      if (!fs.existsSync(STATUS_FILE)) {
        return { timestamp: null, status: "idle", human_readable: "Nunca sincronizado" };
      }
      const raw = JSON.parse(fs.readFileSync(STATUS_FILE, "utf-8"));
      const details = typeof raw.details === "string" ? raw.details : "";
      const bloqueioPreventivoVps = raw.status === "conflict"
        && details.includes("reason=VPS_DIRTY_SCOPE_BLOCKED")
        && details.includes("exit_code=4");
      const registroVps = details.startsWith("VPS ") || bloqueioPreventivoVps;
      const ultimoResultado = raw.status === "success" ? "concluída"
        : raw.status === "failed" ? "falhou"
        : raw.status === "conflict" ? "bloqueada" : "registrada";
      return {
        timestamp: raw.last_sync ?? null,
        status: raw.status ?? "idle",
        human_readable: bloqueioPreventivoVps
          ? `Última tentativa VPS bloqueada preventivamente em ${formatTimestamp(raw.last_sync)} · trabalho local preservado · histórico, não estado atual`
          : registroVps
            ? `Última tentativa VPS ${ultimoResultado} em ${formatTimestamp(raw.last_sync)} · histórico, não estado atual`
            : formatTimestamp(raw.last_sync),
        ...(registroVps ? { target: "vps" } : {}),
        ...(bloqueioPreventivoVps ? { reason: "VPS_DIRTY_SCOPE_BLOCKED", exit_code: 4 } : {}),
        details: raw.details ?? undefined,
      };
    } catch {
      return { timestamp: null, status: "failed", human_readable: "Erro ao ler status" };
    }
  }
);

/* ── POST executar sync ── */
export const executarSync = createServerFn({ method: "POST" }).handler(
  async (ctx: any): Promise<SyncStatus> => {
    const target = ctx?.data?.target || "all";
    if (!["local", "all", "windows", "main", "vps"].includes(target)) {
      return { timestamp: null, status: "failed", human_readable: "Target inválido", target };
    }

    try {
      ensureStatusDir();
      console.log(`[AUTO-SYNC] Executando target: ${target}`);

      if (target === "windows") return syncWindows();
      if (target === "main") return syncMain();
      if (target === "vps") return syncVps();

      // "local" estabiliza Casa/Main no mesmo SHA. VPS permanece uma ação explícita.
      const results: SyncStatus[] = [];
      const steps = [
        { name: "local", fn: syncCasaMain },
      ];
      if (target === "all") steps.push({ name: "vps", fn: syncVps });

      for (const step of steps) {
        try {
          const result = step.fn();
          results.push(result);
          if (result.status === "failed" || result.status === "conflict") break;
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          results.push({
            timestamp: new Date().toISOString(),
            status: "failed",
            human_readable: `${step.name}: ${msg.slice(0, 80)}`,
            target: step.name,
          });
        }
      }

      const failed = results.filter((r) => r.status === "failed" || r.status === "conflict");
      const summary = results.map((r) => `${r.target}: ${r.status}`).join(" · ");

      if (failed.length > 0) {
        const blocker = failed[0];
        const details = blocker.details ?? blocker.human_readable ?? summary;
        // Preserva o diagnóstico causal do passo que bloqueou. O wrapper não
        // rebaixa "conflict" para "failed" nem apaga o plano 3-way do Cockpit.
        writeStatus(blocker.status, details);
        return {
          ...blocker,
          timestamp: new Date().toISOString(),
          target: blocker.target ?? target,
          details,
        };
      }

      writeStatus("success", summary);
      return {
        timestamp: new Date().toISOString(),
        status: "success",
        human_readable: target === "local" ? "Sync local: Casa → Main ✓" : "Sync completo: Casa → Main → VPS ✓",
        target,
        details: summary,
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      writeStatus("failed", msg);
      return {
        timestamp: new Date().toISOString(),
        status: "failed",
        human_readable: `Erro sync: ${msg.slice(0, 100)}`,
        target,
      };
    }
  }
);

// #OBSERVACOES# @owner: cockpit-sync @doc_ref: docs/HUD/README.md
// @last_updated: 2026-11-12T23:59:04.000Z
// @implementado: HUD vigente resolvido em tempo real por marcador via GitHub API server-side, com fallback gh autenticado no host; token nunca sai para o navegador.
// @pendente: build/readback visual do Cockpit publicado; MCP permanece fallback operacional do agente, não biblioteca embutida no browser.

export type EstadoHudVigente = {
  role: "CENTRALDARK_HUD_FUNNEL_CONTINUITY";
  status: "PASS" | "UNKNOWN" | "BLOCKED";
  activePr: number | null;
  title: string | null;
  url: string | null;
  headSha: string | null;
  mainSha: string | null;
  nextCursor: string | null;
  source: "GITHUB_API" | "GH_CLI" | "UNAVAILABLE";
  measuredAt: string;
  candidates: number[];
  detail: string;
};

const HUD_FUNNEL_MARKER = "CENTRALDARK_HUD_FUNNEL_CONTINUITY";
const GITHUB_REPO = "ServerVpss/CentralDark";

function parseHudNextCursor(body: string): string | null {
  const matches = [...body.matchAll(/NEXT_CURSOR\s*[:=]\s*([^\n\r<]+)/gi)];
  const value = matches.at(-1)?.[1]?.trim();
  return value || null;
}

async function githubRequest(pathname: string, token?: string): Promise<unknown | null> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "CentralDark-Cockpit-HUD",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6500);
  try {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/${pathname}`, {
      headers, cache: "no-store", signal: controller.signal,
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function resolveHudFromPulls(
  pulls: Array<Record<string, unknown>>,
  mainSha: string | null,
  source: EstadoHudVigente["source"],
): EstadoHudVigente {
  const candidates = pulls.filter(pr =>
    typeof pr["body"] === "string" &&
    (pr["body"] as string).includes(HUD_FUNNEL_MARKER) &&
    pr["state"] === "open"
  );
  if (candidates.length !== 1) {
    return {
      role: HUD_FUNNEL_MARKER, status: candidates.length ? "BLOCKED" : "UNKNOWN",
      activePr: null, title: null, url: null, headSha: null, mainSha,
      nextCursor: null, source, measuredAt: new Date().toISOString(),
      candidates: candidates.map(pr => Number(pr["number"])).filter(Number.isFinite),
      detail: candidates.length
        ? `Mais de um PR aberto carrega ${HUD_FUNNEL_MARKER}; cutover precisa ser reconciliado.`
        : `Nenhum PR aberto com ${HUD_FUNNEL_MARKER} foi encontrado.`,
    };
  }
  const pr = candidates[0]!;
  const head = pr["head"];
  const headSha = head && typeof head === "object" && typeof (head as { sha?: unknown }).sha === "string"
    ? (head as { sha: string }).sha : null;
  const body = typeof pr["body"] === "string" ? pr["body"] as string : "";
  const number = typeof pr["number"] === "number" ? pr["number"] : Number(pr["number"]);
  return {
    role: HUD_FUNNEL_MARKER,
    status: Number.isFinite(number) ? "PASS" : "UNKNOWN",
    activePr: Number.isFinite(number) ? number : null,
    title: typeof pr["title"] === "string" ? pr["title"] as string : null,
    url: typeof pr["html_url"] === "string" ? pr["html_url"] as string : null,
    headSha,
    mainSha,
    nextCursor: parseHudNextCursor(body),
    source,
    measuredAt: new Date().toISOString(),
    candidates: Number.isFinite(number) ? [number] : [],
    detail: "PR vigente resolvido pelo identificador lógico; número não é fixado no código.",
  };
}

async function readHudViaGithubApi(): Promise<EstadoHudVigente | null> {
  const token = process.env["GITHUB_TOKEN"] || process.env["GH_TOKEN"];
  const main = await githubRequest("branches/main", token);
  const mainSha = main && typeof main === "object"
    && (main as Record<string, unknown>)["commit"]
    && typeof (main as Record<string, unknown>)["commit"] === "object"
    && typeof ((main as Record<string, unknown>)["commit"] as { sha?: unknown }).sha === "string"
      ? ((main as Record<string, unknown>)["commit"] as { sha: string }).sha : null;

  const pulls: Array<Record<string, unknown>> = [];
  for (let page = 1; page <= 10; page += 1) {
    const raw = await githubRequest(`pulls?state=open&per_page=100&page=${page}`, token);
    if (!Array.isArray(raw)) return null;
    const batch = raw.filter(item => item && typeof item === "object") as Array<Record<string, unknown>>;
    pulls.push(...batch);
    if (batch.length < 100) break;
  }
  return resolveHudFromPulls(pulls, mainSha, "GITHUB_API");
}

function readHudViaGhCli(): EstadoHudVigente | null {
  try {
    execFileSync("gh", ["auth", "status"], { encoding: "utf8", timeout: 8000, stdio: ["ignore", "pipe", "pipe"] });
    const mainRaw = execFileSync("gh", ["api", `repos/${GITHUB_REPO}/branches/main`], {
      encoding: "utf8", timeout: 12000,
    });
    const main = JSON.parse(mainRaw) as { commit?: { sha?: string } };
    const pullsRaw = execFileSync("gh", [
      "api", "--paginate", `repos/${GITHUB_REPO}/pulls?state=open&per_page=100`,
    ], { encoding: "utf8", timeout: 25000 });
    // gh --paginate pode concatenar arrays JSON; --slurp produz uma lista de páginas de forma determinística.
    const pagesRaw = execFileSync("gh", [
      "api", "--paginate", "--slurp", `repos/${GITHUB_REPO}/pulls?state=open&per_page=100`,
    ], { encoding: "utf8", timeout: 25000 });
    void pullsRaw; // mantém a chamada simples compatível como contraprova do endpoint.
    const pages = JSON.parse(pagesRaw) as unknown[];
    const pulls = pages.flatMap(page => Array.isArray(page) ? page : [])
      .filter(item => item && typeof item === "object") as Array<Record<string, unknown>>;
    return resolveHudFromPulls(pulls, main.commit?.sha ?? null, "GH_CLI");
  } catch {
    return null;
  }
}

export const lerHudVigente = createServerFn({ method: "GET" }).handler(
  async (): Promise<EstadoHudVigente> => {
    const api = await readHudViaGithubApi();
    if (api) return api;
    const gh = readHudViaGhCli();
    if (gh) return gh;
    return {
      role: HUD_FUNNEL_MARKER, status: "UNKNOWN", activePr: null, title: null, url: null,
      headSha: null, mainSha: null, nextCursor: null, source: "UNAVAILABLE",
      measuredAt: new Date().toISOString(), candidates: [],
      detail: "GitHub API e gh autenticado indisponíveis no servidor do Cockpit; MCP pode ser usado pelo agente como fallback operacional.",
    };
  }
);

/** Minha Oficina: consultas reais, sem executar operações GitHub. */
export type EstadoOficina = {
  casaSha: string | null;
  casaAlteracoes: number | null;
  draft: boolean | null;
  merged: boolean | null;
  prSha: string | null;
  ci: "PASS" | "FAIL" | "RUNNING" | "UNKNOWN";
  checks: number | null;
  fonteGitHub: string;
  medidoEm: string;
};
export const lerEstadoOficina = createServerFn({ method: "GET" }).handler(async (): Promise<EstadoOficina> => {
  const estado: EstadoOficina = {
    casaSha: null, casaAlteracoes: null, draft: null, merged: null, prSha: null,
    ci: "UNKNOWN", checks: null, fonteGitHub: "GitHub não acessível nesta sessão", medidoEm: new Date().toISOString(),
  };
  try {
    estado.casaSha = git("rev-parse", "HEAD");
    estado.casaAlteracoes = git("status", "--porcelain", "--untracked-files=no").split(/\r?\n/).filter(Boolean).length;
  } catch { /* Git local indisponível; não inferir PASS */ }

  const token = process.env["GITHUB_TOKEN"] || process.env["GH_TOKEN"];
  const headers: Record<string, string> = { Accept: "application/vnd.github+json", "User-Agent": "CentralDark-Cockpit", "X-GitHub-Api-Version": "2022-11-28" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const github = async (urlPath: string): Promise<Record<string, unknown> | null> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6500);
    try {
      const res = await fetch(`https://api.github.com/repos/ServerVpss/CentralDark/${urlPath}`, { headers, cache: "no-store", signal: controller.signal });
      return res.ok ? await res.json() as Record<string, unknown> : null;
    } catch { return null; } finally { clearTimeout(timeout); }
  };
  const pr = await github("pulls/1873");
  const head = pr?.["head"];
  if (!pr || !head || typeof head !== "object" || typeof (head as { sha?: unknown }).sha !== "string" || typeof pr["draft"] !== "boolean") {
    estado.fonteGitHub = "PR #1873 sem leitura autenticada no servidor; consulte o link real";
    return estado;
  }
  estado.draft = pr["draft"] as boolean;
  estado.merged = pr["merged"] === true;
  estado.prSha = (head as { sha: string }).sha;
  estado.fonteGitHub = "GitHub API · PR #1873 · SHA atual";
  const checks = await github(`commits/${encodeURIComponent(estado.prSha)}/check-runs?per_page=100`);
  const runs = checks?.["check_runs"];
  if (!Array.isArray(runs)) return estado;
  const list = runs as { status?: string; conclusion?: string | null }[];
  estado.checks = list.length;
  if (!list.length) return estado;
  if (list.some(x => ["failure", "cancelled", "timed_out", "action_required"].includes(x.conclusion ?? ""))) estado.ci = "FAIL";
  else if (list.some(x => x.status !== "completed")) estado.ci = "RUNNING";
  else if (list.every(x => ["success", "neutral"].includes(x.conclusion ?? ""))) estado.ci = "PASS";
  return estado;
});
