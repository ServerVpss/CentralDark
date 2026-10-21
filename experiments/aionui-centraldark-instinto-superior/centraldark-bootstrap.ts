/**
 * CentralDark bootstrap for the AionUi shell.
 * SPDX-License-Identifier: Apache-2.0
 *
 * This file is CentralDark integration code. It does not replace AionCore or HERMES-CORE.
 */

import { app } from 'electron';
import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const REPO_URL = 'https://github.com/ServerVpss/CentralDark.git';
const ORCHESTRATOR = 'apps/modulos/HERMES-CORE/core/orchestrator.mjs';

function alive(pid: number): boolean {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function copyDirIfMissing(source: string, target: string): boolean {
  if (!fs.existsSync(source) || fs.existsSync(target)) return false;
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.cpSync(source, target, { recursive: true, dereference: false });
  return fs.existsSync(target);
}

function candidateRepoRoots(): string[] {
  return [
    process.env.CENTRALDARK_REPO_ROOT?.trim() || '',
    path.join(os.homedir(), 'CentralDark'),
    path.join(app.getPath('userData'), 'CentralDark'),
  ].filter(Boolean);
}

function isCentralDarkRepo(root: string): boolean {
  return fs.existsSync(path.join(root, ORCHESTRATOR));
}

function resolveSeedRoot(): string | null {
  if (!app.isPackaged) return null;
  const candidate = path.join(process.resourcesPath, 'centraldark-seed', 'CentralDark');
  return isCentralDarkRepo(candidate) ? candidate : null;
}

function tryClone(target: string): boolean {
  try {
    const child = spawn('git', ['clone', '--depth', '1', '--branch', 'main', REPO_URL, target], {
      stdio: 'ignore',
      detached: false,
    });
    child.unref();
    console.log('[CentralDark] clone scheduled:', target);
    return true;
  } catch (error) {
    console.warn('[CentralDark] clone unavailable:', error);
    return false;
  }
}

function resolveRepoRoot(): string | null {
  for (const candidate of candidateRepoRoots()) {
    if (isCentralDarkRepo(candidate)) return candidate;
  }

  const target = path.join(app.getPath('userData'), 'CentralDark');
  const seed = resolveSeedRoot();
  if (seed && copyDirIfMissing(seed, target) && isCentralDarkRepo(target)) {
    console.log('[CentralDark] seed materialized:', target);
    return target;
  }

  if (!fs.existsSync(target)) tryClone(target);
  return null;
}

function startHermes(repoRoot: string): void {
  const runtimeDir = path.join(app.getPath('userData'), 'centraldark-runtime');
  fs.mkdirSync(runtimeDir, { recursive: true });
  const pidFile = path.join(runtimeDir, 'hermes-core.pid');

  try {
    const oldPid = Number(fs.readFileSync(pidFile, 'utf8').trim());
    if (alive(oldPid)) {
      console.log('[CentralDark] HERMES-CORE already alive pid=', oldPid);
      return;
    }
  } catch {
    // No prior PID is normal.
  }

  const orchestrator = path.join(repoRoot, ORCHESTRATOR);
  if (!fs.existsSync(orchestrator)) {
    console.warn('[CentralDark] HERMES-CORE owner missing:', orchestrator);
    return;
  }

  process.env.CENTRALDARK_REPO_ROOT = repoRoot;

  const child = spawn(process.execPath, [orchestrator], {
    cwd: repoRoot,
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: '1',
      CENTRALDARK_REPO_ROOT: repoRoot,
      CENTRALDARK_DESKTOP_SHELL: 'AionUi-v2.2.2',
      CENTRALDARK_PRODUCT_NAME: 'CentralDark — Instinto Superior',
    },
    stdio: 'ignore',
    windowsHide: true,
  });

  fs.writeFileSync(pidFile, String(child.pid ?? ''), 'utf8');
  child.once('exit', (code, signal) => {
    console.warn('[CentralDark] HERMES-CORE exited', { code, signal });
    try {
      fs.rmSync(pidFile, { force: true });
    } catch {
      // best effort
    }
  });

  console.log('[CentralDark] HERMES-CORE started pid=', child.pid, 'repo=', repoRoot);
}

export async function initializeCentralDark(): Promise<void> {
  const repoRoot = resolveRepoRoot();
  if (!repoRoot) {
    console.warn('[CentralDark] repo unavailable now; app continues and will retry next start');
    return;
  }

  startHermes(repoRoot);
}
