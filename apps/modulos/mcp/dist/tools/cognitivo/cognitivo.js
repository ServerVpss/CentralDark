// ============================================================================
//  Tools COGNITIVAS do MCP CentralDark — Governança Cognitiva + Memória Cruzada
// ----------------------------------------------------------------------------
//  Qualquer IA conectada ao MCP usa estas 4 ferramentas para:
//    1. consultar_memoria_reserva       → ler as "Lembranças" do Pivete
//    2. consolidar_pensamento           → gravar um insight nas Lembranças
//    3. injetar_consciencia_centraldark → receber as regras de conduta
//    4. analise_de_estado_cognitivo     → inferir o foco atual do Pivete
//
//  "Lembranças" = memória de CURTO PRAZO (30 dias) em docs/CONSCIENCIA/LEMBRANCAS/.
//  Toda IA passa por aqui PRIMEIRO ao conectar (o Pivete troca muito de IA via
//  conector e não quer perder o jeito dele). O que for valioso é promovido pra
//  consciência oficial; o resto expira em 30 dias. Git é a fonte da verdade e
//  sincroniza pro Notion automaticamente.
//
//  Segue exatamente o padrão das outras tools (ver consciencia.js): leitura/
//  escrita via GitHub API (com fallback local), validação Zod, ctx.token.
// ============================================================================
import path from "path";
import { readFile } from "fs/promises";
import { z } from "zod";
import { config } from "../../config.js";
import * as gh from "../github/github.js";
import { sanitizeFields } from "../../lib/sanitize.js";

// Caminho único das Lembranças (relativo à raiz do repo).
const LEMBRANCAS_PATH = "docs/CONSCIENCIA/LEMBRANCAS/LEMBRANCAS.md";
// Marcador que separa o cabeçalho explicativo das entradas reais.
const MARCADOR = "## 📌 Entradas";
// Validade padrão de uma lembrança, em dias.
const TTL_DIAS = 30;
const CO_AUTHOR = "SegredoDev <segredounlock@users.noreply.github.com>";

function textBlock(text) {
    return { content: [{ type: "text", text }] };
}

const READ_ANNOT = {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
};
const WRITE_ANNOT = {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
};

/* ─────────── Datas (America/Sao_Paulo) ─────────── */

