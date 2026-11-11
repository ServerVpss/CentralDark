// #OBSERVACOES#
// @owner scripts/remote-bridge/ui/src/App.jsx
// @doc_ref scripts/remote-bridge/CORPO-UNICO-CAPACIDADES.md
// @last_updated 2026-11-09T02:43:17Z
// @implementado HUD com codigo de pareamento MCP e estados pending/verified sem falso PASS
// @estado SOURCE_EDITED_BUILD_PENDING
// @next_cursor testar novo pacote, autorizar somente com clique humano

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
  pairing: { state: "UNPAIRED", code: null, deviceId: null },
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
  const [auth, setAuth] = useState({ authenticated: false, checking: true });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);
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
    let live = true;
    window.centralDark.getAuthStatus().then((data) => {
      if (live) setAuth({ ...data, checking: false });
    }).catch(() => { if (live) setAuth({ authenticated: false, checking: false }); });
    return () => { live = false; };
  }, []);

  useEffect(() => {
    if (!auth.authenticated) return;
    refresh().catch(() => setAuth({ authenticated: false, checking: false }));
    const timer = setInterval(() => {
      refresh().catch(() => setAuth({ authenticated: false, checking: false }));
    }, 10000);
    return () => clearInterval(timer);
  }, [refresh, auth.authenticated]);

  async function login(event) {
    event.preventDefault();
    setLoginBusy(true);
    setLoginError("");
    try {
      const result = await window.centralDark.login(email.trim(), password);
      setPassword("");
      setAuth({ ...result, checking: false });
    } catch (error) {
      setLoginError(error.message || "Não foi possível autenticar pelo Supabase.");
    } finally { setLoginBusy(false); }
  }

  async function logout() {
    await window.centralDark.logout();
    setStatus(initialState);
    setAuth({ authenticated: false, checking: false });
  }

  async function runAction(name, operation) {
    setAction({ name, state: "running", text: "Executando…" });
    try {
      const result = await operation();
      setAction({
        name,
        state: result.state === "PAIRED_VERIFIED" ? "pass" : "running",
        text: result.code
          ? `Código ${result.code} · confira no Cockpit e confirme o pareamento.`
          : (result.state || "Ação iniciada"),
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

  if (auth.checking) {
    return <main className="login-shell"><section className="login-card"><h1>CentralDark Remote Bridge</h1><p>Verificando sua sessão Supabase…</p></section></main>;
  }

  if (!auth.authenticated) {
    return (
      <main className="login-shell">
        <form className="login-card" onSubmit={login}>
          <ShieldCheck size={38} />
          <h1>CentralDark Remote Bridge</h1>
          <p>Entre com a sua conta Supabase para liberar os controles. A ponte não será iniciada automaticamente.</p>
          <label>E-mail<input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
          <label>Senha<input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} /></label>
          {loginError ? <p className="login-error" role="alert">{loginError}</p> : null}
          <button type="submit" className="primary-action" disabled={loginBusy}>{loginBusy ? "Autenticando…" : "Entrar"}</button>
        </form>
      </main>
    );
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
        <button className="icon-button" onClick={logout} title={auth.user?.email || ""}>Sair da conta</button>
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

      {status.pairing?.state && status.pairing.state !== "UNPAIRED" && (
        <div className="action-receipt">
          <KeyRound size={18} />
          <span>
            Pareamento: {status.pairing.state}
            {status.pairing.code ? ` · código ${status.pairing.code}` : ""}
            {status.pairing.error ? ` · ${status.pairing.error}` : ""}
          </span>
        </div>
      )}

      {status.pairing?.code && ["WAITING_OWNER_CONSENT", "PAIRING_PENDING"].includes(status.pairing.state) && (
        <section className="pairing-options" aria-label="Confirmar pareamento do Bridge">
          <div>
            <strong>Seu código: <code>{status.pairing.code}</code></strong>
            <p>Confirme este código aqui mesmo. O MCP valida sua conta Supabase, o código e o nonce antes de autorizar.</p>
          </div>
          <div className="pairing-option-buttons"><button onClick={() => runAction("confirmar-codigo", () => window.centralDark.confirmPair())}><ShieldCheck size={17} /> Confirmar pareamento</button></div>
        </section>
      )}

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
