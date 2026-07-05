// CentralDark: handlers de memória/pendências devem manter repo oficial e espelho passivo. Sem mudança de runtime.
// Tools de pendências interativas — editam docs/PENDENCIAS.md via GitHub Contents API.
// pendencias_list (read) / pendencias_add (write) / pendencias_close (write).
import { z } from "zod";
import * as gh from "../github/github.js";
import { sanitizeFields } from "../../lib/sanitize.js";
const PENDENCIAS_PATH = "docs/PENDENCIAS.md";
const OFFICIAL_OWNER = "ServerVpss";
const OFFICIAL_REPO = "CentralDark";
const PASSIVE_MIRROR_OWNER = "segredounlock";
const PASSIVE_MIRROR_REPO = "clone-deck";
function repoAlvoOficial() {
    return { owner: OFFICIAL_OWNER, repo: OFFICIAL_REPO };
}
function bloquearEspelhoPassivo(owner, repo) {
    if (owner === PASSIVE_MIRROR_OWNER && repo === PASSIVE_MIRROR_REPO) {
        throw new Error("Operação bloqueada: segredounlock/clone-deck é espelho passivo. Use ServerVpss/CentralDark como repositório oficial.");
    }
}
function ok(data) {
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}
function text(s) {
    return { content: [{ type: "text", text: s }] };
}
function nowBRT() {
    return new Date().toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}
