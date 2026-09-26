// Server functions de contatos: listagem + importação CSV/XLSX.
// Segurança: requireSupabaseAuth + RLS por workspace. Workspace ativo
// resolvido sempre no servidor (nunca confiar no payload do cliente).
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { logAction } from "@/lib/audit.server";

// Limite forte por importação pra evitar abuso.
const MAX_ROWS = 5000;

// Telefone BR: aceita com/sem +, parênteses, traços, espaços. Normaliza pra E.164.
function normalizePhone(input: string | null | undefined): string | null {
  if (!input) return null;
  const onlyDigits = String(input).replace(/\D+/g, "");
  if (!onlyDigits) return null;
  // Se veio sem código do país e tem 10/11 dígitos, assume Brasil (+55).
  let withCountry = onlyDigits;
  if (onlyDigits.length === 10 || onlyDigits.length === 11) {
    withCountry = "55" + onlyDigits;
  }
  // Validação básica: entre 11 e 15 dígitos no total.
  if (withCountry.length < 11 || withCountry.length > 15) return null;
  return "+" + withCountry;
}

const rawRowSchema = z.object({
  name: z.string().trim().max(120).optional().nullable(),
  phone: z.string().trim().max(30).optional().nullable(),
  email: z.string().trim().max(255).email().optional().nullable().or(z.literal("")),
  tag: z.string().trim().max(60).optional().nullable(),
  notes: z.string().trim().max(500).optional().nullable(),
});

export type ImportRowInput = z.infer<typeof rawRowSchema>;

export type ImportRowStatus = "valid" | "duplicate" | "invalid";

export type ImportRowResult = {
  index: number;
  status: ImportRowStatus;
  error?: string;
  normalized: {
    name: string | null;
    phone: string | null;
    email: string | null;
    tag: string | null;
    notes: string | null;
  };
};

// Resolve o workspace ativo do usuário (primeiro do qual ele é membro).
// Mantém o mesmo critério usado em `useCurrentWorkspace`.
async function getActiveWorkspaceId(
  supabase: Awaited<ReturnType<typeof import("@supabase/supabase-js").createClient>>,
  userId: string,
): Promise<string> {
  const { data, error } = await (supabase as any)
    .from("workspace_members")
    .select("workspace_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data?.workspace_id) throw new Error("Você ainda não tem uma empresa ativa.");
  return data.workspace_id as string;
}

function validateAndNormalize(rows: unknown[]): ImportRowResult[] {
  const out: ImportRowResult[] = [];
  const seenInBatch = new Set<string>();
  rows.forEach((raw, i) => {
    const parsed = rawRowSchema.safeParse(raw ?? {});
    if (!parsed.success) {
      out.push({
        index: i,
        status: "invalid",
        error: parsed.error.issues[0]?.message ?? "linha inválida",
        normalized: { name: null, phone: null, email: null, tag: null, notes: null },
      });
      return;
    }
    const d = parsed.data;
    const phone = normalizePhone(d.phone ?? null);
    const name = (d.name ?? "").trim() || null;
    const email = (d.email ?? "").trim() || null;
    const tag = (d.tag ?? "").trim() || null;
    const notes = (d.notes ?? "").trim() || null;

    if (!phone) {
      out.push({
        index: i,
        status: "invalid",
        error: "telefone ausente ou inválido",
        normalized: { name, phone: null, email, tag, notes },
      });
      return;
    }
    if (!name && !email) {
      out.push({
        index: i,
        status: "invalid",
        error: "informe ao menos o nome",
        normalized: { name, phone, email, tag, notes },
      });
      return;
    }
    if (seenInBatch.has(phone)) {
      out.push({
        index: i,
        status: "duplicate",
        error: "duplicado no próprio arquivo",
        normalized: { name, phone, email, tag, notes },
      });
      return;
    }
    seenInBatch.add(phone);
    out.push({
      index: i,
      status: "valid",
      normalized: { name, phone, email, tag, notes },
    });
  });
  return out;
}

const previewSchema = z.object({
  rows: z.array(z.record(z.unknown())).max(MAX_ROWS),
});

export const previewContactImport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => previewSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const workspaceId = await getActiveWorkspaceId(supabase as never, userId);

    if (data.rows.length === 0) {
      return { workspaceId, results: [] as ImportRowResult[], stats: { valid: 0, duplicate: 0, invalid: 0, existing: 0, total: 0 } };
    }

    const results = validateAndNormalize(data.rows);

    // Cruza telefones válidos com o que já existe no banco pra marcar duplicados existentes.
    const validPhones = results.filter((r) => r.status === "valid").map((r) => r.normalized.phone!);
    let existingSet = new Set<string>();
    if (validPhones.length) {
      const { data: existing, error } = await (supabase as any)
        .from("contacts")
        .select("phone")
        .eq("workspace_id", workspaceId)
        .in("phone", validPhones);
      if (error) throw new Error(error.message);
      existingSet = new Set((existing ?? []).map((c: { phone: string }) => c.phone));
    }

    let existing = 0;
    for (const r of results) {
      if (r.status === "valid" && r.normalized.phone && existingSet.has(r.normalized.phone)) {
        r.status = "duplicate";
        r.error = "já existe nesta empresa";
        existing++;
      }
    }

    const stats = {
      total: results.length,
      valid: results.filter((r) => r.status === "valid").length,
      duplicate: results.filter((r) => r.status === "duplicate").length,
      invalid: results.filter((r) => r.status === "invalid").length,
      existing,
    };

    return { workspaceId, results, stats };
  });

