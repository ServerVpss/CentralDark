import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { dispatchWhatsAppMessage, markAsReadAndTyping, resolveSendChannel, previewSendChannel } from "@/lib/whatsapp-send.server";
import { looksLikeLidFakePhone } from "@/lib/phone";
import { logAction } from "@/lib/audit.server";
import { enrichMissingWhatsappMedia } from "@/lib/whatsapp-media.server";
import { runChatPaymentCommandInternal } from "@/lib/chat-payments.functions";

function normalizeSendErrorMessage(message: string, code?: string | null): string {
  const raw = message || "Falha ao enviar mensagem.";

  if (code === "NOT_FOUND") {
    return "Nenhum MultiZap QR ativo para enviar. Reconecte um QR em /app/canais para responder este contato.";
  }

  if (/não autorizada|token do Gateway|CRM→Gateway|CRM->Gateway|401/i.test(raw)) {
    return "Integração WhatsApp não autorizada. Verifique se o secret MULTIZAP_GATEWAY_TOKEN do Lovable é igual ao GATEWAY_SERVER_TOKEN da VPS e publique novamente.";
  }

  if (/payload recusado|Gateway respondeu HTTP 400|Destino do grupo inválido/i.test(raw)) {
    return "Destino do grupo inválido ou payload recusado pela WuzAPI. Confira se o grupo termina com @g.us e tente novamente.";
  }

  return raw;
}

const TicketStatus = z.enum([
  "open", "in_progress", "waiting_client", "resolved", "closed", "critical",
]);

// =====================================================
// listTickets — feed para inbox
// =====================================================
export const listTickets = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      workspaceId: z.string().uuid(),
      filter: z.enum(["all", "mine", "unassigned", "open", "in_progress", "waiting_client", "resolved", "closed", "critical"]).default("open"),
      search: z.string().max(120).optional(),
      phoneNumberId: z.string().max(60).optional().nullable(),
      sectorId: z.string().uuid().optional().nullable(),
      assigneeId: z.string().uuid().optional().nullable(),
      limit: z.number().int().min(1).max(100).default(50),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    let q = supabase
      .from("tickets")
      .select("id, number, status, priority, subject, last_message_preview, last_message_at, unread_count, sector_id, assignee_id, opened_at, phone_number_id, connection_id, channel_type, chat_id, group_id, contact:contacts(id, name, phone, avatar_url), group:whatsapp_groups(id, name, picture_url), connection:whatsapp_connections(id, provider, status, name)")
      .eq("workspace_id", data.workspaceId)
      .order("last_message_at", { ascending: false, nullsFirst: false })
      .order("opened_at", { ascending: false })
      .limit(data.limit);

    if (data.filter === "mine") q = q.eq("assignee_id", userId);
    else if (data.filter === "unassigned") q = q.is("assignee_id", null);
    else if (data.filter !== "all") q = q.eq("status", data.filter);

    if (data.phoneNumberId) q = q.eq("phone_number_id", data.phoneNumberId);
    if (data.sectorId) q = q.eq("sector_id", data.sectorId);
    if (data.assigneeId) q = q.eq("assignee_id", data.assigneeId);

    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    let result = rows ?? [];
    if (data.search?.trim()) {
      const s = data.search.trim().toLowerCase();
      result = result.filter((t: any) =>
        (t.contact?.name?.toLowerCase().includes(s)) ||
        (t.contact?.phone?.includes(s)) ||
        (t.group?.name?.toLowerCase().includes(s)) ||
        (t.subject?.toLowerCase().includes(s)) ||
        (t.last_message_preview?.toLowerCase().includes(s)),
      );
    }

    // Enriquecimento: autor da última msg (UI "parado") + channel_type real
    // + sender_contact_id (pra preview "Participante: msg" em grupos).
    const ticketIds = result.map((t: any) => t.id);
    if (ticketIds.length) {
      const { data: lastMsgs } = await supabase
        .from("ticket_messages")
        .select("ticket_id, author, created_at, is_internal_note, channel_type, sender_contact_id")
        .in("ticket_id", ticketIds)
        .eq("is_internal_note", false)
        .order("created_at", { ascending: false });
      const lastAuthorByTicket = new Map<string, string>();
      const channelTypeByTicket = new Map<string, string>();
      const lastSenderIdByTicket = new Map<string, string>();
      for (const m of lastMsgs ?? []) {
        if (!lastAuthorByTicket.has(m.ticket_id)) {
          lastAuthorByTicket.set(m.ticket_id, m.author);
        }
        if (!channelTypeByTicket.has(m.ticket_id) && m.channel_type) {
          channelTypeByTicket.set(m.ticket_id, m.channel_type);
        }
        // Só interessa sender_contact_id quando a última msg veio do contato em grupo
        if (!lastSenderIdByTicket.has(m.ticket_id) && m.sender_contact_id && m.author === "contact") {
          lastSenderIdByTicket.set(m.ticket_id, m.sender_contact_id);
        }
      }

      // Resolve nomes dos participantes em batch.
      const senderIds = Array.from(new Set(Array.from(lastSenderIdByTicket.values())));
      const senderNameById = new Map<string, string>();
      if (senderIds.length) {
        const { data: senders } = await supabase
          .from("contacts")
          .select("id, name, phone")
          .in("id", senderIds);
        for (const s of senders ?? []) {
          senderNameById.set(s.id as string, (s.name as string) || (s.phone as string) || "");
        }
      }

      result = result.map((t: any) => {
        const senderId = lastSenderIdByTicket.get(t.id) ?? null;
        const msgCt = channelTypeByTicket.get(t.id) ?? null;
        // HOTFIX 3B.0.1.c.1: tickets antigos têm channel_type='private' por default,
        // mesmo quando todas as mensagens são de grupo. Se a última msg diz 'group',
        // confiamos nela (a coluna do ticket é legado e não foi backfilled).
        const effectiveCt = msgCt === "group" ? "group" : (t.channel_type ?? msgCt ?? null);
        return {
          ...t,
          last_author: lastAuthorByTicket.get(t.id) ?? null,
          last_channel_type: effectiveCt,
          last_sender_contact_id: senderId,
          last_sender_name: senderId ? (senderNameById.get(senderId) ?? null) : null,
        };
      });

    }

    return { tickets: result };
  });

