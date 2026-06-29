/**
 * CentralDark — Bot Unificado @srver1bot  v2 — Cockpit Operacional
 *
 * Arquitetura dual-mode (Webhook-first, Polling-fallback):
 *   1. Se TELEGRAM_WEBHOOK_URL estiver definido → webhook via HTTPS/Caddy.
 *   2. Fallback → polling clássico.
 *
 * Admin (ADMIN_CHAT_ID) → Hub ADM + Agentes LLM + Ferramentas + Cognição + Relatório
 * Outros                → Skills system (consciousness)
 *
 * Token:        SRVER1_BOT_TOKEN || TELEGRAM_BOT_TOKEN || GUARDA_TELEGRAM_BOT_TOKEN
 * Webhook URL:  TELEGRAM_WEBHOOK_URL   (ex: https://status.centralldark.com/bot/webhook)
 * Webhook Port: BOT_WEBHOOK_PORT       (padrão: 9500)
 * PM2:          CentralDark-HubBot  (hub.ecosystem.config.cjs)
 */

'use strict';

const http             = require('http');
const crypto           = require('crypto');
const fs               = require('fs');
const path             = require('path');
const { execSync }     = require('child_process');

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

// ── Configuração ───────────────────────────────────────────────────────────
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

// Secret derivado do token — estável entre restarts
const WEBHOOK_SECRET = process.env.BOT_WEBHOOK_SECRET
  || crypto.createHash('sha256').update(TOKEN + 'centraldark').digest('hex').slice(0, 32);

if (!TOKEN) {
  console.error('[Bot] ❌ TOKEN ausente. Configure SRVER1_BOT_TOKEN em secrets/telegram-alerts.env');
  process.exit(1);
}

// ── Skills system ──────────────────────────────────────────────────────────
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
  consciousness.enable();
  skillsOk = true;
  console.log('[Bot] ✅ Skills system carregado.');
} catch (e) {
  console.warn('[Bot] ⚠️  Skills system indisponível:', e.message);
}

// ── Sessões ────────────────────────────────────────────────────────────────
const sessions      = new Map();
const inactivityMap = new Map();
const INACTIVITY_MS = 30 * 60 * 1000;

function saveSessionSnapshot(chatId) {
  if (!skillsOk || !memory) return;
  const sess = sessions.get(chatId);
  if (!sess || sess.history.length === 0) return;
  memory.save({
    type:      'session',
    chatId,
    agent:     sess.agent,
    cogMode:   sess.cogOverride || null,
    msgCount:  sess.history.length,
    lastMsg:   (sess.history[sess.history.length - 1]?.content || '').slice(0, 120),
    timestamp: Date.now(),
  });
}

function resetInactivityTimer(chatId) {
  if (inactivityMap.has(chatId)) clearTimeout(inactivityMap.get(chatId));
  const t = setTimeout(() => {
    saveSessionSnapshot(chatId);
    inactivityMap.delete(chatId);
  }, INACTIVITY_MS);
  inactivityMap.set(chatId, t);
}

