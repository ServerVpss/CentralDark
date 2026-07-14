/**
 * CentralDark — @Guardiaonotify_bot  (BOT DE SEGURANÇA)
 *
 * Canal só de segurança. Hermes e HubBot ficam separados.
 * - Botão liga/desliga conversa com IA
 * - Liberar IP / email / Telegram ID (allowlist) — teclado mínimo
 * - Unban fail2ban + ignoreip
 * - Sessão autorizada (flag em secrets) p/ outras IAs na VPS
 *
 * Token: GUARDA_TELEGRAM_BOT_TOKEN
 * Admin: GUARDA_TELEGRAM_CHAT_ID || ADMIN_CHAT_ID
 * PM2:   CentralDark-GuardiaoBot
 */
'use strict';

const fs   = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync, execFile, spawn } = require('child_process');

function loadEnv(p) {
  try {
    fs.readFileSync(p, 'utf8').split('\n').forEach((line) => {
      const m = line.trim().match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
      if (!m) return;
      const v = m[2].trim().replace(/^["']|["']$/g, '');
      if (process.env[m[1]] === undefined || process.env[m[1]] === '') process.env[m[1]] = v;
    });
  } catch { /* ok */ }
}

function resolveEnv() {
  for (let n = 0; n < 5; n++) {
    for (const [k, v] of Object.entries(process.env)) {
      if (typeof v === 'string' && v.startsWith('${') && v.endsWith('}')) {
        const ref = v.slice(2, -1);
        if (process.env[ref] && !String(process.env[ref]).startsWith('${')) {
          process.env[k] = process.env[ref];
        }
      }
    }
  }
}

loadEnv('/root/CentralDark/secrets/telegram-alerts.env');
loadEnv('/root/CentralDark/secrets/.env');
loadEnv(path.join(__dirname, '.env'));
resolveEnv();

const TOKEN = process.env.GUARDA_TELEGRAM_BOT_TOKEN || '';
const ADMIN_ID = Number(process.env.GUARDA_TELEGRAM_CHAT_ID || process.env.ADMIN_CHAT_ID || '0');
// LLM cascade (dossiê secrets + ap7 vivo na VPS):
// 1) GUARDIAO_LLM_BASE / claude.ap7.site (Anthropic-compat) — funciona agora
// 2) Arsenal local 8090 (Abacus) — se não for mock
// 3) texto fixo + botões
const ARSENAL_BASE = (process.env.ARSENAL_BASE_URL || 'http://127.0.0.1:8090').replace(/\/$/, '');
const ARSENAL_KEY  = process.env.ARSENAL_ADAPTER_KEY || process.env.OPENAI_API_KEY || '';
const LLM_KEY  = process.env.ANTHROPIC_AUTH_TOKEN || process.env.ANTHROPIC_API_KEY || '';
const LLM_BASE = (
  process.env.GUARDIAO_LLM_BASE ||
  process.env.ANTHROPIC_BASE_URL ||
  'https://claude.ap7.site'
).replace(/\/$/, '');
const LLM_MODEL = process.env.LLM_MODEL || process.env.ARSENAL_MODEL || 'claude-sonnet-4-6';
const XAI_KEY = process.env.XAI_API_KEY || process.env.GROK_API_KEY || process.env.XAI_KEY || '';
const XAI_BASE = (process.env.XAI_BASE_URL || 'https://api.x.ai/v1').replace(/\/$/, '');
const XAI_MODEL = process.env.XAI_MODEL || process.env.GROK_MODEL || 'grok-3-mini';
// TokenRouter (Pivete) — https://www.tokenrouter.com/docs — multi-model real (não persona)
const TR_KEY = process.env.TOKENROUTER_API_KEY || process.env.USER_EXTRA_API_KEY || '';
const TR_BASE = (process.env.TOKENROUTER_BASE_URL || 'https://api.tokenrouter.com/v1').replace(/\/$/, '');
const TR_MODEL = process.env.TOKENROUTER_MODEL || 'deepseek/deepseek-v4-pro';
const TG = 'https://api.telegram.org';

function isMockText(t) {
  const s = String(t || '').toLowerCase();
  return s.includes('[mock') || s.includes('circuit breaker') || s.includes('sem créditos no provider');
}

const BRAIN_PROMPTS = {
  claude:
    'Você é o canal de SEGURANÇA do Pivete (@Guardiaonotify_bot), voz Claude/ap7. ' +
    'PT-BR, calmo, curto, humano. Fail2ban, IP, liberar acesso. Não invente invasão. Teclado ruim: sugira botões.',
  grok:
    'Você é o Grok no canal de SEGURANÇA do Pivete (@Guardiaonotify_bot). ' +
    'PT-BR, direto, parceiro, sem firula. Ajuda a bolar plano e segurança da VPS. ' +
    'Não invente invasão. Teclado ruim: respostas curtas e botões.',
  plano:
    'Você é o parceiro de PLANO do Pivete no @Guardiaonotify_bot. ' +
    'Modo: bolar plano junto. PT-BR, calmo. Estrutura simples: 1) objetivo 2) passos curtos 3) risco 4) próximo passo. ' +
    'Sem wall of text. Segurança e ops CentralDark. Pergunte 1 coisa se faltar contexto.',
  claudecode:
    'Você é o Claude Code no @Guardiaonotify_bot — terminal real da VPS CentralDark. ' +
    'PT-BR, curto. Executa, analisa código e roda comando de verdade.',
};

// Claude Code CLI (terminal real na VPS) — as "duas funções" do canal Claude
const CLAUDE_BIN = process.env.CLAUDE_BIN || '/usr/bin/claude';
const CLAUDE_CWD = process.env.CLAUDE_CODE_CWD || '/root/CentralDark';
const CLAUDE_TIMEOUT = Number(process.env.CLAUDE_CODE_TIMEOUT_MS || 170000);

// Grok CLI — login/logout da Plataforma X via device-code (OAuth oficial, seguro)
const GROK_BIN = process.env.GROK_BIN || '/root/.grok/bin/grok';
const GROK_AUTH_FILE = process.env.GROK_AUTH_FILE || '/root/.grok/auth.json';

// 🎙️ Módulo de áudio (opcional, liga/desliga). Transcrição precisa de key STT.
// Configurar em secrets/.env: AUDIO_STT_URL (OpenAI-compat /audio/transcriptions) + AUDIO_STT_KEY + AUDIO_STT_MODEL
const AUDIO_STT_URL = process.env.AUDIO_STT_URL || '';
const AUDIO_STT_KEY = process.env.AUDIO_STT_KEY || process.env.TOKENROUTER_API_KEY || '';
const AUDIO_STT_MODEL = process.env.AUDIO_STT_MODEL || 'whisper-1';

const ALLOW_PATH = '/root/CentralDark/secrets/guardiao-allowlist.json';
const AUTH_PATH  = '/root/CentralDark/secrets/guardiao-auth-session.json';
const LOG_PATH   = '/var/log/centraldark-guarda/liberar.log';
const JAIL_LOCAL = '/etc/fail2ban/jail.local';
const JAIL_REPO  = '/root/CentralDark/infra/fail2ban/jail.local';
const BRIDGE_DIR = '/root/CentralDark/secrets/guardiao-bridge';
const BRIDGE_IN  = path.join(BRIDGE_DIR, 'inbox.jsonl');
const BRIDGE_OUT = path.join(BRIDGE_DIR, 'outbox.jsonl');
const BRIDGE_ST  = path.join(BRIDGE_DIR, 'status.json');

// IP casa do Pivete — nunca revogar da allowlist fail2ban via bot
const PROTECTED_IPS = new Set(['127.0.0.1', '::1', '187.15.72.86']);

if (!TOKEN) {
  console.error('[GuardiaoBot] ❌ GUARDA_TELEGRAM_BOT_TOKEN ausente');
  process.exit(1);
}

// Canais SEPARADOS por key/botão — histórico NÃO mistura Grok ↔ Claude ↔ Plano
const sessions = new Map(); // chatId -> { talk, await, brain, hist: { grok, claude, plano } }

function getSess(chatId) {
  if (!sessions.has(chatId)) {
    sessions.set(chatId, {
      talk: false,
      await: null,
      audio: false, // 🎙️ módulo de áudio (liga/desliga)
      // default Grok — Pivete quer falar com Grok no Telegram
      brain: 'grok',
      hist: { grok: [], claude: [], plano: [] },
    });
  }
  const s = sessions.get(chatId);
  if (!s.brain) s.brain = 'grok';
  if (!s.hist) s.hist = { grok: [], claude: [], plano: [] };
  for (const k of ['grok', 'claude', 'plano']) {
    if (!Array.isArray(s.hist[k])) s.hist[k] = [];
  }
  // migra history antigo se existir
  if (Array.isArray(s.history) && s.history.length) {
    s.hist[s.brain] = s.history;
    delete s.history;
  }
  return s;
}

function histOf(s) {
  return s.hist[s.brain] || (s.hist[s.brain] = []);
}

function logLiberar(msg) {
  try {
    fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true });
    fs.appendFileSync(LOG_PATH, `[${new Date().toISOString()}] ${msg}\n`);
  } catch { /* ok */ }
}

