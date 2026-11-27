#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { DEFAULT_REQUIRED_WORKFLOWS, greenDecision, runBelongsToPullHead, selectLatestRun } from '../github-autonomia-green-guard.mjs';

const token = process.env.GITHUB_TOKEN || '';
const repository = process.env.GITHUB_REPOSITORY || 'ServerVpss/CentralDark';
const repoDir = process.env.REPO_DIR || '/root/CentralDark';
const resolver = process.env.RESOLVER || '.ci-house/scripts/dependabot/resolve-conflicts.sh';
const rawTarget = process.env.TARGET_PR || '';
const reconciliationOnly = process.env.COSTURA_RECONCILIATION_ONLY === '1';
if (reconciliationOnly && rawTarget && !/^[1-9][0-9]*$/.test(rawTarget)) {
  console.error('BLOCKED_INVALID_TARGET_PR');
  process.exit(2);
}
const targetPr = Number(rawTarget || 0) || null;
const protectedPrs = new Set(
  String(process.env.PROTECTED_PRS || '1562')
    .split(',')
    .map(v => Number(v.trim()))
    .filter(Number.isFinite),
);

if (reconciliationOnly) {
  for (const ledger of [1562, 1757, 1977]) protectedPrs.add(ledger);
}
function reconciliationEligible(pr) {
  return pr?.state === 'open' && !pr.draft && !protectedPrs.has(Number(pr.number)) &&
    pr.head?.repo?.full_name === repository && pr.base?.ref === 'main' &&
    Boolean(pr.head?.ref) && pr.head.ref !== 'main' &&
    /^[0-9a-f]{40}$/.test(pr.head?.sha || '') &&
    ['segredounlock', 'dependabot[bot]'].includes(pr.user?.login);
}

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

