const express = require('express');
const router = express.Router();

// Carregar envs do cofre VPS
try { require('dotenv').config({ path: '/root/Multizap/secrets/wabot.env', override: false }); } catch(e) {}

const WUZAPI_URL = process.env.WUZAPI_URL || 'http://127.0.0.1:8081';
const WUZAPI_TOKEN = process.env.WUZAPI_TOKEN || '';

// Helper: chamar WuzAPI (server-side, localhost)
async function wuzapiCall(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json', 'token': WUZAPI_TOKEN },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${WUZAPI_URL}${path}`, opts);
  return res.json();
}

// GET /api/instances — listar sessões do WuzAPI
router.get('/', async (req, res) => {
  try {
    const data = await wuzapiCall('GET', '/sessions');
    res.json({ ok: true, data });
  } catch (err) {
    console.error('[Instances] Erro listando sessões:', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/instances/:id/status — status de uma sessão
router.get('/:id/status', async (req, res) => {
  try {
    const data = await wuzapiCall('GET', `/session/status/${req.params.id}`);
    res.json({ ok: true, data });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/instances/:id/connect — iniciar sessão e pedir QR
router.post('/:id/connect', async (req, res) => {
  try {
    const data = await wuzapiCall('POST', '/session/connect', {
      id: req.params.id,
      ...req.body,
    });
    res.json({ ok: true, data });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/instances/:id/qr — buscar QR code
router.get('/:id/qr', async (req, res) => {
  try {
    const data = await wuzapiCall('GET', `/session/qr/${req.params.id}`);
    res.json({ ok: true, data });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// DELETE /api/instances/:id — desconectar sessão
router.delete('/:id', async (req, res) => {
  try {
    const data = await wuzapiCall('POST', `/session/disconnect/${req.params.id}`);
    res.json({ ok: true, data });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
