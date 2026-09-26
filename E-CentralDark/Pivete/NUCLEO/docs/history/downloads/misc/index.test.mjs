import test from "node:test";
import assert from "node:assert/strict";
import { runUniversal } from "../src/index.mjs";

test("runUniversal oferece chamada única embutível", async () => {
  const result = await runUniversal("#sintetizar", null, {
    env: { CENTRALDARK_API_KEY: "x", CENTRALDARK_MODELS: "m" },
    saveReceipt: false,
    fetchImpl: async () => ({ ok: true, status: 200, text: async () => JSON.stringify({ choices: [{ message: { content: "ok" } }] }) })
  });
  assert.equal(result.output, "ok");
});
