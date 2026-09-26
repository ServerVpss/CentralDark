# DECISAO - native-supervisor-channel.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\intercom\native-supervisor-channel.ts
**SHA:** 42be9a7ad856f1e8
**Timestamp:** 2026-08-28T02:24:52.399733
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- `Run: ${input.runId}`,
- const run = state.foregroundRuns?.get(request.runId);
- export function createNativeSupervisorChannel(pi: ExtensionAPI, state: SubagentState, deps: NativeSupervisorChannelDeps = {}): { start: () => void; activateTransport: () => void; dispose: () => void; 
- start: () => {

### Ouro Bruto (primeiros 5000 chars)
```
import { randomUUID } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import type { AgentToolResult } from "@earendil-works/pi-agent-core";
import type { ExtensionAPI, ExtensionContext, ToolDefinition } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import {
	SUBAGENT_CHILD_AGENT_ENV,
	SUBAGENT_CHILD_INDEX_ENV,
	SUBAGENT_ORCHESTRATOR_SESSION_ID_ENV,
	SUBAGENT_ORCHESTRATOR_TARGET_ENV,
	SUBAGENT_RUN_ID_ENV,
	SUBAGENT_SUPERVISOR_CHANNEL_DIR_ENV,
} from "../runs/shared/pi-args.ts";
import { INTERCOM_DETACH_REQUEST_EVENT, POLL_INTERVAL_MS, TEMP_ROOT_DIR, type IntercomEventBus, type SubagentState } from "../shared/types.ts";
import { writeAtomicJson } from "../shared/atomic-json.ts";
import { shouldUseNativeFsWatch } from "../shared/watch-strategy.ts";

const SUPERVISOR_CHANNEL_ROOT = path.join(TEMP_ROOT_DIR, "supervisor-channels");
const REQUESTS_DIR = "requests";
const REPLIES_DIR = "replies";
export const NATIVE_SUPERVISOR_TOOL_NAME = "subagent_supervisor";
const MAX_MESSAGE_BYTES = 64 * 1024;
const DEFAULT_ASK_TIMEOUT_MS = 10 * 60 * 1000;
const CHANNEL_POLL_MS = Math.min(POLL_INTERVAL_MS, 500);
const CHANNEL_SAFETY_POLL_MS = 5000;
const STALE_EMPTY_CHANNEL_AGE_MS = 60 * 1000;
const STALE_EMPTY_CHANNEL_CLEANUP_INTERVAL_MS = 60 * 1000;

type SupervisorReason = "need_decision" | "interview_request" | "progress_update";

interface SupervisorRequest {
	type: "subagent.supervisor.request";
	id: string;
	createdAt: number;
	expiresAt?: number;
	reason: SupervisorReason;
	message: string;
	expectsReply: boolean;
	orchestratorTarget?: string;
	orchestratorSessionId?: string;
	runId: string;
	agent: string;
	childIndex: number;
	childTarget?: string;
	interview?: unknown;
}

interface PendingSupervisorRequest extends SupervisorRequest {
	channelDir: string;
	requestFile: string;
}

interface SupervisorReply {
	type: "subagent.supervisor.reply";
	requestId: string;
	createdAt: number;
	message: string;
}

interface ContactSupervisorParams {
	reason: SupervisorReason;
	message?: string;
	interview?: unknown;
}

interface IntercomParams {
	action: "list" | "send" | "ask" | "reply" | "pending" | "status";
	to?: string;
	message?: string;
	replyTo?: string;
}

type SupervisorWatch = (filename: fs.PathLike, listener: fs.WatchListener<string>) => fs.FSWatcher;

interface NativeSupervisorChannelDeps {
	platform?: NodeJS.Platform;
	watch?: SupervisorWatch;
	timers?: Pick<typeof globalThis, "setInterval" | "clearInterval" | "setImmediate" | "clearImmediate">;
}

const ContactSupervisorParamsSchema = Type.Object({
	reason: Type.String({ enum: ["need_decision", "interview_request", "progress_update"] }),
	message: Type.Optional(Type.String()),
	interview: Type.Optional(Type.Unsafe({ type: "object", additionalProperties: true })),
}, { additionalProperties: false });

const IntercomParamsSchema = Type.Object({
	action: Type.String({ enum: ["list", "send", "ask", "reply", "pending", "status"] }),
	to: Type.Optional(Type.String()),
	message: Type.Optional(Type.String()),
	replyTo: Type.Optional(Type.String()),
}, { additionalProperties: false });

function safeSegment(value: string): string {
	return value.trim().replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

export function resolveSupervisorChannelDir(runId: string, agent: string, childIndex: number): string {
	return path.join(SUPERVISOR_CHANNEL_ROOT, `${safeSegment(runId)}-${safeSegment(agent)}-${childIndex}`);
}

export function ensureSupervisorChannelDir(channelDir: string): void {
	fs.mkdirSync(path.join(channelDir, REQUESTS_DIR), { recursive: true, mode: 0o700 });
	fs.mkdirSync(path.join(channelDir, REPLIES_DIR), { recursive: true, mode: 0o700 });
}

function requestPath(channelDir: string, requestId: string): string {
	return path.join(channelDir, REQUESTS_DIR, `${safeSegment(requestId)}.json`);
}

function replyPath(channelDir: string, requestId: string): string {
	return path.join(channelDir, REPLIES_DIR, `${safeSegment(requestId)}.json`);
}

function readTextEnv(name: string): string | undefined {
	const value = process.env[name]?.trim();
	return value ? value : undefined;
}

function readChildMetadata(): {
	channelDir: string;
	runId: string;
	agent: string;
	childIndex: number;
	orchestratorTarget?: string;
	orchestratorSessionId?: string;
	childTarget?: string;
} | undefined {
	const channelDir = readTextEnv(SUBAGENT_SUPERVISOR_CHANNEL_DIR_ENV);
	const runId = readTextEnv(SUBAGENT_RUN_ID_ENV);
	const agent = readTextEnv(SUBAGENT_CHILD_AGENT_ENV);
	const rawIndex = readTextEnv(SUBAGENT_CHILD_INDEX_ENV);
	const orchestratorSessionId = readTextEnv(SUBAGENT_ORCHESTRATOR_SESSION_ID_ENV);
	if (!channelDir || !runId || !agent || !orchestratorSessionId || rawIndex === undefined || !/^\d+$/.test(rawIndex)) return undefined;
	return {
		channelDir,
		runId,
		agent,
		childIndex: Number(rawIndex),
		orchestratorTarget: readTextEnv(SUBAGENT_ORCHESTRATOR_TARGET_ENV),
		orchestratorSessionId,

```