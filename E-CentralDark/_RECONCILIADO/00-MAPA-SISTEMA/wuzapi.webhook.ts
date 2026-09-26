// Webhook do MultiZap-Gateway → app.
// rev: auto-cure QR + erro claro sem canal (deploy 2026-05-26).
// Fluxo: WhatsApp → WuzAPI → Gateway /webhooks/wuzapi → AQUI.
//
// O Gateway normaliza o payload bruto da WuzAPI e nos manda um JSON com shape:
//   {
//     event: "message.received" | "connection.connected" | ...,
//     provider: "wuzapi",
//     connection_id: "<id do Gateway>",
//     workspace_id: "<uuid do workspace>",
//     external_message_id, from, to, push_name, type, body, media_url, timestamp,
//     raw_payload: { ... }
//   }
//
// Aqui a gente:
// 1) Valida o header X-Gateway-Secret contra MULTIZAP_WEBHOOK_SECRET
//    (com fallback transitório para MULTIZAP_GATEWAY_TOKEN se o Gateway ainda usar o token antigo).
// 2) Localiza a whatsapp_connection (provider=wuzapi_gateway) pelo
//    session_data.gateway_connection_id ou baileys_session_id ou phone_number_id.
// 3) Para mensagens recebidas: cria contato (se preciso), abre/encontra ticket,
//    insere em ticket_messages com external_id pra idempotência, e dispara o
//    parser inbound customer (mesma lógica do webhook Meta).
// 4) Para eventos de conexão: só atualiza status (connected/disconnected).
//
// Idempotência: external_id na ticket_messages tem unique constraint lógico
// via verificação antes do insert. Mensagem duplicada → ignorada com log.
//
// Anti-loop: o Gateway só forwardeia eventos da WuzAPI (origem cliente). Mensagens
// que NÓS enviamos saem direto via sendWuzapiMessage e não voltam aqui — mas, por
// segurança, ignoramos qualquer evento cujo `from` seja igual ao próprio número
// conectado (fromMe implícito).

import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { recordTrace, deriveCorrelationId } from "@/lib/webhook-trace.server";
import { dispatchWhatsAppMessage } from "@/lib/whatsapp-send.server";
import { refreshContactAvatarAsync, refreshGroupAvatarAsync } from "@/lib/contacts-avatar.server";
import { maybeRefreshGroupInBackground } from "@/lib/group-info.server";
import { sendPushOnNewMessage } from "@/lib/notifications.server";


function maskPhone(p: string | null | undefined) {
  if (!p) return "";
  const d = String(p).replace(/\D/g, "");
  if (d.length < 6) return "***";
  return d.slice(0, 4) + "****" + d.slice(-2);
}

function logInfo(msg: string, extra: Record<string, unknown>) {
  console.log(`[wuzapi.webhook] ${msg}`, extra);
}
function logWarn(msg: string, extra: Record<string, unknown>) {
  console.warn(`[wuzapi.webhook] ${msg}`, extra);
}

type GatewayPayload = {
  event?: string;
  provider?: string;
  connection_id?: string | null;
  workspace_id?: string | null;
  external_message_id?: string | null;
  from?: string | null;
  to?: string | null;
  push_name?: string | null;
  type?: string | null;
  body?: string | null;
  media_url?: string | null;
  timestamp?: string | null;
  raw?: unknown;
  raw_payload?: unknown;
};

async function findConnection(gatewayConnectionId: string) {
  // O id do Gateway é guardado em session_data.gateway_connection_id (preferencial)
  // ou em baileys_session_id / phone_number_id (fallbacks históricos).
  const { data: bySession } = await supabaseAdmin
    .from("whatsapp_connections")
    .select("id,workspace_id,phone,phone_number_id,default_sector_id,default_assignee_id,provider,status")
    .eq("provider", "wuzapi_gateway")
    .or(`baileys_session_id.eq.${gatewayConnectionId},phone_number_id.eq.${gatewayConnectionId}`)
    .maybeSingle();
  if (bySession) return bySession;

  // session_data->>gateway_connection_id (filtro em JSON precisa de query separada).
  const { data: bySdata } = await supabaseAdmin
    .from("whatsapp_connections")
    .select("id,workspace_id,phone,phone_number_id,default_sector_id,default_assignee_id,provider,status")
    .eq("provider", "wuzapi_gateway")
    .filter("session_data->>gateway_connection_id", "eq", gatewayConnectionId)
    .maybeSingle();
  return bySdata ?? null;
}

function normalizeFrom(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const s = String(raw).trim().toLowerCase();
  // LID (@lid) é identificador interno do WhatsApp, NÃO é telefone real.
  // Nunca transformar "123@lid" em "+123" — ninguém recebe mensagem nesse número.
  if (s.endsWith("@lid")) return null;
  // jid de telefone real: "5511999999999@s.whatsapp.net" — extraímos só os dígitos.
  const digits = s.split("@")[0]?.split(":")[0] ?? s;
  const clean = digits.replace(/\D/g, "");
  return clean ? `+${clean}` : null;
}

