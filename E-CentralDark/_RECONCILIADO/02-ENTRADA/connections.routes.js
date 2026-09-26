// Rotas de conexões — todas protegidas por Bearer GATEWAY_SERVER_TOKEN.
const router = require('express').Router();
const auth = require('../middlewares/authMiddleware');
const connectionService = require('../services/connectionService');
const { ok, fail } = require('../utils/response');
const logger = require('../utils/logger');

router.use(auth);

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
    const conn = connectionService.getRaw(req.params.connection_id);
    if (!conn) {
      return fail(res, 'not_found', 'Conexão não localizada no Gateway.', 404);
    }
    if (!conn.wuzapi_token) {
      return fail(res, 'no_token', 'A conexão ainda não possui token validado na WuzAPI.', 409);
    }
    const r = await connectionService.getQr(req.params.connection_id);
    return ok(res, r);
  } catch (err) {
    // Retornamos 409 Conflict ou 502 Bad Gateway se o GoLang rejeitar para dar um aviso melhor no front.
    const status = err.message.includes('token WuzAPI') ? 409 : 502;
    return fail(res, 'qr_failed', err.message, status);
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

router.post('/:connection_id/logout', async (req, res) => {
  try {
    const r = await connectionService.logoutConnection(req.params.connection_id);
    return ok(res, r);
  } catch (err) {
    return fail(res, 'logout_failed', err.message, 500);
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

module.exports = router;
