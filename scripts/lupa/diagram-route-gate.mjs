#!/usr/bin/env node
/*
 * #OBSERVACOES# | CENTRALDARK.FLOW.REGISTRY.DOC_SYNC
 * @owner: scripts/lupa/diagram-route-gate.mjs
 * @doc_ref: docs/CONSCIENCIA/METACOGNICAO-OPERACIONAL.md
 * @last_updated: 2026-10-16T10:18:38.112Z
 * @scope: gate existente; incremental sobre arquivos alterados, sem varredura destrutiva.
 * @status: CODE_GATE_IMPLEMENTED; GLOBAL_ENFORCEMENT_PENDING_MAIN_AND_CI
 * @next_cursor: validar gate e contraprova no HEAD/branch protection.
 */
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

export function validateDiffCoverage(registry, units, codeDocContext = null) {
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

  // #OBSERVACOES# | RASTRO OBRIGATORIO, CODIGO + DOCUMENTACAO NO MESMO DELTA
  // Escopo incremental: arquivos de codigo/config modificados neste diff.
  // JSON não aceita comentários: @code_ref + data vivem no documento ligado.
  if (codeDocContext) {
    const changes = Array.isArray(codeDocContext.changes) ? codeDocContext.changes : [];
    const readAt = codeDocContext.readAt;
    const modified = new Set(changes.filter((item) => !String(item.status).startsWith("D")).map((item) => normalizePath(item.path)));
    const executable = /\.(?:js|jsx|mjs|cjs|ts|tsx|css|scss|html|py|sh|bash|go|rs|java|sql|yml|yaml|toml|json)$/i;
    const noInlineComments = /\.json$/i;
    const stamp = /@last_updated:\s*(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/;
    const scopes = /^(?:apps\/|src\/|scripts\/|\.github\/(?:workflows|actions)\/|\.agents\/skills\/|[^/]+\.(?:mjs|js|ts|py|sh|json|yml|yaml)$)/;
    const generated = /(?:^|\/)(?:node_modules|dist|build|coverage|vendor|\.next|\.turbo|generated)(?:\/|$)/;
    for (const item of changes) {
      const source = normalizePath(item.path);
      if (!executable.test(source) || !scopes.test(source) || generated.test(source)) continue;
      const head = String(item.status).startsWith("D") ? null : readAt("head", source);
      const old = readAt("base", normalizePath(item.oldPath || source)) ?? "";
      if (head === null) {
        // Arquivo excluido ainda exige documentar a retirada com proveniencia.
        const docUpdated = changes.some((entry) => {
          const docPath = normalizePath(entry.path);
          return /^docs\/.*\.md$/i.test(docPath) &&
            !String(entry.status).startsWith("D") &&
            String(readAt("head", docPath) || "").includes("@code_ref: " + source) &&
            String(readAt("head", docPath) || "").includes("@removed: true");
        });
        if (!docUpdated) errors.push("CODE_DELETED_WITHOUT_DOC_TRACE:" + source);
        continue;
      }
      let docPath = "";
      if (!noInlineComments.test(source)) {
        const header = String(head).split(/\r?\n/).slice(0, 65).join("\n");
        if (!header.includes("#OBSERVACOES#")) errors.push("CODE_TRACE_MISSING:" + source);
        if (!/@owner:\s*\S+/.test(header)) errors.push("CODE_OWNER_MISSING:" + source);
        const ref = header.match(/@doc_ref:\s*([^\s*]+)/);
        docPath = normalizePath(ref?.[1] || "");
        if (!docPath || !/^docs\/.*\.md$/i.test(docPath)) errors.push("CODE_DOC_REF_MISSING:" + source);
        const currentStamp = header.match(stamp)?.[1];
        const previousStamp = String(old).slice(0, 5500).match(stamp)?.[1];
        if (!currentStamp || !Number.isFinite(Date.parse(currentStamp))) errors.push("CODE_TIMESTAMP_INVALID:" + source);
        else if (currentStamp === previousStamp) errors.push("CODE_TIMESTAMP_NOT_UPDATED:" + source);
      } else {
        // Formato JSON sem comentarios: encontrar documento canônico que mapeia o codigo.
        docPath = [...modified].filter((p) => /^docs\/.*\.md$/i.test(p)).find((p) =>
          String(readAt("head", p) || "").includes("@code_ref: " + source)
        ) || "";
        if (!docPath) errors.push("JSON_CODE_TRACE_DOC_MISSING:" + source);
      }
      if (!docPath || !modified.has(docPath)) {
        errors.push("CODE_DOC_NOT_UPDATED_IN_SAME_DIFF:" + source + ":" + (docPath || "MISSING_DOC"));
        continue;
      }
      const currentDoc = String(readAt("head", docPath) || "");
      const priorDoc = String(readAt("base", docPath) || "");
      if (!currentDoc.includes("@code_ref: " + source)) errors.push("DOC_CODE_LINK_MISSING:" + docPath + ":" + source);
      const docStamp = currentDoc.match(stamp)?.[1];
      if (!docStamp || !Number.isFinite(Date.parse(docStamp))) errors.push("DOC_TIMESTAMP_INVALID:" + docPath);
      else if (docStamp === priorDoc.match(stamp)?.[1]) errors.push("DOC_TIMESTAMP_NOT_UPDATED:" + docPath);
      if (currentDoc.replace(/@last_updated:\s*\d{4}-[^\s*]+/g, "@last_updated: [timestamp]") ===
          priorDoc.replace(/@last_updated:\s*\d{4}-[^\s*]+/g, "@last_updated: [timestamp]")) {
        errors.push("DOC_CONTENT_NOT_UPDATED:" + docPath);
      }
    }
  }
  return errors;
}

// ---------------------------------------------------------------------------
// 🪬 TRAVA DE PRESERVAÇÃO MERMAID — intenção do CHEFE não pode ser apagada
// ---------------------------------------------------------------------------
// Origem: commit bb60b2d (2026-10-08). Um agente reestruturou o Mermaid do
// MAPA-DO-CEREBRO.md (apagou o nó OS e as setas IS-->OS, OS<-->HUD,
// OS<-->CASA) quando a ordem era ADAPTAR o mesmo desenho. O gate passava
// porque só olhava ARCHITECTURE.mmd. Agora:
//   ADICIONAR nó/seta            → livre (delta aditivo)
//   APAGAR nó/subgraph/seta      → BLOQUEIA
//   TROCAR texto de nó existente → BLOQUEIA
//   APAGAR arquivo com Mermaid   → BLOQUEIA
// Liberação SOMENTE item a item, nunca curinga:
//   a) PR com label "👑 PERMITO-SEGREDO" (autoridade humana autenticada), ou
//   b) linha no commit, copiando EXATAMENTE o código que o gate imprimiu:
//      Mermaid-Autorizado: MERMAID_NODE_REMOVED:docs/x.md:OS
// MERMAID_DELETE_REQUIRES_EXPLICIT_ITEM=true · ADDITIVE_DELTA_IS_FREE=true
export const MERMAID_AUTH_TRAILER = "Mermaid-Autorizado";

const MERMAID_SKIP =
  /^(?:flowchart|graph|direction|classDef|class|style|linkStyle|click|end|subgraph)\b/;
const EDGE_OP =
  /(<?(?:-{2,}|={2,}|-\.+-)(?:>|o|x)?|~~~)/;

function stripQuoted(line) {
  const quoted = [];
  const text = line.replace(/"(?:[^"\\]|\\.)*"/g, (m) => {
    quoted.push(m.slice(1, -1));
    return "\u0000" + (quoted.length - 1) + "\u0000";
  });
  return { text, restore: (v) => v.replace(/\u0000(\d+)\u0000/g, (_, i) => quoted[Number(i)]) };
}

