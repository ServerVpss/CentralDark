import assert from "node:assert/strict";
import test from "node:test";

import {
  CANONICAL_AUTHORITY_LABEL,
  CANONICAL_CONFIRMED_LABEL,
  CANONICAL_SUCCESS_LABEL,
  MAX_CATALOG_RETRIES,
  SUCCESS_COMMENT_MARKER,
  confirmationEvidence,
  hasConfirmedLabel,
  retryCountFromEvent,
} from "./github-pr-confirmado-label.mjs";

const HEAD = "a".repeat(40);
const MERGE = "b".repeat(40);
const RECEIPT = "c".repeat(64);

function pr(overrides = {}) {
  return {
    merged_at: "2026-08-24T15:30:00Z",
    merge_commit_sha: MERGE,
    head: { sha: HEAD },
    labels: [
      { name: CANONICAL_AUTHORITY_LABEL },
      { name: CANONICAL_SUCCESS_LABEL },
    ],
    ...overrides,
  };
}

function comments(overrides = {}) {
  const values = {
    head: HEAD,
    merge: MERGE,
    receipt: RECEIPT,
    ...overrides,
  };
  return [{
    body: [
      SUCCESS_COMMENT_MARKER,
      "## ✅ Intenção executada — squash main",
      "",
      `HEAD_PROVADO=\`${values.head}\``,
      `MERGE_SHA=\`${values.merge}\``,
      `JUDGE_RECEIPT_SHA256=\`${values.receipt}\``,
    ].join("\n"),
  }];
}

test("confirma somente merge com autoridade, sucesso, HEAD, merge SHA e receipt SHA-256 coerentes", () => {
  const evidence = confirmationEvidence(pr(), comments());
  assert.equal(evidence.confirmed, true);
  assert.deepEqual(evidence.reasons, []);
});

test("não confirma PR aberto ou não mergeado", () => {
  const evidence = confirmationEvidence(pr({ merged_at: null, merge_commit_sha: null }), comments());
  assert.equal(evidence.confirmed, false);
  assert.ok(evidence.reasons.includes("PR_NOT_MERGED"));
});

test("não confirma sem autoridade canônica", () => {
  const evidence = confirmationEvidence(pr({ labels: [{ name: CANONICAL_SUCCESS_LABEL }] }), comments());
  assert.equal(evidence.confirmed, false);
  assert.ok(evidence.reasons.includes("AUTHORITY_LABEL_MISSING"));
});

test("não confirma sem selo de sucesso observado", () => {
  const evidence = confirmationEvidence(pr({ labels: [{ name: CANONICAL_AUTHORITY_LABEL }] }), comments());
  assert.equal(evidence.confirmed, false);
  assert.ok(evidence.reasons.includes("SUCCESS_LABEL_MISSING"));
});

test("não confirma com receipt ausente ou inválido", () => {
  const missing = confirmationEvidence(pr(), []);
  assert.equal(missing.confirmed, false);
  assert.ok(missing.reasons.includes("SUCCESS_COMMENT_MISSING"));

  const invalid = confirmationEvidence(pr(), comments({ receipt: "nao-e-sha256" }));
  assert.equal(invalid.confirmed, false);
  assert.ok(invalid.reasons.includes("JUDGE_RECEIPT_SHA256_INVALID"));
});

test("não confirma se HEAD provado ou merge SHA não batem com o PR vivo", () => {
  const wrongHead = confirmationEvidence(pr(), comments({ head: "d".repeat(40) }));
  assert.equal(wrongHead.confirmed, false);
  assert.ok(wrongHead.reasons.includes("PROVEN_HEAD_MISMATCH"));

  const wrongMerge = confirmationEvidence(pr(), comments({ merge: "e".repeat(40) }));
  assert.equal(wrongMerge.confirmed, false);
  assert.ok(wrongMerge.reasons.includes("MERGE_SHA_MISMATCH"));
});

test("a etiqueta confirmada é distinta da autoridade e do sucesso", () => {
  assert.notEqual(CANONICAL_CONFIRMED_LABEL, CANONICAL_AUTHORITY_LABEL);
  assert.notEqual(CANONICAL_CONFIRMED_LABEL, CANONICAL_SUCCESS_LABEL);
});

test("detector reconhece tentativa manual de falso verde", () => {
  assert.equal(hasConfirmedLabel(pr()), false);
  assert.equal(hasConfirmedLabel(pr({
    labels: [
      { name: CANONICAL_AUTHORITY_LABEL },
      { name: CANONICAL_SUCCESS_LABEL },
      { name: CANONICAL_CONFIRMED_LABEL },
    ],
  })), true);
});

test("retry de catálogo é bounded e inválido volta a zero", () => {
  assert.equal(retryCountFromEvent({}), 0);
  assert.equal(retryCountFromEvent({ client_payload: { confirmation_retry_count: 3 } }), 3);
  assert.equal(retryCountFromEvent({ client_payload: { confirmation_retry_count: -1 } }), 0);
  assert.equal(retryCountFromEvent({ client_payload: { confirmation_retry_count: "x" } }), 0);
  assert.equal(MAX_CATALOG_RETRIES, 5);
});
