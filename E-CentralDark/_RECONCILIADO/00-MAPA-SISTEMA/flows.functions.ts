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
    const insertRow = { ...rest, name: `${orig.name} (cópia)`, active: false, created_by: userId } as never;
    const { data: row, error } = await supabase.from("chatbot_flows")
      .insert(insertRow)
      .select("id").single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

// Match + multi-step session helpers (chamados pelo webhook)
// ============================================================

type FlowRow = {
  id: string; workspace_id: string; name: string;
  trigger_type: string; keywords: string[] | null; match_mode: string;
  reply_message: string; active: boolean; priority: number;
  is_multi_step?: boolean; steps?: FlowStep[] | null; hits_count?: number;
};

function textMatchesStep(text: string, step: FlowStep): boolean {
  if (!step.expected_keywords || step.expected_keywords.length === 0) return true; // qualquer resposta avança
  const lower = text.toLowerCase().trim();
  return step.expected_keywords.some((k) => lower.includes(k.toLowerCase().trim()));
}

export async function matchFlow(workspaceId: string, text: string): Promise<FlowRow | null> {
  const { data } = await supabaseAdmin.from("chatbot_flows")
    .select("*").eq("workspace_id", workspaceId).eq("active", true)
    .order("priority", { ascending: false }).limit(200);
  if (!data) return null;
  const lower = text.toLowerCase().trim();
  for (const f of data as FlowRow[]) {
    if (f.trigger_type === "keyword") {
      const kws = f.keywords ?? [];
      const hit = kws.some((k) => {
        const kl = k.toLowerCase().trim();
        if (!kl) return false;
        if (f.match_mode === "exact") return lower === kl;
        if (f.match_mode === "starts_with") return lower.startsWith(kl);
        return lower.includes(kl);
      });
      if (hit) return f;
    }
  }
  return (data as FlowRow[]).find((f) => f.trigger_type === "fallback") ?? null;
}

/**
 * Resultado do processamento de uma mensagem no contexto multi-passo.
 * - reply: texto que o webhook deve enviar (pode ser do passo ou reply_message inicial)
 * - flow: regra disparada (para incrementar hits_count)
 * - sessionAdvanced: sinaliza se uma sessão foi criada/avançada
 */
export type FlowProcessResult = { reply: string; flow: FlowRow; sessionAdvanced: boolean } | null;

export async function processInboundForFlows(
  workspaceId: string,
  contactPhone: string,
  text: string,
): Promise<FlowProcessResult> {
  // 1) Tem sessão ativa? Avançar.
  const nowIso = new Date().toISOString();
  const { data: activeSession } = await supabaseAdmin
    .from("chatbot_sessions")
    .select("id, flow_id, current_step_id, expires_at")
    .eq("workspace_id", workspaceId)
    .eq("contact_phone", contactPhone)
    .is("finished_at", null)
    .gte("expires_at", nowIso)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (activeSession) {
    const { data: flow } = await supabaseAdmin
      .from("chatbot_flows").select("*").eq("id", activeSession.flow_id).maybeSingle();
    const f = flow as FlowRow | null;
    if (f && f.is_multi_step && Array.isArray(f.steps)) {
      const currentStep = f.steps.find((s) => s.id === activeSession.current_step_id);
      if (currentStep) {
        // 1) Branching: se o passo tem múltiplas saídas, casar a resposta com keywords de cada branch
        const lower = text.toLowerCase().trim();
        let nextStepId: string | null = null;
        const branches = Array.isArray(currentStep.branches) ? currentStep.branches : [];
        if (branches.length > 0) {
          const matched = branches.find((b) =>
            (b.keywords ?? []).some((k) => {
              const kl = k.toLowerCase().trim();
              return kl && lower.includes(kl);
            }),
          );
          if (matched?.next_step_id) nextStepId = matched.next_step_id;
        }
        // 2) Sem branch matching → fallback para next_step_id legado se a resposta combina
        if (!nextStepId && textMatchesStep(text, currentStep) && currentStep.next_step_id) {
          nextStepId = currentStep.next_step_id;
        }
        if (nextStepId) {
          const nextStep = f.steps.find((s) => s.id === nextStepId);
          if (nextStep) {
            await supabaseAdmin.from("chatbot_sessions").update({
              current_step_id: nextStep.id,
              last_interaction_at: nowIso,
              expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
              finished_at: nextStep.is_final ? nowIso : null,
            }).eq("id", activeSession.id);
            return { reply: nextStep.prompt, flow: f, sessionAdvanced: true };
          }
        }
        // 3) Não combinou → repete passo atual
        return { reply: currentStep.prompt, flow: f, sessionAdvanced: false };
      }
    }
  }

  // 2) Sem sessão ativa → match normal
  const flow = await matchFlow(workspaceId, text);
  if (!flow) return null;

  // 2a) Se for multi-passo: cria sessão no passo 0
  if (flow.is_multi_step && Array.isArray(flow.steps) && flow.steps.length > 0) {
    const firstStep = flow.steps[0];
    await supabaseAdmin.from("chatbot_sessions").insert({
      workspace_id: workspaceId,
      flow_id: flow.id,
      contact_phone: contactPhone,
      current_step_id: firstStep.id,
    });
    return { reply: firstStep.prompt, flow, sessionAdvanced: true };
  }

  // 2b) Fluxo simples
  return { reply: flow.reply_message, flow, sessionAdvanced: false };
}
