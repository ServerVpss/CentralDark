#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";

const DEFAULT_GLOBAL_SCOPES = [
  "CENTRALDARK_AI_BOOT.yaml",
  "LEIA-ME-IA.md",
  ".agents/skills/",
  "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/",
  "scripts/checker/",
  "scripts/ci/",
  ".github/workflows/",
  "package.json",
  "package-lock.json",
  "pnpm-lock.yaml",
  "yarn.lock",
  "apps/modulos/Bolt/source/package.json",
  "apps/modulos/Bolt/source/pnpm-lock.yaml",
];

const RULES = [
  "MAIN_ADVANCED != PROBLEMA",
  "BEHIND_TOTAL = TELEMETRY",
  "BEHIND_TOUCHING_ACTIVE_SCOPE = RELEVANCE",
  "MATERIAL_BEHIND = DECISION",
  "UNRELATED_DRIFT -> IGNORE_AND_CONTINUE_PREVIOUS_FLOW",
  "UNKNOWN_DRIFT -> MEASURE_NOT_PASS",
  "MATERIAL_DRIFT -> RECONCILE_OR_REMEASURE",
];

function normalizePath(value) {
  return String(value ?? "")
    .trim()
    .replace(/\\/g, "/")
    .replace(/^\.\/+/, "")
    .replace(/\/+/g, "/")
    .replace(/\/$/, "");
}

function unique(values) {
  return [...new Set(values.map(normalizePath).filter(Boolean))];
}

function normalizeScope(value) {
  return String(value ?? "")
    .trim()
    .replace(/\\/g, "/")
    .replace(/^\.\/+/, "")
    .replace(/\/+/g, "/");
}

function matchesScope(changedPath, scope) {
  const path = normalizePath(changedPath);
  const rawScope = normalizeScope(scope);
  const normalizedScope = rawScope.replace(/\/$/, "");

  if (!path || !normalizedScope) {
    return false;
  }

  if (rawScope.endsWith("/")) {
    return path === normalizedScope || path.startsWith(`${normalizedScope}/`);
  }

  return path === normalizedScope || path.startsWith(`${normalizedScope}/`);
}

function parseArgs(argv) {
  const input = {
    main_changes: [],
    active_scopes: [],
    owner_tokens: [],
    global_scopes: [],
    behind_total: 0,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const [key, inlineValue] = arg.includes("=") ? arg.split(/=(.*)/s, 2) : [arg, undefined];
    const nextValue = () => inlineValue ?? argv[++index];

    if (key === "--main-change") input.main_changes.push(nextValue());
    else if (key === "--active-scope") input.active_scopes.push(nextValue());
    else if (key === "--owner-token") input.owner_tokens.push(nextValue());
    else if (key === "--global-scope") input.global_scopes.push(nextValue());
    else if (key === "--behind-total") input.behind_total = Number(nextValue() ?? 0);
    else if (key === "--json-file") Object.assign(input, JSON.parse(fs.readFileSync(nextValue(), "utf8")));
    else if (key === "--self-test") input.self_test = true;
    else if (key === "--help") input.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }

  return input;
}

export function classifyMaterialDrift(input = {}) {
  const mainChanges = unique(input.main_changes ?? input.mainChanges ?? []);
  const activeScopes = unique(input.active_scopes ?? input.activeScopes ?? []);
  const ownerTokens = unique(input.owner_tokens ?? input.ownerTokens ?? []).map((token) => token.toLowerCase());
  const globalScopes = unique([
    ...DEFAULT_GLOBAL_SCOPES,
    ...(input.global_scopes ?? input.globalScopes ?? []),
  ]);
  const behindTotal = Number.isFinite(Number(input.behind_total ?? input.behindTotal))
    ? Number(input.behind_total ?? input.behindTotal)
    : 0;

  const matches = [];
  const touchingActive = new Set();

  for (const changedPath of mainChanges) {
    const activeScope = activeScopes.find((scope) => matchesScope(changedPath, scope));
    if (activeScope) {
      touchingActive.add(changedPath);
      matches.push({ path: changedPath, reason: "MAIN_DELTA_TOUCHES_ACTIVE_SCOPE", scope: activeScope });
    }

    const globalScope = globalScopes.find((scope) => matchesScope(changedPath, scope));
    if (globalScope) {
      matches.push({ path: changedPath, reason: "MAIN_DELTA_TOUCHES_CONTRACT_GATE_RUNNER_DEPENDENCY", scope: globalScope });
    }

    const ownerToken = ownerTokens.find((token) => changedPath.toLowerCase().includes(token));
    if (ownerToken) {
      touchingActive.add(changedPath);
      matches.push({ path: changedPath, reason: "MAIN_DELTA_TOUCHES_OWNER", token: ownerToken });
    }
  }

  const mainAdvanced = behindTotal > 0 || mainChanges.length > 0;
  const materialToActiveScope = matches.length > 0;

  let status = "NO_DRIFT";
  let action = "CONTINUE_PREVIOUS_FLOW";

  if (mainAdvanced && mainChanges.length === 0) {
    status = "UNKNOWN_DRIFT";
    action = "MEASURE_NOT_PASS";
  } else if (materialToActiveScope) {
    status = "MATERIAL_DRIFT";
    action = "RECONCILE_OR_REMEASURE";
  } else if (mainAdvanced) {
    status = "UNRELATED_DRIFT";
    action = "IGNORE_AND_CONTINUE_PREVIOUS_FLOW";
  }

  return {
    schema: "centraldark.material-drift-classifier.v1",
    status,
    action,
    main_advanced: mainAdvanced,
    behind_total: behindTotal,
    behind_touching_active_scope: touchingActive.size,
    material_to_active_scope: materialToActiveScope,
    matches,
    rules: RULES,
  };
}

function runSelfTest() {
  assert.equal(
    classifyMaterialDrift({
      behind_total: 8,
      main_changes: ["docs/notion-report.md"],
      active_scopes: ["apps/modulos/Bolt/source"],
      owner_tokens: ["electron", "checker"],
    }).status,
    "UNRELATED_DRIFT",
  );

  assert.equal(
    classifyMaterialDrift({
      behind_total: 1,
      main_changes: ["scripts/checker/run-all.sh"],
      active_scopes: ["apps/modulos/Bolt/source"],
    }).status,
    "MATERIAL_DRIFT",
  );

  const direct = classifyMaterialDrift({
    behind_total: 1,
    main_changes: ["apps/modulos/Bolt/source/src/App.tsx"],
    active_scopes: ["apps/modulos/Bolt/source"],
  });
  assert.equal(direct.status, "MATERIAL_DRIFT");
  assert.equal(direct.behind_touching_active_scope, 1);

  assert.equal(classifyMaterialDrift({ behind_total: 8 }).status, "UNKNOWN_DRIFT");
  assert.equal(classifyMaterialDrift({}).status, "NO_DRIFT");

  console.log("PASS material-drift-classifier self-test");
}

function printHelp() {
  console.log(`Usage:
  node scripts/checker/material-drift-classifier.mjs \\
    --behind-total 8 \\
    --main-change path/from/main \\
    --active-scope apps/modulos/Bolt/source \\
    --owner-token checker

The classifier fails closed: UNKNOWN_DRIFT is MEASURE_NOT_PASS, not PASS.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) printHelp();
  else if (args.self_test) runSelfTest();
  else console.log(JSON.stringify(classifyMaterialDrift(args), null, 2));
}