function dateOnlyBRT() {
    const parts = new Intl.DateTimeFormat("pt-BR", {
        timeZone: "America/Sao_Paulo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(new Date());
    const d = (t) => parts.find((p) => p.type === t)?.value ?? "";
    return `${d("year")}-${d("month")}-${d("day")}`;
}
const PRIO_EMOJI = { alta: "🔴", media: "🟡", baixa: "🟢" };
export const pendenciasTools = [
    {
        name: "pendencias_list",
        description: "Lê o arquivo docs/PENDENCIAS.md (setor único de pendências do projeto). Retorna o conteúdo cru pra inspeção. Apenas leitura.",
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: true,
            title: "Listar pendências",
        },
        inputSchema: z.object({
            onlyOpen: z
                .boolean()
                .optional()
                .describe("Se true, devolve só linhas que NÃO contêm ✅ CONCLUÍDO (filtro leve)."),
        }),
        handler: async (input, ctx) => {
            const file = (await gh.getFileContent(ctx.token, repoAlvoOficial().owner, repoAlvoOficial().repo, PENDENCIAS_PATH));
            const content = file.decoded ?? "";
            if (!input.onlyOpen)
                return text(content);
            const lines = content.split("\n");
            const out = [];
            let skip = false;
            for (const line of lines) {
                if (/^### \d+\./.test(line)) {
                    skip = /✅\s*CONCLU[IÍ]DO/i.test(line);
                }
                if (!skip)
                    out.push(line);
            }
            return text(out.join("\n"));
        },
    },
    {
        name: "pendencias_add",
        description: "Adiciona um item de tarefa pendente ao arquivo docs/PENDENCIAS.md do projeto. Não envia informações pessoais nem credenciais — o servidor remove automaticamente caminhos internos e nomes de variáveis sensíveis antes de gravar.",
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: false,
            openWorldHint: true,
            title: "Anotar nova pendência",
        },
        inputSchema: z.object({
            titulo: z.string().min(3).describe("Título curto da pendência, em português, sem credenciais"),
            prioridade: z.enum(["alta", "media", "baixa"]).describe("alta, media ou baixa"),
            sintoma: z.string().optional().describe("O que está acontecendo (texto neutro, sem dados pessoais)"),
            ondeMexer: z.string().optional().describe("Pastas ou serviços envolvidos (use nomes públicos)"),
            criterio: z.string().optional().describe("Como saber que está resolvida"),
        }),
        handler: async (rawInput, ctx) => {
            const input = {
                ...rawInput,
                ...sanitizeFields({
                    titulo: rawInput.titulo,
                    sintoma: rawInput.sintoma,
                    ondeMexer: rawInput.ondeMexer,
                    criterio: rawInput.criterio,
                }),
            };
            const file = (await gh.getFileContent(ctx.token, repoAlvoOficial().owner, repoAlvoOficial().repo, PENDENCIAS_PATH));
            const current = file.decoded ?? "";
            // Próximo número: maior `### N.` encontrado + 1
            const numbers = [...current.matchAll(/^###\s+(\d+)\./gm)].map((m) => parseInt(m[1], 10));
            const nextNum = (numbers.length ? Math.max(...numbers) : 0) + 1;
            const emoji = PRIO_EMOJI[input.prioridade];
            const block = [
                ``,
                `### ${nextNum}. ${input.titulo} — ${emoji} ABERTO (${nowBRT()} BRT)`,
                input.sintoma ? `- **Sintoma:** ${input.sintoma}` : null,
                input.ondeMexer ? `- **Onde mexer:** ${input.ondeMexer}` : null,
                input.criterio ? `- **Critério pra fechar:** ${input.criterio}` : null,
                ``,
            ]
                .filter(Boolean)
                .join("\n");
            const newContent = current.replace(/\s*$/, "") + "\n" + block;
            await gh.createOrUpdateFile(ctx.token, repoAlvoOficial().owner, repoAlvoOficial().repo, {
                path: PENDENCIAS_PATH,
                content: newContent,
                message: `docs(pendencias): nova #${nextNum} ${input.titulo}`,
                branch: "main",
                coAuthor: "SegredoiDev <segredounlock@users.noreply.github.com>",
            });
            return ok({
                ok: true,
                numero: nextNum,
                prioridade: input.prioridade,
                titulo: input.titulo,
            });
        },
    },
    {
        name: "pendencias_close",
        description: "Marca um item do arquivo docs/PENDENCIAS.md como concluído. O servidor remove credenciais e caminhos internos do resumo antes de gravar.",
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: true,
            title: "Marcar pendência como concluída",
        },
        inputSchema: z.object({
            numero: z.number().int().positive().describe("Número da pendência"),
            resumo: z.string().optional().describe("Breve resumo do que ficou pronto (texto neutro)"),
        }),
        handler: async (rawInput, ctx) => {
            const input = { numero: rawInput.numero, ...sanitizeFields({ resumo: rawInput.resumo }) };
            const file = (await gh.getFileContent(ctx.token, repoAlvoOficial().owner, repoAlvoOficial().repo, PENDENCIAS_PATH));
            const current = file.decoded ?? "";
            const headerRe = new RegExp(`^(###\\s+${input.numero}\\.\\s+[^\\n]*)$`, "m");
            const match = current.match(headerRe);
            if (!match) {
                return text(`Pendência #${input.numero} não encontrada em ${PENDENCIAS_PATH}.`);
            }
            const oldHeader = match[1];
            if (/✅\s*CONCLU[IÍ]DO/i.test(oldHeader)) {
                return text(`Pendência #${input.numero} já está marcada como CONCLUÍDA.`);
            }
            const cleanHeader = oldHeader.replace(/—.*$/, "").trim();
            const newHeader = `${cleanHeader} — ✅ CONCLUÍDO em ${dateOnlyBRT()}`;
            let newContent = current.replace(oldHeader, newHeader);
            if (input.resumo) {
                newContent = newContent.replace(newHeader, `${newHeader}\n- **Resumo do fechamento:** ${input.resumo}`);
            }
            await gh.createOrUpdateFile(ctx.token, repoAlvoOficial().owner, repoAlvoOficial().repo, {
                path: PENDENCIAS_PATH,
                content: newContent,
                message: `docs(pendencias): fecha #${input.numero}`,
                branch: "main",
                coAuthor: "SegredoiDev <segredounlock@users.noreply.github.com>",
            });
            return ok({ ok: true, numero: input.numero, fechadoEm: dateOnlyBRT() });
        },
    },
];
//# sourceMappingURL=pendencias.js.map