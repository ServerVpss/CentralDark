// CentralDark Voice — worker MV3 existente: transporte TTS com escopo fixo.
// Sem URL arbitrária enviada pelo site; sem credenciais no content script.
const API = "https://api.centralldark.com";
const LEGACY_BRIDGE = "https://bridge.centralldark.com";
const LEGACY_INSTRUCTIONS = "Fale em português brasileiro nativo, tom natural e conversacional. Pronuncie tudo em PT-BR.";
const JARVIS_INSTRUCTIONS = "Fale em português brasileiro natural, com cadência baiana leve e humor de Zé malandro, sem caricatura. Preserve o texto original, incluindo palavrões coloquiais e termos técnicos; use pausas e firmeza nos comandos de JARVIS.";
const DEFAULTS = {
  apiKey: "", voz: "nova", modelo: "openai/gpt-4o-mini-tts",
  instrucoes: JARVIS_INSTRUCTIONS, ativo: true,
};
const PENDENTES = new Map();

function origemPermitida(sender) {
  if (!sender?.tab || sender.id !== chrome.runtime.id) return false;
  try {
    const url = new URL(sender.url || "");
    return url.protocol === "https:" && ["claude.ai", "claude.com"].includes(url.hostname);
  } catch {
    return false;
  }
}

function chaveEscopo(sender) {
  return String(sender.tab.id) + ":" + String(sender.frameId ?? 0);
}

function erroSeguro(status, code) {
  const erro = new Error(code || ("TTS_HTTP_" + status));
  erro.status = status;
  return erro;
}

function codificarBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  const blocos = [];
  for (let i = 0; i < bytes.length; i += 32768) {
    blocos.push(String.fromCharCode(...bytes.subarray(i, i + 32768)));
  }
  return btoa(blocos.join(""));
}

async function pedirAudio(base, cfg, input, signal) {
  const key = cfg.apiKey;
  const resposta = await fetch(base + "/v1/audio/speech", {
    method: "POST", credentials: "omit", signal,
    headers: {
      "content-type": "application/json", authorization: "Bearer " + key,
      "x-arsenal-key": key, "x-api-key": key,
      "x-centraldark-surface": "centraldark-voice",
    },
    body: JSON.stringify({
      model: cfg.modelo, voice: cfg.voz, input, instructions: cfg.instrucoes,
      response_format: "mp3",
    }),
  });
  if (!resposta.ok) throw erroSeguro(resposta.status);
  const contentType = resposta.headers?.get?.("content-type") || "";
  if (contentType && !/^(audio\/|application\/octet-stream)/i.test(contentType)) {
    throw erroSeguro(502, "TTS_INVALID_AUDIO_RESPONSE");
  }
  const buffer = await resposta.arrayBuffer();
  if (!buffer.byteLength) throw erroSeguro(502, "TTS_EMPTY_AUDIO");
  return codificarBase64(buffer);
}

async function sintetizar(cfg, input, signal) {
  try {
    return { base64: await pedirAudio(API, cfg, input, signal), route: "CENTRAL_API" };
  } catch (erro) {
    if (signal.aborted || erro?.name === "AbortError") throw erro;
    // Erros da requisição não são justificativa para reenviar chaves a outro host.
    if (erro.status && ![404, 408, 500, 502, 503, 504].includes(erro.status)) throw erro;
    return { base64: await pedirAudio(LEGACY_BRIDGE, cfg, input, signal), route: "LEGACY_BRIDGE_FALLBACK" };
  }
}

chrome.runtime.onMessage.addListener((mensagem, sender, sendResponse) => {
  if (!origemPermitida(sender)) return false;
  if (mensagem?.type === "CD_VOICE_CANCEL") {
    const escopo = chaveEscopo(sender);
    const pendente = PENDENTES.get(escopo);
    if (pendente?.id === mensagem.requestId) {
      pendente.controller.abort();
      pendente.responder({ ok: false, error: "CANCELED" });
      PENDENTES.delete(escopo);
    }
    sendResponse({ ok: true });
    return false;
  }
  if (mensagem?.type !== "CD_VOICE_SPEAK") return false;
  const { requestId, texto } = mensagem;
  if (typeof requestId !== "string" || !/^[0-9-]{1,48}$/.test(requestId) ||
      typeof texto !== "string" || !texto.trim() || texto.length > 4000) {
    sendResponse({ ok: false, error: "INVALID_SPEECH_REQUEST" });
    return false;
  }

  const escopo = chaveEscopo(sender);
  const anterior = PENDENTES.get(escopo);
  if (anterior) {
    anterior.controller.abort();
    anterior.responder({ ok: false, error: "CANCELED" });
  }
  const controller = new AbortController();
  let respondeu = false;
  const responder = (resultado) => {
    if (respondeu) return;
    respondeu = true;
    sendResponse(resultado);
  };
  PENDENTES.set(escopo, { id: requestId, controller, responder });

  (async () => {
    try {
      const cfg = { ...DEFAULTS, ...await chrome.storage.local.get(DEFAULTS) };
      if (!cfg.ativo) throw erroSeguro(403, "VOICE_DISABLED");
      if (typeof cfg.apiKey !== "string" || !cfg.apiKey) {
        throw erroSeguro(401, "VOICE_KEY_MISSING");
      }
      if (cfg.instrucoes === LEGACY_INSTRUCTIONS) cfg.instrucoes = JARVIS_INSTRUCTIONS;
      const audio = await sintetizar(cfg, texto, controller.signal);
      if (controller.signal.aborted) return;
      responder({ ok: true, ...audio });
    } catch (erro) {
      if (!controller.signal.aborted) {
        responder({ ok: false, error: erro?.message || "TTS_ERROR" });
      }
    } finally {
      if (PENDENTES.get(escopo)?.id === requestId) PENDENTES.delete(escopo);
    }
  })();
  return true;
});

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  if (!["install", "update"].includes(reason)) return;
  try {
    const v = await chrome.storage.local.get(["instrucoes"]);
    if (!v.instrucoes || v.instrucoes === LEGACY_INSTRUCTIONS) {
      await chrome.storage.local.set({ instrucoes: JARVIS_INSTRUCTIONS });
    }
  } catch {
    console.warn("[CentralDark Voice] Perfil de voz depende de configuração local.");
  }
});


[executed on device: CENTRALDARK-OS (809020f9-c77d-4bef-bb06-da5b467ac9b7)]