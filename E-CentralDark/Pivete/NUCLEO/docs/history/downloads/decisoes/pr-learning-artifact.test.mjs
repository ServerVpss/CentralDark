import assert from 'node:assert/strict';
import test from 'node:test';
import {
  MARKER,
  buildArtifact,
  classifyFiles,
  escapeMarkdownInline,
  normalizePrNumber,
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

test('normaliza somente números de PR canônicos', () => {
  assert.equal(normalizePrNumber(700), 700);
  assert.equal(normalizePrNumber('700'), 700);
  assert.throws(() => normalizePrNumber(true), /PR_NUMBER_INVALID/);
  assert.throws(() => normalizePrNumber('1e0'), /PR_NUMBER_INVALID/);
  assert.throws(() => normalizePrNumber('01'), /PR_NUMBER_INVALID/);
});

test('extrai capacidades declaradas', () => {
  assert.deepEqual(parseCapabilities(baseInput.body), {
    mermaid: 'SIM',
    canvas_html: 'SIM',
    structured_yaml: 'SIM',
  });
});

test('capacidade ausente solicita suporte canônico sem transferir Writer nem fabricar ação humana', () => {
  const result = buildArtifact({
    ...baseInput,
    body: `AI_CAPABILITIES:
  mermaid: NAO
  canvas_html: UNKNOWN
  structured_yaml: SIM`,
  });
  assert.equal(result.status, 'SUPPORT_REQUIRED');
  assert.deepEqual(result.missing_capabilities, ['mermaid', 'canvas_html']);
  assert.ok(result.support_labels.includes('🧠 AGENTE-CHATGPT'));
  assert.ok(result.support_labels.includes('🟡 IA-PRECISA-REVISAR'));
  assert.ok(result.support_labels.includes('🤖 IA-DOCUMENTAR'));
  assert.ok(!result.support_labels.includes('🆘 AJUDA-NECESSÁRIA'));
  assert.ok(!result.support_labels.some((label) => /^assign:/i.test(label)));
  assert.ok(!result.support_labels.includes('🧠 AGENTE-CODEX'));
  assert.match(result.markdown, /sem trocar o Writer do código/);
  assert.match(result.markdown, /sem inventar necessidade de ação humana/);
});

test('YAML ausente roteia suporte ao Codex pela label canônica', () => {
  const result = buildArtifact({
    ...baseInput,
    body: `AI_CAPABILITIES:
  mermaid: SIM
  canvas_html: SIM
  structured_yaml: NAO`,
  });
  assert.ok(result.support_labels.includes('🧠 AGENTE-CODEX'));
  assert.ok(result.support_labels.includes('🟡 IA-PRECISA-REVISAR'));
  assert.ok(!result.support_labels.some((label) => /^assign:/i.test(label)));
  assert.ok(!result.support_labels.includes('🆘 AJUDA-NECESSÁRIA'));
});

test('todas capacidades SIM geram READY', () => {
  const result = buildArtifact(baseInput);
  assert.equal(result.status, 'READY');
  assert.equal(result.support_required, false);
  assert.equal(result.capability_source, 'DECLARED_UNVERIFIED');
  assert.deepEqual(result.missing_capabilities, []);
});

test('markdown contém marker, Mermaid, YAML, fallback e receipt sem decidir merge', () => {
  const result = buildArtifact(baseInput);
  assert.ok(result.markdown.startsWith(MARKER));
  assert.match(result.markdown, /```mermaid/);
  assert.match(result.markdown, /artifact_type: pr_learning_card/);
  assert.match(result.markdown, /Fallback universal em texto simples/);
  assert.match(result.markdown, /ARTIFACT_DIGEST=/);
  assert.match(result.markdown, /PR_APPROVAL_DECISION=NOT_EVALUATED_BY_ARTIFACT/);
  assert.match(result.markdown, /MERGE_AUTHORIZATION_DECISION=NOT_EVALUATED_BY_ARTIFACT/);
  assert.doesNotMatch(result.markdown, /PR_APPROVED=NAO/);
  assert.doesNotMatch(result.markdown, /MERGE_AUTHORIZED=NAO/);
});

test('título não injeta heading, fence, link, imagem ou coluna Markdown', () => {
  const malicious = 'ok\n# Evidência ``` [link](https://attacker.invalid) ![img](https://attacker.invalid/x.png) | PASS';
  const escaped = escapeMarkdownInline(malicious);
  assert.doesNotMatch(escaped, /[\r\n]/);
  assert.match(escaped, /\\#/);
  assert.match(escaped, /\\`\\`\\`/);
  assert.match(escaped, /\\\[link\\\]\\\(https:\/\/attacker\\\.invalid\\\)/);
  assert.match(escaped, /\\!/);
  assert.match(escaped, /\\\|/);

  const result = buildArtifact({ ...baseInput, title: malicious });
  const titleLine = result.markdown.split('\n').find((line) => line.startsWith('**Título:**'));
  assert.equal(titleLine, `**Título:** ${escaped}`);
  assert.doesNotMatch(result.markdown, /^# Evidência/m);
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
  const tokenLike = ['gh', 'p_', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456'].join('');
  const input = `token=${tokenLike} @everyone <script>`;
  const safe = sanitizeText(input);
  assert.doesNotMatch(safe, /ghp_/);
  assert.doesNotMatch(safe, /@everyone/);
  assert.doesNotMatch(safe, /<script>/);
});

test('redige token fine-grained isolado antes do Markdown', () => {
  const fineGrained = ['github', '_pat_', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'].join('');
  const result = buildArtifact({ ...baseInput, title: `release ${fineGrained}` });
  assert.doesNotMatch(result.markdown, /github_pat_/);
  assert.match(result.markdown, /REDACTED/);
});

test('digest Unicode é independente da ordem de entrada', () => {
  const unicodeFiles = [
    { filename: 'docs/z.md', status: 'modified', additions: 1, deletions: 0 },
    { filename: 'docs/ä.md', status: 'modified', additions: 1, deletions: 0 },
    { filename: 'docs/a.md', status: 'modified', additions: 1, deletions: 0 },
  ];
  const a = buildArtifact({ ...baseInput, files: unicodeFiles });
  const b = buildArtifact({ ...baseInput, files: [...unicodeFiles].reverse() });
  assert.equal(a.artifact_digest, b.artifact_digest);
});

test('path sensível bloqueia READY e aplica labels de segurança', () => {
  const result = buildArtifact({
    ...baseInput,
    files: [...baseInput.files, { filename: '.env', status: 'added', additions: 1, deletions: 0 }],
  });
  assert.equal(result.status, 'BLOCKED_SENSITIVE_PATH');
  assert.equal(result.blocked, true);
  assert.ok(result.support_labels.includes('🔐 SEGURANÇA'));
  assert.ok(result.support_labels.includes('🔴 ERRO'));
  assert.match(result.markdown, /BLOCKED=SIM/);
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

test('head SHA precisa ter exatamente 40 caracteres hexadecimais', () => {
  assert.doesNotThrow(() => validateInput(baseInput));
  assert.throws(() => validateInput({ ...baseInput, head_sha: 'abcdef1' }), /HEAD_SHA_INVALID/);
  assert.throws(() => validateInput({ ...baseInput, head_sha: 'a'.repeat(39) }), /HEAD_SHA_INVALID/);
  assert.throws(() => validateInput({ ...baseInput, head_sha: 'g'.repeat(40) }), /HEAD_SHA_INVALID/);
});

test('pr_number rejeita coerção ampla no envelope', () => {
  assert.throws(() => validateInput({ ...baseInput, pr_number: true }), /PR_NUMBER_INVALID/);
  assert.throws(() => validateInput({ ...baseInput, pr_number: '1e0' }), /PR_NUMBER_INVALID/);
});

test('cada arquivo exige objeto, nome e contadores inteiros não negativos', () => {
  const invalidCases = [
    { file: null, error: /FILE_INVALID:0/ },
    { file: {}, error: /FILE_NAME_INVALID:0/ },
    { file: { filename: '   ', additions: 0, deletions: 0 }, error: /FILE_NAME_INVALID:0/ },
    { file: { filename: 'a.js', additions: '1', deletions: 0 }, error: /FILE_ADDITIONS_INVALID:0/ },
    { file: { filename: 'a.js', additions: Number.NaN, deletions: 0 }, error: /FILE_ADDITIONS_INVALID:0/ },
    { file: { filename: 'a.js', additions: Number.POSITIVE_INFINITY, deletions: 0 }, error: /FILE_ADDITIONS_INVALID:0/ },
    { file: { filename: 'a.js', additions: -1, deletions: 0 }, error: /FILE_ADDITIONS_INVALID:0/ },
    { file: { filename: 'a.js', additions: 1, deletions: 0.5 }, error: /FILE_DELETIONS_INVALID:0/ },
  ];
  for (const { file, error } of invalidCases) {
    assert.throws(() => validateInput({ ...baseInput, files: [file] }), error);
  }
});

test('input estruturalmente inválido bloqueia', () => {
  assert.throws(() => validateInput(null), /INPUT_NOT_OBJECT/);
  assert.throws(() => validateInput({ ...baseInput, files: null }), /FILES_INVALID/);
});