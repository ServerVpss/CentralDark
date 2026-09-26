// Server fns para gerenciar o aplicativo MultiZap (PWA + APK Android).
// Apenas super_admin pode ler/escrever os campos do APK.
// A leitura pública do link/versão usa a RPC `get_android_apk_info` (com SECURITY DEFINER).
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { logAction } from "@/lib/audit.server";

async function assertSuperAdmin(userId: string) {
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "super_admin")
    .maybeSingle();
  if (!data) throw new Error("Acesso negado: apenas Super Admin.");
}

export const adminGetAppSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const { data } = await supabaseAdmin
      .from("master_settings" as never)
      .select("android_apk_download_url, android_apk_version, android_apk_updated_at")
      .eq("id", 1)
      .maybeSingle();
    const r = data as Record<string, unknown> | null;
    return {
      android_apk_download_url: (r?.android_apk_download_url as string) ?? "",
      android_apk_version: (r?.android_apk_version as string) ?? "",
      android_apk_updated_at: (r?.android_apk_updated_at as string) ?? "",
    };
  });

export const adminUpdateAppSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        android_apk_download_url: z
          .string()
          .trim()
          .max(500)
          .refine((v) => v === "" || /^https:\/\//i.test(v), "URL deve começar com https://")
          .optional(),
        android_apk_version: z
          .string()
          .trim()
          .max(40)
          .regex(/^[a-zA-Z0-9._\- ]*$/, "Use apenas letras, números, pontos, hífens e espaços")
          .optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    const updates: Record<string, unknown> = {};
    if (data.android_apk_download_url !== undefined) {
      updates.android_apk_download_url = data.android_apk_download_url || null;
    }
    if (data.android_apk_version !== undefined) {
      updates.android_apk_version = data.android_apk_version || null;
    }
    // Sempre que algo do APK muda, marca a data
    if (Object.keys(updates).length > 0) {
      updates.android_apk_updated_at = new Date().toISOString();
    }

    const { data: before } = await supabaseAdmin
      .from("master_settings" as never)
      .select("android_apk_download_url, android_apk_version, android_apk_updated_at")
      .eq("id", 1)
      .maybeSingle();

    const { error } = await supabaseAdmin
      .from("master_settings" as never)
      .update(updates as never)
      .eq("id", 1);
    if (error) throw new Error(error.message);

    await logAction({
      category: "admin",
      action: "app_settings_updated",
      actorUserId: context.userId,
      entity: "master_settings",
      entityId: "1",
      before: (before ?? null) as Record<string, unknown> | null,
      after: { ...(before ?? {}), ...updates },
      payload: { changed: Object.keys(updates) },
    });
    return { ok: true };
  });
