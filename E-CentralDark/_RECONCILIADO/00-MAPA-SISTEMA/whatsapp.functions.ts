import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createHmac } from "crypto";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { dispatchWhatsAppMessage, getTicketWindow } from "@/lib/whatsapp-send.server";
import { logAction } from "@/lib/audit.server";
import { gatewayCall } from "@/lib/multizap-gateway.server";


function maskSecret(s: string | null | undefined) {
  if (!s) return null;
  if (s.length <= 8) return "***";
  return `${s.slice(0, 4)}***${s.slice(-3)}`;
}

const META_API = "https://graph.facebook.com/v22.0";

async function assertWorkspaceMember(userId: string, workspaceId: string) {
  const { data: sa } = await supabaseAdmin
    .from("user_roles").select("role").eq("user_id", userId).eq("role", "super_admin").maybeSingle();
  if (sa) return; // super admin bypasses membership
  const { data } = await supabaseAdmin
    .from("workspace_members")
    .select("id")
    .eq("user_id", userId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  if (!data) throw new Error("Acesso negado a este workspace.");
}

async function assertSuperAdmin(userId: string) {
  const { data } = await supabaseAdmin
    .from("user_roles").select("role").eq("user_id", userId).eq("role", "super_admin").maybeSingle();
  if (!data) throw new Error("Acesso negado: apenas Super Admin.");
}

// ---------- Connections CRUD (workspace level) ----------

export const listWhatsAppConnections = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ workspaceId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertWorkspaceMember(context.userId, data.workspaceId);
    const { data: rows, error } = await supabaseAdmin
      .from("whatsapp_connections")
      .select("id,name,phone,display_phone_number,phone_number_id,waba_id,verify_token,status,quality_rating,messaging_tier,error_count,last_error,last_error_at,last_webhook_at,default_sector_id,default_assignee_id,created_at,profile_picture_url,profile_picture_synced_at")
      .eq("workspace_id", data.workspaceId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  workspaceId: z.string().uuid(),
  name: z.string().min(1).max(120),
  phone: z.string().max(40).optional().nullable(),
  phone_number_id: z.string().min(3).max(60),
  waba_id: z.string().min(3).max(60),
  // Podem vir vazios no rascunho inicial; validação real acontece no teste de conexão.
  access_token: z.string().max(4000).optional().default(""),
  app_secret: z.string().max(500).optional().default(""),
  verify_token: z.string().min(6).max(120),
  display_phone_number: z.string().max(40).optional().nullable(),
  default_sector_id: z.string().uuid().nullable().optional(),
  default_assignee_id: z.string().uuid().nullable().optional(),
  // Campos novos do fluxo manual
  meta_app_id: z.string().max(60).optional().nullable(),
  country_code: z.string().max(6).optional().nullable(),
  display_name: z.string().max(120).optional().nullable(),
  connection_mode: z.enum(["manual", "embedded_signup", "baileys"]).optional(),
  initial_status: z.enum(["pending", "approved", "connected"]).optional(),
});

export const upsertWhatsAppConnection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => upsertSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertWorkspaceMember(context.userId, data.workspaceId);
    const payload: Record<string, unknown> = {
      workspace_id: data.workspaceId,
      provider: "meta_cloud",
      name: data.name,
      phone: data.phone ?? null,
      phone_number_id: data.phone_number_id,
      waba_id: data.waba_id,
      verify_token: data.verify_token,
      display_phone_number: data.display_phone_number ?? data.phone ?? null,
      default_sector_id: data.default_sector_id ?? null,
      default_assignee_id: data.default_assignee_id ?? null,
      meta_app_id: data.meta_app_id ?? null,
      country_code: data.country_code ?? null,
      display_name: data.display_name ?? null,
      connection_mode: data.connection_mode ?? "manual",
      status: data.initial_status ?? "connected",
      ...(data.access_token ? { access_token: data.access_token } : {}),
      ...(data.app_secret ? { app_secret: data.app_secret } : {}),
    } as never;
    if (data.id) {
      const { data: prevConn } = await supabaseAdmin
        .from("whatsapp_connections")
        .select("workspace_id,name,phone,phone_number_id,waba_id,display_phone_number,default_sector_id,default_assignee_id,status")
        .eq("id", data.id).maybeSingle();
      if (!prevConn) throw new Error("Conexão não encontrada.");
      // Segurança: bloqueia "roubar" conexão de outro workspace passando id alheio + workspaceId próprio.
      if (prevConn.workspace_id !== data.workspaceId) {
        throw new Error("Conexão não pertence a este workspace.");
      }
      const { error } = await supabaseAdmin.from("whatsapp_connections").update(payload as never).eq("id", data.id);
      if (error) throw new Error(error.message);
      await logAction({
        action: "whatsapp_connection_updated",
        category: "user",
        workspaceId: data.workspaceId,
        actorUserId: context.userId,
        entity: "whatsapp_connections",
        entityId: data.id,
        before: prevConn ?? null,
        after: { ...payload, access_token: maskSecret(payload.access_token as string | null | undefined), app_secret: maskSecret(payload.app_secret as string | null | undefined) },
      });
      return { id: data.id };
    }
    // Evita duplicata: se já existe conexão com mesmo phone_number_id, faz update em vez de criar outra.
    if (data.phone_number_id) {
      const { data: existing } = await supabaseAdmin
        .from("whatsapp_connections")
        .select("id,workspace_id")
        .eq("phone_number_id", data.phone_number_id)
        .maybeSingle();
      if (existing) {
        if (existing.workspace_id !== data.workspaceId) {
          throw new Error("Este número já está conectado em outra conta. Remova de lá antes de conectar aqui.");
        }
        const { error: upErr } = await supabaseAdmin.from("whatsapp_connections").update(payload as never).eq("id", existing.id);
        if (upErr) throw new Error(upErr.message);
        return { id: existing.id };
      }
    }
    const { data: row, error } = await supabaseAdmin
      .from("whatsapp_connections").insert(payload as never).select("id").single();
    if (error) {
      if (/idx_wa_conn_phone_number_id|duplicate key/i.test(error.message)) {
        throw new Error("Este Phone Number ID já está cadastrado. Edite a conexão existente em vez de criar outra.");
      }
      throw new Error(error.message);
    }
    await logAction({
      action: "whatsapp_connection_created",
      category: "user",
      workspaceId: data.workspaceId,
      actorUserId: context.userId,
      entity: "whatsapp_connections",
      entityId: row.id,
      after: { ...payload, access_token: maskSecret(payload.access_token as string | null | undefined), app_secret: maskSecret(payload.app_secret as string | null | undefined) },
    });
    return { id: row.id };
  });

export const rotateWhatsAppAccessToken = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid(), access_token: z.string().min(20) }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: prev } = await supabaseAdmin
      .from("whatsapp_connections")
      .select("workspace_id,access_token")
      .eq("id", data.id).maybeSingle();
    if (!prev) throw new Error("Conexão não encontrada.");
    await assertWorkspaceMember(context.userId, prev.workspace_id);
    const { error } = await supabaseAdmin
      .from("whatsapp_connections")
      .update({ access_token: data.access_token, status: "connected", last_error: null, last_error_at: null, error_count: 0 })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    await logAction({
      action: "whatsapp_token_rotated",
      category: "user",
      workspaceId: prev.workspace_id,
      actorUserId: context.userId,
      entity: "whatsapp_connections",
      entityId: data.id,
      before: { access_token: maskSecret(prev.access_token) },
      after: { access_token: maskSecret(data.access_token) },
    });
    return { ok: true };
  });

export const deleteWhatsAppConnection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: conn } = await supabaseAdmin
      .from("whatsapp_connections")
      .select("workspace_id,name,phone,phone_number_id,waba_id,display_phone_number,status,provider,session_data,baileys_session_id")
      .eq("id", data.id).single();
    if (!conn) throw new Error("Conexão não encontrada.");
    await assertWorkspaceMember(context.userId, conn.workspace_id);

    // Se for conexão do MultiZap-Gateway (WuzAPI / QR), remove TAMBÉM no gateway.
    // Sem isso o auto-sync recria a conexão local em ~30s e dá impressão de
    // que o botão "Remover" não funcionou.
    const isGateway = conn.provider === "wuzapi_gateway" || conn.provider === "multizap_qr";
    if (isGateway) {
      const sess = (conn.session_data ?? {}) as { gateway_connection_id?: string };
      const gatewayConnId =
        sess.gateway_connection_id || conn.baileys_session_id || conn.phone_number_id;
      if (gatewayConnId) {
        const idsToRemove = Array.from(new Set([
          gatewayConnId,
          conn.phone_number_id,
          conn.baileys_session_id,
        ].filter(Boolean))) as string[];

        // Tombstone ANTES de qualquer outra coisa: impede sync/auto-create de
        // recriar a conexão depois que o usuário pediu remoção. Se houver IDs
        // antigos duplicados na linha, marca todos como removidos.
        for (const gid of idsToRemove) {
          try {
            await supabaseAdmin.from("removed_qr_connections").upsert(
              {
                workspace_id: conn.workspace_id,
                gateway_connection_id: gid,
                removed_by: context.userId,
                removed_at: new Date().toISOString(),
                expires_at: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
              } as never,
              { onConflict: "gateway_connection_id" } as never,
            );
          } catch (err) {
            console.warn("[delete] falha ao gravar tombstone:", err instanceof Error ? err.message : err);
          }

          const removeRes = await gatewayCall(
            `/connections/${encodeURIComponent(gid)}`,
            { method: "DELETE" },
            { timeoutMs: 8000 },
          );
          if (!removeRes.ok) {
            console.warn(
              "[delete] remoção no gateway não confirmou, seguindo com limpeza local:",
              removeRes.error?.message ?? removeRes.status,
            );
          }
        }

        // Limpa eventuais duplicatas locais que apontem pro mesmo ID do Gateway.
        for (const gid of idsToRemove) {
          await supabaseAdmin
            .from("whatsapp_connections")
            .delete()
            .eq("workspace_id", conn.workspace_id)
            .in("provider", ["wuzapi_gateway", "multizap_qr"])
            .eq("phone_number_id", gid);
          await supabaseAdmin
            .from("whatsapp_connections")
            .delete()
            .eq("workspace_id", conn.workspace_id)
            .in("provider", ["wuzapi_gateway", "multizap_qr"])
            .eq("baileys_session_id", gid);
        }
      }
    }


    const { error } = await supabaseAdmin.from("whatsapp_connections").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await logAction({
      action: "whatsapp_connection_deleted",
      category: "user",
      workspaceId: conn.workspace_id,
      actorUserId: context.userId,
      entity: "whatsapp_connections",
      entityId: data.id,
      before: conn,
    });
    return { ok: true };
  });

