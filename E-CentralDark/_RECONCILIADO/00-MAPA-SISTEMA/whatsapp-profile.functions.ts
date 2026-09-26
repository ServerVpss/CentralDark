// Server functions pro Perfil do WhatsApp, horários, feriados e mensagens automáticas.
// Conversa direto com a Meta Cloud API quando precisa (foto, nome, descrição, etc.)
// e com o nosso banco pro resto.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const META_API = "https://graph.facebook.com/v22.0";

// ---------- Helpers ----------

async function loadConnection(connectionId: string, userId: string) {
  const { data: conn } = await supabaseAdmin
    .from("whatsapp_connections")
    .select("id, workspace_id, phone_number_id, access_token, display_phone_number, name")
    .eq("id", connectionId)
    .maybeSingle();
  if (!conn) throw new Error("Conexão não encontrada.");

  const { data: isMaster } = await supabaseAdmin.rpc("is_super_admin", { _user_id: userId });
  if (!isMaster) {
    const { data: isMember } = await supabaseAdmin.rpc("is_workspace_member", {
      _workspace_id: conn.workspace_id, _user_id: userId,
    });
    if (!isMember) throw new Error("Você não tem acesso a essa conexão.");
  }


  if (!conn.phone_number_id || !conn.access_token) {
    throw new Error("Essa conexão ainda não tem o número configurado na Meta.");
  }
  return conn;
}

async function logAudit(workspaceId: string, userId: string, action: string, payload: Record<string, unknown>) {
  await supabaseAdmin.from("audit_log").insert({
    workspace_id: workspaceId,
    actor_user_id: userId,
    action,
    payload: payload as never,
    category: "user",
  });
}

// ---------- Perfil da Meta ----------

const PROFILE_FIELDS = "about,address,description,email,profile_picture_url,websites,vertical";

async function fetchMetaProfile(conn: { phone_number_id: string | null; access_token: string | null }) {
  const r = await fetch(`${META_API}/${conn.phone_number_id}/whatsapp_business_profile?fields=${PROFILE_FIELDS}`, {
    headers: { Authorization: `Bearer ${conn.access_token}` },
  });
  const json = (await r.json()) as { data?: Array<Record<string, unknown>>; error?: { message?: string } };
  if (!r.ok) throw new Error(json.error?.message ?? `Meta erro ${r.status}`);
  return json.data?.[0] ?? {};
}

export const getWhatsAppProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ connectionId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const conn = await loadConnection(data.connectionId, context.userId);
    const profile = await fetchMetaProfile(conn);
    const photoUrl = (profile.profile_picture_url as string) ?? null;

    // Cacheia a foto na conexão pra exibir na lista de canais / admin sem refazer chamada na Meta.
    await supabaseAdmin
      .from("whatsapp_connections")
      .update({
        profile_picture_url: photoUrl,
        profile_picture_synced_at: new Date().toISOString(),
      })
      .eq("id", conn.id);

    return {
      displayName: conn.name ?? "",
      displayPhone: conn.display_phone_number ?? "",
      about: (profile.about as string) ?? "",
      description: (profile.description as string) ?? "",
      address: (profile.address as string) ?? "",
      email: (profile.email as string) ?? "",
      vertical: (profile.vertical as string) ?? "UNDEFINED",
      websites: (profile.websites as string[]) ?? [],
      photoUrl,
    };
  });

const ProfileUpdateSchema = z.object({
  connectionId: z.string().uuid(),
  about: z.string().max(139).optional(),
  description: z.string().max(512).optional(),
  address: z.string().max(256).optional(),
  email: z.string().email().max(128).or(z.literal("")).optional(),
  vertical: z.enum([
    "UNDEFINED", "OTHER", "AUTO", "BEAUTY", "APPAREL", "EDU", "ENTERTAIN",
    "EVENT_PLAN", "FINANCE", "GROCERY", "GOVT", "HOTEL", "HEALTH", "NONPROFIT",
    "PROF_SERVICES", "RETAIL", "TRAVEL", "RESTAURANT", "NOT_A_BIZ"
  ]).optional(),
  websites: z.array(z.string().url().max(256)).max(2).optional(),
});

