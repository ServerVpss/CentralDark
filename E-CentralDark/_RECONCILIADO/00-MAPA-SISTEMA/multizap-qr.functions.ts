// Server functions que proxyam o MultiZap-Gateway com segurança.
// O token e a URL do Gateway ficam SEMPRE no servidor (process.env),
// nunca chegam ao navegador. Toda chamada exige usuário autenticado
// e o workspace_id é validado contra o usuário logado.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { gatewayCall, gatewayFetch, gatewayFetchWithRetry } from "./multizap-gateway.server";
import { logAction } from "./audit.server";


// Garante que o usuário pertence ao workspace antes de qualquer ação.
// Tipagem solta no supabase: o middleware já garante client autenticado.
async function assertWorkspaceMember(
  supabase: { from: (t: string) => unknown },
  userId: string,
  workspaceId: string,
) {
  const q = (supabase as {
    from: (t: string) => {
      select: (s: string) => {
        eq: (k: string, v: string) => {
          eq: (k: string, v: string) => { maybeSingle: () => Promise<{ data: unknown; error: unknown }> };
        };
      };
    };
  })
    .from("workspace_members")
    .select("workspace_id")
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId);
  const { data, error } = await q.maybeSingle();
  if (error) throw new Error("Falha ao validar acesso ao workspace.");
  if (!data) throw new Error("Sem permissão neste workspace.");
}

// --- Guards de segurança --------------------------------------------------

// Verifica se uma conexão do gateway foi marcada como removida (tombstone).
// Retorna o registro se estiver bloqueado, ou null caso possa prosseguir.
async function getTombstone(gatewayConnectionId: string) {
  const { data } = await supabaseAdmin
    .from("removed_qr_connections")
    .select("workspace_id, removed_by, removed_at, expires_at")
    .eq("gateway_connection_id", gatewayConnectionId)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  return data ?? null;
}

// Resolve workspace_id a partir do connection_id consultando o gateway.
async function resolveWorkspaceForConnection(connectionId: string): Promise<string | null> {
  try {
    const list = (await gatewayFetch(`/connections`)) as Array<{
      connection_id?: string;
      workspace_id?: string;
    }> | null;
    const found = (list ?? []).find((c) => c.connection_id === connectionId);
    return found?.workspace_id ?? null;
  } catch {
    return null;
  }
}

// Lock anti-duplo-clique: bloqueia createQrConnection se houver outra criação
// no mesmo workspace nos últimos 3s.
const createLocks = new Map<string, number>();
function acquireCreateLock(workspaceId: string): boolean {
  const now = Date.now();
  const last = createLocks.get(workspaceId) ?? 0;
  if (now - last < 3000) return false;
  createLocks.set(workspaceId, now);
  // Limpa locks antigos pra não vazar memória
  if (createLocks.size > 500) {
    for (const [k, v] of createLocks) if (now - v > 10000) createLocks.delete(k);
  }
  return true;
}


// --- server functions ------------------------------------------------------

export const listQrConnections = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { workspace_id: string }) =>
    z.object({ workspace_id: z.string().min(1).max(64) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertWorkspaceMember(context.supabase, context.userId, data.workspace_id);
    const out = (await gatewayFetch(
      `/connections?workspace_id=${encodeURIComponent(data.workspace_id)}`,
    )) as Array<{
      connection_id?: string;
      name?: string;
      label?: string | null;
      status?: string;
      phone_number?: string | null;
      last_connected_at?: string | null;
    }> | null;

    // Filtra conexões tombstoneadas (removidas pelo usuário). O Gateway ainda
    // pode listá-las por alguns minutos/horas até o /logout efetivar; mostrar
    // como "Conectado" no card cria a divergência clássica entre Gateway e
    // banco local. A fonte da verdade pra QR deletado é o tombstone.
    const raw = out ?? [];
    const filtered: typeof raw = [];
    for (const c of raw) {
      const cid = c.connection_id;
      if (!cid) continue;
      const tomb = await getTombstone(cid);
      if (tomb) continue;
      filtered.push(c);
    }

    const connections = filtered.map((c) => ({
      connection_id: c.connection_id ?? "",
      name: c.name ?? null,
      label: c.label ?? null,
      status: c.status ?? "unknown",
      phone_number: c.phone_number ?? null,
      last_connected_at: c.last_connected_at ?? null,
    }));
    return { connections };
  });


