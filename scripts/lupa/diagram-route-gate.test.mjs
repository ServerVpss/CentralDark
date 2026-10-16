/*
 * #OBSERVACOES# | CENTRALDARK.FLOW.REGISTRY.DOC_SYNC_TESTS
 * @owner: scripts/lupa/diagram-route-gate.test.mjs
 * @doc_ref: docs/CONSCIENCIA/METACOGNICAO-OPERACIONAL.md
 * @last_updated: 2026-10-16T10:18:38.112Z
 * @status: NEGATIVE_AND_POSITIVE_TESTS_ADDED; CI_PENDING
 * @next_cursor: node --test scripts/lupa/diagram-route-gate.test.mjs
 */
import assert from "node:assert/strict";
import test from "node:test";
import {
  detectAddedUnits,
  extractTriggerSymbols,
  validateDiagram,
  validateDiffCoverage,
  validateRegistry,
  validateTriggerCoverage,
} from "./diagram-route-gate.mjs";

function flow(overrides = {}) {
  return {
    id: "flow-a",
    kind: "FUNCTION",
    capability: "CAP",
    boundary: "BOUNDARY",
    source: "apps/x/a.js",
    symbol: "run",
    activation: "CALL",
    from: "A",
    to: "B",
    owner: "apps/x/",
    canonical_route: "route-a",
    status: "ACTIVE_EXISTING_ROUTE",
    evidence_ref: "test",
    ...overrides,
  };
}

test("registro e seta do diagrama formam cobertura mínima", () => {
  const registry = { schema: "centraldark.flow-registry.v1", flows: [flow()] };
  assert.deepEqual(validateRegistry(registry), []);
  assert.deepEqual(
    validateDiagram(registry, "%% CD_FLOW:flow-a\nA -->|CALL| B\n"),
    [],
  );
});

test("rota provada precisa ser reutilizada, não clonada", () => {
  const base = { schema: "centraldark.flow-registry.v1", flows: [flow()] };
  const current = {
    schema: "centraldark.flow-registry.v1",
    flows: [
      flow(),
      flow({
        id: "flow-b",
        symbol: "run2",
        canonical_route: "route-b",
        bootstrap: false,
      }),
    ],
  };
  assert.match(
    validateRegistry(current, base).join("\n"),
    /PROVEN_ROUTE_EXISTS_REUSE_REQUIRED/,
  );
});

test("rota nova sem anterior exige busca e contraprova", () => {
  const base = { schema: "centraldark.flow-registry.v1", flows: [] };
  const current = {
    schema: "centraldark.flow-registry.v1",
    flows: [
      flow({
        capability: "NEW_CAP",
        boundary: "NEW_BOUNDARY",
        bootstrap: false,
      }),
    ],
  };
  assert.match(
    validateRegistry(current, base).join("\n"),
    /NEW_ROUTE_WITHOUT_COUNTERPROOF/,
  );
});

test("função nova precisa existir no registry", () => {
  const units = detectAddedUnits(
    "apps/x/a.js",
    "export function run() {}\n",
  );
  assert.equal(units[0].kind, "FUNCTION");
  assert.deepEqual(validateDiffCoverage({ flows: [flow()] }, units), []);
});

test("botão novo exige data-cd-flow explícito", () => {
  const units = detectAddedUnits(
    "apps/x/ui.tsx",
    "<button onClick={go}>Vai</button>",
  );
  assert.match(
    validateDiffCoverage({ flows: [] }, units).join("\n"),
    /BUTTON_FLOW_ID_MISSING/,
  );
});

test("gatilho do owner precisa aparecer no registro", () => {
  const triggerText =
    'human_triggers:\n' +
    '  - id: ACORDAR\n' +
    '    token: "#ACORDAR"\n' +
    '    owner: "LEIA-ME-IA.md"\n';

  const registry = {
    schema: "centraldark.flow-registry.v1",
    flows: [
      flow({
        id: "trigger.human.ACORDAR",
        kind: "TRIGGER",
        capability: "TRIGGER:ACORDAR",
        boundary: "trigger-fabric",
        source:
          "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/TRIGGERS.yml",
        symbol: "ACORDAR",
        activation: "#ACORDAR",
        canonical_route: "LEIA-ME-IA.md",
      }),
    ],
  };

  assert.deepEqual(
    extractTriggerSymbols(triggerText).map((item) => item.symbol),
    ["ACORDAR"],
  );
  assert.deepEqual(validateTriggerCoverage(registry, triggerText), []);
});

// ---------------------------------------------------------------------------
// 🪬 TRAVA MERMAID — teste negativo com o ERRO REAL do commit bb60b2d
// ---------------------------------------------------------------------------
import {
  applyMermaidAuthorization,
  authorizedMermaidItems,
  compareMermaid,
  parseMermaid,
} from "./diagram-route-gate.mjs";

const MAPA = "docs/CONSCIENCIA/MAPA-DO-CEREBRO.md";

