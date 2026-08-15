#!/usr/bin/env node

import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { promisify } from 'node:util';
import { readFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ATTACK_PROFILES,
  PROTOCOL,
  buildPerceptionPlan,
  convergePerceptions,
} from '../../../../scripts/controlled-dissonance.mjs';

const pexec = promisify(execFile);
const DIR = dirname(fileURLToPath(import.meta.url));
const BASE = dirname(DIR);
const REPO = join(DIR, '..', '..', '..', '..');
const CADEIA_PATH = join(DIR, 'cadeia.json');
const ANDAMENTO = join(BASE, 'missions', 'em-andamento');

export const PERCEPTION_ATTACKS = Object.freeze(
  ATTACK_PROFILES.map((profile) => Object.freeze({
    id: profile.id,
    objective: profile.objective,
  })),
);

const REQUIRED_ROLES = Object.freeze(PERCEPTION_ATTACKS.map((item) => item.id));

const SYSTEM = `Você é um braço READ_ONLY de percepção da CentralDark.
Sua função é falsificar uma crença por um ângulo específico. Não escreva arquivos, não faça deploy, não proponha autoridade nova e não encerre por votação.
Devolva APENAS JSON válido neste schema:
{"claim":"frase curta","class":"FACT|INFERENCE|HYPOTHESIS|UNKNOWN","evidence_ref":"referência observável ou UNKNOWN","independence_key":"fonte/failure-mode causal que torna esta evidência independente, ou UNKNOWN","counterexample":"o que quebraria a tese","recommended_test":"teste discriminante read-only ou reversível","material_delta":"delta útil ou NO_CHANGE"}`;

function normalizeText(value) {
  return String(value ?? '').trim().replace(/\s+/g, ' ');
}

function digest(value) {
  return createHash('sha256').update(String(value ?? '')).digest('hex');
}

function extractJson(text) {
  const raw = String(text || '').trim();
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start < 0 || end < start) throw new Error('PERCEPTION_JSON_NOT_FOUND');
  return JSON.parse(raw.slice(start, end + 1));
}

export function assignPerceptionModels(models, attacks = PERCEPTION_ATTACKS) {
  const pool = (Array.isArray(models) ? models : [])
    .map((item) => typeof item === 'string' ? item : item?.modelo)
    .map(normalizeText)
    .filter(Boolean);
  if (!pool.length) throw new Error('PERCEPTION_MODEL_POOL_EMPTY');
  return attacks.map((attack, index) => Object.freeze({
    ...attack,
    model: pool[index % pool.length],
    independence: pool.length >= attacks.length ? 'ROLE_AND_PROVIDER_DIVERSE' : 'ROLE_DIVERSE_PROVIDER_REUSE',
  }));
}

export function buildKernelState({ mission, head, assignments = [] }) {
  const text = normalizeText(mission);
  const observedHead = normalizeText(head);
  if (!text) throw new Error('PERCEPTION_MISSION_REQUIRED');
  if (!observedHead) throw new Error('PERCEPTION_HEAD_REQUIRED');
  const key = digest(text).slice(0, 20);
  const agents = PERCEPTION_ATTACKS.map((attack, index) => {
    const assignment = assignments[index];
    const model = normalizeText(assignment?.model) || 'provider-unknown';
    return `hermes-${attack.id.toLowerCase()}-${index}-${digest(model).slice(0, 8)}`;
  });
  return {
    mission_id: `HERMES-DISSONANCE-${key}`,
    intent_id: `INTENT-${key}`,
    material_id: `MATERIAL-${key}`,
    head: { sha: observedHead },
    trail: { route_id: `TRAIL-${key}` },
    scope: { allowed: ['repo:read'], denied: ['repo:write'] },
    writer: { agent: 'hermes' },
    writer_scope: `mission:${key}`,
    coordinator: 'sol',
    perception_agents: agents,
  };
}

function toKernelReceipt(result, state) {
  const finding = result?.finding || {};
  const materialDelta = normalizeText(finding.material_delta) || 'NO_CHANGE';
  const evidenceRef = normalizeText(finding.evidence_ref) || 'UNKNOWN';
  const independenceKey = normalizeText(finding.independence_key) || 'UNKNOWN';
  const claim = normalizeText(finding.claim);
  const classification = String(finding.class || 'UNKNOWN').toUpperCase();
  const noChange = materialDelta.toUpperCase() === 'NO_CHANGE';
  const hasEvidence = evidenceRef.toUpperCase() !== 'UNKNOWN';
  const verdict = noChange ? 'NO_CHANGE' : (hasEvidence && classification !== 'UNKNOWN' ? 'MATERIAL' : 'UNKNOWN');

  return {
    protocol: PROTOCOL,
    attack_profile: result.role,
    observer: `hermes-${String(result.role || '').toLowerCase()}`,
    intent_id: state.intent_id,
    material_id: state.material_id,
    observed_head: state.head.sha,
    writer_scope: state.writer_scope,
    read_only: true,
    write_performed: false,
    findings: [{
      wound: claim || result.role,
      claim: claim || (noChange ? null : `UNKNOWN:${result.role}`),
      verdict,
      evidence_refs: hasEvidence ? [evidenceRef] : [],
      evidence_cluster: independenceKey.toUpperCase() === 'UNKNOWN' ? 'cluster:unproven' : independenceKey,
      proposed_correction: noChange ? null : materialDelta,
    }],
  };
}

