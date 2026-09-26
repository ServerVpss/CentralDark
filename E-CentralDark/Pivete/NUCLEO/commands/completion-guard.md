# COMANDO - completion-guard.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\runs\shared\completion-guard.ts
**SHA:** 713ed1761e7c3458
**Timestamp:** 2026-08-28T02:24:57.577897
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const REVIVED_TASK_PREFIX = /^You are reviving a previous subagent conversation\.\n\nOriginal run: .+\nOriginal agent: .+(?:\nOriginal session file: .+)?\n\nUse the stored session context as backgroun

### Padroes
- const IMPLEMENTATION_CHALLENGE_FOLLOW_UP_PATTERN = /^(?:Run )?implementation challenge pass (?:one|two|\d+)(?:\s+and implement any better current[- ]scope change\.?|\s+for the accepted candidate\.\s+R
- const NO_BETTER_CHANGE_NEEDED_PATTERN = /^\s*no (?:better|further|additional) (?:current[- ]scope )?(?:code |source |file )?(?:change|changes|edit|edits|patch|patches) (?:is|are) needed\b/i;
- const KEPT_CURRENT_IMPLEMENTATION_PATTERN = /\b(?:kept (?:the )?current (?:implementation|candidate|shape)|(?:the )?current (?:implementation|candidate|shape) was kept)\b/i;
- const NO_CHANGE_MADE_PATTERN = /\bno (?:new )?(?:(?:code|source|file|test)(?:\s*(?:,\s*or|,|\/|or)\s*(?:code|source|file|test))* changes?|changes?) (?:were|was) made\b/i;
- const NO_BETTER_CHANGE_QUALIFIER_PATTERN = /\b(?:do\s+not|don't|dont|not|never|cannot|can't|cant|unable|uncertain|unsure|unclear|disagree|wrong|false|reject|rejected|rejecting|maybe|might|may|\w+n['’]
- const REPORT_SENTENCE_PATTERN = /[^.!?]+(?:[.!?]+(?=(?:["”'’]?\s)|["”'’]?$)|$)/g;
- const QUOTED_CLAIM_PATTERN = /["“]([^"”]+)["”]([.!?]?\s*[^.!?]*)/g;
- const QUOTED_CLAIM_REFERENCE_PATTERN = /\b(?:that|this|it|claim|report|message|disagree)\b/i;
- const CLAIM_CONTRADICTION_PATTERN = /\bbut\b[^.!?]*\b(?:uncertain|unsure|unclear|disagree|wrong|false|reject|rejected|rejecting)\b/i;
- const IMPLEMENTATION_RETRACTION_PATTERN = /\b(?:found|identified)\s+(?:(?:a|an|the)\s+)?(?:required|necessary|additional|better)?\s*(?:(?:code|source|file|test)\s+)?(?:changes?|edits?|patches?)\b|\b(?

### Ouro Bruto (primeiros 5000 chars)
```
import type { Message } from "@earendil-works/pi-ai";
import type { AcceptanceRole, TrackedMutationEvidence } from "../../shared/types.ts";
import { isMutatingTool } from "./long-running-guard.ts";
import { classifyTaskMutationIntent, expectsImplementationMutation, taskMayMutate } from "./task-intent.ts";

export { expectsImplementationMutation };

const READ_ONLY_BUILTIN_TOOLS = new Set([
	"read",
	"grep",
	"find",
	"ls",
	"web_search",
	"fetch_content",
	"get_search_content",
	"intercom",
	"contact_supervisor",
	"structured_output",
]);

// Cursor native edit/write often land as thinking traces (inactive_trace /
// transcript_trace) rather than toolCall parts when native tool replay is off
// or the tool is inactive in context. Match pi-cursor-sdk display labels.
const CURSOR_FILE_MUTATION_THINKING =
	/(?:^|\n)\s*Cursor (?:edit|write)\s*:/i;

const REVIVED_TASK_PREFIX = /^You are reviving a previous subagent conversation\.\n\nOriginal run: .+\nOriginal agent: .+(?:\nOriginal session file: .+)?\n\nUse the stored session context as background\. Answer the orchestrator's follow-up below\. Do not assume the original child process is still alive\.\n\nFollow-up:\n/;
const IMPLEMENTATION_CHALLENGE_FOLLOW_UP_PATTERN = /^(?:Run )?implementation challenge pass (?:one|two|\d+)(?:\s+and implement any better current[- ]scope change\.?|\s+for the accepted candidate\.\s+Reconsider it and implement any better current[- ]scope change\.?)?$/i;
const NO_BETTER_CHANGE_NEEDED_PATTERN = /^\s*no (?:better|further|additional) (?:current[- ]scope )?(?:code |source |file )?(?:change|changes|edit|edits|patch|patches) (?:is|are) needed\b/i;
const KEPT_CURRENT_IMPLEMENTATION_PATTERN = /\b(?:kept (?:the )?current (?:implementation|candidate|shape)|(?:the )?current (?:implementation|candidate|shape) was kept)\b/i;
const NO_CHANGE_MADE_PATTERN = /\bno (?:new )?(?:(?:code|source|file|test)(?:\s*(?:,\s*or|,|\/|or)\s*(?:code|source|file|test))* changes?|changes?) (?:were|was) made\b/i;
const NO_BETTER_CHANGE_QUALIFIER_PATTERN = /\b(?:do\s+not|don't|dont|not|never|cannot|can't|cant|unable|uncertain|unsure|unclear|disagree|wrong|false|reject|rejected|rejecting|maybe|might|may|\w+n['’]t)\b/i;
const REPORT_SENTENCE_PATTERN = /[^.!?]+(?:[.!?]+(?=(?:["”'’]?\s)|["”'’]?$)|$)/g;
const QUOTED_CLAIM_PATTERN = /["“]([^"”]+)["”]([.!?]?\s*[^.!?]*)/g;
const QUOTED_CLAIM_REFERENCE_PATTERN = /\b(?:that|this|it|claim|report|message|disagree)\b/i;
const CLAIM_CONTRADICTION_PATTERN = /\bbut\b[^.!?]*\b(?:uncertain|unsure|unclear|disagree|wrong|false|reject|rejected|rejecting)\b/i;
const IMPLEMENTATION_RETRACTION_PATTERN = /\b(?:found|identified)\s+(?:(?:a|an|the)\s+)?(?:required|necessary|additional|better)?\s*(?:(?:code|source|file|test)\s+)?(?:changes?|edits?|patches?)\b|\b(?:(?:implementation|code|source|file|test)\s+)?work\s+(?:remains?|is\s+(?:needed|required))\b|\b(?:(?:a|an|the)\s+)?(?:(?:code|source|file|test)\s+)?(?:changes?|edits?|patches?)\s+(?:are|is)\s+(?:needed|required)\b|\b(?:required|necessary|additional|better)\s+(?:(?:code|source|file|test)\s+)?(?:changes?|edits?|patches?)\b|\b(?:I|we)?\s*need\s+(?:(?:code|source|file|test)\s+)?(?:changes?|edits?|patches?)\b|\b(?:need|needs|require|requires)\s+(?:to\s+)?(?:implement|make|apply)\b/i;
const IMPLEMENTATION_RETRACTION_GLOBAL_PATTERN = new RegExp(IMPLEMENTATION_RETRACTION_PATTERN.source, "gi");
const DIRECT_CLAIM_RETRACTION_PATTERN = /^\s*(?:I\s+)?(?:disagree|reject|retract)\b|\b(?:disagree|retract|retracted|retracting|reject|rejected|rejecting)\b[^.!?]*\b(?:that|this|it|claim|report|message)\b|\b(?:that|this|it|claim|report|message)\b[^.!?]*\b(?:is|was)\s+(?:rejected|retracted)\b/i;
const NEGATED_RETRACTION_PREFIX_PATTERN = /\b(?:no|not|\w+n['’]t)\b(?:\s+\w+){0,2}\s*$/i;
const REPORTED_CLAIM_PREFIX_PATTERN = /["“]|\b(?:prior|previous)\s+(?:message|report)\b|\b(?:said|stated|reported)\b/i;
const POST_CLAIM_SEPARATOR_PATTERN = /^[\s,;:.—–'"“‘’-]+/;

interface CompletionMutationGuardInput {
	agent: string;
	task: string;
	messages: Message[];
	tools?: string[];
	mcpDirectTools?: string[];
	toolAvailabilityError?: string;
	mutationEvidence?: TrackedMutationEvidence;
}

interface CompletionMutationGuardResult {
	expectedMutation: boolean;
	attemptedMutation: boolean;
	triggered: boolean;
	blocked: boolean;
	message?: string;
}

interface ReportSentence {
	text: string;
	offset: number;
}

export function hasMutationToolCapability(tools: string[] | undefined, mcpDirectTools: string[] | undefined): boolean {
	if ((mcpDirectTools?.length ?? 0) > 0) return true;
	if (tools === undefined) return true;
	return !tools.every((tool) => READ_ONLY_BUILTIN_TOOLS.has(tool));
}

function hasBuiltinMutationTool(tools: string[] | undefined): boolean {
	return tools === undefined || tools.some((tool) => !READ_ONLY_BUILTIN_TOOLS.has(tool));
}

function isWriterRole(agent: string, acceptanceRole: AcceptanceRole | undefined): boolean {
	return acceptanceRole === "writer"
		|| (acceptanceRole === undefined && /\bworker\b
```