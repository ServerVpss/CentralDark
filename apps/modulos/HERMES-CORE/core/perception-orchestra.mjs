#!/usr/bin/env node

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildCognitiveCouncilPlan,
  evaluateUsefulCeiling,
  validateCognitiveCouncilPlan,
} from './cognitive-council.mjs';

const pexec = promisify(execFile);
const DIR = dirname(fileURLToPath(import.meta.url));
const BASE = dirname(DIR);
const CADEIA_PATH = join(DIR, 'cadeia.json');
const ANDAMENTO = join(BASE, 'missions', 'em-andamento');

export const PERCEPTION_ATTACKS = Object.freeze([
  Object.freeze({ id: 'A_LOGIC', objective: 'Tente quebrar a lógica, premissas, causalidade e contradições da intenção atual.' }),
  Object.freeze({ id: 'B_IMPLEMENTATION', objective: 'Tente quebrar a implementação: interfaces, owners, integração, estados e falhas concretas.' }),
  Object.freeze({ id: 'C_REGRESSION_FALSE_GREEN', objective: 'Procure regressão, falso verde, prova circular, denominador incompleto e erro mascarado.' }),
  Object.freeze({ id: 'D_SIMPLIFICATION', objective: 'Procure simplificação Menos É Mais: remover trabalho, duplicação e complexidade sem perder capacidade.' }),
]);

const REQUIRED_ROLES = Object.freeze(PERCEPTION_ATTACKS.map((item) => item.id));

const SYSTEM = `Você é um braço READ_ONLY de percepção da CentralDark.
Sua função é falsificar uma crença por um ângulo específico. Não escreva arquivos, não faça deploy, não proponha autoridade nova e não encerre por votação.
Devolva APENAS JSON válido neste schema:
{"claim":"frase curta","class":"FACT|INFERENCE|HYPOTHESIS|UNKNOWN","evidence_ref":"referência observável ou UNKNOWN","independence_key":"fonte/failure-mode causal que torna esta evidência independente, ou UNKNOWN","counterexample":"o que quebraria a tese","recommended_test":"teste discriminante read-only ou reversível","material_delta":"delta útil ou NO_CHANGE"}`;

function normalizeText(value) {
  return String(value ?? '').trim().replace(/\s+/g, ' ');
}

function normalizeIndependenceKey(value) {
  const key = normalizeText(value);
  if (!key || key.toUpperCase() === 'UNKNOWN') return 'UNKNOWN';
  return key.toLowerCase();
}

function normalizeClass(value) {
  const classification = String(value || 'UNKNOWN').toUpperCase();
  return ['FACT', 'INFERENCE', 'HYPOTHESIS', 'UNKNOWN'].includes(classification) ? classification : 'UNKNOWN';
}

function isNoChange(finding) {
  return normalizeText(finding?.material_delta).toUpperCase() === 'NO_CHANGE';
}

function isProvenMaterialFinding(finding) {
  return !isNoChange(finding)
    && normalizeClass(finding?.class) === 'FACT'
    && (normalizeText(finding?.evidence_ref) || 'UNKNOWN').toUpperCase() !== 'UNKNOWN';
}

function addCluster(map, key, role) {
  const roles = map.get(key) || [];
  roles.push(role);
  map.set(key, roles);
}

function extractJson(text) {
  const raw = String(text || '').trim();
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start < 0 || end < start) throw new Error('PERCEPTION_JSON_NOT_FOUND');
  return JSON.parse(raw.slice(start, end + 1));
}

function modelName(value) {
  return normalizeText(typeof value === 'string' ? value : value?.modelo);
}

export function enrichPerceptionMission(mission, proposalB64 = process.env.HERMES_PERCEPTION_PROPOSAL_B64 || '') {
  const base = normalizeText(mission);
  if (!proposalB64) return base;
  try {
    const proposal = JSON.parse(Buffer.from(String(proposalB64), 'base64url').toString('utf8'));
    const safe = {
      ferramenta: normalizeText(proposal?.ferramenta),
      scope_key: normalizeText(proposal?.scope_key),
      estado: normalizeText(proposal?.estado),
      etapa_titulo: normalizeText(proposal?.etapa_titulo).slice(0, 120),
      pensamento: normalizeText(proposal?.pensamento).slice(0, 500),
    };
    return `${base}\n\nPROPOSTA MATERIAL A SER CONTRAPROVADA:\n${JSON.stringify(safe)}`;
  } catch {
    return `${base}\n\nPROPOSTA MATERIAL A SER CONTRAPROVADA: UNKNOWN_PROPOSAL_ENCODING`;
  }
}

