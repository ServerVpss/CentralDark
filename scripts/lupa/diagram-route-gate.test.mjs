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
