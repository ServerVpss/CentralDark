# OUTRO - nested-events.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\runs\shared\nested-events.ts
**SHA:** 6c7ca0e3775a2433
**Timestamp:** 2026-08-28T02:24:57.867044
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- export function resolveNestedAsyncDir(rootRunId: string, run: NestedRunSummary): string | undefined {
- run: NestedRunSummary;
- export function findNestedRunById(id: string): { rootRunId: string; run: NestedRunSummary } | undefined {
- return match ? { rootRunId: match.rootRunId, run: match.run } : undefined;

### Ouro Bruto (primeiros 5000 chars)
```
import { randomUUID } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import {
	DIRS,
	TEMP_ROOT_DIR,
	type AsyncJobState,
	type AsyncStatus,
	type LaunchResolvedChildExtensionsV1,
	type RuntimeAcknowledgedChildExtensionsV1,
	type NestedRouteInfo,
	type TurnBudgetState,
	type NestedRunSummary,
	type NestedRunState,
	type NestedStepSummary,
	type SubagentRunMode,
	type SubagentState,
} from "../../shared/types.ts";
import { isSafeNestedPathId, parseNestedPathEnv, sanitizeNestedPath, type NestedPathEntry } from "./nested-path.ts";
import {
	SUBAGENT_PARENT_CAPABILITY_TOKEN_ENV,
	SUBAGENT_PARENT_CHILD_INDEX_ENV,
	SUBAGENT_PARENT_CONTROL_INBOX_ENV,
	SUBAGENT_PARENT_DEPTH_ENV,
	SUBAGENT_PARENT_EVENT_SINK_ENV,
	SUBAGENT_PARENT_PATH_ENV,
	SUBAGENT_PARENT_ROOT_RUN_ID_ENV,
	SUBAGENT_PARENT_RUN_ID_ENV,
} from "./pi-args.ts";
import { writeAtomicJson } from "../../shared/atomic-json.ts";
import { sanitizeProcessTerminal } from "../background/process-terminal.ts";
import { THINKING_LEVELS } from "../../shared/model-info.ts";

export const NESTED_EVENTS_DIR = path.join(TEMP_ROOT_DIR, "nested-subagent-events");
const ROUTE_FILE = "route.json";
const REGISTRY_FILE = "registry.json";
const ROUTE_INDEX_DIR = ".route-index";
const MAX_EVENT_BYTES = 64 * 1024;
const MAX_STEPS = 12;
const MAX_CHILDREN = 16;
const MAX_DEPTH = 3;

type NestedStatusEventType = "subagent.nested.started" | "subagent.nested.updated" | "subagent.nested.completed";
type NestedControlResultEventType = "subagent.nested.control-result";

export type NestedRoute = NestedRouteInfo;

export interface NestedEventRecord {
	type: NestedStatusEventType;
	ts: number;
	rootRunId: string;
	parentRunId: string;
	parentStepIndex?: number;
	capabilityToken: string;
	child: NestedRunSummary;
}

export interface NestedControlResultRecord {
	type: NestedControlResultEventType;
	ts: number;
	rootRunId: string;
	capabilityToken: string;
	requestId: string;
	targetRunId: string;
	ok: boolean;
	message: string;
}

export interface NestedControlRequestRecord {
	type: "subagent.nested.control-request";
	ts: number;
	rootRunId: string;
	capabilityToken: string;
	requestId: string;
	targetRunId: string;
	action: "interrupt" | "resume";
	message?: string;
}

export interface NestedRegistry {
	rootRunId: string;
	updatedAt: number;
	children: NestedRunSummary[];
	processedEvents: string[];
}

export function isSafeNestedId(value: unknown): value is string {
	return isSafeNestedPathId(value);
}

export function assertSafeNestedId(label: string, value: string): void {
	if (!isSafeNestedId(value)) throw new Error(`${label} must be a non-empty safe id token.`);
}

function assertSafeId(label: string, value: string): void {
	assertSafeNestedId(label, value);
}

function containedPath(base: string, candidate: string): boolean {
	const resolvedBase = path.resolve(base);
	const resolvedCandidate = path.resolve(candidate);
	return resolvedCandidate === resolvedBase || resolvedCandidate.startsWith(`${resolvedBase}${path.sep}`);
}

function commonRouteRoot(route: Pick<NestedRoute, "eventSink" | "controlInbox">): string {
	return path.dirname(path.resolve(route.eventSink));
}

function routeIndexRoot(): string {
	return path.join(NESTED_EVENTS_DIR, ROUTE_INDEX_DIR, "roots");
}

function routeIndexDir(rootRunId: string): string {
	return path.join(routeIndexRoot(), encodeURIComponent(rootRunId));
}

function routeIndexPath(rootRunId: string, capabilityToken: string): string {
	return path.join(routeIndexDir(rootRunId), `${encodeURIComponent(capabilityToken)}.json`);
}

function validateRouteShape(route: NestedRoute): void {
	assertSafeId("rootRunId", route.rootRunId);
	assertSafeId("capabilityToken", route.capabilityToken);
	if (!containedPath(NESTED_EVENTS_DIR, route.eventSink)) throw new Error("Nested event sink is outside the subagent nested event root.");
	if (!containedPath(NESTED_EVENTS_DIR, route.controlInbox)) throw new Error("Nested control inbox is outside the subagent nested event root.");
	if (commonRouteRoot(route) !== path.dirname(path.resolve(route.controlInbox))) throw new Error("Nested event sink and control inbox must share one route root.");
}

export function createNestedRoute(rootRunId: string): NestedRoute {
	assertSafeId("rootRunId", rootRunId);
	const capabilityToken = randomUUID();
	const routeRoot = path.join(NESTED_EVENTS_DIR, `${rootRunId}-${capabilityToken}`);
	const eventSink = path.join(routeRoot, "events");
	const controlInbox = path.join(routeRoot, "controls");
	fs.mkdirSync(eventSink, { recursive: true, mode: 0o700 });
	fs.mkdirSync(controlInbox, { recursive: true, mode: 0o700 });
	const createdAt = Date.now();
	fs.mkdirSync(routeIndexDir(rootRunId), { recursive: true, mode: 0o700 });
	writeAtomicJson(routeIndexPath(rootRunId, capabilityToken), { rootRunId, capabilityToken, routeRoot: path.basename(routeRoot), createdAt });
	writeAtomicJson(path.join(routeRoot, ROUTE_FILE), { rootRunId, capabilityToken, createdAt });
	ret
```