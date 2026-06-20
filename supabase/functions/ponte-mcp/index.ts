// Ponte MCP CentralDark — proxy autenticado para agentes externos.
// Recebe JSON-RPC do agente externo, valida a chave x-ponte-chave,
// e repassa pro servidor MCP real usando o token mestre guardado nos secrets.
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-ponte-chave, accept, mcp-session-id",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MCP_URL = "https://mcp.centralldark.com/mcp";

async function sha256(texto: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Use POST." }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const chavePlana = req.headers.get("x-ponte-chave") ?? "";
  if (!chavePlana) {
    return new Response(
      JSON.stringify({ error: "Chave ausente. Envie o header x-ponte-chave." }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const hash = await sha256(chavePlana);
  const { data: registro, error: errBusca } = await supabase
    .from("ponte_mcp_chaves")
    .select("id, ativa, nome_agente")
    .eq("chave_hash", hash)
    .maybeSingle();

  if (errBusca || !registro || !registro.ativa) {
    return new Response(
      JSON.stringify({ error: "Chave inválida ou revogada." }),
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const tokenMestre = Deno.env.get("CENTRALDARK_MCP_TOKEN");
  if (!tokenMestre) {
    return new Response(
      JSON.stringify({ error: "Token mestre não configurado no servidor." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const corpo = await req.text();
  const sessaoMcp = req.headers.get("mcp-session-id");

  const respostaMcp = await fetch(MCP_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json, text/event-stream",
      "Authorization": `Bearer ${tokenMestre}`,
      ...(sessaoMcp ? { "mcp-session-id": sessaoMcp } : {}),
    },
    body: corpo,
  });

  // Atualiza contador de uso sem bloquear a resposta
  EdgeRuntime.waitUntil(
    supabase
      .from("ponte_mcp_chaves")
      .update({
        total_chamadas: (await (async () => {
          const { data } = await supabase
            .from("ponte_mcp_chaves")
            .select("total_chamadas")
            .eq("id", registro.id)
            .single();
          return (data?.total_chamadas ?? 0) + 1;
        })()),
        ultimo_uso_em: new Date().toISOString(),
      })
      .eq("id", registro.id),
  );

  // Repassa headers úteis e o body em streaming
  const headersResposta = new Headers(corsHeaders);
  const ct = respostaMcp.headers.get("content-type");
  if (ct) headersResposta.set("Content-Type", ct);
  const sid = respostaMcp.headers.get("mcp-session-id");
  if (sid) headersResposta.set("mcp-session-id", sid);

  return new Response(respostaMcp.body, {
    status: respostaMcp.status,
    headers: headersResposta,
  });
});
