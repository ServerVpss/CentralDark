# AGENTE - agent-refinements.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\agents\agent-refinements.ts
**SHA:** aba761e241326306
**Timestamp:** 2026-08-28T02:24:50.990249
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- function hashPrompt(systemPrompt: string): string {
- export function appendAgentRefinementOverlay(systemPrompt: string, input: { cwd: string; agentName: string }): string {

### Ouro Bruto (primeiros 5000 chars)
```
import { createHash, randomUUID } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import type { AgentToolResult } from "@earendil-works/pi-agent-core";
import { discoverAgents, formatUnknownAgentError, resolveAgentName, unknownAgentDiagnosticContext, type AgentConfig } from "./agents.ts";
import { getProjectSubagentsDir } from "../shared/artifacts.ts";
import type { Details, JsonSchemaObject, SingleResult, SubagentState } from "../shared/types.ts";

const REFINEMENT_FORMAT_VERSION = 1;
const REFINEMENT_DIR = "refinements";
const CURRENT_FENCE = "pi-subagents-refinement-current";
const SNAPSHOTS_FENCE = "pi-subagents-refinement-snapshots-json";
const MAX_EVIDENCE_ITEMS = 8;
const MAX_AGE_DAYS = 14;
const MAX_ITEM_BYTES = 2_048;
const MAX_PACKET_BYTES = 16_384;
const PROPOSAL_AGENT = "reviewer";

type RefinementAction = "refine" | "refine.show" | "refine.rollback";
type RefinementEvidenceSource = "live-state" | "artifact-metadata" | "artifact-output";

export interface RefinementEvidenceItem {
	id: string;
	source: RefinementEvidenceSource;
	runId?: string;
	agent: string;
	at?: string;
	status?: string;
	model?: string;
	thinking?: string;
	acceptanceStatus?: string;
	reviewFindings?: string[];
	residualRisks?: string[];
	errors?: string[];
	controlSignals?: string[];
	outputTail?: string;
	refs: string[];
}

export interface RefinementProposalEdit {
	title: string;
	guidance: string;
	evidenceIds: string[];
	rationale: string;
}

export interface RefinementProposal {
	summary: string;
	edits: RefinementProposalEdit[];
	rejectedIdeas?: string[];
	residualRisks: string[];
}

interface RefinementMetadata {
	agent: string;
	revision: number;
	updatedAt: string;
	base: {
		source: AgentConfig["source"];
		filePath: string;
		systemPromptSha256: string;
	};
	evidence: {
		maxItems: number;
		maxAgeDays: number;
		itemBytes: number;
		totalBytes: number;
	};
}

interface RefinementSnapshot {
	revision: number;
	at: string;
	action: "refine" | "rollback";
	before: string;
	after: string;
	evidenceIds: string[];
	proposalAgent?: string;
}

interface ParsedRefinementFile {
	metadata: RefinementMetadata;
	current: string;
	snapshots: RefinementSnapshot[];
}

interface ExistingRefinementFile {
	path: string;
	parsed?: ParsedRefinementFile;
}

interface ProposalChildResult {
	isError?: boolean;
	content?: Array<{ type: string; text?: string }>;
	details?: {
		results?: Array<Pick<SingleResult, "structuredOutput" | "finalOutput" | "error">>;
	};
}

export type LaunchRefinementProposalChild = (
	task: string,
	outputSchema: JsonSchemaObject,
	signal: AbortSignal,
) => Promise<ProposalChildResult>;

export interface RefinementActionContext {
	cwd: string;
	state: SubagentState;
	signal: AbortSignal;
	launchProposalChild: LaunchRefinementProposalChild;
}

function result(text: string, isError = false): AgentToolResult<Details> {
	return {
		content: [{ type: "text", text }],
		...(isError ? { isError: true } : {}),
		details: { mode: "management", results: [] },
	};
}

function record(value: unknown): Record<string, unknown> | null {
	return value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function text(value: unknown): string | null {
	return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function textArray(value: unknown): string[] {
	if (!Array.isArray(value)) return [];
	return value.map(text).filter((entry): entry is string => entry !== null);
}

function isoTime(value: unknown): string | undefined {
	const numberValue = typeof value === "number" && Number.isFinite(value) ? value : undefined;
	if (numberValue !== undefined) return new Date(numberValue).toISOString();
	const stringValue = text(value);
	if (!stringValue) return undefined;
	const parsed = Date.parse(stringValue);
	return Number.isFinite(parsed) ? new Date(parsed).toISOString() : undefined;
}

function hashPrompt(systemPrompt: string): string {
	return createHash("sha256").update(systemPrompt).digest("hex");
}

function safeAgentFileName(agentName: string): string {
	const trimmed = agentName.trim();
	if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(trimmed) || trimmed.includes("..")) {
		throw new Error(`Agent name '${agentName}' cannot be used as a refinement file name.`);
	}
	return `${trimmed}.md`;
}

export function getAgentRefinementPath(cwd: string, agentName: string): string {
	const refinementRoot = path.join(getProjectSubagentsDir(cwd), REFINEMENT_DIR);
	const resolvedRoot = path.resolve(refinementRoot);
	const resolvedPath = path.resolve(refinementRoot, safeAgentFileName(agentName));
	if (resolvedPath !== path.join(resolvedRoot, path.basename(resolvedPath))) {
		throw new Error(`Agent name '${agentName}' cannot be used as a refinement file name.`);
	}
	return resolvedPath;
}

function readExisting(cwd: string, agentName: string): ExistingRefinementFile {
	const filePath = getAgentRefinementPath(cwd, agentName);
	if (!fs
```