import { describe, expect, it } from "vitest";
import { canTransition, transition } from "./state";

describe("SOL state machine", () => {
  it("aceita o ciclo mínimo de voz", () => {
    expect(canTransition("IDLE", "LISTENING")).toBe(true);
    expect(canTransition("LISTENING", "TRANSCRIBING")).toBe(true);
    expect(canTransition("TRANSCRIBING", "THINKING")).toBe(true);
    expect(canTransition("THINKING", "SPEAKING")).toBe(true);
    expect(canTransition("SPEAKING", "IDLE")).toBe(true);
  });

  it("bloqueia salto direto para execução", () => {
    expect(() => transition("IDLE", "EXECUTING")).toThrow(/Transição inválida/);
  });
});
