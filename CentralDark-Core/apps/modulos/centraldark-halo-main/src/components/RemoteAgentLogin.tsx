import { lazy, Suspense, useEffect, useState, type FormEvent } from "react";

const BridgePanel = lazy(() => import("./BridgePanel"));
import { invoke, isTauri } from "@tauri-apps/api/core";
import "./RemoteAgentLogin.css";
import { recordDiagnostic, observeDiagnostic } from "../agentDiagnostics";

type AuthConfig = { url: string; publishableKey: string };
type Mode = "login" | "signup";
type LoginStatus = "idle" | "pending" | "success";
const AUTH_CONFIG_PATH = "/centraldark-auth-public.json";

/**
 * @rastro Carregar somente a configuracao PUBLICA do Supabase.
 * POR_QUE: bloquear endpoint inesperado e jamais usar chave service-role no React.
 * CONTRATO: aceita apenas HTTPS supabase.co e chave publicavel; nao pareia aparelho.
 */
async function publicConfig(): Promise<AuthConfig> {
  const response = await fetch(AUTH_CONFIG_PATH, { cache: "no-store" });
  if (!response.ok) throw new Error("Configuração pública do Supabase indisponível.");
  const config: AuthConfig = await response.json();
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(config.url) ||
      !/^(sb_publishable_|eyJ)/.test(config.publishableKey)) {
    throw new Error("Configuração pública do Supabase inválida.");
  }
  return config;
}

/**
 * @rastro Transformar erros de autenticacao em mensagens seguras para clientes.
 * POR_QUE: nao exibir payload bruto, cabecalhos ou dados de sessao.
 */
function friendlyError(error: unknown): string {
  if (error instanceof Error && error.message.startsWith("Configuração")) return error.message;
  if (error instanceof Error && error.message === "Failed to fetch")
    return "Não foi possível acessar o Supabase. Confira a conexão.";
  const code = error instanceof Error ? error.message : "";
  switch (code) {
    case "email_exists": case "user_already_exists": return "Este e-mail já possui cadastro.";
    case "signup_disabled": return "O cadastro está desabilitado neste projeto.";
    case "over_email_send_rate_limit": case "over_request_rate_limit": return "Muitas tentativas. Aguarde alguns minutos.";
    case "weak_password": return "Escolha uma senha mais forte.";
    case "SIGNUP_NAME_INVALID": return "O nome de usuário deve ter entre 3 e 60 caracteres.";
    case "SIGNUP_PASSWORD_TOO_SHORT": return "A senha precisa ter pelo menos 8 caracteres.";
    case "invalid_credentials": return "E-mail ou senha incorretos.";
    case "email_not_confirmed": return "Confirme seu e-mail antes de entrar.";
    case "SUPABASE_AUTH_TIMEOUT": return "O Supabase demorou a responder. Verifique a conexão e tente novamente.";
    case "SUPABASE_AUTH_NETWORK_UNAVAILABLE": return "Não foi possível estabelecer a conexão HTTPS com o Supabase.";
    case "SUPABASE_AUTH_NATIVE_UNAVAILABLE": case "SUPABASE_AUTH_CLIENT_UNAVAILABLE":
      return "Falha no acesso HTTPS nativo do aplicativo.";
    case "SUPABASE_AUTH_CONFIG_INVALID": case "SUPABASE_AUTH_ORIGIN_INVALID":
    case "SUPABASE_AUTH_PUBLIC_KEY_MISSING":
      return "Configuração pública do Supabase inválida.";
    default: return "Operação não concluída. Confira os dados e tente novamente.";
  }
}

/**
 * @rastro Requisicao de identidade ao Supabase com limite de tempo.
 * POR_QUE: centralizar host, chave publica e erros sem duplicar fluxo de login.
 * CONTRATO: HTTPS e timeout; sucesso de conta nao autoriza controle remoto.
 */
async function authRequest(path: string, payload: Record<string, unknown>) {
  // !RASTRO: no .exe, usar o cliente HTTPS nativo ja presente no Rust.
  // Evita a dependencia do fetch/WebView2 para carregar config e autenticar.
  // O Rust le a mesma config PUBLICA do frontend e restringe as rotas.
  if (isTauri()) {
    try {
      return await invoke<Record<string, unknown>>("agent_supabase_auth_request", { route: path, payload });
    } catch (error) {
      throw new Error(typeof error === "string" ? error : "SUPABASE_AUTH_NATIVE_UNAVAILABLE", { cause: error });
    }
  }
  const { url, publishableKey } = await publicConfig();
  const response = await fetch(url + "/auth/v1/" + path, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: publishableKey },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15000),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof result.code === "string" ? result.code : "unknown");
  return result;
}

/**
 * @rastro Fluxo unico de entrada do Agente Remoto para conta Supabase.
 * POR_QUE: reusar a sessao autenticada, com DPAPI opt-in no app Windows.
 * CONTRATO: renovar e validar sessao antes de mostrar painel; falha de rede
 * nao apaga o cofre nem concede autenticacao; pairing exige aprovacao a parte.
 * PROVA: login, reinicio, refresh, logout e consentimento no Tauri nativo.
 */
