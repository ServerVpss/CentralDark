import type { HaloTheme, ThemeId } from "../types/themes";

export const THEMES: Record<ThemeId, HaloTheme> = {
  "cyber-blue": {
    id: "cyber-blue",
    name: "Cyber Blue",
    mode: "full-edge",
    working: {
      color: "#35eaff",
      secondaryColor: "#086cfb",
      durationMs: 1550,
      intensity: 0.95,
      widthPx: 11,
      effect: "flow",
    },
    attention: {
      color: "#ffd84a",
      secondaryColor: "#ff8f2d",
      durationMs: 820,
      intensity: 0.98,
      widthPx: 11,
      effect: "pulse",
    },
    completed: {
      color: "#64f2a0",
      secondaryColor: "#14b879",
      durationMs: 720,
      intensity: 0.95,
      widthPx: 11,
      effect: "sweep",
    },
  },

  sakura: {
    id: "sakura",
    name: "Sakura",
    mode: "full-edge",
    working: {
      color: "#ff6eb4",
      secondaryColor: "#c44dff",
      durationMs: 3000,
      intensity: 0.9,
      widthPx: 8,
      effect: "flow",
    },
    attention: {
      color: "#ff8c69",
      secondaryColor: "#ff6eb4",
      durationMs: 900,
      intensity: 0.96,
      widthPx: 8,
      effect: "pulse",
    },
    completed: {
      color: "#ffb6d9",
      secondaryColor: "#ffc0cb",
      durationMs: 2000,
      intensity: 0.92,
      widthPx: 8,
      effect: "sweep",
    },
  },

  minimal: {
    id: "minimal",
    name: "Minimal",
    mode: "minimal-bar",
    working: {
      color: "#4a9eff",
      durationMs: 2000,
      intensity: 0.78,
      widthPx: 4,
      effect: "minimal-line",
    },
    attention: {
      color: "#ffb700",
      durationMs: 900,
      intensity: 0.9,
      widthPx: 4,
      effect: "minimal-line",
    },
    completed: {
      color: "#00cc66",
      durationMs: 2000,
      intensity: 0.84,
      widthPx: 4,
      effect: "minimal-line",
    },
  },
};

export function getTheme(id: ThemeId): HaloTheme {
  return THEMES[id];
}

export function getEffectConfig(theme: HaloTheme, state: "working" | "attention" | "completed") {
  return theme[state];
}
