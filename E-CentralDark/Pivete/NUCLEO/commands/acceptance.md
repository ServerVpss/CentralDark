# COMANDO - acceptance.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\runs\shared\acceptance.ts
**SHA:** 13a53447f5047c1b
**Timestamp:** 2026-08-28T02:24:57.019770
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- commandsRun: [{ command: "command", result: "passed", summary: "short result" }],
- function extractBalancedJson(text: string, start: number): string | undefined {
- commandsRun: "commandsRun",
- commands_run: "commandsRun",
- const jsonStart = trimmed.indexOf("{");
- const bodyStart = opener.index + opener[0].length;
- const jsonStart = output.indexOf("{", markerIndex);
- if (jsonStart === -1) {
- commandsRun: childReports.flatMap((report) => report.commandsRun ?? []),

### Padroes
- const trailingFencePattern = /\n?```(acceptance[-_]report|json|jsonc|json5)\s*\n([\s\S]*?)```\s*/gi;
- const SENSITIVE_ENV_KEY_PATTERN = /(?:^|_)(?:TOKEN|SECRET|PASSWORD|PASS|AUTH|CREDENTIAL|COOKIE|SESSION|PRIVATE|API_KEY|ACCESS_KEY)(?:_|$)/i;

### Contratos
- export function normalizeGateAcceptance(gate: unknown, acceptance: AcceptanceInput | undefined): GateAcceptanceNormalizationResult {
- if (gate === undefined) return acceptance === undefined ? { ok: true } : { ok: true, acceptance };
- const gate = criterion as Record<string, unknown>;
- return (criteria ?? []).map((criterion, index): ResolvedAcceptanceGate => {
- lines.push("", `Review gate: ${acceptance.review.required === false ? "optional" : "required"}${acceptance.review.agent ? ` by ${acceptance.review.agent}` : ""}.`);

### Riscos
- reviewFindings: ["blocker: file.ts:12 - issue found, or no blockers"],

### Ouro Bruto (primeiros 5000 chars)
```
import { spawn } from "node:child_process";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import type {
	AcceptanceConfig,
	AcceptanceEvidenceKind,
	AcceptanceInput,
	AgentContract,
	AcceptanceLedger,
	AcceptanceLevel,
	AcceptanceReport,
	AcceptanceRole,
	AcceptanceRuntimeCheck,
	AcceptanceRuntimeCheckStatus,
	AcceptanceReviewResult,
	AcceptanceVerifyCommand,
	AcceptanceVerifyResult,
	ResolvedAcceptanceConfig,
	ResolvedAcceptanceGate,
	SingleResult,
	SubagentRunMode,
} from "../../shared/types.ts";
import { isAgentContractV1 } from "./agent-contract.ts";
import { classifyTaskMutationIntent, stripSeverityCompounds, taskMayMutate } from "./task-intent.ts";

const LEVEL_RANK: Record<Exclude<AcceptanceLevel, "auto">, number> = {
	none: 0,
	attested: 1,
	checked: 2,
	verified: 3,
};

const VALID_LEVELS = new Set<AcceptanceLevel>(["auto", "none", "attested", "checked", "verified"]);
const VALID_EVIDENCE_KINDS: AcceptanceEvidenceKind[] = [
	"changed-files",
	"tests-added",
	"commands-run",
	"validation-output",
	"residual-risks",
	"no-staged-files",
	"diff-summary",
	"review-findings",
	"manual-notes",
];
const VALID_EVIDENCE = new Set<AcceptanceEvidenceKind>(VALID_EVIDENCE_KINDS);
const ACCEPTANCE_EVIDENCE_HELP = `Supported evidence kinds: ${VALID_EVIDENCE_KINDS.join(", ")}. Example: { level: "checked", evidence: ["commands-run", "changed-files"] }.`;
const ACCEPTANCE_OBJECT_EXAMPLE = "Example: { level: \"checked\", evidence: [\"commands-run\", \"changed-files\"] }.";
const ACCEPTANCE_CONFIG_KEYS = new Set(["level", "criteria", "evidence", "verify", "review", "stopRules", "reason"]);
const ACCEPTANCE_GATE_KEYS = new Set(["id", "must", "evidence", "severity"]);
const ACCEPTANCE_VERIFY_KEYS = new Set(["id", "command", "timeoutMs", "cwd", "env", "allowFailure"]);
const ACCEPTANCE_REVIEW_KEYS = new Set(["agent", "focus", "required"]);
const EXPLICIT_REVIEWED_UNAVAILABLE = "is an achieved status, not a requestable acceptance level. For a read-only reviewer call, omit acceptance. To require independent review of a writer result, use acceptance.review.required and orchestrate the reviewer separately.";

function normalizeLevel(level: AcceptanceLevel | undefined): Exclude<AcceptanceLevel, "auto"> | "auto" {
	return level ?? "auto";
}

function unique<T>(items: T[]): T[] {
	return [...new Set(items)];
}

function requiredEvidenceForLevel(level: Exclude<AcceptanceLevel, "auto">): AcceptanceEvidenceKind[] {
	switch (level) {
		case "none":
			return [];
		case "attested":
			return ["manual-notes", "residual-risks"];
		case "checked":
			return ["changed-files", "tests-added", "commands-run", "residual-risks", "no-staged-files"];
		case "verified":
			return ["changed-files", "tests-added", "commands-run", "validation-output", "residual-risks", "no-staged-files"];
	}
}

function inferLevel(input: {
	agentName: string;
	acceptanceRole?: AcceptanceRole;
	task?: string;
	mode?: SubagentRunMode;
	async?: boolean;
	dynamic?: boolean;
	dynamicGroup?: boolean;
}): { level: Exclude<AcceptanceLevel, "auto">; reasons: string[]; criteria: string[]; evidence: AcceptanceEvidenceKind[]; review?: { agent?: string; required?: boolean } } {
	const agent = input.agentName.toLowerCase();
	const task = input.task?.toLowerCase() ?? "";
	const reasons: string[] = [];
	// Declared roles replace name heuristics, so use the full writer grammar to detect explicit mutation independently of the actual agent name.
	const intent = classifyTaskMutationIntent(input.acceptanceRole ? "worker" : input.agentName, input.task ?? "");
	const readOnlyTask = intent.kind === "read-only"
		|| (intent.kind === "unknown" && /\b(?:read[- ]only|review[- ]only|no edits|without edits|inspect|summari[sz]e)\b/.test(task));
	const rolePatchTask = input.acceptanceRole !== undefined
		&& intent.kind !== "read-only"
		&& !/\b(?:do not|don't|must not)\s+patch\b/.test(task)
		&& /\bpatch\s+(?:(?:\.{0,2}[\\/])?(?:[\w.-]+[\\/])+[\w.-]+|[\w.-]+\.[a-z0-9]+\b|(?:the\s+)?parser\b)/.test(stripSeverityCompounds(task));
	const taskMayWrite = readOnlyTask ? false : taskMayMutate(input.task ?? "") || intent.kind === "implementation" || rolePatchTask;
	const readOnlyAgent = input.acceptanceRole === "read-only"
		|| (input.acceptanceRole === undefined && /\b(?:reviewer|oracle|scout|researcher|analyst)\b/.test(agent));
	const writeTask = taskMayWrite
		|| (input.acceptanceRole === "writer" && !readOnlyTask)
		|| (input.acceptanceRole === undefined && /\bworker\b/.test(agent) && !readOnlyTask);
	const inferredReadOnly = readOnlyTask || (input.acceptanceRole === "read-only" && !taskMayWrite);
	const roleResolvesReadOnly = input.acceptanceRole !== undefined && inferredReadOnly;
	const keywordRiskReadOnly = input.acceptanceRole === undefined ? intent.kind === "read-only" : inferredReadOnly;
	const risky = Boolean(input.async && writeTask)
		|| (Boolean(input.dynamic) && !roleResolvesReadOn
```