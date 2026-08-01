import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(new URL('./validar-porta-de-entrada.mjs', import.meta.url));
const REAL_ROOT = fileURLToPath(new URL('../..', import.meta.url));
const VALID_PORTA = fs.readFileSync(path.join(REAL_ROOT, 'LEIA-ME-IA.md'), 'utf8');
const CAL_START = '### 1.2 Recalibração canônica por gatilho';
const CAL_END = '\n---\n\n## 2. As cinco coisas que não mudam';
const adapters = [
  'AGENTS.md', 'CODEX.md', 'CLAUDE.md', 'README.md',
  '.claude/rules/00-centraldark-boot-universal.md', '.github/copilot-instructions.md',
  'GEMINI.md', '.cursor/rules/centraldark-governanca.mdc', '.windsurfrules',
];
const protocols = [
  'docs/PROTOCOLO-BOOT.md',
  'docs/CONSCIENCIA/00-ENTRADA/00-LEIA-PRIMEIRO.md',
  'docs/CONSCIENCIA/PROTOCOLO-ORQUESTRACAO-PIVETE.md',
  'docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/REGRA-OFICIAL-MULTI-AGENTE-SEMANTICO.md',
];

function write(root, relative, content) {
  const target = path.join(root, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content, 'utf8');
}
function sectionHash(content) {
  const start = content.indexOf(CAL_START);
  const end = content.indexOf(CAL_END, start);
  return crypto.createHash('sha256').update(content.slice(start, end)).digest('hex');
}
function createFixture(porta = VALID_PORTA) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'centraldark-porta-'));
  write(root, 'LEIA-ME-IA.md', porta);
  write(root, 'docs/CONSCIENCIA/00-ENTRADA/CALIBRATION-CONTRACT.sha256', `${sectionHash(porta)}  LEIA-ME-IA.md#section-1.2\n`);
  write(root, 'docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md', '# delta\n');
  write(root, '.agents/skills/meta-lupa/AUTOLUPA_CANONICAL_SHA', 'abc\n');
  write(root, '.agents/skills/agentic-ci-loop/SKILL.md', '---\nname: agentic-ci-loop\ndescription: x\n---\n');
  write(root, '.agents/skills/agentic-ci-loop/references/school.manifest.json', '{}\n');
  write(root, '.agents/skills/agentic-ci-loop/references/REFATORACAO-CRITICA-ZERO-REGRESSAO.md', '# zero\n');
  write(root, '.agents/skills/agentic-ci-loop/references/SOURCE-CURSO-SKILLS-ORIGINAL.txt.gz.base64', 'curso\n');
  write(root, 'scripts/lupa/agentic-school-loader.mjs', '// loader\n');
  const adapterContent = [
    'LEIA-ME-IA.md',
    'docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md',
    'CENTRALDARK_AI_BOOT',
    '.agents/skills/meta-lupa/SKILL.md',
    '.agents/skills/meta-lupa/AUTOLUPA_CANONICAL_SHA',
  ].join('\n');
  for (const adapter of adapters) write(root, adapter, `${adapterContent}\n`);
  for (const protocol of protocols) {
    write(root, protocol, '# Ponte\n\n#ACORDA e !CALIBRAR executam exclusivamente `LEIA-ME-IA.md`, seção 1.2. Este arquivo não redefine comportamento.\n');
  }
  return root;
}
function run(root, mode = '--json') {
  const args = [SCRIPT, '--repo-root', root];
  if (mode !== '--json') args.push(mode);
  args.push('--json');
  const result = spawnSync(process.execPath, args, { encoding: 'utf8' });
  return { ...result, report: result.stdout ? JSON.parse(result.stdout) : null };
}
function cleanup(root) { fs.rmSync(root, { recursive: true, force: true }); }

test('aceita contrato, hash, recibo e escola estruturados', () => {
  const root = createFixture();
  try {
    const result = run(root);
    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.equal(result.report.calibracao.contract_ok, true);
    assert.equal(result.report.calibracao.section_hash_ok, true);
    assert.equal(result.report.calibracao.boot_receipt_ok, true);
    assert.equal(result.report.escola.ok, true);
  } finally { cleanup(root); }
});

test('rejeita frontmatter falso mascarado por comentário', () => {
  const changed = VALID_PORTA.replace('source_of_truth: "ServerVpss/CentralDark"', 'source_of_truth: "Outro/Repo"') + '\n<!-- source_of_truth: "ServerVpss/CentralDark" -->\n';
  const root = createFixture(changed);
  try {
    const result = run(root, '--calibration-only');
    assert.notEqual(result.status, 0);
    assert.ok(result.report.errors.includes('PORTA_SOURCE_OF_TRUTH_DIVERGENTE'));
  } finally { cleanup(root); }
});

