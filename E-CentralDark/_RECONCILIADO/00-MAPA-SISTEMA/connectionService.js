// Gerencia conexões WhatsApp (CRUD persistido em data/connections.json).
// Fluxo WuzAPI:
//   1) POST /admin/users (Authorization: ADMIN_TOKEN) → cria usuário com `token` pré-gerado
//   2) POST /session/connect (Token: SESSION_TOKEN) → inicia sessão Whatsmeow
//   3) GET  /session/qrcode  (Token: SESSION_TOKEN) → obtém QR (base64)
//   4) GET  /session/status  (Token: SESSION_TOKEN) → consulta estado
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { v4: uuid } = require('uuid');
const env = require('../config/env');
const wuzapi = require('./wuzapiClient');
const dbFallback = require('./wuzapiDbFallback');
const logger = require('../utils/logger');

const WATCHDOG_INTERVAL_MS = parseInt(process.env.WUZAPI_WEBHOOK_WATCHDOG_INTERVAL_MS || '300000', 10); // 5 min
const WATCHDOG_INITIAL_DELAY_MS = parseInt(process.env.WUZAPI_WEBHOOK_WATCHDOG_INITIAL_DELAY_MS || '30000', 10);
const WATCHDOG_ITEM_TIMEOUT_MS = parseInt(process.env.WUZAPI_WEBHOOK_WATCHDOG_ITEM_TIMEOUT_MS || '15000', 10);

const repairInFlight = new Set();
let watchdogTimer = null;

function ensureStore() {
  const dir = path.dirname(env.CONNECTION_STORE_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(env.CONNECTION_STORE_PATH)) {
    fs.writeFileSync(env.CONNECTION_STORE_PATH, JSON.stringify({ connections: [] }, null, 2));
  }
}

function readAll() {
  ensureStore();
  return JSON.parse(fs.readFileSync(env.CONNECTION_STORE_PATH, 'utf8'));
}

function writeAll(state) {
  fs.writeFileSync(env.CONNECTION_STORE_PATH, JSON.stringify(state, null, 2));
}

function listConnections({ workspaceId } = {}) {
  const state = readAll();
  const all = state.connections.map(redact);
  return workspaceId ? all.filter((c) => c.workspace_id === workspaceId) : all;
}

function getRaw(connectionId) {
  const state = readAll();
  return state.connections.find((c) => c.connection_id === connectionId) || null;
}

function getConnection(connectionId) {
  const c = getRaw(connectionId);
  return c ? redact(c) : null;
}

// Nunca expõe o token de sessão ao frontend.
function redact(c) {
  const { wuzapi_token, session_token, ...rest } = c;
  return rest;
}

function genSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function withTimeout(promise, ms, label) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label || 'operation'} timeout after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

async function createConnection({ workspace_id, name, label }) {
  if (!workspace_id) throw new Error('workspace_id obrigatório');
  if (!name) throw new Error('name obrigatório');

  const connection_id = uuid();
  const sessionName = `${workspace_id}__${connection_id}`.slice(0, 60);
  const sessionToken = genSessionToken();

  let instance = null;
  let acceptedToken = sessionToken;
  let status = 'qr';
  let lastError = null;
  try {
    instance = await wuzapi.createInstance({ name: sessionName, token: sessionToken });
    // Se WuzAPI devolveu um token próprio, prevalece o dela.
    const remoteToken =
      instance && (instance.token || instance.Token || (instance.data && (instance.data.token || instance.data.Token)));
    if (remoteToken) acceptedToken = remoteToken;
  } catch (err) {
    logger.error('wuzapi_create_instance_failed', { message: err && err.message, status: err && err.wuzapiStatus });
    status = 'error';
    lastError = err.message;
  }

  const now = new Date().toISOString();
  const newConn = {
    connection_id,
    workspace_id,
    name,
    label: label || null,
    provider: 'wuzapi',
    status,
    phone_number: null,
    session_name: sessionName,
    wuzapi_instance_id:
      (instance && (instance.id || instance.ID || (instance.data && (instance.data.id || instance.data.ID)))) || sessionName,
    session_token: acceptedToken,
    // wuzapi_token mantido por compat com código antigo.
    wuzapi_token: acceptedToken,
    created_at: now,
    updated_at: now,
    last_qr_at: null,
    last_connected_at: null,
    last_disconnected_at: null,
    last_error: lastError,
  };

  const state = readAll();
  state.connections.push(newConn);
  writeAll(state);

  return redact(newConn);
}

