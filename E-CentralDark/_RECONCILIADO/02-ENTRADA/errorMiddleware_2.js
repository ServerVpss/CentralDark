// Captura erros não tratados e devolve resposta padronizada.
const logger = require('../utils/logger');
const { fail } = require('../utils/response');

module.exports = function errorMiddleware(err, req, res, _next) {
  logger.error('unhandled_route_error', { message: err && err.message, path: req.path });
  return fail(res, 'internal_error', 'Erro interno', 500);
};
