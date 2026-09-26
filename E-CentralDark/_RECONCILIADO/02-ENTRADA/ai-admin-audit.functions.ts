// Server function isolada — lista auditoria da Segredo IA.
// Movida pra cá pra evitar que `client.server` (service_role) seja referenciado
// no mesmo módulo de um componente client, o que arrisca leak no bundle.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const listAiAuditLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: r } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "super_admin")
      .maybeSingle();
    if (!r) throw new Error("Acesso negado.");

    const { data } = await supabaseAdmin
      .from("ai_admin_audit_logs")
      .select(
        "id, admin_user_id, command_text, intent, action, needs_confirmation, confirmed, status, route_opened, error, ip, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(200);
    return (data ?? []) as Array<{
      id: string;
      admin_user_id: string | null;
      command_text: string;
      intent: string | null;
      action: string | null;
      needs_confirmation: boolean;
      confirmed: boolean;
      status: string;
      route_opened: string | null;
      error: string | null;
      ip: string | null;
      created_at: string;
    }>;
  });
