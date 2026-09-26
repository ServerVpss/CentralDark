// Classificação visual dos eventos de webhook da Meta.
// Regra: HTTP 200 nunca é vermelho. `accepted_no_signature` é aviso (âmbar),
// `message`/`delivered`/`sent`/`read` é sucesso (verde),
// `verify_ok` é info (azul). Erro só pra status >= 400 ou tipos de falha.

export type EventLevel = "success" | "info" | "warning" | "error";

const ERROR_TYPES = new Set([
  "signature_invalid",
  "verify_failed",
  "payload_invalid",
  "id_mismatch",
  "log_insert_error",
  "failed",
  "filtered_other_number",
]);

const SUCCESS_TYPES = new Set(["message", "delivered", "read", "sent"]);

export function classifyWebhookEvent(
  eventType: string,
  statusCode: number,
): EventLevel {
  if (statusCode >= 400) return "error";
  if (ERROR_TYPES.has(eventType)) return "error";
  if (eventType === "accepted_no_signature") return "warning";
  if (eventType === "verify_ok") return "info";
  if (SUCCESS_TYPES.has(eventType)) return "success";
  return "info";
}

export function eventLabel(eventType: string): string {
  const map: Record<string, string> = {
    message: "Mensagem recebida",
    delivered: "Mensagem entregue",
    read: "Mensagem lida",
    sent: "Mensagem enviada",
    failed: "Falha de envio",
    verify_ok: "Meta confirmou conexão",
    verify_failed: "Verificação recusada",
    accepted_no_signature: "Aceito sem assinatura",
    signature_invalid: "Assinatura inválida",
    payload_invalid: "Payload inválido",
    id_mismatch: "WABA/Phone não bate",
    log_insert_error: "Erro ao salvar",
    filtered_other_number: "Outro número descartado",
  };
  return map[eventType] ?? eventType;
}

export function eventDescription(eventType: string): string | null {
  if (eventType === "accepted_no_signature")
    return "Webhook aceito em modo compatível. App Secret opcional não configurado.";
  return null;
}

// Classes Tailwind para badge e texto do código HTTP por nível.
export const LEVEL_BADGE: Record<EventLevel, string> = {
  success: "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30",
  info: "bg-blue-500/15 text-blue-600 border border-blue-500/30",
  warning: "bg-amber-500/15 text-amber-600 border border-amber-500/30",
  error: "bg-red-500/15 text-red-600 border border-red-500/30",
};

export const LEVEL_TEXT: Record<EventLevel, string> = {
  success: "text-emerald-600",
  info: "text-blue-600",
  warning: "text-amber-600",
  error: "text-red-600",
};
