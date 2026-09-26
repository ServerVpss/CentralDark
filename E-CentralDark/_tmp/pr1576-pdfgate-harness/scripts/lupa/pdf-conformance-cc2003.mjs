#!/usr/bin/env node
import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..', '..');

export const CC2003_SOURCE = Object.freeze({
  title: 'Lógica Computacional (CC2003) — Lógica Computacional 23',
  author: 'Nelma Moreira',
  expectedSha256: 'b4e2a0655b7e0c85ca329c33971b377299dde6358779270c573f014f3aa606d1',
  expectedSizeBytes: 206674,
  expectedPages: 8,
  basis: ['Horn', 'satisfiability', 'Herbrand minimum model', 'resolution'],
});

export const ARTIFACT_IDENTITY_POLICY = Object.freeze({
  ARTIFACT_NAME_IS_NOT_IDENTITY: true,
  UPLOAD_SUFFIX_IS_TRANSIENT: true,
  DISCOVER_BY_HASH_FIRST: true,
  KNOWN_LOCATIONS_FIRST: true,
  EMPTY_PATH_WITH_KNOWN_IDENTITY: 'RESOLVE_REFERENCE',
  EMPTY_PATH_IS_NOT_ARTIFACT_MISSING: true,
  UNKNOWN_IS_NOT_PASS: true,
});

function envSearchRoots() {
  const raw = process.env.CENTRALDARK_ARTIFACT_SEARCH_ROOTS || '';
  return raw
    .split(path.delimiter)
    .map((value) => value.trim())
    .filter(Boolean);
}

export function knownSearchRoots() {
  const roots = [
    path.join(ROOT, 'docs', 'CONSCIENCIA', '04-MCP-E-CONECTORES'),
    ...envSearchRoots(),
  ];

  if (process.platform === 'win32') {
    roots.push('E:\\CentralDark\\_MAPA_CASA\\GARIMPO-CHEFE');
  } else {
    roots.push('/root/CentralDark/docs/CONSCIENCIA/04-MCP-E-CONECTORES');
  }

  return [...new Set(roots.map((root) => path.resolve(root)))];
}

