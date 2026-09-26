// Server functions do Kanban CRM (funil de vendas)
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { logAction } from "@/lib/audit.server";

const wsId = z.string().uuid();

// =====================================================
// Listar colunas + cards do funil de um workspace
// =====================================================
export const listCrmBoard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ workspaceId: wsId }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;

    const { data: columns, error: e1 } = await supabase
      .from("crm_pipeline_columns")
      .select("id, title, color, position, is_won, is_lost")
      .eq("workspace_id", data.workspaceId)
      .order("position", { ascending: true });
    if (e1) throw new Error(e1.message);

    const { data: cards, error: e2 } = await supabase
      .from("crm_cards")
      .select(`
        id, column_id, contact_id, ticket_id, title, value_cents, notes,
        assignee_id, position, created_at, updated_at,
        contacts:contact_id ( id, name, phone, avatar_url, tags, last_message_at ),
        tickets:ticket_id ( id, status, last_message_preview, last_message_at )
      `)
      .eq("workspace_id", data.workspaceId)
      .order("position", { ascending: true });
    if (e2) throw new Error(e2.message);

    return { columns: columns ?? [], cards: cards ?? [] };
  });

// =====================================================
// Contatos disponíveis pra virar card (que ainda não estão no funil)
// =====================================================
export const listContactsAvailableForCrm = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ workspaceId: wsId, search: z.string().max(120).optional() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;

    const { data: existing } = await supabase
      .from("crm_cards").select("contact_id").eq("workspace_id", data.workspaceId);
    const existingIds = (existing ?? []).map((r) => r.contact_id);

    let q = supabase
      .from("contacts")
      .select("id, name, phone, avatar_url, last_message_at")
      .eq("workspace_id", data.workspaceId)
      .order("last_message_at", { ascending: false, nullsFirst: false })
      .limit(50);

    if (existingIds.length > 0) {
      q = q.not("id", "in", `(${existingIds.join(",")})`);
    }
    if (data.search && data.search.trim()) {
      const s = `%${data.search.trim()}%`;
      q = q.or(`name.ilike.${s},phone.ilike.${s}`);
    }
    const { data: contacts, error } = await q;
    if (error) throw new Error(error.message);
    return { contacts: contacts ?? [] };
  });

// =====================================================
// Criar coluna
// =====================================================
export const createCrmColumn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      workspaceId: wsId,
      title: z.string().min(1).max(60),
      color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#3b82f6"),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: maxRow } = await supabase
      .from("crm_pipeline_columns").select("position")
      .eq("workspace_id", data.workspaceId)
      .order("position", { ascending: false }).limit(1).maybeSingle();
    const nextPos = (maxRow?.position ?? -1) + 1;

    const { data: created, error } = await supabase
      .from("crm_pipeline_columns")
      .insert({ workspace_id: data.workspaceId, title: data.title, color: data.color, position: nextPos })
      .select("id").single();
    if (error) throw new Error(error.message);

    await logAction({
      action: "crm_column_created", category: "user",
      workspaceId: data.workspaceId, actorUserId: userId,
      entity: "crm_pipeline_columns", entityId: created.id,
      after: { title: data.title, color: data.color, position: nextPos },
    });
    return { id: created.id };
  });

// =====================================================
// Atualizar coluna (título / cor)
// =====================================================
export const updateCrmColumn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      columnId: z.string().uuid(),
      title: z.string().min(1).max(60).optional(),
      color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const patch: any = {};
    if (data.title !== undefined) patch.title = data.title;
    if (data.color !== undefined) patch.color = data.color;
    const { data: row, error } = await supabase
      .from("crm_pipeline_columns").update(patch).eq("id", data.columnId)
      .select("workspace_id").single();
    if (error) throw new Error(error.message);
    await logAction({
      action: "crm_column_updated", category: "user",
      workspaceId: row.workspace_id, actorUserId: userId,
      entity: "crm_pipeline_columns", entityId: data.columnId, after: patch,
    });
    return { ok: true };
  });

// =====================================================
// Deletar coluna (cards são deletados em cascata pelo FK)
// =====================================================
export const deleteCrmColumn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ columnId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row } = await supabase
      .from("crm_pipeline_columns").select("workspace_id, title").eq("id", data.columnId).maybeSingle();
    const { error } = await supabase.from("crm_pipeline_columns").delete().eq("id", data.columnId);
    if (error) throw new Error(error.message);
    if (row) {
      await logAction({
        action: "crm_column_deleted", category: "user",
        workspaceId: row.workspace_id, actorUserId: userId,
        entity: "crm_pipeline_columns", entityId: data.columnId, before: { title: row.title },
      });
    }
    return { ok: true };
  });

// =====================================================
// Reordenar colunas
// =====================================================
export const reorderCrmColumns = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      workspaceId: wsId,
      orderedIds: z.array(z.string().uuid()).min(1),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    for (let i = 0; i < data.orderedIds.length; i++) {
      await supabase.from("crm_pipeline_columns")
        .update({ position: i }).eq("id", data.orderedIds[i]).eq("workspace_id", data.workspaceId);
    }
    return { ok: true };
  });

