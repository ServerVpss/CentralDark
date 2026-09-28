#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_FILE = 'docs/CONSCIENCIA/APRENDIZADOS.md';

function parseArgs(argv) {
  const args = {
    file: DEFAULT_FILE,
    learning: '',
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
    else if (key === '--learning') { args.learning = String(val || '').replace(/^#/, ''); i += 1; }
    else if (key === '--pointer') args.pointer = true;
    else if (key === '--tool-available') args.toolAvailable = true;
    else if (key === '--tool-attempted') args.toolAttempted = true;
    else if (key === '--unknown-claimed') args.unknownClaimed = true;
    else if (key === '--measurement-route-exists') args.measurementRouteExists = true;
    else if (key === '--text') args.json = false;
  }
  return args;
}

function fail(code, reason, extra = {}) {
  const payload = { ok: false, reason, ...extra };
  console.log(JSON.stringify(payload, null, 2));
  process.exit(code);
}

function extractLearning(text, number) {
  const escaped = String(number).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const startRe = new RegExp(`^###\\s+${escaped}\\.\\s+.+$`, 'm');
  const match = text.match(startRe);
  if (!match || match.index === undefined) return null;
  const start = match.index;
  const rest = text.slice(start + match[0].length);
  const next = rest.search(/^###\s+\d+\.\s+/m);
  const body = next >= 0 ? text.slice(start, start + match[0].length + next) : text.slice(start);
  return body.trim();
}

const args = parseArgs(process.argv.slice(2));
const absFile = path.resolve(process.cwd(), args.file);

if (args.pointer && !fs.existsSync(absFile)) {
  fail(30, 'POINTER_TEXT_IS_NOT_SOURCE_AND_CANONICAL_FILE_NOT_FOUND', { file: args.file });
}

if (args.toolAvailable && !args.toolAttempted) {
  fail(31, 'TOOL_AVAILABLE_MUST_BE_ATTEMPTED_BEFORE_UNKNOWN');
}

if (args.unknownClaimed && args.measurementRouteExists) {
  fail(32, 'UNKNOWN_MEDIVEL_E_FALHA_DE_METODO');
}

if (!fs.existsSync(absFile)) {
  fail(34, 'CANONICAL_PATH_REQUIRED_AFTER_SEARCH_MISS', { file: args.file });
}

const text = fs.readFileSync(absFile, 'utf8');

// Sem número explícito, o boot consome diretamente o aprendizado numerado
// mais recente. Busca zero nunca encerra a rota quando o path canônico é conhecido.
if (!args.learning) {
  const matches = [...text.matchAll(/^###\s+(\d+)\.\s+.+$/gm)];
  if (!matches.length) {
    fail(33, 'NO_NUMBERED_LEARNING_IN_CANONICAL_FILE', { file: args.file });
  }
  args.learning = matches.at(-1)[1];
}

const section = extractLearning(text, args.learning);
if (!section) {
  fail(35, 'LEARNING_NOT_FOUND_IN_CANONICAL_FILE', { file: args.file, learning: args.learning });
}

const requiredFor80 = args.learning === '80'
  ? ['TER FERRAMENTA != TER MEDIDO', 'PONTEIRO != FONTE', 'UNKNOWN_MEDIVEL = FALHA']
  : [];
const missing = requiredFor80.filter((needle) => !section.includes(needle));
if (missing.length) {
  fail(36, 'CANONICAL_LEARNING_INCOMPLETE', { file: args.file, learning: args.learning, missing });
}

const payload = {
  ok: true,
  source: 'CANONICAL_FILE_DIRECT_READ',
  file: args.file,
  learning: `#${args.learning}`,
  title: section.split('\n')[0].replace(/^###\s+/, ''),
  bytes: section.length,
  gates: {
    toolAvailableAttempted: !(args.toolAvailable && !args.toolAttempted),
    pointerOpenedSource: !args.pointer || fs.existsSync(absFile),
    measurableUnknownRejected: !(args.unknownClaimed && args.measurementRouteExists),
  },
};
console.log(args.json ? JSON.stringify(payload, null, 2) : section);