export const disconnectWhatsAppConnection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: conn } = await supabaseAdmin
      .from("whatsapp_connections")
      .select("workspace_id,name,phone_number_id,display_phone_number,status,provider,session_data,baileys_session_id")
      .eq("id", data.id).single();
    if (!conn) throw new Error("Conexão não encontrada.");
    await assertWorkspaceMember(context.userId, conn.workspace_id);

    const isGateway = conn.provider === "wuzapi_gateway" || conn.provider === "multizap_qr";
    if (!isGateway) throw new Error("Desconectar sem remover está disponível apenas para WhatsApp QR MultiZap.");

    const sess = (conn.session_data ?? {}) as { gateway_connection_id?: string };
    const gatewayConnId = sess.gateway_connection_id || conn.baileys_session_id || conn.phone_number_id;
    if (!gatewayConnId) throw new Error("Conexão QR sem ID do Gateway.");

    // Tenta logout no Gateway, mas se já estiver caída/inexistente (404/500),
    // segue em frente e marca como desconectada localmente. Sem isso, o botão
    // "Desconectar" estoura HTTP 500 só porque a sessão já não existe no WuzAPI.
    let gatewayLogoutError: string | null = null;
    try {
      const { gatewayFetch } = await import("@/lib/multizap-gateway.server");
      await gatewayFetch(`/connections/${encodeURIComponent(gatewayConnId)}/logout`, { method: "POST" });
    } catch (err) {
      gatewayLogoutError = err instanceof Error ? err.message : String(err);
      console.warn(`[disconnect] logout no Gateway falhou (seguindo mesmo assim): ${gatewayLogoutError}`);
    }

    const { error } = await supabaseAdmin
      .from("whatsapp_connections")
      .update({ status: "disconnected", last_error: null, last_error_at: null } as never)
      .eq("id", data.id);
    if (error) throw new Error(error.message);

    await logAction({
      action: "whatsapp_connection_disconnected",
      category: "user",
      workspaceId: conn.workspace_id,
      actorUserId: context.userId,
      entity: "whatsapp_connections",
      entityId: data.id,
      before: conn,
      after: { status: "disconnected", gateway_connection_id: gatewayConnId, gateway_logout_error: gatewayLogoutError },
    });
    return { ok: true, gateway_logout_error: gatewayLogoutError };
  });

// Reconexão "macia" de uma conexão QR: chama /connections/:id/disconnect e
// /connections/:id/restart no Gateway. NÃO faz logout — preserva a sessão
// pareada do WhatsApp. Usado pelo botão "Reconectar sessão" em /app/canais
// e em /admin/whatsapp. Audit log: user:qr_session_reconnected (ou
// admin:qr_session_reconnected quando o ator é super_admin).
export const softReconnectQrConnection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: conn } = await supabaseAdmin
      .from("whatsapp_connections")
      .select("workspace_id,name,phone,phone_number_id,display_phone_number,status,provider,session_data,baileys_session_id")
      .eq("id", data.id).single();
    if (!conn) throw new Error("Conexão não encontrada.");
    await assertWorkspaceMember(context.userId, conn.workspace_id);

    const isGateway = conn.provider === "wuzapi_gateway" || conn.provider === "multizap_qr";
    if (!isGateway) throw new Error("Reconectar sessão só está disponível para WhatsApp QR MultiZap.");

    const sess = (conn.session_data ?? {}) as { gateway_connection_id?: string };
    const gatewayConnId = sess.gateway_connection_id || conn.baileys_session_id || conn.phone_number_id;
    if (!gatewayConnId) throw new Error("Conexão QR sem ID do Gateway.");

    // Verifica se ator é super admin pra prefixo de auditoria
    const { data: sa } = await supabaseAdmin
      .from("user_roles").select("role").eq("user_id", context.userId).eq("role", "super_admin").maybeSingle();
    const isAdminActor = !!sa;

    const { gatewayFetch } = await import("@/lib/multizap-gateway.server");
    const steps: Record<string, string> = {};

    try {
      await gatewayFetch(`/connections/${encodeURIComponent(gatewayConnId)}/disconnect`, { method: "POST" }, { timeoutMs: 20000 });
      steps.disconnect = "ok";
    } catch (err) {
      steps.disconnect = err instanceof Error ? err.message : String(err);
    }
    try {
      await gatewayFetch(`/connections/${encodeURIComponent(gatewayConnId)}/restart`, { method: "POST" }, { timeoutMs: 45000 });
      steps.restart = "ok";
    } catch (err) {
      steps.restart = err instanceof Error ? err.message : String(err);
      await logAction({
        action: "qr_session_reconnect_failed",
        category: isAdminActor ? "admin" : "user",
        workspaceId: conn.workspace_id,
        actorUserId: context.userId,
        entity: "whatsapp_connections",
        entityId: data.id,
        payload: { steps, gateway_connection_id: gatewayConnId },
      });
      throw new Error(`Gateway não conseguiu reiniciar: ${steps.restart}`);
    }

    await logAction({
      action: "qr_session_reconnected",
      category: isAdminActor ? "admin" : "user",
      workspaceId: conn.workspace_id,
      actorUserId: context.userId,
      entity: "whatsapp_connections",
      entityId: data.id,
      payload: { steps, gateway_connection_id: gatewayConnId },
    });

    return { ok: true, steps };
  });



// Reset COMPLETO de uma conexão QR: logout no Gateway (tolerante a erro),
// DELETE no Gateway (tolerante), tombstone anti-recriação e remoção do
// registro local. Depois disso o usuário escaneia um QR NOVO de verdade.
// Usado pelo botão "Reconectar" em conexões WhatsApp QR MultiZap.
export const forceResetQrConnection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: conn } = await supabaseAdmin
      .from("whatsapp_connections")
      .select("workspace_id,name,phone,phone_number_id,waba_id,display_phone_number,status,provider,session_data,baileys_session_id")
      .eq("id", data.id).single();
    if (!conn) throw new Error("Conexão não encontrada.");
    await assertWorkspaceMember(context.userId, conn.workspace_id);

    const isGateway = conn.provider === "wuzapi_gateway" || conn.provider === "multizap_qr";
    if (!isGateway) throw new Error("Reset completo só está disponível para WhatsApp QR MultiZap.");

    const sess = (conn.session_data ?? {}) as { gateway_connection_id?: string };
    const gatewayConnId = sess.gateway_connection_id || conn.baileys_session_id || conn.phone_number_id;

    const steps: Record<string, string> = {};

    // 1) Tombstone ANTES de qualquer coisa: impede que o sync recrie a conexão
    //    no curto intervalo entre o reset e o usuário escanear o novo QR.
    if (gatewayConnId) {
      try {
        await supabaseAdmin.from("removed_qr_connections").upsert(
          {
            workspace_id: conn.workspace_id,
            gateway_connection_id: gatewayConnId,
            removed_by: context.userId,
            removed_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
          } as never,
          { onConflict: "gateway_connection_id" } as never,
        );
        steps.tombstone = "ok";
      } catch (err) {
        steps.tombstone = err instanceof Error ? err.message : String(err);
        console.warn(`[forceReset] tombstone falhou: ${steps.tombstone}`);
      }

      // 2) Logout no Gateway — tolera 404/500 (sessão pode já estar caída).
      try {
        const { gatewayFetch } = await import("@/lib/multizap-gateway.server");
        await gatewayFetch(`/connections/${encodeURIComponent(gatewayConnId)}/logout`, { method: "POST" });
        steps.gateway_logout = "ok";
      } catch (err) {
        steps.gateway_logout = err instanceof Error ? err.message : String(err);
        console.warn(`[forceReset] logout no Gateway falhou (seguindo): ${steps.gateway_logout}`);
      }

      // 3) DELETE no Gateway — apaga a instância WuzAPI inteira.
      try {
        const { gatewayFetch } = await import("@/lib/multizap-gateway.server");
        await gatewayFetch(`/connections/${encodeURIComponent(gatewayConnId)}`, { method: "DELETE" });
        steps.gateway_delete = "ok";
      } catch (err) {
        steps.gateway_delete = err instanceof Error ? err.message : String(err);
        console.warn(`[forceReset] DELETE no Gateway falhou (seguindo): ${steps.gateway_delete}`);
      }
    } else {
      steps.tombstone = "skipped_no_gateway_id";
      steps.gateway_logout = "skipped_no_gateway_id";
      steps.gateway_delete = "skipped_no_gateway_id";
    }

    // 4) Remove o registro local (mesmo se Gateway falhou). Sem isso o
    //    usuário vê a conexão antiga "presa" na tela.
    const { error: delErr } = await supabaseAdmin
      .from("whatsapp_connections")
      .delete()
      .eq("id", data.id);
    if (delErr) {
      steps.local_delete = delErr.message;
      throw new Error(`Reset parcial: registro local não pôde ser removido — ${delErr.message}`);
    }
    steps.local_delete = "ok";

    await logAction({
      action: "qr_connection_force_reset",
      category: "user",
      workspaceId: conn.workspace_id,
      actorUserId: context.userId,
      entity: "whatsapp_connections",
      entityId: data.id,
      before: conn,
      after: { gateway_connection_id: gatewayConnId, steps },
    });

    return { ok: true, gateway_connection_id: gatewayConnId, steps };
  });

// ---------- Test connection against Meta ----------

