import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync, readdirSync, chmodSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';

const writer = join(dirname(fileURLToPath(import.meta.url)), 'writer-safe-push-main.sh');
const shell = process.env.BASH_BIN || 'bash';
const python = process.env.PYTHON_BIN || (process.platform === 'win32' ? 'python' : 'python3');
// Git Bash receives POSIX-style separators; Node filesystem APIs keep native paths.
const shellPath = value => process.platform === 'win32' ? value.replaceAll('\\', '/') : value;
const responseContract = [
  'CHEFE_SYSTEMATIC_PROOF_REQUIRED=true',
  'SYSTEMATIC_PROOF_REQUIRED_FOR_MATERIAL_CONFIRMATIONS=true',
  'CONFIRMATIONS_ONE_TOPIC_BELOW_ANOTHER=true',
  'CONFIRMATIONS_MUST_INCLUDE_ALL_MATERIAL_PROVEN_ITEMS_IN_SCOPE=true',
  'PROOF_REF_REQUIRED_FOR_PROVEN=true',
  'SAME_TARGET_PROOF_REQUIRED=true',
  'SAME_HEAD_REQUIRED_FOR_GIT_CLAIMS=true',
  'SOURCE_ROLE_MUST_BE_QUALIFIED=true',
  'NO_REGRESSION_OF_EXISTING_RESPONSE_LAYERS=true',
  'EXISTING_PROVEN_FORMATS_REMAIN_REQUIRED=true',
  'EVIDENCE_MUST_MATCH_CLAIM=true',
  'ZERO_TRUST_FOR_MATERIAL_CLAIMS=true',
  'GREEN_WITHOUT_RECONSTRUCTIBLE_PROOF=INCOMPLETE',
].join('\n') + '\n';

function put(root, path, content) {
  const target = join(root, path);
  mkdirSync(dirname(target), {recursive: true});
  writeFileSync(target, content);
}

