# COMANDO - task-intent.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\runs\shared\task-intent.ts
**SHA:** 273b8d9a3bbc03bf
**Timestamp:** 2026-08-28T02:24:58.362832
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- const NO_EDIT_PROHIBITION_PATTERN = /\b(?:do not|don't|must not)\s+(?:edit|modify|write(?:\s+to)?|touch|change)\b((?:(?!\b(?:but|and|then)\b)[^.;,:!?\n–—-])*)/gi;
- const SEVERITY_COMPOUND_PATTERN = /\b(?:must|should|needs)[\-\u2010-\u2015](?:fix|edit|update|add|remove|replace|create|apply|make|do|implement|modify|delete|patch)\b/gi;
- const FIX_OR_PATCH_IMPLEMENTATION_PATTERN = /\b(?:fix|patch)\s+(?:(?:it|this|that|them|each|any|all|these|those)\b|(?:(?:a|an|the|any|all)\s+)?(?:(?:failing|failed|broken|flaky|red|cold|start|current|
- const MAY_MUTATE_VERB_PATTERN = /\b(?:fix|implement|update|write|edit|modify|migrate|delete|remove|refactor|commit)\b/i;

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Shared task mutation-intent classifier.
 *
 * Single authority for reading a task's wording, answering two different
 * questions from one prohibition analysis:
 *
 * - `classifyTaskMutationIntent` / `expectsImplementationMutation`: does the
 *   task REQUIRE file changes? Consumed by the completion mutation guard,
 *   which blocks completion, so its vocabulary is deliberately narrow.
 * - `taskMayMutate`: COULD the task plausibly change files? Consumed by
 *   acceptance level inference, which only raises evidence gates, so its
 *   vocabulary is deliberately broad (any bare write verb).
 *
 * Explicit read-only wording ("do not modify", "review only") is a task-level
 * intent only when no write imperative survives outside those phrases. A task
 * like "Do not modify tests; implement the fix" is an implementation task with
 * a scoped constraint, not a read-only task.
 */

const REVIEW_ONLY_PATTERNS = [
	/\breview only\b/i,
	/\bsuggest fixes only\b/i,
	/\bonly return findings\b/i,
	/\breturn findings only\b/i,
];

const REVIEWER_REQUIRED_EDIT_PATTERNS = [
	/\bmust\s+(?:edit|modify|change|fix|patch|apply|implement)\b/i,
	/\brequired\s+to\s+(?:edit|modify|change|fix|patch|apply|implement)\b/i,
	/(?:^|[.!?\n]\s*)implement\s+(?:the\s+)?(?:approved|requested|specified|file|code|source|fix(?:es)?|changes?)\b/i,
	/\bregardless\s+of\s+findings\b/i,
	/\balways\s+(?:edit|modify|change|fix|patch|apply|implement)\b/i,
	/\bapply\s+(?:the\s+)?fix(?:es)?\s+directly\b/i,
	/\bmake\s+(?:the\s+)?code\s+changes\b/i,
];

// The prohibition's object ends at punctuation or at a coordinating word
// (but/and/then), so a follow-on clause like "but implement the fix" stays in
// the text for write-intent testing instead of being swallowed as the object.
const NO_EDIT_PROHIBITION_PATTERN = /\b(?:do not|don't|must not)\s+(?:edit|modify|write(?:\s+to)?|touch|change)\b((?:(?!\b(?:but|and|then)\b)[^.;,:!?\n–—-])*)/gi;

/** Objects of a no-edit prohibition that mean "the codebase in general" rather than a named scope. */
const GENERIC_PROHIBITION_OBJECT = /^\s*(?:(?:any|all|the|these|those|your|our|existing|project|product|source|sources|config|configs|repo|repository)[\s/,-]*)*(?:files?|code|codebase|sources?|anything|repo(?:sitory)?)?\s*$/i;

const SCOPED_NO_EDIT_CONSTRAINT_PATTERNS = [
	/\bdo not edit files?\s+outside\b/i,
	/\bdo not edit\s+outside\b/i,
	/\bdo not edit\s+unrelated files?\b/i,
	/\bdo not change\s+unrelated files?\b/i,
	/\bdo not modify\s+unrelated files?\b/i,
];

const NO_TOOL_INTENT_PATTERNS = [
	/\bno tools? needed\b/i,
	/\bno tools? required\b/i,
	/\bwithout using tools\b/i,
	/\bdo not use tools\b/i,
	/\bdon't use tools\b/i,
];

const READ_ONLY_DELIVERABLE_PATTERNS = [
	/\b(?:draft|write|compose|prepare|produce)\s+(?:(?:a|an|the)\s+)?(?:github\s+)?(?:issue|bug report|issue draft|issue body|proposal|plan|report|summary|findings?|analysis|recommendations?)\b/i,
	/\b(?:issue|bug report)\s+(?:draft|body|template)\b/i,
	/\b(?:return|provide|produce)\s+(?:text|markdown|answer|findings?|recommendations?)\s+only\b/i,
];

const RESEARCH_AGENT_PATTERNS = [
	/\binvestigate\b/i,
	/\bscout\b/i,
	/\bresearch(?:er)?\b/i,
];

// Review/severity vocabulary like "must-fix items" or "should-fix tests" is not
// the verb. Rather than dash-guarding every pattern (which would also suppress
// CLI flags like "--fix" and genuine clause-level dashes like "branch—fix it"),
// strip the known severity compounds (must|should|needs + dash + verb) from the
// task text before matching. Dash coverage: ASCII hyphen + U+2010..U+2015.
const SEVERITY_COMPOUND_PATTERN = /\b(?:must|should|needs)[\-\u2010-\u2015](?:fix|edit|update|add|remove|replace|create|apply|make|do|implement|modify|delete|patch)\b/gi;

function stripSeverityCompounds(task: string): string {
	return task.replace(SEVERITY_COMPOUND_PATTERN, " ");
}
export { stripSeverityCompounds };

const FIX_OR_PATCH_IMPLEMENTATION_PATTERN = /\b(?:fix|patch)\s+(?:(?:it|this|that|them|each|any|all|these|those)\b|(?:(?:a|an|the|any|all)\s+)?(?:(?:failing|failed|broken|flaky|red|cold|start|current|existing|reported|approved|known|regression|unit|integration|e2e|source|typescript|type-?script|ts|type-?check|compiler)\s+)*(?:bug|defect|issues?|problems?|failures?|regressions?|tests?|errors?|items?|typos?|code|source|implementation|component|function|module|class|method|logic|file|files|readme|docs?|changelog|package\.json|config|manifest|extension|prompt|command|lint(?:ing)?|build|ci|type-?check|type\s+checking)\b)/i;

const WORKER_IMPLEMENTATION_PATTERNS = [
	/\b(?:implement|edit|modify|refactor|delete)\b/i,
	FIX_OR_PATCH_IMPLEMENTATION_PATTERN,
	/\b(?:update|add|remove|replace|create)\b(?!\s+(?:(?:a|an|the)\s+)?(?:report|summary|findings?)(?:\b|$))/i,
	/\bapply\s+(?:the\s+)?(?:(?:suggested|proposed|recommended)\s+)?(?:changes?|fix(?:es)?|patch)\b/i,
	/\bmake\s+(?:the\s+)?changes\b/i,
	/\bdo those fixes\b/i,
];

const GENERAL_IMPLEMENTATION_PATTERNS = [
	/\b(?:implement|edit|modify|refactor)\b/
```