import { createServerFn } from "@tanstack/react-start";
import { readFile, stat, statfs } from "node:fs/promises";
import { join } from "node:path";
import { hostname, platform } from "node:os";
import { existsSync } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { apiBase, type Estado } from "@/lib/cockpit.functions";

// Máquina viva: One Heart (/heartbeat + /health) lido no servidor, porque o site
// publicado em https não pode chamar um IP http direto (conteúdo misto).
// Nada é inventado: sem campo medido, o valor volta null e o estado UNKNOWN.

const LIMITE_FRESCOR_SEG = 15;
const TEMPO_MAXIMO_MS = 4_000;

type Json = Record<string, unknown>;

export type SondaViva = {
  caminho: string;
  estado: Estado;
  http: number | null;
  erro: string | null;
  medidoEm: string;
};

type SondaInterna = SondaViva & { dados: Json | null };

export type GpuCasa = {
  estado: "LIVE" | "STALE" | "UNKNOWN";
  fonte: "MAHMSharedMemory";
  atualizadoEm: string | null;
  idadeSeg: number | null;
  anunciados: number | null;
  sensores: Array<{ nome: string; unidade: string; valor: number }>;
  motivo: string | null;
};

export type RtssOverlayCasa = {
  ok: boolean;
  state: string;
  measuredAt: string;
  running: boolean;
  pid: number | null;
  visible: boolean;
  rect: { x: number; y: number; width: number; height: number } | null;
  displays: Array<{ device: string; x: number; y: number; width: number; height: number; primary: boolean }>;
  aliases: Record<string, { device: string; x: number; y: number; width: number; height: number; primary: boolean }>;
  target?: string;
  startedByCentralDark?: boolean;
  detail?: string;
};

export type MaquinaViva = {
  fonte: string;
  medidoEm: string;
  heartbeat: SondaViva;
  health: SondaViva;
  cpu: { percentual: number | null; chave: string | null };
  memoria: { percentual: number | null; chave: string | null };
  carga: number[] | null;
  gpuCasa: GpuCasa;
  discoServidor: {
    estado: Estado;
    host: string | null;
    hostVpsConfirmado: boolean;
    pontoMontagem: "/";
    totalBytes: number | null;
    usadoBytes: number | null;
    disponivelBytes: number | null;
    reservadoBytes: number | null;
    percentualUsado: number | null;
    medidoEm: string;
    erro: string | null;
    fonte: string;
  };
  frescor: { idadeSeg: number | null; fresco: boolean | null; medidoPeloOwner: string | null };
};

function ehObjeto(v: unknown): v is Json {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

async function exigirAdmin(context: { supabase: { from: (name: string) => any }; userId: string }) {
  const { data } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId).eq("role", "admin").maybeSingle();
  if (!data) throw new Response("Proibido", { status: 403 });
}

const rtssInput = z.object({
  action: z.enum(["status", "open", "move", "close"]),
  target: z.enum(["esquerda", "centro-superior", "centro-inferior", "direita"]).optional(),
}).superRefine((data, ctx) => {
  if (data.action === "move" && !data.target) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["target"], message: "Alvo físico obrigatório para mover" });
  if (data.action !== "move" && data.target) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["target"], message: "Alvo só é permitido ao mover" });
});

let rtssHostTemporarioPid: number | null = null;
const rtssScript = process.env["CENTRALDARK_RTSS_OVERLAY_SCRIPT"] ?? "K:\\scripts\\casa\\CentralDark-RtssOverlay.ps1";

function rtssIndisponivel(state: string): RtssOverlayCasa {
  return { ok: false, state, measuredAt: new Date().toISOString(), running: false, pid: null, visible: false, rect: null, displays: [], aliases: {} };
}

