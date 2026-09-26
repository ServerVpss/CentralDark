// Ponto de entrada do MultiZap Gateway.
// Porta padrão: 3100 (NUNCA usar 3000 — é do Baileys antigo de Recargas Brasil).
require('dotenv').config();
const app = require('./src/app');
const env = require('./src/config/env');
const logger = require('./src/utils/logger');
const connectionService = require('./src/services/connectionService');

// [config-guard] validação de URLs/ENV em produção
const { validateProductionUrls } = require('./src/config/validateUrls');
const { compareEnvParity } = require('./src/config/validateEnvParity');
const { notify: notifyTelegram } = require('./src/services/telegramNotify');

const port = env.PORT;

// Estado global de saúde da configuração — usado pelo /health
global.__configHealth = { ok: true, checkedAt: null, urls: null, parity: null };

function runConfigGuards() {
  // 1) URLs proibidas (lovable.app/lovable.dev/preview) em produção
  const urlCheck = validateProductionUrls(process.env);
  global.__configHealth.urls = urlCheck;

  if (!urlCheck.ok) {
    for (const v of urlCheck.violations) {
      const fields = {
        Variavel: v.var,
        'Valor atual': v.currentValue,
        'Host atual': v.currentHost || '(invalido)',
        'Hosts permitidos': v.expectedHosts.join(', '),
        Motivo: v.reason,
        Processo: env.GATEWAY_NAME + ' (pid=' + process.pid + ')',
        Risco: 'mensagens podem nao chegar no CRM',
        Acao: 'corrigir .env e rodar: pm2 restart MultiZap-Gateway --update-env && pm2 save',
      };
      logger.event(
        'error',
        '🚨',
        'CONFIGURACAO_INVALIDA_URL_PROIBIDA',
        'Configuracao invalida: URL proibida em producao',
        fields,
      );
      if (urlCheck.enforced && v.severity === 'critical') {
        notifyTelegram('CONFIGURACAO', 'URL proibida em producao', fields).catch(() => {});
      }
    }
  } else {
    logger.info('config_urls_ok', {
      env: urlCheck.nodeEnv || 'desconhecido',
      allowed_hosts: urlCheck.allowedHosts.join(', '),
    });
  }

  // 2) Divergência entre .env em disco e ENV real do processo PM2
  const parity = compareEnvParity();
  global.__configHealth.parity = parity;

  if (!parity.dotenvOk) {
    logger.warn('env_parity_skip', {
      reason: parity.dotenvError || 'desconhecido',
      path: parity.dotenvPath,
    });
  } else if (!parity.ok) {
    for (const d of parity.divergences) {
      const fields = d.kind === 'secret'
        ? {
            Variavel: d.var,
            Tipo: 'secret (comparado por hash)',
            '.env em disco (hash)': d.diskFingerprint,
            'ENV do PM2 (hash)': d.procFingerprint,
            Acao: d.hint,
          }
        : {
            Variavel: d.var,
            Tipo: 'public',
            '.env em disco': d.diskValue,
            'ENV do PM2': d.procValue,
            Acao: d.hint,
          };
      logger.event(
        'warn',
        '⚠️',
        'ENV_DIVERGENTE',
        '.env em disco diferente do ENV carregado no PM2',
        fields,
      );
      notifyTelegram('ENV_DIVERGENTE', d.var, fields).catch(() => {});
    }
  } else {
    logger.info('env_parity_ok', { path: parity.dotenvPath });
  }

  // configHealth.ok só fica false se URL crítica em produção estiver errada.
  global.__configHealth.ok = !(urlCheck.enforced && !urlCheck.ok);
  global.__configHealth.checkedAt = new Date().toISOString();
}

app.listen(port, '0.0.0.0', () => {
  logger.info(`[${env.GATEWAY_NAME}] rodando na porta ${port} (env=${env.NODE_ENV})`);
  logger.info(`WuzAPI alvo: ${env.WUZAPI_BASE_URL}`);
  try {
    runConfigGuards();
  } catch (err) {
    logger.error('config_guards_falhou', { message: err && err.message });
  }
  connectionService.startWebhookWatchdog();
});

process.on('unhandledRejection', (err) => {
  logger.error('unhandledRejection', { message: err && err.message });
});
process.on('uncaughtException', (err) => {
  logger.error('uncaughtException', { message: err && err.message });
});
