import { createServerFn } from "@tanstack/react-start";
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

export type MaquinaViva = {
  fonte: string;
  medidoEm: string;
  heartbeat: SondaViva;
  health: SondaViva;
  cpu: { percentual: number | null; chave: string | null };
  memoria: { percentual: number | null; chave: string | null };
  carga: number[] | null;
  frescor: { idadeSeg: number | null; fresco: boolean | null; medidoPeloOwner: string | null };
};

function ehObjeto(v: unknown): v is Json {
  return !!v && typeof v === "object" && !Array.isArray(v);
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

export const lerMaquinaViva = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MaquinaViva> => {
    const { data } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!data) throw new Response("Proibido", { status: 403 });

    const [heartbeat, health] = await Promise.all([sondar("/heartbeat"), sondar("/health")]);
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
      frescor: {
        idadeSeg,
        fresco: idadeSeg == null ? null : idadeSeg <= LIMITE_FRESCOR_SEG,
        medidoPeloOwner,
      },
    };
  });
