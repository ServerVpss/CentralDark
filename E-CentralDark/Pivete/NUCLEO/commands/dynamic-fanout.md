# COMANDO - dynamic-fanout.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\runs\shared\dynamic-fanout.ts
**SHA:** a9d77c71ccc1cf54
**Timestamp:** 2026-08-28T02:24:57.640581
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- const SAFE_OUTPUT_NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;
- const ITEM_NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;
- const ITEM_REF_PATTERN = /\{([A-Za-z_][A-Za-z0-9_]*)(?:\.([^{}]+))?\}/g;

### Ouro Bruto (primeiros 5000 chars)
```
import type { DynamicParallelStep, ParallelTaskItem } from "../../shared/settings.ts";
import type { ArtifactPaths, ChainOutputMap, JsonSchemaObject, SingleResult } from "../../shared/types.ts";
import { getSingleResultOutput } from "../../shared/utils.ts";
import { validateStructuredOutputValue } from "./structured-output.ts";

export class DynamicFanoutError extends Error {}

export interface DynamicFanoutConfig {
	maxItems?: number;
	allowRunnerFields?: boolean;
}

export interface DynamicMaterializedItem {
	index: number;
	key: string;
	idKey: string;
	item: unknown;
}

export interface DynamicCollectedResult {
	key: string;
	index: number;
	item: unknown;
	agent: string;
	exitCode: number | null;
	text: string;
	structured?: unknown;
	error?: string;
	timedOut?: boolean;
	stopped?: boolean;
	outputPath?: string;
	artifactPaths?: ArtifactPaths;
}

export interface DynamicMaterializedGroup {
	items: DynamicMaterializedItem[];
	parallel: ParallelTaskItem[];
	collectedOnEmpty?: DynamicCollectedResult[];
}

const SAFE_OUTPUT_NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;
const ITEM_NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;
const ITEM_REF_PATTERN = /\{([A-Za-z_][A-Za-z0-9_]*)(?:\.([^{}]+))?\}/g;
const RESERVED_TEMPLATE_NAMES = new Set(["task", "previous", "chain_dir", "outputs"]);
const DYNAMIC_STEP_KEYS = new Set(["expand", "parallel", "collect", "concurrency", "failFast", "phase", "label", "acceptance", "agentContract", "gateOn"]);
const RUNNER_DYNAMIC_STEP_KEYS = new Set([...DYNAMIC_STEP_KEYS, "effectiveAcceptance", "acceptanceInput", "acceptanceRole", "sessionFiles", "thinkingOverrides"]);
const DYNAMIC_EXPAND_KEYS = new Set(["from", "item", "key", "maxItems", "onEmpty"]);
const DYNAMIC_EXPAND_FROM_KEYS = new Set(["output", "path"]);
const DYNAMIC_PARALLEL_KEYS = new Set(["agent", "task", "phase", "label", "outputSchema", "cwd", "output", "outputMode", "reads", "progress", "skill", "model", "fast", "toolBudget", "acceptance", "agentContract", "gateOn"]);
const RUNNER_DYNAMIC_PARALLEL_KEYS = new Set([
	...DYNAMIC_PARALLEL_KEYS,
	"outputName", "structured", "inheritProjectContext", "inheritSkills", "skills", "outputPath", "namespaceOutputPath", "maxSubagentDepth", "timeoutMs", "waitToolEnabled",
	"structuredOutput", "structuredOutputSchema", "tools", "extensions", "subagentOnlyExtensions", "mcpDirectTools", "capabilityCeiling", "completionGuard", "systemPrompt",
	"systemPromptMode", "thinking", "modelCandidates", "sessionFile", "effectiveAcceptance", "acceptanceInput", "acceptanceRole", "parentSessionId", "launchResolvedExtensions",
]);
const DYNAMIC_COLLECT_KEYS = new Set(["as", "outputSchema"]);

export function isSafeOutputName(name: string): boolean {
	return SAFE_OUTPUT_NAME_PATTERN.test(name);
}

export function assertJsonPointer(pointer: string, label: string): void {
	if (pointer === "") return;
	if (!pointer.startsWith("/")) {
		throw new DynamicFanoutError(`${label} must be a JSON Pointer starting with '/'.`);
	}
	for (const segment of pointer.slice(1).split("/")) {
		if (/~(?![01])/.test(segment)) {
			throw new DynamicFanoutError(`${label} contains invalid JSON Pointer escape.`);
		}
	}
}

function decodePointerSegment(segment: string): string {
	return segment.replace(/~1/g, "/").replace(/~0/g, "~");
}

export function resolveJsonPointer(value: unknown, pointer: string, label: string): unknown {
	assertJsonPointer(pointer, label);
	if (pointer === "") return value;
	let current = value;
	for (const rawSegment of pointer.slice(1).split("/")) {
		const segment = decodePointerSegment(rawSegment);
		if (Array.isArray(current)) {
			if (!/^(0|[1-9][0-9]*)$/.test(segment)) {
				throw new DynamicFanoutError(`${label} segment '${segment}' does not address an array index.`);
			}
			const index = Number(segment);
			if (index >= current.length) throw new DynamicFanoutError(`${label} does not exist.`);
			current = current[index];
			continue;
		}
		if (!current || typeof current !== "object") {
			throw new DynamicFanoutError(`${label} does not exist.`);
		}
		const record = current as Record<string, unknown>;
		if (!Object.prototype.hasOwnProperty.call(record, segment)) {
			throw new DynamicFanoutError(`${label} does not exist.`);
		}
		current = record[segment];
	}
	return current;
}

function scalarToKey(value: unknown, label: string): string {
	if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
		const key = String(value);
		if (!key.trim()) throw new DynamicFanoutError(`${label} resolved to an empty key.`);
		if (/[\u0000-\u001F\u007F]/.test(key)) throw new DynamicFanoutError(`${label} resolved to an unsafe key.`);
		if (key.length > 200) throw new DynamicFanoutError(`${label} resolved to a key longer than 200 characters.`);
		return key;
	}
	throw new DynamicFanoutError(`${label} must resolve to a string, number, or boolean.`);
}

export function normalizeItemKeyForId(key: string): string {
	const normalized = key
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, 
```