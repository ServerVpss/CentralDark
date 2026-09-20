import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_REQUIRED_WORKFLOWS,
  greenDecision,
  greenVerdicts,
  parseCsv,
  runBelongsToPullHead,
  runsForPullHead,
  selectLatestRun,
  shouldEnforceGreenFirst,
} from "./github-autonomia-green-guard.mjs";

const HEAD = "a".repeat(40);

function prLink(number = 99) {
  return [{ number }];
}

function success(name, number = 1, overrides = {}) {
  return {
    id: number,
    name,
    run_number: number,
    status: "completed",
    conclusion: "success",
    head_sha: HEAD,
    event: "pull_request",
    pull_requests: prLink(),
    ...overrides,
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
    success("gate", 1, { status: "queued", conclusion: null }),
    success("gate", 2, { conclusion: "failure" }),
    success("gate", 3, { conclusion: "cancelled" }),
  ]) {
    assert.equal(greenDecision([run], required).green, false);
  }
});

test("latest skipped é não-PASS e nunca cai para success antigo", () => {
  const runs = [
    success("gate", 30, { conclusion: "skipped" }),
    success("gate", 29),
  ];
  assert.equal(selectLatestRun(runs, "gate")?.id, 30);
  const result = greenDecision(runs, ["gate"]);
  assert.equal(result.green, false);
  assert.deepEqual(result.verdicts, [{ name: "gate", state: "SKIPPED", run_id: 30, conclusion: "skipped" }]);
});

test("failure mais nova não é escondida por success antigo", () => {
  const verdicts = greenVerdicts([
    success("gate", 10),
    success("gate", 11, { conclusion: "failure" }),
  ], ["gate"]);
  assert.deepEqual(verdicts, [{ name: "gate", state: "FAIL", run_id: 11, conclusion: "failure" }]);
});

test("run manual ou de outro PR no mesmo SHA não conta", () => {
  assert.equal(runBelongsToPullHead(success("gate"), 99, HEAD), true);
  assert.equal(runBelongsToPullHead(success("gate", 2, { event: "workflow_dispatch" }), 99, HEAD), false);
  assert.equal(runBelongsToPullHead(success("gate", 3, { pull_requests: prLink(100) }), 99, HEAD), false);
  assert.equal(runBelongsToPullHead(success("gate", 4, { head_sha: "b".repeat(40) }), 99, HEAD), false);
});

test("paginação encontra gate válido depois da primeira página sem aceitar contexto errado", async () => {
  const page1 = Array.from({ length: 100 }, (_, index) => success("outro", index + 1, { pull_requests: prLink(99) }));
  const page2 = [
    success("porta-de-entrada", 201, { pull_requests: prLink(99) }),
    success("codex-validate", 202, { pull_requests: prLink(100) }),
    success("lupa-conformance", 203, { event: "workflow_dispatch", pull_requests: prLink(99) }),
  ];
  const seen = [];
  const request = async (_token, _method, path) => {
    seen.push(path);
    return { workflow_runs: /(?:[?&])page=1(?:&|$)/.test(path) ? page1 : page2 };
  };
  const runs = await runsForPullHead("token", "ServerVpss/CentralDark", HEAD, 99, request);
  assert.equal(seen.length, 2);
  assert.deepEqual(runs.map((run) => run.name), ["outro", ...Array(99).fill("outro"), "porta-de-entrada"]);
  assert.equal(runs.some((run) => run.name === "codex-validate"), false);
  assert.equal(runs.some((run) => run.name === "lupa-conformance"), false);
});

test("FAST e ADVERSARIAL revalidam green-first; estado não READY não promove", () => {
  assert.equal(shouldEnforceGreenFirst({ decision: "READY", mode: "FAST" }), true);
  assert.equal(shouldEnforceGreenFirst({ decision: "READY", mode: "ADVERSARIAL" }), true);
  assert.equal(shouldEnforceGreenFirst({ decision: "READY" }), true);
  assert.equal(shouldEnforceGreenFirst({ decision: "WAIT", mode: "ADVERSARIAL" }), false);
  assert.equal(shouldEnforceGreenFirst({ decision: "WAIT", mode: "FAST" }), false);
  assert.equal(shouldEnforceGreenFirst(null), false);
});

test("lista padrão é exatamente a régua canônica de oito gates", () => {
  assert.deepEqual(DEFAULT_REQUIRED_WORKFLOWS, [
    "porta-de-entrada",
    "codex-validate",
    "lupa-conformance",
    "Lupa Drift Guard",
    "Trigger Fabric Full Package",
    "PR Title Contract",
    "PR auto-review (Codex + checklist)",
    "Pipeline — Telegram + Painel",
  ]);
  assert.deepEqual(parseCsv("a,b"), ["a", "b"]);
});
