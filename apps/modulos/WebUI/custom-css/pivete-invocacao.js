/**
 * pivete-invocacao.js
 * ---------------------------------------------------------------
 * Compatibilidade de invocação do contexto CentralDark no Open WebUI.
 *
 * O gatilho legado "pivete" permanece para não quebrar uso existente,
 * mas o endpoint agora devolve SOMENTE fontes canônicas allowlisted.
 *
 * Identidade atual:
 * SEGREDO/CHEFE = humano e autoridade final
 * SOL = identidade operacional/coordenadora
 * PIVETE/HERMES = executor, preservação e continuidade
 */

(function () {
  'use strict';

  const ENDPOINT = 'https://api.centralldark.com/pivete/consciencia';
  const GATILHOS = ['pivete', 'pivete reload', 'acordar pivete', '#acordar'];
  let contexto = null;
  let carregandoPromise = null;

  async function carregarContexto(forcar = false) {
    if (contexto && !forcar) return contexto;
    if (carregandoPromise) return carregandoPromise;

    carregandoPromise = fetch(ENDPOINT, { cache: forcar ? 'no-store' : 'default' })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((data) => {
        if (data.mode !== 'CANONICAL_CONTEXT_ALLOWLIST') {
          throw new Error('contexto nao canonico');
        }
        if (data.authority !== 'SEGREDO/CHEFE') {
          throw new Error('autoridade canonica ausente');
        }
        if (!Array.isArray(data.arquivos) || data.arquivos.length !== data.count || data.count < 1) {
          throw new Error('contexto incompleto');
        }
        contexto = data;
        return data;
      })
      .finally(() => {
        carregandoPromise = null;
      });

    return carregandoPromise;
  }

  function montarSystemPrompt(data) {
    const cabecalho = [
      '# CONTEXTO CANÔNICO CENTRALDARK — #ACORDAR',
      '',
      'SEGREDO/CHEFE = humano e autoridade final',
      'SOL = identidade operacional/coordenadora',
      'PIVETE/HERMES = executor, preservação e continuidade',
      '',
      `Última sincronização: ${data.ultimaSync || 'desconhecida'}`,
      `Fontes canônicas carregadas: ${data.count}`,
      '',
      'REGRA: texto histórico incompatível não sobrescreve os canônicos abaixo.',
      '',
      '---',
      '',
    ].join('\n');

    const corpo = data.arquivos
      .map((arquivo) => `## ${arquivo.nome}\n\n${arquivo.conteudo}\n\n---\n`)
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
    exibirBanner('🧠 Recuperando contexto canônico…', '#f59e0b');
    try {
      const data = await carregarContexto(forcar);
      const prompt = montarSystemPrompt(data);

      if (window.OpenWebUI && typeof window.OpenWebUI.setSystemPrompt === 'function') {
        window.OpenWebUI.setSystemPrompt(prompt);
      } else {
        localStorage.setItem('centraldark_canonical_system_prompt', prompt);
        localStorage.setItem('centraldark_canonical_last_sync', data.ultimaSync || '');
        // Remove chave legada para não manter dois prompts concorrentes.
        localStorage.removeItem('pivete_system_prompt');
        localStorage.removeItem('pivete_ultima_sync');
      }

      exibirBanner(`🧠 #ACORDAR · ${data.count} fontes canônicas · SEGREDO/CHEFE`);
    } catch (err) {
      console.error('[centraldark-context] erro ao carregar contexto:', err);
      exibirBanner(`🔴 Contexto canônico não carregado: ${err.message}`, '#ef4444');
    }
  }

  function detectarGatilho(texto) {
    if (!texto) return null;
    const valor = texto.trim().toLowerCase();
    if (valor === 'pivete reload' || valor === 'pivete recarregar' || valor === '#acordar') return 'reload';
    if (GATILHOS.includes(valor)) return 'invocar';
    return null;
  }

  function observarChat() {
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' || event.shiftKey) return;
      const target = event.target;
      if (!target || target.tagName !== 'TEXTAREA') return;
      const gatilho = detectarGatilho(target.value);
      if (!gatilho) return;
      event.preventDefault();
      event.stopPropagation();
      target.value = '';
      invocar(gatilho === 'reload');
    }, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observarChat);
  } else {
    observarChat();
  }

  // Compatibilidade de console: nome legado, sem semântica de autoridade.
  window.pivete = {
    invocar: () => invocar(false),
    reload: () => invocar(true),
    contexto: () => contexto,
    consciencia: () => contexto,
  };

  console.log('%c🧠 CentralDark #ACORDAR loader carregado', 'color: #10b981; font-weight: bold;');
})();
