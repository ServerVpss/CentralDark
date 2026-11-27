import crypto from "node:crypto";
import { appendCentralEvent } from "./log-funnel.js";
import { queryCentralLogs } from "./agent-observability.js";
import { pick } from "./tools/integrations.js";

const MAX_CLOCK_SKEW_MS = Number(process.env.BUILDKITE_WEBHOOK_MAX_SKEW_MS || 5 * 60_000);

function safeEqual(a, b) {
  const aa = Buffer.from(String(a || ""));
  const bb = Buffer.from(String(b || ""));
  return aa.length === bb.length && aa.length > 0 && crypto.timingSafeEqual(aa, bb);
}

function webhookSecret() {
  return pick("BUILDKITE_WEBHOOK_SECRET", "BUILDKITE_WEBHOOK_TOKEN");
}

export function verifyBuildkiteWebhook({
  rawBody,
  tokenHeader,
  signatureHeader,
  nowMs = Date.now(),
  secret = webhookSecret(),
} = {}) {
  if (!secret) return { ok: false, reason: "SECRET_NOT_CONFIGURED" };
  const raw = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(String(rawBody || ""));

  if (signatureHeader) {
    const parts = Object.fromEntries(
      String(signatureHeader)
        .split(",")
        .map((part) => part.trim().split("=", 2))
        .filter((pair) => pair.length === 2),
    );
    const timestamp = Number(parts.timestamp);
    const signature = parts.signature || "";
    if (!Number.isFinite(timestamp) || !signature) {
      return { ok: false, reason: "SIGNATURE_FORMAT_INVALID" };
    }
    const timestampMs = timestamp < 1e12 ? timestamp * 1000 : timestamp;
    if (Math.abs(nowMs - timestampMs) > MAX_CLOCK_SKEW_MS) {
      return { ok: false, reason: "SIGNATURE_STALE" };
    }
    const expected = crypto
      .createHmac("sha256", secret)
      .update(`${timestamp}.`)
      .update(raw)
      .digest("hex");
    return safeEqual(signature, expected)
      ? { ok: true, mode: "hmac-sha256", timestamp }
      : { ok: false, reason: "SIGNATURE_MISMATCH" };
  }

  if (tokenHeader) {
    return safeEqual(tokenHeader, secret)
      ? { ok: true, mode: "token" }
      : { ok: false, reason: "TOKEN_MISMATCH" };
  }
  return { ok: false, reason: "AUTH_HEADER_MISSING" };
}

function text(value, max = 240) {
  if (value == null) return null;
  return String(value).replace(/[\r\n\t]+/g, " ").slice(0, max);
}

function iso(value) {
  if (!value) return null;
  const ts = Date.parse(String(value));
  return Number.isFinite(ts) ? new Date(ts).toISOString() : null;
}

function eventLevel(event, payload) {
  const low = String(event || "").toLowerCase();
  const state = String(payload?.build?.state || payload?.job?.state || "").toLowerCase();
  if (/failed|failing|lost|blocked/.test(low) || /failed|failing|blocked/.test(state)) return "error";
  if (/canceled|cancelled|timed_out|disconnected|stopping/.test(low + " " + state)) return "warn";
  return "info";
}

function buildSafe(payload) {
  const build = payload?.build || {};
  const pipeline = payload?.pipeline || build?.pipeline || {};
  return {
    build_id: text(build.id, 120),
    build_number: Number.isFinite(Number(build.number)) ? Number(build.number) : null,
    state: text(build.state, 80),
    branch: text(build.branch, 160),
    commit: text(build.commit, 80),
    message: text(build.message, 400),
    source: text(build.source, 100),
    created_at: iso(build.created_at),
    started_at: iso(build.started_at),
    finished_at: iso(build.finished_at),
    pipeline_slug: text(pipeline.slug, 160),
    pipeline_name: text(pipeline.name, 160),
  };
}

