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

/* ------------------------------------------------------------------
 * Continuidade operacional.
 *
 * LEMBRAR -> DESCONFIAR -> RECALIBRAR -> LOCALIZAR O ULTIMO ESTADO
 * CERTO COM EVIDENCIA -> CONTINUAR EXATAMENTE DALI -> PROSSEGUIR ->
 * PROVAR DE NOVO.
 *
 * Esta extensao mora no mesmo artefato que ja responde por estado
 * operacional. A memoria localiza candidatos; ela nunca valida.
 * ------------------------------------------------------------------ */

export type SolStatus =
  | "PASS"
  | "FAIL"
  | "BLOCKED"
  | "UNKNOWN"
  | "HALT_SEM_ANCORA"
  | "PONTO_FIXO_ATINGIDO"
  | "BLOCKED_AUTHORIZATION";

/** Tipos de ancora externa aceitos. Nada fora desta lista ancora. */
export type AnchorKind =
  | "hash"
  | "sha"
  | "commit"
  | "pr"
  | "diff"
  | "receipt"
  | "log"
  | "test"
  | "tool_state"
  | "result"
  | "human_auth";

const ANCHOR_KINDS: readonly AnchorKind[] = [
  "hash", "sha", "commit", "pr", "diff", "receipt",
  "log", "test", "tool_state", "result", "human_auth",
];

/** Evidencia externa observada (E_k). `order` e o tau comprovado. */
export interface Evidence {
  kind: AnchorKind;
  ref: string;
  target: string;
  checkpointId: string;
  order: number;
}

/** Candidato a checkpoint (C_k). `declaredAt` vem da memoria e NAO e tau. */
export interface Checkpoint {
  id: string;
  target: string;
  source: "memory" | "evidence";
  declaredAt?: number;
}

/** Checkpoint ancorado (h_k): candidato + a evidencia que o sustenta. */
export interface AnchoredCheckpoint {
  checkpoint: Checkpoint;
  evidence: Evidence;
  order: number;
}

/** Autorizacao aplicavel (a_k). Vale para um par acao/alvo, nunca em geral. */
export interface Authorization {
  action: string;
  target: string;
}

/** Medida deterministica de progresso (mu_k). Menor = mais perto de aceitar. */
export interface ProgressMeasure {
  openHypotheses: number;
  blockers: number;
  unanchoredCheckpoints: number;
  pendingDiscriminatingTests: number;
  risk: number;
}

/** Observacao de uma ferramenta ou teste. */
export interface Observation {
  toolAvailable: boolean;
  executed: boolean;
  skipped: boolean;
  timedOut: boolean;
  passed: boolean;
  evidence: Evidence | null;
}

/** Estado operacional completo: s_k = (m_k, C_k, E_k, h_k, a_k, mu_k, sigma_k). */
export interface ContinuitySession {
  target: string;
  candidates: Checkpoint[];
  evidence: Evidence[];
  anchored: AnchoredCheckpoint | null;
  authorization: Authorization | null;
  progress: ProgressMeasure;
  status: SolStatus;
  blockedReason?: string;
}

export const zeroProgress: ProgressMeasure = {
  openHypotheses: 0,
  blockers: 0,
  unanchoredCheckpoints: 0,
  pendingDiscriminatingTests: 0,
  risk: 0,
};

export function emptySession(target: string): ContinuitySession {
  return {
    target,
    candidates: [],
    evidence: [],
    anchored: null,
    authorization: null,
    progress: { ...zeroProgress },
    status: "HALT_SEM_ANCORA",
    blockedReason: "nenhum checkpoint ancorado",
  };
}

/** V(c, E_k) in {0,1}. Memoria sozinha nunca retorna 1. */
export function validateCheckpoint(candidate: Checkpoint, evidence: readonly Evidence[]): 0 | 1 {
  return supportingEvidence(candidate, evidence) ? 1 : 0;
}

function supportingEvidence(candidate: Checkpoint, evidence: readonly Evidence[]): Evidence | null {
  let best: Evidence | null = null;
  for (const item of evidence) {
    if (item.checkpointId !== candidate.id) continue;
    if (item.target !== candidate.target) continue;
    if (!ANCHOR_KINDS.includes(item.kind)) continue;
    if (!item.ref) continue;
    if (!best || item.order > best.order) best = item;
  }
  return best;
}

/** C_k^+ : apenas candidatos com V = 1, ordenados por tau comprovado. */
export function anchoredSet(
  candidates: readonly Checkpoint[],
  evidence: readonly Evidence[],
): AnchoredCheckpoint[] {
  const result: AnchoredCheckpoint[] = [];
  for (const candidate of candidates) {
    const support = supportingEvidence(candidate, evidence);
    if (support) result.push({ checkpoint: candidate, evidence: support, order: support.order });
  }
  return result.sort((a, b) => a.order - b.order);
}

/**
 * L(C_k, E_k): argmax tau sobre C_k^+, ou null quando C_k^+ = vazio.
 * Monotonico: uma mensagem atrasada (tau menor) nunca substitui o ancorado.
 */
export function locate(
  candidates: readonly Checkpoint[],
  evidence: readonly Evidence[],
  current: AnchoredCheckpoint | null = null,
): AnchoredCheckpoint | null {
  const valid = anchoredSet(candidates, evidence);
  const best = valid.length > 0 ? valid[valid.length - 1] : null;
  if (!best) return current;
  if (current && best.order <= current.order) return current;
  return best;
}

