import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeReviewFinding } from './coderabbit-bridge.mjs';

test('CodeRabbit review vira candidato sem autoridade', () => {
  const finding = normalizeReviewFinding({
    source: 'coderabbit_github_webhook',
    sender: 'coderabbitai[bot]',
    body: 'CRITICAL: root typecheck não cobre o app',
    url: 'https://github.com/ServerVpss/CentralDark/pull/1#discussion',
    observed_at: '2026-09-16T20:00:00Z',
    metadata: { pr_number: 1, head_sha: 'a'.repeat(40), file: 'package.json', line_start: 7 },
    intent: { story_id: 'STORY-1', scope: 'quality', acceptance_criteria: ['typecheck cobre app'] },
  });
  assert.equal(finding.schema, 'centraldark.review-finding.v1');
  assert.equal(finding.state, 'CANDIDATE');
  assert.equal(finding.authority, false);
  assert.equal(finding.finding.source, 'coderabbit');
  assert.equal(finding.finding.severity, 'critical');
  assert.equal(finding.verification.reproduced, 'UNKNOWN');
  assert.equal(finding.result.next_cursor, 'HERMES_REPRODUCE_TEST_COUNTERPROVE');
});

test('Dependabot usa owner único de conflito/dependência', () => {
  const finding = normalizeReviewFinding({
    source: 'dependabot_pr',
    body: 'update semver patch',
    metadata: { pr_number: 2, head_sha: 'b'.repeat(40), category: 'dependency_update' },
  });
  assert.equal(finding.finding.source, 'dependabot');
  assert.equal(finding.state, 'OBSERVED');
  assert.equal(finding.result.next_cursor, 'APPLY_DEPENDABOT_POLICY_AND_SAME_HEAD_GATES');
  assert.equal(finding.routing.owner, '.agents/skills/git-conflict-resolve-house-standard/SKILL.md');
  assert.equal(finding.routing.capability, 'dependency_reconciliation');
  assert.equal(finding.verification.still_valid, 'UNKNOWN');
});


test('intenção estruturada pode ser extraída do corpo do PR', () => {
  const finding = normalizeReviewFinding({
    source: 'coderabbit_github_webhook',
    body: 'review',
    metadata: {
      pr_body: '## Referência da história AIOX\nID da história: STORY-42\n\n### Critérios de aceitação abordados\n- [x] AC-1: prova atual\n- [ ] AC-2: contraprova',
    },
  });
  assert.equal(finding.intent.story_id, 'STORY-42');
  assert.deepEqual(finding.intent.acceptance_criteria, ['AC-1: prova atual', 'AC-2: contraprova']);
});
