export type SolState =
  | "IDLE"
  | "LISTENING"
  | "TRANSCRIBING"
  | "THINKING"
  | "EXECUTING"
  | "SPEAKING"
  | "BLOCKED";

const allowed: Record<SolState, readonly SolState[]> = {
  IDLE: ["LISTENING", "THINKING", "BLOCKED"],
  LISTENING: ["TRANSCRIBING", "IDLE", "BLOCKED"],
  TRANSCRIBING: ["THINKING", "IDLE", "BLOCKED"],
  THINKING: ["EXECUTING", "SPEAKING", "IDLE", "BLOCKED"],
  EXECUTING: ["SPEAKING", "IDLE", "BLOCKED"],
  SPEAKING: ["IDLE", "LISTENING", "BLOCKED"],
  BLOCKED: ["IDLE"],
};

export function canTransition(from: SolState, to: SolState): boolean {
  return allowed[from].includes(to);
}

export function transition(from: SolState, to: SolState): SolState {
  if (!canTransition(from, to)) {
    throw new Error(`Transição inválida: ${from} -> ${to}`);
  }
  return to;
}
