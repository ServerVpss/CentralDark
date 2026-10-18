import { createServerFn } from "@tanstack/react-start";
import { hostname } from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

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
  casaPeerOnline: boolean | null;
  casaPeerFonte: string;
  casaPeerMedidoEm: string | null;
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
  apiHealthHttp: number | null;
  heartbeatHttp: number | null;
  heartbeatSelf: string | null;
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

function apiHealthIdentificada(sonda: Probe): Probe {
  if (sonda.estado === "UNKNOWN" || sonda.estado === "FAIL") return sonda;
  const status = texto(sonda.dados?.["status"])?.toLowerCase();
  const servico = texto(sonda.dados?.["servico"])?.toLowerCase();
  if (sonda.httpStatus === 200 && status === "ok" && servico === "hermes-core") {
    return { ...sonda, estado: "PASS", erro: null };
  }
  return { ...sonda, estado: "UNKNOWN", erro: "HEALTH_SEM_ASSINATURA_HERMES_CORE" };
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
          : casaOnly && resposta.status === 200 &&
            resposta.headers.get("content-type")?.includes("text/html")
            // O HTML 200 comprova APENAS a página acessível, não login ou backend.
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

// Saída operacional do próprio /health, com campos permitidos; não publica captura,
 // caminhos do host, stdout bruto, OCR, áudio ou informações pessoais.
function screenpipeIdentificado(sonda: Probe): Probe {
  // ffmpeg/dependencies nao e obrigatorio nas varias versoes do Screenpipe.
  // HTTP 200 por si so nao identifica o aplicativo nem o dispositivo.
  if (sonda.estado === "UNKNOWN") return sonda;
  if (sonda.httpStatus !== 200) {
    return { ...sonda, estado: "UNKNOWN", erro: "SCREENPIPE_HEALTH_NAO_IDENTIFICADO_NESTE_HOST" };
  }
  const status = texto(sonda.dados?.["status"])?.toLowerCase();
  const dependencias = objetoJson(sonda.dados?.["dependencies"])
    ? sonda.dados["dependencies"] : null;
  const assinatura = [
    "frame_status", "audio_status", "capture_status", "last_frame_timestamp",
    "device_status_details", "ui_recorder",
  ].some(campo => sonda.dados?.[campo] != null)
    || (dependencias !== null && objetoJson(dependencias["ffmpeg"]));
  if (!assinatura || !["healthy", "unhealthy", "error"].includes(status ?? "")) {
    return { ...sonda, estado: "UNKNOWN", erro: "HEALTH_SEM_ASSINATURA_SCREENPIPE" };
  }
  return {
    ...sonda,
    estado: status === "healthy" ? "PASS" : "FAIL",
    erro: status === "healthy" ? null : "SCREENPIPE_REPORTOU_" + status!.toUpperCase(),
  };
}

function saidaScreenpipe(sonda: Probe): string[] {
  const saida = [`GET /health → HTTP ${sonda.httpStatus ?? "sem resposta"} · ${sonda.estado}`];
  if (sonda.erro) saida.push(`SENSOR: ${sonda.erro.slice(0, 96)}`);
  for (const campo of ["status", "capture_status", "frame_status", "audio_status"]) {
    const valor = texto(sonda.dados?.[campo]);
    if (valor && /^[a-zA-Z0-9 _-]{1,32}$/.test(valor)) saida.push(`${campo}: ${valor}`);
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

// #OBSERVACOES# @owner=apps/instinto-superior/src/lib/cockpit.functions.ts
// @doc_ref=apps/instinto-superior/README.md
// @last_updated=2026-10-17 · Fonte CURRENT/ HISTORICO separadas.
// Diagnostica APENAS a presença da Casa na malha Tailscale do host servidor.
// Tailscale peer offline != prova de processo desligado ou de site/serviço caído.
// Não lê chave, token, IP de peer, shell interativo ou estado da conta do usuário.
async function medirPeerCasa(): Promise<{
  online: boolean | null; fonte: string; medidoEm: string | null;
}> {
  if (process.platform === "win32") {
    return { online: null, fonte: "Host Windows · status da malha remota não consultado", medidoEm: null };
  }
  try {
    const { stdout } = await promisify(execFile)("tailscale", ["status", "--json"], {
      timeout: 2_500, maxBuffer: 512_000, windowsHide: true,
    });
    const dados: unknown = JSON.parse(stdout);
    if (!objetoJson(dados) || !objetoJson(dados["Peer"])) {
      return { online: null, fonte: "Tailscale · sem lista válida de peers", medidoEm: null };
    }
    const casa = Object.values(dados["Peer"]).find((peer) => {
      if (!objetoJson(peer)) return false;
      const host = texto(peer["HostName"])?.toLowerCase() ?? "";
      return host === "segredo";
    });
    if (!objetoJson(casa) || typeof casa["Online"] !== "boolean") {
      return { online: null, fonte: "Tailscale · Casa não identificada neste host", medidoEm: null };
    }
    return {
      online: casa["Online"],
      fonte: "Tailscale local · peer Casa · disponibilidade na malha, não site",
      medidoEm: new Date().toISOString(),
    };
  } catch {
    return { online: null, fonte: "Tailscale indisponível neste servidor · sem conclusão", medidoEm: null };
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
      grafoVivo,
      omniRouter,
      apiHealth,
      heartbeatRaw,
      omniModels,
      receipts,
      casaSite,
      casaPeer,
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
      medirPeerCasa(),
      hostScreenpipe !== "UNKNOWN"
        ? medirReachable("http://127.0.0.1:3030/health")
        : Promise.resolve(SONDA_NAO_EXECUTADA),
      medirActions(),
    ]);
    const screenpipeMedido = screenpipeIdentificado(screenpipe);
    const apiHealthMedido = apiHealthIdentificada(apiHealth);
    const screenpipeCasa = hostScreenpipe === "CASA" ? screenpipeMedido : SONDA_NAO_EXECUTADA;
    const screenpipeVps = hostScreenpipe === "VPS" ? screenpipeMedido : SONDA_NAO_EXECUTADA;
    const screenpipeCasaFonte = hostScreenpipe === "CASA"
      ? "Casa Windows · 127.0.0.1:3030/health · assinatura Screenpipe obrigatória"
      : "Casa Windows · sem adapter/medição remota neste servidor";
    const screenpipeVpsFonte = hostScreenpipe === "VPS"
      ? "VPS CENTRALDARK-OS · 127.0.0.1:3030/health · assinatura Screenpipe obrigatória (porta pode ser Graph Panel)"
      : "VPS CENTRALDARK-OS · sem adapter/medição remota neste servidor";
    // API 200 só atesta esta rota. O body pode identificar serviço, não integrações internas.
    const apiServico = texto(apiHealth.dados?.["service"])
      ?? texto(apiHealth.dados?.["name"])
      ?? "Serviço não identificado pelo /health";
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
      apiHealth: apiHealthMedido.estado,
      heartbeat: heartbeat.estado,
      omniModels: omniModels.estado,
      receipts: receipts.estado,
      casaSite: casaSite.estado,
      casaPeerOnline: casaPeer.online,
      casaPeerFonte: casaPeer.fonte,
      casaPeerMedidoEm: casaPeer.medidoEm,
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
      apiHealthHttp: apiHealthMedido.httpStatus,
      heartbeatHttp: heartbeat.httpStatus,
      heartbeatSelf,
      omniModelsHttp: omniModels.httpStatus,
      receiptsHttp: receipts.httpStatus,
      casaSiteHttp: casaSite.httpStatus,
      screenpipeHttp: screenpipeCasa.httpStatus,
      screenpipeDetail: texto(screenpipeCasa.dados?.["status"]),
      screenpipeFonte: screenpipeCasaFonte,
      screenpipeEvents: hostScreenpipe === "CASA" ? saidaScreenpipe(screenpipeCasa) : ["NÃO MEDIDO · exige sensor na Casa"],
      screenpipeVpsHttp: screenpipeVps.httpStatus,
      screenpipeVpsDetail: texto(screenpipeVps.dados?.["status"]),
      screenpipeVpsFonte,
      screenpipeVpsEvents: hostScreenpipe === "VPS" ? saidaScreenpipe(screenpipeVps) : ["NÃO MEDIDO · exige sensor na VPS"],
      screenpipeCasaMedidoEm: hostScreenpipe === "CASA" ? consultaEm : null,
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
  },
);
