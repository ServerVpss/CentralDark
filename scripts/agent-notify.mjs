#!/usr/bin/env node
// Envia notificação Telegram para o canal CentralDark. Dois modos:
//   Texto livre:  node agent-notify.mjs "mensagem"
//   Relatório:    node agent-notify.mjs --issues <total> <auto> <reais>
import fs from 'fs';

const args = process.argv.slice(2);

function loadEnv() {
  const env = {};
  for (const p of ['/root/CentralDark/secrets/telegram-alerts.env', '/root/CentralDark/secrets/.env']) {
    try {
      for (const line of fs.readFileSync(p, 'utf-8').split('\n')) {
        const m = line.trim().match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
        if (m && env[m[1]] === undefined) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
      }
    } catch { /* ausente */ }
  }
  return env;
}

function buildMessage() {
  const ts = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';

  // Modo relatório Issues: --issues total auto reais ["n1,n2,..."] ["Titulo1|Titulo2"]
  // Exemplo: node agent-notify.mjs --issues 30 28 2 "75,83" "Protocolo Reload|Token 401"
  if (args[0] === '--issues') {
    const [total, auto, reais] = [args[1], args[2], args[3]].map(Number);
    const issueNums   = (args[4] || '').split(',').map(s => s.trim()).filter(Boolean);
    const issueTitles = (args[5] || '').split('|').map(s => s.trim());
    const REPO = 'https://github.com/ServerVpss/CentralDark';
    const tsBR = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo',
      day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });

    // PADRÃO CENTRALDARK — mensagem toda em <pre> monospace
    const icone  = reais > 0 ? '🚨' : '✅';
    const titulo = reais > 0 ? `${reais} PARA RESOLVER` : 'TUDO LIMPO';
    const emoji2 = reais > 0 ? '🔴' : '🟢';

    // Seção "O que fazer" — só quando há reais
    let oQueFazer = '';
    if (reais > 0) {
      const linksTexto = issueNums.length > 0
        ? issueNums.map((n, i) => {
            const t = issueTitles[i] ? ` — ${issueTitles[i]}` : '';
            return `🔗 #${n}${t}`;
          }).join('\n')
        : `🔗 ${REPO}/issues`;

      oQueFazer =
        `\n──── O QUE FAZER ────\n` +
        `1. Acesse o GitHub (link abaixo)\n` +
        `2. Leia os ${reais} problema${reais > 1 ? 's' : ''} real${reais > 1 ? 'is' : ''}\n` +
        `3. Resolva ou peca ajuda\n\n` +
        linksTexto + '\n';
    }

    const bloco =
      `┌─────────────────────────────┐\n` +
      `│  ${icone}  ${titulo.padEnd(23)}│\n` +
      `└─────────────────────────────┘\n` +
      `\n` +
      `🤖  Issues Scanner  ·  CentralDark\n` +
      `\n` +
      `  Total de alertas:    ${String(total).padStart(3)}\n` +
      `  Robo (ignorar):      ${String(auto).padStart(3)}  🟡\n` +
      `  Voce precisa agir:   ${String(reais).padStart(3)}  ${emoji2}\n` +
      oQueFazer +
      `\n` +
      `💡 Robo = automatico, sem acao\n` +
      `   Real = precisa de uma pessoa\n` +
      `\n` +
      `⏰ ${tsBR}  ·  Brasilia`;

    return `<pre>${bloco}</pre>`;
  }

  // Modo texto livre
  const text = args.join(' ');
  if (!text) { console.error('Uso: node agent-notify.mjs "msg" | --issues <total> <auto> <reais>'); process.exit(1); }
  return `${text}\n<i>🕒 ${ts}</i>`;
}

const env = loadEnv();
const token = env.TELEGRAM_BOT_TOKEN || env.SRVER1_BOT_TOKEN || '';
const chat  = env.TELEGRAM_CHANNEL_ID || env.TELEGRAM_ALERTS_CHAT_ID || '';

if (!token || !chat) {
  console.error('[agent-notify] token/chat ausente — não enviado (não fatal)');
  process.exit(0);
}

const text = buildMessage();
const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ chat_id: chat, text, parse_mode: 'HTML', disable_web_page_preview: true }),
});
const data = await res.json().catch(() => ({}));
if (data.ok) {
  console.log('[agent-notify] enviado OK');
} else {
  console.error('[agent-notify] falha:', data.description || 'erro desconhecido');
  process.exit(0);
}
