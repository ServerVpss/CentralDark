// Painel OPS — grid 2×2 denso, estilo Overclock 1.1.0 fundido com SalaControle.
// Cada pane tem header colorido próprio + badge de custo. Dados mock por enquanto;
// o plug real (Hermes-Core, Gateway, HUB) entra na Fase 3.
import { useState } from "react";

const LOGS_POR_PAGINA = 4;
const PROVIDERS_POR_PAGINA = 4;

type MissaoStatus = "ativa" | "pendente" | "travada";
interface Missao {
  id: string;
  titulo: string;
  agente: string;
  status: MissaoStatus;
}

const MISSOES: Missao[] = [
  { id: "m1", titulo: "Fusão cockpit P0",        agente: "Lovable",  status: "ativa" },
  { id: "m2", titulo: "Barramento Hermes-Core",  agente: "Hermes",   status: "pendente" },
  { id: "m3", titulo: "Plugar logs reais",       agente: "Executor", status: "pendente" },
  { id: "m4", titulo: "Alinhar VPS chore/*",     agente: "Deploy",   status: "travada" },
];

interface LogHermes { ts: string; tag: string; msg: string; tom: "info" | "ok" | "warn" | "err" }
const LOGS: LogHermes[] = [
  { ts: "22:04:12", tag: "executor",  msg: "PM2 id 27 heartbeat OK",            tom: "ok"   },
  { ts: "22:04:03", tag: "critic",    msg: "auto-diagnóstico rodada 82",        tom: "info" },
  { ts: "22:03:51", tag: "gateway",   msg: "134 modelos disponíveis",           tom: "ok"   },
  { ts: "22:03:40", tag: "bot",       msg: "fila puxadas = 3",                  tom: "warn" },
  { ts: "22:03:19", tag: "watcher",   msg: "SHA aprovado sincronizado",         tom: "ok"   },
  { ts: "22:02:58", tag: "hub",       msg: "hub_events rows=142",               tom: "info" },
];

type ProviderTab = "lovable" | "gateway" | "hub" | "local";
interface Provider { nome: string; status: "ok" | "warn" | "err"; latMs: number; obs: string }
const PROVIDERS: Record<ProviderTab, Provider[]> = {
  lovable: [
    { nome: "gpt-5.5",         status: "ok",   latMs: 412, obs: "principal"  },
    { nome: "claude-sonnet",   status: "ok",   latMs: 380, obs: "code"       },
    { nome: "gemini-2.5-pro",  status: "warn", latMs: 890, obs: "picos"      },
  ],
  gateway: [
    { nome: "api.centralldark.com", status: "ok", latMs: 92, obs: "134 modelos" },
    { nome: "elite-http",           status: "ok", latMs: 55, obs: "PM2 elite"   },
  ],
  hub: [
    { nome: "supabase HUB",   status: "ok", latMs: 120, obs: "lyoigs…"       },
    { nome: "supabase local", status: "ok", latMs: 140, obs: "kagejp…"       },
  ],
  local: [
    { nome: "darkai CLI",     status: "ok",  latMs: 30,  obs: "PC do Pivete" },
    { nome: "mcp dispatcher", status: "warn", latMs: 210, obs: "auth 401 público" },
  ],
};

interface Custo { rotulo: string; usd: string; ppm: string; delta: string; tom: "ok" | "warn" }
const CUSTOS: Custo[] = [
  { rotulo: "Hoje",       usd: "$ 2,41",  ppm: "12,4 ppm", delta: "-8%",  tom: "ok"   },
  { rotulo: "Semana",     usd: "$ 18,72", ppm: "14,1 ppm", delta: "+3%",  tom: "warn" },
  { rotulo: "Mês",        usd: "$ 71,05", ppm: "11,8 ppm", delta: "-12%", tom: "ok"   },
  { rotulo: "Gateway",    usd: "$ 0,84",  ppm: " 3,2 ppm", delta: "flat", tom: "ok"   },
];

function dotClass(s: MissaoStatus | "ok" | "warn" | "err") {
  return s === "ativa" || s === "ok" ? "" : s === "pendente" ? "warn" : s === "travada" || s === "err" ? "err" : "warn";
}

