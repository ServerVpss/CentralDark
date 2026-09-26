# CONTRATO - portable-kernel.test.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\scripts\lupa\portable-kernel.test.mjs
**SHA:** b94ad75e35ea7909
**Timestamp:** 2026-08-28T02:57:36.107454
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- const RESPONSE_PATTERN = join(ROOT, 'docs/CONSCIENCIA/2026-06-20-padrao-resposta-pivete.md');
- const pattern = readFileSync(RESPONSE_PATTERN, 'utf8');
- const pattern = readFileSync(RESPONSE_PATTERN, 'utf8');
- const pattern = readFileSync(RESPONSE_PATTERN, 'utf8');

### Contratos
- const CONTRACT = join(ROOT, 'docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json');
- const contract = JSON.parse(readFileSync(CONTRACT, 'utf8'));

### Ouro Bruto (primeiros 5000 chars)
```
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import test from 'node:test';

const ROOT = resolve(process.cwd());
const SCRIPT = join(ROOT, 'scripts/lupa/portable-kernel.mjs');
const CONTRACT = join(ROOT, 'docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json');
const RESPONSE_PATTERN = join(ROOT, 'docs/CONSCIENCIA/2026-06-20-padrao-resposta-pivete.md');
const SOUL = join(ROOT, 'docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md');
const COGNITION = join(ROOT, 'docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/CAPACIDADES-COGNITIVAS.md');
const ORCHESTRATION = join(ROOT, 'docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md');
const PROOF_OWNERSHIP = join(ROOT, 'docs/CONSCIENCIA/PROOF-OWNERSHIP.json');
const METACOGNITION = 'docs/CONSCIENCIA/METACOGNICAO-OPERACIONAL.md';

function run(args = []) {
  return execFileSync(process.execPath, [SCRIPT, '--repo-root', ROOT, ...args], {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function git(root, args) {
  return execFileSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function materializeBundleAsRepo(bundle, root) {
  for (const member of bundle.members) {
    const target = join(root, member.path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, member.content, 'utf8');
  }
  git(root, ['init', '-q']);
  git(root, ['config', 'user.email', 'portable-kernel@test.local']);
  git(root, ['config', 'user.name', 'Portable Kernel Test']);
  git(root, ['add', '.']);
  git(root, ['commit', '-q', '-m', 'fixture']);
}

test('decência operacional preserva crédito sem transformar crédito em autoridade ou prova', () => {
  const soul = readFileSync(SOUL, 'utf8');
  const soulMarkers = [
    'CREDITO_FICA_COM_QUEM_MERECE=true',
    'DELTA_FICA_COM_QUEM_PROVOU=true',
    'NINGUEM_PRECISA_PERDER_PARA_A_CASA_GANHAR=true',
    'CREDIT_IS_ATTRIBUTION_NOT_AUTHORITY=true',
    'CREDIT_IS_NOT_PROOF=true',
    'CREDIT_PRESERVATION_REQUIRED=true',
    'COMPETITION=0',
    'RESPECT=ON',
    'CREDIT=PRESERVED',
    'REALITY=JUDGE',
    'NO_WINNER_LOSER_FRAMING=true',
    'REALITY_JUDGES_CLAIMS_NOT_PEOPLE=true',
    'MULTIPLE_CREDITS_CAN_COEXIST=true',
  ];
  for (const marker of soulMarkers) assert.ok(soul.includes(marker), `missing SOUL marker ${marker}`);

  const proof = JSON.parse(readFileSync(PROOF_OWNERSHIP, 'utf8'));
  const proofRules = proof.global_rules ?? {};
  assert.equal(proofRules.credit_attribution_is_not_proof_ownership, true);
  assert.equal(proofRules.credit_does_not_confer_authority, true);
  assert.equal(proofRules.credit_does_not_prove_claim, true);
  assert.equal(proofRules.source_credit_must_preserve_provenance, true);
  assert.equal(proofRules.proof_credit_requires_observed_proof_contribution, true);
  assert.equal(proofRules.proof_ownership_must_not_erase_source_credit, true);
  assert.equal(proofRules.reputation_cannot_receive_unobserved_proof_credit, true);
  assert.equal(proofRules.multiple_material_credits_can_coexist, true);
  assert.equal(proofRules.reality_judges_claims_not_people, true);

  const pattern = readFileSync(RESPONSE_PATTERN, 'utf8');
  const responseMarkers = [
    'CREDIT_PRESERVATION_VISIBLE_REQUIRED=true',
    'NO_FALSE_SELF_ORIGIN=true',
    'CREDIT_DOES_NOT_CONFER_AUTHORITY=true',
    'CREDIT_IS_NOT_PROOF=true',
    'NO_WINNER_LOSER_FRAMING=true',
    'REALITY_JUDGES_CLAIMS_NOT_PEOPLE=true',
  ];
  for (const marker of responseMarkers) assert.ok(pattern.includes(marker), `missing response marker ${marker}`);

  const orchestration = readFileSync(ORCHESTRATION, 'utf8');
  assert.ok(orchestration.includes('MODEL_VOTE=FORBIDDEN_AS_TRUTH_MECHANISM'));
  assert.ok(orchestration.includes('NAME_OR_REPUTATION=PROVENANCE_NOT_AUTHORITY'));
  assert.ok(orchestration.includes('CONFLICT → TEST → EVIDENCE → REALITY_DECIDES'));

  const cognition = readFileSync(COGNITION, 'utf8');
  assert.ok(cognition.includes('SOURCE_IS_PROVENANCE_NOT_AUTHORITY=true'));
  assert.ok(cognition.includes('ABSORPTION_WITHOUT_VALIDATION=UNPROVEN'));
  assert.ok(cognition.includes('Proveniência preserva autoria sem virar dependência.'));
});

test('trabalhar estudar e ensinar é contrato obrigatório e transversal antes da camada simples', () => {
  const pattern = readFileSync(RESPONSE_PATTERN, 'utf8');
  const required = [
    'WORK_STUDY_TEACH_REQUIRED=true',
    'WORK_STUDY_TEACH_TRIGGER=NONTRIVIAL_TECHNICAL_OR_EXPLANATORY_RESPONSE',
    'WORK_RESULT_REMAINS_PRIMARY=true',
    'NOVICE_MENTAL_MAP_REQUIRED=true',
    'DIFFICULT_TERM_TRANSLATION_REQUIRED=true',
    'TEACHING_FROM_EVIDENCE_AND_RESULT=true',
    'PRIVATE_REASONING_DISCLOSURE_REQUIRED=false',
    'SCHOOL_LAYER_POSITION=BEFORE_SIMPLE_FINAL_LAYER
```