export const createQrConnection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    workspace_id: string;
    name: string;
    label?: string;
    user_initiated?: boolean;
    action?: "connect_new_channel" | "reconnect";
    allow_duplicate?: boolean;
  }) =>
    z
      .object({
        workspace_id: z.string().min(1).max(64),
        name: z.string().min(1).max(80),
        label: z.string().max(80).optional(),
        // Guard explícito: o caller TEM que declarar que partiu de ação do usuário.
        // Nenhum sync/poll/cron seta isso, então qualquer recriação automática barra aqui.
        user_initiated: z.literal(true, {
          errorMap: () => ({
            message: "Criação automática de conexão bloqueada por segurança.",
          }),
        }),
        action: z.enum(["connect_new_channel", "reconnect"]).default("connect_new_channel"),
        allow_duplicate: z.boolean().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertWorkspaceMember(context.supabase, context.userId, data.workspace_id);

    // Anti-duplo-clique no backend: rejeita se outro create veio < 3s atrás.
    if (!acquireCreateLock(data.workspace_id)) {
      await logAction({
        action: "qr_connection_create_blocked_duplicate",
        category: "security",
        workspaceId: data.workspace_id,
        actorUserId: context.userId,
        entity: "qr_connection",
        payload: { reason: "double_click_lock" },
      });
      throw new Error("Aguarde alguns segundos antes de criar outra conexão.");
    }

    // Anti-duplicidade: só bloqueia se já existir uma conexão QR REALMENTE ativa.
    // Antes bloqueava só por status="connected" do Gateway, mas isso ignora:
    //  - conexões tombstoneadas (removidas pelo usuário)
    //  - conexões logged_out/sem sessão (Gateway ainda lista por inércia)
    // Agora valida via /__diag/wuzapi (logged_in && session_connected).
    if (!data.allow_duplicate) {
      try {
        const existing = (await gatewayFetch(
          `/connections?workspace_id=${encodeURIComponent(data.workspace_id)}`,
        )) as Array<{ connection_id?: string; status?: string }> | null;

        // Filtra tombstones primeiro: conexão removida não conta.
        const candidates: Array<{ connection_id: string; status: string }> = [];
        for (const c of existing ?? []) {
          const cid = c.connection_id;
          if (!cid) continue;
          if (c.status !== "connected") continue; // só "connected" pode bloquear
          const tomb = await getTombstone(cid);
          if (tomb) continue;
          candidates.push({ connection_id: cid, status: c.status });
        }

        if (candidates.length > 0) {
          // Confirma com diagnóstico do Gateway: a sessão está mesmo viva?
          let trulyAlive: { connection_id: string; status: string } | null = null;
          try {
            const diag = (await gatewayFetch(`/__diag/wuzapi`)) as {
              connections?: Array<{
                connection_id: string;
                session_connected?: boolean;
                logged_in?: boolean;
              }>;
            } | null;
            const diagMap = new Map(
              (diag?.connections ?? []).map((d) => [d.connection_id, d]),
            );
            for (const c of candidates) {
              const d = diagMap.get(c.connection_id);
              // Se não tem diagnóstico, assume morta (não bloqueia).
              if (d && d.logged_in === true && d.session_connected === true) {
                trulyAlive = c;
                break;
              }
            }
          } catch {
            // Diagnóstico indisponível → não bloqueia (segue criando).
          }

          if (trulyAlive) {
            await logAction({
              action: "qr_connection_create_blocked_duplicate",
              category: "security",
              workspaceId: data.workspace_id,
              actorUserId: context.userId,
              entity: "qr_connection",
              entityId: trulyAlive.connection_id,
              payload: { reason: "existing_active_connection", status: trulyAlive.status },
            });
            // Erro controlado: o modal mostra dentro do passo "error",
            // sem tela branca. Mensagem inclui o id pra UI oferecer
            // "Usar conexão existente" / "Reconectar".
            const err = new Error(
              "QR_CONNECTION_EXISTS:Já existe um WhatsApp conectado neste workspace. " +
                "Use a conexão existente, reconecte por cima, ou remova antes de adicionar outro.",
            );
            (err as Error & { code?: string; existing_connection_id?: string }).code =
              "QR_CONNECTION_EXISTS";
            (err as Error & { existing_connection_id?: string }).existing_connection_id =
              trulyAlive.connection_id;
            throw err;
          }
        }
      } catch (err) {
        // Repropaga só o nosso erro de duplicidade. Falha de rede no list NÃO bloqueia.
        if (err instanceof Error && err.message.startsWith("QR_CONNECTION_EXISTS:")) throw err;
      }
    }

    const out = (await gatewayFetchWithRetry(`/connections`, {
      method: "POST",
      body: JSON.stringify({
        workspace_id: data.workspace_id,
        name: data.name,
        label: data.label ?? null,
      }),
    }, { timeoutMs: 10000, retries: 2, baseDelayMs: 500 })) as {
      connection_id?: string;
      workspace_id?: string;
      name?: string;
      label?: string | null;
      status?: string;
      phone_number?: string | null;
    } | null;

    await logAction({
      action: "qr_connection_created",
      category: "user",
      workspaceId: data.workspace_id,
      actorUserId: context.userId,
      entity: "qr_connection",
      entityId: out?.connection_id ?? null,
      after: {
        name: data.name,
        label: data.label ?? null,
        status: out?.status ?? null,
        action: data.action,
      },
    });

    return {
      connection_id: out?.connection_id ?? "",
      status: out?.status ?? "unknown",
      name: out?.name ?? null,
      label: out?.label ?? null,
      phone_number: out?.phone_number ?? null,
    };
  });


