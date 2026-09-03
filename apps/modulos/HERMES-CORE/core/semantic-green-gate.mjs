#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..', '..', '..', '..');

const CONTRACT_PATH = 'docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/SEMANTIC-GREEN-GATE.yml';
const AUREOLA_PATH = 'docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/AUREOLA-BAHIA-BIBLICA.yml';
const STITCH_PATH = 'docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/NOTE-STITCHING-CONTRACT.yml';

const STYLE_ALLOWED = new Set(['BAIANES_FACIL', 'PTBR_TECNICO_DIRETO']);

const VERSE_REGISTRY = new Map([
  ['1Ts 5:21', 'EXAMINE_EVERYTHING_KEEP_WHAT_IS_GOOD'],
  ['1Co 14:40', 'ORDER_NOT_CONFUSION'],
  ['Pv 4:23', 'GUARD_THE_SOURCE'],
  ['Ec 3:6', 'KEEP_AND_RELEASE_AT_THE_RIGHT_TIME'],
  ['Pv 15:22', 'COUNSEL_STABILIZES_PLANS'],
  ['Lc 14:28', 'COUNT_COST_BEFORE_BUILDING'],
  ['Mt 7:16', 'RESULT_REVEALS_TREE'],
  ['Tg 2:17', 'WORD_WITHOUT_ACTION_IS_INCOMPLETE'],
  ['Dt 19:15', 'SINGLE_WITNESS_IS_NOT_ENOUGH_FOR_JUDGMENT'],
  ['Pv 4:18', 'LIGHT_INCREASES_ALONG_THE_PATH'],
  ['Hc 2:2', 'WRITE_THE_VISION_CLEARLY'],
  ['Ec 3:7', 'TEAR_AND_SEW_AT_THE_RIGHT_TIME'],
]);

const PHASE_DIRECTIONS = new Map([
  ['ACORDAR', new Set(['EXAMINE_EVERYTHING_KEEP_WHAT_IS_GOOD', 'ORDER_NOT_CONFUSION'])],
  ['DESTINATION_LOCK', new Set(['GUARD_THE_SOURCE', 'ORDER_NOT_CONFUSION'])],
  ['PEGATUDO', new Set(['EXAMINE_EVERYTHING_KEEP_WHAT_IS_GOOD', 'KEEP_AND_RELEASE_AT_THE_RIGHT_TIME'])],
  ['DEBITO_COGNITIVO', new Set(['EXAMINE_EVERYTHING_KEEP_WHAT_IS_GOOD', 'COUNSEL_STABILIZES_PLANS'])],
  ['READERS_MEASURE', new Set(['COUNT_COST_BEFORE_BUILDING', 'EXAMINE_EVERYTHING_KEEP_WHAT_IS_GOOD'])],
  ['RENDEZVOUS', new Set(['COUNSEL_STABILIZES_PLANS', 'SINGLE_WITNESS_IS_NOT_ENOUGH_FOR_JUDGMENT'])],
  ['RECONCILE', new Set(['KEEP_AND_RELEASE_AT_THE_RIGHT_TIME', 'ORDER_NOT_CONFUSION'])],
  ['STITCH', new Set(['TEAR_AND_SEW_AT_THE_RIGHT_TIME', 'WRITE_THE_VISION_CLEARLY'])],
  ['OWNER', new Set(['GUARD_THE_SOURCE', 'ORDER_NOT_CONFUSION'])],
  ['ONE_WRITER', new Set(['ORDER_NOT_CONFUSION', 'GUARD_THE_SOURCE'])],
  ['PATCH', new Set(['COUNT_COST_BEFORE_BUILDING', 'WORD_WITHOUT_ACTION_IS_INCOMPLETE'])],
  ['TESTE', new Set(['RESULT_REVEALS_TREE', 'EXAMINE_EVERYTHING_KEEP_WHAT_IS_GOOD'])],
  ['CONTRAPROVA', new Set(['SINGLE_WITNESS_IS_NOT_ENOUGH_FOR_JUDGMENT', 'EXAMINE_EVERYTHING_KEEP_WHAT_IS_GOOD'])],
  ['REALITY_JUDGE', new Set(['RESULT_REVEALS_TREE', 'SINGLE_WITNESS_IS_NOT_ENOUGH_FOR_JUDGMENT'])],
  ['FIXED_POINT', new Set(['LIGHT_INCREASES_ALONG_THE_PATH', 'RESULT_REVEALS_TREE'])],
  ['REGISTRA', new Set(['WRITE_THE_VISION_CLEARLY', 'KEEP_AND_RELEASE_AT_THE_RIGHT_TIME'])],
  ['HANDOFF', new Set(['WRITE_THE_VISION_CLEARLY', 'ORDER_NOT_CONFUSION'])],
  ['BOOT', new Set(['LIGHT_INCREASES_ALONG_THE_PATH', 'ORDER_NOT_CONFUSION'])],
]);

