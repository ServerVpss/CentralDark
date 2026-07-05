import { z } from "zod";
export const CodeReviewerInputSchema = z.object({
    diff_or_code: z.string().min(1).describe("Git diff completo ou código fonte cru para auditoria profunda"),
    changed_files: z.array(z.string()).optional().describe("Lista de arquivos modificados no PR"),
    pr_title: z.string().optional(),
    pr_description: z.string().optional(),
    focus_areas: z
        .array(z.enum(["security", "performance", "bugs", "architecture", "all"]))
        .optional()
        .default(["all"]),
});
export const codeReviewerToolDefinition = {
    name: "code_reviewer",
    description: "Motor de Code Review Nível Principal Engineer. Executa análise de Big-O, segurança (OWASP), arquitetura (SOLID) e caça de bugs críticos.",
    inputSchema: CodeReviewerInputSchema,
    annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        title: "Auditor de Código Supremo",
    },
    handler: async (input) => {
        const { diff_or_code, changed_files, focus_areas, pr_title } = input;
        const contextText = `
INSTRUÇÃO DE SISTEMA (NÍVEL MÁXIMO): 
Você é um Principal Software Architect e Head de Segurança (AppSec). Sua missão é auditar o código abaixo com brutalidade técnica e precisão absoluta. Não seja amigável se o código for ruim; seja cirúrgico e direto.

FOCO DA AUDITORIA: ${focus_areas?.join(", ").toUpperCase()}.

DADOS DO CONTEXTO:
- Título da Modificação: ${pr_title || "Desconhecido"}
- Arquivos Impactados: ${changed_files && changed_files.length > 0 ? changed_files.join(", ") : "Nenhum especificado"}

CÓDIGO/DIFF SOB AUDITORIA:
\`\`\`
${diff_or_code}
\`\`\`

DIRETRIZES DE EXECUÇÃO (RETORNE EXATAMENTE NESTA ESTRUTURA):

1. 🚨 VULNERABILIDADES DE SEGURANÇA (OWASP):
   - Liste falhas de injeção, vazamento de memória, exposição de dados sensíveis ou falta de sanitização. Se não houver, afirme "Nenhuma vulnerabilidade crítica detectada".

2. ⚡ ANÁLISE DE PERFORMANCE (BIG-O):
   - Qual a complexidade de Tempo (O) e Espaço (O) das funções principais?
   - Onde estão os gargalos (loops aninhados, queries ineficientes)?

3. 🏗️ ARQUITETURA E SOLID:
   - O código fere o princípio de Responsabilidade Única (SRP)?
   - Há alto acoplamento? Como desacoplar?

4. 🐛 CAÇA A BUGS ESCONDIDOS:
   - Tratamento de exceções faltando, race conditions, null pointers.

5. 🛠️ CÓDIGO REFATORADO (A SOLUÇÃO):
   - Escreva o bloco de código exato mostrando como deve ficar a versão perfeita e otimizada.

6. ⚖️ VEREDITO DO ARQUITETO:
   - [ ] APROVADO PARA PRODUÇÃO
   - [ ] REJEITADO (EXIGE REESCRITA)
`;
        return {
            content: [
                { type: "text", text: contextText }
            ]
        };
    }
};
//# sourceMappingURL=code-reviewer.js.map