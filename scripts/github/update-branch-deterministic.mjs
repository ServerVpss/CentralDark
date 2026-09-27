#!/usr/bin/env node

const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
const repository = process.env.GITHUB_REPOSITORY || 'ServerVpss/CentralDark';
const baseBranch = process.env.BASE_BRANCH || 'main';
const targetPr = Number(process.env.TARGET_PR || process.env.PR_NUMBER || 0) || null;
const includeProtected = String(process.env.UPDATE_BRANCH_INCLUDE_PROTECTED || 'true').toLowerCase() === 'true';
const failOnBlocked = String(process.env.UPDATE_BRANCH_FAIL_ON_BLOCKED || 'true').toLowerCase() === 'true';
const protectedPrs = new Set(
  String(process.env.UPDATE_BRANCH_PROTECTED_PRS || '')
    .split(',')
    .map(v => Number(v.trim()))
    .filter(Number.isFinite),
);

const marker = 'CENTRALDARK_ANY_PR_UPDATE_BRANCH_DETERMINISTIC';

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
  'user-agent': 'CentralDark-Any-PR-Update-Branch/1.0',
};

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

function skipReason(pr) {
  if (!pr || pr.state !== 'open') return 'NOT_OPEN';
  if (pr.base?.ref !== baseBranch) return `BASE_NOT_${baseBranch}`;
  if (!pr.head?.sha) return 'HEAD_SHA_UNKNOWN';
  if (pr.head?.ref === pr.base?.ref) return 'HEAD_IS_BASE';
  if (!includeProtected && protectedPrs.has(Number(pr.number))) return 'PROTECTED_PR';
  if (pr.head?.repo?.full_name !== repository) return 'HEAD_REPO_NOT_SAME_REPO';
  return null;
}

async function processPr(pr) {
  const number = Number(pr.number);
  const receipt = {
    pr: number,
    base: pr.base?.ref || null,
    head_ref: pr.head?.ref || null,
    head_before: pr.head?.sha || null,
    action: 'NONE',
    state: 'UNKNOWN',
    compare_before: null,
  };

  const reason = skipReason(pr);
  if (reason) {
    receipt.action = 'SKIP';
    receipt.state = reason;
    return receipt;
  }

  const before = await compareBaseToHead(pr);
  receipt.compare_before = before;
  if (before.ok && before.behind_by === 0) {
    receipt.action = 'NOOP';
    receipt.state = 'UP_TO_DATE_WITH_MAIN';
    return receipt;
  }

  const expectedHead = pr.head.sha;
  const update = await api(`/pulls/${number}/update-branch`, {
    method: 'PUT',
    body: { expected_head_sha: expectedHead },
  });

  if (update.status === 202) {
    receipt.action = 'PUT_UPDATE_BRANCH';
    receipt.state = 'UPDATE_BRANCH_REQUESTED';
    receipt.endpoint = `PUT /pulls/${number}/update-branch`;
    return receipt;
  }

  if (update.status === 422) {
    const current = await getPr(number);
    const after = await compareBaseToHead(current);
    receipt.compare_after_422 = after;
    const mergeState = String(current.mergeable_state || 'unknown').toLowerCase();
    if (after.ok && after.behind_by === 0) {
      receipt.action = 'NOOP_AFTER_REMEASURE';
      receipt.state = 'UP_TO_DATE_WITH_MAIN';
    } else if (current.mergeable === false || mergeState === 'dirty') {
      receipt.action = 'BLOCKED';
      receipt.state = 'CONFLICT_REQUIRES_EXISTING_RESOLVER';
    } else if (current.mergeable === null) {
      receipt.action = 'BLOCKED';
      receipt.state = 'MERGEABILITY_UNKNOWN';
    } else {
      receipt.action = 'BLOCKED';
      receipt.state = 'UPDATE_BRANCH_422_NOT_UP_TO_DATE';
    }
    receipt.endpoint = `PUT /pulls/${number}/update-branch`;
    return receipt;
  }

  receipt.action = 'BLOCKED';
  receipt.state = `UPDATE_BRANCH_HTTP_${update.status}`;
  receipt.endpoint = `PUT /pulls/${number}/update-branch`;
  receipt.error = update.data?.message || update.data?.raw || null;
  return receipt;
}

const prs = targetPr ? [await getPr(targetPr)] : await listOpenPrs();
const receipts = [];
for (const pr of prs) {
  try {
    const receipt = await processPr(pr);
    receipts.push(receipt);
    console.log(JSON.stringify({ marker, ...receipt }));
  } catch (error) {
    const receipt = {
      pr: Number(pr?.number || targetPr || 0),
      action: 'BLOCKED',
      state: 'EXCEPTION',
      error: error?.message || String(error),
    };
    receipts.push(receipt);
    console.log(JSON.stringify({ marker, ...receipt }));
  }
}

const blocked = receipts.filter(r => r.action === 'BLOCKED').length;
const requested = receipts.filter(r => r.action === 'PUT_UPDATE_BRANCH').length;
const noop = receipts.filter(r => String(r.state || '').includes('UP_TO_DATE')).length;
const skipped = receipts.filter(r => r.action === 'SKIP').length;

const summary = {
  marker,
  repository,
  base_branch: baseBranch,
  target_pr: targetPr,
  total: receipts.length,
  requested,
  noop,
  skipped,
  blocked,
  rule: 'PUT /pulls/{PR}/update-branch only when PR is behind main; update is sync, not approval; conflict/unknown does not become PASS.',
  receipts,
};

console.log(JSON.stringify(summary, null, 2));

if (blocked > 0 && failOnBlocked) {
  console.error(`${marker}=BLOCKED count=${blocked}`);
  process.exit(2);
}

console.log(`${marker}=PASS requested=${requested} noop=${noop} skipped=${skipped} blocked=${blocked}`);
