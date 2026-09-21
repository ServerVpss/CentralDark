import assert from "node:assert/strict";
import test from "node:test";

import { normalizeRepoRef } from "./github.js";

test("normaliza owner + repo simples", () => {
  assert.deepEqual(normalizeRepoRef("ServerVpss", "CentralDark"), {
    owner: "ServerVpss",
    repo: "CentralDark",
    fullName: "ServerVpss/CentralDark",
  });
});

test("aceita repo full_name sem duplicar owner", () => {
  assert.deepEqual(normalizeRepoRef("ServerVpss", "ServerVpss/CentralDark"), {
    owner: "ServerVpss",
    repo: "CentralDark",
    fullName: "ServerVpss/CentralDark",
  });
});

test("deriva owner de full_name quando owner não foi informado", () => {
  assert.deepEqual(normalizeRepoRef(undefined, "ServerVpss/CentralDark"), {
    owner: "ServerVpss",
    repo: "CentralDark",
    fullName: "ServerVpss/CentralDark",
  });
});

test("falha fechado quando owner explícito conflita com full_name", () => {
  assert.throws(() => normalizeRepoRef("ServerVpss", "OutroOwner/CentralDark"), /conflitantes/);
});

test("falha fechado para repo malformado", () => {
  assert.throws(() => normalizeRepoRef("ServerVpss", "a/b/c"), /inválido/);
  assert.throws(() => normalizeRepoRef("ServerVpss", ""), /repo ausente/);
});
