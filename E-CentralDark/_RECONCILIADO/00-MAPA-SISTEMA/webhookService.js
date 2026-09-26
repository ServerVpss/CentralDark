// Encaminha eventos normalizados para o CRM MultiZap.
// Logs amigáveis: sucesso ✅ em INFO (não só debug), falha ❌ em ERROR com motivo.
// Alerta Telegram em 401/403, timeouts repetidos e 5xx repetidos.
const axios = require('axios');
const env = require('../config/env');
const logger = require('../utils/logger');
const { notify: notifyTelegram } = require('./telegramNotify');

// Contadores em memória pra disparar Telegram só quando passar do threshold.
const failureCounters = new Map(); // key -> { count, firstAt }
const WINDOW_MS = 5 * 60 * 1000;
const TIMEOUT_THRESHOLD = 5;
const SERVER_5XX_THRESHOLD = 5;

function bumpCounter(key) {
  const now = Date.now();
  const cur = failureCounters.get(key);
  if (!cur || now - cur.firstAt > WINDOW_MS) {
    failureCounters.set(key, { count: 1, firstAt: now });
    return 1;
  }
  cur.count += 1;
  return cur.count;
}

function targetHost(url) {
  try {
    return new URL(url).host;
  } catch {
    return '(url invalida)';
  }
}

function classifyFailure(err) {
  const code = err && err.code;
  const status = err && err.response && err.response.status;
  if (code === 'ECONNABORTED' || /timeout/i.test((err && err.message) || '')) {
    return { reason: 'timeout', status_code: null, suggestion: 'Verifique se multizap.dev está respondendo.' };
  }
  if (code === 'ECONNREFUSED' || code === 'ENOTFOUND') {
    return { reason: 'no_response', status_code: null, suggestion: 'Verifique se o CRM está online e o DNS resolvendo.' };
  }
  if (status === 401 || status === 403) {
    return { reason: `http_${status}`, status_code: status, suggestion: 'Verifique secret/token de integração (MULTIZAP_WEBHOOK_SECRET vs MULTIZAP_GATEWAY_TOKEN do CRM).' };
  }
  if (status === 404) {
    return { reason: 'http_404', status_code: 404, suggestion: 'Verifique se a rota foi publicada no domínio correto.' };
  }
  if (status && status >= 500) {
    return { reason: `http_${status}`, status_code: status, suggestion: 'Verifique logs do CRM no Lovable/Supabase.' };
  }
  return { reason: code || 'unknown', status_code: status || null, suggestion: 'Ative DEBUG_LOGS=true para mais detalhes.' };
}

async function forwardToAtendimento(payload) {
  if (!env.MULTIZAP_WEBHOOK_URL) {
    logger.warn('multizap_webhook_url_vazia', { event: payload.event });
    return { skipped: true };
  }
  const url = env.MULTIZAP_WEBHOOK_URL;
  const host = targetHost(url);
  const started = Date.now();
  try {
    const r = await axios.post(url, payload, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'X-Gateway-Secret': env.MULTIZAP_WEBHOOK_SECRET || '',
        'X-Gateway-Name': env.GATEWAY_NAME,
      },
    });
    const duration_ms = Date.now() - started;
    // Sucesso agora em INFO — visível no pm2 logs sem precisar de debug.
    logger.event('info', '✅', 'multizap_forward_success', 'Encaminhado ao CRM com sucesso', {
      categoria: 'FORWARD_CRM',
      event: payload.event,
      status: r.status,
      duration_ms,
      target_host: host,
    });
    return { ok: true, status: r.status };
  } catch (err) {
    const duration_ms = Date.now() - started;
    const info = classifyFailure(err);
    logger.event('error', '❌', 'multizap_forward_failed', 'Falha ao enviar para CRM', {
      categoria: 'FORWARD_CRM',
      event: payload.event,
      reason: info.reason,
      status_code: info.status_code,
      suggestion: info.suggestion,
      duration_ms,
      target_host: host,
      message: err && err.message,
    });

    // Alertas Telegram (com throttle interno):
    try {
      if (info.status_code === 401 || info.status_code === 403) {
        // Alerta imediato — auth quebrada é sintoma de URL/secret errado.
        notifyTelegram('FORWARD_CRM', `CRM recusou (${info.status_code})`, {
          'Host destino': host,
          Evento: payload.event,
          Motivo: info.reason,
          Sugestao: info.suggestion,
          'Tempo (ms)': duration_ms,
        }).catch(() => {});
      } else if (info.reason === 'timeout') {
        const c = bumpCounter('timeout:' + host);
        if (c >= TIMEOUT_THRESHOLD) {
          notifyTelegram('FORWARD_CRM', 'Timeouts repetidos no CRM', {
            'Host destino': host,
            'Ocorrencias (5min)': c,
            Sugestao: info.suggestion,
          }).catch(() => {});
        }
      } else if (info.status_code && info.status_code >= 500) {
        const c = bumpCounter('5xx:' + host + ':' + info.status_code);
        if (c >= SERVER_5XX_THRESHOLD) {
          notifyTelegram('FORWARD_CRM', `CRM retornando ${info.status_code} repetido`, {
            'Host destino': host,
            'Ocorrencias (5min)': c,
            Sugestao: info.suggestion,
          }).catch(() => {});
        }
      }
    } catch {
      // alerta nunca quebra o forward
    }

    return { ok: false, error: err && err.message };
  }
}

module.exports = { forwardToAtendimento };
