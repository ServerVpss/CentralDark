import assert from "node:assert/strict";
import test from "node:test";

import {
  authorizationFor,
  evaluateCandidate,
  sealReceipt,
  selectLatestNonSkipped,
  verifySealedReceipt,
  workflowVerdicts,
} from "./github-autonomia-promocao.mjs";

function prFixture(overrides = {}) {
  return {
    number: 99,
    title: "fix: exemplo",
    body: "PERMITO PIVETE",
    state: "open",
    draft: false,
    mergeable: true,
    mergeable_state: "clean",
    labels: [],
    user: { login: "segredounlock" },
    head: {
      sha: "a".repeat(40),
      ref: "fix/exemplo",
      repo: { full_name: "ServerVpss/CentralDark" },
    },
    base: {
      sha: "b".repeat(40),
      ref: "main",
    },
    ...overrides,
  };
}

function successfulRuns(required) {
  return required.map((name, index) => ({
    id: index + 1,
    name,
    run_number: index + 10,
    status: "completed",
    conclusion: "success",
  }));
}

test("autorização aceita label ou marcador explícito no corpo", () => {
  assert.equal(authorizationFor(prFixture()).authorized, true);
  assert.equal(
    authorizationFor(prFixture({ body: "sem marcador", labels: [{ name: "permito-pivete" }] })).authorized,
    true,
  );
  assert.equal(authorizationFor(prFixture({ body: "sem marcador" })).authorized, false);
});

test("seleção ignora run skipped mais nova e usa sucesso real", () => {
  const selected = selectLatestNonSkipped([
    { id: 1, name: "gate", run_number: 20, status: "completed", conclusion: "skipped" },
    { id: 2, name: "gate", run_number: 19, status: "completed", conclusion: "success" },
  ], "gate");
  assert.equal(selected.id, 2);
});

test("workflow ausente nunca vira verde", () => {
  assert.deepEqual(workflowVerdicts([], ["gate"]), [
    { name: "gate", state: "MISSING", run_id: null, conclusion: null },
  ]);
});

test("candidato pronto exige todos os contratos", () => {
  const required = ["gate-a", "gate-b"];
  const result = evaluateCandidate({
    pr: prFixture(),
    repository: "ServerVpss/CentralDark",
    trustedAuthors: ["segredounlock"],
    requiredWorkflows: required,
    workflowRuns: successfulRuns(required),
    unresolvedThreads: 0,
  });
  assert.equal(result.decision, "READY");
  assert.deepEqual(result.reasons, []);
  assert.deepEqual(result.waits, []);
});

test("base atrasada pede atualização antes do merge", () => {
  const required = ["gate"];
  const result = evaluateCandidate({
    pr: prFixture(),
    repository: "ServerVpss/CentralDark",
    trustedAuthors: ["segredounlock"],
    requiredWorkflows: required,
    workflowRuns: successfulRuns(required),
    unresolvedThreads: 0,
    baseUpdateRequired: true,
  });
  assert.equal(result.decision, "UPDATE_REQUIRED");
});

test("thread pendente bloqueia promoção", () => {
  const required = ["gate"];
  const result = evaluateCandidate({
    pr: prFixture(),
    repository: "ServerVpss/CentralDark",
    trustedAuthors: ["segredounlock"],
    requiredWorkflows: required,
    workflowRuns: successfulRuns(required),
    unresolvedThreads: 1,
  });
  assert.equal(result.decision, "BLOCKED");
  assert.match(result.reasons.join(" "), /UNRESOLVED_REVIEW_THREADS/);
});

test("autor externo ou fork nunca é promovido", () => {
  const required = ["gate"];
  const result = evaluateCandidate({
    pr: prFixture({
      user: { login: "intruso" },
      head: { sha: "a".repeat(40), ref: "fork", repo: { full_name: "outro/fork" } },
    }),
    repository: "ServerVpss/CentralDark",
    trustedAuthors: ["segredounlock"],
    requiredWorkflows: required,
    workflowRuns: successfulRuns(required),
    unresolvedThreads: 0,
  });
  assert.equal(result.decision, "BLOCKED");
  assert.match(result.reasons.join(" "), /AUTHOR_NOT_TRUSTED/);
  assert.match(result.reasons.join(" "), /HEAD_EXTERNAL_REPOSITORY/);
});

test("falha de workflow bloqueia e skipped não substitui sucesso", () => {
  const required = ["gate"];
  const result = evaluateCandidate({
    pr: prFixture(),
    repository: "ServerVpss/CentralDark",
    trustedAuthors: ["segredounlock"],
    requiredWorkflows: required,
    workflowRuns: [
      { id: 1, name: "gate", run_number: 3, status: "completed", conclusion: "skipped" },
      { id: 2, name: "gate", run_number: 2, status: "completed", conclusion: "failure" },
    ],
    unresolvedThreads: 0,
  });
  assert.equal(result.decision, "BLOCKED");
  assert.match(result.reasons.join(" "), /WORKFLOW_FAILED/);
});

test("recibo válido é preso ao hash e expira em 15 minutos", () => {
  const generated = new Date("2026-07-30T17:00:00.000Z");
  const sealed = sealReceipt({
    schema: "centraldark.autonomia-promocao.v1",
    generated_at: generated.toISOString(),
    repository: "ServerVpss/CentralDark",
    candidates: [],
  });
  assert.equal(
    verifySealedReceipt(sealed, generated.getTime() + 14 * 60 * 1000).repository,
    "ServerVpss/CentralDark",
  );
  assert.throws(
    () => verifySealedReceipt(sealed, generated.getTime() + 16 * 60 * 1000),
    /RECEIPT_EXPIRED/,
  );
  const adulterated = structuredClone(sealed);
  adulterated.receipt.repository = "outro/repo";
  assert.throws(() => verifySealedReceipt(adulterated, generated.getTime()), /RECEIPT_HASH_INVALID/);
});
