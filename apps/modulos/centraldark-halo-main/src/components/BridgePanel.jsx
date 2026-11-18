// Interface Bridge existente portada ao unico app Tauri. Login unico em RemoteAgentLogin.
// @owner: source_remote_bridge/ui/src/App.jsx
// @responsabilidade: UI/Tray e pareamento na instancia existente
// @pode: executar apenas funcoes ja autorizadas, respeitar contrato, isolamento e estado atual.
// @nao_pode: duplicar executor, quebrar consumidores, expor credenciais, mudar rede ou permissao por conta propria.
// @criterio: validar sintaxe/testes/readback; UNKNOWN nao e PASS; migracao nao ativa automaticamente outro runtime.

// #OBSERVACOES#
// @owner scripts/remote-bridge/ui/src/App.jsx
// @doc_ref scripts/remote-bridge/CORPO-UNICO-CAPACIDADES.md
// @last_updated 2026-11-09T02:43:17Z
// @implementado HUD com codigo de pareamento MCP e estados pending/verified sem falso PASS
// @estado SOURCE_EDITED_BUILD_PENDING
// @next_cursor testar novo pacote, autorizar somente com clique humano

import { useCallback, useEffect, useState } from "react";
import "./BridgePanel.css";
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

/**
 * @rastro Sinalizacao visual para o estado recebido, sem inferir conectividade.
 * POR_QUE: um indicador verde nao substitui prova de motor/pareamento.
 * CONTRATO: somente apresenta state e children; nao chama backend.
 */
function StatusPill({ state, children }) {
  return <span className={`status-pill ${state}`}>{children}</span>;
}

// Mesmo SVG e classes cd-done-* do AutoSyncButton do Cockpit.
// Um componente reutilizável para todas as confirmações desta interface.
/**
 * @rastro Icone visual reutilizado do estilo do Cockpit.
 * POR_QUE: manter identidade sem inventar outra animacao.
 * CONTRATO: SVG decorativo; nao concede aprovacao nem altera o pareamento.
 */
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

/**
 * @rastro Tempo de sessao somente para exibicao.
 * POR_QUE: nao confundir o contador local com validade do token do servidor.
 * CONTRATO: timestamps invalidos/futuros retornam "-"; sem chamada remota.
 */
