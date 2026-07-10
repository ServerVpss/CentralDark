import { useEffect, useState } from "react";
import type { PaneConfig } from "./dados";

interface Props {
  pane: PaneConfig;
  seed: number;
}

const MAX_LOGS = 6;

export function CockpitPane({ pane, seed }: Props) {
  const [logs, setLogs] = useState<Array<{ id: number; texto: string }>>(() => {
    return pane.logs.slice(0, MAX_LOGS).map((texto, i) => ({ id: i, texto }));
  });
  const [statusIdx, setStatusIdx] = useState(0);

  useEffect(() => {
    let idCounter = MAX_LOGS;
    let cursor = 0;
    const jitter = 500 + seed * 120;
    const timer = window.setInterval(() => {
      cursor = (cursor + 1) % pane.logs.length;
      const nova = pane.logs[cursor];
      setLogs((prev) => {
        const next = [{ id: idCounter++, texto: nova }, ...prev];
        return next.slice(0, MAX_LOGS);
      });
    }, jitter + Math.random() * 400);

    const statusTimer = window.setInterval(() => {
      setStatusIdx((i) => (i + 1) % pane.status.length);
    }, 2400 + seed * 300);

    return () => {
      clearInterval(timer);
      clearInterval(statusTimer);
    };
  }, [pane, seed]);

  const status = pane.status[statusIdx];

  return (
    <div className="pane" style={{ ["--neon" as string]: pane.neon }}>
      <div className="pane-head">
        <div className="pane-titulo">{pane.titulo}</div>
        <div className="pane-status" data-tom={status.tom} key={statusIdx}>
          {status.texto}
        </div>
      </div>
      <div className="pane-logs">
        <ul>
          {logs.map((l) => (
            <li key={l.id}>{l.texto}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
