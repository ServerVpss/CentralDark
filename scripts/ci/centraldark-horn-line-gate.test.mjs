import test from 'node:test';
import assert from 'node:assert/strict';

import {
  classifyProofSurface,
  closeHorn,
  evaluateCentralDarkLine,
} from './centraldark-horn-line-gate.mjs';

test('PDF Horn rule: repeat derivation until fixed point', () => {
  const closure = closeHorn([
    'token_acordar',
    'repo_confirmed',
    'main_head_measured',
    'pr_measured',
    'changed_files_measured',
  ]);

  assert.equal(closure.fixedPoint, true);
  assert.equal(closure.facts.includes('centraldark_command'), true);
  assert.equal(closure.facts.includes('repo_proof_ready'), true);
  assert.equal(closure.facts.includes('answer_allowed'), true);
});

test('no github measurement blocks operational answer', () => {
  const result = evaluateCentralDarkLine({
    facts: ['token_acordar', 'not_github_measured'],
  });

  assert.equal(result.status, 'BLOCKED');
  assert.equal(result.closure.facts.includes('answer_blocked'), true);
  assert.equal(result.closure.facts.includes('answer_allowed'), false);
});

test('Casa proof and site proof are different domains', () => {
  const surfaces = classifyProofSurface([
    'source_sha_measured',
    'artifact_measured',
    'deploy_target_measured',
    'site_http_measured',
  ]);

  assert.equal(surfaces.site, 'PROVED');
  assert.equal(surfaces.casa, 'UNKNOWN');
  assert.deepEqual(surfaces.missingByDomain.casa, [
    'device_measured',
    'workdir_measured',
    'process_measured',
    'receipt_measured',
  ]);
});

test('site can be pushed by repo+ci+site authorization without proving Casa', () => {
  const result = evaluateCentralDarkLine({
    facts: [
      'token_centraldark',
      'repo_confirmed',
      'main_head_measured',
      'pr_measured',
      'changed_files_measured',
      'head_sha_measured',
      'same_head_checks_measured',
      'required_checks_concluded',
      'site_target_authorized',
    ],
  });

  assert.equal(result.canPushSite, true);
  assert.equal(result.surfaces.site, 'UNKNOWN');
  assert.equal(result.surfaces.casa, 'UNKNOWN');
  assert.equal(result.fixedPointCandidate, false);
});

test('main promotion requires repo proof, ci proof, no known regression, and human authority', () => {
  const result = evaluateCentralDarkLine({
    facts: [
      'token_acordar',
      'repo_confirmed',
      'main_head_measured',
      'pr_measured',
      'changed_files_measured',
      'head_sha_measured',
      'same_head_checks_measured',
      'required_checks_concluded',
      'no_regression_known',
      'human_merge_authority',
    ],
  });

  assert.equal(result.canPromoteMain, true);
  assert.equal(result.fixedPointCandidate, false);
});

test('UNKNOWN promoted to PASS breaks contract', () => {
  const result = evaluateCentralDarkLine({
    facts: ['token_acordar', 'unknown_promoted_to_pass'],
  });

  assert.equal(result.status, 'BLOCKED');
  assert.equal(result.closure.facts.includes('contract_broken'), true);
});

test('full fixed point candidate requires repo, ci, site and casa proof', () => {
  const result = evaluateCentralDarkLine({
    facts: [
      'token_centraldark',
      'repo_confirmed',
      'main_head_measured',
      'pr_measured',
      'changed_files_measured',
      'head_sha_measured',
      'same_head_checks_measured',
      'required_checks_concluded',
      'source_sha_measured',
      'artifact_measured',
      'deploy_target_measured',
      'site_http_measured',
      'device_measured',
      'workdir_measured',
      'process_measured',
      'receipt_measured',
      'no_regression_known',
    ],
  });

  assert.equal(result.fixedPointCandidate, true);
  assert.equal(result.surfaces.repo, 'PROVED');
  assert.equal(result.surfaces.ci, 'PROVED');
  assert.equal(result.surfaces.site, 'PROVED');
  assert.equal(result.surfaces.casa, 'PROVED');
});
