#!/usr/bin/env node

import { appendFileSync } from 'node:fs';

const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
const repository = process.env.GITHUB_REPOSITORY || 'ServerVpss/CentralDark';
const baseBranch = process.env.BASE_BRANCH || 'main';
const targetPr = Number(process.env.TARGET_PR || process.env.PR_NUMBER || 0) || null;
const prMotherNumber = Number(process.env.PR_MOTHER_NUMBER || 1757);
const includeProtected = String(process.env.UPDATE_BRANCH_INCLUDE_PROTECTED || 'true').toLowerCase() === 'true';
const failOnBlocked = String(process.env.UPDATE_BRANCH_FAIL_ON_BLOCKED || 'true').toLowerCase() === 'true';
const settleMs = Number(process.env.UPDATE_BRANCH_STITCH_SETTLE_MS || 3000);
const pollAttempts = Number(process.env.UPDATE_BRANCH_STITCH_POLL_ATTEMPTS || 12);
const pollIntervalMs = Number(process.env.UPDATE_BRANCH_STITCH_POLL_INTERVAL_MS || 5000);
const checksPollAttempts = Number(process.env.UPDATE_BRANCH_CHECKS_POLL_ATTEMPTS || 3);
const checksPollIntervalMs = Number(process.env.UPDATE_BRANCH_CHECKS_POLL_INTERVAL_MS || 4000);
const workflowRunId = process.env.GITHUB_RUN_ID || '';
const workflowRunAttempt = process.env.GITHUB_RUN_ATTEMPT || '';
const triggerActor = process.env.GITHUB_ACTOR || '';
const protectedPrs = new Set(
  String(process.env.UPDATE_BRANCH_PROTECTED_PRS || '1562,1757')
    .split(',')
    .map(v => Number(v.trim()))
    .filter(Number.isFinite),
);

const marker = 'CENTRALDARK_ANY_PR_UPDATE_BRANCH_DETERMINISTIC';
const motherMarker = 'CENTRALDARK_PR_MOTHER_UPDATE_BRANCH_DETERMINISTIC';
const stitchMarker = 'CENTRALDARK_STITCH_STABILIZATION';

if (!token) {
  console.error('BLOCKED_MISSING_GITHUB_TOKEN');
  process.exit(2);
}

const [owner, repo] = repository.split('/');
if (!owner || !repo) {
  console.error(`BLOCKED_INVALID_REPOSITORY=${repository}`);
  process.exit(2);
}

const headers = {
  accept: 'application/vnd.github+json',
  authorization: `Bearer ${token}`,
  'x-github-api-version': '2022-11-28',
  'user-agent': 'CentralDark-Any-PR-Update-Branch/1.1',
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function nowIso() {
  return new Date().toISOString();
}

async function api(path, { method = 'GET', body } = {}) {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}${path}`, {
    method,
    headers: { ...headers, ...(body ? { 'content-type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  return { ok: response.ok, status: response.status, data };
}

async function getPr(number) {
  const result = await api(`/pulls/${number}`);
  if (!result.ok) throw new Error(`PR_GET_FAILED #${number} status=${result.status}`);
  return result.data;
}

async function listOpenPrs() {
  const out = [];
  for (let page = 1; page <= 10; page += 1) {
    const result = await api(`/pulls?state=open&per_page=100&page=${page}`);
    if (!result.ok) throw new Error(`PR_LIST_FAILED status=${result.status}`);
    const batch = Array.isArray(result.data) ? result.data : [];
    out.push(...batch);
    if (batch.length < 100) break;
  }
  return out;
}