function getSession(chatId) {
  if (!sessions.has(chatId))
    sessions.set(chatId, { agent: 'guardiao', history: [], cogOverride: null });
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

// ── Modos Cognitivos ───────────────────────────────────────────────────────
const COG_MODES = {
  sistema2: {
    emoji: '🔬', nome: 'Sistema 2',
    desc: 'Raciocínio lento e deliberado — cada etapa explícita.',
    prompt: 'Você opera no modo Sistema 2: raciocínio lento e explícito. ' +
            'Antes de responder, escreva cada etapa numerada do seu pensamento. ' +
            'Nunca pule para conclusão sem mostrar o caminho. Responda em PT-BR.',
  },
  cot: {
    emoji: '🔗', nome: 'Chain of Thought',
    desc: 'Pensa passo a passo antes de responder.',
    prompt: 'Você usa Chain of Thought. Formato obrigatório: ' +
            'Passo 1: ... Passo 2: ... Conclusão: ... ' +
            'Cada passo deve ser explícito e verificável. Responda em PT-BR.',
  },
  react: {
    emoji: '⚛️',  nome: 'ReAct',
    desc: 'Age → observa → raciocina → age de novo.',
    prompt: 'Você usa ReAct. Formato: ' +
            'Pensamento: ... Ação: ... Observação: ... (repita) Resposta Final: ... ' +
            'Explicite cada ciclo antes de concluir. Responda em PT-BR.',
  },
  reflexao: {
    emoji: '🪞', nome: 'Auto-Crítica',
    desc: 'Gera → critica → refina. Dupla checagem interna.',
    prompt: 'Você usa auto-crítica reflexiva. Formato obrigatório: ' +
            '🔷 RASCUNHO: (resposta inicial) ' +
            '🔶 CRÍTICA: (aponte falhas e lacunas) ' +
            '✅ RESPOSTA FINAL: (versão refinada) ' +
            'Responda em PT-BR.',
  },
};

// ── Telegram helpers ───────────────────────────────────────────────────────
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

// ── Filtro ─────────────────────────────────────────────────────────────────
function shouldIgnore(msg) {
  if (!msg) return true;
  if (msg.from?.is_bot) return true;
  if (msg.sender_chat?.type === 'channel') return true;
  if (msg.forward_from_chat?.type === 'channel') return true;
  if (msg.is_automatic_forward) return true;
  const t    = msg.chat?.type;
  const text = msg.text || msg.caption || '';
  if ((t === 'group' || t === 'supergroup') && !text.startsWith('/') && !msg.photo) return true;
  return false;
}

// ── Animate progress (edits sequenciais em checkpoints reais) ─────────────
async function animateProgress(chatId, label) {
  const msg = await send(chatId, `<code>⏳ ${esc(label)}...</code>`);
  if (!msg) return { step: async () => {}, done: async (t, b) => send(chatId, t, b) };
  return {
    step: (s) => tg('editMessageText', {
      chat_id: chatId, message_id: msg.message_id,
      text: `<code>${esc(s)}</code>`, parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
    done: (text, buttons) => edit(chatId, msg.message_id, text, buttons),
  };
}

// ── execSafe ───────────────────────────────────────────────────────────────
function execSafe(cmd) {
  try { return execSync(cmd, { timeout: 5000, encoding: 'utf-8' }).trim(); }
  catch { return ''; }
}

// ── Painel ADM ─────────────────────────────────────────────────────────────
let _botMode = 'iniciando';

function buildPanel(chatId) {
  const sess = getSession(chatId);
  const ag   = AGENTS[sess.agent];
  const cog  = sess.cogOverride ? COG_MODES[sess.cogOverride] : null;
  const ts   = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

  const modeTag = _botMode === 'webhook'
    ? '🔗 WEBHOOK ativo          '
    : '🔄 POLLING ativo          ';

  const cogLine = cog
    ? `  COG      ${cog.emoji} ${cog.nome.padEnd(21)}\n`
    : '';

  const text =
`<pre>┌──────────────────────────────────┐
│   🔮  HUB CENTRAL · CentralDark  │
└──────────────────────────────────┘

  STATUS   SISTEMA OPERACIONAL  ✅
  MODO     ${modeTag}
  AGENTE   ${ag.emoji} ${ag.nome.padEnd(23)}
${cogLine}  HIST.    ${String(sess.history.length).padStart(2)} msgs no contexto
  SKILLS   ${skillsOk ? '✅ disponíveis       ' : '⚠️  indisponível     '}

  ─── Selecione agente ou ferramenta ──

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
        { text: '🛠️ Ferramentas',  callback_data: 'hub:tools' },
        { text: '🧬 Cognição',     callback_data: 'hub:cog' },
      ],
      [
        { text: '📊 Relatório',    callback_data: 'hub:relatorio' },
        { text: '⚙️ Config',       callback_data: 'hub:config' },
      ],
      [
        { text: '🧹 Limpar Hist.', callback_data: 'hub:clear' },
      ],
    ],
  };
}

// ── Status VPS (endpoints internos) ───────────────────────────────────────
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

// ── Diagnóstico VPS (CPU / RAM / OOM) ─────────────────────────────────────
async function getDiagVPS() {
  const cpuRaw = execSafe("ps aux --sort=-%cpu --no-header | awk 'NR<=4{printf \"  %-22s %s%%\\n\",$11,$3}'");
  const memRaw = execSafe("free -h --si 2>/dev/null | awk '/^Mem:/{print $2\" total | \"$3\" usado | \"$7\" livre\"}'");
  const oom    = execSafe("grep -c 'oom-kill' /var/log/kern.log 2>/dev/null || echo '0'") || '0';
  const upRaw  = execSafe('uptime -p');
  const ts     = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

  return `<pre>┌────────────────────────────────┐
│  🩺  DIAGNÓSTICO VPS           │
└────────────────────────────────┘

  🖥️  CPU — Top 4 processos:
${cpuRaw || '  (não disponível)'}

  💾  RAM: ${memRaw || '(não disponível)'}
  💀  OOM (kern.log): ${oom.trim()} eventos
  ⏱️  Uptime: ${upRaw || '(não disponível)'}

  ⏰ ${ts}</pre>`;
}

// ── PM2 Status ─────────────────────────────────────────────────────────────
async function getPM2Status() {
  const raw = execSafe('pm2 jlist 2>/dev/null');
  let lines = [];
  try {
    const procs = JSON.parse(raw || '[]');
    lines = procs.map(p => {
      const s    = p.pm2_env?.status || '?';
      const icon = s === 'online' ? '✅' : (s === 'stopped' ? '⬜' : '❌');
      return `  ${icon} ${(p.name || '?').slice(0, 26).padEnd(26)} ${s}`;
    });
  } catch {
    lines = ['  ⚠️  pm2 jlist indisponível'];
  }
  const ts    = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  const count = lines.length;
  return `<pre>┌────────────────────────────────┐
│  ⚡  PM2 STATUS (${String(count).padStart(2)} processos)  │
└────────────────────────────────┘

${lines.join('\n') || '  (nenhum processo)'}

  ⏰ ${ts}</pre>`;
}

// ── Logs de Erro ───────────────────────────────────────────────────────────
async function getLogsErro() {
  const raw     = execSafe('tail -20 /var/log/centraldark-hub-error.log 2>/dev/null');
  const content = raw ? esc(raw.slice(0, 1500)) : '(sem entradas no log de erro)';
  const ts      = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  return `<pre>┌────────────────────────────────┐
│  📜  LOGS DE ERRO (últimas 20) │
└────────────────────────────────┘

${content}

  ⏰ ${ts}</pre>`;
}

// ── Webhook Info ───────────────────────────────────────────────────────────
async function getWebhookInfo() {
  const info = await tg('getWebhookInfo', {});
  const ts   = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  if (!info) return `<pre>❌ getWebhookInfo falhou\n\n  ⏰ ${ts}</pre>`;
  const errMsg = info.last_error_message
    ? esc(info.last_error_message.slice(0, 44))
    : '✅ sem erros';
  return `<pre>┌────────────────────────────────┐
│  🔗  WEBHOOK INFO              │
└────────────────────────────────┘

  URL      ${esc((info.url || '(nenhuma)').slice(0, 40))}
  Pendente ${info.pending_update_count || 0} updates
  Último   ${errMsg}
  Conexões ${info.max_connections || '-'}

  ⏰ ${ts}</pre>`;
}

// ── Pendências ─────────────────────────────────────────────────────────────
async function getPendencias() {
  const candidates = [
    '/root/CentralDark/docs/CONSCIENCIA/06-PENDENCIAS-E-HORARIO.md',
    '/root/CentralDark/docs/CONSCIENCIA/PENDENCIAS-E-HORARIO.md',
    '/root/CentralDark/docs/CONSCIENCIA/PENDENCIAS.md',
  ];
  let content = '  ⚠️  Arquivo de pendências não encontrado';
  for (const p of candidates) {
    try {
      const raw   = fs.readFileSync(p, 'utf-8');
      const lines = raw.split('\n')
        .filter(l => /\[\s\]/.test(l))
        .slice(0, 12)
        .map(l => '  ' + l.replace(/^\s*[-*]\s*/, '').trim().slice(0, 46));
      content = lines.length ? lines.join('\n') : '  ✅ Nenhuma pendência aberta encontrada';
      break;
    } catch { continue; }
  }
  const ts = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  return `<pre>┌────────────────────────────────┐
│  📝  PENDÊNCIAS ABERTAS [ ]    │
└────────────────────────────────┘

${content}

  ⏰ ${ts}</pre>`;
}

// ── Textos de menu ─────────────────────────────────────────────────────────
function buildFerramentasText() {
  return `<pre>┌────────────────────────────────┐
│  🛠️  FERRAMENTAS               │
└────────────────────────────────┘

  ⚡ PM2 Status      — processos ativos
  🩺 Diagnóstico     — CPU, RAM, OOM
  📋 Issues          — GitHub abertos
  📝 Pendências      — itens em aberto
  📜 Logs de Erro    — últimas 20 linhas
  🔗 Webhook Info    — registro Telegram

  Selecione uma ferramenta abaixo.</pre>`;
}

function buildCognicaoText(currentKey) {
  const lines = Object.entries(COG_MODES).map(([k, m]) => {
    const active = currentKey === k ? ' ← ATIVO' : '';
    return `  ${m.emoji} ${m.nome.padEnd(17)}${m.desc.slice(0, 28)}${active}`;
  });
  return `<pre>┌────────────────────────────────┐
│  🧬  MODO COGNITIVO            │
└────────────────────────────────┘

${lines.join('\n')}

  Selecione para aplicar na sessão.
  Persiste até resetar ou trocar.</pre>`;
}

// ── Issues GitHub ──────────────────────────────────────────────────────────
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

// ── Relatório Geral (3 blocos animados) ───────────────────────────────────
async function getRelatorioGeral(chatId) {
  const anim = await animateProgress(chatId, '📊 Coletando dados VPS');
  await anim.step('⚙️  Verificando processos PM2...');
  const pm2Block  = await getPM2Status();
  await anim.step('💾  Checando memória e CPU...');
  const diagBlock = await getDiagVPS();
  await anim.step('📝  Lendo pendências...');
  const pendBlock = await getPendencias();
  await anim.done(
    '<code>✅ Relatório completo — 3 blocos abaixo</code>',
    [[{ text: '🔙 Painel', callback_data: 'hub:main' }]],
  );
  await send(chatId, pendBlock);
  await send(chatId, diagBlock);
  return send(chatId, pm2Block);
}

// ── Download de foto do Telegram ───────────────────────────────────────────
async function downloadTelegramPhoto(msg) {
  try {
    const photos  = msg.photo;
    if (!photos?.length) return null;
    const largest  = photos[photos.length - 1];
    const fileInfo = await tg('getFile', { file_id: largest.file_id });
    if (!fileInfo?.file_path) return null;
    const fileUrl  = `https://api.telegram.org/file/bot${TOKEN}/${fileInfo.file_path}`;
    const res      = await fetch(fileUrl);
    const buf      = await res.arrayBuffer();
    const base64   = Buffer.from(buf).toString('base64');
    const ext      = fileInfo.file_path.split('.').pop().toLowerCase();
    const mediaType = ext === 'png' ? 'image/png'
                    : ext === 'gif' ? 'image/gif'
                    : ext === 'webp' ? 'image/webp'
                    : 'image/jpeg';
    return { base64, mediaType };
  } catch (e) {
    console.error('[Vision] download erro:', e.message);
    return null;
  }
}

// ── LLM com visão (Anthropic Vision) ──────────────────────────────────────
async function callLLMWithVision(history, systemPrompt, imageData, caption) {
  if (!LLM_KEY) return '❌ ANTHROPIC_AUTH_TOKEN não configurado.';
  const url = LLM_BASE.endsWith('/v1') ? `${LLM_BASE}/messages` : `${LLM_BASE}/v1/messages`;
  const userContent = [
    { type: 'image', source: { type: 'base64', media_type: imageData.mediaType, data: imageData.base64 } },
    { type: 'text', text: caption || 'O que você vê nessa imagem? Descreva e analise em PT-BR.' },
  ];
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
        messages: [...history.slice(-18), { role: 'user', content: userContent }],
      }),
    });
    const d = await r.json().catch(() => ({}));
    if (d.error) return `❌ API Vision: ${d.error.message || JSON.stringify(d.error)}`;
    return d.content?.[0]?.text || '❌ Resposta vazia';
  } catch (e) {
    return `❌ LLM Vision: ${e.message}`;
  }
}

