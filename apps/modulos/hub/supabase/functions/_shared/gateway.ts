// Helper: chama Lovable AI Gateway (multi-modelo com uma chave só)
const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const EMBED_URL = "https://ai.gateway.lovable.dev/v1/embeddings";

export async function chamarModelo(
  modelo: string,
  messages: Array<{ role: string; content: string }>,
  opts: { temperature?: number; max_tokens?: number } = {},
): Promise<{ text: string; tokens: number; ms: number }> {
  const inicio = Date.now();
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("LOVABLE_API_KEY não configurada");

  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key,
    },
    body: JSON.stringify({
      model: modelo,
      messages,
      temperature: opts.temperature ?? 0.7,
      max_tokens: opts.max_tokens ?? 2000,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gateway ${res.status}: ${err.slice(0, 300)}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content ?? "";
  const tokens = data.usage?.total_tokens ?? 0;
  return { text, tokens, ms: Date.now() - inicio };
}

export async function gerarEmbedding(texto: string): Promise<number[]> {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("LOVABLE_API_KEY não configurada");

  const res = await fetch(EMBED_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key,
    },
    body: JSON.stringify({
      model: "openai/text-embedding-3-small",
      input: texto.slice(0, 8000),
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Embedding ${res.status}: ${err.slice(0, 300)}`);
  }

  const data = await res.json();
  return data.data?.[0]?.embedding ?? [];
}
