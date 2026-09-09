#!/usr/bin/env node
import { buildPdfFixedPointReceipt, buildPdfPlan, validatePdfPlan } from './centraldark-pdf-core.mjs';
import { buildPdfSelfHealingPlan, validatePdfSelfHealingPlan } from './centraldark-pdf-self-healing.mjs';

function parseArgs(argv) {
  const args = { intent: '' };
  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (item === '--self-test') args.selfTest = true;
    else if (item === '--fixed-point') args.fixedPoint = true;
    else if (item === '--heal') args.heal = true;
    else if (item === '--json') args.json = argv[++i];
    else if (item === '--executor') args.executor = argv[++i];
    else if (item === '--failure') args.failure = argv[++i];
    else args.intent += `${args.intent ? ' ' : ''}${item}`;
  }
  return args;
}

function runSelfTest() {
  const fixtures = [
    ['redact secrets from pdf', 'REDACT'],
    ['ocr scanned contract', 'OCR'],
    ['fill acroform fields', 'FORMS'],
    ['extract tables and layout', 'EXTRACT'],
    ['merge rotate crop pdf', 'EDIT'],
    ['convert docx to pdf', 'CONVERT'],
    ['create business report pdf', 'CREATE'],
    ['review uploaded file', 'READ_REVIEW'],
  ];
  const failures = [];
  for (const [intent, expected] of fixtures) {
    const plan = buildPdfPlan({ intent });
    const validation = validatePdfPlan(plan);
    if (plan.task !== expected || !validation.ok) failures.push({ intent, expected, got: plan.task, validation });
  }
  const base = buildPdfPlan({ intent: 'redact pdf', executor: 'MCP' });
  const healing = buildPdfSelfHealingPlan({ failure: 'REDACTION_OVERLAY' }, base);
  const healingValidation = validatePdfSelfHealingPlan(healing);
  if (healing.failure_signature !== 'REDACTION_OVERLAY' || healing.self_rewrite_allowed !== false || !healingValidation.ok) {
    failures.push({ healing, healingValidation });
  }
  return { ok: failures.length === 0, failures, total: fixtures.length + 1 };
}

const args = parseArgs(process.argv.slice(2));
if (args.selfTest) {
  const result = runSelfTest();
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.ok ? 0 : 1);
}

const input = args.json ? JSON.parse(args.json) : { intent: args.intent, executor: args.executor, failure: args.failure };
const plan = buildPdfPlan(input);

if (args.fixedPoint) {
  const receipt = buildPdfFixedPointReceipt(input);
  const healing = buildPdfSelfHealingPlan(input, plan);
  const healingValidation = validatePdfSelfHealingPlan(healing);
  console.log(JSON.stringify({ receipt, healing, healing_validation: healingValidation }, null, 2));
  process.exit(receipt.status === 'PASS' && healingValidation.ok ? 0 : 1);
}
if (args.heal) {
  const healing = buildPdfSelfHealingPlan(input, plan);
  const healingValidation = validatePdfSelfHealingPlan(healing);
  console.log(JSON.stringify({ plan, healing, healing_validation: healingValidation }, null, 2));
  process.exit(healingValidation.ok && healing.status === 'PLAN' ? 0 : 1);
}

const validation = validatePdfPlan(plan);
console.log(JSON.stringify({ plan, validation }, null, 2));
process.exit(validation.ok ? 0 : 1);
