# DECISAO - model-scope.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\runs\shared\model-scope.ts
**SHA:** cddbd03c5f767ecb
**Timestamp:** 2026-08-28T02:24:57.771819
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- function globToRegExp(pattern: string): RegExp {
- export function matchesScopePattern(model: string, pattern: string): boolean {
- function expandInheritPattern(pattern: string, parentModel: { provider: string; id: string } | undefined): string {
- return pattern === "inherit" && parentModel ? `${parentModel.provider}/${parentModel.id}` : pattern;

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Optional model-scope enforcement for subagent model resolution.
 *
 * When `subagents.modelScope.enforce` is enabled in settings, a resolved model
 * that does not match any `allow` pattern is rejected. The severity depends on
 * where the model came from: an explicit caller-supplied model (`--model`,
 * tool-call `model`, or a TUI clarify pick) is a hard error, while a model
 * inherited from agent frontmatter / `defaultModel` / the parent session only
 * emits a warning so existing configurations keep working. Optional strict
 * enforcement makes inherited models hard errors too.
 *
 * The decision logic ({@link checkModelScope}) is a pure function of its
 * inputs so it can be unit-tested without touching the filesystem or config.
 */

import { splitKnownThinkingSuffix } from "../../shared/model-info.ts";

export interface ModelScopeRule {
	enforce?: boolean;
	/** Reject inherited and fallback models outside the allowlist instead of warning. */
	strict?: boolean;
	/** Glob-style allow patterns (only `*` is special), matched against `provider/id`. */
	allow?: string[];
}

export interface ModelScopeConfig extends ModelScopeRule {
	/** Additional restrictions keyed by canonical agent name. */
	agents?: Record<string, ModelScopeRule>;
}

export interface ModelScopeCheckRule extends ModelScopeRule {
	origin?: string;
}

export interface ResolvedModelScope extends ModelScopeCheckRule {
	origin: string;
}

/** Where a resolved model originated, deciding enforcement severity. */
export type ModelSource = "explicit" | "inherited";

export interface ModelScopeViolation {
	/** Resolved model id (without thinking suffix) that fell outside the scope. */
	model: string;
	severity: "warn" | "error";
	message: string;
	allowedPatterns: string[];
	origin: string;
}

function stripThinkingSuffix(model: string): string {
	return splitKnownThinkingSuffix(model).baseModel;
}

/** Escape RegExp specials except `*`, then turn `*` into `.*`. */
function globToRegExp(pattern: string): RegExp {
	const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
	return new RegExp(`^${escaped}$`, "i");
}

/**
 * Test whether a resolved model matches a single allow pattern. Both sides are
 * compared case-insensitively against the full `provider/id` (thinking suffix
 * stripped from the model).
 */
export function matchesScopePattern(model: string, pattern: string): boolean {
	return globToRegExp(pattern).test(stripThinkingSuffix(model));
}

/**
 * Pure scope decision. Returns a {@link ModelScopeViolation} when the model is
 * out of scope and enforcement is on, otherwise `undefined`. Enforcement with
 * no `allow` list is a no-op (the settings parser rejects that combination, but
 * this stays defensive for callers that build configs programmatically).
 */
export function checkModelScope(
	model: string | undefined,
	scope: ModelScopeCheckRule | undefined,
	source: ModelSource,
): ModelScopeViolation | undefined {
	if (!model || !scope?.enforce) return undefined;
	const allow = scope.allow;
	if (!allow || allow.length === 0) return undefined;
	if (allow.some((pattern) => matchesScopePattern(model, pattern))) return undefined;

	const baseModel = stripThinkingSuffix(model);
	const severity: ModelScopeViolation["severity"] = source === "explicit" || scope.strict === true ? "error" : "warn";
	const origin = scope.origin ?? "modelScope";
	return {
		model: baseModel,
		severity,
		allowedPatterns: allow,
		origin,
		message:
			`Model '${baseModel}' is outside the configured subagent model scope (${origin}). ` +
			`Allowed patterns: ${allow.join(", ")}.`,
	};
}

function expandInheritPattern(pattern: string, parentModel: { provider: string; id: string } | undefined): string {
	return pattern === "inherit" && parentModel ? `${parentModel.provider}/${parentModel.id}` : pattern;
}

function assertRecord(value: unknown, field: string, meta: { filePath: string }, expected = "an object"): Record<string, unknown> {
	if (!value || typeof value !== "object" || Array.isArray(value)) {
		throw new Error(`Subagent settings in '${meta.filePath}' have invalid '${field}'; expected ${expected}.`);
	}
	return value as Record<string, unknown>;
}

function parseAllowList(value: unknown, field: string, meta: { filePath: string }): string[] {
	if (!Array.isArray(value)) {
		throw new Error(`Subagent settings in '${meta.filePath}' have invalid '${field}'; expected an array of strings.`);
	}
	const allow: string[] = [];
	for (const entry of value) {
		if (typeof entry !== "string") {
			throw new Error(`Subagent settings in '${meta.filePath}' have invalid '${field}'; expected an array of strings.`);
		}
		const trimmed = entry.trim();
		if (trimmed) allow.push(trimmed);
	}
	if (allow.length === 0) {
		throw new Error(`Subagent settings in '${meta.filePath}' have invalid '${field}'; expected a non-empty array of patterns.`);
	}
	return allow;
}

function parseScopeRule(input: Record<string, unknown>, field: string, meta: { filePath: 
```