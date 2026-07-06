// Bridge OpenAI-compatível → Lovable AI Gateway (COMPLETO)
// Usado pelo Open WebUI (ui.centralldark.com) e qualquer cliente OpenAI-compat.
// Cobre: chat, imagens, TTS, STT (transcrição) e embeddings.
// A LOVABLE_API_KEY nunca sai do ambiente Lovable Cloud.

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const LOVABLE_BASE = "https://ai.gateway.lovable.dev/v1";
const LOVABLE_KEY = Deno.env.get("LOVABLE_API_KEY");
const BRIDGE_SECRET = Deno.env.get("WEBUI_LOVABLE_KEY");

// --- Catálogo de modelos exposto no /v1/models ---
// Modelos de chat (Open WebUI usa esses no dropdown principal)
const CHAT_MODELS = [
  "google/gemini-3-flash-preview",
  "google/gemini-3.1-pro-preview",
  "google/gemini-3.1-flash-lite",
  "google/gemini-3.5-flash",
  "google/gemini-2.5-pro",
  "google/gemini-2.5-flash",
  "google/gemini-2.5-flash-lite",
  "openai/gpt-5",
  "openai/gpt-5-mini",
  "openai/gpt-5-nano",
  "openai/gpt-5.2",
  "openai/gpt-5.4",
  "openai/gpt-5.4-mini",
  "openai/gpt-5.4-nano",
  "openai/gpt-5.4-pro",
  "openai/gpt-5.5",
  "openai/gpt-5.5-pro",
];
// Modelos de imagem — mostrados no dropdown pra quem quiser usar direto
const IMAGE_MODELS = [
  "openai/gpt-image-2",
  "openai/gpt-image-1-mini",
  "google/gemini-2.5-flash-image",
  "google/gemini-3-pro-image",
  "google/gemini-3.1-flash-image",
];
// Modelos de áudio (TTS/STT)
const AUDIO_MODELS = [
  "openai/gpt-4o-mini-tts",
  "openai/gpt-4o-mini-transcribe",
  "openai/gpt-4o-transcribe",
];
// Embeddings
const EMBED_MODELS = [
  "google/gemini-embedding-001",
  "google/gemini-embedding-2",
  "openai/text-embedding-3-small",
  "openai/text-embedding-3-large",
];
const TODOS_MODELOS = [
  ...CHAT_MODELS,
  ...IMAGE_MODELS,
  ...AUDIO_MODELS,
  ...EMBED_MODELS,
];

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function autorizado(req: Request): boolean {
  if (!BRIDGE_SECRET) return false;
  const auth = req.headers.get("authorization") || "";
  const chave = auth.replace(/^Bearer\s+/i, "").trim();
  return chave === BRIDGE_SECRET;
}

// Repassa a chamada pro Lovable Gateway trocando o header de auth
async function proxy(subpath: string, req: Request): Promise<Response> {
  const upstream = new URL(LOVABLE_BASE + subpath);
  // Preserva query string
  const src = new URL(req.url);
  src.searchParams.forEach((v, k) => upstream.searchParams.set(k, v));

  // Copia headers relevantes; troca Authorization pelo Lovable-API-Key
  const headers = new Headers();
  const ct = req.headers.get("content-type");
  if (ct) headers.set("Content-Type", ct);
  const accept = req.headers.get("accept");
  if (accept) headers.set("Accept", accept);
  headers.set("Lovable-API-Key", LOVABLE_KEY!);
  headers.set("X-Lovable-AIG-SDK", "openai-webui-bridge");

  const init: RequestInit = { method: req.method, headers };
  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = req.body;
    // @ts-ignore Deno aceita duplex pra body streamável
    init.duplex = "half";
  }

  const res = await fetch(upstream.toString(), init);

  // Resposta streamada de volta com content-type original
  const outHeaders = new Headers(corsHeaders);
  const upCT = res.headers.get("Content-Type");
  if (upCT) outHeaders.set("Content-Type", upCT);
  return new Response(res.body, { status: res.status, headers: outHeaders });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  if (!LOVABLE_KEY) return json({ error: "LOVABLE_API_KEY ausente no ambiente" }, 500);
  if (!BRIDGE_SECRET) return json({ error: "WEBUI_LOVABLE_KEY ausente no ambiente" }, 500);
  if (!autorizado(req)) return json({ error: "Chave inválida" }, 401);

  // Normaliza o path removendo prefixos do Supabase
  const url = new URL(req.url);
  const path = url.pathname
    .replace(/^\/functions\/v1/, "")
    .replace(/^\/openai-lovable-bridge/, "");

  // --- GET /v1/models ---
  if (req.method === "GET" && path.endsWith("/models")) {
    return json({
      object: "list",
      data: TODOS_MODELOS.map((id) => ({
        id,
        object: "model",
        created: Math.floor(Date.now() / 1000),
        owned_by: id.split("/")[0],
      })),
    });
  }

  // --- Rotas OpenAI-compat: chat / imagens / áudio / embeddings ---
  const rotasSuportadas = [
    "/chat/completions",
    "/completions",
    "/images/generations",
    "/images/edits",
    "/audio/speech",
    "/audio/transcriptions",
    "/audio/translations",
    "/embeddings",
  ];
  for (const rota of rotasSuportadas) {
    if (path.endsWith(rota)) {
      return await proxy("/v1" + rota, req);
    }
  }

  return json({ error: "Rota não encontrada", path }, 404);
});
