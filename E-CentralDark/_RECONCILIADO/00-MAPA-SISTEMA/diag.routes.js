// Montado em app.js como: app.use('/__diag', diagRoutes)
// Endpoint final: GET /__diag/wuzapi  (router.get('/wuzapi'))
// Protegido pelo mesmo Bearer token do gateway. NUNCA expõe tokens/secrets/corpo de msg.
// sync-marker 2026-05-22T23:10Z — blindado contra diagService.snapshot ausente (deploy parcial/cache).
const router = require('express').Router();
const env = require('../config/env');
const diagService = require('../services/diagService');
const wuzapiClient = require('../services/wuzapiClient');
const connectionService = require('../services/connectionService');

const EMPTY_SNAPSHOT = {
  startedAt: null,
  lastType: null,
  lastNormalizedKind: null,
  lastReceivedAt: null,
  jsonDataParsedCount: 0,
  jsonDataFailedCount: 0,
  unknownCount: 0,
  totalCount: 0,
  byKind: {},
  lastEvents: [],
  lastError: null,
};

function safeSnapshot() {
  try {
    if (diagService && typeof diagService.snapshot === 'function') {
      const s = diagService.snapshot();
      return s && typeof s === 'object' ? s : EMPTY_SNAPSHOT;
    }
  } catch (_e) {
    // engole — endpoint nunca pode quebrar por causa de diagnóstico
  }
  return EMPTY_SNAPSHOT;
}

function auth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!env.MULTIZAP_GATEWAY_TOKEN || token !== env.MULTIZAP_GATEWAY_TOKEN) {
    return res.status(401).json({ ok: false, error: 'unauthorized' });
  }
  next();
}

// Promise.race com timeout — se passar `ms`, devolve `fallback` em vez de pendurar.
function withTimeout(promise, ms, fallback) {
  return Promise.race([
    Promise.resolve(promise).catch((err) => ({ error: (err && err.message) || 'failed' })),
    new Promise((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

router.get('/wuzapi', auth, async (_req, res) => {
  const snap = safeSnapshot();
  const mode = process.env.WUZAPI_SUBSCRIBE_MODE || 'full';
  const subscribedEvents = wuzapiClient.getSubscribedEvents
    ? wuzapiClient.getSubscribedEvents(mode)
    : null;

  // Indexa por connection_id: último evento recebido (do snapshot em memória).
  const lastByConn = {};
  for (const ev of snap.lastEvents || []) {
    if (ev && ev.connection_id && !lastByConn[ev.connection_id]) {
      lastByConn[ev.connection_id] = { ts: ev.ts, type: ev.type, kind: ev.kind };
    }
  }

  // Timeouts:
  // - cada conexão tem no máximo 1500ms pra responder
  // - o conjunto inteiro tem no máximo 4000ms; se estourar, retorna o que conseguiu
  const PER_CONN_TIMEOUT_MS = 1500;
  const TOTAL_TIMEOUT_MS = 4000;

  let connections = [];
  let connectionsTimedOut = false;
  try {
    const all = connectionService.list ? connectionService.list() : [];
    const perConn = all.map(async (c) => {
      const d = await withTimeout(
        connectionService.getConnectionDiagnostic(c.connection_id),
        PER_CONN_TIMEOUT_MS,
        { error: 'timeout' },
      );
      const last = lastByConn[c.connection_id] || null;
      return {
        connection_id: c.connection_id,
        status: c.status,
        last_connected_at: c.last_connected_at || null,
        last_disconnected_at: c.last_disconnected_at || null,
        session_connected: !!(d && d.session_connected),
        logged_in: !!(d && d.logged_in),
        webhook_configured: !!(d && d.webhook_configured),
        events_configured: !!(d && d.events_configured),
        events: (d && d.events) || '',
        last_webhook_at: last ? last.ts : null,
        last_webhook_kind: last ? last.kind : null,
        error: (d && d.error) || null,
      };
    });

    const TIMEOUT_SENTINEL = Symbol('total_timeout');
    const result = await Promise.race([
      Promise.all(perConn),
      new Promise((resolve) => setTimeout(() => resolve(TIMEOUT_SENTINEL), TOTAL_TIMEOUT_MS)),
    ]);
    if (result === TIMEOUT_SENTINEL) {
      connectionsTimedOut = true;
      connections = [];
    } else {
      connections = result;
    }
  } catch (_e) {
    connections = [];
  }

  res.json({
    ok: true,
    service: 'multizap-gateway',
    time: new Date().toISOString(),
    startedAt: snap.startedAt,
    subscribe: {
      mode,
      events: subscribedEvents,
      webhookConfigured: Boolean(env.WUZAPI_WEBHOOK_SECRET),
    },
    counters: {
      total: snap.totalCount,
      unknown: snap.unknownCount,
      jsonDataParsed: snap.jsonDataParsedCount,
      jsonDataFailed: snap.jsonDataFailedCount,
      byKind: snap.byKind,
    },
    last: {
      type: snap.lastType,
      kind: snap.lastNormalizedKind,
      at: snap.lastReceivedAt,
      events: snap.lastEvents,
      error: snap.lastError,
    },
    connections,
    connections_timed_out: connectionsTimedOut,
    timeouts_ms: { per_connection: PER_CONN_TIMEOUT_MS, total: TOTAL_TIMEOUT_MS },
  });
});

module.exports = router;