function fixture(t, {monorepo = true} = {}) {
  const root = mkdtempSync(join(tmpdir(), 'centraldark-writer-test-'));
  t.after(() => rmSync(root, {recursive: true, force: true}));
  const source = join(root, 'source'), remote = join(root, 'origin.git');
  const peer = join(root, 'peer'), temp = join(root, 'temp');
  const gateLog = join(root, 'gate-log');
  for (const p of [source, temp]) mkdirSync(p);
  const env = {...process.env};
  for (const key of Object.keys(env)) if (key.startsWith('GIT_')) delete env[key];
  put(root, 'gitconfig', '');
  Object.assign(env, {GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: join(root, 'gitconfig'),
    GIT_TERMINAL_PROMPT: '0', TEST_GATE_LOG: gateLog});
  function git(args, cwd = source) {
    const p = spawnSync('git', args, {cwd, env, encoding: 'utf8', timeout: 15_000});
    assert.equal(p.status, 0, `git ${args.join(' ')}\n${p.stdout}\n${p.stderr}`);
    return p.stdout.trim();
  }
  git(['init', '--bare', '--initial-branch=main', remote], root);
  git(['init', '--initial-branch=main', source], root);
  git(['config', 'user.name', 'User preserved']);
  git(['config', 'user.email', 'user@example.invalid']);
  const prefix = monorepo ? 'CentralDark-Core/' : '';
  put(source, prefix + 'CENTRALDARK_AI_BOOT.yaml', 'fixture: true\n');
  put(source, prefix + 'docs/CONSCIENCIA/PADRAO-RESPOSTA-SEGREDO-CHEFE.md', responseContract);
  put(source, prefix + 'scripts/trigger-fabric/verify_repo_contract.py',
    'from pathlib import Path\nimport os, sys\nassert Path(sys.argv[1], "CENTRALDARK_AI_BOOT.yaml").is_file()\nwith open(os.environ["TEST_GATE_LOG"], "a") as f: f.write("python\\n")\n');
  for (const gate of ['validar-continuidade-global.mjs', 'validar-porta-de-entrada.mjs']) {
    put(source, prefix + 'scripts/lupa/' + gate, `
import {existsSync, appendFileSync} from 'node:fs';
import {resolve} from 'node:path';
if (!existsSync('CENTRALDARK_AI_BOOT.yaml')) process.exit(11);
const top = resolve(${JSON.stringify(monorepo ? '..' : '.')});
if (process.env.EXPECT_SPARSE === '1' && existsSync(resolve(top, 'omitted-large/data'))) process.exit(12);
appendFileSync(process.env.TEST_GATE_LOG, ${JSON.stringify(gate + '\n')});
if (process.env.FAIL_GATE === ${JSON.stringify(gate)}) process.exit(23);
`);
  }
  put(source, '.github/actions.lock', 'original lock\n');
  put(source, prefix + 'docs/note.md', 'original note\n');
  put(source, 'omitted-large/data', 'do not materialize or erase\n');
  put(source, 'user.txt', 'original user work\n');
  git(['add', '.']);
  git(['commit', '-m', 'fixture base']);
  git(['remote', 'add', 'origin', remote]);
  git(['push', 'origin', 'main']);
  const base = git(['rev-parse', 'HEAD']);
  git(['clone', remote, peer], root);
  git(['config', 'user.name', 'Other writer'], peer);
  git(['config', 'user.email', 'other@example.invalid'], peer);
  // Preserve dirty staged and untracked work while publishing another scope.
  put(source, 'user.txt', 'staged user work\n');
  git(['add', 'user.txt']);
  put(source, 'user-untracked.txt', 'untracked user work\n');
  put(source, '.github/actions.lock', 'new verified lock\n');
  put(source, prefix + 'docs/note.md', 'new verified note\n');
  const index = readFileSync(join(source, '.git/index'));
  const config = readFileSync(join(source, '.git/config'));
  function advance(path, text) {
    put(peer, path, text);
    git(['add', '--', path], peer);
    git(['commit', '-m', 'concurrent update'], peer);
    git(['push', 'origin', 'HEAD:main'], peer);
    return git(['rev-parse', 'HEAD'], peer);
  }
  function run(extra = {}) {
    return spawnSync(shell, [shellPath(writer)], {cwd: source, encoding: 'utf8', timeout: 30_000,
      env: {...env, WRITER_TAG: 'TEST_MAIN', COMMIT_MESSAGE: 'verified scoped delta',
        SOURCE_ROOT: shellPath(source), PAYLOAD_BASE_SHA: base, RUNNER_TEMP: shellPath(temp), PYTHON_BIN: shellPath(python),
        WRITER_SPARSE: '1', EXPECT_SPARSE: '1', MAX_TRIES: '2',
        PATHS: `.github/actions.lock ${prefix}docs/note.md`, ...extra}});
  }
  function preserved(worktreeCount = 1) {
    assert.equal(git(['rev-parse', 'HEAD']), base);
    assert.deepEqual(readFileSync(join(source, '.git/index')), index);
    assert.deepEqual(readFileSync(join(source, '.git/config')), config);
    assert.equal(readFileSync(join(source, 'user-untracked.txt'), 'utf8'), 'untracked user work\n');
    assert.equal(readFileSync(join(source, 'user.txt'), 'utf8'), 'staged user work\n');
    assert.equal(git(['worktree', 'list', '--porcelain']).split('\n').filter(x => x.startsWith('worktree ')).length, worktreeCount);
    assert.deepEqual(readdirSync(temp), []);
  }
  function remoteFile(path) { return git(['--git-dir', remote, 'show', 'main:' + path], root); }
  return {root, source, peer, remote, temp, env, prefix, base, gateLog, git, run, advance, preserved, remoteFile};
}

test('monorepo sparse writer preserves dirty Casa, identity and unrelated remote advance', t => {
  const f = fixture(t);
  f.advance('another-owner.txt', 'another writer contribution\n');
  const r = f.run();
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /REMOTE_HEAD_VERIFIED=[a-f0-9]{40}/);
  assert.equal(f.remoteFile('.github/actions.lock'), 'new verified lock');
  assert.equal(f.remoteFile(f.prefix + 'docs/note.md'), 'new verified note');
  assert.equal(f.remoteFile('another-owner.txt'), 'another writer contribution');
  assert.equal(f.remoteFile('omitted-large/data'), 'do not materialize or erase');
  assert.deepEqual(readFileSync(f.gateLog, 'utf8').trim().split(/\r?\n/),
    ['python', 'validar-continuidade-global.mjs', 'validar-porta-de-entrada.mjs']);
  f.preserved();
});

