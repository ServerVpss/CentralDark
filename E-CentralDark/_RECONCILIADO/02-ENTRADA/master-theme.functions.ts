import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const ThemeMode = z.enum(["current", "nexchat"]);

/**
 * Retorna o tema ativo (público — qualquer usuário autenticado pode ler
 * pra renderizar a UI). Não expõe nenhum segredo.
 */
export const getActiveTheme = createServerFn({ method: "GET" }).handler(
  async () => {
    const { data, error } = await supabaseAdmin
      .from("master_settings")
      .select("ui_theme_mode, nexchat_theme_enabled")
      .eq("id", 1)
      .maybeSingle();
    if (error) {
      return { mode: "current" as const, enabled: false };
    }
    const enabled = !!data?.nexchat_theme_enabled;
    const mode = (data?.ui_theme_mode as "current" | "nexchat") ?? "current";
    return { mode: enabled ? mode : ("current" as const), enabled };
  },
);

/**
 * Atualiza o tema ativo. Somente super_admin.
 */
export const setActiveTheme = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      enabled: z.boolean(),
      mode: ThemeMode,
    }).parse,
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: role } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "super_admin")
      .maybeSingle();

    if (!role) {
      throw new Error("Acesso negado — apenas super admin.");
    }

    const { error } = await supabaseAdmin
      .from("master_settings")
      .update({
        nexchat_theme_enabled: data.enabled,
        ui_theme_mode: data.mode,
      })
      .eq("id", 1);
    if (error) throw new Error(error.message);

    await supabaseAdmin.from("audit_log").insert({
      actor_user_id: userId,
      action: data.enabled ? "admin:theme_nexchat_enabled" : "admin:theme_nexchat_disabled",
      category: "admin",
      entity: "master_settings",
      payload: { mode: data.mode, enabled: data.enabled },
    });

    return { ok: true, mode: data.mode, enabled: data.enabled };
  });