export function assignPerceptionModels(models, attacks = PERCEPTION_ATTACKS) {
  const pool = (Array.isArray(models) ? models : [])
    .map(modelName)
    .filter(Boolean);
  if (!pool.length) throw new Error('PERCEPTION_MODEL_POOL_EMPTY');
  return attacks.map((attack, index) => Object.freeze({
    ...attack,
    model: pool[index % pool.length],
    independence: pool.length >= attacks.length ? 'ROLE_AND_PROVIDER_DIVERSE' : 'ROLE_DIVERSE_PROVIDER_REUSE',
  }));
}

export function selectFallbackModel(configs, usedModels = []) {
  const used = new Set((Array.isArray(usedModels) ? usedModels : []).map(normalizeText).filter(Boolean));
  for (const item of Array.isArray(configs) ? configs : []) {
    const candidate = modelName(item);
    if (candidate && !used.has(candidate)) return candidate;
  }
  return null;
}

export function dedupePerceptionFindings(results) {
  const seen = new Set();
  const output = [];
  for (const item of Array.isArray(results) ? results : []) {
    if (item?.status !== 'OK' || !item.finding) continue;
    const finding = item.finding;
    const key = `${normalizeText(finding.claim).toLowerCase()}|${normalizeText(finding.recommended_test).toLowerCase()}`;
    if (!key.replace('|', '')) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    output.push({
      role: item.role,
      model: item.model,
      independence: item.independence,
      claim: normalizeText(finding.claim),
      class: normalizeClass(finding.class),
      evidence_ref: normalizeText(finding.evidence_ref) || 'UNKNOWN',
      independence_key: normalizeIndependenceKey(finding.independence_key),
      counterexample: normalizeText(finding.counterexample),
      recommended_test: normalizeText(finding.recommended_test),
      material_delta: normalizeText(finding.material_delta) || 'NO_CHANGE',
    });
  }
  return output;
}

export function confrontPerceptionEvidence(results) {
  const items = Array.isArray(results) ? results : [];
  const successfulRoles = new Set(
    items.filter((item) => item?.status === 'OK' && item.finding)
      .map((item) => item.role)
      .filter((role) => REQUIRED_ROLES.includes(role)),
  );
  const missingRoles = REQUIRED_ROLES.filter((role) => !successfulRoles.has(role));
  const failedRoles = REQUIRED_ROLES.filter((role) => items.some((item) => item?.role === role && item?.status !== 'OK'));
  const independenceClusters = new Map();
  const evidenceClusters = new Map();
  const unprovenRoles = [];
  const tests = [];

  for (const item of items) {
    if (item?.status !== 'OK' || !item.finding || !REQUIRED_ROLES.includes(item.role)) continue;
    const finding = item.finding;
    const provenMaterial = isProvenMaterialFinding(finding);
    if (!isNoChange(finding) && !provenMaterial) unprovenRoles.push(item.role);

    const independenceKey = normalizeIndependenceKey(finding.independence_key);
    const evidenceRef = normalizeText(finding.evidence_ref) || 'UNKNOWN';
    if (provenMaterial) {
      if (independenceKey !== 'UNKNOWN') addCluster(independenceClusters, independenceKey, item.role);
      addCluster(evidenceClusters, evidenceRef.toLowerCase(), item.role);
    }

    const recommendedTest = normalizeText(finding.recommended_test);
    if (recommendedTest && !tests.includes(recommendedTest)) tests.push(recommendedTest);
  }

  const correlatedByIndependence = [...independenceClusters.entries()]
    .filter(([, roles]) => roles.length > 1)
    .map(([value, roles]) => ({ basis: 'independence_key', value, roles }));
  const correlatedByEvidence = [...evidenceClusters.entries()]
    .filter(([, roles]) => roles.length > 1)
    .map(([value, roles]) => ({ basis: 'evidence_ref', value, roles }));
  const allFourCompleted = missingRoles.length === 0 && successfulRoles.size === REQUIRED_ROLES.length;
  const effectiveIndependentCount = Math.min(independenceClusters.size, evidenceClusters.size);
  const uniqueUnprovenRoles = [...new Set(unprovenRoles)];

  return Object.freeze({
    required_roles: [...REQUIRED_ROLES],
    successful_roles: [...successfulRoles],
    failed_roles: failedRoles,
    missing_roles: missingRoles,
    all_four_completed: allFourCompleted,
    explicit_independence_keys: [...independenceClusters.keys()],
    explicit_evidence_refs: [...evidenceClusters.keys()],
    effective_independent_count: effectiveIndependentCount,
    correlated_clusters: [...correlatedByIndependence, ...correlatedByEvidence],
    unproven_roles: uniqueUnprovenRoles,
    discriminating_tests: tests,
    confidence_can_increase: allFourCompleted && uniqueUnprovenRoles.length === 0 && effectiveIndependentCount >= 2,
    four_answers_are_four_proofs: false,
    correlated_evidence_inflation_blocked: true,
  });
}

