#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "../..");
const REGISTRY_PATH = "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/FLOW-REGISTRY.json";
const DIAGRAM_PATH = "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/ARCHITECTURE.mmd";
const TRIGGERS_PATH = "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/TRIGGERS.yml";

export function normalizePath(value) {
  return String(value || "").replaceAll("\\", "/").replace(/^\.\//, "");
}

export function git(args, options = {}) {
  return execFileSync("git", args, {
    cwd: REPO,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  }).trim();
}

export function gitOk(args) {
  try {
    execFileSync("git", args, { cwd: REPO, stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

export function loadRegistry(text = null) {
  return JSON.parse(
    text === null
      ? fs.readFileSync(path.join(REPO, REGISTRY_PATH), "utf8")
      : text,
  );
}

export function readBaseRegistry(baseRef) {
  try {
    return loadRegistry(git(["show", baseRef + ":" + REGISTRY_PATH]));
  } catch {
    return null;
  }
}

export function extractTriggerSymbols(text) {
  const symbols = [];
  let section = null;
  for (const raw of String(text).split(/\r?\n/)) {
    const sec = raw.match(/^([a-z_]+_triggers):\s*$/);
    if (sec) {
      section = sec[1];
      continue;
    }
    const item = raw.match(/^\s{2}-\s+(?:id|event):\s*"?([^"\n]+?)"?\s*$/);
    if (item && section) symbols.push({ section, symbol: item[1].trim() });
  }
  return symbols;
}

export function validateRegistry(registry, baseRegistry = null) {
  const errors = [];
  if (registry?.schema !== "centraldark.flow-registry.v1") {
    errors.push("FLOW_REGISTRY_SCHEMA_INVALID");
  }

  const flows = Array.isArray(registry?.flows) ? registry.flows : [];
  const byId = new Map();
  const oldById = new Map(
    (baseRegistry?.flows || []).map((flow) => [flow.id, flow]),
  );
  const required = [
    "id",
    "kind",
    "capability",
    "boundary",
    "source",
    "symbol",
    "activation",
    "from",
    "to",
    "owner",
    "canonical_route",
    "status",
    "evidence_ref",
  ];

  for (const flow of flows) {
    for (const field of required) {
      if (!String(flow?.[field] ?? "").trim()) {
        errors.push("FLOW_FIELD_MISSING:" + (flow?.id || "NO_ID") + ":" + field);
      }
    }
    if (byId.has(flow.id)) errors.push("FLOW_ID_DUPLICATE:" + flow.id);
    byId.set(flow.id, flow);

    const isNew = !oldById.has(flow.id);
    if (baseRegistry && isNew && flow.bootstrap === true) {
      errors.push("FLOW_BOOTSTRAP_FORBIDDEN_AFTER_BASELINE:" + flow.id);
    }
  }

  for (const flow of flows) {
    const isNew = !oldById.has(flow.id);
    if (!baseRegistry || !isNew) continue;

    const oldPeers = [...oldById.values()].filter(
      (candidate) =>
        candidate.capability === flow.capability &&
        candidate.boundary === flow.boundary &&
        candidate.id !== flow.id,
    );

    if (oldPeers.length > 0) {
      const reused = oldPeers.find((candidate) => candidate.id === flow.reuse_of);
      if (!reused) {
        errors.push("PROVEN_ROUTE_EXISTS_REUSE_REQUIRED:" + flow.id);
      } else if (flow.canonical_route !== reused.canonical_route) {
        errors.push("REUSE_ROUTE_DRIFT:" + flow.id);
      }
    } else if (!flow.reuse_of) {
      const proof = flow.new_route_proof;
      if (
        !proof?.searched_existing_routes ||
        !proof?.counterproof_no_match ||
        !proof?.evidence_ref
      ) {
        errors.push("NEW_ROUTE_WITHOUT_COUNTERPROOF:" + flow.id);
      }
    }
  }

  return errors;
}

export function validateDiagram(registry, diagramText) {
  const errors = [];
  for (const flow of registry.flows || []) {
    const marker = "%% CD_FLOW:" + flow.id;
    const at = diagramText.indexOf(marker);
    if (at < 0) {
      errors.push("DIAGRAM_EDGE_MISSING:" + flow.id);
      continue;
    }
    const tail = diagramText
      .slice(at + marker.length)
      .split(/\r?\n/)
      .slice(0, 3)
      .join("\n");
    if (!/(-->|-.->|==>)/.test(tail)) {
      errors.push("DIAGRAM_ARROW_MISSING:" + flow.id);
    }
  }
  return errors;
}

export function detectAddedUnits(file, addedText) {
  const units = [];
  const source = normalizePath(file);
  const operational =
    source.startsWith("apps/") ||
    source.startsWith("scripts/") ||
    source.startsWith(".agents/skills/") ||
    source.startsWith(".github/workflows/") ||
    source === TRIGGERS_PATH;

  if (!operational) return units;
  if (
    /(?:^|\/)(?:test|tests|__tests__)\//i.test(source) ||
    /\.(?:test|spec)\.[^.]+$/i.test(source)
  ) {
    return units;
  }
  if (source === REGISTRY_PATH || source === DIAGRAM_PATH) return units;

  const lines = String(addedText).split(/\r?\n/);

  for (const line of lines) {
    let match = line.match(
      /\b(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/,
    );
    if (match) units.push({ kind: "FUNCTION", source, symbol: match[1] });

    match = line.match(
      /\b(?:export\s+)?(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>/,
    );
    if (match) units.push({ kind: "FUNCTION", source, symbol: match[1] });

    match = line.match(
      /\b(?:app|router)\.(get|post|put|patch|delete|use)\s*\(\s*["']([^"']+)["']/,
    );
    if (match) {
      units.push({
        kind: "ROUTE",
        source,
        symbol: match[1].toUpperCase() + " " + match[2],
      });
    }

    match = line.match(/addEventListener\s*\(\s*["']([^"']+)["']/);
    if (match) units.push({ kind: "HOOK", source, symbol: match[1] });

    match = line.match(/^\s*-\s*event:\s*"?([^"]+?)"?\s*$/);
    if (match) {
      units.push({ kind: "TRIGGER", source, symbol: match[1].trim() });
    }
  }

  const buttonRe = /<(?:button|Button)\b[^>]*>/g;
  for (const button of String(addedText).match(buttonRe) || []) {
    const id = button.match(/data-cd-flow\s*=\s*["']([^"']+)["']/)?.[1];
    units.push(
      id
        ? { kind: "BUTTON", source, symbol: id, explicit_id: id }
        : {
            kind: "BUTTON",
            source,
            symbol: "MISSING_DATA_CD_FLOW",
            missing_explicit_id: true,
          },
    );
  }

  if (/^apps\/.+\/package\.json$/i.test(source)) {
    const name = String(addedText).match(/"name"\s*:\s*"([^"]+)"/)?.[1];
    if (name) units.push({ kind: "APP", source, symbol: name });
  }

  if (/^\.agents\/skills\/[^/]+\/SKILL\.md$/i.test(source)) {
    units.push({ kind: "SKILL", source, symbol: source.split("/")[2] });
  }

  const agent = source.match(
    /^apps\/modulos\/HERMES-CORE\/agents\/([^/]+)\/agent\.[^.]+$/i,
  );
  if (agent) units.push({ kind: "AGENT", source, symbol: agent[1] });

  if (/^\.github\/workflows\/[^/]+\.ya?ml$/i.test(source)) {
    const workflowName = String(addedText).match(
      /^name:\s*["']?([^"'\n]+)["']?\s*$/m,
    )?.[1];
    if (workflowName) {
      units.push({ kind: "WORKFLOW", source, symbol: workflowName.trim() });
    }

    const excluded = new Set([
      "name",
      "on",
      "permissions",
      "concurrency",
      "env",
      "jobs",
    ]);
    for (const line of lines) {
      const job = line.match(/^  ([A-Za-z0-9_-]+):\s*$/);
      if (job && !excluded.has(job[1])) {
        units.push({ kind: "JOB", source, symbol: job[1] });
      }
    }
  }

  const seen = new Set();
  return units.filter((unit) => {
    const key = unit.kind + "|" + unit.source + "|" + unit.symbol;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function collectAddedLines(baseRef, headRef) {
  const diff = git([
    "diff",
    "--unified=0",
    "--no-ext-diff",
    baseRef,
    headRef,
    "--",
  ]);
  const byFile = new Map();
  let file = null;

  for (const line of diff.split(/\r?\n/)) {
    const header = line.match(/^\+\+\+ b\/(.+)$/);
    if (header) {
      file = normalizePath(header[1]);
      if (!byFile.has(file)) byFile.set(file, []);
      continue;
    }
    if (!file || line.startsWith("+++")) continue;
    if (line.startsWith("+")) byFile.get(file).push(line.slice(1));
  }

  return [...byFile.entries()].map(([source, lines]) => ({
    source,
    text: lines.join("\n"),
  }));
}

export function effectiveBase(registry, requestedBase, headRef) {
  const baseline = registry?.enforcement?.baseline_sha;
  if (!/^[0-9a-f]{40}$/i.test(String(baseline || ""))) return requestedBase;

  if (
    gitOk(["merge-base", "--is-ancestor", requestedBase, baseline]) &&
    gitOk(["merge-base", "--is-ancestor", baseline, headRef])
  ) {
    return baseline;
  }
  return requestedBase;
}

export function validateTriggerCoverage(registry, triggerText) {
  const errors = [];
  const triggerFlows = new Set(
    (registry.flows || [])
      .filter(
        (flow) =>
          flow.kind === "TRIGGER" && flow.source === TRIGGERS_PATH,
      )
      .map((flow) => flow.symbol),
  );

  for (const item of extractTriggerSymbols(triggerText)) {
    if (!triggerFlows.has(item.symbol)) {
      errors.push(
        "TRIGGER_NOT_DIAGRAMMED:" + item.section + ":" + item.symbol,
      );
    }
  }
  return errors;
}

export function validateDiffCoverage(registry, units) {
  const errors = [];

  for (const unit of units) {
    if (unit.missing_explicit_id) {
      errors.push("BUTTON_FLOW_ID_MISSING:" + unit.source);
      continue;
    }

    const found = unit.explicit_id
      ? (registry.flows || []).some((flow) => flow.id === unit.explicit_id)
      : (registry.flows || []).some(
          (flow) =>
            flow.source === unit.source &&
            flow.symbol === unit.symbol &&
            flow.kind === unit.kind,
        );

    if (!found) {
      errors.push(
        "MATERIAL_FLOW_NOT_REGISTERED:" +
          unit.kind +
          ":" +
          unit.source +
          ":" +
          unit.symbol,
      );
    }
  }

  return errors;
}

export function runGate({ baseRef, headRef }) {
  const registry = loadRegistry();
  const base = effectiveBase(registry, baseRef, headRef);
  const baseRegistry = readBaseRegistry(base);
  const diagram = fs.readFileSync(path.join(REPO, DIAGRAM_PATH), "utf8");
  const triggerText = fs.readFileSync(path.join(REPO, TRIGGERS_PATH), "utf8");

  const units = collectAddedLines(base, headRef).flatMap(({ source, text }) =>
    detectAddedUnits(source, text),
  );

  const errors = [
    ...validateRegistry(registry, baseRegistry),
    ...validateDiagram(registry, diagram),
    ...validateTriggerCoverage(registry, triggerText),
    ...validateDiffCoverage(registry, units),
  ];

  return {
    ok: errors.length === 0,
    base_ref: base,
    head_ref: headRef,
    material_units: units,
    errors,
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  function arg(name, fallback) {
    const index = process.argv.indexOf(name);
    return index >= 0 ? process.argv[index + 1] : fallback;
  }

  const report = runGate({
    baseRef: arg("--base-ref", "HEAD^"),
    headRef: arg("--head-ref", "HEAD"),
  });

  console.log(JSON.stringify(report, null, 2));
  if (!report.ok) process.exit(1);
  console.log("DIAGRAM_ROUTE_GATE=PASS");
}
