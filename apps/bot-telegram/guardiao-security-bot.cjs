/**
 * CentralDark — @Guardiaonotify_bot  (BOT DE SEGURANÇA)
 *
 * Canal só de segurança. Hermes e HubBot (@srver1bot) ficam separados.
 * Botão: liga/desliga conversa em tempo real com a IA (operador).
 *
 * Token: GUARDA_TELEGRAM_BOT_TOKEN  (NÃO usar SRVER1)
 * Admin: GUARDA_TELEGRAM_CHAT_ID || ADMIN_CHAT_ID
 * PM2:   CentralDark-GuardiaoBot
 */
'use strict';

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function loadEnv(p) {
  try {
    fs.readFileSync(p, 'utf8').split('\n').forEach((line) => {
      const m = line.trim().match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
      if (!m) return;
      let v = m[2].trim().replace(/^["']|["']$/g, '');
      if (process.env[m[1]] === undefined || process.env[m[1]] === '') {
        process.env[m[1]] = v;
      }
    });
  } catch { /* ok */ }
}

// resolve ${VAR} once after load
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
const ADMIN_ID = Number(
  process.env.GUARDA_TELEGRAM_CHAT_ID ||
  process.env.ADMIN_CHAT_ID ||
  '0',
);
const LLM_BASE = (process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com').replace(/\/$/, '');
const LLM_KEY  = process.env.ANTHROPIC_AUTH_TOKEN || process.env.ANTHROPIC_API_KEY || '';
const LLM_MODEL = process.env.LLM_MODEL || 'claude-sonnet-4-6';
const TG = 'https://api.telegram.org';

if (!TOKEN) {
  console.error('[GuardiaoBot] ❌ GUARDA_TELEGRAM_BOT_TOKEN ausente');
  process.exit(1);
}

// sessão: conversa ON/OFF
const sessions = new Map(); // chatId -> { talk: bool, history: [] }

function getSess(chatId) {
  if (!sessions.has(chatId)) {
    sessions.set(chatId, { talk: false, history: [] });
  }
  return sessions.get(chatId);
}

async function tg(method, body) {
  const r = await fetch(`${TG}/bot${TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  });
  return r.json();
}

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function send(chatId, text, buttons) {
  const body = {
    chat_id: chatId,
    text: String(text).slice(0, 4000),
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  };
  if (buttons) body.reply_markup = { inline_keyboard: buttons };
  return tg('sendMessage', body);
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

function buildMenu(chatId) {
  const s = getSess(chatId);
  const talkBtn = s.talk
    ? { text: '🔴 DESLIGAR conversa (console off)', callback_data: 'sec:talk:off' }
    : { text: '🟢 LIGAR conversa (falar comigo)', callback_data: 'sec:talk:on' };

  const status = s.talk
    ? 'CONVERSA  🟢 LIGADA — manda texto que eu respondo'
    : 'CONVERSA  🔴 DESLIGADA — só botões / comandos';

  const text =
`<pre>┌──────────────────────────────────┐
│  🛡️  GUARDIÃO NOTIFY · SEGURANÇA │
│      @Guardiaonotify_bot         │
└──────────────────────────────────┘

  ${status}

  Canal só de segurança.
  Hermes e Hub ficam nos cantos deles.

  Botão verde = conversa tempo real.
  Botão vermelho = volta pro console mudo.
</pre>`;

  return {
    text,
    buttons: [
      [talkBtn],
      [
        { text: '🚨 Fail2ban agora', callback_data: 'sec:f2b' },
        { text: '🩺 VPS quick', callback_data: 'sec:vps' },
      ],
      [
        { text: '📋 Quem tá banido', callback_data: 'sec:bans' },
        { text: '🧹 Limpar chat IA', callback_data: 'sec:clear' },
      ],
      [{ text: '🏠 Menu', callback_data: 'sec:menu' }],
    ],
  };
}

function execSafe(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', timeout: 12000, maxBuffer: 200000 }).trim();
  } catch (e) {
    return (e.stdout || e.message || '').toString().slice(0, 500);
  }
}

async function getFail2banStatus() {
  const st = execSafe('fail2ban-client status sshd 2>/dev/null');
  const rec = execSafe('fail2ban-client status recidive 2>/dev/null | head -15');
  const ts = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  return `<pre>┌────────────────────────────────┐
│  🚨  FAIL2BAN SSHD             │
└────────────────────────────────┘

${esc(st || '(vazio)')}

── recidive ──
${esc(rec || '(vazio)')}

⏰ ${ts}</pre>`;
}

async function getBansList() {
  const raw = execSafe("fail2ban-client status sshd 2>/dev/null | sed -n 's/.*Banned IP list:\\s*//p'");
  const ips = (raw || '').split(/\s+/).filter(Boolean);
  const lines = ips.length
    ? ips.slice(0, 30).map((ip, i) => `  ${String(i + 1).padStart(2)}. ${ip}`).join('\n')
    : '  (nenhum ban agora)';
  return `<pre>┌────────────────────────────────┐
│  📋  BANS ATIVOS (${String(ips.length).padStart(2)})          │
└────────────────────────────────┘

${esc(lines)}

  total=${ips.length}</pre>`;
}

async function getVpsQuick() {
  const load = execSafe('uptime -p 2>/dev/null');
  const mem = execSafe("free -h --si 2>/dev/null | awk '/^Mem:/{print $3\"/\"$2\" used\"}'");
  const disk = execSafe("df -h / | awk 'NR==2{print $3\"/\"$2\" (\"$5\")\"}'");
  const f2b = execSafe("fail2ban-client status sshd 2>/dev/null | awk -F: '/Currently banned/{gsub(/ /,\"\",$2);print $2}'");
  return `<pre>┌────────────────────────────────┐
│  🩺  VPS QUICK                 │
└────────────────────────────────┘

  uptime  ${esc(load || '?')}
  ram     ${esc(mem || '?')}
  disco   ${esc(disk || '?')}
  f2b ban ${esc(f2b || '0')}
</pre>`;
}

async function callLLM(history) {
  if (!LLM_KEY) return '⚠️ LLM sem chave (ANTHROPIC_AUTH_TOKEN). Botão de menu ainda funciona.';

  const system =
    'Você é o canal de SEGURANÇA do Pivete no Telegram (@Guardiaonotify_bot). ' +
    'Tom direto, PT-BR, sem firula. Foque em segurança da VPS, fail2ban, SSH, invasores, portas. ' +
    'Não invente invasão. Se for teste/documentação, diga. ' +
    'Hermes e HubBot são outros canais — você é só segurança. ' +
    'Respostas curtas e práticas.';

  const messages = history.slice(-12).map((m) => ({
    role: m.role,
    content: m.content,
  }));

  try {
    const r = await fetch(`${LLM_BASE}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': LLM_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: LLM_MODEL,
        max_tokens: 1200,
        system,
        messages,
      }),
      signal: AbortSignal.timeout(90000),
    });
    const data = await r.json();
    if (!r.ok) return `❌ LLM ${r.status}: ${esc(JSON.stringify(data).slice(0, 200))}`;
    const text = (data.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('\n');
    return text || '(sem resposta)';
  } catch (e) {
    return `❌ LLM erro: ${esc(e.message)}`;
  }
}

