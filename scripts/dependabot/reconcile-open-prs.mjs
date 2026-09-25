#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

const token = process.env.GITHUB_TOKEN || '';
const repository = process.env.GITHUB_REPOSITORY || 'ServerVpss/CentralDark';
const repoDir = process.env.REPO_DIR || '/root/CentralDark';
const resolver = process.env.RESOLVER || '.ci-house/scripts/dependabot/resolve-conflicts.sh';
const targetPr = Number(process.env.TARGET_PR || 0) || null;
const protectedPrs = new Set(
  String(process.env.PROTECTED_PRS || '1562')
    .split(',')
    .map(v => Number(v.trim()))
    .filter(Number.isFinite),
);

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
  'user-agent': 'CentralDark-House-PR-Reconciler/1.0',
};

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function api(path, { method = 'GET', body } = {}) {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}${path}`, {
    method,
    headers: { ...headers, ...(body ? { 'content-type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
  return { status: response.status, ok: response.ok, data };
}

async function getPr(number) {
  const result = await api(`/pulls/${number}`);
  if (!result.ok) throw new Error(`PR_GET_FAILED #${number} status=${result.status}`);
  return result.data;
}

async function rerunFailedOnce(headSha) {
  const runsResp = await api(`/actions/runs?head_sha=${encodeURIComponent(headSha)}&per_page=100`);
  if (!runsResp.ok) return { requested: 0, reason: `RUNS_HTTP_${runsResp.status}` };
  const failure = new Set(['failure', 'cancelled', 'timed_out', 'action_required', 'startup_failure']);
  let requested = 0;
  for (const run of runsResp.data?.workflow_runs || []) {
    if (run.status !== 'completed') continue;
    if (!failure.has(String(run.conclusion || '').toLowerCase())) continue;
    if (Number(run.run_attempt || 1) >= 2) continue;
    const rerun = await api(`/actions/runs/${run.id}/rerun-failed-jobs`, { method: 'POST' });
    if (rerun.ok || rerun.status === 201) {
      requested += 1;
      console.log(`RERUN_FAILED_JOBS_REQUESTED run=${run.id} head=${headSha}`);
    } else {
      console.log(`RERUN_FAILED_JOBS_SKIPPED run=${run.id} status=${rerun.status}`);
    }
  }
  return { requested, reason: 'DONE' };
}

async function remeasureMergeability(number) {
  let pr = null;
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    pr = await getPr(number);
    if (pr.mergeable !== null) return pr;
    await wait(1500);
  }
  return pr;
}

async function listAll(path, key) {
  const out = [];
  for (let page = 1; page <= 10; page += 1) {
    const sep = path.includes('?') ? '&' : '?';
    const response = await api(`${path}${sep}per_page=100&page=${page}`);
    if (!response.ok) return { ok: false, status: response.status, items: out };
    const batch = Array.isArray(response.data?.[key]) ? response.data[key]
      : Array.isArray(response.data) ? response.data : [];
    out.push(...batch);
    if (batch.length < 100) return { ok: true, status: response.status, items: out };
  }
  return { ok: false, status: 508, items: out };
}

async function dispatchCanonicalOwner(pr) {
  const author = String(pr?.user?.login || '');
  const dependabot = author === 'dependabot[bot]';
  const eventType = dependabot ? 'centraldark_dependabot_reconcile' : 'centraldark_autonomia_recheck';
  const response = await api('/dispatches', {
    method: 'POST',
    body: {
      event_type: eventType,
      client_payload: {
        pr_number: Number(pr?.number || 0),
        head_sha: pr?.head?.sha || null,
        source: 'house_pr_reconciler',
        reconciliation_only: true,
        canonical_promotion_owner: dependabot
          ? '.github/workflows/dependabot-auto-merge.yml'
          : '.github/workflows/autonomia-promocao.yml',
      },
    },
  });
  return {
    ok: response.ok,
    status: response.status,
    event_type: eventType,
    dependabot,
  };
}
const list = await api('/pulls?state=open&per_page=100');
if (!list.ok) {
  console.error(`BLOCKED_LIST_PRS status=${list.status}`);
  process.exit(2);
}

const prs = (list.data || []).filter(pr =>
  pr.head?.repo?.full_name === repository &&
  (!targetPr || Number(pr.number) === targetPr)
);
const summary = [];
let blocked = 0;
let acted = 0;

