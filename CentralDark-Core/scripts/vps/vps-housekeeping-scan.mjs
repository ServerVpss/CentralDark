#!/usr/bin/env node
/**
 * VPS Housekeeping — varredura lixo/ouro (REPORT-ONLY, sem destruir).
 * Ref: PERMITO SEGREDO — deploy VPS paralelo, manter útil, zero regressão.
 *
 * Classifica:
 *  - pm2: processos online/stopped/errored + restarts altos (candidato lixo se parado)
 *  - disco: uso e arquivos grandes (>=100MB) em dirs de lixo comum
 *  - stale: backups/.release/.dist-backup/.mapeamento-backup/* antigos (>=7d)
 *  - duplicados: stage dirs órfãos deixados por deploy interrompido
 * NÃO remove nada. Apenas emite JSONL classificado (lixo | ouro | neutro).
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const getArg = (name, def = "") => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};

const REPO_DIR = getArg("repo-dir", "/root/CentralDark");
const REPORT = getArg("report", "/root/CentralDark/logs/housekeeping/scan.jsonl");

function sh(cmd, fallback = "") {
  try {
    return execSync(cmd, { encoding: "utf8", timeout: 15000, stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return fallback;
  }
}

const now = Date.now();
const DAY = 86400000;
const records = [];
function emit(kind, category, detail) {
  records.push({ ts: new Date().toISOString(), kind, category, detail });
}

// 1) PM2
const raw = sh("pm2 jlist");
let pm2 = [];
try { pm2 = JSON.parse(raw || "[]"); } catch { pm2 = []; }
for (const p of pm2) {
  const name = p.name;
  const status = p.pm2_env?.status || "unknown";
  const restarts = p.pm2_env?.restart_time ?? 0;
  const kind = status === "online" ? "ouro" : "lixo";
  emit(kind, "pm2", { name, status, restarts, pid: p.pid });
  if (restarts >= 20 && status !== "online") {
    emit("lixo", "pm2-crashloop", { name, restarts, status });
  }
}

// 2) Disco + arquivos grandes em alvos de lixo
const diskLine = sh("df -P / | tail -1").split(/\s+/).filter(Boolean);
// Linux df -P: [fs, blocks, used, avail, capacity%, mount]
const capField = diskLine[4] || "";
const usedPct = /^\d+%?$/.test(capField) ? parseInt(capField.replace("%", ""), 10) : null;
emit("neutro", "disk", { used_pct: usedPct });

const junkRoots = [
  path.join(REPO_DIR, "logs"),
  path.join(REPO_DIR, "node_modules/.cache"),
  "/tmp",
  "/root/CentralDark-Recovery",
];
for (const root of junkRoots) {
  if (!fs.existsSync(root)) continue;
  let entries = [];
  try { entries = fs.readdirSync(root, { withFileTypes: true }); } catch { continue; }
  for (const e of entries) {
    const full = path.join(root, e.name);
    let st;
    try { st = fs.statSync(full); } catch { continue; }
    const ageDays = (now - st.mtimeMs) / DAY;
    const isStaleBackup = /\.(release|dist-backup|mapeamento-backup|Log-Verificador-backup)\./.test(e.name) && ageDays >= 7;
    const isOrphanStage = /^\.(mapeamento-release|Log-Verificador-release|dist-release)\./.test(e.name);
    if (isStaleBackup) emit("lixo", "stale-backup", { path: full, age_days: +ageDays.toFixed(1) });
    else if (isOrphanStage) emit("lixo", "orphan-stage", { path: full, age_days: +ageDays.toFixed(1) });
    else if (st.isFile() && st.size >= 100 * 1024 * 1024) emit("neutro", "large-file", { path: full, size_mb: +(st.size / 1048576).toFixed(1) });
  }
}

// 3) Worktrees órfãos (deploy interrompido)
const wt = sh(`git -C "${REPO_DIR}" worktree list --porcelain 2>/dev/null`);
const wtLines = wt.split("\n").filter(Boolean);
let currentWt = null;
for (const l of wtLines) {
  if (l.startsWith("worktree ")) currentWt = l.slice(9);
  else if (l.startsWith("detached") || l.startsWith("branch ")) {
    if (currentWt && currentWt.includes("centraldark-") && currentWt.includes("-build") && fs.existsSync(currentWt)) {
      emit("lixo", "orphan-worktree", { path: currentWt });
    }
  }
}

// Escreve JSONL
fs.mkdirSync(path.dirname(REPORT), { recursive: true });
const fd = fs.openSync(REPORT, "a");
for (const r of records) fs.writeSync(fd, JSON.stringify(r) + "\n");
fs.closeSync(fd);

const lixo = records.filter((r) => r.kind === "lixo").length;
const ouro = records.filter((r) => r.kind === "ouro").length;
console.log(JSON.stringify({ wrote: REPORT, lixo, ouro, total: records.length, disk_used_pct: usedPct }));