export const testWhatsAppConnection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: conn } = await supabaseAdmin
      .from("whatsapp_connections")
      .select("workspace_id,phone_number_id,access_token,provider")
      .eq("id", data.id).single();
    if (!conn) throw new Error("Conexão não encontrada.");
    await assertWorkspaceMember(context.userId, conn.workspace_id);

    const provider = (conn.provider ?? "").toLowerCase();
    const isQr = provider === "wuzapi_gateway" || provider === "multizap_qr";

    // QR / Gateway: só faz ping de saúde, NÃO envia mensagem nenhuma.
    if (isQr) {
      const res = await gatewayCall<{ ok?: boolean; service?: string }>(`/health`, {}, { timeoutMs: 6000 });
      if (!res.ok) {
        return {
          ok: false,
          mode: "qr" as const,
          error: res.error?.message ?? `Gateway respondeu HTTP ${res.status ?? "?"}`,
          latency_ms: res.latency_ms,
        };
      }
      return { ok: true, mode: "qr" as const, gateway_ok: true, latency_ms: res.latency_ms };
    }


    // Meta Cloud: comportamento original (consulta dados do número na Meta).
    const res = await fetch(`${META_API}/${conn.phone_number_id}?fields=display_phone_number,verified_name,quality_rating,messaging_limit_tier`, {
      headers: { Authorization: `Bearer ${conn.access_token}` },
    });
    const body = (await res.json()) as Record<string, unknown>;
    if (!res.ok) {
      const msg = (body as { error?: { message?: string } })?.error?.message ?? `HTTP ${res.status}`;
      await supabaseAdmin.from("whatsapp_connections")
        .update({ status: "error", last_error: msg, last_error_at: new Date().toISOString() })
        .eq("id", data.id);
      return { ok: false, mode: "meta" as const, error: msg };
    }
    await supabaseAdmin.from("whatsapp_connections").update({
      status: "connected",
      display_phone_number: (body.display_phone_number as string) ?? null,
      quality_rating: (body.quality_rating as string) ?? null,
      messaging_tier: (body.messaging_limit_tier as string) ?? null,
      last_error: null, last_error_at: null,
    }).eq("id", data.id);
    return {
      ok: true,
      mode: "meta" as const,
      display_phone_number: (body.display_phone_number as string) ?? null,
      verified_name: (body.verified_name as string) ?? null,
      quality_rating: (body.quality_rating as string) ?? null,
      messaging_tier: (body.messaging_limit_tier as string) ?? null,
    };
  });


// ---------- Auto health check (silencioso, roda no fundo) ----------
// Verifica todas as conexões do workspace contra a Meta e atualiza status,
// last_error e last_error_at sem precisar de clique do usuário.
export const autoHealthCheckMyWhatsapp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ workspaceId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertWorkspaceMember(context.userId, data.workspaceId);
    const { data: conns } = await supabaseAdmin
      .from("whatsapp_connections")
      .select("id,phone_number_id,access_token,status")
      .eq("workspace_id", data.workspaceId);

    const results: Array<{ id: string; ok: boolean; error?: string }> = [];
    for (const c of conns ?? []) {
      if (!c.access_token || !c.phone_number_id) continue;
      try {
        const r = await fetch(
          `${META_API}/${c.phone_number_id}?fields=display_phone_number,quality_rating,messaging_limit_tier`,
          { headers: { Authorization: `Bearer ${c.access_token}` } },
        );
        const j = (await r.json()) as Record<string, unknown> & { error?: { message?: string } };
        if (!r.ok) {
          const msg = j?.error?.message ?? `HTTP ${r.status}`;
          await supabaseAdmin
            .from("whatsapp_connections")
            .update({ status: "error", last_error: msg, last_error_at: new Date().toISOString() })
            .eq("id", c.id);
          results.push({ id: c.id, ok: false, error: msg });
        } else {
          await supabaseAdmin
            .from("whatsapp_connections")
            .update({
              display_phone_number: (j.display_phone_number as string) ?? null,
              quality_rating: (j.quality_rating as string) ?? null,
              messaging_tier: (j.messaging_limit_tier as string) ?? null,
              last_error: null,
              last_error_at: null,
              ...(c.status === "error" ? { status: "connected" as const } : {}),
            })
            .eq("id", c.id);
          results.push({ id: c.id, ok: true });
        }
      } catch (e) {
        results.push({ id: c.id, ok: false, error: (e as Error).message });
      }
    }
    return { checkedAt: new Date().toISOString(), results };
  });

// ---------- Diagnose connection (cliente + master) ----------

export const diagnoseWhatsAppConnection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: conn } = await supabaseAdmin
      .from("whatsapp_connections")
      .select("id,workspace_id,phone_number_id,waba_id,access_token,app_secret,verify_token,last_webhook_at,display_phone_number,webhook_signature_mode")
      .eq("id", data.id).single();
    if (!conn) throw new Error("Conexão não encontrada.");
    await assertWorkspaceMember(context.userId, conn.workspace_id);

    const checks: Array<{ key: string; label: string; status: "ok" | "warn" | "error"; detail: string }> = [];

    // 1. Token válido
    let tokenOk = false;
    try {
      const r = await fetch(`${META_API}/${conn.phone_number_id}?fields=display_phone_number,quality_rating`, {
        headers: { Authorization: `Bearer ${conn.access_token ?? ""}` },
      });
      const j = await r.json() as { error?: { message?: string }; display_phone_number?: string };
      if (r.ok) {
        tokenOk = true;
        checks.push({ key: "token", label: "Token de acesso da Meta", status: "ok", detail: `Válido. Número: ${j.display_phone_number ?? "—"}` });
      } else {
        checks.push({ key: "token", label: "Token de acesso da Meta", status: "error", detail: j.error?.message ?? `HTTP ${r.status}` });
      }
    } catch (e) {
      checks.push({ key: "token", label: "Token de acesso da Meta", status: "error", detail: (e as Error).message });
    }

    // 2. App secret — opcional. Sem ele, o webhook roda em modo compatível.
    const sigMode = (conn.webhook_signature_mode ?? "optional") as "optional" | "required";
    if (conn.app_secret && conn.app_secret.length >= 10) {
      checks.push({ key: "secret", label: "App Secret (opcional)", status: "ok", detail: "Configurado — assinatura criptográfica ativa." });
    } else if (sigMode === "required") {
      checks.push({ key: "secret", label: "App Secret", status: "error", detail: "Modo de segurança 'obrigatório' está ativo, mas o App Secret não foi configurado. Webhooks serão rejeitados." });
    } else {
      checks.push({ key: "secret", label: "App Secret (opcional)", status: "ok", detail: "Não configurado — operando em modo compatível. Mensagens da Meta são validadas por connection ID, verify token, WABA e Phone Number ID." });
    }

    // 3. Webhook recebendo
    const last = conn.last_webhook_at ? new Date(conn.last_webhook_at).getTime() : 0;
    const ageH = last ? (Date.now() - last) / 3_600_000 : Infinity;
    if (!last) {
      checks.push({ key: "webhook_recv", label: "Webhook recebendo eventos", status: "warn", detail: "Nenhum evento recebido ainda. Envie uma mensagem de teste pro número e clique em 'Testar agora'." });
    } else if (ageH > 24) {
      checks.push({ key: "webhook_recv", label: "Webhook recebendo eventos", status: "warn", detail: `Último evento há ${Math.round(ageH)}h. Pode estar normal se ninguém escreveu.` });
    } else {
      checks.push({ key: "webhook_recv", label: "Webhook recebendo eventos", status: "ok", detail: `Último evento há ${Math.round(ageH * 60)} min.` });
    }

    // 4. Webhook subscrito na Meta (consulta WABA)
    let subOk = false;
    let autoSubscribed = false;
    if (tokenOk && conn.waba_id) {
      try {
        const r = await fetch(`${META_API}/${conn.waba_id}/subscribed_apps`, {
          headers: { Authorization: `Bearer ${conn.access_token ?? ""}` },
        });
        const j = await r.json() as { data?: Array<{ whatsapp_business_api_data?: { id?: string } }>; error?: { message?: string } };
        if (r.ok) {
          let subs = j.data?.length ?? 0;
          // Auto-registro: se não há nenhum app inscrito, tenta inscrever sozinho (idempotente na Meta).
          if (subs === 0) {
            try {
              const sub = await fetch(`${META_API}/${conn.waba_id}/subscribed_apps`, {
                method: "POST",
                headers: { Authorization: `Bearer ${conn.access_token ?? ""}` },
              });
              const sj = await sub.json() as { success?: boolean; error?: { message?: string } };
              if (sub.ok && sj.success !== false) {
                subs = 1;
                autoSubscribed = true;
                await logAction({
                  action: "whatsapp_diagnostic.auto_subscribe_webhook",
                  category: "system",
                  workspaceId: conn.workspace_id,
                  entity: "whatsapp_connections",
                  entityId: conn.id,
                  payload: { ok: true, auto: true },
                });
              } else {
                checks.push({ key: "subscribed", label: "Webhook registrado na Meta", status: "error", detail: `Auto-registro falhou: ${sj.error?.message ?? `HTTP ${sub.status}`}` });
              }
            } catch (e) {
              checks.push({ key: "subscribed", label: "Webhook registrado na Meta", status: "error", detail: `Auto-registro falhou: ${(e as Error).message}` });
            }
          }
          if (subs > 0) {
            subOk = true;
            checks.push({ key: "subscribed", label: "Webhook registrado na Meta", status: "ok", detail: `${subs} app(s) inscrito(s) nesta WABA${autoSubscribed ? " (acabou de ser registrado automaticamente)" : ""}.` });
          }
        } else {
          checks.push({ key: "subscribed", label: "Webhook registrado na Meta", status: "warn", detail: j.error?.message ?? `HTTP ${r.status}` });
        }
      } catch (e) {
        checks.push({ key: "subscribed", label: "Webhook registrado na Meta", status: "warn", detail: (e as Error).message });
      }
    } else {
      checks.push({ key: "subscribed", label: "Webhook registrado na Meta", status: "warn", detail: "Pulado — token inválido ou WABA não configurada." });
    }

    const okCount = checks.filter((c) => c.status === "ok").length;
    const overall: "ok" | "warn" | "error" = checks.some((c) => c.status === "error") ? "error" : (checks.some((c) => c.status === "warn") ? "warn" : "ok");

    return {
      overall,
      okCount,
      total: checks.length,
      checks,
      webhookUrl: `https://multizap.dev/api/public/whatsapp/webhook/${conn.id}`,
      verifyToken: conn.verify_token ?? "",
      hasWabaId: !!conn.waba_id,
      subscribed: subOk,
      autoSubscribed,
      hasAppSecret: !!(conn.app_secret && conn.app_secret.length >= 10),
      phoneNumberId: conn.phone_number_id ?? "",
    };
  });

