
// CentralDark: handlers de memória/pendências devem manter repo oficial e espelho passivo. Sem mudança de runtime.
// Tools de APRENDIZADO CONTÍNUO.
// O MCP CentralDark age como "professor" — qualquer IA conectada
// pode puxar de uma vez só TODA a memória/aprendizado vivo do projeto
// (consciência, regras, pendências, memória operacional, sync, snapshot da VPS,
// aprendizados anotados) e registrar novos aprendizados pra próxima IA herdar.
//
// Tudo passa pelo sanitizer antes de gravar (sem segredos, sem IP).

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

const CO_AUTHOR = "SegredoDev <segredounlock@users.noreply.github.com>";
const APRENDIZADOS_PATH = "docs/CONSCIENCIA/APRENDIZADOS.md";

const OFFICIAL_OWNER = "ServerVpss";
const OFFICIAL_REPO = "CentralDark";
const PASSIVE_MIRROR_OWNER = "segredounlock";
const PASSIVE_MIRROR_REPO = "clone-deck";

function repoAlvoOficial() {
  return { owner: OFFICIAL_OWNER, repo: OFFICIAL_REPO };
}

function bloquearEspelhoPassivo(owner: string, repo: string) {
  if (owner === PASSIVE_MIRROR_OWNER && repo === PASSIVE_MIRROR_REPO) {
    throw new Error(
      "Operação bloqueada: segredounlock/clone-deck é espelho passivo. Use ServerVpss/CentralDark como repositório oficial."
    );
  }
}


async function lerArquivo(token: string, path: string): Promise<string> {
  try {
    const file = await gh.getFileContent(token, repoAlvoOficial().owner, repoAlvoOficial().repo, path);
    if (typeof file === "string") return file;
    const f = file as { decoded?: string; content?: string };
    if (f.decoded) return f.decoded;
    if (f.content) return Buffer.from(f.content, "base64").toString("utf-8");
    return "";
  } catch {
    return "";
  }
}

async function escreverArquivo(token: string, path: string, conteudo: string, mensagem: string) {
  const result = await gh.createOrUpdateFile(token, repoAlvoOficial().owner, repoAlvoOficial().repo, {
    path,
    content: conteudo,
    message: mensagem,
    coAuthor: CO_AUTHOR,
  });
  const r = result as { commit?: { sha?: string; html_url?: string } } | null;
  return { sha: r?.commit?.sha ?? null, url: r?.commit?.html_url ?? null };
}

function dataBR(): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

// Lista oficial e ordenada de fontes vivas.
// Editar aqui = todas as IAs conectadas passam a herdar a fonte nova.
const FONTES_APRENDIZADO: { path: string; titulo: string }[] = [
  { path: "LEIA-ME-IA.md", titulo: "Porta de entrada (resumo de 1 página)" },
  { path: "docs/CONSCIENCIA/CONSCIENCIA.md", titulo: "Consciência mestra" },
  { path: "docs/PENDENCIAS.md", titulo: "Setor único de pendências" },
  { path: "docs/INSTALADOR/README.md", titulo: "Índice do instalador" },
  { path: "conexao-ia/MEMORIA_OPERACIONAL_IA.md", titulo: "Memória operacional viva" },
  { path: "docs/SYNC_REPOS.md", titulo: "Fluxo oficial de sync entre repos" },
  { path: "docs/CONSCIENCIA/09-ESTADO-ATUAL.md", titulo: "Snapshot atual da VPS (auto a cada 6h)" },
  { path: "docs/CONSCIENCIA/10-FALLBACK-LOVABLE.md", titulo: "Fallback Lovable↔GitHub" },
  { path: "docs/CONSCIENCIA/02-PERMISSOES.md", titulo: "Permissões e proibições" },
  { path: "docs/CONSCIENCIA/05-SSH-VPS.md", titulo: "SSH na VPS (regra inviolável)" },
  { path: APRENDIZADOS_PATH, titulo: "Aprendizados anotados pelas IAs (histórico vivo)" },
];

