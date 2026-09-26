import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Colunas seguras (sem tokens/secrets). Whitelist explícita.
const CONNECTION_COLUMNS = [
  "id","workspace_id","name","phone","status","provider",
  "display_phone_number","display_name","country_code",
  "connection_mode","onboarding_mode","default_sector_id","default_assignee_id",
  "phone_number_id","waba_id","meta_app_id",
  "baileys_session_id","baileys_server_url",
  "quality_rating","messaging_tier",
  "created_at","updated_at","last_webhook_at",
].join(",");

const CONTACT_COLUMNS = [
  "id","workspace_id","phone","ddi","name","last_name","nickname","email",
  "avatar_url","tags","notes","blocked","ignored","label",
  "document_type","document_number","birthday","source","status",
  "assignee_id","channel_ids","push_name","last_message_at","created_at","updated_at",
].join(",");

const TICKET_COLUMNS = [
  "id","workspace_id","contact_id","sector_id","assignee_id","channel","channel_type",
  "status","priority","subject","last_message_preview","last_message_at","unread_count",
  "opened_at","first_response_at","resolved_at","closed_at",
  "phone_number_id","connection_id","number","chat_id","created_at","updated_at",
].join(",");

const TICKET_MESSAGE_COLUMNS = [
  "id","workspace_id","ticket_id","author","author_user_id","kind","body",
  "is_internal_note","delivery","external_id","connection_id","created_at",
].join(",");

async function assertSuperAdmin(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "super_admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Acesso negado: apenas Super Admin.");
}

async function getWorkspaceOrThrow(workspaceId: string) {
  const { data, error } = await supabaseAdmin
    .from("workspaces")
    .select("id,name,slug,owner_id,created_at")
    .eq("id", workspaceId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Workspace não encontrado.");
  return data;
}

// Lista workspaces pra escolher no dropdown
export const listWorkspacesForExport = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("workspaces")
      .select("id,name,slug,created_at")
      .order("name", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

// Contagem prévia (preview) — sem trazer os dados ainda
export const previewWorkspaceExport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ workspaceId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    const ws = await getWorkspaceOrThrow(data.workspaceId);

    const [conns, contacts, tickets, messages] = await Promise.all([
      supabaseAdmin.from("whatsapp_connections")
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", data.workspaceId),
      supabaseAdmin.from("contacts")
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", data.workspaceId)
        .not("phone", "ilike", "%@g.us"),
      supabaseAdmin.from("tickets")
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", data.workspaceId)
        .eq("channel_type", "private"),
      supabaseAdmin.from("ticket_messages")
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", data.workspaceId)
        .eq("kind", "text"),
    ]);

    return {
      workspace: ws,
      counts: {
        connections: conns.count ?? 0,
        contacts: contacts.count ?? 0,
        tickets: tickets.count ?? 0,
        messages: messages.count ?? 0,
      },
    };
  });

