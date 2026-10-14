// CentralDark Voice — hijack do botão "Ler em voz alta" do Claude
// A voz entra pela API oficial da Casa; bridge direto é fallback de compatibilidade.

(() => {
  const LOG = "[CentralDark Voice]";
  const API = "https://api.centralldark.com";
  const LEGACY_BRIDGE = "https://bridge.centralldark.com";
  const LIMITE_TRECHO = 3800;
  const DEFAULTS = {
    ativo: true,
    apiKey: "",
    voz: "nova",
    modelo: "openai/gpt-4o-mini-tts",
    instrucoes:
      "Fale em português brasileiro natural, com cadência baiana leve e humor de Zé malandro, sem caricatura. Preserve o texto original, incluindo palavrões coloquiais e termos técnicos; use pausas e firmeza nos comandos de JARVIS.",
  };

  let CFG = { ...DEFAULTS };
  let audioAtual = null;
  let urlAtual = null;
  let rodada = 0;
  let controleAtual = null;
  let botaoAtual = null;

  chrome.storage.local.get(DEFAULTS, (v) => {
    CFG = { ...DEFAULTS, ...v };
    console.log(LOG, "config carregada", { ativo: CFG.ativo, voz: CFG.voz, keyPresente: !!CFG.apiKey });
  });
  chrome.storage.onChanged.addListener((mudancas) => {
    for (const [k, { newValue }] of Object.entries(mudancas)) {
      if (k in DEFAULTS) CFG[k] = newValue;
      if (k === "ativo" && newValue === false) pararAtual();
    }
    console.log(LOG, "config atualizada");
  });

  // Cancela a geração anterior para não ressuscitar áudio após o usuário parar.
  function pararAtual() {
    rodada += 1;
    if (controleAtual) { controleAtual.abort(); controleAtual = null; }
    if (botaoAtual) { botaoAtual.removeAttribute("data-cd-tocando"); botaoAtual = null; }
    if (audioAtual) { try { audioAtual.pause(); } catch {} audioAtual = null; }
    if (urlAtual) { URL.revokeObjectURL(urlAtual); urlAtual = null; }
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

  function authHeaders(key) {
    return {
      "content-type": "application/json",
      "authorization": `Bearer ${key}`,
      "x-arsenal-key": key,
      "x-api-key": key,
      "x-centraldark-surface": "centraldark-voice",
    };
  }

  async function pedirAudio(base, texto, signal) {
    if (texto.length > LIMITE_TRECHO) throw new Error("TTS_CHUNK_OVERFLOW");
    const response = await fetch(`${base}/v1/audio/speech`, {
      method: "POST",
      signal,
      headers: authHeaders(CFG.apiKey),
      body: JSON.stringify({
        model: CFG.modelo,
        voice: CFG.voz,
        input: texto,
        response_format: "mp3",
        instructions: CFG.instrucoes,
      }),
    });
    if (!response.ok) {
      const error = new Error(`TTS HTTP ${response.status}`);
      error.status = response.status;
      throw error;
    }
    return response.blob();
  }

  async function obterAudio(texto, signal) {
    try {
      const blob = await pedirAudio(API, texto, signal);
      console.log(LOG, "🟢 TTS via API oficial", API);
      return { blob, route: "CENTRAL_API" };
    } catch (primaryError) {
      if (signal.aborted || primaryError?.name === "AbortError") throw primaryError;
      // Erro do cliente, limite de uso ou parâmetro inválido não é falha de rota.
      if (primaryError?.status && primaryError.status < 500) throw primaryError;
      console.warn(LOG, "🧿 TTS_ROUTE_DRIFT: fallback legado", {
        status: primaryError?.status || "NETWORK",
      });
      const blob = await pedirAudio(LEGACY_BRIDGE, texto, signal);
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

    const trechos = separarTrechos(texto);
    if (!trechos.length) return false;
    pararAtual();
    const minhaRodada = rodada;
    const controlador = new AbortController();
    controleAtual = controlador;
    botaoAtual = botao || null;
    if (botao) botao.setAttribute("data-cd-tocando", "1");

    try {
      for (let indice = 0; indice < trechos.length; indice += 1) {
        if (controlador.signal.aborted || minhaRodada !== rodada) return null;
        const { blob, route } = await obterAudio(trechos[indice], controlador.signal);
        if (controlador.signal.aborted || minhaRodada !== rodada) return null;

        urlAtual = URL.createObjectURL(blob);
        const audio = new Audio(urlAtual);
        audioAtual = audio;
        // Se o usuário interrompe, o loop para antes de pedir a próxima parte.
        const fim = new Promise((resolve) => {
          audio.addEventListener("ended", () => resolve("ended"), { once: true });
          audio.addEventListener("error", () => resolve("error"), { once: true });
          controlador.signal.addEventListener("abort", () => resolve("cancel"), { once: true });
        });

        await audio.play();
        if (controlador.signal.aborted || minhaRodada !== rodada) return null;
        console.log(LOG, "tocando", { voz: CFG.voz, route, trecho: indice + 1, total: trechos.length });

        if (indice === trechos.length - 1) {
          fim.then((estado) => {
            if (minhaRodada === rodada && estado !== "cancel") pararAtual();
          });
          return true;
        }

        const estado = await fim;
        if (controlador.signal.aborted || minhaRodada !== rodada) return null;
        if (estado !== "ended") throw new Error("TTS_PLAYBACK_ERROR");
        audioAtual = null;
        URL.revokeObjectURL(urlAtual);
        urlAtual = null;
      }
      return true;
    } catch (e) {
      if (controlador.signal.aborted || minhaRodada !== rodada) return null;
      console.error(LOG, "🔴 TTS_ALL_ROUTES_FAILED", { status: e?.status || "NETWORK_OR_PLAYBACK" });
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
          // Cancelamento intencional nunca reativa a voz nativa.
          if (ok === false) original(utter);
        });
      };
      console.log(LOG, "speechSynthesis patched");
    }
  } catch (e) {
    console.warn(LOG, "não deu pra fazer patch em speechSynthesis", e);
  }

  console.log(LOG, "content script ativo em", location.host);
})();