function formatSessionDuration(startedAt, now) {
  if (!Number.isSafeInteger(startedAt) || startedAt > now) return "—";
  const total = Math.max(0, Math.floor((now - startedAt) / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

/**
 * @rastro Cartao de estado de uma das conexoes medidas.
 * POR_QUE: Casa, rede privada e central nao devem virar um unico PASS.
 * CONTRATO: recebe estado do owner de leitura; nao concede acesso remoto.
 */
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

/**
 * @rastro Cockpit do cliente, reaproveitado apos login no Agente Remoto.
 * POR_QUE: mostrar estado real e acoes consentidas sem um segundo executor.
 * CONTRATO: centralDark injeta as rotas existentes; botao bloqueado nunca
 * simula inicio do motor remoto. PAIRED_VERIFIED nao comprova engine_connected.
 * PROVA: status independente, logout e pareamento autorizado na janela nativa.
 */
export default function BridgePanel({ centralDark }) {
  const [status, setStatus] = useState(initialState);
  const [auth, setAuth] = useState({ authenticated: false, checking: true });
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState(null);
  const [clockNow, setClockNow] = useState(0);

  // Contagem local a cada segundo; nenhuma nova requisição ao backend.
  useEffect(() => {
    if (!auth.authenticated) return;
    const timer = window.setInterval(() => setClockNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [auth.authenticated]);

  // @rastro Atualizar dados do owner de status, sem deduzir PASS por HTTP isolado.
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setStatus(await centralDark.getStatus());
    } finally {
      setLoading(false);
    }
  }, [centralDark]);

  useEffect(() => {
    let live = true;
    const bridge = centralDark;

    bridge.getAuthStatus().then((data) => {
      if (live) setAuth({ ...data, checking: false });
    }).catch(() => { if (live) setAuth({ authenticated: false, checking: false }); });
    return () => { live = false; };
  }, [centralDark]);

  useEffect(() => {
    if (!auth.authenticated) return;
    const kickoff = window.setTimeout(() => { void refresh().catch(() => {}); }, 0);
    const timer = window.setInterval(() => { void refresh().catch(() => {}); }, 10000);
    return () => { window.clearTimeout(kickoff); window.clearInterval(timer); };
  }, [refresh, auth.authenticated]);

  // IPC notifica mudanças do pareamento imediatamente; a leitura periódica
  // existente continua sendo a contraprova de saúde e rede.
  useEffect(() => {
    if (!auth.authenticated || typeof centralDark?.onPairingStatus !== "function") return;
    return centralDark.onPairingStatus((next) => {
      setStatus((current) => ({ ...current, pairing: next }));
    });
  }, [auth.authenticated, centralDark]);

  /**
   * @rastro Encerrar a sessao de UI e descartar o estado exibido.
   * POR_QUE: nao manter indicadores de autenticacao/pareamento apos sair.
   * CONTRATO: delega limpeza ao owner centralDark.logout antes de limpar React.
   */
  async function logout() {
    await centralDark.logout();
    setStatus(initialState);
    setAuth({ authenticated: false, checking: false });
  }

  /**
   * @rastro Executor de acoes explicitamente clicadas pelo usuario.
   * POR_QUE: separar estado de requisicao, aprovacao verificada e erro real.
   * CONTRATO: nao inicia outro executor; apenas PAIRED_VERIFIED vira PASS.
   * EFEITO: chama operation() uma vez, informa erro e refaz leitura depois.
   */
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
      window.setTimeout(refresh, 1500);
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
  const mcp = status.mcp || { reachable: false };
  const bridgeState = !centralDark.isNative ? "pending" : health.reachable ? "pass" : "fail";
  const engineState = health.engineConnected ? "pass" : "pending";
  const tailscaleState =
    tailscale.available && tailscale.state === "Running" ? "pass" : "pending";
  const pairingVerified = status.pairing?.state === "PAIRED_VERIFIED";
  const observedAt = status.observedAt ? Date.parse(status.observedAt) : NaN;
  const monitoringActive = Number.isFinite(observedAt) &&
    clockNow - observedAt >= 0 && clockNow - observedAt < 25000;

  return (
    <main className="app-shell">
      {!centralDark.isNative && <div className="action-receipt pending" role="status">
        Visualização no navegador: para vincular o dispositivo e iniciar o atendimento, use o aplicativo instalado.
      </div>}
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
            <strong>Agente Remoto</strong>
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
            {!centralDark.isNative ? "PRÉVIA DEV" : health.reachable ? "CASA CONECTADA" : "CASA SEM RESPOSTA"}
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
            runAction("pair", () => centralDark.pairCasa())
          }
          disabled={pairingVerified || !centralDark.canPair}
          title={!centralDark.canPair ? "Entre na sua conta e ative Permanecer conectado para vincular este dispositivo." : "Autorizar este dispositivo"}
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
          disabled={!centralDark.canStartBridge}
          title={!centralDark.canStartBridge ? "Atendimento remoto ainda não disponível." : "Iniciar atendimento"}
          onClick={() =>
            runAction("start", () => centralDark.startBridge())
          }
        >
          <Play size={20} />
          <span>
            <strong>Iniciar atendimento</strong>
            <small>{centralDark.canStartBridge ? "Atender com autorização" : "Aguardando ativação do atendimento"}</small>
          </span>
        </button>
        <button
          className="secondary-action"
          onClick={() => centralDark.openCockpit()}
        >
          <ExternalLink size={20} />
          <span>
            <strong>Abrir painel</strong>
            <small>Painel de controle</small>
          </span>
        </button>
      </section>

      {status.pairing?.state && status.pairing.state !== "UNPAIRED" && !pairingVerified && (
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
        <section className="pairing-options" aria-label="Confirmar vínculo do dispositivo">
          <div>
            <strong>Seu código: <code>{status.pairing.code}</code></strong>
            <p>Confira o código e confirme para vincular este computador à sua conta.</p>
          </div>
          <div className="pairing-option-buttons"><button disabled={!centralDark.canPair} onClick={() => runAction("confirmar-codigo", () => centralDark.confirmPair())}><ShieldCheck size={17} /> Confirmar vínculo</button></div>
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
          headline={!centralDark.isNative ? "Sem leitura nativa no navegador" : health.reachable ? "Serviço local disponível" : "Serviço sem resposta"}
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
            ? "Última operação autorizada registrada."
            : mcp.reachable
              ? `Conexão central disponível. Atendimento remoto ainda não ativado.`
              : "Aguardando confirmação da conexão central."
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
