// ============================================================================
//  Tools GEMINI — cérebro auxiliar de leitura rápida (Google Gemini via API)
// ----------------------------------------------------------------------------
//  Dá ao MCP a "leitura vasta e rápida" do Gemini como FERRAMENTA: jogar um
//  texto grande e pedir resumo/análise, ou uma pergunta rápida e barata.
//  A key vem de GEMINI_API_KEY (env do processo OU, fallback, do .env do MCP).
//  A key é usada só internamente — NUNCA é retornada/logada.
// ============================================================================
import { z } from "zod";
import { readFile } from "fs/promises";
import path from "path";
import { config } from "../../config.js";

function ok(data) {
    return { content: [{ type: "text", text: typeof data === "string" ? data : JSON.stringify(data, null, 2) }] };
}

// Lê a key: prioriza o ambiente; se faltar, lê a linha GEMINI_API_KEY do .env do MCP.
async function geminiKey() {
    if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
    try {
        const envPath = path.join(config.vps.repoPath, "apps/modulos/mcp/.env");
        const env = await readFile(envPath, "utf8");
        const m = env.match(/^GEMINI_API_KEY=(.+)$/m);
        return m ? m[1].trim().replace(/^["']|["']$/g, "") : null;
    } catch {
        return null;
    }
}

const API = "https://generativelanguage.googleapis.com/v1beta/models";
// "latest" acompanha sempre o flash mais novo (2026: 2.5-flash) — não desatualiza.
const MODELO_PADRAO = "gemini-flash-latest";

export const geminiTools = [
    {
        name: "gemini_analisar",
        description: "Usa o Google Gemini (leitura rápida e vasta) para analisar, resumir ou responder sobre um texto/pergunta. Cérebro auxiliar: jogue um texto grande e peça resumo, ou faça uma pergunta de conhecimento geral de forma rápida e barata. Complementa o Claude/Elite Gateway. Modelo padrão gemini-flash-latest.",
        annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: true, title: "Gemini — analisar/resumir" },
        inputSchema: z.object({
            prompt: z.string().min(1).describe("O texto ou pergunta a enviar ao Gemini"),
            modelo: z.string().optional().describe("Modelo Gemini (padrão: gemini-flash-latest). Ex.: gemini-2.5-pro, gemini-2.0-flash"),
        }),
        handler: async (input) => {
            const key = await geminiKey();
            if (!key) return ok({ erro: "GEMINI_API_KEY não encontrada (nem no ambiente, nem no .env do MCP)." });
            const modelo = input.modelo || MODELO_PADRAO;
            try {
                const res = await fetch(`${API}/${modelo}:generateContent?key=${key}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ contents: [{ parts: [{ text: input.prompt }] }] }),
                    signal: AbortSignal.timeout(60_000),
                });
                if (!res.ok) {
                    const b = await res.text().catch(() => "");
                    return ok({ erro: `HTTP ${res.status}`, detalhe: b.slice(0, 300) });
                }
                const data = await res.json();
                const texto = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ?? "(sem resposta)";
                return ok({ modelo, resposta: texto });
            } catch (e) {
                return ok({ erro: e.message });
            }
        },
    },
    {
        name: "gemini_status",
        description: "Verifica se a integração com o Google Gemini está funcionando (key presente + API responde). Não expõe a key.",
        annotations: { readOnlyHint: true, destructiveHint: false, title: "Gemini — status" },
        inputSchema: z.object({}),
        handler: async () => {
            const key = await geminiKey();
            if (!key) return ok({ ok: false, motivo: "sem GEMINI_API_KEY" });
            try {
                const res = await fetch(`${API}?key=${key}`, { signal: AbortSignal.timeout(15_000) });
                return ok({ ok: res.ok, http: res.status, key: "presente (oculta)" });
            } catch (e) {
                return ok({ ok: false, erro: e.message });
            }
        },
    },
];
