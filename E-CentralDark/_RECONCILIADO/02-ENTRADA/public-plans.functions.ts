import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Público (sem auth) — usado na landing pra listar planos ativos.
// Retorna só campos seguros pra exibição comercial.
export const listPublicPlans = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("plans")
    .select("id,slug,name,description,price_cents,currency,interval,max_users,max_connections,max_sectors,max_messages_per_month,max_campaigns_per_month,allow_byok,sort_order")
    .eq("active", true)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});
