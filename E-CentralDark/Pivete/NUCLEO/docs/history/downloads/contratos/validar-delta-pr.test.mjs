import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import test from 'node:test';
import { validarMudanca } from '../core/validar-mapa.mjs';

function git(cwd, ...args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
}

function write(root, relativePath, content) {
  const target = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content, 'utf8');
}

const map = {
  schema_version: 1,
  source_of_truth: 'apps/modulos/mapeamento/config/mapa-canonico.json',
  approval_label: 'permito-segredo',
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
  historical_roots: [],
  validation_entrypoints: ['scripts/validar.mjs'],
  sectors: [{ id: 'execucao', label: 'EXECUÇÃO', paths: ['apps/modulos/existente/'] }],
  consolidated_areas: [{ path: 'apps/modulos/protegido/', reason: 'fixture' }],
};

test('mede somente o delta do PR quando base e head divergiram', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'centraldark-pr-delta-'));
  git(root, 'init', '-q');
  git(root, 'config', 'user.email', 'test@centraldark.local');
  git(root, 'config', 'user.name', 'CentralDark Test');

  write(root, 'apps/modulos/existente/index.mjs', 'export default true;\n');
  write(root, 'apps/modulos/protegido/index.mjs', 'export default true;\n');
  write(root, 'LEIA-ME.md', '# porta\n');
  write(root, 'AGENTS.md', 'LEIA-ME.md\n');
  git(root, 'add', '.');
  git(root, 'commit', '-qm', 'ancestral comum');
  const ancestor = git(root, 'rev-parse', 'HEAD');

  git(root, 'checkout', '-qb', 'feature', ancestor);
  write(root, 'docs/ajuste.md', '# delta real do PR\n');
  git(root, 'add', '.');
  git(root, 'commit', '-qm', 'feature');
  const headSha = git(root, 'rev-parse', 'HEAD');

  git(root, 'checkout', '-q', '-');
  write(root, 'apps/modulos/protegido/index.mjs', 'export default "main mudou";\n');
  git(root, 'add', '.');
  git(root, 'commit', '-qm', 'main mudou lock depois da bifurcação');
  const baseSha = git(root, 'rev-parse', 'HEAD');

  const result = validarMudanca({ repoRoot: root, baseSha, headSha, approved: false, map });

  assert.equal(result.diffBaseSha, ancestor);
  assert.deepEqual(result.changed.map(item => item.file), ['docs/ajuste.md']);
  assert.deepEqual(result.touchedLocks, []);
  assert.equal(result.ok, true, result.erros.join('\n'));
});
