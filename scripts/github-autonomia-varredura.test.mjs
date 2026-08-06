import assert from "node:assert/strict";
import test from "node:test";

import {
  RECEIPT_FILE_PATTERN,
  SWEEP_MANIFEST_FILE,
  buildSweepManifest,
  eligibleSummary,
} from "./github-autonomia-varredura.mjs";

function pr(overrides = {}) {
  return {
    state: "open",
    draft: false,
    title: "fix: canário",
    body: "PERMITO PIVETE",
    labels: [],
    user: { login: "segredounlock" },
    base: { ref: "main" },
    head: { repo: { full_name: "ServerVpss/CentralDark" } },
    ...overrides,
  };
}

test("aceita apenas PR autorizado, confiável e não draft", () => {
  assert.equal(eligibleSummary(pr(), "ServerVpss/CentralDark"), true);
  assert.equal(eligibleSummary(pr({ draft: true }), "ServerVpss/CentralDark"), false);
  assert.equal(eligibleSummary(pr({ body: "sem autorização" }), "ServerVpss/CentralDark"), false);
  assert.equal(eligibleSummary(pr({ user: { login: "intruso" } }), "ServerVpss/CentralDark"), false);
});

test("label permito-pivete também autoriza", () => {
  assert.equal(
    eligibleSummary(pr({ body: "sem marcador", labels: [{ name: "permito-pivete" }] }), "ServerVpss/CentralDark"),
    true,
  );
});

test("fork e base diferente de main são bloqueados", () => {
  assert.equal(
    eligibleSummary(pr({ head: { repo: { full_name: "outro/fork" } } }), "ServerVpss/CentralDark"),
    false,
  );
  assert.equal(eligibleSummary(pr({ base: { ref: "dev" } }), "ServerVpss/CentralDark"), false);
});

test("manifesto existe mesmo sem candidato — evita artefato ausente no promote", () => {
  const manifesto = buildSweepManifest({
    repository: "ServerVpss/CentralDark",
    candidates: [],
    generatedAt: "2026-08-05T00:00:00.000Z",
    eventName: "push",
    runId: "123",
  });
  assert.equal(manifesto.schema, "centraldark.autonomia-sweep-manifest.v1");
  assert.equal(manifesto.repository, "ServerVpss/CentralDark");
  assert.deepEqual(manifesto.candidates, []);
  assert.equal(typeof JSON.stringify(manifesto), "string");
});

test("manifesto lista somente números de PR válidos", () => {
  const manifesto = buildSweepManifest({
    repository: "ServerVpss/CentralDark",
    candidates: [{ number: 646 }, { number: 0 }, { number: "637" }, { number: null }],
  });
  assert.deepEqual(manifesto.candidates, [646, 637]);
});

test("manifesto NUNCA é lido como recibo pelo promote (não-regressão)", () => {
  assert.equal(RECEIPT_FILE_PATTERN.test(SWEEP_MANIFEST_FILE), false);
  assert.equal(RECEIPT_FILE_PATTERN.test("receipt-pr-554.json"), true);
  assert.equal(RECEIPT_FILE_PATTERN.test("event-pr-554.json"), false);
  assert.equal(RECEIPT_FILE_PATTERN.test("judge-failure-pr-554.txt"), false);
});