function updateConnection(connectionId, patch) {
  const state = readAll();
  const idx = state.connections.findIndex((c) => c.connection_id === connectionId);
  if (idx === -1) return null;
  state.connections[idx] = { ...state.connections[idx], ...patch, updated_at: new Date().toISOString() };
  writeAll(state);
  return redact(state.connections[idx]);
}

async function deleteConnection(connectionId) {
  const raw = getRaw(connectionId);
  if (!raw) return false;
  try {
    if (raw.wuzapi_instance_id) {
      await wuzapi.deleteInstance({ instanceId: raw.wuzapi_instance_id });
    }
  } catch (err) {
    logger.warn('wuzapi_delete_instance_failed', { message: err && err.message });
  }
  const state = readAll();
  state.connections = state.connections.filter((c) => c.connection_id !== connectionId);
  writeAll(state);
  return true;
}

// Normaliza status canônico da WuzAPI: 'qr' | 'connected' | 'disconnected' | 'error'
function pickStatus(payload) {
  if (!payload || typeof payload !== 'object') return null;
  const d = payload.data || payload;
  if (d.Connected === true || d.connected === true || d.LoggedIn === true || d.loggedIn === true) return 'connected';
  if (d.Connected === false && (d.LoggedIn === false || d.loggedIn === false)) {
    if (d.qrcode || d.QRCode || d.qr) return 'qr';
    return 'disconnected';
  }
  const s = String(d.status || d.Status || '').toLowerCase();
  if (s.includes('connect')) return 'connected';
  if (s.includes('qr')) return 'qr';
  if (s.includes('disconn') || s === 'logout') return 'disconnected';
  if (s.includes('error')) return 'error';
  return null;
}

function pickPhone(payload) {
  if (!payload || typeof payload !== 'object') return null;
  const d = payload.data || payload;
  return d.jid || d.JID || d.phone || d.Phone || d.phone_number || null;
}

// QR pode vir como string base64 pura, data URL, ou em campos QRCode/qrcode/code.
function pickQr(payload) {
  if (!payload) return { qr: null, qr_base64: null };
  if (typeof payload === 'string') {
    return payload.startsWith('data:')
      ? { qr: payload, qr_base64: payload.split(',')[1] || null }
      : { qr: payload, qr_base64: payload };
  }
  const d = payload.data || payload;
  const candidate = d.QRCode || d.qrcode || d.qr || d.QR || d.code || d.Code || null;
  if (!candidate) return { qr: null, qr_base64: null };
  if (typeof candidate === 'string' && candidate.startsWith('data:')) {
    return { qr: candidate, qr_base64: candidate.split(',')[1] || null };
  }
  return { qr: candidate, qr_base64: candidate };
}

function tokenOf(raw) {
  return raw && (raw.session_token || raw.wuzapi_token);
}

// Monta a URL pública que a WuzAPI vai chamar quando receber uma mensagem.
// O caminho /webhooks/wuzapi mora aqui mesmo (webhooks.routes.js) e o secret
// vai por query string pra simplificar (a WuzAPI nem sempre permite headers).
function buildWuzapiWebhookUrl(connectionId) {
  const base = (env.GATEWAY_PUBLIC_URL || `http://127.0.0.1:${env.PORT}`).replace(/\/+$/, '');
  const secret = encodeURIComponent(env.WUZAPI_WEBHOOK_SECRET || '');
  return `${base}/webhooks/wuzapi?connection_id=${encodeURIComponent(connectionId)}&secret=${secret}`;
}

async function ensureWebhookConfigured(raw) {
  const token = tokenOf(raw);
  if (!token) return;
  const webhookUrl = buildWuzapiWebhookUrl(raw.connection_id);
  await wuzapi.setWebhook({ sessionToken: token, webhookUrl });
  logger.info('wuzapi_webhook_set', { connection_id: raw.connection_id });
}