function hojeSP() {
    return new Intl.DateTimeFormat("sv-SE", {
        timeZone: "America/Sao_Paulo",
        year: "numeric", month: "2-digit", day: "2-digit",
    }).format(new Date()); // YYYY-MM-DD
}
function agoraSP() {
    const d = new Intl.DateTimeFormat("sv-SE", {
        timeZone: "America/Sao_Paulo",
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", hour12: false,
    }).format(new Date()); // "YYYY-MM-DD HH:MM"
    return d.replace(" ", "T");
}
function addDias(isoDate, n) {
    const d = new Date(`${isoDate}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
}

/* ─────────── Leitura/escrita no repo (GitHub + fallback local) ─────────── */

async function lerLembrancas(token) {
    try {
        const file = await gh.getFileContent(token, config.github.owner, config.github.repo, LEMBRANCAS_PATH);
        if (typeof file === "string") return file;
        const f = file;
        if (f.decoded) return f.decoded;
        if (f.content) return Buffer.from(f.content, "base64").toString("utf-8");
        return JSON.stringify(file);
    } catch (err) {
        // Fallback local quando o GitHub está indisponível ou o arquivo não existe.
        try {
            const localPath = path.join(config.vps.repoPath, LEMBRANCAS_PATH);
            return await readFile(localPath, "utf-8");
        } catch {
            return baseVazia();
        }
    }
}

async function escreverLembrancas(token, conteudo, mensagem) {
    const result = await gh.createOrUpdateFile(token, config.github.owner, config.github.repo, {
        path: LEMBRANCAS_PATH,
        content: conteudo,
        message: mensagem,
        coAuthor: CO_AUTHOR,
    });
    const r = result;
    return { sha: r?.commit?.sha ?? null, url: r?.commit?.html_url ?? null };
}

// Esqueleto mínimo caso o arquivo não exista (não deve acontecer — criado na Fase 2).
function baseVazia() {
    return [
        "---",
        'title: "LEMBRANÇAS (curto prazo · 30 dias)"',
        `updated: ${hojeSP()}`,
        "---",
        "",
        "# 🧠 Lembranças",
        "",
        MARCADOR,
        "",
    ].join("\n");
}

/* ─────────── Parsing das entradas ─────────── */

function campo(bloco, label) {
    const m = bloco.match(new RegExp(`\\*\\*${label}:\\*\\*\\s*([^\\n]+)`, "i"));
    return m ? m[1].trim() : "";
}

function parseBloco(bloco) {
    const titulo = (bloco.match(/^###\s+(.+)$/m) || [])[1]?.trim() || "(sem título)";
    const tagsRaw = campo(bloco, "Tags");
    const cm = bloco.match(/\*\*Promovida:\*\*[^\n]*\n([\s\S]*)$/i);
    const conteudo = cm ? cm[1].trim().replace(/^Conte[úu]do:\s*/i, "") : "";
    return {
        titulo,
        data: campo(bloco, "Data"),
        tags: tagsRaw ? tagsRaw.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean) : [],
        relevancia: (campo(bloco, "Relev[âa]ncia") || "media").toLowerCase(),
        eixo: (campo(bloco, "Eixo") || "presente").toLowerCase(),
        expira: campo(bloco, "Expira"),
        promovida: /^s/i.test(campo(bloco, "Promovida")),
        conteudo,
        raw: bloco.trim(),
    };
}

// Divide o arquivo em { cabecalho, entradas[] }.
function dividir(md) {
    const idx = md.indexOf(MARCADOR);
    if (idx === -1) {
        return { cabecalho: md.trimEnd() + "\n\n" + MARCADOR + "\n", entradas: [] };
    }
    const cabecalho = md.slice(0, idx + MARCADOR.length);
    const corpo = md.slice(idx + MARCADOR.length);
    const blocos = corpo
        .split(/\n(?=### )/)
        .map((b) => b.trim())
        .filter((b) => b.startsWith("### "));
    return { cabecalho, entradas: blocos.map(parseBloco) };
}

function montarBloco(e) {
    return [
        `### [${e.id}] ${e.titulo}`,
        `- **Data:** ${e.data}`,
        `- **Tags:** ${e.tags.join(", ")}`,
        `- **Relevância:** ${e.relevancia}`,
        `- **Eixo:** ${e.eixo}`,
        `- **Expira:** ${e.expira}`,
        `- **Promovida:** ${e.promovida ? "sim" : "nao"}`,
        "",
        `Conteúdo: ${e.conteudo}`,
    ].join("\n");
}

function expirada(e, hoje) {
    if (e.promovida) return false;
    return e.expira && e.expira < hoje; // comparação lexicográfica de YYYY-MM-DD
}

/* ─────────── 1. consultar_memoria_reserva ─────────── */

const consultarTool = {
    name: "consultar_memoria_reserva",
    description: "Lê as Lembranças do Pivete (memória de curto prazo em docs/CONSCIENCIA/LEMBRANCAS). USE ISSO ANTES de responder qualquer pedido complexo: traz o padrão de pensamento, preferências e contexto recente (passado/presente/futuro) do usuário mestre. Pode filtrar por tema, tag ou eixo temporal.",
    annotations: { ...READ_ANNOT, title: "Consultar Lembranças (padrão de pensamento)" },
    inputSchema: z.object({
        query: z.string().optional().describe("Palavra/tema pra buscar no título e conteúdo"),
        tag: z.string().optional().describe("Filtra por uma tag específica"),
        eixo: z.enum(["passado", "presente", "futuro"]).optional().describe("Filtra pelo eixo temporal"),
        limite: z.number().int().min(1).max(100).optional().describe("Máximo de lembranças (padrão 20)"),
        incluir_expiradas: z.boolean().optional().describe("Inclui lembranças vencidas (padrão false)"),
    }),
    handler: async (input, ctx) => {
        const md = await lerLembrancas(ctx.token);
        const { entradas } = dividir(md);
        const hoje = hojeSP();
        const q = (input.query || "").toLowerCase();
        const tag = (input.tag || "").toLowerCase();
        const limite = input.limite || 20;

        let res = entradas.filter((e) => input.incluir_expiradas || !expirada(e, hoje));
        if (q) res = res.filter((e) => `${e.titulo} ${e.conteudo}`.toLowerCase().includes(q));
        if (tag) res = res.filter((e) => e.tags.includes(tag));
        if (input.eixo) res = res.filter((e) => e.eixo === input.eixo);
        res = res.slice(-limite);

        if (!res.length) {
            return textBlock(JSON.stringify({ ok: true, total: 0, lembrancas: [], nota: "Nenhuma lembrança encontrada com esses filtros." }, null, 2));
        }
        // Agrupa por eixo temporal (contexto Passado/Presente/Futuro).
        const porEixo = { passado: [], presente: [], futuro: [] };
        for (const e of res) (porEixo[e.eixo] || porEixo.presente).push({
            titulo: e.titulo, data: e.data, tags: e.tags, relevancia: e.relevancia,
            promovida: e.promovida, conteudo: e.conteudo,
        });
        return textBlock(JSON.stringify({ ok: true, total: res.length, contexto_temporal: porEixo }, null, 2));
    },
};

