import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { evaluateFixedPointTen } from "../../../../scripts/lupa/horn-reuse-fixed-point.mjs";

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
  const stale = !Number.isFinite(ageMs) || ageMs < -5000 || ageMs > 15 * 60 * 1000;
  return {
    status: stale ? "STALE" : "OBSERVED",
    latestReceiptPresent: true,
    observedAt: observedAt || null,
    observedAtIso: Number.isFinite(Date.parse(iso || "")) ? new Date(Date.parse(iso)).toISOString() : null,
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
    path.join(root, "logs/auto-sync-status.json"),
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

function readTailSafe(file, maxBytes = 64 * 1024) {
  let fd = null;
  try {
    const stat = fs.statSync(file);
    const size = Math.min(stat.size, maxBytes);
    const start = Math.max(0, stat.size - size);
    const buf = Buffer.alloc(size);
    fd = fs.openSync(file, "r");
    fs.readSync(fd, buf, 0, size, start);
    return buf.toString("utf8");
  } catch {
    return "";
  } finally {
    if (fd !== null) {
      try { fs.closeSync(fd); } catch {}
    }
  }
}

function processCmdlines(procRoot = "/proc") {
  let entries = [];
  try { entries = fs.readdirSync(procRoot, { withFileTypes: true }); } catch { return []; }

  const rows = [];
  for (const entry of entries) {
    if (!entry.isDirectory() || !/^\d+$/.test(entry.name)) continue;
    const pid = Number(entry.name);
    const base = path.join(procRoot, entry.name);
    let command = "";
    try {
      command = fs.readFileSync(path.join(base, "cmdline"))
        .toString("utf8")
        .replaceAll("\u0000", " ")
        .trim();
    } catch {}
    if (!command) {
      try { command = fs.readFileSync(path.join(base, "comm"), "utf8").trim(); } catch {}
    }
    if (command) rows.push({ pid, command });
  }
  return rows;
}

function laneFromProcesses(processes, id, label, patterns) {
  const matches = processes.filter((row) => patterns.some((pattern) => pattern.test(row.command)));
  return {
    id,
    label,
    state: matches.length > 0 ? "RUNNING" : "NOT_OBSERVED",
    processCount: matches.length,
    pids: matches.slice(0, 12).map((row) => row.pid),
    evidence: matches.length > 0 ? "PROC_CMDLINE" : "NONE",
  };
}

function latestMcpToolActivity(root, nowMs = Date.now()) {
  const logDir = path.join(root, "logs");
  let names = [];
  try {
    names = fs.readdirSync(logDir)
      .filter((name) => /^mcp-audit-.*\.jsonl(?:\.\d+)?$/.test(name))
      .map((name) => {
        const file = path.join(logDir, name);
        let mtimeMs = 0;
        try { mtimeMs = fs.statSync(file).mtimeMs; } catch {}
        return { file, mtimeMs };
      })
      .sort((a, b) => b.mtimeMs - a.mtimeMs);
  } catch {}

  for (const candidate of names.slice(0, 4)) {
    const lines = readTailSafe(candidate.file).split(/\r?\n/).filter(Boolean).reverse();
    for (const line of lines) {
      let event = null;
      try { event = JSON.parse(line); } catch { continue; }
      const isToolCall = event?.event === "mcp_tool_execution" && event?.method === "tools/call";
      const isLiveToolCall = event?.event === "mcp_tool_execution_live";
      if (!isToolCall && !isLiveToolCall) continue;

      const ts = Date.parse(String(event?.timestamp || ""));
      const ageMs = Number.isFinite(ts) ? Math.max(0, nowMs - ts) : null;
      const recent = ageMs !== null && ageMs <= 5 * 60 * 1000;
      return {
        state: recent ? "RECENT" : "STALE",
        observedAt: event?.timestamp || null,
        ageMs,
        toolName: typeof event?.toolName === "string" ? event.toolName : null,
        ok: event?.ok === true || event?.status === "PASS",
        source: path.relative(root, candidate.file).replaceAll("\\", "/"),
      };
    }
  }

  return {
    state: "UNKNOWN",
    observedAt: null,
    ageMs: null,
    toolName: null,
    ok: null,
    source: "logs/mcp-audit-*.jsonl*",
  };
}

function modelBindingSnapshot({ root, procRoot = "/proc", nowMs = Date.now() }) {
  const hermesConfig = readTextSafe("/root/.hermes/config.yaml");
  const modelMatch = hermesConfig.match(/\bdefault:\s*[\'"]?([^\'"\n]+)[\'"]?/);
  const providerMatch = hermesConfig.match(/\bprovider:\s*[\'"]?([^\'"\n]+)[\'"]?/);
  const baseMatch = hermesConfig.match(/\bbase_url:\s*[\'"]?([^\'"\n]+)[\'"]?/);
  const local = readJsonSafe(path.join(root, "logs/model-binding-current.json"));
  const evolution = readJsonSafe(path.join(root, "logs/self-evolution-binding.json"));
  const processes = processCmdlines(procRoot);
  const activeEvolution = processes.find((row) => /evolution\.skills\.evolve_skill/.test(row.command));
  const optimizer = activeEvolution?.command.match(/--optimizer-model\s+([^\s]+)/)?.[1] || null;
  const evaluator = activeEvolution?.command.match(/--eval-model\s+([^\s]+)/)?.[1] || null;
  return {
    schema: "centraldark.model-routing.v1",
    observedAt: new Date(nowMs).toISOString(),
    rules: { modelIsEngine: true, modelNameIsBinding: true, orchestratorUsesCurrentHermesSelection: true, localWorkerUsesCurrentLocalSelection: true, resolveAtLoteStart: true, midLoteSwap: false, noSecondRouter: true },
    orchestrator: {
      model: modelMatch?.[1]?.trim() || null,
      provider: providerMatch?.[1]?.trim() || null,
      baseUrl: baseMatch?.[1]?.trim() || null,
      source: "/root/.hermes/config.yaml",
      state: modelMatch ? "SELECTED" : "UNKNOWN",
    },
    localWorker: {
      model: local?.local_worker?.model || null,
      source: local?.local_worker?.source || "logs/model-binding-current.json",
      observedAt: local?.observed_at || null,
      state: local?.local_worker?.model ? "SELECTED" : "UNKNOWN",
    },
    selfEvolution: {
      active: Boolean(activeEvolution),
      pid: activeEvolution?.pid || null,
      optimizerModel: optimizer || evolution?.model_spec || null,
      evalModel: evaluator || evolution?.model_spec || null,
      frozenPerLote: true,
      state: activeEvolution ? "RUNNING" : (evolution?.model ? "LAST_BINDING_OBSERVED" : "UNKNOWN"),
    },
  };
}

function executionTopologySnapshot({ root, procRoot = "/proc", nowMs = Date.now() }) {
  const processes = processCmdlines(procRoot);
  const lanes = [
    laneFromProcesses(processes, "MCP_SERVER", "MCP CentralDark", [
      /apps\/modulos\/mcp\/dist\/index\.js/i,
    ]),
    laneFromProcesses(processes, "TELEGRAM_BOT", "Telegram unified-bot", [
      /apps\/bot-telegram\/unified-bot\.cjs/i,
    ]),
    laneFromProcesses(processes, "HERMES_RUNTIME", "Hermes runtime", [
      /\bhermes\s+(?:acp|serve)\b/i,
      /hermes_cli\.main\s+gateway\s+run/i,
    ]),
    laneFromProcesses(processes, "HERMES_CRON", "Hermes cron/external worker", [
      /-m\s+cron\.scheduler\b/i,
    ]),
    laneFromProcesses(processes, "SELF_EVOLUTION", "Hermes Self-Evolution", [
      /evolution\.skills\.evolve_skill/i,
    ]),
    laneFromProcesses(processes, "GITHUB_RUNNER", "GitHub Actions runner", [
      /actions-runner\/.*Runner\.(?:Listener|Worker)/i,
    ]),
    laneFromProcesses(processes, "REMOTE_DESKTOP", "Desktop Commander Remote", [
      /desktop-commander/i,
    ]),
    laneFromProcesses(processes, "GUARDIAO", "Guardião runtime", [
      /infra\/guardiao\/.*(?:guardiao|analista)\.py/i,
    ]),
  ];

  const mcpActivity = latestMcpToolActivity(root, nowMs);
  const telegram = lanes.find((lane) => lane.id === "TELEGRAM_BOT");
  const anyRuntime = lanes.some((lane) => lane.state === "RUNNING");
  const executionObserved = mcpActivity.state === "RECENT";

  return {
    schema: "centraldark.execution-topology.v1",
    observedAt: new Date(nowMs).toISOString(),
    source: "PROC_CMDLINE+MCP_AUDIT",
    aiRequired: false,
    rules: {
      uiLoopPausedIsNotGlobalExecutionPaused: true,
      plannerIsNotExecutor: true,
      monitorIsNotExecutor: true,
      processPresentIsNotExecutionProof: true,
      recentMcpToolCallIsExecutionEvidence: true,
      unknownIsNotPass: true,
    },
    ui: {
      state: "EXTERNAL_NOT_MEASURED",
      semantics: "UI state cannot infer global executor state",
    },
    roles: {
      coordinator: "SOL/UI",
      controlPlane: "CentralDark MCP",
      executionSurfaces: ["Telegram Bot", "Hermes runtime", "Hermes cron", "MCP tools"],
      judge: "observable runtime evidence",
    },
    lanes,
    mcpActivity,
    duplicateSignals: {
      telegramBotProcesses: telegram?.processCount ?? 0,
      telegramBotMultiplicity: (telegram?.processCount ?? 0) > 1
        ? "WATCH_MULTIPLE"
        : (telegram?.processCount ?? 0) === 1
          ? "SINGLE"
          : "UNKNOWN",
    },
    verdict: executionObserved
      ? "EXECUTION_EVIDENCE_OBSERVED"
      : anyRuntime
        ? "RUNTIME_PRESENT_EXECUTION_UNKNOWN"
        : "UNKNOWN_NOT_PASS",
  };
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

// F1_GIT: o próprio owner scripts/vps/auto-sync-main.sh grava o último ciclo em
// logs/auto-sync-status.json; o coração só lê. Sem arquivo ou velho demais = não é PASS.
export const AUTO_SYNC_STATUS_MAX_AGE_MS = 15 * 60 * 1000;
export function gitSyncFront(root, nowMs = Date.now()) {
  const status = readJsonSafe(path.join(root, "logs/auto-sync-status.json"));
  if (!status || typeof status !== "object") return "MEASURE_EXTERNALLY";
  const at = Date.parse(status.t || "");
  if (!Number.isFinite(at)) return "UNKNOWN";
  if (nowMs - at > AUTO_SYNC_STATUS_MAX_AGE_MS) return "STALE";
  const sha = String(status.head || "").slice(0, 9);
  if (status.result === "PASS") return `SYNC_PASS@${sha}`;
  if (status.result === "BLOCKED") return `BLOCKED:${String(status.reason || "unknown").slice(0, 80)}`;
  return "UNKNOWN";
}


function sha256(value) {
  const content = typeof value === "string" ? value : JSON.stringify(value);
  return createHash("sha256").update(content || "").digest("hex");
}

function countMatches(text, expression) {
  return [...String(text || "").matchAll(expression)].length;
}

function fixedPointTenEvidence({ root, heartbeat, diagnostics, nowMs }) {
  const measuredAt = new Date(nowMs).toISOString();
  const hudPath = path.join(root, "docs/HUD/HUD.html");
  const hudText = readTextSafe(hudPath);
  const hudSha = hudText ? sha256(hudText) : null;
  const expectedUiIds = [
    "owner", "locks", "mcp", "heart", "screenpipe",
    "aion", "privacy", "sync", "forensic", "receipt",
  ];
  const actualUiIds = [...hudText.matchAll(/data-fp="([^"]+)"/g)].map((match) => match[1]);
  const uiIdsUnique = expectedUiIds.every((id) => actualUiIds.filter((found) => found === id).length === 1)
    && countMatches(hudText, /id="cd-fixed-point-ten"/g) === 1;
  const ownerStatus = !hudText ? "UNKNOWN" : uiIdsUnique ? "PASS" : "FAIL";
  const ownerEvidence = {
    id: "OWNER_UNIQUE",
    status: ownerStatus,
    evaluated: true,
    source: "docs/HUD/HUD.html",
    source_sha: hudSha,
    proof_ref: "docs/HUD/HUD.html#cd-fixed-point-ten",
    counterproof_ref: "scan:canonical-owner-and-ten-unique-data-fp-ids",
    counterproof_verdict: uiIdsUnique ? "NOT_REFUTED" : "REFUTED",
    attempt_ref: "readback:docs/HUD/HUD.html@" + measuredAt,
    evaluated_at: measuredAt,
    measured_at: measuredAt,
    reason: ownerStatus === "PASS" ? null : "HUD file or ten unique IDs not proven by this readback",
  };

  const supplied = heartbeat?.fixedPointTenEvidence && typeof heartbeat.fixedPointTenEvidence === "object"
    ? heartbeat.fixedPointTenEvidence : {};
  const suppliedRow = (id, fallbackSource) => {
    const row = supplied[id];
    if (!row || typeof row !== "object") {
      return {
        id, status: "UNKNOWN", evaluated: false, source: fallbackSource,
        attempt_ref: null, evaluated_at: null, measured_at: measuredAt,
        reason: "CURRENT_SENSOR_ATTEMPT_RECEIPT_NOT_SUPPLIED",
      };
    }
    return { ...row, id };
  };

  const heartbeatPath = path.join(root, "logs/heartbeat-api.json");
  const beat = readJsonSafe(heartbeatPath);
  const beatTime = Date.parse(String(beat?.t || ""));
  const beatAge = Number.isFinite(beatTime) ? nowMs - beatTime : null;
  const beatFresh = beatAge !== null && beatAge >= -5000 && beatAge <= 30000;
  const beatStatus = beatFresh && String(beat?.self || "").toLowerCase() === "alive"
    ? "PASS"
    : (beatAge === null ? "UNKNOWN" : (beatAge < -5000 || beatAge > 30000 ? "STALE" : "FAIL"));
  const heartEvidence = beat ? {
    id: "ONE_HEART_FRESH",
    status: beatStatus,
    evaluated: true,
    source: "logs/heartbeat-api.json",
    source_sha: sha256(beat),
    proof_ref: "logs/heartbeat-api.json#t=" + String(beat.t || "UNKNOWN"),
    counterproof_ref: "heartbeat-self-alive-and-age-within-30s",
    counterproof_verdict: beatStatus === "PASS" ? "NOT_REFUTED" : "REFUTED",
    attempt_ref: "readback:logs/heartbeat-api.json@" + measuredAt,
    evaluated_at: measuredAt,
    measured_at: Number.isFinite(beatTime) ? new Date(beatTime).toISOString() : measuredAt,
    max_age_ms: 30000,
    reason: beatStatus === "PASS" ? null : "Heartbeat is absent, unknown, stale, or not alive",
  } : {
    id: "ONE_HEART_FRESH", status: "UNKNOWN", evaluated: true,
    source: "logs/heartbeat-api.json", attempt_ref: "readback:logs/heartbeat-api.json@" + measuredAt,
    evaluated_at: measuredAt, measured_at: measuredAt,
    reason: "No current heartbeat file was readable",
  };

  const syncPath = path.join(root, "logs/auto-sync-status.json");
  const sync = readJsonSafe(syncPath);
  const syncTime = Date.parse(String(sync?.t || ""));
  const syncAge = Number.isFinite(syncTime) ? nowMs - syncTime : null;
  const syncFresh = syncAge !== null && syncAge >= -5000 && syncAge <= AUTO_SYNC_STATUS_MAX_AGE_MS;
  const validSha = (v) => /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/i.test(String(v || ""));
  const sameHead = validSha(sync?.head) && validSha(sync?.origin_main) && sync.head === sync.origin_main;
  const syncStatus = !sync ? "UNKNOWN"
    : !syncFresh ? "STALE"
    : sync.result === "BLOCKED" ? "BLOCKED"
    : sync.result === "FAIL" ? "FAIL"
    : sync.result === "PASS" && sameHead ? "PASS"
    : sync.result === "PASS" ? "FAIL" : "UNKNOWN";
  const syncEvidence = sync ? {
    id: "CHECKOUT_MAIN_SYNC",
    status: syncStatus,
    evaluated: true,
    source: "logs/auto-sync-status.json",
    source_sha: validSha(sync.head) ? sync.head : (validSha(sync.origin_main) ? sync.origin_main : sha256(sync)),
    proof_ref: "logs/auto-sync-status.json#head=" + String(sync.head || "UNKNOWN"),
    counterproof_ref: "head-equals-origin_main-and-fresh-auto-sync-receipt",
    counterproof_verdict: syncStatus === "PASS" ? "NOT_REFUTED" : "REFUTED",
    attempt_ref: "readback:logs/auto-sync-status.json@" + measuredAt,
    evaluated_at: measuredAt,
    measured_at: Number.isFinite(syncTime) ? new Date(syncTime).toISOString() : measuredAt,
    max_age_ms: AUTO_SYNC_STATUS_MAX_AGE_MS,
    reason: syncStatus === "PASS" ? null : "Sync receipt missing, stale, blocked, or HEADs differ",
  } : {
    id: "CHECKOUT_MAIN_SYNC", status: "UNKNOWN", evaluated: true, source: syncPath,
    attempt_ref: "readback:" + syncPath + "@" + measuredAt,
    evaluated_at: measuredAt, measured_at: measuredAt,
    reason: "No current auto-sync receipt was readable",
  };

  const forensicHashValid = /^[a-f0-9]{64}$/i.test(String(diagnostics?.sha256 || ""));
  const forensicShapeValid = diagnostics?.latestReceiptPresent === true &&
    forensicHashValid && diagnostics.reportPresent === true &&
    diagnostics.archivePresent === true && diagnostics.secretsContentCollected === false;
  const forensicStatus = !diagnostics?.latestReceiptPresent ? "UNKNOWN"
    : diagnostics.status === "STALE" ? "STALE"
    : diagnostics.status === "OBSERVED" && forensicShapeValid ? "PASS"
    : "FAIL";
  const forensicEvidence = diagnostics?.latestReceiptPresent ? {
    id: "FORENSIC_FRESHNESS",
    status: forensicStatus,
    evaluated: true,
    source: "_DIAGNOSTICS/FORENSIC-LATEST.json",
    source_sha: forensicHashValid ? diagnostics.sha256 : sha256(diagnostics),
    proof_ref: "_DIAGNOSTICS/FORENSIC-LATEST.json#sha256=" + String(diagnostics.sha256 || "UNKNOWN"),
    counterproof_ref: "timestamp-within-15m+report+archive+secret-boundary",
    counterproof_verdict: forensicStatus === "PASS" ? "NOT_REFUTED" : "REFUTED",
    attempt_ref: "readback:_DIAGNOSTICS/FORENSIC-LATEST.json@" + measuredAt,
    evaluated_at: measuredAt,
    measured_at: Number.isFinite(Date.parse(String(diagnostics.observedAtIso || diagnostics.observedAt || "")))
      ? new Date(Date.parse(String(diagnostics.observedAtIso || diagnostics.observedAt))).toISOString() : measuredAt,
    max_age_ms: 15 * 60 * 1000,
    reason: forensicStatus === "PASS" ? null : "Receipt exists but freshness/shape/integrity is not proven",
  } : {
    id: "FORENSIC_FRESHNESS", status: "UNKNOWN", evaluated: true,
    source: "_DIAGNOSTICS/FORENSIC-LATEST.json",
    attempt_ref: "readback:_DIAGNOSTICS/FORENSIC-LATEST.json@" + measuredAt,
    evaluated_at: measuredAt, measured_at: measuredAt,
    reason: "No current forensic receipt was found at the canonical pointer",
  };

  const receiptStatus = !diagnostics?.latestReceiptPresent ? "UNKNOWN"
    : forensicShapeValid ? "PASS" : "FAIL";
  const receiptEvidence = diagnostics?.latestReceiptPresent ? {
    id: "RECEIPT_PRESENT",
    status: receiptStatus,
    evaluated: true,
    source: "_DIAGNOSTICS/FORENSIC-LATEST.json",
    source_sha: forensicHashValid ? diagnostics.sha256 : sha256(diagnostics),
    proof_ref: "_DIAGNOSTICS/FORENSIC-LATEST.json#receipt",
    counterproof_ref: "receipt-hash+report+archive+secret-boundary-readback",
    counterproof_verdict: receiptStatus === "PASS" ? "NOT_REFUTED" : "REFUTED",
    attempt_ref: "readback:_DIAGNOSTICS/FORENSIC-LATEST.json@" + measuredAt,
    evaluated_at: measuredAt,
    measured_at: measuredAt,
    reason: receiptStatus === "PASS" ? null : "Receipt is present but integrity/required artifacts are not proven",
  } : {
    id: "RECEIPT_PRESENT", status: "UNKNOWN", evaluated: true,
    source: "_DIAGNOSTICS/FORENSIC-LATEST.json",
    attempt_ref: "readback:_DIAGNOSTICS/FORENSIC-LATEST.json@" + measuredAt,
    evaluated_at: measuredAt, measured_at: measuredAt,
    reason: "No current receipt was found at the canonical pointer",
  };

  const criteria = [
    ownerEvidence,
    suppliedRow("LOCKS_PRESERVED", "HUD lock inventory/current receipt"),
    suppliedRow("MCP_PUBLIC_HEALTH", "authenticated public /health probe receipt"),
    heartEvidence,
    suppliedRow("SCREENPIPE_CURRENT", "Screenpipe current health/readback receipt"),
    suppliedRow("AIONUI_STDIO_CURRENT", "AionUi MCP stdio tools/list receipt"),
    suppliedRow("LOG_PRIVACY_CURRENT", "authenticated sanitized log readback receipt"),
    syncEvidence,
    forensicEvidence,
    receiptEvidence,
  ];

  const goalReceipt = heartbeat?.goalClauseProjection ||
    heartbeat?.operational?.goalClauseProjection || null;
  const currentHead = validSha(sync?.origin_main) ? sync.origin_main :
    (validSha(sync?.head) ? sync.head : null);
  return evaluateFixedPointTen({ criteria, goalReceipt, currentHead }, { nowMs });
}


export function getOperationalSnapshot({ root = DEFAULT_ROOT, heartbeat = null, procRoot = "/proc", nowMs = Date.now() } = {}) {
  const diagnostics = latestForensic(root);
  const cpus = os.cpus()?.length || 0;
  const load = os.loadavg();
  const fronts = [
    { id: "F1_GIT", source: "scripts/vps/auto-sync-main.sh -> logs/auto-sync-status.json", state: gitSyncFront(root, nowMs) },
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
  const fixedPointTen = fixedPointTenEvidence({ root, heartbeat, diagnostics, fronts, nowMs });
  const executionTopology = executionTopologySnapshot({ root, procRoot, nowMs });
  const modelBinding = modelBindingSnapshot({ root, procRoot, nowMs });

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
    fixedPointTen,
    executionTopology,
    modelBinding,
    statusFiles: statusFileSnapshot(root),
    fronts,
    verdict: diagnostics.status === "OBSERVED" ? "OBSERVED_NOT_FIXED_POINT" : "UNKNOWN_NOT_PASS",
  };
}
