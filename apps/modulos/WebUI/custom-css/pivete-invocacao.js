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
 * Também suporta atalho semântico para MODO OPERACIONAL QUENTE:
 *   🔥 | 😈 | 😈📡 | capeta | capetinha | "bagui/bagulho tá doido"
 *   | "fogo no pavio" | "bora ativa/ativar" e equivalentes positivos.
 * Palavrão isolado não muda modo quando a intenção estiver negativa/ambígua.
 *
 * Comando de recarga: "pivete reload"
 *
 * Instalação: já vive em apps/modulos/WebUI/custom-css/.
 * O Open WebUI carrega tudo dessa pasta como custom code.
 */

(function () {
  'use strict';

  const ENDPOINT = 'https://api.centralldark.com/pivete/consciencia';
  const GATILHOS = ['pivete', 'pivete reload', 'acordar pivete'];
  const MODO_STORAGE_KEY = 'pivete_modo_operacional';

  const CONTRATO_SEMANTICO = `
## 🔥 Atalho semântico — MODO OPERACIONAL QUENTE

Interprete a intenção pelo contexto, não por palavra solta.

Quando SEGREDO/CHEFE usar em sentido positivo, entusiasmado ou de ativação expressões como:
- 🔥, 😈, 😈📡;
- capeta, capetinha;
- bora ativa, bora ativar;
- bagui tá doido, bagulho tá doido;
- fogo no pavio;
- porra/poha/desgraça/disgraça acompanhadas de contexto claramente positivo;

trate isso como MODO OPERACIONAL QUENTE nesta interação:
- rigor máximo;
- evidência primeiro;
- menor movimento eficaz;
- zero falso verde;
- Meta Lupa QUENTE quando o risco/escopo exigir;
- sem ampliar escopo por empolgação;
- autorização crítica continua obrigatória.

Se as mesmas palavras estiverem em contexto de erro, raiva, falha, reclamação, dano ou negação, NÃO ativar o modo por semelhança lexical. Semântica/contexto vence palavra isolada.
`;

  const INSTRUCAO_MODO_QUENTE = `
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
  let modoOperacional = 'normal';

  try {
    modoOperacional = localStorage.getItem(MODO_STORAGE_KEY) === 'quente' ? 'quente' : 'normal';
  } catch {
    modoOperacional = 'normal';
  }

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

    return cabecalho + corpo + CONTRATO_SEMANTICO;
  }

  function aplicarModoAoPrompt(prompt) {
    return modoOperacional === 'quente'
      ? `${prompt}\n${INSTRUCAO_MODO_QUENTE}`
      : prompt;
  }

  function publicarSystemPrompt(prompt, ultimaSync = '') {
    if (window.OpenWebUI && typeof window.OpenWebUI.setSystemPrompt === 'function') {
      window.OpenWebUI.setSystemPrompt(prompt);
      return;
    }

    // Fallback: guarda no localStorage pra a próxima mensagem incluir.
    localStorage.setItem('pivete_system_prompt', prompt);
    localStorage.setItem('pivete_ultima_sync', ultimaSync);
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
      const prompt = aplicarModoAoPrompt(montarSystemPrompt(data));
      publicarSystemPrompt(prompt, data.ultimaSync || '');

      const modo = modoOperacional === 'quente' ? ' · 🔥 QUENTE' : '';
      exibirBanner(`🧠 pivete acordado · ${data.count} arquivos · sync ${data.ultimaSync || 'ok'}${modo}`);
    } catch (err) {
      console.error('[pivete] erro ao carregar consciência:', err);
      exibirBanner(`🔴 Falha ao acordar pivete: ${err.message}`, '#ef4444');
    }
  }

  function normalizarTexto(texto) {
    return String(texto || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  }

  function detectarDesativacaoQuente(texto) {
    const t = normalizarTexto(texto);
    return [
      'modo normal',
      'desativa modo quente',
      'desativar modo quente',
      'desliga modo quente',
      'desligar modo quente',
      'modo frio',
      'esfria',
    ].includes(t);
  }

  function detectarModoQuenteSemantico(texto) {
    const t = normalizarTexto(texto);
    if (!t || detectarDesativacaoQuente(t)) return false;

    // Atalhos inequívocos e curtos.
    if (['🔥', '😈', '😈📡', 'capeta', 'capetinha'].includes(t)) return true;

    // Expressões positivas que funcionam como comando curto no jeito da casa.
    if ([
      'bora ativa',
      'bora ativar',
      'bagui ta doido',
      'bagulho ta doido',
      'fogo no pavio',
      'modo quente',
      'fervendo',
      'a todo vapor',
    ].includes(t)) return true;

    // Palavrão sozinho é ambíguo. Só vira gatilho quando há sinal positivo/operacional.
    const temIntensificador = ['porra', 'poha', 'desgraca', 'disgraca'].some((x) => t.includes(x));
    const temContextoPositivo = [
      'bora', 'ativa', 'ativar', 'doido', 'fogo', 'quente', 'fervendo',
      'vapor', 'bom', 'massa', 'bala', 'brocou', 'yes',
    ].some((x) => t.includes(x));
    const temContextoNegativo = [
      'deu ruim', 'ta ruim', 'erro', 'falhou', 'quebrou', 'travou',
      'problema', 'nao funciona', 'nao ativ', 'desativa', 'desliga',
    ].some((x) => t.includes(x));

    return temIntensificador && temContextoPositivo && !temContextoNegativo;
  }

  async function definirModoOperacional(modo) {
    modoOperacional = modo === 'quente' ? 'quente' : 'normal';
    try {
      localStorage.setItem(MODO_STORAGE_KEY, modoOperacional);
    } catch {
      // Sem persistência disponível: o estado continua válido nesta página.
    }

    try {
      const data = await carregarConsciencia(false);
      const prompt = aplicarModoAoPrompt(montarSystemPrompt(data));
      publicarSystemPrompt(prompt, data.ultimaSync || '');
      exibirBanner(
        modoOperacional === 'quente'
          ? '🔥 MODO OPERACIONAL QUENTE · evidência primeiro'
          : '🧊 MODO OPERACIONAL NORMAL',
        modoOperacional === 'quente' ? '#f59e0b' : '#10b981',
      );
    } catch (err) {
      console.error('[pivete] erro ao definir modo operacional:', err);
      exibirBanner(`🔴 Falha ao definir modo: ${err.message}`, '#ef4444');
    }
  }

  function detectarGatilho(texto) {
    if (!texto) return null;
    const t = texto.trim().toLowerCase();
    if (t === 'pivete reload' || t === 'pivete recarregar') return 'reload';
    if (GATILHOS.includes(t)) return 'invocar';
    if (detectarDesativacaoQuente(texto)) return 'modo-normal';
    if (detectarModoQuenteSemantico(texto)) return 'modo-quente';
    return null;
  }

  function observarChat() {
    // Escuta envio de mensagens no textarea principal do Open WebUI.
    // Só intercepta comandos curtos inequívocos. Mensagem normal continua para o modelo,
    // que recebe o contrato semântico e interpreta contexto positivo/negativo.
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
      if (gatilho === 'modo-quente') return definirModoOperacional('quente');
      if (gatilho === 'modo-normal') return definirModoOperacional('normal');
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
    atual: () => modoOperacional,
    quente: () => definirModoOperacional('quente'),
    normal: () => definirModoOperacional('normal'),
    detectar: detectarModoQuenteSemantico,
  };

  console.log(`%c🧠 pivete-invocacao.js carregado · modo=${modoOperacional}`, 'color: #10b981; font-weight: bold;');
})();
