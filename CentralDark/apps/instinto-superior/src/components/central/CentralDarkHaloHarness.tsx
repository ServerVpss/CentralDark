import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CentralOverlay } from "../../../../modulos/centraldark-halo-main/src/components/CentralOverlay";
import type { HaloState } from "../../../../modulos/centraldark-halo-main/src/types/state";
import type { ThemeId } from "../../../../modulos/centraldark-halo-main/src/types/themes";
// Load original Halo CSS as text, not global rules: the upstream stylesheet
// includes html/body overflow:hidden and background resets, incompatible with Cockpit.
import haloStyles from "../../../../modulos/centraldark-halo-main/src/App.css?inline";
import type { EstadoOperacional } from "./EstadoCentralDark";

const STATE_BY_OPERATIONAL: Record<EstadoOperacional, HaloState> = {
  RUNNING: "working",
  PASS: "completed",
  BLOCKED: "attention",
  AUTH_REQUIRED: "attention",
  FAIL: "attention",
  UNKNOWN: "idle",
};

export function CentralDarkHaloHarness({ estado = "UNKNOWN" }: { estado?: EstadoOperacional }) {
  const [state, setState] = useState<HaloState>(STATE_BY_OPERATIONAL[estado]);
  const [theme] = useState<ThemeId>("cyber-blue");
  const hostRef = useRef<HTMLDivElement>(null);
  const [shadow, setShadow] = useState<ShadowRoot | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    // One original Halo, isolated in a native ShadowRoot. CSS global selectors
    // cannot lock document scrolling or replace CentralDark theme tokens.
    setShadow(host.shadowRoot ?? host.attachShadow({ mode: "open" }));
  }, []);

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

  return (
    <div ref={hostRef} aria-label="CentralDark Halo" data-centraldark-halo-state={state} style={{ pointerEvents: "none" }}>
      {shadow ? createPortal(<><style>{haloStyles}</style><CentralOverlay state={state} themeId={theme} /></>, shadow) : null}
    </div>
  );
}
