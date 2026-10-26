import { createServerFn } from "@tanstack/react-start";
import { hostname } from "node:os";
import { execFile } from "node:child_process";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GATEWAY = "https://connector-gateway.lovable.dev/github";
const GITHUB_API = "https://api.github.com";
const DEFAULT_API_BASE = "https://api.centralldark.com";
const DEFAULT_MCP_BASE = "https://mcp.centralldark.com";
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
  screenpipe: Estado; // Alias legado: exclusivamente Screenpipe Casa.
  screenpipeVps: Estado;
  desktopVps: Estado;
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
  casaSiteErro: string | null;
  apiHealthErro: string | null;
  grafoErro: string | null;
  omniErro: string | null;
  heartbeatErro: string | null;
  receiptsErro: string | null;
  apiHealthHttp: number | null;
  heartbeatHttp: number | null;
  heartbeatSelf: string | null;
  supabaseSignals: Estado;
  supabaseEdgeOnline: number | null;
  supabaseEdgeTotal: number | null;
  supabaseRadarSources: number | null;
  mcpHealth: Estado;
  mcpRouteHealth: Estado;
  mcpStatus: Estado;
  apiRoot: Estado;
  casaCommander: Estado;
  mcpHealthHttp: number | null;
  mcpRouteHealthHttp: number | null;
  mcpStatusHttp: number | null;
  apiRootHttp: number | null;
  casaCommanderHttp: number | null;
  mcpCatalogVersion: string | null;
  mcpRouteHealthDetail: string | null;
  mcpStatusOk: boolean | null;
  casaCommanderEngine: boolean | null;
  casaCommanderDetail: string | null;
  mcpRouteHealthErro: string | null;
  mcpStatusErro: string | null;
  apiRootErro: string | null;
  casaCommanderErro: string | null;
  casaCommanderFonte: string;
  omniModelsHttp: number | null;
  receiptsHttp: number | null;
  casaSiteHttp: number | null;
  screenpipeHttp: number | null;
  screenpipeDetail: string | null;
  screenpipeFonte: string;
  screenpipeEvents: string[];
  screenpipeVpsHttp: number | null;
  screenpipeVpsDetail: string | null;
  screenpipeVpsFonte: string;
  screenpipeVpsEvents: string[];
  screenpipeCasaMedidoEm: string | null;
  screenpipeVpsMedidoEm: string | null;
  apiHealthFonte: string;
  apiHealthServico: string;
  apiHealthMedidoEm: string | null;
  desktopVpsFonte: string;
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

