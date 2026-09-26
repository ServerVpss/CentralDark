// Logger moderno, colorido (TTY), sanitizado e amigável para leigo.
// Política: ver docs/DECISOES_TECNICAS.md → "Política de logs do Gateway".
//
// Envs:
//   LOG_LEVEL=debug|info|warn|error  (default info)
//   LOG_FORMAT=pretty|json           (default: pretty se TTY, json caso contrário)
//   LOG_COLOR=true|false             (default: auto pelo TTY)
//   LOG_PRETTY=true|false            (compat antigo — equivale a LOG_FORMAT=pretty)
//   DEBUG_LOGS=true|false            (default false → força nível debug se true)
const env = require('../config/env');
const { safeLog } = require('./safeLog');

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };
const DEBUG_LOGS = String(process.env.DEBUG_LOGS || 'false').toLowerCase() === 'true';
const baseLevel = LEVELS[env.LOG_LEVEL] || LEVELS.info;
const current = DEBUG_LOGS ? LEVELS.debug : baseLevel;

const TZ = process.env.TZ || 'America/Sao_Paulo';

const isTTY = !!(process.stdout && process.stdout.isTTY);
const colorEnv = process.env.LOG_COLOR;
const COLOR_ENABLED = colorEnv == null ? isTTY : String(colorEnv).toLowerCase() === 'true';

// LOG_FORMAT tem prioridade; LOG_PRETTY fica como fallback legado.
const fmtEnv = (process.env.LOG_FORMAT || '').toLowerCase();
const prettyLegacy = process.env.LOG_PRETTY;
let PRETTY_ENABLED;
if (fmtEnv === 'pretty') PRETTY_ENABLED = true;
else if (fmtEnv === 'json') PRETTY_ENABLED = false;
else if (prettyLegacy != null) PRETTY_ENABLED = String(prettyLegacy).toLowerCase() === 'true';
else PRETTY_ENABLED = isTTY;

const C = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
  gray: '\x1b[90m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

function colorize(text, color) {
  if (!COLOR_ENABLED || !color) return text;
  return `${color}${text}${C.reset}`;
}

function levelColor(level) {
  if (level === 'error') return C.red;
  if (level === 'warn') return C.yellow;
  if (level === 'debug') return C.gray;
  return C.green;
}

function formatLocal(date) {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: TZ,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    }).formatToParts(date);
    const get = (t) => parts.find((p) => p.type === t)?.value || '';
    return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}:${get('second')}`;
  } catch {
    return date.toISOString();
  }
}

// Rótulos PT-BR para chaves comuns de meta.
const LABELS = {
  method: 'Método',
  path: 'Rota',
  status: 'Status',
  status_code: 'Status',
  duration_ms: 'Tempo',
  connection_id_short: 'Conexão',
  connection_id: 'Conexão',
  workspace_id: 'Workspace',
  event: 'Evento',
  source_type: 'Origem',
  message_type: 'Tipo',
  push_name: 'Contato',
  from: 'De',
  chat_id: 'Grupo',
  is_from_me: 'Enviado por mim',
  has_media: 'Mídia',
  body_preview: 'Texto',
  body_length: 'Tamanho',
  reason: 'Motivo',
  suggestion: 'Sugestão',
  friendly_message: 'Mensagem',
  message: 'Detalhe',
  content_length: 'Tamanho do payload',
  content_type: 'Content-Type',
  limit: 'Limite',
  name_changed: 'Nome alterado',
  picture_changed: 'Foto alterada',
};

const ORDER = [
  'method', 'path', 'connection_id_short', 'connection_id', 'workspace_id',
  'event', 'source_type', 'message_type', 'push_name', 'from', 'chat_id',
  'is_from_me', 'has_media', 'body_preview', 'body_length',
  'status', 'status_code', 'duration_ms',
  'reason', 'suggestion', 'friendly_message',
];

function labelFor(k) { return LABELS[k] || k; }

function prettyValue(k, v) {
  if (v === true) return 'sim';
  if (v === false) return 'não';
  if (k === 'source_type') return v === 'group' ? 'Grupo' : v === 'private' ? 'Privado' : v;
  if (k === 'message_type') {
    const m = { text: 'texto', image: 'imagem', video: 'vídeo', audio: 'áudio', document: 'documento', sticker: 'sticker' };
    return m[v] || v;
  }
  if (k === 'duration_ms' && typeof v === 'number') return `${v}ms`;
  if (k === 'status' && typeof v === 'string') return v;
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

function valueColor(k, v) {
  if (k === 'status' || k === 'status_code') {
    const n = Number(v);
    if (n >= 500) return C.red;
    if (n >= 400) return C.yellow;
    if (n >= 200 && n < 300) return C.green;
  }
  if (k === 'reason' || k === 'suggestion') return C.yellow;
  return null;
}

function renderPretty({ ts_local, level, msg, emoji, friendly, meta }) {
  const color = levelColor(level);
  const headTitle = friendly || msg;
  const head = `${colorize(ts_local, C.gray)} ${emoji || ''} ${colorize(headTitle, color)}`.trim();
  if (!meta || typeof meta !== 'object') return '\n' + head;

  const keys = Object.keys(meta).filter((k) => {
    const v = meta[k];
    return !(v == null || v === '' || (Array.isArray(v) && v.length === 0));
  });
  const ordered = [
    ...ORDER.filter((k) => keys.includes(k)),
    ...keys.filter((k) => !ORDER.includes(k)),
  ];

  // Linha em branco antes de cada evento → separação visual clara entre blocos.
  const lines = ['', head];
  for (const k of ordered) {
    const label = labelFor(k);
    const val = prettyValue(k, meta[k]);
    const vc = valueColor(k, meta[k]);
    lines.push(`   ${colorize(label + ':', C.dim)} ${colorize(val, vc)}`);
  }
  return lines.join('\n');
}

function log(level, msg, meta, emoji, friendly) {
  if (LEVELS[level] < current) return;
  const now = new Date();
  const safeMeta = meta ? safeLog(meta) : undefined;
  const ts_local = formatLocal(now);

  const write = (line) => {
    if (level === 'error') console.error(line);
    else console.log(line);
  };

  if (PRETTY_ENABLED) {
    write(renderPretty({ ts_local, level, msg, emoji, friendly, meta: safeMeta }));
  } else {
    const json = {
      ts_utc: now.toISOString(),
      ts_local,
      timezone: TZ,
      level,
      msg,
      ...(emoji ? { emoji } : {}),
      ...(friendly ? { friendly } : {}),
      ...(safeMeta ? { meta: safeMeta } : {}),
    };
    write(JSON.stringify(json));
  }
}

module.exports = {
  debug: (m, x) => log('debug', m, x),
  info: (m, x) => log('info', m, x),
  warn: (m, x) => log('warn', m, x),
  error: (m, x) => log('error', m, x),
  friendly: (emoji, m, x, friendly) => log('info', m, x, emoji, friendly),
  event: (level, emoji, m, friendly, x) => log(level, m, x, emoji, friendly),
  isDebug: () => DEBUG_LOGS || baseLevel <= LEVELS.debug,
  colorEnabled: () => COLOR_ENABLED,
  prettyEnabled: () => PRETTY_ENABLED,
};
