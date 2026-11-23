// Busca semântica de memória por embedding
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { gerarEmbedding } from "../_shared/gateway.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { tarefa, escopos = ["global"], limite = 8, similaridade_minima = 0.5 } = await req.json();
    if (!tarefa) return json({ error: "tarefa é obrigatória" }, 400);

    const embedding = await gerarEmbedding(tarefa);
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data, error } = await supabase.rpc("buscar_memoria_similar", {
      p_embedding: embedding,
      p_escopos: escopos,
      p_limite: limite,
      p_similaridade_minima: similaridade_minima,
    });

    if (error) throw error;
    return json({ memorias: data ?? [] });
  } catch (e) {
    return json({ error: String(e.message ?? e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
