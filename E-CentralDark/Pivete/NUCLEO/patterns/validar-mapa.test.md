# PADRAO - validar-mapa.test.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\centraldark\apps\modulos\mapeamento\tests\validar-mapa.test.mjs
**SHA:** 815913cf6d9dbfb9
**Timestamp:** 2026-08-28T02:54:28.625426
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- write(root, '.github/workflows/check.yml', 'run: node scripts/validar.mjs\n');
- write(root, '.github/workflows/check.yml', 'run: node scripts/validar.mjs || true\n');

### Ouro Bruto (primeiros 5000 chars)
```
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
  approval_label: 'permito-segredo',
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
  asse
```