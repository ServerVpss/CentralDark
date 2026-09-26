import { describe, expect, it } from "vitest";
import { classifyLocal } from "./intent";

describe("roteador local determinístico", () => {
  it("classifica status como read-only", () => {
    expect(classifyLocal("SOL, qual o status da missão Delta?")).toMatchObject({
      intent: "STATUS_READONLY",
      risk: "READ_ONLY",
    });
  });

  it("prioriza cancelamento", () => {
    expect(classifyLocal("para tudo agora").intent).toBe("STOP_ALL");
  });

  it("abre módulo sem executar mutação", () => {
    expect(classifyLocal("abre o CRM")).toMatchObject({
      intent: "OPEN_MODULE",
      module: "crm",
      risk: "READ_ONLY",
    });
  });
});
