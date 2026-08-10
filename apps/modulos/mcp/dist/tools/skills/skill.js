// Tools MCP de Skills CentralDark.
// Fonte única: .agents/skills/ do ServerVpss/CentralDark via GitHub autenticado.
import { z } from "zod";
import { config } from "../../config.js";
import * as gh from "../github/github.js";
const SKILL_ROOT = ".agents/skills";
const SOURCE_OF_TRUTH = "ServerVpss/CentralDark";
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
function decodeFile(file) {
    if (typeof file === "string")
        return { content: file, sha: null };
    if (file?.decoded)
        return { content: file.decoded, sha: file.sha ?? null };
    if (file?.content)
        return { content: Buffer.from(file.content, "base64").toString("utf8"), sha: file.sha ?? null };
    throw new Error("GITHUB_FILE_CONTENT_UNREADABLE");
}
async function lerArquivo(token, relativePath) {
    const file = await gh.getFileContent(token, config.github.owner, config.github.repo, relativePath);
    return decodeFile(file);
}
async function listarPasta(token, relativePath) {
    const result = await gh.getFileContent(token, config.github.owner, config.github.repo, relativePath);
    return Array.isArray(result) ? result : [];
}
function stripQuotes(value) {
    return value.trim().replace(/^["']|["']$/g, "");
}
function parseFrontmatter(md) {
    const normalized = String(md || "").replace(/\r\n/g, "\n");
    const match = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
    if (!match)
        return { meta: {}, body: normalized };
    const lines = match[1].split("\n");
    const meta = {};
    for (let i = 0; i < lines.length; i += 1) {
        const kv = lines[i].match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
        if (!kv)
            continue;
        const key = kv[1];
        const raw = kv[2].trim();
        if (/^[>|][+-]?$/.test(raw)) {
            const parts = [];
            while (i + 1 < lines.length && /^\s+/.test(lines[i + 1])) {
                i += 1;
                parts.push(lines[i].trim());
            }
            meta[key] = parts.join(raw.startsWith(">") ? " " : "\n").trim();
            continue;
        }
        if (raw === "") {
            const list = [];
            while (i + 1 < lines.length) {
                const item = lines[i + 1].match(/^\s+-\s+(.+)$/);
                if (!item)
                    break;
                i += 1;
                list.push(stripQuotes(item[1]));
            }
            meta[key] = list;
            continue;
        }
        meta[key] = stripQuotes(raw);
    }
    return { meta, body: match[2] };
}
function skillPath(nome) {
    if (!/^[a-z0-9][a-z0-9-]{1,63}$/i.test(nome))
        throw new Error("SKILL_NAME_INVALID");
    return `${SKILL_ROOT}/${nome}/SKILL.md`;
}
const tools = [
    {
        name: "skill_listar",
        description: "Lista todas as skills instaladas no caminho canônico `.agents/skills/` da branch padrão viva do CentralDark. Use para descobrir capacidades e carregar somente a skill aplicável à missão.",
        annotations: { ...READ_ANNOT, title: "Listar skills CentralDark" },
        inputSchema: z.object({}),
        handler: async (_input, ctx) => {
            const entradas = await listarPasta(ctx.token, SKILL_ROOT);
            const skills = [];
            for (const entry of entradas) {
                if (entry.type !== "dir")
                    continue;
                try {
                    const file = await lerArquivo(ctx.token, `${entry.path}/SKILL.md`);
                    const { meta } = parseFrontmatter(file.content);
                    skills.push({
                        nome: meta.name ?? entry.name,
                        pasta: entry.name,
                        descricao: meta.description ?? "",
                        versao: meta.version ?? "unversioned",
                        agentes: Array.isArray(meta.agents) ? meta.agents : [],
                        canonical_path: `${entry.path}/SKILL.md`,
                        blob_sha: file.sha,
                    });
                }
                catch {
                    // Diretório sem SKILL.md não entra no catálogo executável.
                }
            }
            skills.sort((a, b) => a.pasta.localeCompare(b.pasta));
            return jsonBlock({
                ok: true,
                source_of_truth: SOURCE_OF_TRUTH,
                canonical_root: SKILL_ROOT,
                routing: "DISCOVER_ALL_LOAD_ONLY_APPLICABLE",
                total: skills.length,
                skills,
                como_carregar: "Chame skill_instalar com o nome da pasta somente quando a descrição/gatilho corresponder à missão.",
            });
        },
    },
    {
        name: "skill_instalar",
        description: "Retorna o SKILL.md canônico atual de `.agents/skills/` via GitHub autenticado. Não usa mirror, cache local ou cópia histórica.",
        annotations: { ...READ_ANNOT, title: "Carregar skill no agente" },
        inputSchema: z.object({
            nome: z.string().min(2).describe("Nome da pasta da skill em .agents/skills"),
        }),
        handler: async (input, ctx) => {
            try {
                const canonicalPath = skillPath(input.nome);
                const file = await lerArquivo(ctx.token, canonicalPath);
                const { meta } = parseFrontmatter(file.content);
                return jsonBlock({
                    ok: true,
                    source_of_truth: SOURCE_OF_TRUTH,
                    canonical_path: canonicalPath,
                    blob_sha: file.sha,
                    nome: meta.name ?? input.nome,
                    versao: meta.version ?? "unversioned",
                    descricao: meta.description ?? "",
                    agentes: Array.isArray(meta.agents) ? meta.agents : [],
                    instrucoes_para_ia_cliente: [
                        "Aplique somente quando esta skill for pertinente à missão atual.",
                        "LEIA-ME-IA.md e a governança CentralDark têm precedência.",
                        "Não crie V2/V3/cópia concorrente; revalide blob_sha antes de alegar identidade atual.",
                    ],
                    conteudo_skill_md: file.content,
                });
            }
            catch (error) {
                return textBlock(`Erro ao carregar skill '${input.nome}': ${String(error?.message || error)}`);
            }
        },
    },
    {
        name: "skill_status",
        description: "Mostra blob SHA e caminho da skill canônica atual na branch padrão do GitHub.",
        annotations: { ...READ_ANNOT, title: "Status da skill canônica" },
        inputSchema: z.object({ nome: z.string().min(2).describe("Nome da pasta da skill") }),
        handler: async (input, ctx) => {
            try {
                const canonicalPath = skillPath(input.nome);
                const file = await lerArquivo(ctx.token, canonicalPath);
                const { meta } = parseFrontmatter(file.content);
                return jsonBlock({
                    ok: true,
                    source_of_truth: SOURCE_OF_TRUTH,
                    canonical_path: canonicalPath,
                    nome: meta.name ?? input.nome,
                    versao: meta.version ?? "unversioned",
                    blob_sha: file.sha,
                });
            }
            catch (error) {
                return textBlock(`Erro ao consultar skill '${input.nome}': ${String(error?.message || error)}`);
            }
        },
    },
    {
        name: "skill_atualizar",
        description: "Relê e devolve a identidade atual da skill diretamente da branch padrão do GitHub. Sem cache e sem mirror.",
        annotations: { ...READ_ANNOT, title: "Atualizar skill pelo estado vivo" },
        inputSchema: z.object({ nome: z.string().min(2).describe("Nome da pasta da skill") }),
        handler: async (input, ctx) => {
            try {
                const canonicalPath = skillPath(input.nome);
                const file = await lerArquivo(ctx.token, canonicalPath);
                const { meta } = parseFrontmatter(file.content);
                return jsonBlock({
                    ok: true,
                    source_of_truth: SOURCE_OF_TRUTH,
                    canonical_path: canonicalPath,
                    nome: meta.name ?? input.nome,
                    versao: meta.version ?? "unversioned",
                    blob_sha: file.sha,
                    atualizada_em: new Date().toISOString(),
                    conteudo_skill_md: file.content,
                    instrucao: "Substitua a cópia anterior por esta identidade e aplique somente se pertinente à missão atual.",
                });
            }
            catch (error) {
                return textBlock(`Erro ao atualizar skill '${input.nome}': ${String(error?.message || error)}`);
            }
        },
    },
];
export const skillTools = tools;
//# sourceMappingURL=skill.js.map