function mcpBase() {
  return (process.env["CENTRALDARK_MCP_BASE_URL"] ?? DEFAULT_MCP_BASE).replace(/\/$/, "");
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

    // O contrato vivo da API CentralDark usa status="ok" (não exige campo "ok").
    // A prova se aplica somente à rota GET /health; não promove serviços internos.
    const status = texto(candidato["status"])?.toLowerCase();
    const saudavel = candidato["ok"] === true || status === "ok" || status === "healthy";
    const falhou = candidato["ok"] === false || ["fail", "failed", "error", "unhealthy"].includes(status ?? "");
    return {
      estado: falhou ? "FAIL" : saudavel ? "PASS" : "RUNNING",
      httpStatus: resposta.status,
      erro: !falhou && !saudavel ? "JSON sem status de saúde reconhecido" : null,
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

// Saúde da rota Screenpipe. Status explícito determina a cor; dependências
// são detalhes opcionais, nunca requisito artificial para a rota responder.
function screenpipeIdentificado(sonda: Probe): Probe {
  if (sonda.estado === "UNKNOWN") return sonda;
  if (sonda.httpStatus !== 200) return { ...sonda, estado: "FAIL" };
  const status = texto(sonda.dados?.["status"])?.toLowerCase();
  if (status === "healthy") return { ...sonda, estado: "PASS", erro: null };
  if (status === "degraded") return { ...sonda, estado: "RUNNING", erro: null };
  if (["fail", "failed", "error", "unhealthy"].includes(status ?? "")) return { ...sonda, estado: "FAIL" };
  return { ...sonda, estado: "UNKNOWN", erro: "HEALTH_SEM_STATUS_RECONHECIDO" };
  if (sonda.httpStatus !== 200) return { ...sonda, estado: "FAIL" };
  if (status === "healthy") return { ...sonda, estado: "PASS" };
  if (status === "degraded") return { ...sonda, estado: "RUNNING" };
  return { ...sonda, estado: "UNKNOWN", erro: "STATUS_NAO_RECONHECIDO" };
}

function saidaScreenpipe(sonda: Probe): string[] {
  const saida = [`GET /health → HTTP ${sonda.httpStatus ?? "sem resposta"} · ${sonda.estado}`];
  if (sonda.erro) saida.push(`SENSOR: ${sonda.erro.slice(0, 96)}`);
  const mensagem = texto(sonda.dados?.["message"]);
  if (mensagem && sonda.estado !== "PASS") saida.push(`MOTIVO: ${mensagem.slice(0, 160)}`);
  const motivos = Array.isArray(sonda.dados?.["unhealthy_reasons"]) ? sonda.dados["unhealthy_reasons"] : null;
  if (motivos) for (const motivo of motivos.slice(0, 5)) {
    if (!objetoJson(motivo)) continue;
    const subsistema = texto(motivo["subsystem"]);
    const detalhe = texto(motivo["detail"]);
    if (subsistema && /^[a-zA-Z0-9_-]{1,32}$/.test(subsistema)) {
      saida.push(`⚠ ${subsistema}${detalhe ? `: ${detalhe.slice(0, 80)}` : ""}`);
    }
  }
  const deps = objetoJson(sonda.dados?.["dependencies"]) ? sonda.dados["dependencies"] : null;
  if (deps) for (const [nome, valor] of Object.entries(deps).slice(0, 10)) {
    if (!/^[a-zA-Z0-9_-]{1,32}$/.test(nome) || !objetoJson(valor)) continue;
    const estado = texto(valor["status"]);
    if (estado && /^[a-zA-Z0-9 _-]{1,32}$/.test(estado)) saida.push(`${nome}: ${estado}`);
  }
  return saida;
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

// O loopback pertence SEMPRE ao processo que executa esta função server-side.
// Não projetar saúde de um host remoto como saúde da Casa.
type HostScreenpipe = "CASA" | "VPS" | "UNKNOWN";
type TailscaleProbe = { estado: Estado; casaOnline: boolean | null; vpsOnline: boolean | null; peers: number | null; erro: string | null };
function origemLocalScreenpipe(): HostScreenpipe {
  const origemDeclarada = process.env["CENTRALDARK_COCKPIT_HOST_ROLE"]?.toUpperCase();
  if (origemDeclarada === "CASA" && process.platform === "win32") return "CASA";
  if (origemDeclarada === "VPS" && process.platform !== "win32") return "VPS";
  const host = hostname().toUpperCase();
  if (process.platform === "win32" && (host === "SEGREDO" || host === "WINDOWS-CASA")) return "CASA";
  return process.platform !== "win32" && host === "CENTRALDARK-OS" ? "VPS" : "UNKNOWN";
}

const SONDA_NAO_EXECUTADA: Probe = {
  estado: "UNKNOWN", httpStatus: null, erro: "SEM_MEDICAO_NESTE_HOST", dados: null,
};

function medirCasaCommanderRaw(host: HostScreenpipe): Promise<Probe> {
  if (host === "CASA") return medirReachable("http://127.0.0.1:9101/health", true);
  if (host === "VPS") {
    const ip = process.env["CENTRALDARK_CASA_TAILSCALE_IP"] || "100.123.93.25";
    return medirReachable(`http://${ip}:9100/health`);
  }
  return Promise.resolve(SONDA_NAO_EXECUTADA);
}

function normalizarCasaCommander(sonda: Probe): Probe {
  if (sonda.estado === "UNKNOWN" || !sonda.dados) return sonda;
  if (sonda.httpStatus !== 200 || sonda.dados["name"] !== "CentralDark Casa Commander" || sonda.dados["ok"] !== true) {
    return { ...sonda, estado: "FAIL", erro: "CASA_COMMANDER_IDENTITY_OR_HEALTH_MISMATCH" };
  }
  return sonda.dados["engine_connected"] === true
    ? { ...sonda, estado: "PASS", erro: null }
    : { ...sonda, estado: "RUNNING", erro: "ENGINE_NOT_CONNECTED" };
}

async function medirTailscalePeers(): Promise<TailscaleProbe> {
  const comando = process.platform === "win32" ? "tailscale.exe" : "tailscale";
  const resultado = await new Promise<{ stdout: string; exitCode: number | null; errorCode: string | null }>((resolve) => {
    execFile(comando, ["status", "--json"], { timeout: 4_000, windowsHide: true, maxBuffer: 256 * 1024 }, (error, stdout) => {
      const code = error && typeof error.code === "number" ? error.code : null;
      resolve({ stdout: String(stdout ?? ""), exitCode: error ? code : 0, errorCode: !error ? null : typeof error.code === "string" ? error.code : code !== null ? String(code) : "COMMAND_FAILED" });
    });
  });
  if (resultado.exitCode !== 0 || !resultado.stdout.trim()) {
    return { estado: "UNKNOWN", casaOnline: null, vpsOnline: null, peers: null, erro: `TAILSCALE_STATUS_${resultado.errorCode ?? "NO_OUTPUT"}` };
  }
  try {
    const payload = JSON.parse(resultado.stdout) as unknown;
    if (!objetoJson(payload)) throw new Error("TAILSCALE_JSON_INVALID");
    const self = objetoJson(payload["Self"]) ? payload["Self"] : null;
    const peerMap = objetoJson(payload["Peer"]) ? payload["Peer"] : {};
    const devices = [...(self ? [self] : []), ...Object.values(peerMap).filter(objetoJson)];
    const deviceFor = (pattern: RegExp) => devices.find((device) => {
      const host = texto(device["HostName"])?.toLowerCase() ?? "";
      const dns = texto(device["DNSName"])?.toLowerCase() ?? "";
      return pattern.test(host) || pattern.test(dns);
    });
    const casa = deviceFor(/segredo|windows-casa/);
    const vps = deviceFor(/centraldark-os/);
    const casaOnline = casa && typeof casa["Online"] === "boolean" ? casa["Online"] : null;
    const vpsOnline = vps && typeof vps["Online"] === "boolean" ? vps["Online"] : null;
    const estado: Estado = casaOnline === true && vpsOnline === true ? "PASS"
      : casaOnline === false || vpsOnline === false ? "FAIL" : "UNKNOWN";
    return { estado, casaOnline, vpsOnline, peers: devices.length, erro: estado === "PASS" ? null : "TAILSCALE_PEER_NOT_PROVEN_ON_BOTH_HOSTS" };
  } catch {
    return { estado: "UNKNOWN", casaOnline: null, vpsOnline: null, peers: null, erro: "TAILSCALE_JSON_INVALID" };
  }
}

// Único owner do HUD vivo: agrega GitHub + API CentralDark e nunca promove ausência de prova.
export const lerEstadoCentralDark = createServerFn({ method: "GET" }).handler(
  async (): Promise<EstadoCentralDark> => {
    const hostScreenpipe = origemLocalScreenpipe();
    const origemHttp = apiBase();
    const consultaEm = new Date().toISOString();
    const [
      github,
      liveFabric,
      grafoVivoRaw,
      omniRouter,
      apiHealth,
      heartbeatRaw,
      omniModels,
      receipts,
      casaSite,
      screenpipe,
      screenpipeRemotoCasa,
      actions,
      mcpHealthRaw,
      mcpRoutesRaw,
      mcpStatusRaw,
      apiRootRaw,
      casaCommanderRaw,
    ] = await Promise.all([
      medirGithub(),
      medirApi("/api/live-fabric/status"),
      medirApi("/api/live-fabric/graph"),
      medirApi("/api/omni/status"),
      medirApi("/health"),
      medirApi("/heartbeat", mcpBase()),
      medirApi("/api/omni/models"),
      medirApi("/api/microdeploy/receipts/index.json"),
      medirReachable("http://127.0.0.1:8080/sala-controle", true),
      hostScreenpipe !== "UNKNOWN"
        ? medirReachable("http://127.0.0.1:3030/health")
        : Promise.resolve(SONDA_NAO_EXECUTADA),
      hostScreenpipe === "VPS"
        ? medirReachable(`http://${process.env["CENTRALDARK_CASA_TAILSCALE_IP"] || "100.123.93.25"}:3030/health`)
        : Promise.resolve(SONDA_NAO_EXECUTADA),
      medirActions(),
      medirApi("/health", mcpBase()),
      medirApi("/health/routes", mcpBase()),
      medirApi("/status.json", mcpBase()),
      medirApi("/api"),
      medirCasaCommanderRaw(hostScreenpipe),
    ]);
    const mcpRouteProbes = Array.isArray(mcpRoutesRaw.dados?.["probes"]) ? mcpRoutesRaw.dados["probes"].filter(objetoJson) : [];
    const mcpRouteReachable = mcpRouteProbes.filter((probe) => probe["state"] === "HTTP_REACHABLE" && probe["httpStatus"] === 200);
    const mcpRouteMissing = mcpRouteProbes.filter((probe) => probe["state"] !== "HTTP_REACHABLE" || probe["httpStatus"] !== 200);
    const mcpRouteHealth: Probe = { ...mcpRoutesRaw, estado: mcpRouteProbes.length === 0 ? "UNKNOWN" : mcpRouteMissing.length === 0 ? "PASS" : "FAIL", erro: mcpRouteMissing.length === 0 ? null : `MCP_ROUTES_NOT_REACHABLE:${mcpRouteMissing.map((probe) => texto(probe["id"]) ?? "unknown").join(",")}` };
    const mcpStatusOk = typeof mcpStatusRaw.dados?.["ok"] === "boolean" ? mcpStatusRaw.dados["ok"] as boolean : null;
    const apiRoot = apiRootRaw;
    const casaCommander = normalizarCasaCommander(casaCommanderRaw);
    const casaCommanderEngine = typeof casaCommander.dados?.["engine_connected"] === "boolean" ? casaCommander.dados["engine_connected"] as boolean : null;
    const mcpCatalogVersion = texto(mcpHealthRaw.dados?.["catalogVersion"]) ?? texto(objetoJson(mcpHealthRaw.dados?.["catalog"]) ? mcpHealthRaw.dados["catalog"]["catalogVersion"] : null);
    const mcpRouteHealthDetail = `${mcpRouteReachable.length}/${mcpRouteProbes.length} rotas HTTP acessíveis${mcpRouteMissing.length ? `; falhas: ${mcpRouteMissing.map((probe) => texto(probe["id"]) ?? "unknown").join(", ")}` : ""}`;
    const grafoInfo = objetoJson(apiHealth.dados?.["grafo"]) ? apiHealth.dados["grafo"] : null;
    const grafoUltimo = texto(grafoInfo?.["ultimo"]);
    const grafoIdadeMs = grafoUltimo ? Date.now() - Date.parse(grafoUltimo) : Number.NaN;
    const grafoIntervaloMin = typeof grafoInfo?.["intervalo_min"] === "number" ? grafoInfo["intervalo_min"] as number : 30;
    const grafoInternoFresco = grafoInfo?.["ok"] === true && Number.isFinite(grafoIdadeMs) && grafoIdadeMs >= -5_000 && grafoIdadeMs <= Math.max(30, grafoIntervaloMin * 2) * 60_000;
    const grafoVivo: Probe = grafoInternoFresco
      ? { ...grafoVivoRaw, estado: "RUNNING", erro: "API_HEALTH_GRAFO_OK; ROTA_PUBLICA_GRAPH_NAO_EXISTE", dados: grafoInfo }
      : grafoInfo?.["ok"] === false ? { ...grafoVivoRaw, estado: "FAIL", erro: "API_HEALTH_GRAFO_FAIL", dados: grafoInfo } : grafoVivoRaw;
    const screenpipeMedido = screenpipeIdentificado(screenpipe);
    const screenpipeCasa = hostScreenpipe === "CASA" ? screenpipeMedido : hostScreenpipe === "VPS" ? screenpipeIdentificado(screenpipeRemotoCasa) : SONDA_NAO_EXECUTADA;
    const screenpipeVps = hostScreenpipe === "VPS" ? screenpipeMedido : SONDA_NAO_EXECUTADA;
    const screenpipeCasaFonte = hostScreenpipe === "CASA"
      ? "Casa Windows · Screenpipe 3030/health · HTTP e status real"
      : hostScreenpipe === "VPS"
        ? "Casa Windows · Tailscale privado · Screenpipe 3030/health · HTTP e status real"
        : "Casa Windows · sem adapter/medição remota neste servidor";
    const screenpipeVpsFonte = hostScreenpipe === "VPS"
      ? "VPS CENTRALDARK-OS · 3030/health · confirmar serviço da rota (pode ser Graph Panel)"
      : "VPS CENTRALDARK-OS · sem adapter/medição remota neste servidor";
    // API 200 só atesta esta rota. O body pode identificar serviço, não integrações internas.
    const apiServico = texto(apiHealth.dados?.["service"])
      ?? texto(apiHealth.dados?.["servico"])
      ?? texto(apiHealth.dados?.["name"])
      ?? "Serviço não identificado pelo /health";
    const heartbeatSelf = texto(heartbeatRaw.dados?.["self"]);
    const heartbeat: Probe =
      heartbeatSelf === "stale"
        ? { ...heartbeatRaw, estado: "FAIL", erro: "self=stale" }
        : heartbeatSelf !== "ok"
          ? { ...heartbeatRaw, estado: "UNKNOWN", erro: `HEARTBEAT_SELF_${heartbeatSelf ?? "MISSING"}` }
          : heartbeatRaw;

    const atual = github.commits[0] ?? null;
    const gitLive = objetoJson(liveFabric.dados?.["git"]) ? liveFabric.dados["git"] : null;
    const vpsSha = texto(gitLive?.["head"]);
    const mainSha = atual?.sha ?? null;
    const sincronizado = !!mainSha && !!vpsSha && mainSha === vpsSha;
    const deltaVps = await medirDelta(vpsSha, mainSha);
    // SHA sincronizado só comprova código; sem receipt SAME_SHA+health+efeito não existe deploy PASS.
    const deploy: Estado = "UNKNOWN";

    // Um fio de leitura: Cockpit consome exclusivamente MCP /heartbeat, sem consultar Supabase de novo.
    const supabaseRaw = objetoJson(heartbeatRaw.dados?.["supabase"]) ? heartbeatRaw.dados["supabase"] : null;
    const edgeRaw = objetoJson(supabaseRaw?.["edge_functions"]) ? supabaseRaw["edge_functions"] : null;
    const radarRaw = objetoJson(supabaseRaw?.["radar"]) ? supabaseRaw["radar"] : null;
    const sinalBruto = texto(supabaseRaw?.["state"]);
    const supabaseSignals: Estado = heartbeat.estado === "PASS" && (sinalBruto === "PASS" || sinalBruto === "FAIL")
      ? sinalBruto : "UNKNOWN";
    const resultado: EstadoCentralDark = {
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
      screenpipe: screenpipeCasa.estado,
      screenpipeVps: screenpipeVps.estado,
      desktopVps: "UNKNOWN",
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
      casaSiteErro: casaSite.erro,
      apiHealthErro: apiHealth.erro,
      grafoErro: grafoVivo.erro,
      omniErro: omniRouter.erro,
      heartbeatErro: heartbeat.erro,
      receiptsErro: receipts.erro,
      apiHealthHttp: apiHealth.httpStatus,
      heartbeatHttp: heartbeat.httpStatus,
      heartbeatSelf,
      supabaseSignals,
      supabaseEdgeOnline: typeof edgeRaw?.["online"] === "number" ? edgeRaw["online"] : null,
      supabaseEdgeTotal: typeof edgeRaw?.["total"] === "number" ? edgeRaw["total"] : null,
      supabaseRadarSources: typeof radarRaw?.["sources_fresh"] === "number" ? radarRaw["sources_fresh"] : null,
      mcpHealth: mcpHealthRaw.estado,
      mcpRouteHealth: mcpRouteHealth.estado,
      mcpStatus: mcpStatusRaw.estado,
      apiRoot: apiRoot.estado,
      casaCommander: casaCommander.estado,
      mcpHealthHttp: mcpHealthRaw.httpStatus,
      mcpRouteHealthHttp: mcpRouteHealth.httpStatus,
      mcpStatusHttp: mcpStatusRaw.httpStatus,
      apiRootHttp: apiRoot.httpStatus,
      casaCommanderHttp: casaCommander.httpStatus,
      mcpCatalogVersion,
      mcpRouteHealthDetail,
      mcpStatusOk,
      casaCommanderEngine,
      casaCommanderDetail: `engine_connected=${casaCommanderEngine === null ? "?" : casaCommanderEngine}; remote_vendor=${String(casaCommander.dados?.["remote_vendor"] ?? "?")}`,
      mcpRouteHealthErro: mcpRouteHealth.erro,
      mcpStatusErro: mcpStatusRaw.erro,
      apiRootErro: apiRoot.erro,
      casaCommanderErro: casaCommander.erro,
      casaCommanderFonte: hostScreenpipe === "CASA" ? "Casa loopback 127.0.0.1:9101/health" : hostScreenpipe === "VPS" ? "VPS -> Casa Tailscale Serve :9100/health" : "Bridge Casa sem host executor identificado",
      omniModelsHttp: omniModels.httpStatus,
      receiptsHttp: receipts.httpStatus,
      casaSiteHttp: casaSite.httpStatus,
      screenpipeHttp: screenpipeCasa.httpStatus,
      screenpipeDetail: texto(screenpipeCasa.dados?.["status"]),
      screenpipeFonte: screenpipeCasaFonte,
      screenpipeEvents: hostScreenpipe === "CASA" || hostScreenpipe === "VPS" ? saidaScreenpipe(screenpipeCasa) : ["NÃO MEDIDO · exige sensor na Casa"],
      screenpipeVpsHttp: screenpipeVps.httpStatus,
      screenpipeVpsDetail: texto(screenpipeVps.dados?.["status"]),
      screenpipeVpsFonte,
      screenpipeVpsEvents: hostScreenpipe === "VPS" ? saidaScreenpipe(screenpipeVps) : ["NÃO MEDIDO · exige sensor na VPS"],
      screenpipeCasaMedidoEm: hostScreenpipe === "CASA" || hostScreenpipe === "VPS" ? consultaEm : null,
      screenpipeVpsMedidoEm: hostScreenpipe === "VPS" ? consultaEm : null,
      apiHealthFonte: `origem=${hostname()} · destino=${origemHttp}/health · GET server-side`,
      apiHealthServico: apiServico.slice(0, 100),
      apiHealthMedidoEm: consultaEm,
      desktopVpsFonte: "Remote Desktop Commander VPS · sensor externo não consultado neste servidor; offline do conector não prova VPS parada",
      actionsFonte: actions.fonte,
      actionsErro: actions.erro,
      gmailFonte: "Sensor externo Gmail/ChatGPT · adapter do Cockpit ainda não ligado",
      desktopFonte: "Remote Desktop Commander Casa · sensor externo não consultado pelo app; cota de ferramenta ≠ saúde da Casa",
    };

    // Fire-and-forget: gravar pulsos no Supabase para o radar Realtime
    void (async () => {
      try {
        const { supabaseAdmin } = await import(
          "@/integrations/supabase/client.server"
        );
        const host = hostname();
        const pulsos = [
          { source: "github", status: github.estado, http_code: null, error: null },
          { source: "liveFabric", status: liveFabric.estado, http_code: liveFabric.httpStatus ?? null, error: liveFabric.erro ?? null },
          { source: "grafoVivo", status: grafoVivo.estado, http_code: grafoVivo.httpStatus ?? null, error: grafoVivo.erro ?? null },
          { source: "omniRouter", status: omniRouter.estado, http_code: omniRouter.httpStatus ?? null, error: omniRouter.erro ?? null },
          { source: "apiHealth", status: apiHealth.estado, http_code: apiHealth.httpStatus ?? null, error: apiHealth.erro ?? null },
          { source: "heartbeat", status: heartbeat.estado, http_code: heartbeat.httpStatus ?? null, error: heartbeat.erro ?? null },
          { source: "omniModels", status: omniModels.estado, http_code: omniModels.httpStatus ?? null, error: null },
          { source: "receipts", status: receipts.estado, http_code: receipts.httpStatus ?? null, error: receipts.erro ?? null },
          { source: "casaSite", status: casaSite.estado, http_code: casaSite.httpStatus ?? null, error: casaSite.erro ?? null },
          { source: "screenpipe", status: screenpipeCasa.estado, http_code: screenpipeCasa.httpStatus ?? null, error: null },
          { source: "screenpipeVps", status: screenpipeVps.estado, http_code: screenpipeVps.httpStatus ?? null, error: null },
          { source: "actions", status: actions.estado, http_code: null, error: actions.erro ?? null },
        ];
        const linhas = pulsos.map((p) => ({
          source: p.source,
          status: p.status,
          http_code: p.http_code,
          error: p.error,
          false_green: false,
          regression: false,
          host,
          ttl_seconds: 120,
        }));
        await supabaseAdmin.from("radar_pulses" as any).insert(linhas as any);
      } catch (e) {
        console.error("[radar-pulses] fire-and-forget falhou:", e);
      }
    })();

    return resultado;
  },
);


// #OBSERVACOES# @owner=cockpit.functions @doc_ref=docs/CONSCIENCIA/MICRO-DEPLOY/README.md
// @last_updated=2026-10-18T15:21:44.739Z @escopo=PID_MCP_VPS_AUTH_READ_ONLY
// @implementado: consulta autorizada de heartbeat operacional, sem declarar conexao TCP por PID.
// @pendente: deploy e readback de runtime no mesmo SHA.
export type McpRuntimeAoVivo = {
  estado: "OBSERVED" | "STALE" | "UNKNOWN";
  consultaEm: string;
  observadoEm: string | null;
  fonte: string;
  httpStatus: number | null;
  pid: number | null;
  processos: { id: string; nome: string; quantidade: number; pids: number[] }[];
  atividadeMcp: "RECENT" | "STALE" | "UNKNOWN";
  erro: string | null;
};

export const lerMcpRuntimeAoVivo = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<McpRuntimeAoVivo> => {
    const { data: papel, error: erroPapel } = await context.supabase
      .from("user_roles").select("role").eq("user_id", context.userId).eq("role", "admin").maybeSingle();
    if (erroPapel || !papel) throw new Response("Proibido", { status: 403 });
    const consultaEm = new Date().toISOString();
    const fonte = "MCP GET http://127.0.0.1:9100/heartbeat · server-side";
    const leitura = await medirReachable("http://127.0.0.1:9100/heartbeat");
    const heartbeat = leitura.dados;
    const operational = objetoJson(heartbeat?.["operational"]) ? heartbeat["operational"] : null;
    const runtime = objetoJson(operational?.["runtime"]) ? operational["runtime"] : null;
    const topology = objetoJson(operational?.["executionTopology"]) ? operational["executionTopology"] : null;
    const atividade = objetoJson(topology?.["mcpActivity"]) ? topology["mcpActivity"] : null;
    const observadoEm = texto(topology?.["observedAt"]);
    const idadeMs = observadoEm ? Date.now() - Date.parse(observadoEm) : Number.NaN;
    const pid = runtime?.["pid"];
    const assinaturaValida = leitura.estado === "PASS"
      && heartbeat?.["service"] === "mcp-centraldark"
      && topology?.["schema"] === "centraldark.execution-topology.v1"
      && Number.isSafeInteger(pid) && (pid as number) > 0;
    const recente = assinaturaValida && Number.isFinite(idadeMs) && idadeMs >= -5_000 && idadeMs <= 30_000;
    const estado: McpRuntimeAoVivo["estado"] = recente ? "OBSERVED"
      : assinaturaValida ? "STALE" : "UNKNOWN";
    const idsPermitidos = new Set([
      "MCP_SERVER", "TELEGRAM_BOT", "HERMES_RUNTIME", "HERMES_CRON",
      "SELF_EVOLUTION", "GITHUB_RUNNER", "REMOTE_DESKTOP", "GUARDIAO",
    ]);
    const lista = Array.isArray(topology?.["lanes"]) ? topology["lanes"] : [];
    const processos: McpRuntimeAoVivo["processos"] = recente
      ? lista.filter(objetoJson).filter(item => idsPermitidos.has(String(item["id"])))
        .map(item => ({
          id: String(item["id"]),
          nome: typeof item["label"] === "string" ? item["label"].slice(0, 60) : String(item["id"]),
          pids: (Array.isArray(item["pids"]) ? item["pids"] : [])
            .filter((n): n is number => Number.isSafeInteger(n) && n > 0).slice(0, 12),
          quantidade: typeof item["processCount"] === "number" && Number.isSafeInteger(item["processCount"])
            ? Math.max(0, item["processCount"]) : 0,
        }))
      : [];
    return {
      estado, consultaEm, observadoEm: recente ? observadoEm : null, fonte,
      httpStatus: leitura.httpStatus, pid: recente ? pid as number : null,
      processos, atividadeMcp: recente && ["RECENT", "STALE"].includes(String(atividade?.["state"]))
        ? atividade?.["state"] as "RECENT" | "STALE" : "UNKNOWN",
      erro: recente ? null : leitura.erro ?? (assinaturaValida ? "AMOSTRA_FORA_DA_JANELA_30S" : "SCHEMA_OU_ORIGEM_NAO_COMPROVADA"),
    };
  });

export type CircuitoPrivado = {
  hostRole: "CASA" | "VPS" | "UNKNOWN";
  medidoEm: string;
  tailscale: Estado;
  tailscaleCasaOnline: boolean | null;
  tailscaleVpsOnline: boolean | null;
  tailscalePeers: number | null;
  tailscaleErro: string | null;
  casaCommander: Estado;
  casaCommanderHttp: number | null;
  casaCommanderEngine: boolean | null;
  casaCommanderErro: string | null;
  vpsToCasaBridge: Estado;
  vpsToCasaBridgeHttp: number | null;
  vpsToCasaBridgeEngine: boolean | null;
  vpsToCasaBridgeErro: string | null;
  casaToVpsSsh: Estado;
  casaToVpsSshErro: string | null;
  vpsToCasaSsh: Estado;
  vpsToCasaSshErro: string | null;
};

// Leitura privada: somente administrador autenticado; sem comandos de escrita e sem expor IPs/segredos.
export const lerCircuitoPrivado = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<CircuitoPrivado> => {
    const { data: papel, error: erroPapel } = await context.supabase
      .from("user_roles").select("role").eq("user_id", context.userId).eq("role", "admin").maybeSingle();
    if (erroPapel || !papel) throw new Response("Proibido", { status: 403 });
    const hostRole = origemLocalScreenpipe();
    const [tailscale, bridgeRaw] = await Promise.all([
      medirTailscalePeers(),
      medirCasaCommanderRaw(hostRole),
    ]);
    const bridge = normalizarCasaCommander(bridgeRaw);
    const bridgeReverse: Probe = hostRole === "VPS" ? bridge : {
      estado: "UNKNOWN", httpStatus: null, erro: "REVERSE_BRIDGE_MUST_BE_MEASURED_FROM_VPS", dados: null,
    };
    return {
      hostRole, medidoEm: new Date().toISOString(),
      tailscale: tailscale.estado, tailscaleCasaOnline: tailscale.casaOnline,
      tailscaleVpsOnline: tailscale.vpsOnline, tailscalePeers: tailscale.peers,
      tailscaleErro: tailscale.erro,
      casaCommander: bridge.estado, casaCommanderHttp: bridge.httpStatus,
      casaCommanderEngine: typeof bridge.dados?.["engine_connected"] === "boolean" ? bridge.dados["engine_connected"] as boolean : null,
      casaCommanderErro: bridge.erro,
      vpsToCasaBridge: bridgeReverse.estado, vpsToCasaBridgeHttp: bridgeReverse.httpStatus,
      vpsToCasaBridgeEngine: typeof bridgeReverse.dados?.["engine_connected"] === "boolean" ? bridgeReverse.dados["engine_connected"] as boolean : null,
      vpsToCasaBridgeErro: bridgeReverse.erro,
      casaToVpsSsh: "UNKNOWN", casaToVpsSshErro: "SSH_DIRECTION_NOT_MEASURED_BY_COCKPIT",
      vpsToCasaSsh: "UNKNOWN", vpsToCasaSshErro: "DIRECT_REVERSE_SSH_NOT_PROVEN; native bridge measured separately",
    };
  });