// ---------- Atualizar credenciais Meta (App Secret / Access Token) de uma conexão existente ----------

export const updateMetaCredentials = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      id: z.string().uuid(),
      access_token: z.string().min(20).max(2000).optional(),
      app_secret: z.string().min(10).max(500).optional(),
    }).refine((v) => v.access_token || v.app_secret, { message: "Informe pelo menos um campo." }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: prev } = await supabaseAdmin
      .from("whatsapp_connections")
      .select("workspace_id,access_token,app_secret")
      .eq("id", data.id).maybeSingle();
    if (!prev) throw new Error("Conexão não encontrada.");
    await assertWorkspaceMember(context.userId, prev.workspace_id);

    const patch: { access_token?: string; app_secret?: string } = {};
    if (data.access_token) patch.access_token = data.access_token.trim();
    if (data.app_secret) patch.app_secret = data.app_secret.trim();

    const { error } = await supabaseAdmin
      .from("whatsapp_connections")
      .update(patch)
      .eq("id", data.id);
    if (error) throw new Error(error.message);

    await logAction({
      action: "whatsapp_credentials_updated",
      category: "user",
      workspaceId: prev.workspace_id,
      actorUserId: context.userId,
      entity: "whatsapp_connections",
      entityId: data.id,
      before: {
        access_token: maskSecret(prev.access_token),
        app_secret: maskSecret(prev.app_secret),
      },
      after: {
        access_token: data.access_token ? maskSecret(data.access_token) : maskSecret(prev.access_token),
        app_secret: data.app_secret ? maskSecret(data.app_secret) : maskSecret(prev.app_secret),
      },
    });
    return { ok: true };
  });

// ---------- List recent webhook events (workspace member) ----------

export const listConnectionWebhookEvents = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ connectionId: z.string().uuid(), limit: z.number().min(1).max(50).default(20) }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: conn } = await supabaseAdmin
      .from("whatsapp_connections").select("workspace_id").eq("id", data.connectionId).single();
    if (!conn) throw new Error("Conexão não encontrada.");
    await assertWorkspaceMember(context.userId, conn.workspace_id);
    const { data: rows } = await supabaseAdmin
      .from("whatsapp_webhook_events")
      .select("id,event_type,signature_valid,http_method,status_code,error,created_at")
      .eq("connection_id", data.connectionId)
      .order("created_at", { ascending: false })
      .limit(data.limit);
    return rows ?? [];
  });

// ---------- Master: auto-subscribe webhook on Meta ----------

export const adminSubscribeWebhookOnMeta = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    const { data: conn } = await supabaseAdmin
      .from("whatsapp_connections")
      .select("id,workspace_id,waba_id,access_token")
      .eq("id", data.id).single();
    if (!conn) throw new Error("Conexão não encontrada.");
    if (!conn.waba_id) throw new Error("Esta conexão não tem WABA ID. Use o Embedded Signup ou cadastre o WABA manualmente.");
    if (!conn.access_token) throw new Error("Sem access_token salvo nessa conexão.");

    const r = await fetch(`${META_API}/${conn.waba_id}/subscribed_apps`, {
      method: "POST",
      headers: { Authorization: `Bearer ${conn.access_token}` },
    });
    const j = await r.json() as { success?: boolean; error?: { message?: string } };
    const ok = r.ok && j.success !== false;

    await logAction({
      action: "admin:whatsapp_diagnostic.subscribe_webhook",
      category: "admin",
      workspaceId: conn.workspace_id,
      actorUserId: context.userId,
      entity: "whatsapp_connections",
      entityId: conn.id,
      payload: { ok, response: j, status: r.status },
    });

    return { ok, status: r.status, error: ok ? null : (j.error?.message ?? `HTTP ${r.status}`) };
  });

// ---------- Send message with anti-ban guards ----------

const sendSchema = z.object({
  connectionId: z.string().uuid(),
  to: z.string().min(8).max(20),
  text: z.string().min(1).max(4000).optional(),
  templateName: z.string().min(1).max(120).optional(),
  templateLang: z.string().min(2).max(10).default("pt_BR").optional(),
  ticketId: z.string().uuid().optional(),
});

export const sendWhatsAppMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => sendSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { data: conn } = await supabaseAdmin
      .from("whatsapp_connections").select("workspace_id").eq("id", data.connectionId).single();
    if (!conn) throw new Error("Conexão não encontrada.");
    await assertWorkspaceMember(context.userId, conn.workspace_id);
    const r = await dispatchWhatsAppMessage({
      connectionId: data.connectionId,
      to: data.to,
      text: data.text,
      templateName: data.templateName,
      templateLang: data.templateLang,
      ticketId: data.ticketId ?? null,
    });
    if (!r.ok) throw new Error(r.message);
    await logAction({
      action: "whatsapp_message_sent",
      category: "user",
      workspaceId: conn.workspace_id,
      actorUserId: context.userId,
      entity: "whatsapp_message_log",
      entityId: r.messageId ?? null,
      payload: {
        connection_id: data.connectionId,
        to: data.to,
        ticket_id: data.ticketId ?? null,
        is_template: !!data.templateName,
        template_name: data.templateName ?? null,
        body_preview: data.text?.slice(0, 140) ?? null,
      },
    });
    return { ok: true, messageId: r.messageId };
  });

// ---------- Single-ticket window status (for inbox UI) ----------

export const getTicketWindowStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ ticketId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: t } = await supabaseAdmin
      .from("tickets").select("workspace_id").eq("id", data.ticketId).single();
    if (!t) throw new Error("Ticket não encontrado.");
    await assertWorkspaceMember(context.userId, t.workspace_id);
    return getTicketWindow(data.ticketId);
  });

// ---------- Admin master monitor ----------

export const adminWhatsAppOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const { data: conns } = await supabaseAdmin
      .from("whatsapp_connections")
      .select("id,workspace_id,name,display_phone_number,phone_number_id,status,provider,quality_rating,messaging_tier,error_count,last_error,last_error_at,last_webhook_at,created_at,onboarding_mode,profile_picture_url")
      // Esta visão é só Meta Cloud API. Conexões QR (wuzapi_gateway / multizap_qr)
      // aparecem no card "WhatsApp QR — todos os clientes" logo acima.
      .not("provider", "in", "(wuzapi_gateway,multizap_qr)")
      .order("created_at", { ascending: false });
    const ids = (conns ?? []).map((c) => c.id);
    const stats: Record<string, { sent24h: number; recv24h: number; failed24h: number }> = {};
    ids.forEach((id) => (stats[id] = { sent24h: 0, recv24h: 0, failed24h: 0 }));
    if (ids.length) {
      const since = new Date(Date.now() - 24 * 3_600_000).toISOString();
      const { data: logs } = await supabaseAdmin
        .from("whatsapp_message_log")
        .select("connection_id,direction,status")
        .gte("created_at", since)
        .in("connection_id", ids);
      (logs ?? []).forEach((l) => {
        const s = stats[l.connection_id];
        if (!s) return;
        if (l.direction === "inbound") s.recv24h++;
        else if (l.status === "failed") s.failed24h++;
        else s.sent24h++;
      });
    }
    return (conns ?? []).map((c) => ({ ...c, ...stats[c.id] }));
  });

// ---------- Admin: list connections grouped by WABA ----------

export const adminListConnectionsByWaba = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const { data: conns } = await supabaseAdmin
      .from("whatsapp_connections")
      .select("id,workspace_id,name,display_phone_number,phone,phone_number_id,waba_id,status,quality_rating,messaging_tier,last_webhook_at,last_error,created_at,profile_picture_url")
      .order("waba_id", { ascending: true })
      .order("created_at", { ascending: false });
    const groups: Record<string, { waba_id: string; numbers: NonNullable<typeof conns> }> = {};
    for (const c of conns ?? []) {
      const k = c.waba_id ?? "(sem WABA)";
      if (!groups[k]) groups[k] = { waba_id: k, numbers: [] };
      groups[k].numbers.push(c);
    }
    return Object.values(groups);
  });

// ---------- Admin: validate webhook (GET handshake) ----------

export const adminValidateWebhook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    const { data: conn } = await supabaseAdmin
      .from("whatsapp_connections")
      .select("id,verify_token,workspace_id")
      .eq("id", data.id).single();
    if (!conn) throw new Error("Conexão não encontrada.");
    const challenge = `lovable-${Date.now()}`;
    const url = `https://multizap.dev/api/public/whatsapp/webhook/${conn.id}?hub.mode=subscribe&hub.verify_token=${encodeURIComponent(conn.verify_token ?? "")}&hub.challenge=${challenge}`;
    try {
      const res = await fetch(url);
      const text = await res.text();
      const ok = res.ok && text === challenge;
      return { ok, status: res.status, echoed: text, expected: challenge, url };
    } catch (e) {
      return { ok: false, status: 0, echoed: "", expected: challenge, url, error: (e as Error).message };
    }
  });

// ---------- Admin: test x-hub-signature-256 verification ----------

