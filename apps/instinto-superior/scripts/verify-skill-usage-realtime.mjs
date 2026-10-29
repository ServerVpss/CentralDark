// Contract tests for Supabase Realtime skill-usage aggregation.
// No external connections, no fabricated production event and no database writes.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const path = fileURLToPath(new URL("../src/lib/skill-usage-realtime.ts", import.meta.url));
const transpiled = ts.transpileModule(readFileSync(path, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const module = { exports: {} };
new Function("module", "exports", transpiled)(module, module.exports);
const { normalizeSkillUsageEvent, summarizeSkillUsage } = module.exports;
function event(receipt_id, skill_id = "centraldark-oracle-surface", outcome = "PASS") {
  return {
    area: "skill-usage",
    acao: "skill_invocation",
    ts: "2026-10-28T22:00:00.000Z",
    metadata: { verified: true, skill_id, receipt_id, source: "HermesDesktop", outcome },
  };
}

test("contador não inventa uso quando não há eventos", () => {
  assert.deepEqual(summarizeSkillUsage([]), { records: [], invalid: 0, repeated: 0 });
});
test("conta invocações verificadas por skill e resultado", () => {
  const s = summarizeSkillUsage([
    event("rec_1"),
    event("rec_2", "centraldark-oracle-surface", "FAIL"),
    event("rec_3", "centraldark-operational-method", "BLOCKED"),
  ]);
  assert.equal(s.records.length, 2);
  assert.deepEqual(s.records[0].skill, "centraldark-oracle-surface");
  assert.equal(s.records[0].executions, 2);
  assert.equal(s.records[0].pass, 1);
  assert.equal(s.records[0].fail, 1);
  assert.equal(s.records[1].blocked, 1);
});
test("deduplica receipt_id sem inflar resultados", () => {
  const s = summarizeSkillUsage([event("same"), event("same")]);
  assert.equal(s.records[0].executions, 1);
  assert.equal(s.repeated, 1);
});
test("ignora skill carregada, evento não comprovado ou metadata incompleto", () => {
  const loaded = { ...event("loaded"), acao: "skill_load" };
  const unchecked = event("unchecked");
  unchecked.metadata.verified = false;
  const missing = event("");
  const s = summarizeSkillUsage([loaded, unchecked, missing]);
  assert.equal(s.records.length, 0);
  assert.equal(s.invalid, 3);
  assert.equal(normalizeSkillUsageEvent(loaded), null);
});

function activation(receipt_id, skill_id = "centraldark-oracle-surface", use_count = 1) {
  return {
    area: "skill-usage",
    acao: "skill_loaded",
    ts: "2026-10-28T22:00:00.000Z",
    metadata: {
      verified: true,
      skill_id,
      receipt_id,
      source: "HermesNativeSkillLifecycle",
      use_count,
      kind: "SKILL_CONTEXT_ACTIVATION_NOT_TASK_EXECUTION",
    },
  };
}
test("ativação nativa conta separadamente de execução concluída", () => {
  const s = summarizeSkillUsage([activation("native_1"), event("terminal_1")]);
  assert.equal(s.records.length, 1);
  assert.equal(s.records[0].activations, 1);
  assert.equal(s.records[0].executions, 1);
  assert.equal(s.records[0].pass, 1);
});
test("ativação isolada não vira PASS nem execução", () => {
  const s = summarizeSkillUsage([activation("native_2")]);
  assert.equal(s.records[0].activations, 1);
  assert.equal(s.records[0].executions, 0);
  assert.equal(s.records[0].pass, 0);
});
test("deduplica entregas repetidas da mesma ativação", () => {
  const s = summarizeSkillUsage([activation("native_3"), activation("native_3")]);
  assert.equal(s.records[0].activations, 1);
  assert.equal(s.repeated, 1);
});
test("evento de ativação falsificado ou incompleto não entra no ranking", () => {
  const wrongSource = activation("native_4");
  wrongSource.metadata.source = "BrowserText";
  const wrongCount = activation("native_5", "centraldark-oracle-surface", -1);
  const s = summarizeSkillUsage([wrongSource, wrongCount]);
  assert.equal(s.records.length, 0);
  assert.equal(s.invalid, 2);
});