function normalizeOp(op) {
  const left = op.startsWith("<") ? "<" : "";
  const body = op.replace(/^</, "");
  const head = /[>ox]$/.test(body) ? body.slice(-1) : "";
  const shaft = body.includes("=") ? "==" : body.includes(".") ? "-.-" : body === "~~~" ? "~~~" : "--";
  return left + shaft + head;
}

const NODE_SHAPE =
  /([A-Za-z0-9_][\w.-]*)\s*(\(\(\(.*?\)\)\)|\(\(.*?\)\)|\(\[.*?\]\)|\[\[.*?\]\]|\[\(.*?\)\]|\[\/.*?[\/\\]\]|\[\\.*?[\/\\]\]|\[.*?\]|\(.*?\)|\{\{.*?\}\}|\{.*?\}|>.*?\])/g;

function labelOf(shape, restore) {
  return restore(shape.replace(/^[\[\(\{>\/\\]+|[\]\)\}\/\\]+$/g, ""))
    .replace(/\s+/g, " ")
    .trim();
}

export function parseMermaid(source) {
  const nodes = new Map();
  const edges = new Set();
  const subgraphs = new Set();
  for (const raw of String(source).split(/\r?\n/)) {
    let line = raw.replace(/%%.*$/, "").trim();
    if (!line) continue;
    const { text, restore } = stripQuoted(line);
    line = text;
    const sub = line.match(/^subgraph\s+([A-Za-z0-9_][\w.-]*)/);
    if (sub) {
      subgraphs.add(sub[1]);
      continue;
    }
    if (MERMAID_SKIP.test(line)) continue;
    // remove rótulos de seta: -->|txt| e  -- txt -->
    line = line.replace(/\|[^|]*\|/g, " ");
    line = line.replace(/(<?)(--|==|-\.)\s+[^\s>=.-][^>]*?\s+(-{2,}>|={2,}>|\.+->|-{3,}|={3,})/g, (_, l, _a, r) => " " + l + r + " ");
    // registra definições de nó e troca pelo id
    line = line.replace(NODE_SHAPE, (_, id, shape) => {
      nodes.set(id, labelOf(shape, restore));
      return " " + id + " ";
    });
    const parts = line.split(EDGE_OP).map((p) => p.trim());
    if (parts.length < 3) {
      for (const id of parts[0].split("&").map((v) => v.trim())) {
        if (/^[A-Za-z0-9_][\w.-]*$/.test(id) && !nodes.has(id)) nodes.set(id, "");
      }
      continue;
    }
    for (let i = 0; i + 2 < parts.length; i += 2) {
      const froms = parts[i].split("&").map((v) => v.trim()).filter(Boolean);
      const tos = parts[i + 2].split("&").map((v) => v.trim()).filter(Boolean);
      const op = normalizeOp(parts[i + 1]);
      for (const id of [...froms, ...tos]) {
        if (/^[A-Za-z0-9_][\w.-]*$/.test(id) && !nodes.has(id)) nodes.set(id, "");
      }
      for (const a of froms) for (const b of tos) edges.add(a + op + b);
    }
  }
  return { nodes, edges, subgraphs };
}

