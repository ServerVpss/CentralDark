// Aba JARVIS — casa oficial do Jarvis no cockpit.
// Substitui a antiga aba "MAPA": mantém o mapa vivo (nós + links) e ganha
// a barra de estado do Jarvis, legenda de saúde e resumo por grupo.
import { useMemo } from "react";
import type { CockpitNo, NoStatus } from "./hooks/useCockpitLive";

type Props = {
  nos: CockpitNo[];
  links: { de: string; para: string }[];
  atualizadoEm: string | number;
};

// comprime as coordenadas pra dentro da moldura (evita corte nas bordas)
const px = (x: number) => 12 + x * 0.76;
const py = (y: number) => 6 + y * 0.88;

function cls(s: NoStatus) {

  return s === "ok" ? "" : s;
}

export function PainelJarvis({ nos, links, atualizadoEm }: Props) {
  const nosPorId = useMemo(
    () => Object.fromEntries(nos.map((n) => [n.id, n])),
    [nos],
  );

  const total = nos.length;
  const ok = nos.filter((n) => n.status === "ok").length;
  const warn = nos.filter((n) => n.status === "warn").length;
  const down = nos.filter((n) => n.status === "down").length;
  const saude = total ? Math.round((ok / total) * 100) : 0;
  const estado: NoStatus = down ? "down" : warn ? "warn" : "ok";
  const rotulo = down ? "degradado" : warn ? "atenção" : "operacional";

  return (
    <div className="jv-wrap">
      {/* barra de estado do Jarvis */}
      <div className="jv-bar">
        <span className="jv-badge">
          <span className={"jv-pulse " + cls(estado)} />
          JARVIS
        </span>
        <span className={"jv-estado " + cls(estado)}>{rotulo}</span>

        <span className="jv-sep" />

        <span className="jv-metric"><b>{total}</b> nós</span>
        <span className="jv-metric ok"><b>{ok}</b> ok</span>
        {warn > 0 && <span className="jv-metric warn"><b>{warn}</b> atenção</span>}
        {down > 0 && <span className="jv-metric down"><b>{down}</b> fora</span>}

        <span className="jv-saude" title={`${saude}% dos nós saudáveis`}>
          <span className="jv-saude-trilho">
            <span className={"jv-saude-nivel " + cls(estado)} style={{ width: saude + "%" }} />
          </span>
          <b>{saude}%</b>
        </span>

        <span className="jv-spacer" />
        <span className="jv-tempo">
          atualizado {new Date(atualizadoEm).toLocaleTimeString("pt-BR", { hour12: false })}
        </span>
      </div>

      {/* mapa vivo */}
      <div className="jv-mapa">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          {links.map((l, i) => {
            const a = nosPorId[l.de];
            const b = nosPorId[l.para];
            if (!a || !b) return null;
            const critico = a.status !== "ok" || b.status !== "ok";
            return (
              <line
                key={i}
                className={"sc-link" + (critico ? " alerta" : "")}
                x1={px(a.x)} y1={py(a.y)} x2={px(b.x)} y2={py(b.y)}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </svg>

        {nos.map((n) => (
          <div
            key={n.id}
            className={"jv-no " + cls(n.status)}
            // comprime as coordenadas pra dentro (12%–88%) e evita corte nas bordas
            style={{ left: px(n.x) + "%", top: py(n.y) + "%" }}

            title={n.detalhe || n.nome}
          >
            <span className="jv-no-topo">
              <span className={"sc-dot " + cls(n.status)} />
              <span className="jv-no-grp">{n.grupo}</span>
            </span>
            <span className="jv-no-nome">{n.nome}</span>
            {n.detalhe && <span className="jv-no-det">{n.detalhe}</span>}
          </div>
        ))}

        <div className="jv-legenda">
          <span><i className="sc-dot" /> saudável</span>
          <span><i className="sc-dot warn" /> atenção</span>
          <span><i className="sc-dot down" /> fora do ar</span>
        </div>
      </div>
    </div>
  );
}
