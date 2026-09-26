// Rota pública /health — monitoramento e smoke tests.
// Quando configHealth.ok === false (URL proibida em prod), responde 503 degraded.
const router = require('express').Router();
const env = require('../config/env');

router.get('/health', (_req, res) => {
  const ch = global.__configHealth || { ok: true };
  const urls = ch.urls || null;
  const parity = ch.parity || null;

  const violations = (urls && urls.violations) || [];
  const divergences = (parity && parity.divergences) || [];

  const body = {
    ok: ch.ok !== false,
    status: ch.ok === false ? 'degraded' : 'ok',
    service: env.GATEWAY_NAME,
    port: env.PORT,
    env: env.NODE_ENV,
    time: new Date().toISOString(),
    config: {
      checked_at: ch.checkedAt,
      urls_ok: urls ? urls.ok : null,
      parity_ok: parity ? parity.ok : null,
      violations: violations.map((v) => ({
        var: v.var,
        host: v.currentHost,
        reason: v.reason,
        expected_hosts: v.expectedHosts,
      })),
      env_divergences: divergences.map((d) => ({
        var: d.var,
        kind: d.kind,
      })),
    },
  };

  const status = ch.ok === false ? 503 : 200;
  res.status(status).json(body);
});

module.exports = router;