// Resolve um "contato representante" do grupo (dono do ticket de grupo) a partir
// do JID @g.us. Não confunde com o participante que mandou a mensagem — esse vai
// em ticket_messages.sender_contact_id.
// Tabela usada: whatsapp_groups (coluna real: `jid`, NÃO `group_jid`).
async function resolveGroupContact(
  workspaceId: string,
  groupJid: string,
): Promise<{ contactId: string | null; groupId: string | null; groupName: string | null }> {
  // 1) Busca grupo cadastrado por jid pra pegar nome (e id pra ticket.group_id).
  const { data: group } = await supabaseAdmin
    .from("whatsapp_groups")
    .select("id,name")
    .eq("workspace_id", workspaceId)
    .eq("jid", groupJid)
    .maybeSingle();

  const groupId = group?.id ?? null;
  const groupName = group?.name ?? null;

  // 2) Reusa/cria um contato "espelho" do grupo (phone = jid @g.us). Único por
  // (workspace_id, phone). Esse contato é só pra satisfazer tickets.contact_id NOT NULL.
  const { data: existing } = await supabaseAdmin
    .from("contacts")
    .select("id,name")
    .eq("workspace_id", workspaceId)
    .eq("phone", groupJid)
    .maybeSingle();

  let contactId: string | null = existing?.id ?? null;
  if (existing) {
    // Só sobrescreve o nome do contato-espelho se o atual ainda for JID/fallback.
    if (groupName) {
      const cur = (existing.name ?? "").toString();
      const isJidLike = cur.includes("@g.us") || cur.includes("@lid") || cur.includes("@s.whatsapp.net");
      const isFallback = cur === "Grupo WhatsApp" || cur === "" || cur === groupJid;
      if ((isJidLike || isFallback) && cur !== groupName) {
        await supabaseAdmin.from("contacts").update({ name: groupName }).eq("id", existing.id);
      }
    }
  } else {
    const { data: ins } = await supabaseAdmin
      .from("contacts")
      .insert({
        workspace_id: workspaceId,
        phone: groupJid,
        name: groupName ?? "Grupo WhatsApp",
      })
      .select("id")
      .single();
    contactId = ins?.id ?? null;
  }

  return { contactId, groupId, groupName };
}

