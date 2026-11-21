import test from 'node:test';
import assert from 'node:assert/strict';

const rules = [
  ['github_required', ['centraldark_command']],
  ['answer_blocked', ['centraldark_command', 'not_github_measured']],
  ['repo_context_ready', ['github_measured', 'repo_confirmed', 'main_head_measured']],
  ['pr_context_ready', ['relevant_prs_measured']],
  ['issues_context_ready', ['issues_measured_or_not_material']],
  ['answer_allowed', [
    'centraldark_command',
    'repo_context_ready',
    'pr_context_ready',
    'issues_context_ready',
  ]],
];

function close(seed) {
  const facts = new Set(seed);
  let changed = true;

  while (changed) {
    changed = false;
    for (const [head, body] of rules) {
      if (body.every((fact) => facts.has(fact)) && !facts.has(head)) {
        facts.add(head);
        changed = true;
      }
    }
  }

  return facts;
}

test('centraldark command without github measurement blocks operational answer', () => {
  const facts = close(['centraldark_command', 'not_github_measured']);

  assert.equal(facts.has('answer_blocked'), true);
  assert.equal(facts.has('answer_allowed'), false);
});

test('centraldark command with repo, PR and issue context allows answer', () => {
  const facts = close([
    'centraldark_command',
    'github_measured',
    'repo_confirmed',
    'main_head_measured',
    'relevant_prs_measured',
    'issues_measured_or_not_material',
  ]);

  assert.equal(facts.has('repo_context_ready'), true);
  assert.equal(facts.has('pr_context_ready'), true);
  assert.equal(facts.has('issues_context_ready'), true);
  assert.equal(facts.has('answer_allowed'), true);
});

test('unknown issue materiality does not pass silently', () => {
  const facts = close([
    'centraldark_command',
    'github_measured',
    'repo_confirmed',
    'main_head_measured',
    'relevant_prs_measured',
  ]);

  assert.equal(facts.has('issues_context_ready'), false);
  assert.equal(facts.has('answer_allowed'), false);
});
