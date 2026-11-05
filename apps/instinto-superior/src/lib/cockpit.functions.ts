// #OBSERVACOES# @owner: instinto.cockpit @doc_ref: README.md
// @last_updated: 2026-11-01T19:41:24.979255+00:00 @implementado: autenticação do Omni local server-side, rótulo Forja Linux; sem promoção de projeções a execução.
// #OBSERVACOES# @owner: instinto.cockpit @doc_ref: README.md
// @last_updated: 2026-11-01T19:22:05.143254+00:00 @implementado: sondas nativas Linux e papel CASA explícito; sem inferir VPS por hostname.
import { createServerFn } from "@tanstack/react-start";
import { hostname } from "node:os";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GITHUB_API = "https://api.github.com";
// A API e local ao host de execucao (Casa ou VPS); o dominio publico e apenas exposicao.
const DEFAULT_API_BASE = "http://127.0.0.1:8099";
const DEFAULT_CASA_COMMANDER_HEALTH_BASE = "http://127.0.0.1:9101";
const DEFAULT_CASA_SITE_URL = "http://127.0.0.1:8080/"; // Vite da Casa; configuravel por CENTRALDARK_CASA_SITE_URL.
const REQUEST_TIMEOUT_MS = 8_000;

function carregarEnvForja() {
  if (typeof process.loadEnvFile !== "function") return;
  try { process.loadEnvFile(process.env["CENTRALDARK_ENV_FILE"] || "K:\\.env"); } catch { /* Fonte indisponível mantém UNKNOWN */ }
}

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

export type PortaCentralDark = {
  id: string;
  origem: "Casa Windows" | "openKylin";
  transporte: "TCP" | "UDP" | "stdio";
  bind: string;
  estado: Estado;
  processo: string;
  pid: string | null;
  protocolo: "TCP" | "UDP";
  categoria: "CentralDark" | "Sistema";
  detalhe: string;
};

export type EstadoCentralDark = {
  gmail: Estado;
  githubLovable: Estado;
  desktop: Estado;
  commanderEngine: boolean | null;
  commanderHttp: number | null;
  commanderToolProof: { tool: string; kind: string; at: string } | null;
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
  omniModelsHttp: number | null;
  receiptsHttp: number | null;
  casaSiteHttp: number | null;
  casaSiteFonte: string;
  screenpipeHttp: number | null;
  screenpipeDetail: string | null;
  screenpipeAudioStatus: string | null;
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
  portas: PortaCentralDark[];
  portasTotais: PortaCentralDark[];
};

function acessoGitHub() {
  carregarEnvForja();
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

  return null;
}

export function apiBase() {
  return (process.env["CENTRALDARK_API_BASE_URL"] ?? DEFAULT_API_BASE).replace(/\/$/, "");
}

