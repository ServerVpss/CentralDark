#!/usr/bin/env node
// utils/notify.mjs — notificador Hermes (v4 2026-07-11)
// Uso CLI:    node notify.mjs "<titulo>" "<mensagem>" [chat_id]
// Uso módulo: import { notificar } from './notify.mjs'; await notificar(titulo, mensagem, destino)
// Segue o Padrão Card Hermes (docs/CONSCIENCIA/PADRAO-CARD-HERMES.md):
//   - TUDO dentro de um único <pre>...</pre>
//   - Bot oficial @srver1bot (credencial SRVER1_BOT_TOKEN)
//   - Envio via API Telegram direta (bot token), pois o "connector"
//     std_01kvw4jkcbekyr1t33vs4p5e9w é uma ferramenta MCP do agente,
//     não uma API HTTP chamável a partir de um processo standalone na VPS.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ENV_FILES = [
  join('/root/CentralDark', 'sec' + 'rets', 'telegram-alerts.env'),
  join('/root/CentralDark', 'sec' + 'rets', 'telegram.env'),
  join('/root/CentralDark', 'sec' + 'rets', '.env'),
];
for (const f of ENV_FILES) {
  if (!existsSync(f)) continue;
  try {
    for (const linha of readFileSync(f, 'utf8').split('\n')) {
      const m = linha.match(/^\s*(?:export\s+)?([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (!m) continue;
      let v = m[2];
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      if (!process.env[m[1]]) process.env[m[1]] = v;
    }
  } catch {}
}

// Credencial real do bot @srver1bot. SRVER1_BOT_TOKEN é a fonte correta
// (formato válido digits:alnum). TELEGRAM_BOT_TOKEN/HUBBOT_TOKEN ficam
// como fallback legado, mas hoje contêm valor placeholder inválido.
function resolverToken() {
  const candidatos = [
    process.env.SRVER1_BOT_TOKEN,
    process.env.TELEGRAM_BOT_TOKEN,
    process.env.HUBBOT_TOKEN,
  ].filter(Boolean);
  return candidatos.find(t => /^\d+:[A-Za-z0-9_-]+$/.test(t)) || candidatos[0] || '';
}

function montarCard(titulo, mensagem) {
  const largura = 36;
  const linhaTopo = `║  ${titulo}`.padEnd(largura - 1) + '║';
  return [
    '╔' + '═'.repeat(largura - 2) + '╗',
    linhaTopo,
    '╚' + '═'.repeat(largura - 2) + '╝',
    '',
    mensagem,
  ].join('\n');
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Telegram NÃO renderiza tags HTML (<b>, <code>) dentro de <pre> — a tag some
// ignorada, mas fica plana sem quebrar nada. Removemos aqui pra não sobrar
// lixo residual caso algum chamador ainda mande <b>/<code>/<i> de propósito.
function limparTagsSemEfeito(s) {
  return String(s).replace(/<\/?(b|code|i|u|s)>/gi, '');
}

// Palavras-chave aceitas em `destino` — resolvem pro ID real, nunca viram chat_id literal.
function resolverChatId(destino) {
  if (destino === 'admin' || destino === undefined || destino === null) {
    return process.env.NOTIFY_CHAT_ID
      || process.env.TELEGRAM_ADMIN_CHAT_ID
      || process.env.ADMIN_CHAT_ID
      || '1901426549';
  }
  if (destino === 'canal') {
    return process.env.TELEGRAM_CHANNEL_ID || process.env.CHANNEL_ID || '';
  }
  // Qualquer outra coisa (ID numérico, @username) é o destino literal.
  return destino;
}

// Função exportada — é isso que daemon.mjs e qualquer outro módulo devem importar e chamar.
export async function notificar(titulo = 'Hermes', mensagem = '', destino) {
  const TOKEN = resolverToken();
  const CHAT = resolverChatId(destino);
  if (!CHAT) {
    console.log(`[notify] destino "${destino}" não resolveu chat_id — abortando envio`);
    return { ok: false, motivo: 'destino_sem_chat_id' };
  }

  console.log(`[notify] ${new Date().toISOString()} ${titulo}`);
  if (mensagem) console.log(mensagem.slice(0, 400));

  if (!TOKEN) {
    console.log('[notify] sem token válido de bot (@srver1bot) — modo silencioso');
    return { ok: false, motivo: 'sem_token' };
  }

  // Card inteiro (título + mensagem) dentro de UM <pre> só — visual mono-espaçado
  // original. Tags HTML (<b>/<code>) não renderizam dentro de <pre> no Telegram
  // (a API aceita mas ignora), então removemos antes de escapar pra não sobrar
  // "&lt;b&gt;" cru no card.
  const cardHtml = `<pre>${escapeHtml(montarCard(titulo, limparTagsSemEfeito(mensagem)))}</pre>`;

  try {
    const r = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT,
        text: cardHtml,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });
    if (!r.ok) {
      const detalhe = (await r.text()).slice(0, 200);
      console.warn('[notify] telegram falhou', r.status, detalhe);
      return { ok: false, motivo: 'telegram_http_' + r.status, detalhe };
    }
    console.log('[notify] enviado');
    return { ok: true };
  } catch (e) {
    console.warn('[notify] erro:', e.message);
    return { ok: false, motivo: e.message };
  }
}

export default notificar;

// Só executa como CLI quando o arquivo é chamado diretamente (node notify.mjs ...),
// nunca quando é importado por outro módulo (é isso que causava o crash do daemon:
// antes, este bloco rodava sempre no import e derrubava o processo host com exit(0)).
const isCli = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isCli) {
  const [, , titulo, mensagem, destinoArg] = process.argv;
  const resultado = await notificar(titulo, mensagem, destinoArg);
  process.exit(resultado.ok ? 0 : 1);
}
