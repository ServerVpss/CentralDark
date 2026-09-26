// Server functions do painel master de monitoramento de notificações.
// Tudo aqui é restrito a super_admin. Ações sensíveis gravam em audit_log.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { sendPushOnNewMessage } from "./notifications.server";

async function assertSuperAdmin(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "super_admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Acesso restrito ao master.");
}

async function logAdmin(
  actor: string,
  action: string,
  payload: Record<string, unknown>,
  workspaceId?: string | null,
) {
  await supabaseAdmin.from("audit_log").insert({
    workspace_id: workspaceId ?? null,
    actor_user_id: actor,
    action: `admin:monitor_${action}`,
    payload: payload as never,
    category: "admin",
    entity: "notification_monitor",
  });
}

// ===== Saúde fim-a-fim =====
export const getMonitorHealth = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const since = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const sinceHour = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const [webhooksLast, webhookFailLast, lastWebhook, pushHour, pushFailHour, devicesActive, prefsPush, lastEvent] =
      await Promise.all([
        supabaseAdmin.from("whatsapp_webhook_events").select("id", { count: "exact", head: true }).gte("created_at", since),
        supabaseAdmin.from("whatsapp_webhook_events").select("id", { count: "exact", head: true }).gte("created_at", since).eq("signature_valid", false),
        supabaseAdmin.from("whatsapp_webhook_events").select("created_at").order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabaseAdmin.from("notification_events").select("id", { count: "exact", head: true }).gte("created_at", sinceHour),
        supabaseAdmin.from("notification_events").select("id", { count: "exact", head: true }).gte("created_at", sinceHour).in("status", ["failed", "skipped"]),
        supabaseAdmin.from("push_subscriptions").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabaseAdmin.from("notification_preferences").select("id", { count: "exact", head: true }).eq("push_enabled", true),
        supabaseAdmin.from("notification_events").select("created_at").order("created_at", { ascending: false }).limit(1).maybeSingle(),
      ]);

    const webhookOk = (webhooksLast.count ?? 0) > 0;
    const pushFailRate = (pushHour.count ?? 0) > 0 ? (pushFailHour.count ?? 0) / (pushHour.count ?? 1) : 0;

    return {
      webhook: {
        status: webhookOk ? "ok" : "warn",
        count_15min: webhooksLast.count ?? 0,
        invalid_signature_15min: webhookFailLast.count ?? 0,
        last_event_at: lastWebhook.data?.created_at ?? null,
      },
      push: {
        status: pushFailRate > 0.3 ? "warn" : "ok",
        sent_1h: pushHour.count ?? 0,
        failed_1h: pushFailHour.count ?? 0,
        active_devices: devicesActive.count ?? 0,
        users_with_push_on: prefsPush.count ?? 0,
        last_event_at: lastEvent.data?.created_at ?? null,
      },
      realtime: {
        status: "ok",
        note: "Presença é medida ao vivo no cliente via canal Realtime.",
      },
      checked_at: new Date().toISOString(),
    };
  });

// ===== Webhook Meta =====
const ListWebhookSchema = z.object({
  workspace_id: z.string().uuid().optional().nullable(),
  connection_id: z.string().uuid().optional().nullable(),
  only_invalid: z.boolean().optional(),
  limit: z.number().int().min(1).max(200).default(50),
});

export const listWebhookEvents = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => ListWebhookSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    let q = supabaseAdmin
      .from("whatsapp_webhook_events")
      .select("id,workspace_id,connection_id,phone_number_id,event_type,signature_valid,status_code,error,created_at,raw_payload")
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (data.workspace_id) q = q.eq("workspace_id", data.workspace_id);
    if (data.connection_id) q = q.eq("connection_id", data.connection_id);
    if (data.only_invalid) q = q.eq("signature_valid", false);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

// ===== Push OneSignal =====
const ListPushSchema = z.object({
  workspace_id: z.string().uuid().optional().nullable(),
  status: z.enum(["queued", "sent", "delivered", "failed", "skipped"]).optional(),
  limit: z.number().int().min(1).max(200).default(50),
});

export const listPushEvents = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => ListPushSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    let q = supabaseAdmin
      .from("notification_events")
      .select("id,workspace_id,user_id,conversation_id,type,status,provider,error_message,created_at,metadata")
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (data.workspace_id) q = q.eq("workspace_id", data.workspace_id);
    if (data.status) q = q.eq("status", data.status);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const listPushDevices = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      workspace_id: z.string().uuid().optional().nullable(),
      only_active: z.boolean().optional(),
      limit: z.number().int().min(1).max(500).default(100),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    let q = supabaseAdmin
      .from("push_subscriptions")
      .select("id,user_id,workspace_id,provider,external_id,device_type,browser,os,is_active,last_seen_at,created_at")
      .order("last_seen_at", { ascending: false })
      .limit(data.limit);
    if (data.workspace_id) q = q.eq("workspace_id", data.workspace_id);
    if (data.only_active) q = q.eq("is_active", true);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

