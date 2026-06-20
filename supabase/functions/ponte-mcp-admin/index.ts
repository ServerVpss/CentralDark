import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function res(status: number, body: object) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function gerarChave() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let key = "pk_";
  for (let i = 0; i < 48; i++) key += chars.charAt(Math.floor(Math.random() * chars.length));
  return key;
}

async function sha256(text: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Auth
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) return res(401, { erro: "Não autenticado" });

    const { data: { user }, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !user) return res(401, { erro: "Sessão inválida" });

    // Admin check
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!isAdmin) return res(403, { erro: "Acesso restrito a administradores" });

    const body = await req.json().catch(() => ({}));
    const acao = body.acao;

    // LISTAR
    if (acao === "listar") {
      const { data, error } = await supabase
        .from("ponte_mcp_chaves")
        .select("id, nome_agente, prefixo, ativa, usos, ultimo_uso_at, criada_em, revogada_em")
        .order("criada_em", { ascending: false });

      if (error) return res(500, { erro: "Erro ao listar chaves", detalhe: error.message });
      return res(200, { chaves: data || [] });
    }

    // CRIAR
    if (acao === "criar") {
      const nome = String(body.nome_agente || "").trim();
      if (!nome || nome.length < 2) return res(400, { erro: "Nome do agente é obrigatório (mín. 2 caracteres)" });

      const chavePlena = gerarChave();
      const hash = await sha256(chavePlena);
      const prefixo = chavePlena.slice(0, 7) + "…" + chavePlena.slice(-4);

      const { data, error } = await supabase
        .from("ponte_mcp_chaves")
        .insert({ nome_agente: nome, hash_chave: hash, prefixo })
        .select("id, nome_agente, prefixo, ativa, criada_em")
        .single();

      if (error) return res(500, { erro: "Erro ao criar chave", detalhe: error.message });
      return res(200, { chave: data, chave_plena: chavePlena });
    }

    // REVOGAR / REATIVAR
    if (acao === "alternar") {
      const id = body.id;
      if (!id) return res(400, { erro: "ID da chave é obrigatório" });

      const { data: atual } = await supabase
        .from("ponte_mcp_chaves")
        .select("ativa")
        .eq("id", id)
        .single();

      if (!atual) return res(404, { erro: "Chave não encontrada" });

      const novoStatus = !atual.ativa;
      const updateData: any = { ativa: novoStatus };
      if (!novoStatus) updateData.revogada_em = new Date().toISOString();
      else updateData.revogada_em = null;

      const { error } = await supabase.from("ponte_mcp_chaves").update(updateData).eq("id", id);
      if (error) return res(500, { erro: "Erro ao atualizar chave", detalhe: error.message });
      return res(200, { sucesso: true, ativa: novoStatus });
    }

    // DELETAR
    if (acao === "deletar") {
      const id = body.id;
      if (!id) return res(400, { erro: "ID da chave é obrigatório" });

      const { error } = await supabase.from("ponte_mcp_chaves").delete().eq("id", id);
      if (error) return res(500, { erro: "Erro ao deletar chave", detalhe: error.message });
      return res(200, { sucesso: true });
    }

    return res(400, { erro: "Ação inválida. Use: listar, criar, alternar, deletar" });
  } catch (e: any) {
    console.error("[ponte-mcp-admin] erro:", e);
    return res(500, { erro: "Erro interno", detalhe: e.message });
  }
});
