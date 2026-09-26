# COMANDO - prompt-template-bridge.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\slash\prompt-template-bridge.ts
**SHA:** 35e8706e50b814e2
**Timestamp:** 2026-08-28T02:24:59.436256
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- execute: (

### Ouro Bruto (primeiros 5000 chars)
```
import {
	SUBAGENT_DELEGATION_CANCEL_EVENT,
	SUBAGENT_DELEGATION_REQUEST_EVENT,
	SUBAGENT_DELEGATION_RESPONSE_EVENT,
	SUBAGENT_DELEGATION_STARTED_EVENT,
	SUBAGENT_DELEGATION_UPDATE_EVENT,
	type SubagentDelegationInvalidResponse,
	type SubagentDelegationRequest,
	type SubagentDelegationResponse,
} from "../api/delegation.ts";
import { parseSubagentDelegationRequest } from "./delegation-request.ts";
import {
	parsePromptTemplateRequest,
	toDelegationUpdate,
	toPromptTemplateResponse,
	toSubagentDelegationExecutionParams,
	toSubagentDelegationResponse,
	toSubagentDelegationUpdate,
	type DelegatedSubagentExecutionParams,
	type PromptTemplateBridgeResult,
	type PromptTemplateDelegationRequest,
	type PromptTemplateDelegationResponse,
} from "./delegation-adapters.ts";

export const PROMPT_TEMPLATE_SUBAGENT_REQUEST_EVENT = SUBAGENT_DELEGATION_REQUEST_EVENT;
export const PROMPT_TEMPLATE_SUBAGENT_STARTED_EVENT = SUBAGENT_DELEGATION_STARTED_EVENT;
export const PROMPT_TEMPLATE_SUBAGENT_RESPONSE_EVENT = SUBAGENT_DELEGATION_RESPONSE_EVENT;
export const PROMPT_TEMPLATE_SUBAGENT_UPDATE_EVENT = SUBAGENT_DELEGATION_UPDATE_EVENT;
export const PROMPT_TEMPLATE_SUBAGENT_CANCEL_EVENT = SUBAGENT_DELEGATION_CANCEL_EVENT;

export interface PromptTemplateBridgeEvents {
	on(event: string, handler: (data: unknown) => void): (() => void) | void;
	emit(event: string, data: unknown): void;
}

interface PromptTemplateBridgeOptions<Ctx extends { cwd?: string }> {
	events: PromptTemplateBridgeEvents;
	getContext: () => Ctx | null;
	execute: (
		requestId: string,
		params: DelegatedSubagentExecutionParams,
		signal: AbortSignal,
		ctx: Ctx,
		onUpdate: (result: PromptTemplateBridgeResult) => void,
	) => Promise<PromptTemplateBridgeResult>;
	/** Concurrent-safe executor for structured delegation requests. */
	executeStructured?: (
		requestId: string,
		params: DelegatedSubagentExecutionParams,
		signal: AbortSignal,
		ctx: Ctx,
		onUpdate: (result: PromptTemplateBridgeResult) => void,
	) => Promise<PromptTemplateBridgeResult>;
}

function hasStructuredDelegationMarker(data: unknown): boolean {
	if (!data || typeof data !== "object" || Array.isArray(data)) return false;
	const value = data as Record<string, unknown>;
	return Object.hasOwn(value, "ownerRunId")
		|| Object.hasOwn(value, "nodeId")
		|| Object.hasOwn(value, "result")
		|| Object.hasOwn(value, "version");
}

function validId(value: unknown): value is string {
	return typeof value === "string" && value.trim().length > 0 && value.length <= 256 && !/[\r\n]/.test(value);
}

export function registerPromptTemplateDelegationBridge<Ctx extends { cwd?: string }>(
	options: PromptTemplateBridgeOptions<Ctx>,
): {
	cancelAll: () => void;
	dispose: () => void;
} {
	const legacyControllers = new Map<string, AbortController>();
	const pendingLegacyCancels = new Map<string, true>();
	const attemptControllers = new Map<string, AbortController>();
	const pendingAttemptCancels = new Map<string, true>();
	const activeOwnedNodes = new Map<string, { attemptKey: string; controller: AbortController }>();
	const settledAttempts = new Map<string, true>();
	const subscriptions: Array<() => void> = [];
	let disposed = false;
	let identitySaturated = false;

	const subscribe = (event: string, handler: (data: unknown) => void): void => {
		const unsubscribe = options.events.on(event, handler);
		if (typeof unsubscribe === "function") subscriptions.push(unsubscribe);
	};
	const ownsLegacyRequest = (requestId: string, controller: AbortController): boolean =>
		!disposed && legacyControllers.get(requestId) === controller;
	const ownsAttempt = (attemptKey: string, controller: AbortController): boolean =>
		!disposed && attemptControllers.get(attemptKey) === controller;
	const boundedRemember = (map: Map<string, true>, key: string): void => {
		map.delete(key);
		map.set(key, true);
		while (map.size > 256) {
			const oldest = map.keys().next().value;
			if (typeof oldest !== "string") break;
			map.delete(oldest);
		}
	};
	const rememberIdentity = (map: Map<string, true>, key: string): void => {
		if (map.has(key) || identitySaturated) return;
		if (map.size >= 8_192) {
			identitySaturated = true;
			return;
		}
		map.set(key, true);
		if (map.size === 8_192) {
			// Exact cancellation and terminal-attempt facts are security state, not an
			// LRU cache. Once full, fail closed rather than evicting identity facts.
			identitySaturated = true;
		}
	};
	const nodeKey = (ownerRunId: string, nodeId: string): string => JSON.stringify([ownerRunId, nodeId]);
	const attemptKey = (requestId: string, ownerRunId: string, nodeId: string): string => JSON.stringify([requestId, ownerRunId, nodeId]);
	const rememberPendingLegacyCancel = (requestId: string): void => {
		boundedRemember(pendingLegacyCancels, requestId);
	};
	const emitTerminal = (key: string, payload: SubagentDelegationResponse): void => {
		if (disposed || settledAttempts.has(key)) return;
		rememberIdentity(settledAttempts, key);
		options.events.emit(SUBAGENT_
```