// =====================================================
// Criar card a partir de um contato (e ticket opcional)
// =====================================================
export const createCrmCard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      workspaceId: wsId,
      contactId: z.string().uuid(),
      columnId: z.string().uuid(),
      ticketId: z.string().uuid().optional(),
      title: z.string().max(120).optional(),
      valueCents: z.number().int().min(0).optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: maxRow } = await supabase
      .from("crm_cards").select("position")
      .eq("workspace_id", data.workspaceId).eq("column_id", data.columnId)
      .order("position", { ascending: false }).limit(1).maybeSingle();
    const nextPos = (maxRow?.position ?? -1) + 1;

    const { data: created, error } = await supabase
      .from("crm_cards")
      .insert({
        workspace_id: data.workspaceId,
        contact_id: data.contactId,
        column_id: data.columnId,
        ticket_id: data.ticketId ?? null,
        title: data.title ?? null,
        value_cents: data.valueCents ?? 0,
        position: nextPos,
      })
      .select("id").single();
    if (error) throw new Error(error.message);

    await logAction({
      action: "crm_card_created", category: "user",
      workspaceId: data.workspaceId, actorUserId: userId,
      entity: "crm_cards", entityId: created.id,
      after: { contact_id: data.contactId, column_id: data.columnId },
    });
    return { id: created.id };
  });

// =====================================================
// Importar todos os contatos que têm ticket aberto pra primeira coluna
// =====================================================
export const seedCrmFromTickets = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ workspaceId: wsId }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: firstCol } = await supabase
      .from("crm_pipeline_columns").select("id")
      .eq("workspace_id", data.workspaceId)
      .order("position", { ascending: true }).limit(1).maybeSingle();
    if (!firstCol) throw new Error("Crie uma coluna antes de importar.");

    const { data: tickets } = await supabase
      .from("tickets").select("id, contact_id")
      .eq("workspace_id", data.workspaceId)
      .in("status", ["open", "in_progress", "waiting_client"])
      .order("last_message_at", { ascending: false })
      .limit(200);

    const { data: existing } = await supabase
      .from("crm_cards").select("contact_id").eq("workspace_id", data.workspaceId);
    const existingSet = new Set((existing ?? []).map((r) => r.contact_id));

    const seen = new Set<string>();
    const rows: any[] = [];
    let pos = 0;
    for (const t of tickets ?? []) {
      if (!t.contact_id || seen.has(t.contact_id) || existingSet.has(t.contact_id)) continue;
      seen.add(t.contact_id);
      rows.push({
        workspace_id: data.workspaceId,
        contact_id: t.contact_id,
        column_id: firstCol.id,
        ticket_id: t.id,
        position: pos++,
      });
    }
    if (rows.length === 0) return { inserted: 0 };

    const { error } = await supabase.from("crm_cards").insert(rows);
    if (error) throw new Error(error.message);

    await logAction({
      action: "crm_seed_from_tickets", category: "user",
      workspaceId: data.workspaceId, actorUserId: userId,
      entity: "crm_cards", after: { inserted: rows.length },
    });
    return { inserted: rows.length };
  });

// =====================================================
// Mover card (coluna + posição)
// =====================================================
export const moveCrmCard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      cardId: z.string().uuid(),
      toColumnId: z.string().uuid(),
      toPosition: z.number().int().min(0),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: prev } = await supabase
      .from("crm_cards").select("workspace_id, column_id, position").eq("id", data.cardId).maybeSingle();
    if (!prev) throw new Error("Card não encontrado");

    const { error } = await supabase
      .from("crm_cards")
      .update({ column_id: data.toColumnId, position: data.toPosition })
      .eq("id", data.cardId);
    if (error) throw new Error(error.message);

    await logAction({
      action: "crm_card_moved", category: "user",
      workspaceId: prev.workspace_id, actorUserId: userId,
      entity: "crm_cards", entityId: data.cardId,
      before: { column_id: prev.column_id, position: prev.position },
      after: { column_id: data.toColumnId, position: data.toPosition },
    });
    return { ok: true };
  });

// =====================================================
// Atualizar card (valor, observação, título)
// =====================================================
export const updateCrmCard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      cardId: z.string().uuid(),
      title: z.string().max(120).nullable().optional(),
      valueCents: z.number().int().min(0).optional(),
      notes: z.string().max(2000).nullable().optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const patch: any = {};
    if (data.title !== undefined) patch.title = data.title;
    if (data.valueCents !== undefined) patch.value_cents = data.valueCents;
    if (data.notes !== undefined) patch.notes = data.notes;
    const { data: row, error } = await supabase
      .from("crm_cards").update(patch).eq("id", data.cardId).select("workspace_id").single();
    if (error) throw new Error(error.message);
    await logAction({
      action: "crm_card_updated", category: "user",
      workspaceId: row.workspace_id, actorUserId: userId,
      entity: "crm_cards", entityId: data.cardId, after: patch,
    });
    return { ok: true };
  });

// =====================================================
// Excluir card
// =====================================================
export const deleteCrmCard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ cardId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row } = await supabase
      .from("crm_cards").select("workspace_id").eq("id", data.cardId).maybeSingle();
    const { error } = await supabase.from("crm_cards").delete().eq("id", data.cardId);
    if (error) throw new Error(error.message);
    if (row) {
      await logAction({
        action: "crm_card_deleted", category: "user",
        workspaceId: row.workspace_id, actorUserId: userId,
        entity: "crm_cards", entityId: data.cardId,
      });
    }
    return { ok: true };
  });
