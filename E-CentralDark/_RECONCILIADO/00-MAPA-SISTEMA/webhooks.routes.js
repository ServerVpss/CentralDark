// Webhook RECEBIDO da WuzAPI. Valida secret, normaliza e encaminha ao CRM.
const router = require('express').Router();
const env = require('../config/env');
const connectionService = require('../services/connectionService');
const normalizeService = require('../services/normalizeService');
const webhookService = require('../services/webhookService');
const diagService = require('../services/diagService');
const { ok, fail } = require('../utils/response');
const logger = require('../utils/logger');

// Diagnóstico: descreve a forma do payload (chaves + tipos) SEM expor conteúdo.
// Útil para descobrir onde a WuzAPI coloca a mensagem em payloads não reconhecidos.
function describeShape(value, depth = 0, maxDepth = 4) {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  const t = typeof value;
  if (t !== 'object') return t; // string, number, boolean
  if (Array.isArray(value)) {
    if (value.length === 0) return 'array(0)';
    if (depth >= maxDepth) return `array(${value.length})`;
    return { __array_len: value.length, __sample_0: describeShape(value[0], depth + 1, maxDepth) };
  }
  if (depth >= maxDepth) return 'object(...)';
  const out = {};
  for (const k of Object.keys(value)) {
    out[k] = describeShape(value[k], depth + 1, maxDepth);
  }
  return out;
}

// Tenta extrair o payload da WuzAPI em qualquer formato (objeto, string JSON, urlencoded com jsonData, rawBody).
function extractWuzapiPayload(req) {
  const tryParseJson = (s) => { try { return JSON.parse(s); } catch (_e) { return null; } };
  const b = req.body;
  // 1) já é objeto não-vazio
  if (b && typeof b === 'object' && !Array.isArray(b) && Object.keys(b).length > 0) {
    if (typeof b.jsonData === 'string' && !b.type && !b.Info) {
      const parsed = tryParseJson(b.jsonData);
      if (parsed && typeof parsed === 'object') return { ...parsed, jsonData: b.jsonData };
    }
    if (typeof b.payload === 'string') { const p = tryParseJson(b.payload); if (p) return p; }
    if (typeof b.data === 'string') { const p = tryParseJson(b.data); if (p) return p; }
    return b;
  }
  // 2) body string (text/plain ou json string)
  if (typeof b === 'string' && b.trim()) {
    const p = tryParseJson(b);
    if (p && typeof p === 'object') return p;
    if (b.includes('=') && b.includes('&')) {
      const params = Object.fromEntries(new URLSearchParams(b));
      if (params.jsonData) {
        const j = tryParseJson(params.jsonData);
        if (j) return { ...j, jsonData: params.jsonData };
      }
      return params;
    }
  }
  // 3) rawBody capturado pelo middleware verify
  if (typeof req.rawBody === 'string' && req.rawBody.trim()) {
    const p = tryParseJson(req.rawBody);
    if (p && typeof p === 'object') return p;
    if (req.rawBody.includes('=') && req.rawBody.includes('&')) {
      const params = Object.fromEntries(new URLSearchParams(req.rawBody));
      if (params.jsonData) {
        const j = tryParseJson(params.jsonData);
        if (j) return { ...j, jsonData: params.jsonData };
      }
      return params;
    }
  }
  return {};
}