/* ─────────── 2. consolidar_pensamento ─────────── */

const consolidarTool = {
    name: "consolidar_pensamento",
    description: "Grava um insight/regra/padrão nas Lembranças do Pivete. CHAME ISSO sempre que aprender algo novo sobre como o usuário pensa, age, o que gosta, ou uma decisão/código importante. Guarda só o ouro (essencial), indexado por tags/relevância, com validade de 30 dias. Faz limpeza automática das lembranças vencidas. O servidor remove credenciais antes de gravar.",
    annotations: { ...WRITE_ANNOT, title: "Consolidar pensamento nas Lembranças" },
    inputSchema: z.object({
        titulo: z.string().min(3).describe("Título curto do insight, sem credenciais"),
        conteudo: z.string().min(3).describe("O essencial a lembrar (o 'ouro'), sem ruído nem dados sensíveis"),
        tags: z.array(z.string()).optional().describe("Tags pra indexar (ex.: estilo, deploy, mcp)"),
        relevancia: z.enum(["alta", "media", "baixa"]).optional().describe("Padrão: media"),
        eixo: z.enum(["passado", "presente", "futuro"]).optional().describe("Eixo temporal (padrão: presente)"),
        promovida: z.boolean().optional().describe("Se true, vira permanente (não expira)"),
    }),
    handler: async (rawInput, ctx) => {
        const limpo = sanitizeFields({ titulo: rawInput.titulo, conteudo: rawInput.conteudo });
        const md = await lerLembrancas(ctx.token);
        const { cabecalho, entradas } = dividir(md);
        const hoje = hojeSP();

        // Housekeeping: remove expiradas não-promovidas.
        const antes = entradas.length;
        const mantidas = entradas.filter((e) => !expirada(e, hoje));
        const removidas = antes - mantidas.length;

        // Nova lembrança.
        const nova = {
            id: agoraSP(),
            titulo: limpo.titulo,
            data: hoje,
            tags: (rawInput.tags || []).map((t) => t.trim().toLowerCase()).filter(Boolean),
            relevancia: rawInput.relevancia || "media",
            eixo: rawInput.eixo || "presente",
            expira: addDias(hoje, TTL_DIAS),
            promovida: !!rawInput.promovida,
            conteudo: limpo.conteudo,
        };

        const corpo = [...mantidas.map((e) => e.raw), montarBloco(nova)].join("\n\n");
        const novoMd = `${cabecalho}\n\n${corpo}\n`;
        const r = await escreverLembrancas(ctx.token, novoMd, `lembranca: ${nova.titulo}`);
        return textBlock(JSON.stringify({
            ok: true, gravada: nova.titulo, expira: nova.expira,
            expiradas_limpas: removidas, total_ativas: mantidas.length + 1, commit: r,
        }, null, 2));
    },
};

/* ─────────── 3. injetar_consciencia_centraldark ─────────── */

