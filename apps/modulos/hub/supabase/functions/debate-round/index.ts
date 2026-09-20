// Rodada de debate: dispara N modelos em paralelo com o mesmo prompt
import { corsHeaders } from "../_shared/cors.ts";
import { chamarModelo } from "../_shared/gateway.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { modelos, system, prompt, temperature = 0.7 } = await req.json();
    if (!modelos?.length || !prompt) return json({ error: "modelos[] e prompt obrigatórios" }, 400);

    const messages = [
      ...(system ? [{ role: "system", content: system }] : []),
      { role: "user", content: prompt },
    ];

    const resultados = await Promise.allSettled(
      modelos.map((m: string) => chamarModelo(m, messages, { temperature })),
    );

    const respostas = resultados.map((r, i) => ({
      modelo: modelos[i],
      ok: r.status === "fulfilled",
      texto: r.status === "fulfilled" ? r.value.text : `[erro] ${(r as any).reason?.message ?? "falha"}`,
      tokens: r.status === "fulfilled" ? r.value.tokens : 0,
      ms: r.status === "fulfilled" ? r.value.ms : 0,
    }));

    return json({ respostas });
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
