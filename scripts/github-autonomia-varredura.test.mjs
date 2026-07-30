import assert from "node:assert/strict";
import test from "node:test";

import { eligibleSummary } from "./github-autonomia-varredura.mjs";

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