// =====================================================
// getTicket
// =====================================================
export const getTicket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ ticketId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: ticket, error } = await supabase
      .from("tickets")
      .select("*, contact:contacts(*), group:whatsapp_groups(id, name, picture_url), sector:sectors(id,name,color)")
      .eq("id", data.ticketId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!ticket) throw new Error("Ticket não encontrado");
    return { ticket };
  });

// =====================================================
// listMessages
// =====================================================
export const listMessages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ ticketId: z.string().uuid(), limit: z.number().int().min(1).max(500).default(200) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: ticket } = await supabase
      .from("tickets")
      .select("id,workspace_id,contact_id,contact:contacts(id,avatar_url)")
      .eq("id", data.ticketId)
      .maybeSingle();

    // Busca as N mensagens MAIS RECENTES (desc + limit) e inverte pra exibir em ordem
    // cronológica. Antes estávamos pegando ascending+limit, o que retornava as 200
    // mensagens mais ANTIGAS — em tickets grandes (>200 msgs) as novas nunca apareciam.
    const loadMessages = () => supabase
      .from("ticket_messages")
      .select("*")
      .eq("ticket_id", data.ticketId)
      .order("created_at", { ascending: false })
      .limit(data.limit);

    let { data: msgs, error } = await loadMessages();
    if (error) throw new Error(error.message);

    const contact = ticket?.contact as { id?: string; avatar_url?: string | null } | null;
    if (ticket?.workspace_id && msgs?.length) {
      const changed = await enrichMissingWhatsappMedia({
        workspaceId: ticket.workspace_id,
        ticketId: data.ticketId,
        contactId: ticket.contact_id,
        contactAvatarUrl: contact?.avatar_url ?? null,
        messages: msgs as Array<Record<string, unknown>>,
      });
      if (changed) {
        const refreshed = await loadMessages();
        if (refreshed.error) throw new Error(refreshed.error.message);
        msgs = refreshed.data;
      }
    }
    // Reverte pra cronológico (mais antigas primeiro) — UI espera essa ordem.
    return { messages: (msgs ?? []).slice().reverse() };
  });

