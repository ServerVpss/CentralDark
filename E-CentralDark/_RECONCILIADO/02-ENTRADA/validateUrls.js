// [config-guard] Bloqueia URLs proibidas (Lovable/preview) em produção.
// NÃO derruba o processo — apenas marca configHealth e devolve violações.
// Quem usa: server.js no startup e /health.

const FORBIDDEN_HOST_PATTERNS = [
  /(^|\.)lovable\.app$/i,
  /(^|\.)lovable\.dev$/i,
  /(^|\.)lovableproject\.com$/i,
  /-preview(--|\.)/i,
  /(^|\.)preview\./i,
  /(^|\.)staging\./i,
];

const DEFAULT_ALLOWED_HOSTS = ['multizap.dev', 'proxy.multizap.dev'];

// Variáveis críticas que precisam apontar pro domínio oficial em produção.
const CRITICAL_URL_VARS = ['MULTIZAP_WEBHOOK_URL', 'GATEWAY_PUBLIC_URL'];

function parseHost(value) {
  if (!value) return null;
  try {
    const u = new URL(value);
    return u.host.toLowerCase();
  } catch {
    return null;
  }
}

function isForbiddenHost(host) {
  if (!host) return false;
  return FORBIDDEN_HOST_PATTERNS.some((re) => re.test(host));
}

function isAllowedHost(host, allowed) {
  if (!host) return false;
  return allowed.some((a) => host === a.toLowerCase() || host.endsWith('.' + a.toLowerCase()));
}

function validateProductionUrls(envObj, opts = {}) {
  const env = envObj || process.env;
  const nodeEnv = (env.NODE_ENV || '').toLowerCase();
  const isProd = nodeEnv === 'production';

  const allowedRaw = env.ALLOWED_PROD_HOSTS || DEFAULT_ALLOWED_HOSTS.join(',');
  const allowed = String(allowedRaw)
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const violations = [];
  for (const varName of CRITICAL_URL_VARS) {
    const value = env[varName];
    if (!value) continue; // vazio é tratado em outro lugar
    const host = parseHost(value);
    if (!host) {
      violations.push({
        var: varName,
        currentValue: value,
        currentHost: null,
        reason: 'URL_INVALIDA',
        expectedHosts: allowed,
        severity: 'warn',
      });
      continue;
    }
    if (isForbiddenHost(host)) {
      violations.push({
        var: varName,
        currentValue: value,
        currentHost: host,
        reason: 'URL_PROIBIDA_LOVABLE_PREVIEW',
        expectedHosts: allowed,
        severity: 'critical',
      });
      continue;
    }
    if (isProd && !isAllowedHost(host, allowed)) {
      violations.push({
        var: varName,
        currentValue: value,
        currentHost: host,
        reason: 'HOST_NAO_OFICIAL_EM_PRODUCAO',
        expectedHosts: allowed,
        severity: 'critical',
      });
    }
  }

  return {
    ok: violations.length === 0,
    enforced: isProd || !!opts.forceEnforce,
    nodeEnv,
    allowedHosts: allowed,
    violations,
  };
}

module.exports = {
  validateProductionUrls,
  CRITICAL_URL_VARS,
  FORBIDDEN_HOST_PATTERNS,
  DEFAULT_ALLOWED_HOSTS,
};
