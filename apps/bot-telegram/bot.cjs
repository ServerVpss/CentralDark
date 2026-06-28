/**
 * Telegram Bot — Produção
 * Comandos: /start /status /skills /mode /use /memory /help
 * Mensagem livre → consciousness.run() → resposta
 */

const _path = require('path');
const _envFs = require('fs');

function loadEnvFile(filePath) {
  try {
    const content = _envFs.readFileSync(filePath, 'utf-8');
    content.split('\n').forEach(line => {
      const clean = line.trim();
      if (!clean || clean.startsWith('#')) return;
      const match = clean.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].trim().replace(/^["']|["']$/g, '');
      }
    });
  } catch {}
}

loadEnvFile('/root/CentralDark/secrets/telegram-alerts.env');
loadEnvFile(_path.join(__dirname, '.env'));

// ═══ BOOTSTRAP REMOVIDO (28/06/2026) ═══
// O bloco antigo executava /root/Multizap/apps/clone-deck/scripts/post-deploy.sh.
// Multizap é legado fora do escopo do CentralDark — removido para isolar o bot.
// ═══ FIM ═══


// === Requires tolerantes a caminho (reorganização de pastas) ===
function _resolveSkill(name) {
  const candidatos = [
    "./skills/core/" + name,        // local (bot-telegram/skills) — fonte unica
    "../bot/skills/core/" + name,       // estrutura nova (apps/bot/skills)
    "../../skills/core/" + name,        // estrutura antiga (raiz/skills)
    "../../apps/bot/skills/core/" + name,
  ];
  for (const c of candidatos) {
    try { return require(c); }
    catch (e) { if (e.code !== "MODULE_NOT_FOUND") throw e; }
  }
  throw new Error("[bot-telegram] Skill nao encontrada: " + name);
}
const consciousness = _resolveSkill("consciousness.cjs");
const manager = _resolveSkill("manager.cjs");
const memory = _resolveSkill("memory.cjs");
const panel = require('./panel.cjs');

const API = 'https://api.telegram.org';
const TOKEN = process.env.TELEGRAM_BOT_TOKEN || process.env.GUARDA_TELEGRAM_BOT_TOKEN || '';
let running = false;
let botInfo = null;
let offset = 0;

if (!TOKEN) {
  console.error('[TelegramBot] TELEGRAM_BOT_TOKEN não definido em /root/CentralDark/secrets/telegram-alerts.env. Saindo.');
  process.exit(1);
}

