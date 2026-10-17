import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Verificação de admin feita no servidor, pela tabela de papéis (fail-closed).
export const verificarAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    return { admin: !error && !!data, medidoEm: new Date().toISOString() };
  });



// CentralDark Gram: owner MTProto existente na VPS (127.0.0.1:8790).
// Leitura server-side, autenticada e limitada a status. Nunca retorna sessão, me, telefone ou token.
export type StatusGramMTProto = {
  gateway: "RUNNING" | "UNKNOWN";
  configurado: boolean | null;
  sessaoPresente: boolean | null;
  autorizado: boolean | null;
  consultaEm: string;
  owner: "centraldark-telegram-mtproto.service";
  motivo: string | null;
};

export const lerStatusGramMTProto = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<StatusGramMTProto> => {
    const { data, error } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (error || !data) throw new Response("Proibido", { status: 403 });

    const base = "http://127.0.0.1:8790";
    const resultado: StatusGramMTProto = {
      gateway: "UNKNOWN",
      configurado: null,
      sessaoPresente: null,
      autorizado: null,
      consultaEm: new Date().toISOString(),
      owner: "centraldark-telegram-mtproto.service",
      motivo: null,
    };
    try {
      const ler = async (path: "/health" | "/status") => {
        const resposta = await fetch(base + path, {
          cache: "no-store",
          redirect: "error",
          signal: AbortSignal.timeout(7000),
        });
        if (!resposta.ok) throw new Error("Upstream HTTP");
        return (await resposta.json()) as Record<string, unknown>;
      };
      const health = await ler("/health");
      if (health.ok !== true) throw new Error("Health not ready");
      resultado.gateway = "RUNNING";
      resultado.configurado = health.configured === true;
      resultado.sessaoPresente = health.hasSession === true;
      if (resultado.configurado && resultado.sessaoPresente) {
        const status = await ler("/status");
        resultado.autorizado =
          status.ok === true && typeof status.connected === "boolean"
            ? status.connected
            : null;
        if (resultado.autorizado === null) resultado.motivo = "STATUS_UNVERIFIED";
      } else {
        resultado.autorizado = false;
        resultado.motivo = "CONFIG_OR_SESSION_MISSING";
      }
    } catch {
      // Sem detalhes da exceção de rede ou dados sensíveis na resposta.
      resultado.motivo = "MTPROTO_INTERNAL_UNREACHABLE";
    }
    return resultado;
  });

// Consumo privado: sem API autorizada de saldo/créditos, nada é inventado.
export const lerConsumoPrivado = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!data) throw new Response("Proibido", { status: 403 });
    return {
      estado: "UNKNOWN" as const,
      motivo: "Nenhuma fonte autorizada de saldo, créditos ou tokens está conectada.",
      itens: [
        { nome: "Saldo Lovable", valor: null },
        { nome: "Créditos consumidos", valor: null },
        { nome: "Tokens", valor: null },
        { nome: "Gasto por provedor/modelo", valor: null },
        { nome: "Orçamento", valor: null },
      ],
      medidoEm: null as string | null,
    };
  });


// Gênesis reutiliza o workflow de regressão existente. Acionar != passar.
// A API GitHub é acessada exclusivamente no servidor, com papel admin verificado.
type GenesisRegressionState = "UNKNOWN" | "AUTH_REQUIRED" | "REQUESTED" |
  "QUEUED" | "IN_PROGRESS" | "BUILD_PASS" | "FAIL" | "BLOCKED";

type GenesisRegressionReceipt = {
  state: GenesisRegressionState;
  mainSha: string | null;
  workflowSha: string | null;
  runId: number | null;
  runUrl: string | null;
  observedAt: string;
  build: "PASS" | "FAIL" | "UNKNOWN";
  install: "UNPROVEN";
  connect: "UNPROVEN";
  prove: "UNPROVEN";
  reason: string;
};

type GenesisWorkflowRun = { id: number; head_sha: string; html_url: string; status: string; conclusion: string | null };

const GENESIS_WORKFLOW_API =
  "https://api.github.com/repos/ServerVpss/CentralDark/actions/workflows/test.yml";