router.post('/wuzapi', async (req, res) => {
  // A WuzAPI envia o secret via header (configurado em setWebhook) OU via query.
  const secret = req.headers['x-wuzapi-secret'] || req.query.secret;
  if (!env.WUZAPI_WEBHOOK_SECRET || secret !== env.WUZAPI_WEBHOOK_SECRET) {
    return fail(res, 'unauthorized', 'Secret inválido', 401);
  }

  const raw = extractWuzapiPayload(req);
  // Se mesmo após o extrator vier vazio, loga diagnóstico SEGURO (só metadados).
  if (!raw || Object.keys(raw).length === 0) {
    logger.warn('wuzapi_empty_body_debug', {
      content_type: req.headers['content-type'] || null,
      content_length: req.headers['content-length'] || null,
      method: req.method,
      query_keys: Object.keys(req.query || {}),
      raw_body_length: typeof req.rawBody === 'string' ? req.rawBody.length : 0,
      body_type: typeof req.body,
      body_keys: req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? Object.keys(req.body) : [],
    });
  }
  // Identifica connection_id pela query (preferencial) ou pelo session_name no payload.
  const connection_id = req.query.connection_id || raw.connection_id || null;
  const conn = connection_id ? connectionService.getRaw(connection_id) : null;

  let normalized;
  try {
    normalized = normalizeService.normalize(raw) || { event: 'unknown', raw };
  } catch (err) {
    diagService.recordError(err);
    normalized = { event: 'unknown:normalize_error', raw };
  }
  const hadJsonData = typeof raw.jsonData === 'string';
  diagService.recordEvent({
    type: raw.type || (typeof raw.jsonData === 'string' ? '(jsonData)' : null),
    kind: normalized.event,
    connection_id,
    parsedJsonData: hadJsonData ? !String(normalized.event).startsWith('unknown:normalize_error') : null,
  });

  const payload = {
    ...normalized,
    provider: 'wuzapi',
    connection_id: conn ? conn.connection_id : connection_id,
    workspace_id: conn ? conn.workspace_id : null,
    raw_payload: raw,
  };

  // Atualiza status local quando aplicável.
  if (conn && normalized.event === 'connection.connected') {
    connectionService.updateConnection(conn.connection_id, {
      status: 'connected',
      last_connected_at: new Date().toISOString(),
    });
    connectionService.scheduleConnectionRepair(conn.connection_id, 'webhook_connection_connected');
  } else if (conn && normalized.event === 'connection.disconnected') {
    connectionService.updateConnection(conn.connection_id, {
      status: 'disconnected',
      last_disconnected_at: new Date().toISOString(),
    });
  }

  const cidShort = payload.connection_id ? `${String(payload.connection_id).slice(0, 8)}...` : null;
  const ev = String(normalized.event || '');

  // Presença e chat_presence geram muito ruído — só em debug.
  if (ev === 'presence.updated' || ev === 'chat_presence' || ev.startsWith('presence.')) {
    logger.debug('presence_event_received', { connection_id_short: cidShort, event: ev });
  } else if (ev === 'group.updated' || ev.startsWith('group.')) {
    logger.event('info', '👥', 'whatsapp_group_event', 'Grupo atualizado', {
      connection_id_short: cidShort,
      event: ev,
      chat_id: normalized.chat_id || null,
      name_changed: !!(normalized.name || normalized.subject),
      picture_changed: !!normalized.picture_url || ev === 'profile.photo.updated',
      status: 'processado',
    });
  } else {
    logger.event('info', '📥', 'wuzapi_webhook_received', 'Webhook recebido da WuzAPI', {
      event: ev,
      connection_id_short: cidShort,
    });
  }

  // Diagnóstico de evento desconhecido — só em debug.
  if (ev.startsWith('unknown:') && logger.isDebug()) {
    let jsonDataShape = null;
    if (typeof raw.jsonData === 'string') {
      try { jsonDataShape = describeShape(JSON.parse(raw.jsonData)); }
      catch (_e) { jsonDataShape = 'parse_error'; }
    }
    logger.debug('wuzapi_payload_shape', {
      connection_id_short: cidShort,
      top_level_keys: Object.keys(raw),
      raw_type: raw.type || null,
      shape: describeShape(raw),
      jsonData_shape: jsonDataShape,
    });
  }

  // Log amigável de mensagem recebida — frase humana (quem, onde, o quê).
  if (ev === 'message.received') {
    const body = normalized.body;
    const who = normalized.push_name || (normalized.from ? String(normalized.from).split('@')[0] : 'Alguém');
    const isGroup = !!normalized.is_group;
    const tipoMap = { text: 'mensagem', image: 'imagem', video: 'vídeo', audio: 'áudio', document: 'documento', sticker: 'sticker' };
    const tipo = tipoMap[normalized.type] || 'mensagem';
    const ondeRaw = isGroup ? (normalized.chat_id || '').split('@')[0] : null;
    const onde = isGroup ? `no grupo ${ondeRaw || ''}`.trim() : 'no privado';
    const preview = typeof body === 'string' && body.length > 0
      ? `: "${body.slice(0, 60)}${body.length > 60 ? '…' : ''}"`
      : '';
    const acao = normalized.is_from_me ? 'enviou (por mim)' : 'enviou';
    const frase = `${who} ${acao} ${tipo} ${onde}${preview}`;

    logger.event('info', '📩', 'whatsapp_message_received', frase, {
      connection_id_short: cidShort,
      workspace_id: payload.workspace_id,
    });
  }

  // Não bloqueia a resposta no encaminhamento.
  webhookService.forwardToAtendimento(payload).catch(() => {});

  return ok(res, { received: true });
});

module.exports = router;
