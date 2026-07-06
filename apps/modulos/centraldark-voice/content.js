// CentralDark Voice — hijack do botão "Ler em voz alta" do Claude
// Intercepta o clique + monkey-patch em speechSynthesis pra tocar áudio
// gerado pelo bridge CentralDark em português brasileiro nativo.

(() => {
  const LOG = "[CentralDark Voice]";
  const BRIDGE = "https://bridge.centralldark.com";
  const DEFAULTS = {
    ativo: true,
    apiKey: "",
    voz: "nova",
    modelo: "openai/gpt-4o-mini-tts",
    instrucoes:
      "Fale em português brasileiro nativo, tom natural e conversacional. Pronuncie tudo em PT-BR.",
  };

  let CFG = { ...DEFAULTS };
  let audioAtual = null;
  let urlAtual = null;

  // ---------- Config ----------
  chrome.storage.local.get(DEFAULTS, (v) => {
    CFG = { ...DEFAULTS, ...v };
    console.log(LOG, "config carregada", { ativo: CFG.ativo, voz: CFG.voz, keyPresente: !!CFG.apiKey });
  });
  chrome.storage.onChanged.addListener((mudancas) => {
    for (const [k, { newValue }] of Object.entries(mudancas)) {
      if (k in DEFAULTS) CFG[k] = newValue;
    }
    console.log(LOG, "config atualizada");
  });

  // ---------- Player gerenciado ----------
  function pararAtual() {
    if (audioAtual) {
      try { audioAtual.pause(); } catch {}
      audioAtual = null;
    }
    if (urlAtual) {
      URL.revokeObjectURL(urlAtual);
      urlAtual = null;
    }
  }

  async function tocarNoBridge(texto, botao) {
    if (!CFG.ativo) return false;
    if (!CFG.apiKey) {
      console.warn(LOG, "chave não configurada — abre o popup da extensão e cola a x-api-key");
      alert("CentralDark Voice: cola a chave x-api-key no popup da extensão.");
      return false;
    }
    if (!texto || !texto.trim()) return false;

    pararAtual();
    if (botao) botao.setAttribute("data-cd-tocando", "1");

    try {
      const r = await fetch(`${BRIDGE}/v1/audio/speech`, {
        method: "POST",
        headers: {
          "x-api-key": CFG.apiKey,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: CFG.modelo,
          voice: CFG.voz,
          input: texto.slice(0, 4000),
          response_format: "mp3",
          instructions: CFG.instrucoes,
        }),
      });
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        console.error(LOG, "bridge falhou", r.status, t.slice(0, 200));
        if (botao) botao.removeAttribute("data-cd-tocando");
        return false;
      }
      const blob = await r.blob();
      urlAtual = URL.createObjectURL(blob);
      audioAtual = new Audio(urlAtual);
      audioAtual.addEventListener("ended", () => {
        if (botao) botao.removeAttribute("data-cd-tocando");
        pararAtual();
      });
      audioAtual.addEventListener("error", () => {
        if (botao) botao.removeAttribute("data-cd-tocando");
        pararAtual();
      });
      await audioAtual.play();
      console.log(LOG, "tocando via bridge, voz =", CFG.voz);
      return true;
    } catch (e) {
      console.error(LOG, "erro", e);
      if (botao) botao.removeAttribute("data-cd-tocando");
      return false;
    }
  }

  // ---------- Extrair texto da mensagem ----------
  function extrairTextoDaMensagem(botao) {
    // Sobe a árvore procurando o container da mensagem
    const container =
      botao.closest("[data-testid='message']") ||
      botao.closest("article") ||
      botao.closest("[data-test-render-count]") ||
      botao.closest("div[class*='message']") ||
      botao.parentElement?.parentElement?.parentElement;

    if (!container) return "";

    // Pega qualquer bloco de texto renderizado (font-claude-message, prose, etc)
    const alvo =
      container.querySelector(".font-claude-message") ||
      container.querySelector("[class*='prose']") ||
      container.querySelector("[class*='markdown']") ||
      container;

    // innerText respeita quebras de linha e ignora elementos invisíveis
    return (alvo.innerText || alvo.textContent || "").trim();
  }

  // ---------- Interceptar clique no botão ----------
  document.addEventListener(
    "click",
    (ev) => {
      if (!CFG.ativo) return;
      const botao = ev.target.closest?.(
        "[data-testid='action-bar-read-aloud'], [aria-label='Ler em voz alta'], [aria-label='Read aloud']"
      );
      if (!botao) return;

      // Se já está tocando via bridge, este clique é "parar"
      if (botao.getAttribute("data-cd-tocando") === "1") {
        pararAtual();
        botao.removeAttribute("data-cd-tocando");
        ev.preventDefault();
        ev.stopImmediatePropagation();
        try { window.speechSynthesis?.cancel(); } catch {}
        return;
      }

      const texto = extrairTextoDaMensagem(botao);
      if (!texto) {
        console.warn(LOG, "não achei texto da mensagem");
        return; // deixa o comportamento nativo rolar
      }

      // Assumir o comando: cancela speech nativo e chama bridge
      ev.preventDefault();
      ev.stopImmediatePropagation();
      try { window.speechSynthesis?.cancel(); } catch {}
      tocarNoBridge(texto, botao);
    },
    true // capture — pega antes dos handlers da Anthropic
  );

  // ---------- Cinto de segurança: monkey-patch speechSynthesis ----------
  // Se qualquer código chamar speechSynthesis.speak(utter), desviamos pro bridge.
  try {
    const original = window.speechSynthesis?.speak?.bind(window.speechSynthesis);
    if (original) {
      window.speechSynthesis.speak = function (utter) {
        if (!CFG.ativo) return original(utter);
        const texto = utter?.text || "";
        if (!texto.trim()) return original(utter);
        console.log(LOG, "speechSynthesis.speak interceptado");
        tocarNoBridge(texto, null).then((ok) => {
          if (!ok) original(utter); // fallback pro nativo se der ruim
        });
      };
      console.log(LOG, "speechSynthesis patched");
    }
  } catch (e) {
    console.warn(LOG, "não deu pra fazer patch em speechSynthesis", e);
  }

  console.log(LOG, "content script ativo em", location.host);
})();