async function getStatus(connectionId) {
  const raw = getRaw(connectionId);
  if (!raw) return null;
  const base = {
    connection_id: raw.connection_id,
    status: raw.status,
    phone_number: raw.phone_number || null,
    last_connected_at: raw.last_connected_at || null,
    last_disconnected_at: raw.last_disconnected_at || null,
  };
  const token = tokenOf(raw);
  if (!token) return base;
  try {
    const r = await wuzapi.getStatus({ sessionToken: token });
    const remoteStatus = pickStatus(r) || raw.status;
    const phone = pickPhone(r) || raw.phone_number || null;
    const becameConnected = remoteStatus === 'connected' && raw.status !== 'connected';
    if (remoteStatus !== raw.status || (phone && phone !== raw.phone_number)) {
      const patch = { status: remoteStatus, phone_number: phone, last_error: null };
      if (remoteStatus === 'connected' && !raw.last_connected_at) patch.last_connected_at = new Date().toISOString();
      if (remoteStatus === 'disconnected') patch.last_disconnected_at = new Date().toISOString();
      updateConnection(connectionId, patch);
    }
    if (becameConnected) {
      scheduleConnectionRepair(connectionId, 'status_became_connected');
    }
    return { ...base, status: remoteStatus, phone_number: phone };
  } catch (err) {
    logger.warn('wuzapi_status_failed', { connection_id: connectionId, message: err && err.message, status: err && err.wuzapiStatus });
    return { ...base, status: 'unknown' };
  }
}

async function getQr(connectionId) {
  const raw = getRaw(connectionId);
  if (!raw) {
    const e = new Error('Conexão não encontrada');
    e.code = 'not_found';
    e.httpStatus = 404;
    throw e;
  }
  const token = tokenOf(raw);
  if (!raw.wuzapi_instance_id || !token) {
    const e = new Error('Conexão sem credenciais WuzAPI — recrie a conexão');
    e.code = 'no_credentials';
    e.httpStatus = 400;
    throw e;
  }

  // 1) Tenta /session/connect — não falha se já estiver conectada.
  try {
    await wuzapi.connectSession({ sessionToken: token });
  } catch (err) {
    const status = err && err.wuzapiStatus;
    const msg = String(err && err.message || '').toLowerCase();
    const alreadyConnected = msg.includes('already') || msg.includes('connected');
    if (!alreadyConnected && status && status >= 500) {
      logger.error('wuzapi_connect_failed', { connection_id: connectionId, message: err.message, status });
      const e = new Error('Falha ao iniciar sessão WuzAPI');
      e.code = 'connect_failed';
      e.httpStatus = 502;
      throw e;
    }
    // 4xx (já conectada / conflito) → segue para QR.
  }

  // 1.5) Garante que a WuzAPI tem o webhook configurado para esta sessão.
  // Sem isso a WuzAPI aceita mensagens mas não dispara nada — o log mostra
  // "No webhook set for user" e o chat fica vazio.
  await ensureWebhookConfigured(raw).catch((err) => {
    logger.warn('wuzapi_set_webhook_failed', { connection_id: connectionId, message: err && err.message });
  });


  // 2) Pequeno delay para a WuzAPI gerar o QR.
  await sleep(400);

  // 3) Busca QR.
  let payload;
  try {
    payload = await wuzapi.getQr({ sessionToken: token });
  } catch (err) {
    logger.error('wuzapi_qr_failed', { connection_id: connectionId, message: err && err.message, status: err && err.wuzapiStatus });
    const e = new Error('Falha ao obter QR da WuzAPI');
    e.code = 'qr_failed';
    e.httpStatus = 502;
    throw e;
  }

  const { qr, qr_base64 } = pickQr(payload);
  if (!qr && !qr_base64) {
    // Pode já estar logada — confere status real antes de devolver erro.
    try {
      const st = await wuzapi.getStatus({ sessionToken: token });
      const remoteStatus = pickStatus(st);
      if (remoteStatus === 'connected') {
        const phone = pickPhone(st);
        updateConnection(connectionId, {
          status: 'connected',
          phone_number: phone,
          last_connected_at: raw.last_connected_at || new Date().toISOString(),
          last_error: null,
        });
        scheduleConnectionRepair(connectionId, 'qr_already_connected');
        return { connection_id: raw.connection_id, status: 'connected', qr: null, qr_base64: null, expires_in: 0 };
      }
    } catch (_) { /* ignore */ }
    const e = new Error('QR vazio retornado pela WuzAPI');
    e.code = 'qr_empty';
    e.httpStatus = 502;
    throw e;
  }

  updateConnection(connectionId, { last_qr_at: new Date().toISOString(), status: 'qr', last_error: null });
  return {
    connection_id: raw.connection_id,
    status: 'qr',
    qr,
    qr_base64,
    expires_in: 60,
  };
}

