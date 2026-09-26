// Fase 2 — Backend seguro de seed/reset por workspace.
// Regras:
//  - Apenas Super Admin pode executar.
//  - Reset apaga SOMENTE linhas com is_seed = true do workspace alvo.
//  - Nunca toca em: auth.users, profiles, workspaces, workspace_members,
//    user_roles, plans, subscriptions, access_groups (mantidos como estrutura),
//    master_settings, master_announcements (globais).
//  - Tudo loga em audit_log com prefixo "admin:".
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { logAction } from "@/lib/audit.server";

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

// Ordem de exclusão respeita dependências (filhos antes dos pais).
// Tabelas com workspace_id direto:
const RESET_TABLES_DIRECT = [
  "campaign_recipients",
  "campaigns",
  "satisfaction_ratings",
  "ticket_messages",
  "tickets",
  "chatbot_flows",
  "ai_usage_log",
  "ai_agent_configs",
  "quick_replies",
  "notifications",
  "workspace_announcements",
  "whatsapp_templates",
  "whatsapp_connections",
  "sectors",
  "contacts",
  "contact_groups",
] as const;

// contact_group_members e access_group_permissions não têm workspace_id direto;
// dependem do pai. Limpamos via subquery do pai.

export const seedWorkspace = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      workspaceId: z.string().uuid(),
    })
  )
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);

    // Confirma que o workspace existe.
    const { data: ws, error: wsErr } = await supabaseAdmin
      .from("workspaces")
      .select("id, name")
      .eq("id", data.workspaceId)
      .maybeSingle();
    if (wsErr) throw new Error(wsErr.message);
    if (!ws) throw new Error("Workspace não encontrado.");

    const created: Record<string, number> = {};

    // 1) Setores demo
    const sectors = [
      { name: "Vendas (demo)", color: "#22c55e" },
      { name: "Suporte (demo)", color: "#3b82f6" },
      { name: "Financeiro (demo)", color: "#f59e0b" },
    ];
    const { data: secIns, error: secErr } = await supabaseAdmin
      .from("sectors")
      .insert(sectors.map((s) => ({ ...s, workspace_id: data.workspaceId, is_seed: true })))
      .select("id");
    if (secErr) throw new Error("Erro ao criar setores demo: " + secErr.message);
    created.sectors = secIns?.length ?? 0;

    // 2) Contatos demo
    const contacts = [
      { name: "Cliente Demo 1", phone: "+5511999990001", tags: ["demo", "lead"] },
      { name: "Cliente Demo 2", phone: "+5511999990002", tags: ["demo", "vip"] },
      { name: "Cliente Demo 3", phone: "+5511999990003", tags: ["demo"] },
      { name: "Cliente Demo 4", phone: "+5511999990004", tags: ["demo", "lead"] },
      { name: "Cliente Demo 5", phone: "+5511999990005", tags: ["demo"] },
    ];
    const { error: ctErr } = await supabaseAdmin
      .from("contacts")
      .upsert(
        contacts.map((c) => ({ ...c, workspace_id: data.workspaceId, is_seed: true })),
        { onConflict: "workspace_id,phone", ignoreDuplicates: true }
      );
    if (ctErr) throw new Error("Erro ao criar contatos demo: " + ctErr.message);
    const { data: ctIns } = await supabaseAdmin
      .from("contacts")
      .select("id")
      .eq("workspace_id", data.workspaceId)
      .in("phone", contacts.map((c) => c.phone));
    created.contacts = ctIns?.length ?? 0;

    // 3) Grupo de contatos demo
    const { data: cgIns, error: cgErr } = await supabaseAdmin
      .from("contact_groups")
      .insert({
        workspace_id: data.workspaceId,
        name: "Leads Demo",
        description: "Grupo de demonstração",
        is_seed: true,
      })
      .select("id")
      .single();
    if (cgErr) throw new Error("Erro ao criar grupo demo: " + cgErr.message);
    created.contact_groups = 1;

    if (cgIns && ctIns?.length) {
      await supabaseAdmin
        .from("contact_group_members")
        .insert(
          ctIns.map((c) => ({ group_id: cgIns.id, contact_id: c.id, is_seed: true }))
        );
      created.contact_group_members = ctIns.length;
    }

    // 4) Respostas rápidas demo
    const qr = [
      { shortcut: "/ola", body: "Olá! Como posso te ajudar hoje? (demo)" },
      { shortcut: "/preco", body: "Nosso preço inicial é R$ X. (demo)" },
      { shortcut: "/horario", body: "Atendemos de seg a sex, 9h às 18h. (demo)" },
    ];
    const { data: qrIns } = await supabaseAdmin
      .from("quick_replies")
      .insert(qr.map((q) => ({ ...q, workspace_id: data.workspaceId, is_seed: true })))
      .select("id");
    created.quick_replies = qrIns?.length ?? 0;

    // 5) Chatbot flow demo
    const { data: cbIns } = await supabaseAdmin
      .from("chatbot_flows")
      .insert({
        workspace_id: data.workspaceId,
        name: "Boas-vindas (demo)",
        trigger_type: "keyword",
        keywords: ["oi", "olá", "menu"],
        match_mode: "contains",
        reply_message: "Olá! Esse é um chatbot de demonstração. Digite 1 para vendas ou 2 para suporte.",
        bot_type: "entrada",
        priority: 100,
        is_seed: true,
      })
      .select("id");
    created.chatbot_flows = cbIns?.length ?? 0;

    // 6) Campanha demo (rascunho)
    const { data: cpIns } = await supabaseAdmin
      .from("campaigns")
      .insert({
        workspace_id: data.workspaceId,
        name: "Campanha Demo",
        channel: "whatsapp",
        status: "draft",
        message_body: "Mensagem de demonstração — não será enviada.",
        is_seed: true,
      })
      .select("id");
    created.campaigns = cpIns?.length ?? 0;

    // 7) Agente IA demo
    const { data: aiIns } = await supabaseAdmin
      .from("ai_agent_configs")
      .insert({
        workspace_id: data.workspaceId,
        name: "Agente IA Demo",
        model: "google/gemini-2.5-flash",
        temperature: 0.5,
        system_prompt: "Você é um agente de demonstração. Seja gentil e breve.",
        active: false,
        is_seed: true,
      })
      .select("id");
    created.ai_agent_configs = aiIns?.length ?? 0;

    // 8) Notificação demo
    await supabaseAdmin.from("notifications").insert({
      workspace_id: data.workspaceId,
      title: "Dados de demonstração criados",
      body: "Esses dados foram gerados pelo painel master para você testar a plataforma.",
      level: "info",
      is_seed: true,
    });
    created.notifications = 1;

    // 9) Avisos da empresa (workspace_announcements) demo
    const wsAnns = [
      { title: "Time, vamos começar! 🚀", body: "Esse é um aviso de exemplo da empresa. Edite ou apague em /app/notificacoes.", type: "novidade" as const, pinned: true },
      { title: "Horário de atendimento", body: "Lembre-se: atendemos de segunda a sexta, das 9h às 18h.", type: "informativo" as const, pinned: false },
      { title: "Treinamento de IA", body: "Próxima quinta teremos treinamento do agente de IA. Participem!", type: "lembrete" as const, pinned: false },
      { title: "Cuidado com disparos", body: "Sempre obtenha opt-in dos contatos antes de campanhas. (demo)", type: "aviso" as const, pinned: false },
    ];
    const { data: waIns } = await supabaseAdmin
      .from("workspace_announcements")
      .insert(wsAnns.map((a) => ({ ...a, workspace_id: data.workspaceId, active: true, is_seed: true })))
      .select("id");
    created.workspace_announcements = waIns?.length ?? 0;

    await logAction({
      action: "workspace_seeded",
      category: "admin",
      workspaceId: data.workspaceId,
      actorUserId: context.userId,
      entity: "workspace",
      entityId: data.workspaceId,
      payload: { created, workspace_name: ws.name },
    });

    return { ok: true, created };
  });

