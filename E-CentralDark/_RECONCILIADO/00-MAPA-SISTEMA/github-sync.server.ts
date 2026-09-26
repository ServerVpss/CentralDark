// Auto-sync seguro pro GitHub.
// Compara hash local (git blob SHA-1) vs hash no branch alvo. Só commita se houve mudança real.
// Token pode vir como parâmetro (PAT salvo na integração master) ou de process.env.GITHUB_PAT (cron).
// Owner/repo/branch também aceitam override; default = projeto MultiZap.

const DEFAULT_OWNER = "segredounlock";
const DEFAULT_REPO = "atendimentoo";
const DEFAULT_BRANCH = "main";
const API = "https://api.github.com";

// Bundla TODOS os arquivos de texto do Gateway em build-time como string crua.
// import.meta.glob é resolvido pelo Vite — Cloudflare Worker recebe os conteúdos inline.
const RAW_FILES = import.meta.glob(
  "/multizap-gateway-deploy/**/*.{js,ts,json,md,toml,yml,yaml,sh,txt,env.example}",
  { query: "?raw", import: "default", eager: true },
) as Record<string, string>;

const encoder = new TextEncoder();

/** Computa SHA-1 no formato git blob: sha1("blob <size>\0<content>"). */
async function gitBlobSha(content: string): Promise<string> {
  const body = encoder.encode(content);
  const header = encoder.encode(`blob ${body.length}\0`);
  const full = new Uint8Array(header.length + body.length);
  full.set(header, 0);
  full.set(body, header.length);
  const digest = await crypto.subtle.digest("SHA-1", full);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Converte chave do glob (/multizap-gateway-deploy/...) em path no repo. */
function repoPathFromGlobKey(key: string): string {
  return key.replace(/^\//, "");
}

interface GhTreeEntry {
  path: string;
  type: string;
  sha: string;
}

async function gh<T>(
  method: string,
  path: string,
  token: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "multizap-auto-sync",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    // Mensagem genérica — nunca incluir token. Status + corpo da API são seguros.
    throw new Error(`GitHub ${method} ${path} ${res.status}: ${txt.slice(0, 300)}`);
  }
  return (await res.json()) as T;
}

export interface SyncResult {
  scanned: number;
  changed: string[];
  commit?: string;
  skipped?: boolean;
  reason?: string;
}

export interface SyncOptions {
  token?: string;
  owner?: string;
  repo?: string;
  branch?: string;
  commitAuthor?: string;
}

export async function runGithubAutoSync(opts: SyncOptions = {}): Promise<SyncResult> {
  const token = opts.token ?? process.env.GITHUB_PAT;
  if (!token) {
    return { scanned: 0, changed: [], skipped: true, reason: "no_token" };
  }
  const OWNER = opts.owner || DEFAULT_OWNER;
  const REPO = opts.repo || DEFAULT_REPO;
  const BRANCH = opts.branch || DEFAULT_BRANCH;
  const author = opts.commitAuthor || "multizap-auto-sync";

  // 1. Pega commit/tree atual do branch.
  const ref = await gh<{ object: { sha: string } }>(
    "GET",
    `/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`,
    token,
  );
  const headSha = ref.object.sha;

  const headCommit = await gh<{ tree: { sha: string } }>(
    "GET",
    `/repos/${OWNER}/${REPO}/git/commits/${headSha}`,
    token,
  );
  const baseTreeSha = headCommit.tree.sha;

  const tree = await gh<{ tree: GhTreeEntry[]; truncated: boolean }>(
    "GET",
    `/repos/${OWNER}/${REPO}/git/trees/${baseTreeSha}?recursive=1`,
    token,
  );

  const remoteBySha = new Map<string, string>();
  for (const entry of tree.tree) {
    if (entry.type === "blob") remoteBySha.set(entry.path, entry.sha);
  }

  // 2. Diff: arquivo a arquivo, hash local vs hash remoto.
  const scannedPaths = Object.keys(RAW_FILES);
  const changed: { path: string; content: string }[] = [];
  for (const key of scannedPaths) {
    const path = repoPathFromGlobKey(key);
    const content = RAW_FILES[key] ?? "";
    const localSha = await gitBlobSha(content);
    const remoteSha = remoteBySha.get(path);
    if (localSha !== remoteSha) {
      changed.push({ path, content });
    }
  }

  if (changed.length === 0) {
    return { scanned: scannedPaths.length, changed: [], skipped: true, reason: "no_changes" };
  }

  // 3. Cria novo tree baseado no anterior + arquivos modificados.
  const newTree = await gh<{ sha: string }>(
    "POST",
    `/repos/${OWNER}/${REPO}/git/trees`,
    token,
    {
      base_tree: baseTreeSha,
      tree: changed.map((c) => ({
        path: c.path,
        mode: "100644",
        type: "blob",
        content: c.content,
      })),
    },
  );

  // 4. Commit + update ref.
  const changedPaths = changed.map((c) => c.path);
  const summary =
    changedPaths.length <= 3
      ? changedPaths.join(", ")
      : `${changedPaths.slice(0, 3).join(", ")} (+${changedPaths.length - 3})`;
  const commit = await gh<{ sha: string }>(
    "POST",
    `/repos/${OWNER}/${REPO}/git/commits`,
    token,
    {
      message: `sync(${author}): ${summary}`,
      tree: newTree.sha,
      parents: [headSha],
    },
  );

  await gh(
    "PATCH",
    `/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`,
    token,
    { sha: commit.sha, force: false },
  );

  return {
    scanned: scannedPaths.length,
    changed: changedPaths,
    commit: commit.sha,
  };
}

