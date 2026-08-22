import assert from 'node:assert/strict';
import test from 'node:test';
import {
  EVIDENCE_STATES,
  buildDecisionSummary,
  citationLine,
  createEvidenceSession,
  deriveSourceIdentity,
  destinationsForEntry,
  pickContextualReference,
  reconcileSourceIdentity,
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

const driveSource = ({
  externalId = 'arquivo-123',
  revisionId = 'rev-1',
  title = 'Estudo no Drive',
  path = 'ESTUDOS/estudo.gdoc',
} = {}) => ({
  source_id: 'drive-estudo',
  title,
  formats: ['gdoc'],
  status: 'INDEXED_REFERENCE',
  classification: 'STUDY_CANDIDATE',
  provenance: {
    provider: 'google-drive',
    external_id: externalId,
    revision_id: revisionId,
    path,
  },
});

const repoSource = ({
  path = 'docs/antigo.txt',
  sha256 = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
} = {}) => ({
  source_id: 'repo-doc',
  title: 'Documento local',
  formats: ['txt'],
  status: 'INGESTED',
  sha256,
  provenance: { provider: 'github', canonical_path: path },
});

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

test('identidade estável usa external_id e versão, não nome nem caminho móvel', () => {
  const first = deriveSourceIdentity(driveSource({ title: 'Nome A', path: 'ANTIGO/doc.gdoc' }));
  const moved = deriveSourceIdentity(driveSource({ title: 'Nome B', path: 'NOVO/doc.gdoc' }));
  assert.deepEqual(first, moved);
  assert.equal(first.locator.value, 'arquivo-123');
  assert.equal(first.version, 'rev-1');
});

test('arquivo movido com mesmo SHA-256 é reencontrado e atualiza locator', () => {
  const expected = deriveSourceIdentity(repoSource({ path: 'docs/antigo.txt' }));
  const observed = repoSource({ path: 'docs/novo.txt' });
  const result = reconcileSourceIdentity(expected, observed);
  assert.equal(result.source_status, EVIDENCE_STATES.SOURCE_FOUND);
  assert.equal(result.reason, 'SOURCE_RELOCATED_HASH_MATCH');
  assert.equal(result.observed_identity.locator.value, 'docs/novo.txt');
});

test('mesmo nome com locator diferente vira SOURCE_CONFLICT', () => {
  const expected = deriveSourceIdentity(driveSource({ title: 'Mesmo nome' }));
  const observed = driveSource({ title: 'Mesmo nome', externalId: 'outro-arquivo' });
  const result = reconcileSourceIdentity(expected, observed);
  assert.equal(result.source_status, EVIDENCE_STATES.SOURCE_CONFLICT);
  assert.equal(result.reason, 'SOURCE_LOCATOR_MISMATCH');
});

test('conteúdo alterado na mesma fonte vira SOURCE_CHANGED', () => {
  const expected = deriveSourceIdentity(driveSource({ revisionId: 'rev-1' }));
  const result = reconcileSourceIdentity(expected, driveSource({ revisionId: 'rev-2' }));
  assert.equal(result.source_status, EVIDENCE_STATES.SOURCE_CHANGED);
  assert.equal(result.reason, 'SOURCE_VERSION_CHANGED');
});

test('fonte removida vira SOURCE_MISSING e referência não pode ser citada', async () => {
  const identity = deriveSourceIdentity(driveSource());
  const session = createEvidenceSession({ retrieve: async () => null });
  const receipt = await session.recover(identity);
  assert.equal(receipt.source_status, EVIDENCE_STATES.SOURCE_MISSING);
  assert.equal(receipt.reference_status, EVIDENCE_STATES.REFERENCE_STALE);
  assert.throws(() => session.cite(receipt), /SOURCE_MISSING/);
});

test('citação exige retrieval observado na sessão; referência inventada é rejeitada', () => {
  const session = createEvidenceSession({ retrieve: async () => null });
  const forged = {
    source_status: EVIDENCE_STATES.SOURCE_FOUND,
    reference_status: EVIDENCE_STATES.REFERENCE_CURRENT,
    observed_reference: 'turn999file999',
  };
  assert.throws(() => session.cite(forged), /REFERENCE_STALE/);
});

test('claim cristaliza identidade, nova sessão recupera a fonte e cita referência atual nova', async () => {
  const initialIdentity = deriveSourceIdentity(driveSource());
  const sessionA = createEvidenceSession({
    retrieve: async () => ({
      source: driveSource(),
      observed_reference: 'turn10file2',
      payload: 'evidência recuperada A',
    }),
  });
  const receiptA = await sessionA.recover(initialIdentity);
  assert.equal(receiptA.source_status, EVIDENCE_STATES.SOURCE_FOUND);
  assert.equal(receiptA.reference_status, EVIDENCE_STATES.REFERENCE_CURRENT);
  assert.equal(sessionA.cite(receiptA), 'turn10file2');

  const persistedIdentity = sessionA.crystallize(receiptA);
  const claim = buildDecisionSummary({
    question: 'qual evidência sustenta a afirmação?',
    decision: 'usar a fonte recuperável',
    reason_summary: 'afirmação material derivada do conteúdo recuperado',
    outcome: 'claim ligado à identidade persistente',
    evidence_refs: [persistedIdentity],
  });
  const reloadedClaim = JSON.parse(JSON.stringify(claim));
  assert.equal(JSON.stringify(reloadedClaim).includes('turn10file2'), false);
  assert.equal(JSON.stringify(reloadedClaim).includes('evidência recuperada A'), false);

  const sessionB = createEvidenceSession({
    retrieve: async (identity) => ({
      source_identity: identity,
      observed_reference: 'turn77file4',
      payload: 'evidência recuperada B',
    }),
  });
  const receiptB = await sessionB.recover(reloadedClaim.evidence_refs[0]);
  assert.equal(sessionB.cite(receiptB), 'turn77file4');
  assert.throws(() => sessionB.cite(receiptA), /REFERENCE_STALE/);
});

test('retrieval sem referência observável mantém REFERENCE_STALE', async () => {
  const identity = deriveSourceIdentity(driveSource());
  const session = createEvidenceSession({
    retrieve: async () => ({ source: driveSource(), payload: 'sem token runtime' }),
  });
  const receipt = await session.recover(identity);
  assert.equal(receipt.source_status, EVIDENCE_STATES.SOURCE_FOUND);
  assert.equal(receipt.reference_status, EVIDENCE_STATES.REFERENCE_STALE);
  assert.throws(() => session.cite(receipt), /REFERENCE_STALE/);
});

test('SOURCE_CHANGED não reaproveita referência corrente de uma evidência antiga', async () => {
  const identity = deriveSourceIdentity(driveSource({ revisionId: 'rev-1' }));
  const session = createEvidenceSession({
    retrieve: async () => ({
      source: driveSource({ revisionId: 'rev-2' }),
      observed_reference: 'turn88file1',
    }),
  });
  const receipt = await session.recover(identity);
  assert.equal(receipt.source_status, EVIDENCE_STATES.SOURCE_CHANGED);
  assert.equal(receipt.reference_status, EVIDENCE_STATES.REFERENCE_STALE);
  assert.throws(() => session.cite(receipt), /SOURCE_CHANGED/);
});

test('deliberação não cristaliza turnXfileY efêmero como evidência canônica', () => {
  assert.throws(() => buildDecisionSummary({
    evidence_refs: ['turn241file14'],
  }), /EPHEMERAL_RETRIEVAL_REFERENCE_NOT_PERSISTED/);
  assert.throws(() => buildDecisionSummary({
    evidence_refs: [{ observed_reference: 'turn241file14' }],
  }), /EPHEMERAL_RETRIEVAL_REFERENCE_NOT_PERSISTED/);
});
