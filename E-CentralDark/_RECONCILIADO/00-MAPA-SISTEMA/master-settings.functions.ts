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

async function exchangeCodeForLongLivedToken({
  appId,
  appSecret,
  code,
}: {
  appId: string;
  appSecret: string;
  code: string;
}) {
  const tokenRes = await fetch(
    `https://graph.facebook.com/v22.0/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&code=${encodeURIComponent(code)}`,
  );
  const tokenJson = (await tokenRes.json()) as {
    access_token?: string;
    error?: { message?: string };
  };
  if (!tokenRes.ok || !tokenJson.access_token) {
    throw new Error(
      `Falha ao gerar a chave temporária: ${tokenJson.error?.message ?? "desconhecido"}`,
    );
  }

  const longRes = await fetch(
    `https://graph.facebook.com/v22.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${encodeURIComponent(tokenJson.access_token)}`,
  );
  const longJson = (await longRes.json()) as {
    access_token?: string;
    error?: { message?: string };
  };
  if (!longRes.ok || !longJson.access_token) {
    throw new Error(
      `Falha ao gerar a chave de longa duração: ${longJson.error?.message ?? "desconhecido"}`,
    );
  }

  return longJson.access_token;
}

// Pública (sem secrets) — usada pelo /app pra saber se Embedded está disponível
export const getPublicMasterSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { data } = await supabaseAdmin
      .from("master_settings" as never)
      .select(
        "meta_app_id, meta_config_id, embedded_signup_enabled, manual_mode_enabled, baileys_enabled, baileys_server_url, public_signup_enabled",
      )
      .eq("id", 1)
      .maybeSingle();
    const r = data as {
      meta_app_id?: string;
      meta_config_id?: string;
      embedded_signup_enabled?: boolean;
      manual_mode_enabled?: boolean;
      baileys_enabled?: boolean;
      baileys_server_url?: string | null;
      public_signup_enabled?: boolean;
    } | null;
    return {
      meta_app_id: r?.meta_app_id ?? null,
      meta_config_id: r?.meta_config_id ?? null,
      embedded_signup_enabled: !!r?.embedded_signup_enabled,
      manual_mode_enabled: r?.manual_mode_enabled ?? true,
      embedded_ready: !!(r?.embedded_signup_enabled && r?.meta_app_id && r?.meta_config_id),
      baileys_enabled: !!r?.baileys_enabled,
      baileys_ready: !!(r?.baileys_enabled && r?.baileys_server_url),
      public_signup_enabled: r?.public_signup_enabled ?? true,
    };
  });


// Master — completa
export const adminGetMasterSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const { data } = await supabaseAdmin
      .from("master_settings" as never)
      .select("*")
      .eq("id", 1)
      .maybeSingle();
    const r = data as Record<string, unknown> | null;
    return {
      meta_app_id: (r?.meta_app_id as string) ?? "",
      meta_config_id: (r?.meta_config_id as string) ?? "",
      meta_app_secret_set: !!r?.meta_app_secret,
      embedded_signup_enabled: !!r?.embedded_signup_enabled,
      manual_mode_enabled: r?.manual_mode_enabled === undefined ? true : !!r?.manual_mode_enabled,
      public_signup_enabled: r?.public_signup_enabled === undefined ? true : !!r?.public_signup_enabled,
      default_trial_days: (r?.default_trial_days as number) ?? 7,
      super_admin_phone_e164: (r?.super_admin_phone_e164 as string) ?? "",
      super_admin_notify_connection_id: (r?.super_admin_notify_connection_id as string) ?? "",
      segredo_block_after_attempts: (r?.segredo_block_after_attempts as number) ?? 3,
      segredo_block_minutes: (r?.segredo_block_minutes as number) ?? 10,
      baileys_enabled: !!r?.baileys_enabled,
      baileys_mode: ((r?.baileys_mode as string) ?? "selfhosted") as "selfhosted",
      baileys_server_url: (r?.baileys_server_url as string) ?? "",
      baileys_server_token_set: !!r?.baileys_server_token,
      baileys_webhook_secret_set: !!r?.baileys_webhook_secret,
    };
  });