/** mu: escalar deterministico da medida de progresso. */
export function measureProgress(progress: ProgressMeasure): number {
  return (
    progress.openHypotheses +
    progress.blockers +
    progress.unanchoredCheckpoints +
    progress.pendingDiscriminatingTests +
    progress.risk
  );
}

export function progressVerdict(
  previous: ProgressMeasure,
  next: ProgressMeasure,
): "PROGRESS" | "STAGNANT" | "REGRESSION" {
  const before = measureProgress(previous);
  const after = measureProgress(next);
  if (after < before) return "PROGRESS";
  if (after > before) return "REGRESSION";
  return "STAGNANT";
}

export function isCriticalAction(action: string): boolean {
  return [
    "write", "delete", "merge", "deploy", "restart",
    "production", "irreversible", "sensitive_access",
  ].includes(action);
}

/** A(a_k, acao, alvo) = 1 somente para o par exato. */
export function authorizes(
  authorization: Authorization | null,
  action: string,
  target: string,
): boolean {
  if (!authorization) return false;
  return authorization.action === action && authorization.target === target;
}

/** Validacao tecnica nao autoriza execucao. Verde tecnico nao e permissao. */
export function gateAction(
  session: ContinuitySession,
  action: string,
  target: string,
): SolStatus {
  if (!session.anchored) return "HALT_SEM_ANCORA";
  if (!isCriticalAction(action)) return session.status;
  if (!authorizes(session.authorization, action, target)) return "BLOCKED_AUTHORIZATION";
  return session.status;
}

/**
 * Traduz uma observacao em status fechado. Nenhum destes vira PASS:
 * ferramenta indisponivel, nao executado, SKIPPED, timeout, sem evidencia.
 */
export function classifyObservation(observation: Observation): SolStatus {
  if (!observation.toolAvailable) return "UNKNOWN";
  if (observation.timedOut) return "UNKNOWN";
  if (observation.skipped) return "UNKNOWN";
  if (!observation.executed) return "UNKNOWN";
  if (!observation.evidence) return "UNKNOWN";
  return observation.passed ? "PASS" : "FAIL";
}

export function isSuccess(status: SolStatus): boolean {
  return status === "PASS";
}

export function canContinue(session: ContinuitySession): boolean {
  return session.anchored !== null && session.status !== "HALT_SEM_ANCORA";
}

/** CONTINUAR EXATAMENTE DALI: retomada usa o ultimo checkpoint ancorado. */
export function resumeFrom(session: ContinuitySession): Checkpoint | null {
  return session.anchored ? session.anchored.checkpoint : null;
}

/** Falha depois do checkpoint volta ao diagnostico sem perder a ancora. */
export function onFailure(
  session: ContinuitySession,
  reason: string,
): ContinuitySession {
  return { ...session, status: "FAIL", blockedReason: reason };
}

function sameAnchor(a: AnchoredCheckpoint | null, b: AnchoredCheckpoint | null): boolean {
  if (a === null && b === null) return true;
  if (a === null || b === null) return false;
  return a.checkpoint.id === b.checkpoint.id && a.order === b.order;
}

/**
 * Uma volta do laco. LEMBRAR traz candidatos; DESCONFIAR impede que a
 * memoria valide; RECALIBRAR recalcula C^+; LOCALIZAR ancora; PROSSEGUIR
 * mede o progresso; estagnacao total fecha em PONTO_FIXO_ATINGIDO.
 */
export function recalibrate(
  session: ContinuitySession,
  incoming: {
    candidates?: readonly Checkpoint[];
    evidence?: readonly Evidence[];
    authorization?: Authorization | null;
    progress?: ProgressMeasure;
  } = {},
): ContinuitySession {
  const candidates = [...session.candidates, ...(incoming.candidates ?? [])];
  const evidence = [...session.evidence, ...(incoming.evidence ?? [])];
  const authorization =
    incoming.authorization !== undefined ? incoming.authorization : session.authorization;
  const progress = incoming.progress ?? session.progress;

  const anchored = locate(candidates, evidence, session.anchored);

  if (!anchored) {
    const missing = candidates
      .filter((candidate) => validateCheckpoint(candidate, evidence) === 0)
      .map((candidate) => candidate.id);
    return {
      ...session,
      candidates,
      evidence,
      authorization,
      progress,
      anchored: null,
      status: "HALT_SEM_ANCORA",
      blockedReason:
        missing.length > 0
          ? `sem ancora externa para: ${missing.join(", ")}`
          : "nenhum checkpoint candidato",
    };
  }

  const verdict = progressVerdict(session.progress, progress);
  const material =
    verdict !== "STAGNANT" ||
    !sameAnchor(session.anchored, anchored) ||
    evidence.length !== session.evidence.length ||
    authorization !== session.authorization;

  return {
    ...session,
    candidates,
    evidence,
    authorization,
    progress,
    anchored,
    status: material ? "UNKNOWN" : "PONTO_FIXO_ATINGIDO",
    blockedReason: material ? undefined : "rodada sem informacao nova",
  };
}

/**
 * Ponte com a maquina de estados acima. null significa "nao force
 * transicao": o status ainda nao decide o estado da interface.
 */
export function stateForStatus(status: SolStatus): SolState | null {
  if (status === "PASS") return "IDLE";
  if (
    status === "FAIL" ||
    status === "BLOCKED" ||
    status === "HALT_SEM_ANCORA" ||
    status === "BLOCKED_AUTHORIZATION"
  ) {
    return "BLOCKED";
  }
  return null;
}