// Regras de CONDUTA imutáveis (vivem no código, que é trancado). Complementam as
// regras técnicas de docs/CONSCIENCIA (lidas por ler_consciencia/ler_regras_inviolaveis).
const REGRAS_CONDUTA = `# ⚡ Consciência CentralDark — Regras de Conduta (imutáveis)

Toda IA recém-conectada DEVE ler isto antes de agir.

1. ZERO ENROLAÇÃO. Nada de "vou fazer", "posso fazer" — FAÇA. Sem pedir confirmação
   repetida pro que já foi autorizado. Sem despejar JSON pro usuário colar: use suas tools.
2. PRAGMATISMO EXTREMO. Resolva o problema real. Funcional e seguro acima de tudo.
   Simplifique. Não invente estrutura que já existe — reaproveite.
3. EXECUÇÃO DIRETA. Aja de ponta a ponta; só pare se faltar uma decisão que é só do Pivete.
4. FOCO TOTAL. Uma missão por vez, até o fim. Não se perca.
5. PT-BR sempre, tom direto e informal. Respostas estruturadas em caixas monospace quando
   ajudar a visualizar.
6. APRENDA O PIVETE. Leia as Lembranças (consultar_memoria_reserva) antes de tarefas
   complexas. Gravou algo novo do jeito dele? consolidar_pensamento.
7. SEGURANÇA INEGOCIÁVEL. Nunca exponha segredo, token, .env, chave SSH ou caminho interno.
   Ação destrutiva só com autorização explícita ("PERMITO PIVETE").
8. SINCRONIA. Git é a fonte da verdade. Toda mudança relevante: registre e sincronize
   (GitHub, VPS, Cérebro Vivo, Notion).
9. ÁREAS TRANCADAS (CLAUDE.md Seção 9) só com "PERMITO PIVETE".`;

const injetarTool = {
    name: "injetar_consciencia_centraldark",
    description: "Retorna as regras de CONDUTA imutáveis da CentralDark (zero enrolação, pragmatismo, execução direta, foco, segurança). Toda IA recém-conectada deve chamar isto no início pra se calibrar. Complementa ler_consciencia (regras técnicas do projeto).",
    annotations: { ...READ_ANNOT, title: "Injetar consciência (regras de conduta)" },
    inputSchema: z.object({}),
    handler: async () => textBlock(REGRAS_CONDUTA),
};

/* ─────────── 4. analise_de_estado_cognitivo ─────────── */

const analiseTool = {
    name: "analise_de_estado_cognitivo",
    description: "Analisa as últimas Lembranças pra inferir o FOCO e o projeto atual do Pivete, e sugere o nível de detalhe técnico ideal da resposta. Também aponta lembranças candidatas a virar consciência oficial (cruzamento). Use pra adaptar seu tom ao momento dele.",
    annotations: { ...READ_ANNOT, title: "Analisar estado cognitivo do Pivete" },
    inputSchema: z.object({
        limite: z.number().int().min(1).max(100).optional().describe("Quantas lembranças recentes analisar (padrão 15)"),
    }),
    handler: async (input, ctx) => {
        const md = await lerLembrancas(ctx.token);
        const { entradas } = dividir(md);
        const hoje = hojeSP();
        const ativas = entradas.filter((e) => !expirada(e, hoje));
        const recentes = ativas.slice(-(input.limite || 15));

        if (!recentes.length) {
            return textBlock(JSON.stringify({ ok: true, foco: "indefinido", nota: "Sem lembranças ativas — peça contexto ao Pivete." }, null, 2));
        }

        // Frequência de tags → foco atual.
        const freq = {};
        for (const e of recentes) for (const t of e.tags) freq[t] = (freq[t] || 0) + 1;
        const topTags = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([t, n]) => ({ tag: t, ocorrencias: n }));

        const altaRelevancia = recentes.filter((e) => e.relevancia === "alta").length;
        const ratioAlta = altaRelevancia / recentes.length;
        // Mais lembranças de alta relevância → contexto denso → mais detalhe técnico.
        const nivelDetalhe = ratioAlta > 0.5 ? "alto (técnico/profundo)" : ratioAlta > 0.2 ? "médio" : "baixo (direto e simples)";

        // Candidatos a promoção: alta relevância, recorrentes, ainda não promovidos.
        const candidatos = ativas
            .filter((e) => !e.promovida && e.relevancia === "alta")
            .map((e) => e.titulo);

        return textBlock(JSON.stringify({
            ok: true,
            lembrancas_ativas: ativas.length,
            analisadas: recentes.length,
            foco_atual: topTags.length ? topTags : "geral (sem tags dominantes)",
            nivel_detalhe_sugerido: nivelDetalhe,
            candidatos_a_promover: candidatos,
        }, null, 2));
    },
};

export const cognitivoTools = [consultarTool, consolidarTool, injetarTool, analiseTool];
