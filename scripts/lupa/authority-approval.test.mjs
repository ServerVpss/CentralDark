import assert from "node:assert/strict";
import test from "node:test";

import {
  CANONICAL_AUTHORITY_LABEL,
  authorityApprovalForEvent,
} from "./authority-approval.mjs";

test("label canônica emitida no GitHub autoriza SEGREDO/CHEFE", () => {
  const result = authorityApprovalForEvent({
    pull_request: { labels: [{ name: CANONICAL_AUTHORITY_LABEL }] },
  });
  assert.deepEqual(result, {
    approved: true,
    authority: "SEGREDO/CHEFE",
    source: "github-label:permito-segredo",
  });
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
