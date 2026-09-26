import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import test from 'node:test';

import {
  REGISTRY,
  SOURCE,
  SOURCES,
  catalogSummary,
  exactCandidates,
  findSkills,
  inspectSkill,
  isMainEntry,
  loadCatalog,
  normalizeCapabilities,
  normalizeIndex,
  normalizeSourcePath,
  normalizeTree,
  sourceRawUrl,
} from './workshop.mjs';

const INDEX = {
  total_skills: 4,
  skills: [
    { name: 'a11y-audit', source: '../../engineering/skills/a11y-audit', category: 'engineering', description: 'Accessibility audit for web interfaces.' },
    { name: 'security-auditor', source: '../../engineering/skills/security-auditor', category: 'engineering', description: 'Security review.' },
    { name: 'arquiteto-de-empresa', source: '../../c-level-advisor/skills/arquiteto-de-empresa', category: 'c-level', description: 'Company architecture.' },
    { name: 'arquiteto-de-empresa', source: '../../c-level-advisor/arquiteto-de-empresa/skills/arquiteto-de-empresa', category: 'c-level', description: 'Second variant.' },
  ],
};

test('registro global é fechado, pinado e sem ids duplicados', () => {
  assert.equal(REGISTRY.schema_version, 1);
  assert.equal(SOURCES.length, 6);
  assert.equal(new Set(SOURCES.map((source) => source.id)).size, SOURCES.length);
  for (const source of SOURCES) assert.match(source.commit, /^[0-9a-f]{40}$/);
});

test('normaliza source externo sem deixar travessia', () => {
  assert.equal(normalizeSourcePath('../../engineering/skills/a11y-audit'), 'engineering/skills/a11y-audit');
  assert.throws(() => normalizeSourcePath('../../engineering/../secrets'), /SOURCE_PATH_INVALID/);
});

test('índice antigo continua mensurável com proveniência', () => {
  const entries = normalizeIndex(INDEX, SOURCE);
  assert.equal(entries.length, 4);
  assert.equal(entries[0].source_id, 'claude-skills');
  assert.equal(entries[0].entry_type, 'SKILL');
});

test('árvore externa vira catálogo de SKILL.md sem executar conteúdo', () => {
  const source = SOURCES.find((item) => item.id === 'claude-code-settings');
  const entries = normalizeTree({ tree: [
    { type: 'blob', path: 'skills/brainstorming/SKILL.md' },
    { type: 'blob', path: 'skills/brainstorming/notes.md' },
    { type: 'blob', path: 'outside/foo/SKILL.md' },
  ] }, source);
  assert.deepEqual(entries.map((entry) => entry.name), ['brainstorming']);
  assert.equal(entries[0].document_path, 'skills/brainstorming/SKILL.md');
});

test('capability-doc entra no mesmo catálogo com fonte e evidência', () => {
  const source = SOURCES.find((item) => item.id === 'skills-manage');
  const entries = normalizeCapabilities(source);
  assert.ok(entries.length >= 1);
  assert.equal(entries[0].entry_type, 'CAPABILITY');
  assert.equal(entries[0].document_path, 'README.md');
});

test('resumo não pinta falha de fonte como PASS', () => {
  const entries = normalizeIndex(INDEX, SOURCE);
  const summary = catalogSummary(entries, [{ status: 'PASS' }, { status: 'FAIL' }], 4);
  assert.equal(summary.catalog_status, 'DEGRADED');
  assert.equal(summary.sources_fail, 1);
});

test('busca ranqueia capacidades e skills no mesmo espaço', () => {
  const entries = [
    ...normalizeIndex(INDEX, SOURCE),
    ...normalizeCapabilities(SOURCES.find((item) => item.id === 'repowise')),
  ];
  const results = findSkills(entries, 'change risk', 3);
  assert.equal(results[0].name, 'change-risk');
});

test('mesma consulta volta pela mesma rota mesmo se a ordem de entrada mudar', () => {
  const [base] = normalizeIndex(INDEX, SOURCE);
  const rotaA = { ...base, document_path: 'engineering/skills/a-route/SKILL.md' };
  const rotaZ = { ...base, document_path: 'engineering/skills/z-route/SKILL.md' };
  const primeira = findSkills([rotaZ, rotaA], 'a11y audit', 1)[0];
  const segunda = findSkills([rotaA, rotaZ], 'a11y audit', 1)[0];
  assert.equal(primeira.document_path, 'engineering/skills/a-route/SKILL.md');
  assert.deepEqual(
    [primeira.source_id, primeira.document_path],
    [segunda.source_id, segunda.document_path],
  );
});

test('nome duplicado entre fontes permanece ambíguo', () => {
  const base = normalizeIndex(INDEX, SOURCE)[0];
  const duplicate = { ...base, source_id: 'outra-fonte' };
  assert.equal(exactCandidates([base, duplicate], 'a11y-audit').length, 2);
  assert.equal(exactCandidates([base, duplicate], 'a11y-audit', 'claude-skills').length, 1);
});

test('entrada CLI reconhece symlink para o mesmo arquivo real', () => {
  const dir = mkdtempSync(join(tmpdir(), 'skill-workshop-'));
  try {
    const target = join(dir, 'workshop real.mjs');
    const link = join(dir, 'workshop-link.mjs');
    writeFileSync(target, '// fixture\n');
    symlinkSync(target, link);
    assert.equal(isMainEntry(link, pathToFileURL(target).href), true);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('catálogo global mede cada fonte e preserva DEGRADED se uma falhar', async () => {
  const fetchImpl = async (url) => {
    if (url.includes('alirezarezvani/claude-skills')) return { ok: true, status: 200, async json() { return INDEX; } };
    if (url.includes('/git/trees/')) return { ok: true, status: 200, async json() { return { tree: [{ type: 'blob', path: 'skills/demo/SKILL.md' }] }; } };
    if (url.includes('skills-manage')) return { ok: true, status: 200 };
    if (url.includes('repowise')) return { ok: false, status: 503 };
    throw new Error(`unexpected url ${url}`);
  };
  const result = await loadCatalog(fetchImpl);
  assert.equal(result.summary.sources_defined, 6);
  assert.equal(result.summary.sources_fail, 1);
  assert.equal(result.summary.catalog_status, 'DEGRADED');
});

test('inspect carrega texto só depois de resolver candidato', async () => {
  const targetUrl = sourceRawUrl(SOURCE, 'engineering/skills/a11y-audit/SKILL.md');
  const fetchImpl = async (url) => {
    if (url.includes('alirezarezvani/claude-skills') && url.endsWith('.json')) return { ok: true, status: 200, async json() { return INDEX; } };
    if (url.includes('/git/trees/')) return { ok: true, status: 200, async json() { return { tree: [] }; } };
    if (url.includes('skills-manage') || url.includes('repowise')) return { ok: true, status: 200 };
    if (url === targetUrl) return { ok: true, status: 200, async text() { return '---\nname: a11y-audit\n---\n# A11y Audit\n'; } };
    throw new Error(`unexpected url ${url}`);
  };
  const result = await inspectSkill('a11y-audit', fetchImpl, 'claude-skills');
  assert.equal(result.status, 'OK');
  assert.equal(result.execution, 'NOT_EXECUTED_TEXT_ONLY');
});
