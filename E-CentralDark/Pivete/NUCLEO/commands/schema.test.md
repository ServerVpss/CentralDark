# COMANDO - schema.test.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\apps\modulos\artifacts-builder\core\schema.test.mjs
**SHA:** 68d5ae64c917cefd
**Timestamp:** 2026-08-28T02:56:07.473069
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- assert.ok(errors.includes('FIELD_MISSING:title'));

### Ouro Bruto (primeiros 5000 chars)
```
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildArtifactRecord, validateArtifact, computeContentDigest, ARTIFACT_SCHEMA_VERSION } from './schema.mjs';

function baseInput(overrides = {}) {
  return {
    artifact_type: 'session-report',
    title: 'Teste',
    slug: 'teste-artefato',
    purpose: { what: 'x', why: 'y', for_whom: 'z' },
    producer: { agent: 'claude', role: 'EXECUTOR', model: 'claude-sonnet-5', writer_session: 'UNKNOWN' },
    source: { repository: 'ServerVpss/CentralDark', branch: 'main', head_sha: '1e41ea5f584cafa81618272454b180e398ab16ee', source_refs: [] },
    state: 'PROVED',
    ...overrides,
  };
}

test('schema válido — buildArtifactRecord produz validation.ok=true', () => {
  const record = buildArtifactRecord(baseInput());
  assert.equal(record.validation.ok, true);
  assert.equal(record.artifact_schema_version, ARTIFACT_SCHEMA_VERSION);
});

test('ID determinístico — mesma entrada produz o mesmo artifact_id', () => {
  const a = buildArtifactRecord(baseInput());
  const b = buildArtifactRecord(baseInput());
  assert.equal(a.artifact_id, b.artifact_id);
});

test('digest determinístico — mesmo conteúdo produz o mesmo content_digest', () => {
  const a = buildArtifactRecord(baseInput());
  const b = buildArtifactRecord(baseInput());
  assert.equal(a.content_digest, b.content_digest);
});

test('digest muda quando o conteúdo muda', () => {
  const a = buildArtifactRecord(baseInput());
  const b = buildArtifactRecord(baseInput({ title: 'Outro título' }));
  assert.notEqual(a.content_digest, b.content_digest);
});

test('manifest inválido bloqueia — campo obrigatório faltando vira erro, nunca PASS silencioso', () => {
  const { ok, errors } = validateArtifact({ artifact_type: 'x' });
  assert.equal(ok, false);
  assert.ok(errors.includes('FIELD_MISSING:title'));
});

test('secret detectado bloqueia — path sensível em source_refs vira BLOCKED', () => {
  const record = buildArtifactRecord(baseInput({
    source: { repository: 'r', branch: 'b', head_sha: '1e41ea5f584cafa81618272454b180e398ab16ee', source_refs: ['secrets/api.env'] },
  }));
  assert.equal(record.state, 'BLOCKED');
  assert.equal(record.security.sensitive_path, true);
  assert.equal(record.validation.ok, false);
});

test('path traversal / caminho sensível clássico também bloqueia (.ssh, .pem)', () => {
  const record = buildArtifactRecord(baseInput({
    source: { repository: 'r', branch: 'b', head_sha: '1e41ea5f584cafa81618272454b180e398ab16ee', source_refs: ['.ssh/id_rsa', 'certs/server.pem'] },
  }));
  assert.equal(record.state, 'BLOCKED');
});

test('UNKNOWN continua UNKNOWN — producer sem model/writer_session não vira erro silencioso nem PASS forjado', () => {
  const record = buildArtifactRecord(baseInput({ producer: { agent: 'gpt' } }));
  assert.equal(record.producer.model, 'UNKNOWN');
  assert.equal(record.producer.writer_session, 'UNKNOWN');
});

test('state inválido é rejeitado — não existe estado inventado além dos 5 canônicos', () => {
  const { ok, errors } = validateArtifact({ ...baseInput(), artifact_schema_version: ARTIFACT_SCHEMA_VERSION, state: 'CERTAINLY_DONE' });
  assert.equal(ok, false);
  assert.ok(errors.some((e) => e.startsWith('STATE_INVALID')));
});

test('head_sha malformado é rejeitado', () => {
  const { ok, errors } = validateArtifact({
    ...baseInput(),
    artifact_schema_version: ARTIFACT_SCHEMA_VERSION,
    source: { ...baseInput().source, head_sha: 'nao-e-um-sha' },
  });
  assert.equal(ok, false);
  assert.ok(errors.includes('SOURCE_HEAD_SHA_INVALID'));
});

test('computeContentDigest ignora timestamps — created_at/updated_at não afetam o digest', () => {
  const a = computeContentDigest({ artifact_type: 't', title: 'x', purpose: {}, source: {}, evidence: [], views: {} });
  const b = computeContentDigest({ artifact_type: 't', title: 'x', purpose: {}, source: {}, evidence: [], views: {}, created_at: '2000-01-01' });
  assert.equal(a, b);
});

```