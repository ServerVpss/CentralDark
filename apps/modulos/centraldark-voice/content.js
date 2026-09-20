// CentralDark Voice — hijack do botão "Ler em voz alta" do Claude
// A voz entra pela API oficial da Casa; bridge direto é fallback de compatibilidade.

(() => {
  const LOG = "[CentralDark Voice]";
  const API = "https://api.centralldark.com";
  const LEGACY_BRIDGE = "https://bridge.centralldark.com";
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

  function authHeaders(key) {
    return {
      "content-type": "application/json",
      "authorization": `Bearer ${key}`,
      "x-arsenal-key": key,
      "x-api-key": key,
      "x-centraldark-surface": "centraldark-voice",
    };
  }

  async function pedirAudio(base, texto) {
    const response = await fetch(`${base}/v1/audio/speech`, {
      method: "POST",
      headers: authHeaders(CFG.apiKey),
      body: JSON.stringify({
        model: CFG.modelo,
        voice: CFG.voz,
        input: texto.slice(0, 4000),
        response_format: "mp3",
        instructions: CFG.instrucoes,
      }),
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      const error = new Error(`TTS ${response.status}: ${detail.slice(0, 200)}`);
      error.status = response.status;
      throw error;
    }
    return response.blob();
  }

  async function obterAudio(texto) {
    try {
      const blob = await pedirAudio(API, texto);
      console.log(LOG, "🟢 TTS via API oficial", API);
      return { blob, route: "CENTRAL_API" };
    } catch (primaryError) {
      console.warn(LOG, "🧿 TTS_ROUTE_DRIFT: API oficial falhou; tentando bridge legado", {
        api: API,
        error: String(primaryError?.message || primaryError),
      });
      const blob = await pedirAudio(LEGACY_BRIDGE, texto);
      console.warn(LOG, "🟡 TTS em fallback legado", LEGACY_BRIDGE);
      return { blob, route: "LEGACY_BRIDGE_FALLBACK" };
    }
  }

  async function tocarNaCasa(texto, botao) {
    if (!CFG.ativo) return false;
    if (!CFG.apiKey) {
      console.warn(LOG, "chave de entrada da Casa não configurada");
      alert("CentralDark Voice: configure a chave de entrada no popup da extensão.");
      return false;
    }
    if (!texto || !texto.trim()) return false;

    pararAtual();
    if (botao) botao.setAttribute("data-cd-tocando", "1");

    try {
      const { blob, route } = await obterAudio(texto);
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
      console.log(LOG, "tocando", { voz: CFG.voz, route });
      return true;
    } catch (e) {
      console.error(LOG, "🔴 TTS_ALL_ROUTES_FAILED", e);
      if (botao) botao.removeAttribute("data-cd-tocando");
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

  document.addEventListener(
    "click",
    (ev) => {
      if (!CFG.ativo) return;
      const botao = ev.target.closest?.(
        "[data-testid='action-bar-read-aloud'], [aria-label='Ler em voz alta'], [aria-label='Read aloud']"
      );
      if (!botao) return;

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
        return;
      }

      ev.preventDefault();
      ev.stopImmediatePropagation();
      try { window.speechSynthesis?.cancel(); } catch {}
      tocarNaCasa(texto, botao);
    },
    true
  );

  try {
    const original = window.speechSynthesis?.speak?.bind(window.speechSynthesis);
    if (original) {
      window.speechSynthesis.speak = function (utter) {
        if (!CFG.ativo) return original(utter);
        const texto = utter?.text || "";
        if (!texto.trim()) return original(utter);
        console.log(LOG, "speechSynthesis.speak interceptado");
        tocarNaCasa(texto, null).then((ok) => {
          if (!ok) original(utter);
        });
      };
      console.log(LOG, "speechSynthesis patched");
    }
  } catch (e) {
    console.warn(LOG, "não deu pra fazer patch em speechSynthesis", e);
  }

  console.log(LOG, "content script ativo em", location.host);
})();
