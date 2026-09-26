# COMANDO - permission-arbiter.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\watchdog\permission-arbiter.ts
**SHA:** a89244e4b378fc47
**Timestamp:** 2026-08-28T02:24:59.901264
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const run = async (): Promise<WatchdogPermissionResult> => {
- systemPrompt: [

### Ouro Bruto (primeiros 5000 chars)
```
import { Agent, type AgentTool, type StreamFn } from "@earendil-works/pi-agent-core";
import { convertToLlm, type ExtensionContext } from "@earendil-works/pi-coding-agent";
import { streamSimple } from "@earendil-works/pi-ai/compat";
import { Type, type Static } from "typebox";
import { appendPermissionAudit, permissionArgsPreview } from "../runs/shared/permissions.ts";
import { agentStreamOptions } from "../shared/agent-stream-options.ts";
import { decodeChildWatchdogConfig } from "./child-status.ts";
import { childResolvedConfig } from "./register-child.ts";
import { resolveWatchdogReviewModel } from "./review.ts";

const PermissionDecisionParams = Type.Object({
	decision: Type.String({ enum: ["approve", "deny"] }),
	reason: Type.String({ description: "One concise reason for this exact decision." }),
}, { additionalProperties: false });

type PermissionDecisionParams = Static<typeof PermissionDecisionParams>;

export interface WatchdogPermissionResult {
	approved: boolean;
	reason: string;
	source: "watchdog";
}

export interface WatchdogPermissionRequest {
	ctx: ExtensionContext;
	toolName: string;
	args: unknown;
	rawWatchdogConfig?: string;
	auditPath?: string;
	signal?: AbortSignal;
}

export interface WatchdogPermissionArbiterOptions {
	streamFn?: StreamFn;
}

function conciseReason(value: string): string {
	const trimmed = value.trim();
	return trimmed ? trimmed.slice(0, 500) : "Watchdog returned an empty reason.";
}

export function createWatchdogPermissionArbiter(options: WatchdogPermissionArbiterOptions = {}) {
	return async (request: WatchdogPermissionRequest): Promise<WatchdogPermissionResult> => {
		const preview = permissionArgsPreview(request.args);
		const createdAt = Date.now();
		const auditBase = { type: "permission.request", createdAt, toolName: request.toolName, preview, matchedRule: "ask", decisionSource: "watchdog" };
		appendPermissionAudit(request.auditPath, auditBase);
		let completed = false;
		const finish = (approved: boolean, reason: string, decision: string): WatchdogPermissionResult => {
			const concise = conciseReason(reason);
			if (completed) return { approved, reason: concise, source: "watchdog" };
			completed = true;
			appendPermissionAudit(request.auditPath, {
				type: "permission.decision",
				createdAt: Date.now(),
				requestCreatedAt: createdAt,
				toolName: request.toolName,
				decision,
				approved,
				decisionSource: "watchdog",
				reason: concise,
			});
			return { approved, reason: concise, source: "watchdog" };
		};

		let childConfig;
		try {
			childConfig = decodeChildWatchdogConfig(request.rawWatchdogConfig);
		} catch (error) {
			const reason = error instanceof Error ? error.message : String(error);
			return finish(false, `Watchdog permission arbiter configuration is invalid: ${reason}`, "unavailable");
		}
		if (!childConfig) return finish(false, "Watchdog permission arbiter is unavailable because the child watchdog is disabled.", "unavailable");
		if (request.signal?.aborted || request.ctx.signal?.aborted) return finish(false, "Watchdog permission decision was cancelled.", "cancelled");

		let decision: PermissionDecisionParams | undefined;
		const tool: AgentTool<typeof PermissionDecisionParams, { recorded: boolean }> = {
			name: "watchdog_permission_decision",
			label: "Watchdog permission decision",
			description: "Approve or deny this exact child tool call. Call exactly once.",
			parameters: PermissionDecisionParams,
			executionMode: "sequential",
			async execute(_toolCallId, params) {
				if (!decision) decision = params;
				return { content: [{ type: "text", text: "Permission decision recorded." }], details: { recorded: true } };
			},
		};

		let timeout: ReturnType<typeof setTimeout> | undefined;
		let agent: Agent | undefined;
		let abort: (() => void) | undefined;
		try {
			const run = async (): Promise<WatchdogPermissionResult> => {
				const config = childResolvedConfig(childConfig);
				const selection = await resolveWatchdogReviewModel(request.ctx, config);
				const auth = selection.auth;
				const registeredProvider = (request.ctx.modelRegistry as {
					getRegisteredProviderConfig?: (provider: string) => { api?: string; streamSimple?: StreamFn } | undefined;
				}).getRegisteredProviderConfig?.(selection.model.provider);
				const baseStreamFn = options.streamFn ?? (registeredProvider?.streamSimple && registeredProvider.api === selection.model.api
					? registeredProvider.streamSimple
					: streamSimple);
				const streamFn: StreamFn = (model, context, streamOptions) => baseStreamFn(model, context, {
					...streamOptions,
					...(auth.apiKey ? { apiKey: auth.apiKey } : {}),
					env: auth.env || streamOptions?.env ? { ...(auth.env ?? {}), ...(streamOptions?.env ?? {}) } : undefined,
					headers: { ...(streamOptions?.headers ?? {}), ...(auth.headers ?? {}) },
				});
				agent = new Agent({
					initialState: {
						systemPrompt: [
							"You are the pi-subagents watchdog permission arbiter.",
							"Decide 
```