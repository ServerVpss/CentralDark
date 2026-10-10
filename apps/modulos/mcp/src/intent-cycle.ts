/* CentralDark — tipagem e reconciliacao do ciclo existente. Nenhum segundo executor. */
export type IntentMode = 'AUTONOMO' | 'AUTOMATICO' | 'COM_CRITERIOS';
export type ProofStatus = 'PASS' | 'FAIL' | 'UNKNOWN' | 'BLOCKED' | 'STALE';
export type CycleState = 'RECEIVED' | 'RECONCILING' | 'REUSE' | 'PLANNING' | 'VERIFYING' | 'REPAIRING' | 'SEALED' | 'NEXT_CURSOR' | 'BLOCKED';

export interface IntentInput {
  intent: string;
  mode: IntentMode;
  owner: string;
  goalId?: string;
  criteria?: string[];
  maxIterations?: number;
}
export interface Evidence {
  status: ProofStatus;
  source: string;
  observedAt: string;
  sha?: string;
  receipt?: string;
}
export interface Criterion {
  id: string;
  label: string;
  mandatory: true;
  status: ProofStatus;
  evidence?: Evidence;
}
export interface MeasuredWorld {
  observedAt: string;
  headSha: string | null;
  evidence: Record<string, Evidence>;
}
export interface CycleReceipt {
  schema: 'centraldark.intent.fixed-point.v1';
  fingerprint: string;
  intent: string;
  mode: IntentMode;
  goalId: string | null;
  owner: string;
  currentHead: string | null;
  observedAt: string;
  state: CycleState;
  fixedPoint: boolean;
  criteria: Criterion[];
  nextCursor: string;
  reused: boolean;
  action: 'REUSE_PROOF' | 'READ_ONLY_PROBE' | 'HANDOFF_HERMES' | 'WAIT_FOR_EVIDENCE';
  attemptsLimit: number;
  proofBoundary: string;
}
const SHA = /^[a-f0-9]{40}$/i;
const MODES: readonly IntentMode[] = ['AUTONOMO', 'AUTOMATICO', 'COM_CRITERIOS'];
const SAFE_OWNER = /^[a-zA-Z0-9_.\/-]{1,240}$/;
const DEFAULT_CRITERIA = ['SOURCE_CURRENT', 'MCP_HEALTH', 'ONE_HEART', 'OBJECTIVE_EFFECT'];
const labels: Record<string, string> = {
  SOURCE_CURRENT: 'SHA do checkout real medido',
  MCP_HEALTH: 'API MCP respondeu com prova verificavel',
  ONE_HEART: 'Heartbeat atual e valido',
  RECEIPT: 'Receipt pertinente e valido para este SHA',
  OBJECTIVE_EFFECT: 'Efeito da intencao confirmado pelo Critic no mesmo fingerprint',
  CI_SAME_SHA: 'CI comprovado no mesmo SHA',
  HERMES_RUNTIME: 'Runtime Hermes medido',
  NEUROLINK: 'NeuroLink validado por gerador',
  LOG_FUNNEL: 'Funil de logs verificado',
  HUD: 'HUD atual vinculado a prova'
};
export const CRITERIA_IDS = Object.freeze(Object.keys(labels));
function normalizedText(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().replace(/[\u0000-\u001f]+/g, ' ').slice(0, max) : '';
}
export function compileIntent(value: unknown): IntentInput {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('INTENT_OBJECT_REQUIRED');
  const raw = value as Record<string, unknown>;
  const intent = normalizedText(raw.intent, 4000);
  if (intent.length < 8) throw new Error('INTENT_TOO_SHORT');
  const mode = raw.mode || 'COM_CRITERIOS';
  if (!MODES.includes(mode as IntentMode)) throw new Error('MODE_INVALID');
  const owner = normalizedText(raw.owner, 240);
  if (!SAFE_OWNER.test(owner) || owner.includes('..') || owner.startsWith('/')) throw new Error('OWNER_INVALID');
  const userCriteria = raw.criteria;
  if (userCriteria !== undefined && (!Array.isArray(userCriteria) || userCriteria.length > 30 || userCriteria.some(c => typeof c !== 'string'))) throw new Error('CRITERIA_INVALID');
  const inferred = [...DEFAULT_CRITERIA];
  if (/\b(ci|pipeline|workflow|github actions)\b/i.test(intent)) inferred.push('CI_SAME_SHA');
  if (/hermes|worker|goal|kanban/i.test(intent)) inferred.push('HERMES_RUNTIME');
  if (/neuro|linhagem|aprendizado|memoria|lembranca/i.test(intent)) inferred.push('NEUROLINK');
  if (/log|funil|coletor/i.test(intent)) inferred.push('LOG_FUNNEL');
  if (/hud|painel|obsidian/i.test(intent)) inferred.push('HUD');
  const criteria = [...new Set((userCriteria as string[] | undefined || inferred).map(v => v.trim().toUpperCase()))];
  if (criteria.length === 0 || criteria.some(c => !/^[A-Z][A-Z0-9_]{2,63}$/.test(c))) throw new Error('CRITERIA_ID_INVALID');
  const goalId = normalizedText(raw.goalId, 80);
  if (goalId && !/^t_[a-f0-9]{8}$/i.test(goalId)) throw new Error('GOAL_ID_INVALID');
  const maxIterations = raw.maxIterations === undefined ? 8 : Number(raw.maxIterations);
  if (!Number.isInteger(maxIterations) || maxIterations < 1 || maxIterations > 30) throw new Error('ITERATION_BUDGET_INVALID');
  return { intent, mode: mode as IntentMode, owner, goalId: goalId || undefined, criteria, maxIterations };
}
function evidenceIsValid(id: string, evidence: Evidence | undefined, measured: MeasuredWorld): boolean {
  if (!evidence || !evidence.source || !evidence.observedAt) return false;
  const at = Date.parse(evidence.observedAt);
  const now = Date.parse(measured.observedAt);
  if (!Number.isFinite(at) || !Number.isFinite(now) || at > now + 5000 || now - at > 15 * 60_000) return false;
  if (id !== 'SOURCE_CURRENT' && !evidence.sha) return false;
  if (evidence.sha && (!SHA.test(evidence.sha) || evidence.sha !== measured.headSha)) return false;
  if ((id === 'RECEIPT' || id === 'OBJECTIVE_EFFECT') && !evidence.receipt) return false;
  return true;
}
export function assessCriteria(input: IntentInput, measured: MeasuredWorld): Criterion[] {
  return (input.criteria || DEFAULT_CRITERIA).map(id => {
    const evidence = measured.evidence[id];
    let status: ProofStatus = evidence?.status || 'UNKNOWN';
    if (!evidenceIsValid(id, evidence, measured)) status = evidence ? 'STALE' : 'UNKNOWN';
    if (id === 'SOURCE_CURRENT' && !SHA.test(measured.headSha || '')) status = 'UNKNOWN';
    return { id, label: labels[id] || id, mandatory: true as const, status, ...(evidence ? { evidence } : {}) };
  });
}
export function reconcileIntent(input: IntentInput, measured: MeasuredWorld, fingerprint: string, previous?: CycleReceipt | null): CycleReceipt {
  const criteria = assessCriteria(input, measured);
  const fixedPoint = criteria.length > 0 && criteria.every(c => c.status === 'PASS');
  const previousPass = previous?.fingerprint === fingerprint && previous?.currentHead === measured.headSha && previous?.fixedPoint === true;
  const reused = fixedPoint && previousPass;
  const first = criteria.find(c => c.status !== 'PASS');
  const nextCursor = fixedPoint ? 'FIXED_POINT' : (first ? 'VERIFY_' + first.id : 'CRITERIA_EMPTY');
  const state: CycleState = fixedPoint ? 'SEALED' : first?.status === 'BLOCKED' ? 'BLOCKED' : 'NEXT_CURSOR';
  const action: CycleReceipt['action'] = reused ? 'REUSE_PROOF' : fixedPoint ? 'WAIT_FOR_EVIDENCE' : input.mode === 'AUTONOMO' ? 'HANDOFF_HERMES' : 'READ_ONLY_PROBE';
  return {
    schema: 'centraldark.intent.fixed-point.v1', fingerprint,
    intent: input.intent, mode: input.mode, owner: input.owner, goalId: input.goalId || null,
    currentHead: measured.headSha, observedAt: measured.observedAt, state, fixedPoint,
    criteria, nextCursor, reused, action, attemptsLimit: input.maxIterations || 8,
    proofBoundary: 'STATE_IS_MEASURED; PROPOSAL_IS_NOT_EXECUTION; DOCUMENTED_IS_NOT_DEPLOYED; UNKNOWN_IS_NOT_PASS'
  };
}
