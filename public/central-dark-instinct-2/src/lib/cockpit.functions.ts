import { createServerFn } from "@tanstack/react-start";

const GATEWAY = "https://connector-gateway.lovable.dev/github";
const GITHUB_API = "https://api.github.com";
const DEFAULT_API_BASE = "https://api.centralldark.com";
const REQUEST_TIMEOUT_MS = 8_000;

export type Estado = "PASS" | "RUNNING" | "BLOCKED" | "AUTH_REQUIRED" | "UNKNOWN" | "FAIL";

type JsonObject = Record<string, unknown>;

type Probe = {
  estado: Estado;
  httpStatus: number | null;
  erro: string | null;
  dados: JsonObject | null;
};

type CommitCentralDark = {
  sha: string;
  mensagem: string;
  data: string;
};

export type EstadoCentralDark = {
  gmail: Estado;
  githubLovable: Estado;
  desktop: Estado;
  repositorio: "ServerVpss/CentralDark";
  branch: "main";
  vpsSha: string | null;
  deltaVps: number | null;
  sincronizado: boolean;
  deploy: Estado;
  build: Estado;
  github: Estado;
  liveFabric: Estado;
  grafoVivo: Estado;
  omniRouter: Estado;
  apiHealth: Estado;
  heartbeat: Estado;
  omniModels: Estado;
  receipts: Estado;
  casaSite: Estado;
  screenpipe: Estado;
  actions: Estado;
  actionsLinuxMinutes: number | null;
  actionsWindowsMinutes: number | null;
  actionsStorageGbHours: number | null;
  actionsGrossAmountUsd: number | null;
  actionsNetAmountUsd: number | null;
  actionsPeriod: string | null;
  executionPolicy: "CASA_HEAVY_GITHUB_ACTIONS_ON_DEMAND";
  mainSha: string | null;
  sha: string | null;
  mensagem: string | null;
  commits: CommitCentralDark[];
  fonte: string;
  atualizadoEm: string;
  liveFabricFonte: string;
  liveFabricHttp: number | null;
  grafoHttp: number | null;
  omniHttp: number | null;
  nextCursor: string | null;
  erroLiveFabric: string | null;
  apiHealthHttp: number | null;
  heartbeatHttp: number | null;
  heartbeatSelf: string | null;
  omniModelsHttp: number | null;
  receiptsHttp: number | null;
  casaSiteHttp: number | null;
  screenpipeHttp: number | null;
  screenpipeDetail: string | null;
  actionsFonte: string;
  actionsErro: string | null;
  gmailFonte: string;
  desktopFonte: string;
};

