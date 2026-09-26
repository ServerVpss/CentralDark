// Server functions do fluxo novo "Perfis Meta" — cria perfil por WABA + Token,
// lista números automaticamente da Graph API, importa número como conexão,
// registra PIN, salva eventos de webhook escolhidos e roda diagnóstico.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { randomBytes } from "crypto";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { logAction } from "@/lib/audit.server";

import { formatDateTimeBR } from "@/lib/datetime";
const META_API = "https://graph.facebook.com/v22.0";

function maskToken(t: string | null | undefined) {
  if (!t) return null;
  if (t.length <= 8) return "***";
  return `${t.slice(0, 4)}…${t.slice(-4)}`;
}

async function assertWorkspaceMember(userId: string, workspaceId: string) {
  const { data: sa } = await supabaseAdmin
    .from("user_roles").select("role").eq("user_id", userId).eq("role", "super_admin").maybeSingle();
  if (sa) return;
  const { data } = await supabaseAdmin
    .from("workspace_members").select("id")
    .eq("user_id", userId).eq("workspace_id", workspaceId).maybeSingle();
  if (!data) throw new Error("Acesso negado a este workspace.");
}

async function metaFetch(path: string, token: string, init?: RequestInit) {
  const res = await fetch(`${META_API}${path}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  const text = await res.text();
  let body: unknown = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  return { ok: res.ok, status: res.status, body };
}

// ---------- Perfis ----------

export const listMetaProfiles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ workspaceId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertWorkspaceMember(context.userId, data.workspaceId);
    const { data: rows, error } = await supabaseAdmin
      .from("whatsapp_meta_profiles")
      .select("id,name,waba_id,access_token,status,last_checked_at,last_error,created_at,updated_at")
      .eq("workspace_id", data.workspaceId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (rows ?? []).map((p) => ({
      ...p,
      access_token: maskToken(p.access_token),
    }));
  });

export const createMetaProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      workspaceId: z.string().uuid(),
      name: z.string().trim().min(1).max(120),
      waba_id: z.string().trim().min(3).max(64).regex(/^\d+$/, "WABA ID deve conter apenas números"),
      access_token: z.string().trim().min(20).max(500),
      app_secret: z.string().trim().min(10).max(200).optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertWorkspaceMember(context.userId, data.workspaceId);

    // Valida token contra a Meta antes de salvar.
    const probe = await metaFetch(`/${data.waba_id}?fields=id,name`, data.access_token);
    let status: "active" | "invalid" = "active";
    let last_error: string | null = null;
    if (!probe.ok) {
      status = "invalid";
      const b = probe.body as { error?: { message?: string } } | null;
      last_error = b?.error?.message ?? `Falha ao acessar a WABA (HTTP ${probe.status}).`;
    }

    // Já existe perfil com mesma WABA neste workspace? Reaproveita em vez de duplicar.
    const { data: existing } = await supabaseAdmin
      .from("whatsapp_meta_profiles")
      .select("id")
      .eq("workspace_id", data.workspaceId)
      .eq("waba_id", data.waba_id)
      .maybeSingle();

    if (existing) {
      await supabaseAdmin
        .from("whatsapp_meta_profiles")
        .update({
          name: data.name,
          access_token: data.access_token,
          ...(data.app_secret ? { app_secret: data.app_secret } : {}),
          status,
          last_error,
          last_checked_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (status === "invalid") {
        throw new Error(last_error ?? "Não foi possível validar o token na Meta.");
      }
      return { id: existing.id, status, existed: true };
    }

    const { data: inserted, error } = await supabaseAdmin
      .from("whatsapp_meta_profiles")
      .insert({
        workspace_id: data.workspaceId,
        name: data.name,
        waba_id: data.waba_id,
        access_token: data.access_token,
        app_secret: data.app_secret ?? null,
        status,
        last_error,
        last_checked_at: new Date().toISOString(),
        created_by: context.userId,
      })
      .select("id")
      .single();
    if (error) {
      // Corrida: outro request criou no meio do caminho. Busca e reaproveita.
      if (/duplicate key|whatsapp_meta_profiles_ws_waba_uq/i.test(error.message)) {
        const { data: dup } = await supabaseAdmin
          .from("whatsapp_meta_profiles")
          .select("id")
          .eq("workspace_id", data.workspaceId)
          .eq("waba_id", data.waba_id)
          .maybeSingle();
        if (dup) return { id: dup.id, status, existed: true };
        throw new Error("Essa conta WhatsApp Business já foi adicionada.");
      }
      throw new Error(error.message);
    }

    await logAction({
      workspaceId: data.workspaceId,
      actorUserId: context.userId,
      action: "meta_profile_created", category: "user",
      entity: "whatsapp_meta_profiles",
      entityId: inserted.id,
      payload: { name: data.name, waba_id: data.waba_id, status },
    });

    if (status === "invalid") {
      throw new Error(last_error ?? "Não foi possível validar o token na Meta.");
    }
    return { id: inserted.id, status, existed: false };
  });

export const updateMetaProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      id: z.string().uuid(),
      name: z.string().trim().min(1).max(120).optional(),
      access_token: z.string().trim().min(20).max(500).optional(),
      app_secret: z.string().trim().min(10).max(200).optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: prev } = await supabaseAdmin
      .from("whatsapp_meta_profiles")
      .select("workspace_id,waba_id,access_token")
      .eq("id", data.id).single();
    if (!prev) throw new Error("Perfil não encontrado.");
    await assertWorkspaceMember(context.userId, prev.workspace_id);

    const patch: {
      name?: string;
      access_token?: string;
      app_secret?: string;
      status?: string;
      last_error?: string | null;
      last_checked_at?: string;
    } = {};
    if (data.name) patch.name = data.name;
    if (data.app_secret) patch.app_secret = data.app_secret;
    if (data.access_token) {
      const probe = await metaFetch(`/${prev.waba_id}?fields=id,name`, data.access_token);
      if (!probe.ok) {
        const b = probe.body as { error?: { message?: string } } | null;
        throw new Error(b?.error?.message ?? `Token inválido (HTTP ${probe.status}).`);
      }
      patch.access_token = data.access_token;
      patch.status = "active";
      patch.last_error = null;
      patch.last_checked_at = new Date().toISOString();
    }

    const { error } = await supabaseAdmin
      .from("whatsapp_meta_profiles").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);

    // Propaga app_secret atualizado para as conexões filhas (números desta WABA).
    if (data.app_secret) {
      await supabaseAdmin
        .from("whatsapp_connections")
        .update({ app_secret: data.app_secret })
        .eq("profile_id", data.id);
    }
    return { ok: true };
  });

export const deleteMetaProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: prev } = await supabaseAdmin
      .from("whatsapp_meta_profiles").select("workspace_id,name").eq("id", data.id).single();
    if (!prev) throw new Error("Perfil não encontrado.");
    await assertWorkspaceMember(context.userId, prev.workspace_id);

    const { count } = await supabaseAdmin
      .from("whatsapp_connections")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", data.id);
    if ((count ?? 0) > 0) {
      throw new Error("Este perfil tem números conectados. Remova os números antes de excluir.");
    }

    const { error } = await supabaseAdmin
      .from("whatsapp_meta_profiles").delete().eq("id", data.id);
    if (error) throw new Error(error.message);

    await logAction({
      workspaceId: prev.workspace_id,
      actorUserId: context.userId,
      action: "meta_profile_deleted", category: "user",
      entity: "whatsapp_meta_profiles",
      entityId: data.id,
      payload: { name: prev.name },
    });
    return { ok: true };
  });

// ---------- Números ----------

export const listMetaProfileNumbers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ profileId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: profile } = await supabaseAdmin
      .from("whatsapp_meta_profiles")
      .select("id,workspace_id,waba_id,access_token")
      .eq("id", data.profileId).single();
    if (!profile) throw new Error("Perfil não encontrado.");
    await assertWorkspaceMember(context.userId, profile.workspace_id);

    const res = await metaFetch(
      `/${profile.waba_id}/phone_numbers?fields=id,display_phone_number,verified_name,quality_rating,code_verification_status,status`,
      profile.access_token,
    );
    if (!res.ok) {
      const b = res.body as { error?: { message?: string } } | null;
      throw new Error(b?.error?.message ?? `Falha ao listar números (HTTP ${res.status}).`);
    }
    const body = res.body as { data?: Array<{
      id: string;
      display_phone_number?: string;
      verified_name?: string;
      quality_rating?: string;
      code_verification_status?: string;
      status?: string;
    }> };

    // Marca quais já estão importados como conexão.
    const ids = (body.data ?? []).map((n) => n.id);
    const { data: existing } = ids.length
      ? await supabaseAdmin
          .from("whatsapp_connections")
          .select("id,phone_number_id")
          .eq("workspace_id", profile.workspace_id)
          .in("phone_number_id", ids)
      : { data: [] as { id: string; phone_number_id: string | null }[] };
    const map = new Map((existing ?? []).map((c) => [c.phone_number_id, c.id]));

    return (body.data ?? []).map((n) => ({
      phone_number_id: n.id,
      display_phone_number: n.display_phone_number ?? null,
      verified_name: n.verified_name ?? null,
      quality_rating: n.quality_rating ?? null,
      code_verification_status: n.code_verification_status ?? null,
      status: n.status ?? null,
      connection_id: map.get(n.id) ?? null,
    }));
  });

export const importMetaPhoneNumber = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      profileId: z.string().uuid(),
      phone_number_id: z.string().min(3).max(64),
      display_phone_number: z.string().max(64).optional(),
      verified_name: z.string().max(120).optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: profile } = await supabaseAdmin
      .from("whatsapp_meta_profiles")
      .select("id,workspace_id,waba_id,access_token,app_secret,name")
      .eq("id", data.profileId).single();
    if (!profile) throw new Error("Perfil não encontrado.");
    await assertWorkspaceMember(context.userId, profile.workspace_id);

    // Já existe? reaproveita.
    const { data: existing } = await supabaseAdmin
      .from("whatsapp_connections")
      .select("id")
      .eq("workspace_id", profile.workspace_id)
      .eq("phone_number_id", data.phone_number_id)
      .maybeSingle();

    if (existing) {
      await supabaseAdmin
        .from("whatsapp_connections")
        .update({
          profile_id: profile.id,
          waba_id: profile.waba_id,
          access_token: profile.access_token,
          ...(profile.app_secret ? { app_secret: profile.app_secret } : {}),
        })
        .eq("id", existing.id);
      return { connection_id: existing.id, created: false };
    }

    const verify_token = randomBytes(24).toString("hex");
    const { data: inserted, error } = await supabaseAdmin
      .from("whatsapp_connections")
      .insert({
        workspace_id: profile.workspace_id,
        profile_id: profile.id,
        name: data.verified_name ?? profile.name,
        display_name: data.verified_name ?? null,
        display_phone_number: data.display_phone_number ?? null,
        phone: data.display_phone_number ?? null,
        phone_number_id: data.phone_number_id,
        waba_id: profile.waba_id,
        access_token: profile.access_token,
        app_secret: profile.app_secret ?? null,
        verify_token,
        provider: "meta_cloud",
        connection_mode: "new",
        onboarding_mode: "manual",
        status: "pending",
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    await logAction({
      workspaceId: profile.workspace_id,
      actorUserId: context.userId,
      action: "meta_profile_number_imported", category: "user",
      entity: "whatsapp_connections",
      entityId: inserted.id,
      payload: { profile_id: profile.id, phone_number_id: data.phone_number_id },
    });
    return { connection_id: inserted.id, created: true };
  });

export const requestPhoneRegistration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      connectionId: z.string().uuid(),
      pin: z.string().regex(/^\d{6}$/, "PIN deve ter 6 dígitos"),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: conn } = await supabaseAdmin
      .from("whatsapp_connections")
      .select("id,workspace_id,phone_number_id,access_token")
      .eq("id", data.connectionId).single();
    if (!conn) throw new Error("Conexão não encontrada.");
    await assertWorkspaceMember(context.userId, conn.workspace_id);
    if (!conn.access_token || !conn.phone_number_id) {
      throw new Error("Conexão sem token ou phone_number_id.");
    }

    const res = await metaFetch(`/${conn.phone_number_id}/register`, conn.access_token, {
      method: "POST",
      body: JSON.stringify({ messaging_product: "whatsapp", pin: data.pin }),
    });
    if (!res.ok) {
      const b = res.body as { error?: { message?: string } } | null;
      throw new Error(b?.error?.message ?? `Falha ao registrar (HTTP ${res.status}).`);
    }
    await supabaseAdmin.from("whatsapp_connections")
      .update({ status: "registered" }).eq("id", conn.id);
    return { ok: true };
  });

// ---------- Webhook ----------

export const updateWebhookEvents = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      connectionId: z.string().uuid(),
      events: z.array(z.string().min(1).max(64)).min(1).max(20),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: conn } = await supabaseAdmin
      .from("whatsapp_connections").select("workspace_id").eq("id", data.connectionId).single();
    if (!conn) throw new Error("Conexão não encontrada.");
    await assertWorkspaceMember(context.userId, conn.workspace_id);
    const { error } = await supabaseAdmin
      .from("whatsapp_connections")
      .update({ selected_webhook_events: data.events })
      .eq("id", data.connectionId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getConnectionBasics = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ connectionId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: conn } = await supabaseAdmin
      .from("whatsapp_connections")
      .select("id,workspace_id,name,display_phone_number,phone_number_id,waba_id,verify_token,status,selected_webhook_events,last_webhook_at,last_webhook_validated_at,app_secret,access_token,webhook_signature_mode")
      .eq("id", data.connectionId).single();
    if (!conn) throw new Error("Conexão não encontrada.");
    await assertWorkspaceMember(context.userId, conn.workspace_id);
    return {
      ...conn,
      access_token: maskToken(conn.access_token),
      app_secret: maskToken(conn.app_secret),
      has_app_secret: !!(conn.app_secret && conn.app_secret.length >= 10),
    };
  });

// Salva configurações de segurança avançada (App Secret opcional + modo de assinatura).
export const updateConnectionSecurity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      connectionId: z.string().uuid(),
      app_secret: z.string().trim().min(10).max(500).optional().or(z.literal("")),
      webhook_signature_mode: z.enum(["optional", "required"]).optional(),
      clear_secret: z.boolean().optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: conn } = await supabaseAdmin
      .from("whatsapp_connections").select("workspace_id").eq("id", data.connectionId).single();
    if (!conn) throw new Error("Conexão não encontrada.");
    await assertWorkspaceMember(context.userId, conn.workspace_id);

    const patch: { app_secret?: string | null; webhook_signature_mode?: string } = {};
    if (data.clear_secret) patch.app_secret = null;
    else if (data.app_secret && data.app_secret.length >= 10) patch.app_secret = data.app_secret;
    if (data.webhook_signature_mode) patch.webhook_signature_mode = data.webhook_signature_mode;

    if (patch.webhook_signature_mode === "required" && !patch.app_secret && data.clear_secret) {
      throw new Error("Não dá pra usar o modo 'obrigatório' sem App Secret.");
    }

    const { error } = await supabaseAdmin
      .from("whatsapp_connections").update(patch).eq("id", data.connectionId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Diagnóstico ----------

export const runConnectionDiagnostic = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ connectionId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: conn } = await supabaseAdmin
      .from("whatsapp_connections")
      .select("workspace_id,access_token,waba_id,phone_number_id,app_secret,verify_token,last_webhook_at,selected_webhook_events")
      .eq("id", data.connectionId).single();
    if (!conn) throw new Error("Conexão não encontrada.");
    await assertWorkspaceMember(context.userId, conn.workspace_id);

    type Status = "ok" | "warn" | "error";
    type Check = { key: string; label: string; status: Status; message: string };
    type TriText = { ok: string; warn: string; error: string };

    // Helper: monta o check garantindo que rótulo e mensagem combinam com o status.
    // Evita o bug clássico de ícone vermelho + título "configurado".
    const mk = (
      key: string,
      status: Status,
      labels: TriText,
      messages: TriText,
    ): Check => ({
      key,
      status,
      label: labels[status],
      message: messages[status],
    });

    const checks: Check[] = [];

    // 1. Access Token
    let tokenStatus: Status = "ok";
    let tokenMsgError = "Token inválido ou expirado.";
    if (!conn.access_token) {
      tokenStatus = "error";
      tokenMsgError = "Token ausente — adicione o Access Token permanente da Meta.";
    } else {
      const me = await metaFetch(`/me`, conn.access_token);
      if (!me.ok) {
        tokenStatus = "error";
        const b = me.body as { error?: { message?: string } } | null;
        tokenMsgError = b?.error?.message ?? "Token inválido ou expirado.";
      }
    }
    checks.push(
      mk(
        "token",
        tokenStatus,
        { ok: "Access Token válido", warn: "Access Token com aviso", error: "Access Token inválido" },
        { ok: "Token aceito pela Meta.", warn: "Token aceito, mas com observações.", error: tokenMsgError },
      ),
    );

    // 2. WABA acessível
    let wabaStatus: Status = "error";
    let wabaErrorMsg = "WABA ID ausente.";
    if (conn.access_token && conn.waba_id) {
      const w = await metaFetch(`/${conn.waba_id}?fields=id,name`, conn.access_token);
      if (w.ok) {
        wabaStatus = "ok";
      } else {
        wabaStatus = "error";
        wabaErrorMsg = "Token não tem acesso a esta WABA.";
      }
    }
    checks.push(
      mk(
        "waba",
        wabaStatus,
        { ok: "WABA acessível", warn: "WABA com aviso", error: "WABA inacessível" },
        { ok: "Conta WhatsApp Business acessível.", warn: "Acesso à WABA com observações.", error: wabaErrorMsg },
      ),
    );

    // 3. Phone Number ID
    let numberStatus: Status = "warn";
    let numberErrorMsg = "Phone Number ID inválido.";
    let numberWarnMsg = "Phone Number ID ausente.";
    if (conn.access_token && conn.waba_id && conn.phone_number_id) {
      const list = await metaFetch(`/${conn.waba_id}/phone_numbers?fields=id`, conn.access_token);
      if (list.ok) {
        const body = list.body as { data?: { id: string }[] };
        const belongs = (body.data ?? []).some((n) => n.id === conn.phone_number_id);
        if (belongs) {
          numberStatus = "ok";
        } else {
          numberStatus = "error";
          numberErrorMsg = "Phone Number ID não pertence a esta WABA.";
        }
      } else {
        numberStatus = "warn";
        numberWarnMsg = "Não foi possível verificar o número agora.";
      }
    }
    checks.push(
      mk(
        "number",
        numberStatus,
        { ok: "Phone Number ID válido", warn: "Phone Number ID não verificado", error: "Phone Number ID inválido" },
        { ok: "Número pertence a esta WABA.", warn: numberWarnMsg, error: numberErrorMsg },
      ),
    );

    // 4. App Secret — agora opcional (modo TypeSend).
    checks.push(
      mk(
        "secret",
        conn.app_secret ? "ok" : "warn",
        { ok: "App Secret configurado", warn: "App Secret opcional (não configurado)", error: "App Secret rejeitado" },
        {
          ok: "App Secret presente — assinatura X-Hub-Signature-256 será validada.",
          warn: "App Secret não configurado. O MultiZap está aceitando webhooks pelo modo compatível, validando connectionId, verify token e IDs da Meta. Para segurança máxima, configure o App Secret na aba Webhook → Segurança avançada.",
          error: "App Secret rejeitado.",
        },
      ),
    );

    // 5. Verify Token
    checks.push(
      mk(
        "verify",
        conn.verify_token ? "ok" : "error",
        { ok: "Verify Token gerado", warn: "Verify Token com aviso", error: "Verify Token ausente" },
        {
          ok: "Verify token presente.",
          warn: "Verify token presente, mas com observações.",
          error: "Verify token não gerado.",
        },
      ),
    );

    // 6. Campo "messages" assinado
    const events = (conn.selected_webhook_events ?? []) as string[];
    const hasMessages = Array.isArray(events) && events.includes("messages");
    checks.push(
      mk(
        "messages",
        hasMessages ? "ok" : "warn",
        { ok: "Campo messages assinado", warn: "Campo messages não assinado", error: "Campo messages bloqueado" },
        {
          ok: "Você marcou o evento messages.",
          warn: "Marque o evento messages para receber mensagens.",
          error: "Evento messages não pode ser assinado.",
        },
      ),
    );

    // 7. Última atividade do webhook
    const lastAtMsg = conn.last_webhook_at
      ? `Último evento em ${formatDateTimeBR(conn.last_webhook_at)}.`
      : "Nenhuma mensagem recebida ainda. Envie um 'oi' para testar.";
    checks.push(
      mk(
        "last_msg",
        conn.last_webhook_at ? "ok" : "warn",
        { ok: "Webhook recebendo eventos", warn: "Webhook sem atividade recente", error: "Webhook sem atividade" },
        { ok: lastAtMsg, warn: lastAtMsg, error: "Nenhum evento recebido." },
      ),
    );

    // Sanity check de consistência: nenhum check pode sair com label/mensagem vazios
    // ou contradizendo o status (ex.: status=error com label começando por "configurado").
    for (const c of checks) {
      if (!c.label || !c.message) {
        console.warn(`[diagnose] check "${c.key}" sem label/mensagem`, c);
      }
      const lower = c.label.toLowerCase();
      if (c.status === "error" && /(configurad|válid|acessível|gerad|assinad|recebendo)/.test(lower)) {
        console.warn(`[diagnose] check "${c.key}" com status=error mas label positivo: "${c.label}"`);
      }
      if (c.status === "ok" && /(ausente|inválid|inacessível|bloquead|sem atividade)/.test(lower)) {
        console.warn(`[diagnose] check "${c.key}" com status=ok mas label negativo: "${c.label}"`);
      }
    }

    return { checks };
  });
