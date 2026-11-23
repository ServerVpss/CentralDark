#!/usr/bin/env node

import fs from 'node:fs';
import process from 'node:process';

export const DOMAIN_REQUIRED_PROOF = Object.freeze({
  repo: ['repo_confirmed', 'main_head_measured', 'pr_measured', 'changed_files_measured'],
  ci: ['head_sha_measured', 'same_head_checks_measured', 'required_checks_concluded'],
  site: ['source_sha_measured', 'artifact_measured', 'deploy_target_measured', 'site_http_measured'],
  casa: ['device_measured', 'workdir_measured', 'process_measured', 'receipt_measured'],
});

export const LINE_RULES = Object.freeze([
  {
    id: 'R_INPUT_ACORDAR',
    when: ['token_acordar'],
    then: 'centraldark_command',
  },
  {
    id: 'R_INPUT_CENTRALDARK',
    when: ['token_centraldark'],
    then: 'centraldark_command',
  },
  {
    id: 'R_REPO_READY',
    when: DOMAIN_REQUIRED_PROOF.repo,
    then: 'repo_proof_ready',
  },
  {
    id: 'R_CI_READY',
    when: DOMAIN_REQUIRED_PROOF.ci,
    then: 'ci_proof_ready',
  },
  {
    id: 'R_SITE_READY',
    when: DOMAIN_REQUIRED_PROOF.site,
    then: 'site_proof_ready',
  },
  {
    id: 'R_CASA_READY',
    when: DOMAIN_REQUIRED_PROOF.casa,
    then: 'casa_proof_ready',
  },
  {
    id: 'R_ANSWER_ALLOWED',
    when: ['centraldark_command', 'repo_proof_ready', 'pr_measured'],
    then: 'answer_allowed',
  },
  {
    id: 'R_MAIN_PROMOTION_ALLOWED',
    when: ['repo_proof_ready', 'ci_proof_ready', 'no_regression_known', 'human_merge_authority'],
    then: 'main_promotion_allowed',
  },
  {
    id: 'R_SITE_PUSH_ALLOWED',
    when: ['repo_proof_ready', 'ci_proof_ready', 'site_target_authorized'],
    then: 'site_push_allowed',
  },
  {
    id: 'R_FIXED_POINT',
    when: ['repo_proof_ready', 'ci_proof_ready', 'site_proof_ready', 'casa_proof_ready', 'no_regression_known'],
    then: 'fixed_point_candidate',
  },
]);

export const FAIL_CLOSED_RULES = Object.freeze([
  {
    id: 'F_NO_GITHUB_MEASUREMENT',
    when: ['centraldark_command', 'not_github_measured'],
    fail: 'answer_blocked',
  },
  {
    id: 'F_UNKNOWN_AS_PASS',
    when: ['unknown_promoted_to_pass'],
    fail: 'contract_broken',
  },
  {
    id: 'F_DOC_AS_EXECUTION',
    when: ['documented_promoted_to_executed'],
    fail: 'contract_broken',
  },
  {
    id: 'F_MERGED_AS_DEPLOYED',
    when: ['merged_promoted_to_deployed'],
    fail: 'contract_broken',
  },
  {
    id: 'F_SITE_WITHOUT_SITE_PROOF',
    when: ['site_claimed', 'not_site_proof_ready'],
    fail: 'site_claim_blocked',
  },
  {
    id: 'F_CASA_WITHOUT_CASA_PROOF',
    when: ['casa_claimed', 'not_casa_proof_ready'],
    fail: 'casa_claim_blocked',
  },
]);

export function normalizeFacts(input = []) {
  return new Set(
    input
      .map((fact) => String(fact ?? '').trim())
      .filter(Boolean),
  );
}

export function closeHorn(seedFacts = [], options = {}) {
  const facts = normalizeFacts(seedFacts);
  const derivations = [];
  const rules = options.rules ?? LINE_RULES;
  const failRules = options.failRules ?? FAIL_CLOSED_RULES;
  const maxRounds = Number.isInteger(options.maxRounds) ? options.maxRounds : 64;

  for (let round = 1; round <= maxRounds; round++) {
    let changed = false;

    for (const rule of rules) {
      if (rule.when.every((fact) => facts.has(fact)) && !facts.has(rule.then)) {
        facts.add(rule.then);
        derivations.push({ round, rule: rule.id, from: rule.when, to: rule.then });
        changed = true;
      }
    }

    for (const rule of failRules) {
      if (rule.when.every((fact) => facts.has(fact)) && !facts.has(rule.fail)) {
        facts.add(rule.fail);
        derivations.push({ round, rule: rule.id, from: rule.when, to: rule.fail });
        changed = true;
      }
    }

    if (!changed) {
      return {
        fixedPoint: true,
        rounds: round,
        facts: [...facts].sort(),
        derivations,
      };
    }
  }

  return {
    fixedPoint: false,
    rounds: maxRounds,
    facts: [...facts].sort(),
    derivations,
  };
}

export function classifyProofSurface(facts = []) {
  const factSet = normalizeFacts(facts);
  const missingByDomain = Object.fromEntries(
    Object.entries(DOMAIN_REQUIRED_PROOF).map(([domain, required]) => [
      domain,
      required.filter((fact) => !factSet.has(fact)),
    ]),
  );

  return {
    repo: missingByDomain.repo.length === 0 ? 'PROVED' : 'UNKNOWN',
    ci: missingByDomain.ci.length === 0 ? 'PROVED' : 'UNKNOWN',
    site: missingByDomain.site.length === 0 ? 'PROVED' : 'UNKNOWN',
    casa: missingByDomain.casa.length === 0 ? 'PROVED' : 'UNKNOWN',
    missingByDomain,
  };
}

export function evaluateCentralDarkLine(input = {}) {
  const seedFacts = Array.isArray(input.facts) ? input.facts : [];
  const closure = closeHorn(seedFacts);
  const surfaces = classifyProofSurface(closure.facts);
  const factSet = new Set(closure.facts);

  return {
    status: factSet.has('contract_broken') || factSet.has('answer_blocked')
      ? 'BLOCKED'
      : factSet.has('answer_allowed')
        ? 'ALLOW_ANSWER'
        : 'UNKNOWN',
    canPromoteMain: factSet.has('main_promotion_allowed'),
    canPushSite: factSet.has('site_push_allowed'),
    fixedPointCandidate: factSet.has('fixed_point_candidate'),
    surfaces,
    closure,
  };
}

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const inputPath = process.argv[2];
  const input = inputPath ? readJson(inputPath) : { facts: process.env.CENTRALDARK_FACTS?.split(',') ?? [] };
  const result = evaluateCentralDarkLine(input);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  process.exit(result.status === 'BLOCKED' ? 2 : 0);
}
