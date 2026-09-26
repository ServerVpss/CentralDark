import http from 'http';
import { spawn } from 'child_process';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, '..', '..');
const SCREENPIPE_PORT = parseInt(process.env.PORT || '3030', 10);
const SCREENPIPE_DATA_DIR = process.env.SCREENPIPE_DATA_DIR || '/root/.screenpipe';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const HEALTH_URL = process.env.SCREENPIPE_HEALTH_URL || `http://127.0.0.1:${SCREENPIPE_PORT}/health`;
const LOCAL_BIN = process.env.SCREENPIPE_BIN || resolve(
  REPO_ROOT,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'screenpipe.cmd' : 'screenpipe',
);

let child = null;
let lastHealth = 'UNKNOWN';
let healthTimer = null;

function probeHealth() {
  const req = http.get(HEALTH_URL, { timeout: 4000 }, (res) => {
    res.resume();
    const next = res.statusCode === 200 ? 'PASS' : `FAIL_HTTP_${res.statusCode}`;
    if (next !== lastHealth) {
      console.log(`[ScreenPipe] HEALTH=${next} url=${HEALTH_URL}`);
      lastHealth = next;
    }
  });
  req.on('timeout', () => req.destroy(new Error('health timeout')));
  req.on('error', (err) => {
    if (lastHealth !== 'FAIL') {
      console.error(`[ScreenPipe] HEALTH=FAIL error=${err.message}`);
      lastHealth = 'FAIL';
    }
  });
}

function startScreenPipe() {
  console.log('[ScreenPipe] ===== BOOT =====');
  console.log(`REPO_ROOT=${REPO_ROOT}`);
  console.log(`BIN=${LOCAL_BIN}`);
  console.log(`PORT=${SCREENPIPE_PORT}`);
  console.log(`DATA_DIR=${SCREENPIPE_DATA_DIR}`);
  console.log('METHOD=LOCAL_DEPENDENCY');
  console.log('UNKNOWN != PASS');
  console.log('=========================');

  child = spawn(
    LOCAL_BIN,
    ['record', '--port', String(SCREENPIPE_PORT), '--data-dir', SCREENPIPE_DATA_DIR],
    {
      cwd: REPO_ROOT,
      env: { ...process.env, RUST_LOG: LOG_LEVEL, PORT: String(SCREENPIPE_PORT) },
      stdio: ['ignore', 'inherit', 'inherit'],
      shell: process.platform === 'win32',
    },
  );

  child.on('error', (err) => {
    console.error(`[ScreenPipe] PROCESS_START=FAIL error=${err.message}`);
    process.exitCode = 1;
  });

  child.on('close', (code, signal) => {
    console.error(`[ScreenPipe] PROCESS_EXIT code=${code} signal=${signal || 'none'}`);
    if (healthTimer) clearInterval(healthTimer);
    process.exit(code || 1);
  });

  console.log(`[ScreenPipe] LAUNCHER_PID=${process.pid} CHILD_PID=${child.pid || 'UNKNOWN'}`);
  probeHealth();
  healthTimer = setInterval(probeHealth, 5000);
}

function shutdown(signal) {
  console.log(`[ScreenPipe] SHUTDOWN signal=${signal}`);
  if (healthTimer) clearInterval(healthTimer);
  if (child && !child.killed) {
    child.kill('SIGTERM');
    setTimeout(() => {
      if (child && !child.killed) child.kill('SIGKILL');
    }, 5000).unref();
  } else {
    process.exit(0);
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

startScreenPipe();
