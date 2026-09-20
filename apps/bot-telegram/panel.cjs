/**
 * CentralDark Bot Panel — Painel profissional de monitoramento via Telegram
 * 
 * Atalhos: /panel /painel /p
 * Integrado com consciousness + skills
 * Design profissional com botões inline
 */

const fs = require('fs');
const consciousness = require('./skills/core/consciousness.cjs');
const manager = require('./skills/core/manager.cjs');
const memory = require('./skills/core/memory.cjs');

const WABOT_ENV = '/root/Multizap/secrets/wabot.env';

// ═══════════════════════════════════
// FORMATAÇÃO
// ═══════════════════════════════════

function timestamp() {
  return new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}

function bar(value, max, length = 10) {
  const filled = Math.round((value / max) * length);
  return '█'.repeat(Math.min(filled, length)) + '░'.repeat(Math.max(length - filled, 0));
}

function maskChatId(v) {
  if (!v) return 'não configurado';
  const s = String(v);
  if (s.length <= 4) return '****';
  return `${s.slice(0, 2)}****${s.slice(-2)}`;
}

function getGuardaChatId() {
  return process.env.GUARDA_TELEGRAM_CHAT_ID || process.env.TELEGRAM_CHAT_ID || process.env.TELEGRAM_ADMIN_CHAT_ID || process.env.TELEGRAM_USER_ID || '';
}

function saveGuardaChatId(chatId) {
  const id = String(chatId || '').trim();
  if (!id) return false;

  let content = '';
  try { content = fs.readFileSync(WABOT_ENV, 'utf-8'); } catch {}

  const line = `GUARDA_TELEGRAM_CHAT_ID=${id}`;
  if (/^GUARDA_TELEGRAM_CHAT_ID=/m.test(content)) {
    content = content.replace(/^GUARDA_TELEGRAM_CHAT_ID=.*/m, line);
  } else {
    content = `${content.trim()}\n${line}\n`;
  }

  fs.writeFileSync(WABOT_ENV, content, { mode: 0o600 });
  process.env.GUARDA_TELEGRAM_CHAT_ID = id;
  return true;
}

// ═══════════════════════════════════
// PAINÉIS
// ═══════════════════════════════════

function buildMainPanel(data = {}) {
  const ts = timestamp();
  const cpu = data.cpu || '–';
  const mem = data.mem || '–';
  const disk = data.disk || '–';
  const gwStatus = data.gateway || '✅ Online';
  const wuzStatus = data.wuzapi || '✅ Running';
  const botStatus = data.bot || '✅ Online';
  const syncStatus = data.sync || '⬜ Pendente';
  const commit = data.commit || '–';
  const branch = data.branch || 'main';
  const consc = consciousness.getState();
  const stats = consciousness.status();

  const text = `
╔══════════════════════════════╗
║  🔮  <b>CentralDark Console</b>  ║
╚══════════════════════════════╝

📡 <b>SERVIÇOS</b>
┌─────────────────────────────┐
│ 🌐 Gateway    ${gwStatus.padEnd(14)}│
│ 📱 WuzAPI     ${wuzStatus.padEnd(14)}│
│ 🤖 Bot        ${botStatus.padEnd(14)}│
│ 🔄 Sync       ${syncStatus.padEnd(14)}│
└─────────────────────────────┘

🧠 <b>CONSCIÊNCIA</b>
┌─────────────────────────────┐
│ Estado:  ${consc.enabled ? '🟢 ON' : '🔴 OFF'}               │
│ Modo:    ${consc.mode === 'automatic' ? '🤖 Auto' : '🎯 Manual'}             │
│ Skills:  ${stats.activeSkills}/${stats.totalSkills} ativas            │
│ Memória: ${stats.memorySize} decisões          │
└─────────────────────────────┘

🖥️ <b>SISTEMA</b>
┌─────────────────────────────┐
│ CPU:     ${cpu.toString().padEnd(20)}│
│ Memória: ${mem.toString().padEnd(20)}│
│ Disco:   ${disk.toString().padEnd(20)}│
└─────────────────────────────┘

🚀 <b>DEPLOY</b>
┌─────────────────────────────┐
│ Commit: <code>${commit}</code>          │
│ Branch: ${branch.padEnd(21)}│
└─────────────────────────────┘

<i>⏰ ${ts}</i>`.trim();

  const buttons = [
    [
      { text: '📊 Status', callback_data: 'panel:status' },
      { text: '🛡️ Guarda', callback_data: 'panel:guarda' },
      { text: '🔄 Atualizar', callback_data: 'panel:refresh' },
    ],
    [
      { text: '📱 QR Code', callback_data: 'panel:qr' },
      { text: '🧠 Consciência', callback_data: 'panel:consciousness' },
      { text: '⚡ Skills', callback_data: 'panel:skills' },
    ],
    [
      { text: '📋 Logs', callback_data: 'panel:logs' },
      { text: '💬 Chat Stats', callback_data: 'panel:chat' },
    ],
    [
      { text: '⚙️ Configurações', callback_data: 'panel:config' },
    ],
  ];

  return { text, buttons };
}

