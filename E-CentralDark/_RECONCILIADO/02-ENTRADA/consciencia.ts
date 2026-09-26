// Tools de atalho da Consciência do projeto.
// Servem pra qualquer IA externa (ChatGPT, Claude, Cursor) puxar e atualizar
// as regras, pendências e snapshot da VPS sem precisar saber o path certo.

import { z } from "zod";
import { config } from "../config.js";
import * as gh from "../github.js";
import { sanitizeFields } from "../lib/sanitize.js";


type Ctx = { token: string };

function textBlock(text: string) {
  return { content: [{ type: "text" as const, text }] };
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

const DESTRUCTIVE_ANNOT = {
  readOnlyHint: false,
  destructiveHint: true,
  idempotentHint: false,
  openWorldHint: true,
};

const CO_AUTHOR = "SegredoDev <segredounlock@users.noreply.github.com>";

async function lerArquivo(token: string, path: string): Promise<string> {
  const file = await gh.getFileContent(token, config.github.owner, config.github.repo, path);
  if (typeof file === "string") return file;
  const f = file as { decoded?: string; content?: string };
  if (f.decoded) return f.decoded;
  if (f.content) return Buffer.from(f.content, "base64").toString("utf-8");
  return JSON.stringify(file);
}

async function escreverArquivo(
  token: string,
  path: string,
  conteudo: string,
  mensagem: string
) {
  const result = await gh.createOrUpdateFile(token, config.github.owner, config.github.repo, {
    path,
    content: conteudo,
    message: mensagem,
    coAuthor: CO_AUTHOR,
  });
  const r = result as { commit?: { sha?: string; html_url?: string } } | null;
  return {
    sha: r?.commit?.sha ?? null,
    url: r?.commit?.html_url ?? null,
  };
}

function dataBR(): string {
  // YYYY-MM-DD no fuso America/Sao_Paulo
  const fmt = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(new Date()); // sv-SE já dá YYYY-MM-DD
}

// ---------- Tools de LEITURA ----------

const readTools = [
  {
    name: "ler_consciencia",
    description:
      "Lê o documento mestre `docs/CONSCIENCIA/CONSCIENCIA.md` do repo clone-deck. Contém todas as regras invioláveis, tom de voz, permissões e proibições do projeto. SEMPRE leia isso antes de agir.",
    annotations: { ...READ_ANNOT, title: "Ler Consciência mestra" },
    inputSchema: z.object({}),
    handler: async (_input: unknown, ctx: Ctx) =>
      textBlock(await lerArquivo(ctx.token, "docs/CONSCIENCIA/CONSCIENCIA.md")),
  },
  {
    name: "ler_pendencias",
    description:
      "Lê `docs/PENDENCIAS.md` — setor único de pendências do projeto. Use quando o usuário perguntar 'o que tá pendente?' ou 'o que falta?'.",
    annotations: { ...READ_ANNOT, title: "Ler pendências" },
    inputSchema: z.object({}),
    handler: async (_input: unknown, ctx: Ctx) =>
      textBlock(await lerArquivo(ctx.token, "docs/PENDENCIAS.md")),
  },
  {
    name: "ler_regras_invioláveis",
    description:
      "Atalho rápido: lê só o `LEIA-ME-IA.md` da raiz do repo. Resumo das regras críticas em 1 página. Use no começo de cada conversa pra calibrar tom e limites.",
    annotations: { ...READ_ANNOT, title: "Ler regras críticas (1 página)" },
    inputSchema: z.object({}),
    handler: async (_input: unknown, ctx: Ctx) =>
      textBlock(await lerArquivo(ctx.token, "LEIA-ME-IA.md")),
  },
  {
    name: "ler_instalador",
    description:
      "Lê o índice `docs/INSTALADOR/README.md` com a lista de todos os arquivos do instalador (arquitetura, dependências, portas, pastas, etc).",
    annotations: { ...READ_ANNOT, title: "Ler índice do instalador" },
    inputSchema: z.object({}),
    handler: async (_input: unknown, ctx: Ctx) =>
      textBlock(await lerArquivo(ctx.token, "docs/INSTALADOR/README.md")),
  },
] as const;

// ---------- Tools de ESCRITA ----------

const PRIORIDADE_HEADER: Record<string, string> = {
  alta: "## 🔴 Alta prioridade",
  media: "## 🟡 Média prioridade",
  baixa: "## 🟢 Baixa prioridade",
};

const writeTools = [
  {
    name: "adicionar_pendencia",
    description:
      "Adiciona uma tarefa ao arquivo docs/PENDENCIAS.md na seção de prioridade indicada. O servidor remove credenciais, caminhos internos e endereços de servidor antes de gravar — sempre use nomes públicos (ex.: mcp.centralldark.com).",
    annotations: { ...WRITE_ANNOT, title: "Anotar nova pendência" },
    inputSchema: z.object({
      titulo: z.string().min(3).describe("Título curto em português, sem credenciais"),
      descricao: z.string().min(3).describe("Descrição neutra, sem dados sensíveis"),
      prioridade: z.enum(["alta", "media", "baixa"]).describe("alta, media ou baixa"),
      comoFechar: z.string().optional().describe("Como saber que está resolvida"),
      ondeMexer: z.string().optional().describe("Pastas ou serviços envolvidos (nomes públicos)"),
    }),
    handler: async (
      rawInput: {
        titulo: string;
        descricao: string;
        prioridade: "alta" | "media" | "baixa";
        comoFechar?: string;
        ondeMexer?: string;
      },
      ctx: Ctx
    ) => {
      const input = {
        prioridade: rawInput.prioridade,
        ...sanitizeFields({
          titulo: rawInput.titulo,
          descricao: rawInput.descricao,
          comoFechar: rawInput.comoFechar,
          ondeMexer: rawInput.ondeMexer,
        }),
      };
      const path = "docs/PENDENCIAS.md";
      const conteudo = await lerArquivo(ctx.token, path);


      // Próximo número = max(### N.) + 1
      const numeros = [...conteudo.matchAll(/^###\s+(\d+)\./gm)].map((m) => parseInt(m[1], 10));
      const proximo = numeros.length ? Math.max(...numeros) + 1 : 1;

      const header = PRIORIDADE_HEADER[input.prioridade];
      const linhas = [
        ``,
        `### ${proximo}. ${input.titulo}`,
        `- **Status:** Aberto`,
        `- **Descrição:** ${input.descricao}`,
        ...(input.ondeMexer ? [`- **Onde mexer:** ${input.ondeMexer}`] : []),
        ...(input.comoFechar ? [`- **Como fechar:** ${input.comoFechar}`] : []),
        `- **Aberto em:** ${dataBR()} (via MCP)`,
        ``,
      ].join("\n");

      // Injeta logo após o header de prioridade
      const idx = conteudo.indexOf(header);
      if (idx === -1) {
        return textBlock(`Erro: seção '${header}' não encontrada em ${path}`);
      }
      // Acha a quebra de linha após o header
      const fimHeader = conteudo.indexOf("\n", idx) + 1;
      const novoConteudo = conteudo.slice(0, fimHeader) + linhas + conteudo.slice(fimHeader);

      const r = await escreverArquivo(
        ctx.token,
        path,
        novoConteudo,
        `pendencia(#${proximo}): ${input.titulo}`
      );
      return textBlock(
        JSON.stringify(
          { ok: true, numero: proximo, prioridade: input.prioridade, commit: r },
          null,
          2
        )
      );
    },
  },

  {
    name: "fechar_pendencia",
    description:
      "Marca uma tarefa do arquivo docs/PENDENCIAS.md como concluída. O servidor remove credenciais e caminhos internos da nota final antes de gravar.",
    annotations: { ...WRITE_ANNOT, title: "Marcar pendência como concluída" },
    inputSchema: z.object({
      numero: z.number().int().min(1).describe("Número do item"),
      notaFinal: z.string().optional().describe("Resumo curto e neutro do que foi feito"),
    }),
    handler: async (rawInput: { numero: number; notaFinal?: string }, ctx: Ctx) => {
      const input = { numero: rawInput.numero, ...sanitizeFields({ notaFinal: rawInput.notaFinal }) };
      const path = "docs/PENDENCIAS.md";
      const conteudo = await lerArquivo(ctx.token, path);


      const re = new RegExp(`^### ${input.numero}\\.\\s+(.+)$`, "m");
      const m = conteudo.match(re);
      if (!m) {
        return textBlock(`Erro: item #${input.numero} não encontrado em ${path}`);
      }
      // Se já tem ✅, evita duplicar
      if (m[1].includes("✅ CONCLUÍDO")) {
        return textBlock(`Item #${input.numero} já está marcado como concluído.`);
      }

      const tituloNovo = `### ${input.numero}. ${m[1]} — ✅ CONCLUÍDO em ${dataBR()}`;
      let novoConteudo = conteudo.replace(re, tituloNovo);

      if (input.notaFinal) {
        // Adiciona nota logo após o título
        novoConteudo = novoConteudo.replace(
          tituloNovo,
          `${tituloNovo}\n- **Nota final:** ${input.notaFinal}`
        );
      }

      const r = await escreverArquivo(
        ctx.token,
        path,
        novoConteudo,
        `pendencia(#${input.numero}): fechado`
      );
      return textBlock(JSON.stringify({ ok: true, numero: input.numero, commit: r }, null, 2));
    },
  },

  {
    name: "atualizar_consciencia",
    description:
      "Substitui uma seção inteira do documento docs/CONSCIENCIA/CONSCIENCIA.md (regras do projeto). Operação que reescreve conteúdo já existente. O servidor remove credenciais e caminhos internos antes de gravar.",
    annotations: { ...DESTRUCTIVE_ANNOT, title: "Atualizar seção do documento de regras" },
    inputSchema: z.object({
      numeroSecao: z.number().int().min(0).describe("Número da seção"),
      conteudoNovo: z
        .string()
        .min(10)
        .describe("Markdown completo da seção, começando com '## N. NOME', sem credenciais"),
      motivo: z.string().min(3).describe("Motivo curto da alteração (vira mensagem de commit)"),
    }),
    handler: async (
      rawInput: { numeroSecao: number; conteudoNovo: string; motivo: string },
      ctx: Ctx
    ) => {
      const input = {
        numeroSecao: rawInput.numeroSecao,
        ...sanitizeFields({ conteudoNovo: rawInput.conteudoNovo, motivo: rawInput.motivo }),
      } as { numeroSecao: number; conteudoNovo: string; motivo: string };
      const path = "docs/CONSCIENCIA/CONSCIENCIA.md";
      const conteudo = await lerArquivo(ctx.token, path);


      // Encontra início da seção: linha começando com "## N." (N = numeroSecao)
      const inicioRe = new RegExp(`^## ${input.numeroSecao}\\.[^\\n]*$`, "m");
      const mInicio = conteudo.match(inicioRe);
      if (!mInicio || mInicio.index === undefined) {
        return textBlock(`Erro: seção ## ${input.numeroSecao}. não encontrada em ${path}`);
      }
      const idxInicio = mInicio.index;

      // Próxima seção começa com "## " (qualquer próxima)
      const restante = conteudo.slice(idxInicio + mInicio[0].length);
      const mProxima = restante.match(/^## /m);
      const idxFim =
        mProxima && mProxima.index !== undefined
          ? idxInicio + mInicio[0].length + mProxima.index
          : conteudo.length;

      // Garante que conteudoNovo termina com \n e separação
      const novoBloco = input.conteudoNovo.trimEnd() + "\n\n";
      const novoConteudo = conteudo.slice(0, idxInicio) + novoBloco + conteudo.slice(idxFim);

      const r = await escreverArquivo(
        ctx.token,
        path,
        novoConteudo,
        `consciencia(secao ${input.numeroSecao}): ${input.motivo}`
      );
      return textBlock(
        JSON.stringify({ ok: true, secao: input.numeroSecao, commit: r }, null, 2)
      );
    },
  },
] as const;

export const conscienciaTools = [...readTools, ...writeTools];
