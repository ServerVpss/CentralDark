// Envio de mensagens — aplica rate limit, valida telefone e bloqueia se desconectado.
const connectionService = require('./connectionService');
const wuzapi = require('./wuzapiClient');
const rateLimit = require('./rateLimitService');
const { normalizePhone } = require('../utils/phone');
const logger = require('../utils/logger');

function getWuzapiMessageId(r) {
  return r?.id || r?.message_id || r?.data?.id || r?.data?.Id || r?.data?.message_id || r?.data?.MessageID || null;
}

function getWuzapiDetails(r) {
  return r?.details || r?.Details || r?.data?.details || r?.data?.Details || null;
}

function assertWuzapiAccepted(r) {
  const messageId = getWuzapiMessageId(r);
  const details = getWuzapiDetails(r);
  if (r?.success === false || (typeof r?.code === 'number' && r.code >= 400)) {
    throw httpError(502, 'wuzapi_rejected', details || `WuzAPI rejeitou o envio (code=${r.code || 'sem código'})`);
  }
  if (r?.success === true || messageId || /sent|success|ok/i.test(details || '')) {
    return { message_id: messageId, details, upstream: r };
  }
  throw httpError(502, 'wuzapi_unconfirmed', details || 'WuzAPI não confirmou o envio da mensagem');
}

async function sendText({ connection_id, to, message }) {
  const conn = connectionService.getRaw(connection_id);
  if (!conn) throw httpError(404, 'connection_not_found', 'Conexão não encontrada');
  if (conn.status !== 'connected') throw httpError(409, 'not_connected', `Conexão não está conectada (status=${conn.status})`);
  const phone = normalizePhone(to);
  if (!phone) throw httpError(400, 'invalid_phone', 'Telefone inválido');
  if (!message || typeof message !== 'string') throw httpError(400, 'invalid_message', 'Mensagem inválida');

  const rl = rateLimit.canSend(connection_id);
  if (!rl.allowed) throw httpError(429, 'rate_limited', rl.reason);

  const r = await wuzapi.sendText({ token: conn.wuzapi_token, to: phone, message });
  const accepted = assertWuzapiAccepted(r);
  rateLimit.markSent(connection_id);
  logger.info('message_sent', { connection_id, to: phone, message_id: accepted.message_id, details: accepted.details });
  return accepted;
}

async function sendMedia({ connection_id, to, type, media_url, caption }) {
  const conn = connectionService.getRaw(connection_id);
  if (!conn) throw httpError(404, 'connection_not_found', 'Conexão não encontrada');
  if (conn.status !== 'connected') throw httpError(409, 'not_connected', `Conexão não está conectada (status=${conn.status})`);
  const phone = normalizePhone(to);
  if (!phone) throw httpError(400, 'invalid_phone', 'Telefone inválido');
  if (!['image', 'video', 'audio', 'document'].includes(type)) {
    throw httpError(400, 'invalid_type', 'Tipo de mídia inválido');
  }
  if (!media_url) throw httpError(400, 'invalid_media_url', 'media_url obrigatório');

  const rl = rateLimit.canSend(connection_id);
  if (!rl.allowed) throw httpError(429, 'rate_limited', rl.reason);

  const r = await wuzapi.sendMedia({ token: conn.wuzapi_token, to: phone, type, mediaUrl: media_url, caption });
  const accepted = assertWuzapiAccepted(r);
  rateLimit.markSent(connection_id);
  logger.info('media_sent', { connection_id, to: phone, type, message_id: accepted.message_id, details: accepted.details });
  return accepted;
}

function httpError(status, code, message) {
  const err = new Error(message);
  err.status = status;
  err.code = code;
  return err;
}

module.exports = { sendText, sendMedia };
