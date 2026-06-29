/**
 * CentralDark — Bot Unificado @srver1bot
 *
 * Arquitetura dual-mode (Webhook-first, Polling-fallback):
 *   1. Se TELEGRAM_WEBHOOK_URL estiver definido → tenta registrar webhook
 *      e sobe servidor HTTP interno na porta BOT_WEBHOOK_PORT (padrão 9500).
 *   2. Se o registro falhar ou a variável não estiver definida → polling clássico.
 *   Modo é logado no startup e pode ser alternado apenas alterando a env var.
 *
 * Admin (ADMIN_CHAT_ID) → Hub ADM + Agentes LLM + Skills
 * Outros                → Skills system (consciousness)
 *
 * Token:         SRVER1_BOT_TOKEN || TELEGRAM_BOT_TOKEN || GUARDA_TELEGRAM_BOT_TOKEN
 * Webhook URL:   TELEGRAM_WEBHOOK_URL   (ex: https://status.centralldark.com/bot/webhook)
 * Webhook Port:  BOT_WEBHOOK_PORT       (padrão: 9500)
 * PM2:           CentralDark-HubBot  (hub.ecosystem.config.cjs)
 */

'use strict';

const http   = require('http');
const crypto = require('crypto');
const fs     = require('fs');
const path   = require('path');

// ── Carrega arquivos .env ──────────────────────────────────────────────────
function loadEnv(p) {
  try {
    fs.readFileSync(p, 'utf-8').split('\n').forEach(line => {
      const m = line.trim().match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
      // Sobrescreve undefined E string vazia (env herdada do PM2 com valor antigo)
      if (m && (process.env[m[1]] === undefined || process.env[m[1]] === ''))
        process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
    });
  } catch { /* arquivo ausente — ok */ }
}

loadEnv('/root/CentralDark/secrets/telegram-alerts.env');
loadEnv('/root/CentralDark/secrets/anthropic.env');
loadEnv('/root/CentralDark/secrets/agent.env');
loadEnv('/root/CentralDark/secrets/.env');
loadEnv(path.join(__dirname, '.env'));

// ── Configuração ──────────────────────────────────────────────────────────
const TOKEN        = process.env.SRVER1_BOT_TOKEN
                  || process.env.TELEGRAM_BOT_TOKEN
                  || process.env.GUARDA_TELEGRAM_BOT_TOKEN || '';
