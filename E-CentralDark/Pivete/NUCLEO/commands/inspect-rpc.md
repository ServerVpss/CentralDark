# COMANDO - inspect-rpc.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\runs\background\inspect-rpc.ts
**SHA:** 6562fff97153527e
**Timestamp:** 2026-08-28T02:24:53.332710
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- const REQUEST_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

### Ouro Bruto (primeiros 5000 chars)
```
import * as fs from "node:fs";
import { sanitizeDisplayText, truncateDisplayText } from "../../shared/display-text.ts";
import { decodeUtf8Tail } from "../../shared/utf8.ts";
import { DIRS, type AsyncStatus, type NestedRunSummary, type SubagentState } from "../../shared/types.ts";
import { readStatus } from "../../shared/utils.ts";
import { readSessionMessagesTail, type SessionTranscriptMessage } from "./fleet-view.ts";
import { completionReplayPath, readCompletionArchive, readCompletionReplay } from "./completion-replay.ts";
import { resultPayloadPathForSessionRun } from "./result-files.ts";
import { resolveSubagentRunId } from "./run-id-resolver.ts";
import { reconcileAsyncRun, reconcileNestedAsyncDescendants } from "./stale-run-reconciler.ts";

/** On-demand inspection of current-session async children. Re-reads canonical artifacts after the same reconciliation as status; nothing is persisted or broadcast. */

export const INSPECT_REPLY_KIND = "pi-subagents.inspect-reply";
export const INSPECT_REPLY_VERSION = 1;
export const INSPECT_WIDGET_KEY = "subagent-inspect";
export const INSPECT_WIDGET_PREFIX = "PI_SUBAGENT_INSPECT_JSON:";

export type InspectErrorCode =
	| "invalid_request"
	| "not_found"
	| "foreign_session"
	| "stale"
	| "no_active_session"
	| "internal";

export interface InspectRequest {
	requestId: string;
	asyncId: string;
	childId?: string;
	lines?: number;
}

export interface InspectReplyMessage {
	role: string;
	kind: "text" | "toolCall" | "toolResult";
	text: string;
	name?: string;
	isError?: boolean;
}

export interface InspectReply {
	kind: typeof INSPECT_REPLY_KIND;
	version: typeof INSPECT_REPLY_VERSION;
	requestId: string;
	/** Canonical run id of the inspected node. Absent on error replies that
	 *  could not resolve a run. */
	asyncId?: string;
	childId?: string;
	status?: AsyncStatus["state"];
	label?: string;
	task?: string;
	messages?: InspectReplyMessage[];
	finalOutput?: string;
	truncated?: { task: boolean; messages: number; finalOutput: boolean };
	error?: { code: InspectErrorCode; message: string };
}

const REQUEST_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;
const MAX_ID_LENGTH = 256;
const MAX_LABEL_LENGTH = 160;
const MAX_TASK_LENGTH = 2_000;
const MAX_FINAL_OUTPUT_LENGTH = 8_000;
const MAX_MESSAGE_TEXT_LENGTH = 1_000;
const DEFAULT_MESSAGE_LINES = 100;
const MAX_MESSAGE_LINES = 200;
const FAILED_OUTPUT_ARTIFACT_PREFIX = "Subagent run failed before producing output.\n\nError:\n";
export const MAX_SERIALIZED_BYTES = 64 * 1024;

export interface InspectDeps {
	state?: SubagentState;
	asyncDirRoot?: string;
	resultsDir?: string;
	kill?: (pid: number, signal?: NodeJS.Signals | 0) => boolean;
	now?: () => number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function publicText(value: unknown, maxLength: number): string | undefined {
	if (typeof value !== "string") return undefined;
	const normalized = sanitizeDisplayText(value.slice(0, maxLength * 4));
	return normalized ? truncateDisplayText(normalized, maxLength) : undefined;
}

/** Bound long-form content without flattening it: task/finalOutput/message text
 *  must keep newlines readable. Only the two unicode line separators are
 *  normalized, since JSON.stringify does not escape them and hosts split the
 *  widget payload on line boundaries. */
function boundContent(value: string, maxLength: number): string {
	const normalized = value.replace(/[\u2028\u2029]/g, "\n");
	return truncateDisplayText(normalized, maxLength);
}

function errorReply(request: Partial<InspectRequest>, code: InspectErrorCode, message: string): InspectReply {
	return {
		kind: INSPECT_REPLY_KIND,
		version: INSPECT_REPLY_VERSION,
		requestId: typeof request.requestId === "string" && REQUEST_ID_PATTERN.test(request.requestId) ? request.requestId : "invalid",
		...(typeof request.asyncId === "string" ? { asyncId: truncateDisplayText(request.asyncId, MAX_ID_LENGTH) } : {}),
		...(typeof request.childId === "string" ? { childId: truncateDisplayText(request.childId, MAX_ID_LENGTH) } : {}),
		error: { code, message },
	};
}

export function parseInspectRequest(args: string): { request?: InspectRequest; error?: string } {
	const tokens = args.trim().split(/\s+/).filter(Boolean);
	const positional: string[] = [];
	let lines: number | undefined;
	for (let index = 0; index < tokens.length; index++) {
		const token = tokens[index]!;
		if (token === "--lines") {
			const value = tokens[++index];
			const parsed = value === undefined ? NaN : Number.parseInt(value, 10);
			if (!Number.isFinite(parsed)) return { error: "--lines requires an integer value." };
			lines = parsed;
			continue;
		}
		if (token.startsWith("--")) return { error: `Unknown flag: ${token}. Supported: --lines N.` };
		positional.push(token);
	}
	const [requestId, asyncId, childId, ...extra] = positional;
	if (!requestId || !REQUEST_ID_PATTERN.test(requestId)) {
		return { error: "reques
```