function casaCommanderHealthBase() {
  return (process.env["CENTRALDARK_ROUTER_HEALTH_URL"] ?? DEFAULT_CASA_COMMANDER_HEALTH_BASE).replace(/\/$/, "");
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
    carregarEnvForja();
    const headers: Record<string, string> = { accept: "application/json" };
    const localOwner = base === apiBase() && ['127.0.0.1', 'localhost', '[::1]'].includes(new URL(base).hostname);
    const routerToken = process.env['CENTRALDARK_ROUTER_TOKEN'];
    if (localOwner && routerToken) headers['authorization'] = `Bearer ${routerToken}`;
    const resposta = await fetch(`${base}${path}`, {
      headers,
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
    // Fabric graph/receipts are truthful read-only projections; connectivity is
    // measured but a file/receipt list must not be called executed or counterproven.
    const projecaoNaoRevalidada = candidato["proof_state"] === "NOT_REVALIDATED"
      && ["/api/live-fabric/status", "/api/live-fabric/graph", "/api/microdeploy/receipts/index.json"].includes(path);
    const modelosCatalogados = path === "/api/omni/models"
      && candidato["object"] === "list" && Array.isArray(candidato["data"]);
    return {
      estado: falhou ? "FAIL" : saudavel ? (projecaoNaoRevalidada ? "RUNNING" : "PASS")
        : modelosCatalogados ? "RUNNING" : "UNKNOWN",
      httpStatus: resposta.status,
      erro: projecaoNaoRevalidada ? "PROJECAO_LOCAL_SEM_CONTRAPROVA_DE_EXECUCAO"
        : modelosCatalogados ? "CATALOGO_MEDIDO_SEM_INVOCACAO_DE_MODELO"
        : !falhou && !saudavel ? "JSON sem status de saúde reconhecido" : null,
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

async function medirReachable(url: string, casaOnly = false, siteCheck = false): Promise<Probe> {
  if (casaOnly && origemLocalScreenpipe() !== "CASA") {
    return { estado: "UNKNOWN", httpStatus: null, erro: "CASA_HOST_NOT_CONFIRMED", dados: null };
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
          : siteCheck
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
  // Metadados do gravador local, sem expor OCR, imagem, áudio ou conteúdo privado.
  // HEALTH 200 e FRAME FRESH são provas diferentes; áudio degradado não apaga frame vivo.
  const quadro = texto(sonda.dados?.["last_frame_timestamp"]);
  const idade = quadro ? Date.now() - Date.parse(quadro) : Number.NaN;
  const frameFresco = sonda.httpStatus === 200 && Number.isFinite(idade) && idade >= -5_000 && idade <= 30_000;
  const frameStatus = texto(sonda.dados?.["frame_status"])?.toLowerCase();
  const frameProven = frameFresco && frameStatus === "ok";
  saida.push(`CAPTURA VISUAL: ${frameProven ? "FRESH" : "UNKNOWN/STALE"} · frame_status=${frameStatus ?? "UNKNOWN"}`);
  saida.push(`ÚLTIMO FRAME: ${quadro ?? "UNKNOWN"}`);
  const monitores = Array.isArray(sonda.dados?.["monitors"])
    ? sonda.dados["monitors"].filter((v): v is string => typeof v === "string").slice(0, 8)
    : [];
  saida.push(`MONITORES DETECTADOS: ${sonda.httpStatus === 200 ? monitores.length : "UNKNOWN"}`);
  if (sonda.httpStatus === 200) monitores.forEach((monitor, i) => {
    saida.push(`MONITOR ${i + 1}: ${monitor.replace(/[^a-zA-Z0-9 ()x-]/g, "").slice(0, 64)}`);
  });
  const pipeline = objetoJson(sonda.dados?.["pipeline"]) ? sonda.dados["pipeline"] : null;
  const gravados = pipeline?.["frames_db_written"];
  const fps = pipeline?.["capture_fps_actual"];
  saida.push(`FRAMES NO HISTÓRICO ATUAL: ${typeof gravados === "number" && Number.isFinite(gravados) && gravados >= 0 ? gravados : "UNKNOWN"}`);
  saida.push(`FREQUÊNCIA MEDIDA: ${typeof fps === "number" && Number.isFinite(fps) && fps >= 0 ? fps.toFixed(2) + " fps" : "UNKNOWN"}`);
  saida.push(`ÁUDIO: ${texto(sonda.dados?.["audio_status"]) ?? "UNKNOWN"} · independente da captura visual`);
  saida.push("HISTÓRICO VISUAL: Screenpipe Desktop → Timeline; imagens e OCR não publicados no Cockpit.");
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
  if (origemDeclarada === "CASA") return "CASA";
  if (origemDeclarada === "VPS" && process.platform !== "win32") return "VPS";
  const host = hostname().toUpperCase();
  if (process.platform === "win32" && (host === "SEGREDO" || host === "WINDOWS-CASA")) return "CASA";
  return "UNKNOWN";
}

const SONDA_NAO_EXECUTADA: Probe = {
  estado: "UNKNOWN", httpStatus: null, erro: "SEM_MEDICAO_NESTE_HOST", dados: null,
};

function portaEstado(bind: string, processo: string): Estado {
  return bind && processo ? "PASS" : "UNKNOWN";
}

function portasOpenKylin(textoSs: string): PortaCentralDark[] {
  const portas: PortaCentralDark[] = [];
  for (const linha of textoSs.split(/\r?\n/)) {
    if (!/LISTEN/.test(linha) || !/(tunnel-client|mcp-server|node)/i.test(linha)) continue;
    const match = linha.match(/(?:^|\s)([^\s]+):(\d+)(?:\s|$)/);
    if (!match || !match[1] || !match[2]) continue;
    const processo = linha.match(/users:\(\("([^"]+)"/)?.[1] ?? "processo identificado";
    const pid = linha.match(/pid=(\d+)/)?.[1] ?? null;
    portas.push({
      id: `openkylin-tcp-${match[2]}`,
      origem: "openKylin",
      transporte: "TCP",
      protocolo: "TCP",
      categoria: "CentralDark",
      bind: `${match[1]}:${match[2]}`,
      estado: portaEstado(match[1], processo),
      processo,
      pid,
      detalhe: "LISTEN medido por ss; origem local openKylin",
    });
  }
  return portas;
}

async function portaOpenKylin8742(): Promise<PortaCentralDark | null> {
  const health = await medirReachable("http://127.0.0.1:8742/health");
  if (health.httpStatus !== 200) return null;
  const runtime = objetoJson(health.dados?.["runtime"]) ? health.dados["runtime"] : null;
  const lifecycle = texto(runtime?.["lifecycle"]);
  return {
    id: "openkylin-tcp-8742",
    origem: "openKylin",
    transporte: "TCP",
    protocolo: "TCP",
    categoria: "CentralDark",
    bind: "127.0.0.1:8742",
    estado: "PASS",
    processo: "tunnel-client",
    pid: null,
    detalhe: `MCP tunnel health HTTP 200${lifecycle ? ` · lifecycle=${lifecycle}` : ""}`,
  };
}

async function inventarioPortasCentralDark(): Promise<PortaCentralDark[]> {
  const portas: PortaCentralDark[] = [];
  if (process.platform === "win32") {
    const [{ execFile: execFileCallback }, { promisify }] = await Promise.all([
      import("node:child_process"),
      import("node:util"),
    ]);
    const execFile = promisify(execFileCallback);
    try {
      const { stdout } = await execFile("wsl.exe", ["-d", "openKylin", "--", "bash", "-lc", "ss -ltnpH 2>/dev/null"], { timeout: 4_000, windowsHide: true });
      portas.push(...portasOpenKylin(stdout));
    } catch {
      // A ausência da sonda não inventa uma porta; o card mostra UNKNOWN na leitura.
    }
    try {
      const script = "Get-NetTCPConnection -State Listen | ForEach-Object { $p = Get-CimInstance Win32_Process -Filter ('ProcessId=' + $_.OwningProcess) -ErrorAction SilentlyContinue; if ($p.CommandLine -match 'CentralDark|tunnel|mcp|commander|screenpipe') { '{0}|{1}|{2}|{3}' -f $_.LocalAddress,$_.LocalPort,$_.OwningProcess,$p.Name } }";
      const { stdout } = await execFile("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", script], { timeout: 5_000, windowsHide: true });
      for (const linha of stdout.split(/\r?\n/).filter(Boolean)) {
        const [bind, port, pid, processo] = linha.split("|");
        if (!bind || !port) continue;
        portas.push({
          id: `casa-tcp-${port}`,
          origem: "Casa Windows",
          transporte: "TCP",
          protocolo: "TCP",
          categoria: "CentralDark",
          bind: `${bind}:${port}`,
          estado: portaEstado(bind, processo ?? ""),
          processo: processo || `PID ${pid}`,
          pid: pid || null,
          detalhe: `LISTEN medido por Get-NetTCPConnection; PID ${pid}`,
        });
      }
    } catch {
      // Windows pode negar a enumeração; a prova permanece UNKNOWN, nunca PASS.
    }
  }
  if (process.platform === "win32") {
    const [{ execFile: execFileCallback }, { promisify }] = await Promise.all([import("node:child_process"), import("node:util")]);
    const execFile = promisify(execFileCallback);
    let pidStdio: string | null = null;
    try {
      const { stdout } = await execFile("wsl.exe", ["-d", "openKylin", "--", "bash", "-lc", "ps -eo pid=,args= | grep '[m]cp-server.js' | grep -- '--stdio' | grep -oE '^[[:space:]]*[0-9]+' | tr -d ' ' | head -n 1"], { timeout: 4_000, windowsHide: true });
      pidStdio = stdout.trim() || null;
    } catch { /* PID stdio fica explicitamente não medido */ }
    portas.push({
      id: "openkylin-mcp-stdio",
      origem: "openKylin",
      transporte: "stdio",
      protocolo: "TCP",
      categoria: "CentralDark",
      bind: "sem porta TCP",
      estado: "PASS",
      processo: "mcp-server.js",
      pid: pidStdio,
      detalhe: "MCP observado como processo stdio; não é listener HTTP",
    });
  }
  if (process.platform === "linux") {
    const [{ execFile: callback }, { promisify }] = await Promise.all([import("node:child_process"), import("node:util")]);
    const exec = promisify(callback);
    try {
      const { stdout } = await exec("ss", ["-ltnpH"], { timeout: 4000 });
      portas.push(...portasTotaisOpenKylin(stdout).filter(p => /:(8080|8742|8000|8001|8002)$/.test(p.bind) || /tunnel|mcp/i.test(p.processo)));
    } catch { /* Falha da sonda mantém inventário desconhecido. */ }
    try {
      const { stdout } = await exec("pgrep", ["-f", "^/usr/local/bin/node /home/CentralDark-OS/CentralDark/apps/modulos/mcp/src/mcp-server.js --stdio"], { timeout: 3000 });
      const pid = stdout.trim().split(/\s+/)[0];
      if (pid) portas.push({id: 'openkylin-mcp-stdio', origem: 'openKylin', transporte: 'stdio', protocolo: 'TCP', categoria: 'CentralDark', bind: 'sem porta TCP', estado: 'RUNNING', processo: 'mcp-server.js', pid, detalhe: 'Processo STDIO medido localmente; execução MCP exige chamada própria.'});
    } catch { /* Ausência de PID não vira PASS. */ }
  }
  const tunnel = await portaOpenKylin8742();
  if (tunnel && !portas.some((porta) => porta.id === tunnel.id)) portas.push(tunnel);
  return portas.filter((porta, index, todas) => todas.findIndex((outra) => outra.id === porta.id) === index);
}

function portasTotaisOpenKylin(textoSs: string): PortaCentralDark[] {
  return textoSs.split(/\r?\n/).flatMap((linha, index) => {
    const protocolo = /UNCONN/.test(linha) ? "UDP" : /LISTEN/.test(linha) ? "TCP" : null;
    if (!protocolo) return [];
    const match = linha.match(/(?:^|\s)(\[[^\]]+\]|[^\s:]+):(\d+)\s/);
    if (!match) return [];
    const processo = linha.match(/users:\(\("([^"]+)"/)?.[1] ?? "processo não identificado";
    const pid = linha.match(/pid=(\d+)/)?.[1] ?? null;
    const categoria = /(tunnel-client|mcp-server|centraldark|commander|screenpipe)/i.test(`${processo} ${linha}`) ? "CentralDark" : "Sistema";
    return [{
      id: `openkylin-${protocolo.toLowerCase()}-${match[2]}-${index}`,
      origem: "openKylin",
      transporte: protocolo,
      protocolo,
      categoria,
      bind: `${match[1]}:${match[2]}`,
      estado: "PASS",
      processo,
      pid,
      detalhe: `${protocolo} ${/LISTEN/.test(linha) ? "LISTEN" : "UNCONN"} medido por ss; origem local openKylin`,
    } satisfies PortaCentralDark];
  });
}

function portasTotaisWindows(textoPs: string): PortaCentralDark[] {
  return textoPs.split(/\r?\n/).flatMap((linha, index) => {
    const [protocolo, bind, port, pid, processo] = linha.split("|");
    if ((protocolo !== "TCP" && protocolo !== "UDP") || !bind || !port) return [];
    const nome = processo || "processo não identificado";
    const categoria = /(centraldark|tunnel|mcp|commander|screenpipe)/i.test(nome)
      || ["3030", "8080", "8099", "8742", "9101"].includes(port)
      ? "CentralDark" : "Sistema";
    return [{
      id: `windows-${protocolo.toLowerCase()}-${port}-${pid || "unknown"}-${index}`,
      origem: "Casa Windows",
      transporte: protocolo,
      protocolo,
      categoria,
      bind: `${bind}:${port}`,
      estado: "PASS",
      processo: nome,
      pid: pid || null,
      detalhe: `Windows ${protocolo} listener; processo medido por PID${port === "8099" ? " · tarefa CentralDark-Casa-Cockpit-Hermes-One" : ""}`,
    } satisfies PortaCentralDark];
  });
}

async function inventarioTotalPortas(): Promise<PortaCentralDark[]> {
  if (process.platform === "linux") {
    try {
      const [{ execFile: callback }, { promisify }] = await Promise.all([import("node:child_process"), import("node:util")]);
      const { stdout } = await promisify(callback)("ss", ["-ltunpH"], {timeout: 4000});
      return portasTotaisOpenKylin(stdout);
    } catch { return []; }
  }
  if (process.platform !== "win32") return [];
  try {
    const [{ execFile: execFileCallback }, { promisify }] = await Promise.all([import("node:child_process"), import("node:util")]);
    const execFile = promisify(execFileCallback);
    const sondas = await Promise.allSettled([
      execFile("wsl.exe", ["-d", "openKylin", "--", "bash", "-lc", "ss -ltnupH 2>/dev/null"], { timeout: 5_000, windowsHide: true }),
      execFile("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", "$items=@(); Get-NetTCPConnection -State Listen | ForEach-Object { $p=Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue; $items += ('TCP|{0}|{1}|{2}|{3}' -f $_.LocalAddress,$_.LocalPort,$_.OwningProcess,$p.ProcessName) }; Get-NetUDPEndpoint | ForEach-Object { $p=Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue; $items += ('UDP|{0}|{1}|{2}|{3}' -f $_.LocalAddress,$_.LocalPort,$_.OwningProcess,$p.ProcessName) }; $items"], { timeout: 20_000, windowsHide: true }),
    ]);
    const openKylin = sondas[0].status === "fulfilled" ? sondas[0].value.stdout : "";
    const windows = sondas[1].status === "fulfilled" ? sondas[1].value.stdout : "";
    const portas = [...portasTotaisOpenKylin(openKylin), ...portasTotaisWindows(windows)];
  const tunnel = await portaOpenKylin8742();
    if (tunnel && !portas.some((porta) => porta.id === tunnel.id)) portas.push(tunnel);
    return portas;
  } catch {
    return [];
  }
}

// Único owner do HUD vivo: agrega GitHub + API CentralDark e nunca promove ausência de prova.
export const lerEstadoCentralDark = createServerFn({ method: "GET" }).handler(
  async (): Promise<EstadoCentralDark> => {
    const hostScreenpipe = origemLocalScreenpipe();
    const origemHttp = apiBase();
    const origemHealth = casaCommanderHealthBase();
    const casaSiteUrl = process.env["CENTRALDARK_CASA_SITE_URL"]?.trim() || DEFAULT_CASA_SITE_URL;
    const consultaEm = new Date().toISOString();
    const commanderHealthUrl = process.platform === "win32"
      ? "http://127.0.0.1:9101/health"
      : (process.env["CENTRALDARK_CASA_COMMANDER_HEALTH_URL"]?.trim()
        || "http://windows-casa.tail6d7aa4.ts.net:9100/health");
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
      screenpipeRemotoCasa,
      commanderCasa,
      actions,
      portas,
      portasTotais,
    ] = await Promise.all([
      medirGithub(),
      medirApi("/api/live-fabric/status"),
      medirApi("/api/live-fabric/graph"),
      medirApi("/api/omni/status"),
      medirApi("/health", origemHealth),
      medirApi("/heartbeat"),
      medirApi("/api/omni/models"),
      medirApi("/api/microdeploy/receipts/index.json"),
      medirReachable(casaSiteUrl, true, true),
      hostScreenpipe !== "UNKNOWN"
        ? medirReachable("http://127.0.0.1:3030/health")
        : Promise.resolve(SONDA_NAO_EXECUTADA),
      hostScreenpipe === "VPS"
        ? medirReachable(`http://${process.env["CENTRALDARK_CASA_TAILSCALE_IP"] || "100.123.93.25"}:3030/health`)
        : Promise.resolve(SONDA_NAO_EXECUTADA),
      // Servidor do Cockpit na Forja: ponte privada da Casa, nunca localhost da VM.
      medirReachable(commanderHealthUrl),
      medirActions(),
      inventarioPortasCentralDark(),
      inventarioTotalPortas(),
    ]);
    const screenpipeMedido = screenpipeIdentificado(screenpipe);
    const screenpipeCasa = hostScreenpipe === "CASA" ? screenpipeMedido : hostScreenpipe === "VPS" ? screenpipeIdentificado(screenpipeRemotoCasa) : SONDA_NAO_EXECUTADA;
    const screenpipeVps = hostScreenpipe === "VPS" ? screenpipeMedido : SONDA_NAO_EXECUTADA;
    const screenpipeCasaFonte = hostScreenpipe === "CASA"
      ? `${process.platform === "linux" ? "Forja Linux" : "Casa Windows"} · Screenpipe 3030/health · HTTP e status real`
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
        : heartbeatRaw;

    const atual = github.commits[0] ?? null;
    const gitLive = objetoJson(liveFabric.dados?.["git"]) ? liveFabric.dados["git"] : null;
    // A leitura local do Omni Router mede a Casa; nunca publicar o SHA da Casa como VPS.
    const vpsSha = hostScreenpipe === "VPS" ? texto(gitLive?.["head"]) : null;
    const mainSha = atual?.sha ?? null;
    const sincronizado = !!mainSha && !!vpsSha && mainSha === vpsSha;
    const deltaVps = await medirDelta(vpsSha, mainSha);
    // SHA sincronizado só comprova código; sem receipt SAME_SHA+health+efeito não existe deploy PASS.
    const deploy: Estado = "UNKNOWN";

    const lastTool = objetoJson(commanderCasa.dados?.["last_authorized_tool"])
      ? commanderCasa.dados["last_authorized_tool"] : null;
    const lastToolAt = texto(lastTool?.["at"]);
    const lastToolAge = lastToolAt ? Date.now() - Date.parse(lastToolAt) : Number.NaN;
    const toolProof = lastTool?.["verified"] === true
      && ["READ_ONLY", "MUTATION"].includes(String(lastTool["kind"]))
      && typeof lastTool["tool"] === "string"
      && Number.isFinite(lastToolAge) && lastToolAge >= -5_000 && lastToolAge < 600_000;
    const commanderIdentity = commanderCasa.dados?.["name"] === "CentralDark Casa Commander"
      && commanderCasa.dados?.["ok"] === true && commanderCasa.dados?.["remote_vendor"] === false;
    const commanderConnected = commanderIdentity && commanderCasa.dados?.["engine_connected"] === true;
    const resultado: EstadoCentralDark = {
      gmail: "AUTH_REQUIRED",
      githubLovable: github.estado,
      // HTTP 200 mede somente a ponte. O card só fica verde quando o motor
      // também confirma conexão; isso evita promover A para B/C.
      desktop: commanderConnected ? (toolProof ? "PASS" : "RUNNING") : "UNKNOWN",
      commanderEngine: typeof commanderCasa.dados?.["engine_connected"] === "boolean" ? commanderCasa.dados["engine_connected"] as boolean : null,
      commanderHttp: commanderCasa.httpStatus,
      commanderToolProof: toolProof ? {
        tool: String(lastTool?.["tool"]).slice(0, 64),
        kind: String(lastTool?.["kind"]).slice(0, 24),
        at: lastToolAt!,
      } : null,
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
      omniModelsHttp: omniModels.httpStatus,
      receiptsHttp: receipts.httpStatus,
      casaSiteHttp: casaSite.httpStatus,
      casaSiteFonte: `${process.platform === "linux" ? "Forja Linux" : "Casa Windows"} · GET ${casaSiteUrl} · só HTTP (não prova motor)`,
      screenpipeHttp: screenpipeCasa.httpStatus,
      screenpipeDetail: texto(screenpipeCasa.dados?.["status"]),
      screenpipeAudioStatus: texto(screenpipeCasa.dados?.["audio_status"]),
      screenpipeFonte: screenpipeCasaFonte,
      screenpipeEvents: hostScreenpipe === "CASA" || hostScreenpipe === "VPS" ? saidaScreenpipe(screenpipeCasa) : ["NÃO MEDIDO · exige sensor na Casa"],
      screenpipeVpsHttp: screenpipeVps.httpStatus,
      screenpipeVpsDetail: texto(screenpipeVps.dados?.["status"]),
      screenpipeVpsFonte,
      screenpipeVpsEvents: hostScreenpipe === "VPS" ? saidaScreenpipe(screenpipeVps) : ["NÃO MEDIDO · exige sensor na VPS"],
      screenpipeCasaMedidoEm: hostScreenpipe === "CASA" || hostScreenpipe === "VPS" ? consultaEm : null,
      screenpipeVpsMedidoEm: hostScreenpipe === "VPS" ? consultaEm : null,
      apiHealthFonte: `origem=${hostname()} · destino=${origemHttp}/health · GET server-side · API/Omni 8099`,
      apiHealthServico: apiServico.slice(0, 100),
      apiHealthMedidoEm: consultaEm,
      desktopVpsFonte: "Remote Desktop Commander VPS · sensor externo não consultado neste servidor; offline do conector não prova VPS parada",
      actionsFonte: actions.fonte,
      actionsErro: actions.erro,
      gmailFonte: "Sensor externo Gmail/ChatGPT · adapter do Cockpit ainda não ligado",
      desktopFonte: commanderHealthUrl + " · somente saúde e último recibo autenticado (10 min)",
      portas,
      portasTotais,
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
        const { error } = await supabaseAdmin.from("radar_pulses" as any).insert(linhas as any);
        if (error) {
          console.error("[radar-pulses] publicação falhou:", error.code ?? "UNKNOWN");
        }
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
