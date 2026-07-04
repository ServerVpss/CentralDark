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
 *
 * Instalação: já vive em apps/modulos/WebUI/custom-css/.
 * O Open WebUI carrega tudo dessa pasta como custom code.
 */

(function () {
  'use strict';

  const ENDPOINT = 'https://api.centralldark.com/pivete/consciencia';
  const GATILHOS = ['pivete', 'pivete reload', 'acordar pivete'];
  let consciencia = null;
  let carregandoPromise = null;

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

    return cabecalho + corpo;
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
      const prompt = montarSystemPrompt(data);

      // Tenta injetar via API do Open WebUI (se disponível)
      if (window.OpenWebUI && typeof window.OpenWebUI.setSystemPrompt === 'function') {
        window.OpenWebUI.setSystemPrompt(prompt);
      } else {
        // Fallback: guarda no localStorage pra a próxima mensagem incluir
        localStorage.setItem('pivete_system_prompt', prompt);
        localStorage.setItem('pivete_ultima_sync', data.ultimaSync || '');
      }

      exibirBanner(`🧠 pivete acordado · ${data.count} arquivos · sync ${data.ultimaSync || 'ok'}`);
    } catch (err) {
      console.error('[pivete] erro ao carregar consciência:', err);
      exibirBanner(`🔴 Falha ao acordar pivete: ${err.message}`, '#ef4444');
    }
  }

  function detectarGatilho(texto) {
    if (!texto) return null;
    const t = texto.trim().toLowerCase();
    if (t === 'pivete reload' || t === 'pivete recarregar') return 'reload';
    if (GATILHOS.includes(t)) return 'invocar';
    return null;
  }

  function observarChat() {
    // Escuta envio de mensagens no textarea principal do Open WebUI
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' || e.shiftKey) return;
      const target = e.target;
      if (!target || target.tagName !== 'TEXTAREA') return;
      const gatilho = detectarGatilho(target.value);
      if (!gatilho) return;
      e.preventDefault();
      e.stopPropagation();
      target.value = '';
      invocar(gatilho === 'reload');
    }, true);
  }

  // Inicialização
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observarChat);
  } else {
    observarChat();
  }

  // Exposição pra debug/console
  window.pivete = {
    invocar: () => invocar(false),
    reload: () => invocar(true),
    consciencia: () => consciencia,
  };

  console.log('%c🧠 pivete-invocacao.js carregado', 'color: #10b981; font-weight: bold;');
})();
