// Rotas de envio — protegidas por Bearer GATEWAY_SERVER_TOKEN.
const router = require('express').Router();
const auth = require('../middlewares/authMiddleware');
const messageService = require('../services/messageService');
const { ok, fail } = require('../utils/response');

router.use(auth);

router.post('/send-text', async (req, res) => {
  const body = req.body || {};
  if (!body.connection_id || !body.to || !body.message) {
    return fail(res, 'invalid_payload', 'Parâmetros connection_id, to, e message são obrigatórios.', 400);
  }
  try {
    const r = await messageService.sendText(body);
    return ok(res, r);
  } catch (err) {
    return fail(res, err.code || 'send_failed', err.message, err.status || 500);
  }
});

router.post('/send-media', async (req, res) => {
  try {
    const r = await messageService.sendMedia(req.body || {});
    return ok(res, r);
  } catch (err) {
    return fail(res, err.code || 'send_failed', err.message, err.status || 500);
  }
});

module.exports = router;