const ADMIN_ID     = Number(process.env.ADMIN_CHAT_ID || '0');
const LLM_BASE     = (process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com').replace(/\/$/, '');
const LLM_KEY      = process.env.ANTHROPIC_AUTH_TOKEN || '';
const LLM_MODEL    = process.env.LLM_MODEL || 'claude-sonnet-4-6';
const GH_TOKEN     = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
const MCP_PORT     = process.env.MCP_PORT || '9200';
const TG_API       = 'https://api.telegram.org';
const WEBHOOK_URL  = (process.env.TELEGRAM_WEBHOOK_URL || '').trim();
const WEBHOOK_PORT = Number(process.env.BOT_WEBHOOK_PORT || '9500');

// Secret derivado do token — estável entre restarts, sem env extra necessária
const WEBHOOK_SECRET = process.env.BOT_WEBHOOK_SECRET
  || crypto.createHash('sha256').update(TOKEN + 'centraldark').digest('hex').slice(0, 32);

if (!TOKEN) {
  console.error('[Bot] ❌ TOKEN ausente. Configure SRVER1_BOT_TOKEN em secrets/telegram-alerts.env');
  process.exit(1);
}

// ── Skills system (de bot.cjs) ────────────────────────────────────────────
let consciousness = null, manager = null, memory = null, panel = null;
let skillsOk = false;

function resolveSkill(name) {
  const candidates = [
    './skills/core/' + name,
    '../bot/skills/core/' + name,
    '../../skills/core/' + name,
    '../../apps/bot/skills/core/' + name,
  ];
  for (const c of candidates) {
    try { return require(c); } catch (e) { if (e.code !== 'MODULE_NOT_FOUND') throw e; }
  }
  throw new Error('Skill não encontrada: ' + name);
}

try {
  consciousness = resolveSkill('consciousness.cjs');
  manager       = resolveSkill('manager.cjs');
  memory        = resolveSkill('memory.cjs');
  panel         = require('./panel.cjs');
  manager.enable('find-skills');
  manager.enable('brainstorming');
  skillsOk = true;
  console.log('[Bot] ✅ Skills system carregado.');
} catch (e) {
  console.warn('[Bot] ⚠️  Skills system indisponível:', e.message);
}

// ── Sessões (agente + histórico LLM por chat) ─────────────────────────────
const sessions = new Map();
function getSession(chatId) {
  if (!sessions.has(chatId)) sessions.set(chatId, { agent: 'guardiao', history: [] });
  return sessions.get(chatId);
}

// ── Agentes LLM ───────────────────────────────────────────────────────────
const AGENTS = {
  guardiao: {
    emoji: '🛡️', nome: 'Guardião',
    prompt: 'Você é o Guardião do CentralDark — monitor e protetor do ecossistema. ' +
            'Responda sempre em PT-BR, direto e profissional. ' +
            'Foque em segurança, monitoramento, alertas e saúde da infraestrutura.',
  },
  orquestrador: {
    emoji: '🧠', nome: 'Orquestrador',
    prompt: 'Você é o Orquestrador do CentralDark — coordenador de agentes e fluxos. ' +
            'Responda sempre em PT-BR. ' +
            'Foque em planejamento, Issues GitHub e coordenação de IAs. Seja estratégico.',
  },
  analista: {
    emoji: '🔍', nome: 'Analista',
    prompt: 'Você é o Analista do CentralDark — especialista em diagnóstico técnico. ' +
            'Responda sempre em PT-BR. ' +
            'Foque em análise de problemas, debugging e revisão de código. Seja preciso.',
  },
};

// ── Telegram helpers ──────────────────────────────────────────────────────
async function tg(method, body) {
  try {
    const r = await fetch(`${TG_API}/bot${TOKEN}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {}),
    });
    const d = await r.json().catch(() => ({ ok: false }));
    if (!d.ok) console.error(`[TG] ${method}: ${d.description || '?'}`);
    return d.result ?? null;
  } catch (e) {
    console.error(`[TG] ${method}: ${e.message}`);
    return null;
  }
}

function esc(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function send(chatId, text, buttons) {
  const body = { chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true };
  if (buttons) body.reply_markup = { inline_keyboard: buttons };
  return tg('sendMessage', body);
}

async function edit(chatId, msgId, text, buttons) {
  const body = { chat_id: chatId, message_id: msgId, text, parse_mode: 'HTML', disable_web_page_preview: true };
  if (buttons) body.reply_markup = { inline_keyboard: buttons };
  return tg('editMessageText', body);
}

async function typing(chatId) {
  return tg('sendChatAction', { chat_id: chatId, action: 'typing' });
}

// ── Filtro: ignora bots, canais, grupos sem /comando ─────────────────────
function shouldIgnore(msg) {
  if (!msg) return true;
  if (msg.from?.is_bot) return true;
  if (msg.sender_chat?.type === 'channel') return true;
  if (msg.forward_from_chat?.type === 'channel') return true;
  if (msg.is_automatic_forward) return true;
  const t = msg.chat?.type;
  if ((t === 'group' || t === 'supergroup') && !(msg.text || '').startsWith('/')) return true;
  return false;
}

// ── Painel ADM ────────────────────────────────────────────────────────────
let _botMode = 'iniciando'; // atualizado no main()

function buildPanel(chatId) {
  const sess = getSession(chatId);
  const ag   = AGENTS[sess.agent];
  const ts   = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

  const modeTag = _botMode === 'webhook'
    ? '🔗 WEBHOOK ativo          '
    : '🔄 POLLING ativo          ';

  const text =
`<pre>┌──────────────────────────────────┐
│   🔮  HUB CENTRAL · CentralDark  │
└──────────────────────────────────┘

  STATUS   SISTEMA OPERACIONAL  ✅
  MODO     ${modeTag}
  AGENTE   ${ag.emoji} ${ag.nome.padEnd(23)}
  HIST.    ${String(sess.history.length).padStart(2)} msgs no contexto
  SKILLS   ${skillsOk ? '✅ disponíveis' : '⚠️  indisponível   '}

  ────── Selecione agente ou ação ───

  ⏰ ${ts}</pre>`;

  return {
    text,
    buttons: [
      [
        { text: '🛡️ Guardião',     callback_data: 'hub:ag:guardiao' },
        { text: '🧠 Orquestrador', callback_data: 'hub:ag:orquestrador' },
        { text: '🔍 Analista',     callback_data: 'hub:ag:analista' },
      ],
      [
        { text: '📊 Status VPS',     callback_data: 'hub:status' },
        { text: '📋 Issues Abertas', callback_data: 'hub:issues' },
      ],
      [
        { text: '🧹 Limpar Histórico', callback_data: 'hub:clear' },
        { text: '⚙️ Configurações',   callback_data: 'hub:config' },
      ],
    ],
  };
}

// ── Status VPS ────────────────────────────────────────────────────────────
async function getVPSStatus() {
  const checks = [
    { name: 'Webhook Deploy  ', url: 'http://localhost:9300/health' },
    { name: 'Contas Admin    ', url: 'http://localhost:9400/health' },
    { name: 'MCP CentralDark ', url: `http://localhost:${MCP_PORT}/health` },
  ];
  const results = await Promise.all(checks.map(async c => {
    try {
      const r = await fetch(c.url, { signal: AbortSignal.timeout(3000) });
      return `  ${r.ok ? '✅' : '⚠️'} ${c.name}`;
    } catch {
      return `  ❌ ${c.name}`;
    }
  }));
  const ts = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  return `<pre>┌────────────────────────────────┐
│  📊  STATUS VPS                │
└────────────────────────────────┘

${results.join('\n')}
  ──────────────────────────────
  MODO     ${_botMode.toUpperCase().padEnd(24)}

  ⏰ ${ts}</pre>`;
}

// ── Issues GitHub ─────────────────────────────────────────────────────────
async function getOpenIssues() {
  if (!GH_TOKEN) return '<pre>⚠️  GITHUB_TOKEN não configurado</pre>';
  try {
    const r = await fetch(
      'https://api.github.com/repos/ServerVpss/CentralDark/issues?state=open&per_page=20',
      { headers: { Authorization: `Bearer ${GH_TOKEN}`, 'User-Agent': 'CentralDark-HubBot' } },
    );
    const all = await r.json();
    if (!Array.isArray(all)) return `<pre>❌ API GitHub: ${JSON.stringify(all).slice(0, 100)}</pre>`;
    const issues = all.filter(i => !i.pull_request);
    if (!issues.length) return '<pre>✅  Nenhuma issue aberta</pre>';
    const lines = issues.slice(0, 10)
      .map(i => `  #${String(i.number).padStart(3)}  ${i.title.slice(0, 32)}`)
      .join('\n');
    return `<pre>┌────────────────────────────────┐
│  📋  ISSUES ABERTAS (${String(issues.length).padStart(2)})        │
└────────────────────────────────┘

${lines}

  (${Math.min(issues.length, 10)} de ${issues.length})</pre>`;
  } catch (e) {
    return `<pre>❌ ${esc(e.message)}</pre>`;
  }
}

// ── LLM (Anthropic) ───────────────────────────────────────────────────────
async function callLLM(history, systemPrompt) {
  if (!LLM_KEY) return '❌ ANTHROPIC_AUTH_TOKEN não configurado em secrets/anthropic.env.';
  const url = LLM_BASE.endsWith('/v1') ? `${LLM_BASE}/messages` : `${LLM_BASE}/v1/messages`;
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: {
        'x-api-key': LLM_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: LLM_MODEL,
        max_tokens: 1024,
        system: systemPrompt,
        messages: history.slice(-20),
      }),
    });
    const d = await r.json().catch(() => ({}));
    if (d.error) return `❌ API: ${d.error.message || JSON.stringify(d.error)}`;
    return d.content?.[0]?.text || '❌ Resposta vazia da API';
  } catch (e) {
    return `❌ LLM: ${e.message}`;
  }
}

