import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPdfPlan, validatePdfPlan } from './centraldark-pdf-core.mjs';

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
