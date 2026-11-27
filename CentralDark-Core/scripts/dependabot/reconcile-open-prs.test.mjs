import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { DEFAULT_REQUIRED_WORKFLOWS, greenDecision, runBelongsToPullHead, selectLatestRun } from '../github-autonomia-green-guard.mjs';

const source = (await readFile(new URL('./reconcile-open-prs.mjs', import.meta.url), 'utf8')).replace(/^#![^\r\n]*\r?\n/, '').replace(/^import [^\r\n]*;\r?\n/gm, '');
const execute = new (Object.getPrototypeOf(async function(){}).constructor)('process', 'console', 'fetch', 'spawnSync', 'DEFAULT_REQUIRED_WORKFLOWS', 'greenDecision', 'runBelongsToPullHead', 'selectLatestRun', source);
test('conflict caller requires explicit COSTURA apply', () => {
  assert.match(source, /spawnSync\('bash', \[resolver, '--apply', String\(number\)\]/);
});

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

test('existing approval owner requires authorized human, same repo, current scope; protects mother', async () => {
  const workflow = await readFile(new URL('../../.github/workflows/dependabot-auto-merge.yml', import.meta.url), 'utf8');
  const block = workflow.slice(workflow.indexOf('            function authorizedCandidate(pr) {'));
  const body = block.slice(0, block.indexOf('            const marker ='));
  const candidate = new Function('repository', 'authorizationFor', body + '; return authorizedCandidate;')('ServerVpss/CentralDark', p => ({authorized: p.authorized === true}));
  assert.equal(candidate({...pr, authorized: true}), true);
  assert.equal(candidate({...pr, authorized: false}), false);
  assert.equal(candidate({...pr, authorized: true, number: 1562}), false);
  assert.equal(candidate({...pr, authorized: true, draft: true}), false);
  assert.equal(candidate({...pr, authorized: true, user: {login: 'external'}}), false);
  assert.equal(candidate({...pr, authorized: true, head: {...pr.head, repo: {full_name: 'other/fork'}}}), false);
  assert.equal(candidate({...pr, user: {login: 'dependabot[bot]'}}), true);
});

async function reconcileOnlyCase({initial = pr, afterUpdate = initial, updatedHead = null, update = 422, childStatus = 0, env = {}} = {}) {
  const calls = [], children = [];
  let live = initial;
  const response = (status, data) => ({status, ok: status >= 200 && status < 300, text: async () => JSON.stringify(data)});
  const fetch = async (url, options) => {
    const path = url.replace('https://api.github.com/repos/ServerVpss/CentralDark', '');
    calls.push({path, method: options.method, body: options.body && JSON.parse(options.body)});
    if (path.startsWith('/pulls?')) return response(200, [initial]);
    if (path === '/pulls/' + initial.number) return response(200, live);
    if (path.endsWith('/update-branch')) { live = afterUpdate; return response(update, {}); }
    throw new Error('Unexpected side effect: ' + path);
  };
  let exit = 0;
  try {
    await execute({cwd:()=>'/fixture', stdout:{write(){}}, stderr:{write(){}},
      env: {GITHUB_TOKEN:'fixture', GITHUB_REPOSITORY:'ServerVpss/CentralDark', COSTURA_RECONCILIATION_ONLY:'1', ...env},
      exit: code => { throw new Error('EXIT_' + code); }}, {log(){},error(){}}, fetch,
      (command,args,opts) => {
        children.push({command,args,env:opts.env});
        if (updatedHead) live = {...live,head:{...live.head,sha:updatedHead}};
        return {status:childStatus, stdout:updatedHead ? 'RESOLVED_AND_PUSHED pr=10 head_ref=fix head='+updatedHead : ''};
      }, DEFAULT_REQUIRED_WORKFLOWS, greenDecision, runBelongsToPullHead, selectLatestRun);
  } catch (e) {
    if (!/^EXIT_\d+$/.test(e.message)) throw e;
    exit = Number(e.message.slice(5));
  }
  return {calls,children,exit};
}
test('root COSTURA protects draft, ledger, forks, and clean PRs', async () => {
  for (const initial of [pr,{...pr,draft:true},{...pr,number:1977},{...pr,user:{login:'external'}},
    {...pr,head:{...pr.head,repo:{full_name:'other/fork'}}}]) {
    const r=await reconcileOnlyCase({initial});
    assert.equal(r.calls.filter(c=>c.method!=='GET').length,0);
    assert.equal(r.children.length,0);
  }
});
test('root COSTURA requests native update without status or promotion', async () => {
  const r=await reconcileOnlyCase({initial:{...pr,mergeable_state:'behind'},update:202});
  assert.equal(r.calls.filter(c=>c.method!=='GET').length,1);
  assert.equal(r.children.length,0);
});
test('root COSTURA pins SHA and compatible-only guard; verifies changed head', async () => {
  const dirty={...pr,mergeable:false,mergeable_state:'dirty'};
  const r=await reconcileOnlyCase({initial:dirty,updatedHead:'b'.repeat(40)});
  assert.equal(r.exit,0);
  assert.equal(r.children.length,1);
  assert.equal(r.children[0].env.COSTURA_EXPECTED_PR_SHA,head);
  assert.equal(r.children[0].env.COSTURA_COMPATIBLE_ONLY,'1');
  assert.equal(r.calls.filter(c=>c.method!=='GET').length,1);
});
test('root COSTURA does not apply stale or unverified resolution', async () => {
  const dirty={...pr,mergeable:false,mergeable_state:'dirty'};
  const stale=await reconcileOnlyCase({initial:dirty,afterUpdate:{...dirty,head:{...dirty.head,sha:'c'.repeat(40)}}});
  assert.equal(stale.children.length,0);
  const unverified=await reconcileOnlyCase({initial:dirty});
  assert.equal(unverified.exit,2);
  const unknown=await reconcileOnlyCase({initial:dirty,childStatus:20});
  assert.equal(unknown.exit,2);
});
