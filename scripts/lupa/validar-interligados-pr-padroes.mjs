#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

const argv = process.argv.slice(2);
const valueAfter = (name, fallback) => {
  const index = argv.indexOf(name);
  return index >= 0 && argv[index + 1] ? argv[index + 1] : fallback;
};

const ROOT = resolve(valueAfter("--repo-root", process.cwd()));
const JSON_OUT = argv.includes("--json");

const BASE = ".agents/skills/meta-lupa/KITS/METAGRILL-METALUPA/INTERLIGADOS";
const REGISTRY = `${BASE}/PADROES-PR/REGISTRY.json`;
const MAPA = `${BASE}/SKILLS/MAPA-MENTAL-OPERACIONAL.md`;
const TRIGGERS = "docs/SEGURANCA/ADM-GATILHOS-OPERACIONAIS.json";
const OWNER = ".agents/skills/meta-lupa/SKILL.md";

const REQUIRED_PATTERN_IDS = Object.freeze([
  "ONE_SYSTEM_ONLY",
  "REUSE_BEFORE_CREATE",
  "NO_V2_V3_PARALLEL_SYSTEMS",
  "CURRENT_OVER_HISTORY",
  "UNKNOWN_IS_NOT_PASS",
  "ACTION_IS_NOT_PROOF",
  "DOCUMENTED_IS_NOT_EXECUTED",
  "MERGED_IS_NOT_DEPLOYED",
  "SAME_HEAD_PROOF",
  "ONE_WRITER_PER_SCOPE",
  "DURABLE_FACT_TEMPORAL_EDGE_SPLIT",
  "SENSOR_FAILURE_IS_NOT_WORLD_FAILURE",
  "MODEL_IS_NOT_AUTHORITY",
  "SOURCE_FEATURE_IS_NOT_RUNTIME_PROOF",
  "DETERMINISTIC_CAPABILITY_ROUTING",
  "CURRENT_BINDING_CHAIN",
  "ERROR_IS_TELEMETRY_NOT_NEW_ARCHITECTURE",
  "PR_PATTERN_IS_NOT_IMPLEMENTATION_PROMOTED",
  "MEASURE_BEFORE_CREATION",
  "TRIGGER_SURFACE_IS_NOT_HISTORY_PROVENANCE",
  "TECHNICAL_BLOCKER_AUTO_CONTINUES_UNTIL_HUMAN_FRONTIER",
  "PR_IS_COMMUNICATION_LEDGER_NOT_AUTHORITY",
  "TOOL_DISCOVERY_BEFORE_ACCESS_CLAIM",
  "CONTEXT_BEFORE_JUDGMENT",
  "POST_PR_CONTINUES_UNTIL_MERGED_OR_MATERIAL_BLOCKER",
  "REGISTRA_PROMOTION_CHAIN",
  "ACTION_REQUIRED_IS_WAIT_NOT_FAIL_NOT_PASS",
  "SEMANTIC_ACCEPT_BOTH_IS_NOT_BLIND_ACCEPT_BOTH",
]);

const REQUIRED_RUNTIME_EDGES = Object.freeze([
  "REMOTE_DEVICE_ONLINE_NOW",
  "SCREENPIPE_3030_LISTENING_NOW",
  "SCREENPIPE_AUDIO_INPUT_BOUND_NOW",
  "PHONE_TO_WO_MIC_MEDIA_FLOW_NOW",
  "VOICE_TO_INTENT_TO_ROUTER_TO_RECEIPT_NOW",
  "CENTRALDARK_EXE_RUNNING_NOW",
  "VPS_DEPLOYED_SHA_NOW",
  "APP_READY_END_TO_END",
  "VOICE_FOLLOWS_INTENT_END_TO_END",
  "PHONE_AUDIO_CONTENT_MATCHES_TRANSCRIPT_END_TO_END",
  "GLOBAL_FIXED_POINT",
]);

const REQUIRED_CHAIN = Object.freeze([
  "👑🪬 !CENTRALDARK",
  "🔗 !># INTERLIGADOS",
  "⭕ !AURÉOLA CANÔNICA",
  "🧿 #ACORDAR",
  "🎛️ !CALIBRAR",
  "🧭 !MULTIBÚSSOLA",
  "🔎 !META_LUPA",
  "🔄 !RECONCILIAR",
  "⚖️ !CONTRAPROVA",
  "🧾 !REGISTRA",
  "⚖️ REALIDADE",
]);

const REQUIRED_SKILL_NODES = Object.freeze([
  "centraldark-operational-method",
  "capability-contract-router",
  "cot-react-loop",
  "auditoria-pr",
  "centraldark-esteira-motor",
  "brain-memory",
  "meta-lupa",
  "git-conflict-resolve-house-standard",
  "code-validation-sandbox",
  "context-synthesis",
]);

