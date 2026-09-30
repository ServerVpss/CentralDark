import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { DEFAULT_REQUIRED_WORKFLOWS, greenDecision, runBelongsToPullHead, selectLatestRun } from '../github-autonomia-green-guard.mjs';

const source = (await readFile(new URL('./reconcile-open-prs.mjs', import.meta.url), 'utf8')).replace(/^#!.*\n/, '').replace(/^import .*;\n/gm, '');
const execute = new (Object.getPrototypeOf(async function(){}).constructor)('process', 'console', 'fetch', 'spawnSync', 'DEFAULT_REQUIRED_WORKFLOWS', 'greenDecision', 'runBelongsToPullHead', 'selectLatestRun', source);
const head = 'a'.repeat(40);
const pr = { number: 10, state: 'open', draft: false, user: { login: 'segredounlock' }, mergeable: true, mergeable_state: 'clean', head: { sha: head, ref: 'fix', repo: { full_name: 'ServerVpss/CentralDark' } }, base: { ref: 'main' } };
const run = (name, conclusion = 'success', number = 2) => ({ id: number, name, run_number: number, run_attempt: 1, head_sha: head, event: 'pull_request', pull_requests: [{number: 10}], status: conclusion === null ? 'queued' : 'completed', conclusion });

async function scenario({ prs = [pr], runs = [], update = 422 } = {}) {
  const calls = [];
  const response = (status, data) => ({status, ok: status >= 200 && status < 300, text: async () => JSON.stringify(data)});
  const fetch = async (url, options) => {
    const path = url.replace('https://api.github.com/repos/ServerVpss/CentralDark', '');
    const body = options.body ? JSON.parse(options.body) : undefined;
    calls.push({path, method: options.method, body});
    if (path.startsWith('/pulls?')) return response(200, prs);
    if (path === '/pulls/10') return response(200, pr);
    if (path.endsWith('/update-branch')) return response(update, {});
    if (path.startsWith('/actions/runs?')) return response(200, {workflow_runs: runs});
    if (path === '/dispatches') return response(204, {});
    if (path.startsWith('/statuses/')) return response(201, {});
    if (path.endsWith('/rerun-failed-jobs')) return response(201, {});
    throw new Error('Unexpected request ' + path);
  };
  await execute({ env: {GITHUB_TOKEN: 'test', GITHUB_REPOSITORY: 'ServerVpss/CentralDark'}, exit: code => { throw new Error('EXIT_' + code); } }, {log(){}, error(){}}, fetch, () => {throw new Error('unexpected conflict resolver');}, DEFAULT_REQUIRED_WORKFLOWS, greenDecision, runBelongsToPullHead, selectLatestRun);
  return calls;
}

test('missing and skipped checks never advertise PASS; route canonical owner', async () => {
  for (const runs of [[], DEFAULT_REQUIRED_WORKFLOWS.map(name => run(name, 'skipped'))]) {
    const calls = await scenario({runs});
    assert.equal(calls.find(c => c.path.startsWith('/statuses/')).body.state, 'failure');
    assert.equal(calls.find(c => c.path === '/dispatches').body.event_type, 'centraldark_autonomia_recheck');
    assert.ok(!calls.some(c => c.path.endsWith('/merge')));
  }
});
test('same-head complete required proof publishes success; pending publishes pending', async () => {
  for (const [conclusion, state] of [['success','success'], [null,'pending']]) {
    const calls = await scenario({runs: DEFAULT_REQUIRED_WORKFLOWS.map(name => run(name, conclusion))});
    assert.equal(calls.find(c => c.path.startsWith('/statuses/')).body.state, state);
  }
});
test('historical failed run after newer success is not rerun', async () => {
  const calls = await scenario({runs: [run('technical', 'failure', 1), run('technical', 'success', 2)]});
  assert.ok(!calls.some(c => c.path.endsWith('/rerun-failed-jobs')));
});
test('successful update explicitly routes canonical owner', async () => {
  const calls = await scenario({update: 202});
  assert.ok(calls.some(c => c.path === '/dispatches'));
});
test('mother, forks and other base never mutate', async () => {
  const calls = await scenario({prs: [{...pr, number: 1562}, {...pr, head: {...pr.head, repo: {full_name: 'external/fork'}}}, {...pr, base: {ref: 'dev'}}]});
  assert.equal(calls.filter(c => c.method !== 'GET').length, 0);
});
test('other HEAD and other event do not prove current PR', async () => {
  for (const patch of [{head_sha: 'b'.repeat(40)}, {event: 'workflow_dispatch'}, {pull_requests: [{number: 11}]}]) {
    const calls = await scenario({runs: DEFAULT_REQUIRED_WORKFLOWS.map(name => ({...run(name), ...patch}))});
    assert.equal(calls.find(c => c.path.startsWith('/statuses/')).body.state, 'failure');
  }
});
