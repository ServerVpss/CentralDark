// Sala de Controle — cockpit denso fundido com Overclock 1.1.0.
// Adições P0 sobre a base viva: header operacional (VOL/PPM/CODE/UPTIME/SHA),
// bloco de MISSÕES no nav, aba OPS com grid 2×2 e Jarvis flutuante.
// Dados ainda mock — o plug real (Hermes-Core, HUB, Gateway) entra na Fase 3.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./sala-controle.css";
import "./hermes.css";
import { useCockpitLive, type NoStatus } from "./hooks/useCockpitLive";

import GrokMissoes from "@/components/GrokMissoes";
import { MatrixRain } from "./MatrixRain";
import { HermesMascote } from "./HermesMascote";
import { PainelOps } from "./PainelOps";
import { JarvisOrb } from "./JarvisOrb";
import { PainelNivel7 } from "./PainelNivel7";
import { PainelAvanco } from "./painéis/PainelAvanco";
import { PainelJarvis } from "./PainelJarvis";


const ABAS = [
  { id: "avanco",label: "AVANÇO"},
  { id: "ops",   label: "OPS"   },
  { id: "jarvis",label: "JARVIS"},
  { id: "mcp",   label: "MCP"   },
  { id: "hub",   label: "HUB"   },
  { id: "infra", label: "INFRA" },
  { id: "ias",   label: "IAs"   },
  { id: "grok",  label: "GROK"  },
  { id: "n7",    label: "N7"    },
  { id: "logs",  label: "LOGS"  },
] as const;
type AbaId = typeof ABAS[number]["id"];

// Missões mock exibidas na sidebar (Fase 3 pluga o Hermes-Core/missions)
const MISSOES_SIDEBAR = [
  { id: "s1", txt: "Fusão cockpit P0",       status: "ativa" as const },
  { id: "s2", txt: "Barramento Hermes",      status: "pendente" as const },
  { id: "s3", txt: "Plugar logs reais",      status: "pendente" as const },
  { id: "s4", txt: "Alinhar VPS chore/*",    status: "travada" as const },
];

function statusClass(s: NoStatus | "ativa" | "pendente" | "travada") {
  if (s === "ok" || s === "ativa") return "";
  if (s === "pendente") return "warn";
  if (s === "travada") return "err";
  return s;
}
function relogio() {
  return new Date().toLocaleTimeString("pt-BR", { hour12: false });
}
// HEAD SHA do build (Vite injeta em prod; fallback DEV)
const HEAD_SHA =
  (import.meta.env.VITE_COMMIT_SHA as string | undefined)?.slice(0, 7) || "dev-live";

