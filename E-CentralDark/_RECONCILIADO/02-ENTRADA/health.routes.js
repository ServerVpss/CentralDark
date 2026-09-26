// Rota pública /health — usada para monitoramento e smoke tests.
const router = require('express').Router();
const env = require('../config/env');

router.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: env.GATEWAY_NAME,
    port: env.PORT,
    env: env.NODE_ENV,
    time: new Date().toISOString(),
  });
});

module.exports = router;
