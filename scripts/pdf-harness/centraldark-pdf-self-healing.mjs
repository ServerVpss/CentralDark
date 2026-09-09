export const PDF_SELF_HEALING_VERSION = 'centraldark.pdf-harness-self-healing.v1';

export const PDF_SKILL_EMBEDDED_FORMULA = Object.freeze([
  'render',
  'verify',
  'operate',
  're-render',
  'diff_or_verify',
  'receipt',
  'NEXT_CURSOR',
]);

export const PDF_HARNESS_RANKS = Object.freeze([
  { id: 'CLASS_C', power: 10, scope: 'detect and report only' },
  { id: 'CLASS_B', power: 25, scope: 'safe retry and read-only triage' },
  { id: 'CLASS_A', power: 50, scope: 'normalize input and deterministic reroute' },
  { id: 'CLASS_S', power: 75, scope: 'patch material failure point with regression guard' },
  { id: 'SENIOR', power: 90, scope: 'multi-renderer proof plus receipt learning' },
  { id: 'MESTRE', power: 100, scope: 'promote rule only with tests and receipts' },
]);

export const PDF_SELF_HEALING_MANIFEST = Object.freeze({
  name: 'pdfs',
  formula: PDF_SKILL_EMBEDDED_FORMULA,
  source_sha256_prefix: 'b4e2a0655b7e0c85ca329c33971b377299dde6',
  resilience_zip_sha256: 'd15f80ef58b65c12c60b5b97da3a5e14e3a79b88a8bfd4bd88c4e0d0b50b3e21',
  rules: {
    unknown_is_not_pass: true,
    self_healing_is_not_self_rewrite: true,
    receipt_learning_is_not_auto_mutation: true,
    regression_unknown_blocks_promotion: true,
  },
});

const FAILURE_RULES = [
  { id: 'RENDER_FAIL', rank: 'SENIOR', match: /render.*fail|pdfium|pdftoppm|cannot render|renderer/i, correction: ['preflight', 'normalize_pdf', 'switch_renderer', 'render_again', 'receipt'] },
  { id: 'OUTPUT_NO_RENDER', rank: 'CLASS_S', match: /output.*no render|render absent|PDF_RENDER_ABSENT|no output render/i, correction: ['block_pass', 'render_output', 'verify_render_after_output', 'receipt'] },
  { id: 'TEXT_CLIPPED', rank: 'CLASS_S', match: /clipped|overlap|broken glyph|black square|glyph/i, correction: ['reject_pdf_output', 'choose_docx_or_pptx_authoring', 'convert_again', 'render_output', 'glyph_layout_verify', 'receipt'] },
  { id: 'OCR_LOW_CONFIDENCE', rank: 'SENIOR', match: /ocr.*low|low confidence|text_extract_verify/i, correction: ['mark_unknown', 'rerun_ocr_with_explicit_language', 'render_output', 'sample_text_verify', 'receipt'] },
  { id: 'REDACTION_OVERLAY', rank: 'MESTRE', match: /overlay|covered|fake redaction|not true redaction|REDACTION_OVERLAY/i, correction: ['block_output', 'apply_true_redaction', 'extract_text_verify_absence', 'render_output', 'receipt'] },
  { id: 'FORM_FIELD_MISMATCH', rank: 'SENIOR', match: /field mismatch|acroform|appearance|checkbox|accepted value/i, correction: ['inspect_form_fields', 'map_accepted_values', 'fill_or_stamp', 'render_output', 'field_value_verify', 'receipt'] },
  { id: 'COORDINATE_DRIFT', rank: 'CLASS_A', match: /coordinate|coords|box|pt.*px|px.*pt|drift/i, correction: ['recompute_pdf_points', 'recompute_image_pixels', 'stamp_by_boxes', 'render_output', 'visual_verify', 'receipt'] },
  { id: 'NO_RECEIPT', rank: 'CLASS_B', match: /no receipt|receipt missing|NEXT_CURSOR_MISSING/i, correction: ['block_pass', 'write_receipt', 'preserve_next_cursor', 'receipt'] },
  { id: 'REGRESSION_DIFF_UNKNOWN', rank: 'MESTRE', match: /diff unknown|regression|compare renders|visual diff/i, correction: ['block_promotion', 'compare_renders', 'classify_diff', 'rerun_or_hold', 'receipt'] },
];

export function classifyPdfFailure(input = {}) {
  const text = [input.failure, input.error, input.stderr, input.log_excerpt, input.signal, input.notes].filter(Boolean).join('\n');
  const rule = FAILURE_RULES.find((candidate) => candidate.match.test(text));
  if (!rule) return { id: 'UNKNOWN_PDF_FAILURE', rank: 'CLASS_C', correction: ['hold', 'request_material_evidence', 'receipt'] };
  return { id: rule.id, rank: rule.rank, correction: [...rule.correction] };
}

export function buildPdfSelfHealingPlan(input = {}, basePlan) {
  const failure = classifyPdfFailure(input);
  const safeToAttempt = failure.id !== 'UNKNOWN_PDF_FAILURE';
  return {
    schema: PDF_SELF_HEALING_VERSION,
    status: safeToAttempt ? 'PLAN' : 'HOLD',
    material_id: basePlan?.material_id ?? 'UNKNOWN_MATERIAL_ID',
    task: basePlan?.task ?? 'UNKNOWN_TASK',
    failure_signature: failure.id,
    rank: failure.rank,
    self_healing: true,
    heart_of_harness: true,
    self_rewrite_allowed: false,
    correction_pipeline: failure.correction,
    deterministic_formula: PDF_SKILL_EMBEDDED_FORMULA,
    embedded_manifest: PDF_SELF_HEALING_MANIFEST,
    gates: ['DO_NOT_WEAKEN_TESTS', 'DO_NOT_MASK_FAILURE', 'DO_NOT_CREATE_PARALLEL_SYSTEM', 'RUN_RELEVANT_TESTS_AGAIN', 'RECEIPT_WITH_NEXT_CURSOR'],
    promotion_rule: 'RECEIPT_PATTERN_PLUS_TEST_PLUS_NO_REGRESSION_BEFORE_CORE_CHANGE',
    next_cursor: safeToAttempt ? 'APPLY_CORRECTION_AT_MATERIAL_FAILURE_POINT' : 'COLLECT_MATERIAL_EVIDENCE_BEFORE_MUTATION',
  };
}

export function validatePdfSelfHealingPlan(plan) {
  const errors = [];
  if (plan?.schema !== PDF_SELF_HEALING_VERSION) errors.push('SELF_HEALING_SCHEMA_INVALID');
  if (plan?.self_healing !== true) errors.push('SELF_HEALING_DISABLED');
  if (plan?.heart_of_harness !== true) errors.push('SELF_HEALING_NOT_IN_HARNESS');
  if (plan?.self_rewrite_allowed !== false) errors.push('SELF_REWRITE_FORBIDDEN');
  if (!plan?.deterministic_formula?.includes('receipt')) errors.push('FORMULA_MISSING_RECEIPT');
  if (!plan?.gates?.includes('DO_NOT_WEAKEN_TESTS')) errors.push('REGRESSION_GATE_MISSING');
  if (!plan?.next_cursor) errors.push('NEXT_CURSOR_MISSING');
  return { ok: errors.length === 0, errors };
}
