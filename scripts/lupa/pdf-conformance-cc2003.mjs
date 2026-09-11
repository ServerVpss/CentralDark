#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

export const CC2003_SOURCE = Object.freeze({
  title: 'Lógica Computacional (CC2003) — Lógica Computacional 23',
  author: 'Nelma Moreira',
  expectedSha256: 'b4e2a0655b7e0c85ca329c33971b377299dde6358779270c573f014f3aa606d1',
  expectedSizeBytes: 206674,
  expectedPages: 8,
  basis: ['Horn', 'satisfiability', 'Herbrand minimum model', 'resolution'],
});

export function sha256File(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

export function verifyPdfSource(path) {
  const bytes = readFileSync(path);
  return {
    path,
    sizeBytes: bytes.length,
    sha256: createHash('sha256').update(bytes).digest('hex'),
    expectedSha256: CC2003_SOURCE.expectedSha256,
    expectedSizeBytes: CC2003_SOURCE.expectedSizeBytes,
    status: bytes.length === CC2003_SOURCE.expectedSizeBytes &&
      createHash('sha256').update(bytes).digest('hex') === CC2003_SOURCE.expectedSha256
      ? 'PROVED_IN_SCOPE'
      : 'REFUTED_IN_SCOPE',
  };
}

export function resolveReuseBeforeCreate(input = {}) {
  const facts = {
    ownerExists: input.ownerExists === true,
    ownerSatisfies: input.ownerSatisfies === true,
    ownerPartial: input.ownerPartial === true,
    ownerExtensible: input.ownerExtensible === true,
    gapProved: input.gapProved === true,
    learnedRemedyExists: input.learnedRemedyExists === true,
    contradiction: input.contradiction === true,
    evidenceSufficient: input.evidenceSufficient === true,
  };

  if (facts.contradiction) {
    return { decision: 'FAIL_CLOSED', reason: 'CONTRADICTION', green: false };
  }

  if (!facts.evidenceSufficient) {
    return { decision: 'UNKNOWN', reason: 'INSUFFICIENT_EVIDENCE', green: false };
  }

  if (facts.learnedRemedyExists) {
    return { decision: 'REUSE_LEARNED_REMEDY', reason: 'ERROR_REMEDY_ALREADY_PROVED', green: false };
  }

  if (facts.ownerExists && facts.ownerSatisfies) {
    return { decision: 'REUSE', reason: 'OWNER_ALREADY_SATISFIES_CAPABILITY', green: false };
  }

  if (facts.ownerExists && facts.ownerPartial && facts.ownerExtensible) {
    return { decision: 'EXTEND_EXISTING', reason: 'OWNER_PARTIAL_AND_EXTENSIBLE', green: false };
  }

  if (!facts.ownerExists && facts.gapProved) {
    return { decision: 'CREATE_MINIMAL', reason: 'OWNER_GAP_PROVED', green: false };
  }

  return { decision: 'UNKNOWN', reason: 'NO_DERIVABLE_SAFE_ACTION', green: false };
}

export function proofAfterAction(actionResult = {}, postProbe = {}, counterproof = {}) {
  const ok = actionResult.executed === true &&
    postProbe.passed === true &&
    counterproof.regressionFound !== true;

  return {
    verdict: ok ? 'PROVED_IN_SCOPE' : 'UNKNOWN',
    green: ok,
    actionExecuted: actionResult.executed === true,
    postProbePassed: postProbe.passed === true,
    regressionFound: counterproof.regressionFound === true,
  };
}

export function selfTest() {
  assert.equal(CC2003_SOURCE.expectedSizeBytes, 206674);
  assert.equal(CC2003_SOURCE.expectedSha256, 'b4e2a0655b7e0c85ca329c33971b377299dde6358779270c573f014f3aa606d1');

  assert.equal(resolveReuseBeforeCreate({ evidenceSufficient: true, ownerExists: true, ownerSatisfies: true }).decision, 'REUSE');
  assert.equal(resolveReuseBeforeCreate({ evidenceSufficient: true, ownerExists: true, ownerPartial: true, ownerExtensible: true }).decision, 'EXTEND_EXISTING');
  assert.equal(resolveReuseBeforeCreate({ evidenceSufficient: true, learnedRemedyExists: true }).decision, 'REUSE_LEARNED_REMEDY');
  assert.equal(resolveReuseBeforeCreate({ evidenceSufficient: true, ownerExists: false, gapProved: true }).decision, 'CREATE_MINIMAL');
  assert.equal(resolveReuseBeforeCreate({ evidenceSufficient: true, contradiction: true }).decision, 'FAIL_CLOSED');
  assert.equal(resolveReuseBeforeCreate({ evidenceSufficient: false, ownerExists: true, ownerSatisfies: true }).decision, 'UNKNOWN');

  assert.equal(proofAfterAction({ executed: true }, { passed: true }, { regressionFound: false }).verdict, 'PROVED_IN_SCOPE');
  assert.equal(proofAfterAction({ executed: true }, { passed: false }, { regressionFound: false }).verdict, 'UNKNOWN');
  assert.equal(proofAfterAction({ executed: true }, { passed: true }, { regressionFound: true }).verdict, 'UNKNOWN');

  return { status: 'PASS', source: CC2003_SOURCE.title };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  if (process.argv.includes('--self-test')) {
    console.log(JSON.stringify(selfTest(), null, 2));
    process.exit(0);
  }

  const pdfArgIndex = process.argv.indexOf('--pdf');
  if (pdfArgIndex >= 0 && process.argv[pdfArgIndex + 1]) {
    const result = verifyPdfSource(process.argv[pdfArgIndex + 1]);
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.status === 'PROVED_IN_SCOPE' ? 0 : 1);
  }

  console.log(JSON.stringify({
    status: 'READY',
    usage: 'node scripts/lupa/pdf-conformance-cc2003.mjs --self-test | --pdf <path>',
    source: CC2003_SOURCE,
  }, null, 2));
}