export default function SalaControle() {
  const [aba, setAba] = useState<AbaId>("avanco");
  const state = useCockpitLive();
  const [hora, setHora] = useState(relogio());

  useEffect(() => {
    const t = setInterval(() => setHora(relogio()), 1000);
    return () => clearInterval(t);
  }, []);


  const statusGeral: NoStatus = state.nos.some((n) => n.status === "down")
    ? "down"
    : state.nos.some((n) => n.status === "warn")
      ? "warn"
      : "ok";

  const ultimoLog = state.console[state.console.length - 1];
  const ultimoEvento = ultimoLog
    ? { id: Number(String(ultimoLog.id).replace(/\D/g, "")) || Date.now(), texto: ultimoLog.linha, pane: "console" }
    : null;

  // RCD — quantos "loops abertos" existem (Zeigarnik nudge)
  const missoesAbertas = MISSOES_SIDEBAR.filter((m) => m.status !== "ativa").length;
  const respostaHero =
    statusGeral === "ok" ? "Tudo verde" : statusGeral === "warn" ? "Atenção" : "Alerta";
  const segundosDesdeUltimo = ultimoLog
    ? Math.max(0, Math.round((Date.now() - new Date(ultimoLog.ts).getTime()) / 1000))
    : null;

  return (
    <div className="sc-root sc-mono">
      <div className="sc-matrix" aria-hidden><MatrixRain /></div>
      <div className="sc-grid">
        {/* HEADER OPERACIONAL — RCD: UMA resposta dominante + CTA primário.
            Métricas secundárias viram linha fina que não briga por atenção. */}
        <div className="sc-cell sc-head">
          <div className="sc-head-hero">
            <span className="sc-head-brand">CENTRAL<em>DARK</em></span>
            <span className={"sc-hero-answer " + statusClass(statusGeral)}>
              <span className={"sc-dot " + statusClass(statusGeral)} />
              {respostaHero}
            </span>
            <span className="sc-hero-sub">
              200 OK · {segundosDesdeUltimo !== null ? `última ação ${segundosDesdeUltimo}s atrás` : "aguardando eventos"}
            </span>
          </div>

          <div className="sc-head-metrics" title="métricas operacionais">
            <span><b>1.2k/h</b> vol</span>
            <span><b>12,4</b> ppm</span>
            <span><b>113h</b> up</span>
            <span className="sc-head-sha">sha <b>{HEAD_SHA}</b></span>
          </div>

          <div className="sc-head-right">
            <button className="sc-cta-primary" onClick={() => setAba("ops")}>
              + Nova missão
              {missoesAbertas > 0 && <span className="sc-cta-badge">{missoesAbertas}</span>}
            </button>
            <span className="sc-head-clock">{hora}</span>
            <Link className="sc-head-close" to="/centraldark/admin">← sair</Link>
          </div>
        </div>

        {/* NAV + MISSÕES */}
        <div className="sc-cell sc-nav">
          <div className="sc-nav-title">NAVEGAÇÃO</div>
          {ABAS.map((a) => (
            <button
              key={a.id}
              className={aba === a.id ? "on" : ""}
              onClick={() => setAba(a.id)}
            >
              <span className="sc-dot idle" />
              {a.label}
            </button>
          ))}

          <div className="sc-nav-sec">
            <div className="sc-nav-title">MISSÕES</div>
            {MISSOES_SIDEBAR.map((m) => (
              <div key={m.id} className="sc-nav-missao" title={m.status}>
                <span className={"sc-dot " + statusClass(m.status)} />
                <span className="sc-nav-missao-txt">{m.txt}</span>
              </div>
            ))}
          </div>

          <div className="sc-nav-hermes">
            <HermesMascote ultimoEvento={ultimoEvento} />
            <div style={{ marginTop: 6 }}>loop 24h · ok</div>
          </div>
        </div>

        {/* CENTRO */}
        <div className="sc-cell sc-map">
          {aba === "avanco" ? (
            <div style={{ overflow: "auto", maxHeight: "100%" }}>
              <PainelAvanco />
            </div>
          ) : aba === "ops" ? (
            <PainelOps />
          ) : aba === "jarvis" ? (
            <PainelJarvis nos={state.nos} links={state.links} atualizadoEm={state.atualizadoEm} />
          ) : aba === "grok" ? (

            <div style={{ overflow: "auto", maxHeight: "100%" }}>
              <GrokMissoes />
            </div>
          ) : aba === "n7" ? (
            <PainelNivel7 />
          ) : (
            <div className="sc-panel">
              <h2>{aba}</h2>
              <div className="sc-empty">
                Aba <b style={{ color: "var(--sc-em-hi)" }}>{aba.toUpperCase()}</b> pronta pra receber os dados do dossiê Grok.
                <div style={{ marginTop: 10, fontSize: 10 }}>
                  Quando o mapeamento chegar, os cards, gráficos e logs específicos deste setor aparecem aqui.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* TERMINAL */}
        <div className="sc-cell sc-term">
          <div className="sc-term-head">
            <span>◉ CONSOLE · somente leitura</span>
            <span>hermes-core · pm2 · id 77</span>
          </div>
          {state.console.map((l) => (
            <div key={l.id} className="sc-term-line">
              <span>[{new Date(l.ts).toLocaleTimeString("pt-BR", { hour12: false })}]</span>
              {l.linha}
            </div>
          ))}
        </div>

        {/* FEED */}
        <div className="sc-cell sc-feed">
          <div className="sc-feed-head">FEED IA · <b>Hermes ao vivo</b></div>
          <div className="sc-feed-list">
            {state.eventos.map((e) => (
              <div key={e.id} className="sc-ev">
                <div className="sc-ev-top">
                  <span className="sc-ev-src">{e.fonte}</span>
                  <span>{new Date(e.ts).toLocaleTimeString("pt-BR", { hour12: false })}</span>
                </div>
                <div className={"sc-ev-txt " + e.tom}>{e.texto}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <JarvisOrb />
    </div>
  );
}

