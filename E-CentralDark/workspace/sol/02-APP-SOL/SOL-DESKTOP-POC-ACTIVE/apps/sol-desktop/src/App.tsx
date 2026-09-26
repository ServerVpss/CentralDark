import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  Bot,
  Boxes,
  BrainCircuit,
  Building2,
  ChevronRight,
  CircleStop,
  Code2,
  Cpu,
  Gauge,
  Mic,
  MicOff,
  PanelLeft,
  Settings,
  ShieldCheck,
  Sparkles,
  Volume2,
  X,
} from "lucide-react";
import { classifyLocal } from "./core/intent";
import type { SolState } from "./core/state";
import { askSol } from "./lib/gateway";
import { defaults, loadSettings, saveSettings, type SolSettings } from "./lib/settings";
import { installPushToTalkShortcut } from "./lib/tauri";
import { createRecognition, speak, stopVoice } from "./lib/voice";

interface Message {
  id: string;
  role: "chefe" | "sol";
  text: string;
  receipt?: Record<string, unknown>;
}

const modules = [
  ["sol", "SOL", Sparkles],
  ["pivete", "PIVETE", BrainCircuit],
  ["missions", "Missões", Gauge],
  ["agents", "Agentes", Bot],
  ["crm", "CRM", Building2],
  ["builder", "Builder", Code2],
  ["voice", "Voz", Volume2],
  ["settings", "Config", Settings],
] as const;

const stateLabel: Record<SolState, string> = {
  IDLE: "pronta",
  LISTENING: "ouvindo",
  TRANSCRIBING: "transcrevendo",
  THINKING: "interpretando",
  EXECUTING: "executando",
  SPEAKING: "falando",
  BLOCKED: "bloqueada",
};