// ── Skills helpers ────────────────────────────────────────────────────────
function formatSkillResult(r) {
  if (!r) return '⚠️ Sem resposta.';
  if (r.error) return `❌ ${esc(r.error)}`;
  if (r.message && r.options)
    return `${r.message}\n\n${r.options.map(o => `• <code>${typeof o === 'string' ? o : o.slug || o}</code>`).join('\n')}\n\n/use nome`;
  if (r.message) return r.message;
  const p = [`⚡ <b>${r.type}</b>`];
  if (r.skill) p.push(`🎯 <code>${r.skill}</code>`);
  if (r.response?.ok && r.response?.result) {
    const res = r.response.result;
    if (res.topic)    p.push(`\n📝 ${esc(res.topic)}`);
    if (res.framework) p.push(`📦 ${res.framework}`);
    if (res.prompts)   res.prompts.forEach(x => p.push(`${x.step}. ${esc(x.appliedTo || x.question)}`));
    if (res.note)      p.push(`\n💡 ${esc(res.note)}`);
  } else if (r.response?.type === 'methodology') {
    p.push(`\n📖 ${r.response.message || ''}`);
    if (r.response.advice) p.push(`💡 ${esc(r.response.advice)}`);
  } else if (r.response?.error) {
    p.push(`\n❌ ${esc(r.response.error)}`);
  }
  return p.join('\n');
}

