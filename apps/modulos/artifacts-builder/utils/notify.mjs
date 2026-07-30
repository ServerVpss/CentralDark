// 📢 NOTIFY — Notificações Telegram com formato monoespaçado
// Usa <code> para blocos e <pre> para multi-linha

const CHAT_ID = process.env.EVOLUCAO_CHAT_ID || '';
const BOT_TOKEN = process.env.BOT_TOKEN_CLAUDE || '';

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Envia notificação monoespaçada para o Telegram.
 * Sem token ou chat configurado, falha fechado sem inventar entrega.
 */
export async function notificar(titulo, corpo, opts = {}) {
  const { chatId = CHAT_ID, token = BOT_TOKEN, parseMode = 'HTML' } = opts;
  if (!chatId || !token) {
    console.error('[notify] TELEGRAM_CONFIG_AUSENTE');
    return false;
  }

  const tituloHtml = `<b>${esc(titulo)}</b>`;
  const corpoHtml = `<pre>${esc(corpo)}</pre>`;
  const texto = `${tituloHtml}\n${corpoHtml}`;

  const MAX = 4000;
  if (texto.length > MAX) {
    const headerLen = tituloHtml.length + 1 + '<pre></pre>'.length;
    const maxCorpo = MAX - headerLen - 50;
    const corpoCortado = corpo.slice(0, maxCorpo) + '\n... (truncado)';
    const textoFinal = `${tituloHtml}\n<pre>${esc(corpoCortado)}</pre>`;
    return await enviar(textoFinal, chatId, token, parseMode);
  }

  return await enviar(texto, chatId, token, parseMode);
}

/**
 * Envia notificação simples.
 */
export async function notificarSimples(texto, opts = {}) {
  const { chatId = CHAT_ID, token = BOT_TOKEN, parseMode = 'HTML' } = opts;
  if (!chatId || !token) {
    console.error('[notify] TELEGRAM_CONFIG_AUSENTE');
    return false;
  }
  return await enviar(texto, chatId, token, parseMode);
}

async function enviar(texto, chatId, token, parseMode = 'HTML') {
  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: texto,
        parse_mode: parseMode,
        disable_web_page_preview: true,
      }),
    });
    if (!r.ok) {
      const err = await r.text().catch(() => '');
      console.error(`[notify] HTTP ${r.status}: ${err.slice(0, 200)}`);
      return false;
    }
    return true;
  } catch (e) {
    console.error(`[notify] erro: ${e.message}`);
    return false;
  }
}

export function tabela(linhas, separador = '─') {
  if (!linhas.length) return '';
  const numCols = Math.max(...linhas.map(l => l.length));
  const largs = [];
  for (let c = 0; c < numCols; c++) {
    largs[c] = Math.max(...linhas.map(l => (l[c] || '').length));
  }
  return linhas.map(linha => {
    return '  ' + linha.map((val, c) => {
      const s = String(val || '');
      return s.padEnd(largs[c]);
    }).join(' │ ');
  }).join('\n');
}

export function kv(chave, valor, largChave = 20) {
  return `  ${chave.padEnd(largChave)} ${valor}`;
}

export function linha(char = '═', tam = 50) {
  return `  ${char.repeat(tam)}`;
}
