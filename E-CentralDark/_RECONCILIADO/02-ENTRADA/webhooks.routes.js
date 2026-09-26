const router = require('express').Router();
const env = require('../config/env');
const connectionService = require('../services/connectionService');
const normalizeService = require('../services/normalizeService');
const webhookService = require('../services/webhookService');
const { ok, fail } = require('../utils/response');
const logger = require('../utils/logger');

let supabaseService;
try { supabaseService = require('../services/supabaseService'); } catch(e) { supabaseService = null; }

function describeShape(value, depth = 0, maxDepth = 4) {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  const t = typeof value;
  if (t !== 'object') return t;
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

router.post('/wuzapi', async (req, res) => {
  const secret = req.headers['x-wuzapi-secret'] || req.query.secret;
  if (!env.WUZAPI_WEBHOOK_SECRET || secret !== env.WUZAPI_WEBHOOK_SECRET) {
    return fail(res, 'unauthorized', 'Secret invalido', 401);
  }

  const rawBody = req.body || {};
  let wuzapiPayload = rawBody;

  // Aceita form-urlencoded strings compactadas dentro do JSON rawBody
  if (typeof rawBody.jsonData === 'string') {
    try { wuzapiPayload = JSON.parse(rawBody.jsonData); } catch {}
  } else if (typeof rawBody.data === 'string') {
    try { wuzapiPayload = JSON.parse(rawBody.data); } catch {}
  }

  const connection_id = req.query.connection_id || wuzapiPayload.connection_id || null;
  const conn = connection_id ? connectionService.getRaw(connection_id) : null;

  const normalized = normalizeService.normalize(wuzapiPayload) || { event: 'unknown', raw: wuzapiPayload };

  const payload = {
    ...normalized,
    provider: 'wuzapi',
    connection_id: conn ? conn.connection_id : connection_id,
    workspace_id: conn ? conn.workspace_id : null,
    raw_payload: wuzapiPayload,
  };

  // Status updates
  if (conn && normalized.event === 'connection.connected') {
    connectionService.updateConnection(conn.connection_id, {
      status: 'connected',
      last_connected_at: new Date().toISOString(),
    });
  } else if (conn && normalized.event === 'connection.disconnected') {
    connectionService.updateConnection(conn.connection_id, {
      status: 'disconnected',
      last_disconnected_at: new Date().toISOString(),
    });
  }

  // Logs limpos
  const rawSize = JSON.stringify(rawBody).length;
  logger.info('webhook_wuzapi_in', { 
    event: normalized.event, 
    connection_id_mask: payload.connection_id ? payload.connection_id.slice(0, 8) + '...' : null,
    content_type: req.headers['content-type'],
    approx_size_bytes: rawSize,
    top_level_keys: Object.keys(rawBody),
    has_jsonData: 'jsonData' in rawBody,
    has_data: 'data' in rawBody
  });

  if (String(normalized.event).startsWith('unknown:')) {
    logger.info('wuzapi_payload_shape', {
      raw_event_type: typeof wuzapiPayload.event,
      shape: describeShape(wuzapiPayload)
    });
  }

  if (normalized.event === 'message.received') {
    // Supabase
    if (supabaseService && conn && conn.workspace_id) {
      supabaseService.saveMessage(connection_id, conn.workspace_id, {
        ...normalized,
        provider: 'wuzapi',
      }).catch((err) => logger.warn('supabase_save_message_skipped', { message: err?.message }));
    }
  }


  // Salva contato automaticamente se for mensagem recebida de numero desconhecido/conhecido
  if (normalized.event === 'message.received' && conn && conn.workspace_id && normalized.from && !normalized.is_from_me) {
    if (supabaseService) {
      const phone = normalized.from.replace('@s.whatsapp.net', '').replace('@c.us', '');
      supabaseService.upsertContact(conn.workspace_id, {
        phone,
        jid: normalized.from,
        name: normalized.push_name || phone,
        push_name: normalized.push_name,
        tags: ['whatsapp'],
      }).catch(() => {});
    }
  }

  // Registra eventos de conexao no Supabase
  if (normalized.event && normalized.event.startsWith('connection.') && conn && conn.workspace_id && supabaseService) {
    supabaseService.logEvent(
      `wuzapi.${normalized.event}`,
      normalized.event === 'connection.error' ? 'error' : 'info',
      { connection_id: conn.connection_id, workspace_id: conn.workspace_id }
    ).catch(() => {});
  }

  
  const targetUrl = env.ATENDIMENTO_WEBHOOK_URL || env.MULTIZAP_WEBHOOK_URL;
  if(!targetUrl) {
    logger.warn('webhook_forward_skipped', { reason: 'ATENDIMENTO_WEBHOOK_URL and MULTIZAP_WEBHOOK_URL are unset. Forward stopped.'});
  } else {
    webhookService.forwardToAtendimento(payload).catch(() => {});
  }

  return ok(res, { received: true });
});

module.exports = router;
