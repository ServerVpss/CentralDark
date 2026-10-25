import { createHash } from 'node:crypto';
import { createReadStream, existsSync, readFileSync, renameSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

export const LEDGER_SCHEMA = 'centraldark.desktop-builder-ledger/v1';

export function readLedger(file) {
  const data = JSON.parse(readFileSync(file, 'utf8'));
  if (data.schema !== LEDGER_SCHEMA || !Array.isArray(data.entries)) throw new Error('INVALID_BUILDER_LEDGER');
  const ids = new Set();
  const versions = new Set();
  for (const entry of data.entries) {
    if (!entry.id || !/^\d+\.\d+\.\d+$/.test(entry.builder_version)) throw new Error('INVALID_BUILDER_RECORD');
    if (entry.build_status !== 'PASS') throw new Error('LEDGER_COUNTS_ONLY_SUCCESSFUL_BUILDS');
    if (!entry.artifacts?.installer?.sha256 || !entry.artifacts?.executable?.sha256) throw new Error('MISSING_ARTIFACT_HASH');
    if (ids.has(entry.id) || versions.has(entry.builder_version)) throw new Error('DUPLICATE_BUILDER_RECORD');
    ids.add(entry.id);
    versions.add(entry.builder_version);
  }
  return data;
}

export function nextPatch(version) {
  if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error('INVALID_SEMVER');
  const [major, minor, patch] = version.split('.').map(Number);
  if (patch >= 999999) throw new Error('PATCH_RANGE_EXCEEDED');
  return [major, minor, patch + 1].join('.');
}

export function latestSuccessful(data) {
  if (!data.entries.length) return null;
  return data.entries.reduce((a, b) => {
    const aa = a.builder_version.split('.').map(Number);
    const bb = b.builder_version.split('.').map(Number);
    for (let i = 0; i < 3; i += 1) {
      if (bb[i] > aa[i]) return b;
      if (bb[i] < aa[i]) return a;
    }
    return a;
  });
}

export function appendSuccessful(data, entry) {
  if (entry.build_status !== 'PASS' || entry.runtime_status === 'PASS' && !entry.proof?.runtime) {
    throw new Error('BUILD_PASS_REQUIRED_AND_RUNTIME_MUST_BE_PROVEN');
  }
  if (data.entries.some((item) => item.id === entry.id || item.builder_version === entry.builder_version)) {
    throw new Error('DUPLICATE_BUILD_IGNORED');
  }
  return { ...data, entries: [...data.entries, entry] };
}

export function writeLedgerAtomic(file, data) {
  const tmp = file + '.' + process.pid + '.tmp';
  writeFileSync(tmp, JSON.stringify(data, null, 2) + '\n', 'utf8');
  renameSync(tmp, file);
}

export async function fileProof(file) {
  if (!existsSync(file) || !statSync(file).isFile()) throw new Error('MISSING_BUILD_ARTIFACT');
  const stats = statSync(file);
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(file)) hash.update(chunk);
  return { file: path.basename(file), bytes: stats.size, sha256: hash.digest('hex'), mtime: stats.mtime.toISOString() };
}