export const adminUpdateMasterSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        meta_app_id: z.string().max(100).optional(),
        meta_config_id: z.string().max(100).optional(),
        meta_app_secret: z.string().max(500).optional(),
        embedded_signup_enabled: z.boolean().optional(),
        manual_mode_enabled: z.boolean().optional(),
        public_signup_enabled: z.boolean().optional(),
        default_trial_days: z.number().min(0).max(90).optional(),
        super_admin_phone_e164: z
          .string()
          .max(20)
          .regex(/^\d*$/, "Apenas dígitos (E.164 sem +)")
          .optional(),
        super_admin_notify_connection_id: z
          .string()
          .max(64)
          .nullable()
          .optional(),
        segredo_block_after_attempts: z.number().int().min(1).max(10).optional(),
        segredo_block_minutes: z.number().int().min(1).max(1440).optional(),
        // Baileys self-hosted
        baileys_enabled: z.boolean().optional(),
        baileys_server_url: z.string().max(500).url().or(z.literal("")).optional(),
        baileys_server_token: z.string().max(500).optional(),
        baileys_webhook_secret: z.string().max(500).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    const updates: Record<string, unknown> = {};
    if (data.meta_app_id !== undefined) updates.meta_app_id = data.meta_app_id || null;
    if (data.meta_config_id !== undefined) updates.meta_config_id = data.meta_config_id || null;
    if (data.meta_app_secret !== undefined && data.meta_app_secret.length > 0)
      updates.meta_app_secret = data.meta_app_secret;
    if (data.embedded_signup_enabled !== undefined)
      updates.embedded_signup_enabled = data.embedded_signup_enabled;
    if (data.manual_mode_enabled !== undefined)
      updates.manual_mode_enabled = data.manual_mode_enabled;
    if (data.public_signup_enabled !== undefined)
      updates.public_signup_enabled = data.public_signup_enabled;
    if (data.default_trial_days !== undefined) updates.default_trial_days = data.default_trial_days;
    if (data.super_admin_phone_e164 !== undefined)
      updates.super_admin_phone_e164 = data.super_admin_phone_e164 || null;
    if (data.super_admin_notify_connection_id !== undefined)
      updates.super_admin_notify_connection_id = data.super_admin_notify_connection_id || null;
    if (data.segredo_block_after_attempts !== undefined)
      updates.segredo_block_after_attempts = data.segredo_block_after_attempts;
    if (data.segredo_block_minutes !== undefined)
      updates.segredo_block_minutes = data.segredo_block_minutes;
    if (data.baileys_enabled !== undefined) updates.baileys_enabled = data.baileys_enabled;
    if (data.baileys_server_url !== undefined)
      updates.baileys_server_url = data.baileys_server_url || null;
    if (data.baileys_server_token !== undefined && data.baileys_server_token.length > 0)
      updates.baileys_server_token = data.baileys_server_token;
    if (data.baileys_webhook_secret !== undefined && data.baileys_webhook_secret.length > 0)
      updates.baileys_webhook_secret = data.baileys_webhook_secret;

    const { data: before } = await supabaseAdmin
      .from("master_settings" as never)
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    const { error } = await supabaseAdmin
      .from("master_settings" as never)
      .update(updates as never)
      .eq("id", 1);
    if (error) throw new Error(error.message);

    const sanitized = { ...updates };
    if ("meta_app_secret" in sanitized) sanitized.meta_app_secret = "***";
    if ("baileys_server_token" in sanitized) sanitized.baileys_server_token = "***";
    if ("baileys_webhook_secret" in sanitized) sanitized.baileys_webhook_secret = "***";
    await logAction({
      category: "admin",
      action: "master_settings_updated",
      actorUserId: context.userId,
      entity: "master_settings",
      entityId: "1",
      before: (before ?? null) as Record<string, unknown> | null,
      after: { ...(before ?? {}), ...sanitized },
      payload: { changed: Object.keys(updates) },
    });
    return { ok: true };
  });