test('changed remote blob in the payload scope blocks without overwrite', t => {
  const f = fixture(t);
  const concurrent = f.advance(f.prefix + 'docs/note.md', 'new contribution from peer\n');
  const r = f.run();
  assert.equal(r.status, 21, r.stdout + r.stderr);
  assert.match(r.stdout + r.stderr, /BLOCKED_SCOPED_DRIFT/);
  assert.equal(f.git(['--git-dir', f.remote, 'rev-parse', 'main'], f.root), concurrent);
  assert.equal(f.remoteFile('.github/actions.lock'), 'original lock');
  assert.equal(f.remoteFile(f.prefix + 'docs/note.md'), 'new contribution from peer');
  assert.equal(existsSync(f.gateLog), false);
  f.preserved();
});

test('push race retries against immutable payload base and preserves competing content', t => {
  const f = fixture(t);
  const hookHelper = join(f.root, 'race.mjs');
  put(f.root, 'race.mjs', `
import {existsSync, writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const marker = ${JSON.stringify(join(f.root, 'race-fired'))};
if (!existsSync(marker)) {
  writeFileSync(marker, 'fired');
  const env = {...process.env};
  for (const key of Object.keys(env)) if (key.startsWith('GIT_')) delete env[key];
  env.GIT_CONFIG_NOSYSTEM = '1'; env.GIT_CONFIG_GLOBAL = ${JSON.stringify(join(f.root, 'gitconfig'))};
  writeFileSync(${JSON.stringify(join(f.peer, f.prefix + 'docs/note.md'))}, 'concurrent during push\\n');
  for (const args of [['add', '--', ${JSON.stringify(f.prefix + 'docs/note.md')}], ['commit', '-m', 'race'], ['push', 'origin', 'HEAD:main']]) {
    const p = spawnSync('git', args, {cwd: ${JSON.stringify(f.peer)}, env, encoding:'utf8'});
    if (p.status !== 0) { process.stderr.write(p.stderr || 'race setup failed'); process.exit(9); }
  }
}
`);
  const shellQuote = value => "'" + value.replaceAll("'", "'\\''") + "'";
  const hook = join(f.source, '.git/hooks/pre-push');
  put(f.source, '.git/hooks/pre-push', `#!/bin/sh\nexec ${shellQuote(shellPath(process.execPath))} ${shellQuote(shellPath(hookHelper))}\n`);
  chmodSync(hook, 0o755);
  const r = f.run();
  assert.equal(r.status, 21, r.stdout + r.stderr);
  assert.match(r.stdout, /PUSH_REJECTED/);
  assert.match(r.stdout + r.stderr, /BLOCKED_SCOPED_DRIFT/);
  assert.equal(f.remoteFile(f.prefix + 'docs/note.md'), 'concurrent during push');
  assert.equal(f.remoteFile('.github/actions.lock'), 'original lock');
  f.preserved();
});

test('legacy layout still runs all gates and publishes from its root', t => {
  const f = fixture(t, {monorepo: false});
  const r = f.run();
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.equal(f.remoteFile('docs/note.md'), 'new verified note');
  f.preserved();
});

test('failed gate never pushes and removes only task-owned worktree', t => {
  const f = fixture(t);
  const unrelated = join(f.root, 'unrelated-worktree');
  f.git(['worktree', 'add', '--detach', unrelated, f.base]);
  put(unrelated, 'other-user.txt', 'unrelated worktree must remain\n');
  const r = f.run({FAIL_GATE: 'validar-porta-de-entrada.mjs'});
  assert.equal(r.status, 23, r.stdout + r.stderr);
  assert.doesNotMatch(r.stdout, /REMOTE_HEAD_VERIFIED/);
  assert.equal(f.git(['--git-dir', f.remote, 'rev-parse', 'main'], f.root), f.base);
  assert.equal(f.remoteFile('.github/actions.lock'), 'original lock');
  assert.equal(readFileSync(join(unrelated, 'other-user.txt'), 'utf8'), 'unrelated worktree must remain\n');
  f.preserved(2);
});
