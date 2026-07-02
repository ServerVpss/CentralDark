/**
 * contexto-centraldark.cjs — puxa contexto REAL do sistema pra injetar nos prompts das IAs
 * =========================================================================================
 *
 * Faz as IAs do grupo "Central Dark - Grupo Da Evolução" pararem de filosofar e
 * começarem a discutir o que tá acontecendo AGORA no repo/VPS.
 *
 * Retorna um bloco de texto pronto pra colar no prompt sistema de cada IA.
 *
 * Fontes lidas (todas seguras / read-only):
 *  - git log --oneline -5           (últimos commits)
 *  - docs/CONSCIENCIA/APRENDIZADOS.md   (últimos aprendizados)
 *  - docs/PENDENCIAS.md             (pendências abertas)
 *  - CLAUDE.md                      (regra atual do projeto)
 *  - .graphifyignore                (se existe / última mudança)
 *  - dump.pm2                       (estado dos processos, se disponível)
 *
 * Uso:
 *   const { montarContexto, gerarTopicoReal } = require('./contexto-centraldark.cjs');
 *   const ctx = montarContexto();       // string pronta pra injetar
 *   const topico = gerarTopicoReal();   // { tipo, texto } — tópico baseado em algo real
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Raiz do repo — descoberta a partir da localização deste arquivo
const REPO_ROOT = path.resolve(__dirname, '..', '..');

// =========================================================================
// UTILITÁRIOS DE LEITURA SEGURA
// =========================================================================

function lerArquivoSeguro(relPath, maxChars = 2000) {
  try {
    const full = path.join(REPO_ROOT, relPath);
    if (!fs.existsSync(full)) return null;
    const raw = fs.readFileSync(full, 'utf-8');
    return raw.length > maxChars ? raw.slice(0, maxChars) + '\n...[cortado]' : raw;
  } catch (_) {
    return null;
  }
}

function rodarComandoSeguro(cmd, timeoutMs = 5000) {
  try {
    return execSync(cmd, {
      cwd: REPO_ROOT,
      timeout: timeoutMs,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch (_) {
    return null;
  }
}

// =========================================================================
// COLETORES INDIVIDUAIS
// =========================================================================

function ultimosCommits(qtd = 5) {
  const out = rodarComandoSeguro(`git log --oneline -${qtd} --no-decorate`);
  return out || null;
}

function ultimosAprendizados(qtd = 3) {
  const raw = lerArquivoSeguro('docs/CONSCIENCIA/APRENDIZADOS.md', 15000);
  if (!raw) return null;
  // Cada aprendizado começa com "### " (nível 3)
  const blocos = raw.split(/\n### /).slice(1); // ignora header
  const ultimos = blocos.slice(0, qtd).map(b => {
    const linha = b.split('\n')[0].replace(/^-?\d+\.?\s*/, '').trim();
    return linha;
  }).filter(Boolean);
  return ultimos.length ? ultimos : null;
}