export const getQrCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { connection_id: string }) =>
    z.object({ connection_id: z.string().min(1).max(64) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    // Tombstone: se foi removida, bloqueia geração de QR (não pode "ressuscitar").
    const tomb = await getTombstone(data.connection_id);
    if (tomb) {
      await logAction({
        action: "qr_generation_blocked_removed",
        category: "security",
        workspaceId: tomb.workspace_id ?? null,
        actorUserId: context.userId,
        entity: "qr_connection",
        entityId: data.connection_id,
        payload: { reason: "tombstoned", removed_at: tomb.removed_at },
      });
      throw new Error("Esta conexão foi removida. Crie uma nova para gerar QR.");
    }

    const out = (await gatewayFetchWithRetry(
      `/connections/${encodeURIComponent(data.connection_id)}/qr`,
      {},
      { timeoutMs: 8000, retries: 2, baseDelayMs: 400 },
    )) as Record<string, unknown> | null;
    // WuzAPI pode devolver { data: { QRCode: "..." } }. Extrai com tolerância.
    const inner = (out?.data as Record<string, unknown> | undefined) ?? out ?? {};
    const qr =
      (inner.QRCode as string | undefined) ??
      (inner.qrcode as string | undefined) ??
      (inner.qr as string | undefined) ??
      (out?.qr as string | undefined) ??
      null;
    // NUNCA confiar em "connected" vindo do /qr — esse endpoint é só pra QR.
    const rawStatus = (out?.status as string | undefined) ?? "unknown";
    const status = rawStatus === "connected" ? "qr" : rawStatus;

    if (qr) {
      await logAction({
        action: "qr_generated",
        category: "user",
        actorUserId: context.userId,
        entity: "qr_connection",
        entityId: data.connection_id,
      });
    }

    return {
      connection_id: (out?.connection_id as string | undefined) ?? data.connection_id,
      status,
      qr,
      qr_base64: (out?.qr_base64 as string | undefined) ?? null,
      expires_in: (out?.expires_in as number | undefined) ?? 60,
    };
  });


