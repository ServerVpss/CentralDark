import { CentralOverlay } from "./components/CentralOverlay";
import { useStateManager } from "./state/useStateManager";

function App() {
  const { currentState, theme } = useStateManager();

  return (
    <main className="halo-root" aria-hidden="true">
      <CentralOverlay state={currentState} themeId={theme} />
    </main>
  );
}

export default App;
