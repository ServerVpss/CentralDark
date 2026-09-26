# OUTRO - fleet-transcript.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\tui\fleet-transcript.ts
**SHA:** 908c039d01b21832
**Timestamp:** 2026-08-28T02:24:59.654540
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const start = stat.size - bytesToRead;

### Ouro Bruto (primeiros 5000 chars)
```
import * as fs from "node:fs";
import * as path from "node:path";
import { getLanguageFromPath, highlightCode, type ExtensionContext } from "@earendil-works/pi-coding-agent";
import { Markdown, truncateToWidth, visibleWidth, wrapTextWithAnsi, type MarkdownTheme } from "@earendil-works/pi-tui";
import { safeTerminalText as safeDisplayText } from "../shared/display-text.ts";
import { isTrustedRecordedSessionFile } from "../shared/session-file-trust.ts";

const DEFAULT_MAX_RECORDS = 240;
const DEFAULT_MAX_BYTES = 2 * 1024 * 1024;
const MAX_MESSAGE_CHARS = 64 * 1024;
const TOOL_PREVIEW_LINES = 7;

function sanitizeJsonDisplayValue(value: unknown): { value: unknown; changed: boolean } {
	if (typeof value === "string") {
		const safe = safeDisplayText(value);
		return { value: safe, changed: safe !== value };
	}
	if (Array.isArray(value)) {
		const sanitized = value.map(sanitizeJsonDisplayValue);
		return {
			value: sanitized.map((entry) => entry.value),
			changed: sanitized.some((entry) => entry.changed),
		};
	}
	if (value && typeof value === "object") {
		let changed = false;
		const sanitized: Record<string, unknown> = Object.create(null);
		for (const [key, nested] of Object.entries(value)) {
			const safeKey = safeDisplayText(key);
			const safeValue = sanitizeJsonDisplayValue(nested);
			sanitized[safeKey] = safeValue.value;
			changed ||= safeKey !== key || safeValue.changed;
		}
		return { value: changed ? sanitized : value, changed };
	}
	return { value, changed: false };
}

function safeToolArgsPayload(payload: string): string {
	try {
		const sanitized = sanitizeJsonDisplayValue(JSON.parse(payload));
		return sanitized.changed ? JSON.stringify(sanitized.value) : safeDisplayText(payload);
	} catch {
		return safeDisplayText(payload);
	}
}

type Theme = ExtensionContext["ui"]["theme"];

export type FleetTranscriptEvent =
	| { kind: "assistant"; text: string; model?: string; timestamp?: number }
	| { kind: "user"; text: string; timestamp?: number }
	| { kind: "tool"; toolCallId?: string; name: string; args?: string; argsPayload?: string; output?: string; outputTruncated?: boolean; status: "running" | "complete" | "error"; error?: string; startedAt?: number; endedAt?: number; timestamp?: number }
	| { kind: "notice"; text: string; tone: "muted" | "warning" | "error"; timestamp?: number };

export interface FleetTranscript {
	path: string;
	events: FleetTranscriptEvent[];
	truncated: boolean;
	warning?: string;
}

interface FleetTranscriptReadOptions {
	trustedRoots: string[];
	trustedFiles?: string[];
	trustedFileRoot?: string;
	maxRecords?: number;
	maxBytes?: number;
}

interface MutableToolEvent {
	kind: "tool";
	toolCallId?: string;
	name: string;
	args?: string;
	argsPayload?: string;
	output?: string;
	outputTruncated?: boolean;
	status: "running" | "complete" | "error";
	error?: string;
	startedAt?: number;
	endedAt?: number;
	timestamp?: number;
	resultSeen?: boolean;
}

function objectValue(value: unknown): Record<string, unknown> | undefined {
	return value && typeof value === "object" && !Array.isArray(value)
		? value as Record<string, unknown>
		: undefined;
}

function stringValue(value: unknown): string | undefined {
	return typeof value === "string" && value.trim() ? value : undefined;
}

function numberValue(value: unknown): number | undefined {
	return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function pathWithin(base: string, candidate: string): boolean {
	const resolvedBase = path.resolve(base);
	const resolvedCandidate = path.resolve(candidate);
	return resolvedCandidate === resolvedBase || resolvedCandidate.startsWith(`${resolvedBase}${path.sep}`);
}

function errorMessage(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}

function isNotFoundError(error: unknown): boolean {
	return Boolean(objectValue(error)?.code === "ENOENT");
}

function validateTranscriptPath(filePath: string, trustedRoots: string[], trustedFiles: string[] = [], trustedFileRoot?: string): { resolvedPath?: string; warning?: string } {
	if (trustedRoots.length === 0 && (!trustedFileRoot || trustedFiles.length === 0)) return { warning: `Transcript preview has no trusted root: ${filePath}` };
	const resolvedPath = path.resolve(filePath);
	const recordedCandidate = trustedFileRoot
		&& pathWithin(trustedFileRoot, resolvedPath)
		&& trustedFiles.some((file) => path.resolve(file) === resolvedPath);
	if (!trustedRoots.some((root) => pathWithin(root, resolvedPath)) && !recordedCandidate) {
		return { warning: `Transcript is outside trusted roots: ${filePath}` };
	}
	let stat: fs.Stats;
	try {
		stat = fs.lstatSync(resolvedPath);
	} catch (error) {
		if (isNotFoundError(error)) return {};
		return { warning: `Transcript could not be inspected: ${errorMessage(error)}` };
	}
	if (stat.isSymbolicLink()) return { warning: `Transcript preview refused a symlink: ${filePath}` };
	if (!stat.isFile()) return { warning: `Transcript path is not a file: ${fi
```