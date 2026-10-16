import { createServerFn } from "@tanstack/react-start";
import { execSync } from "child_process";
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