function blockedPacket({ mission, results, state, plan, failedRoles, status }) {
  return Object.freeze({
    schema_version: 3,
    protocol: PROTOCOL,
    mode: 'PARALLEL_PERCEPTION_SERIAL_MUTATION',
    same_intent: true,
    mission: normalizeText(mission).slice(0, 1200),
    observed_head: state.head.sha,
    parallel_perception: true,
    mutation_allowed: false,
    canonical_mutation_slots: 0,
    writer_required_for_mutation: true,
    model_vote_is_truth: false,
    reality_is_judge: true,
    kernel_plan_status: plan?.status || 'UNKNOWN',
    kernel_convergence: { status, accepted: false },
    results,
    failed_roles: failedRoles,
    deduped_findings: [],
    serial_mutation_queue: [],
    ready_for_writer: false,
    next_rule: 'RETRY_FAILED_PERCEPTIONS_BEFORE_MUTATION',
  });
}

export function buildPerceptionPacket({ mission, results, head = 'TEST_HEAD', assignments = [] }) {
  const state = buildKernelState({ mission, head, assignments });
  const plan = buildPerceptionPlan(state);
  if (plan.accepted !== true) {
    return blockedPacket({
      mission,
      results,
      state,
      plan,
      failedRoles: [...REQUIRED_ROLES],
      status: plan.status,
    });
  }

  const resultList = Array.isArray(results) ? results : [];
  const successfulRoles = new Set(
    resultList
      .filter((item) => item?.status === 'OK' && item.finding)
      .map((item) => item.role),
  );
  const failedRoles = REQUIRED_ROLES.filter((role) => !successfulRoles.has(role));
  if (failedRoles.length > 0 || resultList.length !== REQUIRED_ROLES.length) {
    return blockedPacket({
      mission,
      results: resultList,
      state,
      plan,
      failedRoles,
      status: 'BLOCKED_FOUR_PERCEPTIONS_REQUIRED',
    });
  }

  const receipts = resultList.map((result) => toKernelReceipt(result, state));
  const convergence = convergePerceptions(state, receipts);
  const readyForWriter = convergence.accepted === true && convergence.status === 'READY_SINGLE_WRITER_MUTATION';
  const noMaterialDelta = convergence.accepted === true && convergence.status === 'NO_MATERIAL_DELTA';

  return Object.freeze({
    schema_version: 3,
    protocol: PROTOCOL,
    mode: 'PARALLEL_PERCEPTION_SERIAL_MUTATION',
    same_intent: true,
    mission: normalizeText(mission).slice(0, 1200),
    observed_head: state.head.sha,
    parallel_perception: true,
    mutation_allowed: false,
    canonical_mutation_slots: readyForWriter ? 1 : 0,
    writer_required_for_mutation: true,
    writer: state.writer.agent,
    writer_scope: state.writer_scope,
    model_vote_is_truth: false,
    reality_is_judge: true,
    dedupe_required: true,
    correlated_evidence_inflation_blocked: true,
    counterproof_required: true,
    gold_requires_counterproof: true,
    kernel_plan_status: plan.status,
    kernel_convergence: convergence,
    results: resultList,
    failed_roles: [],
    deduped_findings: convergence.deduped_findings || [],
    serial_mutation_queue: convergence.canonical_mutations || [],
    ready_for_writer: readyForWriter,
    next_rule: readyForWriter
      ? 'SERIALIZE_CANONICAL_MUTATIONS_ONE_AT_A_TIME'
      : noMaterialDelta
        ? 'NO_MATERIAL_DELTA_NO_MUTATION'
        : 'BLOCK_MUTATION_UNTIL_KERNEL_ACCEPTS_CONVERGENCE',
  });
}

function activeModels() {
  const data = JSON.parse(requireText(CADEIA_PATH));
  return (data.cadeia || [])
    .filter((item) => item?.ativo !== false)
    .filter((item) => !['elite-anthropic', 'centraldark-gateway'].includes(String(item?.via || '').toLowerCase()))
    .map((item) => ({ modelo: item.modelo, timeout_ms: Math.max(5000, Number(item.timeout_s || 30) * 1000) }))
    .filter((item) => item.modelo);
}

