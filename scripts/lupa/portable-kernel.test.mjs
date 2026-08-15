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
    'SCHOOL_LAYER_POSITION=BEFORE_SIMPLE_FINAL_LAYER',
    'SCHOOL_LAYER_MUST_NOT_HIDE_BLOCKED_OR_UNKNOWN=true',
    'TEACHING_IS_TRANSVERSAL_EXECUTION_BEHAVIOR=true',
    'TEACHING_IS_NOT_SEPARATE_MISSION=true',
    'WORK_AND_TEACH_SHARE_SAME_EXECUTION=true',
    'DEPTH_FIRST=true',
    'COMPRESSION_AFTER=true',
    'COMPRESSION_MUST_PRESERVE_PRECISION=true',
    'EVERY_APPLICABLE_EXECUTION_CAN_TEACH=true',
    'TEACHING_IS_DERIVED_ARTIFACT=true',
    'TEACHING_IS_NOT_RUNTIME_PROOF=true',
    'TEACHING_IS_NOT_SECOND_TRUTH=true',
  ];
  for (const marker of required) assert.ok(pattern.includes(marker), `missing ${marker}`);

  const schoolIndex = pattern.indexOf('## Escola operacional embutida — trabalhar, estudar e ensinar');
  const simpleIndex = pattern.indexOf('## Camada final obrigatória — NO TEU MODO, SIMPLES');
  const depthIndex = pattern.indexOf('DEPTH_FIRST=true');
  const compressionIndex = pattern.indexOf('COMPRESSION_AFTER=true');
  assert.ok(schoolIndex >= 0, 'missing school layer section');
  assert.ok(simpleIndex > schoolIndex, 'simple layer must remain after school layer');
  assert.ok(depthIndex >= 0 && compressionIndex > depthIndex, 'compression must remain after depth');
  assert.ok(pattern.includes('PROCESS_TELEMETRY != RESULT'), 'transversal teaching must not turn process telemetry into result');
});

test('camada final simples é contrato obrigatório do sistema', () => {
  const pattern = readFileSync(RESPONSE_PATTERN, 'utf8');
  const required = [
    'SIMPLE_FINAL_LAYER_REQUIRED=true',
    'SIMPLE_FINAL_LAYER_TRIGGER=NONTRIVIAL_TECHNICAL_OR_EXPLANATORY_RESPONSE',
    'SIMPLE_FINAL_LAYER_POSITION=LAST',
    'SIMPLE_FINAL_LAYER_LABEL=NO_TEU_MODO_SIMPLES',
    'SIMPLE_FINAL_LAYER_FIELDS=O_QUE_E|O_QUE_MUDOU|PRA_QUE_SERVE',
    'SIMPLE_FINAL_LAYER_MUST_NOT_HIDE_BLOCKED_OR_UNKNOWN=true',
    'SIMPLE_LAYER_IS_TRANSLATION_NOT_SECOND_TRUTH=true',
  ];
  for (const marker of required) assert.ok(pattern.includes(marker), `missing ${marker}`);
});

test('imagem é sensor e nunca substitui medição viva', () => {
  const contract = JSON.parse(readFileSync(CONTRACT, 'utf8'));
  const image = contract.multimodal_input_policy;
  assert.equal(image.marker, 'IMAGE_INPUT_IS_OPERATIONAL');
  assert.equal(image.image_is_sensor, true);
  assert.equal(image.screenshot_is_current_truth, false);
  assert.equal(image.screenshot_is_trigger_for_live_measurement, true);
  assert.equal(image.live_state_required_before_mutation, true);
  assert.equal(image.material_visual_finding_action, 'REMEASURE_LIVE_SOURCE_THEN_ACT_MINIMALLY');
});