// Normaliza resposta do Gateway/WuzAPI. O Gateway JÁ retorna `status` canônico
// + `phone_number` extraído do jid (ver connectionService.getStatus/pickStatus).
// Aqui só confiamos nesse shape e, como fallback, reconhecemos payloads crus
// da WuzAPI (Connected/LoggedIn/jid) caso algum endpoint devolva direto.
function normalizeStatus(raw: Record<string, unknown> | null): {
  status: "connected" | "qr" | "disconnected" | "error" | "unknown";
  phone_number: string | null;
} {
  if (!raw) return { status: "unknown", phone_number: null };

  // 1) Shape do Gateway (preferencial)
  const gwStatus = (raw.status as string | undefined)?.toLowerCase();
  const gwPhone = (raw.phone_number as string | null | undefined) ?? null;
  if (
    gwStatus === "connected" ||
    gwStatus === "qr" ||
    gwStatus === "disconnected" ||
    gwStatus === "error" ||
    gwStatus === "waiting_scan"
  ) {
    const status = (gwStatus === "waiting_scan" ? "qr" : gwStatus) as
      | "connected"
      | "qr"
      | "disconnected"
      | "error";
    return { status, phone_number: gwPhone };
  }

  // 2) Fallback: payload cru WuzAPI ({ data: { Connected, LoggedIn, jid } })
  const inner = (raw.data as Record<string, unknown> | undefined) ?? raw;
  const connected =
    (inner.Connected as boolean | undefined) ?? (inner.connected as boolean | undefined) ?? false;
  const loggedIn =
    (inner.LoggedIn as boolean | undefined) ?? (inner.loggedIn as boolean | undefined) ?? false;
  const jid = (inner.jid as string | undefined) ?? (inner.Jid as string | undefined) ?? null;
  const phone_number = jid ? jid.split("@")[0]?.split(":")[0] ?? null : null;

  if (connected && loggedIn) return { status: "connected", phone_number };
  return { status: "unknown", phone_number: null };
}

function cleanQrPhone(phone: string | null) {
  if (!phone) return null;
  const base = phone.split("@")[0]?.split(":")[0] ?? phone;
  const digits = base.replace(/\D/g, "");
  return digits ? `+${digits}` : phone;
}

// Mantém o registro local em whatsapp_connections espelhando o que o Gateway
// reporta. NUNCA depende do modal QR continuar aberto: o sync chama isso
// também em background. Aceita qualquer status canônico — assim a UI consegue
// mostrar "Precisa reconectar" sem o registro sumir do banco.
async function upsertQrConnectionFromGateway(input: {
  workspaceId: string;
  connectionId: string;
  phoneNumber: string | null;
  status: "connected" | "qr" | "disconnected" | "error" | "unknown";
}) {
  const phone = cleanQrPhone(input.phoneNumber);
  const name = phone ?? "WhatsApp QR MultiZap";
  // Mapeia pro vocabulário usado no resto do sistema (whatsapp_connections.status).
  const dbStatus =
    input.status === "connected"
      ? "connected"
      : input.status === "qr"
      ? "qr"
      : input.status === "error"
      ? "error"
      : "disconnected";

  const payload: Record<string, unknown> = {
    workspace_id: input.workspaceId,
    name,
    phone,
    display_phone_number: name,
    phone_number_id: input.connectionId,
    provider: "wuzapi_gateway",
    status: dbStatus,
    onboarding_mode: "manual",
    connection_mode: "baileys",
    baileys_session_id: input.connectionId,
    session_data: {
      gateway_connection_id: input.connectionId,
      provider: "wuzapi",
      last_gateway_status: input.status,
    },
  };
  // Só zera last_error quando o canal voltou a ficar conectado.
  if (input.status === "connected") {
    payload.last_error = null;
    payload.last_error_at = null;
  }

  // 1) Match exato pelo phone_number_id (mesma conexão Gateway).
  const { data: existing } = await supabaseAdmin
    .from("whatsapp_connections")
    .select("id")
    .eq("workspace_id", input.workspaceId)
    .eq("provider", "wuzapi_gateway")
    .eq("phone_number_id", input.connectionId)
    .maybeSingle();

  if (existing?.id) {
    const { error } = await supabaseAdmin
      .from("whatsapp_connections")
      .update(payload as never)
      .eq("id", existing.id);
    if (error) throw new Error(error.message);
    return { saved_connection_id: existing.id, reused: "same_gateway_id" as const };
  }

  // 2) Reaproveita registro órfão do mesmo workspace ao invés de duplicar.
  //    Cenário: usuário deslogou/removeu e está reconectando — o connection_id
  //    do Gateway mudou, mas o canal QR do workspace é o MESMO. Só reaproveita
  //    se existir exatamente UMA linha QR não-conectada — evita escolher errado
  //    em workspaces com múltiplos WhatsApps.
  const { data: orphans } = await supabaseAdmin
    .from("whatsapp_connections")
    .select("id, status")
    .eq("workspace_id", input.workspaceId)
    .in("provider", ["wuzapi_gateway", "multizap_qr"])
    .neq("status", "connected");

  const orphanList = (orphans ?? []) as Array<{ id: string; status: string }>;
  if (orphanList.length === 1) {
    const orphan = orphanList[0];
    const { error } = await supabaseAdmin
      .from("whatsapp_connections")
      .update(payload as never)
      .eq("id", orphan.id);
    if (error) throw new Error(error.message);
    return { saved_connection_id: orphan.id, reused: "orphan_row" as const };
  }

  // 3) Sem nada pra reaproveitar → cria nova instância de fato.
  const { data, error } = await supabaseAdmin
    .from("whatsapp_connections")
    .insert(payload as never)
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return { saved_connection_id: data.id as string, reused: null };
}