export const logMessageDiagnosticEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      messageId: z.string().uuid(),
      eventType: z.enum(["media_render_success", "media_render_failed"]),
      detail: z.string().max(500).optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: msg, error } = await supabase
      .from("ticket_messages")
      .select("id, workspace_id, ticket_id, meta_message_type, media_mime, external_id")
      .eq("id", data.messageId)
      .maybeSingle();
    if (error || !msg) return { ok: false };

    await supabase.from("ticket_events").insert({
      workspace_id: msg.workspace_id,
      ticket_id: msg.ticket_id,
      actor_user_id: userId,
      event_type: data.eventType,
      payload: {
        message_id: msg.id,
        external_id: msg.external_id,
        type: msg.meta_message_type,
        mime: msg.media_mime,
        detail: data.detail ?? null,
      },
    });
    return { ok: true };
  });

// =====================================================
// sendMessage — envia mensagem do atendente (ou nota interna)
// =====================================================
export const sendMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      ticketId: z.string().uuid(),
      body: z.string().max(4000).optional(),
      isInternalNote: z.boolean().default(false),
      // Anexo de mídia opcional (URL pública — bucket whatsapp-media)
      media: z.object({
        type: z.enum(["image", "video", "audio", "document"]),
        link: z.string().url().max(2000),
        caption: z.string().max(1024).optional(),
        filename: z.string().max(255).optional(),
      }).optional(),
      // Quando true, autoriza o sistema a cair em QR mesmo se a conversa veio da Meta
      // e a janela 24h fechou. O composer só envia true após o atendente confirmar no modal.
      confirmFallbackToQr: z.boolean().default(false),
    })
      .refine((d) => d.isInternalNote || d.body || d.media, {
        message: "Mensagem precisa de texto ou mídia",
      })
      .parse(input),
  )

  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Etapa 3 — intercepta comandos de PIX antes de enviar texto cru
    if (!data.isInternalNote && data.body && /^(\/(pix|cobrar|ver\s*pix|cancelar\s*pix|pendentes|caixa|resumo|ajuda|pagamento|status)|pix\s+|cobrar\s+|gerar\s+|pagamento\s+)/i.test(data.body.trim())) {
      const cmd = await runChatPaymentCommandInternal({ ticketId: data.ticketId, body: data.body, userId });
      if (cmd.kind === "reply") {
        // substitui body do atendente pela resposta formatada do robô
        data = { ...data, body: cmd.message };
      }
    }

    const { data: ticket, error: tErr } = await supabase
      .from("tickets")
      .select("id, workspace_id, status, assignee_id, channel, connection_id, chat_id, contact:contacts(phone)")
      .eq("id", data.ticketId)
      .maybeSingle();
    if (tErr || !ticket) throw new Error("Ticket inacessível");

    const contactPhone = (ticket.contact as { phone?: string } | null)?.phone ?? null;
    const ticketChatId = (ticket as { chat_id?: string | null }).chat_id ?? null;

    // 🛡️ Grupos têm JID `@g.us` (ex: 120363...@g.us), que não é telefone real
    // e cairia como falso positivo na trava de LID (muitos dígitos, sem DDI 55).
    // Pula a checagem para grupos — eles seguem fluxo próprio no envio.
    const isGroupTarget =
      ticketChatId?.endsWith("@g.us") || contactPhone?.endsWith("@g.us") || false;

    // 🛡️ Bloqueia envio pra contatos com telefone fake vindo de LID do WhatsApp
    // (Linked Identity — identificador interno, não é número real). Esses contatos
    // foram criados quando o webhook antigo transformava "123@lid" em "+123".
    // Mandar pra eles é aceito pela WuzAPI mas nunca chega ao destinatário.
    if (
      !data.isInternalNote &&
      ticket.channel === "whatsapp" &&
      contactPhone &&
      !isGroupTarget &&
      looksLikeLidFakePhone(contactPhone)
    ) {
      console.warn("[send.block.lid]", {
        ticketId: data.ticketId,
        contactPhone,
        chatId: ticketChatId,
      });
      throw new Error(
        "Número do contato parece inválido. Confira o WhatsApp antes de enviar.",
      );
    }

    // 🔎 Roteamento de canal:
    // Histórico/ticket pertence ao NÚMERO do cliente. A regra correta é:
    //   - Conexão atual do ticket é QR ativo  → usa QR (primary)
    //   - Conexão atual é Meta dentro da janela 24h → usa Meta (primary)
    //   - Conexão atual é Meta fora da janela 24h → fallback QR só se confirmado pelo atendente
    //   - Conexão atual sumiu/desconectada → fallback QR (auto, religa)
    //   - Sem canal disponível → erro amigável, nada é enviado.
    // Toda essa lógica vive em resolveSendChannel (whatsapp-send.server.ts).
    let activeConnectionId: string | null = null;
    let relinked = false;
    let usedFallbackQr = false;
    let previousConnectionId: string | null = null;

    if (!data.isInternalNote && ticket.channel === "whatsapp" && contactPhone) {
      let resolved = await resolveSendChannel({
        workspaceId: ticket.workspace_id,
        ticketConnectionId: ticket.connection_id,
        contactPhone,
      });
      if (!resolved.ok) {
        if (resolved.code === "OUT_OF_WINDOW") {
          throw new Error(
            "Conversa fora da janela de 24h da Meta e nenhum MultiZap QR ativo no workspace. Envie um template aprovado ou conecte um QR em /app/canais.",
          );
        }
        // NO_CHANNEL_AVAILABLE: checa se existe QR no workspace com status='error'
        // (status stale no CRM enquanto o QR real continua vivo no Gateway).
        const { data: erroredQr } = await supabase
          .from("whatsapp_connections")
          .select("id,last_error,last_error_at")
          .eq("workspace_id", ticket.workspace_id)
          .in("provider", ["wuzapi_gateway", "multizap_qr", "baileys_selfhosted"])
          .eq("status", "error")
          .limit(1)
          .maybeSingle();
        if (erroredQr) {
          // Auto-heal: se a conexão recebeu mensagem nos últimos 10min, o QR
          // está vivo no Gateway e o status do CRM ficou stale. Religamos
          // pra 'connected' e tentamos resolver de novo, sem erro pro atendente.
          const tenMinAgo = new Date(Date.now() - 10 * 60_000).toISOString();
          const { data: recentInbound } = await supabase
            .from("whatsapp_message_log")
            .select("id")
            .eq("connection_id", erroredQr.id)
            .eq("direction", "inbound")
            .gte("created_at", tenMinAgo)
            .limit(1)
            .maybeSingle();
          if (recentInbound) {
            await supabase
              .from("whatsapp_connections")
              .update({ status: "connected", last_error: null, last_error_at: null })
              .eq("id", erroredQr.id);
            const retry = await resolveSendChannel({
              workspaceId: ticket.workspace_id,
              ticketConnectionId: ticket.connection_id,
              contactPhone,
            });
            if (retry.ok) {
              resolved = retry;
            } else {
              throw new Error(
                "MultiZap QR está com erro no CRM. Reconecte em /app/canais ou aguarde o próximo evento de entrada (o status se autoajusta).",
              );
            }
          } else {
            throw new Error(
              "MultiZap QR está com erro no CRM. A conexão pode ter recebido mensagens recentemente, mas ainda está marcada como erro. Reconecte em /app/canais ou aguarde o próximo evento de entrada (o status se autoajusta).",
            );
          }
        } else {
          throw new Error(
            "Nenhum canal WhatsApp disponível para responder este contato. Verifique conexões em /app/canais.",
          );
        }
      }

      // Fallback Meta→QR exige confirmação EXPLÍCITA do atendente.
      // O composer chama previewChannel antes de enviar; se vier fallback_qr,
      // abre um modal de confirmação e só então reenvia com confirmFallbackToQr=true.
      // Conexão antiga apagada/desconectada (sem provider Meta envolvido) NÃO exige confirmação —
      // é só religar num QR ativo, comportamento que sempre existiu.
      const isMetaFallback =
        resolved.reason === "fallback_qr" && !!resolved.previousConnectionId;
      let metaToQrFallback = false;
      if (isMetaFallback) {
        const { data: prev } = await supabase
          .from("whatsapp_connections")
          .select("provider")
          .eq("id", resolved.previousConnectionId!)
          .maybeSingle();
        metaToQrFallback = prev?.provider === "meta_cloud";
      }
      if (metaToQrFallback && !data.confirmFallbackToQr) {
        throw new Error(
          "FALLBACK_REQUIRES_CONFIRMATION: Esta conversa veio pela META mas está fora da janela de 24h. Confirme antes para responder pelo QR.",
        );
      }

      activeConnectionId = resolved.connectionId;
      usedFallbackQr = resolved.reason === "fallback_qr";
      previousConnectionId = resolved.previousConnectionId ?? null;
      relinked = !!previousConnectionId && previousConnectionId !== resolved.connectionId;
    }





    const isWhatsAppSend =
      !data.isInternalNote && ticket.channel === "whatsapp" && !!activeConnectionId && !!contactPhone;

    // Texto efetivo gravado no ticket_messages (texto > caption da mídia > rótulo do tipo)
    const messageBody = data.body
      ?? data.media?.caption
      ?? (data.media ? `[${data.media.type}]` : "");
    const messageKind = data.isInternalNote
      ? "note"
      : data.media
        ? data.media.type
        : "text";

    // Sem canal ativo pra responder: histórico permanece, mensagem não vai.
    if (
      !data.isInternalNote &&
      ticket.channel === "whatsapp" &&
      contactPhone &&
      !activeConnectionId
    ) {
      throw new Error(
        "Nenhum MultiZap QR ativo para enviar. Reconecte um QR em /app/canais para responder este contato.",
      );
    }

    // Resolve provider da conexão escolhida pra preencher rastreio do envio.
    // Sem isso, ticket_messages.connection_id/provider/channel_type ficam vazios
    // e o /app/chat não consegue mostrar de que canal veio cada bolha.
    let sendProvider: string | null = null;
    if (isWhatsAppSend && activeConnectionId) {
      const { data: connRow } = await supabase
        .from("whatsapp_connections")
        .select("provider")
        .eq("id", activeConnectionId)
        .maybeSingle();
      sendProvider = connRow?.provider ?? null;
    }
    const sendChannelType = isWhatsAppSend ? "whatsapp" : null;

    // 1. Insere ticket_message (queued se WA pendente)
    const { data: msg, error } = await supabase
      .from("ticket_messages")
      .insert({
        workspace_id: ticket.workspace_id,
        ticket_id: ticket.id,
        author: data.isInternalNote ? "system" : "agent",
        author_user_id: userId,
        kind: messageKind as never,
        body: messageBody,
        media_url: data.media?.link ?? null,
        media_mime: data.media?.type ?? null,
        is_internal_note: data.isInternalNote,
        delivery: isWhatsAppSend ? "pending" : "sent",
        connection_id: isWhatsAppSend ? activeConnectionId : null,
        provider: sendProvider,
        channel_type: sendChannelType,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);

    // 2. Dispara pelo canal escolhido (QR do ticket, QR religado, ou Meta do próprio ticket)
    if (isWhatsAppSend) {
      console.log("[sendMessage] ▶ dispatch", {
        ticketId: ticket.id,
        connectionId: activeConnectionId,
        relinked,
        to: contactPhone,
        hasMedia: !!data.media,
        bodyLen: data.body?.length ?? 0,
      });
      const r = await dispatchWhatsAppMessage({
        connectionId: activeConnectionId!,
        to: contactPhone!,
        text: data.media ? undefined : data.body,
        media: data.media,
        ticketId: ticket.id,
      });

      if (!r.ok) {
        const code = (r as { code?: string }).code ?? null;
        console.error("[sendMessage] ❌ dispatch FAIL", {
          ticketId: ticket.id,
          connectionId: activeConnectionId,
          to: contactPhone,
          errorCode: code,
          errorMessage: r.message,
        });
        await supabase.from("ticket_messages")
          .update({ delivery: "failed" })
          .eq("id", msg.id);
        const friendly = normalizeSendErrorMessage(r.message, code);
        throw new Error(friendly);
      }

      // ♻ Religa o ticket no QR usado e registra auditoria.
      if (relinked && activeConnectionId) {
        await supabase
          .from("tickets")
          .update({ connection_id: activeConnectionId })
          .eq("id", ticket.id);
        await supabase.from("audit_log").insert({
          workspace_id: ticket.workspace_id,
          actor_user_id: userId,
          action: usedFallbackQr ? "send_channel_fallback_meta_to_qr" : "ticket_qr_connection_auto_relinked",
          payload: {
            ticket_id: ticket.id,
            old_connection_id: previousConnectionId ?? ticket.connection_id,
            new_connection_id: activeConnectionId,
            reason: usedFallbackQr ? "meta_out_of_window_user_confirmed" : "old_qr_unavailable",
            confirmed_by_user: usedFallbackQr ? data.confirmFallbackToQr : null,
          },
        });
      }


      console.log("[sendMessage] ✅ dispatch OK", {
        ticketId: ticket.id,
        messageId: r.messageId,
      });
      await supabase.from("ticket_messages")
        .update({ delivery: "sent", external_id: r.messageId })
        .eq("id", msg.id);
    }


    // Auto-assign + status -> in_progress se aberto
    const updates: { assignee_id?: string; status?: "in_progress" } = {};
    if (!ticket.assignee_id) updates.assignee_id = userId;
    if (ticket.status === "open") updates.status = "in_progress";
    if (Object.keys(updates).length) {
      await supabase.from("tickets").update(updates).eq("id", ticket.id);
    }

    // Zera unread (atendente respondeu)
    await supabase.from("tickets").update({ unread_count: 0 }).eq("id", ticket.id);

    await logAction({
      action: data.isInternalNote ? "ticket_internal_note" : "ticket_message_sent",
      category: "user",
      workspaceId: ticket.workspace_id,
      actorUserId: userId,
      entity: "ticket_messages",
      entityId: msg.id,
      payload: {
        ticket_id: ticket.id,
        contact_phone: contactPhone,
        via_whatsapp: isWhatsAppSend,
        body_preview: messageBody.slice(0, 140),
        has_media: !!data.media,
        media_type: data.media?.type ?? null,
      },
    });

    return { message: msg };
  });