async function runSkill(chatId, input, skillName) {
  if (!skillsOk) return send(chatId, '⚠️ Skills system indisponível.');
  try {
    const result = skillName
      ? await consciousness.run(input, skillName)
      : await consciousness.run(input);
    return send(chatId, formatSkillResult(result));
  } catch (err) {
    return send(chatId, `❌ ${esc(err.message)}`);
  }
}

// ── Comandos Admin ────────────────────────────────────────────────────────
async function handleAdminCommand(chatId, text) {
  const cmd  = text.split(' ')[0].toLowerCase();
  const args = text.slice(cmd.length).trim();
  const sess = getSession(chatId);

  switch (cmd) {
    case '/start': case '/menu': case '/painel': case '/hub': {
      const p = buildPanel(chatId);
      return send(chatId, p.text, p.buttons);
    }
    case '/status': {
      await typing(chatId);
      return send(chatId, await getVPSStatus(), [[{ text: '🔙 Painel', callback_data: 'hub:main' }]]);
    }
    case '/issues': {
      await typing(chatId);
      return send(chatId, await getOpenIssues(), [[{ text: '🔙 Painel', callback_data: 'hub:main' }]]);
    }
    case '/limpar': {
      sess.history = [];
      return send(chatId, '🧹 Histórico limpo.', [[{ text: '🔙 Painel', callback_data: 'hub:main' }]]);
    }
    case '/agente': {
      const ag = AGENTS[sess.agent];
      return send(chatId, `Agente: ${ag.emoji} <b>${ag.nome}</b>`, [[{ text: '🔙 Painel', callback_data: 'hub:main' }]]);
    }
    case '/skills': {
      if (!skillsOk) return send(chatId, '⚠️ Skills indisponível.');
      const all = manager.listAll();
      return send(chatId, `⚡ <b>Skills (${all.length})</b>\n\n${all.map(s => `${s.active ? '✅' : '⬜'} <code>${s.slug}</code>`).join('\n')}\n\n/use nome`);
    }
    case '/mode':
      if (!skillsOk) return send(chatId, '⚠️ Skills indisponível.');
      if (args === 'auto')   { consciousness.enable();  return send(chatId, '🧠 <b>AUTO</b> ativado'); }
      if (args === 'manual') { consciousness.disable(); return send(chatId, '🎯 <b>MANUAL</b>'); }
      return send(chatId, `Modo: <b>${consciousness.getState().mode}</b>`,
        [[{ text: '🤖 Auto', callback_data: 'm:auto' }, { text: '🎯 Manual', callback_data: 'm:manual' }]]);
    case '/use':
      if (!args) return send(chatId, '⚠️ /use nome_da_skill');
      return runSkill(chatId, args, args);
    case '/memory': {
      if (!skillsOk) return send(chatId, '⚠️ Skills indisponível.');
      const r = memory.getLast(5);
      if (!r.length) return send(chatId, '🧠 Vazia.');
      return send(chatId, `🧠 <b>Últimas:</b>\n\n${r.map(x => `• <code>${x.skill || x.skillUsed || '-'}</code> → ${x.result}`).join('\n')}`);
    }
    case '/help':
      return send(chatId,
        '❓ <b>Hub ADM:</b> /hub /status /issues /limpar /agente\n' +
        '<b>Skills:</b> /skills /mode /use /memory\n\n' +
        '💬 Texto livre → agente LLM ativo'
      );
    default: return null;
  }
}

