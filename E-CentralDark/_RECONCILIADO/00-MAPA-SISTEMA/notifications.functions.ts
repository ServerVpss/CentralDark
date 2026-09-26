// Server functions de notificações: registrar dispositivo, preferências, teste, listar eventos.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { sendPushOnNewMessage } from "./notifications.server";

// Exposição do APP_ID público do OneSignal (não é segredo — vai pro browser).
export const getNotificationsConfig = createServerFn({ method: "GET" }).handler(async () => {
  return {
    onesignal_app_id: process.env.ONESIGNAL_APP_ID ?? null,
    push_configured: !!(process.env.ONESIGNAL_APP_ID && process.env.ONESIGNAL_REST_API_KEY),
  };
});

const RegisterSchema = z.object({
  provider: z.enum(["onesignal", "fcm", "vapid"]).default("onesignal"),
  external_id: z.string().min(1).max(255),
  endpoint: z.string().max(2000).optional().nullable(),
  device_type: z.string().max(50).optional().nullable(),
  browser: z.string().max(100).optional().nullable(),
  os: z.string().max(100).optional().nullable(),
  workspace_id: z.string().uuid().optional().nullable(),
});

export const registerPushSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => RegisterSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("push_subscriptions")
      .upsert(
        {
          user_id: userId,
          workspace_id: data.workspace_id ?? null,
          provider: data.provider,
          external_id: data.external_id,
          endpoint: data.endpoint ?? null,
          device_type: data.device_type ?? null,
          browser: data.browser ?? null,
          os: data.os ?? null,
          is_active: true,
          last_seen_at: new Date().toISOString(),
        },
        { onConflict: "user_id,provider,external_id" },
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const unregisterPushSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ external_id: z.string().min(1) }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("push_subscriptions")
      .update({ is_active: false })
      .eq("user_id", userId)
      .eq("external_id", data.external_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listMyDevices = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("push_subscriptions")
      .select("id,provider,external_id,device_type,browser,os,is_active,last_seen_at,created_at")
      .eq("user_id", userId)
      .order("last_seen_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getMyPreferences = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ workspace_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", userId)
      .eq("workspace_id", data.workspace_id)
      .maybeSingle();
    return row ?? null;
  });

const PrefsSchema = z.object({
  workspace_id: z.string().uuid(),
  push_enabled: z.boolean().optional(),
  sound_enabled: z.boolean().optional(),
  sound_volume: z.number().int().min(0).max(100).optional(),
  sound_choice: z.enum(["suave", "classico", "alerta"]).optional(),
  notify_when_chat_open: z.boolean().optional(),
  notify_when_assigned_only: z.boolean().optional(),
  quiet_hours_enabled: z.boolean().optional(),
  quiet_hours_start: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional(),
  quiet_hours_end: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional(),
});

export const saveMyPreferences = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => PrefsSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { workspace_id, ...rest } = data;
    const { error } = await supabase
      .from("notification_preferences")
      .upsert(
        { user_id: userId, workspace_id, ...rest },
        { onConflict: "user_id,workspace_id" },
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const sendTestPush = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ workspace_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await sendPushOnNewMessage({
      workspaceId: data.workspace_id,
      conversationId: "00000000-0000-0000-0000-000000000000",
      contactName: "Teste MultiZap",
      preview: "Se você está vendo essa notificação, o push está funcionando 🎉",
      assigneeUserId: context.userId,
    });
    return { ok: true };
  });

export const listNotificationEvents = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ workspace_id: z.string().uuid(), limit: z.number().int().min(1).max(100).default(20) }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: rows, error } = await supabase
      .from("notification_events")
      .select("id,type,status,provider,error_message,conversation_id,created_at,metadata")
      .eq("workspace_id", data.workspace_id)
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });
