// Painel AVANÇO — leitor da fonte única docs/CONSCIENCIA/COCKPIT-AVANCO.json.
// Busca + filtros de status/área/severidade + grafo de dependências + editor inline.
import { useMemo, useRef, useState } from "react";
import { CardPivete, type CardPiveteData, type DependenciaResumo } from "./CardPivete";
import { EditorItem, type ItemEditavel } from "./EditorItem";
// Import direto do JSON canônico. Editar o JSON = build reflete.
import fonte from "../../../../docs/CONSCIENCIA/COCKPIT-AVANCO.json";

type Status = "feito" | "andando" | "pendente" | "bloqueado";
type Area = "cockpit" | "hub" | "hermes" | "seguranca" | "infra" | "ia";
type Severidade = "p0" | "p1" | "p2" | "p3";

interface Item {
  id: string;
  titulo: string;
  status: Status;
  porcentagem: number;
  atualizado_em?: string;
  motivo_bloqueio?: string;
  area?: Area;
  severidade?: Severidade;
  palavras_chave?: string[];
  depende_de?: string[];
  card: CardPiveteData;
}

const ROTULO: Record<Status, { dot: string; txt: string }> = {
  feito:     { dot: "ok",   txt: "feito"     },
  andando:   { dot: "warn", txt: "andando"   },
  pendente:  { dot: "err",  txt: "pendente"  },
  bloqueado: { dot: "err",  txt: "bloqueado" },
};

type FiltroStatus = "todas" | Status;
type FiltroArea = "todas" | Area;
type FiltroSev = "todas" | Severidade;

const AREAS: Area[] = ["cockpit", "hub", "hermes", "seguranca", "infra", "ia"];
const SEVS: Severidade[] = ["p0", "p1", "p2", "p3"];

function diasDesde(iso?: string): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  return Math.floor((Date.now() - t) / 86400000);
}