// ── Comandos usuário comum (skills) ───────────────────────────────────────
async function handleUserCommand(chatId, text) {
  if (!skillsOk) return send(chatId, '⚠️ Serviço indisponível.');
  const cmd  = text.split(' ')[0].toLowerCase();
  const args = text.slice(cmd.length).trim();

  switch (cmd) {
    case '/start': case '/painel': case '/p': {
      const p = panel.buildMainPanel();
      return send(chatId, p.text, p.buttons);
    }
    case '/status': {
      const s = consciousness.status();
      return send(chatId, `📊 <b>Status</b>\n\n🧠 ${s.enabled ? '✅ ON' : '⬜ OFF'}\n⚙️ ${s.mode}\n⚡ ${s.activeSkills}/${s.totalSkills} skills`);
    }
    case '/skills': {
      const all = manager.listAll();
      return send(chatId, `⚡ <b>Skills (${all.length})</b>\n\n${all.map(s => `${s.active ? '✅' : '⬜'} <code>${s.slug}</code>`).join('\n')}\n\n/use nome`);
    }
    case '/mode':
      if (args === 'auto')   { consciousness.enable();  return send(chatId, '🧠 AUTO ativado'); }
      if (args === 'manual') { consciousness.disable(); return send(chatId, '🎯 MANUAL'); }
      return send(chatId, `Modo: <b>${consciousness.getState().mode}</b>`,
        [[{ text: '🤖 Auto', callback_data: 'm:auto' }, { text: '🎯 Manual', callback_data: 'm:manual' }]]);
    case '/use':
      if (!args) return send(chatId, '⚠️ /use nome_da_skill');
      return runSkill(chatId, args, args);
    case '/memory': {
      const r = memory.getLast(5);
      if (!r.length) return send(chatId, '🧠 Vazia.');
      return send(chatId, `🧠 <b>Últimas:</b>\n\n${r.map(x => `• <code>${x.skill || x.skillUsed || '-'}</code> → ${x.result}`).join('\n')}`);
    }
    case '/help':
      return send(chatId, '❓ /start /status /skills /mode /use /memory /help\n\n💡 Ou digite qualquer coisa!');
    default: return null;
  }
}

// ── Handler de callbacks ──────────────────────────────────────────────────
async function handleCallback(cq) {
  const chatId = cq.message?.chat?.id;
  const msgId  = cq.message?.message_id;
  const fromId = cq.from?.id;
  const data   = cq.data || '';
  const qId    = cq.id;

  await tg('answerCallbackQuery', { callback_query_id: qId });

  const isAdmin = ADMIN_ID && fromId === ADMIN_ID;

  if (isAdmin) {
    if (data === 'hub:main') {
      const p = buildPanel(chatId);
      return edit(chatId, msgId, p.text, p.buttons);
    }
    if (data.startsWith('hub:ag:')) {
      const key = data.slice(7);
      if (!AGENTS[key]) return;
      const sess   = getSession(chatId);
      sess.agent   = key;
      sess.history = [];
      const p  = buildPanel(chatId);
      const ag = AGENTS[key];
      await edit(chatId, msgId, p.text, p.buttons);
      return send(chatId, `${ag.emoji} <b>${ag.nome}</b> selecionado. Histórico limpo — pode falar!`);
    }
    if (data === 'hub:status') {
      await tg('answerCallbackQuery', { callback_query_id: qId, text: 'Verificando...' });
      return edit(chatId, msgId, await getVPSStatus(), [[{ text: '🔙 Painel', callback_data: 'hub:main' }]]);
    }
    if (data === 'hub:issues') {
      await tg('answerCallbackQuery', { callback_query_id: qId, text: 'Buscando...' });
      return edit(chatId, msgId, await getOpenIssues(), [[{ text: '🔙 Painel', callback_data: 'hub:main' }]]);
    }
    if (data === 'hub:clear') {
      const sess = getSession(chatId);
      sess.history = [];
      const p = buildPanel(chatId);
      await edit(chatId, msgId, p.text, p.buttons);
      return send(chatId, '🧹 Histórico limpo!');
    }
    if (data === 'hub:config') {
      const sess = getSession(chatId);
      const ag   = AGENTS[sess.agent];
      return edit(chatId, msgId,
`<pre>┌────────────────────────────────┐
│  ⚙️   CONFIGURAÇÕES             │
└────────────────────────────────┘

  MODO       ${_botMode.toUpperCase()}
  LLM API    ${LLM_KEY  ? '✅ Configurado' : '❌ ausente'}
  GitHub     ${GH_TOKEN ? '✅ Configurado' : '⚠️  ausente'}
  Admin ID   ${ADMIN_ID ? '✅ Configurado' : '⚠️  não definido'}
  Token      ✅ Configurado
  Modelo     ${LLM_MODEL}
  Agente     ${ag.emoji} ${ag.nome}
  Histórico  ${sess.history.length} msgs
  Skills     ${skillsOk ? '✅ online' : '⚠️  offline'}
  Webhook    ${WEBHOOK_URL || '— (polling ativo)'}
</pre>`,
        [[{ text: '🔙 Painel', callback_data: 'hub:main' }]]);
    }
    if (data.startsWith('panel:') && panel) {
      const result = await panel.handlePanelCallback(data.slice(6), tg, chatId, msgId);
      if (result) return edit(chatId, msgId, result.text, result.buttons);
    }
    if (data.startsWith('c:')) return handleAdminCommand(chatId, '/' + data.slice(2));
    if (data === 'm:auto')   { if (skillsOk) consciousness.enable();  return edit(chatId, msgId, '🧠 <b>AUTO ✅</b>', [[{ text: '🔙', callback_data: 'hub:main' }]]); }
    if (data === 'm:manual') { if (skillsOk) consciousness.disable(); return edit(chatId, msgId, '🎯 <b>MANUAL</b>',  [[{ text: '🔙', callback_data: 'hub:main' }]]); }
    return;
  }

  // Usuário comum
  if (!skillsOk) return;
  if (data.startsWith('panel:') && panel) {
    const result = await panel.handlePanelCallback(data.slice(6), tg, chatId, msgId);
    if (result) return edit(chatId, msgId, result.text, result.buttons);
  }
  if (data.startsWith('c:')) return handleUserCommand(chatId, '/' + data.slice(2));
  if (data === 'm:auto')   { consciousness.enable();  return edit(chatId, msgId, '🧠 AUTO ✅', [[{ text: '🔙', callback_data: 'c:start' }]]); }
  if (data === 'm:manual') { consciousness.disable(); return edit(chatId, msgId, '🎯 MANUAL',  [[{ text: '🔙', callback_data: 'c:start' }]]); }
}

