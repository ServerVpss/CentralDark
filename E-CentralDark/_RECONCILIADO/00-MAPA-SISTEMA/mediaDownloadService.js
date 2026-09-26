// Baixa mídia decriptada via WuzAPI usando o raw Message do webhook.
// Endpoints WuzAPI: /chat/downloadimage|downloadvideo|downloadaudio|downloaddocument
// Body esperado: campos da *Message proto (Url, DirectPath, MediaKey, Mimetype,
// FileEncSHA256, FileSHA256, FileLength) extraídos do Message.imageMessage etc.
// Retorna { buffer, mime, size }.
const axios = require('axios');
const env = require('../config/env');
const logger = require('../utils/logger');

const MEDIA_KEY_BY_TYPE = {
  image: ['imageMessage', 'ImageMessage'],
  video: ['videoMessage', 'VideoMessage'],
  audio: ['audioMessage', 'AudioMessage'],
  document: ['documentMessage', 'DocumentMessage'],
  sticker: ['stickerMessage', 'StickerMessage'],
};

const ENDPOINT_BY_TYPE = {
  image: '/chat/downloadimage',
  video: '/chat/downloadvideo',
  audio: '/chat/downloadaudio',
  document: '/chat/downloaddocument',
  sticker: '/chat/downloadimage', // WuzAPI trata sticker como imagem na descriptografia
};

function pickFirst(obj, keys) {
  if (!obj) return null;
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null) return obj[k];
  }
  return null;
}

function extractMediaProto(rawMessage, mediaType) {
  if (!rawMessage || typeof rawMessage !== 'object') return null;
  // raw_message é o objeto Message vindo do webhook (raw.Message no payload normalizado).
  // Mas o handler pode ter passado o subobjeto direto. Aceita ambos.
  const root = rawMessage.Message && typeof rawMessage.Message === 'object'
    ? rawMessage.Message
    : rawMessage;
  const candidates = MEDIA_KEY_BY_TYPE[mediaType] || [];
  for (const k of candidates) {
    if (root[k]) return root[k];
  }
  return null;
}

function buildDownloadBody(mediaProto) {
  // Aceita PascalCase (whatsmeow) e camelCase. WuzAPI espera PascalCase.
  const get = (...keys) => {
    for (const k of keys) {
      if (mediaProto[k] !== undefined && mediaProto[k] !== null) return mediaProto[k];
    }
    return undefined;
  };
  const body = {
    Url: get('Url', 'URL', 'url'),
    DirectPath: get('DirectPath', 'directPath', 'direct_path'),
    MediaKey: get('MediaKey', 'mediaKey', 'media_key'),
    Mimetype: get('Mimetype', 'MimeType', 'mimetype', 'mime_type'),
    FileEncSHA256: get('FileEncSHA256', 'FileEncSha256', 'fileEncSha256', 'file_enc_sha256'),
    FileSHA256: get('FileSHA256', 'FileSha256', 'fileSha256', 'file_sha256'),
    FileLength: get('FileLength', 'fileLength', 'file_length'),
  };
  // Remove undefined pra body limpo
  for (const k of Object.keys(body)) if (body[k] === undefined) delete body[k];
  return body;
}

async function downloadMedia({ sessionToken, mediaType, rawMessage, maxBytes }) {
  if (!sessionToken) throw new Error('session_token_missing');
  const endpoint = ENDPOINT_BY_TYPE[mediaType];
  if (!endpoint) throw new Error(`media_type_invalid:${mediaType}`);

  const proto = extractMediaProto(rawMessage, mediaType);
  if (!proto) throw new Error('media_proto_not_found_in_raw_message');

  const body = buildDownloadBody(proto);
  if (!body.Url && !body.DirectPath) throw new Error('media_url_and_direct_path_missing');
  if (!body.MediaKey) throw new Error('media_key_missing');

  const started = Date.now();
  const res = await axios.post(`${env.WUZAPI_BASE_URL}${endpoint}`, body, {
    headers: { Token: sessionToken, 'Content-Type': 'application/json' },
    responseType: 'arraybuffer',
    timeout: 30000,
    maxContentLength: maxBytes || 25 * 1024 * 1024,
    maxBodyLength: maxBytes || 25 * 1024 * 1024,
    validateStatus: () => true,
  });

  const duration = Date.now() - started;
  if (res.status >= 400) {
    // Resposta pode vir como JSON em arraybuffer; tenta decodificar.
    let errMsg = `wuzapi_download_http_${res.status}`;
    try {
      const txt = Buffer.from(res.data).toString('utf8');
      const parsed = JSON.parse(txt);
      errMsg = parsed.error || parsed.message || errMsg;
    } catch (_e) { /* ignore */ }
    logger.warn('media_download_failed', { endpoint, status: res.status, duration_ms: duration });
    const err = new Error(errMsg);
    err.status = res.status;
    throw err;
  }

  // WuzAPI pode retornar JSON ({data: base64}) OU binário direto. Tratamos ambos.
  const contentType = String(res.headers['content-type'] || '').toLowerCase();
  let buffer;
  let mime = body.Mimetype || null;

  if (contentType.includes('application/json')) {
    const parsed = JSON.parse(Buffer.from(res.data).toString('utf8'));
    const data = parsed.data || parsed.Data || parsed;
    const b64 = data.data || data.Base64 || data.base64 || data.body || null;
    if (!b64) throw new Error('wuzapi_download_empty_body');
    buffer = Buffer.from(b64, 'base64');
    mime = data.mimetype || data.Mimetype || data.mime || mime;
  } else {
    buffer = Buffer.from(res.data);
    mime = contentType || mime || 'application/octet-stream';
  }

  logger.info('media_download_success', {
    endpoint,
    bytes: buffer.length,
    duration_ms: duration,
    mime,
  });

  return { buffer, mime: mime || 'application/octet-stream', size: buffer.length };
}

module.exports = { downloadMedia };