// Recebe access_token do Embedded Signup, troca por long-lived e cria conexão.
// Aceita 3 modos de conexão:
//   - "new": número novo na Meta (fluxo padrão).
//   - "migration": número já estava em outro fornecedor — exige PIN 2FA pra
//     re-registrar no nosso app sem perder o número.
//   - "business_app": número estava no WhatsApp Business comum — a Meta trata
//     do mesmo jeito de número novo, mas a gente marca pra auditoria.
export const completeEmbeddedSignup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        workspaceId: z.string().uuid(),
        code: z.string().min(10).max(2000), // authorization code do popup
        name: z.string().min(1).max(120).default("WhatsApp"),
        mode: z.enum(["new", "migration", "business_app"]).default("new"),
        // PIN 2FA — só pro modo "migration". 6 dígitos. NUNCA é persistido.
        pin: z
          .string()
          .regex(/^\d{6}$/u, "PIN precisa ter exatamente 6 dígitos")
          .optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    // verifica membership
    const { data: sa } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "super_admin")
      .maybeSingle();
    if (!sa) {
      const { data: m } = await supabaseAdmin
        .from("workspace_members")
        .select("role")
        .eq("user_id", context.userId)
        .eq("workspace_id", data.workspaceId)
        .maybeSingle();
      if (!m || m.role !== "admin") throw new Error("Apenas admins podem conectar o WhatsApp.");
    }

    // Migração exige PIN obrigatoriamente
    if (data.mode === "migration" && !data.pin) {
      throw new Error("Pra migrar de outro fornecedor, informe o PIN de 6 dígitos da verificação em duas etapas.");
    }

    // Lê master settings
    const { data: ms } = await supabaseAdmin
      .from("master_settings" as never)
      .select("meta_app_id, meta_app_secret")
      .eq("id", 1)
      .maybeSingle();
    const settings = ms as { meta_app_id?: string; meta_app_secret?: string } | null;
    if (!settings?.meta_app_id || !settings?.meta_app_secret) {
      throw new Error("Master ainda não configurou o App da Meta. Avise o suporte.");
    }

    // 1. Troca code por access_token de longa duração
    const userToken = await exchangeCodeForLongLivedToken({
      appId: settings.meta_app_id,
      appSecret: settings.meta_app_secret,
      code: data.code,
    });

    // 2. Lista WABAs disponíveis
    const wabaRes = await fetch(
      `https://graph.facebook.com/v22.0/debug_token?input_token=${userToken}&access_token=${settings.meta_app_id}|${settings.meta_app_secret}`,
    );
    const wabaJson = (await wabaRes.json()) as {
      data?: { granular_scopes?: Array<{ scope: string; target_ids?: string[] }> };
    };
    const wabaScope = wabaJson.data?.granular_scopes?.find(
      (s) => s.scope === "whatsapp_business_management",
    );
    const wabaId = wabaScope?.target_ids?.[0];
    if (!wabaId)
      throw new Error(
        "Não foi possível identificar a conta WhatsApp Business. Tente reconectar concedendo todas as permissões.",
      );

    // 3. Lista phone numbers da WABA
    const phRes = await fetch(
      `https://graph.facebook.com/v22.0/${wabaId}/phone_numbers?access_token=${userToken}`,
    );
    const phJson = (await phRes.json()) as {
      data?: Array<{
        id: string;
        display_phone_number: string;
        verified_name: string;
        quality_rating?: string;
      }>;
    };
    const phone = phJson.data?.[0];
    if (!phone) throw new Error("Nenhum número WhatsApp encontrado nesta conta.");

    // 4. Se for migração, registra o número com o PIN 2FA ANTES de tudo.
    // Isso é o que a Meta exige pra "tomar" o número de outro fornecedor.
    const isMigration = data.mode === "migration";
    let migrationStatus: string | null = null;
    let migrationError: string | null = null;

    if (isMigration) {
      migrationStatus = "registering";
      const regRes = await fetch(
        `https://graph.facebook.com/v22.0/${phone.id}/register`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            pin: data.pin,
          }),
        },
      );
      const regJson = (await regRes.json()) as {
        success?: boolean;
        error?: { message?: string; code?: number; error_subcode?: number };
      };
      if (!regRes.ok || regJson.success === false) {
        // Erro mais comum: PIN errado (code 133005/subcode 2388007)
        const code = regJson.error?.code;
        const subcode = regJson.error?.error_subcode;
        const friendly =
          code === 133005 || subcode === 2388007
            ? "PIN incorreto. Peça o PIN atualizado ao seu fornecedor anterior."
            : regJson.error?.message ?? "Falha ao registrar o número na Meta.";
        migrationError = friendly;
        migrationStatus = "failed";
        // Sai cedo — não cria conexão quebrada. Auditoria sem PIN.
        await logAction({
          category: "user",
          action: "whatsapp_migration_failed",
          actorUserId: context.userId,
          workspaceId: data.workspaceId,
          entity: "whatsapp_connections",
          after: { waba_id: wabaId, phone_number_id: phone.id, step: "register", error: friendly },
        });
        throw new Error(friendly);
      }
    }

    // 5. Subscribe app to WABA webhooks
    if (isMigration) migrationStatus = "subscribing_webhook";
    const subRes = await fetch(`https://graph.facebook.com/v22.0/${wabaId}/subscribed_apps`, {
      method: "POST",
      headers: { Authorization: `Bearer ${userToken}` },
    });
    if (!subRes.ok && isMigration) {
      const subJson = (await subRes.json().catch(() => ({}))) as { error?: { message?: string } };
      migrationError = subJson.error?.message ?? "Falha ao assinar o webhook na Meta.";
      migrationStatus = "failed";
    }

    // 6. Salva conexão
    if (isMigration && migrationStatus !== "failed") migrationStatus = "done";
    const verifyToken = `lvt_${crypto.randomUUID().replace(/-/g, "")}`;
    const { data: conn, error } = await supabaseAdmin
      .from("whatsapp_connections")
      .insert({
        workspace_id: data.workspaceId,
        provider: "meta_cloud",
        onboarding_mode: "embedded",
        connection_mode: data.mode,
        migration_status: migrationStatus,
        migration_last_error: migrationError,
        name: data.name,
        phone: phone.display_phone_number,
        display_phone_number: phone.display_phone_number,
        phone_number_id: phone.id,
        waba_id: wabaId,
        access_token: userToken,
        app_secret: settings.meta_app_secret,
        verify_token: verifyToken,
        quality_rating: phone.quality_rating ?? null,
        status: migrationStatus === "failed" ? "disconnected" : "connected",
        last_error: migrationError,
      } as never)
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    await logAction({
      category: "user",
      action:
        data.mode === "migration"
          ? "whatsapp_migration_completed"
          : data.mode === "business_app"
            ? "whatsapp_business_app_onboarded"
            : "whatsapp_embedded_signup_completed",
      actorUserId: context.userId,
      workspaceId: data.workspaceId,
      entity: "whatsapp_connections",
      entityId: conn.id,
      after: {
        waba_id: wabaId,
        phone_number_id: phone.id,
        phone: phone.display_phone_number,
        mode: data.mode,
        migration_status: migrationStatus,
      },
    });

    return {
      ok: migrationStatus !== "failed",
      connectionId: conn.id,
      displayPhoneNumber: phone.display_phone_number,
      mode: data.mode,
      migrationStatus,
    };
  });