export const getQrConnectionStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { connection_id: string; workspace_id?: string }) =>
    z.object({ connection_id: z.string().min(1).max(64), workspace_id: z.string().min(1).max(64).optional() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const tomb = await getTombstone(data.connection_id);
    if (tomb) {
      // Não persiste, não recria. Reporta como removida.
      await logAction({
        action: "auto_create_blocked",
        category: "security",
        workspaceId: tomb.workspace_id ?? null,
        actorUserId: context.userId,
        entity: "qr_connection",
        entityId: data.connection_id,
        payload: { source: "getQrConnectionStatus", reason: "tombstoned" },
      });
      return {
        connection_id: data.connection_id,
        status: "disconnected" as const,
        phone_number: null,
        saved_connection_id: null,
        last_connected_at: null,
        last_disconnected_at: tomb.removed_at,
      };
    }

    const out = (await gatewayFetch(
      `/connections/${encodeURIComponent(data.connection_id)}/status`,
    )) as Record<string, unknown> | null;
    const norm = normalizeStatus(out);
    const phone_number = cleanQrPhone(norm.phone_number);
    let saved_connection_id: string | null = null;
    // Persiste qualquer status reportado pelo Gateway pra UI sempre conseguir
    // mostrar o canal (mesmo desconectado), em vez de sumir do banco local.
    if (data.workspace_id && norm.status !== "unknown") {
      await assertWorkspaceMember(context.supabase, context.userId, data.workspace_id);
      const saved = await upsertQrConnectionFromGateway({
        workspaceId: data.workspace_id,
        connectionId: data.connection_id,
        phoneNumber: phone_number,
        status: norm.status,
      });
      saved_connection_id = saved.saved_connection_id;
    }
    return {
      connection_id: (out?.connection_id as string | undefined) ?? data.connection_id,
      status: norm.status,
      phone_number,
      saved_connection_id,
      last_connected_at: (out?.last_connected_at as string | undefined) ?? null,
      last_disconnected_at: (out?.last_disconnected_at as string | undefined) ?? null,
    };
  });

export const restartQrConnection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { connection_id: string }) =>
    z.object({ connection_id: z.string().min(1).max(64) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const tomb = await getTombstone(data.connection_id);
    if (tomb) {
      await logAction({
        action: "auto_reconnect_blocked",
        category: "security",
        workspaceId: tomb.workspace_id ?? null,
        actorUserId: context.userId,
        entity: "qr_connection",
        entityId: data.connection_id,
        payload: { source: "restartQrConnection", reason: "tombstoned" },
      });
      throw new Error("Esta conexão foi removida. Crie uma nova.");
    }
    const ws = await resolveWorkspaceForConnection(data.connection_id);
    if (ws) await assertWorkspaceMember(context.supabase, context.userId, ws);
    await gatewayFetch(`/connections/${encodeURIComponent(data.connection_id)}/restart`, { method: "POST" });
    await logAction({
      action: "qr_connection_reconnected",
      category: "user",
      workspaceId: ws,
      actorUserId: context.userId,
      entity: "qr_connection",
      entityId: data.connection_id,
    });
    return { ok: true };
  });

