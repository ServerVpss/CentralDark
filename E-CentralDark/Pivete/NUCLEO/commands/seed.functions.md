# COMANDO - seed.functions.ts
**Origem:** E:\\CentralDark\\_MAPA_CASA\\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\apps\crm\src\lib\seed.functions.ts
**SHA:** ebce89d2587224a6
**Timestamp:** 2026-08-26T19:41:34.871654
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- system_prompt: "Você é um agente de demonstração. Seja gentil e breve.",

### Ouro Bruto (primeiros 5000 chars)
```
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
      .insert(qr.map((q) => ({ ...q, workspace_id: data.workspaceId, is_seed: true 
```