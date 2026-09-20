import assert from 'node:assert/strict';
import test from 'node:test';
import { operationalError } from './operational-error.mjs';

test('erro operacional sempre entrega endereço mínimo e seguro', () => {
  const bearerFixture = ['Bearer', 'abcdefghijklmnopqrstuvwxyz'].join(' ');
  const githubTokenFixture = ['ghp_', 'abcdefghijklmnopqrstuvwxyz'].join('');
  const receipt = operationalError({
    component: 'catalog-sync',
    owner: 'catalog-sync',
    operation: 'github-release-scan',
    stage: 'FETCH_RELEASE',
    causeClass: 'HTTP_401',
    evidenceRef: { status: 401, authorization: bearerFixture },
    error: new Error(`${bearerFixture} ${githubTokenFixture} failed`),
    retryable: false,
    autoRecoveryAttempted: true,
    nextMachineAction: 'SURFACE_PERMISSION_WOUND',
    humanBlocker: { wound: 'conector sem acesso', location: 'GitHub App installation', action: 'liberar repo mínimo' },
  });
  assert.match(receipt.ERROR_ID, /^[0-9a-f-]{36}$/i);
  for (const key of ['COMPONENT','OWNER','OPERATION','EXACT_STAGE','CAUSE_CLASS','SAFE_ERROR','RETRYABLE','AUTO_RECOVERY_ATTEMPTED','NEXT_MACHINE_ACTION']) {
    assert.ok(Object.hasOwn(receipt, key), `missing ${key}`);
  }
  assert.equal(receipt.EVIDENCE_REF.authorization, '[REDACTED]');
  assert.ok(!receipt.SAFE_ERROR.includes('ghp_'));
  assert.equal(receipt.HUMAN_BLOCKER.FERIDA, 'conector sem acesso');
});