export function extractMermaidSource(file, text) {
  if (/\.mmd$/i.test(file)) return String(text || "");
  const blocks = [];
  const re = /^[ \t]*(```|~~~)[ \t]*mermaid[^\n]*\n([\s\S]*?)^[ \t]*\1[ \t]*$/gim;
  let m;
  while ((m = re.exec(String(text || "")))) blocks.push(m[2]);
  return blocks.join("\n");
}

export function compareMermaid(file, baseText, headText) {
  const errors = [];
  const before = parseMermaid(extractMermaidSource(file, baseText));
  if (before.nodes.size === 0 && before.edges.size === 0) return errors;
  if (headText === null) {
    errors.push("MERMAID_FILE_REMOVED:" + file);
    return errors;
  }
  const after = parseMermaid(extractMermaidSource(file, headText));
  for (const [id, label] of before.nodes) {
    if (!after.nodes.has(id)) {
      errors.push("MERMAID_NODE_REMOVED:" + file + ":" + id);
    } else if (label && after.nodes.get(id) && after.nodes.get(id) !== label) {
      errors.push("MERMAID_NODE_LABEL_CHANGED:" + file + ":" + id);
    }
  }
  for (const id of before.subgraphs) {
    if (!after.subgraphs.has(id)) errors.push("MERMAID_SUBGRAPH_REMOVED:" + file + ":" + id);
  }
  for (const edge of before.edges) {
    if (!after.edges.has(edge)) errors.push("MERMAID_EDGE_REMOVED:" + file + ":" + edge);
  }
  return errors;
}

export function authorizedMermaidItems(commitMessages) {
  const items = new Set();
  const re = new RegExp("^" + MERMAID_AUTH_TRAILER + ":\\s*(MERMAID_[A-Z_]+:\\S.*?)\\s*$", "gm");
  let m;
  while ((m = re.exec(String(commitMessages || "")))) items.add(m[1]);
  return items;
}

export function applyMermaidAuthorization(errors, { authorizedItems = new Set(), humanApproved = false } = {}) {
  if (humanApproved) return [];
  return errors.filter((code) => !authorizedItems.has(code));
}

function readEventApproval() {
  try {
    const p = process.env.GITHUB_EVENT_PATH;
    if (!p) return false;
    const event = JSON.parse(fs.readFileSync(p, "utf8"));
    return (event.pull_request?.labels || []).some((label) => {
      const name = String(label?.name || label || "").trim().toLocaleLowerCase("pt-BR");
      return name === "👑 permito-segredo" || name === "permito-segredo";
    });
  } catch {
    return false;
  }
}

function showAt(ref, file) {
  try {
    return execFileSync("git", ["show", ref + ":" + file], {
      cwd: REPO,
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return null;
  }
}

export function validateMermaidPreservation(baseRef, headRef, { humanApproved = readEventApproval() } = {}) {
  let status = "";
  try {
    status = git(["diff", "--name-status", "-M", "--no-ext-diff", baseRef, headRef, "--"]);
  } catch {
    return ["MERMAID_PRESERVATION_DIFF_UNKNOWN:" + baseRef + ".." + headRef];
  }
  const raw = [];
  for (const line of status.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const [code, a, b] = line.split("\t");
    const oldPath = normalizePath(a);
    const newPath = normalizePath(b || a);
    if (!/\.(?:md|mmd)$/i.test(oldPath)) continue;
    if (code.startsWith("A")) continue;
    const baseText = showAt(baseRef, oldPath);
    if (baseText === null) continue;
    if (!/\.mmd$/i.test(oldPath) && !/mermaid/i.test(baseText)) continue;
    const headText = code.startsWith("D") ? null : showAt(headRef, newPath);
    raw.push(...compareMermaid(oldPath, baseText, headText));
  }
  if (raw.length === 0) return [];
  let messages = "";
  try {
    messages = git(["log", "--format=%B", baseRef + ".." + headRef]);
  } catch {
    messages = "";
  }
  return applyMermaidAuthorization(raw, {
    authorizedItems: authorizedMermaidItems(messages),
    humanApproved,
  });
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

  const changes = git(["diff", "--name-status", "-M", baseRef, headRef, "--"])
    .split(/\r?\n/).filter(Boolean)
    .map((line) => {
      const [status, first, second] = line.split("\t");
      return { status, oldPath: second ? first : undefined, path: second || first };
    });
  const errors = [
    ...validateRegistry(registry, baseRegistry),
    ...validateDiagram(registry, diagram),
    ...validateTriggerCoverage(registry, triggerText),
    ...validateDiffCoverage(registry, units, {
      changes,
      readAt: (ref, file) => showAt(ref === "base" ? baseRef : headRef, file),
    }),
    ...validateMermaidPreservation(baseRef, headRef),
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
