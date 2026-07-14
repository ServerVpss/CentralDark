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
const { execSync } = require('child_process');

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
// LLM: prefer Arsenal local (OpenAI-compat). api.centralldark.com às vezes devolve HTML/CF 1010.
const ARSENAL_BASE = (process.env.ARSENAL_BASE_URL || 'http://127.0.0.1:8090').replace(/\/$/, '');
const ARSENAL_KEY  = process.env.ARSENAL_ADAPTER_KEY || process.env.OPENAI_API_KEY || '';
const LLM_BASE = (process.env.ANTHROPIC_BASE_URL || '').replace(/\/$/, '');
const LLM_KEY  = process.env.ANTHROPIC_AUTH_TOKEN || process.env.ANTHROPIC_API_KEY || '';
const LLM_MODEL = process.env.LLM_MODEL || process.env.ARSENAL_MODEL || 'arsenal-router';
const TG = 'https://api.telegram.org';

const ALLOW_PATH = '/root/CentralDark/secrets/guardiao-allowlist.json';
const AUTH_PATH  = '/root/CentralDark/secrets/guardiao-auth-session.json';
const LOG_PATH   = '/var/log/centraldark-guarda/liberar.log';
const JAIL_LOCAL = '/etc/fail2ban/jail.local';
const JAIL_REPO  = '/root/CentralDark/infra/fail2ban/jail.local';

// IP casa do Pivete — nunca revogar da allowlist fail2ban via bot
const PROTECTED_IPS = new Set(['127.0.0.1', '::1', '187.15.72.86']);

if (!TOKEN) {
  console.error('[GuardiaoBot] ❌ GUARDA_TELEGRAM_BOT_TOKEN ausente');
  process.exit(1);
}

const sessions = new Map(); // chatId -> { talk, history, await }

function getSess(chatId) {
  if (!sessions.has(chatId)) {
    sessions.set(chatId, { talk: false, history: [], await: null });
  }
  return sessions.get(chatId);
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

function buildMenu(chatId) {
  const s = getSess(chatId);
  const auth = loadJson(AUTH_PATH, { ok: false });
  const authLive = auth.ok && auth.expiresMs && Date.now() < auth.expiresMs;
  const talkBtn = s.talk
    ? { text: '🔴 DESLIGAR conversa', callback_data: 'sec:talk:off' }
    : { text: '🟢 LIGAR conversa', callback_data: 'sec:talk:on' };

  const text =
`<pre>┌──────────────────────────────────┐
│  🛡️  GUARDIÃO · SEGURANÇA        │
│      @Guardiaonotify_bot         │
└──────────────────────────────────┘

  CONVERSA  ${s.talk ? '🟢 ON' : '🔴 OFF'}
  SESSÃO IA ${authLive ? '🟢 ATIVA até ' + (auth.expiresAt || '').slice(11, 16) + 'Z' : '⬜ off'}
  CÓDIGO    ${authLive ? auth.code : '—'}

  Liberar IP/email/id = teclado mínimo.
  Sessão IA = prova p/ qualquer agente na VPS.
</pre>`;

  return {
    text,
    buttons: [
      [talkBtn],
      [{ text: '🔓 Liberar acesso', callback_data: 'sec:liberar' }],
      [
        { text: '🚨 Fail2ban', callback_data: 'sec:f2b' },
        { text: '📋 Bans', callback_data: 'sec:bans' },
      ],
      [
        { text: authLive ? '♻️ Renovar sessão IA' : '✅ Ativar sessão IA', callback_data: 'sec:auth:on' },
        { text: '⏹️ Encerrar sessão', callback_data: 'sec:auth:off' },
      ],
      [{ text: '📜 Ver liberados', callback_data: 'sec:lista' }],
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

async function callLLM(history) {
  const system =
    'Você é o canal de SEGURANÇA do Pivete no Telegram (@Guardiaonotify_bot). ' +
    'Fale PT-BR, calmo, curto, como humano. Segurança VPS, fail2ban, liberar IP/email. ' +
    'Não invente invasão. Teclado do Pivete é ruim: prefira sugerir botões.';

  const msgs = history.slice(-12);

  // 1) Arsenal local OpenAI-compat (estável na VPS)
  if (ARSENAL_KEY) {
    try {
      const openaiMsgs = [{ role: 'system', content: system }, ...msgs];
      const r = await fetch(`${ARSENAL_BASE}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ARSENAL_KEY}`,
          'x-api-key': ARSENAL_KEY,
        },
        body: JSON.stringify({
          model: LLM_MODEL,
          messages: openaiMsgs,
          max_tokens: 800,
          temperature: 0.4,
        }),
        signal: AbortSignal.timeout(90000),
      });
      const data = await readJsonSafe(r);
      if (data._html || data._parseErr) {
        console.error('[GuardiaoBot] arsenal non-json', data._raw || data._parseErr);
      } else if (r.ok) {
        const txt = data.choices?.[0]?.message?.content;
        if (txt) return String(txt).trim();
      } else {
        console.error('[GuardiaoBot] arsenal status', r.status, JSON.stringify(data).slice(0, 200));
      }
    } catch (e) {
      console.error('[GuardiaoBot] arsenal err', e.message);
    }
  }

  // 2) Anthropic-style (só se base local/saudável — evita CF HTML)
  if (LLM_KEY && LLM_BASE && !/centralldark\.com$/i.test(LLM_BASE.replace(/^https?:\/\//, '').split('/')[0])) {
    try {
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
        if (txt) return txt.trim();
      }
    } catch (e) {
      console.error('[GuardiaoBot] anthropic err', e.message);
    }
  }

  // 3) Fallback sem LLM — menu ainda serve
  return (
    'Beleza, tô online no canal de segurança, mas a IA de conversa tá instável agora.\n\n' +
    'Usa os botões:\n' +
    '· 🔓 Liberar IP / email\n' +
    '· 🚨 Fail2ban / bans\n' +
    '· ✅ Ativar sessão IA\n\n' +
    'Menu: /menu'
  );
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
    return send(chatId, '🟢 Conversa LIGADA. Manda texto.');
  }
  if (data === 'sec:talk:off') {
    s.talk = false;
    const m = buildMenu(chatId);
    await edit(chatId, msgId, m.text, m.buttons);
    return send(chatId, '🔴 Conversa DESLIGADA.');
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
    };
    return edit(
      chatId,
      msgId,
      `✏️ <b>Aguardando ${esc(kind)}</b>\n\n${hints[kind] || ''}\n\n/cancel cancela.`,
      [[{ text: '❌ Cancelar', callback_data: 'sec:liberar' }]],
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
  if (data === 'sec:clear') {
    s.history = [];
    return edit(chatId, msgId, '🧹 Histórico IA limpo.', back);
  }
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
  s.history.push({ role: 'user', content: text });
  const reply = await callLLM(s.history);
  s.history.push({ role: 'assistant', content: reply });
  if (s.history.length > 20) s.history = s.history.slice(-20);
  return send(chatId, reply.slice(0, 3900), [
    [{ text: '🔴 Desligar', callback_data: 'sec:talk:off' }, { text: '🔓 Liberar', callback_data: 'sec:liberar' }],
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
