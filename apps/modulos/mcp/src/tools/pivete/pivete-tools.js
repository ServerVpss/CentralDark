// Ferramentas temporárias para Pivete
import { z } from "zod";

function ok(data) {
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

export const piveteTools = [
    {
        name: "teste_temporario_pivete",
        description: "Ferramenta temporária para testes rápidos solicitados por Pivete. Use com responsabilidade.",
        annotations: { 
            readOnlyHint: true, 
            destructiveHint: false, 
            idempotentHint: true, 
            openWorldHint: false, 
            title: "Teste Temporário Pivete" 
        },
        inputSchema: z.object({
            mensagem: z.string().optional().describe("Mensagem de teste opcional"),
            timestamp: z.boolean().optional().describe("Incluir timestamp na resposta"),
        }),
        handler: async (input) => {
            const response = {
                status: "OK",
                ferramenta: "teste_temporario_pivete",
                mensagem: input.mensagem || "Teste executado com sucesso",
                timestamp: input.timestamp ? new Date().toISOString() : undefined,
                versao: "1.0.0",
                autor: "Pivete",
            };
            return ok(response);
        },
    },
];
//# sourceMappingURL=pivete-tools.js.map
