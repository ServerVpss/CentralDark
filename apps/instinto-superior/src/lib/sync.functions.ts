// #OBSERVACOES# @owner: cockpit-sync @doc_ref: apps/instinto-superior/README.md
// @last_updated: 2026-11-01T19:58:27.552347+00:00 @implementado: divergencia e drift bloqueiam falso verde/publicacao cega; restante preservado.
import { createServerFn } from "@tanstack/react-start";
import { execSync, execFileSync } from "child_process";
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

const VPS_SSH_HOST = "segredo-vpss";
const VPS_REPO_PATH = "/root/CentralDark";

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

function sshVps(script: string): string {
  const tmpScript = path.join(CENTRALDARK_ROOT, ".auto-sync", "_vps-sync-tmp.sh");
  ensureStatusDir();
  fs.writeFileSync(tmpScript, script, { encoding: "utf-8" });
  try {
    return execSync(
      `ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=accept-new ${VPS_SSH_HOST} "bash -s" < "${tmpScript}"`,
      { encoding: "utf-8", timeout: 120_000 },
    ).trim();
  } finally {
    try { fs.unlinkSync(tmpScript); } catch {}
  }
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
    const details = "Alterações locais sem escopo revisado; preservadas antes de merge/publicação";
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
  const script = `
set -euo pipefail
cd "${VPS_REPO_PATH}" || exit 1

echo "=== VPS SYNC START ==="
echo "HEAD_BEFORE=$(git rev-parse HEAD)"

# Preflight: verificar se é um repo válido
git rev-parse --git-dir >/dev/null 2>&1 || { echo "ERRO: não é um repo git"; exit 2; }

# Preservar drift remoto: bloqueia antes de qualquer stash/merge.
if [ -n "$(git status --porcelain)" ]; then
  echo "VPS_DIRTY_SCOPE_BLOCKED=true"
  exit 4
fi

# Checkout comprovadamente limpo; nenhum arquivo local deve ser movido.
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

# Fetch latest from origin
git fetch --no-tags origin refs/heads/main 2>&1

# Merge fast-forward
MERGE_OUTPUT=$(git merge --ff-only FETCH_HEAD 2>&1) || {
  MERGE_EXIT=$?
  echo "MERGE_FAILED: $MERGE_OUTPUT"
  # Restaurar stash se existia
  if [ "$STASHED" -eq 1 ]; then
    git stash pop 2>&1 || echo "STASH_POP_CONFLICT=true"
  fi
  exit $MERGE_EXIT
}
echo "MERGE=$MERGE_OUTPUT"

# Restaurar alterações locais
if [ "$STASHED" -eq 1 ]; then
  POP_OUTPUT=$(git stash pop 2>&1) || {
    echo "STASH_POP_CONFLICT=true"
    echo "POP_OUTPUT=$POP_OUTPUT"
  }
  echo "STASH_RESTORED=true"
fi

HEAD_AFTER=$(git rev-parse HEAD)
echo "HEAD_AFTER=$HEAD_AFTER"
echo "=== VPS SYNC DONE ==="
`;

  try {
    const output = sshVps(script);
    console.log("[VPS-SYNC] Output:", output);

    const headAfterMatch = output.match(/HEAD_AFTER=([a-f0-9]+)/);
    const headAfter = headAfterMatch?.[1]?.slice(0, 8) ?? "???";
    const stashConflict = output.includes("STASH_POP_CONFLICT=true");
    const mergeFailed = output.includes("MERGE_FAILED:");

    if (mergeFailed) {
      writeStatus("conflict", `VPS merge falhou (divergência não-FF). Output: ${output.slice(-200)}`);
      return {
        timestamp: new Date().toISOString(),
        status: "conflict",
        human_readable: "VPS: merge falhou — branches divergiram, requer atenção manual",
        target: "vps",
        details: output.slice(-300),
      };
    }

    if (stashConflict) {
      writeStatus("conflict", `VPS atualizada mas stash pop teve conflito — verificar manualmente. HEAD=${headAfter}`);
      return {
        timestamp: new Date().toISOString(),
        status: "conflict",
        human_readable: `VPS → ${headAfter} (stash pop com conflito — verificar)`,
        target: "vps",
        details: output.slice(-300),
      };
    }

    writeStatus("success", `VPS sincronizada. HEAD=${headAfter}`);
    return {
      timestamp: new Date().toISOString(),
      status: "success",
      human_readable: `VPS → ${headAfter} · sync OK`,
      target: "vps",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const stdout = (err as { stdout?: string })?.stdout ?? "";
    console.error("[VPS-SYNC] Erro:", msg, stdout);
    writeStatus("failed", `VPS sync erro: ${msg.slice(0, 200)}`);
    return {
      timestamp: new Date().toISOString(),
      status: "failed",
      human_readable: `VPS sync falhou: ${msg.slice(0, 100)}`,
      target: "vps",
      details: stdout.slice(-300),
    };
  }
}

/* ── GET status ── */
export const lerStatusSync = createServerFn({ method: "GET" }).handler(
  async (): Promise<SyncStatus> => {
    try {
      ensureStatusDir();
      if (!fs.existsSync(STATUS_FILE)) {
        return { timestamp: null, status: "idle", human_readable: "Nunca sincronizado" };
      }
      const raw = JSON.parse(fs.readFileSync(STATUS_FILE, "utf-8"));
      return {
        timestamp: raw.last_sync ?? null,
        status: raw.status ?? "idle",
        human_readable: formatTimestamp(raw.last_sync),
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
      const allOk = failed.length === 0;
      const summary = results.map((r) => `${r.target}: ${r.status}`).join(" · ");

      writeStatus(allOk ? "success" : "failed", summary);
      return {
        timestamp: new Date().toISOString(),
        status: allOk ? "success" : "failed",
         human_readable: allOk
           ? (target === "local" ? "Sync local: Casa → Main ✓" : "Sync completo: Casa → Main → VPS ✓")
           : `Sync parcial: ${summary}`,
        target: "all",
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
