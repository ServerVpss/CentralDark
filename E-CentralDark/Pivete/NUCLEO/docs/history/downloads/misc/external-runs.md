# OUTRO - external-runs.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\api\external-runs.ts
**SHA:** e40a7e06dcb94114
**Timestamp:** 2026-08-28T02:24:51.540243
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const run = inputObject(value, "External run", RUN_FIELDS);
- function clone(run: ExternalRun): ExternalRun {
- const run = validateRun(input);
- const run = validateRun(value);

### Ouro Bruto (primeiros 5000 chars)
```
import { sanitizeDisplayText, truncateDisplayText } from "../shared/display-text.ts";

export const EXTERNAL_RUN_REGISTRY_VERSION = 2;
export const EXTERNAL_RUN_REGISTRY_KEY = "pi-subagents.external-runs.v2";

export const EXTERNAL_RUN_LIMITS = {
	maxCachedRuns: 100,
	maxSnapshotRuns: 20,
	maxIdentityLength: 160,
	/**
	 * A Pi session id is the session file path, which routinely exceeds a short
	 * identity budget in nested worktrees, so it is bounded like the other paths.
	 */
	maxSessionIdLength: 4_096,
	maxTextLength: 160,
	maxPreviewLength: 4_096,
	maxPathLength: 4_096,
	maxSerializedBytes: 32 * 1_024,
} as const;

export type ExternalRunState = "queued" | "running" | "completed" | "failed" | "stopped";

/** A display-only record for work owned by another extension or runtime. */
export interface ExternalRun {
	id: string;
	sessionId: string;
	source: string;
	label: string;
	state: ExternalRunState;
	startedAt: number;
	updatedAt?: number;
	endedAt?: number;
	currentAction?: string;
	preview?: string;
	reportPath?: string;
	transcriptPath?: string;
}

export type ExternalRunUpdate = Partial<Omit<ExternalRun, "id" | "sessionId" | "source">>;

export interface ExternalRunSnapshotOptions {
	onMalformedRecord?: (message: string) => void;
	ignoreMalformed?: boolean;
}

interface ExternalRunRegistry {
	version: typeof EXTERNAL_RUN_REGISTRY_VERSION;
	runs: Map<string, ExternalRun>;
}

const RUN_FIELDS = new Set([
	"id",
	"sessionId",
	"source",
	"label",
	"state",
	"startedAt",
	"updatedAt",
	"endedAt",
	"currentAction",
	"preview",
	"reportPath",
	"transcriptPath",
]);
const UPDATE_FIELDS = new Set([...RUN_FIELDS].filter((field) => field !== "id" && field !== "sessionId" && field !== "source"));

function registry(): ExternalRunRegistry {
	const key = Symbol.for(EXTERNAL_RUN_REGISTRY_KEY);
	const target = globalThis as Record<PropertyKey, unknown>;
	const existing = target[key];
	if (existing === undefined) {
		const created: ExternalRunRegistry = { version: EXTERNAL_RUN_REGISTRY_VERSION, runs: new Map() };
		target[key] = created;
		return created;
	}
	if (!existing || typeof existing !== "object" || Array.isArray(existing)) throw new Error(`Malformed external-run registry at Symbol.for("${EXTERNAL_RUN_REGISTRY_KEY}").`);
	const candidate = existing as Partial<ExternalRunRegistry>;
	if (candidate.version !== EXTERNAL_RUN_REGISTRY_VERSION || !(candidate.runs instanceof Map)) throw new Error(`Unsupported external-run registry at Symbol.for("${EXTERNAL_RUN_REGISTRY_KEY}").`);
	return candidate as ExternalRunRegistry;
}

function inputObject(value: unknown, field: string, allowed: Set<string>): Record<string, unknown> {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${field} must be an object.`);
	const input = value as Record<string, unknown>;
	const unknown = Object.keys(input).filter((key) => !allowed.has(key));
	if (unknown.length) throw new Error(`${field} has unknown fields: ${unknown.join(", ")}.`);
	return input;
}

function identity(value: unknown, field: string, maxLength: number = EXTERNAL_RUN_LIMITS.maxIdentityLength): string {
	if (typeof value !== "string" || value.length === 0 || value.trim() !== value || value.includes("\0")) throw new Error(`${field} must be a non-empty trimmed string without NUL characters.`);
	if (value.length > maxLength) throw new Error(`${field} must be at most ${maxLength} characters.`);
	const safe = sanitizeDisplayText(value);
	if (!safe || safe !== value) throw new Error(`${field} must contain only display-safe text.`);
	return value;
}

function displayText(value: unknown, field: string, maxLength: number): string | undefined;
function displayText(value: unknown, field: string, maxLength: number, required: true): string;
function displayText(value: unknown, field: string, maxLength: number, required = false): string | undefined {
	if (value === undefined && !required) return undefined;
	if (typeof value !== "string" || value.length === 0) throw new Error(`${field} must be a non-empty string.`);
	const safe = sanitizeDisplayText(value.slice(0, Math.max(maxLength * 4, maxLength)));
	if (!safe) throw new Error(`${field} must contain displayable text.`);
	return truncateDisplayText(safe, maxLength);
}

function timestamp(value: unknown, field: string): number | undefined;
function timestamp(value: unknown, field: string, required: true): number;
function timestamp(value: unknown, field: string, required = false): number | undefined {
	if (value === undefined && !required) return undefined;
	if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0 || value > 8_640_000_000_000_000) throw new Error(`${field} must be a non-negative safe timestamp.`);
	return value;
}

function state(value: unknown, field: string): ExternalRunState {
	if (value === "queued" || value === "running" || value === "completed" || value === "failed" || value === "stopped") return value;
	throw new Error(`${field} is invalid.`);
}

function validat
```