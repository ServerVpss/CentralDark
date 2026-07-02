// Edge function: agent-log
// Recebe eventos dos agentes (VPS, MCP, bots) e grava em public.agent_events.
// Autenticação via header X-Agent-Secret (evita spam externo).
// Uso:
//   curl -X POST https://<proj>.supabase.co/functions/v1/agent-log \
//        -H "X-Agent-Secret: $AGENT_LOG_SECRET" \
//        -H "Content-Type: application/json" \
//        -d '{"agent":"MCP","area":"VPS","acao":"editou config","alvo":"nginx.conf","status":"sucesso"}'

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-agent-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const STATUS_VALIDOS = new Set(["info", "sucesso", "erro", "aviso", "protegido"]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "método não suportado" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const segredo = Deno.env.get("AGENT_LOG_SECRET");
  if (!segredo) {
    return new Response(JSON.stringify({ error: "AGENT_LOG_SECRET não configurado" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const enviado = req.headers.get("x-agent-secret");
  if (enviado !== segredo) {
    return new Response(JSON.stringify({ error: "não autorizado" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let corpo: any;
  try {
    corpo = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "JSON inválido" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const agent = String(corpo.agent ?? "").trim().slice(0, 60);
  const area = String(corpo.area ?? "").trim().slice(0, 60);
  const acao = String(corpo.acao ?? "").trim().slice(0, 500);
  const alvo = corpo.alvo ? String(corpo.alvo).slice(0, 500) : null;
  const status = STATUS_VALIDOS.has(corpo.status) ? corpo.status : "info";
  const metadata = corpo.metadata && typeof corpo.metadata === "object" ? corpo.metadata : {};

  if (!agent || !area || !acao) {
    return new Response(JSON.stringify({ error: "agent, area e acao são obrigatórios" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supa = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data, error } = await supa
    .from("agent_events")
    .insert({ agent, area, acao, alvo, status, metadata })
    .select("id, ts")
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true, ...data }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