const commitSchema = z.object({
  rows: z.array(z.record(z.unknown())).max(MAX_ROWS),
  filename: z.string().trim().min(1).max(255),
  fileType: z.enum(["csv", "xlsx"]),
  overwriteDuplicates: z.boolean().default(false),
});

export const commitContactImport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => commitSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const workspaceId = await getActiveWorkspaceId(supabase as never, userId);

    const results = validateAndNormalize(data.rows);

    // Abre o log de importação como "processando".
    const { data: imp, error: impErr } = await (supabase as any)
      .from("contact_imports")
      .insert({
        workspace_id: workspaceId,
        user_id: userId,
        filename: data.filename,
        file_type: data.fileType,
        total_rows: results.length,
        status: "processing",
      })
      .select("id")
      .single();
    if (impErr) throw new Error(impErr.message);
    const importId = imp.id as string;

    const sourceTag = data.fileType === "csv" ? "importacao_csv" : "importacao_xlsx";

    // Pega telefones já existentes pra decidir inserir vs atualizar.
    const validPhones = results.filter((r) => r.status === "valid").map((r) => r.normalized.phone!);
    let existingMap = new Map<string, string>(); // phone -> contact_id
    if (validPhones.length) {
      const { data: existing, error } = await (supabase as any)
        .from("contacts")
        .select("id, phone")
        .eq("workspace_id", workspaceId)
        .in("phone", validPhones);
      if (error) throw new Error(error.message);
      existingMap = new Map((existing ?? []).map((c: { id: string; phone: string }) => [c.phone, c.id]));
    }

    const errors: { index: number; error: string }[] = [];
    let created = 0;
    let updated = 0;
    let skippedDuplicate = 0;

    for (const r of results) {
      if (r.status === "invalid") {
        errors.push({ index: r.index, error: r.error ?? "inválido" });
        continue;
      }
      if (r.status === "duplicate") {
        // duplicado dentro do arquivo
        skippedDuplicate++;
        continue;
      }
      const phone = r.normalized.phone!;
      const existingId = existingMap.get(phone);
      const tagsArr = r.normalized.tag ? [r.normalized.tag] : [];

      if (existingId) {
        if (!data.overwriteDuplicates) {
          skippedDuplicate++;
          continue;
        }
        const { error } = await (supabase as any)
          .from("contacts")
          .update({
            name: r.normalized.name ?? undefined,
            email: r.normalized.email ?? undefined,
            notes: r.normalized.notes ?? undefined,
            tags: tagsArr.length ? tagsArr : undefined,
            source: sourceTag,
          })
          .eq("id", existingId)
          .eq("workspace_id", workspaceId);
        if (error) {
          errors.push({ index: r.index, error: error.message });
        } else {
          updated++;
        }
      } else {
        const { error } = await (supabase as any).from("contacts").insert({
          workspace_id: workspaceId,
          name: r.normalized.name,
          phone,
          email: r.normalized.email,
          notes: r.normalized.notes,
          tags: tagsArr,
          source: sourceTag,
        });
        if (error) {
          // Conflito de telefone único = duplicado descoberto no race
          if (String(error.message).toLowerCase().includes("duplicate")) {
            skippedDuplicate++;
          } else {
            errors.push({ index: r.index, error: error.message });
          }
        } else {
          created++;
        }
      }
    }

    // Fecha o log.
    await (supabase as any)
      .from("contact_imports")
      .update({
        valid_count: results.filter((r) => r.status === "valid").length,
        duplicate_count: results.filter((r) => r.status === "duplicate").length + skippedDuplicate,
        error_count: errors.length,
        created_count: created,
        updated_count: updated,
        status: errors.length && created === 0 && updated === 0 ? "failed" : "done",
        error_summary: errors.slice(0, 50),
        finished_at: new Date().toISOString(),
      })
      .eq("id", importId);

    await logAction({
      category: "user",
      action: "contacts_imported",
      workspaceId,
      actorUserId: userId,
      entity: "contact_imports",
      entityId: importId,
      payload: {
        filename: data.filename,
        fileType: data.fileType,
        total: results.length,
        created,
        updated,
        skippedDuplicate,
        errors: errors.length,
      },
    });

    return {
      importId,
      total: results.length,
      created,
      updated,
      skippedDuplicate,
      errors: errors.length,
    };
  });

