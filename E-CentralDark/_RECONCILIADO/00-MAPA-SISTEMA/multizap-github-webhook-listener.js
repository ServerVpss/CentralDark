#!/usr/bin/env node
// MultiZap — GitHub Webhook Listener
// Instalar/rodar no PM2 como: MultiZap-GitHub-Webhook
// Objetivo: receber push do GitHub e chamar /usr/local/bin/multizap-gh-pull
// Segurança: valida assinatura GitHub se GITHUB_WEBHOOK_SECRET estiver configurado.

const http = require('http');
const crypto = require('crypto');
const { execFile } = require('child_process');
const fs = require('fs');

const PORT = Number(process.env.MULTIZAP_GITHUB_WEBHOOK_PORT || process.env.PORT || 9002);
const HOST = process.env.MULTIZAP_GITHUB_WEBHOOK_HOST || '0.0.0.0';
const SECRET = process.env.GITHUB_WEBHOOK_SECRET || '';
const PULL_SCRIPT = process.env.MULTIZAP_PULL_SCRIPT || '/usr/local/bin/multizap-gh-pull';
const LOCK_FILE = process.env.MULTIZAP_DEPLOY_LOCK || '/tmp/multizap-gh-pull.lock';
const LOG_FILE = process.env.MULTIZAP_GITHUB_WEBHOOK_LOG || '/var/log/multizap-github-webhook.log';
const BRANCH = process.env.MULTIZAP_DEPLOY_BRANCH || 'main';

function log(message, meta = {}) {
  const line = `[${new Date().toISOString()}] [multizap-webhook] ${message} ${JSON.stringify(meta)}\n`;
  try { fs.appendFileSync(LOG_FILE, line); } catch (_) {}
  console.log(line.trim());
}

function send(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(payload);
}

function safeEqual(a, b) {
  const ba = Buffer.from(a || '', 'utf8');
  const bb = Buffer.from(b || '', 'utf8');
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
}

function verifySignature(rawBody, signatureHeader) {
  if (!SECRET) return true;
  if (!signatureHeader || !signatureHeader.startsWith('sha256=')) return false;
  const expected = 'sha256=' + crypto.createHmac('sha256', SECRET).update(rawBody).digest('hex');
  return safeEqual(expected, signatureHeader);
}

function runDeploy() {
  return new Promise((resolve) => {
    const command = `flock -n ${LOCK_FILE} ${PULL_SCRIPT}`;
    execFile('bash', ['-lc', command], { timeout: 15 * 60 * 1000 }, (err, stdout, stderr) => {
      if (err) {
        const alreadyRunning = String(stderr || stdout || '').includes('failed to execute') || err.code === 1;
        log('deploy_failed', { code: err.code, signal: err.signal, message: err.message });
        return resolve({ ok: false, alreadyRunning, code: err.code, stdout: String(stdout).slice(-1000), stderr: String(stderr).slice(-1000) });
      }
      log('deploy_success');
      resolve({ ok: true, stdout: String(stdout).slice(-1000) });
    });
  });
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    return send(res, 200, { ok: true, service: 'MultiZap-GitHub-Webhook', port: PORT, pull_script: PULL_SCRIPT });
  }

  if (req.method !== 'POST') {
    return send(res, 405, { ok: false, error: 'method_not_allowed' });
  }

  let chunks = [];
  req.on('data', (chunk) => {
    chunks.push(chunk);
    if (Buffer.concat(chunks).length > 2 * 1024 * 1024) {
      req.destroy();
    }
  });

  req.on('end', async () => {
    const rawBody = Buffer.concat(chunks);
    const event = req.headers['x-github-event'] || 'unknown';
    const delivery = req.headers['x-github-delivery'] || 'unknown';
    const signature = req.headers['x-hub-signature-256'] || '';

    if (!verifySignature(rawBody, signature)) {
      log('signature_invalid', { event, delivery });
      return send(res, 401, { ok: false, error: 'signature_invalid' });
    }

    let payload = {};
    try {
      payload = JSON.parse(rawBody.toString('utf8') || '{}');
    } catch (e) {
      log('invalid_json', { event, delivery });
      return send(res, 400, { ok: false, error: 'invalid_json' });
    }

    if (event !== 'push') {
      log('ignored_event', { event, delivery });
      return send(res, 202, { ok: true, ignored: event });
    }

    const ref = payload.ref || '';
    if (ref !== `refs/heads/${BRANCH}`) {
      log('ignored_branch', { event, delivery, ref });
      return send(res, 202, { ok: true, ignored: 'branch', ref });
    }

    log('disparando deploy MultiZap', { delivery, ref });
    send(res, 202, { ok: true, queued: true });

    const result = await runDeploy();
    log('deploy_result', { delivery, ok: result.ok, code: result.code || 0 });
  });
});

server.listen(PORT, HOST, () => {
  log('listener_started', { host: HOST, port: PORT, pull_script: PULL_SCRIPT, branch: BRANCH, signature_check: Boolean(SECRET) });
});