// ── LLM (Anthropic) ────────────────────────────────────────────────────────
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

// ── Skills helpers ─────────────────────────────────────────────────────────
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
    if (res.topic)     p.push(`\n📝 ${esc(res.topic)}`);
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

// ── Comandos Admin ─────────────────────────────────────────────────────────
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
    case '/ferramentas': case '/tools': {
      return send(chatId, buildFerramentasText(), [
        [{ text: '⚡ PM2', callback_data: 'hub:t:pm2' }, { text: '🩺 Diagnóstico', callback_data: 'hub:t:diag' }],
        [{ text: '📋 Issues', callback_data: 'hub:t:issues' }, { text: '📝 Pendências', callback_data: 'hub:t:pendencias' }],
        [{ text: '📜 Logs', callback_data: 'hub:t:logs' }, { text: '🔗 Webhook', callback_data: 'hub:t:webhook' }],
        [{ text: '🔙 Painel', callback_data: 'hub:main' }],
      ]);
    }
    case '/cognicao': case '/cog': {
      return send(chatId, buildCognicaoText(sess.cogOverride), [
        ...Object.keys(COG_MODES).map(k => [{
          text: (sess.cogOverride === k ? '✅ ' : '') + COG_MODES[k].emoji + ' ' + COG_MODES[k].nome,
          callback_data: 'hub:cog:' + k,
        }]),
        [{ text: '⬜ Modo Padrão', callback_data: 'hub:cog:reset' }, { text: '🔙 Painel', callback_data: 'hub:main' }],
      ]);
    }
    case '/relatorio': {
      return getRelatorioGeral(chatId);
    }
    case '/limpar': {
      saveSessionSnapshot(chatId);
      if (inactivityMap.has(chatId)) { clearTimeout(inactivityMap.get(chatId)); inactivityMap.delete(chatId); }
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
        '❓ <b>Hub ADM:</b>\n' +
        '/hub /status /issues /limpar /agente\n' +
        '/ferramentas /cognicao /relatorio\n\n' +
        '<b>Skills:</b> /skills /mode /use /memory\n\n' +
        '💬 Texto livre → agente LLM ativo'
      );
    default: return null;
  }
}