for (const item of prs) {
  const number = Number(item.number);
  const receipt = {
    pr: number,
    head_ref: item.head?.ref || null,
    head_before: item.head?.sha || null,
    draft: Boolean(item.draft),
    author: item.user?.login || null,
    action: 'NONE',
    state: 'UNKNOWN',
  };

  if (protectedPrs.has(number)) {
    receipt.action = 'SKIP_PROTECTED_PR';
    receipt.state = 'PROTECTED';
    summary.push(receipt);
    console.log(`PR #${number} PROTECTED_SKIP`);
    continue;
  }

  let pr = await remeasureMergeability(number);
  if (!pr || pr.state !== 'open') {
    receipt.action = 'SKIP_NOT_OPEN';
    receipt.state = pr?.state || 'UNKNOWN';
    summary.push(receipt);
    continue;
  }

  const expectedHead = pr.head.sha;
  const update = await api(`/pulls/${number}/update-branch`, {
    method: 'PUT',
    body: { expected_head_sha: expectedHead },
  });

  if (update.status === 202) {
    receipt.action = 'UPDATE_BRANCH_REQUESTED';
    receipt.state = 'SYNCHRONIZING';
    acted += 1;
    summary.push(receipt);
    console.log(`PR #${number} UPDATE_BRANCH_REQUESTED head=${expectedHead}`);
    continue;
  }

  if (update.status !== 422) {
    receipt.action = 'UPDATE_BRANCH_ERROR';
    receipt.state = `HTTP_${update.status}`;
    blocked += 1;
    summary.push(receipt);
    console.error(`PR #${number} UPDATE_BRANCH_ERROR status=${update.status}`);
    continue;
  }

  pr = await remeasureMergeability(number);
  const mergeState = String(pr?.mergeable_state || 'unknown').toLowerCase();
  const conflicting = pr?.mergeable === false || mergeState === 'dirty';

  if (conflicting) {
    console.log(`PR #${number} CONFLICTING -> HOUSE_RESOLVER`);
    const child = spawnSync('bash', [resolver, String(number)], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        PR_HEAD_REF: pr.head.ref,
        REPO_DIR: repoDir,
        GITHUB_TOKEN: token,
      },
      encoding: 'utf8',
    });
    if (child.stdout) process.stdout.write(child.stdout);
    if (child.stderr) process.stderr.write(child.stderr);

    if (child.status === 0) {
      receipt.action = 'CONFLICT_RESOLVED_AND_PUSHED';
      receipt.state = 'NEW_HEAD_EXPECTED';
      acted += 1;
    } else {
      receipt.action = 'CONFLICT_RESOLVER_BLOCKED';
      receipt.state = `RC_${child.status}`;
      blocked += 1;
    }
    summary.push(receipt);
    continue;
  }

  if (pr?.mergeable === null) {
    receipt.action = 'MERGEABILITY_UNKNOWN';
    receipt.state = 'UNKNOWN';
    blocked += 1;
    summary.push(receipt);
    continue;
  }

  const rerun = await rerunFailedOnce(pr.head.sha);
  receipt.reruns = rerun.requested;
  if (rerun.requested > 0) {
    receipt.action = 'RERUN_FAILED_JOBS';
    receipt.state = 'WAIT_NEW_RESULT';
    acted += 1;
    summary.push(receipt);
    continue;
  }

  const routed = await dispatchCanonicalOwner(pr);
  receipt.action = routed.ok
    ? (routed.dependabot ? 'ROUTED_TO_DEPENDABOT_CANONICAL_OWNER' : 'ROUTED_TO_AUTONOMIA_PROMOTER')
    : 'CANONICAL_PROMOTION_DISPATCH_FAILED';
  receipt.state = routed.ok ? 'WAIT_CANONICAL_OWNER' : `HTTP_${routed.status}`;
  receipt.canonical_event = routed.event_type;
  receipt.merge_sha = null;
  if (routed.ok) {
    acted += 1;
    console.log(`PR #${number} RECONCILIATION_COMPLETE route=${routed.event_type} head=${pr.head.sha} direct_merge=0`);
  } else {
    blocked += 1;
    console.error(`PR #${number} CANONICAL_DISPATCH_FAILED event=${routed.event_type} status=${routed.status}`);
  }
  summary.push(receipt);
}

console.log(JSON.stringify({
  repository,
  open_same_repo_prs: prs.length,
  protected_prs: [...protectedPrs],
  acted,
  blocked,
  summary,
}, null, 2));

if (blocked > 0) {
  console.error(`HOUSE_PR_RECONCILE=BLOCKED count=${blocked}`);
  process.exit(2);
}
console.log('HOUSE_PR_RECONCILE=PASS');
