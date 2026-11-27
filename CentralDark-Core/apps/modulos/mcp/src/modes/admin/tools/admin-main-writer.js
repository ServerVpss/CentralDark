import { z } from "zod";

const OWNER = "ServerVpss";
const REPO = "CentralDark";
const BRANCH = "main";

function out(data) {
  return {
    content: [{
      type: "text",
      text: JSON.stringify(data, null, 2),
    }],
  };
}

function normalizePath(raw) {
  const path = String(raw || "")
    .replaceAll("\\", "/")
    .replace(/^\/+/, "")
    .trim();

  if (!path) throw new Error("PATH_VAZIO");

  const parts = path.split("/");
  if (parts.some((p) => !p || p === "." || p === "..")) {
    throw new Error("PATH_INVALIDO");
  }

  const lower = path.toLowerCase();

  const blocked = [
    /^\.git(?:\/|$)/,
    /(?:^|\/)\.env(?:\.|\/|$)/,
    /(?:^|\/)secrets?(?:\/|$)/,
    /(?:^|\/)credentials?(?:\/|$)/,
    /(?:^|\/)sessions?(?:\/|$)/,
    /\.(?:pem|key|p12|pfx|sqlite|sqlite3|db)$/i,
  ];

  if (blocked.some((re) => re.test(lower))) {
    throw new Error("PATH_SENSIVEL_BLOQUEADO");
  }

  return path;
}

async function gh(token, method, endpoint, body) {
  if (!token) throw new Error("GITHUB_TOKEN_AUSENTE");

  const response = await fetch(`https://api.github.com${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "CentralDark-MCP",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const raw = await response.text();

  let data = {};
  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      data = { raw: raw.slice(0, 1000) };
    }
  }

  if (!response.ok) {
    const error = new Error(
      `GITHUB_${response.status}: ${data?.message || response.statusText}`
    );
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

async function getMainSha(token) {
  const ref = await gh(
    token,
    "GET",
    `/repos/${OWNER}/${REPO}/git/ref/heads/${BRANCH}`
  );
  return ref?.object?.sha || null;
}

async function deployHealth() {
  try {
    const r = await fetch("http://127.0.0.1:9300/health", {
      signal: AbortSignal.timeout(2000),
    });
    if (!r.ok) return { ok: false, status: r.status };
    return { ok: true, body: await r.json() };
  } catch (error) {
    return { ok: false, error: String(error?.message || error) };
  }
}

export const adminMainWriterTools = [
  {
    name: "admin_commit_main",

    description:
      "ADMIN determinístico: cria UM commit diretamente na main de ServerVpss/CentralDark usando CAS de ref Git. Não cria branch/PR, não deleta arquivo, bloqueia paths sensíveis e falha se main mover durante a transação.",

    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
      title: "Admin commit direto na main",
    },

    inputSchema: z.object({
      path: z.string().min(1),

      content: z
        .string()
        .max(900000)
        .describe("Conteúdo UTF-8 completo do arquivo."),

      message: z
        .string()
        .min(3)
        .max(200)
        .describe("Mensagem do commit."),

      expectedMainSha: z
        .string()
        .regex(/^[0-9a-f]{40}$/i)
        .optional()
        .describe("SHA esperado da main. Se divergir, não escreve."),

      mode: z
        .enum(["100644", "100755"])
        .optional()
        .default("100644"),
    }),

    handler: async (input, ctx) => {
      let path;

      try {
        path = normalizePath(input.path);
      } catch (error) {
        return out({
          ok: false,
          status: "PATH_BLOCKED",
          error: String(error?.message || error),
        });
      }

      const before = await getMainSha(ctx.token);

      if (!before) {
        return out({
          ok: false,
          status: "MAIN_SHA_UNKNOWN",
        });
      }

      if (
        input.expectedMainSha &&
        input.expectedMainSha.toLowerCase() !== before.toLowerCase()
      ) {
        return out({
          ok: false,
          status: "EXPECTED_HEAD_MISMATCH",
          expected: input.expectedMainSha,
          current: before,
        });
      }

      try {
        // 1. Pega a árvore exatamente da main medida.
        const parentCommit = await gh(
          ctx.token,
          "GET",
          `/repos/${OWNER}/${REPO}/git/commits/${before}`
        );

        const baseTree = parentCommit?.tree?.sha;
        if (!baseTree) throw new Error("BASE_TREE_UNKNOWN");

        // 2. Cria blob imutável.
        const blob = await gh(
          ctx.token,
          "POST",
          `/repos/${OWNER}/${REPO}/git/blobs`,
          {
            content: input.content,
            encoding: "utf-8",
          }
        );

        // 3. Cria árvore derivada exatamente da árvore medida.
        const tree = await gh(
          ctx.token,
          "POST",
          `/repos/${OWNER}/${REPO}/git/trees`,
          {
            base_tree: baseTree,
            tree: [{
              path,
              mode: input.mode || "100644",
              type: "blob",
              sha: blob.sha,
            }],
          }
        );

        // 4. Cria commit com UM pai: SHA da main medida.
        const commit = await gh(
          ctx.token,
          "POST",
          `/repos/${OWNER}/${REPO}/git/commits`,
          {
            message: input.message,
            tree: tree.sha,
            parents: [before],
          }
        );

        // 5. CAS real: force=false.
        // Se main tiver andado para uma linha concorrente, GitHub rejeita.
        try {
          await gh(
            ctx.token,
            "PATCH",
            `/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`,
            {
              sha: commit.sha,
              force: false,
            }
          );
        } catch (error) {
          return out({
            ok: false,
            status: "MAIN_RACE_BLOCKED",
            before,
            candidateCommit: commit.sha,
            githubStatus: error?.status || null,
            error: String(error?.message || error),
          });
        }

        // 6. Contraprova.
        const after = await getMainSha(ctx.token);

        if (after !== commit.sha) {
          return out({
            ok: false,
            status: "MAIN_POSTCONDITION_FAILED",
            before,
            commit: commit.sha,
            after,
          });
        }

        const deploy = await deployHealth();

        return out({
          ok: true,
          status: "COMMITTED_MAIN",
          repository: `${OWNER}/${REPO}`,
          branch: BRANCH,
          path,
          before,
          commit: commit.sha,
          after,
          mainFixedPoint: after === commit.sha,
          deployListener: deploy,
          proof: {
            directMain: true,
            prCreated: false,
            branchCreated: false,
            forcePush: false,
            secretsPathAllowed: false,
          },
          warning:
            "COMMITTED_MAIN != DEPLOYED. deploy_status/HEAD da VPS ainda precisa convergir para o commit.",
        });
      } catch (error) {
        return out({
          ok: false,
          status: "ADMIN_COMMIT_MAIN_FAILED",
          before,
          path,
          githubStatus: error?.status || null,
          error: String(error?.message || error),
        });
      }
    },
  },
];
