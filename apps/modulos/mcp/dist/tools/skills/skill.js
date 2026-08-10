// Tools MCP de Skills CentralDark.
// Fonte única: .agents/skills/ do checkout vivo do ServerVpss/CentralDark.
import { z } from "zod";
import { getInstalledSkill, listInstalledSkills } from "../../skills-public.js";
function textBlock(text) {
    return { content: [{ type: "text", text }] };
}
function jsonBlock(obj) {
    return textBlock(JSON.stringify(obj, null, 2));
}
const READ_ANNOT = {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
};
const tools = [
    {
        name: "skill_listar",
        description: "Lista as skills instaladas no caminho canônico `.agents/skills/` do CentralDark vivo. Use para descobrir capacidades; carregue somente a skill aplicável à missão.",
        annotations: { ...READ_ANNOT, title: "Listar skills CentralDark" },
        inputSchema: z.object({}),
        handler: async () => {
            const skills = listInstalledSkills();
            return jsonBlock({
                ok: true,
                source_of_truth: "ServerVpss/CentralDark",
                canonical_root: ".agents/skills",
                routing: "DISCOVER_ALL_LOAD_ONLY_APPLICABLE",
                total: skills.length,
                skills: skills.map(({ content: _content, ...skill }) => skill),
            });
        },
    },
    {
        name: "skill_instalar",
        description: "Retorna o SKILL.md canônico de uma skill instalada em `.agents/skills/` para o cliente aplicar. Não usa mirror nem cópia histórica.",
        annotations: { ...READ_ANNOT, title: "Carregar skill no agente" },
        inputSchema: z.object({
            nome: z.string().min(2).describe("Nome da pasta da skill em .agents/skills"),
        }),
        handler: async (input) => {
            const skill = getInstalledSkill(input.nome);
            if (!skill)
                return textBlock(`Erro: skill '${input.nome}' não encontrada em .agents/skills/. Chame skill_listar para o inventário vivo.`);
            return jsonBlock({
                ok: true,
                source_of_truth: skill.source_of_truth,
                canonical_path: skill.canonical_path,
                sha256: skill.sha256,
                nome: skill.nome,
                versao: skill.versao,
                descricao: skill.descricao,
                agentes: skill.agentes,
                instrucoes_para_ia_cliente: [
                    "Use este conteúdo somente quando o gatilho/descrição da skill se aplicar à missão atual.",
                    "A skill é subordinada a LEIA-ME-IA.md e à governança CentralDark.",
                    "Não crie cópia concorrente nem V2/V3; reconsulte skill_status antes de alegar identidade atual.",
                ],
                conteudo_skill_md: skill.content,
            });
        },
    },
    {
        name: "skill_status",
        description: "Mostra identidade SHA-256, caminho e metadados da skill instalada no checkout vivo.",
        annotations: { ...READ_ANNOT, title: "Status da skill canônica" },
        inputSchema: z.object({
            nome: z.string().min(2).describe("Nome da pasta da skill"),
        }),
        handler: async (input) => {
            const skill = getInstalledSkill(input.nome);
            if (!skill)
                return textBlock(`Erro: skill '${input.nome}' não encontrada em .agents/skills/.`);
            return jsonBlock({
                ok: true,
                source_of_truth: skill.source_of_truth,
                canonical_path: skill.canonical_path,
                nome: skill.nome,
                versao: skill.versao,
                sha256: skill.sha256,
                dica: "Compare este SHA-256 com o conteúdo efetivamente carregado. Divergência = identidade não provada.",
            });
        },
    },
    {
        name: "skill_atualizar",
        description: "Relê a skill diretamente de `.agents/skills/` e devolve o conteúdo atual. Sem cache e sem mirror.",
        annotations: { ...READ_ANNOT, title: "Atualizar skill pelo estado vivo" },
        inputSchema: z.object({
            nome: z.string().min(2).describe("Nome da pasta da skill"),
        }),
        handler: async (input) => {
            const skill = getInstalledSkill(input.nome);
            if (!skill)
                return textBlock(`Erro: skill '${input.nome}' não encontrada em .agents/skills/.`);
            return jsonBlock({
                ok: true,
                source_of_truth: skill.source_of_truth,
                canonical_path: skill.canonical_path,
                nome: skill.nome,
                versao: skill.versao,
                sha256: skill.sha256,
                atualizada_em: new Date().toISOString(),
                conteudo_skill_md: skill.content,
                instrucao: "Substitua a cópia anterior por esta identidade e aplique somente se a skill for pertinente à missão atual.",
            });
        },
    },
];
export const skillTools = tools;
//# sourceMappingURL=skill.js.map