const errors = [];
const warnings = [];
const read = (path) => readFileSync(join(ROOT, path), "utf8");
const exists = (path) => existsSync(join(ROOT, path));

for (const path of [REGISTRY, MAPA, TRIGGERS, OWNER]) {
  if (!exists(path)) errors.push(`INTERLIGADOS_REQUIRED_FILE_MISSING:${path}`);
}

let registry = null;
let triggers = null;
try { registry = JSON.parse(read(REGISTRY)); } catch { errors.push(`INTERLIGADOS_REGISTRY_JSON_INVALID:${REGISTRY}`); }
try { triggers = JSON.parse(read(TRIGGERS)); } catch { errors.push(`INTERLIGADOS_TRIGGER_JSON_INVALID:${TRIGGERS}`); }

if (registry) {
  if (registry.status !== "CANONICAL_PATTERN_LAYER_ON_MAIN") errors.push("INTERLIGADOS_REGISTRY_STATUS_INVALID");
  if (registry.owner !== OWNER) errors.push(`INTERLIGADOS_OWNER_INVALID:${registry.owner ?? "missing"}`);
  if (registry.scan?.rule !== "CRYSTALLIZE_SURVIVING_PATTERN_ONLY; DO_NOT_PROMOTE_UNPROVEN_IMPLEMENTATION") {
    errors.push("INTERLIGADOS_SCAN_RULE_INVALID");
  }
  if (registry.scan?.history_rule !== "CURRENT > HISTORY") errors.push("INTERLIGADOS_CURRENT_OVER_HISTORY_MISSING");
  if (registry.proof_boundary !== "SOURCE_PATTERN_CRYSTALLIZED != CI_GREEN != RUNTIME_PROVEN != GLOBAL_FIXED_POINT") {
    errors.push("INTERLIGADOS_PROOF_BOUNDARY_INVALID");
  }

  const patterns = Array.isArray(registry.patterns) ? registry.patterns : [];
  if (patterns.length === 0) errors.push("INTERLIGADOS_PATTERNS_EMPTY");
  if (registry.refresh?.pattern_count !== patterns.length) errors.push(`INTERLIGADOS_PATTERN_COUNT_DRIFT:declared=${registry.refresh?.pattern_count ?? "missing"}:actual=${patterns.length}`);
  if (!Array.isArray(registry.refresh?.latest_prs_reconciled) || !registry.refresh.latest_prs_reconciled.includes(1633)) errors.push("INTERLIGADOS_LATEST_SWEEP_DOES_NOT_REACH_PR1633");

  const ids = new Set();
  for (const pattern of patterns) {
    if (!pattern?.id || ids.has(pattern.id)) errors.push(`INTERLIGADOS_PATTERN_ID_INVALID:${pattern?.id ?? "missing"}`);
    if (pattern?.id) ids.add(pattern.id);
    if (typeof pattern?.emoji !== "string" || pattern.emoji.length === 0) errors.push(`INTERLIGADOS_PATTERN_EMOJI_MISSING:${pattern?.id ?? "unknown"}`);
    if (typeof pattern?.anchor !== "string" || pattern.anchor.trim().length === 0) errors.push(`INTERLIGADOS_PATTERN_ANCHOR_MISSING:${pattern?.id ?? "unknown"}`);
    if (!Array.isArray(pattern?.pr_refs) || pattern.pr_refs.length === 0) errors.push(`INTERLIGADOS_PATTERN_PROVENANCE_MISSING:${pattern?.id ?? "unknown"}`);
    if (pattern?.runtime_required !== false) errors.push(`INTERLIGADOS_PATTERN_FALSE_RUNTIME_PROMOTION:${pattern?.id ?? "unknown"}`);
  }

  for (const id of REQUIRED_PATTERN_IDS) {
    if (!ids.has(id)) errors.push(`INTERLIGADOS_REQUIRED_PATTERN_MISSING:${id}`);
  }

  const activeRuntimeEdges = Array.isArray(registry.current_runtime_remeasurement_required)
    ? registry.current_runtime_remeasurement_required
    : registry.runtime_or_external_remeasurement_required;
  const runtimeEdges = new Set(Array.isArray(activeRuntimeEdges) ? activeRuntimeEdges : []);
  if (registry.runtime_remeasurement_semantics?.provenance_catalog_is_not_active_debt !== true) {
    errors.push("INTERLIGADOS_RUNTIME_HISTORY_SEMANTICS_MISSING");
  }
  for (const edge of REQUIRED_RUNTIME_EDGES) {
    if (!runtimeEdges.has(edge)) errors.push(`INTERLIGADOS_RUNTIME_EDGE_DEBT_MISSING:${edge}`);
  }
  if (runtimeEdges.size === 0) errors.push("INTERLIGADOS_RUNTIME_DEBT_MUST_STAY_EXPLICIT");
}

