#!/usr/bin/env node
/**
 * CentralDark Webhook Deploy — ATIVO
 * HMAC SHA256, so push em refs/heads/main, git pull --ff-only,
 * bloqueia tree dirty, lock anti-duplo. Secret so de arquivo local.
 */
import http from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const ROOT = process.env.CENTRALDARK_ROOT || '/root/CentralDark';
const PORT = Number(process.env.WEBHOOK_DEPLOY_PORT || 9300);
const SECRET_FILE = process.env.WEBHOOK_ENV_FILE || path.join(ROOT, 'secrets/webhook.env');
const LOCK_FILE = path.join(ROOT, 'revisoes/.webhook-deploy.lock');
const DEPLOY_JOB = path.join(ROOT, 'scripts/webhook/deploy-job.sh');
const REPO_DEPLOY_LOCK = process.env.CENTRALDARK_REPO_DEPLOY_LOCK || '/tmp/centraldark-repo-deploy.lock';
const MAX_BODY = 2 * 1024 * 1024;

function loadSecret() {
  if (!fs.existsSync(SECRET_FILE)) {
    throw new Error(`SECRET_FILE_MISSING`);
  }
  const raw = fs.readFileSync(SECRET_FILE, 'utf8');
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq);
    if (key !== 'GITHUB_WEBHOOK_SECRET') continue;
    let v = trimmed.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (v) return v;
  }
  throw new Error('WEBHOOK_SECRET_EMPTY');
}

let SECRET;
try {
  SECRET = loadSecret();
} catch (e) {
  console.error('[webhook] FATAL', e.message);
  process.exit(1);
}

function json(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(body));
}

function timingSafeEqualHex(a, b) {
  try {
    const ba = Buffer.from(a, 'hex');
    const bb = Buffer.from(b, 'hex');
    if (ba.length !== bb.length) return false;
    return crypto.timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}

function verifySignature(rawBody, header) {
  if (!header || typeof header !== 'string' || !header.startsWith('sha256=')) return false;
  const expected = header.slice('sha256='.length).trim();
  const computed = crypto.createHmac('sha256', SECRET).update(rawBody).digest('hex');
  return timingSafeEqualHex(computed, expected);
}

function acquireLock() {
  fs.mkdirSync(path.dirname(LOCK_FILE), { recursive: true });
  try {
    const fd = fs.openSync(LOCK_FILE, 'wx');
    fs.writeFileSync(fd, `${process.pid}\n${new Date().toISOString()}\n`);
    fs.closeSync(fd);
    return true;
  } catch (e) {
    if (e.code === 'EEXIST') {
      try {
        const st = fs.statSync(LOCK_FILE);
        if (Date.now() - st.mtimeMs > 15 * 60 * 1000) {
          fs.unlinkSync(LOCK_FILE);
          return acquireLock();
        }
      } catch {
        return false;
      }
      return false;
    }
    throw e;
  }
}

function releaseLock() {
  try {
    fs.unlinkSync(LOCK_FILE);
  } catch {
    /* ignore */
  }
}

function runDeploy(ref, afterSha) {
  return new Promise((resolve) => {
    const env = {
      ...process.env,
      CENTRALDARK_ROOT: ROOT,
      WEBHOOK_DEPLOY_GIT_PULL: '1',
      WEBHOOK_DEPLOY_REF: ref || '',
      WEBHOOK_DEPLOY_SHA: afterSha || '',
      GIT_TERMINAL_PROMPT: '0',
      GIT_ASKPASS: process.env.CENTRALDARK_GIT_ASKPASS || path.join(ROOT, 'secrets/github-read-askpass.sh'),
      CENTRALDARK_GITHUB_TOKEN_FILE: process.env.CENTRALDARK_GITHUB_TOKEN_FILE || '/root/secrets/GITHUB_TOKEN',
    };
    const child = spawn('flock', ['-w', '90', REPO_DEPLOY_LOCK, 'bash', DEPLOY_JOB], {
      cwd: ROOT,
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let out = '';
    child.stdout.on('data', (d) => {
      out += d.toString();
    });
    child.stderr.on('data', (d) => {
      out += d.toString();
    });
    child.on('close', (code) => {
      resolve({ code: code ?? 1, out: out.slice(-4000) });
    });
  });
}

async function handlePush(payload) {
  const ref = payload.ref || '';
  if (ref !== 'refs/heads/main') {
    return { status: 202, body: { status: 'ignored', reason: 'not_main', ref } };
  }

  if (!acquireLock()) {
    return { status: 409, body: { status: 'busy', reason: 'lock_held' } };
  }

  const afterSha = payload.after || '';
  try {
    const { execSync } = await import('node:child_process');
    const dirty = execSync('git status --porcelain=v1 --untracked-files=no', {
      cwd: ROOT,
      encoding: 'utf8',
    }).trim();
    if (dirty) {
      releaseLock();
      return {
        status: 409,
        body: { status: 'blocked', reason: 'local_dirty' },
      };
    }
  } catch {
    releaseLock();
    return {
      status: 500,
      body: { status: 'failed', reason: 'preflight_error' },
    };
  }

  void runDeploy(ref, afterSha)
    .then((result) => {
      const status = result.code === 0 ? 'PASS' : 'FAIL';
      const log = result.code === 0 ? console.log : console.error;
      log(`[deploy] WORKER_RESULT status=${status} sha=${afterSha} code=${result.code}`);
    })
    .catch((error) => {
      console.error(`[deploy] WORKER_RESULT status=FAIL sha=${afterSha} error=${error?.code || error?.name || 'UNKNOWN'}`);
    })
    .finally(() => {
      releaseLock();
    });

  return {
    status: 202,
    body: { status: 'accepted', sha: afterSha, mode: 'hmac+async+ff-only+repo-flock' },
  };
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BODY) {
        reject(new Error('BODY_TOO_LARGE'));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = req.url?.split('?')[0] || '';

  if (req.method === 'GET' && (url === '/health' || url === '/health/')) {
    json(res, 200, {
      status: 'ACTIVE',
      service: 'centraldark-webhook-deploy',
      mode: 'hmac+async+ff-only+repo-flock',
      mutatesRepository: true,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (req.method === 'POST' && (url === '/webhook' || url === '/github' || url === '/github/')) {
    let raw;
    try {
      raw = await readBody(req);
    } catch {
      json(res, 413, { error: 'body_too_large' });
      return;
    }

    const sig = req.headers['x-hub-signature-256'];
    if (!verifySignature(raw, sig)) {
      json(res, 401, { error: 'invalid_signature' });
      return;
    }

    const event = req.headers['x-github-event'] || '';
    if (event === 'ping') {
      json(res, 200, { status: 'pong' });
      return;
    }
    if (event !== 'push') {
      json(res, 202, { status: 'ignored', event });
      return;
    }

    let payload;
    try {
      payload = JSON.parse(raw.toString('utf8'));
    } catch {
      json(res, 400, { error: 'invalid_json' });
      return;
    }

    const result = await handlePush(payload);
    json(res, result.status, result.body);
    return;
  }

  json(res, 404, { error: 'not_found' });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[deploy] webhook ACTIVE hmac+ff-only+lock em 127.0.0.1:${PORT}`);
});
