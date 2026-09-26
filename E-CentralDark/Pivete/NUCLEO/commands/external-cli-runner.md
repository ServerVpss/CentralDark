# COMANDO - external-cli-runner.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\runs\shared\external-cli-runner.ts
**SHA:** 51f41fc6ee753ca3
**Timestamp:** 2026-08-28T02:24:57.682527
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- prompt: string;
- let start = 0;
- start = index + 1;

### Ouro Bruto (primeiros 5000 chars)
```
import assert from "node:assert/strict";
import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { finished } from "node:stream/promises";
import type { ExternalProcessStatus } from "../../shared/types.ts";
import { createOwnedProcessTreeController, type OwnedProcessTreeController } from "../background/owned-process-tree.ts";
import { omitExtensionBindingsEnv } from "./extension-bindings.ts";
import {
	invalidateExternalCliPreflight,
	preflightExternalCli,
	type ExternalCliPreflightResult,
	type ExternalCliPreflightSpec,
} from "./external-cli-preflight.ts";

const MAX_OUTPUT_TAIL_BYTES = 64 * 1024;
const MAX_ERROR_TAIL_BYTES = 64 * 1024;
const MAX_RAW_LOG_BYTES = 8 * 1024 * 1024;
const MAX_PARSER_LINE_BYTES = 256 * 1024;
const MAX_PARSER_STREAM_BYTES = 32 * 1024 * 1024;
const MAX_PARSER_OUTPUT_BYTES = 1024 * 1024;
const MAX_OVERSIZED_LINE_PREFIX_BYTES = 512;
const MAX_SKIPPABLE_LINE_BYTES = 1024 * 1024;
const PARSER_PROGRESS_INTERVAL_MS = 100;

export function buildExternalCliPrompt(systemInstructions: string, task: string): string {
	return `<System instructions>\n${systemInstructions.trim()}\n\n<Task>\n${task}`;
}

export interface ExternalCliParserProgress {
	phase: string;
	eventCount: number;
	message?: string;
}

export interface ExternalCliParserTerminal {
	state: "completed" | "failed";
	output?: string;
	error?: string;
}

export interface ExternalCliParser {
	parseLine(line: string): ExternalCliParserProgress | undefined;
	/** Inspect only a bounded prefix when a non-terminal event exceeds the normal line cap. */
	skipOversizedLine?(prefix: string, byteLength: number): ExternalCliParserProgress | undefined;
	finish(): ExternalCliParserTerminal | undefined;
}

export function parseExternalCliJsonlEvent(line: string, label: string, maxTypeLength: number): Record<string, unknown> {
	let value: unknown;
	try {
		value = JSON.parse(line) as unknown;
	} catch (error) {
		throw new Error(`${label} emitted malformed JSONL: ${error instanceof Error ? error.message : String(error)}`);
	}
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} emitted a JSONL event that is not an object.`);
	const event = value as Record<string, unknown>;
	if (typeof event.type !== "string" || !event.type || event.type.length > maxTypeLength) throw new Error(`${label} emitted a JSONL event with an invalid type.`);
	return event;
}

export interface ExternalCliRunResult {
	output: string;
	exitCode: number | null;
	error?: string;
	timedOut?: boolean;
	stopped?: boolean;
	processSignal?: string | null;
	externalProcess: ExternalProcessStatus;
	parserTerminal?: ExternalCliParserTerminal;
	preflight?: ExternalCliPreflightResult;
}

interface StreamLimits {
	stdoutLogBytes?: number;
	stderrLogBytes?: number;
	parserLineBytes?: number;
	parserStreamBytes?: number;
	parserOutputBytes?: number;
}

function narrowLimit(value: number | undefined, ceiling: number, label: string): number {
	if (value === undefined) return ceiling;
	assert(Number.isInteger(value) && value > 0 && value <= ceiling, `${label} may only narrow the code-owned ${ceiling}-byte limit.`);
	return value;
}

function externalEnvironment(allowlist: readonly string[] | undefined, values: Readonly<Record<string, string>> | undefined): NodeJS.ProcessEnv {
	if (!allowlist) return omitExtensionBindingsEnv(process.env);
	const allowed = new Set(allowlist);
	const env: NodeJS.ProcessEnv = {};
	for (const key of allowed) {
		if (!key || key.includes("=") || key.includes("\0")) throw new Error(`Invalid external CLI environment key: ${JSON.stringify(key)}.`);
		if (process.env[key] !== undefined) env[key] = process.env[key];
	}
	for (const [key, value] of Object.entries(values ?? {})) {
		if (!allowed.has(key)) throw new Error(`External CLI environment value '${key}' is not in the adapter allowlist.`);
		env[key] = value;
	}
	return omitExtensionBindingsEnv(env);
}

function createByteTail(maxBytes: number): { push(chunk: Buffer): void; text(): string } {
	const chunks: Buffer[] = [];
	let bytes = 0;
	return {
		push(chunk) {
			chunks.push(chunk);
			bytes += chunk.length;
			while (bytes > maxBytes && chunks.length > 0) {
				const first = chunks[0]!;
				const excess = bytes - maxBytes;
				if (first.length <= excess) {
					chunks.shift();
					bytes -= first.length;
				} else {
					chunks[0] = first.subarray(excess);
					bytes -= excess;
				}
			}
		},
		text: () => Buffer.concat(chunks, bytes).toString("utf-8"),
	};
}

function writeBoundedLog(source: NodeJS.ReadableStream, stream: fs.WriteStream, chunk: Buffer, state: { bytes: number; total: number }, limit: number): void {
	state.total += chunk.length;
	const remaining = limit - state.bytes;
	if (remaining <= 0) return;
	const bytes = chunk.length > remaining ? chunk.subarray(0, remaining) : chunk;
	state.bytes += bytes.length;
	if (!stream.write(bytes)) {
		source.pause();
		strea
```