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

const $ = (id) => document.getElementById(id);
const status = (msg, tipo = "") => {
  const el = $("status");
  el.textContent = msg;
  el.className = "status " + tipo;
};

chrome.storage.local.get(DEFAULTS, (v) => {
  $("ativo").checked = v.ativo;
  $("apiKey").value = v.apiKey || "";
  $("voz").value = v.voz || "nova";
  $("instrucoes").value = v.instrucoes || DEFAULTS.instrucoes;
});

$("salvar").addEventListener("click", () => {
  const cfg = {
    ativo: $("ativo").checked,
    apiKey: $("apiKey").value.trim(),
    voz: $("voz").value,
    modelo: DEFAULTS.modelo,
    instrucoes: $("instrucoes").value.trim() || DEFAULTS.instrucoes,
  };
  chrome.storage.local.set(cfg, () => status("✅ salvo", "ok"));
});

function headers(key) {
  return {
    "authorization": `Bearer ${key}`,
    "x-arsenal-key": key,
    "x-api-key": key,
    "content-type": "application/json",
    "x-centraldark-surface": "centraldark-voice-popup",
  };
}

async function fetchSpeech(base, key, body) {
  const response = await fetch(`${base}/v1/audio/speech`, {
    method: "POST",
    headers: headers(key),
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`${response.status}: ${detail.slice(0, 100)}`);
  }
  return response.blob();
}

$("testar").addEventListener("click", async () => {
  const key = $("apiKey").value.trim();
  if (!key) return status("⚠️ configure a chave de entrada da Casa", "erro");

  const body = {
    model: DEFAULTS.modelo,
    voice: $("voz").value,
    input: "Opa Pivete! Teste de voz passando primeiro pela API oficial da CentralDark.",
    response_format: "mp3",
    instructions: $("instrucoes").value.trim() || DEFAULTS.instrucoes,
  };

  status("⏳ testando API oficial...");
  let blob;
  let route = "CENTRAL_API";
  try {
    blob = await fetchSpeech(API, key, body);
  } catch (primaryError) {
    console.warn("[CentralDark Voice] 🧿 TTS_ROUTE_DRIFT", primaryError);
    status("🟡 API falhou; testando bridge legado...");
    route = "LEGACY_BRIDGE_FALLBACK";
    try {
      blob = await fetchSpeech(LEGACY_BRIDGE, key, body);
    } catch (fallbackError) {
      return status(`❌ TTS_ALL_ROUTES_FAILED: ${fallbackError.message}`, "erro");
    }
  }

  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  audio.addEventListener("ended", () => URL.revokeObjectURL(url));
  try {
    await audio.play();
    status(route === "CENTRAL_API" ? "🎧 API oficial OK" : "🟡 bridge legado em uso", route === "CENTRAL_API" ? "ok" : "");
  } catch (error) {
    URL.revokeObjectURL(url);
    status(`❌ reprodução falhou: ${error.message}`, "erro");
  }
});

$("ativo").addEventListener("change", () => {
  chrome.storage.local.set({ ativo: $("ativo").checked }, () => {
    status($("ativo").checked ? "✅ ativado" : "⏸️ pausado", "ok");
  });
});