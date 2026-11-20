import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { githubDeployWebhook } from "./github-deploy-webhook.js";

function response() {
  return { statusCode: 200, body: null, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } };
}
function request(body, signature, event = "ping") {
  return { rawBody: Buffer.from(body), get(name) { return name === "x-hub-signature-256" ? signature : event; } };
}

test("rejects missing or invalid GitHub signature", () => {
  process.env.GITHUB_WEBHOOK_SECRET = "test-secret";
  const res = response();
  githubDeployWebhook(request("{}", "sha256=bad"), res);
  assert.equal(res.statusCode, 401);
  assert.equal(res.body.error, "INVALID_SIGNATURE");
});

test("accepts signed ping without mutating the repository", () => {
  process.env.GITHUB_WEBHOOK_SECRET = "test-secret";
  const body = "{}";
  const signature = `sha256=${crypto.createHmac("sha256", "test-secret").update(body).digest("hex")}`;
  const res = response();
  githubDeployWebhook(request(body, signature), res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { ok: true, event: "ping" });
});