// #OBSERVACOES# @owner=apps/instinto-superior/src/lib/maquina.functions.ts @doc_ref=docs/HUD/README.md @last_updated=2026-10-28T17:32:00.000Z
// Bridge estrita: somente o script Casa allowlisted recebe acao/alias tipados. Sem shell livre vindo do navegador; fora da Casa retorna UNKNOWN operacional.
async function executarRtssOverlay(input: z.infer<typeof rtssInput>): Promise<RtssOverlayCasa> {
  if (platform() !== "win32" || hostname().toUpperCase() !== "SEGREDO") return rtssIndisponivel("RUNTIME_NAO_E_CASA_WINDOWS");
  if (!existsSync(rtssScript)) return rtssIndisponivel("RTSS_OWNER_SCRIPT_ABSENT");
  if (input.action === "close" && rtssHostTemporarioPid == null) return rtssIndisponivel("REFUSE_CLOSE_NOT_OWNED");
  const args = ["-NoLogo", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File", rtssScript, "-Action", input.action];
  if (input.target) args.push("-Target", input.target);
  if (input.action === "close") args.push("-ExpectedPid", String(rtssHostTemporarioPid));
  try {
    const { stdout } = await promisify(execFile)("powershell.exe", args, { timeout: 8_000, maxBuffer: 64 * 1024, windowsHide: true });
    const result: unknown = JSON.parse(stdout.trim());
    if (!ehObjeto(result) || typeof result["ok"] !== "boolean" || typeof result["state"] !== "string") return rtssIndisponivel("RTSS_OWNER_RESPONSE_INVALID");
    const view = result as unknown as RtssOverlayCasa;
    if (view.ok && view.startedByCentralDark && typeof view.pid === "number") rtssHostTemporarioPid = view.pid;
    if (input.action === "close" && view.ok) rtssHostTemporarioPid = null;
    return view;
  } catch {
    return rtssIndisponivel("RTSS_OWNER_RUNTIME_UNREACHABLE");
  }
}

async function sondar(caminho: string): Promise<SondaInterna> {
  const medidoEm = new Date().toISOString();
  const controle = new AbortController();
  const timer = setTimeout(() => controle.abort(), TEMPO_MAXIMO_MS);
  try {
    const r = await fetch(`${apiBase()}${caminho}`, {
      headers: { accept: "application/json" },
      cache: "no-store",
      signal: controle.signal,
    });
    if (!r.ok) {
      return {
        caminho,
        estado: "FAIL",
        http: r.status,
        erro: `HTTP ${r.status}`,
        medidoEm,
        dados: null,
      };
    }
    const corpo = (await r.json()) as unknown;
    if (!ehObjeto(corpo)) {
      return {
        caminho,
        estado: "FAIL",
        http: r.status,
        erro: "JSON fora do contrato",
        medidoEm,
        dados: null,
      };
    }
    const ok = corpo["ok"];
    return {
      caminho,
      estado: ok === false ? "FAIL" : "PASS",
      http: r.status,
      erro: null,
      medidoEm,
      dados: corpo,
    };
  } catch (e) {
    const erro = e instanceof Error && e.name === "AbortError" ? "Tempo esgotado" : "Sem resposta";
    return { caminho, estado: "UNKNOWN", http: null, erro, medidoEm, dados: null };
  } finally {
    clearTimeout(timer);
  }
}

// Procura, em profundidade limitada, o primeiro número cuja chave casa com o padrão.
function achar(dado: unknown, padrao: RegExp, nivel = 0): { valor: number; chave: string } | null {
  if (!ehObjeto(dado) || nivel > 4) return null;
  for (const [chave, valor] of Object.entries(dado)) {
    if (padrao.test(chave) && typeof valor === "number" && Number.isFinite(valor)) {
      return { valor, chave };
    }
  }
  for (const valor of Object.values(dado)) {
    const achado = achar(valor, padrao, nivel + 1);
    if (achado) return achado;
  }
  return null;
}

function percentual(a: { valor: number; chave: string } | null) {
  if (!a) return { percentual: null, chave: null };
  const p = a.valor <= 1 ? a.valor * 100 : a.valor;
  return { percentual: Math.max(0, Math.min(100, Math.round(p * 10) / 10)), chave: a.chave };
}

// Disco medido no MESMO processo servidor autenticado do cockpit.
// Não tratar um host SSR remoto/container como a VPS sem identidade comprovada.
// Nenhuma varredura, limpeza ou escrita no filesystem.
async function medirDiscoServidor(): Promise<MaquinaViva["discoServidor"]> {
  const medidoEm = new Date().toISOString();
  const base = {
    estado: "UNKNOWN" as Estado,
    host: null as string | null,
    hostVpsConfirmado: false,
    pontoMontagem: "/" as const,
    totalBytes: null as number | null,
    usadoBytes: null as number | null,
    disponivelBytes: null as number | null,
    reservadoBytes: null as number | null,
    percentualUsado: null as number | null,
    medidoEm,
    erro: null as string | null,
    fonte: "statfs('/') · processo SSR autenticado",
  };
  if (platform() !== "linux") return { ...base, erro: "Servidor não é Linux" };
  try {
    const host = hostname();
    const hostVpsConfirmado = /^(centraldark-os|vmi3256920)(?:[.].*)?$/i.test(host);
    const disco = await statfs("/", { bigint: true });
    const total = Number(disco.blocks * disco.bsize);
    const livreFisico = Number(disco.bfree * disco.bsize);
    const disponivel = Number(disco.bavail * disco.bsize);
    if (![total, livreFisico, disponivel].every(Number.isSafeInteger) ||
        total <= 0 || livreFisico < 0 || disponivel < 0 ||
        livreFisico > total || disponivel > livreFisico) {
      return { ...base, host, hostVpsConfirmado, erro: "Contadores statfs inválidos" };
    }
    const usado = total - livreFisico;
    return {
      ...base, estado: "PASS", host, hostVpsConfirmado,
      totalBytes: total, usadoBytes: usado, disponivelBytes: disponivel,
      reservadoBytes: livreFisico - disponivel,
      percentualUsado: Math.round((usado / total) * 1000) / 10,
    };
  } catch {
    return { ...base, erro: "statfs indisponível neste runtime" };
  }
}

// #OBSERVACOES# @owner=apps/instinto-superior/src/lib/maquina.functions.ts @doc_ref=docs/HUD/README.md @last_updated=2026-10-27T14:36:38.462Z
// Motivo: utilizar o coletor read-only MAHMSharedMemory que a Casa já tem; sem novo serviço, controle de GPU ou exposição de filesystem ao navegador.
async function medirGpuCasa(): Promise<GpuCasa> {
  const desconhecido = (motivo: string, estado: GpuCasa["estado"] = "UNKNOWN", atualizadoEm: string | null = null, idadeSeg: number | null = null): GpuCasa =>
    ({estado, fonte:"MAHMSharedMemory", atualizadoEm, idadeSeg, anunciados:null, sensores:[], motivo});
  if (platform() !== "win32" || hostname().toUpperCase() !== "SEGREDO" || !process.env["LOCALAPPDATA"])
    return desconhecido("RUNTIME_NAO_E_CASA_WINDOWS");
  const arquivo = join(process.env["LOCALAPPDATA"], "CentralDark", "CENTRALDARK-AFTERBURNER-LIVE.js");
  try {
    const info = await stat(arquivo);
    if (!info.isFile() || info.size < 40 || info.size > 262144)
      return desconhecido("FEED_INVALIDO_OU_MUITO_GRANDE");
    const bruto = await readFile(arquivo, "utf8");
    const prefixo = "window.CENTRALDARK_AFTERBURNER_LIVE=";
    if (!bruto.startsWith(prefixo)) return desconhecido("FEED_SEM_ASSINATURA");
    const texto = bruto.slice(prefixo.length).trim().replace(/;\s*$/, "");
    const amostra: unknown = JSON.parse(texto);
    if (!ehObjeto(amostra) || amostra["schema"] !== "centraldark.afterburner.v1" ||
        amostra["origin"] !== "CASA_SEGREDO" || amostra["source"] !== "MAHMSharedMemory" ||
        !Array.isArray(amostra["sensors"]) || amostra["sensors"].length > 128 ||
        typeof amostra["sourceUpdatedAt"] !== "string")
      return desconhecido("FEED_FORA_DO_CONTRATO");
    const tempo = Date.parse(amostra["sourceUpdatedAt"]);
    const idadeMs = Date.now() - tempo;
    if (!Number.isFinite(tempo) || idadeMs < -15000) return desconhecido("FONTE_SEM_TEMPO_VALIDO");
    const idadeSeg = Math.max(0, Math.round(idadeMs / 1000));
    if (idadeMs > 30000) return desconhecido("FONTE_VENCIDA", "STALE", amostra["sourceUpdatedAt"], idadeSeg);
    const sensores = amostra["sensors"].flatMap((s: unknown) => {
      if (!ehObjeto(s) || typeof s["name"] !== "string" || s["name"].length > 100 ||
          typeof s["unit"] !== "string" || s["unit"].length > 32 ||
          typeof s["value"] !== "number" || !Number.isFinite(s["value"]) || Math.abs(s["value"]) > 1e8)
        return [];
      return [{nome: s["name"], unidade: s["unit"], valor: s["value"]}];
    });
    if (!sensores.some((s: {nome:string}) => s.nome === "GPU usage"))
      return desconhecido("SENSOR_GPU_PRINCIPAL_AUSENTE");
    return {estado:"LIVE", fonte:"MAHMSharedMemory", atualizadoEm:amostra["sourceUpdatedAt"],
      idadeSeg, anunciados:typeof amostra["announcedCount"] === "number" ? amostra["announcedCount"] : null,
      sensores, motivo:null};
  } catch {
    return desconhecido("COLETOR_LOCAL_INDISPONIVEL");
  }
}

export const lerMaquinaViva = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MaquinaViva> => {
    await exigirAdmin(context);

    const [heartbeat, health, discoServidor, gpuCasa] = await Promise.all([sondar("/heartbeat"), sondar("/health"), medirDiscoServidor(), medirGpuCasa()]);
    const fontes = [heartbeat.dados, health.dados];
    const primeiro = <T>(fn: (d: unknown) => T | null) => {
      for (const f of fontes) {
        const r = fn(f);
        if (r) return r;
      }
      return null;
    };

    const cpu = percentual(primeiro((d) => achar(d, /^cpu(_?(percent|pct|usage|used|load))?$/i)));
    const memoria = percentual(
      primeiro((d) => achar(d, /^(mem|memory|ram)(_?(percent|pct|usage|used))?$/i)),
    );

    let carga: number[] | null = null;
    for (const f of fontes) {
      if (ehObjeto(f)) {
        const c = f["loadavg"] ?? f["load_avg"] ?? f["load"];
        if (Array.isArray(c) && c.every((n) => typeof n === "number")) {
          carga = c as number[];
          break;
        }
      }
    }

    // Frescor só vale com horário medido pelo próprio owner; hora da consulta não prova pulsação.
    let medidoPeloOwner: string | null = null;
    for (const f of fontes) {
      if (ehObjeto(f)) {
        const t = f["measured_at"] ?? f["measuredAt"] ?? f["ts"] ?? f["timestamp"];
        if (typeof t === "string" && Number.isFinite(Date.parse(t))) {
          medidoPeloOwner = t;
          break;
        }
      }
    }
    const idadeSeg = medidoPeloOwner
      ? Math.max(0, Math.round((Date.now() - Date.parse(medidoPeloOwner)) / 1000))
      : null;

    const publico = ({ dados: _dados, ...resto }: SondaInterna): SondaViva => resto;
    return {
      fonte: apiBase(),
      medidoEm: new Date().toISOString(),
      heartbeat: publico(heartbeat),
      health: publico(health),
      cpu,
      memoria,
      carga,
      discoServidor,
      gpuCasa,
      frescor: {
        idadeSeg,
        fresco: idadeSeg == null ? null : idadeSeg <= LIMITE_FRESCOR_SEG,
        medidoPeloOwner,
      },
    };
  });

export const operarOverlayRtssCasa = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => rtssInput.parse(data))
  .handler(async ({ context, data }): Promise<RtssOverlayCasa> => {
    await exigirAdmin(context);
    return executarRtssOverlay(data);
  });
