# COMANDO - review.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\cloudflare\skills\workers-best-practices\references\review.md
**SHA:** 3e32da345be0906d
**Timestamp:** 2026-08-26T18:31:13.775259
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- - Binding access pattern: `env.X` in module export handlers, `this.env.X` in classes extending platform base classes

### Ouro Bruto (primeiros 5000 chars)
```
# Code Review — Workers

How to review Workers code for type correctness, API usage, config validity, and best practices. This is self-contained — do not assume access to other skills.

## Retrieval

Prefer retrieval over pre-training. Types, config schemas, and APIs change with compatibility dates and new bindings.

### Workers types

Fetch the latest `@cloudflare/workers-types` before reviewing. The project may have an older version installed.

```bash
mkdir -p /tmp/workers-types-latest && \
  npm pack @cloudflare/workers-types --pack-destination /tmp/workers-types-latest && \
  tar -xzf /tmp/workers-types-latest/cloudflare-workers-types-*.tgz -C /tmp/workers-types-latest
# Types are at /tmp/workers-types-latest/package/index.d.ts
```

Search this file for the specific type, class, or interface under review. Do not guess type names.

Alternative: `npx wrangler types` generates a typed `Env` interface from the local wrangler config.

Fallback: read `node_modules/@cloudflare/workers-types/index.d.ts`. Note the installed version.

### Wrangler config schema

The authoritative schema is bundled with wrangler as `config-schema.json` (JSON Schema draft-07).

```bash
# Read from local node_modules
cat node_modules/wrangler/config-schema.json
```

Do not guess field names or structures — look them up.

### Cloudflare docs

Use the Cloudflare docs search tool if available, or fetch from `https://developers.cloudflare.com/workers/`. The best practices page lives at `/workers/best-practices/workers-best-practices/`.

---

## Type Validation

### Env interface

- Every binding must have a specific type. Flag `any`, `unknown`, `object`, or `Record<string, unknown>` on bindings.
- Binding types that accept generic parameters (Durable Object namespaces, Queues, Service bindings for RPC) must include them. Read the type definition to confirm which types are generic.
- Binding names must match the wrangler config exactly.
- Prefer generated types from `wrangler types` over hand-written interfaces.

### Handler and class signatures

Verify against current type definitions — do not assume signatures are stable.

- Correct import path (most Workers platform classes import from `"cloudflare:workers"`)
- Generic type parameter on base classes (e.g., `DurableObject<Env>`)
- Binding access pattern: `env.X` in module export handlers, `this.env.X` in classes extending platform base classes
- `ExecutionContext` as the third param in module export handlers (needed for `ctx.waitUntil()`)
- `fetch()` handlers must return `Promise<Response>`

### Binding access — the most common error

- **Module export handlers** (`fetch`, `scheduled`, `queue`, `email`): bindings via `env.X` parameter
- **Platform base classes** (`WorkerEntrypoint`, `DurableObject`, `Workflow`, `Agent`): bindings via `this.env.X`

Flag `env.X` inside a class extending a platform base class. Flag `this.env.X` inside a module export handler.

### Type integrity rules

| Rule | Detail |
|------|--------|
| No `any` | Never on binding types, handler params, or API responses |
| No double-casting | `as unknown as T` hides real incompatibilities — fix the underlying design |
| Justify suppressions | `@ts-ignore`/`@ts-expect-error` must include a comment explaining why |
| Prefer `satisfies` | Use `satisfies ExportedHandler<Env>` over `as` — validates without widening |
| Validate, do not assert | Schema or type guard for untyped data (JSON, parsed bodies), not `as` |

### Stale class patterns

Old patterns survive in codebases long after APIs change.

- **`extends` vs `implements`**: platform classes use `extends`, not `implements`. The `implements` pattern is legacy and loses `this.ctx`, `this.env`.
- **Import paths**: verify module specifiers match what types actually export. Common mistake: wrong path for `"cloudflare:workers"` vs `"cloudflare:workflows"`.
- **Renamed properties**: e.g., `this.state` to `this.ctx` in Durable Objects. Search types to confirm.
- **Constructor signatures**: base class constructors change. Verify expected parameters.

---

## Config Validation

### Required fields

For executable examples, verify: `name`, `compatibility_date`, `main`. Check the schema for current required fields.

### Config format

- **JSONC** (`wrangler.jsonc`) — preferred for new projects
- **JSON** (`wrangler.json`) — valid but no comments
- **TOML** (`wrangler.toml`) — legacy; acceptable in existing content, flag in new projects

### Binding-code consistency

1. Every `env.X` reference in code has a corresponding binding declaration in config
2. Every binding in config is referenced in code (warn on unused)
3. Names match exactly (case-sensitive)
4. For Durable Objects: `class_name` matches the exported class name

### Common config mistakes