function jobSafe(payload) {
  const job = payload?.job || {};
  const agent = job?.agent || payload?.agent || {};
  return {
    job_id: text(job.id, 120),
    state: text(job.state, 80),
    name: text(job.name || job.label, 240),
    exit_status: job.exit_status == null ? null : Number(job.exit_status),
    created_at: iso(job.created_at),
    scheduled_at: iso(job.scheduled_at),
    started_at: iso(job.started_at),
    finished_at: iso(job.finished_at),
    agent_id: text(agent.id, 120),
    agent_name: text(agent.name, 160),
    agent_hostname: text(agent.hostname, 160),
    agent_version: text(agent.version, 80),
    queue: text(job?.agent_query_rules?.find?.((x) => String(x).startsWith("queue="))?.split("=", 2)?.[1], 120),
  };
}

function agentSafe(payload) {
  const agent = payload?.agent || {};
  return {
    agent_id: text(agent.id, 120),
    name: text(agent.name, 160),
    hostname: text(agent.hostname, 160),
    version: text(agent.version, 80),
    connected_at: iso(agent.connected_at),
    disconnected_at: iso(agent.disconnected_at),
    connection_state: text(agent.connection_state || agent.state, 80),
  };
}

export function normalizeBuildkiteEvent(eventName, payload = {}) {
  const event = text(eventName, 120) || "unknown";
  const build = buildSafe(payload);
  const job = jobSafe(payload);
  const agent = agentSafe(payload);
  const level = eventLevel(event, payload);
  const kind = `buildkite_${event.replace(/[^a-zA-Z0-9._-]+/g, "_")}`;
  const keyId = job.job_id || build.build_id || agent.agent_id || "unknown";
  const tags = ["buildkite", event, level];
  if (build.pipeline_slug) tags.push(`pipeline-${build.pipeline_slug}`);
  if (job.queue) tags.push(`queue-${job.queue}`);

  return {
    sector: "buildkite",
    source: "buildkite-webhook",
    actor: "buildkite",
    kind,
    level,
    key: `buildkite:${event}:${keyId}`,
    tags,
    correlation_id: build.build_id || job.job_id || agent.agent_id,
    run_id: build.build_id,
    sha: build.commit,
    message: [event, build.pipeline_slug, build.branch, job.name, payload?.build?.state || payload?.job?.state]
      .filter(Boolean)
      .join(" · ")
      .slice(0, 800),
    data: {
      event,
      build,
      job,
      agent,
      sender: text(payload?.sender?.name || payload?.sender?.login, 160),
    },
  };
}

export function recordBuildkiteEvent(eventName, payload) {
  return appendCentralEvent(normalizeBuildkiteEvent(eventName, payload));
}

function percentile(values, p) {
  const clean = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!clean.length) return null;
  const idx = Math.min(clean.length - 1, Math.max(0, Math.ceil(p * clean.length) - 1));
  return clean[idx];
}

function wilsonInterval(failures, total, z = 1.96) {
  if (!total) return null;
  const phat = failures / total;
  const z2 = z * z;
  const den = 1 + z2 / total;
  const center = (phat + z2 / (2 * total)) / den;
  const margin = (z * Math.sqrt((phat * (1 - phat) + z2 / (4 * total)) / total)) / den;
  return {
    rate: phat,
    low: Math.max(0, center - margin),
    high: Math.min(1, center + margin),
    confidence: 0.95,
  };
}

function durationMs(start, finish) {
  const a = Date.parse(start || "");
  const b = Date.parse(finish || "");
  return Number.isFinite(a) && Number.isFinite(b) && b >= a ? b - a : null;
}

