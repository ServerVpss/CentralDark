// CentralDark Voice — leitura em voz alta pelo botão do Claude.
// O worker MV3 existente opera TTS cross-origin; este script apenas controla a UI.
(() => {
  const LOG = "[CentralDark Voice]";
  const LIMITE_TRECHO = 3800;
  let ativo = true;
  let audioAtual = null;
  let urlAtual = null;
  let botaoAtual = null;
  let requisicaoAtual = null;
  let rodada = 0;

  chrome.storage.local.get({ ativo: true }, (v) => {
    ativo = v.ativo !== false;
    if (!ativo) pararAtual();
  });
  chrome.storage.onChanged.addListener((mudancas) => {
    if (mudancas.ativo) {
      ativo = mudancas.ativo.newValue !== false;
      if (!ativo) pararAtual();
    }
  });

  function pararAtual() {
    rodada += 1;
    if (resolverFimAtual) {
      const resolver = resolverFimAtual;
      resolverFimAtual = null;
      resolver("cancel");
    }
    if (requisicaoAtual) {
      chrome.runtime.sendMessage({
        type: "CD_VOICE_CANCEL", requestId: requisicaoAtual,
      }).catch(() => {});
      requisicaoAtual = null;
    }
    if (botaoAtual) {
      botaoAtual.removeAttribute("data-cd-tocando");
      botaoAtual = null;
    }
    if (audioAtual) {
      try { audioAtual.pause(); } catch {}
      audioAtual = null;
    }
    if (urlAtual) {
      URL.revokeObjectURL(urlAtual);
      urlAtual = null;
    }
  }

  // Quebra mensagens longas sem truncar respostas nem criar outro motor de voz.
  function separarTrechos(texto) {
    let restante = String(texto || "").trim();
    const partes = [];
    while (restante.length > LIMITE_TRECHO) {
      let corte = -1;
      for (const fim of ["\n", ". ", "! ", "? ", "; ", ", ", " "]) {
        const pos = restante.lastIndexOf(fim, LIMITE_TRECHO);
        if (pos >= Math.floor(LIMITE_TRECHO / 2)) {
          corte = pos + (fim.length === 2 ? 1 : 0);
          break;
        }
      }
      if (corte < 1) corte = LIMITE_TRECHO;
      // Não separe pares substitutos UTF-16 (emoji/símbolos).
      const anterior = restante.charCodeAt(corte - 1);
      const proximo = restante.charCodeAt(corte);
      if (anterior >= 0xD800 && anterior <= 0xDBFF &&
          proximo >= 0xDC00 && proximo <= 0xDFFF) corte -= 1;
      partes.push(restante.slice(0, corte).trim());
      restante = restante.slice(corte).trimStart();
    }
    if (restante) partes.push(restante);
    return partes;
  }

  let resolverFimAtual = null;

  function decodificarAudio(base64) {
    const texto = atob(base64);
    const bytes = new Uint8Array(texto.length);
    for (let i = 0; i < texto.length; i++) bytes[i] = texto.charCodeAt(i);
    return new Blob([bytes], { type: "audio/mpeg" });
  }

  async function tocarNaCasa(texto, botao) {
    if (!ativo || !texto || !texto.trim()) return false;
    const trechos = separarTrechos(texto);
    if (!trechos.length) return false;
    pararAtual();
    const minhaRodada = rodada;
    botaoAtual = botao || null;
    if (botao) botao.setAttribute("data-cd-tocando", "1");

    try {
      for (let indice = 0; indice < trechos.length; indice += 1) {
        if (minhaRodada !== rodada || !ativo) return null;
        const requestId = String(Date.now()) + "-" + String(minhaRodada) + "-" + String(indice + 1);
        requisicaoAtual = requestId;
        const resposta = await chrome.runtime.sendMessage({
          type: "CD_VOICE_SPEAK", requestId, texto: trechos[indice],
        });
        if (minhaRodada !== rodada || !ativo) return null;
        if (!resposta?.ok) {
          if (resposta?.error === "VOICE_KEY_MISSING") {
            alert("CentralDark Voice: configure a chave de entrada no popup da extensão.");
          }
          throw new Error(resposta?.error || "TTS_WORKER_UNAVAILABLE");
        }

        requisicaoAtual = null;
        urlAtual = URL.createObjectURL(decodificarAudio(resposta.base64));
        const audio = new Audio(urlAtual);
        audioAtual = audio;
        const fim = new Promise((resolve) => {
          const terminar = (tipo) => {
            if (resolverFimAtual === terminar) resolverFimAtual = null;
            resolve(tipo);
          };
          resolverFimAtual = terminar;
          audio.addEventListener("ended", () => terminar("ended"), { once: true });
          audio.addEventListener("error", () => terminar("error"), { once: true });
        });

        await audio.play();
        if (minhaRodada !== rodada || !ativo) return null;
        console.log(LOG, "tocando", {
          route: resposta.route, trecho: indice + 1, total: trechos.length,
        });

        if (indice === trechos.length - 1) {
          fim.then((estado) => {
            if (minhaRodada === rodada && estado !== "cancel") pararAtual();
          });
          return true;
        }

        const estado = await fim;
        if (minhaRodada !== rodada || !ativo) return null;
        if (estado !== "ended") throw new Error("TTS_PLAYBACK_ERROR");
        audioAtual = null;
        URL.revokeObjectURL(urlAtual);
        urlAtual = null;
      }
      return true;
    } catch (erro) {
      if (minhaRodada !== rodada || !ativo) return null;
      console.error(LOG, "TTS_ALL_ROUTES_FAILED", { code: erro?.message || "TTS_ERROR" });
      pararAtual();
      return false;
    }
  }

  function extrairTextoDaMensagem(botao) {
    const container =
      botao.closest("[data-testid='message']") ||
      botao.closest("article") ||
      botao.closest("[data-test-render-count]") ||
      botao.closest("div[class*='message']") ||
      botao.parentElement?.parentElement?.parentElement;
    if (!container) return "";
    const alvo =
      container.querySelector(".font-claude-message") ||
      container.querySelector("[class*='prose']") ||
      container.querySelector("[class*='markdown']") ||
      container;
    return (alvo.innerText || alvo.textContent || "").trim();
  }

  document.addEventListener("click", (ev) => {
    if (!ativo) return;
    const botao = ev.target.closest?.(
      "[data-testid='action-bar-read-aloud'], [aria-label='Ler em voz alta'], [aria-label='Read aloud']"
    );
    if (!botao) return;
    ev.preventDefault();
    ev.stopImmediatePropagation();
    try { window.speechSynthesis?.cancel(); } catch {}
    if (botao.getAttribute("data-cd-tocando") === "1") {
      pararAtual();
      return;
    }
    const texto = extrairTextoDaMensagem(botao);
    if (!texto) {
      console.warn(LOG, "não achei texto da mensagem");
      return;
    }
    tocarNaCasa(texto, botao);
  }, true);

  console.log(LOG, "content script ativo em", location.host);
})();