| Check | What to look for |
|-------|-----------------|
| Stale `compatibility_date` | Should be recent; use `$today` placeholder in docs |
| Missing DO migrations | Every new DO class needs a migration entry |
| Binding name mism
```

---

# COMANDO - review.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\watchdog\review.ts
**SHA:** ad6fcb90eb256474
**Timestamp:** 2026-08-28T02:24:59.943631
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- systemPrompt: buildWatchdogSystemPrompt(ctx, { hasScope: request.hasScope }),

### Ouro Bruto (primeiros 5000 chars)
```
import { Agent, type AgentTool, type StreamFn, type ThinkingLevel } from "@earendil-works/pi-agent-core";
import { createReadOnlyTools, convertToLlm, type ExtensionContext } from "@earendil-works/pi-coding-agent";
import { streamSimple } from "@earendil-works/pi-ai/compat";
import type { Model, ProviderHeaders } from "@earendil-works/pi-ai";
import { Type, type Static } from "typebox";
import { resolveModelCandidate } from "../runs/shared/model-fallback.ts";
import { agentStreamOptions } from "../shared/agent-stream-options.ts";
import { resolveEffectiveThinking, splitKnownThinkingSuffix, THINKING_LEVELS, toModelInfo } from "../shared/model-info.ts";
import type { WatchdogReviewFunction, WatchdogReviewRequest } from "./runtime.ts";
import {
	WATCHDOG_WARNING_CATEGORIES,
	WATCHDOG_WARNING_CONFIDENCES,
	WATCHDOG_WARNING_SEVERITIES,
	type ResolvedWatchdogConfig,
	type WatchdogCategory,
	type WatchdogConfidence,
	type WatchdogSeverity,
	type WatchdogWarning,
} from "./types.ts";

const WATCHDOG_ALLOWED_TOOL_NAMES = new Set(["read", "grep", "find", "ls", "watchdog_warn"]);

const WatchdogWarnParams = Type.Object({
	severity: Type.String({ enum: WATCHDOG_WARNING_SEVERITIES, description: "concern for actionable risk, blocker for a likely wrong or unsafe outcome" }),
	summary: Type.String({ description: "One concise sentence naming the issue." }),
	evidence: Type.String({ description: "Specific evidence from the turn delta or inspected files." }),
	recommendedAction: Type.String({ description: "Specific action the parent should take before accepting or continuing." }),
	category: Type.Optional(Type.String({ enum: WATCHDOG_WARNING_CATEGORIES })),
	confidence: Type.Optional(Type.String({ enum: WATCHDOG_WARNING_CONFIDENCES })),
}, { additionalProperties: false });

type WatchdogWarnParams = Static<typeof WatchdogWarnParams>;

type WatchdogContextProvider = ExtensionContext | (() => ExtensionContext | undefined);

type RegistryModel = Model<any>;

interface WatchdogReviewAuth {
	apiKey?: string;
	headers?: ProviderHeaders;
	env?: Record<string, string>;
}

export interface WatchdogReviewModelSelection {
	model: RegistryModel;
	thinkingLevel: ThinkingLevel;
	auth: WatchdogReviewAuth;
	explicit: boolean;
}

export interface CreateMainWatchdogReviewOptions {
	streamFn?: StreamFn;
	createReadOnlyTools?: (cwd: string) => AgentTool[];
	getThinkingLevel?: () => ThinkingLevel | undefined;
}

function fullModelId(model: Pick<RegistryModel, "provider" | "id">): string {
	return `${model.provider}/${model.id}`;
}

function splitProviderModel(value: string): { provider: string; id: string } | undefined {
	const slashIndex = value.indexOf("/");
	if (slashIndex <= 0 || slashIndex === value.length - 1) return undefined;
	return { provider: value.slice(0, slashIndex), id: value.slice(slashIndex + 1) };
}

function assertThinkingLevel(value: string, source: string): ThinkingLevel {
	if ((THINKING_LEVELS as readonly string[]).includes(value)) return value as ThinkingLevel;
	throw new Error(`Unsupported watchdog thinking level '${value}' from ${source}; expected ${THINKING_LEVELS.join(", ")} or false.`);
}

function contextThinkingLevel(ctx: ExtensionContext, currentThinkingLevel: ThinkingLevel | undefined): ThinkingLevel | undefined {
	if (currentThinkingLevel) return currentThinkingLevel;
	const value = (ctx as { thinkingLevel?: unknown }).thinkingLevel;
	return typeof value === "string" && (THINKING_LEVELS as readonly string[]).includes(value) ? value as ThinkingLevel : undefined;
}

function resolveReviewThinking(input: {
	modelString: string;
	configThinking: string | false | undefined;
	ctx: ExtensionContext;
	allowContextThinking: boolean;
	currentThinkingLevel?: ThinkingLevel;
}): ThinkingLevel {
	const fromModelOrConfig = resolveEffectiveThinking(input.modelString, input.configThinking);
	if (fromModelOrConfig) return assertThinkingLevel(fromModelOrConfig, "watchdog model/config");
	if (input.configThinking === false) return "off";
	if (input.configThinking !== undefined) return assertThinkingLevel(input.configThinking, "watchdog config");
	if (input.allowContextThinking) return contextThinkingLevel(input.ctx, input.currentThinkingLevel) ?? "off";
	return "off";
}

function resolveConfiguredModel(ctx: ExtensionContext, rawModel: string): { model: RegistryModel; modelString: string } {
	const availableModels = ctx.modelRegistry.getAvailable().map(toModelInfo);
	const preferredProvider = typeof ctx.model?.provider === "string" ? ctx.model.provider : undefined;
	const resolved = resolveModelCandidate(rawModel, availableModels, preferredProvider);
	if (!resolved) {
		throw new Error(`Configured watchdog model '${rawModel}' did not match exactly one authenticated available model. Use provider/model or configure credentials for the intended provider.`);
	}
	const { baseModel } = splitKnownThinkingSuffix(resolved);
	const named = splitProviderModel(baseModel);
	if (!named) {
		throw new Error(`Configured watchdog model '${rawModel}' di
```