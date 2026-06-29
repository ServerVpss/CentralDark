/**
 * Hub Central @srver1bot — CentralDark
 * Mesa de Operações com reconhecimento ADM, seletor de agentes e proxy LLM.
 *
 * Token:  SRVER1_BOT_TOKEN      (secrets/telegram-alerts.env)
 * Admin:  ADMIN_CHAT_ID         (secrets/telegram-alerts.env)
 * LLM:    ANTHROPIC_AUTH_TOKEN  (secrets/anthropic.env)
 *         ANTHROPIC_BASE_URL    (secrets/anthropic.env)
 * PM2:    CentralDark-HubBot    (hub.ecosystem.config.cjs)
 */

'use strict';
const fs = require('fs');

// ── Carregar .env ─────────────────────────────────────────────────────────
function loadEnv(p) {
  try {
    fs.readFileSync(p, 'utf-8').split('\n').forEach(line => {
      const m = line.trim().match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
      if (m && process.env[m[1]] === undefined)
        process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
    });
  } catch { /* arquivo ausente — ok */ }
}

loadEnv('/root/CentralDark/secrets/telegram-alerts.env');
loadEnv('/root/CentralDark/secrets/anthropic.env');
loadEnv('/root/CentralDark/secrets/agent.env');
loadEnv('/root/CentralDark/secrets/.env');

