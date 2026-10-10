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

export type EventoMcpCentralDark = {
  at: string | null;
  sector: string | null;
  service: string | null;
  kind: string | null;
  level: "info" | "warn" | "error" | "other";
};

type CommitCentralDark = {
  sha: string;
  mensagem: string;
  data: string;
};

export type EstadoCentralDark = {
  gmail: Estado;
  mcpHealth: Estado;
  mcpHealthHttp: number | null;
  mcpEventosEstado: "OBSERVED" | "NO_RECENT_EVENTS" | "UNAVAILABLE" | "UNKNOWN";
  mcpEventosContagem: number | null;
  mcpEventosNiveis: Record<"info" | "warn" | "error" | "other", number> | null;
  mcpEventosRecentes: EventoMcpCentralDark[];
  mcpEventosFonte: string;
  mcpEventosObservadoEm: string | null;
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

export function apiBase() {
  return (process.env["CENTRALDARK_API_BASE_URL"] ?? DEFAULT_API_BASE).replace(/\/$/, "");
}

function objetoJson(valor: unknown): valor is JsonObject {
  return !!valor && typeof valor === "object" && !Array.isArray(valor);
}

function texto(valor: unknown) {
  return typeof valor === "string" && valor.length > 0 ? valor : null;
}

async function medirApi(path: string, base = apiBase()): Promise<Probe> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const resposta = await fetch(`${base}${path}`, {
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
    const mcpBase = (process.env["CENTRALDARK_MCP_BASE_URL"] || "https://mcp.centralldark.com").replace(/\/+$/, "");
    const [
      github,
      liveFabric,
      grafoVivo,
      omniRouter,
      apiHealth,
      heartbeatRaw,
      mcpHealthRaw,
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
      medirApi("/heartbeat", mcpBase),
      medirApi("/health", mcpBase),
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

    // PROJECT_BOUNDARY_V1: only CentralDark official event funnel;
    // NEVER query TelePainel notifications_log from this cockpit.
    const mcpEvidence = objetoJson(mcpHealthRaw.dados?.["sectorEvidence"]) ? mcpHealthRaw.dados["sectorEvidence"] : null;
    const mcpEvents = objetoJson(mcpEvidence?.["events"]) ? mcpEvidence["events"] : null;
    const eventStateRaw = texto(mcpEvents?.["state"]);
    const mcpEventosEstado: EstadoCentralDark["mcpEventosEstado"] =
      mcpHealthRaw.httpStatus !== 200 ? "UNAVAILABLE" :
      eventStateRaw === "OBSERVED" || eventStateRaw === "NO_RECENT_EVENTS" || eventStateRaw === "UNAVAILABLE"
        ? eventStateRaw : "UNKNOWN";
    const sampleCount = mcpEvents?.["countInSample"];
    const mcpEventosContagem = typeof sampleCount === "number" && Number.isSafeInteger(sampleCount) && sampleCount >= 0
      ? sampleCount : null;
    const rawLevels = objetoJson(mcpEvents?.["byLevel"]) ? mcpEvents["byLevel"] : null;
    const eventLevels = ["info", "warn", "error", "other"] as const;
    const mcpEventosNiveis = rawLevels
      ? Object.fromEntries(eventLevels.map((name) => {
          const val = rawLevels[name];
          return [name, typeof val === "number" && Number.isSafeInteger(val) && val >= 0 ? val : 0];
        })) as Record<"info" | "warn" | "error" | "other", number>
      : null;
    const bounded = (value: unknown, length = 48): string | null =>
      typeof value === "string" && /^[a-z][a-z0-9._-]*$/.test(value) && value.length <= length ? value : null;
    const rawRecent = Array.isArray(mcpEvents?.["recent"]) ? mcpEvents["recent"] : [];
    const mcpEventosRecentes: EventoMcpCentralDark[] = rawRecent.slice(0, 12)
      .filter(objetoJson).map((item) => {
        const level = item["level"];
        return {
          at: typeof item["at"] === "string" && !Number.isNaN(Date.parse(item["at"])) ? item["at"].slice(0, 40) : null,
          sector: bounded(item["sector"]),
          service: bounded(item["service"]),
          kind: bounded(item["kind"]),
          level: level === "info" || level === "warn" || level === "error" ? level : "other",
        };
      });
    const atual = github.commits[0] ?? null;
    const gitLive = objetoJson(liveFabric.dados?.["git"]) ? liveFabric.dados["git"] : null;
    const vpsSha = texto(gitLive?.["head"]);
    const mainSha = atual?.sha ?? null;
    const sincronizado = !!mainSha && !!vpsSha && mainSha === vpsSha;
    const deltaVps = await medirDelta(vpsSha, mainSha);
    // A checkout SHA coincidence is a Git sync observation, NOT loaded runtime proof.
    // Keep deployment UNKNOWN until the canonical deploy owner returns a signed/current receipt.
    const deploy: Estado = !mainSha || !vpsSha ? "UNKNOWN" : sincronizado ? "UNKNOWN" : "BLOCKED";

    return {
      gmail: "AUTH_REQUIRED",
      mcpHealth: mcpHealthRaw.estado,
      mcpHealthHttp: mcpHealthRaw.httpStatus,
      mcpEventosEstado,
      mcpEventosContagem,
      mcpEventosNiveis,
      mcpEventosRecentes,
      mcpEventosFonte: mcpBase + "/health#sectorEvidence.events",
      mcpEventosObservadoEm: texto(mcpEvidence?.["observedAt"]),
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


/**
 * CENTRALDARK_COCKPIT_STATUS_V1
 * Projeção pública mínima dos MESMOS sensores do Cockpit e MCP oficial.
 * Não cria outro monitor, não autentica como admin, não lê credenciais.
 * api.centralldark.com (Hermes Core) e mcp.centralldark.com (MCP)
 * são donos diferentes; health=200 não é deploy nem execução comprovada.
 */
export async function obterStatusSetorialCentralDark() {
  const mcpBase = (process.env["CENTRALDARK_MCP_BASE_URL"] || "https://mcp.centralldark.com").replace(/\/+$/, "");
  const observedAt = new Date().toISOString();
  const [mcp, deep, heart, intent, hermes, github] = await Promise.all([
    medirApi("/health", mcpBase),
    medirApi("/health/deep", mcpBase),
    medirApi("/heartbeat", mcpBase),
    medirApi("/intent/status", mcpBase),
    medirApi("/health"),
    medirGithub(),
  ]);

  type PublicState = "OBSERVED" | "DEGRADED" | "BLOCKED" | "STALE" | "AUTH_REQUIRED" | "UNAVAILABLE" | "UNKNOWN";
  const resultState = (probe: Probe): PublicState => {
    if (probe.httpStatus === 401 || probe.httpStatus === 403) return "AUTH_REQUIRED";
    if (probe.httpStatus !== 200) return probe.httpStatus ? "UNAVAILABLE" : "UNKNOWN";
    return "OBSERVED";
  };
  const stringOf = (value: unknown, max = 100): string | null =>
    typeof value === "string" && value.length > 0 ? value.slice(0, max) : null;
  const numberOf = (value: unknown): number | null =>
    typeof value === "number" && Number.isFinite(value) ? value : null;
  const cleanSectorState = (raw: unknown): PublicState => {
    switch (raw) {
      case "OBSERVED": case "DEGRADED": case "BLOCKED": case "STALE":
      case "AUTH_REQUIRED": case "UNAVAILABLE": case "UNKNOWN": return raw;
      default: return "UNKNOWN";
    }
  };
  const evidence = objetoJson(mcp.dados?.["sectorEvidence"]) ? mcp.dados["sectorEvidence"] : null;
  const eventsRaw = objetoJson(evidence?.["events"]) ? evidence["events"] : null;
  const sectorsRaw = Array.isArray(evidence?.["sectors"]) ? evidence["sectors"] : [];
  const sectors = sectorsRaw.slice(0, 24).filter(objetoJson).map((row) => ({
    id: stringOf(row["id"], 48) || "UNCLASSIFIED",
    state: cleanSectorState(row["state"]),
    source: stringOf(row["source"], 120),
    observedAt: stringOf(row["observedAt"], 40),
    nextCursor: stringOf(row["nextCursor"], 120),
  }));
  const recentRaw = Array.isArray(eventsRaw?.["recent"]) ? eventsRaw["recent"] : [];
  const recent = recentRaw.slice(0, 12).filter(objetoJson).map((row) => ({
    at: stringOf(row["at"], 40),
    sector: stringOf(row["sector"], 48),
    service: stringOf(row["service"], 48),
    kind: stringOf(row["kind"], 48),
    level: stringOf(row["level"], 16),
  }));
  const levelCounts: Record<string, number> = {};
  if (objetoJson(eventsRaw?.["byLevel"])) {
    for (const key of ["info", "warn", "error", "other"]) {
      const value = numberOf(eventsRaw["byLevel"][key]);
      if (value !== null && value >= 0) levelCounts[key] = value;
    }
  }

  const heartSelf = stringOf(heart.dados?.["self"], 24);
  const intentState = stringOf(intent.dados?.["state"], 48);
  const deepStatus = stringOf(deep.dados?.["status"], 40);
  const healthScore = numberOf(deep.dados?.["score"]);
  const mcpState = resultState(mcp);
  const deepState = resultState(deep) === "OBSERVED" && deepStatus === "degraded"
    ? "DEGRADED" : resultState(deep);
  const heartState: PublicState = resultState(heart) === "OBSERVED" && heartSelf === "stale"
    ? "STALE" : resultState(heart);
  const items = [
    { id: "MCP", state: mcpState, source: mcpBase + "/health", httpStatus: mcp.httpStatus },
    { id: "MCP_DEEP", state: deepState, source: mcpBase + "/health/deep", httpStatus: deep.httpStatus, score: healthScore },
    { id: "ONE_HEART", state: heartState, source: mcpBase + "/heartbeat", httpStatus: heart.httpStatus, self: heartSelf },
    { id: "INTENT", state: resultState(intent), source: mcpBase + "/intent/status",
      httpStatus: intent.httpStatus, stateOwner: intentState,
      fixedPoint: intent.dados?.["fixedPoint"] === true && intent.dados?.["executionProven"] === true },
    { id: "HERMES_CORE", state: resultState(hermes), source: apiBase() + "/health", httpStatus: hermes.httpStatus },
    { id: "GITHUB_MAIN", state: github.estado === "PASS" ? "OBSERVED" : github.estado === "AUTH_REQUIRED" ? "AUTH_REQUIRED" : "UNKNOWN",
      source: "GitHub API · ServerVpss/CentralDark@main", sha: github.commits[0]?.sha || null },
  ];
  const available = items.filter((x) => x.state === "OBSERVED").length;
  const unknown = items.filter((x) => ["UNKNOWN","UNAVAILABLE","AUTH_REQUIRED","STALE"].includes(x.state)).length;
  return {
    schema: "centraldark.cockpit.status.v1",
    ok: true, // o agregador respondeu; jamais significa FIXED_POINT global
    service: "centraldark-instinto-superior",
    observedAt,
    status: available > 0 ? "PARTIAL_OBSERVED" : "UNAVAILABLE",
    fixedPointGlobal: false,
    owners: { cockpit: "apps/instinto-superior/src/lib/cockpit.functions.ts",
      mcp: "apps/modulos/mcp/src/index.js",
      oldPanel: "apps/modulos/status/",
      hud: "docs/HUD/HUD.html" },
    checks: items,
    sectors,
    events: {
      source: mcpBase + "/health#sectorEvidence.events",
      state: eventsRaw ? "OBSERVED_SAMPLE" : "UNAVAILABLE",
      countInSample: numberOf(eventsRaw?.["countInSample"]),
      windowMs: numberOf(eventsRaw?.["windowMs"]),
      byLevel: levelCounts,
      recent,
      scope: "BOUNDED_SANITIZED_SAMPLE_NOT_COMPLETE_LEDGER",
    },
    summary: {
      observed: available, unavailableOrUnknown: unknown,
      optionalUnavailableIsNotGlobalFailure: true,
      originStatusIsNotRuntimeDeploy: true,
    },
    legacy: {
      domain: "status.centralldark.com",
      owner: "apps/modulos/status/",
      state: "PRESERVED_PENDING_PARITY_AND_RUNTIME_PROOF",
      policy: "DO_NOT_DELETE_CADDY_DNS_OR_LEGACY_ASSETS_BEFORE_CONSUMER_MIGRATION",
    },
  };
}


/**
 * Migração incremental do /admin visual para Instinto Superior.
 * Usa somente GETs públicos, de leitura, dos owners existentes.
 * Sem cookie admin, sem token no browser e sem executar mutações.
 * Os controles administrativos privilegiados continuam no MCP até que
 * autenticação delegada e contraprova E2E sejam implementadas.
 */
export const lerMcpPainelCentralDark = createServerFn({ method: "GET" }).handler(async () => {
  const mcpBase = (process.env["CENTRALDARK_MCP_BASE_URL"] || "https://mcp.centralldark.com").replace(/\/+$/, "");
  const [setores, tools, linear, figma, catalog, legacy, statusOverview] = await Promise.all([
    obterStatusSetorialCentralDark(),
    medirApi("/tools.json", mcpBase),
    medirApi("/linear/status", mcpBase),
    medirApi("/figma/status", mcpBase),
    medirApi("/status.json", mcpBase),
    medirApi("/admin/api/e2e/publico", mcpBase),
    medirApi("/status/overview"),
  ]);

  const textField = (v: unknown, length = 100) => typeof v === "string" ? v.slice(0, length) : null;
  const countField = (v: unknown) => typeof v === "number" && Number.isFinite(v) ? v : null;
  const safeProbe = (p: Probe) => ({
    httpStatus: p.httpStatus,
    state: p.httpStatus === 200 ? "HTTP_OBSERVED" :
      p.httpStatus === 401 || p.httpStatus === 403 ? "AUTH_REQUIRED" :
      p.httpStatus === null ? "UNAVAILABLE" : "HTTP_FAIL",
    error: p.erro ? String(p.erro).slice(0, 140) : null,
  });
  const rawSections = objetoJson(statusOverview.dados?.["sections"]) ? statusOverview.dados["sections"] : null;
  const allowedSections = ["projeto", "infraestrutura", "mcp_24h", "diagnostico_ias", "conselho", "capsula", "mcp_legado", "grafo"];
  const sections = allowedSections.map((key) => {
    const candidate = rawSections?.[key];
    const d = objetoJson(candidate) ? candidate : null;
    const status = textField(d?.["state"], 30) ?? "UNKNOWN";
    return {
      id: key,
      state: ["OBSERVED", "STALE", "UNKNOWN"].includes(status) ? status : "UNKNOWN",
      source: textField(d?.["source"], 90),
      observedAt: textField(d?.["observed_at"], 35),
      ageSeconds: countField(d?.["age_seconds"]),
      // Apenas as projeções previamente sanitizadas do status-api existente.
      data: objetoJson(d?.["data"]) ? d["data"] : null,
    };
  });
  const toolsPayload = tools.dados;
  const toolList = Array.isArray(toolsPayload?.["tools"]) ? toolsPayload["tools"] : [];
  const toolNames = toolList.slice(0, 90).filter(objetoJson).map(t => textField(t["name"], 90)).filter((name): name is string => !!name);
  return {
    schema: "centraldark.cockpit.mcp-admin-migration.v1",
    observedAt: new Date().toISOString(),
    owners: { mcp: "apps/modulos/mcp/src/index.js", view: "apps/instinto-superior/src/components/central/PainelAdminCentralDark.tsx" },
    checks: setores.checks.map(item => ({ id: item.id, state: item.state, source: item.source,
      httpStatus: "httpStatus" in item && typeof item.httpStatus === "number" ? item.httpStatus : null })),
    sectors: setores.sectors,
    events: setores.events,
    tools: { probe: safeProbe(tools), reported: countField(toolsPayload?.["toolCount"]) ?? (toolList.length || null), names: toolNames },
    integrations: {
      linear: { ...safeProbe(linear), ok: linear.dados?.["ok"] === true },
      figma: { ...safeProbe(figma), ok: figma.dados?.["ok"] === true },
      connectors: { ...safeProbe(catalog), count: Array.isArray(catalog.dados?.["connections"]) ? catalog.dados["connections"].length : null },
      e2ePublic: { ...safeProbe(legacy), ok: legacy.dados?.["ok"] === true },
    },
    megaPainel: {
      probe: safeProbe(statusOverview),
      sections,
      coverage: objetoJson(statusOverview.dados?.["coverage"]) ? statusOverview.dados["coverage"] : null,
    },
    access: "PUBLIC_SANITIZED_READ_ONLY",
    adminMutations: "MCP_AUTH_DELEGATION_NOT_YET_PROVEN",
    fixedPoint: false,
  };
});
