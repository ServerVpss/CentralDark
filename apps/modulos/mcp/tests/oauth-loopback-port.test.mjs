import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { redirectUriRegistered } from "../src/oauth-redirect-match.js";

const client = (uri, method = "none") => ({
  client_id: "mcp_test_public",
  token_endpoint_auth_method: method,
  redirect_uris: [uri],
});
const oldCallback = "http://127.0.0.1:1456/mcp/oauth/callback";
const newCallback = "http://127.0.0.1:1457/mcp/oauth/callback";

test("Cline 1456 -> 1457 preserva client_id, callback e PKCE externo", () => {
  assert.equal(redirectUriRegistered(client(oldCallback), newCallback), true);
  assert.equal(redirectUriRegistered(client(oldCallback), oldCallback), true);
});

test("Loopback sem porta e IPv6 usam a mesma excecao delimitada", () => {
  assert.equal(redirectUriRegistered(client("http://127.0.0.1/mcp/oauth/callback"), newCallback), true);
  assert.equal(redirectUriRegistered(client("http://[::1]:1456/callback"), "http://[::1]:1457/callback"), true);
});

test("Cliente confidencial nao recebe excecao de porta", () => {
  assert.equal(redirectUriRegistered(client(oldCallback, "client_secret_post"), newCallback), false);
  assert.equal(redirectUriRegistered(client(oldCallback, "client_secret_post"), oldCallback), true);
});

test("Nao amplia localhost, outro IP ou outra familia IP", () => {
  for (const uri of [
    "http://localhost:1457/mcp/oauth/callback",
    "http://127.0.0.2:1457/mcp/oauth/callback",
    "http://[::1]:1457/mcp/oauth/callback",
    "http://2130706433:1457/mcp/oauth/callback",
    "http://127.000.000.001:1457/mcp/oauth/callback",
    "http://evil.com:1457/mcp/oauth/callback",
  ]) assert.equal(redirectUriRegistered(client(oldCallback), uri), false, uri);
  assert.equal(
    redirectUriRegistered(client("http://localhost:1456/mcp/oauth/callback"), "http://localhost:1457/mcp/oauth/callback"),
    false
  );
});

test("Scheme, path, query e userinfo permanecem presos ao registro", () => {
  const registered = "http://127.0.0.1:1456/mcp/oauth/callback?agent=cline";
  for (const uri of [
    "https://127.0.0.1:1457/mcp/oauth/callback?agent=cline",
    "http://127.0.0.1:1457/other?agent=cline",
    "http://127.0.0.1:1457/mcp/oauth/callback?agent=other",
    "http://user@127.0.0.1:1457/mcp/oauth/callback?agent=cline",
    "http://127.0.0.1:1457/mcp/oauth/callback?agent=cline#frag",
    "http://127.0.0.1:99999/mcp/oauth/callback?agent=cline",
  ]) assert.equal(redirectUriRegistered(client(registered), uri), false, uri);
  assert.equal(
    redirectUriRegistered(client(registered), "http://127.0.0.1:1457/mcp/oauth/callback?agent=cline"),
    true
  );
});

test("Callback remoto nao ganha permissao por semelhanca de URI", () => {
  assert.equal(
    redirectUriRegistered(client("https://mcp.centralldark.com/oauth/callback"), newCallback),
    false
  );
  assert.equal(redirectUriRegistered({redirect_uris: [oldCallback]}, newCallback), false);
  assert.equal(redirectUriRegistered(null, newCallback), false);
  assert.equal(redirectUriRegistered(client(oldCallback), "not-a-uri"), false);
});

test("O mesmo OAuth mantém binding de token, callback original e PKCE", () => {
  const oauth = readFileSync(new URL("../src/oauth.js", import.meta.url), "utf8");
  assert.match(oauth, /if \(!redirectUriRegistered\(client, redirect_uri\)\)/);
  assert.match(oauth, /if \(!redirectUriRegistered\(metadata, redirect_uri\)\)/);
  assert.match(oauth, /if \(ac\.redirect_uri !== redirect_uri\)/);
  assert.match(oauth, /if \(expected !== ac\.code_challenge\)/);
});

test("Nao aceita normalizacao de /../ ou de caminho diferente como se fosse apenas troca de porta", () => {
  assert.equal(
    redirectUriRegistered(
      client("http://127.0.0.1:1456/a/../mcp/oauth/callback"),
      "http://127.0.0.1:1457/mcp/oauth/callback"
    ), false
  );
  assert.equal(
    redirectUriRegistered(
      client("http://127.0.0.1:1456/mcp/oauth/callback"),
      "http://127.0.0.1:1457/a/../mcp/oauth/callback"
    ), false
  );
});
