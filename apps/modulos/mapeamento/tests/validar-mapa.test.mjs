import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import test from 'node:test';
import {
  CONSOLIDATION_PROOF_DEPENDENCIES,
  normalizarCaminho,
  resumirConsolidacoes,
  temSegmentoAdjacenteDuplicado,
  validarDocumentoMapa,
  validarMudanca,
  validarProvaConsolidacao,
  validarRepositorioGlobal,
} from '../core/validar-mapa.mjs';

const baseMap = {
  schema_version: 1,
  source_of_truth: 'apps/modulos/mapeamento/config/mapa-canonico.json',
  approval_label: '👑 PERMITO-SEGREDO',
  rules: {},
  consolidation_evidence_policy: {
    enabled: true,
    legacy_without_proof: 'PROTECTED_UNPROVEN',
    efficacy_100_requires_denominator: true,
  },
  canonical_contracts: [{
    id: 'fixture',
    source: 'LEIA-ME.md',
    consumers: ['AGENTS.md'],
    required_tokens: ['LEIA-ME.md'],
  }],
  forbidden_roots: [],
  historical_roots: ['docs/RELATORIOS/'],
  validation_entrypoints: ['scripts/validar.mjs'],
  sectors: [{ id: 'execucao', label: 'EXECUÇÃO', paths: ['apps/modulos/existente/'] }],
  consolidated_areas: [{ path: 'apps/modulos/protegido/', reason: 'teste' }],
};

function provaValida({
  headSha = 'a'.repeat(40),
  materialGitOid = 'b'.repeat(40),
  dependencyGitOids = Object.fromEntries(CONSOLIDATION_PROOF_DEPENDENCIES.map(item => [item, 'c'.repeat(40)])),
} = {}) {
  return {
    head_sha: headSha,
    material_git_oid: materialGitOid,
    dependency_git_oids: dependencyGitOids,
    evidence_ref: 'ci:run-123',
    writer_ref: 'writer:gpt-5-6-sol',
    judge_ref: 'judge:independente',
    counterproof_ref: 'test:negative-123',
    rollback_ref: 'git:revert-ready',
    lock_mechanism: 'MAP_PROTECTED_PATH',
    tests: { passed: 5, total: 5, skipped: 0 },
    efficacy: { numerator: 5, denominator: 5, percent: 100 },
  };
}

function git(cwd, ...args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
}

function write(root, relativePath, content) {
  const target = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content, 'utf8');
}

function initRepo(root) {
  git(root, 'init', '-q');
  git(root, 'config', 'user.email', 'test@centraldark.local');
  git(root, 'config', 'user.name', 'CentralDark Test');
}

function dependencyOidsAt(root, ref) {
  return Object.fromEntries(CONSOLIDATION_PROOF_DEPENDENCIES.map(item => [item, git(root, 'rev-parse', `${ref}:${item}`)]));
}

function repoTemporario() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'centraldark-map-'));
  initRepo(root);
  write(root, 'apps/modulos/existente/index.mjs', 'export default true;\n');
  write(root, 'apps/modulos/protegido/index.mjs', 'export default true;\n');
  write(root, 'apps/modulos/mapeamento/core/validar-mapa.mjs', '// proof gate fixture\n');
  write(root, '.agents/skills/meta-lupa/SKILL.md', '# Meta Lupa fixture\n');
  write(root, 'LEIA-ME.md', '# porta\n');
  write(root, 'AGENTS.md', 'LEIA-ME.md\n');
  git(root, 'add', '.');
  git(root, 'commit', '-qm', 'base');
  return root;
}