export function PainelOps() {
  const [aba, setAba] = useState<ProviderTab>("lovable");
  const [logsPag, setLogsPag] = useState(1);
  const [provPag, setProvPag] = useState(1);

  // RCD — Hero pane: UMA resposta ("está tudo rodando?") + gancho Zeigarnik.
  const totalMissoes = MISSOES.length;
  const abertas = MISSOES.filter((m) => m.status !== "ativa").length;
  const gastoHoje = CUSTOS[0]?.usd ?? "$ 0";
  const deltaHoje = CUSTOS[0]?.delta ?? "flat";
  const ultimoOk = LOGS.find((l) => l.tom === "ok");

  const logsVisiveis = LOGS.slice(0, logsPag * LOGS_POR_PAGINA);
  const logsRestantes = Math.max(0, LOGS.length - logsVisiveis.length);
  const providersAba = PROVIDERS[aba];
  const provVisiveis = providersAba.slice(0, provPag * PROVIDERS_POR_PAGINA);
  const provRestantes = Math.max(0, providersAba.length - provVisiveis.length);

  return (
    <div className="ops-grid ops-grid-hero">
      {/* HERO — resposta direta pro Pivete antes de qualquer painel */}
      <section className="ops-hero">
        <div className="ops-hero-main">
          <span className="ops-hero-label">SISTEMA</span>
          <span className="ops-hero-value">Rodando</span>
          <span className="ops-hero-sub">{ultimoOk ? `${ultimoOk.tag} · ${ultimoOk.msg}` : "aguardando"}</span>
        </div>
        <div className="ops-hero-stats">
          <div className="ops-hero-stat">
            <span className="ops-hero-stat-v">{abertas}<em>/{totalMissoes}</em></span>
            <span className="ops-hero-stat-k">missões abertas</span>
          </div>
          <div className="ops-hero-stat">
            <span className="ops-hero-stat-v">{gastoHoje}</span>
            <span className="ops-hero-stat-k">hoje · {deltaHoje}</span>
          </div>
        </div>
        <button className="ops-hero-cta">Fechar 1 missão →</button>
      </section>


      {/* PANE 1 — MISSÕES (esmeralda) */}
      <section className="ops-pane pane-emerald">
        <header className="pane-head">
          <span className="pane-title">◇ MISSÕES ATIVAS</span>
          <span className="pane-cost">$ 0,14</span>
        </header>
        <div className="pane-body">
          {MISSOES.map((m) => (
            <div key={m.id} className="ops-missao">
              <span className={"sc-dot " + dotClass(m.status)} />
              <span className="ops-missao-titulo">{m.titulo}</span>
              <span className="ops-missao-agente">{m.agente}</span>
            </div>
          ))}
        </div>
      </section>

      {/* PANE 2 — LOGS HERMES (âmbar) — stack + paginação no mobile */}
      <section className="ops-pane pane-amber">
        <header className="pane-head">
          <span className="pane-title">◇ LOGS HERMES</span>
          <span className="pane-cost">$ 0,02</span>
        </header>
        <div className="pane-body pane-body-scroll">
          {logsVisiveis.map((l, i) => (
            <div key={i} className="ops-log">
              <span className="ops-log-ts">[{l.ts}]</span>
              <span className="ops-log-tag">{l.tag}</span>
              <span className={"ops-log-msg tom-" + l.tom} title={l.msg}>{l.msg}</span>
            </div>
          ))}
          {logsRestantes > 0 && (
            <button
              className="ops-paginar"
              onClick={() => setLogsPag((p) => p + 1)}
              aria-label={`Ver mais ${logsRestantes} logs`}
            >
              ver mais {logsRestantes} logs ↓
            </button>
          )}
          {logsRestantes === 0 && logsPag > 1 && (
            <button className="ops-paginar" onClick={() => setLogsPag(1)}>
              recolher ↑
            </button>
          )}
        </div>
      </section>

      {/* PANE 3 — PROVIDERS (roxo) — abas com scroll e paginação */}
      <section className="ops-pane pane-purple">
        <header className="pane-head">
          <span className="pane-title">◇ PROVIDERS / GATEWAY</span>
          <span className="pane-cost">$ 0,58</span>
        </header>
        <div className="ops-tabs" role="tablist">
          {(["lovable", "gateway", "hub", "local"] as ProviderTab[]).map((k) => (
            <button
              key={k}
              role="tab"
              aria-selected={aba === k}
              className={aba === k ? "on" : ""}
              onClick={() => { setAba(k); setProvPag(1); }}
            >
              {k.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="pane-body pane-body-scroll">
          {provVisiveis.map((p, i) => (
            <div key={i} className="ops-prov">
              <span className={"sc-dot " + dotClass(p.status)} />
              <span className="ops-prov-nome" title={p.nome}>{p.nome}</span>
              <span className="ops-prov-lat">{p.latMs}ms</span>
              <span className="ops-prov-obs">{p.obs}</span>
            </div>
          ))}
          {provRestantes > 0 && (
            <button className="ops-paginar" onClick={() => setProvPag((p) => p + 1)}>
              ver mais {provRestantes} ↓
            </button>
          )}
        </div>
      </section>

      {/* PANE 4 — CUSTOS $ / PPM (ciano) */}
      <section className="ops-pane pane-cyan">
        <header className="pane-head">
          <span className="pane-title">◇ CUSTOS · PPM</span>
          <span className="pane-cost">$ 92,32</span>
        </header>
        <div className="pane-body">
          {CUSTOS.map((c, i) => (
            <div key={i} className="ops-custo">
              <span className="ops-custo-rot">{c.rotulo}</span>
              <span className="ops-custo-usd">{c.usd}</span>
              <span className="ops-custo-ppm">{c.ppm}</span>
              <span className={"ops-custo-delta tom-" + c.tom}>{c.delta}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
