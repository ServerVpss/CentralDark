import test from "node:test";
import assert from "node:assert/strict";
import { parseInvocation } from "../src/command-parser.mjs";

test("#auditar aceita alvo separado", () => {
  assert.deepEqual(parseInvocation(["#auditar", "C:\\Alvo Com Espaco"]), {
    prefix: "#", mode: "standard", name: "auditar", target: "C:\\Alvo Com Espaco", flags: {}
  });
});

test("!fable ativa modo adversarial", () => {
  const value = parseInvocation(["!fable", "ALVO=/tmp/x", "--model", "m"]);
  assert.equal(value.mode, "adversarial");
  assert.equal(value.target, "/tmp/x");
  assert.equal(value.flags.model, "m");
});

test("formato inválido bloqueia", () => assert.throws(() => parseInvocation(["auditar"]), /COMMAND_FORMAT_INVALID/));
