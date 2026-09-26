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
      env: process.env.NODE_ENV || null,
      uptime_sec: Math.round(process.uptime()),
    };

    // 2) wuzapi HTTP local (porta 8081 por padrão)
    const wuzCurl = await run('curl', [
      '-sS', '-o', '/dev/null', '-w', '%{http_code}',
      '--max-time', '4',
      `http://127.0.0.1:${WUZAPI_PORT}/`,
    ], { timeout: 6000 });
    const wuzapi_ok = wuzCurl.ok && wuzCurl.stdout.startsWith('2');

    // 3) docker status do container WuzAPI — chamadas separadas e robustas.
    // Se o Gateway não conseguir falar com o socket do Docker, docker_status
    // vira apenas informativo (não derruba a saúde geral quando wuzapi_ok=true).
    const stRun = await run('docker', ['inspect', '-f', '{{.State.Status}}', WUZAPI_CONTAINER]);
    const hsRun = await run('docker', [
      'inspect', '-f',
      '{{if .State.Health}}{{.State.Health.Status}}{{else}}not_configured{{end}}',
      WUZAPI_CONTAINER,
    ]);
    const imgRun = await run('docker', ['inspect', '-f', '{{.Config.Image}}', WUZAPI_CONTAINER]);
    const idRun = await run('docker', ['inspect', '-f', '{{.Image}}', WUZAPI_CONTAINER]);

    let docker_status;
    if (stRun.ok) {
      docker_status = {
        ok: stRun.stdout === 'running',
        status: stRun.stdout || null,
        health: hsRun.ok ? (hsRun.stdout || 'not_configured') : 'not_configured',
      };
    } else {
      docker_status = {
        ok: false,
        status: null,
        health: null,
        error: 'docker_unavailable',
      };
    }
    const current_wuzapi_image = imgRun.ok ? (imgRun.stdout || null) : null;
    const current_wuzapi_image_id = idRun.ok ? (idRun.stdout || null) : null;

    // 4) pm2 status do Gateway
    const pm2List = await run('pm2', ['jlist'], { timeout: 6000 });
    let pm2_status = { ok: false, name: GATEWAY_PM2_NAME, status: null, restarts: null };
    if (pm2List.ok && pm2List.stdout) {
      try {
        const arr = JSON.parse(pm2List.stdout);
        const proc = arr.find((p) => p.name === GATEWAY_PM2_NAME);
        if (proc) {
          pm2_status = {
            ok: proc.pm2_env?.status === 'online',
            name: proc.name,
            status: proc.pm2_env?.status || null,
            restarts: proc.pm2_env?.restart_time ?? null,
          };
        }
      } catch (_) { /* ignora */ }
    }

    // 5) commit local do Gateway (best-effort) — repo git fica em /root/Multizap-repo
    // (produção roda em /root/Multizap via PM2, que NÃO é repo git).
    let current_gateway_commit = null;
    const REPO_DIR = process.env.MULTIZAP_REPO_DIR || '/root/Multizap-repo';
    const gitHead = await run('git', ['-C', REPO_DIR, 'rev-parse', '--short', 'HEAD'], { timeout: 4000 });
    if (gitHead.ok) current_gateway_commit = gitHead.stdout || null;

    // 6) snapshot de diagnóstico (eventos webhook in-memory) — já é sanitizado.
    let wuzapi_diag = null;
    if (diagService && typeof diagService.snapshot === 'function') {
      try {
        const snap = diagService.snapshot();
        wuzapi_diag = {
          totalCount: snap.totalCount,
          unknownCount: snap.unknownCount,
          lastReceivedAt: snap.lastReceivedAt,
          lastType: snap.lastType,
          lastNormalizedKind: snap.lastNormalizedKind,
        };
      } catch (_) { /* ignora */ }
    }

    const gateway_ok = true;
    return ok(res, {
      gateway_ok,
      wuzapi_ok,
      gateway_health,
      wuzapi_diag,
      current_gateway_commit,
      current_wuzapi_image,
      current_wuzapi_image_id,
      pm2_status,
      docker_status,
      checked_at: checkedAt,
    });
  } catch (e) {
    logger.error('wuzapi_health_error', { message: e.message });
    return fail(res, 'internal', e.message, 500, { checked_at: checkedAt });
  }
});

