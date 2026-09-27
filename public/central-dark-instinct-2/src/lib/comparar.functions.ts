import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const entrada = z.object({
  // Arquivos vindos do repositório GitHub (somente leitura)
  repositorio: z
    .array(z.object({ path: z.string().max(500), conteudo: z.string().max(120_000) }))
    .min(1)
    .max(10),
  // Retrato estrutural da landing page atual deste site
  atual: z.string().min(1).max(120_000),
});

function extrair(texto: string) {
  const tags = new Set(
    [...texto.matchAll(/<([a-z][a-z0-9-]*)\b/gi)].map((item) => item[1]!.toLowerCase()),
  );
  const ids = new Set([...texto.matchAll(/\bid=["']([^"']+)["']/gi)].map((item) => item[1]!));
  const rotas = new Set(
    [...texto.matchAll(/(?:href|to)=["']([^"'#][^"']*)["']/gi)].map((item) => item[1]!),
  );
  return { tags, ids, rotas };
}

function somenteEm(a: Set<string>, b: Set<string>) {
  return [...a].filter((item) => !b.has(item)).sort();
}

function listar(itens: string[]) {
  return itens.length
    ? itens
        .slice(0, 20)
        .map((item) => `- ${item}`)
        .join("\n")
    : "- Nenhum item estrutural exclusivo detectado.";
}

export const compararLandings = createServerFn({ method: "POST" })
  .inputValidator((data) => entrada.parse(data))
  .handler(async ({ data }) => {
    const repo = extrair(data.repositorio.map((arquivo) => arquivo.conteudo).join("\n"));
    const atual = extrair(data.atual);
    const soRepo = [...somenteEm(repo.ids, atual.ids), ...somenteEm(repo.rotas, atual.rotas)];
    const soAtual = [...somenteEm(atual.ids, repo.ids), ...somenteEm(atual.rotas, repo.rotas)];
    const resumo = [
      "DIFERENÇAS VISUAIS",
      "- UNKNOWN: esta análise lê estrutura e rotas; não promove código-fonte a prova visual.",
      "",
      "DIFERENÇAS ESTRUTURAIS",
      `- GitHub: ${repo.tags.size} tipos de elemento, ${repo.ids.size} IDs e ${repo.rotas.size} rotas/links.`,
      `- Atual: ${atual.tags.size} tipos de elemento, ${atual.ids.size} IDs e ${atual.rotas.size} rotas/links.`,
      "",
      "O QUE EXISTE SÓ NO GITHUB",
      listar(soRepo),
      "",
      "O QUE EXISTE SÓ NA VERSÃO ATUAL",
      listar(soAtual),
      "",
      "VEREDITO",
      soRepo.length || soAtual.length
        ? "- Há delta estrutural. Revise os itens antes de reconciliar; esta função não altera arquivos."
        : "- Nenhum delta estrutural foi detectado nos arquivos lidos. Prova visual permanece UNKNOWN.",
    ].join("\n");

    return { resumo };
  });
