#!/usr/bin/env node

import crypto from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, posix, resolve } from 'node:path';

const argv = process.argv.slice(2);
const valueAfter = (name, fallback) => {
  const index = argv.indexOf(name);
  return index >= 0 && argv[index + 1] ? argv[index + 1] : fallback;
};

const ROOT = resolve(valueAfter('--repo-root', process.cwd()));
const JSON_OUT = argv.includes('--json');
const CALIBRATION_ONLY = argv.includes('--calibration-only');
const PROTOCOL_ONLY = argv.includes('--protocol-only');

const PORTA = 'LEIA-ME-IA.md';
const CONTRATO_DELTA = 'docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md';
const IDENTIDADE_LUPA = '.agents/skills/meta-lupa/AUTOLUPA_CANONICAL_SHA';
const SCHOOL_SKILL = '.agents/skills/agentic-ci-loop/SKILL.md';
const SCHOOL_LOADER = 'scripts/lupa/agentic-school-loader.mjs';
const CALIBRATION_HASH = 'docs/CONSCIENCIA/00-ENTRADA/CALIBRATION-CONTRACT.sha256';
const CALIBRATION_START = '### 1.2 Recalibração canônica por gatilho';
const CALIBRATION_END = '\n---\n\n## 2. As cinco coisas que não mudam';
const CONTRACT_START = '<!-- CENTRALDARK_CALIBRATION_CONTRACT_START -->';
const CONTRACT_END = '<!-- CENTRALDARK_CALIBRATION_CONTRACT_END -->';
const EXPECTED_SOURCE = 'ServerVpss/CentralDark';
const EXPECTED_OBSERVED = 'evidência atual medida e separada da fonte canônica';
const SHA256 = /^[0-9a-f]{64}$/;

const REQUIRED_OUTPUT_FIELDS = [
  'MISSION_ID', 'STATUS', 'THIS_CHAT_ROLE', 'WRITER', 'SCOPE', 'DEFAULT_BRANCH',
  'MAIN_HEAD', 'LOCAL_HEAD', 'BRANCH', 'HEAD', 'REMOTE_BRANCH_HEAD', 'PR_HEAD',
  'ACTIVE_PR', 'ACTIVE_ISSUE', 'MERGE_BASE', 'AHEAD_BY', 'BEHIND_BY',
  'COMMITS_UNIQUE_TO_MAIN', 'COMMITS_UNIQUE_TO_BRANCH', 'COMMITS_SINCE_LAST_PROOF',
  'RELATED_PRS', 'LAST_PROOF', 'WORKFLOW_STATUS', 'BOT_STATUS', 'AUTONOMY_STATUS',
  'CASA_STATE', 'VPS_STATE', 'P0_OPEN', 'P1_OPEN', 'UNKNOWN_CRITICAL', 'BLOCKERS',
  'NEXT_GATE', 'DRIFT', 'REENTRY_GUARD',
];
const STATE_RELATIONS = [
  'CHECK_SUCCESS != ZERO_FINDINGS', 'SKIPPED != PASS', 'BOT_COMMENTED != BOT_APPROVED',
  'UNKNOWN != PASS', 'TIMEOUT != PASS', 'REVIEWED_HEAD_OLD != REVIEWED_HEAD_CURRENT',
];
const PASS_REQUIRES = [
  'EXACT_HEAD', 'FRESH_TEST', 'VERIFIABLE_EVIDENCE', 'KNOWN_SCOPE',
  'NO_WRITER_COLLISION', 'INDEPENDENT_JUDGE_WHEN_REQUIRED',
];
const EXPECTED_CONTRACT = {
  schema_version: 1,
  contract_id: 'CENTRALDARK_CALIBRATION_CONTRACT',
  source_of_truth: EXPECTED_SOURCE,
  triggers: ['#ACORDA', '!CALIBRAR'],
  case_insensitive_prefix_match: true,
  reentry_guard: 'ONE_SHOT',
  github_first: true,
  github_unavailable: {
    mission_id: 'UNRESOLVED', status: 'BLOCKED_GITHUB_UNAVAILABLE',
    use_stale_state: false, continue_by_assumption: false,
  },
  drift: {
    status: 'STATE_DRIFT', newest_proved_state_wins: true,
    compare: ['GITHUB_REMOTE', 'CANONICAL_STATE', 'LOCAL_EVIDENCE', 'CONVERSATION'],
  },
  writer_collision: {
    role: 'READ_ONLY', statuses: ['WAITING_ACTIVE_WRITER', 'BLOCKED_WRITER_COLLISION'],
    may_write: false,
  },
  unknown_states: {
    casa: 'UNKNOWN_PENDING_LOCAL_EVIDENCE', vps: 'UNKNOWN_PENDING_SANITIZED_CAPTURE',
  },
  state_relations: STATE_RELATIONS,
  pass_requires: PASS_REQUIRES,
  required_output_fields: REQUIRED_OUTPUT_FIELDS,
};

