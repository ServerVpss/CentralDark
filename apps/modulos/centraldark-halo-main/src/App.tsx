import { useEffect, useState } from "react";
import { Copy, Minus, ShieldCheck, Square, X } from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";

type ResizeDirection = "East" | "North" | "NorthEast" | "NorthWest" | "South" | "SouthEast" | "SouthWest" | "West";
import { CentralOverlay } from "./components/CentralOverlay";
import { useStateManager } from "./state/useStateManager";
import { RemoteAgentLogin } from "./components/RemoteAgentLogin";

/**
 * @rastro Janela interativa de atendimento dentro do unico WebView Tauri.
 * POR_QUE: substitui a moldura Windows sem abrir outra instancia ou usar Electron.
 * CONTRATO: somente agent-control possui controles nativos; overlay-* continua
 * transparente, sem foco e sem acesso ao cofre. X oculta, nao encerra o agente.
 * PROVA: conferir minimizar, maximizar, restaurar e ocultar para bandeja na UI.
 */
function AgentWindowChrome() {
  const [maximized, setMaximized] = useState(false);
  const [windowError, setWindowError] = useState("");

  useEffect(() => {
    const nativeWindow = getCurrentWindow();
    let mounted = true;
    let unlisten: (() => void) | null = null;
    const syncMaximized = () => {
      void nativeWindow.isMaximized().then((value) => {
        if (mounted) setMaximized(value);
      }).catch(() => {});
    };
    syncMaximized();
    void nativeWindow.onResized(syncMaximized).then((stop) => {
      if (mounted) unlisten = stop;
      else stop();
    }).catch(() => {});
    return () => {
      mounted = false;
      unlisten?.();
    };
  }, []);

  const control = (action: () => Promise<void>) => {
    setWindowError("");
    void action().catch(() => setWindowError("Não foi possível controlar a janela. Tente novamente."));
  };
  const resize = (direction: ResizeDirection) => {
    control(() => getCurrentWindow().startResizeDragging(direction));
  };

  const edges: { direction: ResizeDirection; className: string }[] = [
    { direction: "North", className: "north" },
    { direction: "South", className: "south" },
    { direction: "East", className: "east" },
    { direction: "West", className: "west" },
    { direction: "NorthEast", className: "north-east" },
    { direction: "NorthWest", className: "north-west" },
    { direction: "SouthEast", className: "south-east" },
    { direction: "SouthWest", className: "south-west" },
  ];

  return (
    <div className="agent-native-shell">
      <header className="agent-native-titlebar">
        <div
          className="agent-titlebar-drag"
          data-tauri-drag-region
          onDoubleClick={() => control(() => getCurrentWindow().toggleMaximize())}
          title="Arraste para mover; dois cliques para maximizar"
        >
          <span className="agent-titlebar-icon" data-tauri-drag-region>
            <ShieldCheck size={17} strokeWidth={1.9} aria-hidden="true" />
          </span>
          <span className="agent-titlebar-wordmark" data-tauri-drag-region>
            <span className="agent-titlebar-eyebrow" data-tauri-drag-region>CENTRALDARK</span>
            <strong data-tauri-drag-region>Agente Remoto</strong>
          </span>

        </div>
        {windowError && <span className="agent-titlebar-error" role="alert">{windowError}</span>}
        <div className="agent-titlebar-controls" aria-label="Controles da janela">
          <button type="button" className="agent-chrome-button" title="Minimizar"
            aria-label="Minimizar janela" onClick={() => control(() => getCurrentWindow().minimize())}>
            <Minus size={17} aria-hidden="true" />
          </button>
          <button type="button" className="agent-chrome-button" title={maximized ? "Restaurar" : "Maximizar"}
            aria-label={maximized ? "Restaurar janela" : "Maximizar janela"}
            onClick={() => control(() => getCurrentWindow().toggleMaximize())}>
            {maximized ? <Copy size={15} aria-hidden="true" /> : <Square size={14} aria-hidden="true" />}
          </button>
          <button type="button" className="agent-chrome-button agent-chrome-close"
            title="Ocultar na bandeja (não encerra o agente)"
            aria-label="Ocultar janela na bandeja"
            onClick={() => control(() => getCurrentWindow().hide())}>
            <X size={18} aria-hidden="true" />
          </button>
        </div>
      </header>
      <div className="agent-native-body">
        <RemoteAgentLogin />
      </div>
      {!maximized && edges.map((edge) => (
        <div key={edge.direction} className={`agent-resize-handle ${edge.className}`}
          role="presentation" onMouseDown={(event) => {
            if (event.button !== 0) return;
            event.preventDefault();
            resize(edge.direction);
          }} />
      ))}
    </div>
  );
}

/**
 * @rastro Roteador visual entre a janela do agente e os overlays do Halo.
 * POR_QUE: preservar uma unica entrada React e reutilizar os efeitos antigos.
 * CONTRATO: hash #overlay so renderiza Halo, sem login nem controle de janela.
 * PROVA: comparar janela agent-control e overlays em todos os monitores.
 */
function App() {
  const { currentState, theme } = useStateManager();
  const native = "__TAURI_INTERNALS__" in window;
  const isOverlay = native
    ? window.location.hash === "#overlay"
    : new URLSearchParams(window.location.search).has("state");

  if (!isOverlay) {
    return native ? <AgentWindowChrome /> : <RemoteAgentLogin />;
  }

  return (
    <main className="halo-root" aria-hidden="true">
      <CentralOverlay state={currentState} themeId={theme} />
    </main>
  );
}

export default App;
