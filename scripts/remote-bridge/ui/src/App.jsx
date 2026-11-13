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
  Clock3,
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

// Mesmo SVG e classes cd-done-* do AutoSyncButton do Cockpit.
// Um componente reutilizável para todas as confirmações desta interface.
function AnimatedDoneIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      focusable="false" aria-hidden="true">
      <circle className="cd-done-ring" cx="12" cy="12" r="10"
        stroke="currentColor" strokeWidth="2" />
      <path className="cd-done-check" d="m7.5 12.5 3 3 6-6"
        stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function formatSessionDuration(startedAt, now) {
  if (!Number.isSafeInteger(startedAt) || startedAt > now) return "—";
  const total = Math.max(0, Math.floor((now - startedAt) / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
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
            {state === "pass" ? "CONECTADO" : state === "fail" ? "SEM RESPOSTA" : "AGUARDANDO"}
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
  const [clockNow, setClockNow] = useState(Date.now());

  // Contagem local a cada segundo; nenhuma nova requisição ao backend.
  useEffect(() => {
    if (!auth.authenticated) return;
    setClockNow(Date.now());
    const timer = setInterval(() => setClockNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [auth.authenticated]);

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
    const bridge = window.centralDark;
    if (!bridge || typeof bridge.getAuthStatus !== "function") {
      setAuth({ authenticated: false, checking: false, bridgeUnavailable: true });
      return () => { live = false; };
    }
    bridge.getAuthStatus().then((data) => {
      if (live) setAuth({ ...data, checking: false });
    }).catch(() => { if (live) setAuth({ authenticated: false, checking: false }); });
    return () => { live = false; };
  }, []);

  useEffect(() => {
    if (!auth.authenticated) return;
    refresh().catch(() => setAuth({ authenticated: false, checking: false, offline: true }));
    const timer = setInterval(() => {
      refresh().catch(() => setAuth({ authenticated: false, checking: false, offline: true }));
    }, 10000);
    return () => clearInterval(timer);
  }, [refresh, auth.authenticated]);

  useEffect(() => {
    if (!auth.offline || auth.authenticated) return;
    const timer = setInterval(() => {
      window.centralDark?.getAuthStatus?.().then((data) => {
        if (data?.authenticated) setAuth({ ...data, checking: false });
      }).catch(() => {});
    }, 10000);
    return () => clearInterval(timer);
  }, [auth.offline, auth.authenticated]);

  // IPC notifica mudanças do pareamento imediatamente; a leitura periódica
  // existente continua sendo a contraprova de saúde e rede.
  useEffect(() => {
    if (!auth.authenticated || typeof window.centralDark?.onPairingStatus !== "function") return;
    return window.centralDark.onPairingStatus((next) => {
      setStatus((current) => ({ ...current, pairing: next }));
    });
  }, [auth.authenticated]);

  async function login(event) {
    event.preventDefault();
    setLoginBusy(true);
    setLoginError("");
    try {
      const result = await window.centralDark.login(email.trim(), password);
      setPassword("");
      setAuth({ ...result, checking: false });
    } catch (error) {
      setLoginError(error.message || "Não foi possível entrar. Verifique sua conexão e tente novamente.");
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
          ? `Código ${result.code} · clique em Confirmar pareamento nesta janela.`
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
    return <main className="login-shell"><section className="login-card"><h1>CentralDark Remote Bridge</h1><p>Verificando sua sessão…</p></section></main>;
  }

  if (!auth.authenticated) {
    return (
      <main className="login-shell">
        <form className="login-card" onSubmit={login}>
          <div className="login-emblem"><ShieldCheck size={28} strokeWidth={1.9} /></div>
          <span className="login-eyebrow">CENTRALDARK · ACESSO SEGURO</span>
          <h1>Entrar no Remote Bridge</h1>
          <p className="login-description">{auth.offline
            ? "Conexão temporariamente indisponível. Sua sessão será verificada novamente."
            : "Use sua conta para conectar este computador. Você decide quando autorizar o acesso."}</p>
          {auth.bridgeUnavailable ? <p className="login-error" role="status">Esta e a previa do Vite. Abra o CentralDark Remote Bridge em modo DEV para autenticar com seguranca.</p> : null}
          <label>E-mail<input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
          <label>Senha<input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} /></label>
          {loginError ? <p className="login-error" role="alert">{loginError}</p> : null}
          <button type="submit" className="primary-action login-submit" disabled={loginBusy || auth.bridgeUnavailable}>
            <ShieldCheck size={17} aria-hidden="true" />
            {loginBusy ? "Entrando…" : "Entrar com segurança"}
          </button>
          <p className="login-footnote">Pareamento somente com sua autorização.</p>
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
  const pairingVerified = status.pairing?.state === "PAIRED_VERIFIED";
  const observedAt = status.observedAt ? Date.parse(status.observedAt) : NaN;
  const monitoringActive = Number.isFinite(observedAt) &&
    clockNow - observedAt >= 0 && clockNow - observedAt < 25000;

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" focusable="false">
              <circle cx="16" cy="16" r="12" />
              <path d="M5.5 16c5.5-7 15.5-7 21 0-5.5 7-15.5 7-21 0Z" />
              <circle cx="16" cy="16" r="3.7" />
              <path d="M16 1v4m0 22v4M1 16h4m22 0h4" />
            </svg>
          </div>
          <div>
            <span>CENTRALDARK</span>
            <strong>Remote Bridge</strong>
          </div>
        </div>
        <div className="topbar-actions">
          <button className="icon-button" onClick={logout} title={auth.user?.email || ""}>Sair da conta</button>
          <button className="icon-button" onClick={refresh} disabled={loading} aria-label="Atualizar status">
            <RefreshCw size={16} className={loading ? "spin" : ""} />
            {loading ? "Atualizando" : "Atualizar"}
          </button>
        </div>
      </header>

      <section className="hero">
        <div>
          <StatusPill state={bridgeState}>
            {health.reachable ? "CASA CONECTADA" : "CASA SEM RESPOSTA"}
          </StatusPill>
          <h1>Uma ponte. Um estado real.</h1>
          <p>
            Controle a conexão deste computador, confirme autorizações
            e acompanhe a rede em um só lugar.
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
          className={`primary-action ${pairingVerified ? "pairing-verified" : ""}`}
          onClick={() =>
            runAction("pair", () => window.centralDark.pairCasa())
          }
          disabled={pairingVerified}
          aria-label={pairingVerified ? "Pareamento verificado com sucesso" : "Vincular dispositivo"}
        >
          {pairingVerified ? <AnimatedDoneIcon size={20} /> : <KeyRound size={20} />}
          <span>
            <strong>{pairingVerified ? "Pareamento verificado com sucesso" : "Vincular dispositivo"}</strong>
            <small>{pairingVerified ? "Este dispositivo está vinculado à sua conta." : "Conecte este computador à sua conta"}</small>
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
            <small>Ativar serviço neste computador</small>
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
        <div className={`action-receipt ${pairingVerified ? "pairing-success" : ""}`} role="status">
          {pairingVerified ? <AnimatedDoneIcon size={18} /> : <KeyRound size={18} />}
          <span>
            {pairingVerified ? "Pareamento verificado com sucesso" : ["WAITING_OWNER_CONSENT", "PAIRING_PENDING"].includes(status.pairing.state) ? "Aguardando sua confirmação" : "Verificando pareamento"}
            {!pairingVerified && status.pairing.code ? ` · código ${status.pairing.code}` : ""}
            {!pairingVerified && status.pairing.error ? ` · ${status.pairing.error}` : ""}
          </span>
        </div>
      )}

      {status.pairing?.code && ["WAITING_OWNER_CONSENT", "PAIRING_PENDING"].includes(status.pairing.state) && (
        <section className="pairing-options" aria-label="Confirmar pareamento do Bridge">
          <div>
            <strong>Seu código: <code>{status.pairing.code}</code></strong>
            <p>Confira o código e confirme para vincular este computador à sua conta.</p>
          </div>
          <div className="pairing-option-buttons"><button onClick={() => runAction("confirmar-codigo", () => window.centralDark.confirmPair())}><ShieldCheck size={17} /> Confirmar vínculo</button></div>
        </section>
      )}

      {action && !(pairingVerified && ["pair", "confirmar-codigo"].includes(action.name)) && (
        <div className={`action-receipt ${action.state}`}>
          {action.state === "pass" ? (
            <AnimatedDoneIcon size={18} />
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
          title="Este computador"
          state={bridgeState}
          headline={health.reachable ? "Serviço local disponível" : "Serviço sem resposta"}
          detail={health.reachable
            ? (health.remoteVendor ? "Serviço de suporte disponível." : "Acesso à tela ainda não ativado.")
            : "Não foi possível verificar a conexão local."
          }
        />
        <StatusCard
          icon={Router}
          title="Conexão central"
          state={engineState}
          headline={health.engineConnected ? "Conectada" : "Aguardando conexão"}
          detail={health.receipt
            ? "Última operação registrada."
            : "Nenhuma operação confirmada."
          }
        />
        <StatusCard
          icon={Cloud}
          title="Rede privada"
          state={tailscaleState}
          headline={tailscale.available
            ? (tailscale.state === "Running" ? "Conectada" : "Aguardando conexão")
            : "Rede indisponível"
          }
          detail={tailscale.self
            ? `Computador ${tailscale.self}`
            : "Aguardando verificação da rede."
          }
        />
      </section>

      <footer className="status-footer">
        <span className="status-footer-last">
          <Activity size={15} aria-hidden="true" />
          Última verificação:
          <strong>{status.observedAt
            ? new Date(status.observedAt).toLocaleTimeString("pt-BR")
            : "—"}</strong>
        </span>
        <span className="status-footer-session">
          <Clock3 size={15} aria-hidden="true" />
          Tempo da sessão:
          <strong role="timer" aria-live="off">{formatSessionDuration(auth.sessionStartedAt, clockNow)}</strong>
        </span>
        <span className="status-footer-refresh">
          <span className={`live-dot ${loading ? "busy" : monitoringActive ? "online cd-port-dot--pass" : "idle"}`} aria-hidden="true" />
          {loading ? "Verificando conexões…" : monitoringActive ? "Monitoramento ativo" : "Aguardando verificação"}
          <span className="status-footer-separator" aria-hidden="true">·</span>
          A cada 10 segundos
        </span>
      </footer>
    </main>
  );
}
