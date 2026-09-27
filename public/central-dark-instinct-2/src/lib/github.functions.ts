import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/github";
const GITHUB_API_URL = "https://api.github.com";

// Pastas que nunca contam como landing page
const PASTAS_IGNORADAS =
  /(^|\/)(node_modules|dist|build|\.git|\.github|supabase|functions|server|api|scripts|tests?|docs?|tmp[^/]*|coverage)\//i;

// Arquivos considerados da landing page (somente leitura)
const PADROES_LANDING = [
  /^index\.html$/i,
  /^(src\/)?(routes|pages|app)?\/?index\.(tsx|jsx)$/i,
  /(^|\/)landing[^/]*\.(tsx|jsx|html|css)$/i,
  /(^|\/)(home|hero)[^/]*\.(tsx|jsx|html)$/i,
  /^(src\/)?app\.(tsx|jsx|html)$/i,
  /^(src\/)?(styles|index|global|globals|main)\.css$/i,
];

function ehArquivoDaLanding(caminho: string) {
  if (PASTAS_IGNORADAS.test(caminho)) return false;
  if (caminho.split("/").length > 4) return false;
  return PADROES_LANDING.some((p) => p.test(caminho));
}

function acesso() {
  const token = process.env["GITHUB_TOKEN"];
  if (token) {
    return {
      base: GITHUB_API_URL,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    };
  }

  const lovableKey = process.env["LOVABLE_API_KEY"];
  const githubKey = process.env["GITHUB_API_KEY"];
  if (!lovableKey || !githubKey) {
    throw new Error("Conexão com o GitHub ainda não está configurada neste projeto.");
  }
  return {
    base: GATEWAY_URL,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": githubKey,
    },
  };
}

async function pegar(caminho: string) {
  const github = acesso();
  const resposta = await fetch(`${github.base}/${caminho}`, {
    method: "GET",
    headers: github.headers,
  });
  if (!resposta.ok) {
    const corpo = await resposta.text();
    console.error(`Falha no GitHub [${resposta.status}]: ${corpo}`);
    throw new Error(`Falha ao ler o GitHub [${resposta.status}]: ${corpo}`);
  }
  return resposta.json();
}

const entrada = z.object({
  owner: z.string().min(1).max(100),
  repo: z.string().min(1).max(200),
});

export const listarArquivosDaLanding = createServerFn({ method: "GET" })
  .inputValidator((data) => entrada.parse(data))
  .handler(async ({ data }) => {
    const { owner, repo } = data;
    const info = (await pegar(`repos/${owner}/${repo}`)) as {
      default_branch: string;
      full_name: string;
      private: boolean;
      html_url: string;
    };
    const arvore = (await pegar(
      `repos/${owner}/${repo}/git/trees/${info.default_branch}?recursive=1`,
    )) as {
      truncated?: boolean;
      tree: Array<{ path: string; type: string; size?: number }>;
    };

    const arquivos = arvore.tree
      .filter((n) => n.type === "blob" && ehArquivoDaLanding(n.path))
      .map((n) => ({ path: n.path, size: n.size ?? 0 }))
      .sort((a, b) => a.path.localeCompare(b.path));

    return {
      repo: info.full_name,
      branch: info.default_branch,
      privado: info.private,
      url: info.html_url,
      truncado: Boolean(arvore.truncated),
      arquivos,
    };
  });

export const lerArquivo = createServerFn({ method: "GET" })
  .inputValidator((data) => entrada.extend({ path: z.string().min(1).max(500) }).parse(data))
  .handler(async ({ data }) => {
    const { owner, repo, path } = data;
    const arquivo = (await pegar(
      `repos/${owner}/${repo}/contents/${path.split("/").map(encodeURIComponent).join("/")}`,
    )) as { content?: string; encoding?: string; size: number; html_url: string };

    let conteudo = "";
    if (arquivo.content && arquivo.encoding === "base64") {
      conteudo = atob(arquivo.content.replace(/\n/g, ""));
    }
    return { path, size: arquivo.size, url: arquivo.html_url, conteudo };
  });

// Lê vários arquivos de uma vez (usado pela prévia isolada, pelo ZIP e pela comparação)
export const lerVariosArquivos = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    entrada.extend({ paths: z.array(z.string().min(1).max(500)).min(1).max(20) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { owner, repo, paths } = data;
    const resultados = await Promise.all(
      paths.map(async (path) => {
        try {
          const arquivo = (await pegar(
            `repos/${owner}/${repo}/contents/${path.split("/").map(encodeURIComponent).join("/")}`,
          )) as { content?: string; encoding?: string; size: number };
          const conteudo =
            arquivo.content && arquivo.encoding === "base64"
              ? atob(arquivo.content.replace(/\n/g, ""))
              : "";
          return { path, size: arquivo.size, conteudo, erro: null as string | null };
        } catch {
          return { path, size: 0, conteudo: "", erro: "Não foi possível ler este arquivo." };
        }
      }),
    );
    return { arquivos: resultados };
  });
