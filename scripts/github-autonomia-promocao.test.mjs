import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_WAIT_TIMEOUT_MS,
  authorizationFor,
  evaluateCandidate,
  sealReceipt,
  selectLatestNonSkipped,
  verifySealedReceipt,
  waitAgeMs,
  waitTimeoutMsFromEnv,
  workflowVerdicts,
} from "./github-autonomia-promocao.mjs";

function prFixture(overrides = {}) {
  return {
    number: 99,
    title: "fix: exemplo",
    body: "sem marcador",
    state: "open",
    draft: false,
    mergeable: true,
    mergeable_state: "clean",
    labels: [{ name: "permito-segredo" }],
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

test("autorização canônica vem somente da label persistente permito-segredo", () => {
  const label = authorizationFor(prFixture());
  assert.equal(label.authorized, true);
  assert.equal(label.authority, "SEGREDO/CHEFE");
  assert.equal(label.viaLabel, true);
  assert.equal(label.viaBody, false);
  assert.equal(label.source, "github-label:permito-segredo");
  assert.equal(label.persistence, "UNTIL_LABEL_REMOVED_OR_SCOPE_CHANGES");

  const bodyOnly = authorizationFor(
    prFixture({ body: "PERMITO SEGREDO", labels: [] }),
  );
  assert.equal(bodyOnly.authorized, false);
  assert.equal(bodyOnly.authority, null);
  assert.equal(bodyOnly.historicalBodyMarker, true);
});

test("autorização persiste quando HEAD muda e a label continua no mesmo PR", () => {
  const antes = authorizationFor(prFixture({
    head: { sha: "a".repeat(40), ref: "fix/exemplo", repo: { full_name: "ServerVpss/CentralDark" } },
  }));
  const depois = authorizationFor(prFixture({
    head: { sha: "c".repeat(40), ref: "fix/exemplo", repo: { full_name: "ServerVpss/CentralDark" } },
  }));
  assert.equal(antes.authorized, true);
  assert.equal(depois.authorized, true);
  assert.equal(depois.persistence, "UNTIL_LABEL_REMOVED_OR_SCOPE_CHANGES");
});

test("legado Pivete e body histórico nunca concedem autoridade", () => {
  const body = authorizationFor(prFixture({ body: "PERMITO PIVETE", labels: [] }));
  assert.equal(body.authorized, false);
  assert.equal(body.authority, null);
  assert.equal(body.legacy, true);
  assert.equal(body.historicalBodyMarker, true);

  const label = authorizationFor(
    prFixture({ body: "sem marcador", labels: [{ name: "permito-pivete" }] }),
  );
  assert.equal(label.authorized, false);
  assert.equal(label.authority, null);
  assert.equal(label.legacy, true);
});

test("sem label canônica a autorização permanece ausente", () => {
  const result = authorizationFor(prFixture({ body: "sem marcador", labels: [] }));
  assert.equal(result.authorized, false);
  assert.equal(result.authority, null);
});

test("needs-human genérico não apaga autorização já materializada", () => {
  const required = ["gate"];
  const result = evaluateCandidate({
    pr: prFixture({ labels: [{ name: "permito-segredo" }, { name: "needs-human" }] }),
    repository: "ServerVpss/CentralDark",
    trustedAuthors: ["segredounlock"],
    requiredWorkflows: required,
    workflowRuns: successfulRuns(required),
    unresolvedThreads: 0,
  });
  assert.equal(result.authorization.authorized, true);
  assert.equal(result.decision, "READY");
  assert.doesNotMatch(result.reasons.join(" "), /needs-human/);
});

test("hold explícito continua bloqueando prontidão sem apagar autorização", () => {
  const required = ["gate"];
  const result = evaluateCandidate({
    pr: prFixture({ labels: [{ name: "permito-segredo" }, { name: "hold" }] }),
    repository: "ServerVpss/CentralDark",
    trustedAuthors: ["segredounlock"],
    requiredWorkflows: required,
    workflowRuns: successfulRuns(required),
    unresolvedThreads: 0,
  });
  assert.equal(result.authorization.authorized, true);
  assert.equal(result.decision, "BLOCKED");
  assert.match(result.reasons.join(" "), /BLOCKING_LABEL:hold/);
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

test("espera dentro da janela continua espera", () => {
  const agora = Date.parse("2026-08-05T12:00:00.000Z");
  const result = evaluateCandidate({
    pr: prFixture({ updated_at: "2026-08-05T11:40:00.000Z" }),
    repository: "ServerVpss/CentralDark",
    trustedAuthors: ["segredounlock"],
    requiredWorkflows: ["gate"],
    workflowRuns: [],
    unresolvedThreads: 0,
    now: agora,
  });
  assert.equal(result.decision, "WAIT");
  assert.match(result.waits.join(" "), /WORKFLOW_MISSING/);
});

test("espera parada além da janela vira bloqueio, nunca espera infinita muda", () => {
  const agora = Date.parse("2026-08-05T12:00:00.000Z");
  const result = evaluateCandidate({
    pr: prFixture({ updated_at: "2026-08-05T10:00:00.000Z" }),
    repository: "ServerVpss/CentralDark",
    trustedAuthors: ["segredounlock"],
    requiredWorkflows: ["gate"],
    workflowRuns: [],
    unresolvedThreads: 0,
    now: agora,
  });
  assert.equal(result.decision, "BLOCKED");
  assert.match(result.reasons.join(" "), /WAIT_TIMEOUT:120min/);
});

test("sem relógio o comportamento antigo é preservado", () => {
  assert.equal(waitAgeMs(prFixture({ updated_at: "2026-08-05T10:00:00.000Z" })), null);
  assert.equal(waitAgeMs({ updated_at: "data inválida" }, Date.now()), null);
});

test("janela de espera é configurável e cai no padrão quando inválida", () => {
  assert.equal(waitTimeoutMsFromEnv({}), DEFAULT_WAIT_TIMEOUT_MS);
  assert.equal(waitTimeoutMsFromEnv({ BOT_WAIT_TIMEOUT_MINUTES: "0" }), DEFAULT_WAIT_TIMEOUT_MS);
  assert.equal(waitTimeoutMsFromEnv({ BOT_WAIT_TIMEOUT_MINUTES: "10" }), 600000);
});
