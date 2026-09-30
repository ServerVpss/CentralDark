import { z } from "zod";
import { extractAgentPatterns, getAgentObservabilityStatus, ingestAgentLogs, queryCentralLogs, } from "../../agent-observability.js";
import { getGrokControlDashboard } from "../../grok-control.js";
const READ_ONLY = Object.freeze({
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
});
function ok(payload) {
    return { content: [{ type: "text", text: JSON.stringify(payload, null, 2) }] };
}
export const observabilityTools = [
    {
        name: "agent_patterns_extract",
        description: "Extrai padrões operacionais de agentes/IA a partir do funil canônico de logs: tool calls, subagentes, delegações, cron Hermes, modelos, volume e erros. Apenas leitura; UNKNOWN não vira PASS.",
        annotations: { ...READ_ONLY, title: "Extrair padrões de agentes" },
        inputSchema: z.object({
            agent: z.string().min(1).max(160).optional().default("all").describe("Ator/superfície: all, grok, hermes, mcp ou qualquer actor observado no funil"),
            since_minutes: z.number().int().min(1).max(10080).optional().default(1440),
            limit: z.number().int().min(10).max(2000).optional().default(1200),
        }).strict(),
        handler: async (input) => ok(await extractAgentPatterns(input)),
    },
    {
        name: "centraldark_logs_query",
        description: "Consulta o log unificado sanitizado da CentralDark por setor, tag, chave, ator ou tipo de evento. Retorna somente envelopes já normalizados pelo funil; não lê secrets brutos.",
        annotations: { ...READ_ONLY, title: "Consultar logs unificados" },
        inputSchema: z.object({
            since_minutes: z.number().int().min(1).max(10080).optional().default(60),
            limit: z.number().int().min(1).max(500).optional().default(100),
            sector: z.string().min(1).max(80).optional(),
            tag: z.string().min(1).max(80).optional(),
            key: z.string().min(1).max(240).optional(),
            actor: z.string().min(1).max(160).optional(),
            kind: z.string().min(1).max(120).optional(),
            refresh: z.boolean().optional().default(true),
        }).strict(),
        handler: async (input) => {
            const ingest = input.refresh ? await ingestAgentLogs({ force: true }) : null;
            const rows = queryCentralLogs(input);
            return ok({ status: "OK", ingest, count: rows.length, rows });
        },
    },
    {
        name: "grok_mode_status",
        description: "Mostra o default Grok selecionado no Admin, catálogo de modos e fronteira de prova. Apenas leitura; SELECTED não vira ACTIVE.",
        annotations: { ...READ_ONLY, title: "Grok — modo e evidência" },
        inputSchema: z.object({}).strict(),
        handler: async () => ok(getGrokControlDashboard()),
    },
    {
        name: "centraldark_logs_status",
        description: "Mostra layout, cursor e estado do funil canônico de logs/agentes. Apenas leitura; não retorna conteúdo bruto.",
        annotations: { ...READ_ONLY, title: "Status do funil de logs" },
        inputSchema: z.object({ refresh: z.boolean().optional().default(false) }).strict(),
        handler: async ({ refresh }) => {
            const ingest = refresh ? await ingestAgentLogs({ force: true }) : null;
            return ok({ status: "OK", ingest, observability: getAgentObservabilityStatus() });
        },
    },
];
//# sourceMappingURL=agent-patterns.js.map