function collectRawUnprovenFindings(results) {
  return (Array.isArray(results) ? results : [])
    .filter((item) => item?.status === 'OK' && item.finding)
    .filter((item) => !isNoChange(item.finding) && !isProvenMaterialFinding(item.finding))
    .map((item) => ({
      role: item.role,
      claim: normalizeText(item.finding.claim),
      class: normalizeClass(item.finding.class),
      evidence_ref: normalizeText(item.finding.evidence_ref) || 'UNKNOWN',
      recommended_test: normalizeText(item.finding.recommended_test),
      material_delta: normalizeText(item.finding.material_delta),
    }));
}

function perceptionCeilingGaps(results, confrontation, materialFindings) {
  const byRole = new Map((Array.isArray(results) ? results : []).map((item) => [item?.role, item]));
  const gaps = [];

  for (const role of REQUIRED_ROLES) {
    const item = byRole.get(role);
    if (!item || item.status !== 'OK' || !item.finding) {
      gaps.push({ id: `perception:${role}`, state: 'OPEN' });
      continue;
    }

    const finding = item.finding;
    const evidenceRef = normalizeText(finding.evidence_ref) || 'UNKNOWN';
    if (isNoChange(finding)) {
      if (normalizeClass(finding.class) === 'FACT' && evidenceRef.toUpperCase() !== 'UNKNOWN') {
        gaps.push({ id: `perception:${role}`, state: 'RESOLVED', evidence_refs: [evidenceRef] });
      } else {
        gaps.push({ id: `perception:${role}`, state: 'UNKNOWN' });
      }
      continue;
    }

    if (isProvenMaterialFinding(finding)) {
      gaps.push({
        id: `perception:${role}:material-delta`,
        state: 'OPEN',
        evidence_refs: [evidenceRef],
      });
    } else {
      gaps.push({ id: `perception:${role}`, state: 'UNKNOWN' });
    }
  }

  if (confrontation.unproven_roles.length > 0) {
    for (const role of confrontation.unproven_roles) {
      if (!gaps.some((gap) => gap.id === `perception:${role}` && gap.state === 'UNKNOWN')) {
        gaps.push({ id: `perception:${role}`, state: 'UNKNOWN' });
      }
    }
  }

  if (materialFindings.length > 0) {
    gaps.push({
      id: 'writer:material-delta',
      state: 'OPEN',
      evidence_refs: materialFindings.map((item) => item.evidence_ref).filter(Boolean),
    });
  }

  return gaps;
}

