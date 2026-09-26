# COMANDO - flows.functions.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-local\apps\crm\src\lib\flows.functions.ts
**SHA:** 14f0978adbf8f1d6
**Timestamp:** 2026-08-26T19:33:44.759478
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- prompt: z.string().min(1).max(2000),

### Ouro Bruto (primeiros 5000 chars)
```
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const BranchSchema = z.object({
  id: z.string().min(1).max(40),
  label: z.string().max(80).default(""),
  keywords: z.array(z.string().min(1).max(80)).max(10).default([]),
  next_step_id: z.string().nullable().default(null),
});
export type FlowBranch = z.infer<typeof BranchSchema>;

const StepSchema = z.object({
  id: z.string().min(1).max(40),
  prompt: z.string().min(1).max(2000),
  expected_keywords: z.array(z.string().min(1).max(80)).max(20).default([]),
  next_step_id: z.string().nullable().default(null),
  is_final: z.boolean().default(false),
  branches: z.array(BranchSchema).max(8).default([]),
});
export type FlowStep = z.infer<typeof StepSchema>;

const FlowInput = z.object({
  id: z.string().uuid().optional(),
  workspace_id: z.string().uuid(),
  name: z.string().min(1).max(120),
  trigger_type: z.enum(["keyword", "welcome", "fallback"]).default("keyword"),
  keywords: z.array(z.string().min(1).max(80)).max(30).default([]),
  match_mode: z.enum(["contains", "exact", "starts_with"]).default("contains"),
  reply_message: z.string().min(1).max(4000),
  sector_id: z.string().uuid().nullable().optional(),
  connection_id: z.string().uuid().nullable().optional(),
  active: z.boolean().default(true),
  priority: z.number().int().min(0).max(999).default(0),
  is_multi_step: z.boolean().default(false),
  steps: z.array(StepSchema).max(40).default([]),
  bot_type: z.enum(["entrada", "saida"]).default("entrada"),
  settings: z.record(z.string(), z.unknown()).default({}),
  graph: z.record(z.string(), z.unknown()).default({}),
});

export const listFlows = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { workspace_id?: string; scope?: "workspace" | "admin" }) => d)
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    let q = supabase.from("chatbot_flows").select("*").order("priority", { ascending: false }).order("created_at", { ascending: false });
    if (data.scope !== "admin" && data.workspace_id) q = q.eq("workspace_id", data.workspace_id);
    const { data: rows, error } = await q.limit(500);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const upsertFlow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => FlowInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const common = {
      name: data.name, trigger_type: data.trigger_type, keywords: data.keywords,
      match_mode: data.match_mode, reply_message: data.reply_message,
      sector_id: data.sector_id ?? null, connection_id: data.connection_id ?? null,
      active: data.active, priority: data.priority,
      is_multi_step: data.is_multi_step, steps: data.steps as never,
      bot_type: data.bot_type, settings: data.settings as never, graph: data.graph as never,
    };
    if (data.id) {
      const { error } = await supabase.from("chatbot_flows").update(common).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await supabase.from("chatbot_flows")
      .insert({ workspace_id: data.workspace_id, created_by: userId, ...common })
      .select("id").single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const toggleFlow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; active: boolean }) => d)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("chatbot_flows").update({ active: data.active }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteFlow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("chatbot_flows").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const duplicateFlow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: orig, error: e1 } = await supabase.from("chatbot_flows").select("*").eq("id", data.id).single();
    if (e1 || !orig) throw new Error(e1?.message ?? "Fluxo não encontrado");
    const { id: _id, created_at: _c, updated_at: _u, hits_count: _h, ...rest } = orig as Record<string, unknown>;
    void _id; void _c; void _u; void _h;
    const insertRow = { ...rest, name: `${orig.name} (cópia)`, active: fals
```