function loadJson(p, fallback) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return fallback;
  }
}

function saveJson(p, obj) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\n', { mode: 0o600 });
  try { fs.chmodSync(p, 0o600); } catch { /* ok */ }
}

function loadAllow() {
  const a = loadJson(ALLOW_PATH, { ips: [], emails: [], telegram_ids: [], updatedAt: null });
  a.ips = a.ips || [];
  a.emails = a.emails || [];
  a.telegram_ids = a.telegram_ids || [];
  return a;
}

function saveAllow(a) {
  a.updatedAt = new Date().toISOString();
  saveJson(ALLOW_PATH, a);
}

async function tg(method, body) {
  const r = await fetch(`${TG}/bot${TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  });
  const raw = await r.text();
  try {
    return JSON.parse(raw);
  } catch {
    console.error('[GuardiaoBot] tg non-json', method, raw.slice(0, 120));
    return { ok: false, description: 'non-json from telegram' };
  }
}

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Quebra texto em linhas de no máx `width` chars (respeita palavras) — sem scroll no cel. */
function wrapText(str, width) {
  const out = [];
  for (const rawLine of String(str).split('\n')) {
    const line = rawLine.replace(/\s+$/, '');
    if (line.length <= width) { out.push(line); continue; }
    let cur = '';
    for (const word of line.split(/\s+/)) {
      if (word.length > width) {
        if (cur) { out.push(cur); cur = ''; }
        for (let i = 0; i < word.length; i += width) out.push(word.slice(i, i + width));
        continue;
      }
      if ((cur + (cur ? ' ' : '') + word).length > width) { out.push(cur); cur = word; }
      else cur = cur ? cur + ' ' + word : word;
    }
    if (cur) out.push(cur);
  }
  return out.join('\n');
}

/**
 * Card de CONVERSA monoespaçado (padrão Hermes: tudo dentro de UM <pre>).
 * Usado pras respostas de Grok/Claude/Plano ficarem dentro do bloco.
 */
function conversaCard(brain, reply) {
  // tira a assinatura solta do bridge (fica redundante com o rodapé do card)
  const clean = String(reply || '')
    .replace(/\n*—\s*(🟣\s*)?via [^\n]*$/i, '')
    .replace(/\s*\(fallback\)\s*$/i, '')
    .trim()
    .slice(0, 3400);
  const head =
    brain === 'grok' ? '🟣  GROK · TERMINAL' :
    brain === 'claudecode' ? '🖥️  CLAUDE CODE · CLI' :
    brain === 'claude' ? '🟠  CLAUDE · CHAT' :
    '📝  PLANO';
  const rodape =
    brain === 'grok' ? '🧠 memória viva ✔' :
    brain === 'claudecode' ? '🖥️ terminal VPS ✔' :
    brain === 'claude' ? '💬 canal Claude' :
    '💬 canal Plano';
  const hora = new Date().toLocaleTimeString('pt-BR', {
    timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit',
  });
  const body = esc(wrapText(clean, 34));
  return `<pre>╔══════════════════════════════════╗
║  ${head}
╚══════════════════════════════════╝

${body}

──────────────────────────────────
${rodape}   ⏱ ${hora}</pre>`;
}

async function send(chatId, text, buttons, opts = {}) {
  const body = {
    chat_id: chatId,
    text: String(text).slice(0, 4000),
    disable_web_page_preview: true,
  };
  // HTML só quando pediu (menus). Texto da IA = plain, evita erro de parse.
  if (opts.html !== false && (opts.html === true || /<\/?[a-z]|<pre/i.test(String(text)))) {
    body.parse_mode = 'HTML';
  }
  if (buttons) body.reply_markup = { inline_keyboard: buttons };
  const res = await tg('sendMessage', body);
  if (!res.ok) {
    console.error('[GuardiaoBot] send fail', res.description);
    // retry plain
    if (body.parse_mode) {
      delete body.parse_mode;
      body.text = String(text).replace(/<[^>]+>/g, '').slice(0, 4000);
      return tg('sendMessage', body);
    }
  }
  return res;
}

async function edit(chatId, msgId, text, buttons) {
  const body = {
    chat_id: chatId,
    message_id: msgId,
    text: String(text).slice(0, 4000),
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  };
  if (buttons) body.reply_markup = { inline_keyboard: buttons };
  return tg('editMessageText', body);
}

function execSafe(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', timeout: 15000, maxBuffer: 200000 }).trim();
  } catch (e) {
    return (e.stdout || e.stderr || e.message || '').toString().slice(0, 800);
  }
}

function isValidIp(ip) {
  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) return false;
  return ip.split('.').every((o) => {
    const n = Number(o);
    return n >= 0 && n <= 255;
  });
}

function isValidEmail(e) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e.length < 120;
}

/** Adiciona IP ao ignoreip ao vivo + persiste jail.local (repo + /etc) */
function protectIp(ip) {
  const notes = [];
  // unban se estiver banido
  const un = execSafe(`fail2ban-client set sshd unbanip ${ip} 2>&1`);
  notes.push(`unban: ${un.slice(0, 80) || 'ok'}`);
  const ig = execSafe(`fail2ban-client set sshd addignoreip ${ip} 2>&1`);
  notes.push(`ignore: ${ig.slice(0, 80) || 'ok'}`);

  // persist jail.local
  for (const file of [JAIL_LOCAL, JAIL_REPO]) {
    try {
      if (!fs.existsSync(file)) continue;
      let t = fs.readFileSync(file, 'utf8');
      const m = t.match(/^ignoreip\s*=\s*(.+)$/m);
      if (!m) continue;
      const parts = m[1].trim().split(/\s+/);
      if (!parts.includes(ip)) {
        parts.push(ip);
        t = t.replace(/^ignoreip\s*=\s*.+$/m, `ignoreip = ${parts.join(' ')}`);
        fs.writeFileSync(file, t);
        notes.push(`persist:${path.basename(file)}`);
      }
    } catch (e) {
      notes.push(`persist_err:${e.message}`);
    }
  }
  return notes.join(' | ');
}

function activateAuthSession(meta) {
  const code = crypto.randomBytes(4).toString('hex'); // 8 chars easy
  const exp = Date.now() + 12 * 60 * 60 * 1000; // 12h
  const obj = {
    ok: true,
    code,
    activatedAt: new Date().toISOString(),
    expiresAt: new Date(exp).toISOString(),
    expiresMs: exp,
    by: 'telegram:@Guardiaonotify_bot',
    adminId: ADMIN_ID,
    ...meta,
  };
  saveJson(AUTH_PATH, obj);
  logLiberar(`AUTH_SESSION code=${code} meta=${JSON.stringify(meta)}`);
  return obj;
}

function bridgeOnline() {
  try {
    const st = JSON.parse(fs.readFileSync(BRIDGE_ST, 'utf8'));
    return !!(st && st.online);
  } catch {
    return false;
  }
}

function brainLabel(b) {
  if (b === 'grok') return '🟣 Grok · terminal real da VPS (segurança)';
  if (b === 'claudecode') return '🖥️ Claude Code · CLI real na VPS (executa/analisa)';
  if (b === 'claude') return '💬 Claude · ap7 (conversa/pergunta)';
  return '📝 Plano · ap7 (outro canal)';
}

function channelBanner(b) {
  if (b === 'grok') return 'Canal 🟣 GROK — terminal real, executa comando na VPS.';
  if (b === 'claudecode') return 'Canal 🖥️ CLAUDE CODE — CLI real, executa/analisa de verdade na VPS.';
  if (b === 'claude') return 'Canal 💬 CLAUDE (ap7) — conversa/pergunta rápida.';
  return 'Canal 📝 PLANO — separado.';
}

function buildClaudeMenu(chatId) {
  const s = getSess(chatId);
  const b = s.brain;
  return {
    text:
`<pre>╔══════════════════════════════════╗
║  🤖  CLAUDE CODE · vocês na VPS  ║
╚══════════════════════════════════╝

  Precisou de nós? Escolhe a função:

  💬 Chat   → conversa / pergunta
              rápida (ap7)
  🖥️ Code   → Claude Code CLI real:
              executa, analisa código,
              roda comando na VPS

  Canal atual: ${b === 'claudecode' ? '🖥️ Code' : b === 'claude' ? '💬 Chat' : '(outro)'}
  ${s.talk ? '🟢 conversa ON' : '🔴 conversa OFF — liga abaixo'}</pre>`,
    buttons: [
      [
        { text: (b === 'claude' ? '✅ ' : '') + '💬 Claude Chat', callback_data: 'sec:brain:claude' },
        { text: (b === 'claudecode' ? '✅ ' : '') + '🖥️ Claude Code', callback_data: 'sec:brain:claudecode' },
      ],
      [s.talk
        ? { text: '🔴 DESLIGAR conversa', callback_data: 'sec:talk:off' }
        : { text: '🟢 LIGAR conversa', callback_data: 'sec:talk:on' }],
      [{ text: '🏠 Menu', callback_data: 'sec:menu' }],
    ],
  };
}

/** Protocolo Grok via PC: request/response em /tmp (não chama API na VPS). */
const GROK_REQ = '/tmp/grok_request.json';
const GROK_RES = '/tmp/grok_response.json';
const GROK_WAIT_MS = Number(process.env.GROK_PC_WAIT_MS || 180000);
const GROK_POLL_MS = Number(process.env.GROK_PC_POLL_MS || 500);

/**
 * Mensageiro: grava pedido do Telegram, espera resposta do PC.
 * @returns {Promise<string|null>}
 */
async function askGrokViaPcFiles(chatId, text, historySlice) {
  const id = crypto.randomBytes(8).toString('hex');
  const request = {
    id,
    chat_id: chatId,
    text: String(text || ''),
    history: (historySlice || []).slice(-12).map((m) => ({
      role: m.role,
      content: m.content,
    })),
    ts: new Date().toISOString(),
    source: 'telegram:@Guardiaonotify_bot',
    brain: 'grok',
  };

  // limpa response antiga do mesmo ciclo (evita pegar reply velho)
  try {
    if (fs.existsSync(GROK_RES)) {
      const old = JSON.parse(fs.readFileSync(GROK_RES, 'utf8'));
      if (old && old.id === id) fs.unlinkSync(GROK_RES);
      // se response é de id diferente, ainda apaga pra forçar resposta nova
      else fs.unlinkSync(GROK_RES);
    }
  } catch {
    try { fs.unlinkSync(GROK_RES); } catch { /* ok */ }
  }

  fs.writeFileSync(GROK_REQ, JSON.stringify(request, null, 2) + '\n', { mode: 0o600 });
  console.log('[GuardiaoBot] Grok mensageiro →', GROK_REQ, 'id=', id);

  const deadline = Date.now() + GROK_WAIT_MS;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, GROK_POLL_MS));
    try {
      if (!fs.existsSync(GROK_RES)) continue;
      const raw = fs.readFileSync(GROK_RES, 'utf8');
      if (!raw.trim()) continue;
      const res = JSON.parse(raw);
      // aceita se id bate OU se PC só mandou { reply } genérico após o request
      if (res.id && res.id !== id) continue;
      const reply = res.reply || res.text || res.response || res.message || '';
      if (!reply) continue;
      console.log('[GuardiaoBot] Grok mensageiro ←', GROK_RES, 'id=', res.id || id);
      // limpa request processado (opcional)
      try { fs.unlinkSync(GROK_REQ); } catch { /* ok */ }
      return String(reply).trim();
    } catch {
      // JSON incompleto enquanto PC escreve — tenta de novo
    }
  }
  return null;
}

function appendJsonl(file, obj) {
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.appendFileSync(file, JSON.stringify(obj) + '\n');
  } catch (e) {
    console.error('[GuardiaoBot] bridge write', e.message);
  }
}

/** Envia msg pro terminal Grok e espera resposta no outbox (até timeoutMs). */
async function askTerminalGrok(chatId, text, timeoutMs = 120000) {
  const id = crypto.randomBytes(6).toString('hex');
  const ts = Date.now();
  appendJsonl(BRIDGE_IN, {
    id,
    chatId,
    text,
    ts,
    from: 'telegram',
  });
  const deadline = Date.now() + timeoutMs;
  let lastSize = 0;
  try {
    lastSize = fs.statSync(BRIDGE_OUT).size;
  } catch { lastSize = 0; }

  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 800));
    let raw = '';
    try {
      raw = fs.readFileSync(BRIDGE_OUT, 'utf8');
    } catch {
      continue;
    }
    const lines = raw.trim().split('\n').filter(Boolean);
    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        const o = JSON.parse(lines[i]);
        if (o.id === id && o.reply) {
          console.log('[GuardiaoBot] canal=GROK via terminal-bridge');
          return String(o.reply).trim();
        }
      } catch { /* skip */ }
    }
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────
// 🔐 PLATAFORMA X / GROK — login (device-code OAuth) e logout por botão
// ─────────────────────────────────────────────────────────────────────
let xLoginProc = null; // processo de login pendente (aguardando o Pivete autenticar)

function xIsLogged() {
  try {
    const a = JSON.parse(fs.readFileSync(GROK_AUTH_FILE, 'utf8'));
    return Object.keys(a || {}).some((k) => /x\.ai/i.test(k));
  } catch { return false; }
}

/**
 * Inicia login device-code. Captura URL+código do output e manda pro Pivete;
 * deixa o processo vivo até ele autenticar (ou timeout). Não bloqueia o bot.
 */
function startXLogin(chatId) {
  if (xLoginProc) { try { xLoginProc.kill(); } catch {} xLoginProc = null; }
  const child = spawn(GROK_BIN, ['login', '--device-auth'], { env: process.env });
  xLoginProc = child;
  let buf = '';
  let sent = false;
  const softTimer = setTimeout(() => {
    if (!sent) {
      sent = true;
      send(chatId, cardX('AGUARDE', buf || 'Login iniciando… se travar, tente de novo.'), [
        [{ text: '🔁 Tentar de novo', callback_data: 'sec:xlogin' }],
        [{ text: '🏠 Menu', callback_data: 'sec:menu' }],
      ]);
    }
  }, 9000);
  const onData = (d) => {
    buf += d.toString();
    const url = buf.match(/https?:\/\/\S+/);
    const code = buf.match(/\b[A-Z0-9]{4}[-\s]?[A-Z0-9]{4}\b/);
    if (url && !sent) {
      sent = true;
      clearTimeout(softTimer);
      const linhas =
        `Abra o link e autorize na X (site oficial):\n\n` +
        `🔗 ${url[0]}\n` +
        (code ? `\n🔑 Código: ${code[0]}\n` : '') +
        `\nDepois de autorizar, eu te aviso aqui. ✅`;
      send(chatId, cardX('LOGIN X', linhas), [
        [{ text: '🏠 Menu', callback_data: 'sec:menu' }],
      ]);
    }
  };
  child.stdout.on('data', onData);
  child.stderr.on('data', onData);
  child.on('exit', (code) => {
    clearTimeout(softTimer);
    if (xLoginProc === child) xLoginProc = null;
    if (code === 0 && xIsLogged()) {
      send(chatId, cardX('✅ LOGADO', 'Conta X/Grok conectada! O terminal 🟣 Grok já usa esse acesso.'), [
        [{ text: '🟣 Falar com Grok', callback_data: 'sec:brain:grok' }],
        [{ text: '🏠 Menu', callback_data: 'sec:menu' }],
      ]);
    }
  });
  child.on('error', (e) => {
    clearTimeout(softTimer);
    if (xLoginProc === child) xLoginProc = null;
    if (!sent) send(chatId, cardX('❌ ERRO', 'Não consegui iniciar o login: ' + String(e.message).slice(0, 120)));
  });
  // hard timeout 5 min — não deixa processo pendurado
  setTimeout(() => { try { child.kill(); } catch {} if (xLoginProc === child) xLoginProc = null; }, 300000);
}

function doXLogout() {
  try {
    const out = execSafe(`${GROK_BIN} logout 2>&1`);
    return out || 'ok';
  } catch (e) { return String(e.message || e); }
}

function cardX(status, body) {
  return `<pre>╔══════════════════════════════════╗
║  🔐  PLATAFORMA X / GROK         ║
╚══════════════════════════════════╝

  ${status}

${esc(wrapText(String(body), 34))}</pre>`;
}

function buildXMenu() {
  const logged = xIsLogged();
  return {
    text:
`<pre>╔══════════════════════════════════╗
║  🔐  PLATAFORMA X / GROK         ║
╚══════════════════════════════════╝

  Estado: ${logged ? '🟢 CONECTADO' : '🔴 desconectado'}

  🔐 Entrar → abre login oficial da X
             (device-code, seguro)
  🚪 Sair   → desconecta a conta

  O terminal 🟣 Grok usa esse acesso.</pre>`,
    buttons: [
      [
        { text: logged ? '♻️ Reconectar X' : '🔐 Entrar na X/Grok', callback_data: 'sec:xlogin' },
        { text: '🚪 Sair (logout)', callback_data: 'sec:xlogout' },
      ],
      [{ text: '🏠 Menu', callback_data: 'sec:menu' }],
    ],
  };
}

function buildMenu(chatId) {
  const s = getSess(chatId);
  const auth = loadJson(AUTH_PATH, { ok: false });
  const authLive = auth.ok && auth.expiresMs && Date.now() < auth.expiresMs;
  const talkBtn = s.talk
    ? { text: '🔴 DESLIGAR conversa', callback_data: 'sec:talk:off' }
    : { text: '🟢 LIGAR conversa', callback_data: 'sec:talk:on' };

  const b = s.brain || 'plano';
  const text =
`<pre>┌──────────────────────────────────┐
│  🛡️  GUARDIÃO · SEGURANÇA        │
│      @Guardiaonotify_bot         │
└──────────────────────────────────┘

  CONVERSA  ${s.talk ? '🟢 ON' : '🔴 OFF'}
  CÉREBRO   ${brainLabel(b)}
  SESSÃO IA ${authLive ? '🟢 ' + (auth.code || '') : '⬜ off'}

  Escolhe cérebro → liga conversa → bola o plano.
  Grok API: ${XAI_KEY ? 'key ok' : 'falta XAI_API_KEY no secrets'}
</pre>`;

  return {
    text,
    buttons: [
      [talkBtn],
      [
        { text: '🛡️ Central Segurança', callback_data: 'sec:central' },
        { text: '🧰 Skills', callback_data: 'sec:skills' },
      ],
      [
        { text: (xIsLogged() ? '🟢 ' : '') + '🔐 X/Grok login', callback_data: 'sec:xmenu' },
        { text: (s.audio ? '🎙️ Áudio ON' : '🔇 Áudio OFF'), callback_data: s.audio ? 'sec:audio:off' : 'sec:audio:on' },
      ],
      [
        { text: (b === 'plano' ? '✅ ' : '') + '📝 Plano', callback_data: 'sec:brain:plano' },
        { text: (b === 'grok' ? '✅ ' : '') + '🟣 Grok terminal', callback_data: 'sec:brain:grok' },
        { text: ((b === 'claude' || b === 'claudecode') ? '✅ ' : '') + '🤖 Claude Code', callback_data: 'sec:claudemenu' },
      ],
      [{ text: '🔓 Liberar acesso', callback_data: 'sec:liberar' }],
      [
        { text: '🚨 Fail2ban', callback_data: 'sec:f2b' },
        { text: '📋 Bans', callback_data: 'sec:bans' },
      ],
      [
        { text: authLive ? '♻️ Renovar sessão' : '✅ Ativar sessão IA', callback_data: 'sec:auth:on' },
        { text: '⏹️ Encerrar sessão', callback_data: 'sec:auth:off' },
      ],
      [{ text: '📜 Liberados', callback_data: 'sec:lista' }],
      [{ text: '🏠 Menu', callback_data: 'sec:menu' }],
    ],
  };
}

function buildLiberarMenu() {
  return {
    text:
`<pre>┌──────────────────────────────────┐
│  🔓  LIBERAR ACESSO              │
└──────────────────────────────────┘

  Escolhe o tipo. Depois manda
  UMA linha (IP ou email ou id).

  IP     → tira ban + ignore fail2ban
  EMAIL  → allowlist conta
  ID TG  → allowlist telegram id
  UNBAN  → só tira ban (sem ignore)
</pre>`,
    buttons: [
      [{ text: '🌐 Liberar IP', callback_data: 'sec:await:ip' }],
      [{ text: '📧 Liberar EMAIL', callback_data: 'sec:await:email' }],
      [{ text: '🆔 Liberar ID Telegram', callback_data: 'sec:await:tid' }],
      [{ text: '♻️ Só unban IP', callback_data: 'sec:await:unban' }],
      [{ text: '🏠 Menu', callback_data: 'sec:menu' }],
    ],
  };
}

async function getFail2banStatus() {
  const st = execSafe('fail2ban-client status sshd 2>/dev/null');
  const ig = execSafe('fail2ban-client get sshd ignoreip 2>/dev/null');
  const ts = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  return `<pre>┌────────────────────────────────┐
│  🚨  FAIL2BAN                  │
└────────────────────────────────┘

${esc(st || '?')}

ignoreip:
${esc(ig || '?')}

⏰ ${ts}</pre>`;
}

async function getBansList() {
  const raw = execSafe("fail2ban-client status sshd 2>/dev/null | sed -n 's/.*Banned IP list:\\s*//p'");
  const ips = (raw || '').split(/\s+/).filter(Boolean);
  const lines = ips.length
    ? ips.slice(0, 30).map((ip, i) => `  ${String(i + 1).padStart(2)}. ${ip}`).join('\n')
    : '  (nenhum)';
  return `<pre>┌────────────────────────────────┐
│  📋  BANS (${String(ips.length).padStart(2)})                   │
└────────────────────────────────┘

${esc(lines)}</pre>`;
}

// ─────────────────────────────────────────────────────────────────────
// 🛡️ CENTRAL DE SEGURANÇA — combos fáceis pra leigo (read-only + reversível)
// ─────────────────────────────────────────────────────────────────────

/** Combo 1-toque: raio-x de segurança da VPS (só leitura). */
function getSecurityDashboard() {
  const banRaw = execSafe("fail2ban-client status sshd 2>/dev/null | sed -n 's/.*Currently banned:[[:space:]]*//p'");
  const banned = (banRaw || '0').split('\n')[0].trim() || '0';
  const totalRaw = execSafe("fail2ban-client status sshd 2>/dev/null | sed -n 's/.*Total banned:[[:space:]]*//p'");
  const totalBan = (totalRaw || '0').split('\n')[0].trim() || '0';
  let failed = execSafe("journalctl -u ssh -u sshd --since '24 hours ago' 2>/dev/null | grep -c 'Failed password'");
  if (!failed || /error|not/i.test(failed)) failed = execSafe('lastb 2>/dev/null | grep -c . || echo 0');
  const ports = execSafe("ss -tlnp 2>/dev/null | awk 'NR>1{print $4}' | sed 's/.*://g' | sort -un | tr '\\n' ' '").trim();
  const f2bUp = execSafe('systemctl is-active fail2ban 2>/dev/null') || '?';
  const ufw = execSafe('ufw status 2>/dev/null | head -1') || 'ufw: n/d';
  const ts = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  const nivel = Number(failed) > 200 ? '🔴 ALTO' : Number(failed) > 40 ? '🟡 MÉDIO' : '🟢 CALMO';
  return `<pre>┌────────────────────────────────┐
│  🛡️  ESCUDO · RAIO-X VPS       │
└────────────────────────────────┘

  Ameaça (24h)   ${nivel}
  Fail2ban       ${esc(f2bUp)}
  IPs banidos    ${esc(banned)}  (total: ${esc(totalBan)})
  Ataques SSH    ${esc(String(failed).trim())} tentativas
  Firewall       ${esc(ufw)}
  Portas abertas ${esc(ports || '?')}

  ⏰ ${ts}</pre>`;
}

/** Últimas tentativas de invasão (só leitura). */
function getFailedAttempts() {
  let out = execSafe("journalctl -u ssh -u sshd --since '24 hours ago' 2>/dev/null | grep 'Failed password' | tail -12 | sed 's/.*sshd\\[[0-9]*\\]: //'");
  if (!out) out = execSafe('lastb -a 2>/dev/null | head -12');
  return `<pre>┌────────────────────────────────┐
│  👁️  QUEM TENTOU ENTRAR        │
└────────────────────────────────┘

${esc(out || '  (nada registrado — tudo limpo 🟢)')}</pre>`;
}

/** Blindagem SSH — só relatório, não muda nada (evita trancar o Pivete). */
function getSshHardening() {
  const cfg = execSafe("sshd -T 2>/dev/null | grep -Ei '^(permitrootlogin|passwordauthentication|port|pubkeyauthentication|permitemptypasswords) '");
  const rows = {};
  (cfg || '').split('\n').forEach((l) => {
    const [k, ...v] = l.trim().split(/\s+/);
    if (k) rows[k] = v.join(' ');
  });
  const chk = (k, good) => {
    const val = rows[k] || '?';
    const ok = String(val).toLowerCase() === good;
    return `  ${ok ? '🟢' : '🟡'} ${k.padEnd(22)} ${val}`;
  };
  return `<pre>┌────────────────────────────────┐
│  🔒  BLINDAGEM SSH (leitura)   │
└────────────────────────────────┘

${chk('passwordauthentication', 'no')}
${chk('permitrootlogin', 'prohibit-password')}
${chk('pubkeyauthentication', 'yes')}
${chk('permitemptypasswords', 'no')}
  ℹ️ porta          ${esc(rows.port || '?')}

  🟢 ok  🟡 revisar. Mudança de SSH
  só com sua ordem (não tranco você).</pre>`;
}

/** Bane IP manualmente (reversível pelo unban). Nunca bane IP protegido. */
function banIpManual(ip, fromId) {
  const v = String(ip).trim();
  if (!isValidIp(v)) return { ok: false, msg: '❌ IP inválido. Ex: 45.148.10.99' };
  if (PROTECTED_IPS.has(v)) return { ok: false, msg: `⛔ <code>${esc(v)}</code> é IP protegido (sua casa). Não bano.` };
  const r = execSafe(`fail2ban-client set sshd banip ${v} 2>&1`);
  logLiberar(`BAN_MANUAL ip=${v} by=${fromId} r=${r}`);
  return {
    ok: true,
    msg: `🚫 IP banido: <code>${esc(v)}</code>\n<pre>${esc(r || 'ok')}</pre>\n♻️ Pra soltar: 🔓 Liberar → Só unban.`,
  };
}

function buildCentralSeg() {
  return {
    text:
`<pre>┌──────────────────────────────────┐
│  🛡️  CENTRAL DE SEGURANÇA        │
│      um toque = ação              │
└──────────────────────────────────┘

  🛡️ Escudo   → raio-x agora
  👁️ Tentativas → quem atacou
  🚫 Banir    → tranca um IP
  🔓 Liberar  → solta IP/conta
  🔒 SSH      → blindagem (leitura)

  Aperta um botão. Sem terminal.</pre>`,
    buttons: [
      [
        { text: '🛡️ Escudo (raio-x)', callback_data: 'sec:escudo' },
        { text: '👁️ Tentativas', callback_data: 'sec:tentativas' },
      ],
      [
        { text: '🚫 Banir IP', callback_data: 'sec:await:banip' },
        { text: '🔓 Liberar', callback_data: 'sec:liberar' },
      ],
      [
        { text: '🔒 Blindagem SSH', callback_data: 'sec:ssh' },
        { text: '📋 Bans', callback_data: 'sec:bans' },
      ],
      [{ text: '🏠 Menu', callback_data: 'sec:menu' }],
    ],
  };
}

// ─────────────────────────────────────────────────────────────────────
// 🧰 SKILLS — inventário organizado + instalar do GitHub pelo terminal Grok
// ─────────────────────────────────────────────────────────────────────
const SKILLS_CFG = '/root/CentralDark/apps/bot-telegram/skills/config/skills.json';

function listSkillsHtml() {
  const cfg = loadJson(SKILLS_CFG, {});
  const icon = {};
  (cfg.categories || []).forEach((c) => { icon[c.key] = c.icon; });
  const meth = (cfg.methodology?.skills || []).filter((s) => s.active);
  const exec = (cfg.executable?.skills || []).filter((s) => s.active);
  const methLines = meth.length
    ? meth.map((s) => `  📖 ${s.slug}`).join('\n')
    : '  (nenhuma)';
  const execLines = exec.length
    ? exec.map((s) => `  ${icon[s.category] || '⚡'} ${s.slug} — ${String(s.description || '').slice(0, 34)}`).join('\n')
    : '  (nenhuma)';
  return `<pre>┌────────────────────────────────┐
│  🧰  SKILLS · INVENTÁRIO        │
└────────────────────────────────┘

 📖 METODOLOGIA (${meth.length})
${esc(methLines)}

 ⚡ EXECUTÁVEIS (${exec.length})
${esc(execLines)}

 🟣 Terminal Grok: peça qualquer
 skill em conversa normal, ele faz.
 📦 Instalar do GitHub → botão abaixo.</pre>`;
}

function buildSkillsMenu() {
  return {
    text: listSkillsHtml(),
    buttons: [
      [{ text: '📦 Instalar Skill (link GitHub)', callback_data: 'sec:await:skill' }],
      [{ text: '🟣 Falar com Grok (terminal)', callback_data: 'sec:brain:grok' }],
      [{ text: '🏠 Menu', callback_data: 'sec:menu' }],
    ],
  };
}

function listAllowHtml() {
  const a = loadAllow();
  const auth = loadJson(AUTH_PATH, {});
  return `<pre>┌────────────────────────────────┐
│  📜  LIBERADOS                 │
└────────────────────────────────┘

  IPs:
${esc((a.ips.length ? a.ips.map((x) => '  · ' + x).join('\n') : '  (vazio)'))}

  Emails:
${esc((a.emails.length ? a.emails.map((x) => '  · ' + x).join('\n') : '  (vazio)'))}

  Telegram IDs:
${esc((a.telegram_ids.length ? a.telegram_ids.map((x) => '  · ' + x).join('\n') : '  (vazio)'))}

  Sessão IA: ${auth.ok ? 'code=' + auth.code + ' exp=' + (auth.expiresAt || '') : 'off'}
</pre>`;
}

async function readJsonSafe(r) {
  const raw = await r.text();
  if (!raw) return { _raw: '', _empty: true };
  if (raw.trimStart().startsWith('<')) {
    return { _html: true, _raw: raw.slice(0, 120) };
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    return { _parseErr: e.message, _raw: raw.slice(0, 120) };
  }
}

/**
 * Canal por botão:
 * - grok  → NÃO chama API na VPS. Só mensageiro /tmp/grok_request.json ↔ /tmp/grok_response.json (PC processa).
 * - claude/plano → ap7 (inalterado). TokenRouter continua no secrets pro PC usar; VPS não invoca no botão Grok.
 */
/**
 * Claude Code CLI real na VPS (terminal). withTools=true → executa/analisa de verdade.
 * @returns {Promise<string|null>}
 */
function askClaudeCli(text, withTools) {
  return new Promise((resolve) => {
    const args = ['-p', String(text)];
    if (withTools) args.push('--dangerously-skip-permissions');
    let done = false;
    const child = execFile(
      CLAUDE_BIN,
      args,
      { cwd: CLAUDE_CWD, timeout: CLAUDE_TIMEOUT, maxBuffer: 4 * 1024 * 1024, env: process.env },
      (err, stdout, stderr) => {
        if (done) return;
        done = true;
        const out = String(stdout || '')
          // eslint-disable-next-line no-control-regex
          .replace(/\x1B\[[0-9;?]*[A-Za-z]/g, '').replace(/\r/g, '').trim();
        if (out) return resolve(out);
        if (err) return resolve(null);
        resolve('');
      },
    );
    child.on('error', () => { if (!done) { done = true; resolve(null); } });
  });
}

async function callLLM(history, brain) {
  const mode = BRAIN_PROMPTS[brain] ? brain : 'plano';
  const system = BRAIN_PROMPTS[mode];
  const msgs = history.slice(-12);

  // ─── CANAL CLAUDE CODE: CLI real na VPS (executa/analisa de verdade) ───
  if (mode === 'claudecode') {
    const lastUser = [...msgs].reverse().find((m) => m.role === 'user');
    const userText = lastUser ? lastUser.content : '';
    if (!userText) return 'Manda o que você quer que o Claude Code faça na VPS.';
    const reply = await askClaudeCli(userText, true);
    if (reply) return reply;
    return 'Claude Code (CLI) não respondeu a tempo. Tenta de novo em 1 linha, ou usa 💬 Chat.';
  }

  // ─── CANAL GROK: mensageiro de arquivo (PC 24/7). Claude NUNCA. ───
  if (mode === 'grok') {
    const lastUser = [...msgs].reverse().find((m) => m.role === 'user');
    const userText = lastUser ? lastUser.content : '';
    if (!userText) return 'Manda uma mensagem de texto no canal Grok.';

    const chatId = history._chatId || 0;
    const reply = await askGrokViaPcFiles(chatId, userText, msgs);
    if (reply) return reply;

    return (
      'Canal 🟣 Grok: pedi pro PC e não veio resposta a tempo.\n\n' +
      'No PC (sempre ligado) precisa rodar o worker que:\n' +
      '1) lê /tmp/grok_request.json na VPS\n' +
      '2) chama Grok/TokenRouter aí\n' +
      '3) grava /tmp/grok_response.json\n\n' +
      'Claude não entra neste botão. Timeout ' +
      Math.round(GROK_WAIT_MS / 1000) +
      's.'
    );
  }

  // ─── CANAL CLAUDE e PLANO: SOMENTE ap7 (Anthropic-compat). Grok NÃO entra. ───
  if ((mode === 'claude' || mode === 'plano') && LLM_KEY && LLM_BASE) {
    try {
      const host = LLM_BASE.replace(/^https?:\/\//, '').split('/')[0];
      if (/centralldark\.com$/i.test(host)) {
        return 'Canal 🟠 ap7: base URL errada (centralldark). Ajusta GUARDIAO_LLM_BASE.';
      }
      const url = LLM_BASE.endsWith('/v1') ? `${LLM_BASE}/messages` : `${LLM_BASE}/v1/messages`;
      const r = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': LLM_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6',
          max_tokens: 800,
          system,
          messages: msgs,
        }),
        signal: AbortSignal.timeout(90000),
      });
      const data = await readJsonSafe(r);
      if (!data._html && !data._parseErr && r.ok) {
        const txt = (data.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('\n');
        if (txt && !isMockText(txt)) {
          console.log('[GuardiaoBot] canal=' + mode.toUpperCase() + ' key=ap7 host=' + host);
          return txt.trim();
        }
      }
      console.error('[GuardiaoBot] ap7 fail', r.status, data._raw || '');
    } catch (e) {
      console.error('[GuardiaoBot] ap7 err', e.message);
    }
    return (
      (mode === 'plano' ? 'Canal 📝 PLANO' : 'Canal 🟠 CLAUDE') +
      ': ap7 falhou agora. Grok não assume este canal.\n\n/menu'
    );
  }

  return 'Canal sem key configurada pra este botão.\nGrok→XAI_API_KEY | Claude/Plano→ANTHROPIC no ap7\n\n/menu';
}

function processLiberar(kind, value, fromId) {
  const v = value.trim();
  const a = loadAllow();

  if (kind === 'ip' || kind === 'unban') {
    if (!isValidIp(v)) return { ok: false, msg: '❌ IP inválido. Ex: 187.15.72.86' };
    if (kind === 'unban') {
      const r = execSafe(`fail2ban-client set sshd unbanip ${v} 2>&1`);
      logLiberar(`UNBAN ip=${v} by=${fromId} r=${r}`);
      return { ok: true, msg: `♻️ Unban <code>${esc(v)}</code>\n<pre>${esc(r || 'ok')}</pre>` };
    }
    const notes = protectIp(v);
    if (!a.ips.includes(v)) a.ips.push(v);
    saveAllow(a);
    activateAuthSession({ reason: 'liberar_ip', ip: v });
    logLiberar(`LIBERAR_IP ip=${v} by=${fromId} ${notes}`);
    return {
      ok: true,
      msg:
        `✅ IP liberado: <code>${esc(v)}</code>\n` +
        `· unban + ignore fail2ban\n` +
        `· sessão IA ativada (12h)\n` +
        `<pre>${esc(notes)}</pre>`,
    };
  }

  if (kind === 'email') {
    const email = v.toLowerCase();
    if (!isValidEmail(email)) return { ok: false, msg: '❌ Email inválido.' };
    if (!a.emails.includes(email)) a.emails.push(email);
    saveAllow(a);
    activateAuthSession({ reason: 'liberar_email', email });
    logLiberar(`LIBERAR_EMAIL email=${email} by=${fromId}`);
    return {
      ok: true,
      msg:
        `✅ Email liberado: <code>${esc(email)}</code>\n` +
        `· allowlist salva\n` +
        `· sessão IA ativada (12h)\n` +
        `Qualquer IA na VPS pode ler:\n<code>secrets/guardiao-auth-session.json</code>`,
    };
  }

  if (kind === 'tid') {
    const id = v.replace(/[^\d]/g, '');
    if (!id || id.length < 5) return { ok: false, msg: '❌ ID Telegram inválido (só números).' };
    if (!a.telegram_ids.includes(id)) a.telegram_ids.push(id);
    saveAllow(a);
    activateAuthSession({ reason: 'liberar_tid', telegram_id: id });
    logLiberar(`LIBERAR_TID id=${id} by=${fromId}`);
    return {
      ok: true,
      msg: `✅ Telegram ID liberado: <code>${esc(id)}</code>\n· sessão IA ativada (12h)`,
    };
  }

  return { ok: false, msg: '❌ tipo desconhecido' };
}

async function handleCallback(cq) {
  const chatId = cq.message?.chat?.id;
  const msgId  = cq.message?.message_id;
  const fromId = cq.from?.id;
  const data   = cq.data || '';
  await tg('answerCallbackQuery', { callback_query_id: cq.id });

  if (!ADMIN_ID || fromId !== ADMIN_ID) {
    return send(chatId, '⛔ Só o admin (Pivete).');
  }

  const s = getSess(chatId);
  const back = [[{ text: '🏠 Menu', callback_data: 'sec:menu' }]];

  if (data === 'sec:menu') {
    s.await = null;
    const m = buildMenu(chatId);
    return edit(chatId, msgId, m.text, m.buttons);
  }
  if (data === 'sec:talk:on') {
    s.talk = true;
    s.await = null;
    const m = buildMenu(chatId);
    await edit(chatId, msgId, m.text, m.buttons);
    return send(
      chatId,
      '🟢 Conversa LIGADA.\n' +
        channelBanner(s.brain) +
        '\n' +
        brainLabel(s.brain) +
        '\n\nManda texto. Cada botão = canal e key separados.',
      null,
      { html: false },
    );
  }
  if (data === 'sec:talk:off') {
    s.talk = false;
    const m = buildMenu(chatId);
    await edit(chatId, msgId, m.text, m.buttons);
    return send(chatId, '🔴 Conversa DESLIGADA.');
  }
  if (data.startsWith('sec:brain:')) {
    const b = data.slice('sec:brain:'.length);
    if (!BRAIN_PROMPTS[b]) return;
    s.brain = b;
    // NÃO apaga histórico do canal — só troca de canal (história separada)
    const m = buildMenu(chatId);
    await edit(chatId, msgId, m.text, m.buttons);
    const n = histOf(s).length;
    return send(
      chatId,
      channelBanner(b) +
        '\n' +
        brainLabel(b) +
        '\nMsgs neste canal: ' +
        n +
        (s.talk ? '' : '\n\nAperta 🟢 pra falar neste canal.'),
      null,
      { html: false },
    );
  }
  if (data === 'sec:liberar') {
    s.await = null;
    const m = buildLiberarMenu();
    return edit(chatId, msgId, m.text, m.buttons);
  }
  if (data.startsWith('sec:await:')) {
    const kind = data.slice('sec:await:'.length);
    s.await = kind;
    s.talk = false; // evita misturar com LLM
    const hints = {
      ip: 'Manda o IP numa linha.\nEx: <code>187.15.72.86</code>',
      email: 'Manda o email da conta.\nEx: <code>pivete@email.com</code>',
      tid: 'Manda o ID numérico do Telegram.\n(Seu admin já é conhecido)',
      unban: 'Manda o IP pra só tirar do ban.',
      banip: 'Manda o IP do atacante pra <b>banir</b>.\nEx: <code>45.148.10.99</code>\n(reversível pelo unban)',
      skill: 'Cola o <b>link do GitHub</b> da skill.\nEx: <code>https://github.com/user/repo</code>\n\nO Grok clona, instala e te diz o que ela faz.',
    };
    const cancelTo = kind === 'banip' ? 'sec:central' : kind === 'skill' ? 'sec:skills' : 'sec:liberar';
    return edit(
      chatId,
      msgId,
      `✏️ <b>Aguardando ${esc(kind)}</b>\n\n${hints[kind] || ''}\n\n/cancel cancela.`,
      [[{ text: '❌ Cancelar', callback_data: cancelTo }]],
    );
  }
  if (data === 'sec:auth:on') {
    const sess = activateAuthSession({ reason: 'botao_ativar' });
    const m = buildMenu(chatId);
    await edit(chatId, msgId, m.text, m.buttons);
    return send(
      chatId,
      `✅ <b>Sessão IA ATIVA 12h</b>\n\n` +
        `Código: <code>${sess.code}</code>\n` +
        `Expira: <code>${sess.expiresAt}</code>\n\n` +
        `Arquivo (IAs na VPS):\n<code>${AUTH_PATH}</code>\n\n` +
        `Diz pra IA: <i>lê guardiao-auth-session.json — código ${sess.code}</i>`,
    );
  }
  if (data === 'sec:auth:off') {
    saveJson(AUTH_PATH, { ok: false, closedAt: new Date().toISOString() });
    logLiberar(`AUTH_OFF by=${fromId}`);
    const m = buildMenu(chatId);
    await edit(chatId, msgId, m.text, m.buttons);
    return send(chatId, '⏹️ Sessão IA encerrada.');
  }
  if (data === 'sec:f2b') return edit(chatId, msgId, await getFail2banStatus(), back);
  if (data === 'sec:bans') return edit(chatId, msgId, await getBansList(), back);
  if (data === 'sec:lista') return edit(chatId, msgId, listAllowHtml(), back);

  // 🛡️ Central de Segurança (combos)
  if (data === 'sec:central') {
    s.await = null;
    const m = buildCentralSeg();
    return edit(chatId, msgId, m.text, m.buttons);
  }
  const segBack = [[{ text: '🛡️ Segurança', callback_data: 'sec:central' }, { text: '🏠 Menu', callback_data: 'sec:menu' }]];
  if (data === 'sec:escudo') return edit(chatId, msgId, getSecurityDashboard(), segBack);
  if (data === 'sec:tentativas') return edit(chatId, msgId, getFailedAttempts(), segBack);
  if (data === 'sec:ssh') return edit(chatId, msgId, getSshHardening(), segBack);

  // 🧰 Skills
  if (data === 'sec:skills') {
    s.await = null;
    const m = buildSkillsMenu();
    return edit(chatId, msgId, m.text, m.buttons);
  }

  // 🤖 Menu Claude Code (vocês) — 2 funções: Chat + Code
  if (data === 'sec:claudemenu') {
    s.await = null;
    const m = buildClaudeMenu(chatId);
    return edit(chatId, msgId, m.text, m.buttons);
  }

  // 🔐 Plataforma X / Grok — login/logout
  if (data === 'sec:xmenu') {
    s.await = null;
    const m = buildXMenu();
    return edit(chatId, msgId, m.text, m.buttons);
  }
  if (data === 'sec:xlogin') {
    await edit(chatId, msgId, cardX('INICIANDO', 'Abrindo login oficial da X… já te mando o link aqui.'), [
      [{ text: '🏠 Menu', callback_data: 'sec:menu' }],
    ]);
    startXLogin(chatId);
    return;
  }
  if (data === 'sec:xlogout') {
    return edit(chatId, msgId, cardX('⚠️ CONFIRMAR', 'Sair desconecta a conta X/Grok e o terminal 🟣 Grok para até você logar de novo. Confirma?'), [
      [{ text: '🚪 Sim, sair', callback_data: 'sec:xlogout:sim' }],
      [{ text: '↩️ Não, voltar', callback_data: 'sec:xmenu' }],
    ]);
  }
  if (data === 'sec:xlogout:sim') {
    const out = doXLogout();
    logLiberar(`X_LOGOUT by=${fromId} r=${out}`);
    return edit(chatId, msgId, cardX('🚪 SAIU', 'Conta X/Grok desconectada.\n\n' + out.slice(0, 200)), [
      [{ text: '🔐 Entrar de novo', callback_data: 'sec:xlogin' }],
      [{ text: '🏠 Menu', callback_data: 'sec:menu' }],
    ]);
  }

  // 🎙️ Áudio — liga/desliga
  if (data === 'sec:audio:on') {
    s.audio = true;
    const ok = AUDIO_STT_URL && AUDIO_STT_KEY;
    const m = buildMenu(chatId);
    await edit(chatId, msgId, m.text, m.buttons);
    return send(chatId, cardMini('🎙️ ÁUDIO ON', ok
      ? 'Módulo ligado! Manda um áudio que eu transcrevo e respondo.'
      : 'Ligado, mas falta a key de transcrição.\nConfigura AUDIO_STT_URL + AUDIO_STT_KEY no secrets/.env.\nDoc: docs/CONSCIENCIA/DARKAI/GUARDIAO-CONFIG.md'));
  }
  if (data === 'sec:audio:off') {
    s.audio = false;
    const m = buildMenu(chatId);
    await edit(chatId, msgId, m.text, m.buttons);
    return send(chatId, cardMini('🔇 ÁUDIO OFF', 'Módulo de áudio desligado.'));
  }
  if (data === 'sec:clear') {
    s.history = [];
    return edit(chatId, msgId, '🧹 Histórico IA limpo.', back);
  }
}

/**
 * 🎙️ Baixa o voice do Telegram e transcreve (STT OpenAI-compat).
 * Precisa de AUDIO_STT_URL + AUDIO_STT_KEY nos secrets. Sem isso, retorna null.
 * @returns {Promise<string|null>}
 */
async function transcribeVoice(fileId) {
  if (!AUDIO_STT_URL || !AUDIO_STT_KEY) return null;
  try {
    const gf = await tg('getFile', { file_id: fileId });
    if (!gf.ok) return null;
    const filePath = gf.result.file_path;
    const url = `${TG}/file/bot${TOKEN}/${filePath}`;
    const audioRes = await fetch(url);
    const arrBuf = await audioRes.arrayBuffer();
    const form = new FormData();
    form.append('file', new Blob([arrBuf]), 'voice.ogg');
    form.append('model', AUDIO_STT_MODEL);
    const r = await fetch(AUDIO_STT_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${AUDIO_STT_KEY}` },
      body: form,
      signal: AbortSignal.timeout(90000),
    });
    const d = await r.json().catch(() => ({}));
    return (d.text || '').trim() || null;
  } catch (e) {
    console.error('[GuardiaoBot] transcribe', e.message);
    return null;
  }
}