export const aprendizadoTools = [
  {
    name: "kit_boas_vindas",
    description:
      "PROFESSOR — chame ISSO PRIMEIRO sempre que conectar. Retorna em UMA resposta o pacote completo de aprendizado vivo do projeto: regras invioláveis, consciência mestra, pendências abertas, fluxo de deploy, sync entre repos, memória operacional, snapshot atual da VPS e aprendizados acumulados pelas IAs anteriores. É a forma mais rápida de uma IA recém-conectada ficar 'em dia' com tudo.",
    annotations: { ...READ_ANNOT, title: "Kit de boas-vindas (professor)" },
    inputSchema: z.object({}),
    handler: async (_input: unknown, ctx: Ctx) => {
      const partes: string[] = [];
      partes.push(`# 🎓 Kit de boas-vindas — MCP CentralDark`);
      partes.push(``);
      partes.push(`Você acabou de conectar. Este pacote junta todas as fontes vivas que você precisa pra agir certo. Leia na ordem.`);
      partes.push(``);
      partes.push(`> Gerado em ${dataBR()} (America/Sao_Paulo) — sempre fresco, lê direto do repo.`);
      partes.push(``);

      for (const fonte of FONTES_APRENDIZADO) {
        const conteudo = await lerArquivo(ctx.token, fonte.path);
        partes.push(`---`);
        partes.push(``);
        partes.push(`## 📄 ${fonte.titulo}`);
        partes.push(`*Fonte:* \`${fonte.path}\``);
        partes.push(``);
        if (!conteudo.trim()) {
          partes.push(`_(arquivo ainda não existe — pode ser criado depois)_`);
        } else {
          partes.push(conteudo.trim());
        }
        partes.push(``);
      }

      partes.push(`---`);
      partes.push(``);
      partes.push(`## ✅ Próximos passos pra você (IA conectada)`);
      partes.push(``);
      partes.push(`1. Aplique as **regras invioláveis** sem exceção.`);
      partes.push(`2. Se aprender algo novo (erro+correção, atalho, descoberta), chame \`registrar_aprendizado\` pra próxima IA herdar.`);
      partes.push(`3. Antes de qualquer tarefa nova, chame \`puxar_aprendizados\` (versão enxuta — só os arquivos que mudaram).`);
      partes.push(`4. Pendências vivem só em \`docs/PENDENCIAS.md\` — use \`adicionar_pendencia\` / \`fechar_pendencia\`.`);

      return textBlock(partes.join("\n"));
    },
  },

  {
    name: "puxar_aprendizados",
    description:
      "Versão enxuta do kit de boas-vindas: lista as fontes vivas de aprendizado e devolve só as escolhidas. Use no meio de uma conversa pra revalidar contexto sem repuxar tudo. Sem 'fontes', retorna só o índice + o arquivo de APRENDIZADOS.md acumulado.",
    annotations: { ...READ_ANNOT, title: "Puxar aprendizados (seletivo)" },
    inputSchema: z.object({
      fontes: z
        .string()
        .optional()
        .describe(
          "Caminhos separados por vírgula. Vazio = só índice + APRENDIZADOS.md. Use 'tudo' pra equivalente do kit_boas_vindas."
        ),
    }),
    handler: async (input: { fontes?: string }, ctx: Ctx) => {
      const pedido = (input.fontes ?? "").trim();

      const indice = [
        `# 📚 Fontes vivas de aprendizado`,
        ``,
        `Gerado em ${dataBR()}. Para puxar uma, chame \`puxar_aprendizados\` com \`fontes\` = caminho (ou \`tudo\`).`,
        ``,
        ...FONTES_APRENDIZADO.map((f) => `- \`${f.path}\` — ${f.titulo}`),
        ``,
      ].join("\n");

      let alvos: { path: string; titulo: string }[] = [];
      if (!pedido) {
        const apr = FONTES_APRENDIZADO.find((f) => f.path === APRENDIZADOS_PATH);
        if (apr) alvos = [apr];
      } else if (pedido.toLowerCase() === "tudo") {
        alvos = FONTES_APRENDIZADO;
      } else {
        const pedidos = pedido.split(",").map((s) => s.trim()).filter(Boolean);
        alvos = FONTES_APRENDIZADO.filter((f) => pedidos.includes(f.path));
        if (alvos.length === 0) {
          // fallback: tenta ler os paths crus mesmo que não estejam no catálogo
          alvos = pedidos.map((p) => ({ path: p, titulo: p }));
        }
      }

      const partes = [indice];
      for (const fonte of alvos) {
        const conteudo = await lerArquivo(ctx.token, fonte.path);
        partes.push(`---`, ``, `## 📄 ${fonte.titulo}`, `*Fonte:* \`${fonte.path}\``, ``);
        partes.push(conteudo.trim() || "_(arquivo vazio ou inexistente)_");
        partes.push(``);
      }

      return textBlock(partes.join("\n"));
    },
  },

  {
    name: "registrar_aprendizado",
    description:
      "Anota um aprendizado novo em `docs/CONSCIENCIA/APRENDIZADOS.md` pra próxima IA conectada herdar. Use sempre que descobrir um erro+correção, um atalho que funcionou, uma regra nova validada, ou uma armadilha pra evitar. O servidor sanitiza credenciais, IPs e caminhos sensíveis antes de gravar.",
    annotations: { ...WRITE_ANNOT, title: "Registrar novo aprendizado" },
    inputSchema: z.object({
      titulo: z.string().min(3).describe("Título curto em PT-BR"),
      contexto: z.string().min(3).describe("O que estava acontecendo / problema"),
      aprendizado: z.string().min(3).describe("Conclusão / regra prática que ficou"),
      categoria: z
        .enum(["erro-correcao", "atalho", "regra", "armadilha", "outro"])
        .optional()
        .describe("Tipo de aprendizado"),
    }),
    handler: async (
      rawInput: { titulo: string; contexto: string; aprendizado: string; categoria?: string },
      ctx: Ctx
    ) => {
      const limpo = sanitizeFields({
        titulo: rawInput.titulo,
        contexto: rawInput.contexto,
        aprendizado: rawInput.aprendizado,
      });
      const categoria = rawInput.categoria ?? "outro";

      const atual = await lerArquivo(ctx.token, APRENDIZADOS_PATH);
      const base =
        atual.trim() ||
        [
          `# 🧠 Aprendizados acumulados das IAs conectadas`,
          ``,
          `Histórico vivo — cada item é uma lição aprendida por alguma IA conectada no MCP CentralDark.`,
          `A IA seguinte herda automaticamente via \`kit_boas_vindas\` / \`puxar_aprendizados\`.`,
          ``,
          `---`,
          ``,
        ].join("\n");

      const numeros = [...base.matchAll(/^###\s+(\d+)\./gm)].map((m) => parseInt(m[1], 10));
      const proximo = numeros.length ? Math.max(...numeros) + 1 : 1;

      const bloco = [
        ``,
        `### ${proximo}. ${limpo.titulo}`,
        `- **Categoria:** ${categoria}`,
        `- **Data:** ${dataBR()}`,
        `- **Contexto:** ${limpo.contexto}`,
        `- **Aprendizado:** ${limpo.aprendizado}`,
        ``,
      ].join("\n");

      const novoConteudo = base.trimEnd() + "\n" + bloco;

      const r = await escreverArquivo(
        ctx.token,
        APRENDIZADOS_PATH,
        novoConteudo,
        `aprendizado(#${proximo}): ${limpo.titulo}`
      );
      return textBlock(
        JSON.stringify(
          { ok: true, numero: proximo, categoria, commit: r, arquivo: APRENDIZADOS_PATH },
          null,
          2
        )
      );
    },
  },
] as const;
