# COMANDO - child-transcript.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\shared\child-transcript.ts
**SHA:** a8d5505d8c6719f6
**Timestamp:** 2026-08-28T02:24:58.685740
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- writeInitialUserMessage(prompt: string): void;
- writeInitialUserMessage(prompt: string) {

### Ouro Bruto (primeiros 5000 chars)
```
import * as fs from "node:fs";
import * as path from "node:path";
import type { Message } from "@earendil-works/pi-ai";
import { extractTextFromContent, extractToolArgsPreview } from "./utils.ts";

const MAX_TOOL_PAYLOAD_BYTES = 32 * 1024;
const TOOL_PAYLOAD_TRUNCATION_MARKER = "\n\n… payload truncated";

function boundedPayload(value: unknown, maxBytes = MAX_TOOL_PAYLOAD_BYTES): string | undefined {
	let text: string;
	if (typeof value === "string") text = value;
	else {
		try {
			const serialized = JSON.stringify(value, null, 2);
			if (serialized === undefined) return undefined;
			text = serialized;
		} catch {
			return undefined;
		}
	}
	if (!text.trim()) return undefined;
	const payload = Buffer.from(text, "utf-8");
	if (payload.length <= maxBytes) return text;
	const markerBytes = Buffer.byteLength(TOOL_PAYLOAD_TRUNCATION_MARKER, "utf-8");
	let end = Math.max(0, maxBytes - markerBytes);
	while (end > 0 && (payload[end]! & 0xc0) === 0x80) end--;
	return `${payload.subarray(0, end).toString("utf-8")}${TOOL_PAYLOAD_TRUNCATION_MARKER}`;
}

export const CHILD_TRANSCRIPT_ARTIFACT_VERSION = 1;
const DEFAULT_MAX_CHILD_TRANSCRIPT_BYTES = 50 * 1024 * 1024;

type ChildTranscriptSource = "foreground" | "async";
type ChildTranscriptRecordType = "message" | "tool_start" | "tool_end" | "stdout" | "stderr" | "truncated";

type ChildTranscriptMessage = Message & {
	model?: string;
	errorMessage?: string;
	stopReason?: string;
	usage?: unknown;
};

interface ChildTranscriptEvent {
	type?: string;
	message?: ChildTranscriptMessage;
	toolCallId?: string;
	toolName?: string;
	args?: unknown;
	isError?: boolean;
}

interface ChildTranscriptWriterInput {
	transcriptPath: string;
	source: ChildTranscriptSource;
	runId: string;
	agent: string;
	childIndex?: number;
	cwd: string;
	maxBytes?: number;
}

export interface ChildTranscriptWriter {
	path: string;
	writeInitialUserMessage(prompt: string): void;
	writeChildEvent(event: ChildTranscriptEvent): void;
	writeStdoutLine(line: string): void;
	writeStderrLine(line: string): void;
	writeStderrText(text: string): void;
	getError(): string | undefined;
}

function errorMessage(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}

function finiteNumber(value: unknown): number | undefined {
	return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function normalizeUsage(value: unknown): { input: number; output: number; cacheRead: number; cacheWrite: number; cost: number } | undefined {
	if (!value || typeof value !== "object") return undefined;
	const raw = value as Record<string, unknown>;
	const rawCost = raw.cost;
	const cost = rawCost && typeof rawCost === "object"
		? finiteNumber((rawCost as { total?: unknown }).total) ?? 0
		: finiteNumber(rawCost) ?? 0;
	return {
		input: finiteNumber(raw.input) ?? finiteNumber(raw.inputTokens) ?? 0,
		output: finiteNumber(raw.output) ?? finiteNumber(raw.outputTokens) ?? 0,
		cacheRead: finiteNumber(raw.cacheRead) ?? 0,
		cacheWrite: finiteNumber(raw.cacheWrite) ?? 0,
		cost,
	};
}

function eventArgs(event: ChildTranscriptEvent): Record<string, unknown> {
	return event.args && typeof event.args === "object" && !Array.isArray(event.args)
		? event.args as Record<string, unknown>
		: {};
}

export function createChildTranscriptWriter(input: ChildTranscriptWriterInput): ChildTranscriptWriter {
	let bytesWritten = 0;
	let writeError: string | undefined;
	let truncated = false;
	const maxBytes = input.maxBytes ?? DEFAULT_MAX_CHILD_TRANSCRIPT_BYTES;

	const baseRecord = (recordType: ChildTranscriptRecordType) => {
		const ts = Date.now();
		return {
			version: CHILD_TRANSCRIPT_ARTIFACT_VERSION,
			recordType,
			source: input.source,
			runId: input.runId,
			agent: input.agent,
			...(input.childIndex !== undefined ? { childIndex: input.childIndex } : {}),
			cwd: input.cwd,
			ts,
			timestamp: new Date(ts).toISOString(),
		};
	};

	const writeTruncatedMarker = () => {
		truncated = true;
		const marker = `${JSON.stringify({
			...baseRecord("truncated"),
			maxBytes,
			message: `Child transcript exceeded ${maxBytes} bytes; further records were omitted.`,
		})}\n`;
		const markerBytes = Buffer.byteLength(marker, "utf-8");
		if (bytesWritten + markerBytes > maxBytes) return false;
		try {
			fs.appendFileSync(input.transcriptPath, marker, "utf-8");
			bytesWritten += markerBytes;
			return true;
		} catch (error) {
			writeError = `Failed to write child transcript '${input.transcriptPath}': ${errorMessage(error)}`;
			return false;
		}
	};

	const writeRecord = (record: Record<string, unknown>) => {
		if (writeError || truncated) return;
		const line = `${JSON.stringify(record)}\n`;
		const bytes = Buffer.byteLength(line, "utf-8");
		if (bytesWritten + bytes > maxBytes) {
			writeTruncatedMarker();
			return;
		}
		const markerProbe = `${JSON.stringify({
			...baseRecord("truncated"),
			maxBytes,
			message: `Child transcript exceeded ${maxBytes} bytes; further records wer
```