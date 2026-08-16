import assert from "node:assert/strict";
import test from "node:test";

import { canonicalLabels } from "./github.js";

test("MCP normaliza aliases GitHub para o catálogo canônico", () => {
  assert.deepEqual(
    canonicalLabels(["bug", "P1", "assign:grok"]),
    ["🐞 BUG", "🔴 PRIORIDADE-ALTA", "🧠 AGENTE-GROK"],
  );
});

test("MCP normaliza autoridade textual/visual sem promover PIVETE", () => {
  assert.deepEqual(canonicalLabels(["PERMITO-SEGREDO"]), ["👑 PERMITO-SEGREDO"]);
  assert.deepEqual(canonicalLabels(["👑 permito-segredo"]), ["👑 PERMITO-SEGREDO"]);
  assert.deepEqual(canonicalLabels(["permito-pivete"]), []);
});

test("MCP deduplica destinos canônicos", () => {
  assert.deepEqual(
    canonicalLabels(["bug", "BUG", "🐞 BUG"]),
    ["🐞 BUG"],
  );
});

test("MCP descarta assign desconhecido em vez de inventar agente", () => {
  assert.deepEqual(canonicalLabels(["assign:model-futuro"]), []);
});
