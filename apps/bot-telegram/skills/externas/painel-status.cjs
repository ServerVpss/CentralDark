const fs = require('fs');
const path = require('path');

const PAINEL_PATH = path.resolve('/root/CentralDark/apps/projeto-dashboard/painel-data.json');

function lerPainel() {
  if (!fs.existsSync(PAINEL_PATH)) return null;
  try {
    return JSON.parse(fs.readFileSync(PAINEL_PATH, 'utf8'));
  } catch {
    return null;
  }
}

function formatarSummary(dados) {
  const projeto = dados.projeto || {};
  const health = dados.health || {};
  const pm2 = dados.pm2 || {};

  const statusEmoji = (s) => {
    const v = (s || '').toLowerCase();
    if (v === 'online' || v === 'ok' || v === 'verde' || v === 'green') return '🟢';
    if (v === 'stopped' || v === 'stopped_expected') return '⚪';
    if (v === 'errored' || v === 'error' || v === 'vermelho' || v === 'red') return '🔴';
    if (v === 'amarelo' || v === 'yellow' || v === 'warning') return '🟡';
    return '⚫';
  };

  let texto = `<b>📊 Status do Projeto</b>\n`;
  texto += `<pre>`;
  texto += `Nome:    ${projeto.nome || '—'}\n`;
  texto += `Versão:  ${projeto.versao || '—'}\n`;
  texto += `Amb.:    ${projeto.ambiente || '—'}\n`;
  texto += `</pre>\n`;

  texto += `<b>🩺 Health</b>\n<pre>`;
  const healthKeys = Object.keys(health);
  if (healthKeys.length === 0) {
    texto += '(sem dados)\n';
  } else {
    for (const k of healthKeys) {
      const v = health[k];
      const emoji = statusEmoji(typeof v === 'object' ? (v.status || '') : v);
      const val = typeof v === 'object' ? JSON.stringify(v) : v;
      texto += `${emoji} ${k}: ${val}\n`;
    }
  }
  texto += `</pre>\n`;

  texto += `<b>⚙️ PM2</b>\n<pre>`;
  const pm2List = Array.isArray(pm2) ? pm2 : (pm2.processos || pm2.processes || []);
  if (pm2List.length === 0) {
    texto += '(sem dados)\n';
  } else {
    for (const proc of pm2List) {
      const emoji = statusEmoji(proc.status || proc.pm2_env?.status || '');
      const nome = proc.name || proc.pm2_env?.name || '?';
      const status = proc.status || proc.pm2_env?.status || '?';
      texto += `${emoji} ${nome}: ${status}\n`;
    }
  }
  texto += `</pre>`;

  const atualizadoEm = dados.atualizadoEm || dados.updatedAt || dados.timestamp || null;
  if (atualizadoEm) {
    texto += `\n<i>Atualizado: ${atualizadoEm}</i>`;
  }

  return texto;
}

function formatarPendencias(dados) {
  const pendencias = dados.pendencias || dados.pending || [];
  if (pendencias.length === 0) {
    return '✅ Nenhuma pendência registrada no painel.';
  }
  let texto = `<b>📋 Pendências (${pendencias.length})</b>\n<pre>`;
  for (const p of pendencias) {
    const status = p.status || p.estado || '?';
    const titulo = p.titulo || p.title || p.descricao || JSON.stringify(p);
    texto += `[${status}] ${titulo}\n`;
  }
  texto += `</pre>`;
  return texto;
}

function formatarEventos(dados, n) {
  const eventos = dados.eventos || dados.events || dados.historico || [];
  const limite = typeof n === 'number' && n > 0 ? n : 5;
  const ultimos = eventos.slice(-limite).reverse();
  if (ultimos.length === 0) {
    return '📭 Nenhum evento registrado no painel.';
  }
  let texto = `<b>📜 Últimos ${ultimos.length} evento(s)</b>\n<pre>`;
  for (const ev of ultimos) {
    const ts = ev.timestamp || ev.data || ev.createdAt || '';
    const msg = ev.mensagem || ev.message || ev.descricao || JSON.stringify(ev);
    texto += `${ts ? ts.slice(0, 16) + ' ' : ''}${msg}\n`;
  }
  texto += `</pre>`;
  return texto;
}

module.exports = {
  name: 'painel-status',
  description: 'Consulta status do painel-data.json sem chamadas externas',
  category: 'automation',

  async execute(params = {}) {
    const { op, n } = params;

    const dados = lerPainel();
    if (!dados) {
      return { error: `Não foi possível ler o painel: ${PAINEL_PATH}` };
    }

    if (op === 'pendencias') {
      return { text: formatarPendencias(dados) };
    }

    if (op === 'eventos') {
      return { text: formatarEventos(dados, n) };
    }

    // op === 'summary' ou padrão
    return { text: formatarSummary(dados) };
  },
};