test('kernel FULL deriva DNA condensado e hashes do mesmo HEAD vivo', () => {
  const temp = mkdtempSync(join(tmpdir(), 'centraldark-portable-full-'));
  const rel = join(temp, 'bundle.json');
  try {
    const receipt = JSON.parse(run(['--export', rel, '--json']));
    assert.equal(receipt.ok, true);
    assert.equal(receipt.status, 'PASS');
    assert.equal(receipt.mode, 'FULL');
    assert.equal(receipt.image_sensor_policy, 'PASS');
    assert.equal(receipt.portable_boot_policy, 'PASS');
    assert.equal(receipt.runtime_claim, 'UNPROVEN_BY_PORTABLE_KERNEL');
    assert.match(receipt.head_sha, /^[0-9a-f]{40}$/i);
    assert.match(receipt.capability_dna_sha256, /^[0-9a-f]{64}$/i);
    assert.match(receipt.source_fingerprint_sha256, /^[0-9a-f]{64}$/i);
    assert.ok(receipt.members >= 19);
    assert.ok(receipt.capabilities >= 12);
    assert.ok(receipt.condensed_dna_bytes < receipt.source_bytes);

    const bundle = JSON.parse(readFileSync(rel, 'utf8'));
    assert.equal(bundle.schema_version, 2);
    assert.equal(bundle.head_sha, receipt.head_sha);
    assert.equal(bundle.package_is_cache_not_authority, true);
    assert.equal(bundle.stale_package_action, 'REBUILD_FROM_LIVE_REPOSITORY');
    assert.equal(bundle.import_rule, 'DELTA_ONLY_AFTER_LIVE_REMEASURE_WRITER_SCOPE_AND_INDEPENDENT_JUDGE');
    assert.equal(bundle.load_strategy, 'DNA_FIRST_SOURCE_ON_DEMAND');
    assert.equal(bundle.condensed_dna.marker, 'CENTRALDARK_CONDENSED_DNA');
    assert.equal(bundle.condensed_dna.authority, 'SEGREDO/CHEFE');
    assert.equal(bundle.condensed_dna.proof_boundary.does_not_prove.includes('RUNTIME_EFFECT'), true);
    assert.equal(bundle.condensed_dna.proof_boundary.does_not_prove.includes('AGI_OR_CONSCIOUSNESS'), true);
    assert.equal(bundle.condensed_dna.capabilities.length, receipt.capabilities);
    assert.ok(bundle.condensed_dna.capabilities.every((item) => item.state === 'SOURCE_VERIFIED_IN_REPO'));
    assert.ok(bundle.condensed_dna.capabilities.every((item) => item.runtime_state === 'UNPROVEN_BY_PORTABLE_KERNEL'));
    assert.ok(bundle.members.every((item) => /^[0-9a-f]{64}$/i.test(item.sha256)));
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});

test('kernel COMPACT reproduz o mesmo DNA sem carregar conteúdo integral dos owners', () => {
  const temp = mkdtempSync(join(tmpdir(), 'centraldark-portable-compact-'));
  const fullPath = join(temp, 'full.json');
  const compactPath = join(temp, 'compact.json');
  try {
    const fullReceipt = JSON.parse(run(['--export', fullPath, '--json']));
    const compactReceipt = JSON.parse(run(['--export', compactPath, '--compact', '--json']));
    const full = JSON.parse(readFileSync(fullPath, 'utf8'));
    const compact = JSON.parse(readFileSync(compactPath, 'utf8'));

    assert.equal(compactReceipt.status, 'PASS');
    assert.equal(compactReceipt.mode, 'COMPACT');
    assert.equal(compact.package_id, 'CENTRALDARK_PORTABLE_KERNEL_COMPACT');
    assert.equal(compact.head_sha, full.head_sha);
    assert.equal(compact.capability_dna_sha256, fullReceipt.capability_dna_sha256);
    assert.equal(compact.source_fingerprint_sha256, fullReceipt.source_fingerprint_sha256);
    assert.deepEqual(compact.condensed_dna, full.condensed_dna);
    assert.equal(compact.load_strategy, 'DNA_FIRST_SOURCE_ON_DEMAND');
    assert.ok(compact.sources.length >= 19);
    assert.ok(compact.sources.every((item) => !Object.hasOwn(item, 'content')));
    assert.ok(compact.sources.every((item) => /^[0-9a-f]{64}$/i.test(item.sha256)));
    assert.ok(Buffer.byteLength(readFileSync(compactPath)) < Buffer.byteLength(readFileSync(fullPath)));
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});

test('DNA fail-closed se um owner perder marcador de capacidade condensada', () => {
  const temp = mkdtempSync(join(tmpdir(), 'centraldark-portable-drift-'));
  const bundlePath = join(temp, 'bundle.json');
  const fixtureRoot = join(temp, 'repo');
  try {
    run(['--export', bundlePath, '--json']);
    const bundle = JSON.parse(readFileSync(bundlePath, 'utf8'));
    mkdirSync(fixtureRoot, { recursive: true });
    materializeBundleAsRepo(bundle, fixtureRoot);

    const metacognitionPath = join(fixtureRoot, METACOGNITION);
    const original = readFileSync(metacognitionPath, 'utf8');
    assert.ok(original.includes('META_EVALUATION_REQUIRED=true'));
    writeFileSync(
      metacognitionPath,
      original.replaceAll('META_EVALUATION_REQUIRED=true', 'META_EVALUATION_REQUIRED=false'),
      'utf8',
    );

    const result = spawnSync(
      process.execPath,
      [SCRIPT, '--repo-root', fixtureRoot, '--json'],
      { cwd: fixtureRoot, encoding: 'utf8' },
    );
    assert.equal(result.status, 2);
    const failure = JSON.parse(result.stdout);
    assert.equal(failure.status, 'BLOCKED');
    assert.equal(failure.code, 'CAPABILITY_MARKER_MISSING');
    assert.equal(failure.capability, 'CROSS_META_EVOLUTION');
    assert.equal(failure.owner, METACOGNITION);
    assert.deepEqual(failure.missing, ['META_EVALUATION_REQUIRED=true']);
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});
