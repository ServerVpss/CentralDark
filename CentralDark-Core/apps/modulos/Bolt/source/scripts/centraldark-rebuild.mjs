#!/usr/bin/env node
// Receita canonica: construir apenas em worktree limpa, contar somente BUILD_RC=0 com hashes.
// Nao instala, nao faz merge/push/deploy, e nao declara runtime PASS sem smoke separado.
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, openSync, closeSync, readFileSync, writeFileSync, rmSync, statSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { appendSuccessful, fileProof, latestSuccessful, nextPatch, readLedger, writeLedgerAtomic } from './centraldark-build-ledger.mjs';

const sourceDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ledgerFile = path.join(sourceDir, 'resources', 'build-history.json');
const packageFile = path.join(sourceDir, 'package.json');
const lockDir = path.join(sourceDir, '.centraldark-builder-active');

function git(...args) {
  const result = spawnSync('git', args, { cwd: sourceDir, encoding: 'utf8', windowsHide: true });
  if (result.status !== 0) throw new Error('GIT_PROBE_FAILED: ' + (result.stderr || '').slice(0, 180));
  return result.stdout.trim();
}

function runLogged(program, args, file) {
  return new Promise((resolve, reject) => {
    const handle = openSync(file, 'a');
    const child = spawn(program, args, {
      cwd: sourceDir, windowsHide: true, shell: false,
      env: { ...process.env, NODE_ENV: 'development', CI: '1' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    child.stdout.on('data', (data) => { const text = data.toString(); writeFileSync(handle, text); });
    child.stderr.on('data', (data) => { const text = data.toString(); writeFileSync(handle, text); });
    child.once('error', (error) => { closeSync(handle); reject(error); });
    child.once('close', (code, signal) => { try { closeSync(handle); } catch {} resolve({ code, signal }); });
  });
}

async function main() {
  const ledger = readLedger(ledgerFile);
  const latest = latestSuccessful(ledger);
  if (process.argv.includes('--verify')) {
    console.log(JSON.stringify({ status: 'VERIFIED_READ_ONLY', count: ledger.entries.length, latest: latest?.builder_version ?? null }));
    return;
  }
  if (!process.argv.includes('--execute')) throw new Error('USE_--verify_OR_--execute');
  if (process.platform !== 'win32') throw new Error('WINDOWS_BUILD_ONLY');
  if (!latest) throw new Error('NO_SUCCESSFUL_BASELINE');
  // Impede duas sessoes no mesmo workspace e descarta checkout sujo.
  if (git('status', '--porcelain', '--untracked-files=normal')) throw new Error('WORKTREE_DIRTY_USE_DEDICATED_CLEAN_WORKTREE');
  if (existsSync(lockDir)) throw new Error('BUILDER_ALREADY_ACTIVE');
  mkdirSync(lockDir);
  const originalPackage = readFileSync(packageFile, 'utf8');
  let promoted = false;
  const startedAt = Date.now();
  const next = nextPatch(latest.builder_version);
  const logDir = path.join(process.env.LOCALAPPDATA || os.tmpdir(), 'CentralDark', 'builder-logs');
  mkdirSync(logDir, { recursive: true });
  const logfile = path.join(logDir, 'builder-' + next + '-' + startedAt + '.log');
  try {
    const pkg = JSON.parse(originalPackage);
    if (pkg.name !== 'centraldark-desktop' || pkg.version !== latest.app_version) throw new Error('PACKAGE_VERSION_DRIFT');
    const updated = originalPackage.replace(/("version"\s*:\s*")\d+\.\d+\.\d+(")/, (_match, before, after) => before + next + after);
    if (updated === originalPackage || JSON.parse(updated).version !== next) throw new Error('VERSION_WRITE_PRECHECK_FAILED');
    writeFileSync(packageFile, updated, 'utf8');
    const install = await runLogged('cmd.exe', ['/d', '/s', '/c', 'pnpm.cmd install --frozen-lockfile --prod=false'], logfile);
    if (install.code !== 0) throw new Error('INSTALL_FAILED_EXIT_' + install.code + '_LOG_' + logfile);
    const result = await runLogged('cmd.exe', ['/d', '/s', '/c', 'pnpm.cmd centraldark:build:win'], logfile);
    if (result.code !== 0) throw new Error('BUILD_FAILED_EXIT_' + result.code + '_LOG_' + logfile);
    const installer = path.join(sourceDir, 'dist', 'CentralDark-Setup-' + next + '-x64.exe');
    const exe = path.join(sourceDir, 'dist', 'win-unpacked', 'CentralDark.exe');
    if (!existsSync(installer) || !existsSync(exe)) throw new Error('BUILD_ARTIFACTS_MISSING');
    if (statSync(installer).mtimeMs < startedAt - 10000 || statSync(exe).mtimeMs < startedAt - 10000) {
      throw new Error('STALE_ARTIFACTS_NOT_A_NEW_BUILD');
    }
    const [setupProof, exeProof] = await Promise.all([fileProof(installer), fileProof(exe)]);
    const commit = git('rev-parse', 'HEAD');
    const entry = {
      id: 'builder-' + next + '-' + commit.slice(0, 7),
      builder_version: next, app_version: next, built_at: setupProof.mtime, validated_at: null,
      source_commit: commit, source_pr: null, platform: 'win32-x64',
      build_status: 'PASS', runtime_status: 'NOT_PROVEN', deploy_status: 'NOT_PROVEN',
      artifacts: {
        installer: { file: setupProof.file, bytes: setupProof.bytes, sha256: setupProof.sha256 },
        executable: { file: 'win-unpacked/' + exeProof.file, bytes: exeProof.bytes, sha256: exeProof.sha256 },
      },
      proof: { build: 'pnpm centraldark:build:win exit 0; hashes + fresh output verified', runtime: 'NOT_TESTED', evidence_workspace: logfile },
      caveats: ['BUILD_PASS nao certifica renderer, instalacao externa, merge nem deploy. Validar exe com --enable-logging em gate separado.'],
    };
    const updatedLedger = appendSuccessful(ledger, entry);
    writeLedgerAtomic(ledgerFile, updatedLedger);
    promoted = true;
    console.log(JSON.stringify({ status: 'BUILD_PASS_RUNTIME_PENDING', version: next, count: updatedLedger.entries.length, sha256: setupProof.sha256, log: logfile }));
  } finally {
    if (!promoted) writeFileSync(packageFile, originalPackage, 'utf8');
    rmSync(lockDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error('CENTRALDARK_BUILDER_ERROR:', error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
