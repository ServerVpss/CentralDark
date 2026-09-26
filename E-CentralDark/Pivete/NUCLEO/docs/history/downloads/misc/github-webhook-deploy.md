# OUTRO - github-webhook-deploy.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\scripts\webhook\github-webhook-deploy.mjs
**SHA:** 60d7565edaebc7e4
**Timestamp:** 2026-08-26T19:32:53.073716
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- lastRun: null,
- lastRun: runtime.lastRun,
- runtime.lastRun = {

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node
import { spawn } from 'node:child_process';
import crypto from 'node:crypto';
import { createServer } from 'node:http';
import { access, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

import {
  netflixHeader,
  netflixInfo,
  netflixSuccess,
  netflixWarning,
  sanitizeLog,
  writeLog,
} from '../lib/theme-node.mjs';

const HOST = process.env.WEBHOOK_DEPLOY_HOST || '127.0.0.1';
const PORT = Number(process.env.WEBHOOK_DEPLOY_PORT || '9300');
const ROOT = process.env.CENTRALDARK_ROOT || '/root/CentralDark';
const WEBHOOK_ENV_FILE = process.env.WEBHOOK_ENV_FILE || path.join(ROOT, 'secrets', 'webhook.env');
const REVISOES_ROOT = process.env.REVISOES_ROOT || '/root/Multizap/revisoes';
const TASK_NAME = process.env.WEBHOOK_DEPLOY_TASK || 'webhook-deploy';
const DEPLOY_SCRIPT = process.env.WEBHOOK_DEPLOY_SCRIPT || path.join(ROOT, 'scripts', 'webhook', 'deploy-job.sh');
const LOCK_FILE = process.env.WEBHOOK_DEPLOY_LOCK || '/tmp/centraldark-webhook-deploy.lock';
const PENDING_FILE = process.env.WEBHOOK_DEPLOY_PENDING || '/tmp/centraldark-webhook-deploy.pending';
const MAX_BODY_BYTES = Number(process.env.WEBHOOK_DEPLOY_MAX_BODY || String(1024 * 1024));

let runtime = {
  running: false,
  lastRun: null,
  pending: false,
};

netflixHeader('CentralDark Webhook Deploy');
netflixInfo(`Escutando em ${HOST}:${PORT}`);

const server = createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && req.url === '/health') {
      return sendJson(res, 200, {
        ok: true,
        service: 'CentralDark-WebhookDeploy',
        host: HOST,
        port: PORT,
        running: runtime.running,
        pending: runtime.pending || await exists(PENDING_FILE),
        secretConfigured: Boolean(await getWebhookSecret()),
        lastRun: runtime.lastRun,
      });
    }

    if (req.method !== 'POST' || req.url !== '/github') {
      return sendJson(res, 404, { ok: false, error: 'not_found' });
    }

    const rawBody = await readBody(req);
    const event = String(req.headers['x-github-event'] || '');
    const signature = String(req.headers['x-hub-signature-256'] || '');
    const delivery = String(req.headers['x-github-delivery'] || '');
    const secret = await getWebhookSecret();

    if (!secret) {
      await appendAudit('reject-no-secret', { event, delivery });
      return sendJson(res, 503, { ok: false, error: 'webhook_secret_not_configured' });
    }

    if (!verifySignature(rawBody, signature, secret)) {
      await appendAudit('reject-invalid-signature', { event, delivery });
      return sendJson(res, 401, { ok: false, error: 'invalid_signature' });
    }

    if (event === 'ping') {
      await appendAudit('ping-ok', { delivery });
      return sendJson(res, 200, { ok: true, event: 'ping' });
    }

    if (event !== 'push') {
      await appendAudit('ignored-event', { event, delivery });
      return sendJson(res, 202, { ok: true, ignored: true, reason: 'event_not_supported' });
    }

    const payload = JSON.parse(rawBody.toString('utf8') || '{}');
    if (payload.ref !== 'refs/heads/main') {
      await appendAudit('ignored-ref', { ref: payload.ref, delivery });
      return sendJson(res, 202, { ok: true, ignored: true, reason: 'ref_not_main' });
    }

    queueDeploy({ delivery, after: payload.after, ref: payload.ref }).catch((error) => {
      netflixWarning(`Falha no deploy enfileirado: ${error.message}`);
    });

    return sendJson(res, 202, {
      ok: true,
      accepted: true,
      queued: runtime.running,
      ref: payload.ref,
    });
  } catch (error) {
    await appendAudit('server-error', { message: error.message });
    return sendJson(res, 500, { ok: false, error: 'internal_error' });
  }
});

server.listen(PORT, HOST, () => {
  netflixSuccess(`Health: http://${HOST}:${PORT}/health`);
});

async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) {
      throw new Error('payload_too_large');
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function getWebhookSecret() {
  if (process.env.GITHUB_WEBHOOK_SECRET) return process.env.GITHUB_WEBHOOK_SECRET.trim();
  try {
    const envText = await readFile(WEBHOOK_ENV_FILE, 'utf8');
    for (const line of envText.split(/\r?\n/)) {
      const match = line.match(/^\s*GITHUB_WEBHOOK_SECRET\s*=\s*(.*)\s*$/);
      if (match) return unquoteEnv(match[1]).trim();
    }
  } catch {
    return '';
  }
  return '';
}

function unquoteEnv(value) {
  const clean = String(value || '').trim();
  if ((clean.startsWith('"') && clean.endsWith('"')) || (clean.startsWith("'") && clean.endsWith("'"))) {
    return clean.slice(1, -1);
  }
  return clean;
}

function verifySignature(rawBody, signatureHeader, secret) {
  if (!signatureHeader.startsWith('sha256=')) return false;
  const expected = `sha256=${crypto.createHmac('sha256', secret).update(rawBody).digest(
```