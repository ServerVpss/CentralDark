import type React from "react";
import type { HaloTheme } from "../types/themes";
import { getEffectVars } from "./effectStyles";

interface FullEdgeEffectProps {
  theme: HaloTheme;
  state: "working" | "attention" | "completed";
}

/**
 * Full-edge light effect: renders glowing borders around the entire screen.
 */
export const FullEdgeEffect: React.FC<FullEdgeEffectProps> = ({ theme, state }) => {
  const config = theme[state];
  const vars = getEffectVars(config);
  const message = state === "working" ? "CENTRALDARK IS WORKING" : state === "attention" ? "CENTRALDARK NEEDS YOU" : "TASK COMPLETED";

  return (
    <div
      className={`halo-frame halo-frame-${state}`}
      style={vars as React.CSSProperties}
    >
      {(["top", "right", "bottom", "left"] as const).map((edge) => (
        <div className={`halo-edge halo-edge-${edge}`} key={edge}>
          <span className="halo-edge-light" />
        </div>
      ))}
      <div className="halo-hero-window" aria-hidden="true" />
      <svg className="halo-hero-mark" viewBox="0 0 128 128" aria-hidden="true">
        <circle className="halo-hero-ring" cx="64" cy="64" r="44" />
        <path className="halo-hero-code" d="m42 51 15 13-15 13M66 77h25" />
        <circle className="halo-hero-spark" cx="94" cy="34" r="4" />
      </svg>
      <div className="halo-hero-caption" aria-hidden="true"><i/><span>{message}</span></div>
    </div>
  );
};