export const resetWorkspaceSeed = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      workspaceId: z.string().uuid(),
      confirm: z.literal("CONFIRMAR-RESET"),
    })
  )
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);

    const { data: ws, error: wsErr } = await supabaseAdmin
      .from("workspaces")
      .select("id, name")
      .eq("id", data.workspaceId)
      .maybeSingle();
    if (wsErr) throw new Error(wsErr.message);
    if (!ws) throw new Error("Workspace não encontrado.");

    const deleted: Record<string, number> = {};

    // Filhos sem workspace_id direto — limpar via subquery.
    // contact_group_members → via contact_groups is_seed
    {
      const { data: groups } = await supabaseAdmin
        .from("contact_groups")
        .select("id")
        .eq("workspace_id", data.workspaceId)
        .eq("is_seed", true);
      const ids = (groups ?? []).map((g) => g.id);
      if (ids.length) {
        const { count } = await supabaseAdmin
          .from("contact_group_members")
          .delete({ count: "exact" })
          .in("group_id", ids)
          .eq("is_seed", true);
        deleted.contact_group_members = count ?? 0;
      } else {
        deleted.contact_group_members = 0;
      }
    }

    // Tabelas diretas, na ordem (filhos antes dos pais).
    for (const tbl of RESET_TABLES_DIRECT) {
      const { count, error } = await supabaseAdmin
        .from(tbl)
        .delete({ count: "exact" })
        .eq("workspace_id", data.workspaceId)
        .eq("is_seed", true);
      if (error) {
        throw new Error(`Erro ao limpar ${tbl}: ${error.message}`);
      }
      deleted[tbl] = count ?? 0;
    }

    const total_deleted = Object.values(deleted).reduce((a, b) => a + b, 0);

    await logAction({
      action: "workspace_seed_reset",
      category: "admin",
      workspaceId: data.workspaceId,
      actorUserId: context.userId,
      entity: "workspace",
      entityId: data.workspaceId,
      payload: { deleted, total_deleted, workspace_name: ws.name },
    });

    return { ok: true, deleted, total_deleted };
  });

