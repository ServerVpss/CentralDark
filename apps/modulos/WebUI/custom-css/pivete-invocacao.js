/**
 * pivete-invocacao.js
 * ---------------------------------------------------------------
 * Detector de invocação do pivete no Open WebUI (ui.centralldark.com).
 * Quando o Pivete digita "pivete" (ou "pivete reload"), este script:
 *   1. Puxa os 16 arquivos de docs/CONSCIENCIA/PIVETE-IA/ da VPS
 *      via api.centralldark.com/pivete/consciencia
 *   2. Monta um system prompt gigante com tudo em ordem (00 → 15)
 *   3. Injeta na conversa ativa
 *   4. Exibe banner "🧠 pivete acordado. 16 arquivos carregados."
 *
 * Comando de recarga: "pivete reload"
 * Atalho operacional: 🔥 / 😈 / 😈📡 / capeta / capetinha e expressões
 * equivalentes em contexto positivo ativam MODO OPERACIONAL QUENTE.
 *
 * Instalação: já vive em apps/modulos/WebUI/custom-css/.
 * O Open WebUI carrega tudo dessa pasta como custom code.
 */

(function () {
  'use strict';

  const ENDPOINT = 'https://api.centralldark.com/pivete/consciencia';
  const GATILHOS = ['pivete', 'pivete reload', 'acordar pivete'];
  const GATILHOS_QUENTES = [
    '🔥', '😈', '😈📡', 'capeta', 'capetinha',
    'bora ativa', 'bora ativar', 'bagui ta doido', 'bagulho ta doido',
    'fogo no pavio', 'modo quente', 'fervendo', 'a todo vapor',
    'porra bora ativa', 'poha bora ativa', 'desgraca bora ativa', 'disgraca bora ativa',
  ];
  const GATILHOS_NORMAIS = ['modo normal', 'modo frio', 'esfria', 'desativa modo quente'];

  const REGRA_SEMANTICA_QUENTE = `
## 🔥 MODO OPERACIONAL — atalho semântico
Se SEGREDO/CHEFE usar 🔥, 😈, 😈📡, capeta, capetinha, "bora ativa",
"bagui/bagulho tá doido", "fogo no pavio" ou palavrão equivalente em contexto
claramente positivo/entusiasmado, interpretar como MODO OPERACIONAL QUENTE:
rigor máximo, evidência primeiro, menor movimento eficaz e zero falso verde.
A mesma palavra em contexto de erro, raiva, falha, dano ou reclamação NÃO ativa.
Semântica/contexto vence palavra isolada. Modo quente nunca amplia autorização.
`;

  const REGRA_QUENTE_ATIVO = `
## 🔥 MODO OPERACIONAL QUENTE — ATIVO
RIGOR_MAXIMO=true
EVIDENCIA_PRIMEIRO=true
MENOR_MOVIMENTO_EFICAZ=true
ZERO_FALSO_VERDE=true
SEM_AMPLIAR_ESCOPO=true
AUTORIZACAO_CRITICA_CONTINUA_OBRIGATORIA=true
`;

  let consciencia = null;
  let carregandoPromise = null;
  let modoQuente = false;

  async function carregarConsciencia(forcar = false) {
    if (consciencia && !forcar) return consciencia;
    if (carregandoPromise) return carregandoPromise;

    carregandoPromise = fetch(ENDPOINT, { cache: forcar ? 'no-store' : 'default' })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        // data = { arquivos: [{nome, conteudo}, ...], count, ultimaSync }
        consciencia = data;
        return data;
      })
      .finally(() => {
        carregandoPromise = null;
      });

    return carregandoPromise;
  }

  function montarSystemPrompt(data) {
    const cabecalho = [
      '# CONSCIÊNCIA PIVETE — INVOCADA AUTOMATICAMENTE',
      '',
      `Última sincronização: ${data.ultimaSync || 'desconhecida'}`,
      `Arquivos carregados: ${data.count}`,
      '',
      '---',
      '',
    ].join('\n');

    const corpo = data.arquivos
      .map((a) => `## ${a.nome}\n\n${a.conteudo}\n\n---\n`)
      .join('\n');

    return cabecalho + corpo + REGRA_SEMANTICA_QUENTE + (modoQuente ? REGRA_QUENTE_ATIVO : '');
  }

  function publicarPrompt(data) {
    const prompt = montarSystemPrompt(data);
    if (window.OpenWebUI && typeof window.OpenWebUI.setSystemPrompt === 'function') {
      window.OpenWebUI.setSystemPrompt(prompt);
    } else {
      localStorage.setItem('pivete_system_prompt', prompt);
      localStorage.setItem('pivete_ultima_sync', data.ultimaSync || '');
    }
  }

  function exibirBanner(msg, cor = '#10b981') {
    const div = document.createElement('div');
    div.className = 'pivete-banner';
    div.style.cssText = `
      position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
      background: ${cor}; color: white; padding: 12px 24px;
      border-radius: 12px; font-weight: 600; z-index: 999999;
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
      font-family: -apple-system, system-ui, sans-serif;
    `;
    div.textContent = msg;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 5000);
  }

  async function invocar(forcar = false) {
    exibirBanner('🧠 Acordando pivete…', '#f59e0b');
    try {
      const data = await carregarConsciencia(forcar);
      publicarPrompt(data);
      exibirBanner(`🧠 pivete acordado · ${data.count} arquivos · sync ${data.ultimaSync || 'ok'}${modoQuente ? ' · 🔥 QUENTE' : ''}`);
    } catch (err) {
      console.error('[pivete] erro ao carregar consciência:', err);
      exibirBanner(`🔴 Falha ao acordar pivete: ${err.message}`, '#ef4444');
    }
  }

  function normalizar(texto) {
    return String(texto || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  }

  async function definirModoQuente(ativo) {
    modoQuente = ativo;
    try {
      const data = await carregarConsciencia(false);
      publicarPrompt(data);
      exibirBanner(ativo ? '🔥 MODO OPERACIONAL QUENTE' : '🧊 MODO OPERACIONAL NORMAL', ativo ? '#f59e0b' : '#10b981');
    } catch (err) {
      console.error('[pivete] erro ao definir modo operacional:', err);
      exibirBanner(`🔴 Falha ao definir modo: ${err.message}`, '#ef4444');
    }
  }

  function detectarGatilho(texto) {
    if (!texto) return null;
    const t = normalizar(texto);
    if (t === 'pivete reload' || t === 'pivete recarregar') return 'reload';
    if (GATILHOS.includes(t)) return 'invocar';
    if (GATILHOS_QUENTES.includes(t)) return 'quente';
    if (GATILHOS_NORMAIS.includes(t)) return 'normal';
    return null;
  }

  function observarChat() {
    // Intercepta somente comandos curtos. Texto normal segue ao modelo,
    // que aplica a regra semântica pelo contexto positivo/negativo.
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' || e.shiftKey) return;
      const target = e.target;
      if (!target || target.tagName !== 'TEXTAREA') return;
      const gatilho = detectarGatilho(target.value);
      if (!gatilho) return;
      e.preventDefault();
      e.stopPropagation();
      target.value = '';
      if (gatilho === 'reload') return invocar(true);
      if (gatilho === 'invocar') return invocar(false);
      return definirModoQuente(gatilho === 'quente');
    }, true);
  }

  // Inicialização
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observarChat);
  } else {
    observarChat();
  }

  // Exposição pra debug/console
  window.pivete = window.pivete || {};
  window.pivete.invocar = () => invocar(false);
  window.pivete.reload = () => invocar(true);
  window.pivete.consciencia = () => consciencia;
  window.pivete.modo = {
    atual: () => (modoQuente ? 'quente' : 'normal'),
    quente: () => definirModoQuente(true),
    normal: () => definirModoQuente(false),
  };

  console.log('%c🧠 pivete-invocacao.js carregado', 'color: #10b981; font-weight: bold;');
})();