export const listContacts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const workspaceId = await getActiveWorkspaceId(supabase as never, userId);
    const { data, error } = await (supabase as any)
      .from("contacts")
      .select(
        "id, name, last_name, nickname, birthday, ddi, phone, email, tags, label, source, status, blocked, ignored, assignee_id, channel_ids, document_type, document_number, notes, avatar_url, last_message_at, created_at",
      )
      .eq("workspace_id", workspaceId)
      // Esconde contatos-espelho de grupo (phone = JID @g.us). São donos
      // de ticket de grupo, não devem aparecer como contato privado.
      .not("phone", "ilike", "%@g.us")
      .order("created_at", { ascending: false })
      .limit(1000);
    if (error) throw new Error(error.message);

    const rows = (data ?? []) as Array<Record<string, unknown>>;

    // Busca nomes dos atendentes responsáveis (junção manual via profiles)
    const assigneeIds = Array.from(
      new Set(rows.map((r) => r.assignee_id).filter(Boolean) as string[]),
    );
    let assigneeMap = new Map<string, string>();
    if (assigneeIds.length) {
      const { data: profs } = await (supabase as any)
        .from("profiles")
        .select("id, full_name, email")
        .in("id", assigneeIds);
      assigneeMap = new Map(
        (profs ?? []).map((p: { id: string; full_name: string | null; email: string | null }) => [
          p.id,
          p.full_name || p.email || "—",
        ]),
      );
    }

    return rows.map((r) => ({
      ...r,
      assignee_name: r.assignee_id ? assigneeMap.get(r.assignee_id as string) ?? null : null,
    })) as Array<{
      id: string;
      name: string | null;
      last_name: string | null;
      nickname: string | null;
      birthday: string | null;
      ddi: string | null;
      phone: string | null;
      email: string | null;
      tags: string[];
      label: string | null;
      source: string | null;
      status: string;
      blocked: boolean;
      ignored: boolean;
      assignee_id: string | null;
      assignee_name: string | null;
      channel_ids: string[];
      document_type: string | null;
      document_number: string | null;
      notes: string | null;
      avatar_url: string | null;
      last_message_at: string | null;
      created_at: string;
    }>;
  });

// =====================================================
// createContact / updateContact / deleteContact
// =====================================================
const contactPayloadSchema = z.object({
  name: z.string().trim().max(120).optional().nullable(),
  last_name: z.string().trim().max(120).optional().nullable(),
  nickname: z.string().trim().max(120).optional().nullable(),
  birthday: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable().or(z.literal("")),
  ddi: z.string().trim().max(8).optional().nullable(),
  phone: z.string().trim().max(30).optional().nullable(),
  email: z.string().trim().max(255).email().optional().nullable().or(z.literal("")),
  document_type: z.string().trim().max(40).optional().nullable(),
  document_number: z.string().trim().max(40).optional().nullable(),
  assignee_id: z.string().uuid().optional().nullable(),
  ignored: z.boolean().optional(),
  label: z.string().trim().max(60).optional().nullable(),
  channel_ids: z.array(z.string().uuid()).max(20).optional(),
  notes: z.string().trim().max(2000).optional().nullable(),
  status: z.enum(["validated", "pending", "blocked"]).optional(),
});

