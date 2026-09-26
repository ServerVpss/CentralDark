# OUTRO - rpc.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\extension\rpc.ts
**SHA:** 9e25af0a6c8f2657
**Timestamp:** 2026-08-28T02:24:52.098079
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- execute: (

### Ouro Bruto (primeiros 5000 chars)
```
import * as path from "node:path";
import type { AgentToolResult } from "@earendil-works/pi-agent-core";
import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { Compile } from "typebox/compile";
import { resolveAsyncRunLocation } from "../runs/background/async-resume.ts";
import { deliverStopRequest } from "../runs/background/control-channel.ts";
import { reconcileAsyncRun } from "../runs/background/stale-run-reconciler.ts";
import type { SubagentParamsLike } from "../runs/foreground/subagent-executor.ts";
import { resolveCurrentSessionId } from "../shared/session-identity.ts";
import {
	type AsyncJobStep,
	type Details,
	type SubagentState,
	type TokenUsage,
	DIRS,
	SUBAGENT_ASYNC_COMPLETE_EVENT,
	SUBAGENT_CHILD_STATUS_EVENT,
	SUBAGENT_PROCESS_TERMINAL_EVENT,
	SUBAGENT_LIFECYCLE_ARTIFACT_VERSION,
	type SubagentChildStatusEvent,
} from "../shared/types.ts";
import { sanitizeDisplayText, truncateDisplayText } from "../shared/display-text.ts";
import { readStatus } from "../shared/utils.ts";
import { SubagentParams } from "./schemas.ts";
import { normalizePublicSubagentExecution } from "./public-execution.ts";
import { ASYNC_STATUS_SNAPSHOT_KIND, ASYNC_STATUS_SNAPSHOT_VERSION, buildAsyncStatusSnapshotForState } from "../runs/background/async-status-snapshot.ts";
import { isStoppableAsyncStatusStep, resolveAsyncStatusChild, type ResolvedAsyncStatusChild } from "../runs/shared/child-identity.ts";

export const SUBAGENT_RPC_PROTOCOL_VERSION = 1;
export const SUBAGENT_RPC_REQUEST_EVENT = "subagents:rpc:v1:request";
export const SUBAGENT_RPC_READY_EVENT = "subagents:rpc:v1:ready";
export const SUBAGENT_RPC_REPLY_EVENT_PREFIX = "subagents:rpc:v1:reply:";

export const SUBAGENT_RPC_METHODS = ["ping", "status", "manage", "spawn", "steer", "interrupt", "stop", "resume"] as const;
export type SubagentRpcMethod = typeof SUBAGENT_RPC_METHODS[number];

export interface SubagentRpcRequestEnvelope {
	version: typeof SUBAGENT_RPC_PROTOCOL_VERSION;
	requestId: string;
	method: SubagentRpcMethod;
	params?: unknown;
	source?: {
		extension?: string;
		[key: string]: unknown;
	};
}

export type SubagentRpcReplyEnvelope<T = unknown> = {
	version: typeof SUBAGENT_RPC_PROTOCOL_VERSION;
	requestId: string;
	method?: SubagentRpcMethod;
	success: true;
	data: T;
} | {
	version: typeof SUBAGENT_RPC_PROTOCOL_VERSION;
	requestId: string;
	method?: SubagentRpcMethod;
	success: false;
	error: {
		code: SubagentRpcErrorCode;
		message: string;
	};
};

export const SUBAGENT_RPC_MANAGEMENT_ACTIONS = [
	"schedule.list",
	"schedule.show",
	"schedule.history",
	"schedule.pause",
	"schedule.resume",
	"schedule.run",
	"schedule.delete",
] as const;

type SubagentRpcManagementAction = typeof SUBAGENT_RPC_MANAGEMENT_ACTIONS[number];

type SubagentRpcErrorCode =
	| "invalid_request"
	| "invalid_params"
	| "unsupported_version"
	| "unsupported_method"
	| "no_active_session"
	| "execution_failed"
	| "not_found"
	| "invalid_state";

interface EventBus {
	on(event: string, handler: (data: unknown) => void): (() => void) | void;
	emit(event: string, data: unknown): void;
}

export interface SubagentRpcFleetEntry {
	/** Opaque key for client-side reconciliation; never a run or async identifier. */
	key: string;
	/** Resolved child agent/role name. */
	agent: string;
	role?: string;
	model?: string;
	effort?: string;
	startedAt: number;
	tokens: TokenUsage;
	goal?: string;
}

export interface SubagentRpcFleetStatus {
	version: 1;
	entries: SubagentRpcFleetEntry[];
	/** Total active children before the bounded entries window. */
	totalActive: number;
	topLevelAsyncCapacity: { used: number; limit: number };
	omitted: number;
}

const MAX_FLEET_ENTRIES = 16;
const MAX_FLEET_CANDIDATES = 256;
const MAX_AGENT_LENGTH = 96;
const MAX_GOAL_LENGTH = 512;
const MAX_METADATA_LENGTH = 128;

function displayText(value: unknown, maxLength: number): string | undefined {
	if (typeof value !== "string") return undefined;
	const normalized = sanitizeDisplayText(value.slice(0, 4_096));
	return normalized ? truncateDisplayText(normalized, maxLength) : undefined;
}

function publicTokens(value: unknown): TokenUsage {
	const record = isRecord(value) ? value : {};
	const count = (field: "input" | "output" | "total") => {
		const raw = record[field];
		return typeof raw === "number" && Number.isFinite(raw) && raw >= 0
			? Math.min(Number.MAX_SAFE_INTEGER, Math.floor(raw))
			: 0;
	};
	const input = count("input");
	const output = count("output");
	const sum = Math.min(Number.MAX_SAFE_INTEGER, input + output);
	const optionalCount = (field: "window" | "windowPeak") => {
		const raw = record[field];
		return typeof raw === "number" && Number.isFinite(raw) && raw >= 0
			? Math.min(Number.MAX_SAFE_INTEGER, Math.floor(raw))
			: undefined;
	};
	const window = optionalCount("window");
	const windowPeak = optionalCount("windowPeak");
	return {
		input,
		output,
		total: Math.max(sum, count("total")),
		...(window !== undefined ? { window } : {}),
		...(window
```