export default function App() {
  const [state, setState] = useState<SolState>("IDLE");
  const [activeModule, setActiveModule] = useState("sol");
  const [settings, setSettings] = useState<SolSettings>(() => loadSettings());
  const [draftSettings, setDraftSettings] = useState(settings);
  const [input, setInput] = useState("");
  const [interim, setInterim] = useState("");
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: crypto.randomUUID(),
      role: "sol",
      text: "Bom dia, Chefe. SOL Voice-First está aberta. Pressione Ctrl+Shift+Espaço ou segure o botão para falar.",
    },
  ]);
  const recognitionRef = useRef<ReturnType<typeof createRecognition>>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
  }, [settings.theme]);

  const stopAll = useCallback(() => {
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    abortRef.current?.abort();
    abortRef.current = null;
    stopVoice();
    setInterim("");
    setState("IDLE");
    setMessages((previous) => [
      ...previous,
      { id: crypto.randomUUID(), role: "sol", text: "Interrupção confirmada. Processos desta sessão foram cancelados." },
    ]);
  }, []);

  const submit = useCallback(
    async (raw: string) => {
      const message = raw.trim();
      if (!message) return;
      setInput("");
      setInterim("");
      setError("");
      setMessages((previous) => [...previous, { id: crypto.randomUUID(), role: "chefe", text: message }]);
      const classified = classifyLocal(message);
      if (classified.intent === "STOP_ALL") {
        stopAll();
        return;
      }

      setState("THINKING");
      abortRef.current = new AbortController();
      try {
        const history = messages.map(({ role, text }) => ({ role, text }));
        const reply = await askSol(message, classified, settings, history, abortRef.current.signal);
        setMessages((previous) => [
          ...previous,
          { id: crypto.randomUUID(), role: "sol", text: reply.text, receipt: reply.receipt },
        ]);
        setState("SPEAKING");
        await speak(reply.text, settings);
        setState("IDLE");
      } catch (reason) {
        const text = reason instanceof Error ? reason.message : "Falha desconhecida";
        setError(text);
        setMessages((previous) => [
          ...previous,
          { id: crypto.randomUUID(), role: "sol", text: `Falha controlada: ${text}. Nenhuma mutação foi confirmada.` },
        ]);
        setState("BLOCKED");
      }
    },
    [messages, settings, stopAll],
  );

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setState("IDLE");
  }, []);

  const startListening = useCallback(() => {
    if (state === "LISTENING") {
      stopListening();
      return;
    }
    setError("");
    const recognition = createRecognition(
      settings,
      (text, final) => {
        setInterim(text);
        if (final && text) void submit(text);
      },
      () => {
        recognitionRef.current = null;
        setState((current) => (current === "LISTENING" ? "IDLE" : current));
      },
      (message) => {
        setError(`${message}. Digite o comando ou configure STT no Gateway.`);
        recognitionRef.current = null;
        setState("BLOCKED");
      },
    );
    if (!recognition) {
      setError("Reconhecimento de voz não disponível nesta WebView. Use texto nesta prova ou conecte o STT do Gateway.");
      setState("BLOCKED");
      return;
    }
    recognitionRef.current = recognition;
    setState("LISTENING");
    recognition.start();
  }, [settings, state, stopListening, submit]);

  useEffect(() => {
    let cleanup: () => Promise<void> = async () => undefined;
    void installPushToTalkShortcut(startListening).then((fn) => {
      cleanup = fn;
    }).catch((reason) => setError(`Atalho global indisponível: ${String(reason)}`));
    return () => {
      void cleanup();
    };
  }, [startListening]);

  useEffect(() => {
    const keyboard = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.code === "Space") {
        event.preventDefault();
        startListening();
      }
      if (event.key === "Escape") stopAll();
    };
    window.addEventListener("keydown", keyboard);
    return () => window.removeEventListener("keydown", keyboard);
  }, [startListening, stopAll]);

  const active = useMemo(() => modules.find(([id]) => id === activeModule), [activeModule]);

  const save = () => {
    saveSettings(draftSettings);
    setSettings(draftSettings);
    setActiveModule("sol");
  };

  return (
    <main className="shell">
      <header className="titlebar" data-tauri-drag-region>
        <div className="brand" data-tauri-drag-region>
          <span className="brand-mark"><Sparkles size={16} /></span>
          <strong>SOL</strong>
          <span>CentralDark Voice-First</span>
        </div>
        <div className={`runtime runtime-${state.toLowerCase()}`}>
          <span className="pulse" /> {stateLabel[state]}
        </div>
        <button className="icon-button danger" onClick={stopAll} title="Interromper tudo nesta sessão"><CircleStop size={17} /></button>
      </header>

      <aside className="nav">
        <div className="nav-logo"><BrainCircuit size={25} /></div>
        {modules.map(([id, label, Icon]) => (
          <button key={id} className={activeModule === id ? "nav-item active" : "nav-item"} onClick={() => setActiveModule(id)} title={label}>
            <Icon size={19} /><span>{label}</span>
          </button>
        ))}
      </aside>

      <section className="workspace">
        <div className="workspace-head">
          <div><small>SUPERFÍCIE</small><h1>{active?.[1] ?? "SOL"}</h1></div>
          <div className="chips"><span>SEGREDO/CHEFE</span><ChevronRight size={14}/><span>SOL</span><ChevronRight size={14}/><span>PIVETE/HERMES</span></div>
        </div>

        {activeModule === "sol" ? (
          <>
            <div className="conversation">
              {messages.map((message) => (
                <article className={`message ${message.role}`} key={message.id}>
                  <div className="avatar">{message.role === "sol" ? <Sparkles size={16}/> : "👑"}</div>
                  <div>
                    <strong>{message.role === "sol" ? "SOL" : "SEGREDO/CHEFE"}</strong>
                    <p>{message.text}</p>
                    {message.receipt && <pre>{JSON.stringify(message.receipt, null, 2)}</pre>}
                  </div>
                </article>
              ))}
              {interim && <article className="message chefe interim"><div className="avatar">👑</div><div><strong>OUVINDO</strong><p>{interim}</p></div></article>}
            </div>

            <div className="composer">
              <button className={state === "LISTENING" ? "ptt active" : "ptt"} onClick={startListening} aria-label="Falar com a SOL">
                {state === "LISTENING" ? <MicOff size={25}/> : <Mic size={25}/>}<span>{state === "LISTENING" ? "PARAR" : "FALAR"}</span>
              </button>
              <form onSubmit={(event) => { event.preventDefault(); void submit(input); }}>
                <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Fale ou escreva sua intenção para a SOL…" />
                <button type="submit">Executar</button>
              </form>
            </div>
          </>
        ) : activeModule === "settings" ? (
          <div className="settings-panel">
            <h2>Conexões locais</h2>
            <p>As chaves ficam apenas no armazenamento local desta WebView. Nunca entram no Git.</p>
            <label>Gateway SOL<input value={draftSettings.gatewayUrl} onChange={(e) => setDraftSettings({ ...draftSettings, gatewayUrl: e.target.value })} /></label>
            <label>Chave do Gateway<input type="password" value={draftSettings.gatewayKey} onChange={(e) => setDraftSettings({ ...draftSettings, gatewayKey: e.target.value })} /></label>
            <label>STT local<input value={draftSettings.sttUrl} onChange={(e) => setDraftSettings({ ...draftSettings, sttUrl: e.target.value })} /></label>
            <label>Chave STT<input type="password" value={draftSettings.sttKey} onChange={(e) => setDraftSettings({ ...draftSettings, sttKey: e.target.value })} /></label>
            <label>Bridge TTS<input value={draftSettings.ttsUrl} onChange={(e) => setDraftSettings({ ...draftSettings, ttsUrl: e.target.value })} /></label>
            <label>Chave TTS<input type="password" value={draftSettings.ttsKey} onChange={(e) => setDraftSettings({ ...draftSettings, ttsKey: e.target.value })} /></label>
            <label className="setting-toggle"><input type="checkbox" checked={draftSettings.screenpipeContextEnabled} onChange={(e) => setDraftSettings({ ...draftSettings, screenpipeContextEnabled: e.target.checked })} />Usar contexto observado do Screenpipe</label>
            <label>Janela observada (minutos)<input type="number" min="1" max="60" value={draftSettings.screenpipeLookbackMinutes} onChange={(e) => setDraftSettings({ ...draftSettings, screenpipeLookbackMinutes: Number(e.target.value) })} /></label>
            <label>Tema<select value={draftSettings.theme} onChange={(e) => setDraftSettings({ ...draftSettings, theme: e.target.value as SolSettings["theme"] })}><option value="overclock">Overclock</option><option value="crm">CRM</option></select></label>
            <div className="settings-actions"><button onClick={() => setDraftSettings(defaults)}>Restaurar</button><button className="primary" onClick={save}>Salvar localmente</button></div>
          </div>
        ) : (
          <ModulePanel
            module={activeModule}
            onBack={() => setActiveModule("sol")}
            onAction={(item) => {
              setActiveModule("sol");
              void submit(`Abrir modulo ${activeModule}: ${item}`);
            }}
          />
        )}
      </section>

      <aside className="telemetry">
        <div className="telemetry-head"><Activity size={16}/><strong>AO VIVO</strong></div>
        <Metric icon={<ShieldCheck size={16}/>} label="Modo" value="LOCAL CONTROLADO" />
        <Metric icon={<Cpu size={16}/>} label="Roteador" value="OMNI + CAPABILITY" />
        <Metric icon={<Boxes size={16}/>} label="Memória" value="SESSÃO LOCAL" />
        <Metric icon={<Activity size={16}/>} label="Contexto" value={settings.screenpipeContextEnabled ? `SCREENPIPE ${settings.screenpipeLookbackMinutes} MIN` : "DESLIGADO"} />
        <Metric icon={<PanelLeft size={16}/>} label="App" value="TAURI CANÔNICO" />
        <div className="flow">
          <small>CADEIA ATIVA</small>
          <span>SEGREDO/CHEFE</span><ChevronRight/><span>SOL</span><ChevronRight/><span>PIVETE/HERMES</span><ChevronRight/><span>TOOLS</span>
        </div>
        {error && <div className="error"><X size={15}/><span>{error}</span><button onClick={() => { setError(""); setState("IDLE"); }}>limpar</button></div>}
        <p className="shortcut">Ctrl+Shift+Espaço: falar<br/>Esc: interromper</p>
      </aside>
    </main>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="metric"><span>{icon}</span><div><small>{label}</small><strong>{value}</strong></div></div>;
}

