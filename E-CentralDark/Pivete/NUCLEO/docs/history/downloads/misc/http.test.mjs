import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { createServer } from "../src/http-server.mjs";

function fakeFetch() {
  return async (_url, init) => {
    const body = JSON.parse(init.body);
    return { ok: true, status: 200, text: async () => JSON.stringify({ choices: [{ message: { content: `ok-${body.model}` } }] }) };
  };
}

test("API exige token quando configurado", async () => {
  const server = createServer({ apiToken: "abc", env: { CENTRALDARK_API_KEY: "x", CENTRALDARK_MODELS: "m" }, saveReceipt: false, fetchImpl: fakeFetch() });
  server.listen(0, "127.0.0.1"); await once(server, "listening");
  const { port } = server.address();
  const response = await fetch(`http://127.0.0.1:${port}/v1/universal/execute`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ command: "#sintetizar" }) });
  assert.equal(response.status, 401);
  server.close();
});

test("API executa a mesma chamada da CLI", async () => {
  const server = createServer({ apiToken: "abc", env: { CENTRALDARK_API_KEY: "x", CENTRALDARK_MODELS: "m" }, saveReceipt: false, fetchImpl: fakeFetch() });
  server.listen(0, "127.0.0.1"); await once(server, "listening");
  const { port } = server.address();
  const response = await fetch(`http://127.0.0.1:${port}/v1/universal/execute`, { method: "POST", headers: { "content-type": "application/json", authorization: "Bearer abc" }, body: JSON.stringify({ command: "#sintetizar" }) });
  const body = await response.json();
  assert.equal(body.status, "PASS");
  server.close();
});
