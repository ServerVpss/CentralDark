import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPdfPlan } from './centraldark-pdf-core.mjs';
import {
  buildPdfSelfHealingPlan,
  classifyPdfFailure,
  PDF_HARNESS_RANKS,
  PDF_SELF_HEALING_MANIFEST,
  validatePdfSelfHealingPlan,
} from './centraldark-pdf-self-healing.mjs';

test('places self-healing in the harness heart without self-rewrite', () => {
  const base = buildPdfPlan({ intent: 'redact cpf token from pdf', executor: 'MCP' });
  const healing = buildPdfSelfHealingPlan({ failure: 'REDACTION_OVERLAY fake redaction' }, base);
  assert.equal(healing.heart_of_harness, true);
  assert.equal(healing.self_rewrite_allowed, false);
  assert.equal(healing.failure_signature, 'REDACTION_OVERLAY');
  assert.equal(healing.rank, 'MESTRE');
  assert.ok(healing.correction_pipeline.includes('apply_true_redaction'));
  assert.equal(validatePdfSelfHealingPlan(healing).ok, true);
});

test('embeds formula and package hash as manifest, not mutable PDF brain', () => {
  assert.deepEqual(PDF_SELF_HEALING_MANIFEST.formula, ['render', 'verify', 'operate', 're-render', 'diff_or_verify', 'receipt', 'NEXT_CURSOR']);
  assert.equal(PDF_SELF_HEALING_MANIFEST.rules.self_healing_is_not_self_rewrite, true);
  assert.equal(PDF_SELF_HEALING_MANIFEST.resilience_zip_sha256.length, 64);
});

test('unknown failure holds and does not pretend to heal', () => {
  const base = buildPdfPlan({ intent: 'review pdf' });
  const healing = buildPdfSelfHealingPlan({ failure: 'unmapped vapor' }, base);
  assert.equal(healing.status, 'HOLD');
  assert.equal(healing.failure_signature, 'UNKNOWN_PDF_FAILURE');
  assert.ok(healing.next_cursor.includes('COLLECT_MATERIAL_EVIDENCE'));
});

test('professional ranking reaches MESTRE but cannot bypass gates', () => {
  const mestre = PDF_HARNESS_RANKS.at(-1);
  const failure = classifyPdfFailure({ error: 'visual diff unknown regression' });
  const healing = buildPdfSelfHealingPlan({ failure: 'visual diff unknown regression' });
  assert.equal(mestre.id, 'MESTRE');
  assert.equal(failure.id, 'REGRESSION_DIFF_UNKNOWN');
  assert.ok(healing.gates.includes('DO_NOT_WEAKEN_TESTS'));
  assert.ok(healing.gates.includes('DO_NOT_MASK_FAILURE'));
});
