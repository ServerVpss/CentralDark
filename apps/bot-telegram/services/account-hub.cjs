/**
 * CentralDark Telegram Account Hub — DELTA ÚTIL 01
 * Projection adapter over the existing OAuth Broker.
 */
'use strict';

const BROKER_BASE = (process.env.OAUTH_BROKER_INTERNAL_URL || 'http://127.0.0.1:8098').replace(/\/$/, '');
const PUBLIC_BASE = (process.env.HUB_PUBLIC_BASE || 'https://hub.centralldark.com').replace(/\/$/, '');

const DISPLAY = {
  claude: '🧠 Claude',
  openai: '🤖 OpenAI / GPT',
  gemini: '✨ Gemini',
  github: '🐙 GitHub',
  gdrive: '📁 Google Drive',
  gmail: '✉️ Gmail',
  supabase: '⚡ Supabase',
  notion: '📝 Notion',
  groq: '⚡ Groq',
  grok: '🟣 Grok / xAI',
  cloudflare: '☁️ Cloudflare',
  contabo: '🖥️ Contabo',
  codex: '🧬 Codex',
};

const OAUTH_ROUTES = new Set(['github', 'notion', 'gdrive', 'gmail']);

function esc(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function short(value, max = 32) {
  const s = String(value ?? '').trim();
  if (!s) return '—';
  return s.length <= max ? s : s.slice(0, max - 1) + '…';
}

function humanStatus(conn = {}) {
  const raw = String(conn.status || '').toLowerCase();
  const test = String(conn.last_test_status || '').toLowerCase();
  const exp = conn.expires_at ? Date.parse(conn.expires_at) : NaN;

  if (Number.isFinite(exp) && exp <= Date.now()) {
    return { icon: '🟠', human: 'Sessão vencida', tech: 'expired' };
  }
  if (['revoked', 'disabled'].includes(raw)) {
    return { icon: '⚫', human: 'Desativado', tech: raw };
  }
  if (
    ['error', 'failed', 'unauthorized'].includes(raw) ||
    ['error', 'failed', 'unauthorized'].includes(test)
  ) {
    return { icon: '🔴', human: 'Não autorizado', tech: test || raw };
  }
  if (
    ['active', 'connected'].includes(raw) &&
    ['pass', 'ok', 'success', 'healthy'].includes(test)
  ) {
    return { icon: '🟢', human: 'Conectado e testado', tech: raw + '/' + test };
  }
  if (['active', 'connected'].includes(raw)) {
    return { icon: '🟡', human: 'Conectado; teste pendente', tech: raw };
  }
  if (['testing', 'pending'].includes(raw)) {
    return { icon: '🔄', human: 'Verificando conexão', tech: raw };
  }
  return { icon: '🟡', human: 'Ainda não provado', tech: raw || 'UNKNOWN' };
}

async function fetchJson(url, init = {}) {
  const response = await fetch(url, {
    ...init,
    signal: AbortSignal.timeout(3500),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error('HTTP ' + response.status + (body?.error ? ': ' + body.error : ''));
  }
  return body;
}

async function getSnapshot(userId) {
  const uid = String(userId ?? 'telegram-admin');
  try {
    const body = await fetchJson(
      BROKER_BASE + '/api/welcome-kit?user_id=' + encodeURIComponent(uid),
    );
    return {
      ok: true,
      broker: {
        base: BROKER_BASE,
        version: body?.platform?.broker_version || 'UNKNOWN',
      },
      providers: Array.isArray(body.providers) ? body.providers : [],
      connections: Array.isArray(body.connections) ? body.connections : [],
      error: null,
    };
  } catch (error) {
    return {
      ok: false,
      broker: { base: BROKER_BASE, version: 'UNKNOWN' },
      providers: [],
      connections: [],
      error: error.message,
    };
  }
}

function providersMap(snapshot) {
  return new Map((snapshot.providers || []).map((p) => [String(p.id), p]));
}

function connsFor(snapshot, providerId) {
  return (snapshot.connections || []).filter(
    (c) => String(c.provider_id) === String(providerId),
  );
}

function providerSummary(snapshot, providerId) {
  const conns = connsFor(snapshot, providerId);
  if (!conns.length) return '🟡 Nenhuma conta provada';

  const statuses = conns.map(humanStatus);
  if (statuses.some((s) => s.icon === '🟢')) {
    return '🟢 ' + conns.length + ' conta(s), há saudável';
  }
  if (statuses.some((s) => s.icon === '🔄')) return '🔄 Verificação em andamento';
  if (statuses.some((s) => s.icon === '🔴')) return '🔴 Conta(s) sem autorização';
  if (statuses.some((s) => s.icon === '🟠')) return '🟠 Sessão(ões) vencida(s)';
  return '🟡 ' + conns.length + ' conta(s), sem teste verde';
}

function renderHub(snapshot) {
  const broker = snapshot.ok
    ? '🟢 Online e respondendo (broker ' + esc(snapshot.broker.version) + ')'
    : '🔴 Indisponível (' + esc(short(snapshot.error, 72)) + ')';

  const ids = [
    'claude',
    'openai',
    'gemini',
    'github',
    'gdrive',
    'gmail',
    'supabase',
    'notion',
    'codex',
  ];

  const lines = ids.map(
    (id) => '  ' + (DISPLAY[id] || id).padEnd(20) + ' ' + providerSummary(snapshot, id),
  );

  return (
    '<b>🔐 HUB DE CONTAS · CentralDark</b>\n\n' +
    '<b>Broker:</b> ' + broker + '\n\n' +
    '<pre>' + lines.map(esc).join('\n') + '</pre>\n' +
    '🧭 <b>Padrão universal:</b> linguagem humana primeiro; termo técnico entre parênteses.\n' +
    '🔒 Material de autenticação não é projetado no Telegram.'
  );
}

function providerLabel(providerId) {
  return DISPLAY[providerId] || '🔌 ' + providerId;
}

function renderProvider(snapshot, providerId) {
  const provider = providersMap(snapshot).get(providerId);
  const conns = connsFor(snapshot, providerId);
  const mode =
    provider?.auth_type ||
    (providerId === 'codex' ? 'CLI / fluxo a medir' : 'UNKNOWN');

  const rows = conns.length
    ? conns
        .map((conn, index) => {
          const status = humanStatus(conn);
          return [
            index + 1 + '. ' + status.icon + ' ' +
              esc(short(conn.account_label || 'conta-' + (index + 1), 28)),
            '   Estado: ' + esc(status.human) + ' (' + esc(status.tech) + ')',
            '   Expira: ' + esc(conn.expires_at || 'não informado'),
            '   Último teste: ' + esc(conn.last_test_at || 'não medido'),
          ].join('\n');
        })
        .join('\n\n')
    : '🟡 Nenhuma conta autenticada/provada neste Hub.';

  let note = '';
  if (providerId === 'claude') {
    note =
      '\n\n<b>Failover:</b> DELTA 01 entrega registro/status/auth surface. ' +
      'Alternância automática e fallback Free continuam <b>NOT_EXECUTED</b> ' +
      'até o roteador causal ser ligado e testado.';
  }
  if (providerId === 'codex') {
    note =
      '\n\n<b>Codex:</b> não inventar OAuth. O Hub só oferece login depois ' +
      'de medir o fluxo realmente suportado pelo runtime/CLI.';
  }

  return (
    '<b>' + esc(providerLabel(providerId)) + ' · CONTAS</b>\n\n' +
    '<b>Modo de credencial:</b> ' + esc(mode) + '\n' +
    '<b>Resumo:</b> ' + esc(providerSummary(snapshot, providerId)) + '\n\n' +
    '<pre>' + rows + '</pre>' +
    note
  );
}

function oauthUrl(providerId, userId) {
  return (
    PUBLIC_BASE +
    '/oauth/' +
    encodeURIComponent(providerId) +
    '/start?user_id=' +
    encodeURIComponent(String(userId ?? 'telegram-admin')) +
    '&redirect_to=' +
    encodeURIComponent(PUBLIC_BASE)
  );
}

function hubButtons() {
  return [
    [
      { text: '🧠 Claude', callback_data: 'hub:acct:claude' },
      { text: '🧬 Codex', callback_data: 'hub:acct:codex' },
    ],
    [
      { text: '🤖 GPT/OpenAI', callback_data: 'hub:acct:openai' },
      { text: '✨ Gemini', callback_data: 'hub:acct:gemini' },
    ],
    [
      { text: '🐙 GitHub', callback_data: 'hub:acct:github' },
      { text: '📁 Google', callback_data: 'hub:acct:gdrive' },
    ],
    [
      { text: '⚡ Supabase', callback_data: 'hub:acct:supabase' },
      { text: '📝 Notion', callback_data: 'hub:acct:notion' },
    ],
    [
      { text: '🔄 Atualizar', callback_data: 'hub:accounts' },
      { text: '🔙 Painel', callback_data: 'hub:main' },
    ],
  ];
}

function providerButtons(snapshot, providerId, userId) {
  const provider = providersMap(snapshot).get(providerId);
  const authType = String(provider?.auth_type || '').toLowerCase();
  const rows = [];

  if (OAUTH_ROUTES.has(providerId) && (authType.includes('oauth') || !provider)) {
    rows.push([
      {
        text: '🔗 Conectar nova conta',
        url: oauthUrl(providerId, userId),
      },
    ]);
  } else {
    rows.push([{ text: '🔐 Abrir Hub seguro', url: PUBLIC_BASE }]);
  }

  for (const conn of connsFor(snapshot, providerId).slice(0, 4)) {
    if (!conn.id) continue;
    rows.push([
      {
        text: '🧪 Testar ' + short(conn.account_label || 'conta', 24),
        callback_data: 'hub:acct:test:' + conn.id,
      },
    ]);
  }

  rows.push([
    { text: '🔄 Atualizar', callback_data: 'hub:acct:' + providerId },
    { text: '🔙 Contas', callback_data: 'hub:accounts' },
  ]);
  return rows;
}

async function testConnection(connectionId) {
  try {
    const body = await fetchJson(
      BROKER_BASE + '/api/keys/' + encodeURIComponent(connectionId) + '/test',
      { method: 'POST' },
    );
    return {
      ok: !!body.ok,
      http: body.http,
      detail: short(body.detail || body.error || 'sem detalhe', 120),
    };
  } catch (error) {
    return { ok: false, http: null, detail: short(error.message, 120) };
  }
}

module.exports = {
  BROKER_BASE,
  PUBLIC_BASE,
  getSnapshot,
  renderHub,
  renderProvider,
  hubButtons,
  providerButtons,
  testConnection,
  humanStatus,
  oauthUrl,
};
