// Helper server-only para registrar uso de IA. Importar somente de server functions.
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type AiUsageInput = {
  workspaceId?: string | null;
  userId?: string | null;
  sessionId?: string | null;
  provider: string;          // 'lovable' | 'openai' | 'gemini' | 'groq' | ...
  model: string;
  operation?: string;        // 'chat' | 'embedding' | 'completion' | ...
  context?: string | null;   // ex: 'segredo_ia' | 'chatbot' | 'suggest_reply'
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  costUsd?: number;
  latencyMs?: number;
  status?: "ok" | "error" | "blocked";
  error?: string | null;
  metadata?: Record<string, unknown>;
};

export async function logAiUsage(input: AiUsageInput): Promise<void> {
  try {
    const total =
      input.totalTokens ??
      (input.promptTokens ?? 0) + (input.completionTokens ?? 0);

    await supabaseAdmin.from("ai_usage_log").insert({
      workspace_id: input.workspaceId ?? null,
      user_id: input.userId ?? null,
      session_id: input.sessionId ?? null,
      provider: input.provider,
      model: input.model,
      operation: input.operation ?? "chat",
      context: input.context ?? null,
      prompt_tokens: input.promptTokens ?? 0,
      completion_tokens: input.completionTokens ?? 0,
      total_tokens: total,
      cost_usd: input.costUsd ?? 0,
      latency_ms: input.latencyMs ?? null,
      status: input.status ?? "ok",
      error: input.error ?? null,
      metadata: (input.metadata ?? {}) as never,
    } as never);
  } catch (e) {
    console.error("[ai-usage] failed to log:", e);
  }
}
