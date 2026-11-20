// Editor inline do item de AVANÇO. Não grava direto — monta o patch JSON
// pra você copiar e colar no arquivo (fonte única no Git).
import { useState } from "react";

type Status = "feito" | "andando" | "pendente" | "bloqueado";
type Area = "cockpit" | "hub" | "hermes" | "seguranca" | "infra" | "ia";
type Severidade = "p0" | "p1" | "p2" | "p3";

export interface ItemEditavel {
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
  card: Record<string, unknown> & { prova?: string };
}

interface Props {
  item: ItemEditavel;
  todosItens: { id: string; titulo: string }[];
  onFechar: () => void;
}

const STATUS: Status[] = ["feito", "andando", "pendente", "bloqueado"];
const AREAS: Area[] = ["cockpit", "hub", "hermes", "seguranca", "infra", "ia"];
const SEVS: Severidade[] = ["p0", "p1", "p2", "p3"];

function hoje() {
  return new Date().toISOString().slice(0, 10);
}

export function EditorItem({ item, todosItens, onFechar }: Props) {
  const [status, setStatus] = useState<Status>(item.status);
  const [pct, setPct] = useState<number>(item.porcentagem);
  const [motivo, setMotivo] = useState<string>(item.motivo_bloqueio ?? "");
  const [prova, setProva] = useState<string>((item.card?.prova as string) ?? "");
  const [area, setArea] = useState<Area>(item.area ?? "cockpit");
  const [sev, setSev] = useState<Severidade>(item.severidade ?? "p2");
  const [kw, setKw] = useState<string>((item.palavras_chave ?? []).join(", "));
  const [deps, setDeps] = useState<string[]>(item.depende_de ?? []);
  const [copiado, setCopiado] = useState(false);

  const patch = {
    ...item,
    status,
    porcentagem: Math.max(0, Math.min(100, Number(pct) || 0)),
    atualizado_em: hoje(),
    area,
    severidade: sev,
    palavras_chave: kw.split(",").map((s) => s.trim()).filter(Boolean),
    depende_de: deps,
    motivo_bloqueio: motivo.trim() ? motivo.trim() : undefined,
    card: { ...item.card, prova: prova.trim() ? prova.trim() : item.card?.prova },
  };
  if (!patch.motivo_bloqueio) delete (patch as { motivo_bloqueio?: string }).motivo_bloqueio;

  const patchJson = JSON.stringify(patch, null, 2);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(patchJson);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setCopiado(false);
    }
  }

  function toggleDep(id: string) {
    setDeps((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  }

  return (
    <div className="sc-editor-overlay" onClick={onFechar}>
      <div className="sc-editor" onClick={(e) => e.stopPropagation()}>
        <div className="sc-editor-head">
          <div>
            <div className="sc-editor-titulo">Editar item</div>
            <div className="sc-editor-sub">{item.id}</div>
          </div>
          <button className="sc-editor-x" onClick={onFechar}>×</button>
        </div>

        <div className="sc-editor-body">
          <label className="sc-ed-lbl">Título</label>
          <div className="sc-ed-ro">{item.titulo}</div>

          <div className="sc-ed-grid">
            <div>
              <label className="sc-ed-lbl">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as Status)}>
                {STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="sc-ed-lbl">Porcentagem</label>
              <input
                type="number"
                min={0}
                max={100}
                value={pct}
                onChange={(e) => setPct(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="sc-ed-grid">
            <div>
              <label className="sc-ed-lbl">Área</label>
              <select value={area} onChange={(e) => setArea(e.target.value as Area)}>
                {AREAS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="sc-ed-lbl">Severidade</label>
              <select value={sev} onChange={(e) => setSev(e.target.value as Severidade)}>
                {SEVS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <label className="sc-ed-lbl">Palavras-chave (vírgula)</label>
          <input value={kw} onChange={(e) => setKw(e.target.value)} placeholder="pix, webhook, hmac" />

          <label className="sc-ed-lbl">Motivo do bloqueio (opcional)</label>
          <textarea rows={2} value={motivo} onChange={(e) => setMotivo(e.target.value)} />

          <label className="sc-ed-lbl">Prova / evidência (commit, print, log)</label>
          <textarea rows={2} value={prova} onChange={(e) => setProva(e.target.value)} />

          <label className="sc-ed-lbl">Depende de</label>
          <div className="sc-ed-deps">
            {todosItens
              .filter((t) => t.id !== item.id)
              .map((t) => (
                <label key={t.id} className="sc-ed-dep">
                  <input
                    type="checkbox"
                    checked={deps.includes(t.id)}
                    onChange={() => toggleDep(t.id)}
                  />
                  <span>{t.titulo}</span>
                </label>
              ))}
          </div>

          <label className="sc-ed-lbl">Patch pronto (cola em docs/CONSCIENCIA/COCKPIT-AVANCO.json)</label>
          <textarea className="sc-ed-patch" rows={10} value={patchJson} readOnly />
        </div>

        <div className="sc-editor-foot">
          <button className="sc-ed-btn" onClick={copiar}>
            {copiado ? "✓ Copiado" : "Copiar patch"}
          </button>
          <button className="sc-ed-btn sc-ed-btn-sec" onClick={onFechar}>Fechar</button>
        </div>
      </div>
    </div>
  );
}
