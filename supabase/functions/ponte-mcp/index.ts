import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-ponte-chave",
};

function res(status: number, body: object) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

  const chave = req.headers.get("x-ponte-chave");
  if (!chave) return res(401, { erro: "Falta o header x-ponte-chave" });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Gera hash SHA-256 da chave recebida
    const encoder = new TextEncoder();
    const data = encoder.encode(chave);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    // Busca a chave no banco
    const { data: registro, error: errBusca } = await supabase
      .from("ponte_mcp_chaves")
      .select("id, ativa, usos, nome_agente")
      .eq("hash_chave", hashHex)
      .single();

    if (errBusca || !registro) return res(403, { erro: "Chave inválida ou não encontrada" });
    if (!registro.ativa) return res(403, { erro: "Chave revogada" });

    // Incrementa contador de uso
    await supabase
      .from("ponte_mcp_chaves")
      .update({ usos: registro.usos + 1, ultimo_uso_at: new Date().toISOString() })
      .eq("id", registro.id);

    // Pega o token mestre do MCP CentralDark
    const tokenMestre = Deno.env.get("CENTRALDARK_MCP_TOKEN") || Deno.env.get("MCP_CENTRALDARK_TOKEN");
    if (!tokenMestre) return res(500, { erro: "Token mestre não configurado no servidor" });

    // Lê o corpo original
    let body;
    try {
      body = await req.text();
    } catch {
      body = "";
    }

    // Encaminha para o MCP CentralDark
    const mcpUrl = Deno.env.get("MCP_CENTRALDARK_URL") || "https://mcp.centralldark.com/v1/mcp";
    const mcpRes = await fetch(mcpUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${tokenMestre}`,
        "X-Ponte-Agente": registro.nome_agente,
        "X-Ponte-Origem": "supabase-edge",
      },
      body: body || JSON.stringify({}),
    });

    const mcpBody = await mcpRes.text();

    return new Response(mcpBody, {
      status: mcpRes.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("[ponte-mcp] erro:", e);
    return res(500, { erro: "Erro interno na ponte", detalhe: e.message });
  }
});