// Desenho aprovado pelo CHEFE (2a6a74a), byte a byte.
const ANTES_2A6A74A = [
  "```mermaid",
  "flowchart TB",
  '    IS["👑 CentralDark — Instinto Superior<br/>Autoridade única"]',
  '    OS["CentralDark Bridge · One Shot<br/>Um programa Windows + Tray no mesmo processo"]',
  "",
  '    subgraph CAMADA[" "]',
  "        direction LR",
  '        HUD["HUD + Obsidian<br/>Interface, logs, Grafo Vivo, conhecimento"]',
  '        CASA["Casa / Sensores<br/>Screenpipe, Tailscale, SSH, estado local"]',
  "        HUD <--> CASA",
  "    end",
  "",
  '    SERV["MCP CentralDark · Hermes · VPS · Supabase<br/>Rotas existentes de serviços, execução e dados"]',
  '    GIT["GitHub ServerVpss/CentralDark@main<br/>Código canônico, histórico e cadeados de contraprova"]',
  "",
  "    IS --> OS",
  "    OS <--> HUD",
  "    OS <--> CASA",
  "    HUD <--> SERV",
  "    CASA <--> SERV",
  "    SERV <--> GIT",
  "```",
].join("\n");

// O que o agente promoveu em bb60b2d: reestruturou em vez de adaptar.
const DEPOIS_BB60B2D = [
  "```mermaid",
  "flowchart TB",
  '    CHEFE["👑 CHEFE<br/>Intenção e autoridade"]',
  '    IS["🪬 CentralDark — Instinto Superior<br/>ÚNICA entrada e aplicativo visível"]',
  '    TRAY["Capacidade absorvida do One Shot<br/>Janela única ⇄ Tray ⇄ Restaurar<br/>MESMO PROCESSO"]',
  "",
  '    subgraph CAMADA[" "]',
  "        direction LR",
  '        HUD["HUD + Obsidian<br/>Interface, logs, Grafo Vivo, conhecimento"]',
  '        CASA["Casa / Sensores<br/>Screenpipe, Tailscale, SSH, estado local"]',
  "        HUD <--> CASA",
  "    end",
  "",
  '    SERV["MCP CentralDark · Hermes · VPS · Supabase<br/>Rotas existentes de serviços, execução e dados"]',
  '    GIT["GitHub ServerVpss/CentralDark@main<br/>Código canônico, histórico e cadeados de contraprova"]',
  "",
  "    CHEFE --> IS",
  "    IS --> TRAY",
  "    IS <--> HUD",
  "    IS <--> CASA",
  "    HUD <--> SERV",
  "    CASA <--> SERV",
  "    SERV <--> GIT",
  "```",
].join("\n");

