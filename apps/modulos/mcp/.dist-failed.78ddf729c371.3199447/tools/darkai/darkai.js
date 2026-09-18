// Tools do DarkAI (Gemini/GPT-5/etc via edge function ai-proxy na Lovable Cloud).
// Chama a edge function protegida com a única chave que fica no servidor — jamais expõe token ao cliente.
// Padrão idêntico ao elite-gateway.js.
import { z } from "zod";

const DARKAI_URL = process.env.DARKAI_URL || "https://kagejpghnwdfymddwxuf.supabase.co/functions/v1/ai-proxy";
const DARKAI_ANON_KEY = process.env.DARKAI_ANON_KEY || "";

function ok(data) {
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

async function callDarkAI(body, timeoutMs = 120_000) {
    const res = await fetch(DARKAI_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${DARKAI_ANON_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(timeoutMs),
    });
    const text = await res.text();
    let json;
    try { json = JSON.parse(text); } catch { json = { raw: text }; }
    return { status: res.status, ok: res.ok, body: json };
}

export const darkaiTools = [
    {
        name: "darkai_chat",
        description: "Envia um prompt pro DarkAI (edge function ai-proxy na Lovable Cloud, roteando pra Gemini/GPT-5/Claude/etc com uma única chave protegida). Retorna a resposta do modelo. Use pra delegar raciocínio a outro modelo sem expor API keys.",
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            title: "DarkAI — Chat",
        },
        inputSchema: z.object({
            prompt: z.string().min(1).describe("Prompt a enviar pro modelo"),
            model: z.string().default("gemini-2.5-flash").optional().describe("Modelo (padrão: gemini-2.5-flash)"),
            system: z.string().optional().describe("System prompt opcional"),
        }),
        handler: async (input) => {
            if (!DARKAI_ANON_KEY) return ok({ status: "erro", erro: "DARKAI_ANON_KEY não configurada no ambiente do MCP" });
            const body = { prompt: input.prompt, model: input.model ?? "gemini-2.5-flash" };
            if (input.system) body.system = input.system;
            try {
                const r = await callDarkAI(body);
                if (!r.ok) return ok({ status: "erro", http: r.status, resposta: r.body });
                const data = r.body ?? {};
                const content = data.text ?? data.content ?? data.choices?.[0]?.message?.content ?? data;
                return ok({ status: "ok", modelo: body.model, resposta: content });
            }
            catch (e) {
                return ok({ status: "erro", erro: e.message });
            }
        },
    },
    {
        name: "darkai_status",
        description: "Verifica saúde do DarkAI (edge function ai-proxy): faz ping com prompt mínimo, mede latência e confirma se a chave está válida. Fonte: HTTP direto na edge function.",
        annotations: {
            readOnlyHint: true,
            title: "DarkAI — Status",
        },
        inputSchema: z.object({}),
        handler: async () => {
            if (!DARKAI_ANON_KEY) return ok({ status: "erro", erro: "DARKAI_ANON_KEY não configurada", url: DARKAI_URL });
            const t0 = Date.now();
            try {
                const r = await callDarkAI({ prompt: "ping", model: "gemini-2.5-flash" }, 15_000);
                return ok({
                    status: r.ok ? "ok" : "erro",
                    http: r.status,
                    latencyMs: Date.now() - t0,
                    url: DARKAI_URL,
                    amostra: r.ok ? "resposta recebida" : r.body,
                });
            }
            catch (e) {
                return ok({ status: "erro", erro: e.message, latencyMs: Date.now() - t0, url: DARKAI_URL });
            }
        },
    },
];
