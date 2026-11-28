import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const source = readFileSync(new URL("./centraldark-mcp-reserve-route.js", import.meta.url), "utf8");

function harness(upstream = () => new Response("{}", { status: 200 })) {
  const calls = [];
  let listener;
  vm.runInNewContext(source, {
    URL, Request, Response, Headers,
    addEventListener(type, callback) { assert.equal(type, "fetch"); listener = callback; },
    async fetch(request, options) { calls.push({ request, options }); return upstream(request, options); },
  });
  return {
    calls,
    request(path, init, origin = "https://mcp.centralldark.com") {
      let response;
      listener({ request: new Request(origin + path, init), respondWith(value) { response = value; } });
      return response;
    },
  };
}

test("consent preserves body, Origin, bearer and selector on the fixed API upstream", async () => {
  const h = harness();
  const body = JSON.stringify({ pair_id: "fixture", code: "fixture-code", nonce: "fixture-nonce" });
  await h.request("/authorize?pair_id=fixture", {
    method: "POST",
    headers: { Origin: "https://mcp.centralldark.com", Authorization: "Bearer fixture-only",
      "Content-Type": "application/json", Accept: "application/json", "X-CentralDark-Pairing-Route": "mcp-v1" },
    body,
  });
  assert.equal(h.calls.length, 1);
  const { request, options } = h.calls[0];
  assert.equal(request.url, "https://api.centralldark.com/authorize?pair_id=fixture");
  assert.equal(request.headers.get("origin"), "https://mcp.centralldark.com");
  assert.equal(request.headers.get("authorization"), "Bearer fixture-only");
  assert.equal(request.headers.get("x-centraldark-pairing-route"), "mcp-v1");
  assert.equal(request.headers.get("accept"), "application/json");
  assert.equal(request.headers.get("content-type"), "application/json");
  assert.equal(await request.text(), body);
  assert.equal(options.redirect, "manual");
});

test("OAuth redirect and query pass through without following or cache", async () => {
  const target = "https://mcp.centralldark.com/mcp-autorizar?pair_id=fixture";
  const h = harness(() => new Response(null, { status: 302, headers: { Location: target } }));
  const response = await h.request("/authorize?pair_id=fixture&nonce=fixture-nonce");
  assert.equal(response.status, 302);
  assert.equal(response.headers.get("location"), target);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(h.calls[0].options.redirect, "manual");
  assert.equal(new URL(h.calls[0].request.url).search, "?pair_id=fixture&nonce=fixture-nonce");
});

test("401 challenge is preserved without fabricating Origin", async () => {
  const challenge = 'Bearer realm="mcp", resource_metadata="https://mcp.centralldark.com/.well-known/oauth-protected-resource"';
  const h = harness(() => new Response('{"error":"unauthorized"}', { status: 401, headers: { "WWW-Authenticate": challenge } }));
  const response = await h.request("/api/mcp");
  assert.equal(response.status, 401);
  assert.equal(response.headers.get("www-authenticate"), challenge);
  assert.equal(h.calls[0].request.headers.has("origin"), false);
});

test("existing HEAD, status GET and OPTIONS methods are forwarded", async () => {
  const h = harness(() => new Response(null, { status: 204 }));
  for (const [path, method] of [
    ["/api/mcp", "HEAD"], ["/device/pair/status", "GET"],
    ["/.well-known/oauth-protected-resource", "HEAD"], ["/token", "OPTIONS"],
  ]) assert.equal((await h.request(path, { method })).status, 204);
  assert.equal(h.calls.length, 4);
});

test("device polling body stays in body, never becomes a query", async () => {
  const h = harness();
  await h.request("/device/pair/status", { method: "POST", body: "fixture-secret-in-body" });
  assert.equal(new URL(h.calls[0].request.url).search, "");
  assert.equal(await h.calls[0].request.text(), "fixture-secret-in-body");
});

test("UI, assets, similar paths and administrative routes never reach the backend", async () => {
  const h = harness();
  for (const path of ["/", "/auth", "/mcp-autorizar", "/assets/app.js", "/authorize-extra",
    "/api/mcp/extra", "/admin/catalog", "/device/pair/approve", "/device/devices", "/device/devices/revoke"]) {
    assert.equal((await h.request(path)).status, 404, path);
  }
  assert.equal(h.calls.length, 0);
});

test("API host, foreign host and HTTP cannot form a loop or alternate upstream", async () => {
  const h = harness();
  for (const origin of ["https://api.centralldark.com", "https://example.invalid", "http://mcp.centralldark.com"]) {
    assert.equal((await h.request("/api/mcp", undefined, origin)).status, 404);
  }
  assert.equal(h.calls.length, 0);
});

test("unsupported methods return 405 without sending a subrequest", async () => {
  const h = harness();
  const response = await h.request("/token");
  assert.equal(response.status, 405);
  assert.equal(response.headers.get("allow"), "POST, OPTIONS");
  assert.equal((await h.request("/api/mcp", { method: "DELETE" })).status, 405);
  assert.equal(h.calls.length, 0);
});

test("untrusted Origin is preserved for the existing backend to reject", async () => {
  const h = harness(() => new Response('{"error":"origin_not_allowed"}', { status: 403 }));
  const response = await h.request("/authorize", { method: "POST", headers: { Origin: "https://example.invalid" } });
  assert.equal(response.status, 403);
  assert.equal(h.calls[0].request.headers.get("origin"), "https://example.invalid");
});

test("upstream transport errors are 502 and do not expose exception data", async () => {
  const h = harness(() => { throw new Error("fixture-private-detail"); });
  const response = await h.request("/api/mcp");
  assert.equal(response.status, 502);
  assert.deepEqual(await response.json(), { error: "upstream_unavailable" });
});