async function handleVoice(msg) {
  const chatId = msg.chat?.id;
  const fromId = msg.from?.id;
  if (!chatId || fromId !== ADMIN_ID) return;
  const s = getSess(chatId);
  if (!s.audio) {
    return send(chatId, cardMini('🎙️ ÁUDIO', 'Recebi teu áudio, mas o módulo de áudio está 🔴 desligado.\nLiga em: 🏠 Menu → 🎙️ Áudio.'), [
      [{ text: '🎙️ Ligar áudio', callback_data: 'sec:audio:on' }, { text: '🏠 Menu', callback_data: 'sec:menu' }],
    ]);
  }
  const fileId = msg.voice?.file_id || msg.audio?.file_id;
  if (!fileId) return;
  await tg('sendChatAction', { chat_id: chatId, action: 'typing' });
  const texto = await transcribeVoice(fileId);
  if (!texto) {
    return send(chatId, cardMini('🎙️ ÁUDIO', 'Áudio ligado, mas falta configurar a transcrição.\nCole AUDIO_STT_URL + AUDIO_STT_KEY no secrets/.env.\nVer doc: docs/CONSCIENCIA/DARKAI/GUARDIAO-CONFIG.md'), [
      [{ text: '🏠 Menu', callback_data: 'sec:menu' }],
    ]);
  }
  // trata o texto transcrito como se fosse mensagem digitada
  await send(chatId, cardMini('🎙️ VOCÊ DISSE', texto));
  return handleMessage({ ...msg, text: texto, voice: undefined, audio: undefined });
}