test("parser lê nós, rótulos, subgraph e setas bidirecionais", () => {
  const g = parseMermaid(ANTES_2A6A74A.replace(/```\w*/g, ""));
  assert.ok(g.nodes.has("OS"));
  assert.ok(g.subgraphs.has("CAMADA"));
  assert.ok(g.edges.has("IS-->OS"));
  assert.ok(g.edges.has("OS<-->HUD"));
  assert.equal(g.nodes.get("IS"), "👑 CentralDark — Instinto Superior<br/>Autoridade única");
});

test("NEGATIVO: o erro real de bb60b2d é BLOQUEADO", () => {
  const errors = compareMermaid(MAPA, ANTES_2A6A74A, DEPOIS_BB60B2D);
  assert.deepEqual(errors.sort(), [
    `MERMAID_EDGE_REMOVED:${MAPA}:IS-->OS`,
    `MERMAID_EDGE_REMOVED:${MAPA}:OS<-->CASA`,
    `MERMAID_EDGE_REMOVED:${MAPA}:OS<-->HUD`,
    `MERMAID_NODE_LABEL_CHANGED:${MAPA}:IS`,
    `MERMAID_NODE_REMOVED:${MAPA}:OS`,
  ].sort());
});

test("POSITIVO: adaptar o MESMO desenho só somando nó/seta passa", () => {
  const adaptado = ANTES_2A6A74A.replace(
    "    IS --> OS",
    '    CHEFE["👑 CHEFE"]\n    CHEFE --> IS\n    IS --> OS',
  );
  assert.deepEqual(compareMermaid(MAPA, ANTES_2A6A74A, adaptado), []);
});

test("mudar só espaços ou tamanho da seta não é perda", () => {
  const ruido = ANTES_2A6A74A.replace("    IS --> OS", "IS ---> OS").replace("OS <--> HUD", "OS   <--->   HUD");
  assert.deepEqual(compareMermaid(MAPA, ANTES_2A6A74A, ruido), []);
});

test("trocar a direção da seta é perda de seta", () => {
  const virado = ANTES_2A6A74A.replace("    IS --> OS", "    OS --> IS");
  assert.deepEqual(compareMermaid(MAPA, ANTES_2A6A74A, virado), [
    `MERMAID_EDGE_REMOVED:${MAPA}:IS-->OS`,
  ]);
});

test("apagar arquivo com Mermaid é bloqueado", () => {
  assert.deepEqual(compareMermaid(MAPA, ANTES_2A6A74A, null), [
    `MERMAID_FILE_REMOVED:${MAPA}`,
  ]);
});

test("liberação é item a item: o que não foi declarado continua bloqueado", () => {
  const errors = compareMermaid(MAPA, ANTES_2A6A74A, DEPOIS_BB60B2D);
  const msg = [
    "docs(mapa): remove OS",
    "",
    `Mermaid-Autorizado: MERMAID_NODE_REMOVED:${MAPA}:OS`,
    "Mermaid-Autorizado: MERMAID_*",
  ].join("\n");
  const left = applyMermaidAuthorization(errors, { authorizedItems: authorizedMermaidItems(msg) });
  assert.equal(left.length, 4);
  assert.ok(!left.includes(`MERMAID_NODE_REMOVED:${MAPA}:OS`));
});

test("label 👑 PERMITO-SEGREDO (autoridade humana) libera o delta", () => {
  const errors = compareMermaid(MAPA, ANTES_2A6A74A, DEPOIS_BB60B2D);
  assert.deepEqual(applyMermaidAuthorization(errors, { humanApproved: true }), []);
});

/* #OBSERVACOES# | Protecao de sincronismo codigo↔documento. */
test("codigo tocado exige rastro inline e documento atualizado no mesmo delta", () => {
  const code = "apps/instinto-superior/src/feature.ts";
  const doc = "docs/CONSCIENCIA/METACOGNICAO-OPERACIONAL.md";
  const stamp = "2026-10-16T10:00:00.000Z";
  const source = `// #OBSERVACOES# 
// @owner: ${code}
// @doc_ref: ${doc}
// @last_updated: ${stamp}
export const label = "novo";`;
  const docText = `<!-- #OBSERVACOES# 
@last_updated: ${stamp}
@code_ref: ${code}
-->
Documentacao real atualizada.`;
  const lookup = {
    head: { [code]: source, [doc]: docText },
    base: { [code]: 'export const label = "antigo";', [doc]: "" }
  };
  const changes = [{ status: "M", path: code }, { status: "M", path: doc }];
  const readAt = (ref, file) => lookup[ref][file] ?? null;
  assert.deepEqual(validateDiffCoverage({ flows: [] }, [], { changes, readAt }), []);
  assert.match(validateDiffCoverage({ flows: [] }, [], {
    changes: changes.slice(0, 1), readAt
  }).join("\n"), /CODE_DOC_NOT_UPDATED_IN_SAME_DIFF/);
  assert.match(validateDiffCoverage({ flows: [] }, [], {
    changes, readAt: (ref, file) => ref === "head" && file === code
      ? "export const label = 'untracked';" : readAt(ref, file)
  }).join("\n"), /CODE_TRACE_MISSING/);
});

test("alteracao exige timestamp NOVO em codigo e doc + mudanca material no documento", () => {
  const code = "apps/ui/index.css", doc = "docs/ui.md";
  const oldStamp = "2026-10-15T10:00:00.000Z";
  const header = (date) => `/* #OBSERVACOES# @owner: ${code} @doc_ref: ${doc} @last_updated: ${date} */\nbody { color: red; }`;
  const docs = (date, text) => `<!-- #OBSERVACOES# @last_updated: ${date} @code_ref: ${code} -->\n${text}`;
  const readAt = (ref, path) => {
    if (path === code) return header(oldStamp);
    if (path === doc) return docs(oldStamp, ref === "head" ? "Mudou o texto" : "Texto antigo");
  };
  const errors = validateDiffCoverage({ flows: [] }, [], {
    changes: [{ status: "M", path: code }, { status: "M", path: doc }], readAt
  });
  assert.match(errors.join("\n"), /CODE_TIMESTAMP_NOT_UPDATED/);
  assert.match(errors.join("\n"), /DOC_TIMESTAMP_NOT_UPDATED/);
});

test("JSON exige rastro no documento, sem inserir comentarios invalidos no JSON", () => {
  const source = "apps/x/config.json", doc = "docs/config.md";
  const newDate = "2026-10-16T10:00:00.000Z";
  const changes = [{ status: "M", path: source }, { status: "M", path: doc }];
  const readAt = (ref, path) => path === source ? '{"enabled":true}' :
    ref === "head" ? `<!-- @code_ref: ${source} @last_updated: ${newDate} -->\nConfig nova` :
    "<!-- @code_ref: apps/x/config.json @last_updated: 2026-10-15T10:00:00.000Z -->\nConfig velha";
  assert.deepEqual(validateDiffCoverage({ flows: [] }, [], { changes, readAt }), []);
});