function requireText(path) {
  try {
    return requireTextSync(path);
  } catch (error) {
    throw new Error(`PERCEPTION_READ_FAILED:${path}:${error.message}`);
  }
}

function requireTextSync(path) {
  return globalThis.process.getBuiltinModule('fs').readFileSync(path, 'utf8');
}

async function discoverActiveMission() {
  if (!existsSync(ANDAMENTO)) throw new Error('ACTIVE_MISSION_DIR_MISSING');
  const candidates = [];
  for (const name of await readdir(ANDAMENTO)) {
    const dir = join(ANDAMENTO, name);
    const info = await stat(dir).catch(() => null);
    if (!info?.isDirectory()) continue;
    const missionPath = join(dir, 'missao.md');
    if (!existsSync(missionPath)) continue;
    let terminal = 'UNKNOWN';
    try {
      const state = JSON.parse(await readFile(join(dir, 'state.json'), 'utf8'));
      terminal = String(state?.terminal_state || 'RUNNING').toUpperCase();
    } catch {}
    candidates.push({ missionPath, terminal, mtime: info.mtimeMs });
  }
  const running = candidates.filter((item) => !['DONE', 'COMPLETED', 'BLOCKED', 'FAILED'].includes(item.terminal));
  const pool = running.length ? running : candidates;
  if (!pool.length) throw new Error('ACTIVE_MISSION_NOT_FOUND');
  pool.sort((a, b) => b.mtime - a.mtime);
  if (running.length > 1 && running[0].mtime === running[1].mtime) throw new Error('ACTIVE_MISSION_AMBIGUOUS');
  return pool[0].missionPath;
}

function perceptionPrompt(mission, assignment) {
  return [
    `INTENÇÃO ÚNICA: ${normalizeText(mission).slice(0, 8000)}`,
    `ÂNGULO ${assignment.id}: ${assignment.objective}`,
    'Você é percepção somente. Não muta o alvo. Não trate concordância entre modelos como prova.',
    'Indique independence_key somente quando conseguir nomear a fonte ou failure-mode causal que torna a evidência independente; caso contrário use UNKNOWN.',
    'Procure uma evidência ou teste que possa derrubar a crença. Se não houver delta, material_delta=NO_CHANGE.',
  ].join('\n\n');
}

async function callPerception(assignment, mission, timeoutMs) {
  const t0 = Date.now();
  try {
    const { stdout } = await pexec('darkai', ['--model', assignment.model, '--system', SYSTEM, perceptionPrompt(mission, assignment)], {
      env: { ...process.env },
      maxBuffer: 2 * 1024 * 1024,
      timeout: timeoutMs,
    });
    return {
      role: assignment.id,
      model: assignment.model,
      independence: assignment.independence,
      status: 'OK',
      elapsed_ms: Date.now() - t0,
      finding: extractJson(stdout),
    };
  } catch (error) {
    return {
      role: assignment.id,
      model: assignment.model,
      independence: assignment.independence,
      status: 'FAILED',
      elapsed_ms: Date.now() - t0,
      error: normalizeText(error?.message).slice(0, 240),
      finding: null,
    };
  }
}

async function resolveHead() {
  const { stdout } = await pexec('git', ['rev-parse', 'HEAD'], {
    cwd: REPO,
    maxBuffer: 64 * 1024,
    timeout: 5000,
  });
  const head = normalizeText(stdout);
  if (!head) throw new Error('PERCEPTION_HEAD_UNAVAILABLE');
  return head;
}

export async function runFourAnglePerception({ mission, models = null } = {}) {
  const text = normalizeText(mission);
  if (!text) throw new Error('PERCEPTION_MISSION_REQUIRED');
  const configs = models || activeModels();
  const assignments = assignPerceptionModels(configs);
  const timeoutByModel = new Map((configs || []).map((item) => [item.modelo, item.timeout_ms || 30_000]));
  const head = await resolveHead();
  const results = await Promise.all(assignments.map((assignment) =>
    callPerception(assignment, text, timeoutByModel.get(assignment.model) || 30_000)
  ));
  return buildPerceptionPacket({ mission: text, results, head, assignments });
}

async function main() {
  const args = process.argv.slice(2);
  let mission = '';
  const inlineAt = args.indexOf('--mission');
  if (inlineAt >= 0 && args[inlineAt + 1]) mission = args[inlineAt + 1];
  if (!mission || args.includes('--active-mission')) {
    const missionPath = await discoverActiveMission();
    mission = await readFile(missionPath, 'utf8');
  }
  const packet = await runFourAnglePerception({ mission });
  process.stdout.write(`${JSON.stringify(packet, null, 2)}\n`);
  if (!packet.ready_for_writer) process.exitCode = 2;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(`PERCEPTION_ORCHESTRA_BLOCKED=${normalizeText(error?.message || error)}`);
    process.exitCode = 1;
  });
}
