// CentralDark Voice — leitura em voz alta pelo botão do Claude.
// O worker MV3 existente opera TTS cross-origin; este script apenas controla a UI.
(() => {
  const LOG = "[CentralDark Voice]";
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

  function decodificarAudio(base64) {
    const texto = atob(base64);
    const bytes = new Uint8Array(texto.length);
    for (let i = 0; i < texto.length; i++) bytes[i] = texto.charCodeAt(i);
    return new Blob([bytes], { type: "audio/mpeg" });
  }

  async function tocarNaCasa(texto, botao) {
    if (!ativo || !texto || !texto.trim()) return false;
    pararAtual();
    const minhaRodada = rodada;
    const requestId = String(Date.now()) + "-" + String(minhaRodada);
    requisicaoAtual = requestId;
    botaoAtual = botao || null;
    if (botao) botao.setAttribute("data-cd-tocando", "1");

    try {
      const resposta = await chrome.runtime.sendMessage({
        type: "CD_VOICE_SPEAK", requestId, texto: texto.slice(0, 4000),
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
      audioAtual = new Audio(urlAtual);
      audioAtual.addEventListener("ended", () => {
        if (minhaRodada === rodada) pararAtual();
      });
      audioAtual.addEventListener("error", () => {
        if (minhaRodada === rodada) pararAtual();
      });
      await audioAtual.play();
      if (minhaRodada !== rodada) return null;
      console.log(LOG, "tocando", { route: resposta.route });
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


[executed on device: CENTRALDARK-OS (809020f9-c77d-4bef-bb06-da5b467ac9b7)]