// Cliente HTTP para a WuzAPI local (Whatsmeow).
// Mantém o token admin fora dos logs e expõe operações de alto nível.
// IMPORTANTE — convenções de header da WuzAPI:
//   * Rotas /admin/*  → header `Authorization: <WUZAPI_ADMIN_TOKEN>`
//   * Rotas /session/* e /chat/* → header `Token: <SESSION_TOKEN>` (capital T)
//
// 2026-05-21 — fix definitivo subscribedEvents=[]:
//   A WuzAPI tem DOIS campos que controlam a assinatura: `Subscribe` (lista,
//   formato novo) e `events` (CSV, formato legado). O log "Skipping webhook.
//   Not subscribed for this type subscribedEvents=[]" só é silenciado quando
//   AMBOS estão preenchidos. Mandamos os dois em todas as rotas relevantes.
const axios = require('axios');
const env = require('../config/env');
const logger = require('../utils/logger');
const { safeLog, mask, maskQuery } = require('../utils/safeLog');

// Perfis de assinatura WuzAPI (validados contra constants.go do WuzAPI).
// Modo controlado por env WUZAPI_SUBSCRIBE_MODE: basic | full | debug.
// Default: full.
const WUZAPI_EVENTS_BASIC = ['Message', 'ReadReceipt', 'ChatPresence'];
// FULL: validado contra constants.go + wmiau.go do asternic/wuzapi (auditoria 2026-05-23).
// REMOVIDOS (nunca disparam): Receipt, AppState, AppStateSyncComplete, StreamReplaced,
//                             QRScannedWithoutMultidevice, CATRefreshError.
// ADICIONADOS: Blocklist, KeepAliveRestored, KeepAliveTimeout, UserAbout, PrivacySettings,
//              OfflineSyncPreview, StreamError, NewsletterJoin/Leave/MuteChange/LiveUpdate, FBMessage.
const WUZAPI_EVENTS_FULL = [
  // Mensagens
  'Message', 'ReadReceipt', 'UndecryptableMessage', 'MediaRetry',
  // Grupos / contatos / foto
  'GroupInfo', 'JoinedGroup', 'Picture', 'BlocklistChange', 'Blocklist',
  // Conexão
  'Connected', 'Disconnected', 'ConnectFailure', 'LoggedOut',
  'PairSuccess', 'PairError', 'QR', 'QRTimeout',
  'TemporaryBan', 'ClientOutdated', 'StreamError',
  'KeepAliveRestored', 'KeepAliveTimeout',
  // Identidade / push name / sobre / privacidade
  'IdentityChange', 'PushNameSetting', 'UserAbout', 'PrivacySettings',
  // Histórico
  'HistorySync', 'OfflineSyncCompleted', 'OfflineSyncPreview',
  // Presença
  'Presence', 'ChatPresence',
  // Chamadas
  'CallOffer', 'CallAccept', 'CallTerminate', 'CallOfferNotice', 'CallRelayLatency',
  // Newsletter / Meta bridge
  'NewsletterJoin', 'NewsletterLeave', 'NewsletterMuteChange', 'NewsletterLiveUpdate',
  'FBMessage',
];
const WUZAPI_EVENTS_DEBUG = ['All'];

function pickEventList() {
  const mode = String(process.env.WUZAPI_SUBSCRIBE_MODE || 'full').toLowerCase();
  if (mode === 'basic') return WUZAPI_EVENTS_BASIC;
  if (mode === 'debug') return WUZAPI_EVENTS_DEBUG;
  return WUZAPI_EVENTS_FULL;
}

const WUZAPI_EVENTS = pickEventList();
const WUZAPI_EVENTS_CSV = WUZAPI_EVENTS.join(',');

const client = axios.create({
  baseURL: env.WUZAPI_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
  // Não lança em 4xx/5xx — tratamos manualmente para preservar status code.
  validateStatus: () => true,
});

function adminHeaders() {
  return { Authorization: env.WUZAPI_ADMIN_TOKEN };
}

function sessionHeaders(sessionToken) {
  // Capital "T" — exigido pela WuzAPI.
  return { Token: sessionToken };
}

function logCall(step, method, url, status, extra) {
  const safeUrl = maskQuery(url);
  const cleanExtra = extra ? { ...extra } : {};
  delete cleanExtra.Authorization;
  delete cleanExtra.authorization;
  delete cleanExtra.Token;
  delete cleanExtra.token;
  logger.info('wuzapi_call', safeLog({ step, method, url: safeUrl, status, ...cleanExtra }));
}

