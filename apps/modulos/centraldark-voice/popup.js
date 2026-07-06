const BRIDGE = "https://bridge.centralldark.com";
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

// Carregar config
chrome.storage.local.get(DEFAULTS, (v) => {
  $("ativo").checked = v.ativo;
  $("apiKey").value = v.apiKey || "";
  $("voz").value = v.voz || "nova";
  $("instrucoes").value = v.instrucoes || DEFAULTS.instrucoes;
});

// Salvar
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

// Testar voz
$("testar").addEventListener("click", async () => {
  const key = $("apiKey").value.trim();
  if (!key) return status("⚠️ cola a chave primeiro", "erro");
  status("⏳ gerando áudio...");
  try {
    const r = await fetch(`${BRIDGE}/v1/audio/speech`, {
      method: "POST",
      headers: { "x-api-key": key, "content-type": "application/json" },
      body: JSON.stringify({
        model: DEFAULTS.modelo,
        voice: $("voz").value,
        input:
          "Opa Pivete! Aqui é a voz " +
          $("voz").value +
          " em português brasileiro nativo, direto do bridge CentralDark.",
        response_format: "mp3",
        instructions: $("instrucoes").value.trim() || DEFAULTS.instrucoes,
      }),
    });
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      return status(`❌ ${r.status}: ${t.slice(0, 80)}`, "erro");
    }
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.addEventListener("ended", () => URL.revokeObjectURL(url));
    await audio.play();
    status("🎧 tocando", "ok");
  } catch (e) {
    status("❌ " + e.message, "erro");
  }
});

// Toggle auto-save
$("ativo").addEventListener("change", () => {
  chrome.storage.local.set({ ativo: $("ativo").checked }, () => {
    status($("ativo").checked ? "✅ ativado" : "⏸️ pausado", "ok");
  });
});