function repoGovernancaTemporario() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'centraldark-governanca-'));
  initRepo(root);
  const skillPath = '.agents/skills/meta-lupa/SKILL.md';
  const identityPath = '.agents/skills/meta-lupa/AUTOLUPA_CANONICAL_SHA';
  write(root, skillPath, '# META LUPA\n');
  const blob = git(root, 'hash-object', skillPath);
  write(root, identityPath, `${blob}  ${skillPath}\n`);
  write(root, 'LEIA-ME-IA.md', `${skillPath}\n${identityPath}\nCENTRALDARK_AI_BOOT\n`);
  write(root, 'AGENTS.md', `LEIA-ME-IA.md\n${skillPath}\n${identityPath}\nCENTRALDARK_AI_BOOT\n`);
  write(root, 'scripts/validar.mjs', 'process.exit(0);\n');
  write(root, '.github/workflows/check.yml', 'run: node scripts/validar.mjs\n');
  git(root, 'add', '.');
  git(root, 'commit', '-qm', 'base');

  const map = {
    ...structuredClone(baseMap),
    canonical_contracts: [
      {
        id: 'porta',
        source: 'LEIA-ME-IA.md',
        consumers: ['AGENTS.md'],
        required_tokens: ['LEIA-ME-IA.md', 'CENTRALDARK_AI_BOOT'],
      },
      {
        id: 'meta-lupa',
        source: identityPath,
        target: skillPath,
        identity: 'git_blob_sha1',
        consumers: ['LEIA-ME-IA.md', 'AGENTS.md'],
        required_tokens: [skillPath, identityPath],
        forbidden_tokens: ['SKILL_COMMIT_SHA:'],
      },
    ],
    forbidden_roots: [{
      path: 'docs/CONSCIENCIA/CONSCIENCIA/',
      canonical: 'docs/CONSCIENCIA/',
      reason: 'fixture',
    }],
  };
  return { root, map, skillPath, identityPath };
}

test('rejeita travessia mesmo quando normalize produziria caminho interno', () => {
  assert.throws(() => normalizarCaminho('apps/modulos/a/../b/'), /inválido/);
});

test('rejeita caminho duplicado no mapa', () => {
  const map = structuredClone(baseMap);
  map.sectors[0].paths.push('apps/modulos/EXISTENTE/');
  assert.match(validarDocumentoMapa(map).join('\n'), /duplicado/i);
});

test('detecta segmento adjacente repetido em qualquer raiz', () => {
  assert.equal(temSegmentoAdjacenteDuplicado('docs/CONSCIENCIA/CONSCIENCIA/README.md'), true);
  assert.equal(temSegmentoAdjacenteDuplicado('docs/CONSCIENCIA/README.md'), false);
});

test('legado sem prova continua protegido mas não recebe selo PROVEN', () => {
  assert.equal(validarDocumentoMapa(baseMap).length, 0);
  assert.deepEqual(validarProvaConsolidacao(baseMap.consolidated_areas[0]), {
    status: 'PROTECTED_UNPROVEN',
    errors: [],
  });
  const summary = resumirConsolidacoes(baseMap);
  assert.equal(summary.proven.length, 0);
  assert.equal(summary.protected_unproven.length, 1);
  assert.equal(summary.invalid.length, 0);
});

test('selo PROVEN exige prova fechada, fingerprint material/dependências, Judge independente e eficácia 100/100', () => {
  const map = structuredClone(baseMap);
  map.consolidated_areas[0].proof = provaValida();
  assert.equal(validarDocumentoMapa(map).length, 0);
  assert.equal(validarProvaConsolidacao(map.consolidated_areas[0]).status, 'PROVEN');
  const summary = resumirConsolidacoes(map);
  assert.equal(summary.proven.length, 1);
  assert.equal(summary.protected_unproven.length, 0);
});

test('rejeita selo PROVEN sem fingerprint material ou das dependências', () => {
  const map = structuredClone(baseMap);
  map.consolidated_areas[0].proof = provaValida();
  delete map.consolidated_areas[0].proof.material_git_oid;
  delete map.consolidated_areas[0].proof.dependency_git_oids;
  const errors = validarDocumentoMapa(map).join('\n');
  assert.match(errors, /material_git_oid inválido/);
  assert.match(errors, /dependency_git_oids ausente/);
  assert.equal(resumirConsolidacoes(map).invalid.length, 1);
});

