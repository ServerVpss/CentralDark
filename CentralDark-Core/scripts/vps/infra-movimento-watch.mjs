#!/usr/bin/env node
/**
 * Detector de movimento da infra (infravermelho):
 * - Gera snapshot
 * - Compara fingerprint anterior
 * - Só manda Telegram se HOUVER mudança relevante
 * - Sem loop de "ainda online?"
 *
 * Uso: node scripts/vps/infra-movimento-watch.mjs
 * Cron sugerido: a cada 3 min (silencioso se nada mudou) — ver docs/RELATORIOS inventario-notifiers
 */
import { execSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = "/root/CentralDark";
const SNAP_SCRIPT = path.join(ROOT, "scripts/vps/infra-vivo-snapshot.mjs");
const LIVE = path.join(ROOT, "apps/modulos/status/infra-vivo.json");
const PREV = path.join(ROOT, "apps/modulos/status/.infra-vivo-prev.json");
const NOTIFY = path.join(ROOT, "scripts/agent-notify.mjs");

function runSnapshot() {
  const r = spawnSync(process.execPath, [SNAP_SCRIPT], { encoding: "utf8", timeout: 30000 });
  if (r.status !== 0) {
    console.error("[movimento] snapshot falhou", r.stderr || r.stdout);
    process.exit(1);
  }
}

function load(p) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

function notify(msg) {
  if (!fs.existsSync(NOTIFY)) {
    console.warn("[movimento] agent-notify ausente — só log:", msg.slice(0, 200));
    return;
  }
  const r = spawnSync(process.execPath, [NOTIFY, msg], { encoding: "utf8", timeout: 20000 });
  console.log("[movimento] notify", r.status === 0 ? "ok" : "fail", (r.stdout || r.stderr || "").slice(0, 120));
}

function diffReasons(prev, cur) {
  const reasons = [];
  if (!prev) {
    reasons.push("baseline_inicial");
    return reasons;
  }
  if (prev.motion_fingerprint === cur.motion_fingerprint) return reasons;

  const prevMap = Object.fromEntries((prev.pm2?.procs || []).map((p) => [p.name, p.status]));
  for (const p of cur.pm2?.procs || []) {
    const was = prevMap[p.name];
    if (was && was !== p.status) reasons.push(`pm2:${p.name} ${was}→${p.status}`);
    if (!was) reasons.push(`pm2:novo ${p.name}=${p.status}`);
  }
  for (const name of Object.keys(prevMap)) {
    if (!(cur.pm2?.procs || []).find((p) => p.name === name)) reasons.push(`pm2:sumiu ${name}`);
  }

  if ((prev.mcp?.ok === true) !== (cur.mcp?.ok === true)) {
    reasons.push(`mcp:${cur.mcp?.ok ? "ok" : "down"}`);
  }
  const d0 = prev.disk?.used_pct;
  const d1 = cur.disk?.used_pct;
  if (d1 != null && d1 >= 85 && (d0 == null || d0 < 85)) reasons.push(`disco_alto:${d1}%`);
  if (d0 != null && d0 >= 85 && d1 != null && d1 < 85) reasons.push(`disco_ok:${d1}%`);

  const b0 = prev.fail2ban?.currently_banned;
  const b1 = cur.fail2ban?.currently_banned;
  if (b0 != null && b1 != null && b1 > b0) reasons.push(`fail2ban_bans:${b0}→${b1}`);

  if (!reasons.length) reasons.push("fingerprint_mudou");
  return reasons;
}

runSnapshot();
const cur = load(LIVE);
if (!cur) {
  console.error("[movimento] sem infra-vivo.json");
  process.exit(1);
}

const prev = load(PREV);
const reasons = diffReasons(prev, cur);

fs.writeFileSync(PREV, JSON.stringify(cur, null, 2) + "\n", "utf8");

if (!reasons.length) {
  console.log("[movimento] silêncio — sem delta", cur.updatedAt);
  process.exit(0);
}

// baseline: grava prev, avisa uma vez sem drama
const isBaseline = reasons.length === 1 && reasons[0] === "baseline_inicial";
const titulo = isBaseline ? "infra vivo online (baseline)" : "movimento na infra";
const lines = [
  `origem=infra-vivo`,
  titulo,
  `pm2 ${cur.pm2.online}/${cur.pm2.total} online`,
  `disco ${cur.disk.used_pct}% · ram ${cur.mem.used_pct}%`,
  `mcp ${cur.mcp.ok ? "ok" : "DOWN"} · f2b bans ${cur.fail2ban.currently_banned}`,
  `delta: ${reasons.slice(0, 8).join("; ")}`,
  `ver: https://status.centralldark.com/infra.html`,
];
const msg = lines.join("\n");
console.log("[movimento]", msg);
if (!isBaseline) notify(msg);
else console.log("[movimento] baseline — sem telegram (evita ruído no 1º run)");
