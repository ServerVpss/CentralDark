import { createServerFn } from "@tanstack/react-start";
import { execSync, execFileSync } from "child_process";
import path from "path";
import fs from "fs";

/* ── tipos ── */
interface SyncStatus {
  timestamp: string | null;
  status: "idle" | "syncing" | "success" | "failed" | "conflict";
  human_readable: string;
  target?: string;
}

/* ── caminhos ── */
function centralDarkRoot(): string {
  let dir = process.cwd();
  for (;;) {
    const candidate = path.join(dir, "scripts", "auto-sync", "AUTO-SYNC-MASTER.py");
    if (fs.existsSync(candidate)) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return process.cwd();
    dir = parent;
  }
}
const CENTRALDARK_ROOT = centralDarkRoot();
const SCRIPT_PATH = path.join(CENTRALDARK_ROOT, "scripts", "auto-sync", "AUTO-SYNC-MASTER.py");
const STATUS_FILE = path.join(CENTRALDARK_ROOT, ".auto-sync", "status.json");

function ensureStatusDir() {
  const dir = path.dirname(STATUS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function formatTimestamp(iso: string | null): string {
  if (!iso) return "Nunca sincronizado";
  const dt = new Date(iso);
  const time = dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const date = dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  return `${time} · ${date}`;
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
    if (!["all", "windows", "main", "vps"].includes(target)) {
      return { timestamp: null, status: "failed", human_readable: "Target inválido", target };
    }

    try {
      ensureStatusDir();
      console.log(`[AUTO-SYNC] Executando para target: ${target}`);
      const cmd = `python "${SCRIPT_PATH}" --target ${target}`;
      execSync(cmd, { cwd: process.cwd(), encoding: "utf-8" });
      const raw = JSON.parse(fs.readFileSync(STATUS_FILE, "utf-8"));
      return {
        timestamp: raw.last_sync,
        status: raw.status ?? "success",
        human_readable: formatTimestamp(raw.last_sync),
        target,
      };
    } catch (error) {
      ensureStatusDir();
      const errorStatus = { last_sync: new Date().toISOString(), status: "failed" };
      fs.writeFileSync(STATUS_FILE, JSON.stringify(errorStatus, null, 2));
      return {
        timestamp: errorStatus.last_sync,
        status: "failed",
        human_readable: "Erro ao executar sync",
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
    const git = (...args: string[]) => execFileSync("git", ["-C", CENTRALDARK_ROOT, ...args], { encoding: "utf8", timeout: 5000 }).trim();
    estado.casaSha = git("rev-parse", "HEAD");
    estado.casaAlteracoes = git("status", "--porcelain", "--untracked-files=no").split(/\r?\n/).filter(Boolean).length;
  } catch { /* Git local indisponível; não inferir PASS */ }

  const token = process.env["GITHUB_TOKEN"] || process.env["GH_TOKEN"];
  const headers: Record<string, string> = { Accept: "application/vnd.github+json", "User-Agent": "CentralDark-Cockpit", "X-GitHub-Api-Version": "2022-11-28" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const github = async (path: string): Promise<Record<string, unknown> | null> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6500);
    try {
      const res = await fetch(`https://api.github.com/repos/ServerVpss/CentralDark/${path}`, { headers, cache: "no-store", signal: controller.signal });
      return res.ok ? await res.json() as Record<string, unknown> : null;
    } catch { return null; } finally { clearTimeout(timeout); }
  };
  const pr = await github("pulls/1873");
  const head = pr?.head;
  if (!pr || !head || typeof head !== "object" || typeof (head as { sha?: unknown }).sha !== "string" || typeof pr.draft !== "boolean") {
    estado.fonteGitHub = "PR #1873 sem leitura autenticada no servidor; consulte o link real";
    return estado;
  }
  estado.draft = pr.draft;
  estado.merged = pr.merged === true;
  estado.prSha = (head as { sha: string }).sha;
  estado.fonteGitHub = "GitHub API · PR #1873 · SHA atual";
  const checks = await github(`commits/${encodeURIComponent(estado.prSha)}/check-runs?per_page=100`);
  const runs = checks?.check_runs;
  if (!Array.isArray(runs)) return estado;
  const list = runs as { status?: string; conclusion?: string | null }[];
  estado.checks = list.length;
  if (!list.length) return estado;
  if (list.some(x => ["failure", "cancelled", "timed_out", "action_required"].includes(x.conclusion ?? ""))) estado.ci = "FAIL";
  else if (list.some(x => x.status !== "completed")) estado.ci = "RUNNING";
  else if (list.every(x => ["success", "neutral"].includes(x.conclusion ?? ""))) estado.ci = "PASS";
  return estado;
});