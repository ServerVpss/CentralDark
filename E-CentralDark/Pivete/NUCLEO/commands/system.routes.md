# COMANDO - system.routes.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\crm\multizap-gateway-deploy\gateway\src\routes\system.routes.js
**SHA:** af7421b45106b70f
**Timestamp:** 2026-08-26T19:41:05.394603
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const stRun = await run('docker', ['inspect', '-f', '{{.State.Status}}', WUZAPI_CONTAINER]);
- const hsRun = await run('docker', [
- const imgRun = await run('docker', ['inspect', '-f', '{{.Config.Image}}', WUZAPI_CONTAINER]);
- const idRun = await run('docker', ['inspect', '-f', '{{.Image}}', WUZAPI_CONTAINER]);
- const dryRun = body.dry_run === true;
- dry_run: true,
- would_restart: [WUZAPI_CONTAINER],
- notes: 'dry-run: não foi executado. Imagem alvo validada localmente.',

### Ouro Bruto (primeiros 5000 chars)
```
// Rotas do sistema — gerenciamento da WuzAPI (versão rodando + update).
// Protegidas pelo MULTIZAP_GATEWAY_TOKEN (mesmo Bearer das outras rotas).
// IMPORTANTE: nunca usa `docker compose down -v` — volumes (sessões WhatsApp)
// jamais são apagados.

const express = require('express');
const { execFile } = require('child_process');
const path = require('path');
const authMiddleware = require('../middlewares/authMiddleware');
const { ok, fail } = require('../utils/response');
const logger = require('../utils/logger');

const router = express.Router();
router.use(authMiddleware);

const WUZAPI_DIR = process.env.WUZAPI_COMPOSE_DIR || '/root/Multizap/wuzapi';
const WUZAPI_CONTAINER = process.env.WUZAPI_CONTAINER_NAME || 'multizap-gateway-wuzapi-1';
const WUZAPI_PORT = process.env.WUZAPI_PORT || '8081';
const GATEWAY_PM2_NAME = process.env.GATEWAY_PM2_NAME || 'MultiZap-Gateway';
const UPDATE_SCRIPT = path.resolve(__dirname, '..', '..', '..', 'scripts', 'update-wuzapi.sh');
const ROLLBACK_SCRIPT = path.resolve(__dirname, '..', '..', '..', 'scripts', 'rollback-wuzapi.sh');

let diagService = null;
try { diagService = require('../services/diagService'); } catch (_) { /* opcional */ }

function run(cmd, args, opts = {}) {
  const timeout = opts.timeout || 15000;
  return new Promise((resolve) => {
    execFile(cmd, args, { timeout, maxBuffer: 4 * 1024 * 1024 }, (err, stdout, stderr) => {
      resolve({
        ok: !err,
        code: err ? (err.code ?? 1) : 0,
        stdout: String(stdout || '').trim(),
        stderr: String(stderr || '').trim(),
        error: err ? err.message : null,
      });
    });
  });
}

// GET /system/wuzapi-version
// Retorna o digest da imagem do container WuzAPI rodando agora.
router.get('/wuzapi-version', async (_req, res) => {
  try {
    const inspect = await run('docker', [
      'inspect',
      '--format',
      '{{.Image}}|{{.Config.Image}}',
      WUZAPI_CONTAINER,
    ]);
    if (!inspect.ok) {
      return fail(res, 'container_not_found', `docker inspect falhou: ${inspect.stderr || inspect.error}`, 502);
    }
    const [imageId, configImage] = inspect.stdout.split('|');

    // Pega o repo digest (sha256 da imagem no registry) — é o que bate com Docker Hub.
    const imgInspect = await run('docker', [
      'image',
      'inspect',
      '--format',
      '{{range .RepoDigests}}{{.}} {{end}}',
      imageId,
    ]);
    let repoDigest = null;
    if (imgInspect.ok && imgInspect.stdout) {
      const first = imgInspect.stdout.split(' ').find((s) => s.includes('@'));
      if (first) {
        const parts = first.split('@');
        repoDigest = parts[1] || null;
      }
    }

    return ok(res, {
      image: configImage || null,
      image_id: imageId || null,
      repo_digest: repoDigest,
      digest: repoDigest,
      container: WUZAPI_CONTAINER,
    });
  } catch (e) {
    logger.error('wuzapi_version_error', { message: e.message });
    return fail(res, 'internal', e.message, 500);
  }
});

// POST /system/wuzapi-update
// Executa pull + up -d (preserva volumes/sessões), com healthcheck e rollback.
router.post('/wuzapi-update', async (_req, res) => {
  try {
    const before = await run('docker', [
      'inspect',
      '--format',
      '{{.Image}}',
      WUZAPI_CONTAINER,
    ]);
    const previousDigest = before.ok ? before.stdout : null;

    const result = await run('bash', [UPDATE_SCRIPT, WUZAPI_DIR, WUZAPI_CONTAINER], {
      timeout: 120000,
    });

    const after = await run('docker', [
      'inspect',
      '--format',
      '{{.Image}}',
      WUZAPI_CONTAINER,
    ]);
    const pulledDigest = after.ok ? after.stdout : null;

    const logsTail = `${result.stdout}\n${result.stderr}`.trim();
    if (!result.ok) {
      logger.warn('wuzapi_update_failed', { code: result.code });
      return res.status(502).json({
        ok: false,
        previous_digest: previousDigest,
        pulled_digest: pulledDigest,
        error: { code: 'update_failed', message: result.error || 'Script de update falhou.' },
        logs: logsTail,
      });
    }

    return ok(res, {
      ok: true,
      previous_digest: previousDigest,
      pulled_digest: pulledDigest,
      logs: logsTail,
    });
  } catch (e) {
    logger.error('wuzapi_update_error', { message: e.message });
    return fail(res, 'internal', e.message, 500);
  }
});

// GET /system/wuzapi-health
// Saúde consolidada: gateway + wuzapi + pm2 + docker + commit local.
// Mapa de portas (fixo): 3100=MultiZap-Gateway, 8081=WuzAPI local Docker,
// 9002=MultiZap-GitHub-Webhook (NÃO é o Gateway — nunca usar como healthcheck).
// Usada pelo monitor pós-deploy (Fase 4). NUNCA expõe tokens/secrets/DB URL.
router.get('/wuzapi-health', async (_req, res) => {
  const checkedAt = new Date().toISOString();
  try {
    // 1) gateway = a própria resposta (já é 200 se chegou aqui) — replicamos /health
    const gateway_health = {
      ok: true,
      port: parseInt(process.env.PORT || '3100', 10),
      env: process.
```