// Helper compartilhado pro Lovable AI Gateway.
// Servidor-only — não importar em código de browser.

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export type AIGatewayCallInput = {
  model?: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
};

export type AIGatewayCallResult = {
  text: string;
  model: string;
  usage?: { promptTokens?: number; completionTokens?: number; totalTokens?: number };
};

const DEFAULT_MODEL = "openai/gpt-5.5";

// Modelos de "reasoning" (raciocínio) só aceitam temperature padrão (1).
// Se mandar outro valor, o gateway devolve 400. Então pra esses, só enviamos
// temperature se for exatamente 1.
function isReasoningModel(model: string): boolean {
  return /^openai\/(gpt-5|o1|o3)/i.test(model);
}

export async function callLovableAI(input: AIGatewayCallInput): Promise<AIGatewayCallResult> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) {
    throw new Error("LOVABLE_API_KEY ausente. Recursos de IA estão fora do ar — avise o suporte.");
  }

  const model = input.model ?? DEFAULT_MODEL;

  const includeTemperature =
    typeof input.temperature === "number" &&
    (!isReasoningModel(model) || input.temperature === 1);

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: input.messages,
      ...(includeTemperature ? { temperature: input.temperature } : {}),
      ...(typeof input.maxTokens === "number" ? { max_tokens: input.maxTokens } : {}),
    }),
  });

  if (!res.ok) {
    if (res.status === 429) {
      throw new Error("A IA recebeu muitas perguntas ao mesmo tempo. Tenta de novo em 1 minuto.");
    }
    if (res.status === 402) {
      throw new Error("O saldo de IA acabou. Avise o administrador para adicionar créditos.");
    }
    const txt = await res.text().catch(() => "");
    // Log técnico no servidor (sem expor a API key — só o status e corpo de erro do gateway)
    console.error("[ai-gateway] erro HTTP", { status: res.status, model, body: txt.slice(0, 500) });
    throw new Error(`Falha na IA (${res.status}). ${txt.slice(0, 200)}`);
  }

  const json = await res.json();
  const text = (json?.choices?.[0]?.message?.content ?? "").toString();
  const usage = json?.usage
    ? {
        promptTokens: json.usage.prompt_tokens,
        completionTokens: json.usage.completion_tokens,
        totalTokens: json.usage.total_tokens,
      }
    : undefined;

  return { text, model, usage };
}

// Nome amigável do modelo pra mostrar pro usuário leigo
export function friendlyModelName(model: string): string {
  const map: Record<string, string> = {
    "openai/gpt-5.5": "GPT-5.5 (modelo top da OpenAI, raciocínio avançado)",
    "openai/gpt-5.5-pro": "GPT-5.5 Pro (versão premium pra problemas difíceis)",
    "openai/gpt-5.4": "GPT-5.4 (raciocínio avançado)",
    "openai/gpt-5": "GPT-5 (modelo principal da OpenAI)",
    "google/gemini-2.5-pro": "Gemini 2.5 Pro (modelo top do Google)",
    "google/gemini-2.5-flash": "Gemini 2.5 Flash (rápido e equilibrado)",
    "google/gemini-3-flash-preview": "Gemini 3 Flash (preview, rápido)",
  };
  return map[model] ?? model;
}
