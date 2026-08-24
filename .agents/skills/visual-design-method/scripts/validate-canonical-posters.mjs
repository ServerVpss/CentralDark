#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
export const DEFAULT_REPO_ROOT = resolve(SCRIPT_DIR, '../../../../');
export const MANIFEST_PATH = 'docs/BRAIN/08-ARTEFATOS-VISUAIS/CARTAZES-CANONICOS/manifest.json';

const EXPECTED_RELATIONS = {
  'CD-POSTER-01-PAPAGAIO': {
    'owned-by': '.agents/skills/visual-design-method/SKILL.md',
    'governed-by': 'LEIA-ME-IA.md',
    explains: 'docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json',
    'mirrored-by': 'docs/ARQUITETURA/HERMES-CASA-OBSIDIAN-SYNC.md',
  },
  'CD-POSTER-02-CAJADO': {
    'owned-by': '.agents/skills/visual-design-method/SKILL.md',
    'governed-by': 'docs/CONSCIENCIA/ARQUITETURA/DESIGN-SISTEMA.md',
    explains: 'docs/CONSCIENCIA/ARTEFATOS/TECNICAS-DE-LINKAGEM-SEMANTICA.md',
    'mirrored-by': 'docs/ARQUITETURA/HERMES-CASA-OBSIDIAN-SYNC.md',
  },
  'CD-POSTER-03-TRAJETORIA': {
    'owned-by': '.agents/skills/visual-design-method/SKILL.md',
    'governed-by': 'AGENTS.md',
    complements: 'docs/CONSCIENCIA/MAPA-DO-CEREBRO.md',
    'mirrored-by': 'docs/ARQUITETURA/HERMES-CASA-OBSIDIAN-SYNC.md',
  },
  'CD-POSTER-04-ARQUITETURA': {
    'owned-by': 'docs/CONSCIENCIA/MAPA-DO-CEREBRO.md',
    'governed-by': 'LEIA-ME-IA.md',
    explains: '.agents/skills/knowledge-compiler/contract.json',
    'mirrored-by': 'docs/ARQUITETURA/HERMES-CASA-OBSIDIAN-SYNC.md',
  },
};

const EXPECTED_WINDOWS_PROJECTIONS = {
  obsidian: 'E:\\CentralDark\\Pivete\\CASA-VAULT\\00-CANONICO',
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function safeResolve(root, relativePath) {
  assert(typeof relativePath === 'string' && relativePath.length > 0, 'path must be a non-empty string');
  const absolute = resolve(root, relativePath);
  const prefix = root.endsWith(sep) ? root : `${root}${sep}`;
  assert(absolute === root || absolute.startsWith(prefix), `path escapes repository root: ${relativePath}`);
  return absolute;
}

async function sha256(path) {
  const bytes = await readFile(path);
  return createHash('sha256').update(bytes).digest('hex');
}

async function imageDimensions(path) {
  const bytes = await readFile(path);
  const signature = '89504e470d0a1a0a';
  if (bytes.length >= 24 && bytes.subarray(0, 8).toString('hex') === signature) {
    assert(bytes.subarray(12, 16).toString('ascii') === 'IHDR', `PNG has no IHDR: ${path}`);
    return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  }
  assert(bytes.length >= 30 && bytes.subarray(0, 4).toString('ascii') === 'RIFF' && bytes.subarray(8, 12).toString('ascii') === 'WEBP', `unsupported image format: ${path}`);
  const chunk = bytes.subarray(12, 16).toString('ascii');
  if (chunk === 'VP8X') {
    const width = 1 + bytes[24] + (bytes[25] << 8) + (bytes[26] << 16);
    const height = 1 + bytes[27] + (bytes[28] << 8) + (bytes[29] << 16);
    return { width, height };
  }
  if (chunk === 'VP8 ') {
    assert(bytes.subarray(23, 26).toString('hex') === '9d012a', `invalid VP8 frame: ${path}`);
    return { width: bytes.readUInt16LE(26) & 0x3fff, height: bytes.readUInt16LE(28) & 0x3fff };
  }
  if (chunk === 'VP8L') {
    assert(bytes[20] === 0x2f, `invalid VP8L frame: ${path}`);
    const bits = bytes.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >>> 14) & 0x3fff) + 1 };
  }
  throw new Error(`unsupported WEBP chunk ${chunk}: ${path}`);
}

async function requireFile(root, relativePath) {
  const absolute = safeResolve(root, relativePath);
  const info = await stat(absolute);
  assert(info.isFile(), `expected file: ${relativePath}`);
  return absolute;
}