export const adminTestSignature = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    const { data: conn } = await supabaseAdmin
      .from("whatsapp_connections")
      .select("id,app_secret")
      .eq("id", data.id).single();
    if (!conn) throw new Error("Conexão não encontrada.");
    if (!conn.app_secret) return { ok: false, error: "App secret não configurado." };

    const fakePayload = JSON.stringify({
      object: "whatsapp_business_account",
      entry: [{ id: "test", changes: [{ field: "messages", value: { metadata: { phone_number_id: "test" } } }] }],
    });
    const goodSig = "sha256=" + createHmac("sha256", conn.app_secret).update(fakePayload).digest("hex");
    const badSig = "sha256=" + createHmac("sha256", "wrong-secret").update(fakePayload).digest("hex");
    const url = `https://multizap.dev/api/public/whatsapp/webhook/${conn.id}`;

    const headers = { "Content-Type": "application/json" };
    const [okRes, badRes] = await Promise.all([
      fetch(url, { method: "POST", headers: { ...headers, "x-hub-signature-256": goodSig }, body: fakePayload }),
      fetch(url, { method: "POST", headers: { ...headers, "x-hub-signature-256": badSig }, body: fakePayload }),
    ]);

    return {
      ok: okRes.status === 200 && badRes.status === 401,
      validSignatureAccepted: okRes.status === 200,
      invalidSignatureRejected: badRes.status === 401,
      validStatus: okRes.status,
      invalidStatus: badRes.status,
    };
  });

// ---------- Admin: recent webhook events for a connection ----------

export const adminRecentWebhookEvents = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ connectionId: z.string().uuid(), limit: z.number().min(1).max(100).default(30) }).parse(d))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    const { data: rows, error } = await supabaseAdmin
      .from("whatsapp_webhook_events")
      .select("id,event_type,signature_valid,http_method,status_code,error,phone_number_id,created_at")
      .eq("connection_id", data.connectionId)
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

// ---------- Admin: 24h window status per active conversation ----------

export const adminConversationsWindowStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ connectionId: z.string().uuid().optional(), limit: z.number().min(1).max(100).default(30) }).parse(d))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    let q = supabaseAdmin
      .from("tickets")
      .select("id,workspace_id,connection_id,phone_number_id,last_message_at,last_message_preview,contact:contacts(name,phone)")
      .in("status", ["open", "in_progress", "waiting_client"])
      .order("last_message_at", { ascending: false, nullsFirst: false })
      .limit(data.limit);
    if (data.connectionId) q = q.eq("connection_id", data.connectionId);
    const { data: tickets, error } = await q;
    if (error) throw new Error(error.message);
    const list = tickets ?? [];
    if (!list.length) return [];

    const since = new Date(Date.now() - 24 * 3_600_000).toISOString();
    const phones = Array.from(new Set(
      list.map((t) => (t.contact as { phone?: string } | null)?.phone).filter(Boolean) as string[],
    ));
    const { data: lastIns } = await supabaseAdmin
      .from("whatsapp_message_log")
      .select("contact_phone,connection_id,created_at")
      .in("contact_phone", phones.length ? phones : ["__none__"])
      .eq("direction", "inbound")
      .gte("created_at", since);

    const map = new Map<string, string>(); // key conn|phone -> latest ISO
    for (const r of lastIns ?? []) {
      const key = `${r.connection_id}|${r.contact_phone}`;
      const prev = map.get(key);
      if (!prev || r.created_at > prev) map.set(key, r.created_at);
    }

    // Recent blocked attempts (out of window)
    const { data: blocks } = await supabaseAdmin
      .from("whatsapp_message_log")
      .select("contact_phone,connection_id,created_at,error_message,error_code")
      .in("contact_phone", phones.length ? phones : ["__none__"])
      .eq("direction", "outbound")
      .eq("status", "blocked")
      .gte("created_at", since);
    const blockMap = new Map<string, { at: string; reason: string; code: string | null }>();
    for (const b of blocks ?? []) {
      const key = `${b.connection_id}|${b.contact_phone}`;
      const prev = blockMap.get(key);
      if (!prev || b.created_at > prev.at) {
        blockMap.set(key, { at: b.created_at, reason: b.error_message ?? "Bloqueado", code: b.error_code ?? null });
      }
    }

    return list.map((t) => {
      const contact = t.contact as { name?: string; phone?: string } | null;
      const phone = contact?.phone ?? "";
      const key = `${t.connection_id}|${phone}`;
      const lastIn = map.get(key);
      const inWindow = !!lastIn;
      const minutesUntilExpiry = lastIn
        ? Math.max(0, Math.floor((new Date(lastIn).getTime() + 24 * 3_600_000 - Date.now()) / 60_000))
        : 0;
      return {
        ticketId: t.id,
        workspaceId: t.workspace_id,
        connectionId: t.connection_id,
        phoneNumberId: t.phone_number_id,
        contactName: contact?.name ?? null,
        contactPhone: phone,
        lastMessageAt: t.last_message_at,
        lastMessagePreview: t.last_message_preview,
        inWindow,
        minutesUntilExpiry,
        lastBlock: blockMap.get(key) ?? null,
      };
    });
  });

// ---------- Workspace: list filter dimensions for tickets ----------

export const listTicketFilterDims = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ workspaceId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertWorkspaceMember(context.userId, data.workspaceId);
    const [conns, sectors, members] = await Promise.all([
      supabaseAdmin.from("whatsapp_connections")
        .select("id,name,status,phone_number_id,display_phone_number,last_webhook_at,last_error")
        .eq("workspace_id", data.workspaceId),
      supabaseAdmin.from("sectors").select("id,name,color").eq("workspace_id", data.workspaceId),
      supabaseAdmin.from("workspace_members")
        .select("user_id")
        .eq("workspace_id", data.workspaceId),
    ]);
    const memberIds = (members.data ?? []).map((m) => m.user_id);
    const { data: profs } = memberIds.length
      ? await supabaseAdmin.from("profiles").select("id,full_name,email").in("id", memberIds)
      : { data: [] as Array<{ id: string; full_name: string | null; email: string }> };
    const profMap = new Map(((profs ?? []) as Array<{ id: string; full_name: string | null; email: string }>).map((p) => [p.id, p]));
    return {
      connections: conns.data ?? [],
      sectors: sectors.data ?? [],
      members: memberIds.map((uid) => {
        const p = profMap.get(uid);
        return { user_id: uid, full_name: p?.full_name ?? null, email: p?.email ?? "" };
      }),
    };
  });

// ---------- Admin: send a test message before activating ----------

export const adminSendTestMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    connectionId: z.string().uuid(),
    to: z.string().min(8).max(20),
    text: z.string().max(1000).optional(),
    templateName: z.string().min(1).max(120).optional(),
    templateLang: z.string().min(2).max(10).optional(),
  }).refine((v) => !!v.text || !!v.templateName, { message: "Informe texto ou template." }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: conn } = await supabaseAdmin
      .from("whatsapp_connections").select("workspace_id").eq("id", data.connectionId).single();
    if (!conn) throw new Error("Conexão não encontrada.");
    // super admin OR workspace member can test
    const { data: sa } = await supabaseAdmin
      .from("user_roles").select("role").eq("user_id", context.userId).eq("role", "super_admin").maybeSingle();
    if (!sa) await assertWorkspaceMember(context.userId, conn.workspace_id);

    const r = await dispatchWhatsAppMessage({
      connectionId: data.connectionId,
      to: data.to.replace(/\D/g, ""),
      text: data.text,
      templateName: data.templateName,
      templateLang: data.templateLang,
      ticketId: null,
    });
    await logAction({
      action: sa ? "admin:whatsapp_test_message" : "whatsapp_test_message",
      category: sa ? "admin" : "user",
      workspaceId: conn.workspace_id,
      actorUserId: context.userId,
      entity: "whatsapp_connections",
      entityId: data.connectionId,
      payload: {
        to: data.to,
        ok: r.ok,
        code: r.ok ? null : r.code,
        message_id: r.ok ? r.messageId : null,
        is_template: !!data.templateName,
        template_name: data.templateName ?? null,
        body_preview: data.text?.slice(0, 140) ?? null,
      },
    });
    if (!r.ok) return { ok: false, code: r.code, message: r.message };
    return { ok: true, messageId: r.messageId };
  });

// ---------- Register new phone number on Meta WABA ----------

