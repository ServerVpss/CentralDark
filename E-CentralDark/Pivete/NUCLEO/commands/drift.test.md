# COMANDO - drift.test.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\scripts\sentinela\drift.test.mjs
**SHA:** 76d3e240eb948eec
**Timestamp:** 2026-08-28T02:57:39.007535
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- if (typeof pattern === 'string' ? key.includes(pattern) : pattern.test(key)) {

### Ouro Bruto (primeiros 5000 chars)
```
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateDrift, toDivergencia, describeRecovery, sanitizeForLog, isFullSha } from './drift.mjs';

const SHA_A = 'a'.repeat(40);
const SHA_B = 'b'.repeat(40);

function makeGit(responses) {
  const calls = [];
  const git = (args) => {
    calls.push(args.join(' '));
    const key = args.join(' ');
    for (const [pattern, result] of responses) {
      if (typeof pattern === 'string' ? key.includes(pattern) : pattern.test(key)) {
        if (result instanceof Error) throw result;
        return result;
      }
    }
    throw new Error(`unmocked git call: ${key}`);
  };
  git.calls = calls;
  return git;
}

function baseResponses({ localSha = SHA_A, originSha = SHA_A, branch = 'main', dirty = '', counts = '0 0' } = {}) {
  return [
    ['rev-parse --is-inside-work-tree', 'true\n'],
    ['fetch --quiet', ''],
    ['symbolic-ref --quiet --short HEAD', `${branch}\n`],
    [/rev-parse HEAD$/, `${localSha}\n`],
    [/rev-parse origin\/main$/, `${originSha}\n`],
    ['status --porcelain', dirty],
    ['rev-list --left-right --count', `${counts}\n`],
    ['log --oneline', ''],
  ];
}

test('1. mesmo SHA local e origin/main -> OK', () => {
  const git = makeGit(baseResponses());
  const r = evaluateDrift({ repoPath: '/repo', git });
  assert.equal(r.status, 'OK');
  assert.equal(r.code, 'ESTADO_OK');
});

test('2. VPS atrás da main -> DRIFT VPS_ATRASADA', () => {
  const git = makeGit(baseResponses({ localSha: SHA_A, originSha: SHA_B, counts: '0 3' }));
  const r = evaluateDrift({ repoPath: '/repo', git });
  assert.equal(r.status, 'DRIFT');
  assert.equal(r.code, 'VPS_ATRASADA');
  assert.equal(r.behind, 3);
});

test('3. VPS à frente da main -> DRIFT VPS_ADIANTADA', () => {
  const git = makeGit(baseResponses({ localSha: SHA_A, originSha: SHA_B, counts: '2 0' }));
  const r = evaluateDrift({ repoPath: '/repo', git });
  assert.equal(r.status, 'DRIFT');
  assert.equal(r.code, 'VPS_ADIANTADA');
  assert.equal(r.ahead, 2);
});

test('4. divergência nos dois sentidos -> DRIFT DIVERGENCIA_DUPLA', () => {
  const git = makeGit(baseResponses({ localSha: SHA_A, originSha: SHA_B, counts: '2 3' }));
  const r = evaluateDrift({ repoPath: '/repo', git });
  assert.equal(r.status, 'DRIFT');
  assert.equal(r.code, 'DIVERGENCIA_DUPLA');
});

test('5. branch local diferente -> DRIFT BRANCH_DIVERGENTE', () => {
  const git = makeGit(baseResponses({ branch: 'chore/gateway-providers-routes' }));
  const r = evaluateDrift({ repoPath: '/repo', git });
  assert.equal(r.status, 'DRIFT');
  assert.equal(r.code, 'BRANCH_DIVERGENTE');
});

test('6. working tree suja -> DRIFT WORKING_TREE_SUJA', () => {
  const git = makeGit(baseResponses({ dirty: ' M apps/modulos/mcp/dist/index.js\n' }));
  const r = evaluateDrift({ repoPath: '/repo', git });
  assert.equal(r.status, 'DRIFT');
  assert.equal(r.code, 'WORKING_TREE_SUJA');
  assert.equal(r.dirty, true);
});

test('7. checkout ausente -> erro rastreável, nunca falso verde', () => {
  const git = makeGit([['rev-parse --is-inside-work-tree', new Error('fatal: not a git repository')]]);
  const r = evaluateDrift({ repoPath: '/nao/existe', git });
  assert.equal(r.status, 'ERROR');
  assert.equal(r.code, 'CHECKOUT_AUSENTE');
});

test('8. git indisponível -> erro rastreável distinto de checkout ausente', () => {
  const err = new Error('git: command not found');
  err.code = 'ENOENT';
  const git = makeGit([['rev-parse --is-inside-work-tree', err]]);
  const r = evaluateDrift({ repoPath: '/repo', git });
  assert.equal(r.status, 'ERROR');
  assert.equal(r.code, 'GIT_INDISPONIVEL');
});

test('9. fetch falha -> ERROR, nunca OK silencioso (sem falso verde)', () => {
  const git = makeGit([
    ['rev-parse --is-inside-work-tree', 'true\n'],
    ['fetch --quiet', new Error('fatal: unable to access origin: Could not resolve host')],
  ]);
  const r = evaluateDrift({ repoPath: '/repo', git });
  assert.equal(r.status, 'ERROR');
  assert.equal(r.code, 'FETCH_FALHOU');
});

test('10. saída com dados incompletos -> rejeitar (SHA inválido)', () => {
  const git = makeGit(baseResponses({ localSha: '' , originSha: SHA_A }));
  const r = evaluateDrift({ repoPath: '/repo', git });
  assert.equal(r.status, 'ERROR');
  assert.equal(r.code, 'DADOS_INCOMPLETOS');
});

test('11. alerta repetido idêntico -> mesma chave real de dedupe (run.mjs hasheia area+titulo)', () => {
  const git = makeGit(baseResponses({ localSha: SHA_A, originSha: SHA_B, counts: '0 1' }));
  const r1 = toDivergencia(evaluateDrift({ repoPath: '/repo', git }));
  const r2 = toDivergencia(evaluateDrift({ repoPath: '/repo', git }));
  assert.equal(r1.area, r2.area);
  assert.equal(r1.titulo, r2.titulo);
  assert.doesNotMatch(r1.titulo, /\d{4}-\d{2}-\d{2}T/, 'titulo não pode conter timestamp — quebraria o dedupe');
});

test('12. estado volta ao normal -> registra recuperação', () => {
  const previousSnapshot = { vpsDrift: { status: 'DRIFT', code: 'VPS_ATRASADA' } 
```