import assert from "node:assert/strict";
import test from "node:test";

import {
  CANONICAL_AUTHORITY_LABEL,
  CANONICAL_AUTHORITY_SOURCE,
  DERIVED_AUTHORITY_SOURCE,
  authorityApprovalForEvent,
  canonicalAuthorityLabel,
  intentReceiptForEvent,
  materializeDerivedAuthorityLabel,
} from "./authority-approval.mjs";

function prEvent(overrides = {}) {
  const repo = "ServerVpss/CentralDark";
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
      head: { repo: { full_name: repo } },
      base: { repo: { full_name: repo } },
      ...overrides,
    },
  };
}

test("label canônica visual emitida no GitHub autoriza SEGREDO/CHEFE", () => {
  const result = authorityApprovalForEvent({
    pull_request: { labels: [{ name: CANONICAL_AUTHORITY_LABEL }] },
  });
  assert.equal(result.approved, true);
  assert.equal(result.authority, "SEGREDO/CHEFE");
  assert.equal(result.source, CANONICAL_AUTHORITY_SOURCE);
  assert.equal(result.derivable, false);
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
  assert.equal(result.source, CANONICAL_AUTHORITY_SOURCE);
});

test("texto solto do corpo nunca concede nem deriva autorização", () => {
  const result = authorityApprovalForEvent({
    pull_request: {
      body: "PERMITO SEGREDO",
      labels: [],
    },
  });
  assert.equal(result.approved, false);
  assert.equal(result.authority, null);
  assert.equal(result.derivable, false);
});

test("recibo completo de intenção confiável no mesmo repo deriva microato sem aprovar antes de materializar", () => {
  const event = prEvent();
  const intent = intentReceiptForEvent(event, { repository: "ServerVpss/CentralDark" });
  assert.equal(intent.valid, true);

  const result = authorityApprovalForEvent(event, { repository: "ServerVpss/CentralDark" });
  assert.equal(result.approved, false);
  assert.equal(result.derivable, true);
  assert.equal(result.source, "none");
});

test("recibo não deriva selo para autor não confiável ou fork", () => {
  const untrusted = prEvent({ user: { login: "outro" } });
  assert.equal(authorityApprovalForEvent(untrusted, { repository: "ServerVpss/CentralDark" }).derivable, false);

  const fork = prEvent({ head: { repo: { full_name: "Outro/Fork" } } });
  assert.equal(authorityApprovalForEvent(fork, { repository: "ServerVpss/CentralDark" }).derivable, false);
});

test("materialização só aprova depois que GitHub devolve a label canônica", async () => {
  const event = prEvent();
  const calls = [];
  const fakeFetch = async (url, options) => {
    calls.push({ url, options });
    return {
      ok: true,
      status: 200,
      async json() { return [{ name: CANONICAL_AUTHORITY_LABEL }]; },
      async text() { return ""; },
    };
  };

  const result = await materializeDerivedAuthorityLabel(event, {
    GITHUB_REPOSITORY: "ServerVpss/CentralDark",
    GITHUB_TOKEN: "fixture-token",
    BOT_TRUSTED_AUTHORS: "segredounlock",
  }, fakeFetch);

  assert.equal(result.approved, true);
  assert.equal(result.source, DERIVED_AUTHORITY_SOURCE);
  assert.equal(result.derived, true);
  assert.equal(calls.length, 1);
  assert.match(calls[0].url, /issues\/947\/labels$/);
  assert.equal(JSON.parse(calls[0].options.body).labels[0], CANONICAL_AUTHORITY_LABEL);
});

test("label legada do executor não concede autoridade do SEGREDO", () => {
  const result = authorityApprovalForEvent({
    pull_request: { labels: [{ name: "permito-pivete" }] },
  });
  assert.equal(result.approved, false);
  assert.equal(result.source, "none");
});
