import crypto from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { appendCentralEvent } from "./log-funnel.js";
import { queryCentralLogs } from "./agent-observability.js";
import { log as appLog } from "./log.js";

const execFileAsync = promisify(execFile);
let running = false;

function secret() {
  return String(process.env.GITHUB_WEBHOOK_SECRET || process.env.CENTRALDARK_WEBHOOK_HMAC || "").trim();
}

function validSignature(rawBody, header) {
  const configured = secret();
  if (!configured || typeof header !== "string" || !header.startsWith("sha256=")) return false;
  const expected = `sha256=${crypto.createHmac("sha256", configured).update(rawBody).digest("hex")}`;
  const actual = Buffer.from(header);
  const wanted = Buffer.from(expected);
  return actual.length === wanted.length && crypto.timingSafeEqual(actual, wanted);
}

function log(message) {
  process.stdout.write(`[deploy-webhook] ${message}\n`);
}

async function runCanonicalSync() {
  const repo = process.env.VPS_REPO_PATH || "/root/CentralDark";
  const script = `${repo}/scripts/vps/auto-sync-main.sh`;
  await execFileAsync("bash", [script], {
    cwd: repo,
    env: { ...process.env, REPO_DIR: repo, BRANCH: "main" },
    maxBuffer: 4 * 1024 * 1024,
  });
}

// ── CI no mesmo coração: passo que falhou ─────────────────────────────────────
// workflow_job.completed com falha vira evento no funil canônico (setor "ci").
// Sem passo registrado = falha do runner/infra (ex.: disco cheio, runner perdido).
const CI_FAIL = new Set(["failure", "timed_out", "startup_failure", "cancelled"]);

export function recordWorkflowJob(payload) {
  const job = payload?.workflow_job;
  if (payload?.action !== "completed" || !job) return { recorded: false, reason: "not_completed" };
  const conclusion = String(job.conclusion || "unknown");
  if (!CI_FAIL.has(conclusion)) return { recorded: false, reason: "not_failure", conclusion };
  const steps = Array.isArray(job.steps) ? job.steps : [];
  const failed = steps.filter((s) => s && CI_FAIL.has(String(s.conclusion || "")));
  const failedSteps = failed.map((s) => ({ number: s.number ?? null, name: String(s.name || "").slice(0, 200), conclusion: s.conclusion }));
  const stepLabel = failedSteps.length
    ? failedSteps.map((s) => s.name).join(" · ")
    : "SEM_PASSO_REGISTRADO (runner/infra)";
  const result = appendCentralEvent({
    sector: "ci",
    service: "github-actions",
    source: "github-webhook:workflow_job",
    actor: String(job.runner_name || "runner-desconhecido").slice(0, 160),
    kind: "ci_job_failed",
    level: conclusion === "cancelled" ? "warn" : "error",
    key: `${job.workflow_name || "workflow"} / ${job.name || "job"}`,
    tags: ["ci", conclusion, failedSteps.length ? "step" : "infra"],
    run_id: job.run_id == null ? null : String(job.run_id),
    sha: job.head_sha || null,
    message: `${job.workflow_name || "workflow"} › ${job.name || "job"} › ${stepLabel} (${conclusion})`,
    data: {
      workflow: job.workflow_name || null,
      job: job.name || null,
      job_id: job.id ?? null,
      conclusion,
      failed_steps: failedSteps,
      infra_suspected: failedSteps.length === 0,
      runner: job.runner_name || null,
      branch: job.head_branch || null,
      url: job.html_url || null,
      completed_at: job.completed_at || null,
    },
  });
  // Mesmo evento no logger do servidor → LOG_BUFFER/SSE de /admin/api/logs (filtro rota=ci).
  appLog.error("ci_job_failed", {
    path: "/ci/workflow_job",
    workflow: job.workflow_name || null, job: job.name || null, step: stepLabel, conclusion,
    runner: job.runner_name || null, sha: job.head_sha || null, run_id: job.run_id ?? null, url: job.html_url || null,
    event_id: result.event_id || null,
  });
  return { recorded: result.ok === true, event_id: result.event_id || null, failed_steps: failedSteps.length };
}

// Projeção pública sanitizada para o /heartbeat (um coração) e para o HUD.
export function getCiFailureSummary({ since_minutes = 1440, limit = 8 } = {}) {
  try {
    const rows = queryCentralLogs({ sector: "ci", kind: "ci_job_failed", since_minutes, limit: 500 });
    const recent = rows.slice(-limit).reverse().map((r) => ({
      t: r.timestamp,
      workflow: r.data?.workflow || null,
      job: r.data?.job || null,
      step: (r.data?.failed_steps || []).map((s) => s.name).join(" · ") || null,
      infra_suspected: r.data?.infra_suspected === true,
      conclusion: r.data?.conclusion || null,
      runner: r.data?.runner || null,
      sha: r.sha ? String(r.sha).slice(0, 7) : null,
      url: r.data?.url || null,
    }));
    return { source: "funil:sector=ci", window_minutes: since_minutes, failures: rows.length, infra: rows.filter((r) => r.data?.infra_suspected === true).length, recent };
  } catch {
    return { source: "funil:sector=ci", failures: null, recent: [], state: "UNKNOWN" };
  }
}

export function githubDeployWebhook(req, res) {
  const rawBody = Buffer.isBuffer(req.rawBody) ? req.rawBody : null;
  if (!rawBody) return res.status(400).json({ ok: false, error: "RAW_BODY_REQUIRED" });
  if (!validSignature(rawBody, req.get("x-hub-signature-256"))) {
    log("signature rejected");
    return res.status(401).json({ ok: false, error: "INVALID_SIGNATURE" });
  }

  const event = String(req.get("x-github-event") || "");
  if (event === "ping") return res.status(200).json({ ok: true, event: "ping" });
  if (event !== "push" && event !== "workflow_job") return res.status(202).json({ ok: true, event, action: "ignored" });

  let payload;
  try {
    payload = JSON.parse(rawBody.toString("utf8"));
  } catch {
    return res.status(400).json({ ok: false, error: "INVALID_JSON" });
  }
  if (event === "workflow_job") {
    const ci = recordWorkflowJob(payload);
    return res.status(202).json({ ok: true, event, action: ci.recorded ? "ci_failure_recorded" : "ci_ignored", ...ci });
  }
  if (payload?.ref !== "refs/heads/main") {
    return res.status(202).json({ ok: true, event, action: "ignored_branch", ref: payload?.ref || null });
  }
  if (!/^[0-9a-f]{40}$/i.test(String(payload?.after || ""))) {
    return res.status(400).json({ ok: false, error: "INVALID_AFTER_SHA" });
  }
  if (running) return res.status(202).json({ ok: true, event, action: "already_running" });

  running = true;
  const targetSha = payload.after;
  res.status(202).json({ ok: true, event, action: "accepted", targetSha });
  void runCanonicalSync()
    .then(() => log(`sync PASS sha=${targetSha}`))
    .catch((error) => log(`sync BLOCKED sha=${targetSha} reason=${String(error?.stderr || error?.message || error).slice(0, 500)}`))
    .finally(() => { running = false; });
}

export function githubDeployHealth(_req, res) {
  res.json({
    ok: true,
    service: "centraldark-api-deploy-route",
    route: "/webhook",
    canonicalOwner: "scripts/vps/auto-sync-main.sh",
    signature: secret() ? "configured" : "missing",
    running,
  });
}