// POST /system/wuzapi-rollback
// Body: { target_sha: "sha256:..." | "asternic/wuzapi@sha256:..." | "asternic/wuzapi:tag", dry_run?: boolean }
// Reverte SOMENTE o container WuzAPI. Não toca /root/whatsapp-server, porta 3000,
// nem reinicia o Gateway (PM2). Volumes preservados.
router.post('/wuzapi-rollback', async (req, res) => {
  try {
    const body = req.body || {};
    const target = String(body.target_sha || body.snapshot_id || '').trim();
    const dryRun = body.dry_run === true;

    if (!target) {
      return fail(res, 'missing_target', 'target_sha (ou snapshot_id) é obrigatório.', 400);
    }
    if (target.length > 200 || !/^[a-zA-Z0-9_./:@-]+$/.test(target)) {
      return fail(res, 'invalid_target', 'target_sha inválido.', 400);
    }

    // Snapshot atual antes de mexer
    const before = await run('docker', ['inspect', '--format', '{{.Image}}', WUZAPI_CONTAINER]);
    const previous_image_id = before.ok ? before.stdout : null;

    // Validar que a imagem alvo existe localmente
    const has = await run('docker', ['image', 'inspect', target], { timeout: 8000 });
    if (!has.ok) {
      return res.status(409).json({
        ok: false,
        previous_image_id,
        error: { code: 'image_not_local', message: `Imagem ${target} não está em cache local. Rollback abortado.` },
      });
    }

    if (dryRun) {
      return ok(res, {
        ok: true,
        dry_run: true,
        previous_image_id,
        target_image: target,
        would_restart: [WUZAPI_CONTAINER],
        notes: 'dry-run: não foi executado. Imagem alvo validada localmente.',
      });
    }

    // Executa rollback
    const result = await run('bash', [ROLLBACK_SCRIPT, WUZAPI_DIR, WUZAPI_CONTAINER, target], {
      timeout: 120000,
    });
    const logsTail = `${result.stdout}\n${result.stderr}`.trim().slice(-4000);

    // Status pós-rollback
    const after = await run('docker', ['inspect', '--format', '{{.Image}}', WUZAPI_CONTAINER]);
    const current_image_id = after.ok ? after.stdout : null;

    // Health checks pós-rollback
    const healthCurl = await run('curl', [
      '-sS', '-o', '/dev/null', '-w', '%{http_code}',
      '--max-time', '4', 'http://127.0.0.1:' + (process.env.PORT || '3100') + '/health',
    ], { timeout: 6000 });
    const wuzCurl = await run('curl', [
      '-sS', '-o', '/dev/null', '-w', '%{http_code}',
      '--max-time', '4', `http://127.0.0.1:${WUZAPI_PORT}/`,
    ], { timeout: 6000 });
    const gateway_health_ok = healthCurl.ok && healthCurl.stdout.startsWith('2');
    const wuzapi_health_ok = wuzCurl.ok && wuzCurl.stdout.startsWith('2');

    if (!result.ok || !wuzapi_health_ok) {
      logger.warn('wuzapi_rollback_failed', { code: result.code });
      return res.status(502).json({
        ok: false,
        previous_image_id,
        current_image_id,
        target_image: target,
        gateway_health_ok,
        wuzapi_health_ok,
        error: { code: 'rollback_failed', message: result.error || 'Rollback falhou ou WuzAPI não respondeu.' },
        logs: logsTail,
      });
    }

    return ok(res, {
      ok: true,
      previous_image_id,
      current_image_id,
      target_image: target,
      gateway_health_ok,
      wuzapi_health_ok,
      logs: logsTail,
    });
  } catch (e) {
    logger.error('wuzapi_rollback_error', { message: e.message });
    return fail(res, 'internal', e.message, 500);
  }
});

module.exports = router;
