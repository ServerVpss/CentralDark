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

function readTextSafe(file) {
  try { return fs.readFileSync(file, "utf8"); } catch { return ""; }
}

export const CENTRALDARK_PATTERN_RED_OUTSIDE_PCT = 80;

function externalPatternDimensions(root) {
  const file = path.join(root, "apps/modulos/status/centraldark-pattern-observation.json");
  const payload = readJsonSafe(file);
  const rows = Array.isArray(payload?.dimensions) ? payload.dimensions.slice(0, 100) : [];
  return rows.map((row, index) => {
    const rawState = String(row?.state || "UNKNOWN").toUpperCase();
    const state = rawState === "PASS" || rawState === "FAIL" ? rawState : "UNKNOWN";
    return {
      id: String(row?.id || `EXTERNAL_${index + 1}`).slice(0, 120),
      label: String(row?.label || row?.id || `observação externa ${index + 1}`).slice(0, 180),
      state,
      source: String(row?.source || "apps/modulos/status/centraldark-pattern-observation.json").slice(0, 220),
      scoreEligible: row?.scoreEligible !== false,
    };
  });
}

function patternAlignmentSnapshot({ root, diagnostics, boundary, rules }) {
  const agents = readTextSafe(path.join(root, "AGENTS.md"));
  const contract = readTextSafe(path.join(root, "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/CONTRACT.yml"));
  const soulPath = path.join(root, "docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md");

  const dimensions = [
    {
      id: "UNKNOWN_IS_NOT_PASS",
      label: "UNKNOWN não vira PASS",
      state: rules.unknownIsNotPass === true ? "PASS" : "FAIL",
      source: "operational-telemetry.rules",
      scoreEligible: false,
    },
    {
      id: "ONE_WRITER_PER_SCOPE",
      label: "um writer por escopo",
      state: rules.oneWriterPerScope === true ? "PASS" : "FAIL",
      source: "operational-telemetry.rules",
      scoreEligible: false,
    },
    {
      id: "REUSE_BEFORE_CREATE",
      label: "reusar antes de criar",
      state: rules.reuseBeforeCreate === true ? "PASS" : "FAIL",
      source: "operational-telemetry.rules",
      scoreEligible: false,
    },
    {
      id: "SECRET_BOUNDARY",
      label: "segredo não exposto",
      state: boundary.contentExposed === false && diagnostics.secretsContentCollected !== true ? "PASS" : "FAIL",
      source: "secret-boundary+forensic",
      scoreEligible: true,
    },
    {
      id: "SOUL_CANONICA",
      label: "SOUL canônica presente",
      state: exists(soulPath) ? "PASS" : "FAIL",
      source: "docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md",
      scoreEligible: true,
    },
    {
      id: "FAST_PATH_CONTINUA",
      label: "não parar com PR elegível aberto",
      state: agents.includes("RETURN_WITH_OPEN_ELIGIBLE_PR=FORBIDDEN") ? "PASS" : "FAIL",
      source: "AGENTS.md",
      scoreEligible: true,
    },
    {
      id: "REMEASURE_PR_LIVE",
      label: "re-medida viva antes do retorno",
      state: contract.includes("remeasure_live_mergeability_before_human_return: true") ? "PASS" : "FAIL",
      source: "CENTRALDARK-TRIGGER-FABRIC/CONTRACT.yml",
      scoreEligible: true,
    },
    {
      id: "AUXILIARY_YELLOW_NOT_BLOCKER",
      label: "amarelo auxiliar não vira bloqueio material",
      state: contract.includes("queued_or_in_progress_auxiliary_is_material_blocker: false") ? "PASS" : "FAIL",
      source: "CENTRALDARK-TRIGGER-FABRIC/CONTRACT.yml",
      scoreEligible: true,
    },
    {
      id: "FORENSIC_FRESHNESS",
      label: "prova forense recente",
      state: diagnostics.status === "OBSERVED" ? "PASS" : (diagnostics.status === "STALE" ? "FAIL" : "UNKNOWN"),
      source: "_DIAGNOSTICS/FORENSIC-LATEST.json",
      scoreEligible: true,
    },
    {
      id: "RECEIPT_PRESENT",
      label: "receipt observável",
      state: diagnostics.latestReceiptPresent ? "PASS" : "UNKNOWN",
      source: "_DIAGNOSTICS/FORENSIC-LATEST.json",
      scoreEligible: true,
    },
    ...externalPatternDimensions(root),
  ];

  const scored = dimensions.filter((item) => item.scoreEligible !== false);
  const passCount = scored.filter((item) => item.state === "PASS").length;
  const failCount = scored.filter((item) => item.state === "FAIL").length;
  const unknownCount = scored.filter((item) => item.state === "UNKNOWN").length;
  const measurableCount = passCount + failCount;
  const outsidePct = measurableCount > 0 ? Math.round((failCount / measurableCount) * 100) : null;
  const alignmentPct = measurableCount > 0 ? 100 - outsidePct : null;

  let marker = "UNKNOWN";
  if (outsidePct !== null) {
    if (outsidePct >= CENTRALDARK_PATTERN_RED_OUTSIDE_PCT) marker = "RED";
    else if (outsidePct >= 50) marker = "ORANGE";
    else if (outsidePct > 20) marker = "YELLOW";
    else if (unknownCount > 0) marker = "WATCH";
    else marker = "GREEN";
  }

  return {
    schema: "centraldark.pattern-alignment.v1",
    label: "PADRÃO CENTRALDARK",
    observedAt: new Date().toISOString(),
    redOutsidePct: CENTRALDARK_PATTERN_RED_OUTSIDE_PCT,
    outsidePct,
    alignmentPct,
    marker,
    passCount,
    failCount,
    unknownCount,
    measurableCount,
    totalDimensions: dimensions.length,
    scoredDimensions: scored.length,
    rule: "RED_IF_OUTSIDE_PCT_GTE_80",
    unknownSemantics: "UNKNOWN_NOT_COUNTED_AS_OUTSIDE_BUT_NEVER_GREEN",
    externalObservationPath: "apps/modulos/status/centraldark-pattern-observation.json",
    dimensions,
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

  const rules = {
      unknownIsNotPass: true,
      processAliveIsNotFixedPoint: true,
      sourceIsNotRuntime: true,
      badgeIsTelemetryNotProof: true,
      oneWriterPerScope: true,
      secretsContentExposed: false,
      reuseBeforeCreate: true,
      noNewInformation: "REUSE_PROOF",
      sameFindingWithoutNewEvidence: "DROP_DUPLICATE",
      reuseProvenCrystalBeforeReinvestigate: true,
      fixedPointIsVerificationCheckpointNotLearningGate: true,
      sensorFailureIsWorldFailure: false,
      optionalSensorOfflineIsGlobalFailure: false,
      changedTargetRevalidatesAffectedChainOnly: true,
  };
  const boundary = secretBoundary(root);
  const patternAlignment = patternAlignmentSnapshot({ root, diagnostics, boundary, rules });

  return {
    schema: "centraldark.operational.snapshot.v1",
    observedAt: new Date().toISOString(),
    deterministicFlow: FLOW,
    rules,
      unknownIsNotPass: true,
      processAliveIsNotFixedPoint: true,
      sourceIsNotRuntime: true,
      badgeIsTelemetryNotProof: true,
      oneWriterPerScope: true,
      secretsContentExposed: false,
      reuseBeforeCreate: true,
      noNewInformation: "REUSE_PROOF",
      sameFindingWithoutNewEvidence: "DROP_DUPLICATE",
      reuseProvenCrystalBeforeReinvestigate: true,
      fixedPointIsVerificationCheckpointNotLearningGate: true,
      sensorFailureIsWorldFailure: false,
      optionalSensorOfflineIsGlobalFailure: false,
    runtime: {
      pid: process.pid,
      uptimeSec: Math.round(process.uptime()),
      cpuCount: cpus,
      loadavg: load,
      rssMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
    },
    heartbeat: heartbeat || { self: "UNKNOWN" },
    forensic: diagnostics,
    secretBoundary: boundary,
    patternAlignment,
    statusFiles: statusFileSnapshot(root),
    fronts,
    verdict: diagnostics.status === "OBSERVED" ? "OBSERVED_NOT_FIXED_POINT" : "UNKNOWN_NOT_PASS",
  };
}