function read(rel) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) throw new Error(`MISSING_FILE:${rel}`);
  return fs.readFileSync(abs, 'utf8');
}

function normalizeToken(value) {
  return String(value ?? '').trim().toUpperCase().replace(/[\s-]+/g, '_');
}

function normalizeRoute(value) {
  return String(value ?? '').trim().toLowerCase().replace(/[^a-z0-9/_:.]+/g, '-').replace(/-+/g, '-');
}

function explicitAllowedChild(expected, actual) {
  if (!expected || !actual) return false;
  return actual === expected || actual.startsWith(`${expected}/`) || actual.startsWith(`${expected}:`);
}

export function evaluateSemanticGreen(input = {}) {
  const phase = normalizeToken(input.phase);
  const verseReference = String(input.verse_reference ?? '').trim();
  const verseDirection = normalizeToken(input.verse_direction);
  const intentRoute = normalizeRoute(input.intent_route);
  const actualRoute = normalizeRoute(input.actual_route ?? input.intent_route);
  const style = normalizeToken(input.human_style);
  const technicalProofSeparate = input.technical_proof_separate === true;

  const reasons = [];
  const unknowns = [];

  if (!phase) unknowns.push('PHASE_MISSING');
  const allowedDirections = PHASE_DIRECTIONS.get(phase);
  if (phase && !allowedDirections) reasons.push('PHASE_NOT_ALLOWED');

  if (!verseReference) unknowns.push('VERSE_REFERENCE_MISSING');
  const registeredDirection = VERSE_REGISTRY.get(verseReference);
  if (verseReference && !registeredDirection) reasons.push('VERSE_REFERENCE_NOT_REGISTERED');

  if (!verseDirection) unknowns.push('VERSE_DIRECTION_MISSING');
  if (registeredDirection && verseDirection && registeredDirection !== verseDirection) {
    reasons.push('VERSE_DIRECTION_DOES_NOT_MATCH_REFERENCE');
  }
  if (allowedDirections && verseDirection && !allowedDirections.has(verseDirection)) {
    reasons.push('VERSE_DIRECTION_NOT_ALLOWED_FOR_PHASE');
  }

  if (!intentRoute) unknowns.push('INTENT_ROUTE_MISSING');
  if (!actualRoute) unknowns.push('ACTUAL_ROUTE_MISSING');
  if (intentRoute && actualRoute && !explicitAllowedChild(intentRoute, actualRoute)) {
    reasons.push('INTENT_ROUTE_MISMATCH');
  }

  if (!style) unknowns.push('HUMAN_STYLE_MISSING');
  if (style && !STYLE_ALLOWED.has(style)) reasons.push('HUMAN_STYLE_MISMATCH');

  if (!technicalProofSeparate) reasons.push('TECHNICAL_PROOF_BOUNDARY_MISSING');

  let verdict = 'GREEN';
  if (reasons.length) verdict = 'FAIL';
  else if (unknowns.length) verdict = 'UNKNOWN';

  return {
    schema: 'centraldark.semantic-green-result.v1',
    verdict,
    green: verdict === 'GREEN',
    phase,
    verse_reference: verseReference,
    verse_direction: verseDirection,
    registered_direction: registeredDirection ?? null,
    intent_route: intentRoute || null,
    actual_route: actualRoute || null,
    human_style: style || null,
    technical_proof_separate: technicalProofSeparate,
    reasons,
    unknowns,
    fail_closed: true,
    semantic_green_is_runtime_green: false,
    semantic_green_is_technical_proof: false,
  };
}

function assertSelfTest(condition, name) {
  if (!condition) throw new Error(`SELF_TEST_FAIL:${name}`);
}

