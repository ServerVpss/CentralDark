import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildPdfFixedPointReceipt,
  buildPdfPlan,
  EXECUTOR_SURFACES,
  validatePdfPlan,
} from './centraldark-pdf-core.mjs';

const cases = [
  ['redact cpf token from pdf', 'REDACT', 'true_redaction'],
  ['ocr scanned menu to searchable pdf', 'OCR', 'ocr'],
  ['fill form and flatten fields', 'FORMS', 'fill_or_stamp'],
  ['extract tables images coordinates', 'EXTRACT', 'extract'],
  ['merge split rotate crop files', 'EDIT', 'edit'],
  ['convert docx with long table', 'CONVERT', 'convert_to_pdf'],
  ['create business document with toc', 'CREATE', 'create_source'],
  ['just review a pdf', 'READ_REVIEW', 'read_review'],
];

test('classifies PDF operations into deterministic owner pipelines', () => {
  for (const [intent, expectedTask, requiredStep] of cases) {
    const plan = buildPdfPlan({ intent, observed_at: '2026-09-09T00:00:00.000Z' });
    assert.equal(plan.task, expectedTask);
    assert.ok(plan.pipeline.includes(requiredStep));
    assert.equal(validatePdfPlan(plan).ok, true);
  }
});

test('preserves render-verify loop and unknown-is-not-pass invariant', () => {
  const plan = buildPdfPlan({ intent: 'edit pdf watermark and compare visual diff' });
  assert.equal(plan.unknown_is_not_pass, true);
  assert.equal(plan.render_loop_required, true);
  assert.ok(plan.gates.includes('VERIFY_RENDER_AFTER_OUTPUT'));
  assert.ok(plan.next_cursor.length > 0);
});

test('selects DOCX/PPTX/ReportLab authoring path before PDF output', () => {
  assert.equal(buildPdfPlan({ intent: 'create business doc with toc and long table' }).authoring_format, 'DOCX_THEN_PDF');
  assert.equal(buildPdfPlan({ intent: 'create slide deck with charts' }).authoring_format, 'PPTX_THEN_PDF');
  assert.equal(buildPdfPlan({ intent: 'programmatic reportlab pdf' }).authoring_format, 'REPORTLAB_DIRECT');
});

test('is executor-neutral and not Hermes-only', () => {
  const base = buildPdfPlan({ intent: 'ocr scanned pdf', executor: 'Hermes' });
  assert.equal(base.executor_policy.executor_neutral, true);
  assert.equal(base.executor_policy.hermes_only, false);
  assert.ok(base.executor_policy.allowed_surfaces.includes('HERMES'));
  assert.ok(base.executor_policy.allowed_surfaces.includes('MCP'));
  assert.ok(base.executor_policy.allowed_surfaces.includes('VPS'));
  assert.ok(base.executor_policy.allowed_surfaces.includes('CHATGPT_CONNECTOR'));
  assert.deepEqual(base.executor_policy.allowed_surfaces, EXECUTOR_SURFACES);
});

test('same capability and scope produce same material id across executors', () => {
  const shared = { intent: 'redact cpf token from pdf', filename: 'input.pdf', observed_at: '2026-09-09T00:00:00.000Z' };
  const hermes = buildPdfPlan({ ...shared, executor: 'Hermes' });
  const vps = buildPdfPlan({ ...shared, executor: 'VPS' });
  const mcp = buildPdfPlan({ ...shared, executor: 'MCP' });
  assert.equal(hermes.material_id, vps.material_id);
  assert.equal(vps.material_id, mcp.material_id);
  assert.equal(hermes.task, vps.task);
  assert.equal(vps.task, mcp.task);
});

test('fixed point receipt is measurable without claiming real PDF mutation', () => {
  const receipt = buildPdfFixedPointReceipt({ intent: 'extract tables from pdf', executor: 'ChatGPT connector' });
  assert.equal(receipt.schema, 'centraldark.pdf-harness-fixed-point.v1');
  assert.equal(receipt.fixed_point_class, 'LOCAL_PLAN_FIXED_POINT');
  assert.equal(receipt.status, 'PASS');
  assert.equal(receipt.executor_neutral, true);
  assert.equal(receipt.hermes_only, false);
  assert.equal(receipt.measurable_gates.executor_neutral, true);
  assert.equal(receipt.measurable_gates.mcp_bridge_present, true);
});