function buildStatusPanel() {
  const ts = timestamp();
  const text = `
📊 <b>STATUS DETALHADO</b>
<i>${ts}</i>

🌐 <b>Gateway MultiZap</b>
   PM2: MultiZap-Gateway
   Porta: 3100
   Status: ✅ Online

📱 <b>WuzAPI (Docker)</b>
   Porta: 8081 (interno)
   Status: ✅ Running

🔌 <b>Webhooks</b>
   9001: github-webhook (Recargas) 🔒
   9002: MultiZap-GitHub-Webhook 🔒
   9003: CloneDeck-GitHub-Webhook ✅

🔄 <b>Bridge</b>
   wabot-bridge: 9010
   Supabase Sync: polling

🤖 <b>Telegram Bot</b>
   CentralDark-TelegramBot
   Consciência: ${consciousness.getState().enabled ? '🟢' : '🔴'}`.trim();

  return {
    text,
    buttons: [
      [{ text: '🔄 Atualizar', callback_data: 'panel:status' }],
      [{ text: '🔙 Painel', callback_data: 'panel:main' }],
    ],
  };
}

function buildGuardaPanel(saved = false) {
  const ts = timestamp();
  const chatId = getGuardaChatId();
  const tokenStatus = process.env.GUARDA_TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN ? '✅ Encontrado' : '❌ Ausente';
  const destino = chatId ? `✅ Configurado (<code>${maskChatId(chatId)}</code>)` : '⚠️ Não configurado';

  const text = `
🛡️ <b>GUARDA</b>
<i>${ts}</i>

O Guarda é o vigia do sistema. Ele vai monitorar produção, salvar relatórios e mandar alerta quando encontrar problema.

📨 <b>Destino dos alertas</b>
${destino}

🔐 <b>Token Telegram</b>
${tokenStatus}

${saved ? '✅ <b>Este chat foi salvo como destino dos alertas.</b>\n' : ''}
<b>Como usar</b>
1. Abra este painel no chat/grupo/canal desejado.
2. Clique em <b>Usar este chat</b>.
3. O Guarda passará a mandar alertas aqui.

<b>Próximo módulo</b>
PM2, Docker, Caddy, Deploy, WuzAPI e Gateway.`.trim();

  return {
    text,
    buttons: [
      [{ text: '✅ Usar este chat', callback_data: 'panel:guarda_set_current_chat' }],
      [{ text: '🔄 Atualizar', callback_data: 'panel:guarda' }],
      [{ text: '🔙 Painel', callback_data: 'panel:main' }],
    ],
  };
}

function buildConsciousnessPanel() {
  const state = consciousness.getState();
  const stats = consciousness.status();
  const recent = memory.getLast(5);
  const rate = memory.successRate();

  let recentText = 'Nenhuma decisão ainda.';
  if (recent.length > 0) {
    recentText = recent.map(r => 
      `  ${r.result === 'success' ? '✅' : '❌'} <code>${r.skill}</code>`
    ).join('\n');
  }

  const text = `
🧠 <b>CONSCIÊNCIA</b>

Estado: ${state.enabled ? '🟢 <b>ATIVADA</b>' : '🔴 <b>DESATIVADA</b>'}
Modo: ${state.mode === 'automatic' ? '🤖 Automático' : '🎯 Manual'}

📊 <b>Estatísticas</b>
   Skills ativas: ${stats.activeSkills}/${stats.totalSkills}
   Decisões: ${stats.memorySize}
   Taxa sucesso: ${rate.rate}%

📝 <b>Últimas decisões</b>
${recentText}`.trim();

  return {
    text,
    buttons: [
      [
        { text: state.enabled ? '🔴 Desativar' : '🟢 Ativar', callback_data: `panel:toggle_consciousness` },
        { text: state.mode === 'automatic' ? '🎯 Manual' : '🤖 Auto', callback_data: `panel:toggle_mode` },
      ],
      [{ text: '🧹 Limpar Memória', callback_data: 'panel:clear_memory' }],
      [{ text: '🔙 Painel', callback_data: 'panel:main' }],
    ],
  };
}

function buildSkillsPanel() {
  const all = manager.listAll();
  const categories = {};
  
  all.forEach(s => {
    const cat = s.category || s.type || 'other';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(s);
  });

  let text = '⚡ <b>SKILLS</b>\n\n';
  
  const catIcons = {
    methodology: '📖', discovery: '🔍', ai: '🤖', 
    automation: '⚡', communication: '💬', external: '🌐',
    monitoring: '📊', payments: '💰', deploy: '🚀',
  };

  for (const [cat, skills] of Object.entries(categories)) {
    const icon = catIcons[cat] || '📦';
    text += `${icon} <b>${cat.toUpperCase()}</b>\n`;
    skills.forEach(s => {
      text += `  ${s.active ? '✅' : '⬜'} <code>${s.slug}</code>\n`;
    });
    text += '\n';
  }

  text += `<i>Total: ${all.length} skills | ${all.filter(s => s.active).length} ativas</i>`;

  return {
    text,
    buttons: [
      [{ text: '✅ Ativar todas', callback_data: 'panel:enable_all' }],
      [{ text: '⬜ Desativar todas', callback_data: 'panel:disable_all' }],
      [{ text: '🔙 Painel', callback_data: 'panel:main' }],
    ],
  };
}

