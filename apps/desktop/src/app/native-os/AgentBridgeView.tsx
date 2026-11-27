// CentralDark Agent: existing Remote Bridge dashboard, adapted to the Hermes React shell.
// Only the existing Bridge IPC can authorize pairing/start actions. No fake PASS, no new Electron.
import { useCallback, useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity, Cable, Clock3, Cloud, ExternalLink, KeyRound, MonitorPlay,
  Play, RefreshCw, Router, ShieldCheck, TriangleAlert
} from "lucide-react";
import "./AgentBridgeView.css";

type Pairing = { state?: string; code?: string; error?: string };
type BridgeStatus = {
  observedAt?: string | null;
  health?: { reachable?: boolean; engineConnected?: boolean; receipt?: unknown; remoteVendor?: boolean };
  pairing?: Pairing;
  tailscale?: { available?: boolean; state?: string; self?: string };
};
type BridgeAuth = { authenticated: boolean; sessionStartedAt?: number; user?: {email?: string} };
type OperationResult = { state?: string; code?: string };
type BridgeApi = {
  getAuthStatus?: () => Promise<BridgeAuth>;
  getStatus?: () => Promise<BridgeStatus>;
  pairCasa?: () => Promise<OperationResult>;
  confirmPair?: () => Promise<OperationResult>;
  startBridge?: () => Promise<OperationResult>;
  openCockpit?: () => Promise<OperationResult>;
  logout?: () => Promise<void>;
};
const EMPTY: BridgeStatus = {
  observedAt: null, health: { reachable: false },
  pairing: { state: "UNPAIRED" }, tailscale: { available: false, state: "UNKNOWN" }
};
type Level = "pass" | "pending" | "fail";
function StatusPill({ level, children }: {level: Level; children: React.ReactNode}) {
  return <span className={"bridge-pill " + level}>{children}</span>;
}
function StatusCard({ icon: Icon, title, level, headline, detail }: {
  icon: LucideIcon; title: string; level: Level; headline: string; detail: string;
}) {
  return <article className="bridge-card">
    <span className="bridge-card-icon"><Icon size={20}/></span>
    <div className="bridge-card-copy">
      <div className="bridge-card-heading"><h3>{title}</h3>
        <StatusPill level={level}>{level === "pass" ? "CONECTADO" : level === "fail" ? "SEM RESPOSTA" : "AGUARDANDO"}</StatusPill>
      </div>
      <strong>{headline}</strong><p>{detail}</p>
    </div>
  </article>;
}
function duration(startedAt?:number, now = Date.now()) {
  if (startedAt === undefined || !Number.isSafeInteger(startedAt) || startedAt > now) return "—";
  const seconds=Math.max(0,Math.floor((now-startedAt)/1000));
  return [Math.floor(seconds/3600), Math.floor((seconds%3600)/60), seconds%60]
    .map(value=>String(value).padStart(2,"0")).join(":");
}
export function AgentBridgeView({ onOpenOs }: {onOpenOs: () => void}) {
  const api=(window as unknown as {centralDark?:BridgeApi}).centralDark;
  const [status,setStatus]=useState<BridgeStatus>(EMPTY);
  const [auth,setAuth]=useState<BridgeAuth>({authenticated:false});
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState<{level:Level;text:string}|null>(null);
  const [now,setNow]=useState(Date.now());
  const refresh=useCallback(async () => {
    if(!api?.getStatus||!auth.authenticated)return;
    setBusy(true);
    try {setStatus(await api.getStatus());}
    catch(error){setMessage({level:"fail",text:error instanceof Error?error.message:"Falha na consulta à Casa"});}
    finally{setBusy(false);}
  },[api,auth.authenticated]);
  useEffect(()=>{
    if(!api?.getAuthStatus)return;
    let alive=true;
    api.getAuthStatus().then(info=>{if(alive)setAuth(info);}).catch(()=>{if(alive)setAuth({authenticated:false});});
    return ()=>{alive=false;};
  },[api]);
  useEffect(()=>{
    if(!api?.getStatus||!auth.authenticated)return;
    void refresh();
    const timer=window.setInterval(()=>void refresh(),10000);
    return ()=>window.clearInterval(timer);
  },[api,auth.authenticated,refresh]);
  useEffect(()=>{
    const timer=window.setInterval(()=>setNow(Date.now()),1000);
    return ()=>window.clearInterval(timer);
  },[]);
  async function perform(name:string,operation?:()=>Promise<OperationResult>) {
    if(!auth.authenticated||!operation){
      setMessage({level:"fail",text:"Conecte a sessão autenticada do Bridge antes de executar esta ação."});
      return;
    }
    setMessage({level:"pending",text:"Operação solicitada; aguardando verificação."});
    try {
      const result=(await operation()) || {};
      setMessage({level:result.state==="PAIRED_VERIFIED"?"pass":"pending",
        text:result.code?"Código "+result.code+" — confirme no dispositivo.":result.state||"Operação solicitada; falta comprovação."});
      void refresh();
    }catch(error){setMessage({level:"fail",text:error instanceof Error?error.message:"Operação não confirmada"});}
  }
  async function logout(){
    if(!api?.logout||!auth.authenticated)return;
    try{await api.logout();setStatus(EMPTY);setAuth({authenticated:false});}
    catch(error){setMessage({level:"fail",text:error instanceof Error?error.message:"Falha ao sair da sessão"});}
  }
  const health=status.health || EMPTY.health!;
  const tailscale=status.tailscale || EMPTY.tailscale!;
  const pairing=status.pairing || EMPTY.pairing!;
  const paired=pairing.state==="PAIRED_VERIFIED";
  const observed=status.observedAt?Date.parse(status.observedAt):NaN;
  const active=Number.isFinite(observed)&&now-observed>=0&&now-observed<25000;
  const authorized=auth.authenticated;
  return <main className="cdos-agent-bridge" aria-label="CENTRALDARK AGENTE" translate="no">
    <div className="bridge-dashboard">
      <header className="bridge-topbar">
        <div className="bridge-brand">
          <div className="bridge-brand-mark"><ShieldCheck size={26}/></div>
          <div><span>CENTRALDARK-OS</span><strong>Centraldark Agent</strong></div>
        </div>
        <div className="bridge-top-actions">
          <button type="button" onClick={()=>void logout()} disabled={!authorized || !api?.logout} title={auth.user?.email || ""}>Sair da conta</button>
          <button type="button" onClick={()=>void refresh()} disabled={!authorized||!api?.getStatus||busy}>
            <RefreshCw size={16} className={busy?"bridge-spin":""}/>{busy?"Atualizando":"Atualizar"}
          </button>
        </div>
      </header>
      <section className="bridge-hero">
        <div>
          <StatusPill level={health.reachable?"pass":"fail"}>{health.reachable?"CASA CONECTADA":"CASA SEM RESPOSTA"}</StatusPill>
          <h1>Uma ponte. Um estado real.</h1>
          <p>Controle a conexão deste computador, confirme autorizações e acompanhe a rede em um só lugar.</p>
        </div>
        <div className="bridge-orbit" aria-hidden="true">
          <span/><span/><ShieldCheck size={54}/>
        </div>
      </section>
      <section className="bridge-actions" aria-label="Controles do Bridge">
        <button type="button" className="bridge-action bridge-action-primary" disabled={paired||!authorized||!api?.pairCasa}
          onClick={()=>void perform("pair",()=>api!.pairCasa!())}>
          <KeyRound size={20}/><span><strong>{paired?"Pareamento verificado com sucesso":"Vincular dispositivo"}</strong>
            <small>{paired?"Este dispositivo está vinculado à sua conta.":"Conecte este computador à sua conta"}</small></span>
        </button>
        <button type="button" className="bridge-action" disabled={!authorized||!api?.startBridge}
          onClick={()=>void perform("start",()=>api!.startBridge!())}>
          <Play size={20}/><span><strong>Iniciar Bridge</strong><small>Ativar serviço neste computador</small></span>
        </button>
        <button type="button" className="bridge-action" disabled={!authorized||!api?.openCockpit}
          onClick={()=>void perform("cockpit",()=>api!.openCockpit!())}>
          <ExternalLink size={20}/><span><strong>Abrir Cockpit</strong><small>Sala de Controle</small></span>
        </button>
      </section>
      {pairing.code && (pairing.state==="WAITING_OWNER_CONSENT"||pairing.state==="PAIRING_PENDING") &&
        <section className="bridge-pairing" aria-label="Confirmar pareamento">
          <div><strong>Seu código: {pairing.code}</strong><p>Confira o código antes de autorizar este computador.</p></div>
          <button type="button" disabled={!authorized||!api?.confirmPair} onClick={()=>void perform("confirm",()=>api!.confirmPair!())}>
            <ShieldCheck size={16}/> Confirmar vínculo
          </button>
        </section>}
      {message&&<div className={"bridge-receipt "+message.level} role="status">
        {message.level==="fail"?<TriangleAlert size={17}/>:<Activity size={17}/>} {message.text}
      </div>}
      <section className="bridge-os-entry" aria-label="Entrada no CENTRALDARK · OS">
        <div><span>PRÓXIMA ETAPA</span><strong>CENTRALDARK · OS</strong>
          <small>Abra o sistema original nesta mesma janela quando você escolher.</small></div>
        <button type="button" onClick={onOpenOs}><MonitorPlay size={21}/> Abrir CENTRALDARK · OS</button>
      </section>
      <section className="bridge-grid">
        <StatusCard icon={Cable} title="Este computador" level={health.reachable?"pass":"fail"}
          headline={health.reachable?"Serviço local disponível":"Serviço sem resposta"}
          detail={health.reachable?"Serviço da Casa acessível.":"Não foi possível verificar a conexão local."}/>
        <StatusCard icon={Router} title="Conexão central" level={health.engineConnected?"pass":"pending"}
          headline={health.engineConnected?"Conectada":"Aguardando conexão"}
          detail={health.receipt?"Última operação registrada.":"Nenhuma operação confirmada."}/>
        <StatusCard icon={Cloud} title="Rede privada"
          level={tailscale.available&&tailscale.state==="Running"?"pass":"pending"}
          headline={tailscale.available?(tailscale.state==="Running"?"Conectada":"Aguardando conexão"):"Rede indisponível"}
          detail={tailscale.self?"Computador "+tailscale.self:"Aguardando verificação da rede."}/>
      </section>
      {!api?.getStatus && <div className="bridge-contract-notice" role="status">
        A conexão IPC do Bridge ainda não foi vinculada a este Electron. Os controles permanecem visíveis;
        ações de pareamento e serviço exigem autenticação e integração reais.
      </div>}
      <footer className="bridge-footer">
        <span><Activity size={15}/> Última verificação:
          <strong>{status.observedAt?new Date(status.observedAt).toLocaleTimeString("pt-BR"):"—"}</strong></span>
        <span><Clock3 size={15}/> Tempo da sessão: <strong>{duration(auth.sessionStartedAt,now)}</strong></span>
        <span><i className={"bridge-live-dot"+(active?" active":"")}/>
          {busy?"Verificando conexões":active?"Monitoramento ativo":"Aguardando verificação"}
          <small>· A cada 10 segundos</small></span>
      </footer>
    </div>
  </main>;
}
