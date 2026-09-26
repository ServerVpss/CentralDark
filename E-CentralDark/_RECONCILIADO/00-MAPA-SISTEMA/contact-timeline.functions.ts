// Histórico único por contato — server fns pra UI.
// - getContactTimeline: linha do tempo unificada por contato (todos os tickets, ordem cronológica).
// - getResolvedSendChannel: descobre por qual canal a resposta vai sair (Meta/QR/fallback).
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { resolveSendChannel } from "@/lib/whatsapp-send.server";

/**
 * Timeline única por contato dentro do workspace.
 * Junta mensagens de TODOS os tickets (abertos, fechados, resolvidos, reabertos)
 * desse contato — privado apenas. Grupos ficam de fora (channel_type='private' ou null antigo).
 * Ordena por created_at ASC. Inclui status do ticket + provider real da mensagem.
 */
export const getContactTimeline = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      contactId: z.string().uuid(),
      limit: z.number().int().min(1).max(1000).optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const limit = data.limit ?? 500;

    // Descobre workspace_id via contact (passa pelo RLS do usuário).
    const { data: contact, error: cErr } = await supabase
      .from("contacts")
      .select("id, workspace_id, name, phone, avatar_url")
      .eq("id", data.contactId)
      .maybeSingle();
    if (cErr || !contact) throw new Error("Contato não encontrado ou sem acesso.");

    // Todos os tickets desse contato (operacionais), via RLS.
    const { data: tickets } = await supabase
      .from("tickets")
      .select("id, status, sector_id, assignee_id, connection_id, opened_at, resolved_at, closed_at, channel")
      .eq("workspace_id", contact.workspace_id)
      .eq("contact_id", contact.id)
      .order("opened_at", { ascending: true });

    const ticketIds = (tickets ?? []).map((t) => t.id);
    if (ticketIds.length === 0) {
      return { contact, tickets: [], messages: [] };
    }

    // Mensagens unificadas — usa admin pra evitar reaplicar RLS por linha
    // (já validamos acesso ao contato/tickets acima).
    // Timeline do contato privado = tudo que NÃO é grupo. Inclui:
    //   - 'private' (inbound antigo)
    //   - 'whatsapp' (outbound do atendente — gravado pelo sendMessage)
    //   - NULL (legado sem channel_type)
    // Antes filtrava só ('private', NULL) e as respostas do atendente sumiam.
    const { data: messagesDesc } = await supabaseAdmin
      .from("ticket_messages")
      .select("id, ticket_id, author, author_user_id, kind, body, media_url, media_mime, created_at, delivery, external_id, connection_id, provider, channel_type, is_internal_note, meta_message_type")
      .in("ticket_id", ticketIds)
      .or("channel_type.neq.group,channel_type.is.null")
      .order("created_at", { ascending: false })
      .limit(limit);
    const messages = (messagesDesc ?? []).slice().reverse();

    // Nomes das conexões usadas (pra badge META/QR mesmo se conexão sumiu).
    const connIds = Array.from(
      new Set((messages ?? []).map((m) => m.connection_id).filter((x): x is string => !!x)),
    );
    let connMap: Record<string, { id: string; name: string | null; provider: string | null }> = {};
    if (connIds.length > 0) {
      const { data: conns } = await supabaseAdmin
        .from("whatsapp_connections")
        .select("id, name, provider")
        .in("id", connIds);
      connMap = Object.fromEntries((conns ?? []).map((c) => [c.id, c]));
    }

    return {
      contact,
      tickets: tickets ?? [],
      messages: (messages ?? []).map((m) => ({
        ...m,
        connection: m.connection_id ? connMap[m.connection_id] ?? null : null,
      })),
    };
  });

export const getResolvedSendChannel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ ticketId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Confere acesso ao ticket via RLS do user (não usa admin pra esse check).
    const { data: t, error } = await supabase
      .from("tickets")
      .select("id, workspace_id, connection_id, contact:contacts(phone)")
      .eq("id", data.ticketId)
      .maybeSingle();
    if (error || !t) throw new Error("Ticket não encontrado ou sem acesso.");

    const phone = (t.contact as { phone?: string } | null)?.phone ?? "";
    if (!phone) {
      return {
        ok: false as const,
        code: "NO_CHANNEL_AVAILABLE" as const,
        message: "Contato sem telefone.",
      };
    }

    const resolved = await resolveSendChannel({
      workspaceId: t.workspace_id,
      ticketConnectionId: t.connection_id,
      contactPhone: phone,
    });

    if (!resolved.ok) return resolved;

    // Anexa metadados pra UI mostrar badge correto
    const { data: conn } = await supabaseAdmin
      .from("whatsapp_connections")
      .select("id, provider, name, status")
      .eq("id", resolved.connectionId)
      .maybeSingle();

    void userId;
    return {
      ok: true as const,
      connectionId: resolved.connectionId,
      reason: resolved.reason,
      previousConnectionId: resolved.previousConnectionId ?? null,
      provider: conn?.provider ?? null,
      connectionName: conn?.name ?? null,
    };
  });
