// Admin da Ponte MCP — só admins logados podem listar, criar e revogar chaves.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function sha256(texto: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function gerarChave(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
  return `pmcp_${hex}`;
}

function jsonResp(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return jsonResp({ error: "Não autenticado." }, 401);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: auth } } },
  );

  const { data: claimsData, error: errClaims } = await supabase.auth.getClaims(auth.replace("Bearer ", ""));
  if (errClaims || !claimsData?.claims) return jsonResp({ error: "Sessão inválida." }, 401);
  const userId = claimsData.claims.sub as string;

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: ehAdmin } = await admin.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (!ehAdmin) return jsonResp({ error: "Apenas administradores." }, 403);

  let payload: { acao?: string; nome_agente?: string; observacao?: string; id?: string } = {};
  try { payload = await req.json(); } catch { /* GET-ish: acao=listar default */ }
  const acao = payload.acao ?? "listar";

  if (acao === "listar") {
    const { data, error } = await admin
      .from("ponte_mcp_chaves")
      .select("id, nome_agente, prefixo, ativa, total_chamadas, ultimo_uso_em, criada_em, observacao")
      .order("criada_em", { ascending: false });
    if (error) return jsonResp({ error: error.message }, 500);
    return jsonResp({ chaves: data ?? [] });
  }

  if (acao === "criar") {
    const nome = (payload.nome_agente ?? "").trim();
    if (!nome) return jsonResp({ error: "Informe o nome do agente." }, 400);
    const chavePlana = gerarChave();
    const hash = await sha256(chavePlana);
    const prefixo = chavePlana.slice(0, 12) + "…";
    const { data, error } = await admin
      .from("ponte_mcp_chaves")
      .insert({
        nome_agente: nome,
        chave_hash: hash,
        prefixo,
        criada_por: userId,
        observacao: payload.observacao ?? null,
      })
      .select("id, nome_agente, prefixo, criada_em")
      .single();
    if (error) return jsonResp({ error: error.message }, 500);
    return jsonResp({ chave_plana: chavePlana, registro: data });
  }

  if (acao === "revogar") {
    if (!payload.id) return jsonResp({ error: "ID obrigatório." }, 400);
    const { error } = await admin
      .from("ponte_mcp_chaves")
      .update({ ativa: false })
      .eq("id", payload.id);
    if (error) return jsonResp({ error: error.message }, 500);
    return jsonResp({ ok: true });
  }

  if (acao === "reativar") {
    if (!payload.id) return jsonResp({ error: "ID obrigatório." }, 400);
    const { error } = await admin
      .from("ponte_mcp_chaves")
      .update({ ativa: true })
      .eq("id", payload.id);
    if (error) return jsonResp({ error: error.message }, 500);
    return jsonResp({ ok: true });
  }

  if (acao === "deletar") {
    if (!payload.id) return jsonResp({ error: "ID obrigatório." }, 400);
    const { error } = await admin
      .from("ponte_mcp_chaves")
      .delete()
      .eq("id", payload.id);
    if (error) return jsonResp({ error: error.message }, 500);
    return jsonResp({ ok: true });
  }

  return jsonResp({ error: `Ação desconhecida: ${acao}` }, 400);
});
