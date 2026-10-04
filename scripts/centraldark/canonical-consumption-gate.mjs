#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_FILE = 'docs/CONSCIENCIA/APRENDIZADOS.md';

function parseArgs(argv) {
  const args = {
    file: DEFAULT_FILE,
    learning: 'PERTINENT',
    pointer: false,
    toolAvailable: false,
    toolAttempted: false,
    unknownClaimed: false,
    measurementRouteExists: false,
    json: true,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    const val = argv[i + 1];
    if (key === '--file') { args.file = val; i += 1; }
    else if (key === '--learning') { args.learning = String(val || 'PERTINENT').replace(/^#/, ''); i += 1; }
    else if (key === '--pointer') args.pointer = true;
    else if (key === '--tool-available') args.toolAvailable = true;
    else if (key === '--tool-attempted') args.toolAttempted = true;
    else if (key === '--unknown-claimed') args.unknownClaimed = true;
    else if (key === '--measurement-route-exists') args.measurementRouteExists = true;
    else if (key === '--text') args.json = false;
  }
  return args;
}

function extractAllLearnings(text) {
  const headings = [...text.matchAll(/^###\s+(\d+)\.\s+(.+)$/gm)];
  return headings.map((match, index) => {
    const start = match.index;
    const end = index + 1 < headings.length ? headings[index + 1].index : text.length;
    return {
      number: Number(match[1]),
      title: match[2].trim(),
      body: text.slice(start, end).trim(),
    };
  });
}

function emit(payload, code = 0) {
  console.log(JSON.stringify(payload, null, 2));
  process.exit(code);
}

const args = parseArgs(process.argv.slice(2));
const absFile = path.resolve(process.cwd(), args.file);
const warnings = [];

if (args.toolAvailable && !args.toolAttempted) warnings.push('TOOL_AVAILABLE_NOT_ATTEMPTED_YET');
if (args.unknownClaimed && args.measurementRouteExists) warnings.push('UNKNOWN_HAS_MEASUREMENT_ROUTE_CONTINUE_TARGETED');

if (!fs.existsSync(absFile)) {
  emit({
    ok: false,
    non_blocking: true,
    mode: 'ADVISORY',
    reason: 'CANONICAL_FILE_NOT_FOUND',
    file: args.file,
    warnings,
  }, 0);
}

const textSource = fs.readFileSync(absFile, 'utf8');
const sections = extractAllLearnings(textSource);
const requested = String(args.learning || 'PERTINENT').toUpperCase();

if (!sections.length) {
  emit({
    ok: false,
    non_blocking: true,
    mode: 'ADVISORY',
    reason: 'NO_NUMBERED_LEARNING_IN_CANONICAL_FILE',
    file: args.file,
    warnings,
  }, 0);
}

const index = sections.map((item) => ({ number: item.number, title: item.title, bytes: item.body.length }));

if (requested === 'PERTINENT' || requested === 'INDEX') {
  const payload = {
    ok: true,
    non_blocking: true,
    source: 'CANONICAL_PERTINENT_INDEX',
    mode: 'PERTINENT_ONLY',
    file: args.file,
    count: sections.length,
    first: sections[0].number,
    last: sections.at(-1).number,
    index,
    warnings,
    rule: 'SELECT_ONLY_WHAT_CAN_CHANGE_CURRENT_DECISION',
  };
  if (!args.json) {
    console.log(index.map((item) => '#' + item.number + ' ' + item.title).join('\n'));
    process.exit(0);
  }
  emit(payload, 0);
}

if (requested === 'ALL') {
  const payload = {
    ok: true,
    non_blocking: true,
    source: 'CANONICAL_FILE_DIRECT_READ_ALL',
    mode: 'EXPLICIT_AUDIT_ALL',
    file: args.file,
    learning: 'ALL',
    count: sections.length,
    first: sections[0].number,
    last: sections.at(-1).number,
    index,
    warnings,
  };
  if (!args.json) {
    console.log(sections.map((item) => item.body).join('\n\n'));
    process.exit(0);
  }
  emit(payload, 0);
}

const matches = sections.filter((item) => String(item.number) === String(args.learning));
if (matches.length !== 1) {
  emit({
    ok: false,
    non_blocking: true,
    mode: 'ADVISORY',
    reason: matches.length ? 'LEARNING_NUMBER_AMBIGUOUS' : 'LEARNING_NOT_FOUND',
    file: args.file,
    learning: args.learning,
    warnings,
    index,
  }, 0);
}

const section = matches[0];
if (!args.json) {
  console.log(section.body);
  process.exit(0);
}
emit({
  ok: true,
  non_blocking: true,
  source: 'CANONICAL_FILE_DIRECT_READ',
  mode: 'TARGETED',
  file: args.file,
  learning: '#' + section.number,
  title: section.title,
  bytes: section.body.length,
  warnings,
}, 0);