const PROTOCOLOS_OBRIGATORIOS = [
  'docs/PROTOCOLO-BOOT.md',
  'docs/CONSCIENCIA/00-ENTRADA/00-LEIA-PRIMEIRO.md',
  'docs/CONSCIENCIA/PROTOCOLO-ORQUESTRACAO-PIVETE.md',
  'docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/REGRA-OFICIAL-MULTI-AGENTE-SEMANTICO.md',
];
const ADAPTADORES = [
  'AGENTS.md', 'CODEX.md', 'CLAUDE.md', 'README.md',
  '.claude/rules/00-centraldark-boot-universal.md', '.github/copilot-instructions.md',
  'GEMINI.md', '.cursor/rules/centraldark-governanca.mdc', '.windsurfrules',
];
const IGNORE_TRIGGER_SCAN = [
  /^docs\/_LEGADO_ROOT_DOCS_CONFLITOS\//,
  /^docs\/RELATORIOS\//,
  /^docs\/CONSCIENCIA\/ARTEFATOS\//,
  /^\.agents\/skills\/agentic-ci-loop\/references\/SOURCE-/,
];

const exists = (relativePath) => existsSync(join(ROOT, relativePath));
const read = (relativePath) => {
  try { return readFileSync(join(ROOT, relativePath), 'utf8'); }
  catch { return ''; }
};
const hash = (text) => crypto.createHash('sha256').update(text, 'utf8').digest('hex');
const assertEqual = (actual, expected) => JSON.stringify(actual) === JSON.stringify(expected);

function parseFlatYamlBlock(content, blockName = null) {
  const lines = content.split(/\r?\n/).filter((line) => line.trim() !== '');
  let body = lines;
  if (blockName !== null) {
    if (lines[0] !== `${blockName}:`) throw new Error(`YAML_ROOT_INVALID:${blockName}`);
    body = lines.slice(1);
  }
  const result = {};
  for (const line of body) {
    const expectedIndent = blockName === null ? '' : '  ';
    if (!line.startsWith(expectedIndent) || (blockName !== null && /^\S/.test(line))) {
      throw new Error(`YAML_STRUCTURE_INVALID:${line}`);
    }
    const trimmed = line.slice(expectedIndent.length);
    const match = trimmed.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!match) throw new Error(`YAML_LINE_INVALID:${line}`);
    const [, key, raw] = match;
    if (Object.hasOwn(result, key)) throw new Error(`YAML_DUPLICATE_KEY:${key}`);
    result[key] = raw.replace(/^"|"$/g, '');
  }
  return result;
}

function parseFrontmatter(content) {
  if (!content.startsWith('---\n')) throw new Error('FRONTMATTER_MISSING');
  const end = content.indexOf('\n---\n', 4);
  if (end < 0) throw new Error('FRONTMATTER_UNCLOSED');
  return parseFlatYamlBlock(content.slice(4, end));
}

