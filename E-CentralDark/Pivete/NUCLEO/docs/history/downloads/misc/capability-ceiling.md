# OUTRO - capability-ceiling.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\runs\shared\capability-ceiling.ts
**SHA:** 3b264cceff58c4e9
**Timestamp:** 2026-08-28T02:24:57.126021
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- const normalizeList = (field: "allowedTools" | "allowedAgents", pattern: RegExp): string[] | undefined => {

### Ouro Bruto (primeiros 5000 chars)
```
import { Buffer } from "node:buffer";

export const SUBAGENT_CAPABILITY_CEILING_VERSION = 1 as const;
export const SUBAGENT_CAPABILITY_CEILING_REGISTRY_KEY = "pi-subagents.capability-ceiling.v1";
export const SUBAGENT_CAPABILITY_CEILING_ENV = "PI_SUBAGENT_CAPABILITY_CEILING_V1";

export type SubagentCapabilityCeiling =
	| { allowedTools: readonly string[]; allowedAgents?: readonly string[]; denyExtensions?: boolean }
	| { allowedTools?: readonly string[]; allowedAgents?: readonly string[]; denyExtensions: boolean }
	| { allowedTools?: readonly string[]; allowedAgents: readonly string[]; denyExtensions?: boolean };

export interface ResolvedSubagentCapabilityCeiling {
	version: typeof SUBAGENT_CAPABILITY_CEILING_VERSION;
	allowedTools?: string[];
	allowedAgents?: string[];
	denyExtensions: boolean;
	sources: string[];
}

export interface SubagentCapabilityAudit {
	ceiling: ResolvedSubagentCapabilityCeiling;
	requestedTools?: string[];
	effectiveTools: string[];
	removedTools: string[];
	internalTools: string[];
	extensionsDenied: boolean;
	removedExtensionCount: number;
	requestedMcpToolCount: number;
	effectiveMcpTools: string[];
	agentAllowed: boolean;
	agentRestrictionSources?: string[];
}

export interface RegisterSubagentCapabilityCeilingOptions {
	sessionId: string;
	source: string;
	ceiling: SubagentCapabilityCeiling;
}

export interface SubagentCapabilityCeilingHandle {
	update(ceiling: SubagentCapabilityCeiling): void;
	dispose(): void;
}

type Registration = { source: string; ceiling: ResolvedSubagentCapabilityCeiling };
type Registry = Map<string, Map<symbol, Registration>>;

function registry(): Registry {
	const key = Symbol.for(SUBAGENT_CAPABILITY_CEILING_REGISTRY_KEY);
	const store = globalThis as typeof globalThis & { [key: symbol]: unknown };
	const existing = store[key];
	if (existing instanceof Map) return existing as Registry;
	const created: Registry = new Map();
	store[key] = created;
	return created;
}

function validateText(value: unknown, field: string): string {
	if (typeof value !== "string" || !value.trim() || /[\u0000-\u001f\u007f]/u.test(value) || Buffer.byteLength(value.trim(), "utf8") > 256) {
		throw new Error(`Invalid capability ceiling ${field}; expected a non-empty string without control characters (max 256 UTF-8 bytes).`);
	}
	return value.trim();
}

function normalizeCeiling(ceiling: SubagentCapabilityCeiling): ResolvedSubagentCapabilityCeiling {
	if (!ceiling || typeof ceiling !== "object" || Array.isArray(ceiling)) throw new Error("Invalid capability ceiling; expected an object.");
	const hasAllowedTools = Object.hasOwn(ceiling, "allowedTools");
	const hasAllowedAgents = Object.hasOwn(ceiling, "allowedAgents");
	const hasDenyExtensions = Object.hasOwn(ceiling, "denyExtensions");
	if (!hasAllowedTools && !hasAllowedAgents && !hasDenyExtensions) throw new Error("Invalid capability ceiling; expected allowedTools, allowedAgents, or denyExtensions.");
	if (hasDenyExtensions && typeof ceiling.denyExtensions !== "boolean") throw new Error("Invalid capability ceiling denyExtensions; expected a boolean.");
	const normalizeList = (field: "allowedTools" | "allowedAgents", pattern: RegExp): string[] | undefined => {
		if (!Object.hasOwn(ceiling, field)) return undefined;
		const values = ceiling[field];
		if (!Array.isArray(values)) throw new Error(`Invalid capability ceiling ${field}; expected an array.`);
		if (values.length > 256) throw new Error(`Invalid capability ceiling ${field}; expected at most 256 names.`);
		return [...new Set(values.map((entry) => {
			const name = validateText(entry, `${field} entry`);
			if (!pattern.test(name)) throw new Error(`Invalid capability ceiling ${field} entry '${name}'.`);
			if (Buffer.byteLength(name, "utf8") > 128) throw new Error(`Invalid capability ceiling ${field} entry '${name}'; max 128 UTF-8 bytes.`);
			return name;
		}))].sort();
	};
	const allowedTools = normalizeList("allowedTools", /^[A-Za-z0-9_.:-]+$/u);
	const allowedAgents = normalizeList("allowedAgents", /^[A-Za-z0-9_.:-]+$/u);
	return {
		version: SUBAGENT_CAPABILITY_CEILING_VERSION,
		...(allowedTools !== undefined ? { allowedTools } : {}),
		...(allowedAgents !== undefined ? { allowedAgents } : {}),
		denyExtensions: ceiling.denyExtensions === true,
		sources: [],
	};
}

export function parseSubagentCapabilityCeiling(value: unknown, field = "capability ceiling"): ResolvedSubagentCapabilityCeiling {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`Invalid ${field}; expected an object.`);
	const record = value as Record<string, unknown>;
	if (record.version !== SUBAGENT_CAPABILITY_CEILING_VERSION) throw new Error(`Invalid ${field} version.`);
	const normalized = normalizeCeiling(record as SubagentCapabilityCeiling);
	const sources = record.sources;
	if (!Array.isArray(sources) || sources.some((source) => typeof source !== "string")) throw new Error(`Invalid ${field} sources; expected an array of strings.`);
	normalized.sources = [...new 
```