async function handleMessageReceived(payload: GatewayPayload, conn: NonNullable<Awaited<ReturnType<typeof findConnection>>>) {
  // ─── Auto-cura do status da conexão ────────────────────────────────────
  // Se chegou inbound real da WuzAPI/Gateway, a conexão está viva. Se o CRM
  // ainda está com status stale ('error'/'disconnected'/'throttled'), promove
  // pra 'connected' e limpa o último erro. Idempotente: só roda quando o
  // status atual está nesses estados. Não toca em nada do Gateway/WuzAPI.
  if (conn.provider === "wuzapi_gateway") {
    const stale = ["error", "disconnected", "throttled"];
    if (typeof conn.status === "string" && stale.includes(conn.status)) {
      await supabaseAdmin
        .from("whatsapp_connections")
        .update({ status: "connected", last_error: null, last_error_at: null })
        .eq("id", conn.id)
        .in("status", stale);
      logInfo("connection_auto_healed", { conn: conn.id, from_status: conn.status });
    }
  }

  const p = payload as unknown as { chat_id?: string; sender_id?: string; is_group?: boolean };
  // Em grupo: sender_id = quem mandou, chat_id = grupo (@g.us). Em DM: ambos iguais a from.
  // Preferir SenderAlt quando Sender é @lid.
  // Sender = "123@lid" é identificador interno do WhatsApp.
  // SenderAlt/payload.from = "55...@s.whatsapp.net" é o telefone real.
  const rawSender = p.sender_id || payload.from;
  const rawSenderIsLid =
    typeof rawSender === "string" &&
    rawSender.toLowerCase().endsWith("@lid");
  const payloadFromIsReal =
    typeof payload.from === "string" &&
    payload.from.toLowerCase().endsWith("@s.whatsapp.net");
  const senderRaw = rawSenderIsLid && payload.from ? payload.from : rawSender;
  // Auditoria LID/SenderAlt: registra qual campo foi usado e por quê.
  const senderSourceField =
    rawSenderIsLid && payload.from
      ? "payload.from"
      : p.sender_id
        ? "sender_id"
        : "payload.from";
  const senderSourceReason = rawSenderIsLid
    ? payload.from
      ? payloadFromIsReal
        ? "sender_id_is_lid_fallback_to_senderalt_real"
        : "sender_id_is_lid_fallback_to_payload_from_non_real"
      : "sender_id_is_lid_no_senderalt_available"
    : p.sender_id
      ? "sender_id_used_directly"
      : "no_sender_id_used_payload_from";
  logInfo("sender_resolution", {
    conn: conn.id,
    sender_id: p.sender_id ?? null,
    payload_from: payload.from ?? null,
    chosen: senderRaw ?? null,
    source_field: senderSourceField,
    reason: senderSourceReason,
    is_group_flag: !!p.is_group,
  });
  const chatRaw = p.chat_id || payload.from;
  const from = normalizeFrom(senderRaw);

  // ─── Detecção robusta de grupo (HOTFIX 3B.0.1.c.2) ─────────────────────
  // Causa do bug anterior: o check `chatRaw.includes("@g.us")` no branch de
  // criação do ticket as vezes não disparava (resultado real em produção:
  // 6.902 ticket_messages com channel_type='group' mas 0 tickets com
  // channel_type='group' e 0 contatos-espelho @g.us). Aqui derivamos o JID
  // do grupo de QUALQUER campo confiável e só tratamos como grupo se temos
  // JID @g.us de verdade. is_group=true sem JID é logado e cai pra privado.
  const groupJidCandidates: Array<unknown> = [p.chat_id, payload.from, senderRaw, chatRaw];
  let groupJid: string | null = null;
  for (const c of groupJidCandidates) {
    if (typeof c === "string" && c.includes("@g.us")) {
      groupJid = c;
      break;
    }
  }
  const flaggedGroup = !!p.is_group;
  const isGroup = !!groupJid; // só grupo se temos JID confirmado
  if (flaggedGroup && !groupJid) {
    logWarn("group_flag_without_jid", {
      conn: conn.id,
      chat_raw: typeof chatRaw === "string" ? chatRaw : null,
      from: payload.from,
      sender_id: typeof senderRaw === "string" ? senderRaw : null,
    });
  }
  const extId = payload.external_message_id ?? null;
  const body = (payload.body ?? "").toString();
  const kind = mapKind(payload.type);

  // Em DM, `from` precisa existir. Se o sender é só LID, ignoramos a mensagem
  // (não dá pra responder, não dá pra criar contato com telefone real).
  // Em grupo, `from` pode ser null (participante LID) — o ticket continua pelo chat_id @g.us
  // e a mensagem entra sem sender_contact_id.
  const senderIsLid = typeof senderRaw === "string" && senderRaw.toLowerCase().endsWith("@lid");
  if (!from && !isGroup) {
    if (senderIsLid) {
      logWarn("lid_only_no_phone", {
        conn: conn.id,
        sender_id: senderRaw,
        chat_id: typeof chatRaw === "string" ? chatRaw : null,
        push_name: payload.push_name ?? null,
      });
      return { ok: false, reason: "lid_only_no_phone" };
    }
    logWarn("from_missing", { conn: conn.id });
    return { ok: false, reason: "from_missing" };
  }
  if (!from && isGroup) {
    logInfo("group_sender_is_lid", { conn: conn.id, sender_id: senderRaw, chat_id: groupJid });
  }

  // Anti-loop: ignora mensagens cujo `from` seja igual ao próprio número conectado.
  if (from && conn.phone && normalizeFrom(conn.phone) === from) {
    logInfo("ignored_self", { conn: conn.id });
    return { ok: true, ignored: "self" };
  }

  // Idempotência por external_message_id.
  if (extId) {
    const { data: dup } = await supabaseAdmin
      .from("ticket_messages")
      .select("id")
      .eq("external_id", extId)
      .maybeSingle();
    if (dup) {
      logInfo("ignored_duplicate", { conn: conn.id, ext: extId });
      return { ok: true, ignored: "duplicate" };
    }
  }

  // ─── Contato do PARTICIPANTE real (quem digitou) ──────────────────────
  // Em DM, esse contato é o dono do ticket. Em grupo, vira só sender_contact_id
  // (pode ser null se o participante é LID — não criamos contato fake nesse caso).
  let participantContactId: string | null = null;
  if (from) {
    const { data: existingParticipant } = await supabaseAdmin
      .from("contacts")
      .select("id,name,push_name")
      .eq("workspace_id", conn.workspace_id)
      .eq("phone", from)
      .maybeSingle();
    if (existingParticipant) {
      participantContactId = existingParticipant.id;
      if (payload.push_name) {
        const isGenericName = !existingParticipant.name || existingParticipant.name === from || existingParticipant.name === existingParticipant.push_name;
        await supabaseAdmin
          .from("contacts")
          .update({
            push_name: payload.push_name,
            ...(isGenericName ? { name: payload.push_name } : {}),
          })
          .eq("id", participantContactId);
      }
    } else {
      const { data: ins } = await supabaseAdmin
        .from("contacts")
        .insert({
          workspace_id: conn.workspace_id,
          phone: from,
          name: payload.push_name ?? from,
          push_name: payload.push_name ?? null,
        })
        .select("id")
        .single();
      participantContactId = ins?.id ?? null;
    }
  }
  // Em DM, participante é obrigatório (já tratado acima). Em grupo, pode ser null.
  if (!isGroup && !participantContactId) return { ok: false, reason: "contact_failed" };

  // ─── Bifurcação grupo vs privado ────────────────────────────────────────
  // Grupo: ticket é único por (workspace_id, chat_id) com channel_type='group'.
  //        contact_id aponta pro contato-espelho do grupo. Participante vai em sender_contact_id.
  // Privado: comportamento legado — ticket por contato.
  const channelType: "group" | "private" = isGroup ? "group" : "private";
  let ticketOwnerContactId: string;
  let groupId: string | null = null;
  let chatIdForTicket: string | null = null;
  let senderContactId: string | null = null;

  if (isGroup && groupJid) {
    const groupRes = await resolveGroupContact(conn.workspace_id, groupJid);
    if (!groupRes.contactId) {
      logWarn("group_contact_resolve_failed", { conn: conn.id, jid: groupJid });
      return { ok: false, reason: "group_contact_failed" };
    }
    ticketOwnerContactId = groupRes.contactId;
    groupId = groupRes.groupId;
    chatIdForTicket = groupJid;
    senderContactId = participantContactId; // participante real
    logInfo("group_branch_entered", { conn: conn.id, jid: groupJid, mirror: ticketOwnerContactId });
  } else {
    // DM: garantimos participantContactId não-null acima (early-return se !from).
    ticketOwnerContactId = participantContactId!;
  }

  // ─── Busca/cria ticket ──────────────────────────────────────────────────
  // Grupo: chave = (workspace_id, chat_id, channel_type='group').
  // Privado: chave legada = (workspace_id, contact_id) com status aberto.
  let ticketId: string | undefined;
  let openTicketRow: { id: string; status: string; connection_id: string | null } | null = null;

  if (isGroup && chatIdForTicket) {
    const { data: openGroupTicket } = await supabaseAdmin
      .from("tickets")
      .select("id, status, connection_id")
      .eq("workspace_id", conn.workspace_id)
      .eq("chat_id", chatIdForTicket)
      .eq("channel_type", "group")
      .order("last_message_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    openTicketRow = openGroupTicket ?? null;
  } else {
    const { data: openTicket } = await supabaseAdmin
      .from("tickets")
      .select("id, status, connection_id")
      .eq("workspace_id", conn.workspace_id)
      .eq("contact_id", ticketOwnerContactId)
      .in("status", ["open", "in_progress", "waiting_client"])
      .order("last_message_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    openTicketRow = openTicket ?? null;
  }

  ticketId = openTicketRow?.id;

  if (ticketId) {
    // Grupo: se estava fechado, reabre. Sempre garante channel_type/chat_id/group_id corretos.
    const updates: {
      connection_id?: string;
      phone_number_id?: string | null;
      status?: "open" | "in_progress" | "waiting_client" | "resolved" | "closed" | "critical";
      resolved_at?: string | null;
      closed_at?: string | null;
      channel_type?: string;
      chat_id?: string | null;
      group_id?: string;
    } = {};
    if (openTicketRow?.connection_id !== conn.id) {
      updates.connection_id = conn.id;
      updates.phone_number_id = conn.phone_number_id ?? null;
    }
    if (isGroup) {
      if (openTicketRow?.status && !["open", "in_progress", "waiting_client"].includes(openTicketRow.status)) {
        updates.status = "open";
        updates.resolved_at = null;
        updates.closed_at = null;
      }
      updates.channel_type = "group";
      updates.chat_id = chatIdForTicket;
      if (groupId) updates.group_id = groupId;
    }
    if (Object.keys(updates).length > 0) {
      await supabaseAdmin.from("tickets").update(updates).eq("id", ticketId);
      if (updates.connection_id) {
        logInfo("ticket_channel_switched", { conn: conn.id, ticket: ticketId, from: openTicketRow?.connection_id });
      }
    }
  } else if (!isGroup) {
    // Privado sem aberto: tenta reabrir o último fechado.
    const { data: lastClosed } = await supabaseAdmin
      .from("tickets")
      .select("id, status")
      .eq("workspace_id", conn.workspace_id)
      .eq("contact_id", ticketOwnerContactId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (lastClosed?.id) {
      ticketId = lastClosed.id;
      await supabaseAdmin
        .from("tickets")
        .update({
          status: "open",
          resolved_at: null,
          closed_at: null,
          connection_id: conn.id,
          phone_number_id: conn.phone_number_id ?? null,
          channel_type: "private",
        })
        .eq("id", ticketId);
      logInfo("ticket_reopened", { conn: conn.id, ticket: ticketId });
    } else {
      const { data: t } = await supabaseAdmin
        .from("tickets")
        .insert({
          workspace_id: conn.workspace_id,
          contact_id: ticketOwnerContactId,
          channel: "whatsapp",
          status: "open",
          connection_id: conn.id,
          phone_number_id: conn.phone_number_id ?? null,
          sector_id: conn.default_sector_id ?? null,
          assignee_id: conn.default_assignee_id ?? null,
          channel_type: "private",
        })
        .select("id")
        .single();
      ticketId = t?.id;
    }
  } else {
    // Grupo sem ticket existente: cria novo ticket do GRUPO.
    const { data: t } = await supabaseAdmin
      .from("tickets")
      .insert({
        workspace_id: conn.workspace_id,
        contact_id: ticketOwnerContactId, // contato-espelho do grupo
        channel: "whatsapp",
        status: "open",
        connection_id: conn.id,
        phone_number_id: conn.phone_number_id ?? null,
        sector_id: conn.default_sector_id ?? null,
        assignee_id: conn.default_assignee_id ?? null,
        channel_type: "group",
        chat_id: chatIdForTicket,
        group_id: groupId,
      })
      .select("id")
      .single();
    ticketId = t?.id;
    logInfo("group_ticket_created", { conn: conn.id, ticket: ticketId, chat: chatIdForTicket, group_id: groupId });
  }

  if (!ticketId) return { ok: false, reason: "ticket_failed" };

  // Metadados úteis salvos em raw_payload_sanitized (sem tokens, sem corpo bruto de mídia).
  const sanitized: Record<string, unknown> = {
    is_group: isGroup,
    chat_id: chatRaw ?? null,
    sender_id: senderRaw ?? null,
    push_name: payload.push_name ?? null,
    timestamp: payload.timestamp ?? null,
  };

  // Detecta mídia. Pra QR/WuzAPI a URL crua é mmg.whatsapp.net (criptografada) — inútil pro browser.
  const isMedia = kind === "image" || kind === "video" || kind === "audio" || kind === "document";
  const rawForMedia = (payload.raw_payload ?? payload.raw ?? null) as unknown;
  const hasMediaProto = isMedia && rawForMedia && typeof rawForMedia === "object";

  // Insere a mensagem do contato — guarda canal REAL (auditoria por bolha).
  // Em grupo: sender_contact_id = participante real (NÃO o contato-espelho do grupo).
  const { data: insertedMsg } = await supabaseAdmin
    .from("ticket_messages")
    .insert({
      workspace_id: conn.workspace_id,
      ticket_id: ticketId,
      author: "contact",
      kind,
      body: body || (kind === "text" ? "" : `[${kind}]`),
      media_url: hasMediaProto ? null : (payload.media_url ?? null),
      media_status: hasMediaProto ? "pending" : "none",
      external_id: extId,
      delivery: "delivered",
      meta_message_type: kind,
      connection_id: conn.id,
      provider: conn.provider ?? "wuzapi_gateway",
      channel_type: channelType,
      sender_contact_id: senderContactId,
      raw_payload_sanitized: sanitized as never,
    })
    .select("id")
    .single();

  logInfo("message_saved", {
    conn: conn.id,
    ticket: ticketId,
    from: maskPhone(from),
    ext: extId,
    kind,
    is_group: isGroup,
    media_pending: !!hasMediaProto,
  });

  // Enfileira job de mídia (fire-and-forget pra não atrasar o webhook).
  if (hasMediaProto && insertedMsg?.id) {
    void (async () => {
      try {
        const { enqueueAndDispatchMediaJob } = await import("@/lib/whatsapp-media-jobs.functions");
        await enqueueAndDispatchMediaJob({
          workspaceId: conn.workspace_id,
          connectionId: conn.id,
          ticketMessageId: insertedMsg.id as string,
          externalMessageId: extId,
          mediaType: kind as "image" | "video" | "audio" | "document",
          rawMessage: rawForMedia as Record<string, unknown>,
        });
      } catch (e) {
        logWarn("media_job_enqueue_failed", { msg: e instanceof Error ? e.message : String(e) });
      }
    })();
  }

  // 🔔 Push pros atendentes (fire-and-forget). Inclui grupos — antes só Meta disparava.
  // Em grupo: título "Nome do grupo · participante". Em DM: nome do contato.
  void (async () => {
    try {
      const contactNameForPush = isGroup
        ? `${(await supabaseAdmin.from("whatsapp_groups").select("name").eq("workspace_id", conn.workspace_id).eq("jid", groupJid!).maybeSingle()).data?.name ?? "Grupo WhatsApp"} · ${payload.push_name ?? from ?? "Participante"}`
        : (payload.push_name ?? from ?? "Contato");
      const previewForPush = body || `[${kind}]`;
      await sendPushOnNewMessage({
        workspaceId: conn.workspace_id,
        conversationId: ticketId!,
        connectionId: conn.id,
        contactName: contactNameForPush,
        preview: previewForPush,
        assigneeUserId: conn.default_assignee_id ?? null,
      });
    } catch {
      /* erros já caem em notification_events */
    }
  })();


  // Foto de perfil do PARTICIPANTE (sempre — mesmo em grupo). Pula se for LID (sem phone real).
  if (from && participantContactId) {
    refreshContactAvatarAsync({
      workspaceId: conn.workspace_id,
      phone: from,
      contactId: participantContactId,
      preferredConnectionId: conn.id,
    });
  }

  // Em grupo: tenta também buscar foto do grupo.
  if (isGroup && typeof chatRaw === "string" && chatRaw.includes("@g.us")) {
    refreshGroupAvatarAsync({
      workspaceId: conn.workspace_id,
      connectionId: conn.id,
      groupJid: chatRaw,
    });
    // Lazy refresh nome/tópico/participantes em background.
    // Só dispara se grupo estiver "stale" (vazio/JID/Grupo WhatsApp) — ver helper.
    maybeRefreshGroupInBackground({
      workspaceId: conn.workspace_id,
      connectionId: conn.id,
      groupJid: chatRaw,
    });
  }

  // Parser financeiro customer (PIX / paguei / etc) — só pra texto e SÓ EM PRIVADO.
  // Grupo nunca dispara parser (regra 3B.0.1.b).
  if (!isGroup && kind === "text" && body.trim()) {
    try {
      const { runChatPaymentCommandInternal } = await import("@/lib/chat-payments.functions");
      const cmd = await runChatPaymentCommandInternal({
        ticketId,
        body,
        mode: "customer",
        messageExternalId: extId ?? undefined,
      });
      if (cmd.kind === "reply") {
        const dispatch = await dispatchWhatsAppMessage({
          connectionId: conn.id,
          to: from!, // garantido não-null neste branch (!isGroup → from obrigatório)
          text: cmd.message,
          ticketId,
        });
        await supabaseAdmin.from("ticket_messages").insert({
          workspace_id: conn.workspace_id,
          ticket_id: ticketId,
          author: "system",
          kind: "text",
          body: cmd.message,
          delivery: dispatch.ok ? "sent" : "failed",
          external_id: dispatch.ok ? dispatch.messageId : null,
        });
        logInfo("parser_reply_sent", { conn: conn.id, ticket: ticketId, dispatch_ok: dispatch.ok });
      }
    } catch (err) {
      logWarn("parser_failed", { conn: conn.id, msg: err instanceof Error ? err.message : String(err) });
    }
  }

  return { ok: true };
}


function mapKind(t: string | null | undefined): "text" | "image" | "video" | "audio" | "document" {
  switch ((t ?? "").toLowerCase()) {
    case "image": return "image";
    case "video": return "video";
    case "audio": return "audio";
    case "document": return "document";
    default: return "text";
  }
}

async function handleConnectionEvent(payload: GatewayPayload, conn: NonNullable<Awaited<ReturnType<typeof findConnection>>>) {
  const ev = payload.event ?? "";
  let status: string | null = null;
  if (ev === "connection.connected" || ev === "connection.paired") status = "connected";
  else if (ev === "connection.disconnected" || ev === "connection.logged_out") status = "disconnected";
  else if (ev === "connection.error" || ev === "connection.pair_error" || ev === "connection.stream_error" || ev === "connection.cat_error") status = "error";
  else if (ev === "connection.banned") status = "banned";
  else if (ev === "connection.qr") status = "qr_pending";
  if (!status) return { ok: true, skipped: ev };

  const errMsg =
    status === "error" ? "Gateway reportou erro de conexão" :
    status === "banned" ? "Conta temporariamente banida pelo WhatsApp" :
    null;

  await supabaseAdmin
    .from("whatsapp_connections")
    .update({
      status,
      last_webhook_at: new Date().toISOString(),
      ...(errMsg ? { last_error: errMsg, last_error_at: new Date().toISOString() } : {}),
    })
    .eq("id", conn.id);
  logInfo("connection_status", { conn: conn.id, status, ev });
  return { ok: true };
}

async function handleContactUpdated(payload: GatewayPayload, conn: NonNullable<Awaited<ReturnType<typeof findConnection>>>) {
  const p = payload as unknown as { jid?: string; push_name?: string; name?: string; business_name?: string };
  const phone = normalizeFrom(p.jid || payload.from);
  const newPush = p.push_name || payload.push_name || p.name || p.business_name || null;
  if (!phone || !newPush) return { ok: true, skipped: "no_data" };
  const { data: existing } = await supabaseAdmin
    .from("contacts")
    .select("id,name,push_name")
    .eq("workspace_id", conn.workspace_id)
    .eq("phone", phone)
    .maybeSingle();
  if (!existing) return { ok: true, skipped: "no_contact" };
  const isGenericName = !existing.name || existing.name === phone || existing.name === existing.push_name;
  await supabaseAdmin
    .from("contacts")
    .update({
      push_name: newPush,
      ...(isGenericName ? { name: newPush } : {}),
    })
    .eq("id", existing.id);
  return { ok: true };
}

// ─── Novos handlers ───────────────────────────────────────────────────────

async function handleMessageReceipt(payload: GatewayPayload, conn: NonNullable<Awaited<ReturnType<typeof findConnection>>>) {
  const p = payload as unknown as { message_id?: string; message_ids?: string[]; status?: string };
  const ids = (p.message_ids && p.message_ids.length ? p.message_ids : (p.message_id ? [p.message_id] : []));
  if (!ids.length) return { ok: true, skipped: "no_ids", updated: 0 };

  const statusRaw = String(p.status || "").toLowerCase();
  // WuzAPI manda: "" (entregue), "read", "played", "delivery"
  const delivery: "sent" | "delivered" | "read" | "failed" =
    statusRaw === "read" || statusRaw === "played" ? "read" :
    statusRaw === "delivery" || statusRaw === "" || statusRaw === "delivered" ? "delivered" :
    "sent";

  // Retorna as linhas atualizadas pra sabermos quantas mensagens casaram.
  const { data: updatedRows } = await supabaseAdmin
    .from("ticket_messages")
    .update({ delivery })
    .in("external_id", ids)
    .eq("workspace_id", conn.workspace_id)
    .select("id");

  // Espelha o status correspondente em whatsapp_message_log pra auditoria
  // (tick entregue/lido/azul). Sem isso, log ficava preso em 'sent' pra sempre.
  // delivery aqui só vira "read" | "delivered" | "sent" (failed vem por message.failed).
  const logStatus: "sent" | "delivered" | "read" =
    delivery === "read" ? "read" :
    delivery === "delivered" ? "delivered" :
    "sent";
  const { data: updatedLogRows } = await supabaseAdmin
    .from("whatsapp_message_log")
    .update({ status: logStatus })
    .in("message_id", ids)
    .eq("connection_id", conn.id)
    .eq("direction", "outbound")
    .select("id");

  const updated = updatedRows?.length ?? 0;
  const logUpdated = updatedLogRows?.length ?? 0;
  return { ok: true, updated, log_updated: logUpdated, delivery };
}

async function handleProfilePhoto(payload: GatewayPayload, conn: NonNullable<Awaited<ReturnType<typeof findConnection>>>) {
  const p = payload as unknown as { jid?: string; remove?: boolean };
  const phone = normalizeFrom(p.jid);
  if (!phone) return { ok: true, skipped: "no_jid" };
  if (p.remove) {
    // Foto removida no WhatsApp: limpa local.
    await supabaseAdmin
      .from("contacts")
      .update({ avatar_url: null, avatar_synced_at: new Date().toISOString() })
      .eq("workspace_id", conn.workspace_id)
      .eq("phone", phone);
    return { ok: true, removed: true };
  }
  // Foto trocada: força refresh imediato via gateway (background).
  refreshContactAvatarAsync({
    workspaceId: conn.workspace_id,
    phone,
    preferredConnectionId: conn.id,
    force: true,
  });
  return { ok: true };
}

async function handleGroupUpdated(payload: GatewayPayload, conn: NonNullable<Awaited<ReturnType<typeof findConnection>>>) {
  // HOTFIX: WuzAPI envia GroupInfo em PascalCase (JID, Name, Topic, OwnerJID).
  // Antes lia só lowercase, então whatsapp_groups.name ficava sempre null e a UI
  // mostrava "Grupo WhatsApp". Agora aceita os dois formatos e nunca sobrescreve
  // campo já preenchido com null.
  const p = payload as unknown as {
    jid?: string; name?: string; subject?: string; owner?: string;
    JID?: string; Name?: string; Topic?: string; OwnerJID?: string; Notify?: string;
  };
  const jid = p.JID ?? p.jid ?? null;
  if (!jid) return { ok: true, skipped: "no_jid" };

  const name = p.Name ?? p.name ?? p.Notify ?? null;
  const subject = p.Topic ?? p.subject ?? null;
  const owner = p.OwnerJID ?? p.owner ?? null;

  // Lê estado atual pra não sobrescrever valores reais com null.
  const { data: current } = await supabaseAdmin
    .from("whatsapp_groups")
    .select("name, subject, owner_jid")
    .eq("connection_id", conn.id)
    .eq("jid", jid)
    .maybeSingle();

  const finalName = name ?? current?.name ?? null;
  const finalSubject = subject ?? current?.subject ?? null;
  const finalOwner = owner ?? current?.owner_jid ?? null;

  await supabaseAdmin
    .from("whatsapp_groups")
    .upsert({
      workspace_id: conn.workspace_id,
      connection_id: conn.id,
      jid,
      name: finalName,
      subject: finalSubject,
      owner_jid: finalOwner,
      raw: JSON.parse(JSON.stringify(payload.raw ?? {})),
    }, { onConflict: "connection_id,jid" });

  // Se temos um nome real agora, atualiza o contato-espelho do grupo
  // SOMENTE se o nome atual ainda for um JID ou o fallback "Grupo WhatsApp".
  if (finalName) {
    const { data: mirror } = await supabaseAdmin
      .from("contacts")
      .select("id, name")
      .eq("workspace_id", conn.workspace_id)
      .eq("phone", jid)
      .maybeSingle();
    if (mirror) {
      const cur = (mirror.name ?? "").toString();
      const isJidLike = cur.includes("@g.us") || cur.includes("@lid") || cur.includes("@s.whatsapp.net");
      const isFallback = cur === "Grupo WhatsApp" || cur === "" || cur === jid;
      if ((isJidLike || isFallback) && cur !== finalName) {
        await supabaseAdmin.from("contacts").update({ name: finalName }).eq("id", mirror.id);
      }
    }
  }

  // Foto do grupo: força refresh em background.
  refreshGroupAvatarAsync({
    workspaceId: conn.workspace_id,
    connectionId: conn.id,
    groupJid: jid,
    force: true,
  });
  return { ok: true, name: finalName };
}

async function handleCall(payload: GatewayPayload, conn: NonNullable<Awaited<ReturnType<typeof findConnection>>>) {
  const p = payload as unknown as { call_id?: string; from?: string; from_phone?: string; is_video?: boolean; is_group?: boolean; timestamp?: string };
  const kind = (payload.event ?? "").split(".")[1] ?? "offer";
  if (!p.from) return { ok: true, skipped: "no_from" };
  await supabaseAdmin
    .from("whatsapp_calls")
    .upsert({
      workspace_id: conn.workspace_id,
      connection_id: conn.id,
      call_id: p.call_id ?? null,
      from_jid: p.from,
      from_phone: p.from_phone ?? null,
      is_video: !!p.is_video,
      is_group: !!p.is_group,
      kind,
      status: kind === "offer" ? "ringing" : kind === "accept" ? "accepted" : kind === "terminate" ? "ended" : null,
      offered_at: kind === "offer" ? (p.timestamp ?? new Date().toISOString()) : null,
      ended_at: kind === "terminate" ? (p.timestamp ?? new Date().toISOString()) : null,
      raw: JSON.parse(JSON.stringify(payload.raw ?? {})),
    }, { onConflict: "connection_id,call_id,kind" });
  return { ok: true };
}

// ─── Identity changed: WhatsApp avisou que a chave de segurança do contato mudou.
async function handleIdentityChanged(payload: GatewayPayload, conn: NonNullable<Awaited<ReturnType<typeof findConnection>>>) {
  const p = payload as unknown as { jid?: string };
  const phone = normalizeFrom(p.jid || payload.from);
  if (!phone) return { ok: true, skipped: "no_jid" };
  await supabaseAdmin
    .from("contacts")
    .update({ last_identity_change_at: new Date().toISOString() })
    .eq("workspace_id", conn.workspace_id)
    .eq("phone", phone);
  logInfo("identity_changed", { conn: conn.id, phone: maskPhone(phone) });
  return { ok: true };
}

// ─── message.failed: marca a mensagem como falha (sem mexer no body) e audita o evento.
async function handleMessageFailed(payload: GatewayPayload, conn: NonNullable<Awaited<ReturnType<typeof findConnection>>>) {
  const p = payload as unknown as { external_message_id?: string; reason?: string; from?: string };
  const extId = p.external_message_id ?? null;
  const reason = p.reason || "unknown";

  // Auditoria: sempre grava o evento (sanitizado) em whatsapp_webhook_events.
  // Mantemos só os campos úteis pra não inflar o raw_payload com lixo binário.
  const sanitized = {
    event: payload.event ?? "message.failed",
    external_message_id: extId,
    reason,
    from: payload.from ?? p.from ?? null,
    timestamp: new Date().toISOString(),
  };
  await supabaseAdmin.from("whatsapp_webhook_events").insert({
    workspace_id: conn.workspace_id,
    connection_id: conn.id,
    event_type: "message.failed",
    raw_payload: JSON.parse(JSON.stringify(sanitized)),
  });

  if (!extId) return { ok: true, matched: 0, reason, skipped: "no_ext_id" };

  // Atualiza SOMENTE delivery — nunca o body. Se não casar nada, tudo bem.
  const { data: updatedRows } = await supabaseAdmin
    .from("ticket_messages")
    .update({ delivery: "failed" })
    .eq("external_id", extId)
    .eq("workspace_id", conn.workspace_id)
    .select("id");

  const matched = updatedRows?.length ?? 0;
  return { ok: true, matched, reason };
}

async function enqueueWebhookEvent(payload: GatewayPayload, conn: NonNullable<Awaited<ReturnType<typeof findConnection>>>) {
  // Eventos pesados (HistorySync) ou desconhecidos: gravar em fila pra processar fora do hot path.
  await supabaseAdmin.from("whatsapp_webhook_events").insert({
    workspace_id: conn.workspace_id,
    connection_id: conn.id,
    event_type: payload.event ?? "unknown",
    raw_payload: JSON.parse(JSON.stringify(payload)),
  });
  return { ok: true, queued: true };
}

export const wuzapiWebhookServer = {
  handlers: {
      GET: async () =>
        new Response(JSON.stringify({ ok: true, service: "wuzapi.webhook" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),

      POST: async ({ request }: { request: Request }) => {
        const webhookSecret = process.env.MULTIZAP_WEBHOOK_SECRET ?? "";
        const gatewayTokenFallback = process.env.MULTIZAP_GATEWAY_TOKEN ?? "";
        const got = request.headers.get("x-gateway-secret") ?? "";
        const matchesWebhookSecret = webhookSecret.length > 0 && got === webhookSecret;
        const matchesFallback = gatewayTokenFallback.length > 0 && got === gatewayTokenFallback;
        if (!matchesWebhookSecret && !matchesFallback) {
          logWarn("webhook_unauthorized", {
            has_webhook_secret: webhookSecret.length > 0,
            has_fallback_token: gatewayTokenFallback.length > 0,
            got_len: got.length,
          });
          return new Response("Unauthorized", { status: 401 });
        }

        let payload: GatewayPayload = {};
        try {
          payload = (await request.json()) as GatewayPayload;
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        const gatewayConnId = payload.connection_id ?? null;
        if (!gatewayConnId) {
          logWarn("connection_id_missing", { event: payload.event });
          return new Response(JSON.stringify({ ok: false, error: "connection_id_missing" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        const conn = await findConnection(gatewayConnId);
        if (!conn) {
          logWarn("connection_unmapped", { gw: gatewayConnId, event: payload.event });
          // Responde 200 pra Gateway não ficar reprocessando algo que nunca vai existir.
          return new Response(JSON.stringify({ ok: false, error: "connection_unmapped" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        const correlationId = deriveCorrelationId(payload);
        const phone = payload.from ?? null;
        const isGroup = typeof payload.from === "string" && payload.from.includes("@g.us");
        await recordTrace({
          correlation_id: correlationId,
          stage: "crm_received",
          workspace_id: conn.workspace_id,
          connection_id: conn.id,
          chat_id: payload.from ?? null,
          contact_phone: phone,
          direction: "in",
          is_group: isGroup,
          media_kind: payload.type ?? null,
          source: "wuzapi.webhook",
          payload_summary: { event: payload.event ?? null, has_media: !!payload.media_url },
        });

        try {
          const ev = payload.event ?? "";
          const json = (r: unknown) => new Response(JSON.stringify(r), { status: 200, headers: { "Content-Type": "application/json" } });
          const traceSaved = (extra?: Record<string, unknown>) =>
            recordTrace({
              correlation_id: correlationId, stage: "crm_saved",
              workspace_id: conn.workspace_id, connection_id: conn.id,
              chat_id: payload.from ?? null, contact_phone: phone, direction: "in",
              is_group: isGroup, http_status: 200, source: "wuzapi.webhook",
              payload_summary: { event: ev, ...(extra ?? {}) },
            });

          if (ev === "message.received") {
            const out = await handleMessageReceived(payload, conn);
            await traceSaved({ result: "message_received" });
            return json(out);
          }
          if (ev === "message.receipt") {
            const out = await handleMessageReceipt(payload, conn);
            await traceSaved({ result: "message_receipt", delivery: (out as { delivery?: string }).delivery, updated: (out as { updated?: number }).updated });
            return json(out);
          }

          // presence.updated (novo nome) ou presence.update (legado)
          if (ev === "presence.updated" || ev === "presence.update") {
            const p2 = payload as unknown as { chat_id?: string; sender_id?: string; state?: string };
            const phone = normalizeFrom(p2.sender_id || p2.chat_id || payload.from)?.replace(/\D+/g, "") ?? "";
            const state = p2.state ?? "unavailable";
            if (phone) {
              const isOnline = state === "online" || state === "available" || state === "composing" || state === "recording";
              await supabaseAdmin.from("whatsapp_presence").upsert({
                workspace_id: conn.workspace_id,
                connection_id: conn.id,
                contact_phone: phone,
                state,
                last_seen_at: isOnline ? new Date().toISOString() : null,
                updated_at: new Date().toISOString(),
              }, { onConflict: "connection_id,contact_phone" });
            }
            return json({ ok: true });
          }

          if (ev.startsWith("connection.")) return json(await handleConnectionEvent(payload, conn));
          if (ev === "profile.photo.updated") return json(await handleProfilePhoto(payload, conn));
          if (ev === "contact.updated" || ev === "push_name.updated" || ev === "user.about.updated") {
            return json(await handleContactUpdated(payload, conn));
          }
          if (ev === "group.updated" || ev === "group.joined" || ev === "group.participants.updated") {
            return json(await handleGroupUpdated(payload, conn));
          }
          if (ev.startsWith("call.")) return json(await handleCall(payload, conn));
          if (ev === "identity.changed") return json(await handleIdentityChanged(payload, conn));
          if (ev === "message.failed") {
            const out = await handleMessageFailed(payload, conn);
            await traceSaved({ result: "message_failed", matched: (out as { matched?: number }).matched, reason: (out as { reason?: string }).reason });
            return json(out);
          }

          // HistorySync e desconhecidos: enfileira em whatsapp_webhook_events.
          if (ev === "history.sync" || ev.startsWith("unknown:") || ev === "sync.offline" || ev === "state.sync") {
            return json(await enqueueWebhookEvent(payload, conn));
          }

          // Eventos não mapeados: responde 200 e loga só a "casca" (sem corpo, sem tokens).
          const rawKeys =
            payload.raw && typeof payload.raw === "object" && payload.raw !== null
              ? Object.keys(payload.raw as Record<string, unknown>).slice(0, 12)
              : [];
          logInfo("ignored_event", { event: ev, conn: conn.id, raw_keys: rawKeys });
          return json({ ok: true, ignored: ev });
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          logWarn("handler_failed", { msg });
          await recordTrace({
            correlation_id: correlationId, stage: "failed",
            workspace_id: conn.workspace_id, connection_id: conn.id,
            chat_id: payload.from ?? null, contact_phone: phone, direction: "in",
            is_group: isGroup, error_reason: msg, source: "wuzapi.webhook",
          });
          return new Response(JSON.stringify({ ok: false, error: "handler_failed" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
  },
};

export const Route = createFileRoute("/api/public/wuzapi/webhook")({
  server: wuzapiWebhookServer,
});
