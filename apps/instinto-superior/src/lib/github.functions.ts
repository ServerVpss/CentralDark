import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { exigirAdmin } from "./admin.functions";

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

/**
 * #OBSERVACOES#
 * @owner GitHub / Instinto Superior
 * @doc_ref docs/HUD/README.md
 * @last_updated 2026-11-07T18:02:28Z
 * @implementado Leitura administrativa do funil e comparação por SHA.
 * @pendente Leitura pelo Cockpit publicado.
 */
const FUNNEL_MARKER = "CENTRALDARK_HUD_FUNNEL_CONTINUITY";
const githubRepo = "repos/ServerVpss/CentralDark";
const rotasGitHub = /^(?:branches\/main|commits(?:\?sha=(?:main|[a-f0-9]{40})&per_page=(?:4|20))|commits\/[a-f0-9]{40}\/check-runs\?per_page=100|pulls(?:\?state=open&per_page=100&page=\d+|\/\d+)|compare\/[a-f0-9]{7,40}\.\.\.[a-f0-9]{7,40}(?:\?per_page=1)?)$/;

/** Rota fixa e somente leitura. O gh usa a sessão já autorizada no host, sem exportar o token. */
export async function consultarGitHubCentralDark(caminho: string, signal = AbortSignal.timeout(6500)) {
  if (!rotasGitHub.test(caminho)) throw new Error("Rota GitHub fora do escopo de leitura.");
  const endpoint = `${githubRepo}/${caminho}`;
  let status = 401;
  const tokens = new Set([process.env["GITHUB_TOKEN"], process.env["GH_TOKEN"]].filter(Boolean));
  for (const token of tokens) {
    const resposta = await fetch(`${GITHUB_API_URL}/${endpoint}`, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
      cache: "no-store",
      redirect: "error",
      signal,
    });
    status = resposta.status;
    if (resposta.ok) return { status, dados: await resposta.json() as unknown, fonte: "GitHub API" };
    if (![401, 403, 404].includes(status)) return { status, dados: null, fonte: "GitHub API" };
  }
  try {
    const { execFile } = await import("node:child_process");
    const { promisify } = await import("node:util");
    const env: NodeJS.ProcessEnv = { ...process.env, GH_PROMPT_DISABLED: "1" };
    delete env["GH_TOKEN"];
    delete env["GITHUB_TOKEN"];
    delete env["GH_DEBUG"];
    const { stdout } = await promisify(execFile)("gh", [
      "api", "--hostname", "github.com", "--method", "GET", endpoint,
    ], { env, signal, timeout: 6500, maxBuffer: 4 * 1024 * 1024, windowsHide: true, encoding: "utf8" });
    return { status: 200, dados: JSON.parse(stdout) as unknown, fonte: "GitHub CLI do runtime" };
  } catch {
  }

  // CENTRALDARK_GITHUB_PUBLIC_READ_FALLBACK
  // Repo publico e rotas GET estritamente permitidas por rotasGitHub.
  // Leitura nao autoriza merge, push, SSH, mutacao nem deploy.
  if (!signal.aborted) {
    try {
      const resposta = await fetch(GITHUB_API_URL + "/" + endpoint, {
        headers: {
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        cache: "no-store",
        redirect: "error",
        signal,
      });
      status = resposta.status;
      if (resposta.ok) {
        return {
          status: 200,
          dados: await resposta.json() as unknown,
          fonte: "GitHub API publica (somente leitura)",
        };
      }
    } catch {
    }
  }
  return { status, dados: null, fonte: "GitHub" };
}

const gitSha = z.string().regex(/^[a-f0-9]{40}$/);
const gitPull = z.object({
  number: z.number(),
  title: z.string(),
  state: z.enum(["open", "closed"]),
  merged: z.boolean(),
  draft: z.boolean(),
  mergeable: z.boolean().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  closed_at: z.string().nullable(),
  changed_files: z.number(),
  user: z.object({ login: z.string() }),
  head: z.object({ sha: gitSha, ref: z.string() }),
});
const gitPullListItem = z.object({
  number: z.number(),
  body: z.string().nullable(),
});

const gitCompare = z.object({
  ahead_by: z.number(),
  behind_by: z.number(),
  merge_base_commit: z.object({ sha: gitSha }),
  files: z.array(z.object({ filename: z.string(), status: z.string() })).default([]),
});
const gitCommits = z.array(z.object({
  sha: gitSha,
  commit: z.object({ message: z.string(), committer: z.object({ date: z.string() }) }),
}));

export const lerReconciliacaoGitHub = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await exigirAdmin(context);
    const signal = AbortSignal.timeout(12_000);
    const ler = async (path: string) => {
      const resultado = await consultarGitHubCentralDark(path, signal);
      if (resultado.status !== 200) throw new Error(`GitHub respondeu ${resultado.status}.`);
      return resultado.dados;
    };
    const candidatos: Array<z.infer<typeof gitPullListItem>> = [];
    for (let page = 1; page <= 10; page += 1) {
      const pagina = await ler(`pulls?state=open&per_page=100&page=${page}`);
      const itens = z.array(gitPullListItem).parse(pagina);
      candidatos.push(...itens.filter((pr) => pr.body?.includes(FUNNEL_MARKER)));
      if (itens.length < 100) break;
    }
    if (candidatos.length !== 1) {
      throw new Error(`ACTIVE_FUNNEL_PR=UNKNOWN: esperava 1 PR aberto com ${FUNNEL_MARKER}; encontrei ${candidatos.length}.`);
    }
    const atual = await ler(`pulls/${candidatos[0]!.number}`).then((data) => gitPull.parse(data));
    const main = await ler("branches/main").then((data) =>
      z.object({ commit: z.object({ sha: gitSha }) }).parse(data).commit.sha,
    );
    const anterior = null;
    const [divergencia, commits] = await Promise.all([
      ler(`compare/${main}...${atual.head.sha}?per_page=1`).then((data) => gitCompare.parse(data)).catch(() => null),
      ler(`commits?sha=${atual.head.sha}&per_page=20`).then((data) => gitCommits.parse(data).map(({ sha, commit }) => ({
        sha, titulo: commit.message.split("\n", 1)[0] ?? "", data: commit.committer.date,
      }))).catch(() => null),
    ]);
    return { atual, anterior, main, divergencia, commits, observadoEm: new Date().toISOString() };
  });

