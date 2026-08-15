import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { buildDreamProposal } from './dream-review.mjs';
import {
  classifyArtifact,
  compileArtifactCapability,
  compileArtifactToDreamEvent,
  loadArtifactForMining,
} from './artifact-capability.mjs';

const HEAD = 'a'.repeat(40);
const WHEN = '2026-08-15T21:40:00Z';
const TARGET = 'scripts/memory-linker/';

test('manual externo vira candidato SKILL em quarentena, nunca autoridade', () => {
  const result = compileArtifactToDreamEvent({
    artifactPath: 'endpoint-security.pdf',
    mime: 'application/pdf',
    content: [
      'Safety: remove excess administrator privilege.',
      'Step 1: apply least privilege.',
      'Warning: application control and monitoring remain required.',
      'Maintenance: review endpoint posture periodically.',
      'Troubleshooting: investigate EDR errors before recovery.',
    ].join('\n'),
    source: 'https://example.invalid/endpoint-security.pdf',
    sourceClass: 'HUMAN_AUTHORITY',
    target: TARGET,
    headSha: HEAD,
    sessionId: 'artifact-manual',
    eventTime: WHEN,
    observedAt: WHEN,
  });

  assert.equal(result.contract.status, 'CANDIDATE');
  assert.equal(result.contract.source_is_authority, false);
  assert.equal(result.contract.direct_skill_write, false);
  assert.equal(result.contract.execute_artifact, false);
  const signalIds = result.contract.capability_signals.map((item) => item.id);
  assert.ok(signalIds.includes('SAFETY_CONSTRAINTS'));
  assert.ok(signalIds.includes('PROCEDURE'));
  assert.ok(signalIds.includes('PRIVILEGE_OR_PERMISSION'));

  const proposal = buildDreamProposal([result.dream_event], { headSha: HEAD });
  assert.equal(proposal.candidate_count, 1);
  assert.equal(proposal.candidates[0].kind, 'SKILL');
  assert.equal(proposal.candidates[0].promotion.status, 'QUARANTINE');
  assert.equal(proposal.candidates[0].promotion.auto_absorb_eligible, false);
  assert.equal(proposal.direct_canonical_mutation, false);
});

test('EXE sem interface não é executado nem tem capacidade inventada', () => {
  const result = compileArtifactToDreamEvent({
    artifactPath: 'tool.exe',
    mime: 'application/x-msdownload',
    metadata: { sha256: 'b'.repeat(64), size_bytes: 4096, binary: true },
    source: 'artifact:tool.exe',
    target: TARGET,
    headSha: HEAD,
    sessionId: 'artifact-exe-no-interface',
    eventTime: WHEN,
    observedAt: WHEN,
  });

  assert.equal(result.contract.artifact.class, 'EXECUTABLE_BINARY');
  assert.equal(result.contract.status, 'INSUFFICIENT_EVIDENCE');
  assert.equal(result.contract.execute_artifact, false);
  assert.equal(result.dream_event, null);
  assert.ok(result.contract.needs.includes('INTERFACE_OR_HELP_OR_OBSERVED_INVOCATION'));
});

test('EXE com help documentado vira somente skill-wrapper candidata', () => {
  const result = compileArtifactToDreamEvent({
    artifactPath: 'tool.exe',
    metadata: {
      sha256: 'c'.repeat(64),
      size_bytes: 8192,
      binary: true,
      help_text: 'Usage: tool.exe scan --input <path>\nOptions: --timeout <ms>\nError: exit code 2 means invalid input.',
    },
    source: 'internal:tool-help',
    sourceClass: 'INTERNAL',
    target: TARGET,
    headSha: HEAD,
    sessionId: 'artifact-exe-help',
    eventTime: WHEN,
    observedAt: WHEN,
  });

  assert.equal(result.contract.status, 'CANDIDATE');
  const signalIds = result.contract.capability_signals.map((item) => item.id);
  assert.ok(signalIds.includes('EXECUTABLE_WRAPPER'));
  assert.ok(signalIds.includes('CLI_INTERFACE'));
  assert.ok(signalIds.includes('ERROR_CONTRACT'));
  assert.equal(result.contract.direct_skill_write, false);
  assert.equal(result.contract.apply_allowed, false);
});

test('OpenAPI vira contrato de integração candidato sem copiar API inteira', () => {
  const content = JSON.stringify({
    openapi: '3.1.0',
    paths: { '/status': { get: { responses: { 200: { description: 'ok' } } } } },
  });
  assert.equal(classifyArtifact({ artifactPath: 'openapi.json', content }), 'API_SPEC');
  const result = compileArtifactCapability({ artifactPath: 'openapi.json', content, source: 'internal:openapi', target: TARGET });
  assert.equal(result.status, 'CANDIDATE');
  assert.ok(result.capability_signals.some((item) => item.id === 'API_CONTRACT'));
  assert.ok(result.capability_signals.length < 10);
});

test('capacidade detectada sem owner não fabrica owner', () => {
  const result = compileArtifactCapability({
    artifactPath: 'manual.txt',
    content: 'Safety: validate input. Step 1: inspect. Error: fail explicitly.',
    source: 'external:manual',
  });
  assert.equal(result.status, 'OWNER_UNRESOLVED');
  assert.equal(result.target_owner, null);
  assert.equal(result.direct_canonical_mutation, false);
});

test('loader lê binário como minério passivo, calcula hash e não interpreta bytes como texto', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'artifact-capability-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const file = path.join(dir, 'sample.exe');
  fs.writeFileSync(file, Buffer.from([0x4d, 0x5a, 0x00, 0x01, 0x02, 0x03]));
  const loaded = loadArtifactForMining(file);
  assert.equal(loaded.content, '');
  assert.equal(loaded.metadata.binary, true);
  assert.match(loaded.metadata.sha256, /^[0-9a-f]{64}$/);
  assert.equal(loaded.metadata.size_bytes, 6);
});
