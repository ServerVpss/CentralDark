#!/usr/bin/env node

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';

const SOURCE_CLASSES = new Set([
  'README',
  'SKILL',
  'OFFICIAL_DOC',
  'CODE',
  'TEST',
  'INCIDENT',
  'GIT_HISTORY',
  'COMMUNITY',
  'RUNTIME',
  'USER_PROVIDED',
]);

const PASS = 'PASS';
const FAIL = 'FAIL';
const UNKNOWN = 'UNKNOWN';

function nonEmpty(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, stable(value[key])]),
    );
  }
  return value;
}

function sha256(value) {
  return createHash('sha256').update(JSON.stringify(stable(value))).digest('hex');
}

function sourceKey(source) {
  if (nonEmpty(source?.fingerprint)) return `fp:${source.fingerprint.trim()}`;
  if (nonEmpty(source?.id)) return `id:${source.id.trim()}`;
  return `derived:${sha256({ class: source?.class, provenance: source?.provenance })}`;
}

export function dedupeSources(sources = []) {
  const seen = new Set();
  const unique = [];
  const dropped = [];

  for (const raw of Array.isArray(sources) ? sources : []) {
    const source = raw && typeof raw === 'object' ? { ...raw } : {};
    const key = sourceKey(source);
    if (seen.has(key)) {
      dropped.push({ ...source, duplicate_key: key });
      continue;
    }
    seen.add(key);
    unique.push(source);
  }

  return { unique, dropped };
}

function validateSources(sources) {
  const errors = [];
  for (const source of sources) {
    if (!nonEmpty(source.id)) errors.push('SOURCE_ID_MISSING');
    if (!SOURCE_CLASSES.has(source.class)) errors.push(`SOURCE_CLASS_INVALID:${source.class || 'EMPTY'}`);
    if (!nonEmpty(source.provenance)) errors.push(`SOURCE_PROVENANCE_MISSING:${source.id || 'UNKNOWN'}`);
    if (![PASS, 'CANDIDATE', UNKNOWN].includes(source.state)) {
      errors.push(`SOURCE_STATE_INVALID:${source.id || 'UNKNOWN'}:${source.state || 'EMPTY'}`);
    }
  }
  return errors;
}

