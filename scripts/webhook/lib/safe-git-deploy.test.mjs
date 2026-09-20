import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { safeUpdateFromOrigin } from './safe-git-deploy.mjs';

function git(cwd, ...args) {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'centraldark-safe-git-'));
  const remote = join(root, 'remote.git');
  const source = join(root, 'source');
  const local = join(root, 'local');

  await mkdir(source, { recursive: true });
  git(root, 'init', '--bare', remote);
  git(source, 'init');
  git(source, 'config', 'user.name', 'CentralDark Test');
  git(source, 'config', 'user.email', 'centraldark-test@example.invalid');
  await writeFile(join(source, 'state.txt'), 'base\n');
  git(source, 'add', 'state.txt');
  git(source, 'commit', '-m', 'base');
  const baseSha = git(source, 'rev-parse', 'HEAD');
  git(source, 'branch', '-M', 'main');
  git(source, 'remote', 'add', 'origin', remote);
  git(source, 'push', '-u', 'origin', 'main');
  git(remote, 'symbolic-ref', 'HEAD', 'refs/heads/main');

  git(root, 'clone', remote, local);
  git(local, 'config', 'user.name', 'CentralDark Test');
  git(local, 'config', 'user.email', 'centraldark-test@example.invalid');
  await mkdir(join(local, 'apps', 'modulos', 'telepainel'), { recursive: true });

  return { root, remote, source, local, baseSha, nested: join(local, 'apps', 'modulos', 'telepainel') };
}

async function remoteCommit(fx, content, message = 'remote delta') {
  await writeFile(join(fx.source, 'state.txt'), `${content}\n`);
  git(fx.source, 'add', 'state.txt');
  git(fx.source, 'commit', '-m', message);
  git(fx.source, 'push', 'origin', 'main');
  return git(fx.source, 'rev-parse', 'HEAD');
}

test('clean behind: observa e aplica somente fast-forward, mesmo chamado de subdiretório', async () => {
  const fx = await fixture();
  const remoteSha = await remoteCommit(fx, 'remote-v2');
  const logs = [];

  const result = await safeUpdateFromOrigin({ repoPath: fx.nested, branch: 'main', log: (line) => logs.push(line) });

  assert.equal(result.ok, true);
  assert.equal(result.changed, true);
  assert.equal(result.remoteSha, remoteSha);
  assert.equal(git(fx.local, 'rev-parse', 'HEAD'), remoteSha);
  assert.equal((await readFile(join(fx.local, 'state.txt'), 'utf8')).replace(/\r\n/g, '\n'), 'remote-v2\n');
  assert.match(logs.join('\n'), /PASS fast-forward/);
});

test('dirty worktree: bloqueia sem stash/reset e preserva bytes locais', async () => {
  const fx = await fixture();
  await remoteCommit(fx, 'remote-v2');
  await writeFile(join(fx.local, 'state.txt'), 'minha alteração local\n');
  const beforeHead = git(fx.local, 'rev-parse', 'HEAD');

  const result = await safeUpdateFromOrigin({ repoPath: fx.local, branch: 'main' });

  assert.equal(result.ok, false);
  assert.equal(result.reason, 'DIRTY_WORKTREE');
  assert.equal(git(fx.local, 'rev-parse', 'HEAD'), beforeHead);
  assert.equal(await readFile(join(fx.local, 'state.txt'), 'utf8'), 'minha alteração local\n');
});

test('untracked worktree: bloqueia em vez de arriscar colisão de caminho', async () => {
  const fx = await fixture();
  await remoteCommit(fx, 'remote-v2');
  await writeFile(join(fx.local, 'rascunho-local.txt'), 'preservar\n');

  const result = await safeUpdateFromOrigin({ repoPath: fx.local, branch: 'main' });

  assert.equal(result.ok, false);
  assert.equal(result.reason, 'DIRTY_WORKTREE');
  assert.equal(await readFile(join(fx.local, 'rascunho-local.txt'), 'utf8'), 'preservar\n');
});

test('local ahead: bloqueia e preserva commit local não publicado', async () => {
  const fx = await fixture();
  await writeFile(join(fx.local, 'local-only.txt'), 'ouro local\n');
  git(fx.local, 'add', 'local-only.txt');
  git(fx.local, 'commit', '-m', 'local only');
  const localSha = git(fx.local, 'rev-parse', 'HEAD');

  const result = await safeUpdateFromOrigin({ repoPath: fx.local, branch: 'main' });

  assert.equal(result.ok, false);
  assert.equal(result.reason, 'LOCAL_AHEAD');
  assert.equal(git(fx.local, 'rev-parse', 'HEAD'), localSha);
  assert.equal(await readFile(join(fx.local, 'local-only.txt'), 'utf8'), 'ouro local\n');
});

test('divergência: bloqueia e não escolhe merge/rebase pelo humano', async () => {
  const fx = await fixture();
  await writeFile(join(fx.local, 'local-only.txt'), 'local\n');
  git(fx.local, 'add', 'local-only.txt');
  git(fx.local, 'commit', '-m', 'local delta');
  const localSha = git(fx.local, 'rev-parse', 'HEAD');
  await remoteCommit(fx, 'remote-v2');

  const result = await safeUpdateFromOrigin({ repoPath: fx.local, branch: 'main' });

  assert.equal(result.ok, false);
  assert.equal(result.reason, 'DIVERGED');
  assert.equal(git(fx.local, 'rev-parse', 'HEAD'), localSha);
});

test('rewrite remoto: detecta linhagem quebrada após fetch e preserva branch local', async () => {
  const fx = await fixture();
  const remoteV2 = await remoteCommit(fx, 'remote-v2');
  const synced = await safeUpdateFromOrigin({ repoPath: fx.local, branch: 'main' });
  assert.equal(synced.ok, true);
  assert.equal(git(fx.local, 'rev-parse', 'HEAD'), remoteV2);

  // Simula o estado remoto após um rewrite sem executar push --force no teste.
  git(fx.remote, 'update-ref', 'refs/heads/main', fx.baseSha);
  const result = await safeUpdateFromOrigin({ repoPath: fx.local, branch: 'main' });

  assert.equal(result.ok, false);
  assert.equal(result.reason, 'REMOTE_REWRITE');
  assert.equal(git(fx.local, 'rev-parse', 'HEAD'), remoteV2);
  assert.equal((await readFile(join(fx.local, 'state.txt'), 'utf8')).replace(/\r\n/g, '\n'), 'remote-v2\n');
});

test('branch errada ou HEAD destacado: fail-closed sem troca automática', async () => {
  const fx = await fixture();
  git(fx.local, 'switch', '-c', 'outra');
  const wrongBranch = await safeUpdateFromOrigin({ repoPath: fx.local, branch: 'main' });
  assert.equal(wrongBranch.ok, false);
  assert.equal(wrongBranch.reason, 'BRANCH_MISMATCH');

  git(fx.local, 'checkout', '--detach');
  const detached = await safeUpdateFromOrigin({ repoPath: fx.local, branch: 'main' });
  assert.equal(detached.ok, false);
  assert.equal(detached.reason, 'DETACHED_HEAD');
});

test('contrato estático: consumidor não volta a reset --hard/force e exige ff-only', async () => {
  const source = await readFile(new URL('./safe-git-deploy.mjs', import.meta.url), 'utf8');
  assert.match(source, /merge['"],\s*['"]--ff-only/);
  assert.doesNotMatch(source, /git\(\[\s*['"]reset['"]\s*,\s*['"]--hard['"]/);
  assert.doesNotMatch(source, /git\(\[\s*['"]push['"][^\]]*--force/);
});
