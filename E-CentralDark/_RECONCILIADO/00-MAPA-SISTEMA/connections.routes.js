// Rotas de conexões — todas protegidas por Bearer MULTIZAP_GATEWAY_TOKEN.
const router = require('express').Router();
const auth = require('../middlewares/authMiddleware');
const connectionService = require('../services/connectionService');
const { ok, fail } = require('../utils/response');
const logger = require('../utils/logger');

router.use(auth);

// IMPORTANTE: rotas estáticas (sem :connection_id) DEVEM ficar antes das
// dinâmicas pra evitar que `repair-all-webhooks` seja interpretado como ID.
// POST /connections/repair-all-webhooks — reaplica webhook+eventos em lote.
router.post('/repair-all-webhooks', async (_req, res) => {
  try {
    const r = await connectionService.repairAllWebhooks();
    logger.info('wuzapi_repair_all_done', {
      total: r.total, repaired: r.repaired, failed: r.failed,
    });
    return ok(res, r);
  } catch (err) {
    logger.error('wuzapi_repair_all_failed', { message: err && err.message });
    return fail(res, 'repair_all_failed', err.message || 'Falha ao reparar', 500);
  }
});

router.get('/', (req, res) => {
  const workspaceId = req.query.workspace_id;
  return ok(res, connectionService.listConnections({ workspaceId }));
});


router.post('/', async (req, res) => {
  try {
    const { workspace_id, name, label } = req.body || {};
    const c = await connectionService.createConnection({ workspace_id, name, label });
    return ok(res, c, 201);
  } catch (err) {
    logger.error('create_connection_failed', { message: err && err.message });
    return fail(res, 'create_failed', err.message || 'Falha ao criar conexão', 400);
  }
});

router.get('/:connection_id/status', async (req, res) => {
  try {
    const r = await connectionService.getStatus(req.params.connection_id);
    if (!r) return fail(res, 'not_found', 'Conexão não encontrada', 404);
    return ok(res, r);
  } catch (err) {
    return fail(res, 'status_failed', err.message, 500);
  }
});

router.get('/:connection_id/qr', async (req, res) => {
  try {
    const r = await connectionService.getQr(req.params.connection_id);
    return ok(res, r);
  } catch (err) {
    const code = err.code || 'qr_failed';
    const status = err.httpStatus || 500;
    logger.warn('qr_endpoint_failed', { connection_id: req.params.connection_id, code, message: err.message });
    return fail(res, code, err.message, status);
  }
});

router.post('/:connection_id/restart', async (req, res) => {
  try {
    const r = await connectionService.restart(req.params.connection_id);
    return ok(res, r);
  } catch (err) {
    return fail(res, 'restart_failed', err.message, 500);
  }
});

// POST /connections/:id/disconnect — pausa temporária. Chama WuzAPI /session/disconnect.
// MANTÉM credencial/pareamento. Religar = POST /:id/restart (não pede QR).
// NÃO chama /session/logout. Exige Bearer MULTIZAP_GATEWAY_TOKEN.
router.post('/:connection_id/disconnect', async (req, res) => {
  try {
    const r = await connectionService.disconnect(req.params.connection_id);
    return ok(res, r);
  } catch (err) {
    return fail(res, 'disconnect_failed', err.message, 500);
  }
});

router.post('/:connection_id/logout', async (req, res) => {
  try {
    const r = await connectionService.logoutConnection(req.params.connection_id);
    return ok(res, r);
  } catch (err) {
    return fail(res, 'logout_failed', err.message, 500);
  }
});

// POST /connections/:id/reapply-webhook — reaplica o webhook na WuzAPI sem
// reiniciar a sessão. Idempotente. Exige Bearer MULTIZAP_GATEWAY_TOKEN.
// (sync-marker 2026-05-21T13:45 — força commit no main pra VPS baixar a rota)
router.post('/:connection_id/reapply-webhook', async (req, res) => {
  try {
    const r = await connectionService.reapplyWebhook(req.params.connection_id);
    logger.info('wuzapi_webhook_reapplied', { connection_id: req.params.connection_id });
    return ok(res, r);
  } catch (err) {
    const status = err.httpStatus || 500;
    const code = err.code || 'reapply_webhook_failed';
    logger.warn('wuzapi_webhook_reapply_failed', {
      connection_id: req.params.connection_id,
      code,
      message: err && err.message,
    });
    return fail(res, code, err.message || 'Falha ao reaplicar webhook', status);
  }
});

router.delete('/:connection_id', async (req, res) => {
  try {
    const r = await connectionService.deleteConnection(req.params.connection_id);
    if (!r) return fail(res, 'not_found', 'Conexão não encontrada', 404);
    return ok(res, { deleted: true });
  } catch (err) {
    return fail(res, 'delete_failed', err.message, 500);
  }
});

// (rota /repair-all-webhooks movida para o topo do arquivo — antes das rotas
// dinâmicas /:connection_id — pra evitar que Express interprete o caminho como ID)


// POST /connections/:id/profile-picture — busca foto de perfil via WuzAPI.
// Body: { phone?: "<E164>" } OU { jid?: "<jid completo, inclusive @g.us>" }.
// Recurso exclusivo do QR (Meta não permite).
// sync-marker 2026-05-23T18:00:00Z — accepts jid (groups too)
router.post('/:connection_id/profile-picture', async (req, res) => {
  try {
    const jid = req.body && (req.body.jid || req.body.JID);
    const phone = req.body && (req.body.phone || req.body.Phone);
    if (!jid && !phone) return fail(res, 'missing_target', 'phone ou jid é obrigatório', 400);
    const r = await connectionService.getProfilePicture(req.params.connection_id, { phone, jid });
    return ok(res, r);
  } catch (err) {
    const status = err.httpStatus || 500;
    const code = err.code || 'profile_picture_failed';
    logger.warn('wuzapi_profile_picture_failed', {
      connection_id: req.params.connection_id,
      code,
      message: err && err.message,
    });
    return fail(res, code, err.message || 'Falha ao buscar foto', status);
  }
});

// POST /connections/:id/group-info — busca nome/tópico/participantes de um grupo
// via WuzAPI /group/list. Body: { jid: "<...>@g.us" }.
router.post('/:connection_id/group-info', async (req, res) => {
  try {
    const jid = req.body && (req.body.jid || req.body.JID);
    if (!jid) return fail(res, 'missing_jid', 'jid é obrigatório', 400);
    if (!String(jid).endsWith('@g.us')) {
      return fail(res, 'invalid_jid', 'jid deve terminar com @g.us', 400);
    }
    const r = await connectionService.getGroupInfo(req.params.connection_id, { jid });
    return ok(res, r);
  } catch (err) {
    const status = err.httpStatus || 500;
    const code = err.code || 'group_info_failed';
    logger.warn('wuzapi_group_info_failed', {
      connection_id: req.params.connection_id,
      code,
      message: err && err.message,
    });
    return fail(res, code, err.message || 'Falha ao buscar grupo', status);
  }
});

module.exports = router;
