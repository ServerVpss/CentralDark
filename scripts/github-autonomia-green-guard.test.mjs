import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_REQUIRED_WORKFLOWS,
  greenDecision,
  greenVerdicts,
  parseCsv,
  selectLatestNonSkipped,
} from "./github-autonomia-green-guard.mjs";

function success(name, number = 1) {
  return {
    id: number,
    name,
    run_number: number,
    status: "completed",
    conclusion: "success",
    head_sha: "a".repeat(40),
  };
}

test("só fica verde quando todos os gates obrigatórios passam", () => {
  const required = ["porta", "codex", "lupa"];
  const allGreen = required.map((name, index) => success(name, index + 1));
  assert.equal(greenDecision(allGreen, required).green, true);

  const missing = allGreen.slice(0, 2);
  const result = greenDecision(missing, required);
  assert.equal(result.green, false);
  assert.equal(result.verdicts.find((item) => item.name === "lupa")?.state, "MISSING");
});

test("pending, failure e cancelled nunca viram verde", () => {
  const required = ["gate"];
  for (const run of [
    { id: 1, name: "gate", run_number: 1, status: "queued", conclusion: null },
    { id: 2, name: "gate", run_number: 2, status: "completed", conclusion: "failure" },
    { id: 3, name: "gate", run_number: 3, status: "completed", conclusion: "cancelled" },
  ]) {
    assert.equal(greenDecision([run], required).green, false);
  }
});

test("skipped não substitui execução real; usa último não-skipped", () => {
  const runs = [
    { id: 3, name: "gate", run_number: 30, status: "completed", conclusion: "skipped" },
    { id: 2, name: "gate", run_number: 29, status: "completed", conclusion: "success" },
  ];
  assert.equal(selectLatestNonSkipped(runs, "gate")?.id, 2);
  assert.equal(greenDecision(runs, ["gate"]).green, true);
});

test("failure não é escondida por success antigo", () => {
  const verdicts = greenVerdicts([
    { id: 1, name: "gate", run_number: 10, status: "completed", conclusion: "success" },
    { id: 2, name: "gate", run_number: 11, status: "completed", conclusion: "failure" },
  ], ["gate"]);
  assert.deepEqual(verdicts, [{ name: "gate", state: "FAIL", run_id: 2, conclusion: "failure" }]);
});

test("lista padrão é exatamente a régua canônica de seis gates", () => {
  assert.deepEqual(DEFAULT_REQUIRED_WORKFLOWS, [
    "porta-de-entrada",
    "codex-validate",
    "lupa-conformance",
    "Lupa Drift Guard",
    "PR auto-review (Codex + checklist)",
    "Pipeline — Telegram + Painel",
  ]);
  assert.deepEqual(parseCsv("a,b"), ["a", "b"]);
});
