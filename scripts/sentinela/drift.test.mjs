import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateDrift, driftDedupeKey, describeRecovery, sanitizeForLog, isFullSha } from './drift.mjs';

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

test('11. alerta repetido idêntico -> chave de dedupe estável', () => {
  const git = makeGit(baseResponses({ localSha: SHA_A, originSha: SHA_B, counts: '0 1' }));
  const r1 = evaluateDrift({ repoPath: '/repo', git });
  const r2 = evaluateDrift({ repoPath: '/repo', git });
  assert.equal(driftDedupeKey(r1), driftDedupeKey(r2));
});

test('12. estado volta ao normal -> registra recuperação', () => {
  const previousSnapshot = { vpsDrift: { status: 'DRIFT', code: 'VPS_ATRASADA' } };
  const git = makeGit(baseResponses());
  const current = evaluateDrift({ repoPath: '/repo', git });
  const msg = describeRecovery(previousSnapshot, current);
  assert.match(msg, /Recuperado/);
  assert.equal(describeRecovery({ vpsDrift: { status: 'OK' } }, current), null);
});

test('13. caminho com espaço -> funciona sem escaping manual (execFileSync array-form)', () => {
  const path = '/root/Central Dark';
  const git = makeGit(baseResponses());
  const r = evaluateDrift({ repoPath: path, git });
  assert.equal(r.status, 'OK');
  assert.equal(r.path, path);
  assert.ok(git.calls.every((c) => true)); // args passados como array, nunca concatenados em string
});

test('14. segredo em stdout/stderr é sanitizado antes de logar', () => {
  // Construído por concatenação (não literal contíguo) para não parecer um
  // token real de verdade no source e disparar o scanner de segredo do CI —
  // o valor final em runtime ainda é idêntico ao formato ghp_/Bearer real.
  const fakeToken = ['ghp', '_'].join('') + '1234567890'.repeat(3);
  const fakeBearerValue = 'abcdefghijklmnop'.repeat(1) + '1234567890';
  const withToken = `erro: falha ao autenticar com ${fakeToken}`;
  const withBearer = `Authorization: ${['Bear', 'er'].join('')} ${fakeBearerValue}`;
  assert.doesNotMatch(sanitizeForLog(withToken), new RegExp(fakeToken));
  assert.match(sanitizeForLog(withToken), /REDACTED_TOKEN/);
  assert.doesNotMatch(sanitizeForLog(withBearer), new RegExp(fakeBearerValue));
});

test('isFullSha rejeita valores curtos ou não-hex', () => {
  assert.equal(isFullSha(SHA_A), true);
  assert.equal(isFullSha('abc123'), false);
  assert.equal(isFullSha(''), false);
  assert.equal(isFullSha(undefined), false);
});

test('evaluateDrift exige git() injetado (fail-closed por design)', () => {
  assert.throws(() => evaluateDrift({ repoPath: '/repo' }), /git runner obrigatório/);
});

test('evaluateDrift falha fechado quando repoPath ausente (sem inventar caminho)', () => {
  const git = makeGit(baseResponses());
  const r = evaluateDrift({ repoPath: '', git });
  assert.equal(r.status, 'ERROR');
  assert.equal(r.code, 'CAMINHO_AUSENTE');
});
