// Edge function: Hermes Cascade
// Recebe uma missão e cascateia por 4 cérebros (Flash → Pro → GPT → Elite)
// via Lovable AI Gateway, transmitindo cada etapa por SSE.
// Isso é o "modo painel" — quando o daemon Hermes da VPS expuser HTTP,
// dá pra apontar essa função pra lá; a interface do painel não muda.

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

// Os 4 cérebros — cada um com seu papel na cascata
const CEREBROS = [
  {
    id: "flash",
    nome: "Flash",
    cor: "#22d3ee", // ciano
    modelo: "google/gemini-3-flash-preview",
    papel: "Rascunho rápido e cru da missão. Direto, sem enfeite, em 2-4 linhas.",
  },
  {
    id: "pro",
    nome: "Pro",
    cor: "#a78bfa", // roxo
    modelo: "google/gemini-3.1-pro-preview",
    papel: "Refina o rascunho do Flash. Corrige erros, adiciona precisão técnica e contexto.",
  },
  {
    id: "gpt",
    nome: "GPT",
    cor: "#34d399", // verde
    modelo: "openai/gpt-5-mini",
    papel: "Traz um ângulo diferente. Aponta o que os anteriores esqueceram ou erraram.",
  },
  {
    id: "elite",
    nome: "Elite",
    cor: "#f59e0b", // dourado
    modelo: "openai/gpt-5",
    papel: "Síntese final. Une o melhor de todos e entrega a resposta polida em PT-BR.",
  },
] as const;

interface EtapaAnterior {
  cerebro: string;
  resposta: string;
}

function montarPrompt(missao: string, anteriores: EtapaAnterior[], papel: string): string {
  if (anteriores.length === 0) {
    return `MISSÃO DO USUÁRIO:\n${missao}\n\nSEU PAPEL: ${papel}`;
  }
  const contexto = anteriores
    .map((a) => `[${a.cerebro}]:\n${a.resposta}`)
    .join("\n\n---\n\n");
  return `MISSÃO ORIGINAL:\n${missao}\n\nRESPOSTAS ANTERIORES DA CASCATA:\n\n${contexto}\n\nSEU PAPEL: ${papel}`;
}

async function chamarCerebro(
  modelo: string,
  prompt: string,
): Promise<string> {
  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${LOVABLE_API_KEY}`,
    },
    body: JSON.stringify({
      model: modelo,
      messages: [
        {
          role: "system",
          content: "Você é um dos 4 cérebros do Hermes. Responda em PT-BR, direto, sem enrolação. Máximo 6 linhas.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`Gateway ${resp.status}: ${txt.slice(0, 200)}`);
  }
  const data = await resp.json();
  return data.choices?.[0]?.message?.content ?? "(sem resposta)";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (!LOVABLE_API_KEY) {
    return new Response(JSON.stringify({ erro: "LOVABLE_API_KEY não configurada" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let missao = "";
  try {
    const body = await req.json();
    missao = String(body.missao ?? "").trim();
  } catch {
    return new Response(JSON.stringify({ erro: "JSON inválido" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!missao) {
    return new Response(JSON.stringify({ erro: "missao vazia" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // SSE — vai emitindo eventos conforme cada cérebro responde
  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      const send = (evento: string, dados: unknown) => {
        controller.enqueue(
          enc.encode(`event: ${evento}\ndata: ${JSON.stringify(dados)}\n\n`),
        );
      };

      const anteriores: EtapaAnterior[] = [];

      send("inicio", { missao, cerebros: CEREBROS.map((c) => ({ id: c.id, nome: c.nome, cor: c.cor })) });

      for (const c of CEREBROS) {
        const t0 = Date.now();
        send("processando", { id: c.id });
        try {
          const prompt = montarPrompt(missao, anteriores, c.papel);
          const resposta = await chamarCerebro(c.modelo, prompt);
          const ms = Date.now() - t0;
          anteriores.push({ cerebro: c.nome, resposta });
          send("resposta", { id: c.id, nome: c.nome, resposta, ms });
        } catch (e) {
          const ms = Date.now() - t0;
          const msg = e instanceof Error ? e.message : String(e);
          send("erro_cerebro", { id: c.id, nome: c.nome, erro: msg, ms });
          // Continua a cascata mesmo se um falhar — próximo cérebro trabalha com o que tem
        }
      }

      send("fim", { total_cerebros: CEREBROS.length, ok: anteriores.length });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
});
