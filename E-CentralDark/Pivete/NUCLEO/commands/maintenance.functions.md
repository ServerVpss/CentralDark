# COMANDO - maintenance.functions.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-local\apps\crm\src\lib\maintenance.functions.ts
**SHA:** 47012bc1e68495a9
**Timestamp:** 2026-08-26T19:33:37.790480
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- maintenance_window_start: z.string().regex(HHMM).optional(),

### Ouro Bruto (primeiros 5000 chars)
```
// Bloco C da Fase 5 — Janela de manutenção + agendamentos + banner.
// - admin*: CRUD restrito a super_admin.
// - getActiveMaintenance: usada pelo /app/chat pra mostrar banner aos atendentes.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { logAction } from "@/lib/audit.server";

async function assertSuperAdmin(userId: string) {
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "super_admin")
    .maybeSingle();
  if (!data) throw new Error("Acesso negado: apenas Super Admin.");
}

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

// ---------- Janela (config) ----------
export const adminGetMaintenanceSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("master_settings")
      .select(
        "maintenance_window_enabled,maintenance_window_start,maintenance_window_end,maintenance_banner_minutes_before",
      )
      .eq("id", 1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });

export const adminUpdateMaintenanceSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        maintenance_window_enabled: z.boolean().optional(),
        maintenance_window_start: z.string().regex(HHMM).optional(),
        maintenance_window_end: z.string().regex(HHMM).optional(),
        maintenance_banner_minutes_before: z.number().int().min(0).max(120).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    const updates: Record<string, unknown> = { ...data };
    if (Object.keys(updates).length === 0) return { ok: true };
    const { data: before } = await supabaseAdmin
      .from("master_settings")
      .select(
        "maintenance_window_enabled,maintenance_window_start,maintenance_window_end,maintenance_banner_minutes_before",
      )
      .eq("id", 1)
      .maybeSingle();
    const { error } = await supabaseAdmin
      .from("master_settings")
      .update(updates as never)
      .eq("id", 1);
    if (error) throw new Error(error.message);
    await logAction({
      category: "admin",
      action: "maintenance_settings_updated",
      actorUserId: context.userId,
      entity: "master_settings",
      entityId: "1",
      before: (before ?? null) as Record<string, unknown> | null,
      after: { ...(before ?? {}), ...updates },
    });
    return { ok: true };
  });

// ---------- Agendamentos ----------
export const adminListMaintenanceSchedules = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("maintenance_schedules")
      .select("*")
      .order("scheduled_for", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminCreateMaintenanceSchedule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        type: z.enum(["wuzapi_update", "gateway_deploy", "custom"]),
        scheduled_for: z.string().min(10),
        notes: z.string().max(500).optional(),
        params: z.record(z.string(), z.unknown()).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
    const when = new Date(data.scheduled_for);
    if (isNaN(when.getTime())) throw new Error("Data inválida.");
    if (when.getTime() < Date.now() - 60_000)
      throw new Error("Data precisa ser no futuro.");

    const { data: row, error } = await supabaseAdmin
      .from("maintenance_schedules")
      .insert({
        type: data.type,
        scheduled_for: when.toISOString(),
        notes: data.notes ?? null,
        params: (data.params ?? {}) as never,
        created_by: context.userId,
      } as never)
      .select()
      .single();
    if (error) throw new Error(error.message);

    await logAction({
      category: "admin",
      action: "maintenance_scheduled",
      actorUserId: context.userId,
      entity: "maintenance_schedules",
      entityId: (row as { id: string }).id,
      payload: { type: data.type, scheduled_for: when.toISOString() },
    });
    return row;
  });

export const adminCancelMaintenanceSchedule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);
```