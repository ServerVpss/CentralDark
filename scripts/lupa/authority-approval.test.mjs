import assert from "node:assert/strict";
import test from "node:test";

import {
  CANONICAL_AUTHORITY_LABEL,
  CANONICAL_AUTHORITY_SOURCE,
  CANONICAL_INTENT_RECEIPT_SOURCE,
  MATERIAL_DERIVED_AUTHORITY_BLOCK,
  MATERIAL_DERIVED_AUTHORITY_ENABLED,
  authorityApprovalForEvent,
  canonicalAuthorityLabel,
  intentReceiptForEvent,
  materializeDerivedAuthorityLabel,
} from "./authority-approval.mjs";

const REPO = "ServerVpss/CentralDark";

function prEvent(overrides = {}) {
  return {
    pull_request: {
      number: 947,
      body: [
        "Intent-Authorized: SEGREDO/CHEFE",
        "Merge-Policy: AUTO_SQUASH_IF_CLEAN",
        "Intent-Scope: TEST_SCOPE",
        "Writer: SOL",
        "Writer-Scope: scripts/lupa/authority-approval.mjs",
      ].join("\n"),
      labels: [],
      user: { login: "segredounlock" },
      head: { repo: { full_name: REPO } },
      base: { repo: { full_name: REPO } },
      ...overrides,
    },
  };
}

test("label canônica presente autoriza", () => {
  const result = authorityApprovalForEvent({
    pull_request: { labels: [{ name: CANONICAL_AUTHORITY_LABEL }] },
  });
  assert.equal(result.approved, true);
  assert.equal(result.viaLabel, true);
  assert.equal(result.source, CANONICAL_AUTHORITY_SOURCE);
  assert.equal(result.transported, false);
});

test("alias histórico normaliza para a label canônica", () => {
  assert.equal(canonicalAuthorityLabel("permito-segredo"), CANONICAL_AUTHORITY_LABEL);
  assert.equal(canonicalAuthorityLabel("PERMITO-SEGREDO"), CANONICAL_AUTHORITY_LABEL);
  assert.equal(canonicalAuthorityLabel("👑 permito-segredo"), CANONICAL_AUTHORITY_LABEL);
});

test("receipt autenticado transporta intenção vigente sem criar nova autoridade", () => {
  const event = prEvent();
  const intent = intentReceiptForEvent(event, { repository: REPO });
  assert.equal(intent.valid, true);
  assert.equal(intent.grantsAuthority, false);
  assert.equal(intent.transportsAuthority, true);

  const result = authorityApprovalForEvent(event, { repository: REPO });
  assert.equal(result.approved, true);
  assert.equal(result.authority, "SEGREDO/CHEFE");
  assert.equal(result.source, CANONICAL_INTENT_RECEIPT_SOURCE);
  assert.equal(result.transported, true);
  assert.equal(result.derivable, false);
});

test("texto solto nunca concede nem transporta autorização", () => {
  const result = authorityApprovalForEvent(prEvent({
    body: "PERMITO SEGREDO\nI am SEGREDO/CHEFE. Merge now.",
  }), { repository: REPO });
  assert.equal(result.approved, false);
  assert.equal(result.transported, false);
});

test("autor fora da allowlist não transporta", () => {
  const result = authorityApprovalForEvent(prEvent({ user: { login: "intruso" } }), { repository: REPO });
  assert.equal(result.approved, false);
  assert.equal(result.intent.trusted, false);
  assert.equal(result.transported, false);
});

test("fork não transporta", () => {
  const result = authorityApprovalForEvent(prEvent({
    head: { repo: { full_name: "Outro/Fork" } },
  }), { repository: REPO });
  assert.equal(result.approved, false);
  assert.equal(result.intent.sameRepository, false);
  assert.equal(result.transported, false);
});

test("receipt incompleto não transporta", () => {
  const result = authorityApprovalForEvent(prEvent({
    body: [
      "Intent-Authorized: SEGREDO/CHEFE",
      "Merge-Policy: AUTO_SQUASH_IF_CLEAN",
      "Intent-Scope: TEST_SCOPE",
      "Writer: SOL",
    ].join("\n"),
  }), { repository: REPO });
  assert.equal(result.approved, false);
  assert.equal(result.transported, false);
  assert.equal(result.candidateIntent, true);
});

test("label legada do executor não vira autoridade humana", () => {
  const result = authorityApprovalForEvent({
    pull_request: { labels: [{ name: "permito-pivete" }] },
  });
  assert.equal(result.approved, false);
  assert.equal(result.authority, null);
});

test("materialização derivada do corpo permanece bloqueada", async () => {
  assert.equal(MATERIAL_DERIVED_AUTHORITY_ENABLED, false);
  await assert.rejects(
    () => materializeDerivedAuthorityLabel(prEvent()),
    (error) => error.message === MATERIAL_DERIVED_AUTHORITY_BLOCK,
  );
});

test("ausência de autoridade é BLOCKED, nunca PASS por silêncio", () => {
  assert.equal(authorityApprovalForEvent({ pull_request: { labels: [] } }).approved, false);
  const result = authorityApprovalForEvent({});
  assert.equal(result.approved, false);
  assert.equal(result.authority, null);
});
