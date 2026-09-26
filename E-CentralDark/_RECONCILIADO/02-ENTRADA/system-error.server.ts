// Helper universal de log de erros do sistema, pra auditoria e depuração.
// Nunca lança — se falhar em gravar, só joga no console pra não derrubar a operação principal.
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type ErrorSeverity = "info" | "warning" | "error" | "critical";

export type LogSystemErrorInput = {
  area: string;                              // ex: "whatsapp.webhook", "whatsapp.send", "media.download", "ia.chat"
  severity?: ErrorSeverity;                  // padrão "error"
  message: string;                           // mensagem curta legível
  code?: string | null;                      // código do erro (HTTP, código da Meta, etc.)
  stack?: string | null;                     // pilha do erro, se houver
  context?: Record<string, unknown> | null;  // payload extra pra depuração
  workspaceId?: string | null;
  ticketId?: string | null;
  actorUserId?: string | null;
  requestId?: string | null;
};

export async function logSystemError(input: LogSystemErrorInput): Promise<void> {
  try {
    await supabaseAdmin.from("system_error_log").insert({
      workspace_id: input.workspaceId ?? null,
      ticket_id: input.ticketId ?? null,
      actor_user_id: input.actorUserId ?? null,
      severity: input.severity ?? "error",
      area: input.area,
      code: input.code ?? null,
      message: input.message.slice(0, 1000),
      stack: input.stack?.slice(0, 8000) ?? null,
      context: input.context ?? {},
      request_id: input.requestId ?? null,
    } as never);
  } catch (e) {
    // Log de erro nunca pode quebrar a operação principal.
    console.error("[logSystemError] falhou:", e, "input:", input);
  }
}

// Wrapper conveniente: roda uma função async e, se ela explodir, grava o erro e relança.
export async function captureSystemError<T>(
  meta: Omit<LogSystemErrorInput, "message" | "stack">,
  fn: () => Promise<T>,
): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    await logSystemError({
      ...meta,
      message: err?.message ?? String(err),
      stack: err?.stack ?? null,
      code: meta.code ?? err?.code ?? null,
    });
    throw err;
  }
}