// ── Handler de mensagens ──────────────────────────────────────────────────
async function handleMessage(msg) {
  if (shouldIgnore(msg)) return;

  const chatId  = msg.chat.id;
  const fromId  = msg.from?.id;
  const text    = msg.text || '';
  const isAdmin = ADMIN_ID && fromId === ADMIN_ID;

  if (!ADMIN_ID) {
    console.log(`[Bot] mensagem de chatId=${chatId} — configure ADMIN_CHAT_ID=${chatId}`);
    if (text.startsWith('/start')) {
      return send(chatId,
        '👋 Olá! Sou o Hub CentralDark.\n\n' +
        'Para ativar o painel ADM, adicione em\n' +
        '<code>/root/CentralDark/secrets/telegram-alerts.env</code>:\n\n' +
        `<code>ADMIN_CHAT_ID=${chatId}</code>\n\n` +
        'Depois: <code>pm2 restart CentralDark-HubBot</code>'
      );
    }
    return;
  }

  if (isAdmin) {
    if (text.startsWith('/')) {
      const h = await handleAdminCommand(chatId, text);
      if (h === null) return runSkill(chatId, text, null);
      return;
    }
    const sess = getSession(chatId);
    const ag   = AGENTS[sess.agent];
    sess.history.push({ role: 'user', content: text });
    await typing(chatId);
    const response = await callLLM(sess.history, ag.prompt);
    sess.history.push({ role: 'assistant', content: response });
    const chunks = [];
    for (let i = 0; i < response.length; i += 4000) chunks.push(response.slice(i, i + 4000));
    for (let i = 0; i < chunks.length; i++) {
      const isLast = i === chunks.length - 1;
      await send(
        chatId,
        esc(chunks[i]) + (isLast ? `\n\n<i>${ag.emoji} ${ag.nome}</i>` : ''),
        isLast ? [[{ text: '🏠 Painel', callback_data: 'hub:main' }, { text: '🧹 Limpar', callback_data: 'hub:clear' }]] : null,
      );
    }
  } else {
    if (text.startsWith('/')) {
      const h = await handleUserCommand(chatId, text);
      if (h === null) return runSkill(chatId, text, null);
      return;
    }
    return runSkill(chatId, text, null);
  }
}

// ── Processador central de update (compartilhado por webhook e polling) ───
async function processUpdate(u) {
  if (u.callback_query) await handleCallback(u.callback_query);
  else if (u.message?.text) await handleMessage(u.message);
}

