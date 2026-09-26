import type { ClassifiedIntent } from "../core/intent";
import { redact } from "../core/redaction";
import type { SolSettings } from "./settings";

export interface SolReply {
  text: string;
  receipt?: Record<string, unknown>;
  source: "gateway" | "local";
}

export async function askSol(
  message: string,
  classified: ClassifiedIntent,
  settings: SolSettings,
  signal?: AbortSignal,
): Promise<SolReply> {
  if (!settings.gatewayUrl) return localFallback(message, classified);

  const response = await fetch(settings.gatewayUrl, {
    method: "POST",
    signal,
    headers: {
      "content-type": "application/json",
      ...(settings.gatewayKey ? { "x-api-key": settings.gatewayKey } : {}),
    },
    body: JSON.stringify({
      message,
      intent: classified.intent,
      risk: classified.risk,
      client: "sol-desktop-poc",
      request_id: crypto.randomUUID(),
    }),
  });

  if (!response.ok) {
    throw new Error(`Gateway respondeu HTTP ${response.status}`);
  }

  const data = (await response.json()) as Record<string, unknown>;
  const text = typeof data.text === "string" ? data.text : "Resposta recebida sem campo text.";
  return {
    text,
    receipt: redact(data.receipt ?? data) as Record<string, unknown>,
    source: "gateway",
  };
}

export function localFallback(message: string, classified: ClassifiedIntent): SolReply {
  if (classified.intent === "STOP_ALL") {
    return { text: "Interrupção local acionada. Nenhuma nova execução será iniciada.", source: "local" };
  }
  if (classified.intent === "STATUS_READONLY") {
    return {
      text: "O miniapp está ativo. O gateway read-only ainda precisa ser conectado para medir branch, HEAD, testes e bloqueadores reais.",
      receipt: { intent: classified.intent, mode: "LOCAL_DEMO", mutation: false },
      source: "local",
    };
  }
  if (classified.intent === "OPEN_MODULE") {
    return {
      text: `Abrindo a superfície ${classified.module ?? "solicitada"}. Nesta prova o módulo é visual e não executa mutações.`,
      receipt: { module: classified.module, mutation: false },
      source: "local",
    };
  }
  return {
    text: `Eu ouvi: “${message}”. O laço local está funcionando; conecte o Gateway CentralDark para orquestração real.`,
    source: "local",
  };
}