test('rejeita alegação de 100% sem denominador reproduzível', () => {
  const map = structuredClone(baseMap);
  map.consolidated_areas[0].proof = provaValida();
  map.consolidated_areas[0].proof.efficacy.denominator = 0;
  const errors = validarDocumentoMapa(map).join('\n');
  assert.match(errors, /denominador válido/);
  assert.equal(resumirConsolidacoes(map).invalid.length, 1);
});

test('rejeita selo com Judge igual ao Writer ou teste SKIPPED', () => {
  const map = structuredClone(baseMap);
  map.consolidated_areas[0].proof = provaValida();
  map.consolidated_areas[0].proof.judge_ref = map.consolidated_areas[0].proof.writer_ref;
  map.consolidated_areas[0].proof.tests.skipped = 1;
  const errors = validarDocumentoMapa(map).join('\n');
  assert.match(errors, /devem ser independentes/);
  assert.match(errors, /SKIPPED/);
});

test('preserva PROVEN fora das dependências e invalida só alvo ou mecanismo probatório tocado', () => {
  const root = repoTemporario();
  const proofHead = git(root, 'rev-parse', 'HEAD');
  const protectedPath = 'apps/modulos/protegido';
  const materialGitOid = git(root, 'rev-parse', `${proofHead}:${protectedPath}`);
  const map = structuredClone(baseMap);
  map.consolidated_areas[0].proof = provaValida({
    headSha: proofHead,
    materialGitOid,
    dependencyGitOids: dependencyOidsAt(root, proofHead),
  });

  const original = validarProvaConsolidacao(map.consolidated_areas[0], { repoRoot: root, headSha: proofHead });
  assert.equal(original.status, 'PROVEN', original.errors.join('\n'));

  fs.appendFileSync(path.join(root, 'apps/modulos/existente/index.mjs'), '// mudança fora do alvo e da prova\n');
  git(root, 'add', '.');
  git(root, 'commit', '-qm', 'unrelated');
  const unrelatedHead = git(root, 'rev-parse', 'HEAD');
  const preserved = validarProvaConsolidacao(map.consolidated_areas[0], { repoRoot: root, headSha: unrelatedHead });
  assert.equal(preserved.status, 'PROVEN', preserved.errors.join('\n'));

  const proofDependency = CONSOLIDATION_PROOF_DEPENDENCIES[0];
  fs.appendFileSync(path.join(root, proofDependency), '// mudança no mecanismo probatório\n');
  git(root, 'add', '.');
  git(root, 'commit', '-qm', 'proof-dependency-change');
  const dependencyHead = git(root, 'rev-parse', 'HEAD');
  const staleDependency = validarProvaConsolidacao(map.consolidated_areas[0], { repoRoot: root, headSha: dependencyHead });
  assert.equal(staleDependency.status, 'INVALID_PROOF');
  assert.match(staleDependency.errors.join('\n'), /dependência da prova mudou/);

  map.consolidated_areas[0].proof = provaValida({
    headSha: dependencyHead,
    materialGitOid: git(root, 'rev-parse', `${dependencyHead}:${protectedPath}`),
    dependencyGitOids: dependencyOidsAt(root, dependencyHead),
  });
  const proofRecovered = validarProvaConsolidacao(map.consolidated_areas[0], { repoRoot: root, headSha: dependencyHead });
  assert.equal(proofRecovered.status, 'PROVEN', proofRecovered.errors.join('\n'));

  fs.appendFileSync(path.join(root, 'apps/modulos/protegido/index.mjs'), '// mudança material\n');
  git(root, 'add', '.');
  git(root, 'commit', '-qm', 'material-change');
  const changedHead = git(root, 'rev-parse', 'HEAD');
  const stale = validarProvaConsolidacao(map.consolidated_areas[0], { repoRoot: root, headSha: changedHead });
  assert.equal(stale.status, 'INVALID_PROOF');
  assert.match(stale.errors.join('\n'), /material mudou desde a prova/);

  const blocked = validarMudanca({ repoRoot: root, baseSha: dependencyHead, headSha: changedHead, approved: true, map });
  assert.equal(blocked.ok, false);
  assert.match(blocked.erros.join('\n'), /nova prova material/);

  map.consolidated_areas[0].proof = provaValida({
    headSha: changedHead,
    materialGitOid: git(root, 'rev-parse', `${changedHead}:${protectedPath}`),
    dependencyGitOids: dependencyOidsAt(root, changedHead),
  });
  const recovered = validarMudanca({ repoRoot: root, baseSha: dependencyHead, headSha: changedHead, approved: true, map });
  assert.equal(recovered.ok, true, recovered.erros.join('\n'));
});

