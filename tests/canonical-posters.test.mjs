import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';

import {
  DEFAULT_REPO_ROOT,
  MANIFEST_PATH,
  validateCanonicalPosters,
} from '../.agents/skills/visual-design-method/scripts/validate-canonical-posters.mjs';

async function manifestClone() {
  return JSON.parse(await readFile(resolve(DEFAULT_REPO_ROOT, MANIFEST_PATH), 'utf8'));
}

test('canonical poster set passes the real counterproof', async () => {
  const result = await validateCanonicalPosters();
  assert.equal(result.ok, true, result.errors.join('\n'));
  assert.equal(result.canonicalCount, 4);
  assert.deepEqual(result.runtimeUnverified, ['obsidian']);
});

test('a forged green hash is rejected', async () => {
  const manifest = await manifestClone();
  manifest.artifacts[0].sha256 = '0'.repeat(64);
  const result = await validateCanonicalPosters({ manifest });
  assert.equal(result.ok, false);
  assert.match(result.errors.join('\n'), /sha256 mismatch/);
});

test('an orphaned semantic owner is rejected', async () => {
  const manifest = await manifestClone();
  manifest.artifacts[1].relations = manifest.artifacts[1].relations.filter(({ type }) => type !== 'owned-by');
  const result = await validateCanonicalPosters({ manifest });
  assert.equal(result.ok, false);
  assert.match(result.errors.join('\n'), /missing semantic relation: owned-by/);
});

test('an existing file cannot impersonate a semantic owner', async () => {
  const manifest = await manifestClone();
  manifest.artifacts[0].relations.find(({ type }) => type === 'owned-by').target = 'LEIA-ME-IA.md';
  const result = await validateCanonicalPosters({ manifest });
  assert.equal(result.ok, false);
  assert.match(result.errors.join('\n'), /semantic target mismatch/);
});

test('an unverified Windows path cannot impersonate the canonical mirror', async () => {
  const manifest = await manifestClone();
  manifest.projections.obsidian = 'Z:\\not-the-casa\\mirror';
  const result = await validateCanonicalPosters({ manifest });
  assert.equal(result.ok, false);
  assert.match(result.errors.join('\n'), /unexpected Windows projection/);
});

test('the graph screenshot cannot promote itself to authority', async () => {
  const manifest = await manifestClone();
  manifest.observed_projection.authority = 'CANONICAL_OWNER';
  const result = await validateCanonicalPosters({ manifest });
  assert.equal(result.ok, false);
  assert.match(result.errors.join('\n'), /graph image cannot be canonical authority/);
});
