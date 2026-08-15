#!/usr/bin/env node

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const pexec = promisify(execFile);
const DIR = dirname(fileURLToPath(import.meta.url));
const BASE = dirname(DIR);
const CADEIA_PATH = join(DIR, 'cadeia.json');
const ANDAMENTO = join(BASE, 'missions', 'em-andamento');

export const PERCEPTION_ATTACKS = Object.freeze([
  Object.freeze({
    id: 'A_LOGIC',
    objective: 'Tente quebrar a lógica, premissas, causalidade e contradições da intenção atual.',
  }),
  Object.freeze({
    id: 'B_IMPLEMENTATION',
    objective: 'Tente quebrar a implementação: interfaces, owners, integração, estados e falhas concretas.',
  }),
  Object.freeze({
    id: 'C_REGRESSION_FALSE_GREEN',
    objective: 'Procure regressão, falso verde, prova circular, denominador incompleto e erro mascarado.',
  }),
  Object.freeze({
    id: 'D_SIMPLIFICATION',
    objective: 'Procure simplificação Menos É Mais: remover trabalho, duplicação e complexidade sem perder capacidade.',
  }),
]);

const SYSTEM = `Você é um braço READ_ONLY de percepção da CentralDark.
Sua função é falsificar uma crença por um ângulo específico. Não escreva arquivos, não faça deploy, não proponha autoridade nova e não encerre por votação.
Devolva APENAS JSON válido neste schema:
{"claim":"frase curta","class":"FACT|INFERENCE|HYPOTHESIS|UNKNOWN","evidence_ref":"referência observável ou UNKNOWN","counterexample":"o que quebraria a tese","recommended_test":"teste discriminante read-only ou reversível","material_delta":"delta útil ou NO_CHANGE"}`;

function normalizeText(value) {
  return String(value ?? '').trim().replace(/\s+/g, ' ');
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
      class: ['FACT', 'INFERENCE', 'HYPOTHESIS', 'UNKNOWN'].includes(String(finding.class || '').toUpperCase())
        ? String(finding.class).toUpperCase()
        : 'UNKNOWN',
      evidence_ref: normalizeText(finding.evidence_ref) || 'UNKNOWN',
      counterexample: normalizeText(finding.counterexample),
      recommended_test: normalizeText(finding.recommended_test),
      material_delta: normalizeText(finding.material_delta) || 'NO_CHANGE',
    });
  }
  return output;
}

export function buildPerceptionPacket({ mission, results }) {
  const deduped = dedupePerceptionFindings(results);
  return Object.freeze({
    schema_version: 1,
    mode: 'PARALLEL_PERCEPTION_SERIAL_MUTATION',
    same_intent: true,
    mission: normalizeText(mission).slice(0, 1200),
    parallel_perception: true,
    mutation_allowed: false,
    writer_required_for_mutation: true,
    model_vote_is_truth: false,
    reality_is_judge: true,
    dedupe_required: true,
    results,
    deduped_findings: deduped,
    ready_for_writer: deduped.length > 0,
    next_rule: 'CONFRONT_EVIDENCE_THEN_ONE_CANONICAL_MUTATION',
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
  // readFileSync fica isolado aqui para manter o restante do fluxo assíncrono.
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

export async function runFourAnglePerception({ mission, models = null } = {}) {
  const text = normalizeText(mission);
  if (!text) throw new Error('PERCEPTION_MISSION_REQUIRED');
  const configs = models || activeModels();
  const assignments = assignPerceptionModels(configs);
  const timeoutByModel = new Map((configs || []).map((item) => [item.modelo, item.timeout_ms || 30_000]));
  const results = await Promise.all(assignments.map((assignment) =>
    callPerception(assignment, text, timeoutByModel.get(assignment.model) || 30_000)
  ));
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
