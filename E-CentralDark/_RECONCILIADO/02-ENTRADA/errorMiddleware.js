// Captura erros não tratados e devolve resposta padronizada + mensagem amigável.
const logger = require('../utils/logger');
const { fail } = require('../utils/response');

function friendlyFor(err, req) {
  const path = req.path || '';
  const status = err && (err.status || err.statusCode);
  if (status === 413 || (err && (err.type === 'entity.too.large' || /request entity too large/i.test(err.message || '')))) {
    return {
      friendly_message: 'O Gateway recebeu uma requisição grande demais (provável mídia/base64).',
      suggestion: 'Aumente o limite ou evite enviar mídia em base64 pelo webhook.',
    };
  }
  if (/unauthorized|forbidden/i.test(err && err.message || '')) {
    return {
      friendly_message: 'Requisição rejeitada por falha de autenticação.',
      suggestion: 'Confira secret/token configurado para a rota.',
    };
  }
  if (path.startsWith('/webhooks/wuzapi')) {
    return {
      friendly_message: 'Erro ao processar webhook da WuzAPI.',
      suggestion: 'Verifique tamanho da mídia, parser do body ou ative DEBUG_LOGS=true.',
    };
  }
  return {
    friendly_message: 'Erro inesperado no Gateway.',
    suggestion: 'Veja o log técnico abaixo ou ative DEBUG_LOGS=true.',
  };
}

module.exports = function errorMiddleware(err, req, res, _next) {
  const status = err && (err.status || err.statusCode);
  const isTooLarge = status === 413 || (err && (err.type === 'entity.too.large' || /request entity too large/i.test(err.message || '')));
  const f = friendlyFor(err, req);

  if (isTooLarge) {
    logger.warn('webhook_payload_too_large', {
      path: req.path,
      connection_id: (req.query && req.query.connection_id) || null,
      content_length: req.headers['content-length'] || null,
      content_type: req.headers['content-type'] || null,
      limit: req.path && req.path.startsWith('/webhooks/wuzapi') ? '100mb' : '5mb',
      friendly_message: f.friendly_message,
      suggestion: f.suggestion,
    });
    return fail(res, 'payload_too_large', 'Payload excede o limite permitido', 413);
  }

  logger.error('unhandled_route_error', {
    message: err && err.message,
    path: req.path,
    friendly_message: f.friendly_message,
    suggestion: f.suggestion,
  });
  return fail(res, 'internal_error', 'Erro interno', 500);
};
