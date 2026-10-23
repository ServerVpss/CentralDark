import test from "node:test";
import assert from "node:assert/strict";
import { githubTools } from "../src/tools/github/github-tools.js";

const tool = githubTools.find((x) => x.name === "admin_ssh_microdeploy");
const admin = Object.freeze({
  admin: true,
  oauthScope: "openid admin",
  callerUser: "verified-test-admin",
  correlationId: "test-admin-ssh-microdeploy",
  authProvenance: "verified_oauth_admin",
  token: "fake-local-test-token",
});
function unpack(result) {
  return JSON.parse(result.content[0].text);
}
test("admin_ssh_microdeploy exists and never exposes apply", () => {
  assert.ok(tool);
  assert.equal(tool.inputSchema.safeParse({mode: "apply"}).success, false);
  assert.equal(tool.inputSchema.safeParse({mode: "probe"}).success, true);
});
test("unverified and nonadmin requests fail without network", async () => {
  const before = globalThis.fetch;
  globalThis.fetch = () => { throw new Error("network must not be touched"); };
  try {
    for (const ctx of [
      {...admin, admin: false},
      {...admin, oauthScope: "openid"},
      {...admin, authProvenance: null},
      {...admin, callerUser: null},
      {...admin, correlationId: null},
    ]) {
      const result = unpack(await tool.handler({mode: "probe", owner: "mcp"}, ctx));
      assert.equal(result.status, "AUTHENTICATED_ADMIN_SESSION_REQUIRED");
    }
  } finally {
    globalThis.fetch = before;
  }
});
test("dry_run fails outside causal scope without dispatch", async () => {
  const before = globalThis.fetch;
  globalThis.fetch = () => { throw new Error("network must not be touched"); };
  try {
    for (const file of ["../a", "/etc/passwd", "apps/modulos/oauth-broker/server.mjs", ""]) {
      const res = unpack(await tool.handler({mode: "dry_run", owner: "mcp", file}, admin));
      assert.equal(res.status, "INVALID_CAUSAL_FILESET");
    }
  } finally {
    globalThis.fetch = before;
  }
});
test("verified admin probe dispatches existing workflow, never apply", async () => {
  const before = globalThis.fetch;
  const requests = [];
  globalThis.fetch = async (url, init) => {
    requests.push({url: String(url), method: init?.method, body: JSON.parse(init.body)});
    return {ok: true, status: 204};
  };
  try {
    const result = unpack(await tool.handler({mode: "probe", owner: "mcp"}, admin));
    assert.equal(result.status, "DISPATCHED_NOT_EXECUTION_PROOF");
    assert.equal(result.runtimeProof, false);
    assert.equal(requests.length, 1);
    assert.match(requests[0].url, /ServerVpss\/CentralDark\/actions\/workflows\/vps-ssh-exec\.yml\/dispatches$/);
    assert.equal(requests[0].method, "POST");
    assert.equal(requests[0].body.ref, "main");
    assert.equal(requests[0].body.inputs.mode, "probe");
    assert.equal(requests[0].body.inputs.confirm_apply, "");
  } finally {
    globalThis.fetch = before;
  }
});
test("verified admin status reports GitHub outcome without runtime PASS", async () => {
  const before = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true, status: 200,
    text: async () => JSON.stringify({workflow_runs:[{
      id: 39912949599, status:"completed", conclusion:"failure",
      head_sha:"9dc4750d70f4c9a244e034bb1281383cebec71bf",
      html_url:"https://github.com/ServerVpss/CentralDark/actions/runs/39912949599",
    }]}),
  });
  try {
    const result = unpack(await tool.handler({mode:"status", owner:"mcp"}, admin));
    assert.equal(result.ok, true);
    assert.equal(result.runtimeProof, false);
    assert.equal(result.lastRun.conclusion, "failure");
  } finally {
    globalThis.fetch = before;
  }
});

test("multi-file causal dry_run requires exact source/dist pairs", async () => {
  const before = globalThis.fetch;
  const requests = [];
  globalThis.fetch = async (url, init) => {
    requests.push({ url: String(url), body: JSON.parse(init.body) });
    return {ok: true, status: 204};
  };
  try {
    const src = "apps/modulos/mcp/src/tools/github/github-tools.js";
    const dist = "apps/modulos/mcp/dist/tools/github/github-tools.js";
    const incomplete = unpack(await tool.handler({
      mode:"dry_run", owner:"mcp", file:src,
    }, admin));
    assert.equal(incomplete.status, "MCP_SOURCE_DIST_PAIR_REQUIRED");
    assert.equal(requests.length, 0);
    const complete = unpack(await tool.handler({
      mode:"dry_run", owner:"mcp", file:src+","+dist,
    }, admin));
    assert.equal(complete.status, "DISPATCHED_NOT_EXECUTION_PROOF");
    assert.equal(requests.length, 1);
    assert.equal(requests[0].body.inputs.file, src+","+dist);
    const duplicate = unpack(await tool.handler({
      mode:"dry_run", owner:"mcp", file:src+","+src,
    }, admin));
    assert.equal(duplicate.status, "INVALID_CAUSAL_FILESET");
    assert.equal(requests.length, 1);
  } finally {
    globalThis.fetch = before;
  }
});
