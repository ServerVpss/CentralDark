import assert from 'node:assert/strict';
import test from 'node:test';

import {
  evaluateLibraryEntryHornGate,
  validateCatalog,
} from '../../../../scripts/memory-linker/library-router.mjs';

const source = {
  source_id: 'source:horn-test',
  formats: ['txt'],
  status: 'INDEXED_REFERENCE',
  classification: 'STUDY_CANDIDATE',
  provenance: { canonical_path: 'docs/example.txt', provider: 'repository' },
};

const entry = {
  id: 'entry:horn-test',
  source_id: 'source:horn-test',
  reference: 'Example 1',
  tags: ['tema/logica'],
  links: [],
  emojis: ['🧮'],
  use: ['cognition'],
};

test('cada entry valida somente depois de derivar LIBRARY_ENTRY_ACCEPTED via Horn', () => {
  const gate = evaluateLibraryEntryHornGate({ entry, source });
  assert.equal(gate.state, 'PROVEN');
  assert.ok(gate.closure.marked.includes('SECTOR_HORN_ROUTED'));
  assert.ok(gate.closure.marked.includes('LIBRARY_ENTRY_ACCEPTED'));

  const result = validateCatalog({ schema_version: 1, sources: [source], entries: [entry] });
  assert.equal(result.status, 'PASS');
  assert.equal(result.horn_sector_gate, 'PROVEN_FOR_ALL_ENTRIES');
});

test('fonte em quarentena nao atravessa o gate cognitivo', () => {
  const quarantined = { ...source, classification: 'SENSITIVE_QUARANTINE' };
  const gate = evaluateLibraryEntryHornGate({ entry, source: quarantined });
  assert.equal(gate.state, 'UNKNOWN');
  assert.equal(gate.false_proven, false);
  assert.throws(
    () => validateCatalog({ schema_version: 1, sources: [quarantined], entries: [entry] }),
    /ENTRY_SOURCE_QUARANTINED/,
  );
});