async function restart(connectionId) {
  const raw = getRaw(connectionId);
  if (!raw) return null;
  const token = tokenOf(raw);
  if (!token) throw new Error('conexão sem token WuzAPI');
  const r = await wuzapi.connectSession({ sessionToken: token });
  // Reaplica webhook+eventos — em alguns casos a WuzAPI esquece a lista após restart.
  scheduleConnectionRepair(connectionId, 'restart');
  return r;
}

// Pausa temporária — chama WuzAPI POST /session/disconnect.
// MANTÉM o pareamento/credencial (whatsmeow store intacto). NÃO chama /session/logout.
// Religar = restart() (que chama /session/connect e reutiliza a sessão sem QR).
async function disconnect(connectionId) {
  const raw = getRaw(connectionId);
  if (!raw) return null;
  const token = tokenOf(raw);
  if (!token) throw new Error('conexão sem token WuzAPI');
  const r = await wuzapi.disconnectSession({ sessionToken: token });
  updateConnection(connectionId, { status: 'disconnected', last_disconnected_at: new Date().toISOString() });
  return r;
}

async function logoutConnection(connectionId) {
  const raw = getRaw(connectionId);
  if (!raw) return null;
  const token = tokenOf(raw);
  if (!token) return null;
  const r = await wuzapi.logout({ sessionToken: token });
  updateConnection(connectionId, { status: 'disconnected', last_disconnected_at: new Date().toISOString() });
  return r;
}

function getTokenFor(connectionId) {
  const raw = getRaw(connectionId);
  return tokenOf(raw);
}

// Extrai diagnóstico do payload de /session/status (formatos variados).
function extractDiagnostic(statusPayload) {
  const d = (statusPayload && (statusPayload.data || statusPayload)) || {};
  const subscribe = d.Subscribe || d.subscribe || d.subscribedEvents || null;
  const subscribeSaved = Array.isArray(subscribe) ? subscribe : (subscribe ? [String(subscribe)] : []);
  const eventsRaw = d.events != null ? d.events : (d.Events != null ? d.Events : null);
  const events = eventsRaw == null ? subscribeSaved.join(',') : String(eventsRaw);
  const webhook = d.webhook || d.Webhook || d.webhookURL || d.WebhookURL || null;
  const connected = d.Connected === true || d.connected === true;
  const loggedIn = d.LoggedIn === true || d.loggedIn === true;
  const jid = d.jid || d.JID || d.phone || d.Phone || null;
  return {
    webhook_url_saved: !!webhook,
    subscribe_saved: subscribeSaved,
    events_saved: events || '',
    session_status: connected ? 'connected' : (loggedIn ? 'logged_in' : 'disconnected'),
    logged_in: loggedIn,
    jid: jid || null,
  };
}

