#!/usr/bin/env node
import { buildPdfPlan, validatePdfPlan } from './centraldark-pdf-core.mjs';

function parseArgs(argv) {
  const args = { intent: '' };
  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (item === '--self-test') args.selfTest = true;
    else if (item === '--json') args.json = argv[++i];
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
  return { ok: failures.length === 0, failures, total: fixtures.length };
}

const args = parseArgs(process.argv.slice(2));
if (args.selfTest) {
  const result = runSelfTest();
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.ok ? 0 : 1);
}

const input = args.json ? JSON.parse(args.json) : { intent: args.intent };
const plan = buildPdfPlan(input);
const validation = validatePdfPlan(plan);
console.log(JSON.stringify({ plan, validation }, null, 2));
process.exit(validation.ok ? 0 : 1);