async function handleCallback(cq) {
  const chatId = cq.message?.chat?.id;
  const msgId  = cq.message?.message_id;
  const fromId = cq.from?.id;
  const data   = cq.data || '';
  await tg('answerCallbackQuery', { callback_query_id: cq.id });

  if (!ADMIN_ID || fromId !== ADMIN_ID) {
    return send(chatId, '⛔ Canal de segurança só pro admin.');
  }

  const s = getSess(chatId);
  const back = [[{ text: '🏠 Menu', callback_data: 'sec:menu' }]];

  if (data === 'sec:menu') {
    const m = buildMenu(chatId);
    return edit(chatId, msgId, m.text, m.buttons);
  }
  if (data === 'sec:talk:on') {
    s.talk = true;
    const m = buildMenu(chatId);
    await edit(chatId, msgId, m.text, m.buttons);
    return send(chatId, '🟢 <b>Conversa LIGADA</b>\n\nPode mandar mensagem. Eu respondo em tempo real neste canal de segurança.\n\nPra desligar: botão vermelho no menu.');
  }
  if (data === 'sec:talk:off') {
    s.talk = false;
    const m = buildMenu(chatId);
    await edit(chatId, msgId, m.text, m.buttons);
    return send(chatId, '🔴 <b>Conversa DESLIGADA</b>\n\nConsole mudo. Só botões e /menu. Não gasto LLM até você ligar de novo.');
  }
  if (data === 'sec:f2b') {
    return edit(chatId, msgId, await getFail2banStatus(), back);
  }
  if (data === 'sec:bans') {
    return edit(chatId, msgId, await getBansList(), back);
  }
  if (data === 'sec:vps') {
    return edit(chatId, msgId, await getVpsQuick(), back);
  }
  if (data === 'sec:clear') {
    s.history = [];
    return edit(chatId, msgId, '🧹 Histórico da conversa IA limpo.', back);
  }
}

