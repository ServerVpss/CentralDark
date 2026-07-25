// Card Pivete — renderiza a prestação de contas completa de um item de avanço.
// Formato fechado: se um campo veio vazio, mostra "N/A". Não inventa.

export interface CardPiveteData {
  antes_sha256?: string;
  depois_sha256?: string;
  arquivos_modificados?: string[];
  outros_arquivos_tocados?: string;
  restart_executed?: string;
  instalado_no_hermes?: string;
  onde?: string;
  por_que?: string;
  pra_que?: string;
  como_usar?: string;
  quando_usar?: string;
  por_que_usar_isso?: string;
  prova?: string;
  tutorial?: string[];
}

function v(x?: string) {
  const t = (x ?? "").trim();
  return t.length ? t : "N/A";
}

export function CardPivete({ card }: { card: CardPiveteData }) {
  const arquivos = card.arquivos_modificados?.length ? card.arquivos_modificados : ["N/A"];
  const tutorial = card.tutorial?.length ? card.tutorial : ["N/A"];

  return (
    <div className="sc-cardpivete">
      <div className="sc-cp-block">
        <div className="sc-cp-row"><span>ANTES_SHA256</span><b>{v(card.antes_sha256)}</b></div>
        <div className="sc-cp-row"><span>DEPOIS_SHA256</span><b>{v(card.depois_sha256)}</b></div>
        <div className="sc-cp-row"><span>RESTART_EXECUTED</span><b>{v(card.restart_executed)}</b></div>
        <div className="sc-cp-row"><span>INSTALADO_NO_HERMES</span><b>{v(card.instalado_no_hermes)}</b></div>
        <div className="sc-cp-row"><span>OUTROS_ARQUIVOS</span><b>{v(card.outros_arquivos_tocados)}</b></div>
      </div>

      <div className="sc-cp-block">
        <div className="sc-cp-label">ARQUIVOS MODIFICADOS</div>
        <ul className="sc-cp-list">
          {arquivos.map((a, i) => <li key={i}>{a}</li>)}
        </ul>
      </div>

      <div className="sc-cp-block">
        <div className="sc-cp-label">ONDE / POR QUÊ / PRA QUÊ</div>
        <div className="sc-cp-p"><b>Onde:</b> {v(card.onde)}</div>
        <div className="sc-cp-p"><b>Por quê:</b> {v(card.por_que)}</div>
        <div className="sc-cp-p"><b>Pra quê:</b> {v(card.pra_que)}</div>
      </div>

      <div className="sc-cp-block">
        <div className="sc-cp-label">COMO / QUANDO USAR</div>
        <div className="sc-cp-p"><b>Como:</b> {v(card.como_usar)}</div>
        <div className="sc-cp-p"><b>Quando:</b> {v(card.quando_usar)}</div>
        <div className="sc-cp-p"><b>Por quê usar isso:</b> {v(card.por_que_usar_isso)}</div>
      </div>

      <div className="sc-cp-block">
        <div className="sc-cp-label">PROVA</div>
        <div className="sc-cp-p">{v(card.prova)}</div>
      </div>

      <div className="sc-cp-block">
        <div className="sc-cp-label">TUTORIAL</div>
        <ol className="sc-cp-list">
          {tutorial.map((t, i) => <li key={i}>{t}</li>)}
        </ol>
      </div>
    </div>
  );
}