export function PainelAvanco() {
  const itens = fonte.itens as Item[];

  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>("todas");
  const [filtroArea, setFiltroArea] = useState<FiltroArea>("todas");
  const [filtroSev, setFiltroSev] = useState<FiltroSev>("todas");
  const [aberto, setAberto] = useState<string | null>(null);
  const [editando, setEditando] = useState<Item | null>(null);
  const refs = useRef<Record<string, HTMLDivElement | null>>({});

  // Mapa reverso: quem depende de mim = quem eu bloqueio.
  const mapaBloqueia = useMemo(() => {
    const m: Record<string, string[]> = {};
    for (const it of itens) {
      for (const dep of it.depende_de ?? []) {
        if (!m[dep]) m[dep] = [];
        m[dep].push(it.id);
      }
    }
    return m;
  }, [itens]);

  const porId = useMemo(() => {
    const m: Record<string, Item> = {};
    for (const it of itens) m[it.id] = it;
    return m;
  }, [itens]);

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

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return itens.filter((i) => {
      if (filtroStatus !== "todas" && i.status !== filtroStatus) return false;
      if (filtroArea !== "todas" && i.area !== filtroArea) return false;
      if (filtroSev !== "todas" && i.severidade !== filtroSev) return false;
      if (!q) return true;
      const alvo = [
        i.titulo,
        i.id,
        i.motivo_bloqueio ?? "",
        i.card?.onde ?? "",
        i.card?.por_que ?? "",
        i.card?.pra_que ?? "",
        ...(i.palavras_chave ?? []),
      ].join(" ").toLowerCase();
      return alvo.includes(q);
    });
  }, [itens, busca, filtroStatus, filtroArea, filtroSev]);

  function irPara(id: string) {
    setAberto(id);
    setTimeout(() => {
      refs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  }

  function limparFiltros() {
    setBusca("");
    setFiltroStatus("todas");
    setFiltroArea("todas");
    setFiltroSev("todas");
  }

  const chipsSimples = (label: string, atual: string, opcoes: readonly string[], setter: (v: never) => void) => (
    <div className="sc-av-chipgrupo">
      <span className="sc-av-chiplabel">{label}</span>
      <button
        className={"sc-av-chip " + (atual === "todas" ? "on" : "")}
        onClick={() => (setter as (v: string) => void)("todas")}
      >
        todas
      </button>
      {opcoes.map((o) => (
        <button
          key={o}
          className={"sc-av-chip " + (atual === o ? "on" : "")}
          onClick={() => (setter as (v: string) => void)(o)}
        >
          {o}
        </button>
      ))}
    </div>
  );

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

      <div className="sc-av-busca">
        <input
          type="search"
          placeholder="buscar por título, id, palavra-chave..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        {(busca || filtroStatus !== "todas" || filtroArea !== "todas" || filtroSev !== "todas") && (
          <button className="sc-av-limpa" onClick={limparFiltros}>limpar</button>
        )}
      </div>

      {chipsSimples("status", filtroStatus, ["feito", "andando", "pendente", "bloqueado"], setFiltroStatus as never)}
      {chipsSimples("área", filtroArea, AREAS, setFiltroArea as never)}
      {chipsSimples("severidade", filtroSev, SEVS, setFiltroSev as never)}

      <div className="sc-av-lista">
        {filtrados.length === 0 && (
          <div className="sc-empty">Nenhum item bate com os filtros atuais.</div>
        )}
        {filtrados.map((it) => {
          const rot = ROTULO[it.status];
          const dias = diasDesde(it.atualizado_em);
          const parado = dias !== null && dias > 7 && it.status !== "feito";
          const expandido = aberto === it.id;

          const bloqueiaIds = mapaBloqueia[it.id] ?? [];
          const bloqueando: DependenciaResumo[] = bloqueiaIds
            .map((id) => porId[id])
            .filter(Boolean)
            .map((x) => ({ id: x.id, titulo: x.titulo, status: x.status }));

          const dependencias: DependenciaResumo[] = (it.depende_de ?? [])
            .map((id) => porId[id])
            .filter(Boolean)
            .map((x) => ({ id: x.id, titulo: x.titulo, status: x.status }));

          const travadoPor = dependencias.filter((d) => d.status !== "feito");

          return (
            <div
              key={it.id}
              ref={(el) => { refs.current[it.id] = el; }}
              className={"sc-av-item " + (expandido ? "on" : "")}
            >
              <div className="sc-av-item-head">
                <button
                  className="sc-av-item-toggle"
                  onClick={() => setAberto(expandido ? null : it.id)}
                >
                  <span className={"sc-dot " + rot.dot} />
                  <span className="sc-av-item-titulo">{it.titulo}</span>
                  {it.severidade && <span className={"sc-av-sev sev-" + it.severidade}>{it.severidade}</span>}
                  {it.area && <span className="sc-av-area">{it.area}</span>}
                  <span className="sc-av-item-pct">{it.porcentagem}%</span>
                  <span className={"sc-av-item-status " + rot.dot}>{rot.txt}</span>
                  {parado && <span className="sc-av-item-parado" title="mais de 7 dias sem mudança">⚠ parado</span>}
                  {bloqueiaIds.length > 0 && (
                    <span className="sc-av-bloqueando" title="este item trava outros">
                      🔒 bloqueando {bloqueiaIds.length}
                    </span>
                  )}
                  {travadoPor.length > 0 && (
                    <span className="sc-av-travado" title="depende de item não-feito">
                      ⛔ travado por {travadoPor.length}
                    </span>
                  )}
                </button>
                <button
                  className="sc-av-editar"
                  onClick={() => setEditando(it)}
                  title="Editar sem abrir o JSON"
                >
                  editar
                </button>
              </div>

              {(it.status === "bloqueado" || it.status === "pendente") && it.motivo_bloqueio && (
                <div className="sc-av-motivo">
                  <b>Por que não foi:</b> {it.motivo_bloqueio}
                </div>
              )}

              {expandido && (
                <div className="sc-av-corpo">
                  <CardPivete
                    card={it.card}
                    dependencias={dependencias}
                    bloqueando={bloqueando}
                    onIrPara={irPara}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="sc-av-rodape">
        Lupa canônica ativa · zoom-out · zoom-in · Feynman · AutoLupa.
        Editar = drawer + copiar patch. Prova SHA256:
        <code> node scripts/cockpit-avanco/registrar-entrega.mjs --id &lt;item&gt; --files a b</code>
      </div>

      {editando && (
        <EditorItem
          item={editando as ItemEditavel}
          todosItens={itens.map((i) => ({ id: i.id, titulo: i.titulo }))}
          onFechar={() => setEditando(null)}
        />
      )}
    </div>
  );
}
