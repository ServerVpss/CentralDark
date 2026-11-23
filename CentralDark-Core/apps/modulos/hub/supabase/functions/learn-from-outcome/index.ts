// Auto-aprendizado: lê missões recentes e extrai regras novas pra memória
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { chamarModelo, gerarEmbedding } from "../_shared/gateway.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { horas = 24 } = await req.json().catch(() => ({}));
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const desde = new Date(Date.now() - horas * 3600 * 1000).toISOString();
    const { data: missoes } = await supabase
      .from("missoes")
      .select("id, prompt, resposta_final, outcome, outcome_nota")
      .gte("created_at", desde)
      .not("outcome", "is", null)
      .limit(50);

    if (!missoes?.length) return json({ aprendizados: 0, mensagem: "sem missões com feedback" });

    const dossie = missoes.map((m, i) =>
      `[${i + 1}] Prompt: ${m.prompt.slice(0, 200)}\nResposta: ${m.resposta_final?.slice(0, 300)}\nResultado: ${m.outcome}${m.outcome_nota ? ` (${m.outcome_nota})` : ""}`,
    ).join("\n\n");

    const { text: analise } = await chamarModelo("openai/gpt-5", [
      { role: "system", content: "Você extrai padrões e regras práticas de missões executadas. Responda APENAS em JSON válido: {\"regras\":[{\"titulo\":\"...\",\"conteudo\":\"...\",\"escopo\":\"global|infra|ui|ia|deploy\"}]}. Máximo 5 regras novas e realmente úteis." },
      { role: "user", content: `Analise estas missões e extraia até 5 regras novas que valeria a pena gravar na memória permanente:\n\n${dossie}` },
    ], { temperature: 0.3 });

    let regras: Array<{ titulo: string; conteudo: string; escopo: string }> = [];
    try {
      const jsonMatch = analise.match(/\{[\s\S]*\}/);
      if (jsonMatch) regras = JSON.parse(jsonMatch[0]).regras ?? [];
    } catch { /* silencioso */ }

    let gravadas = 0;
    for (const r of regras) {
      if (!r.titulo || !r.conteudo) continue;
      const emb = await gerarEmbedding(`${r.titulo}\n${r.conteudo}`);
      await supabase.from("memoria_vetorial").insert({
        tipo: "aprendizado",
        titulo: r.titulo,
        conteudo: r.conteudo,
        escopo: r.escopo || "global",
        embedding: emb,
        origem: "auto-learn",
        relevancia: "media",
      });
      gravadas++;
    }

    return json({ aprendizados: gravadas, analisadas: missoes.length });
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
