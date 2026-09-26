// Rota /media/download — chamada pelo CRM pra baixar mídia QR/WuzAPI em background.
// Auth: Bearer MULTIZAP_GATEWAY_TOKEN.
// Body: { connection_id, media_type, raw_message }
// Resposta: binário (Content-Type = mime detectado), header X-Media-Size.
const router = require('express').Router();
const auth = require('../middlewares/authMiddleware');
const connectionService = require('../services/connectionService');
const mediaDownload = require('../services/mediaDownloadService');
const { fail } = require('../utils/response');
const logger = require('../utils/logger');

router.post('/download', auth, async (req, res) => {
  const { connection_id, media_type, raw_message, max_bytes } = req.body || {};
  if (!connection_id) return fail(res, 'bad_request', 'connection_id obrigatório', 400);
  if (!media_type) return fail(res, 'bad_request', 'media_type obrigatório', 400);
  if (!raw_message || typeof raw_message !== 'object') {
    return fail(res, 'bad_request', 'raw_message obrigatório (objeto)', 400);
  }

  const conn = connectionService.getRaw(connection_id);
  if (!conn) return fail(res, 'not_found', 'connection_id desconhecido pelo Gateway', 404);
  const sessionToken = conn.session_token || conn.wuzapi_token;
  if (!sessionToken) return fail(res, 'precondition_failed', 'Conexão sem session_token', 412);

  try {
    const { buffer, mime, size } = await mediaDownload.downloadMedia({
      sessionToken,
      mediaType: media_type,
      rawMessage: raw_message,
      maxBytes: Number(max_bytes) || undefined,
    });
    res.setHeader('Content-Type', mime);
    res.setHeader('Content-Length', String(size));
    res.setHeader('X-Media-Size', String(size));
    res.setHeader('X-Media-Mime', mime);
    return res.status(200).send(buffer);
  } catch (err) {
    const msg = err && err.message ? err.message : 'download_failed';
    logger.warn('media_download_route_error', {
      connection_id_short: String(connection_id).slice(0, 8),
      media_type,
      error: msg,
    });
    return fail(res, 'download_failed', msg, err.status && err.status >= 400 && err.status < 600 ? err.status : 502);
  }
});

module.exports = router;