export function getBuildkiteStatus({ since_minutes = 1440, limit = 1200 } = {}) {
  const rows = queryCentralLogs({
    since_minutes,
    sector: "buildkite",
    limit: Math.min(Math.max(Number(limit) || 1200, 1), 2000),
  });
  const agentRows = queryCentralLogs({
    since_minutes,
    sector: "agents",
    actor: "hermes",
    limit: 2000,
  });

  const finished = rows.filter((r) => /build\.finished|job\.finished/i.test(r.data?.event || ""));
  const failures = finished.filter((r) =>
    r.level === "error" ||
    /fail|error|timed_out/i.test(String(r.data?.build?.state || r.data?.job?.state || "")) ||
    Number(r.data?.job?.exit_status) > 0
  );
  const stats = wilsonInterval(failures.length, finished.length);

  const jobDurations = rows
    .map((r) => durationMs(r.data?.job?.started_at, r.data?.job?.finished_at))
    .filter(Number.isFinite);

  const hermesJobs = agentRows.filter((r) => r.kind === "scheduled_job");
  const hermesFailed = hermesJobs.filter((r) => r.level === "error" || r.data?.error);
  const hermesDurations = hermesJobs.map((r) => Number(r.data?.duration_ms)).filter(Number.isFinite);
  const hermesRate = hermesJobs.length ? hermesFailed.length / hermesJobs.length : null;
  const hermesP95 = percentile(hermesDurations, 0.95);

  let routingAdvice = {
    state: "OBSERVE_ONLY",
    action_executed: false,
    reason: "NO_BUILD_FAILURE_OBSERVED",
  };
  if (failures.length > 0) {
    if (!hermesJobs.length) {
      routingAdvice = {
        state: "UNKNOWN_HERMES_RUNTIME",
        action_executed: false,
        reason: "FAILURE_PRESENT_BUT_HERMES_SAMPLE_MISSING",
      };
    } else if ((hermesRate ?? 1) >= 0.25 || (hermesP95 ?? Infinity) > 180_000) {
      routingAdvice = {
        state: "ESCALATE_FRONTIER_FOR_REROUTE",
        action_executed: false,
        reason: "HERMES_DEGRADED_BY_MEASURED_ERROR_OR_P95",
      };
    } else {
      routingAdvice = {
        state: "DELEGATE_HERMES_WITH_WATCHDOG",
        action_executed: false,
        reason: "HERMES_WITHIN_MEASURED_ERROR_AND_LATENCY_BOUNDS",
      };
    }
  }

  const pipelines = [...new Set(rows.map((r) => r.data?.build?.pipeline_slug).filter(Boolean))];
  const agents = [...new Set(rows.map((r) => r.data?.job?.agent_name || r.data?.agent?.name).filter(Boolean))];
  const queues = [...new Set(rows.map((r) => r.data?.job?.queue).filter(Boolean))];
  const eventCounts = {};
  for (const row of rows) {
    const name = row.data?.event || row.kind;
    eventCounts[name] = (eventCounts[name] || 0) + 1;
  }

  return {
    status: "OK",
    receiver_ready: true,
    webhook_secret_configured: Boolean(webhookSecret()),
    api_token_configured: Boolean(pick("BUILDKITE_API_TOKEN")),
    window_minutes: Number(since_minutes),
    events: rows.length,
    event_counts: eventCounts,
    last_event: rows.at(-1) || null,
    recent_events: rows.slice(-50),
    observed: { pipelines, agents, queues },
    finished_sample: finished.length,
    failures: failures.length,
    measured_failure_rate: stats,
    buildkite_job_p95_ms: percentile(jobDurations, 0.95),
    hermes: {
      sample: hermesJobs.length,
      failures: hermesFailed.length,
      measured_failure_rate: hermesRate,
      p95_duration_ms: hermesP95,
    },
    routing_advice: routingAdvice,
    proof_boundary: {
      probability_is_proof: false,
      advice_is_action: false,
      external_buildkite_delivery: rows.length ? "OBSERVED" : "UNKNOWN_UNTIL_WEBHOOK_DELIVERY",
      reality_judge_required: true,
    },
  };
}

export function handleBuildkiteWebhook(req, res) {
  const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body || {}));
  const auth = verifyBuildkiteWebhook({
    rawBody,
    tokenHeader: req.headers["x-buildkite-token"],
    signatureHeader: req.headers["x-buildkite-signature"],
  });
  if (!auth.ok) {
    const status = auth.reason === "SECRET_NOT_CONFIGURED" ? 503 : 401;
    res.status(status).json({ ok: false, error: auth.reason });
    return { ok: false, status, reason: auth.reason };
  }
  const event = String(req.headers["x-buildkite-event"] || req.body?.event || "unknown");
  const receipt = recordBuildkiteEvent(event, req.body || {});
  const status = receipt.ok ? 202 : 500;
  res.status(status).json({
    ok: receipt.ok,
    accepted: receipt.ok,
    event,
    event_id: receipt.event_id || null,
    action_executed: false,
  });
  return { ok: receipt.ok, status, event, receipt, auth_mode: auth.mode };
}