export const createContact = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => contactPayloadSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const workspaceId = await getActiveWorkspaceId(supabase as never, userId);

    const phoneFull = data.phone
      ? normalizePhone(`${data.ddi ?? ""}${data.phone}`) ?? normalizePhone(data.phone)
      : null;

    const payload = {
      workspace_id: workspaceId,
      name: data.name?.trim() || null,
      last_name: data.last_name?.trim() || null,
      nickname: data.nickname?.trim() || null,
      birthday: data.birthday || null,
      ddi: data.ddi?.trim() || "+55",
      phone: phoneFull,
      email: data.email?.trim() || null,
      document_type: data.document_type?.trim() || null,
      document_number: data.document_number?.trim() || null,
      assignee_id: data.assignee_id || null,
      ignored: data.ignored ?? false,
      label: data.label?.trim() || null,
      channel_ids: data.channel_ids ?? [],
      notes: data.notes?.trim() || null,
      status: data.status ?? "validated",
      source: "manual",
    };

    const { data: created, error } = await (supabase as any)
      .from("contacts")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    await logAction({
      category: "user",
      action: "contact_create",
      entity: "contacts",
      entityId: created.id,
      workspaceId,
      actorUserId: userId,
      payload: { name: payload.name, phone: payload.phone },
    });

    return { id: created.id as string };
  });

const updateContactSchema = contactPayloadSchema.extend({
  id: z.string().uuid(),
});

export const updateContact = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => updateContactSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const phoneFull = data.phone
      ? normalizePhone(`${data.ddi ?? ""}${data.phone}`) ?? normalizePhone(data.phone)
      : null;

    const patch: Record<string, unknown> = {
      name: data.name?.trim() || null,
      last_name: data.last_name?.trim() || null,
      nickname: data.nickname?.trim() || null,
      birthday: data.birthday || null,
      ddi: data.ddi?.trim() || "+55",
      email: data.email?.trim() || null,
      document_type: data.document_type?.trim() || null,
      document_number: data.document_number?.trim() || null,
      assignee_id: data.assignee_id || null,
      ignored: data.ignored ?? false,
      label: data.label?.trim() || null,
      channel_ids: data.channel_ids ?? [],
      notes: data.notes?.trim() || null,
      status: data.status ?? "validated",
    };
    if (phoneFull) patch.phone = phoneFull;

    const { error } = await (supabase as any)
      .from("contacts")
      .update(patch)
      .eq("id", data.id);
    if (error) throw new Error(error.message);

    await logAction({
      category: "user",
      action: "contact_update",
      entity: "contacts",
      entityId: data.id,
      actorUserId: userId,
      payload: { name: patch.name, phone: patch.phone },
    });

    return { ok: true };
  });

export const deleteContact = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await (supabase as any).from("contacts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await logAction({
      category: "user",
      action: "contact_delete",
      entity: "contacts",
      entityId: data.id,
      actorUserId: userId,
    });
    return { ok: true };
  });

// =====================================================
// Auxiliares para o modal: atendentes e canais do workspace
// =====================================================
export const listWorkspaceAgents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const workspaceId = await getActiveWorkspaceId(supabase as never, userId);
    const { data: members, error } = await (supabase as any)
      .from("workspace_members")
      .select("user_id")
      .eq("workspace_id", workspaceId)
      .eq("is_active", true);
    if (error) throw new Error(error.message);
    const ids = (members ?? []).map((m: { user_id: string }) => m.user_id);
    if (!ids.length) return [] as Array<{ id: string; name: string }>;
    const { data: profs } = await (supabase as any)
      .from("profiles")
      .select("id, full_name, email")
      .in("id", ids);
    return ((profs ?? []) as Array<{ id: string; full_name: string | null; email: string | null }>)
      .map((p) => ({ id: p.id, name: p.full_name || p.email || "Sem nome" }))
      .sort((a, b) => a.name.localeCompare(b.name));
  });

export const listWorkspaceChannels = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const workspaceId = await getActiveWorkspaceId(supabase as never, userId);
    const { data, error } = await (supabase as any)
      .from("whatsapp_connections")
      .select("id, name, status")
      .eq("workspace_id", workspaceId)
      .order("name");
    if (error) throw new Error(error.message);
    return (data ?? []) as Array<{ id: string; name: string; status: string }>;
  });

// =====================================================
// Grupos de Contatos
// =====================================================
export const listContactGroups = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const workspaceId = await getActiveWorkspaceId(supabase as never, userId);
    const { data, error } = await (supabase as any)
      .from("contact_groups")
      .select("id, name, description, created_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as Array<{ id: string; name: string; description: string | null; created_at: string }>;
  });