function acessoGitHub() {
  const token = process.env["GITHUB_TOKEN"];
  if (token) {
    return {
      base: GITHUB_API,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
      fonte: "GitHub API",
    };
  }

  const lovable = process.env["LOVABLE_API_KEY"];
  const github = process.env["GITHUB_API_KEY"];
  if (!lovable || !github) return null;
  return {
    base: GATEWAY,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${lovable}`,
      "X-Connection-Api-Key": github,
    },
    fonte: "Conector GitHub",
  };
}

function apiBase() {
  return (process.env["CENTRALDARK_API_BASE_URL"] ?? DEFAULT_API_BASE).replace(/\/$/, "");
}

function objetoJson(valor: unknown): valor is JsonObject {
  return !!valor && typeof valor === "object" && !Array.isArray(valor);
}

function texto(valor: unknown) {
  return typeof valor === "string" && valor.length > 0 ? valor : null;
}

async function medirApi(path: string): Promise<Probe> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const resposta = await fetch(`${apiBase()}${path}`, {
      headers: { accept: "application/json" },
      cache: "no-store",
      signal: controller.signal,
    });

    if (!resposta.ok) {
      return {
        estado: "FAIL",
        httpStatus: resposta.status,
        erro: `HTTP ${resposta.status}`,
        dados: null,
      };
    }

    const candidato = (await resposta.json()) as unknown;
    if (!objetoJson(candidato)) {
      return {
        estado: "FAIL",
        httpStatus: resposta.status,
        erro: "Resposta JSON fora do contrato",
        dados: null,
      };
    }

    return {
      estado: candidato["ok"] === true ? "PASS" : candidato["ok"] === false ? "FAIL" : "RUNNING",
      httpStatus: resposta.status,
      erro: candidato["ok"] === undefined ? "Rota respondeu JSON sem campo ok" : null,
      dados: candidato,
    };
  } catch (erro) {
    return {
      estado: "UNKNOWN",
      httpStatus: null,
      erro: erro instanceof Error ? erro.message : String(erro),
      dados: null,
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function medirReachable(url: string, casaOnly = false): Promise<Probe> {
  if (casaOnly && process.platform !== "win32") {
    return { estado: "UNKNOWN", httpStatus: null, erro: "CASA_ONLY_WINDOWS", dados: null };
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const resposta = await fetch(url, {
      headers: { accept: "application/json,text/html;q=0.9,*/*;q=0.8" },
      cache: "no-store",
      signal: controller.signal,
    });
    if (!resposta.ok) {
      return {
        estado: "FAIL",
        httpStatus: resposta.status,
        erro: `HTTP ${resposta.status}`,
        dados: null,
      };
    }
    let dados: JsonObject | null = null;
    try {
      const candidato = (await resposta.json()) as unknown;
      if (objetoJson(candidato)) dados = candidato;
    } catch {
      dados = null;
    }
    const status = texto(dados?.["status"])?.toLowerCase() ?? null;
    const estado: Estado =
      dados?.["ok"] === false
        ? "FAIL"
        : dados?.["ok"] === true || status === "healthy"
          ? "PASS"
          : "RUNNING";
    return { estado, httpStatus: resposta.status, erro: null, dados };
  } catch (erro) {
    return {
      estado: "UNKNOWN",
      httpStatus: null,
      erro: erro instanceof Error ? erro.message : String(erro),
      dados: null,
    };
  } finally {
    clearTimeout(timeout);
  }
}

type ActionsUsageItem = {
  product?: string;
  sku?: string;
  grossQuantity?: number;
  netQuantity?: number;
  grossAmount?: number;
  netAmount?: number;
  unitType?: string;
};

async function medirActions() {
  const token = process.env["GITHUB_TOKEN"];
  if (!token) {
    return {
      estado: "AUTH_REQUIRED" as Estado,
      linux: null,
      windows: null,
      storage: null,
      grossUsd: null,
      netUsd: null,
      period: null,
      fonte: "GitHub Billing API · GITHUB_TOKEN ausente",
      erro: null,
    };
  }
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;
  const url = `${GITHUB_API}/organizations/ServerVpss/settings/billing/usage/summary?year=${year}&month=${month}`;
  try {
    const resposta = await fetch(url, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2026-03-10",
      },
      cache: "no-store",
    });
    if (resposta.status === 401 || resposta.status === 403) {
      return {
        estado: "AUTH_REQUIRED" as Estado,
        linux: null,
        windows: null,
        storage: null,
        grossUsd: null,
        netUsd: null,
        period: `${year}-${String(month).padStart(2, "0")}`,
        fonte: "GitHub Billing API",
        erro: `HTTP ${resposta.status}`,
      };
    }
    if (!resposta.ok) {
      return {
        estado: "FAIL" as Estado,
        linux: null,
        windows: null,
        storage: null,
        grossUsd: null,
        netUsd: null,
        period: `${year}-${String(month).padStart(2, "0")}`,
        fonte: "GitHub Billing API",
        erro: `HTTP ${resposta.status}`,
      };
    }
    const payload = (await resposta.json()) as { usageItems?: ActionsUsageItem[] };
    const items = (payload.usageItems ?? []).filter((item) => item.product === "Actions");
    const bySku = (sku: string) => items.find((item) => item.sku === sku);
    const grossUsd = items.reduce((sum, item) => sum + (item.grossAmount ?? 0), 0);
    const netUsd = items.reduce((sum, item) => sum + (item.netAmount ?? 0), 0);
    return {
      estado: "PASS" as Estado,
      linux: bySku("actions_linux")?.grossQuantity ?? null,
      windows: bySku("actions_windows")?.grossQuantity ?? null,
      storage: bySku("actions_storage")?.grossQuantity ?? null,
      grossUsd,
      netUsd,
      period: `${year}-${String(month).padStart(2, "0")}`,
      fonte: "GitHub Billing API",
      erro: null,
    };
  } catch (erro) {
    return {
      estado: "UNKNOWN" as Estado,
      linux: null,
      windows: null,
      storage: null,
      grossUsd: null,
      netUsd: null,
      period: null,
      fonte: "GitHub Billing API",
      erro: erro instanceof Error ? erro.message : String(erro),
    };
  }
}

async function medirGithub() {
  const acesso = acessoGitHub();
  if (!acesso) {
    return {
      estado: "AUTH_REQUIRED" as Estado,
      commits: [] as CommitCentralDark[],
      fonte: "GitHub sem credencial de leitura",
    };
  }

  try {
    const resposta = await fetch(
      `${acesso.base}/repos/ServerVpss/CentralDark/commits?sha=main&per_page=4`,
      { headers: acesso.headers, cache: "no-store" },
    );
    if (resposta.status === 401 || resposta.status === 403) {
      return {
        estado: "AUTH_REQUIRED" as Estado,
        commits: [] as CommitCentralDark[],
        fonte: `GitHub respondeu ${resposta.status}`,
      };
    }
    if (!resposta.ok) {
      return {
        estado: "FAIL" as Estado,
        commits: [] as CommitCentralDark[],
        fonte: `GitHub respondeu ${resposta.status}`,
      };
    }

    const payload = (await resposta.json()) as Array<{
      sha: string;
      commit?: { message?: string; author?: { date?: string } };
    }>;
    const commits = payload.map((commit) => ({
      sha: commit.sha,
      mensagem: commit.commit?.message?.split("\n")[0] ?? "Sem mensagem",
      data: commit.commit?.author?.date ?? "",
    }));
    return {
      estado: commits[0] ? ("PASS" as Estado) : ("UNKNOWN" as Estado),
      commits,
      fonte: `${acesso.fonte} · ServerVpss/CentralDark@main`,
    };
  } catch {
    return {
      estado: "UNKNOWN" as Estado,
      commits: [] as CommitCentralDark[],
      fonte: "GitHub inacessível",
    };
  }
}

async function medirDelta(vpsSha: string | null, mainSha: string | null) {
  const acesso = acessoGitHub();
  if (!acesso || !vpsSha || !mainSha) return null;
  if (vpsSha === mainSha) return 0;

  try {
    const resposta = await fetch(
      `${acesso.base}/repos/ServerVpss/CentralDark/compare/${encodeURIComponent(vpsSha)}...${encodeURIComponent(mainSha)}`,
      { headers: acesso.headers, cache: "no-store" },
    );
    if (!resposta.ok) return null;
    const payload = (await resposta.json()) as { ahead_by?: number };
    return typeof payload.ahead_by === "number" ? payload.ahead_by : null;
  } catch {
    return null;
  }
}

// Único owner do HUD vivo: agrega GitHub + API CentralDark e nunca promove ausência de prova.
export const lerEstadoCentralDark = createServerFn({ method: "GET" }).handler(
  async (): Promise<EstadoCentralDark> => {
    const [
      github,
      liveFabric,
      grafoVivo,
      omniRouter,
      apiHealth,
      heartbeatRaw,
      omniModels,
      receipts,
      casaSite,
      screenpipe,
      actions,
    ] = await Promise.all([
      medirGithub(),
      medirApi("/api/live-fabric/status"),
      medirApi("/api/live-fabric/graph"),
      medirApi("/api/omni/status"),
      medirApi("/health"),
      medirApi("/heartbeat"),
      medirApi("/api/omni/models"),
      medirApi("/api/microdeploy/receipts/index.json"),
      medirReachable("http://127.0.0.1:4175/", true),
      medirReachable("http://127.0.0.1:3030/health", true),
      medirActions(),
    ]);
    const heartbeatSelf = texto(heartbeatRaw.dados?.["self"]);
    const heartbeat: Probe =
      heartbeatSelf === "stale"
        ? { ...heartbeatRaw, estado: "FAIL", erro: "self=stale" }
        : heartbeatRaw;

    const atual = github.commits[0] ?? null;
    const gitLive = objetoJson(liveFabric.dados?.["git"]) ? liveFabric.dados["git"] : null;
    const vpsSha = texto(gitLive?.["head"]);
    const mainSha = atual?.sha ?? null;
    const sincronizado = !!mainSha && !!vpsSha && mainSha === vpsSha;
    const deltaVps = await medirDelta(vpsSha, mainSha);
    const deploy: Estado = !mainSha || !vpsSha ? "UNKNOWN" : sincronizado ? "PASS" : "FAIL";

    return {
      gmail: "AUTH_REQUIRED",
      githubLovable: github.estado,
      desktop: "UNKNOWN",
      repositorio: "ServerVpss/CentralDark",
      branch: "main",
      vpsSha,
      deltaVps,
      sincronizado,
      deploy,
      build: "UNKNOWN",
      github: github.estado,
      liveFabric: liveFabric.estado,
      grafoVivo: grafoVivo.estado,
      omniRouter: omniRouter.estado,
      apiHealth: apiHealth.estado,
      heartbeat: heartbeat.estado,
      omniModels: omniModels.estado,
      receipts: receipts.estado,
      casaSite: casaSite.estado,
      screenpipe: screenpipe.estado,
      actions: actions.estado,
      actionsLinuxMinutes: actions.linux,
      actionsWindowsMinutes: actions.windows,
      actionsStorageGbHours: actions.storage,
      actionsGrossAmountUsd: actions.grossUsd,
      actionsNetAmountUsd: actions.netUsd,
      actionsPeriod: actions.period,
      executionPolicy: "CASA_HEAVY_GITHUB_ACTIONS_ON_DEMAND",
      mainSha,
      sha: mainSha,
      mensagem: atual?.mensagem ?? null,
      commits: github.commits,
      fonte: github.fonte,
      atualizadoEm: new Date().toISOString(),
      liveFabricFonte: apiBase(),
      liveFabricHttp: liveFabric.httpStatus,
      grafoHttp: grafoVivo.httpStatus,
      omniHttp: omniRouter.httpStatus,
      nextCursor: texto(liveFabric.dados?.["next_cursor"]),
      erroLiveFabric: liveFabric.erro,
      apiHealthHttp: apiHealth.httpStatus,
      heartbeatHttp: heartbeat.httpStatus,
      heartbeatSelf,
      omniModelsHttp: omniModels.httpStatus,
      receiptsHttp: receipts.httpStatus,
      casaSiteHttp: casaSite.httpStatus,
      screenpipeHttp: screenpipe.httpStatus,
      screenpipeDetail: texto(screenpipe.dados?.["status"]),
      actionsFonte: actions.fonte,
      actionsErro: actions.erro,
      gmailFonte: "Sensor externo Gmail/ChatGPT · adapter do Cockpit ainda não ligado",
      desktopFonte: "Remote Desktop Commander externo · status não inferido pelo app",
    };
  },
);
