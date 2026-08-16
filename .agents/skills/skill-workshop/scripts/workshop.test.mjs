import assert from 'node:assert/strict';
import test from 'node:test';

import {
  SOURCE,
  catalogSummary,
  exactCandidates,
  findSkills,
  inspectSkill,
  normalizeIndex,
  normalizeSourcePath,
  skillRawUrl,
} from './workshop.mjs';

const INDEX = {
  total_skills: 4,
  skills: [
    {
      name: 'a11y-audit',
      source: '../../engineering/skills/a11y-audit',
      category: 'engineering',
      description: 'Accessibility audit for web interfaces and WCAG checks.',
    },
    {
      name: 'security-auditor',
      source: '../../engineering/skills/security-auditor',
      category: 'engineering',
      description: 'Security review and vulnerability analysis.',
    },
    {
      name: 'arquiteto-de-empresa',
      source: '../../c-level-advisor/skills/arquiteto-de-empresa',
      category: 'c-level',
      description: 'Company architecture and knowledge bundle.',
    },
    {
      name: 'arquiteto-de-empresa',
      source: '../../c-level-advisor/arquiteto-de-empresa/skills/arquiteto-de-empresa',
      category: 'c-level',
      description: 'Second source variant for the same published skill name.',
    },
  ],
};

test('normaliza source externo sem deixar segmentos de travessia', () => {
  assert.equal(normalizeSourcePath('../../engineering/skills/a11y-audit'), 'engineering/skills/a11y-audit');
  assert.equal(normalizeSourcePath('\\engineering\\skills\\a11y-audit'), 'engineering/skills/a11y-audit');
  assert.throws(() => normalizeSourcePath(''), /SOURCE_PATH_EMPTY/);
  assert.throws(() => normalizeSourcePath('../../engineering/../secrets'), /SOURCE_PATH_INVALID/);
});

test('catálogo mede entradas reais, nomes únicos e duplicatas sem inventar denominador', () => {
  const entries = normalizeIndex(INDEX);
  const summary = catalogSummary(entries, INDEX.total_skills);
  assert.equal(summary.declared_total, 4);
  assert.equal(summary.index_entries, 4);
  assert.equal(summary.unique_names, 3);
  assert.deepEqual(summary.duplicate_names, [{ name: 'arquiteto-de-empresa', count: 2 }]);
  assert.deepEqual(summary.categories, { 'c-level': 2, engineering: 2 });
});

test('busca ranqueia skill relevante sem executar nada', () => {
  const entries = normalizeIndex(INDEX);
  const results = findSkills(entries, 'acessibilidade accessibility web', 3);
  assert.equal(results[0].name, 'a11y-audit');
  assert.ok(results[0].score > 0);
});

test('nome duplicado permanece ambíguo em vez de escolher variante silenciosamente', () => {
  const entries = normalizeIndex(INDEX);
  assert.equal(exactCandidates(entries, 'arquiteto-de-empresa').length, 2);
});

test('URL da skill fica presa ao commit upstream', () => {
  const [entry] = normalizeIndex(INDEX);
  const url = skillRawUrl(entry);
  assert.match(url, new RegExp(SOURCE.commit));
  assert.match(url, /engineering\/skills\/a11y-audit\/SKILL\.md$/);
});

test('inspect baixa somente texto da skill e declara explicitamente que não executou recursos', async () => {
  const entries = normalizeIndex(INDEX);
  const expectedSkillUrl = skillRawUrl(entries[0]);
  const calls = [];
  const fetchImpl = async (url) => {
    calls.push(url);
    if (url === SOURCE.index_url) {
      return {
        ok: true,
        status: 200,
        async json() { return INDEX; },
      };
    }
    if (url === expectedSkillUrl) {
      return {
        ok: true,
        status: 200,
        async text() { return '---\nname: a11y-audit\n---\n# A11y Audit\n'; },
      };
    }
    throw new Error(`unexpected url ${url}`);
  };

  const result = await inspectSkill('a11y-audit', fetchImpl);
  assert.equal(result.status, 'OK');
  assert.equal(result.execution, 'NOT_EXECUTED_TEXT_ONLY');
  assert.equal(result.entry.name, 'a11y-audit');
  assert.deepEqual(calls, [SOURCE.index_url, expectedSkillUrl]);
});

test('inspect não escolhe silenciosamente quando upstream publica duas entradas com mesmo nome', async () => {
  const fetchImpl = async (url) => {
    assert.equal(url, SOURCE.index_url);
    return {
      ok: true,
      status: 200,
      async json() { return INDEX; },
    };
  };
  const result = await inspectSkill('arquiteto-de-empresa', fetchImpl);
  assert.equal(result.status, 'AMBIGUOUS');
  assert.equal(result.candidates.length, 2);
});
