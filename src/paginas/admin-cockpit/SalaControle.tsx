// Sala de Controle — cockpit denso, sem cara de site.
// Layout: header · nav lateral · mapa vivo central · feed IA · terminal embutido.
// Fase 1: mock estruturado via useCockpitLive. Fase 2: conectar HUB /cockpit/state.
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./sala-controle.css";
import { useCockpitLive, type CockpitNo, type NoStatus } from "./hooks/useCockpitLive";

const ABAS = [
  { id: "mapa",  label: "MAPA" },
  { id: "mcp",   label: "MCP" },
  { id: "hub",   label: "HUB" },
  { id: "infra", label: "INFRA" },
  { id: "ias",   label: "IAs" },
  { id: "logs",  label: "LOGS" },
] as const;
type AbaId = typeof ABAS[number]["id"];

function statusClass(s: NoStatus) {
  return s === "ok" ? "" : s;
}

function relogio() {
  return new Date().toLocaleTimeString("pt-BR", { hour12: false });
}

export default function SalaControle() {
  const [aba, setAba] = useState<AbaId>("mapa");
  const state = useCockpitLive();
  const [hora, setHora] = useState(relogio());

  useMemo(() => {
    const t = setInterval(() => setHora(relogio()), 1000);
    return () => clearInterval(t);
  }, []);

  const nosPorId = useMemo(
    () => Object.fromEntries(state.nos.map((n) => [n.id, n])),
    [state.nos],
  );

  const statusGeral: NoStatus = state.nos.some((n) => n.status === "down")
    ? "down"
    : state.nos.some((n) => n.status === "warn")
      ? "warn"
      : "ok";

  return (
    <div className="sc-root sc-mono">
      <div className="sc-grid">
        {/* HEADER */}
        <div className="sc-cell sc-head">
          <span className="sc-head-brand">CENTRAL<em>DARK</em> · SALA DE CONTROLE</span>
          <span className="sc-head-sep">│</span>
          <span><span className={"sc-dot " + statusClass(statusGeral)} />sistema {statusGeral === "ok" ? "estável" : statusGeral}</span>
          <span className="sc-head-sep">│</span>
          <span>{hora}</span>
          <div className="sc-head-right">
            <span><span className="sc-dot" />Pivete online</span>
            <Link className="sc-head-close" to="/centraldark/admin">← sair</Link>
          </div>
        </div>

        {/* NAV */}
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
          <div className="sc-nav-hermes">
            <div>◉ operador</div>
            <b>Hermes</b>
            <div style={{ marginTop: 4 }}>loop 24h · ok</div>
          </div>
        </div>

        {/* CENTRO: MAPA ou PAINEL */}
        <div className="sc-cell sc-map">
          {aba === "mapa" ? (
            <>
              <div className="sc-map-title">MAPA VIVO · <b>{state.nos.length} nós</b> · atualizado {new Date(state.atualizadoEm).toLocaleTimeString("pt-BR", { hour12: false })}</div>
              <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                {state.links.map((l, i) => {
                  const a = nosPorId[l.de];
                  const b = nosPorId[l.para];
                  if (!a || !b) return null;
                  return (
                    <line
                      key={i}
                      className="sc-link"
                      x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                      vectorEffect="non-scaling-stroke"
                    />
                  );
                })}
              </svg>
              {state.nos.map((n) => (
                <NoCard key={n.id} no={n} />
              ))}
            </>
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
    </div>
  );
}

function NoCard({ no }: { no: CockpitNo }) {
  return (
    <div
      className="sc-no"
      style={{ left: no.x + "%", top: no.y + "%" }}
      title={no.detalhe}
    >
      <span className={"sc-dot " + statusClass(no.status)} />
      <span className="sc-no-grp">{no.grupo}</span>
      <span className="sc-no-nome">{no.nome}</span>
      {no.detalhe && <span className="sc-no-det">{no.detalhe}</span>}
    </div>
  );
}
