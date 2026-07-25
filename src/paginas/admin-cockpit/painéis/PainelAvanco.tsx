// Painel AVANÇO — leitor da fonte única docs/CONSCIENCIA/COCKPIT-AVANCO.json.
// Barra de progresso geral + filtro por status + Card Pivete expandível.
import { useMemo, useState } from "react";
import { CardPivete, type CardPiveteData } from "./CardPivete";
// Import direto do JSON canônico. Editar o JSON = build reflete.
import fonte from "../../../../docs/CONSCIENCIA/COCKPIT-AVANCO.json";

type Status = "feito" | "andando" | "pendente" | "bloqueado";

interface Item {
  id: string;
  titulo: string;
  status: Status;
  porcentagem: number;
  atualizado_em?: string;
  motivo_bloqueio?: string;
  card: CardPiveteData;
}

const ROTULO: Record<Status, { dot: string; txt: string }> = {
  feito:     { dot: "ok",   txt: "feito"     },
  andando:   { dot: "warn", txt: "andando"   },
  pendente:  { dot: "err",  txt: "pendente"  },
  bloqueado: { dot: "err",  txt: "bloqueado" },
};

type Filtro = "todas" | Status;

function diasDesde(iso?: string): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  return Math.floor((Date.now() - t) / 86400000);
}

export function PainelAvanco() {
  const itens = fonte.itens as Item[];
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [aberto, setAberto] = useState<string | null>(null);

  const contagem = useMemo(() => {
    const c: Record<Status, number> = { feito: 0, andando: 0, pendente: 0, bloqueado: 0 };
    itens.forEach((i) => { c[i.status] = (c[i.status] || 0) + 1; });
    return c;
  }, [itens]);

  const progressoGeral = useMemo(() => {
    if (!itens.length) return 0;
    const soma = itens.reduce((acc, i) => acc + (i.porcentagem || 0), 0);
    return Math.round(soma / itens.length);
  }, [itens]);

  const filtrados = filtro === "todas" ? itens : itens.filter((i) => i.status === filtro);

  return (
    <div className="sc-panel sc-avanco">
      <div className="sc-av-head">
        <div className="sc-av-titulo">AVANÇO DO COCKPIT</div>
        <div className="sc-av-sub">fonte: docs/CONSCIENCIA/COCKPIT-AVANCO.json</div>
      </div>

      <div className="sc-av-progresso">
        <div className="sc-av-barra">
          <div className="sc-av-barra-fill" style={{ width: progressoGeral + "%" }} />
        </div>
        <div className="sc-av-num">{progressoGeral}%</div>
      </div>

      <div className="sc-av-stats">
        <span><b>{contagem.feito}</b> feitas</span>
        <span className="warn"><b>{contagem.andando}</b> andando</span>
        <span className="err"><b>{contagem.pendente}</b> pendentes</span>
        <span className="err"><b>{contagem.bloqueado}</b> bloqueadas</span>
      </div>

      <div className="sc-av-filtros">
        {(["todas", "feito", "andando", "pendente", "bloqueado"] as Filtro[]).map((f) => (
          <button
            key={f}
            className={filtro === f ? "on" : ""}
            onClick={() => setFiltro(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="sc-av-lista">
        {filtrados.length === 0 && (
          <div className="sc-empty">Nenhum item no filtro <b>{filtro}</b>.</div>
        )}
        {filtrados.map((it) => {
          const rot = ROTULO[it.status];
          const dias = diasDesde(it.atualizado_em);
          const parado = dias !== null && dias > 7 && it.status !== "feito";
          const expandido = aberto === it.id;

          return (
            <div key={it.id} className={"sc-av-item " + (expandido ? "on" : "")}>
              <button
                className="sc-av-item-head"
                onClick={() => setAberto(expandido ? null : it.id)}
              >
                <span className={"sc-dot " + rot.dot} />
                <span className="sc-av-item-titulo">{it.titulo}</span>
                <span className="sc-av-item-pct">{it.porcentagem}%</span>
                <span className={"sc-av-item-status " + rot.dot}>{rot.txt}</span>
                {parado && <span className="sc-av-item-parado" title="mais de 7 dias sem mudança">⚠ parado</span>}
              </button>

              {(it.status === "bloqueado" || it.status === "pendente") && it.motivo_bloqueio && (
                <div className="sc-av-motivo">
                  <b>Por que não foi:</b> {it.motivo_bloqueio}
                </div>
              )}

              {expandido && (
                <div className="sc-av-corpo">
                  <CardPivete card={it.card} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="sc-av-rodape">
        Lupa canônica ativa · zoom-out · zoom-in · Feynman · AutoLupa.
        Editar item = abrir <code>docs/CONSCIENCIA/COCKPIT-AVANCO.json</code>.
      </div>
    </div>
  );
}
