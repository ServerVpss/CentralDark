// audio-speech — ponte TTS (texto -> voz) para o Lovable AI Gateway
// Aceita o formato OpenAI (/v1/audio/speech) e devolve áudio.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/audio/speech";
const MODELO_PADRAO = "openai/gpt-4o-mini-tts";
const MODELOS_ACEITOS = new Set([
  "openai/gpt-4o-mini-tts",
  "google/gemini-2.5-flash-tts",
  "google/gemini-2.5-pro-tts",
]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const chave = Deno.env.get("LOVABLE_API_KEY");
    if (!chave) return json({ error: "LOVABLE_API_KEY não configurada" }, 500);
    if (req.method !== "POST") return json({ error: "Use POST com JSON" }, 405);

    const corpo = await req.json().catch(() => null);
    if (!corpo || typeof corpo.input !== "string" || !corpo.input.trim()) {
      return json({ error: "Campo 'input' (texto) é obrigatório" }, 400);
    }

    // normaliza o modelo: nomes antigos (tts-1) caem no padrão
    let modelo = typeof corpo.model === "string" ? corpo.model : "";
    if (modelo && !modelo.includes("/")) modelo = `openai/${modelo}`;
    if (!MODELOS_ACEITOS.has(modelo)) modelo = MODELO_PADRAO;

    const streaming = corpo.stream_format === "sse";

    const upstream = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${chave}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelo,
        input: corpo.input.slice(0, 4000),
        voice: corpo.voice || "alloy",
        ...(corpo.instructions ? { instructions: corpo.instructions } : {}),
        ...(corpo.speed ? { speed: corpo.speed } : {}),
        ...(streaming
          ? { stream_format: "sse", response_format: "pcm" }
          : { response_format: corpo.response_format || "mp3" }),
      }),
    });

    if (!upstream.ok) {
      const detalhe = await upstream.text().catch(() => "");
      return json(
        { error: "gateway_error", status: upstream.status, detalhe: detalhe.slice(0, 500) },
        upstream.status >= 500 ? 502 : upstream.status,
      );
    }

    if (streaming) {
      return new Response(upstream.body, {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
      });
    }

    return new Response(upstream.body, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": upstream.headers.get("content-type") || "audio/mpeg",
      },
    });
  } catch (e) {
    return json({ error: "internal", detalhe: String((e as Error)?.message ?? e) }, 500);
  }
});

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