export const updateWhatsAppProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => ProfileUpdateSchema.parse(input))
  .handler(async ({ data, context }) => {
    const conn = await loadConnection(data.connectionId, context.userId);
    const body: Record<string, unknown> = { messaging_product: "whatsapp" };
    if (data.about !== undefined) body.about = data.about;
    if (data.description !== undefined) body.description = data.description;
    if (data.address !== undefined) body.address = data.address;
    if (data.email !== undefined) body.email = data.email;
    if (data.vertical !== undefined) body.vertical = data.vertical;
    if (data.websites !== undefined) body.websites = data.websites;

    const r = await fetch(`${META_API}/${conn.phone_number_id}/whatsapp_business_profile`, {
      method: "POST",
      headers: { Authorization: `Bearer ${conn.access_token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = (await r.json()) as { success?: boolean; error?: { message?: string } };
    if (!r.ok || json.error) throw new Error(json.error?.message ?? `Meta erro ${r.status}`);

    await logAudit(conn.workspace_id, context.userId, "whatsapp_profile_update", {
      connection_id: conn.id, fields: Object.keys(body).filter(k => k !== "messaging_product"),
    });
    return { ok: true };
  });

// ---------- Upload de foto de perfil ----------
// Meta usa Resumable Upload (3 passos): cria sessão -> POST do binário -> aplica handle.

const PhotoUploadSchema = z.object({
  connectionId: z.string().uuid(),
  fileBase64: z.string().min(1),
  mimeType: z.enum(["image/jpeg", "image/png"]),
  fileSize: z.number().int().min(1).max(5 * 1024 * 1024),
});

export const uploadWhatsAppProfilePhoto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => PhotoUploadSchema.parse(input))
  .handler(async ({ data, context }) => {
    const conn = await loadConnection(data.connectionId, context.userId);

    const { data: settings } = await supabaseAdmin
      .from("master_settings").select("meta_app_id").eq("id", 1).maybeSingle();
    const appId = settings?.meta_app_id;
    if (!appId) throw new Error("Meta App ID não configurado pelo master. Peça pro admin configurar.");

    // 1) Criar sessão de upload
    const sessionUrl = new URL(`${META_API}/${appId}/uploads`);
    sessionUrl.searchParams.set("file_length", String(data.fileSize));
    sessionUrl.searchParams.set("file_type", data.mimeType);
    sessionUrl.searchParams.set("access_token", conn.access_token!);

    const sessionRes = await fetch(sessionUrl.toString(), { method: "POST" });
    const sessionJson = (await sessionRes.json()) as { id?: string; error?: { message?: string } };
    if (!sessionRes.ok || !sessionJson.id) {
      throw new Error(sessionJson.error?.message ?? "Falha ao iniciar upload da foto.");
    }

    // 2) Enviar binário
    const binary = Uint8Array.from(atob(data.fileBase64), c => c.charCodeAt(0));
    const uploadRes = await fetch(`https://graph.facebook.com/v22.0/${sessionJson.id}`, {
      method: "POST",
      headers: {
        Authorization: `OAuth ${conn.access_token}`,
        "Content-Type": data.mimeType,
        file_offset: "0",
      },
      body: binary,
    });
    const uploadJson = (await uploadRes.json()) as { h?: string; error?: { message?: string } };
    if (!uploadRes.ok || !uploadJson.h) {
      throw new Error(uploadJson.error?.message ?? "Falha no upload do arquivo da foto.");
    }

    // 3) Aplicar foto no perfil
    const applyRes = await fetch(`${META_API}/${conn.phone_number_id}/whatsapp_business_profile`, {
      method: "POST",
      headers: { Authorization: `Bearer ${conn.access_token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messaging_product: "whatsapp", profile_picture_handle: uploadJson.h }),
    });
    const applyJson = (await applyRes.json()) as { success?: boolean; error?: { message?: string } };
    if (!applyRes.ok || applyJson.error) {
      throw new Error(applyJson.error?.message ?? "Foto enviada mas não foi aplicada no perfil.");
    }

    await logAudit(conn.workspace_id, context.userId, "whatsapp_profile_photo_update", {
      connection_id: conn.id, size: data.fileSize, mime: data.mimeType,
    });

    // Refaz o GET na Meta pra capturar a nova URL pública e atualizar o cache da foto.
    try {
      const refreshed = await fetchMetaProfile(conn);
      await supabaseAdmin
        .from("whatsapp_connections")
        .update({
          profile_picture_url: (refreshed.profile_picture_url as string) ?? null,
          profile_picture_synced_at: new Date().toISOString(),
        })
        .eq("id", conn.id);
    } catch {
      // Não bloqueia a operação se a Meta demorar pra propagar.
    }

    return { ok: true };
  });

// ---------- Horário de atendimento ----------

export const getBusinessHours = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ connectionId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const conn = await loadConnection(data.connectionId, context.userId);
    const { data: rows } = await supabaseAdmin
      .from("whatsapp_business_hours")
      .select("weekday, start_time, end_time, enabled")
      .eq("connection_id", conn.id)
      .order("weekday");
    return { hours: rows ?? [] };
  });

const HoursSchema = z.object({
  connectionId: z.string().uuid(),
  hours: z.array(z.object({
    weekday: z.number().int().min(0).max(6),
    start_time: z.string().regex(/^\d{2}:\d{2}$/),
    end_time: z.string().regex(/^\d{2}:\d{2}$/),
    enabled: z.boolean(),
  })).min(7).max(7),
});

export const saveBusinessHours = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => HoursSchema.parse(input))
  .handler(async ({ data, context }) => {
    const conn = await loadConnection(data.connectionId, context.userId);
    await supabaseAdmin.from("whatsapp_business_hours")
      .delete().eq("connection_id", conn.id);
    await supabaseAdmin.from("whatsapp_business_hours").insert(
      data.hours.map(h => ({
        workspace_id: conn.workspace_id,
        connection_id: conn.id,
        weekday: h.weekday,
        start_time: h.start_time,
        end_time: h.end_time,
        enabled: h.enabled,
      }))
    );
    await logAudit(conn.workspace_id, context.userId, "whatsapp_business_hours_update", {
      connection_id: conn.id,
    });
    return { ok: true };
  });

// ---------- Feriados ----------

export const getHolidays = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ connectionId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const conn = await loadConnection(data.connectionId, context.userId);
    const { data: rows } = await supabaseAdmin
      .from("whatsapp_holidays")
      .select("id, date, label")
      .eq("connection_id", conn.id)
      .order("date");
    return { holidays: rows ?? [] };
  });

export const addHoliday = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({
    connectionId: z.string().uuid(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    label: z.string().max(80).optional(),
  }).parse(input))
  .handler(async ({ data, context }) => {
    const conn = await loadConnection(data.connectionId, context.userId);
    const { error } = await supabaseAdmin.from("whatsapp_holidays").insert({
      workspace_id: conn.workspace_id, connection_id: conn.id,
      date: data.date, label: data.label ?? null,
    });
    if (error) throw new Error(error.message);
    await logAudit(conn.workspace_id, context.userId, "whatsapp_holiday_add", {
      connection_id: conn.id, date: data.date,
    });
    return { ok: true };
  });

export const removeHoliday = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({
    connectionId: z.string().uuid(), holidayId: z.string().uuid(),
  }).parse(input))
  .handler(async ({ data, context }) => {
    const conn = await loadConnection(data.connectionId, context.userId);
    await supabaseAdmin.from("whatsapp_holidays")
      .delete().eq("id", data.holidayId).eq("connection_id", conn.id);
    await logAudit(conn.workspace_id, context.userId, "whatsapp_holiday_remove", {
      connection_id: conn.id, holiday_id: data.holidayId,
    });
    return { ok: true };
  });

// ---------- Mensagens automáticas ----------

export const getAutoMessages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ connectionId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const conn = await loadConnection(data.connectionId, context.userId);
    const { data: row } = await supabaseAdmin
      .from("whatsapp_auto_messages")
      .select("greeting_enabled, greeting_text, away_enabled, away_text, timezone")
      .eq("connection_id", conn.id).maybeSingle();
    return {
      config: row ?? {
        greeting_enabled: false,
        greeting_text: "Olá! Recebemos sua mensagem e em breve nossa equipe vai te atender.",
        away_enabled: false,
        away_text: "Olá! Nosso horário de atendimento já foi encerrado. Assim que voltarmos, retornaremos sua mensagem.",
        timezone: "America/Sao_Paulo",
      }
    };
  });

const AutoMsgSchema = z.object({
  connectionId: z.string().uuid(),
  greeting_enabled: z.boolean(),
  greeting_text: z.string().min(1).max(1024),
  away_enabled: z.boolean(),
  away_text: z.string().min(1).max(1024),
  timezone: z.string().min(1).max(64),
});

export const saveAutoMessages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => AutoMsgSchema.parse(input))
  .handler(async ({ data, context }) => {
    const conn = await loadConnection(data.connectionId, context.userId);
    const { error } = await supabaseAdmin.from("whatsapp_auto_messages").upsert({
      workspace_id: conn.workspace_id,
      connection_id: conn.id,
      greeting_enabled: data.greeting_enabled,
      greeting_text: data.greeting_text,
      away_enabled: data.away_enabled,
      away_text: data.away_text,
      timezone: data.timezone,
    }, { onConflict: "connection_id" });
    if (error) throw new Error(error.message);
    await logAudit(conn.workspace_id, context.userId, "whatsapp_auto_messages_update", {
      connection_id: conn.id,
      greeting_enabled: data.greeting_enabled,
      away_enabled: data.away_enabled,
    });
    return { ok: true };
  });
