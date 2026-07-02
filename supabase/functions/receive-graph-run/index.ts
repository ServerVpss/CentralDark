// Edge function: recebe o resultado do pipeline do Graph Panel vindo da VPS
// e persiste na tabela public.graph_runs.
//
// Autenticação: header X-Ingest-Token deve bater com GRAPH_INGEST_TOKEN (secret).
// Não usa JWT do usuário — a VPS envia como serviço.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-ingest-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface IngestPayload {
  graph_json: unknown;
  report_md?: string;
  audit_md?: string;
  stats?: Record<string, unknown>;
  backend?: string;
  model?: string;
  nodes_count?: number;
  edges_count?: number;
  communities_count?: number;
  duration_seconds?: number;
  status?: string;
  source?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Método não permitido" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const ingestToken = Deno.env.get("GRAPH_INGEST_TOKEN");
  const supplied = req.headers.get("x-ingest-token");
  if (!ingestToken || !supplied || supplied !== ingestToken) {
    return new Response(
      JSON.stringify({ error: "Token de ingestão inválido" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  let payload: IngestPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Corpo inválido (JSON malformado)" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  if (!payload.graph_json || typeof payload.graph_json !== "object") {
    return new Response(
      JSON.stringify({ error: "Campo graph_json obrigatório e precisa ser objeto" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const supabase = createClient(
    Deno.env.get("HUB_SUPABASE_URL") ?? "",
    Deno.env.get("HUB_SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  const { data, error } = await supabase
    .from("graph_runs")
    .insert({
      source: payload.source ?? "vps",
      backend: payload.backend ?? "lovable-ai-gateway",
      model: payload.model ?? "google/gemini-3-flash-preview",
      graph_json: payload.graph_json,
      report_md: payload.report_md ?? null,
      audit_md: payload.audit_md ?? null,
      stats: payload.stats ?? {},
      nodes_count: payload.nodes_count ?? 0,
      edges_count: payload.edges_count ?? 0,
      communities_count: payload.communities_count ?? 0,
      duration_seconds: payload.duration_seconds ?? null,
      status: payload.status ?? "success",
    })
    .select("id, created_at")
    .single();

  if (error) {
    console.error("Erro ao inserir graph_run:", error);
    return new Response(
      JSON.stringify({ error: "Falha ao salvar", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  // Mantém só os últimos 20 runs (limpeza automática pra não estourar).
  await supabase
    .from("graph_runs")
    .delete()
    .lt(
      "created_at",
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    );

  return new Response(
    JSON.stringify({ ok: true, id: data.id, created_at: data.created_at }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
