// Rate limit anti-ban por conexão (em memória — suficiente para 1 instância PM2).
const env = require('../config/env');

const lastSendByConn = new Map();      // connection_id -> timestamp último envio
const sentInWindow = new Map();        // connection_id -> array de timestamps na janela de 60s

function canSend(connectionId) {
  const now = Date.now();
  const last = lastSendByConn.get(connectionId) || 0;
  if (now - last < env.RATE_LIMIT_MIN_DELAY_MS) {
    return { allowed: false, reason: 'delay_min_nao_respeitado' };
  }
  const arr = (sentInWindow.get(connectionId) || []).filter((t) => now - t < 60_000);
  if (arr.length >= env.RATE_LIMIT_MAX_PER_MINUTE) {
    return { allowed: false, reason: 'limite_por_minuto_excedido' };
  }
  return { allowed: true };
}

function markSent(connectionId) {
  const now = Date.now();
  lastSendByConn.set(connectionId, now);
  const arr = (sentInWindow.get(connectionId) || []).filter((t) => now - t < 60_000);
  arr.push(now);
  sentInWindow.set(connectionId, arr);
}

module.exports = { canSend, markSent };
