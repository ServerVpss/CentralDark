#!/usr/bin/env node
// 📢 Hermes Notify — posta no @srver1bot (admin) + canal Status
// Uso: node notify.mjs "titulo" "mensagem" [admin|canal|ambos] [pre|plain]
// Admin (privado): card gamificado com moldura, XP, progresso — Pivete é leigo
// Canal (grupo): texto seco, sem moldura, sem tags HTML visíveis
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const [,, titulo = 'Hermes', mensagem = '', destino = 'ambos', modo = 'pre'] = process.argv;
const ADMIN = 1901426549;
const CANAL = -1003669176367;

function getToken() {
  const direto = process.env.TELEGRAM_BOT_TOKEN || process.env.SRVER1_BOT_TOKEN || process.env.HUB_BOT_TOKEN;
  if (direto) return direto;
  try {
    const jlist = JSON.parse(execSync('pm2 jlist', { encoding: 'utf8' }));
    const bot = jlist.find(p => p.name === 'CentralDark-HubBot' || p.pm_id === 27);
    if (bot?.pid) {
      const env = readFileSync(`/proc/${bot.pid}/environ`, 'utf8').split('\0');
      for (const nome of ['TELEGRAM_BOT_TOKEN', 'SRVER1_BOT_TOKEN', 'HUB_BOT_TOKEN', 'BOT_TOKEN']) {
        const l = env.find(x => x.startsWith(nome + '='));
        if (l) return l.slice(nome.length + 1);
      }
    }
  } catch (e) { console.error('[notify] erro pm2 jlist:', e.message); }
  return '';
}

const TOKEN = getToken();
if (!TOKEN) { console.error('[notify] SEM TOKEN — impossível notificar'); process.exit(1); }
const API = `https://api.telegram.org/bot${TOKEN}`;
const esc = s => String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const stripHtml = s => String(s || '').replace(/<[^>]+>/g, '').trim();

async function send(chatId, texto) {
  const r = await fetch(`${API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: texto, parse_mode: 'HTML', disable_web_page_preview: true }),
  });
  if (!r.ok) { const t = await r.text(); console.error(`[notify] falha ${chatId}:`, t.slice(0, 200)); return false; }
  return true;
}

// ─── ADMIN (privado): card gamificado ───
function montarCardAdmin(titulo, msg) {
  const linhas = msg.split('\n').filter(Boolean);
  const status = linhas.find(l => /✅|⚠️|❌|🟢|🟡|🔴/.test(l)) || '✅ OK';
  const acao = linhas.filter(l => !l.startsWith('```') && !l.startsWith('#')).slice(0, 4).join('\n  ') || msg.slice(0, 200);
  const xp = linhas.find(l => /XP|Lv\.|progresso/i.test(l)) || '—';
  const prox = linhas.find(l => /próximo|proximo|next/i.test(l)) || 'Aguardando instrução do Pivete';

  return `<pre>
╔══════════════════════════════════╗
║  CENTRAL DARK / ${esc(titulo).slice(0, 22)}║
╚══════════════════════════════════╝

STATUS:    ${status}
PRIORID:   🟡 Média
RESPONS:   @segredounlocker

🎯 MISSÃO: ${esc(titulo).slice(0, 40)}
⏱  TEMPO:  ${new Date().toLocaleTimeString('pt-BR', {timeZone: 'America/Sao_Paulo'})}

📘 LEIGO
  ${stripHtml(msg).split('\n')[0].slice(0, 80)}

⚙️  AÇÃO
  ${esc(acao).slice(0, 200)}

📊 PROGRESSO
  XP:    [████████░░] ${xp}

🚨 BLOQUEIOS
  ${linhas.find(l => /bloqueio|erro|falha|pendente/i.test(l)) || 'Nenhum'}

🎯 PRÓXIMO PASSO
  ${esc(prox).slice(0, 60)}

────────────────────────────────────
🔧 DETALHE TÉCNICO
  Fonte:  Hermes Notify
  Data:   ${new Date().toISOString().slice(0, 19).replace('T', ' ')}
  Tags:   #notify #${esc(titulo).toLowerCase().replace(/\s+/g, '-').slice(0, 20)}
</pre>`;
}

// ─── CANAL (grupo): texto seco ───
function montarLinhaCanal(titulo, msg) {
  const primeiraLinha = stripHtml(msg).split('\n')[0].slice(0, 140);
  return `🤖 ${stripHtml(titulo)} — ${primeiraLinha}`;
}

const cardAdmin = modo === 'pre' ? montarCardAdmin(titulo, mensagem) : `🤖 <b>${esc(titulo)}</b>\n\n${esc(mensagem)}`;
const linhaCanal = montarLinhaCanal(titulo, mensagem);

const alvos = [];
if (destino === 'ambos' || destino === 'admin') alvos.push(['admin', ADMIN, cardAdmin]);
if (destino === 'ambos' || destino === 'canal') alvos.push(['canal', CANAL, linhaCanal]);

for (const [nome, chat, txt] of alvos) {
  const ok = await send(chat, txt);
  console.log(`[notify] ${nome} ${chat}: ${ok ? '✅' : '❌'}`);
}