export function RemoteAgentLogin() {
  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [vaultReady, setVaultReady] = useState(false);
  const [status, setStatus] = useState<LoginStatus>("idle");
  const [message, setMessage] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const [sessionStartedAt] = useState(() => Date.now());

  useEffect(() => {
    if (!isTauri()) return;
    let active = true;
    (async () => {
      try {
        void recordDiagnostic("restore", "start");
        const session = await observeDiagnostic("vault-ipc", invoke<Record<string, unknown> | null>("load_agent_session"));
        if (!active) return;
        setVaultReady(true);
        if (!session) {
          void recordDiagnostic("restore", "pending", "SESSION_NOT_FOUND");
          return;
        }
        if (typeof session.refresh_token !== "string") throw new Error("INVALID_REFRESH_SESSION");
        const renewed = await authRequest("token?grant_type=refresh_token", {
          refresh_token: session.refresh_token,
        });
        if (!active) return;
        if (!renewed.user?.id || !renewed.access_token || !renewed.refresh_token) {
          throw new Error("INVALID_REFRESH_SESSION");
        }
        await invoke("save_agent_session", { session: renewed });
        if (!active) return;
        setRemember(true);
        setSignedIn(true);
        setStatus("success");
        setMessage("Sessão recuperada e renovada pelo Supabase com proteção do Windows.");
        void recordDiagnostic("restore", "ok");
      } catch (error) {
        if (!active) return;
        void recordDiagnostic("restore", "error", error);
        // Falha de rede na renovação não autoriza apagar o cofre protegido.
        // Manter a sessão cifrada; nunca declarar autenticação sem refresh válido.
        setRemember(true);
        setSignedIn(false);
        setMessage("Sessão protegida preservada. Não foi possível validá-la agora.");
      }
    })();
    return () => { active = false; };
  }, []);
  const createAccount = mode === "signup";
  const busy = status === "pending";

  /**
   * @rastro Enviar login/cadastro a partir de acao humana no formulario.
   * CONTRATO: nao gravar senha; persistir sessao somente por escolha explicita.
   * EFEITO: chama Supabase e, se autorizado, salva no cofre nativo.
   */
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setMessage("");
    setStatus("pending");
    void recordDiagnostic(mode, "start");
    try {
      if (createAccount) {
        const name = username.trim();
        if (name.length < 3 || name.length > 60)
          throw new Error("SIGNUP_NAME_INVALID");
        if (password.length < 8)
          throw new Error("SIGNUP_PASSWORD_TOO_SHORT");
        await authRequest("signup", {
          email: email.trim().toLowerCase(),
          password,
          data: { username: name, full_name: name },
        });
        setPassword("");
        setMode("login");
        setStatus("success");
        setMessage("Cadastro enviado ao Supabase. Verifique seu e-mail para confirmar a conta, se solicitado.");
      } else {
        const result = await authRequest("token?grant_type=password", {
          email: email.trim().toLowerCase(), password,
        });
        if (!result.user?.id || !result.access_token)
          throw new Error("MISSING_SESSION");
        if (remember) {
          if (!isTauri() || !vaultReady) throw new Error("VAULT_NOT_READY");
          if (!result.refresh_token) throw new Error("INVALID_REFRESH_SESSION");
          await invoke("save_agent_session", { session: result });
        } else if (isTauri()) {
          await invoke("clear_agent_session");
        }
        setPassword("");
        setSignedIn(true);
        setStatus("success");
        setMessage("Conta autenticada. Pareamento e cofre de sessão nativos ainda não integrados.");
      }
      void recordDiagnostic(mode, "ok");
    } catch (error) {
      void recordDiagnostic(mode, "error", error);
      setStatus("idle");
      setMessage(friendlyError(error));
    }
  }

  /** @rastro Alternar login/cadastro sem reaproveitar dados secretos do modo anterior. */
  function changeMode() {
    setMode(createAccount ? "login" : "signup");
    setPassword("");
    setMessage("");
    setStatus("idle");
  }

  // /Bridge.html e / recebem o mesmo index.html no Vite.
  useEffect(() => {
    if (signedIn && window.location.pathname.toLowerCase() === "/bridge.html") {
      window.history.replaceState(window.history.state, "", "/");
    }
  }, [signedIn]);

  if (signedIn) {
    const native = isTauri();
    const centralDark = {
      isNative: native,
      canPair: native && remember,
      canStartBridge: false,
      getAuthStatus: async () => ({
        authenticated: true, checking: false, sessionStartedAt, user: { email },
      }),
      getStatus: async () => {
        const health = native
          ? await observeDiagnostic("bridge-ipc", invoke<Record<string, unknown>>("local_bridge_health")).catch(() => ({
              reachable: false, engineConnected: false, remoteVendor: false,
            }))
          : { reachable: false, engineConnected: false, remoteVendor: false };
        const pairing = native && remember
          ? await observeDiagnostic("pairing-ipc", invoke<Record<string, unknown>>("remote_pairing_status"))
              .catch(() => ({ state: "LOCAL_TOKEN_UNVERIFIED" }))
          : { state: native ? "VAULT_NOT_ENABLED" : "DEV_WEB_PREVIEW" };
        const networking = native
          ? await observeDiagnostic("network-ipc", invoke<{ tailscale: Record<string, unknown>; mcp: Record<string, unknown> }>("remote_network_status"))
              .catch(() => ({
                tailscale: { available: false, state: "UNKNOWN" },
                mcp: { reachable: false },
              }))
          : { tailscale: { available: false, state: "UNKNOWN" }, mcp: { reachable: false } };
        return {
          observedAt: new Date().toISOString(),
          health, pairing,
          tailscale: networking.tailscale,
          mcp: networking.mcp,
        };
      },
      pairCasa: () => native && remember
        ? invoke("start_remote_pairing")
        : Promise.reject(new Error("PAREAMENTO_REQUER_TAURI_E_COFRE_NATIVO")),
      confirmPair: (traceId: string) => native && remember
        ? invoke("approve_remote_pairing", { traceId })
        : Promise.reject(new Error("AUTORIZACAO_REQUER_TAURI_E_COFRE_NATIVO")),
      recordDiagnostic,
      startBridge: () => Promise.reject(new Error("MOTOR_REMOTO_AINDA_NAO_VINCULADO")),
      openCockpit: async () => {
        if (native) {
          // URL fixa; Explorer abre no navegador padrao, sem segundo WebView.
          await invoke("open_cockpit_in_browser");
        } else {
          window.open("https://admin.centralldark.com", "_blank", "noopener,noreferrer");
        }
      },
      onPairingStatus: (callback: (value: unknown) => void) => {
        if (!native || !remember) return () => {};
        const interval = window.setInterval(() => {
          void observeDiagnostic("pairing-ipc", invoke("remote_pairing_status")).then(callback).catch(() => {});
        }, 5000);
        return () => window.clearInterval(interval);
      },
      logout: async () => {
        if (native) await invoke("clear_agent_session");
        setSignedIn(false); setRemember(false); setEmail(""); setPassword("");
        setStatus("idle"); setMessage("");
      },
    };
    return (
      <Suspense fallback={<main className="cd-agent-login">Abrindo o Agente Remoto...</main>}>
        <BridgePanel centralDark={centralDark} />
      </Suspense>
    );
  }
  return (
    <main className="cd-agent-login">
      <section className="cd-agent-card">
        <div className="cd-agent-emblem" aria-hidden="true">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="m12 2 8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z" />
            <path d="m8.5 12 2.5 2.5 4.5-5" />
          </svg>
        </div>
        <span className="cd-agent-eyebrow">CENTRALDARK · ACESSO SEGURO</span>
        {(
          <>
            <h1>{createAccount ? "Criar conta" : "Entrar no Agente Remoto"}</h1>
            <p>{createAccount
              ? "Crie sua conta CentralDark com nome de usuário, e-mail e senha."
              : "Use sua conta para conectar este computador. Você decide quando autorizar o acesso."}</p>
            <form className="cd-agent-form" onSubmit={submit}>
              {createAccount && <label>Nome de usuário
                <input type="text" autoComplete="username" minLength={3} maxLength={60}
                  value={username} onChange={(event) => setUsername(event.target.value)}
                  required placeholder="Seu nome de usuário" disabled={busy} />
              </label>}
              <label>E-mail
                <input type="email" autoComplete="email" required disabled={busy}
                  value={email} onChange={(event) => setEmail(event.target.value)}
                  placeholder="seuemail@exemplo.com" />
              </label>
              <label>Senha
                <input type="password" autoComplete={createAccount ? "new-password" : "current-password"}
                  required minLength={createAccount ? 8 : undefined} disabled={busy}
                  value={password} onChange={(event) => setPassword(event.target.value)}
                  placeholder="Digite sua senha" />
              </label>
              {!createAccount && <label className="cd-agent-remember">
                <input type="checkbox" checked={remember} disabled={!vaultReady || busy}
                  onChange={(event) => setRemember(event.target.checked)} />
                <span>Permanecer conectado <small>{vaultReady ? "Sessão protegida neste dispositivo" : "Disponível no aplicativo instalado"}</small></span>
              </label>}
              <button className="cd-agent-submit" type="submit" disabled={busy}>
                {busy ? "Aguarde..." : createAccount ? "Criar minha conta" : "Entrar com segurança"}
              </button>
            </form>
            <button className="cd-agent-change-mode" type="button" onClick={changeMode} disabled={busy}>
              {createAccount ? "Já tenho uma conta · Entrar" : "Criar conta"}
            </button>
            <p className="cd-agent-note">Pareamento somente com sua autorização.</p>
          </>
        )}
        {message && <p className={status === "success" ? "cd-agent-success" : "cd-agent-warning"} role="status">{message}</p>}
      </section>
    </main>
  );
}