// =====================================================
// updateTicketStatus
// =====================================================
export const updateTicketStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      ticketId: z.string().uuid(),
      status: TicketStatus,
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: prev } = await supabase
      .from("tickets").select("status, workspace_id").eq("id", data.ticketId).maybeSingle();

    const updates: any = { status: data.status };
    if (data.status === "resolved") updates.resolved_at = new Date().toISOString();
    if (data.status === "closed") updates.closed_at = new Date().toISOString();

    const { data: ticket, error } = await supabase
      .from("tickets")
      .update(updates)
      .eq("id", data.ticketId)
      .select("workspace_id")
      .single();
    if (error) throw new Error(error.message);

    await supabase.from("ticket_events").insert({
      workspace_id: ticket.workspace_id,
      ticket_id: data.ticketId,
      actor_user_id: userId,
      event_type: "status_changed",
      payload: { to: data.status },
    });

    await logAction({
      action: "ticket_status_changed",
      category: "user",
      workspaceId: ticket.workspace_id,
      actorUserId: userId,
      entity: "tickets",
      entityId: data.ticketId,
      before: prev ? { status: prev.status } : null,
      after: { status: data.status },
    });

    return { ok: true };
  });

// =====================================================
// assignTicket
// =====================================================
export const assignTicket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      ticketId: z.string().uuid(),
      assigneeId: z.string().uuid().nullable(),
      sectorId: z.string().uuid().nullable().optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: prev } = await supabase
      .from("tickets").select("assignee_id, sector_id, workspace_id").eq("id", data.ticketId).maybeSingle();

    const updates: any = { assignee_id: data.assigneeId };
    if (data.sectorId !== undefined) updates.sector_id = data.sectorId;

    const { data: ticket, error } = await supabase
      .from("tickets").update(updates).eq("id", data.ticketId).select("workspace_id").single();
    if (error) throw new Error(error.message);

    await supabase.from("ticket_events").insert({
      workspace_id: ticket.workspace_id,
      ticket_id: data.ticketId,
      actor_user_id: userId,
      event_type: "assigned",
      payload: { assignee_id: data.assigneeId, sector_id: data.sectorId },
    });

    await logAction({
      action: "ticket_assigned",
      category: "user",
      workspaceId: ticket.workspace_id,
      actorUserId: userId,
      entity: "tickets",
      entityId: data.ticketId,
      before: prev ? { assignee_id: prev.assignee_id, sector_id: prev.sector_id } : null,
      after: { assignee_id: data.assigneeId, sector_id: data.sectorId ?? prev?.sector_id ?? null },
    });

    return { ok: true };
  });

