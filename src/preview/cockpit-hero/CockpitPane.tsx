import { useEffect, useState } from "react";
import type { PaneConfig } from "./dados";

interface Props {
  pane: PaneConfig;
  seed: number;
  onLog?: (evento: { id: number; texto: string; pane: string }) => void;
}


const MAX_LOGS = 9;

/** Colore uma linha de log estilo terminal (verde/vermelho/âmbar/ciano/rosa). */
function tokenizarLinha(linha: string, key: string) {
  // classifica prefixo
  let prefixClass = "tk-dim";
  let prefix = "";
  let rest = linha;

  if (linha.startsWith("$ ")) {
    prefix = "$"; rest = linha.slice(2); prefixClass = "tk-cmd";
  } else if (linha.startsWith("✓ ")) {
    prefix = "✓"; rest = linha.slice(2); prefixClass = "tk-ok";
  } else if (linha.startsWith("✗ ")) {
    prefix = "✗"; rest = linha.slice(2); prefixClass = "tk-err";
  } else if (linha.startsWith("⚠ ")) {
    prefix = "⚠"; rest = linha.slice(2); prefixClass = "tk-warn";
  } else if (linha.startsWith("→ ")) {
    prefix = "→"; rest = linha.slice(2); prefixClass = "tk-arrow";
  } else if (linha.startsWith("• ")) {
    prefix = "•"; rest = linha.slice(2); prefixClass = "tk-dim";
  }

  // quebra o resto em tokens (strings, [tag], números/status, resto)
  const partes: Array<{ t: string; c: string }> = [];
  const regex = /(\[[^\]]+\])|("[^"]*")|(\b\d+(?:\.\d+)?(?:ms|s|%)?\b)|(R\$\s?\d[\d.,]*)|(\b(?:200|201|204|401|403|404|500|502|503)\b)|(cdk_live_\*+|cdk_live_[a-zA-Z0-9_]+)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(rest)) !== null) {
    if (m.index > last) partes.push({ t: rest.slice(last, m.index), c: "tk-text" });
    const [tok] = m;
    let cls = "tk-text";
    if (m[1]) cls = "tk-tag";
    else if (m[2]) cls = "tk-str";
    else if (m[3]) cls = "tk-num";
    else if (m[4]) cls = "tk-num";
    else if (m[5]) cls = tok.startsWith("2") ? "tk-ok" : tok.startsWith("4") ? "tk-warn" : "tk-err";
    else if (m[6]) cls = "tk-key";
    partes.push({ t: tok, c: cls });
    last = m.index + tok.length;
  }
  if (last < rest.length) partes.push({ t: rest.slice(last), c: "tk-text" });

  return (
    <>
      {prefix && <span className={`tk ${prefixClass}`}>{prefix}&nbsp;</span>}
      {partes.map((p, i) => (
        <span key={`${key}-${i}`} className={`tk ${p.c}`}>{p.t}</span>
      ))}
    </>
  );
}

export function CockpitPane({ pane, seed, onLog }: Props) {
  const [logs, setLogs] = useState<Array<{ id: number; texto: string }>>(() =>
    pane.logs.slice(0, MAX_LOGS).map((texto, i) => ({ id: i, texto }))
  );
  const [statusIdx, setStatusIdx] = useState(0);

  useEffect(() => {
    let idCounter = MAX_LOGS;
    let cursor = 0;
    const jitter = 700 + seed * 140;
    const timer = window.setInterval(() => {
      cursor = (cursor + 1) % pane.logs.length;
      const nova = pane.logs[cursor];
      const id = idCounter++;
      setLogs((prev) => [{ id, texto: nova }, ...prev].slice(0, MAX_LOGS));
      onLog?.({ id, texto: nova, pane: pane.key });
    }, jitter + Math.random() * 500);

    const statusTimer = window.setInterval(() => {
      setStatusIdx((i) => (i + 1) % pane.status.length);
    }, 2400 + seed * 300);

    return () => { clearInterval(timer); clearInterval(statusTimer); };
  }, [pane, seed, onLog]);


  const status = pane.status[statusIdx];

  return (
    <div className="pane" style={{ ["--neon" as string]: pane.neon }}>
      <div className="pane-head">
        <div className="pane-titulo">
          <span className="pane-arrow">▸</span> {pane.titulo}
        </div>
        <div className="pane-head-right">
          {pane.cost && <span className="pane-cost">{pane.cost}</span>}
          <div className="pane-status" data-tom={status.tom} key={statusIdx}>
            {status.texto}
          </div>
        </div>
      </div>
      <div className="pane-logs">
        <ul>
          {logs.map((l) => (
            <li key={l.id}>{tokenizarLinha(l.texto, String(l.id))}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
