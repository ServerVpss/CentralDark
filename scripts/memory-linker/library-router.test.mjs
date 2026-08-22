import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildDecisionSummary,
  citationLine,
  destinationsForEntry,
  pickContextualReference,
  routeEntries,
  validateCatalog,
} from './library-router.mjs';

const catalog = {
  schema_version: 1,
  owner: 'docs/BRAIN/03-DOCUMENTACAO/BIBLIOTECA/README.md',
  sources: [
    {
      source_id: 'fonte-teste-salmos',
      title: 'Fonte de teste — referências sem texto',
      formats: ['pdf', 'epub', 'jwpub'],
      status: 'FIXTURE_ONLY',
    },
  ],
  entries: [
    {
      id: 'salmo-23', source_id: 'fonte-teste-salmos', reference: 'Salmo 23', kind: 'verso-grupo',
      tags: ['tema/direcao', 'funcao/recuperacao'],
      groups: { capacidade: ['orientacao'], contexto: ['caminho'] },
      links: ['[[continuidade]]'], emojis: ['🧭'], use: ['cognition', 'conversation'],
    },
    {
      id: 'salmo-27', source_id: 'fonte-teste-salmos', reference: 'Salmo 27', kind: 'verso-grupo',
      tags: ['tema/coragem', 'contexto/ameaca'],
      groups: { capacidade: ['firmeza'], funcao: ['nao-ceder'] },
      links: ['[[contraprova]]'], emojis: ['🦁'], use: ['cognition', 'skill-candidate', 'conversation'],
    },
    {
      id: 'salmo-91', source_id: 'fonte-teste-salmos', reference: 'Salmo 91', kind: 'verso-grupo',
      tags: ['tema/protecao', 'contexto/ameaca'],
      groups: { capacidade: ['abrigo'], funcao: ['defesa'] },
      links: ['[[seguranca]]'], emojis: ['🛡️'], use: ['cognition', 'skill-candidate', 'conversation'],
    },
    {
      id: 'salmo-121', source_id: 'fonte-teste-salmos', reference: 'Salmo 121', kind: 'verso-grupo',
      tags: ['tema/vigilancia', 'funcao/continuidade', 'contexto/entrada-saida'],
      groups: { capacidade: ['guarda'] },
      links: ['[[handoff]]', '[[porta-de-entrada]]'], emojis: ['👁️', '🚪'], use: ['cognition', 'conversation'],
    },
  ],
};

test('catálogo válido aceita PDF + EPUB + JWPUB sem fingir que conteúdo já foi ingerido', () => {
  assert.deepEqual(validateCatalog(catalog), { status: 'PASS', sources: 1, entries: 4 });
});

test('Google Drive entra como referência com proveniência explícita, sem fingir INGESTED', () => {
  const drive = structuredClone(catalog);
  drive.sources.push({
    source_id: 'drive-estudo',
    title: 'Estudo no Drive',
    formats: ['gdoc', 'gdrive-md', 'gdrive-folder'],
    status: 'INDEXED_REFERENCE',
    classification: 'STUDY_CANDIDATE',
    provenance: { provider: 'google-drive', external_id: 'arquivo-123' },
  });
  assert.deepEqual(validateCatalog(drive), { status: 'PASS', sources: 2, entries: 4 });
});

test('fonte Google Drive sem proveniência falha fechado', () => {
  const broken = structuredClone(catalog);
  broken.sources.push({
    source_id: 'drive-sem-prova',
    formats: ['gdoc'],
    status: 'INDEXED_REFERENCE',
    classification: 'STUDY_CANDIDATE',
  });
  assert.throws(() => validateCatalog(broken), /SOURCE_DRIVE_PROVIDER_REQUIRED/);
});

test('fonte marcada INGESTED exige SHA-256 real', () => {
  const broken = structuredClone(catalog);
  broken.sources.push({
    source_id: 'fonte-sem-hash',
    formats: ['pdf'],
    status: 'INGESTED',
  });
  assert.throws(() => validateCatalog(broken), /INGESTED_SOURCE_SHA256_REQUIRED/);
});

test('fonte em quarentena sensível não pode alimentar entrada cognitiva', () => {
  const broken = structuredClone(catalog);
  broken.sources.push({
    source_id: 'cofre',
    formats: ['gdrive-folder'],
    status: 'SENSITIVE_QUARANTINE',
    classification: 'SENSITIVE_QUARANTINE',
    provenance: { provider: 'google-drive', external_id: 'cofre-123' },
  });
  broken.entries.push({
    id: 'vazamento',
    source_id: 'cofre',
    reference: 'não pode',
    tags: [],
    links: [],
    emojis: [],
    use: ['cognition'],
  });
  assert.throws(() => validateCatalog(broken), /ENTRY_SOURCE_QUARANTINED/);
});

test('continuidade + entrada-saída roteia Salmo 121', () => {
  const [top] = routeEntries({ catalog, query: ['continuidade', 'entrada-saida'] });
  assert.equal(top.entry.id, 'salmo-121');
  assert.ok(top.score >= 8);
});

test('ameaça + proteção distingue 91 de 27', () => {
  const [top] = routeEntries({ catalog, query: ['ameaca', 'protecao'] });
  assert.equal(top.entry.id, 'salmo-91');
});

test('ameaça + coragem distingue 27 de 91', () => {
  const [top] = routeEntries({ catalog, query: ['ameaca', 'coragem'] });
  assert.equal(top.entry.id, 'salmo-27');
});

test('referência contextual fica silenciosa quando relevância é baixa', () => {
  assert.equal(pickContextualReference({ catalog, query: ['banana'], minScore: 4 }), null);
});

test('referência contextual cita referência, não inventa texto da fonte', () => {
  const candidate = pickContextualReference({ catalog, query: ['vigilancia', 'continuidade'], minScore: 4 });
  assert.equal(candidate.reference, 'Salmo 121');
  assert.equal(candidate.has_source_text, false);
  assert.equal(citationLine(candidate), '👁️ Salmo 121');
  assert.throws(() => citationLine(candidate, { includeText: true }), /SOURCE_TEXT_REQUIRED_AT_RENDER_TIME/);
});

test('uma entrada pode alimentar cognição, skill candidata e conversa sem virar três cópias', () => {
  assert.deepEqual(destinationsForEntry(catalog.entries[1]), [
    'LIBRARY', 'COGNITION', 'SKILL_CANDIDATE', 'CONVERSATION_REFERENCE',
  ]);
});

test('deliberação persiste resumo auditável, não cadeia privada de pensamento', () => {
  const summary = buildDecisionSummary({
    question: 'qual rota usar?',
    decision: 'usar owner existente',
    reason_summary: 'reuso cobre a capacidade',
    outcome: 'rota única',
    evidence_refs: ['commit:abc'],
    library_refs: ['Salmo 121'],
  });
  assert.equal(summary.type, 'DELIBERATION_SUMMARY');
  assert.deepEqual(summary.library_refs, ['Salmo 121']);
  assert.throws(() => buildDecisionSummary({ chain_of_thought: 'não salvar' }), /PRIVATE_REASONING_NOT_PERSISTED/);
});

test('ids duplicados falham fechado', () => {
  const broken = structuredClone(catalog);
  broken.entries.push(structuredClone(broken.entries[0]));
  assert.throws(() => validateCatalog(broken), /DUPLICATE_ENTRY_ID/);
});