export function buildPerceptionPacket({ mission, results }) {
  const deduped = dedupePerceptionFindings(results);
  const confrontation = confrontPerceptionEvidence(results);
  const materialFindings = deduped.filter((item) => (
    item.material_delta.toUpperCase() !== 'NO_CHANGE'
    && item.class === 'FACT'
    && item.evidence_ref.toUpperCase() !== 'UNKNOWN'
  ));
  const unprovenFindings = collectRawUnprovenFindings(results);
  const readyForWriter = confrontation.all_four_completed
    && confrontation.unproven_roles.length === 0
    && unprovenFindings.length === 0
    && materialFindings.length > 0;

  const cognitiveCouncil = buildCognitiveCouncilPlan();
  const councilValidation = validateCognitiveCouncilPlan(cognitiveCouncil);
  if (!councilValidation.ok) {
    throw new Error(`COGNITIVE_COUNCIL_INVALID:${councilValidation.errors.join(',')}`);
  }
  const usefulCeiling = evaluateUsefulCeiling({
    gaps: perceptionCeilingGaps(results, confrontation, materialFindings),
    new_information: false,
    material_delta_pending: materialFindings.length > 0,
  });

  let nextRule = 'CONFRONT_EVIDENCE_THEN_ONE_CANONICAL_MUTATION';
  if (!confrontation.all_four_completed) nextRule = 'RETRY_MISSING_PERCEPTIONS_BEFORE_MUTATION';
  else if (confrontation.unproven_roles.length > 0 || unprovenFindings.length > 0) nextRule = 'RUN_DISCRIMINATING_TEST_BEFORE_MUTATION';
  else if (materialFindings.length === 0) nextRule = 'NO_MATERIAL_DELTA_NO_MUTATION';

  return Object.freeze({
    schema_version: 2,
    mode: 'PARALLEL_PERCEPTION_SERIAL_MUTATION',
    same_intent: true,
    mission: normalizeText(mission).slice(0, 1200),
    parallel_perception: true,
    mutation_allowed: false,
    canonical_mutation_slots: readyForWriter ? 1 : 0,
    writer_required_for_mutation: true,
    model_vote_is_truth: false,
    reality_is_judge: true,
    dedupe_required: true,
    correlated_evidence_inflation_blocked: true,
    counterproof_required: true,
    gold_requires_counterproof: true,
    cognitive_council: cognitiveCouncil,
    useful_ceiling: usefulCeiling,
    results,
    deduped_findings: deduped,
    material_findings: materialFindings,
    unproven_findings: unprovenFindings,
    evidence_confrontation: confrontation,
    ready_for_writer: readyForWriter,
    next_rule: nextRule,
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
    } catch (error) {
      console.warn('PERCEPTION_STATE_READ_FAILED', {
        state_path: join(dir, 'state.json'),
        error: error instanceof Error ? error.message : String(error),
      });
    }
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

async function callPerception(assignment, mission, timeoutMs, attempt = 1) {
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
      attempt,
      elapsed_ms: Date.now() - t0,
      finding: extractJson(stdout),
    };
  } catch (error) {
    return {
      role: assignment.id,
      model: assignment.model,
      independence: assignment.independence,
      status: 'FAILED',
      attempt,
      elapsed_ms: Date.now() - t0,
      error: normalizeText(error?.message).slice(0, 240),
      finding: null,
    };
  }
}

async function runWithMissingOnlyFallback(assignments, configs, mission, timeoutByModel) {
  const results = await Promise.all(assignments.map((assignment) =>
    callPerception(assignment, mission, timeoutByModel.get(assignment.model) || 30_000, 1)
  ));
  const usedByRole = new Map(assignments.map((assignment) => [assignment.id, new Set([assignment.model])]));
  const maxFallbackRounds = Math.min(2, Math.max(0, (configs || []).length - 1));

  for (let round = 1; round <= maxFallbackRounds; round += 1) {
    const failedIndexes = results
      .map((result, index) => result?.status === 'OK' ? -1 : index)
      .filter((index) => index >= 0);
    if (failedIndexes.length === 0) break;

    const retries = await Promise.all(failedIndexes.map(async (index) => {
      const original = assignments[index];
      const used = usedByRole.get(original.id) || new Set([original.model]);
      const fallbackModel = selectFallbackModel(configs, [...used]);
      if (!fallbackModel) return { index, result: results[index] };
      used.add(fallbackModel);
      usedByRole.set(original.id, used);
      const retryAssignment = { ...original, model: fallbackModel, independence: 'ROLE_DIVERSE_PROVIDER_FALLBACK' };
      return {
        index,
        result: await callPerception(retryAssignment, mission, timeoutByModel.get(fallbackModel) || 30_000, round + 1),
      };
    }));

    for (const retry of retries) results[retry.index] = retry.result;
  }
  return results;
}

export async function runFourAnglePerception({ mission, models = null } = {}) {
  const text = enrichPerceptionMission(mission);
  if (!text) throw new Error('PERCEPTION_MISSION_REQUIRED');
  const configs = models || activeModels();
  const assignments = assignPerceptionModels(configs);
  const timeoutByModel = new Map((configs || []).map((item) => [modelName(item), item?.timeout_ms || 30_000]));
  const results = await runWithMissingOnlyFallback(assignments, configs, text, timeoutByModel);
  return buildPerceptionPacket({ mission: text, results });
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