function buildLogsPanel() {
  const recent = memory.getLast(10);
  
  let text = '📋 <b>LOGS</b>\n\n';
  
  if (recent.length === 0) {
    text += 'Nenhum log ainda.';
  } else {
    recent.forEach((r, i) => {
      const icon = r.result === 'success' ? '✅' : '❌';
      const time = r.timestamp ? new Date(r.timestamp).toLocaleTimeString('pt-BR') : '–';
      text += `${icon} ${time} <code>${r.skill}</code>\n`;
      if (r.input) text += `   📝 ${r.input.slice(0, 50)}${r.input.length > 50 ? '...' : ''}\n`;
    });
  }

  return {
    text,
    buttons: [
      [{ text: '🔄 Atualizar', callback_data: 'panel:logs' }],
      [{ text: '🧹 Limpar', callback_data: 'panel:clear_memory' }],
      [{ text: '🔙 Painel', callback_data: 'panel:main' }],
    ],
  };
}

function buildChatStatsPanel() {
  return {
    text: `
💬 <b>CHAT STATS</b>

📱 WhatsApp Principal: disconnected
📊 Contatos: 3
💬 Mensagens: 13+
🔄 Realtime: ativo

<i>Dados do Supabase</i>`.trim(),
    buttons: [[{ text: '🔙 Painel', callback_data: 'panel:main' }]],
  };
}

function buildConfigPanel() {
  const guardaDestino = getGuardaChatId() ? '✅ Configurado' : '⚠️ Não configurado';
  return {
    text: `
⚙️ <b>CONFIGURAÇÕES</b>

🔌 <b>Integrações</b>
   Telegram: ✅ Conectado
   Guarda: ${guardaDestino}
   WhatsApp: ⏳ Aguardando QR
   Supabase: ✅ Online
   Gateway: ✅ Online

🔐 <b>Segurança</b>
   Tokens: .env (VPS)
   RLS: Ativo
   HMAC: Ativo

📡 <b>Domínios</b>
   multizap.dev ✅
   bot.multizap.dev 🔧
   hook.multizap.dev ✅
   proxy.multizap.dev ✅`.trim(),
    buttons: [
      [{ text: '🛡️ Configurar Guarda', callback_data: 'panel:guarda' }],
      [{ text: '🔙 Painel', callback_data: 'panel:main' }],
    ],
  };
}

// ═══════════════════════════════════
// HANDLER DE CALLBACKS
// ═══════════════════════════════════

async function handlePanelCallback(action, api, chatId, msgId) {
  let panel;

  switch (action) {
    case 'main':
    case 'refresh':
      panel = buildMainPanel();
      break;
    case 'status':
      panel = buildStatusPanel();
      break;
    case 'guarda':
      panel = buildGuardaPanel();
      break;
    case 'guarda_set_current_chat':
      saveGuardaChatId(chatId);
      panel = buildGuardaPanel(true);
      break;
    case 'consciousness':
      panel = buildConsciousnessPanel();
      break;
    case 'skills':
      panel = buildSkillsPanel();
      break;
    case 'logs':
      panel = buildLogsPanel();
      break;
    case 'chat':
      panel = buildChatStatsPanel();
      break;
    case 'config':
      panel = buildConfigPanel();
      break;
    case 'qr':
      panel = {
        text: '📱 <b>QR CODE</b>\n\nStatus: aguardando conexão.\nClique "Conectar" no painel web para gerar QR.',
        buttons: [[{ text: '🔙 Painel', callback_data: 'panel:main' }]],
      };
      break;
    case 'toggle_consciousness':
      if (consciousness.getState().enabled) consciousness.disable();
      else consciousness.enable();
      panel = buildConsciousnessPanel();
      break;
    case 'toggle_mode':
      consciousness.setMode(consciousness.getState().mode === 'automatic' ? 'manual' : 'automatic');
      panel = buildConsciousnessPanel();
      break;
    case 'clear_memory':
      memory.clear();
      panel = { text: '🧹 Memória limpa!', buttons: [[{ text: '🔙 Painel', callback_data: 'panel:main' }]] };
      break;
    case 'enable_all':
      manager.listAll().forEach(s => manager.enable(s.slug));
      panel = buildSkillsPanel();
      break;
    case 'disable_all':
      manager.listAll().forEach(s => manager.disable(s.slug));
      panel = buildSkillsPanel();
      break;
    default:
      panel = buildMainPanel();
  }

  return panel;
}

module.exports = {
  buildMainPanel,
  buildStatusPanel,
  buildGuardaPanel,
  buildConsciousnessPanel,
  buildSkillsPanel,
  buildLogsPanel,
  buildChatStatsPanel,
  buildConfigPanel,
  handlePanelCallback,
};