function buildError(step, status, data) {
  const msg = (data && (data.error || data.message)) || `WuzAPI ${step} HTTP ${status}`;
  const err = new Error(msg);
  err.wuzapiStep = step;
  err.wuzapiStatus = status;
  return err;
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN
// ─────────────────────────────────────────────────────────────────────────────

async function createInstance({ name, token }) {
  const body = { name };
  if (token) body.token = token;
  const res = await client.post('/admin/users', body, { headers: adminHeaders() });
  logCall('admin_create_user', 'POST', '/admin/users', res.status, { name, token: mask(token || '') });
  if (res.status >= 400) throw buildError('admin_create_user', res.status, res.data);
  return res.data;
}

async function deleteInstance({ instanceId }) {
  const res = await client.delete(`/admin/users/${instanceId}`, { headers: adminHeaders() });
  logCall('admin_delete_user', 'DELETE', `/admin/users/${instanceId}`, res.status);
  if (res.status >= 400 && res.status !== 404) throw buildError('admin_delete_user', res.status, res.data);
  return res.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// SESSÃO — todas usam header `Token: <sessionToken>`
// ─────────────────────────────────────────────────────────────────────────────

async function connectSession({ sessionToken }) {
  // Manda TODAS as variações que diferentes builds/forks da WuzAPI aceitam.
  // Sem isso, sessões antigas voltam com subscribedEvents=[] mesmo após connect.
  //   - Subscribe (PascalCase) — formato canônico v3
  //   - subscribe (lowercase) — fork comum (usado em algumas builds Go)
  //   - events (CSV) + Events (array) — formato legado
  const body = {
    Subscribe: WUZAPI_EVENTS,
    subscribe: WUZAPI_EVENTS,
    Events: WUZAPI_EVENTS,
    events: WUZAPI_EVENTS_CSV,
    Immediate: true,
  };
  const res = await client.post('/session/connect', body, { headers: sessionHeaders(sessionToken) });
  logCall('session_connect', 'POST', '/session/connect', res.status, { events_count: WUZAPI_EVENTS.length });
  if (res.status >= 400) throw buildError('session_connect', res.status, res.data);
  return res.data;
}

// Desconecta o socket Whatsmeow sem deslogar (sem apagar pareamento).
// NÃO chamar `/session/logout` aqui — logout exige novo QR.
async function disconnectSession({ sessionToken }) {
  const res = await client.post('/session/disconnect', {}, { headers: sessionHeaders(sessionToken) });
  logCall('session_disconnect', 'POST', '/session/disconnect', res.status);
  // 400/404 quando já está desconectada — tolerado.
  if (res.status >= 500) throw buildError('session_disconnect', res.status, res.data);
  return res.data;
}

async function getQr({ sessionToken }) {
  const res = await client.get('/session/qrcode', { headers: sessionHeaders(sessionToken) });
  if (res.status === 404) {
    const alt = await client.get('/session/qr', { headers: sessionHeaders(sessionToken) });
    logCall('session_qr', 'GET', '/session/qr', alt.status);
    if (alt.status >= 400) throw buildError('session_qr', alt.status, alt.data);
    return alt.data;
  }
  logCall('session_qr', 'GET', '/session/qrcode', res.status);
  if (res.status >= 400) throw buildError('session_qr', res.status, res.data);
  return res.data;
}

async function getStatus({ sessionToken }) {
  const res = await client.get('/session/status', { headers: sessionHeaders(sessionToken) });
  logCall('session_status', 'GET', '/session/status', res.status);
  if (res.status >= 400) throw buildError('session_status', res.status, res.data);
  return res.data;
}

async function logout({ sessionToken }) {
  const res = await client.post('/session/logout', {}, { headers: sessionHeaders(sessionToken) });
  logCall('session_logout', 'POST', '/session/logout', res.status);
  if (res.status >= 400 && res.status !== 404) throw buildError('session_logout', res.status, res.data);
  return res.data;
}

async function sendText({ sessionToken, to, message }) {
  const res = await client.post('/chat/send/text', { Phone: to, Body: message }, { headers: sessionHeaders(sessionToken) });
  logCall('chat_send_text', 'POST', '/chat/send/text', res.status, { to });
  if (res.status >= 400) throw buildError('chat_send_text', res.status, res.data);
  return res.data;
}

async function sendMedia({ sessionToken, to, type, mediaUrl, caption }) {
  const map = {
    image: '/chat/send/image',
    video: '/chat/send/video',
    audio: '/chat/send/audio',
    document: '/chat/send/document',
  };
  const url = map[type];
  if (!url) throw new Error(`tipo de mídia inválido: ${type}`);
  const res = await client.post(url, { Phone: to, Url: mediaUrl, Caption: caption || '' }, { headers: sessionHeaders(sessionToken) });
  logCall('chat_send_media', 'POST', url, res.status, { to, type });
  if (res.status >= 400) throw buildError('chat_send_media', res.status, res.data);
  return res.data;
}

async function setWebhook({ sessionToken, webhookUrl }) {
  // 2026-05-22 — compatibilidade máxima entre versões da WuzAPI:
  //   - `webhookurl` (minúsculo) — confirmado funcionando na VPS atual; NÃO REMOVER.
  //   - `webhook` — nome canônico na spec oficial v3 (#/definitions/WebhookSet).
  //   - `webhookURL` — variante camelCase usada em algumas builds antigas.
  // Servidor ignora os campos que não conhece; o que reconhecer, aplica.
  // `events` vai como ARRAY (spec) + `Events` (capital, alias visto em forks)
  // + `Subscribe` (campo de /session/connect, alguns forks aceitam também aqui).
  // O problema real é subscribedEvents=[], então redundamos a assinatura também.
  const url = String(webhookUrl);
  const body = {
    webhookurl: url,
    webhook: url,
    webhookURL: url,
    events: WUZAPI_EVENTS,
    Events: WUZAPI_EVENTS,
    Subscribe: WUZAPI_EVENTS,
  };
  const res = await client.post('/webhook', body, { headers: sessionHeaders(sessionToken) });
  logCall('session_webhook', 'POST', '/webhook', res.status, {
    events_count: WUZAPI_EVENTS.length,
    url_fields: ['webhookurl', 'webhook', 'webhookURL'],
  });
  if (res.status >= 400) throw buildError('session_webhook', res.status, res.data);
  return res.data;
}

// Busca a foto de perfil via WuzAPI (recurso exclusivo do QR).
// Endpoint: POST /user/avatar  body { Phone: "<E164 sem +>" OU "<jid@g.us / @s.whatsapp.net>" }
// O parseJID do WuzAPI aceita JID completo, inclusive grupos @g.us.
// Retorna null em 404 (sem foto ou privado).
async function getProfilePicture({ sessionToken, phone, jid }) {
  if (!sessionToken) return null;
  let target = null;
  if (jid && String(jid).includes('@')) {
    target = String(jid); // JID completo (grupo ou privado) — WuzAPI parseJID resolve.
  } else if (phone) {
    target = String(phone).replace(/[^0-9]/g, '');
  }
  if (!target) return null;
  const res = await client.post('/user/avatar', { Phone: target }, { headers: sessionHeaders(sessionToken) });
  logCall('user_avatar', 'POST', '/user/avatar', res.status, { target: mask(target) });
  if (res.status === 404) return null;
  if (res.status >= 400) throw buildError('user_avatar', res.status, res.data);
  const data = (res.data && (res.data.data || res.data)) || {};
  const url = data.URL || data.url || data.Url || null;
  if (!url) return null;
  return {
    url,
    id: data.ID || data.id || null,
    type: data.Type || data.type || null,
    direct_path: data.DirectPath || data.directPath || null,
  };
}

// Lista grupos via WuzAPI (GET /group/list, header Token: <sessionToken>).
// Aceita variantes de payload: { data: { Groups: [...] } }, { Groups: [...] }
// ou array direto. Retorna sempre um array (vazio se nada).
async function listGroups({ sessionToken }) {
  if (!sessionToken) {
    const e = new Error('sessionToken obrigatório');
    e.wuzapiStep = 'group_list';
    throw e;
  }
  const res = await client.get('/group/list', { headers: sessionHeaders(sessionToken) });
  logCall('group_list', 'GET', '/group/list', res.status);
  if (res.status >= 400) throw buildError('group_list', res.status, res.data);
  const d = res.data;
  let groups = [];
  if (Array.isArray(d)) groups = d;
  else if (d && Array.isArray(d.Groups)) groups = d.Groups;
  else if (d && d.data && Array.isArray(d.data.Groups)) groups = d.data.Groups;
  else if (d && d.data && Array.isArray(d.data)) groups = d.data;
  return groups;
}




module.exports = {
  createInstance,
  deleteInstance,
  WUZAPI_EVENTS,
  WUZAPI_EVENTS_CSV,
  getSubscribedEvents: (mode) => {
    const m = (mode || process.env.WUZAPI_SUBSCRIBE_MODE || 'full').toLowerCase();
    if (m === 'basic') return WUZAPI_EVENTS_BASIC;
    if (m === 'debug') return WUZAPI_EVENTS_DEBUG;
    return WUZAPI_EVENTS_FULL;
  },
  connectSession,
  disconnectSession,
  // Aliases p/ compat com chamadores antigos (recebem `{ token }`).
  startSession: ({ token, sessionToken }) => connectSession({ sessionToken: sessionToken || token }),
  getQr: ({ token, sessionToken }) => getQr({ sessionToken: sessionToken || token }),
  getStatus: ({ token, sessionToken }) => getStatus({ sessionToken: sessionToken || token }),
  logout: ({ token, sessionToken }) => logout({ sessionToken: sessionToken || token }),
  sendText: ({ token, sessionToken, ...rest }) => sendText({ sessionToken: sessionToken || token, ...rest }),
  sendMedia: ({ token, sessionToken, ...rest }) => sendMedia({ sessionToken: sessionToken || token, ...rest }),
  setWebhook: ({ token, sessionToken, ...rest }) => setWebhook({ sessionToken: sessionToken || token, ...rest }),
  getProfilePicture: ({ token, sessionToken, ...rest }) => getProfilePicture({ sessionToken: sessionToken || token, ...rest }),
  listGroups: ({ token, sessionToken }) => listGroups({ sessionToken: sessionToken || token }),
  _client: client,
};
