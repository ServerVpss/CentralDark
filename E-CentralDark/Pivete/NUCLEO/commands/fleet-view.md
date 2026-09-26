# COMANDO - fleet-view.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\runs\background\fleet-view.ts
**SHA:** 42ac7e6587049294
**Timestamp:** 2026-08-28T02:24:53.344181
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- type ForegroundRun = NonNullable<SubagentState["foregroundRuns"]> extends Map<string, infer T> ? T : never;
- const start = stat.size - bytesToRead;
- `Run: ${status.runId}`,
- export function formatNestedRunTranscript(run: NestedRunSummary, options: TranscriptOptions = {}): string {
- `Nested run: ${run.id}`,
- `Run: ${runId}`,

### Ouro Bruto (primeiros 5000 chars)
```
import * as fs from "node:fs";
import * as path from "node:path";
import type { AgentToolResult } from "@earendil-works/pi-agent-core";
import { safeTerminalText } from "../../shared/display-text.ts";
import { formatDuration, formatModelThinking, formatTokens, shortenPath } from "../../shared/formatters.ts";
import { formatActivityLabel } from "../../shared/status-format.ts";
import {
	DIRS,
	type ActivityState,
	type AsyncJobStep,
	type AsyncStatus,
	type Details,
	type NestedRunSummary,
	type SubagentRunMode,
	type SubagentState,
} from "../../shared/types.ts";
import { readStatus } from "../../shared/utils.ts";
import { formatNestedRunStatusLines } from "../shared/nested-render.ts";
import { contextModeLabel, summarizeContextModes } from "../shared/context-mode.ts";
import { formatAsyncRunOutputPath, formatAsyncRunProgressLabel, listAsyncRuns, type AsyncRunSummary } from "./async-status.ts";
import { isTrustedRecordedSessionFile } from "../../shared/session-file-trust.ts";

const DEFAULT_TRANSCRIPT_LINES = 80;
const MAX_TRANSCRIPT_LINES = 500;
const TRANSCRIPT_TAIL_BYTES = 256 * 1024;

type ForegroundControl = SubagentState["foregroundControls"] extends Map<string, infer T> ? T : never;
type ForegroundRun = NonNullable<SubagentState["foregroundRuns"]> extends Map<string, infer T> ? T : never;

interface FleetViewParams {
	lines?: number;
}

interface FleetViewDeps {
	asyncDirRoot?: string;
	resultsDir?: string;
	kill?: (pid: number, signal?: NodeJS.Signals | 0) => boolean;
	now?: () => number;
	state?: SubagentState;
	childSafe?: boolean;
}

interface TranscriptOptions {
	index?: number;
	lines?: number;
	sessionRoots?: string[];
	trustedSessionFiles?: string[];
	trustedSessionFileRoot?: string;
}

interface TextTailResult {
	path: string;
	lines: string[];
	truncated: boolean;
	error?: string;
}

function transcriptLineLimit(value: number | undefined): number {
	if (value === undefined) return DEFAULT_TRANSCRIPT_LINES;
	if (!Number.isFinite(value)) return DEFAULT_TRANSCRIPT_LINES;
	return Math.max(1, Math.min(MAX_TRANSCRIPT_LINES, Math.trunc(value)));
}

function uniqueStrings(values: Array<string | undefined>): string[] {
	const seen = new Set<string>();
	const result: string[] = [];
	for (const value of values) {
		if (!value || seen.has(value)) continue;
		seen.add(value);
		result.push(value);
	}
	return result;
}

function resolveMaybeRelative(asyncDir: string, filePath: string | undefined): string | undefined {
	if (!filePath) return undefined;
	return path.resolve(asyncDir, filePath);
}

function pathWithin(base: string, candidate: string): boolean {
	const resolvedBase = path.resolve(base);
	const resolvedCandidate = path.resolve(candidate);
	return resolvedCandidate === resolvedBase || resolvedCandidate.startsWith(`${resolvedBase}${path.sep}`);
}

function getErrorMessage(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}

function isNotFoundError(error: unknown): boolean {
	return typeof error === "object"
		&& error !== null
		&& "code" in error
		&& (error as NodeJS.ErrnoException).code === "ENOENT";
}

function readTextTail(filePath: string, maxLines: number): TextTailResult {
	let stat: fs.Stats;
	try {
		stat = fs.statSync(filePath);
	} catch (error) {
		if (isNotFoundError(error)) return { path: filePath, lines: [], truncated: false };
		return { path: filePath, lines: [], truncated: false, error: getErrorMessage(error) };
	}
	if (stat.size === 0) return { path: filePath, lines: [], truncated: false };

	let fd: number | undefined;
	try {
		const bytesToRead = Math.min(stat.size, TRANSCRIPT_TAIL_BYTES);
		const start = stat.size - bytesToRead;
		const buffer = Buffer.alloc(bytesToRead);
		fd = fs.openSync(filePath, "r");
		const bytesRead = fs.readSync(fd, buffer, 0, bytesToRead, start);
		const content = buffer.subarray(0, bytesRead).toString("utf-8");
		let lines = content.split(/\r?\n/);
		if (start > 0 && lines.length > 0) lines = lines.slice(1);
		if (lines.at(-1) === "") lines = lines.slice(0, -1);
		return { path: filePath, lines: lines.slice(-maxLines), truncated: start > 0 || lines.length > maxLines };
	} catch (error) {
		return { path: filePath, lines: [], truncated: false, error: getErrorMessage(error) };
	} finally {
		if (fd !== undefined) fs.closeSync(fd);
	}
}

function readContainedTextTail(filePath: string, maxLines: number, trustedRoots: string[], label: string, trustedFiles: string[] = [], trustedFileRoot?: string): TextTailResult {
	if (trustedRoots.length === 0 && (!trustedFileRoot || trustedFiles.length === 0)) return { path: filePath, lines: [], truncated: false, error: `Refusing to read ${label} transcript path without a trusted root: ${filePath}` };
	const resolvedPath = path.resolve(filePath);
	const recordedCandidate = trustedFileRoot
		&& pathWithin(trustedFileRoot, resolvedPath)
		&& trustedFiles.some((file) => path.resolve(file) === resolvedPath);
	if (!trustedRoots.some((root) => pathWithin(root, resolvedPath)) && !
```