// ── Comandos usuário comum ─────────────────────────────────────────────────
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

// ── Handler de callbacks ───────────────────────────────────────────────────
async function handleCallback(cq) {
  const chatId = cq.message?.chat?.id;
  const msgId  = cq.message?.message_id;
  const fromId = cq.from?.id;
  const data   = cq.data || '';
  const qId    = cq.id;

  await tg('answerCallbackQuery', { callback_query_id: qId });

  const isAdmin = ADMIN_ID && fromId === ADMIN_ID;

  if (isAdmin) {
    // ── Painel principal
    if (data === 'hub:main') {
      const p = buildPanel(chatId);
      return edit(chatId, msgId, p.text, p.buttons);
    }

    // ── Seleção de agente
    if (data.startsWith('hub:ag:')) {
      const key = data.slice(7);
      if (!AGENTS[key]) return;
      const sess   = getSession(chatId);
      sess.agent   = key;
      sess.history = [];
      const p  = buildPanel(chatId);
      const ag = AGENTS[key];
      await edit(chatId, msgId, p.text, p.buttons);
      return send(chatId, `${ag.emoji} <b>${ag.nome}</b> selecionado. Histórico limpo!`);
    }

    // ── Status (legado — mantido para retrocompat.)
    if (data === 'hub:status') {
      return edit(chatId, msgId, await getVPSStatus(), [[{ text: '🔙 Painel', callback_data: 'hub:main' }]]);
    }

    // ── Issues (legado + via ferramentas)
    if (data === 'hub:issues' || data === 'hub:t:issues') {
      const res  = await getOpenIssues();
      const back = data === 'hub:t:issues'
        ? [[{ text: '🔙 Ferramentas', callback_data: 'hub:tools' }]]
        : [[{ text: '🔙 Painel',      callback_data: 'hub:main' }]];
      return edit(chatId, msgId, res, back);
    }

    // ── Limpar histórico
    if (data === 'hub:clear') {
      const sess = getSession(chatId);
      saveSessionSnapshot(chatId);
      if (inactivityMap.has(chatId)) { clearTimeout(inactivityMap.get(chatId)); inactivityMap.delete(chatId); }
      sess.history = [];
      const p = buildPanel(chatId);
      await edit(chatId, msgId, p.text, p.buttons);
      return send(chatId, '🧹 Histórico limpo!');
    }

    // ── Config
    if (data === 'hub:config') {
      const sess = getSession(chatId);
      const ag   = AGENTS[sess.agent];
      const cog  = sess.cogOverride ? COG_MODES[sess.cogOverride] : null;
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
  Cognição   ${cog ? cog.emoji + ' ' + cog.nome : '⬜ Padrão'}
  Histórico  ${sess.history.length} msgs
  Skills     ${skillsOk ? '✅ online' : '⚠️  offline'}
  Webhook    ${WEBHOOK_URL || '— (polling ativo)'}
</pre>`,
        [[{ text: '🔙 Painel', callback_data: 'hub:main' }]]);
    }

    // ── Ferramentas: menu
    if (data === 'hub:tools') {
      return edit(chatId, msgId, buildFerramentasText(), [
        [{ text: '⚡ PM2',      callback_data: 'hub:t:pm2' }, { text: '🩺 Diagnóstico', callback_data: 'hub:t:diag' }],
        [{ text: '📋 Issues',   callback_data: 'hub:t:issues' }, { text: '📝 Pendências', callback_data: 'hub:t:pendencias' }],
        [{ text: '📜 Logs',     callback_data: 'hub:t:logs' }, { text: '🔗 Webhook', callback_data: 'hub:t:webhook' }],
        [{ text: '🔙 Painel',   callback_data: 'hub:main' }],
      ]);
    }

    // ── Ferramentas: itens individuais com animação
    if (data === 'hub:t:pm2') {
      const anim = await animateProgress(chatId, '⚡ Coletando status PM2');
      const res  = await getPM2Status();
      return anim.done(res, [[{ text: '🔙 Ferramentas', callback_data: 'hub:tools' }]]);
    }
    if (data === 'hub:t:diag') {
      const anim = await animateProgress(chatId, '🩺 Diagnóstico VPS');
      await anim.step('💾 Lendo CPU e memória...');
      const res  = await getDiagVPS();
      return anim.done(res, [[{ text: '🔙 Ferramentas', callback_data: 'hub:tools' }]]);
    }
    if (data === 'hub:t:pendencias') {
      const anim = await animateProgress(chatId, '📝 Lendo pendências');
      const res  = await getPendencias();
      return anim.done(res, [[{ text: '🔙 Ferramentas', callback_data: 'hub:tools' }]]);
    }
    if (data === 'hub:t:logs') {
      const anim = await animateProgress(chatId, '📜 Lendo logs de erro');
      const res  = await getLogsErro();
      return anim.done(res, [[{ text: '🔙 Ferramentas', callback_data: 'hub:tools' }]]);
    }
    if (data === 'hub:t:webhook') {
      const anim = await animateProgress(chatId, '🔗 Consultando Telegram');
      const res  = await getWebhookInfo();
      return anim.done(res, [[{ text: '🔙 Ferramentas', callback_data: 'hub:tools' }]]);
    }

    // ── Cognição: menu
    if (data === 'hub:cog') {
      const sess = getSession(chatId);
      return edit(chatId, msgId, buildCognicaoText(sess.cogOverride), [
        ...Object.keys(COG_MODES).map(k => [{
          text: (sess.cogOverride === k ? '✅ ' : '') + COG_MODES[k].emoji + ' ' + COG_MODES[k].nome,
          callback_data: 'hub:cog:' + k,
        }]),
        [{ text: '⬜ Modo Padrão', callback_data: 'hub:cog:reset' }, { text: '🔙 Painel', callback_data: 'hub:main' }],
      ]);
    }

    // ── Cognição: seleção de modo
    if (data.startsWith('hub:cog:')) {
      const key  = data.slice(8);
      const sess = getSession(chatId);
      if (key === 'reset') {
        sess.cogOverride = null;
        const p = buildPanel(chatId);
        await edit(chatId, msgId, p.text, p.buttons);
        return send(chatId, '⬜ Modo cognitivo resetado para padrão do agente.');
      }
      if (!COG_MODES[key]) return;
      sess.cogOverride = key;
      const mode = COG_MODES[key];
      const p = buildPanel(chatId);
      await edit(chatId, msgId, p.text, p.buttons);
      return send(chatId,
        `${mode.emoji} <b>${mode.nome}</b> ativado.\n\n<i>${mode.desc}</i>\n\nPróximas respostas usarão este modo cognitivo.`,
      );
    }

    // ── Relatório Geral
    if (data === 'hub:relatorio') {
      return getRelatorioGeral(chatId);
    }

    // ── Panel skills / mode callbacks
    if (data.startsWith('panel:') && panel) {
      const result = await panel.handlePanelCallback(data.slice(6), tg, chatId, msgId);
      if (result) return edit(chatId, msgId, result.text, result.buttons);
    }
    if (data.startsWith('c:')) return handleAdminCommand(chatId, '/' + data.slice(2));
    if (data === 'm:auto')   { if (skillsOk) consciousness.enable();  return edit(chatId, msgId, '🧠 <b>AUTO ✅</b>', [[{ text: '🔙', callback_data: 'hub:main' }]]); }
    if (data === 'm:manual') { if (skillsOk) consciousness.disable(); return edit(chatId, msgId, '🎯 <b>MANUAL</b>',  [[{ text: '🔙', callback_data: 'hub:main' }]]); }
    return;
  }

  // ── Usuário comum
  if (!skillsOk) return;
  if (data.startsWith('panel:') && panel) {
    const result = await panel.handlePanelCallback(data.slice(6), tg, chatId, msgId);
    if (result) return edit(chatId, msgId, result.text, result.buttons);
  }
  if (data.startsWith('c:')) return handleUserCommand(chatId, '/' + data.slice(2));
  if (data === 'm:auto')   { consciousness.enable();  return edit(chatId, msgId, '🧠 AUTO ✅', [[{ text: '🔙', callback_data: 'c:start' }]]); }
  if (data === 'm:manual') { consciousness.disable(); return edit(chatId, msgId, '🎯 MANUAL',  [[{ text: '🔙', callback_data: 'c:start' }]]); }
}

// ── Handler de mensagens ───────────────────────────────────────────────────
async function handleMessage(msg) {
  if (shouldIgnore(msg)) return;

  const chatId  = msg.chat.id;
  const fromId  = msg.from?.id;
  const text    = msg.text || msg.caption || '';
  const isAdmin = ADMIN_ID && fromId === ADMIN_ID;

  // ── Foto recebida (vision) ──
  if (msg.photo) {
    if (!isAdmin) return; // non-admin: ignora foto silenciosamente
    const sess   = getSession(chatId);
    const ag     = AGENTS[sess.agent];
    const cog    = sess.cogOverride ? COG_MODES[sess.cogOverride] : null;
    const prompt = cog ? `${ag.prompt}\n\n---\n[MODO: ${cog.nome}]\n${cog.prompt}` : ag.prompt;
    await typing(chatId);
    const anim = await animateProgress(chatId, '📷 Analisando imagem via Vision');
    const imgData = await downloadTelegramPhoto(msg);
    if (!imgData) return anim.done('<code>❌ Não consegui baixar a imagem do Telegram.</code>', [[{ text: '🔙 Painel', callback_data: 'hub:main' }]]);
    const histEntry = { role: 'user', content: text ? `[IMAGEM + legenda: "${text}"]` : '[IMAGEM sem legenda]' };
    const response  = await callLLMWithVision(sess.history, prompt, imgData, text);
    sess.history.push(histEntry);
    sess.history.push({ role: 'assistant', content: response });
    const label = cog ? `📷 Vision · ${cog.emoji} ${cog.nome} · ${ag.emoji} ${ag.nome}` : `📷 Vision · ${ag.emoji} ${ag.nome}`;
    return anim.done(
      esc(response.slice(0, 4000)) + `\n\n<i>${label}</i>`,
      [[{ text: '🏠 Painel', callback_data: 'hub:main' }, { text: '🧹 Limpar', callback_data: 'hub:clear' }]],
    );
  }

  // ── Tipo não suportado (áudio, vídeo, documento, figurinha...) ──
  if (!text) {
    if (isAdmin) return send(chatId, '⚠️ Tipo de mensagem não suportado.\n\n✅ Suportados: texto e fotos (com ou sem legenda).\n📝 Descreva em texto o que precisa.');
    return;
  }

  if (!ADMIN_ID) {
    console.log(`[Bot] mensagem de chatId=${chatId} — configure ADMIN_CHAT_ID=${chatId}`);
    if (text.startsWith('/start')) {
      return send(chatId,
        '👋 Olá! Sou o Hub CentralDark.\n\n' +
        'Para ativar o painel ADM, adicione em\n' +
        '<code>/root/CentralDark/secrets/telegram-alerts.env</code>:\n\n' +
        `<code>ADMIN_CHAT_ID=${chatId}</code>\n\n` +
        'Depois: <code>pm2 restart CentralDark-HubBot</code>',
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

    // Injeta modo cognitivo quando ativo
    const cog          = sess.cogOverride ? COG_MODES[sess.cogOverride] : null;
    const systemPrompt = cog
      ? `${ag.prompt}\n\n---\n[MODO COGNITIVO ATIVO: ${cog.nome}]\n${cog.prompt}`
      : ag.prompt;

    sess.history.push({ role: 'user', content: text });
    await typing(chatId);

    let skillContext = '';
    if (skillsOk) {
      try {
        const intent = await consciousness.think(text);

        // Mensagem copiada — perguntar ao usuário o que fazer
        if (intent?.type === 'clarify') {
          await send(chatId, intent.message, null);
          return;
        }

        // Skill executada com sucesso — responder direto e adicionar contexto
        if (intent?.type === 'automatic' && intent.skill && intent.response?.ok) {
          const r = intent.response.result || intent.response || {};
          const snippet = r.note || r.topic || r.message || '';
          if (snippet) skillContext = `\n\n[Contexto de skill "${intent.skill}": ${String(snippet).slice(0, 300)}]`;

          // Se foi obsidian-writer, confirmar pro usuário antes de chamar o LLM
          if (intent.skill === 'obsidian-writer' && r.message) {
            await send(chatId, `✅ <b>Gravado no cérebro!</b>\n\n<pre>${r.message}</pre>\n\n📲 Aparece no Obsidian em ≤10 min.`, null);
            return;
          }
        }
      } catch (_) {}
    }

    const finalPrompt = skillContext ? systemPrompt + skillContext : systemPrompt;
    const response = await callLLM(sess.history, finalPrompt);
    sess.history.push({ role: 'assistant', content: response });
    resetInactivityTimer(chatId);

    const chunks = [];
    for (let i = 0; i < response.length; i += 4000) chunks.push(response.slice(i, i + 4000));
    for (let i = 0; i < chunks.length; i++) {
      const isLast = i === chunks.length - 1;
      const label  = cog
        ? `${cog.emoji} ${cog.nome} · ${ag.emoji} ${ag.nome}`
        : `${ag.emoji} ${ag.nome}`;
      await send(
        chatId,
        esc(chunks[i]) + (isLast ? `\n\n<i>${label}</i>` : ''),
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

// ── Processador central de update ──────────────────────────────────────────
async function processUpdate(u) {
  if (u.callback_query) await handleCallback(u.callback_query);
  else if (u.message) await handleMessage(u.message);
}

// ── MODO WEBHOOK ───────────────────────────────────────────────────────────
function startWebhookServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      if (req.method === 'GET' && req.url === '/bot/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, mode: 'webhook', bot: '@srver1bot' }));
        return;
      }
      if (req.method === 'POST' && req.url === '/bot/webhook') {
        const secret = req.headers['x-telegram-bot-api-secret-token'];
        if (secret !== WEBHOOK_SECRET) {
          console.warn('[Webhook] Token inválido — possível requisição não-Telegram');
          res.writeHead(403).end('Forbidden');
          return;
        }
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
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

// ── MODO POLLING ───────────────────────────────────────────────────────────
let _running = true;
let _offset  = 0;

async function pollingLoop() {
  while (_running) {
    try {
      const updates = await tg('getUpdates', {
        offset: _offset, timeout: 30,
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

// ── MAIN ───────────────────────────────────────────────────────────────────
async function main() {
  await tg('deleteWebhook', { drop_pending_updates: false });

  const me = await tg('getMe');
  if (!me) {
    console.error('[Bot] ❌ Falha ao conectar. Verifique o token.');
    process.exit(1);
  }

  console.log(`🔮 @${me.username} online — CentralDark Hub Unificado v2 (Cockpit)`);
  if (ADMIN_ID) console.log(`[Bot] ✅ Admin reconhecido: ${ADMIN_ID}`);
  else          console.warn('[Bot] ⚠️  ADMIN_CHAT_ID não definido. Envie /start para descobrir seu chat_id.');

  if (skillsOk && memory) {
    try {
      const saved = memory.getAll().filter(r => r.type === 'session');
      if (saved.length) {
        const latest = {};
        for (const r of saved) {
          if (!latest[r.chatId] || r.timestamp > latest[r.chatId].timestamp) latest[r.chatId] = r;
        }
        let restored = 0;
        for (const [cid, snap] of Object.entries(latest)) {
          const numId = Number(cid);
          if (!numId) continue;
          const sess = getSession(numId);
          if (snap.agent && AGENTS[snap.agent]) sess.agent = snap.agent;
          if (snap.cogMode && COG_MODES[snap.cogMode]) sess.cogOverride = snap.cogMode;
          restored++;
        }
        if (restored) console.log(`[Bot] 🧠 ${restored} sessão(ões) restaurada(s) da memória persistente.`);
      }
    } catch (e) {
      console.warn('[Bot] ⚠️  Falha ao restaurar sessões:', e.message);
    }
  }

  if (WEBHOOK_URL) {
    console.log(`[Bot] 🔗 Tentando registrar webhook: ${WEBHOOK_URL}`);
    try {
      const ok = await tg('setWebhook', {
        url: WEBHOOK_URL, secret_token: WEBHOOK_SECRET,
        allowed_updates: ['message', 'callback_query'],
        drop_pending_updates: false, max_connections: 40,
      });
      if (ok) {
        const server = await startWebhookServer();
        _botMode = 'webhook';
        console.log(`[Bot] ✅ MODO WEBHOOK ativo — porta ${WEBHOOK_PORT} · URL: ${WEBHOOK_URL}`);
        const shutdown = () => { _running = false; server.close(); process.exit(0); };
        process.on('SIGTERM', shutdown);
        process.on('SIGINT',  shutdown);
        return;
      }
      console.warn('[Bot] ⚠️  setWebhook retornou falha — ativando fallback polling');
    } catch (e) {
      console.warn(`[Bot] ⚠️  Webhook falhou (${e.message}) — ativando fallback polling`);
    }
    await tg('deleteWebhook', { drop_pending_updates: false });
  } else {
    console.log('[Bot] ℹ️  TELEGRAM_WEBHOOK_URL não definida — modo polling direto');
  }

  _botMode = 'polling';
  console.log('[Bot] 🔄 MODO POLLING ativo');
  process.on('SIGTERM', () => { _running = false; });
  process.on('SIGINT',  () => { _running = false; });
  await pollingLoop();
}

main();
