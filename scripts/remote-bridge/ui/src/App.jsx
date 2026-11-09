// #OBSERVACOES#
// @owner scripts/remote-bridge/ui/src/App.jsx
// @doc_ref scripts/remote-bridge/CORPO-UNICO-CAPACIDADES.md
// @last_updated 2026-11-09T00:20:00Z
// @implementado HUD CentralDark com status real da 9101, MCP e Tailscale
// @estado PACKAGED_RUNTIME_PASS
// @next_cursor validar visual e executar pareamento OAuth autorizado

import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  Cable,
  CheckCircle2,
  Cloud,
  ExternalLink,
  KeyRound,
  Play,
  RefreshCw,
  Router,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";

const initialState = {
  observedAt: null,
  health: { reachable: false },
  tailscale: { available: false, state: "UNKNOWN" },
};

function StatusPill({ state, children }) {
  return <span className={`status-pill ${state}`}>{children}</span>;
}

function StatusCard({ icon: Icon, title, state, headline, detail }) {
  return (
    <article className="status-card">
      <div className="card-icon">
        <Icon size={20} strokeWidth={1.8} />
      </div>
      <div className="card-copy">
        <div className="card-title-row">
          <h3>{title}</h3>
          <StatusPill state={state}>
            {state === "pass" ? "PROVADO" : state === "fail" ? "QUEBRADO" : "PENDENTE"}
          </StatusPill>
        </div>
        <strong>{headline}</strong>
        <p>{detail}</p>
      </div>
    </article>
  );
}

export default function App() {
  const [status, setStatus] = useState(initialState);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setStatus(await window.centralDark.getStatus());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 10000);
    return () => clearInterval(timer);
  }, [refresh]);

  async function runAction(name, operation) {
    setAction({ name, state: "running", text: "Executando…" });
    try {
      const result = await operation();
      setAction({
        name,
        state: "pass",
        text: result.state || "Ação iniciada",
      });
      setTimeout(refresh, 1500);
    } catch (error) {
      setAction({
        name,
        state: "fail",
        text: error.message || "Falha observada",
      });
    }
  }

  const health = status.health || initialState.health;
  const tailscale = status.tailscale || initialState.tailscale;
  const bridgeState = health.reachable ? "pass" : "fail";
  const engineState = health.engineConnected ? "pass" : "pending";
  const tailscaleState =
    tailscale.available && tailscale.state === "Running" ? "pass" : "pending";

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">🪬</div>
          <div>
            <span>CENTRALDARK</span>
            <strong>Remote Bridge</strong>
          </div>
        </div>
        <button className="icon-button" onClick={refresh} disabled={loading}>
          <RefreshCw size={18} className={loading ? "spin" : ""} />
          Atualizar
        </button>
      </header>

      <section className="hero">
        <div>
          <StatusPill state={bridgeState}>
            {health.reachable ? "CASA CONECTADA" : "CASA SEM RESPOSTA"}
          </StatusPill>
          <h1>Uma ponte. Um estado real.</h1>
          <p>
            Controle o Bridge, o pareamento MCP e a malha privada pela mesma
            bandeja, sem expor tokens.
          </p>
        </div>
        <div className="hero-orbit">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <ShieldCheck size={54} />
        </div>
      </section>

      <section className="actions">
        <button
          className="primary-action"
          onClick={() =>
            runAction("pair", () => window.centralDark.pairCasa())
          }
        >
          <KeyRound size={20} />
          <span>
            <strong>Parear Casa</strong>
            <small>OAuth CentralDark existente</small>
          </span>
        </button>
        <button
          className="secondary-action"
          onClick={() =>
            runAction("start", () => window.centralDark.startBridge())
          }
        >
          <Play size={20} />
          <span>
            <strong>Iniciar Bridge</strong>
            <small>Owner PowerShell atual</small>
          </span>
        </button>
        <button
          className="secondary-action"
          onClick={() => window.centralDark.openCockpit()}
        >
          <ExternalLink size={20} />
          <span>
            <strong>Abrir Cockpit</strong>
            <small>Sala de Controle</small>
          </span>
        </button>
      </section>

      {action && (
        <div className={`action-receipt ${action.state}`}>
          {action.state === "pass" ? (
            <CheckCircle2 size={18} />
          ) : action.state === "fail" ? (
            <TriangleAlert size={18} />
          ) : (
            <Activity size={18} className="pulse" />
          )}
          <span>{action.text}</span>
        </div>
      )}

      <section className="status-grid">
        <StatusCard
          icon={Cable}
          title="Casa Commander"
          state={bridgeState}
          headline={
            health.reachable
              ? health.name || "CentralDark Casa Commander"
              : "Porta 9101 indisponível"
          }
          detail={
            health.reachable
              ? `HTTP ${health.statusCode} · fornecedor remoto ${health.remoteVendor ? "detectado" : "desativado"}`
              : "A leitura local não respondeu dentro de 3 segundos."
          }
        />
        <StatusCard
          icon={Router}
          title="Motor MCP"
          state={engineState}
          headline={health.engineConnected ? "Motor conectado" : "Aguardando conexão"}
          detail={
            health.receipt
              ? "Receipt de ferramenta disponível."
              : "Nenhum receipt recente foi promovido."
          }
        />
        <StatusCard
          icon={Cloud}
          title="Tailscale"
          state={tailscaleState}
          headline={
            tailscale.available ? tailscale.state : "Cliente não localizado"
          }
          detail={
            tailscale.self
              ? `Dispositivo ${tailscale.self}`
              : "Malha privada ainda sem readback."
          }
        />
      </section>

      <footer>
        <span>
          Última leitura{" "}
          {status.observedAt
            ? new Date(status.observedAt).toLocaleTimeString("pt-BR")
            : "—"}
        </span>
        <span>Atualização automática a cada 10 segundos</span>
      </footer>
    </main>
  );
}