function cardMini(head, body) {
  return `<pre>╔══════════════════════════════════╗
║  ${head}
╚══════════════════════════════════╝

${esc(wrapText(String(body), 34))}</pre>`;
}

async function handleMessage(msg) {
  const chatId = msg.chat?.id;
  const fromId = msg.from?.id;
  const text = (msg.text || '').trim();
  if (!chatId || !text) return;

  if (!ADMIN_ID) {
    if (text.startsWith('/start')) {
      return send(chatId, `Configure GUARDA_TELEGRAM_CHAT_ID=${chatId}`);
    }
    return;
  }
  if (fromId !== ADMIN_ID) {
    return send(chatId, '⛔ Só o admin.');
  }

  const s = getSess(chatId);
  const cmd = text.split(/\s+/)[0].toLowerCase();

  if (cmd === '/cancel') {
    s.await = null;
    return send(chatId, '❌ Cancelado.', [[{ text: '🏠 Menu', callback_data: 'sec:menu' }]]);
  }

  // modo aguardando liberar (prioridade sobre conversa)
  if (s.await) {
    const kind = s.await;
    s.await = null;

    // 🚫 banir IP manual
    if (kind === 'banip') {
      const r = banIpManual(text, fromId);
      return send(chatId, r.msg, [
        [{ text: '🚫 Banir outro', callback_data: 'sec:await:banip' }],
        [{ text: '🛡️ Segurança', callback_data: 'sec:central' }, { text: '🏠 Menu', callback_data: 'sec:menu' }],
      ]);
    }

    // 📦 instalar skill do GitHub — vai pro terminal Grok de verdade
    if (kind === 'skill') {
      const url = text.trim();
      if (!/^https?:\/\/(www\.)?github\.com\//i.test(url) && !/github\.com/i.test(url)) {
        return send(chatId, '❌ Não parece link do GitHub. Cola algo como <code>https://github.com/user/repo</code>.', [
          [{ text: '📦 Tentar de novo', callback_data: 'sec:await:skill' }],
          [{ text: '🧰 Skills', callback_data: 'sec:skills' }],
        ]);
      }
      await tg('sendChatAction', { chat_id: chatId, action: 'typing' });
      await send(chatId, `📦 Instalando skill do GitHub…\n<code>${esc(url)}</code>\n\n🟣 Grok tá clonando e configurando no terminal. Aguenta ~1-2min.`);
      const prompt =
        `Instale a skill do repositório GitHub: ${url}\n` +
        `Passos: 1) git clone dentro de /root/Grock/projects (crie a pasta se não existir); ` +
        `2) leia SKILL.md ou README para entender o que ela faz e como instalar; ` +
        `3) se houver instalador (install.sh/package.json/requirements.txt), rode o adequado; ` +
        `4) me responda em PT-BR curto: nome da skill, o que ela faz, e como eu uso. Se falhar, diga o erro em 1 linha.`;
      let reply = await askGrokViaPcFiles(chatId, prompt, []);
      if (!reply) reply = 'Pedi pro terminal Grok instalar mas não veio resposta a tempo. Tenta de novo, ou fala com o Grok direto no canal 🟣.';
      return send(chatId, '🟣 ' + reply.slice(0, 3850), [
        [{ text: '📦 Instalar outra', callback_data: 'sec:await:skill' }],
        [{ text: '🧰 Skills', callback_data: 'sec:skills' }, { text: '🏠 Menu', callback_data: 'sec:menu' }],
      ], { html: false });
    }

    const r = processLiberar(kind, text, fromId);
    return send(chatId, r.msg, [
      [{ text: '🔓 Liberar outro', callback_data: 'sec:liberar' }],
      [{ text: '🏠 Menu', callback_data: 'sec:menu' }],
    ]);
  }

  // atalhos texto (teclado ruim = poucos chars)
  if (cmd === '/start' || cmd === '/menu' || cmd === '/seguranca') {
    const m = buildMenu(chatId);
    return send(chatId, m.text, m.buttons);
  }
  if (cmd === '/on') {
    s.talk = true;
    return send(chatId, '🟢 ON');
  }
  if (cmd === '/off') {
    s.talk = false;
    return send(chatId, '🔴 OFF');
  }
  if (cmd === '/liberar' || cmd === '/lib') {
    const m = buildLiberarMenu();
    return send(chatId, m.text, m.buttons);
  }
  if (cmd === '/auth' || cmd === '/sessao') {
    const sess = activateAuthSession({ reason: 'cmd_auth' });
    return send(chatId, `✅ Sessão IA\nCódigo: <code>${sess.code}</code>\n<code>${AUTH_PATH}</code>`);
  }
  if (cmd === '/lista') return send(chatId, listAllowHtml());
  if (cmd === '/f2b') return send(chatId, await getFail2banStatus());
  if (cmd === '/seg' || cmd === '/seguro') {
    const m = buildCentralSeg();
    return send(chatId, m.text, m.buttons);
  }
  if (cmd === '/escudo') return send(chatId, getSecurityDashboard(), [[{ text: '🛡️ Segurança', callback_data: 'sec:central' }]]);
  if (cmd === '/skills' || cmd === '/skill') {
    const m = buildSkillsMenu();
    return send(chatId, m.text, m.buttons);
  }
  if (cmd === '/claude' || cmd === '/code') {
    const m = buildClaudeMenu(chatId);
    return send(chatId, m.text, m.buttons);
  }

  // /ip 1.2.3.4
  if (cmd === '/ip' && text.split(/\s+/)[1]) {
    const r = processLiberar('ip', text.split(/\s+/)[1], fromId);
    return send(chatId, r.msg);
  }
  if (cmd === '/email' && text.split(/\s+/)[1]) {
    const r = processLiberar('email', text.split(/\s+/)[1], fromId);
    return send(chatId, r.msg);
  }

  // se mandar só um IP com conversa off → oferece como liberar
  if (!s.talk && isValidIp(text)) {
    const r = processLiberar('ip', text, fromId);
    return send(chatId, r.msg + '\n\n<i>(detectei IP — liberei)</i>', [
      [{ text: '🏠 Menu', callback_data: 'sec:menu' }],
    ]);
  }

  if (!s.talk) {
    return send(
      chatId,
      '🔴 Conversa off.\n\n🔓 Liberar / 🟢 Ligar / 🏠 Menu',
      [
        [{ text: '🔓 Liberar acesso', callback_data: 'sec:liberar' }],
        [{ text: '🟢 LIGAR conversa', callback_data: 'sec:talk:on' }],
        [{ text: '🏠 Menu', callback_data: 'sec:menu' }],
      ],
    );
  }

  await tg('sendChatAction', { chat_id: chatId, action: 'typing' });
  const h = histOf(s);
  h.push({ role: 'user', content: text });
  h._chatId = chatId;
  const reply = await callLLM(h, s.brain);
  h.push({ role: 'assistant', content: reply });
  if (h.length > 20) s.hist[s.brain] = h.slice(-20);
  // Card monoespaçado (padrão Hermes: tudo dentro de UM <pre>)
  return send(chatId, conversaCard(s.brain, reply), [
    [{ text: '🔴 Desligar', callback_data: 'sec:talk:off' }],
    [
      { text: '📝 Plano', callback_data: 'sec:brain:plano' },
      { text: '🟣 Grok', callback_data: 'sec:brain:grok' },
      { text: '🤖 Claude', callback_data: 'sec:claudemenu' },
    ],
    [{ text: '🏠 Menu', callback_data: 'sec:menu' }],
  ]);
}