// Reconecta uma conexão existente: troca o code por um novo token e atualiza
// a linha já existente — sem apagar o número, sem perder histórico.
export const reconnectEmbeddedSignup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        connectionId: z.string().uuid(),
        code: z.string().min(10).max(2000),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    // Carrega conexão
    const { data: existing, error: ce } = await supabaseAdmin
      .from("whatsapp_connections")
      .select("id, workspace_id, phone_number_id, waba_id")
      .eq("id", data.connectionId)
      .maybeSingle();
    if (ce || !existing) throw new Error("Conexão não encontrada.");

    // Verifica permissão (super admin OU admin do workspace)
    const { data: sa } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "super_admin")
      .maybeSingle();
    if (!sa) {
      const { data: m } = await supabaseAdmin
        .from("workspace_members")
        .select("role")
        .eq("user_id", context.userId)
        .eq("workspace_id", existing.workspace_id)
        .maybeSingle();
      if (!m || m.role !== "admin") throw new Error("Apenas admins podem reconectar o WhatsApp.");
    }

    // Lê master settings
    const { data: ms } = await supabaseAdmin
      .from("master_settings" as never)
      .select("meta_app_id, meta_app_secret")
      .eq("id", 1)
      .maybeSingle();
    const settings = ms as { meta_app_id?: string; meta_app_secret?: string } | null;
    if (!settings?.meta_app_id || !settings?.meta_app_secret) {
      throw new Error("Master ainda não configurou o App da Meta. Avise o suporte.");
    }

    // 1. Troca code por novo access_token de longa duração
    const userToken = await exchangeCodeForLongLivedToken({
      appId: settings.meta_app_id,
      appSecret: settings.meta_app_secret,
      code: data.code,
    });

    // 2. Confirma WABA da nova autorização — precisa bater com a conexão
    const wabaRes = await fetch(
      `https://graph.facebook.com/v22.0/debug_token?input_token=${userToken}&access_token=${settings.meta_app_id}|${settings.meta_app_secret}`,
    );
    const wabaJson = (await wabaRes.json()) as {
      data?: { granular_scopes?: Array<{ scope: string; target_ids?: string[] }> };
    };
    const wabaScope = wabaJson.data?.granular_scopes?.find(
      (s) => s.scope === "whatsapp_business_management",
    );
    const newWabaId = wabaScope?.target_ids?.[0];
    if (!newWabaId)
      throw new Error(
        "Não foi possível identificar a conta WhatsApp Business na nova autorização.",
      );

    if (existing.waba_id && newWabaId !== existing.waba_id) {
      throw new Error(
        "Você autorizou uma conta WhatsApp Business diferente. Reconecte usando a mesma conta original.",
      );
    }

    // 3. Re-subscribe webhooks (idempotente)
    await fetch(`https://graph.facebook.com/v22.0/${newWabaId}/subscribed_apps`, {
      method: "POST",
      headers: { Authorization: `Bearer ${userToken}` },
    }).catch(() => {});

    // 4. Atualiza a conexão existente — só o token + limpa erro
    const { error: ue } = await supabaseAdmin
      .from("whatsapp_connections")
      .update({
        access_token: userToken,
        app_secret: settings.meta_app_secret,
        status: "connected",
        last_error: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.connectionId);
    if (ue) throw new Error(ue.message);

    await logAction({
      category: "user",
      action: "whatsapp_reconnected",
      actorUserId: context.userId,
      workspaceId: existing.workspace_id,
      entity: "whatsapp_connections",
      entityId: data.connectionId,
      after: { waba_id: newWabaId, phone_number_id: existing.phone_number_id },
    });

    return { ok: true };
  });