export function sha256Bytes(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

export function sha256File(filePath) {
  return sha256Bytes(readFileSync(filePath));
}

export function inspectArtifact(filePath) {
  if (!filePath || !existsSync(filePath)) {
    return {
      path: filePath || null,
      exists: false,
      status: 'UNKNOWN',
      reason: 'REFERENCE_NOT_RESOLVED',
    };
  }

  const stat = statSync(filePath);
  if (!stat.isFile()) {
    return {
      path: filePath,
      exists: true,
      status: 'REFUTED_IN_SCOPE',
      reason: 'REFERENCE_IS_NOT_FILE',
    };
  }

  const bytes = readFileSync(filePath);
  const sha256 = sha256Bytes(bytes);
  const identityMatch = bytes.length === CC2003_SOURCE.expectedSizeBytes &&
    sha256 === CC2003_SOURCE.expectedSha256;

  return {
    path: filePath,
    name: path.basename(filePath),
    exists: true,
    sizeBytes: bytes.length,
    sha256,
    expectedSha256: CC2003_SOURCE.expectedSha256,
    expectedSizeBytes: CC2003_SOURCE.expectedSizeBytes,
    identityMatch,
    status: identityMatch ? 'PROVED_IN_SCOPE' : 'REFUTED_IN_SCOPE',
    reason: identityMatch ? 'BYTE_IDENTITY_MATCH' : 'BYTE_IDENTITY_MISMATCH',
  };
}

export function verifyPdfSource(filePath) {
  return inspectArtifact(filePath);
}

export function discoverPdfByIdentity({ roots = knownSearchRoots() } = {}) {
  const attempts = [];

  for (const root of roots) {
    if (!root || !existsSync(root)) {
      attempts.push({ root, state: 'ABSENT' });
      continue;
    }

    let entries;
    try {
      entries = readdirSync(root, { withFileTypes: true });
    } catch (error) {
      attempts.push({ root, state: 'UNREADABLE', error: String(error?.message || error) });
      continue;
    }

    attempts.push({ root, state: 'SCANNED_DIRECT_CHILDREN_ONLY' });

    for (const entry of entries) {
      if (!entry.isFile()) continue;
      const candidate = path.join(root, entry.name);
      let stat;
      try {
        stat = statSync(candidate);
      } catch {
        continue;
      }
      if (stat.size !== CC2003_SOURCE.expectedSizeBytes) continue;

      const inspected = inspectArtifact(candidate);
      if (inspected.status === 'PROVED_IN_SCOPE') {
        return {
          ...inspected,
          resolution: 'DISCOVERED_BY_IDENTITY',
          attempts,
        };
      }
    }
  }

  return {
    path: null,
    exists: false,
    status: 'UNKNOWN',
    reason: 'KNOWN_IDENTITY_NOT_FOUND_IN_AUTHORIZED_ROOTS',
    resolution: 'UNRESOLVED_REFERENCE',
    attempts,
  };
}

export function resolvePdfReference(explicitPath, options = {}) {
  if (typeof explicitPath === 'string' && explicitPath.trim()) {
    return {
      ...inspectArtifact(path.resolve(explicitPath)),
      resolution: 'EXPLICIT_PATH',
    };
  }

  return discoverPdfByIdentity(options);
}

export function resolveReuseBeforeCreate(input = {}) {
  const facts = {
    ownerExists: input.ownerExists === true,
    ownerSatisfies: input.ownerSatisfies === true,
    ownerPartial: input.ownerPartial === true,
    ownerExtensible: input.ownerExtensible === true,
    gapProved: input.gapProved === true,
    learnedRemedyExists: input.learnedRemedyExists === true,
    contradiction: input.contradiction === true,
    evidenceSufficient: input.evidenceSufficient === true,
  };

  if (facts.contradiction) {
    return { decision: 'FAIL_CLOSED', reason: 'CONTRADICTION', green: false };
  }
  if (!facts.evidenceSufficient) {
    return { decision: 'UNKNOWN', reason: 'INSUFFICIENT_EVIDENCE', green: false };
  }
  if (facts.learnedRemedyExists) {
    return { decision: 'REUSE_LEARNED_REMEDY', reason: 'ERROR_REMEDY_ALREADY_PROVED', green: false };
  }
  if (facts.ownerExists && facts.ownerSatisfies) {
    return { decision: 'REUSE', reason: 'OWNER_ALREADY_SATISFIES_CAPABILITY', green: false };
  }
  if (facts.ownerExists && facts.ownerPartial && facts.ownerExtensible) {
    return { decision: 'EXTEND_EXISTING', reason: 'OWNER_PARTIAL_AND_EXTENSIBLE', green: false };
  }
  if (!facts.ownerExists && facts.gapProved) {
    return { decision: 'CREATE_MINIMAL', reason: 'OWNER_GAP_PROVED', green: false };
  }
  return { decision: 'UNKNOWN', reason: 'NO_DERIVABLE_SAFE_ACTION', green: false };
}

export function proofAfterAction(actionResult = {}, postProbe = {}, counterproof = {}) {
  const ok = actionResult.executed === true &&
    postProbe.passed === true &&
    counterproof.regressionFound !== true;

  return {
    verdict: ok ? 'PROVED_IN_SCOPE' : 'UNKNOWN',
    green: ok,
    actionExecuted: actionResult.executed === true,
    postProbePassed: postProbe.passed === true,
    regressionFound: counterproof.regressionFound === true,
  };
}


export function runFullGate(explicitPath) {
  const identity = resolvePdfReference(explicitPath);
  const policy = {
    pass: ARTIFACT_IDENTITY_POLICY.UNKNOWN_IS_NOT_PASS === true &&
      ARTIFACT_IDENTITY_POLICY.ARTIFACT_NAME_IS_NOT_IDENTITY === true &&
      ARTIFACT_IDENTITY_POLICY.EMPTY_PATH_IS_NOT_ARTIFACT_MISSING === true,
    required: [
      'UNKNOWN_IS_NOT_PASS',
      'ARTIFACT_NAME_IS_NOT_IDENTITY',
      'EMPTY_PATH_IS_NOT_ARTIFACT_MISSING',
    ],
  };

  let selfTestResult;
  try {
    selfTestResult = selfTest();
  } catch (error) {
    selfTestResult = { status: 'FAIL', error: String(error?.stack || error) };
  }

  const testPath = path.join(__dirname, 'pdf-conformance-cc2003.test.mjs');
  const nodeTestRun = spawnSync(process.execPath, ['--test', testPath], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  const nodeTest = {
    pass: nodeTestRun.status === 0,
    exitCode: nodeTestRun.status,
    stdout: (nodeTestRun.stdout || '').trim(),
    stderr: (nodeTestRun.stderr || '').trim(),
  };

  let tamper = {
    pass: false,
    status: 'UNKNOWN',
    reason: 'IDENTITY_REQUIRED_BEFORE_TAMPER',
  };

  if (identity.status === 'PROVED_IN_SCOPE' && identity.path) {
    const tempRoot = mkdtempSync(path.join(tmpdir(), 'centraldark-pdf-gate-'));
    try {
      const original = readFileSync(identity.path);
      const modified = Buffer.from(original);
      if (modified.length > 0) modified[0] ^= 0xff;

      const tamperedPath = path.join(tempRoot, 'tlc23.pdf');
      writeFileSync(tamperedPath, modified);
      const inspected = inspectArtifact(tamperedPath);
      tamper = {
        pass: inspected.status === 'REFUTED_IN_SCOPE' &&
          inspected.reason === 'BYTE_IDENTITY_MISMATCH',
        status: inspected.status,
        reason: inspected.reason,
        sizeBytes: inspected.sizeBytes,
        sha256: inspected.sha256,
      };