// Reaplica o webhook da WuzAPI sem reiniciar a sessão.
// Usa a rota nova POST /connections/:id/reapply-webhook do Gateway.
// Não desloga QR, não derruba conexão. Auditado em audit_log.
export const reapplyQrWebhook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { connection_id: string }) =>
    z.object({ connection_id: z.string().min(1).max(64) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const ws = await resolveWorkspaceForConnection(data.connection_id);
    if (ws) await assertWorkspaceMember(context.supabase, context.userId, ws);
    await gatewayFetch(`/connections/${encodeURIComponent(data.connection_id)}/reapply-webhook`, { method: "POST" });
    await logAction({
      action: "qr_connection_webhook_reapplied",
      category: "user",
      workspaceId: ws,
      actorUserId: context.userId,
      entity: "qr_connection",
      entityId: data.connection_id,
    });
    return { ok: true };
  });

export const logoutQrConnection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { connection_id: string }) =>
    z.object({ connection_id: z.string().min(1).max(64) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const ws = await resolveWorkspaceForConnection(data.connection_id);
    if (ws) await assertWorkspaceMember(context.supabase, context.userId, ws);
    // Logout pode demorar quando a sessão já está morta — tolera timeout/404 e segue.
    const logoutRes = await gatewayCall(
      `/connections/${encodeURIComponent(data.connection_id)}/logout`,
      { method: "POST" },
      { timeoutMs: 8000 },
    );
    if (!logoutRes.ok) {
      const kind = logoutRes.error?.kind;
      const status = logoutRes.status;
      const tolerable = kind === "timeout" || kind === "network_error" || status === 404 || status === 409;
      if (!tolerable) {
        throw new Error(logoutRes.error?.message ?? "Falha ao deslogar QR no Gateway.");
      }
      console.warn(
        `[logoutQrConnection] tolerando ${kind ?? status} — sessão provavelmente já estava deslogada.`,
      );
    }
    // Marca como desconectado localmente independente da resposta do Gateway.
    try {
      await supabaseAdmin
        .from("whatsapp_connections")
        .update({ status: "disconnected", updated_at: new Date().toISOString() } as never)
        .eq("phone_number_id", data.connection_id);
    } catch (err) {
      console.warn("[logoutQrConnection] falha ao atualizar status local:", err instanceof Error ? err.message : err);
    }
    await logAction({
      action: "qr_connection_disconnected",
      category: "user",
      workspaceId: ws,
      actorUserId: context.userId,
      entity: "qr_connection",
      entityId: data.connection_id,
    });
    return { ok: true };
  });

export const deleteQrConnection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { connection_id: string }) =>
    z.object({ connection_id: z.string().min(1).max(64) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: localRows } = await supabaseAdmin
      .from("whatsapp_connections")
      .select("workspace_id,phone_number_id,baileys_session_id,session_data")
      .or(`phone_number_id.eq.${data.connection_id},baileys_session_id.eq.${data.connection_id}`)
      .in("provider", ["wuzapi_gateway", "multizap_qr"]);
    const localConn = (localRows ?? [])[0] as
      | { workspace_id?: string; phone_number_id?: string | null; baileys_session_id?: string | null; session_data?: unknown }
      | undefined;
    const localSession = (localConn?.session_data ?? {}) as { gateway_connection_id?: string };
    const ws = localConn?.workspace_id ?? (await resolveWorkspaceForConnection(data.connection_id));
    if (ws) await assertWorkspaceMember(context.supabase, context.userId, ws);
    const idsToRemove = Array.from(new Set([
      data.connection_id,
      localConn?.phone_number_id,
      localConn?.baileys_session_id,
      localSession.gateway_connection_id,
    ].filter(Boolean))) as string[];

    // Tombstone ANTES do DELETE: impede sync de recriar entre a remoção e o próximo poll.
    for (const gid of idsToRemove) {
      try {
        await supabaseAdmin.from("removed_qr_connections").upsert(
          {
            workspace_id: ws,
            gateway_connection_id: gid,
            removed_by: context.userId,
            removed_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
          } as never,
          { onConflict: "gateway_connection_id" } as never,
        );
      } catch (err) {
        console.warn("[deleteQrConnection] tombstone falhou:", err instanceof Error ? err.message : err);
      }

      const removeRes = await gatewayCall(
        `/connections/${encodeURIComponent(gid)}`,
        { method: "DELETE" },
        { timeoutMs: 8000 },
      );
      if (!removeRes.ok) {
        console.warn(
          "[deleteQrConnection] DELETE no gateway não confirmou, seguindo com limpeza local:",
          removeRes.error?.message ?? removeRes.status,
        );
      }
    }

    // Remove também o registro local (caso exista)
    try {
      for (const gid of idsToRemove) {
        await supabaseAdmin
          .from("whatsapp_connections")
          .delete()
          .eq("phone_number_id", gid)
          .in("provider", ["wuzapi_gateway", "multizap_qr"]);
        await supabaseAdmin
          .from("whatsapp_connections")
          .delete()
          .eq("baileys_session_id", gid)
          .in("provider", ["wuzapi_gateway", "multizap_qr"]);
      }
    } catch (err) {
      console.warn("[deleteQrConnection] cleanup local falhou:", err instanceof Error ? err.message : err);
    }

    await logAction({
      action: "qr_connection_removed",
      category: "user",
      workspaceId: ws,
      actorUserId: context.userId,
      entity: "qr_connection",
      entityId: data.connection_id,
    });
    return { ok: true };
  });


