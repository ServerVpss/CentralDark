// Jarvis flutuante — orbe pulsante no canto inferior direito.
// Casca visual + input. Sem executar nada ainda; o plug no dispatcher MCP entra na Fase 3.
import { useState } from "react";

export function JarvisOrb() {
  const [aberto, setAberto] = useState(false);
  const [texto, setTexto] = useState("");

  return (
    <div className="jarvis-root">
      {aberto && (
        <div className="jarvis-painel">
          <div className="jarvis-head">
            <span>JARVIS · comando rápido</span>
            <button onClick={() => setAberto(false)}>×</button>
          </div>
          <div className="jarvis-body">
            <div className="jarvis-hint">
              plug do dispatcher MCP entra na Fase 3 · digitar aqui hoje só ecoa
            </div>
            <input
              autoFocus
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="ex.: status gateway"
            />
            {texto && <div className="jarvis-echo">echo: {texto}</div>}
          </div>
        </div>
      )}
      <button
        aria-label="Abrir Jarvis"
        className={"jarvis-orb" + (aberto ? " ativo" : "")}
        onClick={() => setAberto((v) => !v)}
      >
        <span className="jarvis-orb-core" />
        <span className="jarvis-orb-ring" />
      </button>
    </div>
  );
}
