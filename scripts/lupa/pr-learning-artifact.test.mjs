import assert from 'node:assert/strict';
import test from 'node:test';
import {
  MARKER,
  buildArtifact,
  classifyFiles,
  normalizeTriState,
  parseCapabilities,
  sanitizeText,
  validateInput,
} from './pr-learning-artifact.mjs';

const baseInput = {
  repository: 'ServerVpss/CentralDark',
  pr_number: 700,
  head_sha: 'abcdef1234567890abcdef1234567890abcdef12',
  base_sha: '1111111111111111111111111111111111111111',
  title: 'feat: artefato de aprendizado',
  author: 'hermes-pivete',
  body: `AI_CAPABILITIES:
  mermaid: SIM
  canvas_html: SIM
  structured_yaml: SIM`,
  files: [
    { filename: '.github/workflows/pr-auto-review.yml', status: 'modified', additions: 20, deletions: 2 },
    { filename: 'scripts/lupa/pr-learning-artifact.mjs', status: 'added', additions: 200, deletions: 0 },
    { filename: 'scripts/lupa/pr-learning-artifact.test.mjs', status: 'added', additions: 80, deletions: 0 },
  ],
};

test('normaliza estados em PT-BR e inglês', () => {
  assert.equal(normalizeTriState('SIM'), 'SIM');
  assert.equal(normalizeTriState('não'), 'NAO');
  assert.equal(normalizeTriState('maybe'), 'UNKNOWN');
});

test('extrai capacidades declaradas', () => {
  assert.deepEqual(parseCapabilities(baseInput.body), {
    mermaid: 'SIM',
    canvas_html: 'SIM',
    structured_yaml: 'SIM',
  });
});

test('capacidade ausente solicita suporte sem transferir Writer', () => {
  const result = buildArtifact({
    ...baseInput,
    body: `AI_CAPABILITIES:
  mermaid: NAO
  canvas_html: UNKNOWN
  structured_yaml: SIM`,
  });
  assert.equal(result.status, 'SUPPORT_REQUIRED');
  assert.deepEqual(result.missing_capabilities, ['mermaid', 'canvas_html']);
  assert.ok(result.support_labels.includes('assign:chatgpt'));
  assert.ok(!result.support_labels.includes('assign:codex'));
  assert.match(result.markdown, /sem trocar o Writer do código/);
});

test('YAML ausente roteia suporte ao Codex', () => {
  const result = buildArtifact({
    ...baseInput,
    body: `AI_CAPABILITIES:
  mermaid: SIM
  canvas_html: SIM
  structured_yaml: NAO`,
  });
  assert.ok(result.support_labels.includes('assign:codex'));
});

test('todas capacidades SIM geram READY', () => {
  const result = buildArtifact(baseInput);
  assert.equal(result.status, 'READY');
  assert.equal(result.support_required, false);
  assert.deepEqual(result.missing_capabilities, []);
});

test('markdown contém marker, Mermaid, YAML, fallback e receipt', () => {
  const result = buildArtifact(baseInput);
  assert.ok(result.markdown.startsWith(MARKER));
  assert.match(result.markdown, /```mermaid/);
  assert.match(result.markdown, /artifact_type: pr_learning_card/);
  assert.match(result.markdown, /Fallback universal em texto simples/);
  assert.match(result.markdown, /ARTIFACT_DIGEST=/);
  assert.match(result.markdown, /PR_APPROVED=NAO/);
});

test('canvas HTML é autocontido', () => {
  const result = buildArtifact(baseInput);
  assert.match(result.html, /<canvas id="board"/);
  assert.match(result.html, /ARTEFATO ORGANIZA; TESTE E JUDGE PROVAM/);
  assert.doesNotMatch(result.html, /https?:\/\//);
});

test('digest é determinístico mesmo com ordem de arquivos diferente', () => {
  const a = buildArtifact(baseInput);
  const b = buildArtifact({ ...baseInput, files: [...baseInput.files].reverse() });
  assert.equal(a.artifact_digest, b.artifact_digest);
});

test('sanitiza tokens, chaves e menções', () => {
  const input = 'token=ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZ123456 @everyone <script>';
  const safe = sanitizeText(input);
  assert.doesNotMatch(safe, /ghp_/);
  assert.doesNotMatch(safe, /@everyone/);
  assert.doesNotMatch(safe, /<script>/);
});

test('classifica paths sensíveis sem ler conteúdo', () => {
  const categories = classifyFiles([
    { filename: '.env' },
    { filename: 'docs/README.md' },
    { filename: 'src/app.js' },
    { filename: 'src/app.test.js' },
  ]);
  assert.equal(categories.sensitive_paths, 1);
  assert.equal(categories.docs, 1);
  assert.equal(categories.tests, 1);
  assert.equal(categories.code, 1);
});

test('input inválido bloqueia', () => {
  assert.throws(() => validateInput({ pr_number: 0, head_sha: 'x', files: [] }), /PR_NUMBER_INVALID/);
  assert.throws(() => validateInput({ pr_number: 1, head_sha: 'abcdef1', files: null }), /FILES_INVALID/);
});