async function rerunFailedOnce(headSha, prNumber) {
  const runsResp = await api(`/actions/runs?head_sha=${encodeURIComponent(headSha)}&per_page=100`);
  if (!runsResp.ok) return { requested: 0, reason: `RUNS_HTTP_${runsResp.status}` };
  const scopedRuns = (runsResp.data?.workflow_runs || [])
    .filter(run => runBelongsToPullHead(run, prNumber, headSha));
  const latest = [...new Set(scopedRuns.map(run => run.name))]
    .map(name => selectLatestRun(scopedRuns, name));
  const failure = new Set(['failure', 'cancelled', 'timed_out', 'action_required', 'startup_failure']);
  let requested = 0;
  for (const run of latest) {
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
async function measureProof(pr) {
  const response = await listAll('/actions/runs?head_sha=' + encodeURIComponent(pr.head.sha) + '&event=pull_request', 'workflow_runs');
  if (!response.ok) return { green: false, state: 'UNKNOWN', http_status: response.status };
  const runs = response.items.filter(run => runBelongsToPullHead(run, pr.number, pr.head.sha));
  const proof = greenDecision(runs, DEFAULT_REQUIRED_WORKFLOWS);
  return { ...proof, state: proof.green ? 'PASS' : 'DEFERRED', head: pr.head.sha };
}

const list = await listAll('/pulls?state=open');
if (!list.ok) {
  console.error(`BLOCKED_LIST_PRS status=${list.status}`);
  process.exit(2);
}

const prs = (list.items || []).filter(pr =>
  pr.head?.repo?.full_name === repository &&
  pr.base?.ref === 'main' &&
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

  if (reconciliationOnly) {
    if (!reconciliationEligible(pr)) {
      receipt.action = 'SKIP_OUTSIDE_RECONCILIATION_SCOPE';
      receipt.state = 'PROTECTED';
      summary.push(receipt);
      continue;
    }
    if (pr.mergeable === null || pr.mergeable === undefined) {
      receipt.action = 'MERGEABILITY_UNKNOWN';
      receipt.state = 'UNKNOWN';
      blocked += 1;
      summary.push(receipt);
      continue;
    }
    if (pr.mergeable !== false && !['dirty', 'behind'].includes(pr.mergeable_state)) {
      receipt.action = 'SKIP_NO_RECONCILIATION_NEEDED';
      receipt.state = 'NOOP';
      summary.push(receipt);
      continue;
    }
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
    if (reconciliationOnly) {
      receipt.state = 'SYNCHRONIZING_AWAIT_READBACK_AND_CI';
      summary.push(receipt);
      continue;
    }
    // A atualização pode suprimir synchronize com GITHUB_TOKEN; reentrar no owner explicitamente.
    const routed = await dispatchCanonicalOwner(await getPr(number));
    receipt.canonical_event = routed.event_type;
    receipt.route_status = routed.status;
    if (!routed.ok) blocked += 1;
    summary.push(receipt);
    console.log(`PR #${number} UPDATE_BRANCH_REQUESTED head=${expectedHead} route=${routed.event_type} status=${routed.status}`);
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
  if (reconciliationOnly && (!reconciliationEligible(pr) || pr.head.sha !== expectedHead)) {
    receipt.action = 'SKIP_SOURCE_CHANGED';
    receipt.state = 'DEFERRED';
    summary.push(receipt);
    continue;
  }
  const mergeState = String(pr?.mergeable_state || 'unknown').toLowerCase();
  const conflicting = pr?.mergeable === false || mergeState === 'dirty';

  if (conflicting) {
    console.log(`PR #${number} CONFLICTING -> HOUSE_RESOLVER`);
    const child = spawnSync('bash', [resolver, '--apply', String(number)], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        PR_HEAD_REF: pr.head.ref,
        REPO_DIR: repoDir,
        GITHUB_TOKEN: token,
        ...(reconciliationOnly ? {
          COSTURA_COMPATIBLE_ONLY: '1',
          COSTURA_EXPECTED_PR_SHA: expectedHead,
        } : {}),
      },
      encoding: 'utf8',
    });
    if (child.stdout) process.stdout.write(child.stdout);
    if (child.stderr) process.stderr.write(child.stderr);

    if (reconciliationOnly && child.status === 0) {
      const live = await getPr(number);
      const claimedHead = (child.stdout || '').match(/RESOLVED_AND_PUSHED pr=\d+ head_ref=\S+ head=([0-9a-f]{40})/)?.[1];
      if (claimedHead && claimedHead === live.head?.sha && claimedHead !== expectedHead) {
        receipt.action = 'CONFLICT_RESOLUTION_HEAD_VERIFIED';
        receipt.state = 'AWAIT_SAME_HEAD_CI';
        receipt.head_after = claimedHead;
        acted += 1;
      } else {
        receipt.action = 'CONFLICT_RESOLUTION_READBACK_PENDING';
        receipt.state = 'UNKNOWN';
        blocked += 1;
      }
    } else if (child.status === 0) {
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

  if (reconciliationOnly) {
    receipt.action = 'NO_CONFLICT_AFTER_REMEASURE';
    receipt.state = 'AWAIT_SAME_HEAD_CI';
    summary.push(receipt);
    continue;
  }
  receipt.proof = await measureProof(pr);
  console.log(`PR #${number} REQUIRED_PROOF=${receipt.proof.state} head=${pr.head.sha} verdicts=${JSON.stringify(receipt.proof.verdicts || [])}`);
  const proofState = receipt.proof.green ? 'success'
    : receipt.proof.verdicts?.some(v => ['MISSING', 'SKIPPED', 'FAIL', 'ACTION_REQUIRED'].includes(v.state)) ? 'failure' : 'pending';
  const advertised = await api('/statuses/' + pr.head.sha, {
    method: 'POST',
    body: {
      state: proofState, context: 'centraldark/required-proof',
      description: receipt.proof.green ? '8 gates obrigatórios PASS no mesmo PR/HEAD'
        : (receipt.proof.verdicts || []).filter(v => v.state !== 'PASS').map(v => v.state).join('|').slice(0, 140) || 'UNKNOWN: prova não recuperada',
      target_url: pr.html_url || 'https://github.com/' + repository + '/pull/' + number,
    },
  });
  receipt.proof_status = advertised.status;
  if (!advertised.ok) { blocked += 1; console.error('REQUIRED_PROOF_STATUS_FAILED pr=' + number + ' status=' + advertised.status); }
  const rerun = await rerunFailedOnce(pr.head.sha, pr.number);
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