function extractSection(content) {
  const start = content.indexOf(CALIBRATION_START);
  const end = content.indexOf(CALIBRATION_END, start);
  if (start < 0 || end < 0) throw new Error('CALIBRATION_SECTION_MISSING');
  return content.slice(start, end);
}

function extractMarkedJson(section) {
  const start = section.indexOf(CONTRACT_START);
  const end = section.indexOf(CONTRACT_END, start);
  if (start < 0 || end < 0) throw new Error('CALIBRATION_CONTRACT_MARKERS_MISSING');
  const fragment = section.slice(start + CONTRACT_START.length, end);
  const match = fragment.match(/```json\s*([\s\S]*?)\s*```/);
  if (!match) throw new Error('CALIBRATION_CONTRACT_BLOCK_MISSING');
  try { return JSON.parse(match[1]); }
  catch { throw new Error('CALIBRATION_CONTRACT_JSON_INVALID'); }
}

function extractBootReceipt(content) {
  const marker = '```yaml\nCENTRALDARK_AI_BOOT:';
  const start = content.indexOf(marker);
  if (start < 0) throw new Error('BOOT_RECEIPT_MISSING');
  const end = content.indexOf('\n```', start + marker.length);
  if (end < 0) throw new Error('BOOT_RECEIPT_UNCLOSED');
  return parseFlatYamlBlock(content.slice(start + '```yaml\n'.length, end), 'CENTRALDARK_AI_BOOT');
}

function listFiles(relativeDirectory = '.') {
  const output = [];
  const walk = (relative) => {
    let entries;
    try { entries = readdirSync(join(ROOT, relative), { withFileTypes: true }); }
    catch { return; }
    for (const entry of entries) {
      if (entry.isSymbolicLink() || ['.git', 'node_modules', 'dist', 'build'].includes(entry.name)) continue;
      const candidate = posix.join(relative === '.' ? '' : relative, entry.name);
      if (entry.isDirectory()) walk(candidate);
      else output.push(candidate);
    }
  };
  walk(relativeDirectory);
  return output;
}

