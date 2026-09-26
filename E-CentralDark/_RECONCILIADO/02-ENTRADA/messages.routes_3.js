// Rotas de envio — protegidas por Bearer MULTIZAP_GATEWAY_TOKEN.
const router = require('express').Router();
const auth = require('../middlewares/authMiddleware');
const messageService = require('../services/messageService');
const { ok, fail } = require('../utils/response');

router.use(auth);

router.post('/send-text', async (req, res) => {
  try {
    const r = await messageService.sendText(req.body || {});
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
