import assert from "node:assert/strict";
import test from "node:test";

import {
  CANONICAL_AUTHORITY_LABEL,
  authorityApprovalForEvent,
  canonicalAuthorityLabel,
} from "./authority-approval.mjs";

test("label canônica visual emitida no GitHub autoriza SEGREDO/CHEFE", () => {
  const result = authorityApprovalForEvent({
    pull_request: { labels: [{ name: CANONICAL_AUTHORITY_LABEL }] },
  });
  assert.deepEqual(result, {
    approved: true,
    authority: "SEGREDO/CHEFE",
    source: `github-label:${CANONICAL_AUTHORITY_LABEL}`,
  });
});

test("alias textual histórico normaliza para a label canônica visual", () => {
  assert.equal(canonicalAuthorityLabel("permito-segredo"), CANONICAL_AUTHORITY_LABEL);
  assert.equal(canonicalAuthorityLabel("PERMITO-SEGREDO"), CANONICAL_AUTHORITY_LABEL);
  assert.equal(canonicalAuthorityLabel("👑 permito-segredo"), CANONICAL_AUTHORITY_LABEL);

  const result = authorityApprovalForEvent({
    pull_request: { labels: [{ name: "permito-segredo" }] },
  });
  assert.equal(result.approved, true);
  assert.equal(result.authority, "SEGREDO/CHEFE");
});

test("texto do corpo nunca concede autorização", () => {
  const result = authorityApprovalForEvent({
    pull_request: {
      body: "PERMITO SEGREDO",
      labels: [],
    },
  });
  assert.equal(result.approved, false);
  assert.equal(result.authority, null);
});

test("label legada do executor não concede autoridade do SEGREDO", () => {
  const result = authorityApprovalForEvent({
    pull_request: { labels: [{ name: "permito-pivete" }] },
  });
  assert.equal(result.approved, false);
  assert.equal(result.source, "none");
});
