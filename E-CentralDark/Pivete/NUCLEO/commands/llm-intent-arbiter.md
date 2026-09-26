# COMANDO - llm-intent-arbiter.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\runs\shared\llm-intent-arbiter.ts
**SHA:** 3ed0821f9f8ff2b3
**Timestamp:** 2026-08-28T02:24:57.716144
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- systemPrompt: [
- const prompt = `TASK:\n${task}`;

### Ouro Bruto (primeiros 5000 chars)
```
import { createHash } from "node:crypto";
import { Agent, type AgentTool, type StreamFn } from "@earendil-works/pi-agent-core";
import { convertToLlm, type ExtensionContext } from "@earendil-works/pi-coding-agent";
import { streamSimple } from "@earendil-works/pi-ai/compat";
import type { ProviderHeaders } from "@earendil-works/pi-ai";
import { Type, type Static } from "typebox";
import { agentStreamOptions } from "../../shared/agent-stream-options.ts";

/**
 * LLM intent arbiter for the completion mutation guard.
 *
 * The regex classifier (task-intent.ts) is deliberately narrow, so exotic
 * review wording can still look like an implementation task ("to fix this,
 * compare the outputs", verbs inside URLs or quoted text). When the guard is
 * about to hard-fail a run that made no edits, this arbiter asks a model
 * whether the task actually instructed file changes. It can only downgrade a
 * failure to a pass; every error, timeout, or non-read-only verdict keeps the
 * guard's original behavior.
 *
 * Enabled by default; set PI_SUBAGENTS_LLM_INTENT_ARBITER=0 to disable.
 */

const COMPLETION_GUARD_ERROR_PREFIX =
	"Subagent completed without making edits for an implementation task.";

export type TaskMutationVerdict = "read-only" | "implementation" | "unavailable";

export type TaskMutationArbiter = (task: string) => Promise<TaskMutationVerdict>;

const DecisionParams = Type.Object(
	{
		classification: Type.String({ enum: ["read_only", "implementation"] }),
		confidence: Type.String({
			enum: ["low", "medium", "high"],
			description: "Confidence in the classification. Only read_only with high confidence rescues a failed run.",
		}),
		reason: Type.String({ description: "One concise reason for this classification." }),
	},
	{ additionalProperties: false },
);

type DecisionParams = Static<typeof DecisionParams>;

/** Map a model decision to a verdict. Only a high-confidence read_only rescues. */
export function mapArbiterDecision(
	decision: { classification?: string; confidence?: string } | undefined,
): TaskMutationVerdict {
	if (!decision) return "unavailable";
	if (decision.classification === "read_only" && decision.confidence === "high") return "read-only";
	return "implementation";
}

interface ArbiterRuntime {
	model: NonNullable<RegistryModel>;
	baseStreamFn: StreamFn;
	timeoutMs: number;
}

interface ArbiterAuth {
	apiKey?: string;
	headers?: ProviderHeaders;
	env?: Record<string, string>;
}

export interface TaskMutationArbiterOptions {
	/** Explicit "provider/id" model override (tests, config). */
	model?: string;
	/** Injectable stream function (tests). */
	streamFn?: StreamFn;
	timeoutMs?: number;
}

const DEFAULT_ARBITER_TIMEOUT_MS = 10_000;

type RegistryModel = ReturnType<NonNullable<ExtensionContext["modelRegistry"]["find"]>>;

function resolveArbiterModel(
	ctx: ExtensionContext,
	options?: TaskMutationArbiterOptions,
): NonNullable<RegistryModel> | null {
	const registry = ctx.modelRegistry as {
		find?: (provider: string, modelId: string) => RegistryModel | undefined;
		getAvailable?: () => Array<{ provider?: string; id?: string }>;
	};
	const explicit = options?.model?.trim();
	if (explicit) {
		const [provider, id] = explicit.split("/");
		if (provider && id) return registry.find?.(provider, id) ?? null;
		return null;
	}
	if (ctx.model) return ctx.model as NonNullable<RegistryModel>;
	const first = registry.getAvailable?.()[0];
	if (first?.provider && first.id) return registry.find?.(first.provider, first.id) ?? null;
	return null;
}

function resolveArbiterRuntime(
	ctx: ExtensionContext,
	options?: TaskMutationArbiterOptions,
): ArbiterRuntime | null {
	const model = resolveArbiterModel(ctx, options);
	if (!model?.provider || !model.id) return null;
	const registry = ctx.modelRegistry as {
		getRegisteredProviderConfig?: (provider: string) => { api?: string; streamSimple?: StreamFn } | undefined;
	};
	const modelApi = (model as { api?: string }).api;
	const registered = registry.getRegisteredProviderConfig?.(model.provider);
	const baseStreamFn = options?.streamFn
		?? (registered?.streamSimple && registered.api === modelApi
			? registered.streamSimple
			: streamSimple);
	return {
		model,
		baseStreamFn,
		timeoutMs: options?.timeoutMs ?? DEFAULT_ARBITER_TIMEOUT_MS,
	};
}

async function resolveArbiterAuth(
	ctx: ExtensionContext,
	model: RegistryModel,
): Promise<ArbiterAuth> {
	const registry = ctx.modelRegistry as {
		getApiKeyAndHeaders?: (m: RegistryModel) => Promise<{
			ok: boolean;
			apiKey?: string;
			headers?: ProviderHeaders;
			env?: Record<string, string>;
			error?: string;
		}>;
	};
	// Call as a METHOD on the registry: the host ModelRegistry implementation
	// is a class whose method reads instance state (this.runtime), so a
	// detached call silently fails auth. Same shape as the watchdog.
	if (!registry.getApiKeyAndHeaders) return {};
	try {
		const auth = await registry.getApiKeyAndHeaders(model);
		if (auth.ok === false) return {};
		return {
			...(auth.
```