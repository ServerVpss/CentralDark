// App Express do Atendimento WhatsApp Gateway.
const express = require('express');
const cors = require('cors');
const logger = require('./utils/logger');

const errorMiddleware = require('./middlewares/errorMiddleware');
const healthRoutes = require('./routes/health.routes');
const connectionsRoutes = require('./routes/connections.routes');
const messagesRoutes = require('./routes/messages.routes');
const webhooksRoutes = require('./routes/webhooks.routes');
const mediaRoutes = require('./routes/media.routes');

function optionalRoute(routePath, label) {
  try {
    return require(routePath);
  } catch (err) {
    if (err && err.code === 'MODULE_NOT_FOUND') {
      console.warn(`[gateway] rota opcional ${label} indisponível: ${err.message}`);
      return null;
    }
    throw err;
  }
}

const diagRoutes = optionalRoute('./routes/diag.routes', 'diagnóstico');
const deploysRoutes = optionalRoute('./routes/deploys.routes', 'deploys');
const systemRoutes = optionalRoute('./routes/system.routes', 'sistema');
// sync-marker 2026-05-22T18:22:00Z — rotas opcionais não podem derrubar o Gateway.

const app = express();

app.use(cors({ origin: false })); // Gateway só responde para o CRM via servidor; sem CORS de browser.

// Body parsers tolerantes — WuzAPI pode mandar webhook como application/json, text/plain,
// application/x-www-form-urlencoded ou sem Content-Type. Salva rawBody pra fallback/diagnóstico.
// Limite alto (100mb) só pra /webhooks/wuzapi — WuzAPI manda mídia base64 inline
// (vídeo/áudio/documento de grupo facilmente passa de 30mb). Resto fica em 5mb.
const captureRaw = (req, _res, buf) => {
  if (!req.rawBody && buf && buf.length) req.rawBody = buf.toString('utf8');
};
const WEBHOOK_LIMIT = '100mb';
const WEBHOOK_LIMIT_BYTES = 100 * 1024 * 1024;
const DEFAULT_LIMIT = '5mb';
const DEFAULT_LIMIT_BYTES = 5 * 1024 * 1024;

// Parsers específicos pro webhook WuzAPI com limite alto.
app.use('/webhooks/wuzapi', express.json({
  limit: WEBHOOK_LIMIT,
  type: ['application/json', 'application/*+json', 'text/json'],
  verify: captureRaw,
}));
app.use('/webhooks/wuzapi', express.urlencoded({ limit: WEBHOOK_LIMIT, extended: true, verify: captureRaw }));
app.use('/webhooks/wuzapi', express.text({
  limit: WEBHOOK_LIMIT,
  type: ['text/plain', 'application/octet-stream', 'text/*'],
  verify: captureRaw,
}));

// Parsers gerais (demais rotas).
app.use(express.json({
  limit: DEFAULT_LIMIT,
  type: ['application/json', 'application/*+json', 'text/json'],
  verify: captureRaw,
}));
app.use(express.urlencoded({ limit: DEFAULT_LIMIT, extended: true, verify: captureRaw }));
app.use(express.text({
  limit: DEFAULT_LIMIT,
  type: ['text/plain', 'application/octet-stream', 'text/*'],
  verify: captureRaw,
}));
// Último recurso: se nenhum parser casou (Content-Type estranho/ausente), lê o stream cru.
app.use((req, _res, next) => {
  if (req.rawBody || ['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const isWebhook = req.path && req.path.startsWith('/webhooks/wuzapi');
  const maxBytes = isWebhook ? WEBHOOK_LIMIT_BYTES : DEFAULT_LIMIT_BYTES;
  let data = '';
  let aborted = false;
  req.setEncoding('utf8');
  req.on('data', (c) => {
    if (aborted) return;
    if (data.length + c.length > maxBytes) {
      aborted = true;
      const err = new Error('request entity too large');
      err.type = 'entity.too.large';
      err.status = 413;
      return next(err);
    }
    data += c;
  });
  req.on('end', () => { if (!aborted) { req.rawBody = data; next(); } });
  req.on('error', () => { if (!aborted) next(); });
});
// Access log próprio — silencia rotas de alto volume (/webhooks/wuzapi e /health)
// quando tudo deu certo. Só fala quando deu errado.
app.use((req, res, next) => {
  const started = Date.now();
  res.on('finish', () => {
    const status = res.statusCode;
    const isErr = status >= 500;
    const isWarn = status >= 400 && status < 500;
    const isOk = !isErr && !isWarn;
    if (['GET', 'HEAD'].includes(req.method) && req.path === '/health') return;
    // /webhooks/wuzapi tem evento próprio "📩 Mensagem recebida" — não duplicar.
    if (isOk && req.path && req.path.startsWith('/webhooks/wuzapi')) return;
    const cid = (req.query && req.query.connection_id) || '';
    const connection_id_short = cid ? `${String(cid).slice(0, 8)}...` : null;
    logger.event(
      isErr ? 'error' : isWarn ? 'warn' : 'info',
      isErr ? '❌' : isWarn ? '⚠️' : '🌐',
      'http_access',
      isErr ? 'Requisição com erro' : isWarn ? 'Requisição rejeitada' : 'Requisição recebida',
      {
        method: req.method,
        path: req.path,
        connection_id_short,
        status,
        duration_ms: Date.now() - started,
      }
    );
  });
  next();
});

app.use('/', healthRoutes);
if (diagRoutes) app.use('/__diag', diagRoutes);
app.use('/connections', connectionsRoutes);
app.use('/messages', messagesRoutes);
app.use('/webhooks', webhooksRoutes);
app.use('/media', mediaRoutes);
if (deploysRoutes) app.use('/deploys', deploysRoutes);
if (systemRoutes) app.use('/api/system', systemRoutes);

app.use((req, res) => res.status(404).json({ ok: false, error: { code: 'not_found', message: 'Rota não encontrada' } }));
app.use(errorMiddleware);

module.exports = app;