function hasTrigger(content) { return content.includes('#ACORDA') || content.includes('!CALIBRAR'); }
function looksOperationalTrigger(content) {
  if (!hasTrigger(content)) return false;
  return unsafeTriggerDirective(content) ||
    /^#{2,6}[^\n]*(?:#ACORDA|!CALIBRAR)/im.test(content) ||
    /(?:quando|ao receber|se receber)[^\n]{0,120}(?:#ACORDA|!CALIBRAR)/i.test(content) ||
    /(?:#ACORDA|!CALIBRAR)[^\n]{0,160}(?:execute|executar|devolva|retorne|use|continue|ignore|formato)/i.test(content);
}
function hasDelegationNearby(lines, index) {
  const window = lines.slice(Math.max(0, index - 2), Math.min(lines.length, index + 7)).join('\n');
  return /LEIA-ME-IA\.md/i.test(window) && /(?:se[cç][aã]o|secao|§)\s*1\.2/i.test(window);
}
function unsafeTriggerDirective(content) {
  const patterns = [
    /(?:use|utilize|reutilize|trate)\s+(?:o\s+)?(?:contexto|mem[oó]ria|estado)\s+(?:anterior|antigo)\s+como\s+estado\s+atual/i,
    /ignore\s+(?:a\s+)?(?:delega[cç][aã]o|se[cç][aã]o\s*1\.2|LEIA-ME-IA)/i,
    /(?:sa[ií]da|serializa[cç][aã]o|formato)\s+(?:pr[oó]prio|alternativo|diferente)/i,
    /(?<!n[aã]o\s)continue\s+(?:normalmente|por\s+suposi[cç][aã]o)/i,
  ];
  return patterns.some((pattern) => pattern.test(content));
}

function validateTriggerDocuments(errors) {
  const candidates = new Set(PROTOCOLOS_OBRIGATORIOS);
  for (const adapter of ADAPTADORES) if (exists(adapter) && hasTrigger(read(adapter))) candidates.add(adapter);
  for (const file of listFiles()) {
    if (!/\.(?:md|mdc)$/.test(file) && file !== '.windsurfrules') continue;
    if (file === PORTA || IGNORE_TRIGGER_SCAN.some((pattern) => pattern.test(file))) continue;
    if (looksOperationalTrigger(read(file))) candidates.add(file);
  }

  const documents = [];
  for (const file of [...candidates].sort()) {
    if (!exists(file)) {
      errors.push(`PROTOCOLO_ATIVO_AUSENTE:${file}`);
      documents.push({ path: file, exists: false, delegates: false, concurrent: false });
      continue;
    }
    const content = read(file);
    const lines = content.split(/\r?\n/);
    const triggerIndexes = lines.map((line, index) => hasTrigger(line) ? index : -1).filter((index) => index >= 0);
    const delegates = triggerIndexes.length > 0 && triggerIndexes.every((index) => hasDelegationNearby(lines, index));
    const concurrent = unsafeTriggerDirective(content) || !delegates;
    if (!delegates) errors.push(`PROTOCOLO_SEM_DELEGACAO_CANONICA:${file}`);
    if (concurrent) errors.push(`PROTOCOLO_DEFINICAO_CONCORRENTE:${file}`);
    documents.push({ path: file, exists: true, delegates, concurrent, trigger_lines: triggerIndexes.map((i) => i + 1) });
  }
  return { obrigatorios: PROTOCOLOS_OBRIGATORIOS, descobertos: [...candidates].sort(), documentos: documents, ok: documents.every((item) => item.exists && item.delegates && !item.concurrent) };
}

function validateCalibration(errors) {
  const content = read(PORTA);
  let frontmatter = {};
  let boot = {};
  let contract = {};
  let section = '';
  let sectionHash = '';
  let expectedHash = '';
  try { frontmatter = parseFrontmatter(content); }
  catch (error) { errors.push(`PORTA_${error.message}`); }
  try { boot = extractBootReceipt(content); }
  catch (error) { errors.push(`PORTA_${error.message}`); }
  try {
    section = extractSection(content);
    contract = extractMarkedJson(section);
  } catch (error) { errors.push(`PORTA_${error.message}`); }

  if (section) sectionHash = hash(section);
  const identity = read(CALIBRATION_HASH).trim().split(/\s+/)[0] || '';
  if (SHA256.test(identity)) expectedHash = identity;
  else errors.push('CALIBRATION_HASH_INVALID');

  const frontmatterOk = frontmatter.source_of_truth === EXPECTED_SOURCE;
  const bootOk = boot.source_of_truth === EXPECTED_SOURCE && boot.observed_state === EXPECTED_OBSERVED && boot.agentic_school === 'LOADED';
  const contractOk = assertEqual(contract, EXPECTED_CONTRACT);
  const hashOk = Boolean(sectionHash && expectedHash && sectionHash === expectedHash);
  if (!frontmatterOk) errors.push('PORTA_SOURCE_OF_TRUTH_DIVERGENTE');
  if (!bootOk) errors.push('PORTA_BOOT_RECEIPT_INVALID');
  if (!contractOk) errors.push('PORTA_CALIBRATION_CONTRACT_DIVERGENTE');
  if (!hashOk) errors.push('PORTA_CALIBRATION_SECTION_HASH_DIVERGENTE');

  return {
    triggers: contract.triggers || [], reentry_guard: contract.reentry_guard || null,
    frontmatter_ok: frontmatterOk, boot_receipt_ok: bootOk, contract_ok: contractOk,
    section_sha256: sectionHash, expected_section_sha256: expectedHash, section_hash_ok: hashOk,
    output_fields: contract.required_output_fields || [], ok: frontmatterOk && bootOk && contractOk && hashOk,
  };
}

function validateAdapters(errors) {
  const required = [PORTA, CONTRATO_DELTA, 'CENTRALDARK_AI_BOOT', '.agents/skills/meta-lupa/SKILL.md', IDENTIDADE_LUPA];
  const details = [];
  for (const adapter of ADAPTADORES) {
    if (!exists(adapter)) {
      errors.push(`ADAPTADOR_AUSENTE:${adapter}`);
      details.push({ path: adapter, exists: false, ok: false });
      continue;
    }
    const content = read(adapter);
    const missing = required.filter((token) => !content.includes(token));
    for (const token of missing) errors.push(`ADAPTADOR_SEM_TOKEN:${adapter}:${token}`);
    if (/SKILL_COMMIT_SHA\s*:/i.test(content)) errors.push(`ADAPTADOR_COM_SHA_COPIADO:${adapter}`);
    details.push({ path: adapter, exists: true, missing, ok: missing.length === 0 });
  }
  return details;
}

function validateSchool(errors) {
  const required = [SCHOOL_SKILL, SCHOOL_LOADER,
    '.agents/skills/agentic-ci-loop/references/school.manifest.json',
    '.agents/skills/agentic-ci-loop/references/REFATORACAO-CRITICA-ZERO-REGRESSAO.md',
    '.agents/skills/agentic-ci-loop/references/SOURCE-CURSO-SKILLS-ORIGINAL.txt.gz.base64'];
  const missing = required.filter((path) => !exists(path));
  for (const path of missing) errors.push(`AGENTIC_SCHOOL_PATH_MISSING:${path}`);
  const boot = read(PORTA);
  if (!boot.includes(SCHOOL_SKILL) || !boot.includes(SCHOOL_LOADER)) errors.push('AGENTIC_SCHOOL_NOT_REACHABLE');
  return { required, missing, ok: missing.length === 0 && boot.includes(SCHOOL_SKILL) && boot.includes(SCHOOL_LOADER) };
}

const errors = [];
const warnings = [];
if (!exists(PORTA)) errors.push(`PORTA_AUSENTE:${PORTA}`);
if (!exists(CALIBRATION_HASH)) errors.push(`CALIBRATION_HASH_AUSENTE:${CALIBRATION_HASH}`);
if (!CALIBRATION_ONLY && !PROTOCOL_ONLY && !exists(CONTRATO_DELTA)) errors.push(`CONTRATO_DELTA_AUSENTE:${CONTRATO_DELTA}`);
if (!CALIBRATION_ONLY && !PROTOCOL_ONLY && !exists(IDENTIDADE_LUPA)) errors.push(`IDENTIDADE_LUPA_AUSENTE:${IDENTIDADE_LUPA}`);

const calibration = validateCalibration(errors);
const protocols = CALIBRATION_ONLY ? { obrigatorios: [], descobertos: [], documentos: [], ok: true, skipped: true } : validateTriggerDocuments(errors);
const adapters = CALIBRATION_ONLY || PROTOCOL_ONLY ? [] : validateAdapters(errors);
const school = CALIBRATION_ONLY || PROTOCOL_ONLY ? { ok: true, skipped: true } : validateSchool(errors);
const report = {
  schema_version: 2,
  guardrail: 'validar-porta-de-entrada',
  mode: CALIBRATION_ONLY ? 'calibration-only' : PROTOCOL_ONLY ? 'protocol-only' : 'full',
  porta: PORTA,
  calibracao: calibration,
  protocolos: protocols,
  adaptadores: adapters,
  escola: school,
  errors,
  warnings,
  ok: errors.length === 0 && calibration.ok && protocols.ok && school.ok,
};

if (JSON_OUT) console.log(JSON.stringify(report, null, 2));
else {
  for (const warning of warnings) console.log(`AVISO ${warning}`);
  for (const error of errors) console.error(`ERRO ${error}`);
  console.log(`PORTA_OK=${report.ok ? 1 : 0} CALIBRACAO=${calibration.ok ? 1 : 0} HASH=${calibration.section_hash_ok ? 1 : 0} PROTOCOLOS=${protocols.ok ? 1 : 0} ESCOLA=${school.ok ? 1 : 0} ERROS=${errors.length}`);
}
process.exit(report.ok ? 0 : 1);
