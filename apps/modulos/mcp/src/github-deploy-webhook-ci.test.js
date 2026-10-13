import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "cd-ci-"));
process.env.CENTRALDARK_LOG_ROOT = root;
process.env.GITHUB_WEBHOOK_SECRET = "test-secret";
const { githubDeployWebhook, recordWorkflowJob, getCiFailureSummary } = await import("./github-deploy-webhook.js");

function res() { return { statusCode: 200, body: null, status(c) { this.statusCode = c; return this; }, json(b) { this.body = b; return this; } }; }
function req(obj, event) {
  const body = JSON.stringify(obj);
  const sig = `sha256=${crypto.createHmac("sha256", "test-secret").update(body).digest("hex")}`;
  return { rawBody: Buffer.from(body), get(n) { return n === "x-hub-signature-256" ? sig : event; } };
}
const job = (over = {}) => ({ action: "completed", workflow_job: { id: 1, run_id: 99, name: "guard", workflow_name: "lupa-conformance",
  conclusion: "failure", runner_name: "centraldark-vps-1", head_sha: "f30d696a4c6ed493bcc658e403bcb5b6cee07adb", head_branch: "fix/x",
  html_url: "https://github.com/x/y/actions/runs/99/job/1", steps: [
    { number: 1, name: "Checkout", conclusion: "success" },
    { number: 2, name: "Rodar pytest", conclusion: "failure" }], ...over } });

test("workflow_job com passo falho grava o passo no funil e no coração", () => {
  const r = res(); githubDeployWebhook(req(job(), "workflow_job"), r);
  assert.equal(r.statusCode, 202); assert.equal(r.body.action, "ci_failure_recorded"); assert.equal(r.body.failed_steps, 1);
  const s = getCiFailureSummary();
  assert.equal(s.failures, 1); assert.equal(s.recent[0].step, "Rodar pytest"); assert.equal(s.recent[0].sha, "f30d696"); assert.equal(s.recent[0].infra_suspected, false);
});

test("falha sem passo registrado vira suspeita de runner/infra (disco cheio)", () => {
  const out = recordWorkflowJob(job({ name: "pulse", steps: [] }));
  assert.equal(out.recorded, true); assert.equal(out.failed_steps, 0);
  const s = getCiFailureSummary();
  assert.equal(s.infra, 1); assert.equal(s.recent[0].job, "pulse"); assert.equal(s.recent[0].infra_suspected, true);
});

test("sucesso e eventos não concluídos não poluem o funil", () => {
  assert.equal(recordWorkflowJob(job({ conclusion: "success" })).recorded, false);
  assert.equal(recordWorkflowJob({ action: "in_progress", workflow_job: {} }).recorded, false);
  assert.equal(getCiFailureSummary().failures, 2);
});

test("push continua no fluxo original e outros eventos seguem ignorados", () => {
  const r = res(); githubDeployWebhook(req({ ref: "refs/heads/feature" }, "push"), r);
  assert.equal(r.body.action, "ignored_branch");
  const r2 = res(); githubDeployWebhook(req({}, "issues"), r2);
  assert.equal(r2.body.action, "ignored");
});