async function api(method, body) {
  const res = await fetch(`${API}/bot${TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  });
  const data = await res.json().catch(() => ({ ok: false, description: 'invalid json response' }));
  if (!data.ok) {
    const desc = data.description || 'unknown telegram api error';
    console.error(`[TelegramAPI] ${method}: ${desc}`);
    return null;
  }
  return data.result;
}

function esc(s) { return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function isCommand(text) {
  return typeof text === 'string' && text.trim().startsWith('/');
}

function shouldIgnoreMessage(msg) {
  if (!msg) return true;

  // Mensagens enviadas por bots nunca devem acionar a IA.
  if (msg.from?.is_bot) return true;

  // Mensagens vindas de canal, inclusive discussão automática em grupo.
  if (msg.sender_chat?.type === 'channel') return true;
  if (msg.forward_from_chat?.type === 'channel') return true;
  if (msg.is_automatic_forward) return true;

  // Em grupos/supergrupos, só responde comando explícito.
  const chatType = msg.chat?.type;
  if ((chatType === 'group' || chatType === 'supergroup') && !isCommand(msg.text)) return true;

  return false;
}

async function reply(chatId, text, buttons) {
  const body = { chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true };
  if (buttons) body.reply_markup = { inline_keyboard: buttons };
  return api('sendMessage', body);
}

async function editMsg(chatId, msgId, text, buttons) {
  const body = { chat_id: chatId, message_id: msgId, text, parse_mode: 'HTML' };
  if (buttons) body.reply_markup = { inline_keyboard: buttons };
  return api('editMessageText', body);
}

async function handleCommand(chatId, text) {
  const cmd = text.split(' ')[0].toLowerCase();
  const args = text.slice(cmd.length).trim();

  switch (cmd) {
    case '/panel':
    case '/painel':
    case '/p': {
      const p = panel.buildMainPanel();
      return reply(chatId, p.text, p.buttons);
    }
    case '/start': {
      const mainPanel = panel.buildMainPanel();
      return reply(chatId, mainPanel.text, mainPanel.buttons);
    }
    case '/status': {
      const s = consciousness.status();
      return reply(chatId, `📊 <b>Status</b>\n\n🧠 ${s.enabled?'✅ ON':'⬜ OFF'}\n⚙️ ${s.mode}\n⚡ ${s.activeSkills}/${s.totalSkills} skills\n🧠 ${s.memorySize} decisões`);
    }
    case '/skills': {
      const all = manager.listAll();
      return reply(chatId, `⚡ <b>Skills (${all.length})</b>\n\n${all.map(s=>`${s.active?'✅':'⬜'} <code>${s.slug}</code>`).join('\n')}\n\n/use nome`);
    }
    case '/mode':
      if (args === 'auto') { consciousness.enable(); return reply(chatId, '🧠 <b>AUTO</b> ativado'); }
      if (args === 'manual') { consciousness.disable(); return reply(chatId, '🎯 <b>MANUAL</b>'); }
      return reply(chatId, `Modo: <b>${consciousness.getState().mode}</b>\n/mode auto | /mode manual`,
        [[{ text: '🤖 Auto', callback_data: 'm:auto' }, { text: '🎯 Manual', callback_data: 'm:manual' }]]);
    case '/use':
      if (!args) return reply(chatId, '⚠️ /use nome_da_skill');
      return handleRun(chatId, args, args);
    case '/memory':
      const r = memory.getLast(5);
      if (!r.length) return reply(chatId, '🧠 Vazia.');
      return reply(chatId, `🧠 <b>Últimas:</b>\n\n${r.map(x=>`• <code>${x.skill || x.skillUsed || '-'}</code> → ${x.result}`).join('\n')}`);
    case '/help':
      return reply(chatId, '❓ /start /status /skills /mode /use /memory /help\n\n💡 Ou digite qualquer coisa!');
    default: return null;
  }
}

async function handleRun(chatId, input, skill) {
  try {
    const result = skill ? await consciousness.run(input, skill) : await consciousness.run(input);
    return reply(chatId, formatResult(result));
  } catch (err) { return reply(chatId, `❌ ${esc(err.message)}`); }
}

function formatResult(r) {
  if (!r) return '⚠️ Sem resposta.';
  if (r.error) return `❌ ${esc(r.error)}`;
  if (r.message && r.options) return `${r.message}\n\n${r.options.map(o=>`• <code>${typeof o==='string'?o:o.slug||o}</code>`).join('\n')}\n\n/use nome`;
  if (r.message) return r.message;
  const p = [`⚡ <b>${r.type}</b>`];
  if (r.skill) p.push(`🎯 <code>${r.skill}</code>`);
  if (r.response?.ok && r.response?.result) {
    const res = r.response.result;
    if (res.topic) p.push(`\n📝 ${esc(res.topic)}`);
    if (res.framework) p.push(`📦 ${res.framework}`);
    if (res.prompts) res.prompts.forEach(x => p.push(`${x.step}. ${esc(x.appliedTo||x.question)}`));
    if (res.note) p.push(`\n💡 ${esc(res.note)}`);
  } else if (r.response?.type === 'methodology') {
    p.push(`\n📖 ${r.response.message||''}`);
    if (r.response.advice) p.push(`💡 ${esc(r.response.advice)}`);
  } else if (r.response?.error) { p.push(`\n❌ ${esc(r.response.error)}`); }
  return p.join('\n');
}

async function handleCallback(chatId, msgId, data, qId) {
  await api('answerCallbackQuery', { callback_query_id: qId });
  const [p,a] = data.split(':');
  if (p==='panel') {
    const result = await panel.handlePanelCallback(a, api, chatId, msgId);
    if (result) return editMsg(chatId, msgId, result.text, result.buttons);
  }
  if (p==='c') return handleCommand(chatId, '/'+a);
  if (p==='m') {
    if (a==='auto') { consciousness.enable(); return editMsg(chatId, msgId, '🧠 <b>AUTO ✅</b>', [[{text:'🔙',callback_data:'c:start'}]]); }
    if (a==='manual') { consciousness.disable(); return editMsg(chatId, msgId, '🎯 <b>MANUAL</b>', [[{text:'🔙',callback_data:'c:start'}]]); }
  }
}

async function poll() {
  try {
    const updates = await api('getUpdates', { offset, timeout: 30 });
    if (!updates?.length) return;
    for (const u of updates) {
      offset = u.update_id + 1;
      try {
        if (u.callback_query) await handleCallback(u.callback_query.message?.chat?.id, u.callback_query.message?.message_id, u.callback_query.data, u.callback_query.id);
        else if (u.message?.text) {
          if (shouldIgnoreMessage(u.message)) continue;
          const cid = u.message.chat.id, txt = u.message.text;
          if (txt.startsWith('/')) { const h = await handleCommand(cid, txt); if (!h) await handleRun(cid, txt); }
          else await handleRun(cid, txt);
        }
      } catch(e) { console.error('[Bot] ' + e.message); }
    }
  } catch(e) { console.error('[Poll] ' + e.message); await new Promise(r => setTimeout(r, 5000)); }
}

async function start() {
  await api('deleteWebhook');
  botInfo = await api('getMe');
  if (!botInfo) { console.error('[Bot] Falha ao conectar'); process.exit(1); }
  manager.enable('find-skills');
  manager.enable('brainstorming');
  running = true;
  console.log(`🤖 Bot online: @${botInfo.username}`);
  while (running) { await poll(); }
}

start();
