// apps/modulos/hub/supabase/functions/super-admin-status/index.ts
// Edge pública (verify_jwt=false) que responde apenas se JÁ EXISTE super_admin.
// Não retorna email, id, dados sensíveis. Só locked=true/false + reason.
//
// Frontend do HUB usa isso pra decidir se mostra o botão "Criar Super Admin".
// Depois que o primeiro super_admin é criado, o endpoint devolve locked=true
// e o front esconde/bloqueia o fluxo de criação — trava natural sem race.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "content-type, apikey, authorization",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  if (!url || !serviceKey) {
    return new Response(
      JSON.stringify({ locked: false, reason: "config_error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(url, serviceKey);

  // Conta quantos super_admin existem — não retorna qualquer coluna sensível.
  const { count, error } = await supabase
    .from("user_roles")
    .select("*", { count: "exact", head: true })
    .eq("role", "super_admin");

  if (error) {
    // Se a tabela não existe ainda, tratamos como não-lockado (bootstrap inicial).
    const msg = String(error.message || "").toLowerCase();
    if (msg.includes("does not exist") || msg.includes("undefined table")) {
      return new Response(
        JSON.stringify({ locked: false, reason: "table_missing" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    return new Response(
      JSON.stringify({ locked: false, reason: "query_error" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const locked = (count ?? 0) > 0;
  return new Response(
    JSON.stringify({
      locked,
      reason: locked ? "super_admin_exists" : "super_admin_not_found",
      checked_at: new Date().toISOString(),
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