test('bloqueia mudança em área consolidada sem aprovação', () => {
  const root = repoTemporario();
  const baseSha = git(root, 'rev-parse', 'HEAD');
  fs.appendFileSync(path.join(root, 'apps/modulos/protegido/index.mjs'), '// mudança\n');
  git(root, 'add', '.');
  git(root, 'commit', '-qm', 'change');
  const headSha = git(root, 'rev-parse', 'HEAD');
  const result = validarMudanca({ repoRoot: root, baseSha, headSha, approved: false, map: baseMap });
  assert.equal(result.ok, false);
  assert.match(result.erros.join('\n'), /área protegida/i);
});

test('aceita área consolidada quando aprovação está presente', () => {
  const root = repoTemporario();
  const baseSha = git(root, 'rev-parse', 'HEAD');
  fs.appendFileSync(path.join(root, 'apps/modulos/protegido/index.mjs'), '// mudança\n');
  git(root, 'add', '.');
  git(root, 'commit', '-qm', 'change');
  const headSha = git(root, 'rev-parse', 'HEAD');
  assert.equal(validarMudanca({ repoRoot: root, baseSha, headSha, approved: true, map: baseMap }).ok, true);
});

test('bloqueia módulo novo fora do mapa', () => {
  const root = repoTemporario();
  const baseSha = git(root, 'rev-parse', 'HEAD');
  write(root, 'apps/modulos/duplicado-v2/index.mjs', 'export default true;\n');
  git(root, 'add', '.');
  git(root, 'commit', '-qm', 'change');
  const headSha = git(root, 'rev-parse', 'HEAD');
  const result = validarMudanca({ repoRoot: root, baseSha, headSha, approved: true, map: baseMap });
  assert.equal(result.ok, false);
  assert.match(result.erros.join('\n'), /versão paralela/);
  assert.match(result.erros.join('\n'), /fora do mapa/);
});

test('prova identidade canônica por blob Git e consumidores', () => {
  const { root, map } = repoGovernancaTemporario();
  const result = validarRepositorioGlobal({ repoRoot: root, map });
  assert.equal(result.ok, true, result.erros.join('\n'));
  assert.equal(result.canonicalContracts.length, 2);
});

test('bloqueia SHA copiado e identidade divergente', () => {
  const { root, map, identityPath, skillPath } = repoGovernancaTemporario();
  write(root, 'AGENTS.md', `LEIA-ME-IA.md\n${skillPath}\n${identityPath}\nCENTRALDARK_AI_BOOT\nSKILL_COMMIT_SHA: ${'1'.repeat(40)}\n`);
  write(root, identityPath, `${'0'.repeat(40)}  ${skillPath}\n`);
  const result = validarRepositorioGlobal({ repoRoot: root, map });
  assert.equal(result.ok, false);
  assert.match(result.erros.join('\n'), /token duplicado\/proibido/);
  assert.match(result.erros.join('\n'), /identidade HEAD divergente/);
});

test('bloqueia raiz duplicada e validação mascarada por || true', () => {
  const { root, map } = repoGovernancaTemporario();
  write(root, 'docs/CONSCIENCIA/CONSCIENCIA/README.md', '# cópia\n');
  write(root, '.github/workflows/check.yml', 'run: node scripts/validar.mjs || true\n');
  git(root, 'add', '.');
  const result = validarRepositorioGlobal({ repoRoot: root, map });
  assert.equal(result.ok, false);
  assert.match(result.erros.join('\n'), /raiz duplicada proibida/);
  assert.match(result.erros.join('\n'), /segmento de diretório repetido/);
  assert.match(result.erros.join('\n'), /falha de validação mascarada/);
});
