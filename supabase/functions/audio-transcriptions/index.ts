// audio-transcriptions — proxy STT para Lovable AI Gateway
// Recebe multipart/form-data (file + model) e encaminha para o gateway
// Usado pelo Open WebUI em api.centralldark.com

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/audio/transcriptions";
const DEFAULT_MODEL = "openai/gpt-4o-mini-transcribe";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) {
      return json({ error: "LOVABLE_API_KEY não configurada" }, 500);
    }

    if (req.method !== "POST") {
      return json({ error: "Use POST com multipart/form-data" }, 405);
    }

    const contentType = req.headers.get("content-type") || "";

    // Se veio como multipart, reenvia direto
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      
      // Garante que tem model
      if (!formData.has("model")) {
        formData.set("model", DEFAULT_MODEL);
      }
      
      // Garante prefixo do modelo
      const model = formData.get("model") as string;
      if (model && !model.includes("/")) {
        formData.set("model", `openai/${model}`);
      }

      const upstream = await fetch(GATEWAY_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${key}`,
        },
        body: formData,
      });

      // Se é streaming (SSE), repassa direto
      const upstreamContentType = upstream.headers.get("content-type") || "";
      if (upstreamContentType.includes("text/event-stream")) {
        return new Response(upstream.body, {
          status: upstream.status,
          headers: {
            ...corsHeaders,
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
          },
        });
      }

      // Resposta normal (JSON)
      if (!upstream.ok) {
        const t = await upstream.text();
        return json({ error: "gateway_error", status: upstream.status, detail: t.slice(0, 500) }, upstream.status >= 500 ? 502 : upstream.status);
      }

      const data = await upstream.json();
      return json(data);
    }

    // Se veio como JSON (alguns clientes fazem isso), tenta converter
    if (contentType.includes("application/json")) {
      return json({ error: "Use multipart/form-data com campo 'file' (áudio) e 'model'" }, 400);
    }

    return json({ error: "Content-Type deve ser multipart/form-data" }, 400);

  } catch (e) {
    return json({ error: "internal", detail: String(e?.message ?? e) }, 500);
  }
});

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