const groupPayload = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional().nullable(),
});

export const createContactGroup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => groupPayload.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const workspaceId = await getActiveWorkspaceId(supabase as never, userId);
    const { data: created, error } = await (supabase as any)
      .from("contact_groups")
      .insert({ workspace_id: workspaceId, name: data.name, description: data.description ?? null })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    await logAction({
      category: "user",
      action: "contact_group_create",
      entity: "contact_groups",
      entityId: created.id,
      workspaceId,
      actorUserId: userId,
      payload: { name: data.name },
    });
    return { id: created.id as string };
  });

export const updateContactGroup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    groupPayload.extend({ id: z.string().uuid() }).parse(input)
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await (supabase as any)
      .from("contact_groups")
      .update({ name: data.name, description: data.description ?? null })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    await logAction({
      category: "user",
      action: "contact_group_update",
      entity: "contact_groups",
      entityId: data.id,
      actorUserId: userId,
      payload: { name: data.name },
    });
    return { ok: true };
  });

export const deleteContactGroup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await (supabase as any).from("contact_groups").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await logAction({
      category: "user",
      action: "contact_group_delete",
      entity: "contact_groups",
      entityId: data.id,
      actorUserId: userId,
    });
    return { ok: true };
  });

// =====================================================
// Ações em lote sobre contatos selecionados
// =====================================================
const bulkIdsSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(500),
});

export const bulkDeleteContacts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => bulkIdsSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const workspaceId = await getActiveWorkspaceId(supabase as never, userId);
    const { error, count } = await (supabase as any)
      .from("contacts")
      .delete({ count: "exact" })
      .in("id", data.ids)
      .eq("workspace_id", workspaceId);
    if (error) throw new Error(error.message);
    await logAction({
      category: "user",
      action: "contact_bulk_delete",
      entity: "contacts",
      workspaceId,
      actorUserId: userId,
      payload: { count: count ?? data.ids.length, ids: data.ids },
    });
    return { ok: true, deleted: count ?? data.ids.length };
  });

const bulkAssignSchema = bulkIdsSchema.extend({
  assignee_id: z.string().uuid().nullable(),
});

export const bulkAssignContacts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => bulkAssignSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const workspaceId = await getActiveWorkspaceId(supabase as never, userId);
    const { error, count } = await (supabase as any)
      .from("contacts")
      .update({ assignee_id: data.assignee_id }, { count: "exact" })
      .in("id", data.ids)
      .eq("workspace_id", workspaceId);
    if (error) throw new Error(error.message);
    await logAction({
      category: "user",
      action: "contact_bulk_assign",
      entity: "contacts",
      workspaceId,
      actorUserId: userId,
      payload: { count: count ?? data.ids.length, assignee_id: data.assignee_id, ids: data.ids },
    });
    return { ok: true, updated: count ?? data.ids.length };
  });

// =====================================================
// updateContactName — edição inline do nome do contato no inbox.
// Segurança: requireSupabaseAuth + RLS por workspace.
// =====================================================
const updateNameSchema = z.object({
  contactId: z.string().uuid(),
  name: z.string().trim().min(1, "Nome obrigatório").max(120, "Nome muito longo"),
});

export const updateContactName = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => updateNameSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Sanitização básica: tira caracteres de controle e múltiplos espaços.
    const cleanName = data.name
      .replace(/[\u0000-\u001f\u007f]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (!cleanName) throw new Error("Nome inválido");

    // Busca o contato (RLS garante que só vai voltar se o usuário tiver acesso).
    const { data: contact, error: fetchErr } = await (supabase as any)
      .from("contacts")
      .select("id, workspace_id, name")
      .eq("id", data.contactId)
      .maybeSingle();
    if (fetchErr) throw new Error(fetchErr.message);
    if (!contact) throw new Error("Contato não encontrado");

    const oldName = contact.name;
    const { error: updErr } = await (supabase as any)
      .from("contacts")
      .update({ name: cleanName })
      .eq("id", data.contactId);
    if (updErr) throw new Error(updErr.message);

    await logAction({
      category: "user",
      action: "contact_name_update",
      entity: "contacts",
      entityId: data.contactId,
      workspaceId: contact.workspace_id,
      actorUserId: userId,
      payload: { old_name: oldName, new_name: cleanName },
    });

    return { ok: true, contactId: data.contactId, name: cleanName };
  });