function genesisHeaders(): Record<string, string> | null {
  const token = process.env["GITHUB_TOKEN"] || process.env["GH_TOKEN"];
  if (!token) return null;
  return {
    Authorization: "Bearer " + token,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

async function genesisGithub(path: string, headers: Record<string, string>, init: RequestInit = {}) {
  return fetch(path, {
    ...init,
    headers: { ...headers, ...(init.headers || {}) },
    cache: "no-store",
    signal: AbortSignal.timeout(9000),
  });
}

function genesisReceipt(
  state: GenesisRegressionState, reason: string, mainSha: string | null = null,
  workflowSha: string | null = null, runId: number | null = null,
  runUrl: string | null = null,
): GenesisRegressionReceipt {
  return {
    state, reason, mainSha, workflowSha, runId, runUrl,
    observedAt: new Date().toISOString(),
    build: state === "BUILD_PASS" ? "PASS" : state === "FAIL" ? "FAIL" : "UNKNOWN",
    install: "UNPROVEN", connect: "UNPROVEN", prove: "UNPROVEN",
  };
}

// GET só retorna estado de runs com SHA da main atual; run velho não vira PASS.
export const consultarRegressaoGenesis = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<GenesisRegressionReceipt> => {
    const { data: role, error: roleError } = await context.supabase.from("user_roles")
      .select("role").eq("user_id", context.userId).eq("role", "admin").maybeSingle();
    if (roleError || !role) throw new Response("Proibido", { status: 403 });
    const headers = genesisHeaders();
    if (!headers) return genesisReceipt("AUTH_REQUIRED", "GITHUB_TOKEN_NOT_CONFIGURED");
    try {
      const shaResponse = await genesisGithub(
        "https://api.github.com/repos/ServerVpss/CentralDark/git/ref/heads/main", headers);
      if (!shaResponse.ok) return genesisReceipt("UNKNOWN", "GITHUB_MAIN_UNAVAILABLE");
      const mainSha: string | null = (await shaResponse.json())?.object?.sha || null;
      if (!mainSha) return genesisReceipt("UNKNOWN", "MAIN_SHA_UNPROVEN");
      const runsResponse = await genesisGithub(GENESIS_WORKFLOW_API +
        "/runs?branch=main&per_page=10", headers);
      if (!runsResponse.ok) return genesisReceipt("UNKNOWN", "WORKFLOW_READ_UNAVAILABLE", mainSha);
      const runs: GenesisWorkflowRun[] = (await runsResponse.json())?.workflow_runs || [];
      const run = runs.find((item) => item.head_sha === mainSha);
      if (!run) return genesisReceipt("UNKNOWN", "NO_SAME_SHA_RUN", mainSha);
      const id = typeof run.id === "number" ? run.id : null;
      const url = typeof run.html_url === "string" &&
        run.html_url.startsWith("https://github.com/ServerVpss/CentralDark/actions/runs/")
        ? run.html_url : null;
      const phase: GenesisRegressionState = run.conclusion === "success" ? "BUILD_PASS" :
        run.conclusion === "failure" || run.conclusion === "cancelled" ? "FAIL" :
        run.status === "in_progress" ? "IN_PROGRESS" :
        run.status === "queued" || run.status === "waiting" ? "QUEUED" : "UNKNOWN";
      return genesisReceipt(phase, "SAME_SHA_WORKFLOW", mainSha, run.head_sha, id, url);
    } catch {
      return genesisReceipt("UNKNOWN", "GITHUB_REQUEST_FAILED");
    }
  });

// POST não executa shell, não instala, não faz deploy: dispara workflow existente.
export const dispararRegressaoGenesis = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<GenesisRegressionReceipt> => {
    const { data: role, error: roleError } = await context.supabase.from("user_roles")
      .select("role").eq("user_id", context.userId).eq("role", "admin").maybeSingle();
    if (roleError || !role) throw new Response("Proibido", { status: 403 });
    const headers = genesisHeaders();
    if (!headers) return genesisReceipt("AUTH_REQUIRED", "GITHUB_TOKEN_NOT_CONFIGURED");
    try {
      const refResponse = await genesisGithub(
        "https://api.github.com/repos/ServerVpss/CentralDark/git/ref/heads/main", headers);
      if (!refResponse.ok) return genesisReceipt("BLOCKED", "MAIN_SHA_UNAVAILABLE");
      const sha: string | null = (await refResponse.json())?.object?.sha || null;
      if (!sha) return genesisReceipt("BLOCKED", "MAIN_SHA_UNPROVEN");
      const activeResponse = await genesisGithub(
        GENESIS_WORKFLOW_API + "/runs?branch=main&per_page=10", headers);
      if (!activeResponse.ok) return genesisReceipt("BLOCKED", "WORKFLOW_STATUS_UNAVAILABLE", sha);
      const active: GenesisWorkflowRun[] = (await activeResponse.json())?.workflow_runs || [];
      const existing = active.find((r) => r.head_sha === sha &&
        ["queued", "waiting", "in_progress"].includes(r.status));
      if (existing) return genesisReceipt("QUEUED", "SAME_SHA_JOB_ALREADY_ACTIVE",
        sha, sha, existing.id, existing.html_url);
      const response = await genesisGithub(GENESIS_WORKFLOW_API + "/dispatches", headers, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ref: "main" }),
      });
      if (response.status !== 204) return genesisReceipt("BLOCKED", "WORKFLOW_DISPATCH_REJECTED", sha);
      return genesisReceipt("REQUESTED", "DISPATCH_ACCEPTED_NOT_EXECUTED", sha);
    } catch {
      return genesisReceipt("UNKNOWN", "GITHUB_REQUEST_FAILED");
    }
  });
