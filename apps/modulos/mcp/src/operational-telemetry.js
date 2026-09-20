import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const DEFAULT_ROOT = process.env.CENTRALDARK_ROOT || "/root/CentralDark";
const FLOW = [
  "HEARTBEAT",
  "LOG_CAPTURE",
  "CLASSIFY_MATERIALITY",
  "RENDEZVOUS_EXISTING_OWNER",
  "ONE_WRITER",
  "T1_REMEASURE",
  "RECEIPT",
  "FIXED_POINT_OR_BLOCKED",
];

function readJsonSafe(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

function exists(file) {
  try { return fs.existsSync(file); } catch { return false; }
}

function latestForensic(root) {
  const diagnostics = path.join(root, "_DIAGNOSTICS");
  const pointer = path.join(diagnostics, "FORENSIC-LATEST.json");
  const latest = readJsonSafe(pointer);
  if (!latest) {
    return {
      status: "UNKNOWN",
      latestReceiptPresent: false,
      pointer: "_DIAGNOSTICS/FORENSIC-LATEST.json",
      secretsContentCollected: false,
    };
  }
  const observedAt = String(latest.observed_at || "");
  const compact = /^\d{8}T\d{6}Z$/.test(observedAt);
  const iso = compact
    ? observedAt.replace(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/, "$1-$2-$3T$4:$5:$6Z")
    : observedAt;
  const ageMs = iso ? Date.now() - Date.parse(iso) : null;
  const stale = Number.isFinite(ageMs) ? ageMs > 15 * 60 * 1000 : true;
  return {
    status: stale ? "STALE" : "OBSERVED",
    latestReceiptPresent: true,
    observedAt: observedAt || null,
    ageMs: Number.isFinite(ageMs) ? Math.max(0, ageMs) : null,
    sha256: latest.sha256 || null,
    reportPresent: typeof latest.report === "string" && exists(latest.report),
    archivePresent: typeof latest.archive === "string" && exists(latest.archive),
    secretsContentCollected: latest.secrets_content_collected === true,
    mode: latest.mode || "READ_ONLY",
  };
}

function statusFileSnapshot(root) {
  const candidates = [
    path.join(root, "apps/modulos/status/mcp-status.json"),
    path.join(root, "logs/heartbeat-api.json"),
  ];
  const found = {};
  for (const file of candidates) {
    const value = readJsonSafe(file);
    found[path.relative(root, file).replaceAll("\\", "/")] = value
      ? { present: true, keys: Object.keys(value).slice(0, 20) }
      : { present: exists(file), keys: [] };
  }
  return found;
}

function secretBoundary(root) {
  const dir = path.join(root, "secrets");
  return {
    metadataOnly: true,
    contentExposed: false,
    directoryPresent: exists(dir),
    githubAuthDetectorPresent: exists(path.join(dir, "detect-github-auth.sh")),
  };
}

export function getOperationalSnapshot({ root = DEFAULT_ROOT, heartbeat = null } = {}) {
  const diagnostics = latestForensic(root);
  const cpus = os.cpus()?.length || 0;
  const load = os.loadavg();
  const fronts = [
    { id: "F1_GIT", source: "git/main/runtime", state: "MEASURE_EXTERNALLY" },
    { id: "F2_MCP", source: "/health + /mcp", state: "OBSERVE" },
    { id: "F3_HEARTBEAT", source: "/heartbeat", state: heartbeat?.self || "UNKNOWN" },
    { id: "F4_LOG_STREAM", source: "/admin/logs/stream", state: "OBSERVE" },
    { id: "F5_HEALTH_DEEP", source: "/health/deep", state: "OBSERVE" },
    { id: "F6_RUNNERS", source: "GitHub Actions runners", state: "MEASURE_EXTERNALLY" },
    { id: "F7_SYSTEMD_PM2", source: "systemd + PM2", state: "MEASURE_EXTERNALLY" },
    { id: "F8_FORENSIC", source: "_DIAGNOSTICS/FORENSIC-LATEST.json", state: diagnostics.status },
    { id: "F9_SECRET_BOUNDARY", source: "secrets metadata only", state: "FAIL_CLOSED" },
    { id: "F10_RECEIPT", source: "receipt + next_cursor", state: diagnostics.latestReceiptPresent ? "PRESENT" : "UNKNOWN" },
  ];

  return {
    schema: "centraldark.operational.snapshot.v1",
    observedAt: new Date().toISOString(),
    deterministicFlow: FLOW,
    rules: {
      unknownIsNotPass: true,
      processAliveIsNotFixedPoint: true,
      sourceIsNotRuntime: true,
      badgeIsTelemetryNotProof: true,
      oneWriterPerScope: true,
      secretsContentExposed: false,
    },
    runtime: {
      pid: process.pid,
      uptimeSec: Math.round(process.uptime()),
      cpuCount: cpus,
      loadavg: load,
      rssMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
    },
    heartbeat: heartbeat || { self: "UNKNOWN" },
    forensic: diagnostics,
    secretBoundary: secretBoundary(root),
    statusFiles: statusFileSnapshot(root),
    fronts,
    verdict: diagnostics.status === "OBSERVED" ? "OBSERVED_NOT_FIXED_POINT" : "UNKNOWN_NOT_PASS",
  };
}
