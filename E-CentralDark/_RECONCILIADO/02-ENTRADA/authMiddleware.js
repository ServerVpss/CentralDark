// Protege rotas exigindo Authorization: Bearer GATEWAY_SERVER_TOKEN.
const env = require('../config/env');
const { fail } = require('../utils/response');

module.exports = function authMiddleware(req, res, next) {
  const header = req.headers['authorization'] || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return fail(res, 'unauthorized', 'Authorization Bearer ausente', 401);
  }
  if (!env.GATEWAY_SERVER_TOKEN || token !== env.GATEWAY_SERVER_TOKEN) {
    return fail(res, 'unauthorized', 'Token inválido', 401);
  }
  return next();
};