// Export completo — devolve os JSONs em memória
export const exportWorkspaceData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    workspaceId: z.string().uuid(),
    maxMessages: z.number().min(100).max(50000).optional().default(20000),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    const ws = await getWorkspaceOrThrow(data.workspaceId);

    // Conexões (sem segredos)
    const { data: connectionsRaw, error: connErr } = await supabaseAdmin
      .from("whatsapp_connections")
      .select(CONNECTION_COLUMNS)
      .eq("workspace_id", data.workspaceId);
    if (connErr) throw new Error(connErr.message);
    const connections = connectionsRaw ?? [];

    // Contatos privados (sem grupos)
    const { data: contactsRaw, error: cErr } = await supabaseAdmin
      .from("contacts")
      .select(CONTACT_COLUMNS)
      .eq("workspace_id", data.workspaceId)
      .not("phone", "ilike", "%@g.us")
      .order("created_at", { ascending: true });
    if (cErr) throw new Error(cErr.message);
    const contacts = contactsRaw ?? [];

    const contactIds = contacts.map((c: any) => c.id);

    // Tickets privados desses contatos
    let tickets: any[] = [];
    if (contactIds.length > 0) {
      const { data: t = [], error: tErr } = await supabaseAdmin
        .from("tickets")
        .select(TICKET_COLUMNS)
        .eq("workspace_id", data.workspaceId)
        .eq("channel_type", "private")
        .in("contact_id", contactIds);
      if (tErr) throw new Error(tErr.message);
      tickets = t ?? [];
    }

    const ticketIds = tickets.map((t) => t.id);

    // Mensagens (só texto, sem mídia) — limitadas
    let messages: any[] = [];
    let messagesTruncated = false;
    if (ticketIds.length > 0) {
      const { data: m = [], error: mErr, count } = await supabaseAdmin
        .from("ticket_messages")
        .select(TICKET_MESSAGE_COLUMNS, { count: "exact" })
        .eq("workspace_id", data.workspaceId)
        .eq("kind", "text")
        .in("ticket_id", ticketIds)
        .order("created_at", { ascending: true })
        .limit(data.maxMessages);
      if (mErr) throw new Error(mErr.message);
      messages = m ?? [];
      messagesTruncated = (count ?? 0) > messages.length;
    }

    // Log de mensagens whatsapp (auditoria do envio)
    const { data: messageLog = [] } = await supabaseAdmin
      .from("whatsapp_message_log")
      .select("id,workspace_id,connection_id,direction,status,created_at,phone_e164")
      .eq("workspace_id", data.workspaceId)
      .order("created_at", { ascending: false })
      .limit(5000);

    // Registra auditoria
    await supabaseAdmin.from("audit_log").insert({
      workspace_id: data.workspaceId,
      actor_user_id: context.userId,
      action: "admin:export_workspace",
      category: "migration",
      entity: "workspace",
      entity_id: data.workspaceId,
      payload: {
        counts: {
          connections: connections.length,
          contacts: contacts.length,
          tickets: tickets.length,
          messages: messages.length,
          message_log: (messageLog ?? []).length,
        },
        truncated: messagesTruncated,
      },
    });

    const readme = buildReadme({
      workspace: ws,
      counts: {
        connections: connections.length,
        contacts: contacts.length,
        tickets: tickets.length,
        messages: messages.length,
      },
      truncated: messagesTruncated,
    });

    return {
      generatedAt: new Date().toISOString(),
      workspace: ws,
      files: {
        "workspace.json": ws,
        "whatsapp_connections.json": connections,
        "contacts.json": contacts,
        "tickets.json": tickets,
        "ticket_messages.json": messages,
        "whatsapp_message_log.json": messageLog ?? [],
      },
      readme,
      truncated: messagesTruncated,
    };
  });

function buildReadme(args: {
  workspace: any;
  counts: { connections: number; contacts: number; tickets: number; messages: number };
  truncated: boolean;
}) {
  return `# Importação MultiZap → outro CRM

Exportado em: ${new Date().toISOString()}
Workspace de origem: ${args.workspace.name} (${args.workspace.id})

## Resumo
- Conexões WhatsApp: ${args.counts.connections}
- Contatos privados: ${args.counts.contacts}
- Tickets privados: ${args.counts.tickets}
- Mensagens (texto): ${args.counts.messages}${args.truncated ? " (TRUNCADO — limite atingido)" : ""}

## O que está incluído
- Conexões WhatsApp SEM tokens/secrets (access_token, app_secret, session_data, verify_token foram removidos)
- Contatos privados (telefones com @g.us foram filtrados — sem grupos)
- Tickets do tipo "private" desses contatos
- Mensagens de texto desses tickets (sem mídia/áudio/imagem)
- Log de envio (últimos 5000 registros) pra auditoria

## O que NÃO está incluído (por segurança/escopo)
- Grupos do WhatsApp e suas conversas (vão sincronizar pelo Gateway depois)
- Mídias (imagens, áudios, vídeos, documentos)
- Tokens, secrets, session_data, webhooks, chaves PIX
- Configurações específicas do MultiZap (planos, branding, RLS)
- Outros workspaces

## Ordem de importação sugerida
1. workspace.json — criar/mapear o workspace no destino
2. whatsapp_connections.json — recriar as conexões. ATENÇÃO: tokens precisam ser reconfigurados no destino (não vieram aqui).
3. contacts.json — importar contatos. Mapear campos:
   - phone, ddi, name → equivalentes no destino
   - tags (text[]) → adaptar formato se necessário
   - assignee_id → remapear pra usuário do destino
4. tickets.json — recriar tickets. Mapear:
   - contact_id → id novo do contato no destino
   - status, priority, channel → adaptar enums
5. ticket_messages.json — importar mensagens. Mapear:
   - ticket_id → id novo do ticket no destino
   - author (contact|agent|system) → adaptar
   - kind = "text" sempre
6. whatsapp_message_log.json — opcional, só pra histórico de auditoria

## Próximo passo (Gateway fanout)
Pra os dois CRMs receberem mensagens novas ao mesmo tempo do WhatsApp,
o agente do MultiZap precisa configurar a variável MULTIZAP_WEBHOOK_URLS
no Gateway (separada por vírgula). Isso requer autorização explícita do
dono via a frase "AUTORIZO MEXER NO GATEWAY/WUZAPI".

Enquanto isso, este export traz o histórico até a data de geração acima.
`;
}