function ModulePanel({ module, onBack, onAction }: { module: string; onBack: () => void; onAction: (item: string) => void }) {
  const copy: Record<string, [string, string, string[]]> = {
    pivete: ["PIVETE / HERMES", "Mente persistente, memória, comportamento treinado e continuidade.", ["Memória", "Rotas fixas", "Aprendizados", "Corpo Casa/VPS"]],
    missions: ["MISSÕES", "Contratos, estado, gates, cancelamento e evidência.", ["Ativas", "Bloqueadas", "Revisão", "Arquivadas"]],
    agents: ["AGENTES / SWARMS", "Leitores paralelos, escritor único e Judge independente.", ["Squads", "Panes", "Modelos", "Orçamento"]],
    crm: ["CRM", "Chassi operacional DeskcommCRM a integrar sem apagar o sistema único.", ["Inbox", "Kanban", "Contatos", "Agentes"]],
    builder: ["BUILDER", "Criação, preview, teste, publicação e rollback.", ["Projetos", "Preview", "Assets", "Deploy"]],
    voice: ["VOZ", "Entrada e saída de voz da SOL com retenção e interrupção controladas.", ["PTT", "STT", "TTS", "Sessões"]],
  };
  const [title, description, items] = copy[module] ?? [module, "Módulo reservado.", []];
  return <div className="module-panel"><small>MÓDULO CONECTÁVEL</small><h2>{title}</h2><p>{description}</p><div className="module-grid">{items.map((item) => <button key={item} onClick={() => onAction(item)}>{item}<ChevronRight size={16}/></button>)}</div><button className="back" onClick={onBack}>Voltar para SOL</button></div>;
}
