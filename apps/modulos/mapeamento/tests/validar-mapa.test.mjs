import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import test from 'node:test';
import { normalizarCaminho, validarDocumentoMapa, validarMudanca } from '../core/validar-mapa.mjs';

const baseMap = {
  schema_version: 1,
  source_of_truth: 'apps/modulos/mapeamento/config/mapa-canonico.json',
  approval_label: 'permito-pivete',
  sectors: [{ id: 'execucao', label: 'EXECUÇÃO', paths: ['apps/modulos/existente/'] }],
  consolidated_areas: [{ path: 'apps/modulos/protegido/', reason: 'teste' }],
};

function git(cwd, ...args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
}

function repoTemporario() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'centraldark-map-'));
  git(root, 'init', '-q');
  git(root, 'config', 'user.email', 'test@centraldark.local');
  git(root, 'config', 'user.name', 'CentralDark Test');
  fs.mkdirSync(path.join(root, 'apps/modulos/existente'), { recursive: true });
  fs.mkdirSync(path.join(root, 'apps/modulos/protegido'), { recursive: true });
  fs.writeFileSync(path.join(root, 'apps/modulos/existente/index.mjs'), 'export default true;\n');
  fs.writeFileSync(path.join(root, 'apps/modulos/protegido/index.mjs'), 'export default true;\n');
  git(root, 'add', '.');
  git(root, 'commit', '-qm', 'base');
  return root;
}

test('rejeita travessia mesmo quando normalize produziria caminho interno', () => {
  assert.throws(() => normalizarCaminho('apps/modulos/a/../b/'), /inválido/);
});

test('rejeita caminho duplicado no mapa', () => {
  const map = structuredClone(baseMap);
  map.sectors[0].paths.push('apps/modulos/EXISTENTE/');
  assert.match(validarDocumentoMapa(map).join('\n'), /duplicado/i);
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
  assert.match(result.erros.join('\n'), /área consolidada/i);
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
  fs.mkdirSync(path.join(root, 'apps/modulos/duplicado-v2'), { recursive: true });
  fs.writeFileSync(path.join(root, 'apps/modulos/duplicado-v2/index.mjs'), 'export default true;\n');
  git(root, 'add', '.');
  git(root, 'commit', '-qm', 'change');
  const headSha = git(root, 'rev-parse', 'HEAD');
  const result = validarMudanca({ repoRoot: root, baseSha, headSha, approved: true, map: baseMap });
  assert.equal(result.ok, false);
  assert.match(result.erros.join('\n'), /versão paralela/);
  assert.match(result.erros.join('\n'), /fora do mapa/);
});
