// 📢 NOTIFY — Notificações Telegram com formato monoespaçado
// Usa <code> para blocos e <pre> para multi-linha
// Chat: Central Dark - Grupo da Evolução (-1003669176367)

const CHAT_ID = process.env.EVOLUCAO_CHAT_ID || '-1003669176367';
const BOT_TOKEN = process.env.BOT_TOKEN_CLAUDE || '8057486730:AAEhAwrzyc5jR6pEMqBXHITnZwoahTc6WRY';

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Envia notificação monoespaçada para o Telegram
 * Formato: <pre>bloco monoespaçado</pre> com suporte a HTML básico
 */
export async function notificar(titulo, corpo, opts = {}) {
  const { chatId = CHAT_ID, token = BOT_TOKEN, parseMode = 'HTML' } = opts;

  // Monta o texto: título em negrito + corpo monoespaçado
  const tituloHtml = `<b>${esc(titulo)}</b>`;
  const corpoHtml = `<pre>${esc(corpo)}</pre>`;
  const texto = `${tituloHtml}\n${corpoHtml}`;

  // Telegram tem limite de 4096 chars
  const MAX = 4000;
  if (texto.length > MAX) {
    // Fatia o corpo
    const headerLen = tituloHtml.length + 1 + '<pre></pre>'.length;
    const maxCorpo = MAX - headerLen - 50; // margem
    const corpoCortado = corpo.slice(0, maxCorpo) + '\n... (truncado)';
    const textoFinal = `${tituloHtml}\n<pre>${esc(corpoCortado)}</pre>`;
    return await enviar(textoFinal, chatId, token);
  }

  return await enviar(texto, chatId, token);
}

/**
 * Envia notificação simples (sem monoespaçado, mas com HTML)
 */
export async function notificarSimples(texto, opts = {}) {
  const { chatId = CHAT_ID, token = BOT_TOKEN } = opts;
  return await enviar(texto, chatId, token);
}

async function enviar(texto, chatId, token) {
  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: texto,
        parse_mode: 'HTML',
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

// ── Helpers de formatação ──

/**
 * Formata uma tabela simples em monoespaçado
 */
export function tabela(linhas, separador = '─') {
  if (!linhas.length) return '';
  // Calcula largura máxima de cada coluna
  const numCols = Math.max(...linhas.map(l => l.length));
  const largs = [];
  for (let c = 0; c < numCols; c++) {
    largs[c] = Math.max(...linhas.map(l => (l[c] || '').length));
  }
  // Formata cada linha
  return linhas.map(linha => {
    return '  ' + linha.map((val, c) => {
      const s = String(val || '');
      return s.padEnd(largs[c]);
    }).join(' │ ');
  }).join('\n');
}

/**
 * Formata um par chave: valor
 */
export function kv(chave, valor, largChave = 20) {
  return `  ${chave.padEnd(largChave)} ${valor}`;
}

/**
 * Linha separadora
 */
export function linha(char = '═', tam = 50) {
  return `  ${char.repeat(tam)}`;
}