let offset = 0;
async function poll() {
  try {
    const data = await tg('getUpdates', {
      offset,
      timeout: 25,
      allowed_updates: ['message', 'callback_query'],
    });
    if (!data.ok) {
      console.error('[GuardiaoBot] getUpdates', data.description);
      return;
    }
    for (const u of data.result || []) {
      offset = u.update_id + 1;
      try {
        if (u.callback_query) await handleCallback(u.callback_query);
        else if (u.message && (u.message.voice || u.message.audio)) await handleVoice(u.message);
        else if (u.message) await handleMessage(u.message);
      } catch (e) {
        console.error('[GuardiaoBot] update', e.message);
      }
    }
  } catch (e) {
    console.error('[GuardiaoBot] poll', e.message);
  }
}

async function main() {
  await tg('deleteWebhook', { drop_pending_updates: false });
  const me = await tg('getMe', {});
  if (!me.ok || me.result?.username !== 'Guardiaonotify_bot') {
    console.error('[GuardiaoBot] token errado', me);
    process.exit(1);
  }
  // seed allowlist com IP casa
  const a = loadAllow();
  if (!a.ips.includes('187.15.72.86')) {
    a.ips.push('187.15.72.86');
    saveAllow(a);
  }
  console.log(`[GuardiaoBot] ✅ @Guardiaonotify_bot · admin=${ADMIN_ID}`);
  for (;;) await poll();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
