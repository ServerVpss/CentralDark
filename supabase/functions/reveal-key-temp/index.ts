// Função temporária — só devolve LOVABLE_API_KEY se o header bater com o segredo compartilhado
Deno.serve((req) => {
  const auth = req.headers.get("x-reveal-token") || "";
  const expected = Deno.env.get("REVEAL_TEMP_TOKEN") || "";
  if (!expected || auth !== expected) {
    return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: { "content-type": "application/json" } });
  }
  const key = Deno.env.get("LOVABLE_API_KEY") || "";
  return new Response(JSON.stringify({ key }), { headers: { "content-type": "application/json" } });
});