// Reaplica o webhook na WuzAPI SEM logout e SEM gerar novo QR.
// Fluxo:
//   1) setWebhook (webhookURL + Subscribe + events)
//   2) GET /session/status → lê diagnóstico
//   3) Se events vazio e sessão connected/loggedIn:
//        disconnect (não logout) → connect (Subscribe+events+Immediate) →
//        setWebhook → relê status
//   4) Retorna diagnóstico estruturado
async function reapplyWebhook(connectionId) {
  const raw = getRaw(connectionId);
  if (!raw) {
    const e = new Error('Conexão não encontrada');
    e.code = 'not_found';
    e.httpStatus = 404;
    throw e;
  }
  const token = tokenOf(raw);
  if (!token) {
    const e = new Error('Conexão sem token WuzAPI — refaça o pareamento do QR');
    e.code = 'no_credentials';
    e.httpStatus = 400;
    throw e;
  }

  // 1) Reaplica webhook (Subscribe + events + webhookURL).
  await ensureWebhookConfigured(raw);

  // 2) Lê status pra montar diagnóstico.
  let diag;
  try {
    const st = await wuzapi.getStatus({ sessionToken: token });
    diag = extractDiagnostic(st);
  } catch (err) {
    logger.warn('wuzapi_status_after_webhook_failed', {
      connection_id: connectionId, message: err && err.message,
    });
    diag = {
      webhook_url_saved: true, subscribe_saved: [], events_saved: '',
      session_status: 'unknown', logged_in: false, jid: null,
    };
  }

  // 3) Auto-correção SEGURA quando events ficou vazio.
  let autoFix = false;
  if (!diag.events_saved && (diag.session_status === 'connected' || diag.logged_in)) {
    logger.warn('wuzapi_events_empty_auto_fix_start', { connection_id: connectionId });
    autoFix = true;
    try {
      await wuzapi.disconnectSession({ sessionToken: token });
    } catch (err) {
      logger.warn('wuzapi_disconnect_failed_during_fix', {
        connection_id: connectionId, message: err && err.message,
      });
    }
    await sleep(800);
    try {
      await wuzapi.connectSession({ sessionToken: token });
    } catch (err) {
      logger.warn('wuzapi_connect_failed_during_fix', {
        connection_id: connectionId, message: err && err.message,
      });
    }
    try {
      await ensureWebhookConfigured(raw);
    } catch (err) {
      logger.warn('wuzapi_setwebhook_failed_during_fix', {
        connection_id: connectionId, message: err && err.message,
      });
    }
    await sleep(500);
    try {
      const st2 = await wuzapi.getStatus({ sessionToken: token });
      diag = extractDiagnostic(st2);
    } catch (err) {
      logger.warn('wuzapi_status_after_fix_failed', {
        connection_id: connectionId, message: err && err.message,
      });
    }
  }

  // 4) Fallback SQL controlado — só roda se WUZAPI_DB_URL estiver setado
  //    e o auto-fix anterior não populou `events`. Atualiza direto na tabela
  //    `users` da WuzAPI usando o token como chave (sem userID hardcoded).
  let dbFallbackResult = null;
  if (!diag.events_saved && dbFallback.isEnabled()) {
    const events = wuzapi.getSubscribedEvents
      ? wuzapi.getSubscribedEvents(process.env.WUZAPI_SUBSCRIBE_MODE || 'full')
      : null;
    if (events && events.length) {
      dbFallbackResult = await dbFallback.forceEvents({ sessionToken: token, events });
      if (dbFallbackResult.ok) {
        // Reconect pra WuzAPI carregar a nova lista de events em memória.
        try { await wuzapi.disconnectSession({ sessionToken: token }); } catch (_e) { /* ignore */ }
        await sleep(500);
        try { await wuzapi.connectSession({ sessionToken: token }); } catch (_e) { /* ignore */ }
        try { await ensureWebhookConfigured(raw); } catch (_e) { /* ignore */ }
        await sleep(400);
        try {
          const st3 = await wuzapi.getStatus({ sessionToken: token });
          diag = extractDiagnostic(st3);
        } catch (_e) { /* ignore */ }
      }
    }
  }

  return {
    connection_id: raw.connection_id,
    webhook_reapplied: true,
    reapplied_at: new Date().toISOString(),
    diagnostic: {
      ...diag,
      subscribed_events_empty_after_fix: !diag.events_saved,
      auto_fix_applied: autoFix,
      db_fallback_enabled: dbFallback.isEnabled(),
      db_fallback_result: dbFallbackResult,
    },
  };
}