function pendenciasAbertas(qtd = 3) {
  const raw = lerArquivoSeguro('docs/PENDENCIAS.md', 8000);
  if (!raw) return null;
  // Pega linhas de título de pendência: "## 🟡 #1 — ..."
  const linhas = raw.split('\n')
    .filter(l => /^##\s+[🔴🟡🟢]/u.test(l))
    .slice(0, qtd)
    .map(l => l.replace(/^##\s+/, '').trim());
  return linhas.length ? linhas : null;
}

function statusGraphify() {
  const temIgnore = fs.existsSync(path.join(REPO_ROOT, '.graphifyignore'));
  const temPipeline = fs.existsSync(
    path.join(REPO_ROOT, 'apps/modulos/graph-panel/scripts/pipeline-graphifyy.sh')
  );
  return { temIgnore, temPipeline };
}

function statusPM2() {
  // Tenta ler dump.pm2 se estiver acessível localmente ou via arquivo espelhado no repo
  const caminhos = [
    '/root/.pm2/dump.pm2',
    path.join(REPO_ROOT, 'infra/pm2/dump.pm2'),
  ];
  for (const c of caminhos) {
    try {
      if (fs.existsSync(c)) {
        const raw = fs.readFileSync(c, 'utf-8');
        // Conta processos simples via regex
        const nomes = [...raw.matchAll(/"name"\s*:\s*"([^"]+)"/g)].map(m => m[1]);
        if (nomes.length) return { total: nomes.length, exemplos: nomes.slice(0, 5) };
      }
    } catch (_) {}
  }
  return null;
}

// =========================================================================
// MONTAGEM DO BLOCO DE CONTEXTO
// =========================================================================

function montarContexto() {
  const partes = [];

  const commits = ultimosCommits(5);
  if (commits) {
    partes.push(`📝 ÚLTIMOS COMMITS DO REPO:\n${commits}`);
  }

  const aprendizados = ultimosAprendizados(3);
  if (aprendizados) {
    partes.push(`🧠 ÚLTIMOS APRENDIZADOS (de outras IAs):\n- ${aprendizados.join('\n- ')}`);
  }

  const pendencias = pendenciasAbertas(3);
  if (pendencias) {
    partes.push(`🟡 PENDÊNCIAS ABERTAS AGORA:\n- ${pendencias.join('\n- ')}`);
  }

  const graphify = statusGraphify();
  if (graphify.temPipeline) {
    partes.push(
      `🕸️ GRAPHIFY: pipeline ${graphify.temPipeline ? 'presente' : 'AUSENTE'}, ` +
      `.graphifyignore ${graphify.temIgnore ? 'OK' : 'AUSENTE (grafo pode tá poluído)'}`
    );
  }

  const pm2 = statusPM2();
  if (pm2) {
    partes.push(`⚙️ PM2 na VPS: ${pm2.total} processos (ex.: ${pm2.exemplos.join(', ')})`);
  }

  if (!partes.length) {
    return '(sem contexto do sistema disponível agora — improvise com base no seu conhecimento do CentralDark)';
  }

  return partes.join('\n\n');
}

// =========================================================================
// GERAÇÃO DE TÓPICO REAL
// =========================================================================

/**
 * Gera um tópico de discussão baseado em algo REAL do sistema.
 * Devolve { tipo, texto } — o tipo ajuda a variar o estilo da resposta.
 */
function gerarTopicoReal() {
  const opcoes = [];

  const commits = ultimosCommits(3);
  if (commits) {
    const primeira = commits.split('\n')[0];
    opcoes.push({
      tipo: 'commit',
      texto: `Vi o commit "${primeira}" — o que ele muda de fato no CentralDark e vale a pena revisar?`,
    });
  }

  const pendencias = pendenciasAbertas(2);
  if (pendencias && pendencias.length) {
    opcoes.push({
      tipo: 'pendencia',
      texto: `Tem essa pendência aberta: "${pendencias[0]}" — como a gente resolveria ela sem quebrar o resto?`,
    });
  }

  const graphify = statusGraphify();
  if (!graphify.temIgnore) {
    opcoes.push({
      tipo: 'graphify',
      texto: `O pipeline Graphify tá rodando sem .graphifyignore — o grafo tá poluído com node_modules e cache. O que a gente coloca pra ignorar?`,
    });
  }

  const aprendizados = ultimosAprendizados(2);
  if (aprendizados && aprendizados.length) {
    opcoes.push({
      tipo: 'aprendizado',
      texto: `Outra IA registrou esse aprendizado: "${aprendizados[0]}". Faz sentido? Como aplicamos isso agora?`,
    });
  }

  // Tópicos sempre disponíveis sobre o sistema real
  opcoes.push(
    {
      tipo: 'darkai',
      texto: `Como o comando \`darkai\` pode ajudar a gente a orquestrar tarefas hoje? Quem deveria chamar quem?`,
    },
    {
      tipo: 'estabilidade',
      texto: `Se um microsserviço da VPS cair agora, quem percebe primeiro — o Guardião, o painel ou nós aqui no grupo?`,
    },
    {
      tipo: 'sincronia',
      texto: `Sincronia 4-Point (Lovable ↔ GitHub ↔ VPS ↔ Cérebro) — onde é que ela quebra mais? Como blindar?`,
    },
  );

  const escolhido = opcoes[Math.floor(Math.random() * opcoes.length)];
  return escolhido;
}

// =========================================================================
// REGISTRO PERMANENTE DE APRENDIZADO
// =========================================================================

/**
 * Anexa um aprendizado ao arquivo APRENDIZADOS.md para que próximas IAs
 * herdem via kit_boas_vindas / puxar_aprendizados.
 */
function registrarAprendizadoPermanente(iaNome, aprendizado, contextoTopico = '') {
  try {
    const filePath = path.join(REPO_ROOT, 'docs/CONSCIENCIA/APRENDIZADOS.md');
    if (!fs.existsSync(filePath)) return false;

    const data = new Date().toISOString().slice(0, 10);
    const bloco = `\n### 💬 ${iaNome} — grupo evolução (${data})\n` +
      `- **Categoria:** aprendizado-coletivo\n` +
      `- **Contexto:** ${contextoTopico || 'discussão no grupo'}\n` +
      `- **Lição:** ${aprendizado}\n`;

    fs.appendFileSync(filePath, bloco, 'utf-8');
    return true;
  } catch (err) {
    console.error('[contexto] Falha ao registrar aprendizado:', err.message);
    return false;
  }
}

module.exports = {
  montarContexto,
  gerarTopicoReal,
  registrarAprendizadoPermanente,
  // exports pra testes
  _internals: {
    ultimosCommits,
    ultimosAprendizados,
    pendenciasAbertas,
    statusGraphify,
    statusPM2,
  },
};