export const registerNewPhoneOnMeta = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    workspaceId: z.string().uuid(),
    waba_id: z.string().min(3).max(60),
    access_token: z.string().min(20),
    app_secret: z.string().min(10),
    cc: z.string().regex(/^\d{1,4}$/, "DDI inválido"),
    phone_number: z.string().regex(/^\d{6,15}$/, "Telefone inválido (só dígitos)"),
    verified_name: z.string().min(1).max(120),
    name: z.string().min(1).max(120).optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await assertWorkspaceMember(context.userId, data.workspaceId);

    const r = await fetch(`${META_API}/${data.waba_id}/phone_numbers`, {
      method: "POST",
      headers: { Authorization: `Bearer ${data.access_token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ cc: data.cc, phone_number: data.phone_number, verified_name: data.verified_name }),
    });
    const j = await r.json() as { id?: string; error?: { message?: string } };
    if (!r.ok || !j.id) {
      await logAction({
        action: "whatsapp_phone_register_failed", category: "user",
        workspaceId: data.workspaceId, actorUserId: context.userId,
        entity: "whatsapp_connections", payload: { error: j.error?.message ?? `HTTP ${r.status}`, cc: data.cc, phone: data.phone_number },
      });
      return { ok: false as const, error: j.error?.message ?? `HTTP ${r.status}` };
    }

    // Generate verify token automatically
    const verifyToken = `vt_${crypto.getRandomValues(new Uint8Array(12)).reduce((s, b) => s + b.toString(16).padStart(2, "0"), "")}`;
    const display = `+${data.cc} ${data.phone_number}`;

    const { data: row, error } = await supabaseAdmin.from("whatsapp_connections").insert({
      workspace_id: data.workspaceId,
      provider: "meta_cloud",
      name: data.name ?? data.verified_name,
      phone: `${data.cc}${data.phone_number}`,
      phone_number_id: j.id,
      waba_id: data.waba_id,
      access_token: data.access_token,
      app_secret: data.app_secret,
      verify_token: verifyToken,
      display_phone_number: display,
      status: "pending",
      onboarding_mode: "manual",
    }).select("id").single();
    if (error) throw new Error(error.message);

    // Auto-subscribe webhook on the WABA right away — no extra click needed
    let subscribed = false;
    try {
      const sr = await fetch(`${META_API}/${data.waba_id}/subscribed_apps`, {
        method: "POST", headers: { Authorization: `Bearer ${data.access_token}` },
      });
      subscribed = sr.ok;
    } catch { /* ignore */ }

    await logAction({
      action: "whatsapp_phone_registered", category: "user",
      workspaceId: data.workspaceId, actorUserId: context.userId,
      entity: "whatsapp_connections", entityId: row.id,
      payload: { phone_number_id: j.id, display, subscribed },
    });

    return { ok: true as const, connectionId: row.id, phone_number_id: j.id, subscribed };
  });

// ---------- Request verification code (SMS or VOICE) ----------

export const requestPhoneVerificationCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    connectionId: z.string().uuid(),
    method: z.enum(["SMS", "VOICE"]),
    language: z.string().min(2).max(10).default("pt_BR"),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: conn } = await supabaseAdmin
      .from("whatsapp_connections")
      .select("workspace_id,phone_number_id,access_token")
      .eq("id", data.connectionId).single();
    if (!conn) throw new Error("Conexão não encontrada.");
    await assertWorkspaceMember(context.userId, conn.workspace_id);
    if (!conn.phone_number_id || !conn.access_token) {
      return {
        ok: false,
        error:
          "Antes de pedir o código, preencha o Phone Number ID e o Access Token e clique em 'Salvar rascunho'.",
      };
    }

    const r = await fetch(`${META_API}/${conn.phone_number_id}/request_code`, {
      method: "POST",
      headers: { Authorization: `Bearer ${conn.access_token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ code_method: data.method, language: data.language }),
    });
    const j = await r.json() as { success?: boolean; error?: { message?: string } };
    const ok = r.ok && j.success !== false;

    await logAction({
      action: "whatsapp_request_code", category: "user",
      workspaceId: conn.workspace_id, actorUserId: context.userId,
      entity: "whatsapp_connections", entityId: data.connectionId,
      payload: { method: data.method, ok, error: ok ? null : j.error?.message },
    });
    return { ok, error: ok ? null : (j.error?.message ?? `HTTP ${r.status}`) };
  });

// ---------- Verify 6-digit PIN ----------

export const verifyPhoneCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    connectionId: z.string().uuid(),
    code: z.string().regex(/^\d{6}$/, "Código deve ter 6 dígitos"),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: conn } = await supabaseAdmin
      .from("whatsapp_connections")
      .select("workspace_id,phone_number_id,access_token,waba_id")
      .eq("id", data.connectionId).single();
    if (!conn) throw new Error("Conexão não encontrada.");
    await assertWorkspaceMember(context.userId, conn.workspace_id);
    if (!conn.phone_number_id || !conn.access_token) throw new Error("Conexão sem phone_number_id ou token.");

    const r = await fetch(`${META_API}/${conn.phone_number_id}/verify_code`, {
      method: "POST",
      headers: { Authorization: `Bearer ${conn.access_token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ code: data.code }),
    });
    const j = await r.json() as { success?: boolean; error?: { message?: string } };
    const ok = r.ok && j.success !== false;

    let subscribed = false;
    if (ok) {
      // Mark connected and auto-subscribe webhook on the WABA
      await supabaseAdmin.from("whatsapp_connections")
        .update({ status: "connected", last_error: null, last_error_at: null })
        .eq("id", data.connectionId);

      if (conn.waba_id) {
        try {
          const sr = await fetch(`${META_API}/${conn.waba_id}/subscribed_apps`, {
            method: "POST", headers: { Authorization: `Bearer ${conn.access_token}` },
          });
          subscribed = sr.ok;
        } catch { /* ignore */ }
      }
    }

    await logAction({
      action: "whatsapp_verify_code", category: "user",
      workspaceId: conn.workspace_id, actorUserId: context.userId,
      entity: "whatsapp_connections", entityId: data.connectionId,
      payload: { ok, subscribed, error: ok ? null : j.error?.message },
    });
    return { ok, subscribed, error: ok ? null : (j.error?.message ?? `HTTP ${r.status}`) };
  });

// ---------- Webhook summary per connection (workspace + master) ----------

type WebhookSummary = {
  connectionId: string;
  webhookStatus: "pending" | "approved" | "connected";
  lastEventAt: string | null;
  lastEventType: string | null;
  lastSignatureValid: boolean | null;
};

function deriveWebhookStatus(
  status: string | null,
  lastWebhookAt: string | null,
): "pending" | "approved" | "connected" {
  if (status !== "connected") return "pending";
  return lastWebhookAt ? "connected" : "approved";
}

async function loadEventsSummary(workspaceId: string | null, connectionIds: string[]) {
  if (!connectionIds.length) return new Map<string, { created_at: string; event_type: string; signature_valid: boolean }>();
  let q = supabaseAdmin
    .from("whatsapp_webhook_events")
    .select("connection_id,created_at,event_type,signature_valid")
    .in("connection_id", connectionIds)
    .order("created_at", { ascending: false })
    .limit(1000);
  if (workspaceId) q = q.eq("workspace_id", workspaceId);
  const { data: events } = await q;
  const map = new Map<string, { created_at: string; event_type: string; signature_valid: boolean }>();
  for (const e of events ?? []) {
    if (!map.has(e.connection_id)) {
      map.set(e.connection_id, { created_at: e.created_at, event_type: e.event_type, signature_valid: e.signature_valid });
    }
  }
  return map;
}

export const getMyConnectionsWithWebhook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ workspaceId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertWorkspaceMember(context.userId, data.workspaceId);
    const { data: conns } = await supabaseAdmin
      .from("whatsapp_connections")
      .select("id,name,display_phone_number,phone,phone_number_id,waba_id,verify_token,status,provider,quality_rating,onboarding_mode,connection_mode,migration_status,migration_last_error,last_error,last_webhook_at,created_at,profile_picture_url,profile_picture_synced_at,baileys_session_id,session_data")
      .eq("workspace_id", data.workspaceId)
      .order("created_at", { ascending: false });
    const ids = (conns ?? []).map((c) => c.id);
    const events = await loadEventsSummary(data.workspaceId, ids);

    // Última atividade real (vale tanto pra Meta quanto pra MultiZap QR):
    // pega o maior last_message_at dos tickets por conexão.
    const lastMsgByConn = new Map<string, string>();
    if (ids.length) {
      const { data: ticketRows } = await supabaseAdmin
        .from("tickets")
        .select("connection_id,last_message_at")
        .in("connection_id", ids)
        .not("last_message_at", "is", null);
      for (const t of ticketRows ?? []) {
        const cur = lastMsgByConn.get(t.connection_id as string);
        if (!cur || (t.last_message_at && t.last_message_at > cur)) {
          lastMsgByConn.set(t.connection_id as string, t.last_message_at as string);
        }
      }
    }

    return (conns ?? []).map((c) => {
      const e = events.get(c.id) ?? null;
      const lastMsgAt = lastMsgByConn.get(c.id) ?? null;
      const lastEventAt = lastMsgAt ?? e?.created_at ?? null;
      const summary: WebhookSummary = {
        connectionId: c.id,
        webhookStatus: deriveWebhookStatus(c.status, c.last_webhook_at),
        lastEventAt,
        lastEventType: e?.event_type ?? null,
        lastSignatureValid: e?.signature_valid ?? null,
      };
      return {
        ...c,
        ...summary,
        webhookUrl: `https://multizap.dev/api/public/whatsapp/webhook/${c.id}`,
        verifyToken: c.verify_token ?? "",
      };
    });
  });


export const adminGetWebhookSummary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const { data: conns } = await supabaseAdmin
      .from("whatsapp_connections")
      .select("id,status,last_webhook_at");
    const ids = (conns ?? []).map((c) => c.id);
    const events = await loadEventsSummary(null, ids);
    return (conns ?? []).map((c) => {
      const e = events.get(c.id) ?? null;
      return {
        connectionId: c.id,
        webhookStatus: deriveWebhookStatus(c.status, c.last_webhook_at),
        lastEventAt: e?.created_at ?? null,
        lastEventType: e?.event_type ?? null,
        lastSignatureValid: e?.signature_valid ?? null,
      } satisfies WebhookSummary;
    });
  });

// ---------- Admin: request verification code on behalf of a workspace ----------

export const adminRequestPhoneVerificationCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    connectionId: z.string().uuid(),
    method: z.enum(["SMS", "VOICE"]),
    language: z.string().min(2).max(10).default("pt_BR"),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    const { data: conn } = await supabaseAdmin
      .from("whatsapp_connections")
      .select("workspace_id,phone_number_id,access_token")
      .eq("id", data.connectionId).single();
    if (!conn) throw new Error("Conexão não encontrada.");
    if (!conn.phone_number_id || !conn.access_token) throw new Error("Conexão sem phone_number_id ou token.");

    const r = await fetch(`${META_API}/${conn.phone_number_id}/request_code`, {
      method: "POST",
      headers: { Authorization: `Bearer ${conn.access_token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ code_method: data.method, language: data.language }),
    });
    const j = await r.json() as { success?: boolean; error?: { message?: string } };
    const ok = r.ok && j.success !== false;

    await logAction({
      action: "admin:whatsapp_request_code", category: "system",
      workspaceId: conn.workspace_id, actorUserId: context.userId,
      entity: "whatsapp_connections", entityId: data.connectionId,
      payload: { method: data.method, ok, error: ok ? null : j.error?.message },
    });
    return { ok, error: ok ? null : (j.error?.message ?? `HTTP ${r.status}`) };
  });

export const adminVerifyPhoneCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    connectionId: z.string().uuid(),
    code: z.string().regex(/^\d{6}$/, "Código deve ter 6 dígitos"),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    const { data: conn } = await supabaseAdmin
      .from("whatsapp_connections")
      .select("workspace_id,phone_number_id,access_token,waba_id")
      .eq("id", data.connectionId).single();
    if (!conn) throw new Error("Conexão não encontrada.");
    if (!conn.phone_number_id || !conn.access_token) throw new Error("Conexão sem phone_number_id ou token.");

    const r = await fetch(`${META_API}/${conn.phone_number_id}/verify_code`, {
      method: "POST",
      headers: { Authorization: `Bearer ${conn.access_token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ code: data.code }),
    });
    const j = await r.json() as { success?: boolean; error?: { message?: string } };
    const ok = r.ok && j.success !== false;
    let subscribed = false;
    if (ok) {
      await supabaseAdmin.from("whatsapp_connections")
        .update({ status: "connected", last_error: null, last_error_at: null })
        .eq("id", data.connectionId);
      if (conn.waba_id) {
        try {
          const sr = await fetch(`${META_API}/${conn.waba_id}/subscribed_apps`, {
            method: "POST", headers: { Authorization: `Bearer ${conn.access_token}` },
          });
          subscribed = sr.ok;
        } catch { /* ignore */ }
      }
    }
    await logAction({
      action: "admin:whatsapp_verify_code", category: "system",
      workspaceId: conn.workspace_id, actorUserId: context.userId,
      entity: "whatsapp_connections", entityId: data.connectionId,
      payload: { ok, subscribed, error: ok ? null : j.error?.message },
    });
    return { ok, subscribed, error: ok ? null : (j.error?.message ?? `HTTP ${r.status}`) };
  });

