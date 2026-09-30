import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

test("Buildkite webhook assinado entra no mesmo funil sem virar ação", async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "centraldark-buildkite-"));
  process.env.CENTRALDARK_LOG_ROOT = path.join(tmp, "logs");
  process.env.BUILDKITE_WEBHOOK_SECRET = "unit-buildkite-secret";

  const bk = await import(`../src/buildkite-integration.js?test=${Date.now()}`);
  const funnel = await import(`../src/log-funnel.js?test=${Date.now()}`);

  const payload = {
    build: {
      id: "build-1",
      number: 7,
      state: "failed",
      branch: "main",
      commit: "abc123",
      message: "test build",
      started_at: new Date(Date.now() - 3000).toISOString(),
      finished_at: new Date().toISOString(),
    },
    pipeline: { slug: "centraldark", name: "CentralDark" },
    job: {
      id: "job-1",
      state: "failed",
      name: "Gate canônico",
      exit_status: 1,
      started_at: new Date(Date.now() - 2500).toISOString(),
      finished_at: new Date().toISOString(),
      agent: { id: "agent-1", name: "hosted-linux-small", hostname: "ephemeral" },
      agent_query_rules: ["queue=linux-small"],
    },
  };
  const raw = Buffer.from(JSON.stringify(payload));
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = crypto
    .createHmac("sha256", process.env.BUILDKITE_WEBHOOK_SECRET)
    .update(`${timestamp}.`)
    .update(raw)
    .digest("hex");

  const verified = bk.verifyBuildkiteWebhook({
    rawBody: raw,
    signatureHeader: `timestamp=${timestamp},signature=${signature}`,
  });
  assert.equal(verified.ok, true);

  const bad = bk.verifyBuildkiteWebhook({
    rawBody: raw,
    signatureHeader: `timestamp=${timestamp},signature=${"0".repeat(64)}`,
  });
  assert.equal(bad.ok, false);
  assert.equal(bad.reason, "SIGNATURE_MISMATCH");

  const staleTs = timestamp - 600;
  const staleSig = crypto
    .createHmac("sha256", process.env.BUILDKITE_WEBHOOK_SECRET)
    .update(`${staleTs}.`)
    .update(raw)
    .digest("hex");
  const stale = bk.verifyBuildkiteWebhook({
    rawBody: raw,
    signatureHeader: `timestamp=${staleTs},signature=${staleSig}`,
  });
  assert.equal(stale.ok, false);
  assert.equal(stale.reason, "SIGNATURE_STALE");

  const receipt = bk.recordBuildkiteEvent("job.finished", payload);
  assert.equal(receipt.ok, true);

  funnel.appendCentralEvent({
    sector: "agents",
    source: "hermes-cron",
    actor: "hermes",
    kind: "scheduled_job",
    level: "info",
    key: "hermes-job:test",
    tags: ["hermes", "cron", "ok"],
    data: { job_id: "h1", duration_ms: 4200, error: null },
  });
  funnel.appendCentralEvent({
    sector: "agents",
    source: "hermes-cron",
    actor: "hermes",
    kind: "scheduled_job",
    level: "info",
    key: "hermes-job:test",
    tags: ["hermes", "cron", "ok"],
    data: { job_id: "h2", duration_ms: 5100, error: null },
  });

  const status = bk.getBuildkiteStatus({ since_minutes: 60 });
  assert.equal(status.events, 1);
  assert.equal(status.failures, 1);
  assert.equal(status.finished_sample, 1);
  assert.equal(status.routing_advice.state, "DELEGATE_HERMES_WITH_WATCHDOG");
  assert.equal(status.routing_advice.action_executed, false);
  assert.equal(status.observed.pipelines[0], "centraldark");
  assert.equal(status.observed.agents[0], "hosted-linux-small");
  assert.equal(status.observed.queues[0], "linux-small");
  assert.equal(status.proof_boundary.probability_is_proof, false);

  const logText = fs.readFileSync(receipt.unifiedFile, "utf8");
  assert.doesNotMatch(logText, /unit-buildkite-secret/);
  assert.match(logText, /"sector":"buildkite"/);
  assert.match(logText, /"kind":"buildkite_job.finished"/);
});

test("handler recusa webhook sem segredo configurado", async () => {
  const old = process.env.BUILDKITE_WEBHOOK_SECRET;
  delete process.env.BUILDKITE_WEBHOOK_SECRET;
  delete process.env.BUILDKITE_WEBHOOK_TOKEN;
  const suffix = Date.now() + "-missing";
  const bk = await import(`../src/buildkite-integration.js?test=${suffix}`);
  const result = bk.verifyBuildkiteWebhook({ rawBody: Buffer.from("{}"), secret: "" });
  assert.equal(result.ok, false);
  assert.equal(result.reason, "SECRET_NOT_CONFIGURED");
  if (old) process.env.BUILDKITE_WEBHOOK_SECRET = old;
});