if (exists(MAPA)) {
  const mapa = read(MAPA);
  for (const token of REQUIRED_CHAIN) {
    if (!mapa.includes(token)) errors.push(`INTERLIGADOS_CHAIN_TOKEN_MISSING:${token}`);
  }
  for (const skill of REQUIRED_SKILL_NODES) {
    if (!mapa.includes(skill)) errors.push(`INTERLIGADOS_SKILL_NODE_MISSING:${skill}`);
  }
  if (!mapa.includes("INTERLIGADOS != CARREGAR TODAS AS SKILLS")) errors.push("INTERLIGADOS_LAZY_LOAD_RULE_MISSING");
  if (!mapa.includes("REALIDADE = JUIZ")) errors.push("INTERLIGADOS_REALITY_JUDGE_MISSING");
  if (!mapa.includes("MEASURE_BEFORE_CREATION")) errors.push("INTERLIGADOS_MEASURE_BEFORE_CREATION_MISSING");
  if (!mapa.includes("REUSE_BEFORE_CREATE")) errors.push("INTERLIGADOS_MEASURE_BEFORE_CREATION_FORMULA_MISSING");
}

if (triggers) {
  if (triggers.visual_contract?.emoji_required_for_each_trigger !== true) errors.push("INTERLIGADOS_EMOJI_CONTRACT_DISABLED");
  if (triggers.visual_contract?.canonical_display_must_preserve_emoji !== true) errors.push("INTERLIGADOS_EMOJI_DISPLAY_NOT_LOCKED");
  const interligados = Array.isArray(triggers.triggers)
    ? triggers.triggers.find((item) => item?.id === "INTERLIGADOS")
    : null;
  if (!interligados) errors.push("INTERLIGADOS_TRIGGER_MISSING");
  else {
    if (interligados.canonical_display !== "🔗 !># INTERLIGADOS") errors.push("INTERLIGADOS_CANONICAL_DISPLAY_DRIFT");
    if (interligados.activation?.requires_runtime_measurement !== false) errors.push("INTERLIGADOS_TRIGGER_WRONG_RUNTIME_POLICY");
  }
}

const directEntries = exists(BASE) ? readdirSync(join(ROOT, BASE), { withFileTypes: true }) : [];
for (const entry of directEntries) {
  if (entry.isDirectory() && entry.name !== entry.name.toUpperCase()) {
    errors.push(`INTERLIGADOS_DIRECTORY_NOT_UPPERCASE:${entry.name}`);
  }
}

function walkMarkdown(relativeDir) {
  const absolute = join(ROOT, relativeDir);
  if (!existsSync(absolute)) return [];
  const out = [];
  for (const entry of readdirSync(absolute, { withFileTypes: true })) {
    const relative = `${relativeDir}/${entry.name}`;
    if (entry.isDirectory()) out.push(...walkMarkdown(relative));
    else if (entry.isFile() && entry.name.endsWith(".md")) out.push(relative);
  }
  return out;
}

const emojiRegex = /[\u{1F300}-\u{1FAFF}\u2600-\u27BF]/u;
const triggerTokens = ["!CENTRALDARK", "!># INTERLIGADOS", "#ACORDAR", "!CALIBRAR", "!MULTIBÚSSOLA", "!META_LUPA", "!RECONCILIAR", "!CONTRAPROVA", "!REGISTRA"];
for (const path of walkMarkdown(BASE)) {
  const text = read(path);
  if (!emojiRegex.test(text)) errors.push(`INTERLIGADOS_MD_WITHOUT_EMOJI:${path}`);
  const isProvenanceSurface =
    path.startsWith(`${BASE}/RECEIPTS/`) ||
    path.startsWith(`${BASE}/PADROES-PR/DELTA-`) ||
    path === `${BASE}/RUNTIME-REMEASURE-ONLY.md`;
  if (!isProvenanceSurface && !triggerTokens.some((token) => text.includes(token))) {
    errors.push(`INTERLIGADOS_MD_WITHOUT_TRIGGER:${path}`);
  }
}

const result = {
  ok: errors.length === 0,
  gate: "INTERLIGADOS_PR_PATTERNS",
  owner: OWNER,
  registry: REGISTRY,
  runtime_debt_explicit: registry?.current_runtime_remeasurement_required?.length ?? registry?.runtime_or_external_remeasurement_required?.length ?? 0,
  runtime_provenance_catalog: registry?.runtime_or_external_remeasurement_required?.length ?? 0,
  errors,
  warnings,
};

if (JSON_OUT) console.log(JSON.stringify(result, null, 2));
else {
  console.log(`INTERLIGADOS_PR_PATTERNS=${result.ok ? "PASS" : "FAIL"}`);
  console.log(`RUNTIME_DEBT_EXPLICIT=${result.runtime_debt_explicit}`);
  for (const error of errors) console.error(`ERROR=${error}`);
  for (const warning of warnings) console.warn(`WARNING=${warning}`);
}

process.exit(result.ok ? 0 : 1);