// Reaplica webhook+eventos em TODAS as conexões WuzAPI. Tolerante a falhas:
// um erro numa conexão não interrompe as outras. Retorna resumo detalhado.
// Protegido na rota (Bearer MULTIZAP_GATEWAY_TOKEN).
// sync-marker 2026-05-22T01:46:45Z — força publicação de repairAllWebhooks no GitHub main.
async function repairAllWebhooks() {
  const all = listConnections();
  const details = [];
  let repaired = 0;
  let failed = 0;
  for (const c of all) {
    const cid = c.connection_id;
    try {
      const r = await reapplyWebhook(cid);
      const empty = !!(r && r.diagnostic && r.diagnostic.subscribed_events_empty_after_fix);
      if (empty) {
        failed += 1;
        details.push({
          connection_id: cid,
          ok: false,
          reason: 'events_still_empty_after_fix',
          diagnostic: r.diagnostic,
        });
      } else {
        repaired += 1;
        details.push({
          connection_id: cid,
          ok: true,
          events_saved: r.diagnostic && r.diagnostic.events_saved,
          status_connected: !!(r.diagnostic && (r.diagnostic.session_status === 'connected' || r.diagnostic.logged_in)),
          auto_fix_applied: !!(r.diagnostic && r.diagnostic.auto_fix_applied),
        });
      }
    } catch (err) {
      failed += 1;
      details.push({
        connection_id: cid,
        ok: false,
        reason: 'reapply_failed',
        message: err && err.message ? String(err.message).slice(0, 300) : String(err).slice(0, 300),
      });
      logger.warn('wuzapi_repair_all_item_failed', {
        connection_id: cid,
        message: err && err.message,
      });
    }
  }
  return {
    ok: true,
    total: all.length,
    repaired,
    failed,
    repaired_at: new Date().toISOString(),
    details,
  };
}

function scheduleConnectionRepair(connectionId, reason) {
  if (!connectionId || repairInFlight.has(connectionId)) return;
  repairInFlight.add(connectionId);
  setTimeout(async () => {
    try {
      logger.info('wuzapi_auto_repair_start', { connection_id: connectionId, reason });
      const r = await withTimeout(reapplyWebhook(connectionId), WATCHDOG_ITEM_TIMEOUT_MS, 'wuzapi_auto_repair');
      const empty = !!(r && r.diagnostic && r.diagnostic.subscribed_events_empty_after_fix);
      logger[empty ? 'warn' : 'info']('wuzapi_auto_repair_done', {
        connection_id: connectionId,
        reason,
        events_configured: !empty,
        auto_fix_applied: !!(r && r.diagnostic && r.diagnostic.auto_fix_applied),
      });
    } catch (err) {
      logger.warn('wuzapi_auto_repair_failed', { connection_id: connectionId, reason, message: err && err.message });
    } finally {
      repairInFlight.delete(connectionId);
    }
  }, 1200).unref?.();
}

async function runWebhookWatchdog() {
  const all = listConnections().filter((c) => c.provider === 'wuzapi' && c.status === 'connected');
  let checked = 0;
  let repaired = 0;
  let failed = 0;
  for (const c of all) {
    checked += 1;
    if (repairInFlight.has(c.connection_id)) continue;
    try {
      const diag = await withTimeout(getConnectionDiagnostic(c.connection_id), WATCHDOG_ITEM_TIMEOUT_MS, 'wuzapi_watchdog_diag');
      if (!diag || !diag.logged_in) continue;
      if (!diag.webhook_configured || !diag.events_configured) {
        repaired += 1;
        await withTimeout(reapplyWebhook(c.connection_id), WATCHDOG_ITEM_TIMEOUT_MS, 'wuzapi_watchdog_repair');
      }
    } catch (err) {
      failed += 1;
      logger.warn('wuzapi_watchdog_item_failed', { connection_id: c.connection_id, message: err && err.message });
    }
  }
  logger.info('wuzapi_watchdog_done', { checked, repaired, failed });
  return { checked, repaired, failed };
}

function startWebhookWatchdog() {
  if (watchdogTimer || !WATCHDOG_INTERVAL_MS || WATCHDOG_INTERVAL_MS < 60000) return false;
  const tick = () => runWebhookWatchdog().catch((err) => {
    logger.warn('wuzapi_watchdog_failed', { message: err && err.message });
  });
  setTimeout(tick, WATCHDOG_INITIAL_DELAY_MS).unref?.();
  watchdogTimer = setInterval(tick, WATCHDOG_INTERVAL_MS);
  watchdogTimer.unref?.();
  logger.info('wuzapi_watchdog_started', { interval_ms: WATCHDOG_INTERVAL_MS, initial_delay_ms: WATCHDOG_INITIAL_DELAY_MS });
  return true;
}

