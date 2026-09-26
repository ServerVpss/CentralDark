// Cliente HTTP para a WuzAPI local (Whatsmeow). [gateway legado em paridade]
// 2026-05-31: +getContacts +getMessages para sync de dados reais
const axios = require('axios');
const env = require('../config/env');
const logger = require('../utils/logger');

const WUZAPI_EVENTS = ['Message', 'ReadReceipt', 'HistorySync', 'ChatPresence'];
const WUZAPI_EVENTS_CSV = WUZAPI_EVENTS.join(',');

const client = axios.create({
  baseURL: env.WUZAPI_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

function adminHeaders() {
  return { Authorization: env.WUZAPI_ADMIN_TOKEN };
}

function userHeaders(token) {
  return { Token: token };
}

async function createInstance({ name }) {
  const { data } = await client.post('/admin/users', { name }, { headers: adminHeaders() });
  return data;
}

async function deleteInstance({ instanceId }) {
  const { data } = await client.delete(`/admin/users/${instanceId}`, { headers: adminHeaders() });
  return data;
}

async function startSession({ token }) {
  const body = { Subscribe: WUZAPI_EVENTS, events: WUZAPI_EVENTS_CSV, Immediate: true };
  try {
    const { data } = await client.post('/session/connect', body, { headers: userHeaders(token) });
    return data;
  } catch (e) {
    if (e.response && e.response.status === 405) {
      const { data } = await client.get('/session/connect?Immediate=true', { headers: userHeaders(token) });
      return data;
    }
    throw e;
  }
}

async function disconnectSession({ token }) {
  try {
    const { data } = await client.post('/session/disconnect', {}, { headers: userHeaders(token) });
    return data;
  } catch (err) {
    return null;
  }
}

async function getQr({ token }) {
  try {
    const { data } = await client.get('/session/qr', { headers: userHeaders(token) });
    return data;
  } catch (e) {
    if (e.response && e.response.status === 405) {
      // Tenta fallback com POST se GET retornar 405 Method Not Allowed
      const { data } = await client.post('/session/qr', {}, { headers: userHeaders(token) });
      return data;
    }
    throw e;
  }
}

async function getStatus({ token }) {
  const { data } = await client.get('/session/status', { headers: userHeaders(token) });
  return data;
}

async function logout({ token }) {
  const { data } = await client.post('/session/logout', {}, { headers: userHeaders(token) });
  return data;
}

async function sendText({ token, to, message, messageId = '' }) {
  const payload = { Phone: to, Body: message };
  if (messageId) payload.Id = messageId;
  const { data } = await client.post('/chat/send/text', payload, { headers: userHeaders(token) });
  return data;
}

async function sendMedia({ token, to, type, mediaUrl, caption }) {
  const path = {
    image: '/chat/send/image',
    video: '/chat/send/video',
    audio: '/chat/send/audio',
    document: '/chat/send/document',
  }[type];
  if (!path) throw new Error(`tipo de mídia inválido: ${type}`);
  const { data } = await client.post(path, { Phone: to, Url: mediaUrl, Caption: caption || '' }, { headers: userHeaders(token) });
  return data;
}

async function setWebhook({ token, webhookUrl }) {
  const body = { webhookURL: webhookUrl, Subscribe: WUZAPI_EVENTS, events: WUZAPI_EVENTS_CSV };
  const { data } = await client.post('/webhook', body, { headers: userHeaders(token) });
  return data;
}

/**
 * Busca contatos do WhatsApp via WuzAPI
 */
async function getContacts({ token }) {
  try {
    const { data } = await client.get('/user/contacts', { headers: userHeaders(token) });
    return data;
  } catch (err) {
    logger.warn('wuzapi_get_contacts_failed', { message: err.message });
    return {};
  }
}

async function getUserAvatar({ token, phone, preview = true }) {
  try {
    const { data } = await client.post('/user/avatar', { Phone: phone, Preview: preview }, { headers: userHeaders(token) });
    return data;
  } catch (err) {
    logger.warn('wuzapi_get_avatar_failed', { phone, message: err.message });
    return null;
  }
}

/**
 * Busca mensagens recentes via WuzAPI
 */
async function getMessages({ token, limit = 50 }) {
  try {
    const { data } = await client.get(`/chat/messages?limit=${limit}`, { headers: userHeaders(token) });
    return data;
  } catch (err) {
    logger.warn('wuzapi_get_messages_failed', { message: err.message });
    return [];
  }
}

module.exports = {
  createInstance,
  deleteInstance,
  WUZAPI_EVENTS,
  WUZAPI_EVENTS_CSV,
  startSession,
  disconnectSession,
  getQr,
  getStatus,
  logout,
  sendText,
  sendMedia,
  setWebhook,
  getContacts,
  getUserAvatar,
  getMessages,
  _client: client,
  _logger: logger,
};