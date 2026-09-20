// Orquestrador principal: memória → debate rodada 1 → crítica rodada 2 → juiz rodada 3
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { chamarModelo, gerarEmbedding } from "../_shared/gateway.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { agent_id = "hermes", prompt, modo_economico = false } = await req.json();
    if (!prompt) return json({ error: "prompt é obrigatório" }, 400);

    const inicio = Date.now();
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 1) Carrega config do agente
    const { data: agente } = await supabase.from("agent_configs").select("*").eq("agent_id", agent_id).single();
    if (!agente) return json({ error: `agente ${agent_id} não encontrado` }, 404);

    // 2) Cria missão
    const { data: missao } = await supabase.from("missoes").insert({
      agent_id, prompt, status: "debatendo",
    }).select().single();

    // 3) Busca memória relevante via embedding
    const embedding = await gerarEmbedding(prompt);
    const { data: memorias } = await supabase.rpc("buscar_memoria_similar", {
      p_embedding: embedding,
      p_escopos: agente.escopos_memoria,
      p_limite: 6,
      p_similaridade_minima: 0.45,
    });

    const contextoMemoria = (memorias ?? []).length
      ? "MEMÓRIA RELEVANTE DO PIVETE (use se ajudar):\n" +
        (memorias ?? []).map((m: any, i: number) =>
          `[${i + 1}] (${m.tipo}) ${m.titulo}\n${m.conteudo.slice(0, 400)}`,
        ).join("\n\n")
      : "";

    const systemBase = `Você é o agente "${agente.nome}" (${agente.emoji}).
Tom: ${agente.tom}.
Responda em PT-BR, direto e útil.
${contextoMemoria ? "\n" + contextoMemoria : ""}`;

    // 4) Rodada 1 — debate paralelo (ou modo econômico = 1 modelo só)
    const modelosDebate = modo_economico ? [agente.modelos_debate[0]] : agente.modelos_debate;
    const messages1 = [{ role: "system", content: systemBase }, { role: "user", content: prompt }];

    const r1 = await Promise.allSettled(
      modelosDebate.map((m: string) => chamarModelo(m, messages1, { temperature: agente.temperature })),
    );

    const respostasR1 = r1.map((r, i) => ({
      modelo: modelosDebate[i],
      texto: r.status === "fulfilled" ? r.value.text : `[erro] ${(r as any).reason?.message}`,
      tokens: r.status === "fulfilled" ? r.value.tokens : 0,
      ms: r.status === "fulfilled" ? r.value.ms : 0,
      ok: r.status === "fulfilled",
    }));

    // Grava debates rodada 1
    for (const r of respostasR1) {
      await supabase.from("debates").insert({
        missao_id: missao.id, rodada: 1, modelo: r.modelo, resposta: r.texto,
        tokens: r.tokens, duracao_ms: r.ms, papel: "debatedor",
      });
    }

    let respostaFinal = respostasR1[0]?.texto ?? "";
    let tokensTotal = respostasR1.reduce((s, r) => s + r.tokens, 0);

    // 5) Rodada 2 + 3 (só no modo completo com 2+ modelos)
    if (!modo_economico && respostasR1.filter((r) => r.ok).length >= 2) {
      // Rodada 2 — cada modelo vê as outras respostas e critica
      const debate = respostasR1
        .filter((r) => r.ok)
        .map((r) => `## Resposta de ${r.modelo}:\n${r.texto}`)
        .join("\n\n---\n\n");

      const promptCritica = `Você é um dos participantes de um conselho de IAs debatendo esta pergunta do usuário:

PERGUNTA: ${prompt}

Aqui estão as respostas de todos os participantes (incluindo a sua):

${debate}

Sua tarefa: aponte concisamente (máx 5 linhas) os pontos onde as outras respostas erraram, se omitiram ou podem melhorar. Seja específico. Sem elogio vazio.`;

      const r2 = await Promise.allSettled(
        modelosDebate.map((m: string) =>
          chamarModelo(m, [{ role: "system", content: `Você é ${m}, participando de um debate crítico.` }, { role: "user", content: promptCritica }], { temperature: 0.5 }),
        ),
      );

      const criticas = r2.map((r, i) => ({
        modelo: modelosDebate[i],
        texto: r.status === "fulfilled" ? r.value.text : "",
        tokens: r.status === "fulfilled" ? r.value.tokens : 0,
        ms: r.status === "fulfilled" ? r.value.ms : 0,
      }));

      for (const c of criticas) {
        if (c.texto) {
          await supabase.from("debates").insert({
            missao_id: missao.id, rodada: 2, modelo: c.modelo, resposta: c.texto,
            tokens: c.tokens, duracao_ms: c.ms, papel: "critico",
          });
          tokensTotal += c.tokens;
        }
      }

      // Rodada 3 — juiz lê tudo e entrega resposta final
      const promptJuiz = `Você é o JUIZ deste conselho. Sua tarefa é entregar a MELHOR resposta final possível pro Pivete, fundindo o que cada participante trouxe de bom e descartando o que os outros criticaram com razão.

PERGUNTA ORIGINAL:
${prompt}

RESPOSTAS INICIAIS:
${debate}

CRÍTICAS CRUZADAS:
${criticas.map((c) => `## ${c.modelo} criticou:\n${c.texto}`).join("\n\n")}

Entregue a resposta final consolidada em PT-BR, direta, sem meta-comentário sobre o processo. Só a resposta.`;

      const juiz = await chamarModelo(agente.modelo_juiz, [
        { role: "system", content: systemBase },
        { role: "user", content: promptJuiz },
      ], { temperature: 0.4 });

      await supabase.from("debates").insert({
        missao_id: missao.id, rodada: 3, modelo: agente.modelo_juiz, resposta: juiz.text,
        tokens: juiz.tokens, duracao_ms: juiz.ms, papel: "juiz",
      });
      respostaFinal = juiz.text;
      tokensTotal += juiz.tokens;
    }

    // 6) Fecha missão
    await supabase.from("missoes").update({
      resposta_final: respostaFinal,
      status: "concluida",
      memorias_usadas: (memorias ?? []).map((m: any) => m.id),
      modelos_usados: modelosDebate,
      tokens_total: tokensTotal,
      duracao_ms: Date.now() - inicio,
      concluida_em: new Date().toISOString(),
    }).eq("id", missao.id);

    return json({
      missao_id: missao.id,
      resposta: respostaFinal,
      memorias_usadas: memorias?.length ?? 0,
      modelos: modelosDebate,
      tokens: tokensTotal,
      duracao_ms: Date.now() - inicio,
    });
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
