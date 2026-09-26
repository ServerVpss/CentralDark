import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const ANNOUNCEMENT_TYPES = [
  "novidade",
  "informativo",
  "manutencao",
  "atualizacao",
  "correcao",
  "aviso",
  "lembrete",
] as const;

export type AnnouncementType = (typeof ANNOUNCEMENT_TYPES)[number];

const baseInput = z.object({
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().max(5000).optional().nullable(),
  type: z.enum(ANNOUNCEMENT_TYPES),
  icon: z.string().trim().max(8).optional().nullable(),
  active: z.boolean().default(true),
  pinned: z.boolean().default(false),
  link_url: z.string().trim().url().max(500).optional().nullable(),
});

/* ───────────────────────────── LISTAR ───────────────────────────── */
export const listAnnouncements = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      type: z.enum(ANNOUNCEMENT_TYPES).optional().nullable(),
      search: z.string().trim().max(120).optional().nullable(),
      includeInactive: z.boolean().default(false),
    }).parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    let q = supabase
      .from("master_announcements")
      .select("id, title, body, type, icon, active, pinned, link_url, created_at, updated_at")
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(200);

    if (!data.includeInactive) q = q.eq("active", true);
    if (data.type) q = q.eq("type", data.type);
    if (data.search) q = q.ilike("title", `%${data.search}%`);

    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { items: rows ?? [] };
  });

/* ───────────────────────────── CRIAR (master) ───────────────────── */
export const createAnnouncement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => baseInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("master_announcements")
      .insert({ ...data, created_by: userId })
      .select()
      .single();
    if (error) throw new Error(error.message);

    await supabase.from("audit_log").insert({
      actor_user_id: userId,
      action: "admin:announcement_create",
      payload: { id: row.id, title: row.title, type: row.type },
    });
    return { item: row };
  });

/* ───────────────────────────── EDITAR (master) ──────────────────── */
export const updateAnnouncement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    baseInput.partial().extend({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { id, ...rest } = data;
    const { data: row, error } = await supabase
      .from("master_announcements")
      .update(rest)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);

    await supabase.from("audit_log").insert({
      actor_user_id: userId,
      action: "admin:announcement_update",
      payload: { id, changes: rest },
    });
    return { item: row };
  });

/* ───────────────────────────── APAGAR (master) ──────────────────── */
export const deleteAnnouncement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("master_announcements")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);

    await supabase.from("audit_log").insert({
      actor_user_id: userId,
      action: "admin:announcement_delete",
      payload: { id: data.id },
    });
    return { ok: true };
  });