// Contadores de dados demo por workspace — usado pela UI master e
// pela aba "Dados de demonstração" em /app/configuracoes.
export const getWorkspaceSeedStats = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ workspaceId: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);

    const counts: Record<string, number> = {};
    for (const tbl of RESET_TABLES_DIRECT) {
      const { count } = await supabaseAdmin
        .from(tbl)
        .select("*", { count: "exact", head: true })
        .eq("workspace_id", data.workspaceId)
        .eq("is_seed", true);
      counts[tbl] = count ?? 0;
    }

    // contact_group_members via grupos seed
    const { data: groups } = await supabaseAdmin
      .from("contact_groups")
      .select("id")
      .eq("workspace_id", data.workspaceId)
      .eq("is_seed", true);
    const ids = (groups ?? []).map((g) => g.id);
    if (ids.length) {
      const { count } = await supabaseAdmin
        .from("contact_group_members")
        .select("*", { count: "exact", head: true })
        .in("group_id", ids)
        .eq("is_seed", true);
      counts.contact_group_members = count ?? 0;
    } else {
      counts.contact_group_members = 0;
    }

    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    return { counts, total };
  });

// Lista resumida de workspaces para a UI de seed/reset.
export const adminListWorkspacesForSeed = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("workspaces")
      .select("id, name, slug, created_at")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);

    // Conta seed por workspace via contacts (referência rápida).
    const ids = (data ?? []).map((w) => w.id);
    const seedMap = new Map<string, number>();
    if (ids.length) {
      const { data: rows } = await supabaseAdmin
        .from("contacts")
        .select("workspace_id")
        .in("workspace_id", ids)
        .eq("is_seed", true);
      for (const r of rows ?? []) {
        seedMap.set(r.workspace_id as string, (seedMap.get(r.workspace_id as string) ?? 0) + 1);
      }
    }

    return (data ?? []).map((w) => ({
      ...w,
      seed_contacts_count: seedMap.get(w.id) ?? 0,
    }));
  });