// ===== Workspaces (pra filtros) =====
export const listWorkspacesLite = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("workspaces")
      .select("id,name,slug")
      .order("name", { ascending: true })
      .limit(500);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

// ===== Ações master =====
export const masterDeactivateDevice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ subscription_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    const { data: row } = await supabaseAdmin
      .from("push_subscriptions")
      .select("user_id,workspace_id,external_id")
      .eq("id", data.subscription_id)
      .maybeSingle();
    const { error } = await supabaseAdmin
      .from("push_subscriptions")
      .update({ is_active: false })
      .eq("id", data.subscription_id);
    if (error) throw new Error(error.message);
    await logAdmin(context.userId, "deactivate_device", { subscription_id: data.subscription_id, ...row }, row?.workspace_id);
    return { ok: true };
  });

export const masterPauseWorkspacePush = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ workspace_id: z.string().uuid(), paused: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    // Pausa = desliga push_enabled de todos do workspace. Reativa volta pra true.
    const { error } = await supabaseAdmin
      .from("notification_preferences")
      .update({ push_enabled: !data.paused })
      .eq("workspace_id", data.workspace_id);
    if (error) throw new Error(error.message);
    await logAdmin(
      context.userId,
      data.paused ? "pause_workspace_push" : "resume_workspace_push",
      { workspace_id: data.workspace_id },
      data.workspace_id,
    );
    return { ok: true };
  });

export const masterSendTestPush = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ workspace_id: z.string().uuid(), user_id: z.string().uuid().optional().nullable() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    await sendPushOnNewMessage({
      workspaceId: data.workspace_id,
      conversationId: "00000000-0000-0000-0000-000000000000",
      contactName: "Teste do Master",
      preview: "Push de teste disparado pelo painel master ✅",
      assigneeUserId: data.user_id ?? context.userId,
    });
    await logAdmin(context.userId, "send_test_push", { workspace_id: data.workspace_id, user_id: data.user_id ?? context.userId }, data.workspace_id);
    return { ok: true };
  });

export const masterReprocessWebhook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ event_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    const { data: ev, error } = await supabaseAdmin
      .from("whatsapp_webhook_events")
      .select("id,workspace_id,raw_payload")
      .eq("id", data.event_id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!ev) throw new Error("Evento não encontrado.");
    await logAdmin(context.userId, "reprocess_webhook", { event_id: data.event_id }, ev.workspace_id);
    // O reprocessamento real depende do handler; aqui marcamos como solicitado e devolvemos payload.
    return { ok: true, payload: ev.raw_payload };
  });

// ===== Teste ponta-a-ponta =====
export const runEndToEndTest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ workspace_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    const steps: Array<{ step: string; ok: boolean; ms: number; detail?: string }> = [];
    const t0 = Date.now();

    // 1) Banco acessível
    let t = Date.now();
    const { error: dbErr } = await supabaseAdmin.from("workspaces").select("id").eq("id", data.workspace_id).maybeSingle();
    steps.push({ step: "banco", ok: !dbErr, ms: Date.now() - t, detail: dbErr?.message });

    // 2) Realtime publicação
    t = Date.now();
    const { data: pub } = await supabaseAdmin
      .from("pg_publication_tables" as never)
      .select("tablename")
      .limit(1);
    steps.push({ step: "realtime_publication", ok: Array.isArray(pub), ms: Date.now() - t });

    // 3) Envia push de teste
    t = Date.now();
    try {
      await sendPushOnNewMessage({
        workspaceId: data.workspace_id,
        conversationId: "00000000-0000-0000-0000-000000000000",
        contactName: "E2E Master",
        preview: "Teste ponta-a-ponta — se você vê isso, push OK ✅",
        assigneeUserId: context.userId,
      });
      steps.push({ step: "push_onesignal", ok: true, ms: Date.now() - t });
    } catch (e) {
      steps.push({ step: "push_onesignal", ok: false, ms: Date.now() - t, detail: (e as Error).message });
    }

    await logAdmin(context.userId, "run_e2e_test", { workspace_id: data.workspace_id, steps }, data.workspace_id);
    return { steps, total_ms: Date.now() - t0 };
  });