async function handleMessage(msg) {
  const chatId = msg.chat?.id;
  const fromId = msg.from?.id;
  const text = (msg.text || '').trim();
  if (!chatId || !text) return;

  if (!ADMIN_ID) {
    if (text.startsWith('/start')) {
      return send(chatId, `👋 Sou o @Guardiaonotify_bot.\nConfigure GUARDA_TELEGRAM_CHAT_ID=${chatId} e reinicie o bot.`);
    }
    return;
  }

  if (fromId !== ADMIN_ID) {
    return send(chatId, '⛔ Só o admin usa este canal de segurança.');
  }

  const cmd = text.split(/\s+/)[0].toLowerCase();
  if (cmd === '/start' || cmd === '/menu' || cmd === '/seguranca' || cmd === '/security') {
    const m = buildMenu(chatId);
    return send(chatId, m.text, m.buttons);
  }
  if (cmd === '/on') {
    getSess(chatId).talk = true;
    return send(chatId, '🟢 Conversa LIGADA. Manda texto.');
  }
  if (cmd === '/off') {
    getSess(chatId).talk = false;
    return send(chatId, '🔴 Conversa DESLIGADA.');
  }
  if (cmd === '/f2b' || cmd === '/fail2ban') {
    return send(chatId, await getFail2banStatus(), [[{ text: '🏠 Menu', callback_data: 'sec:menu' }]]);
  }

  const s = getSess(chatId);
  if (!s.talk) {
    return send(
      chatId,
      '🔴 Conversa desligada.\n\nAperta <b>🟢 LIGAR conversa</b> no menu ou manda /on\n\n/menu — painel',
      [[{ text: '🟢 LIGAR conversa', callback_data: 'sec:talk:on' }, { text: '🏠 Menu', callback_data: 'sec:menu' }]],
    );
  }

  // conversa tempo real
  await tg('sendChatAction', { chat_id: chatId, action: 'typing' });
  s.history.push({ role: 'user', content: text });
  const reply = await callLLM(s.history);
  s.history.push({ role: 'assistant', content: reply });
  if (s.history.length > 20) s.history = s.history.slice(-20);
  return send(chatId, reply.slice(0, 3900), [
    [{ text: '🔴 Desligar conversa', callback_data: 'sec:talk:off' }, { text: '🏠 Menu', callback_data: 'sec:menu' }],
  ]);
}

let offset = 0;
async function poll() {
  try {
    const data = await tg('getUpdates', { offset, timeout: 25, allowed_updates: ['message', 'callback_query'] });
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
        console.error('[GuardiaoBot] update err', e.message);
      }
    }
  } catch (e) {
    console.error('[GuardiaoBot] poll err', e.message);
  }
}

async function main() {
  // garantir sem webhook residual neste bot
  await tg('deleteWebhook', { drop_pending_updates: false });
  const me = await tg('getMe', {});
  if (!me.ok) {
    console.error('[GuardiaoBot] getMe FAIL', me);
    process.exit(1);
  }
  const uname = me.result?.username;
  if (uname !== 'Guardiaonotify_bot') {
    console.error('[GuardiaoBot] ❌ Token não é @Guardiaonotify_bot — é @' + uname);
    process.exit(1);
  }
  console.log(`[GuardiaoBot] ✅ @${uname} online — canal SEGURANÇA`);
  console.log(`[GuardiaoBot] Admin ${ADMIN_ID || '(não setado)'}`);
  // loop
  for (;;) {
    await poll();
  }
}

main().catch((e) => {
  console.error('[GuardiaoBot] fatal', e);
  process.exit(1);
});
