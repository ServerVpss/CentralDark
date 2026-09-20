#!/usr/bin/env node
/**
 * Infra vivo — snapshot só leitura do estado da VPS (sem secrets).
 * Escreve: apps/modulos/status/infra-vivo.json
 * Uso: node scripts/vps/infra-vivo-snapshot.mjs
 * Missão: PERMITO Pivete 2026-07-14 visão simples
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = "/root/CentralDark";
const OUT = path.join(ROOT, "apps/modulos/status/infra-vivo.json");

function sh(cmd, fallback = "") {
  try {
    return execSync(cmd, { encoding: "utf8", timeout: 15000, stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return fallback;
  }
}

function readJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

function pm2List() {
  const raw = sh("pm2 jlist");
  if (!raw) return { online: 0, stopped: 0, errored: 0, total: 0, procs: [] };
  let arr;
  try {
    arr = JSON.parse(raw);
  } catch {
    return { online: 0, stopped: 0, errored: 0, total: 0, procs: [] };
  }
  const procs = arr.map((p) => ({
    name: p.name,
    status: p.pm2_env?.status || "unknown",
    restarts: p.pm2_env?.restart_time ?? 0,
    mem_mb: Math.round((p.monit?.memory || 0) / 1024 / 1024),
    cpu: p.monit?.cpu ?? 0,
  }));
  const online = procs.filter((p) => p.status === "online").length;
  const stopped = procs.filter((p) => p.status === "stopped").length;
  const errored = procs.filter((p) => p.status === "errored" || p.status === "stopping").length;
  return { online, stopped, errored, total: procs.length, procs };
}

function disk() {
  // df -P / → filesystem 1024-blocks used available capacity mounted
  const line = sh("df -P / | tail -1");
  const parts = line.split(/\s+/);
  if (parts.length < 5) return { used_pct: null, avail: null, raw: line };
  return {
    used_pct: parseInt(String(parts[4]).replace("%", ""), 10),
    avail: parts[3],
    size: parts[1],
    used: parts[2],
    mount: parts[5] || "/",
  };
}

function mem() {
  const t = sh("free -b | awk '/^Mem:/{print $2,$3,$7}'");
  const [total, used, available] = t.split(/\s+/).map(Number);
  if (!total) return { total_gb: null, used_gb: null, avail_gb: null, used_pct: null };
  return {
    total_gb: +(total / 1e9).toFixed(1),
    used_gb: +(used / 1e9).toFixed(1),
    avail_gb: +(available / 1e9).toFixed(1),
    used_pct: +((used / total) * 100).toFixed(1),
  };
}

function loadavg() {
  const l = sh("cat /proc/loadavg");
  const [a, b, c] = l.split(/\s+/);
  return { "1m": a, "5m": b, "15m": c };
}

function uptimeSec() {
  const u = sh("cat /proc/uptime");
  return Math.floor(parseFloat(u.split(/\s+/)[0]) || 0);
}

function fail2ban() {
  const status = sh("fail2ban-client status sshd 2>/dev/null");
  const banned = (status.match(/Currently banned:\s*(\d+)/) || [])[1];
  const totalBanned = (status.match(/Total banned:\s*(\d+)/) || [])[1];
  const list = (status.match(/Banned IP list:\s*(.*)/) || [])[1] || "";
  return {
    jail: "sshd",
    currently_banned: banned != null ? +banned : null,
    total_banned: totalBanned != null ? +totalBanned : null,
    banned_sample: list.trim().split(/\s+/).filter(Boolean).slice(0, 8),
  };
}

function mcpHealth() {
  const raw = sh("curl -sS --max-time 3 http://127.0.0.1:9100/health");
  if (!raw) return { ok: false, error: "unreachable" };
  try {
    const j = JSON.parse(raw);
    return {
      ok: true,
      service: j.service,
      version: j.version,
      toolCount: j.toolCount,
    };
  } catch {
    return { ok: false, error: "bad_json", raw: raw.slice(0, 80) };
  }
}

function fingerprint(snap) {
  // assinatura de "movimento" — sem números que mudam sempre (mem flutuante ok em %)
  const pm2Sig = (snap.pm2.procs || [])
    .map((p) => `${p.name}:${p.status}`)
    .sort()
    .join("|");
  return JSON.stringify({
    pm2: pm2Sig,
    disk: snap.disk.used_pct,
    mcp: snap.mcp.ok,
    f2b: snap.fail2ban.currently_banned,
    stopped: snap.pm2.stopped,
    errored: snap.pm2.errored,
  });
}

const now = new Date();
const snap = {
  ok: true,
  purpose: "infra-vivo-simples",
  updatedAt: now.toISOString(),
  updatedAtBR: now.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }),
  host: sh("hostname"),
  uptime_sec: uptimeSec(),
  load: loadavg(),
  mem: mem(),
  disk: disk(),
  pm2: pm2List(),
  fail2ban: fail2ban(),
  mcp: mcpHealth(),
  notes: [
    "Sem secrets neste JSON.",
    "Telegram: só via infra-movimento-watch (delta), não heartbeat.",
    "UI: /infra.html em status.centralldark.com",
  ],
};

snap.motion_fingerprint = fingerprint(snap);

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(snap, null, 2) + "\n", "utf8");
console.log(JSON.stringify({ wrote: OUT, fingerprint: snap.motion_fingerprint, pm2: `${snap.pm2.online}/${snap.pm2.total}`, disk: snap.disk.used_pct, mcp: snap.mcp.ok }, null, 0));
