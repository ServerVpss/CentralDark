// Edge function: recebe lista de arquivos da VPS e devolve grafo JSON usando IA.
// A VPS não precisa de LOVABLE_API_KEY — a chave fica só aqui, no servidor.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const MODEL = "google/gemini-3-flash-preview";
const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "LOVABLE_API_KEY ausente no ambiente da edge function" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  let body: { files?: Array<{ path: string; ext?: string; size?: number }>; hint?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "JSON inválido no corpo da requisição" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const files = Array.isArray(body.files) ? body.files.slice(0, 250) : [];
  if (files.length === 0) {
    return new Response(
      JSON.stringify({ error: "campo 'files' vazio ou ausente" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const prompt =
    "Monte um grafo JSON para estes arquivos. Responda SOMENTE JSON válido com as chaves 'nodes' e 'edges'. " +
    "Cada node: {id, label, group}. Cada edge: {from, to}. Agrupe por módulo funcional (bot, mcp, infra, docs, frontend, etc).\n" +
    (body.hint ? `Contexto: ${body.hint}\n` : "") +
    JSON.stringify(files);

  const started = Date.now();
  try {
    const upstream = await fetch(GATEWAY, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
        "X-Lovable-AIG-SDK": "graph-panel-edge",
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.1,
        messages: [
          {
            role: "system",
            content:
              "Você gera JSON seguro para grafo de dependências. Nunca inclua secrets, tokens ou caminhos sensíveis. Responda SOMENTE JSON válido, sem markdown, sem crases.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (upstream.status === 429) {
      return new Response(
        JSON.stringify({ error: "rate_limited", detail: "Limite do gateway atingido, tente em instantes." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (upstream.status === 402) {
      return new Response(
        JSON.stringify({ error: "credits_exhausted", detail: "Créditos do workspace esgotados." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (!upstream.ok) {
      const text = await upstream.text();
      return new Response(
        JSON.stringify({ error: "gateway_error", status: upstream.status, detail: text.slice(0, 500) }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const payload = await upstream.json();
    let content: string = payload?.choices?.[0]?.message?.content ?? "";
    content = content.trim();
    if (content.startsWith("```")) {
      content = content.replace(/^```(?:json)?\s*/i, "").replace(/```$/, "").trim();
    }

    let graph: { nodes?: unknown[]; edges?: unknown[] };
    try {
      graph = JSON.parse(content);
    } catch {
      return new Response(
        JSON.stringify({ error: "modelo devolveu JSON inválido", raw: content.slice(0, 400) }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) {
      return new Response(
        JSON.stringify({ error: "estrutura do grafo inválida (esperado nodes[] e edges[])" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const meta = {
      source: "lovable-edge",
      backend: "edge-function",
      model: MODEL,
      generatedAt: new Date().toISOString(),
      durationMs: Date.now() - started,
      inputFiles: files.length,
    };

    return new Response(JSON.stringify({ ...graph, meta }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "falha inesperada", detail: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