// =====================================================
// claimTicket — agente assume controle do atendimento (+ log dedicado)
// =====================================================
export const claimTicket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ ticketId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const claimedAt = new Date().toISOString();

    const { data: prev } = await supabase
      .from("tickets")
      .select("workspace_id, assignee_id, status")
      .eq("id", data.ticketId)
      .maybeSingle();
    if (!prev) throw new Error("Ticket não encontrado");

    // Busca nome/email do agente pra registrar legível no log
    const { data: profile } = await supabase
      .from("profiles").select("full_name, email").eq("id", userId).maybeSingle();

    const { error } = await supabase
      .from("tickets")
      .update({ assignee_id: userId, status: "in_progress" })
      .eq("id", data.ticketId);
    if (error) throw new Error(error.message);

    const payload = {
      claimed_at: claimedAt,
      agent_user_id: userId,
      agent_name: profile?.full_name ?? null,
      agent_email: profile?.email ?? null,
      previous_assignee_id: prev.assignee_id,
      previous_status: prev.status,
    };

    await supabase.from("ticket_events").insert({
      workspace_id: prev.workspace_id,
      ticket_id: data.ticketId,
      actor_user_id: userId,
      event_type: "claimed",
      payload,
    });

    await logAction({
      action: "ticket_claimed",
      category: "user",
      workspaceId: prev.workspace_id,
      actorUserId: userId,
      entity: "tickets",
      entityId: data.ticketId,
      before: { assignee_id: prev.assignee_id, status: prev.status },
      after: { assignee_id: userId, status: "in_progress", claimed_at: claimedAt },
    });

    return { ok: true, claimedAt, agentName: profile?.full_name ?? profile?.email ?? null };
  });