// ---------- Workspace: ler credenciais do webhook (URL + verify token) ----------
// Permite ao cliente copiar a URL e o token reais da conexão pra colar no Meta,
// sem precisar abrir o Diagnóstico inteiro.
export const getMyWebhookCredentials = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ connectionId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: conn } = await supabaseAdmin
      .from("whatsapp_connections")
      .select("id,workspace_id,verify_token")
      .eq("id", data.connectionId).single();
    if (!conn) throw new Error("Conexão não encontrada.");
    await assertWorkspaceMember(context.userId, conn.workspace_id);
    return {
      connectionId: conn.id,
      webhookUrl: `https://multizap.dev/api/public/whatsapp/webhook/${conn.id}`,
      verifyToken: conn.verify_token ?? "",
    };
  });

// ---------- Workspace: testar handshake do webhook antes de configurar no Meta ----------
// Faz exatamente a mesma chamada que a Meta faria (GET com hub.mode=subscribe,
// hub.verify_token e hub.challenge) e devolve um diagnóstico amigável,
// com dica específica do que checar quando dá erro.
export const validateMyWebhook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ connectionId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: conn } = await supabaseAdmin
      .from("whatsapp_connections")
      .select("id,workspace_id,verify_token")
      .eq("id", data.connectionId).single();
    if (!conn) {
      return {
        ok: false as const,
        status: 0,
        echoed: "",
        expected: "",
        url: "",
        error: "id-da-conexao-invalido" as const,
        hint: "O id desta conexão não foi encontrado. Volte e cadastre o número de novo.",
      };
    }
    await assertWorkspaceMember(context.userId, conn.workspace_id);

    if (!conn.verify_token) {
      return {
        ok: false as const,
        status: 0,
        echoed: "",
        expected: "",
        url: "",
        error: "sem-token" as const,
        hint: "Esta conexão não tem Verify Token salvo. Recadastre o número pra gerar um novo.",
      };
    }

    const challenge = `lovable-${Date.now()}`;
    const url = `https://multizap.dev/api/public/whatsapp/webhook/${conn.id}?hub.mode=subscribe&hub.verify_token=${encodeURIComponent(conn.verify_token)}&hub.challenge=${challenge}`;

    try {
      const res = await fetch(url);
      const text = await res.text();
      const ok = res.ok && text === challenge;

      if (ok) {
        return { ok: true as const, status: res.status, echoed: text, expected: challenge, url };
      }

      // Diagnóstico amigável de cada caso
      let error: "url-nao-responde" | "token-errado" | "id-da-conexao-invalido" | "resposta-errada" = "resposta-errada";
      let hint = "";
      if (res.status === 404) {
        error = "id-da-conexao-invalido";
        hint = "A URL não foi encontrada (404). Confira se o id da conexão na URL é exatamente o desta conexão.";
      } else if (res.status === 403 || res.status === 401) {
        error = "token-errado";
        hint = "O Verify Token não confere (a Meta vai dar exatamente o mesmo erro). Copie o token desta tela e cole no campo 'Token de verificação' do Meta.";
      } else if (res.status >= 500) {
        error = "url-nao-responde";
        hint = `Nosso servidor respondeu com erro ${res.status}. Tente de novo em 1 minuto. Se continuar, fale com o suporte.`;
      } else {
        error = "resposta-errada";
        hint = `A URL respondeu mas o conteúdo veio diferente do esperado. Esperado: '${challenge}'. Recebido: '${text.slice(0, 80)}'.`;
      }
      return { ok: false as const, status: res.status, echoed: text.slice(0, 200), expected: challenge, url, error, hint };
    } catch (e) {
      return {
        ok: false as const,
        status: 0,
        echoed: "",
        expected: challenge,
        url,
        error: "url-nao-responde" as const,
        hint: `Não conseguimos chamar nossa própria URL (${(e as Error).message}). Tente daqui a pouco.`,
      };
    }
  });


// ============================================================
// Assistente de Webhook: listar WABAs acessíveis, inscrever, desinscrever, vincular
// ============================================================

type MetaBiz = { id: string; name?: string };
type MetaWaba = { id: string; name?: string };
type MetaPhone = { id: string; display_phone_number?: string; verified_name?: string; quality_rating?: string };
type MetaSubApp = { id?: string; name?: string };

async function fetchJson<T>(url: string, token: string): Promise<{ ok: boolean; status: number; data: T | null; error?: string }> {
  try {
    const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const j = (await r.json()) as { error?: { message?: string } } & T;
    if (!r.ok) return { ok: false, status: r.status, data: null, error: j?.error?.message ?? `HTTP ${r.status}` };
    return { ok: true, status: r.status, data: j };
  } catch (e) {
    return { ok: false, status: 0, data: null, error: (e as Error).message };
  }
}