// Ping leve do Gateway: usado pelo modal QR antes de criar a conexão pra
// dizer "Gateway online" ou mostrar erro categorizado. Sem expor token,
// sem chamar do navegador direto.
export const pingQrGateway = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const res = await gatewayCall<{ ok?: boolean; service?: string }>(`/health`, {}, { timeoutMs: 6000 });
    return {
      reachable: res.ok,
      http_status: res.status ?? null,
      latency_ms: res.latency_ms,
      error: res.ok
        ? null
        : { kind: res.error?.kind ?? "unknown", message: res.error?.message ?? "Falha desconhecida." },
    };
  });

// Sincroniza conexões do gateway WuzAPI com o banco local.
// Resolve o caso em que o usuário conectou pelo QR, fechou o modal antes
// do polling confirmar, e o número ficou ativo no gateway mas sumido na UI.
export const syncQrConnectionsFromGateway = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { workspace_id: string }) =>
    z.object({ workspace_id: z.string().min(1).max(64) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertWorkspaceMember(context.supabase, context.userId, data.workspace_id);

    const list = (await gatewayFetch(
      `/connections?workspace_id=${encodeURIComponent(data.workspace_id)}`,
    )) as Array<{ connection_id?: string; status?: string; phone_number?: string | null }> | null;

    const gatewayConns = list ?? [];
    let synced = 0;
    let skipped = 0;
    const details: Array<{ connection_id: string; status: string; saved_id?: string; reason?: string }> = [];

    for (const c of gatewayConns) {
      const cid = c.connection_id;
      if (!cid) continue;

      // Guard: se a conexão está no tombstone, NUNCA recria.
      const tomb = await getTombstone(cid);
      if (tomb) {
        skipped++;
        details.push({ connection_id: cid, status: "removed", reason: "tombstoned" });
        await logAction({
          action: "auto_create_blocked",
          category: "security",
          workspaceId: data.workspace_id,
          actorUserId: context.userId,
          entity: "qr_connection",
          entityId: cid,
          payload: { source: "syncQrConnectionsFromGateway", reason: "tombstoned" },
        });
        continue;
      }

      try {
        const raw = (await gatewayFetch(
          `/connections/${encodeURIComponent(cid)}/status`,
        )) as Record<string, unknown> | null;
        const norm = normalizeStatus(raw);
        // Fallback: se /status devolveu "unknown" mas o /connections já
        // categoriza, usa esse status. Assim o registro local NUNCA fica
        // ausente quando o Gateway sabe que a conexão existe.
        const fallback = (c.status ?? "").toLowerCase();
        const effective: "connected" | "qr" | "disconnected" | "error" | "unknown" =
          norm.status !== "unknown"
            ? norm.status
            : fallback === "connected" || fallback === "qr" || fallback === "disconnected" || fallback === "error"
            ? (fallback as "connected" | "qr" | "disconnected" | "error")
            : fallback === "waiting_scan"
            ? "qr"
            : "disconnected";

        if (!effective) {
          skipped++;
          details.push({ connection_id: cid, status: "unknown", reason: "gateway sem status canônico" });
          continue;
        }

        const saved = await upsertQrConnectionFromGateway({
          workspaceId: data.workspace_id,
          connectionId: cid,
          phoneNumber: norm.phone_number ?? c.phone_number ?? null,
          status: effective,
        });
        synced++;
        details.push({ connection_id: cid, status: effective, saved_id: saved.saved_connection_id });

      } catch (err) {
        skipped++;
        details.push({
          connection_id: cid,
          status: "error",
          reason: err instanceof Error ? err.message : "erro desconhecido",
        });
      }
    }

    return { total_no_gateway: gatewayConns.length, synced, skipped, details };
  });