// =====================================================
// markRead — zera contador de não lidas + marca lida na Meta (check azul)
// e dispara indicador "digitando…" pro cliente quando solicitado.
// =====================================================
export const markRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      ticketId: z.string().uuid(),
      typing: z.boolean().default(false),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    await supabase.from("tickets").update({ unread_count: 0 }).eq("id", data.ticketId);

    // Marca lida na Meta usando a última mensagem inbound desse ticket
    // (fire-and-forget: falha não afeta o usuário)
    const { data: ticket } = await supabase
      .from("tickets").select("connection_id").eq("id", data.ticketId).maybeSingle();
    if (ticket?.connection_id) {
      const { data: lastIn } = await supabase
        .from("ticket_messages")
        .select("external_id")
        .eq("ticket_id", data.ticketId)
        .eq("author", "contact")
        .not("external_id", "is", null)
        .order("created_at", { ascending: false })
        .limit(1).maybeSingle();
      if (lastIn?.external_id) {
        markAsReadAndTyping(ticket.connection_id, lastIn.external_id, { typing: data.typing })
          .catch(() => { /* silencioso */ });
      }
    }
    return { ok: true };
  });

// =====================================================
// createTicketWithMessage — cria ticket + 1ª msg do contato (uso manual / mock WhatsApp)
// =====================================================
export const createTicketWithMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      workspaceId: z.string().uuid(),
      contactPhone: z.string().min(5).max(40),
      contactName: z.string().max(120).optional(),
      body: z.string().min(1).max(4000),
      sectorId: z.string().uuid().nullable().optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;

    // Upsert contato
    const { data: existing } = await supabase
      .from("contacts").select("id, name")
      .eq("workspace_id", data.workspaceId)
      .eq("phone", data.contactPhone)
      .maybeSingle();

    let contactId = existing?.id;
    if (!contactId) {
      const { data: c, error: cErr } = await supabase
        .from("contacts")
        .insert({ workspace_id: data.workspaceId, phone: data.contactPhone, name: data.contactName ?? null })
        .select("id").single();
      if (cErr) throw new Error(cErr.message);
      contactId = c.id;
    } else if (data.contactName && !existing?.name) {
      await supabase.from("contacts").update({ name: data.contactName }).eq("id", contactId);
    }

    // Cria ticket
    const { data: ticket, error: tErr } = await supabase
      .from("tickets")
      .insert({
        workspace_id: data.workspaceId,
        contact_id: contactId,
        sector_id: data.sectorId ?? null,
        channel: "manual",
        status: "open",
      })
      .select("id").single();
    if (tErr) throw new Error(tErr.message);

    // Primeira mensagem como se fosse do contato
    const { error: mErr } = await supabase.from("ticket_messages").insert({
      workspace_id: data.workspaceId,
      ticket_id: ticket.id,
      author: "contact",
      kind: "text",
      body: data.body,
      delivery: "delivered",
    });
    if (mErr) throw new Error(mErr.message);

    await logAction({
      action: "ticket_created_manual",
      category: "user",
      workspaceId: data.workspaceId,
      actorUserId: context.userId,
      entity: "tickets",
      entityId: ticket.id,
      payload: {
        contact_phone: data.contactPhone,
        contact_name: data.contactName ?? null,
        sector_id: data.sectorId ?? null,
        body_preview: data.body.slice(0, 140),
      },
    });

    return { ticketId: ticket.id };
  });

// =====================================================
// deleteTicket — apaga ticket e mensagens (RLS valida)
// =====================================================
export const deleteTicket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ ticketId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: prev, error: getErr } = await supabase
      .from("tickets")
      .select("id, workspace_id, contact_id, number")
      .eq("id", data.ticketId)
      .maybeSingle();
    if (getErr) throw new Error(getErr.message);
    if (!prev) throw new Error("Atendimento não encontrado");

    const { error } = await supabase.from("tickets").delete().eq("id", data.ticketId);
    if (error) throw new Error(error.message);

    await logAction({
      action: "ticket_deleted",
      category: "user",
      workspaceId: prev.workspace_id,
      actorUserId: userId,
      entity: "tickets",
      entityId: data.ticketId,
      before: { number: prev.number, contact_id: prev.contact_id },
      after: null,
    });

    return { ok: true };
  });

// =====================================================
// previewChannel — read-only: descobre por qual canal sairia a resposta.
// Usado pelo composer pra perguntar antes de cair em fallback Meta→QR.
// =====================================================
export const previewChannel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ ticketId: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => previewSendChannel(data.ticketId));