// ── MODO WEBHOOK ─────────────────────────────────────────────────────────
function startWebhookServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      // Health check
      if (req.method === 'GET' && req.url === '/bot/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, mode: 'webhook', bot: '@srver1bot' }));
        return;
      }

      // Endpoint do webhook
      if (req.method === 'POST' && req.url === '/bot/webhook') {
        // Validar secret token enviado pelo Telegram
        const secret = req.headers['x-telegram-bot-api-secret-token'];
        if (secret !== WEBHOOK_SECRET) {
          console.warn(`[Webhook] Token inválido recebido — possível requisição não-Telegram`);
          res.writeHead(403).end('Forbidden');
          return;
        }

        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
          // Responde 200 imediatamente (Telegram exige resposta rápida)
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end('{"ok":true}');
          try {
            const update = JSON.parse(body);
            await processUpdate(update);
          } catch (e) {
            console.error('[Webhook] Erro ao processar update:', e.message);
          }
        });
        return;
      }

      res.writeHead(404).end('Not found');
    });

    server.on('error', reject);
    server.listen(WEBHOOK_PORT, '127.0.0.1', () => resolve(server));
  });
}

// ── MODO POLLING ─────────────────────────────────────────────────────────
let _running = true;
let _offset  = 0;

async function pollingLoop() {
  while (_running) {
    try {
      const updates = await tg('getUpdates', {
        offset: _offset,
        timeout: 30,
        allowed_updates: ['message', 'callback_query'],
      });
      if (updates?.length) {
        for (const u of updates) {
          _offset = u.update_id + 1;
          try { await processUpdate(u); }
          catch (e) { console.error('[Poll] update error:', e.message); }
        }
      }
    } catch (e) {
      console.error('[Poll] error:', e.message);
      await new Promise(r => setTimeout(r, 5000));
    }
  }
}

// ── MAIN — Webhook-first, Polling-fallback ─────────────────────────────────
async function main() {
  // Limpa webhooks antigos antes de decidir o modo
  await tg('deleteWebhook', { drop_pending_updates: false });

  const me = await tg('getMe');
  if (!me) {
    console.error('[Bot] ❌ Falha ao conectar. Verifique o token.');
    process.exit(1);
  }

  console.log(`🔮 @${me.username} online — CentralDark Hub Unificado`);
  if (ADMIN_ID) console.log(`[Bot] ✅ Admin reconhecido: ${ADMIN_ID}`);
  else          console.warn('[Bot] ⚠️  ADMIN_CHAT_ID não definido. Envie /start para descobrir seu chat_id.');

  // ── Tentativa de Webhook ──
  if (WEBHOOK_URL) {
    console.log(`[Bot] 🔗 Tentando registrar webhook: ${WEBHOOK_URL}`);
    try {
      const ok = await tg('setWebhook', {
        url:              WEBHOOK_URL,
        secret_token:     WEBHOOK_SECRET,
        allowed_updates:  ['message', 'callback_query'],
        drop_pending_updates: false,
        max_connections:  40,
      });

      if (ok) {
        const server = await startWebhookServer();
        _botMode = 'webhook';
        console.log(`[Bot] ✅ MODO WEBHOOK ativo — porta ${WEBHOOK_PORT} · URL: ${WEBHOOK_URL}`);

        // Graceful shutdown
        const shutdown = () => { _running = false; server.close(); process.exit(0); };
        process.on('SIGTERM', shutdown);
        process.on('SIGINT',  shutdown);
        return; // sem polling loop
      }

      console.warn('[Bot] ⚠️  setWebhook retornou falha — ativando fallback polling');
    } catch (e) {
      console.warn(`[Bot] ⚠️  Webhook falhou (${e.message}) — ativando fallback polling`);
    }

    // Garante que nenhum webhook fica registrado antes do polling
    await tg('deleteWebhook', { drop_pending_updates: false });
  } else {
    console.log('[Bot] ℹ️  TELEGRAM_WEBHOOK_URL não definida — modo polling direto');
  }

  // ── Fallback / modo padrão: Polling ──
  _botMode = 'polling';
  console.log('[Bot] 🔄 MODO POLLING ativo');
  process.on('SIGTERM', () => { _running = false; });
  process.on('SIGINT',  () => { _running = false; });
  await pollingLoop();
}

main();