// Diagnóstico por workspace: lê GET /__diag/wuzapi e filtra connections
// pelas que pertencem a este workspace. Usado pelo card de /app/canais
// pra mostrar webhook/eventos/última atividade sem expor token/secret.
export const getQrConnectionsDiagnostic = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { workspace_id: string }) =>
    z.object({ workspace_id: z.string().min(1).max(64) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertWorkspaceMember(context.supabase, context.userId, data.workspace_id);

    // Tudo em try/catch: se o Gateway ainda não foi atualizado e não tem
    // /__diag/wuzapi ou /connections enriquecido, devolvemos lista vazia
    // em vez de quebrar a tela de /app/canais com tela branca.
    try {
      const list = (await gatewayFetch(
        `/connections?workspace_id=${encodeURIComponent(data.workspace_id)}`,
      )) as Array<{ connection_id?: string }> | null;
      const myIds = new Set((list ?? []).map((c) => c.connection_id).filter(Boolean) as string[]);
      if (myIds.size === 0) return { connections: [], gateway_available: true as const };

      const diag = (await gatewayFetch(`/__diag/wuzapi`)) as {
        connections?: Array<{
          connection_id: string;
          session_connected?: boolean;
          logged_in?: boolean;
          webhook_configured?: boolean;
          events_configured?: boolean;
          events?: string;
          last_webhook_at?: string | null;
          last_webhook_kind?: string | null;
          error?: string | null;
        }>;
      } | null;

      const all = diag?.connections ?? [];
      const connections = all
        .filter((c) => myIds.has(c.connection_id))
        .map((c) => ({
          connection_id: c.connection_id,
          session_connected: !!c.session_connected,
          logged_in: !!c.logged_in,
          webhook_configured: !!c.webhook_configured,
          events_configured: !!c.events_configured,
          events: (c.events || "").split(",").map((s) => s.trim()).filter(Boolean),
          last_webhook_at: c.last_webhook_at ?? null,
          last_webhook_kind: c.last_webhook_kind ?? null,
          error: c.error ?? null,
        }));

      // Sincronia defensiva: se o diagnóstico indicar que a sessão caiu
      // (logged_out/disconnect), atualiza o banco local pra "disconnected".
      // Sem isso o card e o dashboard continuariam mostrando "Conectado".
      for (const d of connections) {
        const kind = (d.last_webhook_kind ?? "").toLowerCase();
        const dead =
          d.logged_in === false ||
          d.session_connected === false ||
          kind.includes("logged_out") ||
          kind.includes("disconnect");
        if (!dead) continue;
        try {
          await supabaseAdmin
            .from("whatsapp_connections")
            .update({ status: "disconnected" } as never)
            .eq("workspace_id", data.workspace_id)
            .eq("phone_number_id", d.connection_id)
            .in("provider", ["wuzapi_gateway", "multizap_qr"]);
        } catch (err) {
          console.warn("[getQrConnectionsDiagnostic] sync local falhou:", err instanceof Error ? err.message : err);
        }
      }

      return { connections, gateway_available: true as const };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "erro desconhecido";
      console.warn("[getQrConnectionsDiagnostic] gateway indisponível:", msg);
      return { connections: [], gateway_available: false as const, error: msg };
    }
  });