export const listAccessibleWabas = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ connectionId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: conn } = await supabaseAdmin
      .from("whatsapp_connections")
      .select("id,workspace_id,access_token,waba_id,phone_number_id")
      .eq("id", data.connectionId).single();
    if (!conn) throw new Error("Conexão não encontrada.");
    await assertWorkspaceMember(context.userId, conn.workspace_id);

    // Diagnóstico passo a passo — cada etapa fica registrada pro front exibir.
    const steps: Array<{ step: string; ok: boolean; detail: string }> = [];
    const tokenTail = conn.access_token ? `…${conn.access_token.slice(-6)}` : null;
    const currentWabaId = conn.waba_id ?? null;

    if (!conn.access_token) {
      steps.push({ step: "token", ok: false, detail: "Conexão sem access token salvo." });
      return {
        ok: false as const,
        reason: "no_token" as const,
        businesses: [] as Array<{ id: string; name: string; wabas: Array<{ id: string; name: string; phones: MetaPhone[]; subscribed_apps: MetaSubApp[]; this_is_current_waba: boolean }> }>,
        diagnostics: { steps, tokenTail, currentWabaId, failedStep: "token" as const },
      };
    }
    const token = conn.access_token;
    steps.push({ step: "token", ok: true, detail: `Token salvo (final ${tokenTail}).` });

    const buildWaba = async (wabaId: string, knownName?: string) => {
      const [meta, phones, subs] = await Promise.all([
        fetchJson<{ id: string; name?: string }>(`${META_API}/${wabaId}?fields=id,name`, token),
        fetchJson<{ data: MetaPhone[] }>(`${META_API}/${wabaId}/phone_numbers?fields=display_phone_number,verified_name,quality_rating`, token),
        fetchJson<{ data: MetaSubApp[] }>(`${META_API}/${wabaId}/subscribed_apps`, token),
      ]);
      return {
        id: wabaId,
        name: meta.data?.name ?? knownName ?? "(sem nome)",
        phones: phones.data?.data ?? [],
        subscribed_apps: subs.data?.data ?? [],
        this_is_current_waba: wabaId === conn.waba_id,
      };
    };

    // 1. Validar token (debug_token)
    const meR = await fetchJson<{ id: string; name?: string }>(`${META_API}/me?fields=id,name`, token);
    if (!meR.ok) {
      steps.push({ step: "token_valido", ok: false, detail: `Meta rejeitou o token: ${meR.error ?? `HTTP ${meR.status}`}.` });
      await logAction({
        action: "waba_assistant.list",
        category: "user",
        workspaceId: conn.workspace_id,
        actorUserId: context.userId,
        entity: "whatsapp_connections",
        entityId: conn.id,
        payload: { failedStep: "token_valido", error: meR.error, status: meR.status, tokenTail },
      });
      return {
        ok: false as const,
        reason: "token_invalid" as const,
        error: meR.error ?? `HTTP ${meR.status}`,
        businesses: [] as Array<{ id: string; name: string; wabas: Array<{ id: string; name: string; phones: MetaPhone[]; subscribed_apps: MetaSubApp[]; this_is_current_waba: boolean }> }>,
        diagnostics: { steps, tokenTail, currentWabaId, failedStep: "token_valido" as const },
      };
    }
    steps.push({ step: "token_valido", ok: true, detail: `Token válido — identidade Meta: ${meR.data?.name ?? meR.data?.id ?? "?"}.` });

    // 2. Tenta listar todos os negócios do token (precisa de business_management)
    const bizR = await fetchJson<{ data: MetaBiz[] }>(`${META_API}/me/businesses?limit=20`, token);

    if (!bizR.ok) {
      steps.push({ step: "listar_negocios", ok: false, detail: `Sem permissão business_management ou erro: ${bizR.error ?? `HTTP ${bizR.status}`}.` });

      // FALLBACK: tenta a WABA atual da conexão (token whatsapp_business_management costuma funcionar nela)
      if (!conn.waba_id) {
        steps.push({ step: "fallback_waba_atual", ok: false, detail: "Esta conexão não tem WABA salva pra usar como fallback." });
        await logAction({
          action: "waba_assistant.list",
          category: "user",
          workspaceId: conn.workspace_id,
          actorUserId: context.userId,
          entity: "whatsapp_connections",
          entityId: conn.id,
          payload: { failedStep: "fallback_waba_atual", error: bizR.error, status: bizR.status, tokenTail },
        });
        return {
          ok: false as const,
          reason: "token_failed" as const,
          error: bizR.error,
          businesses: [],
          diagnostics: { steps, tokenTail, currentWabaId, failedStep: "fallback_waba_atual" as const },
        };
      }
      const probe = await fetchJson<{ id: string }>(`${META_API}/${conn.waba_id}?fields=id,name`, token);
      if (!probe.ok) {
        steps.push({ step: "fallback_waba_atual", ok: false, detail: `O token também não enxerga a WABA atual ${conn.waba_id}: ${probe.error ?? `HTTP ${probe.status}`}.` });
        await logAction({
          action: "waba_assistant.list",
          category: "user",
          workspaceId: conn.workspace_id,
          actorUserId: context.userId,
          entity: "whatsapp_connections",
          entityId: conn.id,
          payload: { failedStep: "fallback_waba_atual", error: probe.error, status: probe.status, tokenTail, currentWabaId },
        });
        return {
          ok: false as const,
          reason: "current_waba_inaccessible" as const,
          error: probe.error,
          businesses: [],
          diagnostics: { steps, tokenTail, currentWabaId, failedStep: "fallback_waba_atual" as const },
        };
      }
      steps.push({ step: "fallback_waba_atual", ok: true, detail: `Carregando só a WABA atual ${conn.waba_id}.` });
      const w = await buildWaba(conn.waba_id);
      return {
        ok: true as const,
        limited: true as const,
        limitedReason: bizR.error ?? "Token sem permissão business_management",
        businesses: [{ id: "current", name: "Conta atual desta conexão", wabas: [w] }],
        diagnostics: { steps, tokenTail, currentWabaId, failedStep: null },
      };
    }

    const bizList = (bizR.data?.data ?? []).slice(0, 10);
    steps.push({ step: "listar_negocios", ok: true, detail: `Encontrados ${bizList.length} negócio(s) no Business Manager.` });

    // 3. Pra cada negócio, owned + client WABAs (em paralelo)
    const businesses = await Promise.all(bizList.map(async (b) => {
      const [owned, client] = await Promise.all([
        fetchJson<{ data: MetaWaba[] }>(`${META_API}/${b.id}/owned_whatsapp_business_accounts?limit=25`, token),
        fetchJson<{ data: MetaWaba[] }>(`${META_API}/${b.id}/client_whatsapp_business_accounts?limit=25`, token),
      ]);
      const wabasRaw = [...(owned.data?.data ?? []), ...(client.data?.data ?? [])];
      const seen = new Set<string>();
      const wabasUnique = wabasRaw.filter((w) => (seen.has(w.id) ? false : (seen.add(w.id), true)));
      const wabas = await Promise.all(wabasUnique.map((w) => buildWaba(w.id, w.name)));
      return { id: b.id, name: b.name ?? "(sem nome)", wabas };
    }));

    const totalWabas = businesses.reduce((sum, b) => sum + b.wabas.length, 0);
    steps.push({ step: "listar_wabas", ok: totalWabas > 0, detail: `Total de WhatsApp Business encontradas: ${totalWabas}.` });

    // 4. Se zero WABAs mas conexão tem waba_id salva, faz uma sondagem direta — útil pra mostrar o motivo
    if (totalWabas === 0 && conn.waba_id) {
      const probe = await fetchJson<{ id: string; name?: string }>(`${META_API}/${conn.waba_id}?fields=id,name`, token);
      if (probe.ok) {
        steps.push({ step: "probe_waba_atual", ok: true, detail: `Curioso: o token enxerga a WABA ${conn.waba_id} diretamente, mas ela não aparece em nenhum Business. Pode estar vinculada a outro Business Manager.` });
        // Mostra ela mesmo assim, como modo limitado
        const w = await buildWaba(conn.waba_id);
        const r = {
          ok: true as const,
          limited: true as const,
          limitedReason: "Esta WABA está acessível pelo token mas não pertence a nenhum dos seus Business Managers.",
          businesses: [{ id: "current", name: "Conta atual desta conexão (acessada por ID)", wabas: [w] }],
          diagnostics: { steps, tokenTail, currentWabaId, failedStep: null },
        };
        await logAction({
          action: "waba_assistant.list",
          category: "user",
          workspaceId: conn.workspace_id,
          actorUserId: context.userId,
          entity: "whatsapp_connections",
          entityId: conn.id,
          payload: { result: "limited_orphan_waba", totalWabas, currentWabaId, tokenTail },
        });
        return r;
      } else {
        steps.push({ step: "probe_waba_atual", ok: false, detail: `Token não enxerga nem a WABA atual ${conn.waba_id} diretamente: ${probe.error ?? `HTTP ${probe.status}`}.` });
      }
    }

    await logAction({
      action: "waba_assistant.list",
      category: "user",
      workspaceId: conn.workspace_id,
      actorUserId: context.userId,
      entity: "whatsapp_connections",
      entityId: conn.id,
      payload: { result: totalWabas > 0 ? "ok" : "no_wabas_found", totalWabas, currentWabaId, tokenTail, businesses: bizList.length },
    });

    return {
      ok: true as const,
      limited: false as const,
      businesses,
      diagnostics: { steps, tokenTail, currentWabaId, failedStep: totalWabas === 0 ? ("listar_wabas" as const) : null },
    };
  });



export const subscribeAppToWaba = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ connectionId: z.string().uuid(), wabaId: z.string().min(3).max(64) }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: conn } = await supabaseAdmin
      .from("whatsapp_connections").select("id,workspace_id,access_token").eq("id", data.connectionId).single();
    if (!conn) throw new Error("Conexão não encontrada.");
    await assertWorkspaceMember(context.userId, conn.workspace_id);
    if (!conn.access_token) throw new Error("Sem token salvo nesta conexão.");

    const r = await fetch(`${META_API}/${data.wabaId}/subscribed_apps`, {
      method: "POST",
      headers: { Authorization: `Bearer ${conn.access_token}` },
    });
    const j = await r.json() as { success?: boolean; error?: { message?: string } };
    const ok = r.ok && j.success !== false;

    await logAction({
      action: "waba_assistant.subscribe",
      category: "user",
      workspaceId: conn.workspace_id,
      actorUserId: context.userId,
      entity: "whatsapp_connections",
      entityId: conn.id,
      payload: { waba_id: data.wabaId, ok, status: r.status, error: j.error?.message ?? null },
    });

    return { ok, status: r.status, error: ok ? null : (j.error?.message ?? `HTTP ${r.status}`) };
  });

export const unsubscribeAppFromWaba = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ connectionId: z.string().uuid(), wabaId: z.string().min(3).max(64) }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: conn } = await supabaseAdmin
      .from("whatsapp_connections").select("id,workspace_id,access_token").eq("id", data.connectionId).single();
    if (!conn) throw new Error("Conexão não encontrada.");
    await assertWorkspaceMember(context.userId, conn.workspace_id);
    if (!conn.access_token) throw new Error("Sem token salvo nesta conexão.");

    const r = await fetch(`${META_API}/${data.wabaId}/subscribed_apps`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${conn.access_token}` },
    });
    const j = await r.json() as { success?: boolean; error?: { message?: string } };
    const ok = r.ok && j.success !== false;

    await logAction({
      action: "waba_assistant.unsubscribe",
      category: "user",
      workspaceId: conn.workspace_id,
      actorUserId: context.userId,
      entity: "whatsapp_connections",
      entityId: conn.id,
      payload: { waba_id: data.wabaId, ok, status: r.status, error: j.error?.message ?? null },
    });

    return { ok, status: r.status, error: ok ? null : (j.error?.message ?? `HTTP ${r.status}`) };
  });

export const bindWabaToConnection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    connectionId: z.string().uuid(),
    wabaId: z.string().min(3).max(64),
    phoneNumberId: z.string().min(3).max(64),
    displayPhoneNumber: z.string().max(40).optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: conn } = await supabaseAdmin
      .from("whatsapp_connections").select("id,workspace_id,waba_id,phone_number_id,display_phone_number").eq("id", data.connectionId).single();
    if (!conn) throw new Error("Conexão não encontrada.");
    await assertWorkspaceMember(context.userId, conn.workspace_id);

    const before = { waba_id: conn.waba_id, phone_number_id: conn.phone_number_id, display_phone_number: conn.display_phone_number };
    const after = { waba_id: data.wabaId, phone_number_id: data.phoneNumberId, display_phone_number: data.displayPhoneNumber ?? conn.display_phone_number };

    const { error } = await supabaseAdmin
      .from("whatsapp_connections")
      .update(after)
      .eq("id", data.connectionId);
    if (error) throw new Error(error.message);

    await logAction({
      action: "waba_assistant.bind",
      category: "user",
      workspaceId: conn.workspace_id,
      actorUserId: context.userId,
      entity: "whatsapp_connections",
      entityId: conn.id,
      before, after,
    });

    return { ok: true };
  });

// Registra no audit_log que o Embedded Signup foi bloqueado pela Meta
// (ex.: "can't onboard customers right now" — empresa/app sem permissão).
// Não é falha técnica do MultiZap, então não marcamos a conexão como erro.
export const logEmbeddedSignupBlocked = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    workspaceId: z.string().uuid().optional(),
    rawMessage: z.string().max(2000).optional(),
    errorCode: z.string().max(120).optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await logAction({
      action: "embedded_signup_onboarding_blocked",
      category: "user",
      workspaceId: data.workspaceId ?? null,
      actorUserId: context.userId,
      entity: "whatsapp_embedded_signup",
      payload: {
        provider: "meta_cloud",
        stage: "embedded_signup_onboarding_blocked",
        raw_message: data.rawMessage ?? null,
        error_code: data.errorCode ?? null,
      },
    });
    return { ok: true };
  });