function refPart(value) {
  return encodeURIComponent(String(value || '').replace(/^refs\/heads\//, ''));
}

async function compareBaseToHead(pr) {
  const base = pr.base?.ref || baseBranch;
  const head = pr.head?.sha;
  if (!head) return { ok: false, status: 'NO_HEAD_SHA', behind_by: null, ahead_by: null };
  const result = await api(`/compare/${refPart(base)}...${refPart(head)}`);
  if (!result.ok) {
    return { ok: false, status: `HTTP_${result.status}`, behind_by: null, ahead_by: null, raw: result.data };
  }
  return {
    ok: true,
    status: result.data?.status || 'unknown',
    behind_by: Number(result.data?.behind_by || 0),
    ahead_by: Number(result.data?.ahead_by || 0),
    total_commits: Number(result.data?.total_commits || 0),
  };
}

function countBy(items, keyFn) {
  const counts = {};
  for (const item of items) {
    const key = keyFn(item) || 'unknown';
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

async function summarizeChecksForSha(sha) {
  if (!sha) {
    return {
      ok: false,
      state: 'CHECKS_UNKNOWN_NO_SHA',
      sha: null,
      status_state: null,
      check_runs_total: 0,
      status_contexts_total: 0,
    };
  }

  const [statusResult, checksResult] = await Promise.all([
    api(`/commits/${sha}/status`),
    api(`/commits/${sha}/check-runs?per_page=100`),
  ]);

  const contexts = Array.isArray(statusResult.data?.statuses) ? statusResult.data.statuses : [];
  const runs = Array.isArray(checksResult.data?.check_runs) ? checksResult.data.check_runs : [];
  const statusState = statusResult.ok ? String(statusResult.data?.state || 'unknown') : `HTTP_${statusResult.status}`;
  const runStatusCounts = countBy(runs, run => run.status);
  const runConclusionCounts = countBy(
    runs.filter(run => run.status === 'completed'),
    run => run.conclusion,
  );
  const contextStateCounts = countBy(contexts, ctx => ctx.state);

  const runningRuns = runs.filter(run => run.status !== 'completed').length;
  const failingRuns = runs.filter(run => ['failure', 'cancelled', 'timed_out', 'action_required'].includes(String(run.conclusion))).length;
  const failingContexts = contexts.filter(ctx => ['failure', 'error'].includes(String(ctx.state))).length;
  const pendingContexts = contexts.filter(ctx => ['pending', 'expected'].includes(String(ctx.state))).length;

  let state = 'CHECKS_UNKNOWN_EMPTY';
  if (!statusResult.ok && !checksResult.ok) {
    state = 'CHECKS_API_UNKNOWN';
  } else if (failingRuns > 0 || failingContexts > 0) {
    state = 'CHECKS_FAILED';
  } else if (runningRuns > 0 || pendingContexts > 0 || statusState === 'pending') {
    state = 'CHECKS_PENDING';
  } else if (runs.length === 0 && contexts.length === 0) {
    state = 'CHECKS_UNKNOWN_EMPTY';
  } else {
    const skippedRuns = Number(runConclusionCounts.skipped || 0);
    const completedRuns = runs.filter(run => run.status === 'completed').length;
    if (skippedRuns > 0 && skippedRuns === completedRuns && contexts.length === 0) {
      state = 'CHECKS_ONLY_SKIPPED_NOT_PASS';
    } else if (skippedRuns > 0) {
      state = 'CHECKS_COMPLETE_WITH_SKIPPED_NOT_FULL_PASS';
    } else {
      state = 'CHECKS_COMPLETE_NO_FAILURE_DETECTED';
    }
  }

  return {
    ok: statusResult.ok || checksResult.ok,
    state,
    sha,
    status_state: statusState,
    status_contexts_total: contexts.length,
    status_context_state_counts: contextStateCounts,
    check_runs_total: runs.length,
    check_run_status_counts: runStatusCounts,
    check_run_conclusion_counts: runConclusionCounts,
  };
}

async function waitForChecksSignal(sha) {
  let last = await summarizeChecksForSha(sha);
  for (let attempt = 1; attempt < Math.max(1, checksPollAttempts); attempt += 1) {
    if (!['CHECKS_UNKNOWN_EMPTY', 'CHECKS_API_UNKNOWN'].includes(last.state)) break;
    await sleep(Math.max(0, checksPollIntervalMs));
    last = await summarizeChecksForSha(sha);
  }
  return last;
}

function stabilizedState(compareAfter, checks) {
  if (!compareAfter?.ok || compareAfter.behind_by !== 0) return 'TIMEOUT_AFTER_202_UNKNOWN';
  if (!checks || !checks.state) return 'SYNC_CONFIRMED_CHECKS_UNKNOWN';
  if (checks.state === 'CHECKS_PENDING') return 'SYNC_CONFIRMED_CHECKS_PENDING';
  if (checks.state === 'CHECKS_FAILED') return 'SYNC_CONFIRMED_CHECKS_FAILED';
  if (checks.state === 'CHECKS_UNKNOWN_EMPTY' || checks.state === 'CHECKS_API_UNKNOWN') return 'SYNC_CONFIRMED_CHECKS_UNKNOWN';
  if (checks.state === 'CHECKS_ONLY_SKIPPED_NOT_PASS' || checks.state === 'CHECKS_COMPLETE_WITH_SKIPPED_NOT_FULL_PASS') {
    return 'SYNC_CONFIRMED_SKIPPED_NOT_PASS';
  }
  return 'SYNC_CONFIRMED';
}

async function waitForStitchConfirmation(number, headBefore) {
  let lastPr = await getPr(number);
  let lastCompare = await compareBaseToHead(lastPr);

  for (let attempt = 1; attempt <= Math.max(1, pollAttempts); attempt += 1) {
    lastPr = await getPr(number);
    lastCompare = await compareBaseToHead(lastPr);
    if (lastCompare.ok && lastCompare.behind_by === 0) break;
    if (lastPr.head?.sha && lastPr.head.sha !== headBefore && lastCompare.ok) break;
    await sleep(Math.max(0, pollIntervalMs));
  }

  const checks = await waitForChecksSignal(lastPr.head?.sha);
  return {
    head_after: lastPr.head?.sha || null,
    head_changed: Boolean(lastPr.head?.sha && lastPr.head.sha !== headBefore),
    compare_after: lastCompare,
    checks_after: checks,
    stitch_state: stabilizedState(lastCompare, checks),
  };
}

function skipReason(pr) {
  if (!pr || pr.state !== 'open') return 'NOT_OPEN';
  if (pr.base?.ref !== baseBranch) return `BASE_NOT_${baseBranch}`;
  if (!pr.head?.sha) return 'HEAD_SHA_UNKNOWN';
  if (pr.head?.ref === pr.base?.ref) return 'HEAD_IS_BASE';
  if (Number(pr.number) !== prMotherNumber && !includeProtected && protectedPrs.has(Number(pr.number))) return 'PROTECTED_PR';
  if (pr.head?.repo?.full_name !== repository) return 'HEAD_REPO_NOT_SAME_REPO';
  return null;
}

async function processPr(pr) {
  const number = Number(pr.number);
  const receipt = {
    pr: number,
    is_pr_mother: number === prMotherNumber,
    pr_mother_merge_forbidden_sync_allowed: number === prMotherNumber,
    base: pr.base?.ref || null,
    head_ref: pr.head?.ref || null,
    head_before: pr.head?.sha || null,
    head_after: null,
    action: 'NONE',
    state: 'UNKNOWN',
    compare_before: null,
    compare_after: null,
    checks_after: null,
    stitch: {
      marker: stitchMarker,
      phase: 'NOT_STARTED',
      settled_at: null,
    },
  };

  const reason = skipReason(pr);
  if (reason) {
    receipt.action = 'SKIP';
    receipt.state = reason;
    receipt.stitch.phase = 'SKIPPED';
    return receipt;
  }

  const before = await compareBaseToHead(pr);
  receipt.compare_before = before;
  if (before.ok && before.behind_by === 0) {
    const checks = await waitForChecksSignal(pr.head.sha);
    receipt.action = 'NOOP';
    receipt.head_after = pr.head.sha;
    receipt.compare_after = before;
    receipt.checks_after = checks;
    receipt.state = checks.state === 'CHECKS_PENDING' ? 'UP_TO_DATE_WITH_MAIN_CHECKS_PENDING' : 'UP_TO_DATE_WITH_MAIN';
    receipt.stitch.phase = 'ALREADY_STABLE';
    receipt.stitch.settled_at = nowIso();
    return receipt;
  }

  const expectedHead = pr.head.sha;
  const update = await api(`/pulls/${number}/update-branch`, {
    method: 'PUT',
    body: { expected_head_sha: expectedHead },
  });

  receipt.endpoint = `PUT /pulls/${number}/update-branch`;

  if (update.status === 202) {
    receipt.action = 'PUT_UPDATE_BRANCH';
    receipt.state = 'UPDATE_BRANCH_REQUESTED';
    receipt.stitch.phase = 'REQUEST_ACCEPTED_WAITING_FOR_STABILIZATION';
    await sleep(Math.max(0, settleMs));

    const confirmation = await waitForStitchConfirmation(number, expectedHead);
    receipt.head_after = confirmation.head_after;
    receipt.compare_after = confirmation.compare_after;
    receipt.checks_after = confirmation.checks_after;
    receipt.state = confirmation.stitch_state;
    receipt.stitch.phase = confirmation.stitch_state.startsWith('SYNC_CONFIRMED')
      ? 'STABILIZED'
      : 'UNKNOWN_AFTER_REQUEST';
    receipt.stitch.head_changed = confirmation.head_changed;
    receipt.stitch.settled_at = nowIso();
    return receipt;
  }

  if (update.status === 422) {
    const current = await getPr(number);
    const after = await compareBaseToHead(current);
    const checks = await waitForChecksSignal(current.head?.sha);
    receipt.head_after = current.head?.sha || null;
    receipt.compare_after = after;
    receipt.checks_after = checks;
    const mergeState = String(current.mergeable_state || 'unknown').toLowerCase();
    if (after.ok && after.behind_by === 0) {
      receipt.action = 'NOOP_AFTER_REMEASURE';
      receipt.state = checks.state === 'CHECKS_PENDING' ? 'UP_TO_DATE_WITH_MAIN_CHECKS_PENDING' : 'UP_TO_DATE_WITH_MAIN';
      receipt.stitch.phase = 'STABILIZED_AFTER_REMEASURE';
    } else if (current.mergeable === false || mergeState === 'dirty') {
      receipt.action = 'BLOCKED';
      receipt.state = 'CONFLICT_REQUIRES_EXISTING_RESOLVER';
      receipt.stitch.phase = 'BLOCKED';
    } else if (current.mergeable === null) {
      receipt.action = 'BLOCKED';
      receipt.state = 'MERGEABILITY_UNKNOWN';
      receipt.stitch.phase = 'BLOCKED_UNKNOWN';
    } else {
      receipt.action = 'BLOCKED';
      receipt.state = 'UPDATE_BRANCH_422_NOT_UP_TO_DATE';
      receipt.stitch.phase = 'BLOCKED';
    }
    receipt.stitch.settled_at = nowIso();
    return receipt;
  }

  receipt.action = 'BLOCKED';
  receipt.state = `UPDATE_BRANCH_HTTP_${update.status}`;
  receipt.error = update.data?.message || update.data?.raw || null;
  receipt.stitch.phase = 'BLOCKED';
  receipt.stitch.settled_at = nowIso();
  return receipt;
}

function isConfirmed(receipt) {
  if (['BLOCKED', 'SKIP'].includes(String(receipt.action || ''))) return false;
  return receipt.compare_after?.ok === true
    && Number(receipt.compare_after?.behind_by) === 0;
}

function isSyncUnknown(receipt) {
  if (['BLOCKED', 'SKIP'].includes(String(receipt.action || ''))) return false;
  return !isConfirmed(receipt);
}

function checksObservation(receipt) {
  const state = String(receipt.checks_after?.state || 'CHECKS_UNKNOWN');
  if (state === 'CHECKS_FAILED') return 'FAIL';
  if ([
    'CHECKS_PENDING',
    'CHECKS_UNKNOWN_EMPTY',
    'CHECKS_API_UNKNOWN',
    'CHECKS_UNKNOWN_NO_SHA',
    'CHECKS_ONLY_SKIPPED_NOT_PASS',
    'CHECKS_COMPLETE_WITH_SKIPPED_NOT_FULL_PASS',
  ].includes(state)) return 'UNKNOWN';
  if (state === 'CHECKS_COMPLETE_NO_FAILURE_DETECTED') return 'PASS';
  return 'UNKNOWN';
}

function writeStepSummary(summary) {
  const path = process.env.GITHUB_STEP_SUMMARY;
  if (!path) return;

  const lines = [
    '## 🪡 Estabilização da costura',
    '',
    `- marker: \`${summary.marker}\``,
    `- stitch_marker: \`${summary.stitch_marker}\``,
    `- repository: \`${summary.repository}\``,
    `- base_branch: \`${summary.base_branch}\``,
    `- total: \`${summary.total}\``,
    `- requested: \`${summary.requested}\``,
    `- confirmed_or_up_to_date: \`${summary.confirmed_or_up_to_date}\``,
    `- blocked: \`${summary.blocked}\``,
    `- sync_unknown: \`${summary.sync_unknown}\``,
    `- checks_failed: \`${summary.checks_failed}\``,
    `- checks_unknown_or_pending: \`${summary.checks_unknown_or_pending}\``,
    '',
    '| PR | Ação | Estado | Antes | Depois | Behind depois | Checks |',
    '|---:|---|---|---|---|---:|---|',
  ];

  for (const r of summary.receipts) {
    lines.push([
      `| #${r.pr || 0}`,
      r.action || '',
      r.state || '',
      r.head_before ? String(r.head_before).slice(0, 7) : '',
      r.head_after ? String(r.head_after).slice(0, 7) : '',
      r.compare_after?.behind_by ?? '',
      r.checks_after?.state || '',
      '|',
    ].join(' | '));
  }

  try {
    appendFileSync(path, `${lines.join('\n')}\n`);
  } catch (error) {
    console.error(`STEP_SUMMARY_WRITE_FAILED=${error?.message || String(error)}`);
  }
}

function writeStepOutputs(summary) {
  const path = process.env.GITHUB_OUTPUT;
  if (!path) return;

  const verdict = summary.blocked > 0
    ? 'FAIL'
    : summary.sync_unknown > 0
      ? 'UNKNOWN'
      : 'PASS';

  const outputs = [
    `verdict=${verdict}`,
    `total=${summary.total}`,
    `requested=${summary.requested}`,
    `confirmed=${summary.confirmed_or_up_to_date}`,
    `blocked=${summary.blocked}`,
    `unknown_or_pending=${summary.sync_unknown}`,
    `sync_unknown=${summary.sync_unknown}`,
    `checks_failed=${summary.checks_failed}`,
    `checks_unknown_or_pending=${summary.checks_unknown_or_pending}`,
  ];

  appendFileSync(path, `${outputs.join('\n')}\n`);
}

const prs = targetPr ? [await getPr(targetPr)] : await listOpenPrs();
const receipts = [];
for (const pr of prs) {
  try {
    const receipt = await processPr(pr);
    receipts.push(receipt);
    console.log(JSON.stringify({ marker, mother_marker: motherMarker, stitch_marker: stitchMarker, ...receipt }));
  } catch (error) {
    const receipt = {
      pr: Number(pr?.number || targetPr || 0),
      action: 'BLOCKED',
      state: 'EXCEPTION',
      error: error?.message || String(error),
    };
    receipts.push(receipt);
    console.log(JSON.stringify({ marker, mother_marker: motherMarker, stitch_marker: stitchMarker, ...receipt }));
  }
}

const blocked = receipts.filter(r => r.action === 'BLOCKED').length;
const requested = receipts.filter(r => r.action === 'PUT_UPDATE_BRANCH').length;
const noop = receipts.filter(r => String(r.state || '').includes('UP_TO_DATE')).length;
const skipped = receipts.filter(r => r.action === 'SKIP').length;
const confirmed = receipts.filter(isConfirmed).length;
const syncUnknown = receipts.filter(isSyncUnknown).length;
const checksFailed = receipts.filter(r => checksObservation(r) === 'FAIL').length;
const checksUnknownOrPending = receipts.filter(r => checksObservation(r) === 'UNKNOWN').length;

const summary = {
  marker,
  mother_marker: motherMarker,
  stitch_marker: stitchMarker,
  repository,
  pr_mother_number: prMotherNumber,
  base_branch: baseBranch,
  target_pr: targetPr,
  workflow_run_id: workflowRunId,
  workflow_run_attempt: workflowRunAttempt,
  trigger_actor: triggerActor,
  total: receipts.length,
  requested,
  confirmed_or_up_to_date: confirmed,
  noop,
  skipped,
  blocked,
  sync_unknown: syncUnknown,
  checks_failed: checksFailed,
  checks_unknown_or_pending: checksUnknownOrPending,
  stabilization: {
    settle_ms: settleMs,
    poll_attempts: pollAttempts,
    poll_interval_ms: pollIntervalMs,
    checks_poll_attempts: checksPollAttempts,
    checks_poll_interval_ms: checksPollIntervalMs,
  },
  rule: 'PUT /pulls/{PR}/update-branch only when PR is behind main; active PR-MOTHER is syncable but never mergeable; legacy #1562 remains protected by this flow; sync verdict is scoped to head/compare and requires behind_by_after == 0; checks remain an independent observation and never become promotion/deploy proof; conflict or sync-unknown does not become PASS.',
  receipts,
};

console.log(JSON.stringify(summary, null, 2));
writeStepSummary(summary);
writeStepOutputs(summary);

if (blocked > 0 && failOnBlocked) {
  console.error(`${marker}=BLOCKED count=${blocked}`);
  process.exit(2);
}

if (syncUnknown > 0) {
  console.error(`${stitchMarker}=YELLOW sync_unknown=${syncUnknown}`);
}

if (checksFailed > 0) {
  console.error(`CHECKS_OBSERVATION=FAIL count=${checksFailed} (does not rewrite SYNC_VERDICT)`);
} else if (checksUnknownOrPending > 0) {
  console.error(`CHECKS_OBSERVATION=YELLOW unknown_or_pending=${checksUnknownOrPending} (does not rewrite SYNC_VERDICT)`);
}

console.log(`${marker}=PASS requested=${requested} confirmed_or_up_to_date=${confirmed} noop=${noop} skipped=${skipped} blocked=${blocked} sync_unknown=${syncUnknown} checks_failed=${checksFailed} checks_unknown_or_pending=${checksUnknownOrPending}`);
