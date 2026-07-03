// ============================================================
// HANDLER: /refinar /parallel /debate /router
// Arsenal Council — Multi-Model Orchestration (Fase 3)
// ============================================================
// Dispara o script arsenal-council.sh em background e manda
// o veredicto de volta pro chat (privado do admin) + grupo Evolução.
// ============================================================

const { spawn } = require('child_process');
const path = require('path');

const SCRIPT = '/root/CentralDark/docs/CONSCIENCIA/ARSENAL/scripts/arsenal-council.sh';
const GRUPO_EVOLUCAO = '-5365750004'; // Central Dark - Grupo Da Evolução

// Truncador seguro pro Telegram (limite 4096)
function truncar(txt, max = 3800) {
  if (!txt) return '(sem saída)';
  if (txt.length <= max) return txt;
  return txt.slice(0, max) + '\n\n<i>… (cortado, ver arquivo completo)</i>';
}

// Escape HTML básico
function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Executa o Arsenal Council e devolve { veredicto, arquivo, erro }.
 */
function rodarConselho(modo, tema) {
  return new Promise((resolve) => {
    const proc = spawn('bash', [SCRIPT, modo, tema], {
      env: { ...process.env },
      timeout: 180000, // 3 min máx
    });
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (d) => stdout += d.toString());
    proc.stderr.on('data', (d) => stderr += d.toString());
    proc.on('close', (code) => {
      // Última linha do stdout é o path do arquivo (📁 ...)
      const linhas = stdout.trim().split('\n');
      const arquivoLine = linhas.reverse().find(l => l.startsWith('📁 '));
      const arquivo = arquivoLine ? arquivoLine.replace('📁 ', '').trim() : null;
      const veredicto = stdout
        .replace(/^🎯.*\n|^⚡.*\n|^🔥.*\n/, '') // remove header do modo
        .replace(/📁 .+$/, '')
        .trim();
      resolve({
        ok: code === 0,
        veredicto,
        arquivo,
        erro: code !== 0 ? (stderr || `exit ${code}`) : null,
      });
    });
    proc.on('error', (err) => resolve({ ok: false, erro: err.message }));
  });
}

/**
 * Handler principal — chamado pelo unified-bot.
 * @param {object} deps - { send, chatId, text }
 * @param {string} modo - 'router' | 'parallel' | 'debate'
 */
async function refinarHandler(deps, modo) {
  const { send, chatId, text } = deps;
  const tema = text.split(' ').slice(1).join(' ').trim();

  if (!tema) {
    return send(chatId,
      `❌ Uso: <code>/${modo === 'parallel' ? 'refinar' : modo} &lt;tema&gt;</code>\n\n` +
      `Ex: <code>/refinar como melhorar o cache do Supabase?</code>`
    );
  }

  const emoji = { router: '🎯', parallel: '⚡', debate: '🔥' }[modo] || '🧠';
  const nomeModo = { router: 'ROUTER (1 IA rápida)', parallel: 'PARALLEL (3 IAs + juiz)', debate: 'DEBATE (2 rodadas + juiz)' }[modo];
  const tempoEstimado = { router: '~10s', parallel: '~40s', debate: '~90s' }[modo];

  // Aviso imediato
  await send(chatId,
    `${emoji} <b>Conselho reunido — ${nomeModo}</b>\n\n` +
    `<b>Tema:</b> ${esc(tema)}\n` +
    `⏱️ Aguarde ${tempoEstimado}...`
  );

  const t0 = Date.now();
  const { ok, veredicto, arquivo, erro } = await rodarConselho(modo, tema);
  const dt = ((Date.now() - t0) / 1000).toFixed(1);

  if (!ok) {
    return send(chatId, `❌ Falha no Conselho:\n<code>${esc(erro)}</code>`);
  }

  const nomeArq = arquivo ? path.basename(arquivo) : '(não salvo)';
  const resposta =
    `${emoji} <b>VEREDICTO — ${nomeModo}</b>\n` +
    `⏱️ ${dt}s\n` +
    `📁 <code>${esc(nomeArq)}</code>\n\n` +
    truncar(esc(veredicto));

  await send(chatId, resposta);

  // Também posta no grupo Evolução (se não for o próprio grupo)
  if (String(chatId) !== GRUPO_EVOLUCAO) {
    try {
      await send(GRUPO_EVOLUCAO,
        `${emoji} <b>Conselho ${modo.toUpperCase()}</b> — pediu: <i>admin</i>\n\n` +
        `<b>Tema:</b> ${esc(tema)}\n\n` +
        truncar(esc(veredicto), 3500)
      );
    } catch (e) {
      // silencioso
    }
  }
}

module.exports = { refinarHandler };