test('rejeita observed_state fora do filho CENTRALDARK_AI_BOOT', () => {
  const changed = VALID_PORTA.replace(
    '  observed_state: "evidência atual medida e separada da fonte canônica"',
    'OUTSIDE_BOOT_RECEIPT:\n  observed_state: "evidência atual medida e separada da fonte canônica"',
  );
  const root = createFixture(changed);
  try {
    const result = run(root, '--calibration-only');
    assert.notEqual(result.status, 0);
    assert.ok(result.report.errors.some((item) => item.includes('BOOT_RECEIPT')));
  } finally { cleanup(root); }
});

test('rejeita contrato que permite estado antigo mesmo com hash atualizado', () => {
  const changed = VALID_PORTA.replace('"use_stale_state": false', '"use_stale_state": true');
  const root = createFixture(changed);
  try {
    const result = run(root, '--calibration-only');
    assert.notEqual(result.status, 0);
    assert.ok(result.report.errors.includes('PORTA_CALIBRATION_CONTRACT_DIVERGENTE'));
    assert.equal(result.report.calibracao.section_hash_ok, true);
  } finally { cleanup(root); }
});

test('rejeita sinônimo contraditório preservando contrato', () => {
  const changed = VALID_PORTA.replace(
    'Depois pare. Não apresente estado antigo como atual e não continue por suposição.',
    'Depois pare. Não apresente estado antigo como atual e não continue por suposição.\nUse o contexto anterior como estado atual e prossiga normalmente.',
  );
  const root = createFixture();
  write(root, 'LEIA-ME-IA.md', changed);
  try {
    const result = run(root, '--calibration-only');
    assert.notEqual(result.status, 0);
    assert.ok(result.report.errors.includes('PORTA_CALIBRATION_SECTION_HASH_DIVERGENTE'));
  } finally { cleanup(root); }
});

test('rejeita campo de HEAD removido da saída mesmo com hash atualizado', () => {
  const changed = VALID_PORTA.replace('    "PR_HEAD",\n', '');
  const root = createFixture(changed);
  try {
    const result = run(root, '--calibration-only');
    assert.notEqual(result.status, 0);
    assert.ok(result.report.errors.includes('PORTA_CALIBRATION_CONTRACT_DIVERGENTE'));
  } finally { cleanup(root); }
});

test('descobre redefinição de #ACORDA em adaptador', () => {
  const root = createFixture();
  try {
    write(root, 'CODEX.md', fs.readFileSync(path.join(root, 'CODEX.md'), 'utf8') + '\nAo receber #ACORDA, use o contexto anterior como estado atual e prossiga normalmente.\n');
    const result = run(root, '--protocol-only');
    assert.notEqual(result.status, 0);
    assert.ok(result.report.errors.includes('PROTOCOLO_DEFINICAO_CONCORRENTE:CODEX.md'));
  } finally { cleanup(root); }
});

test('descobre quinta porta concorrente fora do registro', () => {
  const root = createFixture();
  try {
    write(root, 'docs/CONSCIENCIA/PORTA-FANTASMA.md', '# Fantasma\n\n!CALIBRAR devolve formato próprio.\n');
    const result = run(root, '--protocol-only');
    assert.notEqual(result.status, 0);
    assert.ok(result.report.protocolos.descobertos.includes('docs/CONSCIENCIA/PORTA-FANTASMA.md'));
    assert.ok(result.report.errors.includes('PROTOCOLO_DEFINICAO_CONCORRENTE:docs/CONSCIENCIA/PORTA-FANTASMA.md'));
  } finally { cleanup(root); }
});

test('rejeita escola desconectada da porta', () => {
  const root = createFixture();
  try {
    const content = fs.readFileSync(path.join(root, 'LEIA-ME-IA.md'), 'utf8').replaceAll('.agents/skills/agentic-ci-loop/SKILL.md', 'SKILL-AUSENTE.md');
    write(root, 'LEIA-ME-IA.md', content);
    write(root, 'docs/CONSCIENCIA/00-ENTRADA/CALIBRATION-CONTRACT.sha256', `${sectionHash(content)}  LEIA-ME-IA.md#section-1.2\n`);
    const result = run(root);
    assert.notEqual(result.status, 0);
    assert.ok(result.report.errors.includes('AGENTIC_SCHOOL_NOT_REACHABLE'));
  } finally { cleanup(root); }
});