const TOKEN    = process.env.SRVER1_BOT_TOKEN || '';
const ADMIN_ID = Number(process.env.ADMIN_CHAT_ID || '0');
const LLM_BASE = (process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com').replace(/\/$/, '');
const LLM_KEY  = process.env.ANTHROPIC_AUTH_TOKEN || '';
const LLM_MODEL = process.env.LLM_MODEL || 'claude-sonnet-4-6';
const GH_TOKEN  = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
const MCP_PORT  = process.env.MCP_PORT || '9200';
const TG_API    = 'https://api.telegram.org';

if (!TOKEN) {
  console.error('[HubBot] SRVER1_BOT_TOKEN ausente. Adicione em secrets/telegram-alerts.env');
  process.exit(1);
}

// ── Sessão por chat (agente ativo + histórico) ────────────────────────────
const sessions = new Map();

function getSession(chatId) {
  if (!sessions.has(chatId)) sessions.set(chatId, { agent: 'guardiao', history: [] });
  return sessions.get(chatId);
}

// ── Definição dos agentes ─────────────────────────────────────────────────
const AGENTS = {
  guardiao: {
    emoji: '🛡️',
    nome: 'Guardião',
    prompt: 'Você é o Guardião do CentralDark — monitor e protetor do ecossistema. ' +
            'Responda sempre em PT-BR, de forma direta e profissional. ' +
            'Foque em segurança, monitoramento, alertas e saúde da infraestrutura. ' +
            'Seja objetivo e use formato claro.',
  },
  orquestrador: {
    emoji: '🧠',
    nome: 'Orquestrador',
    prompt: 'Você é o Orquestrador do CentralDark — coordenador de agentes e fluxos de trabalho. ' +
            'Responda sempre em PT-BR. ' +
            'Foque em planejamento, organização de tarefas, fluxo de Issues no GitHub ' +
            'e coordenação de equipes de IA. Seja estratégico e organizado.',
  },
  analista: {
    emoji: '🔍',
    nome: 'Analista',
    prompt: 'Você é o Analista do CentralDark — especialista em análise técnica e diagnóstico. ' +
            'Responda sempre em PT-BR. ' +
            'Foque em análise de problemas, debugging, revisão de código e propostas de solução. ' +
            'Seja técnico e preciso.',
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
    console.error(`[TG] ${method} erro: ${e.message}`);
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

// ── Painel ADM ────────────────────────────────────────────────────────────
function buildPanel(chatId) {
  const sess = getSession(chatId);
  const ag   = AGENTS[sess.agent];
  const ts   = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

  const text =
`<pre>┌──────────────────────────────────┐
│   🔮  HUB CENTRAL · CentralDark  │
└──────────────────────────────────┘

  STATUS   SISTEMA OPERACIONAL  ✅
  AGENTE   ${ag.emoji} ${ag.nome.padEnd(23)}
  HIST.    ${String(sess.history.length).padStart(2)} msgs no contexto

  ──────── Selecione agente ou ação ─

  ⏰ ${ts}</pre>`;

  const buttons = [
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
  ];

  return { text, buttons };
}

// ── Status VPS ────────────────────────────────────────────────────────────
async function getVPSStatus() {
  const checks = [
    { name: 'Webhook Deploy  ', url: 'http://localhost:9300/health' },
    { name: 'Contas Admin    ', url: 'http://localhost:9400/health' },
    { name: `MCP CentralDark `, url: `http://localhost:${MCP_PORT}/health` },
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

  (mostrando ${Math.min(issues.length, 10)} de ${issues.length})</pre>`;
  } catch (e) {
    return `<pre>❌ Erro: ${esc(e.message)}</pre>`;
  }
}

// ── LLM API ───────────────────────────────────────────────────────────────
function makeLLMUrl() {
  // Suporta BASE_URL com ou sem /v1 já incluído
  if (LLM_BASE.endsWith('/v1')) return `${LLM_BASE}/messages`;
  return `${LLM_BASE}/v1/messages`;
}

async function callLLM(history, systemPrompt) {
  if (!LLM_KEY) return '❌ ANTHROPIC_AUTH_TOKEN não configurado em secrets/anthropic.env.';
  try {
    const r = await fetch(makeLLMUrl(), {
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
        messages: history.slice(-20), // últimas 20 para manter contexto sem estourar tokens
      }),
    });
    const d = await r.json().catch(() => ({}));
    if (d.error) return `❌ API: ${d.error.message || JSON.stringify(d.error)}`;
    return d.content?.[0]?.text || '❌ Resposta vazia da API';
  } catch (e) {
    return `❌ Erro LLM: ${e.message}`;
  }
}

// ── Mensagem do usuário ───────────────────────────────────────────────────
async function handleMessage(chatId, text, fromId) {
  // Reconhecimento ADM
  if (ADMIN_ID && fromId !== ADMIN_ID) {
    return send(chatId, '🔒 Acesso restrito.');
  }

  // Primeiro uso sem ADMIN_ID configurado — modo bootstrap
  if (!ADMIN_ID) {
    console.log(`[HubBot] Mensagem recebida de chat_id=${chatId} (fromId=${fromId}). Defina ADMIN_CHAT_ID=${chatId} em secrets/telegram-alerts.env`);
    if (text.startsWith('/start')) {
      return send(chatId,
        `👋 Olá! Sou o Hub CentralDark.\n\n` +
        `Para me ativar como seu painel ADM, adicione ao arquivo:\n` +
        `<code>/root/CentralDark/secrets/telegram-alerts.env</code>\n\n` +
        `<code>ADMIN_CHAT_ID=${chatId}</code>\n\n` +
        `Depois reinicie:\n<code>pm2 restart CentralDark-HubBot</code>`
      );
    }
    return;
  }

  const sess = getSession(chatId);

  // Comandos
  if (text.startsWith('/')) {
    const cmd = text.split(' ')[0].toLowerCase();
    switch (cmd) {
      case '/start':
      case '/menu':
      case '/painel':
      case '/hub': {
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
      default:
        return send(chatId, '❓ /hub /status /issues /limpar /agente', [[{ text: '🔙 Painel', callback_data: 'hub:main' }]]);
    }
  }

  // Texto livre → rotear para agente selecionado via LLM
  const ag = AGENTS[sess.agent];
  sess.history.push({ role: 'user', content: text });
  await typing(chatId);

  const response = await callLLM(sess.history, ag.prompt);
  sess.history.push({ role: 'assistant', content: response });

  // Enviar (split se > 4000 chars)
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
}

// ── Callback de botão ─────────────────────────────────────────────────────
async function handleCallback(chatId, msgId, data, qId, fromId) {
  await tg('answerCallbackQuery', { callback_query_id: qId });
  if (ADMIN_ID && fromId !== ADMIN_ID) return;

  const sess = getSession(chatId);

  if (data === 'hub:main') {
    const p = buildPanel(chatId);
    return edit(chatId, msgId, p.text, p.buttons);
  }

  if (data.startsWith('hub:ag:')) {
    const key = data.slice(7);
    if (!AGENTS[key]) return;
    sess.agent   = key;
    sess.history = [];
    const ag = AGENTS[key];
    const p  = buildPanel(chatId);
    await edit(chatId, msgId, p.text, p.buttons);
    return send(chatId, `${ag.emoji} <b>${ag.nome}</b> selecionado. Histórico limpo — pode falar!`);
  }

  if (data === 'hub:status') {
    await tg('answerCallbackQuery', { callback_query_id: qId, text: 'Verificando...' });
    const s = await getVPSStatus();
    return edit(chatId, msgId, s, [[{ text: '🔙 Painel', callback_data: 'hub:main' }]]);
  }

  if (data === 'hub:issues') {
    await tg('answerCallbackQuery', { callback_query_id: qId, text: 'Buscando...' });
    const i = await getOpenIssues();
    return edit(chatId, msgId, i, [[{ text: '🔙 Painel', callback_data: 'hub:main' }]]);
  }

  if (data === 'hub:clear') {
    sess.history = [];
    const p = buildPanel(chatId);
    await edit(chatId, msgId, p.text, p.buttons);
    return send(chatId, '🧹 Histórico limpo!');
  }

  if (data === 'hub:config') {
    const ag = AGENTS[sess.agent];
    const text =
`<pre>┌────────────────────────────────┐
│  ⚙️   CONFIGURAÇÕES             │
└────────────────────────────────┘

  LLM API    ${LLM_KEY  ? '✅ Configurado' : '❌ ANTHROPIC_AUTH_TOKEN ausente'}
  GitHub     ${GH_TOKEN ? '✅ Configurado' : '⚠️  GITHUB_TOKEN ausente'}
  Admin ID   ${ADMIN_ID ? `✅ ${ADMIN_ID}` : '⚠️  ADMIN_CHAT_ID não definido'}
  Bot Token  ✅ Configurado (SRVER1_BOT_TOKEN)
  Modelo     ${LLM_MODEL}
  Agente     ${ag.emoji} ${ag.nome}
  Histórico  ${sess.history.length} msgs</pre>`;
    return edit(chatId, msgId, text, [[{ text: '🔙 Painel', callback_data: 'hub:main' }]]);
  }
}

// ── Poll loop ─────────────────────────────────────────────────────────────
let offset  = 0;
let running = true;

async function poll() {
  try {
    const updates = await tg('getUpdates', {
      offset,
      timeout: 30,
      allowed_updates: ['message', 'callback_query'],
    });
    if (!updates?.length) return;
    for (const u of updates) {
      offset = u.update_id + 1;
      try {
        if (u.callback_query) {
          const cq = u.callback_query;
          await handleCallback(
            cq.message?.chat?.id, cq.message?.message_id,
            cq.data, cq.id, cq.from?.id,
          );
        } else if (u.message?.text) {
          const m = u.message;
          if (m.from?.is_bot) continue;
          if (m.sender_chat?.type === 'channel') continue;
          await handleMessage(m.chat.id, m.text, m.from?.id);
        }
      } catch (e) {
        console.error('[Hub] update error:', e.message);
      }
    }
  } catch (e) {
    console.error('[Hub] poll error:', e.message);
    await new Promise(r => setTimeout(r, 5000));
  }
}

async function main() {
  await tg('deleteWebhook');
  const me = await tg('getMe');
  if (!me) {
    console.error('[HubBot] Falha ao conectar. Verifique SRVER1_BOT_TOKEN.');
    process.exit(1);
  }
  console.log(`🔮 Hub @${me.username} online`);
  if (!ADMIN_ID) {
    console.warn('[HubBot] ⚠️  ADMIN_CHAT_ID não definido — envie /start para o bot para descobrir seu chat_id.');
  } else {
    console.log(`[HubBot] Admin: ${ADMIN_ID}`);
  }
  while (running) await poll();
}

process.on('SIGTERM', () => { running = false; });
process.on('SIGINT',  () => { running = false; });

main();
