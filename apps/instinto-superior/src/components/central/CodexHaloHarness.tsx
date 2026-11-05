import { useEffect, useState } from "react";
import { HaloOverlay } from "../../../../modulos/codex-halo-main/src/components/HaloOverlay";
import type { HaloState } from "../../../../modulos/codex-halo-main/src/types/state";
import type { ThemeId } from "../../../../modulos/codex-halo-main/src/types/themes";
import "../../../../modulos/codex-halo-main/src/App.css";
import type { EstadoOperacional } from "./EstadoCentralDark";

const STATE_BY_OPERATIONAL: Record<EstadoOperacional, HaloState> = {
  RUNNING: "working",
  PASS: "completed",
  BLOCKED: "attention",
  AUTH_REQUIRED: "attention",
  FAIL: "attention",
  UNKNOWN: "idle",
};

export function CodexHaloHarness({ estado = "UNKNOWN" }: { estado?: EstadoOperacional }) {
  const [state, setState] = useState<HaloState>(STATE_BY_OPERATIONAL[estado]);
  const [theme] = useState<ThemeId>("cyber-blue");

  useEffect(() => {
    setState(STATE_BY_OPERATIONAL[estado]);
  }, [estado]);

  useEffect(() => {
    const onAgentState = (event: Event) => {
      const value = (event as CustomEvent<{ state?: unknown }>).detail?.state;
      if (value === "working" || value === "attention" || value === "completed" || value === "idle") {
        setState(value);
      }
    };
    window.addEventListener("centraldark:agent-state", onAgentState);
    return () => window.removeEventListener("centraldark:agent-state", onAgentState);
  }, []);

  return <div aria-label="Codex Halo" data-codex-halo-state={state}><HaloOverlay state={state} themeId={theme} /></div>;
}