export async function validateCanonicalPosters({ repoRoot = DEFAULT_REPO_ROOT, manifest } = {}) {
  const root = resolve(repoRoot);
  const data = manifest ?? JSON.parse(await readFile(safeResolve(root, MANIFEST_PATH), 'utf8'));
  const errors = [];
  const runtimeUnverified = [];
  const check = async (label, fn) => {
    try { await fn(); } catch (error) { errors.push(`${label}: ${error.message}`); }
  };

  await check('contract', async () => {
    assert(data.schema_version === 1, 'schema_version must be 1');
    assert(data.canon_id === 'centraldark.visual-posters.v1', 'unexpected canon_id');
    assert(data.authority?.rule === 'ONE_SYSTEM_ONLY', 'ONE_SYSTEM_ONLY is required');
    assert(data.authority?.second_brain?.includes('espelho'), 'second brain must be declared as a mirror');
    assert(data.public_status_contract?.PROVED === 'green', 'public PROVED must be green');
    assert(data.public_status_contract?.FAILED_OR_BLOCKED === 'red', 'public failure must be red');
    assert(data.canonical_count === 4, 'canonical_count must be exactly 4');
    assert(Array.isArray(data.artifacts) && data.artifacts.length === 4, 'exactly four canonical artifacts are required');
  });

  const ids = new Set();
  const paths = new Set();
  for (const artifact of data.artifacts ?? []) {
    await check(artifact.id ?? 'unnamed-artifact', async () => {
      assert(/^CD-POSTER-0[1-4]-/.test(artifact.id), `invalid stable id: ${artifact.id}`);
      assert(!ids.has(artifact.id), `duplicate id: ${artifact.id}`);
      assert(!paths.has(artifact.path), `duplicate path: ${artifact.path}`);
      ids.add(artifact.id);
      paths.add(artifact.path);
      assert(artifact.path.startsWith(`${data.canonical_root}/`), `artifact outside canonical root: ${artifact.path}`);
      assert(artifact.source_class === 'USER_PROVIDED_VISUAL_WITNESS', 'source class must preserve provenance');
      assert(/^[a-f0-9]{64}$/.test(artifact.source_sha256), 'original source sha256 is required');
      assert(artifact.storage === 'WEBP_Q92_DERIVATIVE', 'repository copy must declare its storage derivative');
      assert(Array.isArray(artifact.claims) && artifact.claims.length > 0, 'claims are required');
      const expectedRelations = EXPECTED_RELATIONS[artifact.id];
      assert(expectedRelations, `no relation contract for ${artifact.id}`);
      assert(Array.isArray(artifact.relations), 'relations are required');
      const actualRelations = new Map();
      for (const relation of artifact.relations) {
        assert(!actualRelations.has(relation.type), `duplicate semantic relation: ${artifact.id}:${relation.type}`);
        actualRelations.set(relation.type, relation.target);
      }
      for (const [type, target] of Object.entries(expectedRelations)) {
        assert(actualRelations.has(type), `missing semantic relation: ${type}`);
        assert(actualRelations.get(type) === target, `semantic target mismatch: ${artifact.id}:${type}`);
        await requireFile(root, target);
      }
      assert(artifact.relations.length === Object.keys(expectedRelations).length, `unexpected relation count for ${artifact.id}`);
      const absolute = await requireFile(root, artifact.path);
      assert(await sha256(absolute) === artifact.sha256, `sha256 mismatch: ${artifact.path}`);
      const dimensions = await imageDimensions(absolute);
      assert(dimensions.width === artifact.width && dimensions.height === artifact.height, `dimension mismatch: ${artifact.path}`);
    });
  }

  await check('observed-projection', async () => {
    const projection = data.observed_projection;
    assert(projection.authority === 'DERIVED_PROJECTION_REFERENCE', 'graph image cannot be canonical authority');
    const absolute = await requireFile(root, projection.path);
    assert(await sha256(absolute) === projection.sha256, 'observed graph sha256 mismatch');
    const dimensions = await imageDimensions(absolute);
    assert(dimensions.width === projection.width && dimensions.height === projection.height, 'observed graph dimension mismatch');
  });

  for (const [owner, path] of Object.entries(data.owners ?? {})) {
    await check(`owner:${owner}`, async () => { await requireFile(root, path); });
  }
  for (const [projection, path] of Object.entries(data.projections ?? {})) {
    if (/^[A-Za-z]:\\/.test(path)) {
      await check(`projection:${projection}`, async () => {
        assert(EXPECTED_WINDOWS_PROJECTIONS[projection] === path, `unexpected Windows projection: ${projection}`);
        runtimeUnverified.push(projection);
      });
      continue;
    }
    await check(`projection:${projection}`, async () => { await stat(safeResolve(root, path)); });
  }

  return { ok: errors.length === 0, errors, canonicalCount: data.artifacts?.length ?? 0, runtimeUnverified };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await validateCanonicalPosters();
  if (!result.ok) {
    console.error('CANONICAL_POSTERS=FAIL');
    for (const error of result.errors) console.error(`- ${error}`);
    process.exitCode = 1;
  } else {
    console.log('CANONICAL_POSTERS=PASS');
    console.log(`CANONICAL_COUNT=${result.canonicalCount}`);
    console.log('SECOND_BRAIN_CONTRACT=MIRROR');
    console.log(`SECOND_BRAIN_RUNTIME=${result.runtimeUnverified.includes('obsidian') ? 'NOT_PROVEN' : 'PROVED'}`);
    console.log('GRAPH_AUTHORITY=DERIVED_PROJECTION_REFERENCE');
  }
}
