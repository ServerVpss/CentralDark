import { describe, expect, it } from "vitest";
import {
  anchoredSet,
  authorizes,
  canContinue,
  canTransition,
  classifyObservation,
  emptySession,
  gateAction,
  isSuccess,
  locate,
  measureProgress,
  onFailure,
  progressVerdict,
  recalibrate,
  resumeFrom,
  stateForStatus,
  transition,
  validateCheckpoint,
  type Checkpoint,
  type Evidence,
  type ProgressMeasure,
} from "./state";

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

const ALVO = "missao-delta@HEAD-abc";

const lembrado = (id: string, declaredAt: number): Checkpoint => ({
  id,
  target: ALVO,
  source: "memory",
  declaredAt,
});

const ancora = (checkpointId: string, order: number, ref = "sha-" + checkpointId): Evidence => ({
  kind: "sha",
  ref,
  target: ALVO,
  checkpointId,
  order,
});

const mu = (over: Partial<ProgressMeasure> = {}): ProgressMeasure => ({
  openHypotheses: 3,
  blockers: 1,
  unanchoredCheckpoints: 1,
  pendingDiscriminatingTests: 2,
  risk: 2,
  ...over,
});

describe("continuidade: ancorar antes de continuar", () => {
  it("T01 memoria localiza candidato mas nao valida sozinha", () => {
    const candidato = lembrado("cp-1", 999_999);
    expect(validateCheckpoint(candidato, [])).toBe(0);
    expect(locate([candidato], [])).toBeNull();
  });

  it("T02 checkpoint com ancora verificavel e selecionado", () => {
    const candidato = lembrado("cp-1", 1);
    expect(validateCheckpoint(candidato, [ancora("cp-1", 10)])).toBe(1);
    expect(locate([candidato], [ancora("cp-1", 10)])?.checkpoint.id).toBe("cp-1");
  });

  it("T03 evidencia nova vence memoria antiga", () => {
    const antigo = lembrado("cp-antigo", 9_999_999); // memoria jura ser o mais recente
    const novo = lembrado("cp-novo", 1);
    const escolhido = locate([antigo, novo], [ancora("cp-novo", 42)]);
    expect(escolhido?.checkpoint.id).toBe("cp-novo");
  });

  it("T04 mensagem atrasada nao retrocede a missao", () => {
    const atual = locate([lembrado("cp-5", 1)], [ancora("cp-5", 50)]);
    const depois = locate([lembrado("cp-2", 1)], [ancora("cp-2", 20)], atual);
    expect(depois?.checkpoint.id).toBe("cp-5");
    expect(depois?.order).toBe(50);
  });

  it("T05 todos os candidatos invalidos produzem HALT_SEM_ANCORA", () => {
    const sessao = recalibrate(emptySession(ALVO), {
      candidates: [lembrado("cp-a", 1), lembrado("cp-b", 2)],
    });
    expect(sessao.status).toBe("HALT_SEM_ANCORA");
    expect(sessao.anchored).toBeNull();
    expect(sessao.blockedReason).toContain("cp-a");
  });

  it("T06 ausencia de evidencia nunca produz PASS", () => {
    const status = classifyObservation({
      toolAvailable: true,
      executed: true,
      skipped: false,
      timedOut: false,
      passed: true,
      evidence: null,
    });
    expect(status).toBe("UNKNOWN");
    expect(isSuccess(status)).toBe(false);
  });

  it("T07 ferramenta indisponivel ou timeout produz UNKNOWN", () => {
    const base = {
      executed: true, skipped: false, timedOut: false,
      passed: true, evidence: ancora("cp-1", 1),
    };
    expect(classifyObservation({ ...base, toolAvailable: false })).toBe("UNKNOWN");
    expect(classifyObservation({ ...base, toolAvailable: true, timedOut: true })).toBe("UNKNOWN");
  });

  it("T08 SKIPPED nunca produz PASS", () => {
    const status = classifyObservation({
      toolAvailable: true, executed: false, skipped: true,
      timedOut: false, passed: true, evidence: ancora("cp-1", 1),
    });
    expect(status).toBe("UNKNOWN");
    expect(isSuccess(status)).toBe(false);
  });

  it("T09 progresso real altera a medida mu", () => {
    expect(measureProgress(mu())).toBe(9);
    expect(progressVerdict(mu(), mu({ blockers: 0 }))).toBe("PROGRESS");
    expect(progressVerdict(mu(), mu({ risk: 5 }))).toBe("REGRESSION");
  });

  it("T10 estagnacao total produz PONTO_FIXO_ATINGIDO", () => {
    const ancorada = recalibrate(emptySession(ALVO), {
      candidates: [lembrado("cp-1", 1)],
      evidence: [ancora("cp-1", 10)],
      progress: mu(),
    });
    const parada = recalibrate(ancorada, { progress: mu() });
    expect(parada.status).toBe("PONTO_FIXO_ATINGIDO");
  });

  it("T11 ponto fixo nao e tratado como sucesso", () => {
    expect(isSuccess("PONTO_FIXO_ATINGIDO")).toBe(false);
    expect(stateForStatus("PONTO_FIXO_ATINGIDO")).toBeNull();
  });

  it("T12 verde tecnico sem autorizacao bloqueia acao critica", () => {
    const sessao = recalibrate(emptySession(ALVO), {
      candidates: [lembrado("cp-1", 1)],
      evidence: [ancora("cp-1", 10)],
    });
    expect(sessao.anchored).not.toBeNull();
    expect(gateAction(sessao, "deploy", ALVO)).toBe("BLOCKED_AUTHORIZATION");
    expect(gateAction(sessao, "read", ALVO)).not.toBe("BLOCKED_AUTHORIZATION");
  });

  it("T13 autorizacao para outro alvo nao autoriza o alvo atual", () => {
    expect(authorizes({ action: "deploy", target: "outro-alvo" }, "deploy", ALVO)).toBe(false);
    expect(authorizes({ action: "restart", target: ALVO }, "deploy", ALVO)).toBe(false);
    expect(authorizes({ action: "deploy", target: ALVO }, "deploy", ALVO)).toBe(true);
  });

  it("T14 falha depois do checkpoint volta ao diagnostico sem perder a ancora", () => {
    const sessao = recalibrate(emptySession(ALVO), {
      candidates: [lembrado("cp-1", 1)],
      evidence: [ancora("cp-1", 10)],
    });
    const falhou = onFailure(sessao, "teste discriminativo reprovou");
    expect(falhou.status).toBe("FAIL");
    expect(resumeFrom(falhou)?.id).toBe("cp-1");
    expect(stateForStatus(falhou.status)).toBe("BLOCKED");
  });

  it("T15 retomada usa o ultimo checkpoint ancorado", () => {
    let sessao = recalibrate(emptySession(ALVO), {
      candidates: [lembrado("cp-1", 1)],
      evidence: [ancora("cp-1", 10)],
    });
    sessao = recalibrate(sessao, {
      candidates: [lembrado("cp-2", 2)],
      evidence: [ancora("cp-2", 20)],
      progress: mu({ blockers: 0 }),
    });
    expect(resumeFrom(sessao)?.id).toBe("cp-2");
    expect(anchoredSet(sessao.candidates, sessao.evidence)).toHaveLength(2);
  });

  it("T16 nenhum checkpoint valido impede continuacao", () => {
    const sessao = recalibrate(emptySession(ALVO), { candidates: [lembrado("cp-x", 1)] });
    expect(canContinue(sessao)).toBe(false);
    expect(resumeFrom(sessao)).toBeNull();
  });

  it("T17 comportamento anterior continua valido", () => {
    expect(canTransition("IDLE", "LISTENING")).toBe(true);
    expect(canTransition("IDLE", "EXECUTING")).toBe(false);
    expect(transition("THINKING", "EXECUTING")).toBe("EXECUTING");
  });

  it("T18 o nucleo de estado nao acopla gateway, voz, interface nem Tauri", async () => {
    // especificador montado em runtime: le o proprio fonte sem exigir
    // @types/node nem dependencia nova no projeto
    const especificador = "node:" + "fs";
    const fs = (await import(/* @vite-ignore */ especificador)) as {
      readFileSync: (path: URL, encoding: string) => string;
    };
    const fonte = fs.readFileSync(new URL("./state.ts", import.meta.url), "utf8");
    expect(fonte).not.toMatch(/^\s*import\s/m);
    expect(fonte).not.toMatch(/gateway|voice|tauri|react|App\.tsx|settings/i);
  });
});
