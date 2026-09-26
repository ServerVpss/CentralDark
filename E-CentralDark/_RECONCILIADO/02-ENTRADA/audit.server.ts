// Helper universal de auditoria. Padroniza inserts em audit_log com diff antes/depois.
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type AuditCategory = "user" | "admin" | "system" | "cron" | "security";

export type LogActionInput = {
  action: string;                       // ex: "plan_updated", "landing_edited"
  category: AuditCategory;              // prefixo lógico
  workspaceId?: string | null;
  actorUserId?: string | null;
  entity?: string | null;               // tabela/recurso
  entityId?: string | null;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  payload?: Record<string, unknown> | null;
};

function diffObjects(before: Record<string, unknown> | null | undefined, after: Record<string, unknown> | null | undefined) {
  if (!before) return after ?? null;
  if (!after) return before;
  const out: Record<string, unknown> = {};
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const k of keys) {
    if (JSON.stringify(before[k]) !== JSON.stringify(after[k])) {
      out[k] = { from: before[k] ?? null, to: after[k] ?? null };
    }
  }
  return Object.keys(out).length ? out : null;
}

export async function logAction(input: LogActionInput): Promise<void> {
  try {
    const action = `${input.category}:${input.action}`;
    const diff = diffObjects(input.before, input.after);
    await supabaseAdmin.from("audit_log").insert({
      workspace_id: input.workspaceId ?? null,
      actor_user_id: input.actorUserId ?? null,
      action,
      category: input.category,
      entity: input.entity ?? null,
      entity_id: input.entityId ?? null,
      before: input.before ?? null,
      after: input.after ?? null,
      diff,
      payload: input.payload ?? {},
    } as never);
  } catch (e) {
    // Auditoria nunca pode quebrar a operação principal
    console.error("[logAction] failed:", e);
  }
}
