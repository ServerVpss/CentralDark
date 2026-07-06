// Edge Function: testador de conexão pro painel Bridge Config
// Aceita 3 modos: "lovable-direct", "bridge-vps", "custom"
// e 2 ações: "chat" (mensagem de teste) e "models" (listar catálogo)

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const LOVABLE_URL = "https://ai.gateway.lovable.dev/v1";
const LOVABLE_KEY = Deno.env.get("LOVABLE_API_KEY") ?? "";

// Catálogo oficial que o bridge Lovable serve
const CATALOGO_LOVABLE = {
  chat: [
    "google/gemini-3-flash-preview", "google/gemini-3.1-pro-preview",
    "google/gemini-3.1-flash-lite", "google/gemini-3.5-flash",
    "google/gemini-2.5-pro", "google/gemini-2.5-flash", "google/gemini-2.5-flash-lite",
    "openai/gpt-5", "openai/gpt-5-mini", "openai/gpt-5-nano",
    "openai/gpt-5.2", "openai/gpt-5.4", "openai/gpt-5.4-mini",
    "openai/gpt-5.4-nano", "openai/gpt-5.4-pro", "openai/gpt-5.5", "openai/gpt-5.5-pro",
  ],
  image: [
    "openai/gpt-image-2", "openai/gpt-image-1-mini",
    "google/gemini-2.5-flash-image", "google/gemini-3-pro-image", "google/gemini-3.1-flash-image",
  ],
  audio: ["openai/gpt-4o-mini-tts", "openai/gpt-4o-mini-transcribe", "openai/gpt-4o-transcribe"],
  embedding: [
    "google/gemini-embedding-001", "google/gemini-embedding-2",
    "openai/text-embedding-3-small", "openai/text-embedding-3-large",
  ],
};

const CATALOGO_AP7 = [
  "opus-4.8", "opus-4.8[1m]", "sonnet-4.6", "sonnet-4.6[1m]", "haiku-4.6",
  "gpt-5.5", "gpt-5.4", "gemini-3-pro", "gpt-4o",
];

function jsonResp(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const { modo = "lovable-direct", acao = "chat", url, key, modelo, prompt } = body;

    // --- Ação MODELS: devolve catálogo esperado ---
    if (acao === "models") {
      if (modo === "lovable-direct" || modo === "bridge-vps") {
        const todos = [
          ...CATALOGO_LOVABLE.chat.map((id) => ({ id, tipo: "chat" })),
          ...CATALOGO_LOVABLE.image.map((id) => ({ id, tipo: "image" })),
          ...CATALOGO_LOVABLE.audio.map((id) => ({ id, tipo: "audio" })),
          ...CATALOGO_LOVABLE.embedding.map((id) => ({ id, tipo: "embedding" })),
        ];
        return jsonResp(200, { ok: true, modo, total: todos.length, modelos: todos });
      }
      if (modo === "ap7") {
        return jsonResp(200, {
          ok: true, modo, total: CATALOGO_AP7.length,
          modelos: CATALOGO_AP7.map((id) => ({ id, tipo: "chat" })),
        });
      }
      // custom: tenta fetch real
      if (!url || !key) return jsonResp(400, { ok: false, erro: "url e key obrigatórios para custom" });
      const r = await fetch(`${url.replace(/\/$/, "")}/models`, {
        headers: { Authorization: `Bearer ${key}` },
      });
      const raw = await r.text();
      try {
        const j = JSON.parse(raw);
        return jsonResp(200, { ok: r.ok, http: r.status, modelos: j.data ?? j });
      } catch {
        return jsonResp(200, { ok: false, http: r.status, resposta_bruta: raw.slice(0, 500) });
      }
    }

    // --- Ação CHAT: manda mensagem de teste ---
    const mensagem = prompt || "Diga apenas: bridge respondendo OK";
    let alvoUrl: string;
    let headers: Record<string, string>;
    let modeloUsado = modelo || "google/gemini-3-flash-preview";

    if (modo === "lovable-direct") {
      if (!LOVABLE_KEY) return jsonResp(500, { ok: false, erro: "LOVABLE_API_KEY não configurada" });
      alvoUrl = `${LOVABLE_URL}/chat/completions`;
      headers = { "Content-Type": "application/json", "Lovable-API-Key": LOVABLE_KEY };
    } else if (modo === "ap7" || modo === "custom" || modo === "bridge-vps") {
      if (!url || !key) return jsonResp(400, { ok: false, erro: "url e key obrigatórios" });
      alvoUrl = `${url.replace(/\/$/, "")}/chat/completions`;
      headers = { "Content-Type": "application/json", Authorization: `Bearer ${key}` };
    } else {
      return jsonResp(400, { ok: false, erro: `modo inválido: ${modo}` });
    }

    const t0 = Date.now();
    const upstream = await fetch(alvoUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: modeloUsado,
        messages: [{ role: "user", content: mensagem }],
        stream: false,
      }),
    });
    const tempo = Date.now() - t0;
    const respostaTexto = await upstream.text();
    let respostaJson: any = null;
    try { respostaJson = JSON.parse(respostaTexto); } catch { /* mantém texto */ }

    if (!upstream.ok) {
      return jsonResp(200, {
        ok: false, http: upstream.status, tempo_ms: tempo,
        erro: respostaJson?.error?.message || respostaJson?.error || respostaTexto.slice(0, 400),
        modelo: modeloUsado, modo,
      });
    }

    const conteudo = respostaJson?.choices?.[0]?.message?.content || "(sem conteúdo)";
    return jsonResp(200, {
      ok: true, http: upstream.status, tempo_ms: tempo,
      modelo: modeloUsado, modo, resposta: conteudo,
    });
  } catch (e) {
    return jsonResp(500, { ok: false, erro: String((e as Error).message || e) });
  }
});