export function runSelfTest() {
  const contract = read(CONTRACT_PATH);
  const aureola = read(AUREOLA_PATH);
  const stitch = read(STITCH_PATH);

  for (const token of [
    'VERSE_VALID_ALONE_IS_NOT_GREEN: true',
    'MODEL_CANNOT_REWRITE_INTENT: true',
    'TECHNICAL_GREEN_DOES_NOT_IMPLY_SEMANTIC_GREEN: true',
    'SEMANTIC_GREEN_DOES_NOT_IMPLY_RUNTIME_GREEN: true',
    'FAIL_CLOSED: true',
  ]) assertSelfTest(contract.includes(token), `CONTRACT_TOKEN:${token}`);

  assertSelfTest(aureola.includes('reference: "1Ts 5:21"'), 'AUREOLA_REGISTRY_PRESENT');
  assertSelfTest(stitch.includes('reference: "Ec 3:7"'), 'STITCH_REGISTRY_PRESENT');

  const positive = evaluateSemanticGreen({
    phase: 'TESTE',
    verse_reference: 'Mt 7:16',
    verse_direction: 'RESULT_REVEALS_TREE',
    intent_route: 'centraldark/pr-1381/test',
    actual_route: 'centraldark/pr-1381/test/same-head',
    human_style: 'BAIANES_FACIL',
    technical_proof_separate: true,
  });
  assertSelfTest(positive.verdict === 'GREEN', 'POSITIVE_GREEN');

  const wrongPhase = evaluateSemanticGreen({
    phase: 'TESTE',
    verse_reference: 'Hc 2:2',
    verse_direction: 'WRITE_THE_VISION_CLEARLY',
    intent_route: 'centraldark/pr-1381/test',
    actual_route: 'centraldark/pr-1381/test',
    human_style: 'BAIANES_FACIL',
    technical_proof_separate: true,
  });
  assertSelfTest(wrongPhase.verdict === 'FAIL' && wrongPhase.reasons.includes('VERSE_DIRECTION_NOT_ALLOWED_FOR_PHASE'), 'REAL_VERSE_WRONG_PHASE_FAILS');

  const wrongDirection = evaluateSemanticGreen({
    phase: 'ACORDAR',
    verse_reference: '1Ts 5:21',
    verse_direction: 'ORDER_NOT_CONFUSION',
    intent_route: 'centraldark/acordar',
    actual_route: 'centraldark/acordar',
    human_style: 'BAIANES_FACIL',
    technical_proof_separate: true,
  });
  assertSelfTest(wrongDirection.verdict === 'FAIL' && wrongDirection.reasons.includes('VERSE_DIRECTION_DOES_NOT_MATCH_REFERENCE'), 'WRONG_DIRECTION_FAILS');

  const wrongIntent = evaluateSemanticGreen({
    phase: 'TESTE',
    verse_reference: 'Mt 7:16',
    verse_direction: 'RESULT_REVEALS_TREE',
    intent_route: 'centraldark/pr-1381/test',
    actual_route: 'other-system/rewrite-goal',
    human_style: 'BAIANES_FACIL',
    technical_proof_separate: true,
  });
  assertSelfTest(wrongIntent.verdict === 'FAIL' && wrongIntent.reasons.includes('INTENT_ROUTE_MISMATCH'), 'WRONG_INTENT_FAILS');

  const wrongStyle = evaluateSemanticGreen({
    phase: 'TESTE',
    verse_reference: 'Mt 7:16',
    verse_direction: 'RESULT_REVEALS_TREE',
    intent_route: 'centraldark/pr-1381/test',
    actual_route: 'centraldark/pr-1381/test',
    human_style: 'ALIEN_STYLE',
    technical_proof_separate: true,
  });
  assertSelfTest(wrongStyle.verdict === 'FAIL' && wrongStyle.reasons.includes('HUMAN_STYLE_MISMATCH'), 'WRONG_STYLE_FAILS');

  const missingProofBoundary = evaluateSemanticGreen({
    phase: 'TESTE',
    verse_reference: 'Mt 7:16',
    verse_direction: 'RESULT_REVEALS_TREE',
    intent_route: 'centraldark/pr-1381/test',
    actual_route: 'centraldark/pr-1381/test',
    human_style: 'BAIANES_FACIL',
    technical_proof_separate: false,
  });
  assertSelfTest(missingProofBoundary.verdict === 'FAIL' && missingProofBoundary.reasons.includes('TECHNICAL_PROOF_BOUNDARY_MISSING'), 'PROOF_BOUNDARY_FAILS');

  return {
    schema: 'centraldark.semantic-green-self-test.v1',
    ok: true,
    positive: positive.verdict,
    counterproofs: {
      real_verse_wrong_phase: wrongPhase.verdict,
      wrong_direction: wrongDirection.verdict,
      wrong_intent: wrongIntent.verdict,
      wrong_style: wrongStyle.verdict,
      missing_proof_boundary: missingProofBoundary.verdict,
    },
  };
}

function parseInputArg() {
  const idx = process.argv.indexOf('--input-json');
  if (idx < 0) return null;
  const raw = process.argv[idx + 1];
  if (!raw) throw new Error('INPUT_JSON_MISSING');
  return JSON.parse(raw);
}

function main() {
  try {
    if (process.argv.includes('--self-test')) {
      const result = runSelfTest();
      console.log(JSON.stringify(result, null, 2));
      console.log('SEMANTIC_GREEN_SELF_TEST=PASS');
      return;
    }
    const input = parseInputArg();
    if (!input) {
      console.log(JSON.stringify({
        schema: 'centraldark.semantic-green-cli.v1',
        usage: 'node apps/modulos/HERMES-CORE/core/semantic-green-gate.mjs --self-test | --input-json <json>',
      }, null, 2));
      return;
    }
    const result = evaluateSemanticGreen(input);
    console.log(JSON.stringify(result, null, 2));
    if (result.verdict !== 'GREEN') process.exitCode = 1;
  } catch (error) {
    console.error(JSON.stringify({ ok: false, error: String(error?.message || error) }, null, 2));
    process.exitCode = 1;
  }
}

main();