function normalizeDependencies(dependencies = []) {
  const output = [];
  const seen = new Set();
  for (const dependency of Array.isArray(dependencies) ? dependencies : []) {
    if (!dependency || typeof dependency !== 'object') continue;
    const kind = String(dependency.kind || '').trim().toUpperCase();
    const id = String(dependency.id || '').trim();
    if (!kind || !id) continue;
    const key = `${kind}:${id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    output.push({ kind, id, key });
  }
  return output;
}

function routeIdentity(input) {
  return {
    capability: input.capability,
    boundary: input.boundary,
    canonical_owner: input.canonical_owner,
    callable_skill: input.callable_skill,
    real_consumer: input.real_consumer,
  };
}

export function compileRoute(input = {}) {
  const errors = [];
  const blockers = [];
  const warnings = [];

  const capability = String(input.capability || '').trim();
  const boundary = String(input.boundary || '').trim();
  if (!capability) errors.push('CAPABILITY_MISSING');
  if (!boundary) errors.push('BOUNDARY_MISSING');

  const { unique: sources, dropped: duplicateSources } = dedupeSources(input.sources);
  errors.push(...validateSources(sources));
  if (duplicateSources.length > 0) warnings.push(`DROP_DUPLICATE:${duplicateSources.length}`);

  const sourceById = new Map(sources.map((source) => [source.id, source]));
  const findings = Array.isArray(input.findings) ? input.findings.map((item) => ({ ...item })) : [];
  const provenReusable = [];

  for (const finding of findings) {
    if (!nonEmpty(finding.id)) {
      errors.push('FINDING_ID_MISSING');
      continue;
    }
    const state = String(finding.state || '').toUpperCase();
    if (![PASS, 'CANDIDATE', UNKNOWN, 'DROP'].includes(state)) {
      errors.push(`FINDING_STATE_INVALID:${finding.id}:${finding.state || 'EMPTY'}`);
      continue;
    }
    if (state !== PASS || finding.reusable !== true) continue;

    const refs = Array.isArray(finding.source_ids) ? finding.source_ids : [];
    const provenSupport = refs.some((id) => sourceById.get(id)?.state === PASS);
    if (!provenSupport) {
      blockers.push(`PROVEN_FINDING_WITHOUT_PROVEN_SOURCE:${finding.id}`);
      continue;
    }
    provenReusable.push(finding);
  }

  if (provenReusable.length === 0) blockers.push('NO_PROVEN_REUSABLE_DELTA');

  const conflicts = Array.isArray(input.conflicts) ? input.conflicts.map((item) => ({ ...item })) : [];
  for (const conflict of conflicts) {
    const status = String(conflict.status || '').toUpperCase();
    if (status === 'UNRESOLVED' || status === UNKNOWN || !status) {
      blockers.push(`UNRESOLVED_CONFLICT:${conflict.id || 'UNKNOWN'}`);
    }
    if (status === FAIL) blockers.push(`COUNTERPROVED_CONFLICT:${conflict.id || 'UNKNOWN'}`);
  }

  const counterproof = input.counterproof && typeof input.counterproof === 'object'
    ? { ...input.counterproof }
    : { status: UNKNOWN };
  if (counterproof.status === FAIL) blockers.push('COUNTERPROOF_FAIL');
  else if (counterproof.status !== PASS) blockers.push('COUNTERPROOF_NOT_PASS');

  const requiredFields = [
    ['canonical_owner', input.canonical_owner],
    ['callable_skill', input.callable_skill],
    ['real_consumer', input.real_consumer],
    ['test_ref', input.test_ref],
    ['gate_ref', input.gate_ref],
  ];
  for (const [name, value] of requiredFields) {
    if (!nonEmpty(value)) blockers.push(`OPERATIONAL_CRYSTAL_FIELD_MISSING:${name}`);
  }

  const dependencies = normalizeDependencies(input.dependencies);
  if (dependencies.length === 0) blockers.push('DEPENDENCIES_MISSING');

  if (errors.length > 0) {
    return {
      status: 'INVALID',
      errors,
      blockers,
      warnings,
      duplicate_sources_dropped: duplicateSources.length,
    };
  }

  const routeId = sha256({
    capability,
    boundary,
    canonical_owner: input.canonical_owner || null,
    callable_skill: input.callable_skill || null,
    real_consumer: input.real_consumer || null,
  }).slice(0, 24);

  const routeIr = {
    schema_version: 1,
    route_id: routeId,
    capability,
    boundary,
    canonical_owner: input.canonical_owner || null,
    callable_skill: input.callable_skill || null,
    real_consumer: input.real_consumer || null,
    test_ref: input.test_ref || null,
    gate_ref: input.gate_ref || null,
    provenance: sources.map((source) => ({
      id: source.id,
      class: source.class,
      provenance: source.provenance,
      state: source.state,
      fingerprint: source.fingerprint || null,
    })),
    proven_reusable_findings: provenReusable.map((finding) => finding.id),
    counterproof,
    dependencies,
    compiled_from_head: input.compiled_from_head || null,
    source_count_raw: Array.isArray(input.sources) ? input.sources.length : 0,
    source_count_unique: sources.length,
    source_duplicates_dropped: duplicateSources.length,
  };

  const status = blockers.length === 0 ? 'COMPILED' : 'CANDIDATE';
  return {
    status,
    route_id: routeId,
    route_ir: routeIr,
    route_hash: sha256(routeIr),
    errors,
    blockers,
    warnings,
    duplicate_sources_dropped: duplicateSources.length,
  };
}

export function promoteRoute(compiled, receipt = {}) {
  if (!compiled || compiled.status !== 'COMPILED' || !compiled.route_ir) {
    return { status: 'BLOCKED', reason: 'ROUTE_NOT_COMPILED' };
  }

  if (receipt.authority_valid !== true) {
    return { status: 'BLOCKED', reason: 'AUTHORITY_NOT_VALID' };
  }

  const checks = {
    apply: receipt.apply,
    proof: receipt.proof,
    test: receipt.test,
    regression: receipt.regression,
    final_counterproof: receipt.final_counterproof,
    gate: receipt.gate,
  };

  const failed = Object.entries(checks).filter(([, value]) => value === FAIL).map(([name]) => name);
  if (failed.length > 0) return { status: 'BLOCKED', reason: `CHECK_FAIL:${failed.join(',')}` };

  const pending = Object.entries(checks).filter(([, value]) => value !== PASS).map(([name]) => name);
  if (pending.length > 0) return { status: 'PENDING', reason: `CHECK_NOT_PASS:${pending.join(',')}` };

  const route = {
    ...compiled.route_ir,
    state: 'FLASH_READY',
    verified_at_head: receipt.verified_at_head || compiled.route_ir.compiled_from_head || null,
    verification: checks,
    authority_receipt: receipt.authority_receipt || null,
  };

  return {
    status: 'FLASH_READY',
    route,
    route_hash: sha256(route),
  };
}

export function assessDelta(route, delta = {}) {
  if (!route || route.state !== 'FLASH_READY') {
    return { stale: true, reason: 'ROUTE_NOT_FLASH_READY', affected: [] };
  }

  const affected = [];
  const capability = String(route.capability || '');
  const boundary = String(route.boundary || '');

  const affectedCapabilities = new Set(Array.isArray(delta.affected_capabilities) ? delta.affected_capabilities : []);
  if (affectedCapabilities.has(capability)) affected.push(`CAPABILITY:${capability}`);

  const changedBoundaries = new Set(Array.isArray(delta.changed_boundaries) ? delta.changed_boundaries : []);
  if (changedBoundaries.has(boundary)) affected.push(`BOUNDARY:${boundary}`);

  const changedDependencies = new Set(Array.isArray(delta.changed_dependencies) ? delta.changed_dependencies : []);
  for (const dependency of route.dependencies || []) {
    if (changedDependencies.has(dependency.key) || changedDependencies.has(dependency.id)) {
      affected.push(dependency.key);
    }
  }

  if (delta.new_source_relevant_to_capability === capability) affected.push(`NEW_SOURCE:${capability}`);
  if (delta.runtime_drift === true) affected.push('RUNTIME_DRIFT');
  if (delta.evidence_stale === true) affected.push('EVIDENCE_STALE');

  return {
    stale: affected.length > 0,
    reason: affected.length > 0 ? 'AFFECTED_DELTA_RECOMPILE_REQUIRED' : 'UNAFFECTED_ROUTE_REUSE',
    affected: [...new Set(affected)],
  };
}

export function flashDecision(route, delta = {}) {
  const assessment = assessDelta(route, delta);
  if (assessment.stale) {
    return {
      decision: 'RECOMPILE_DELTA',
      assessment,
      load: ['AFFECTED_ROUTE', 'CANONICAL_OWNER', 'RELEVANT_SOURCE_DELTA', 'LIVE_STATE', 'APPLICABLE_PROOF'],
    };
  }
  return {
    decision: 'EXECUTE_FLASH_ROUTE',
    assessment,
    load: ['ROUTE_IR', 'CANONICAL_OWNER', 'CALLABLE_SKILL', 'LIVE_STATE', 'APPLICABLE_PROOF'],
  };
}

export function tick({ phase, delta = 'NO_CHANGE', owner = 'UNKNOWN', route = 'PENDING', blocker = 0, next = 'UNKNOWN' } = {}) {
  return {
    phase: phase || 'UNKNOWN',
    delta,
    owner,
    route,
    blocker,
    next,
  };
}

export function selfTest() {
  const base = {
    capability: 'EXAMPLE_CAPABILITY',
    boundary: 'repo:example/path',
    sources: [
      { id: 'official', class: 'OFFICIAL_DOC', provenance: 'official://example', state: PASS, fingerprint: 'a' },
      { id: 'duplicate', class: 'OFFICIAL_DOC', provenance: 'official://copy', state: PASS, fingerprint: 'a' },
      { id: 'test', class: 'TEST', provenance: 'repo://test', state: PASS, fingerprint: 'b' },
    ],
    findings: [{ id: 'gold', state: PASS, reusable: true, source_ids: ['official', 'test'] }],
    conflicts: [{ id: 'c1', status: 'RESOLVED' }],
    counterproof: { status: PASS, evidence: 'counterproof://1' },
    canonical_owner: 'docs/owner.md',
    callable_skill: '.agents/skills/example/SKILL.md',
    real_consumer: 'scripts/example.mjs',
    test_ref: 'scripts/example.test.mjs',
    gate_ref: '.github/workflows/example.yml',
    dependencies: [
      { kind: 'PATH', id: 'scripts/example.mjs' },
      { kind: 'CAPABILITY', id: 'EXAMPLE_CAPABILITY' },
    ],
    compiled_from_head: 'abc123',
  };

  const compiled = compileRoute(base);
  assert.equal(compiled.status, 'COMPILED');
  assert.equal(compiled.duplicate_sources_dropped, 1);
  assert.equal(compiled.route_ir.source_count_unique, 2);

  const flash = promoteRoute(compiled, {
    authority_valid: true,
    apply: PASS,
    proof: PASS,
    test: PASS,
    regression: PASS,
    final_counterproof: PASS,
    gate: PASS,
    verified_at_head: 'def456',
  });
  assert.equal(flash.status, 'FLASH_READY');

  const unrelated = flashDecision(flash.route, { changed_dependencies: ['PATH:outro.mjs'] });
  assert.equal(unrelated.decision, 'EXECUTE_FLASH_ROUTE');

  const affected = flashDecision(flash.route, { changed_dependencies: ['PATH:scripts/example.mjs'] });
  assert.equal(affected.decision, 'RECOMPILE_DELTA');

  const conflict = compileRoute({ ...base, conflicts: [{ id: 'c2', status: 'UNRESOLVED' }] });
  assert.equal(conflict.status, 'CANDIDATE');
  assert.ok(conflict.blockers.some((value) => value.startsWith('UNRESOLVED_CONFLICT:')));

  const noConsumer = compileRoute({ ...base, real_consumer: '' });
  assert.equal(noConsumer.status, 'CANDIDATE');
  assert.ok(noConsumer.blockers.includes('OPERATIONAL_CRYSTAL_FIELD_MISSING:real_consumer'));

  const failedCounterproof = promoteRoute(compiled, {
    authority_valid: true,
    apply: PASS,
    proof: PASS,
    test: PASS,
    regression: PASS,
    final_counterproof: FAIL,
    gate: PASS,
  });
  assert.equal(failedCounterproof.status, 'BLOCKED');

  return {
    ok: true,
    compiled_route: compiled.route_id,
    source_duplicates_dropped: compiled.duplicate_sources_dropped,
    flash_ready: flash.status,
    unaffected_decision: unrelated.decision,
    affected_decision: affected.decision,
  };
}

const invokedDirectly = process.argv[1]
  ? import.meta.url === pathToFileURL(process.argv[1]).href
  : false;

if (invokedDirectly && process.argv.includes('--self-test')) {
  const result = selfTest();
  console.log('KNOWLEDGE_COMPILER=PASS');
  console.log(`ROUTE=${result.compiled_route}`);
  console.log(`DUPLICATES_DROPPED=${result.source_duplicates_dropped}`);
  console.log(`FLASH=${result.flash_ready}`);
  console.log(`UNAFFECTED=${result.unaffected_decision}`);
  console.log(`AFFECTED=${result.affected_decision}`);
}
