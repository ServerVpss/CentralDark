// OAuth refresh regression: protect the owner's rotating token without external credentials.
// Run: node --test apps/modulos/mcp/tests/oauth-refresh-client-binding.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const dir = mkdtempSync(join(tmpdir(), "centraldark-oauth-refresh-"));
process.env.MCP_STATE_FILE = join(dir, "session-state.json");
// sessions.js persists after a 500 ms debounce, so clean only when the process exits.
process.on("exit", () => { try { rmSync(dir, { recursive: true, force: true }); } catch { /* no-op */ } });
const { issueTokenPair, consumeRefreshToken } = await import("../src/sessions.js");
const synthetic = (client_id) => ({
  client_id, gh_token: "TEST_ONLY_NO_REAL_TOKEN", gh_login: "fixture",
  gh_scope: "", oauth_scope: "mcp admin",
});

test("wrong client_id cannot consume another client's refresh token", () => {
  const pair = issueTokenPair(synthetic("cline-owner"));
  assert.equal(consumeRefreshToken(pair.refresh.token, "different-client"), undefined);
  assert.equal(consumeRefreshToken(pair.refresh.token, "cline-owner")?.client_id, "cline-owner");
  assert.equal(consumeRefreshToken(pair.refresh.token, "cline-owner"), undefined);
});

test("successful refresh rotates both opaque credentials and blocks replay", () => {
  const first = issueTokenPair(synthetic("cline-owner"));
  const claimed = consumeRefreshToken(first.refresh.token, "cline-owner");
  assert.ok(claimed);
  const second = issueTokenPair({
    client_id: claimed.client_id, gh_token: claimed.gh_token,
    gh_login: claimed.gh_login, gh_scope: claimed.gh_scope,
    oauth_scope: claimed.oauth_scope,
  });
  assert.notEqual(second.refresh.token, first.refresh.token);
  assert.notEqual(second.access.token, first.access.token);
  assert.equal(consumeRefreshToken(first.refresh.token, "cline-owner"), undefined);
  assert.equal(consumeRefreshToken(second.refresh.token, "cline-owner")?.client_id, "cline-owner");
});
