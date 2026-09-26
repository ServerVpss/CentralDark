// Fallback SQL controlado por env WUZAPI_DB_URL.
//
// Quando o reapplyWebhook (disconnect→connect→setWebhook) falha em popular
// `events` na linha do usuário da WuzAPI, esta função abre conexão direta
// no Postgres da WuzAPI e faz UPDATE users SET events=$1 WHERE token=$2.
//
// Regras:
//  - Só ativa se WUZAPI_DB_URL estiver configurado (sem fallback, retorna no-op).
//  - Não usa userID hardcoded — identifica o usuário pelo TOKEN da sessão.
//  - Nunca expõe a URL no log: a string de conexão NUNCA é impressa.
//  - require('pg') é LAZY — se a lib não estiver instalada, retorna no-op
//    com motivo claro (não derruba o gateway).

const logger = require('../utils/logger');

let _pool = null;
let _pgModule = null;

function getPool() {
  if (_pool) return _pool;
  const url = process.env.WUZAPI_DB_URL;
  if (!url) return null;
  try {
    if (!_pgModule) _pgModule = require('pg');
  } catch (err) {
    logger.warn('wuzapi_db_fallback_pg_missing', {
      message: 'pacote pg não instalado; rode `npm install pg` no gateway',
    });
    return null;
  }
  try {
    _pool = new _pgModule.Pool({
      connectionString: url,
      max: 2,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 5_000,
    });
    _pool.on('error', (err) => {
      logger.warn('wuzapi_db_fallback_pool_error', { message: err && err.message });
    });
    return _pool;
  } catch (err) {
    logger.warn('wuzapi_db_fallback_pool_init_failed', { message: err && err.message });
    return null;
  }
}

function isEnabled() {
  return !!process.env.WUZAPI_DB_URL;
}

// Tenta sobrescrever a coluna `events` da tabela `users` da WuzAPI,
// identificando pelo token da sessão. Retorna { ok, reason, updated }.
async function forceEvents({ sessionToken, events }) {
  if (!isEnabled()) return { ok: false, reason: 'disabled', updated: 0 };
  if (!sessionToken) return { ok: false, reason: 'missing_token', updated: 0 };
  const pool = getPool();
  if (!pool) return { ok: false, reason: 'pool_unavailable', updated: 0 };

  const eventsCsv = Array.isArray(events) ? events.join(',') : String(events || '');
  if (!eventsCsv) return { ok: false, reason: 'empty_events', updated: 0 };

  const client = await pool.connect();
  try {
    const r = await client.query(
      'UPDATE users SET events=$1 WHERE token=$2 RETURNING id',
      [eventsCsv, sessionToken],
    );
    const updated = r.rowCount || 0;
    logger.info('wuzapi_db_fallback_applied', { updated, events_len: eventsCsv.length });
    return { ok: updated > 0, reason: updated > 0 ? 'updated' : 'no_row_matched', updated };
  } catch (err) {
    logger.warn('wuzapi_db_fallback_update_failed', { message: err && err.message });
    return { ok: false, reason: 'sql_failed', updated: 0, error: err && err.message };
  } finally {
    try { client.release(); } catch (_e) { /* ignore */ }
  }
}

// Alias público com nome mais explícito — mesma assinatura de forceEvents().
// sync-marker 2026-05-22T21:10Z — força inclusão do arquivo no commit GitHub main
// (o commit anterior subiu connectionService.js exigindo este módulo mas o
//  arquivo não foi empacotado, derrubando o PM2 com "Cannot find module").
async function updateUserEventsDirect({ sessionToken, events }) {
  return forceEvents({ sessionToken, events });
}

module.exports = { isEnabled, forceEvents, updateUserEventsDirect };