// Diagnóstico por conexão (sem token): usado pelo /__diag/wuzapi.
async function getConnectionDiagnostic(connectionId) {
  const raw = getRaw(connectionId);
  if (!raw) return null;
  const token = tokenOf(raw);
  if (!token) {
    return {
      connection_id: connectionId,
      session_connected: false,
      logged_in: false,
      webhook_configured: false,
      events_configured: false,
      events: '',
      reason: 'no_token',
    };
  }
  try {
    const st = await wuzapi.getStatus({ sessionToken: token });
    const diag = extractDiagnostic(st);
    return {
      connection_id: connectionId,
      session_connected: diag.session_status === 'connected',
      logged_in: !!diag.logged_in,
      webhook_configured: !!diag.webhook_url_saved,
      events_configured: !!diag.events_saved,
      events: diag.events_saved || '',
      jid: diag.jid || null,
    };
  } catch (err) {
    return {
      connection_id: connectionId,
      session_connected: false,
      logged_in: false,
      webhook_configured: false,
      events_configured: false,
      events: '',
      error: err && err.message ? String(err.message).slice(0, 200) : 'status_failed',
    };
  }
}

// Busca foto de perfil via WuzAPI. Recurso exclusivo do QR.
// Aceita { phone } para privado OU { jid } (inclusive grupo @g.us).
async function getProfilePicture(connectionId, target) {
  const raw = getRaw(connectionId);
  if (!raw) {
    const e = new Error('Conexão não encontrada');
    e.code = 'not_found';
    e.httpStatus = 404;
    throw e;
  }
  const token = tokenOf(raw);
  if (!token) {
    const e = new Error('Conexão sem token WuzAPI');
    e.code = 'no_credentials';
    e.httpStatus = 400;
    throw e;
  }
  // Compat retro: se chamado com string, trata como phone.
  const args = typeof target === 'string' ? { phone: target } : (target || {});
  const picture = await wuzapi.getProfilePicture({ sessionToken: token, phone: args.phone, jid: args.jid });
  return { picture, fetched_at: new Date().toISOString() };
}

// Busca info de um grupo via /group/list (filtra pelo JID @g.us).
// Retorna { JID, Name, Topic, ParticipantsCount } sanitizados.
async function getGroupInfo(connectionId, target) {
  const args = target || {};
  const jid = String(args.jid || args.JID || '').trim();
  if (!jid || !jid.endsWith('@g.us')) {
    const e = new Error('jid de grupo inválido (deve terminar com @g.us)');
    e.code = 'invalid_jid';
    e.httpStatus = 400;
    throw e;
  }
  const raw = getRaw(connectionId);
  if (!raw) {
    const e = new Error('Conexão não encontrada');
    e.code = 'not_found';
    e.httpStatus = 404;
    throw e;
  }
  const token = tokenOf(raw);
  if (!token) {
    const e = new Error('Conexão sem token WuzAPI');
    e.code = 'no_credentials';
    e.httpStatus = 400;
    throw e;
  }
  const groups = await wuzapi.listGroups({ sessionToken: token });
  const found = (groups || []).find((g) => {
    const gjid = g && (g.JID || g.Jid || g.jid);
    return gjid && String(gjid) === jid;
  });
  if (!found) {
    const e = new Error('Grupo não encontrado');
    e.code = 'group_not_found';
    e.httpStatus = 404;
    throw e;
  }
  const participants = found.Participants || found.participants || [];
  return {
    JID: found.JID || found.Jid || found.jid || jid,
    Name: found.Name || found.name || found.Subject || null,
    Topic: found.Topic || found.topic || null,
    ParticipantsCount: Array.isArray(participants) ? participants.length : Number(participants) || 0,
  };
}



module.exports = {
  list: () => listConnections(),
  listConnections,
  getConnection,
  getRaw,
  createConnection,
  updateConnection,
  deleteConnection,
  getStatus,
  getQr,
  restart,
  disconnect,
  logoutConnection,
  reapplyWebhook,
  repairAllWebhooks,
  scheduleConnectionRepair,
  runWebhookWatchdog,
  startWebhookWatchdog,
  getConnectionDiagnostic,
  getTokenFor,
  getProfilePicture,
  getGroupInfo,
};
