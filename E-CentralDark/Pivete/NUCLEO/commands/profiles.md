# COMANDO - profiles.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\profiles\profiles.ts
**SHA:** ffb56588e7074718
**Timestamp:** 2026-08-28T02:24:52.837399
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- delegate: { model: models.cheap },

### Ouro Bruto (primeiros 5000 chars)
```
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { BUILTIN_AGENT_NAMES } from "../agents/agents.ts";
import { getPiSpawnCommand } from "../runs/shared/pi-spawn.ts";
import { findModelInfo, getSupportedThinkingLevels, splitKnownThinkingSuffix, toModelInfo } from "../shared/model-info.ts";
import { getAgentDir } from "../shared/utils.ts";

export const DEFAULT_PROVIDER_MODELS_MAX_AGE_DAYS = 7;

type BuiltinAgentName = typeof BUILTIN_AGENT_NAMES[number];
export type ProfileKind = "quota" | "quality";
export type ProbeStatus = "ok" | "unavailable" | "auth" | "timeout" | "error" | "skipped";
export type CostTier = "cheap" | "medium" | "expensive";
export type QualityTier = "weak" | "medium" | "strong";
export type LatencyTier = "fast" | "medium" | "slow";
export type RecommendedRoleTier = "cheap" | "medium" | "strong";

interface ProfileAgentOverride {
	model?: string;
	thinking?: string | false;
	fallbackModels?: string[] | false;
}

export interface SubagentProfileFile {
	subagents: {
		agentOverrides: Record<string, ProfileAgentOverride>;
		disableBuiltins?: boolean;
		[key: string]: unknown;
	};
}

export type ClassificationSource = "official-metadata" | "heuristic-name";

export interface ProviderModelCatalogModel {
	id: string;
	fullId: string;
	observed: {
		availableInRegistry: boolean;
		name?: string;
		reasoning?: boolean;
		thinkingLevels: string[];
		contextWindow?: number;
		maxTokens?: number;
		cost?: {
			input?: number;
			output?: number;
			cacheRead?: number;
			cacheWrite?: number;
		};
		probe: {
			status: ProbeStatus;
			checkedAt: string;
			message?: string;
		};
	};
	derived: {
		profileRank: number;
		costTier: CostTier;
		qualityTier: QualityTier;
		latencyTier: LatencyTier;
		recommendedRoleTier: RecommendedRoleTier;
		recommendedAgents: BuiltinAgentName[];
		classificationSources: ClassificationSource[];
	};
	warnings: string[];
	notes: string[];
}

export interface ProviderModelCatalogFile {
	provider: string;
	refreshedAt: string;
	maxAgeDays: number;
	sources: string[];
	models: ProviderModelCatalogModel[];
}

export interface ProfileCheckResult {
	profileName: string;
	filePath: string;
	results: Array<{
		agent: string;
		model: string;
		inRegistry: boolean;
		probe: { status: ProbeStatus; message?: string };
	}>;
}

function readJsonObjectFile(filePath: string): Record<string, unknown> {
	const raw = fs.readFileSync(filePath, "utf-8");
	const parsed = JSON.parse(raw) as unknown;
	if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
		throw new Error(`File '${filePath}' must contain a JSON object.`);
	}
	return parsed as Record<string, unknown>;
}

function writeJsonFile(filePath: string, value: unknown): void {
	fs.mkdirSync(path.dirname(filePath), { recursive: true });
	fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf-8");
}

const SAFE_PATH_TOKEN = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

function normalizePathToken(value: string, label: string): string {
	const trimmed = value.trim();
	if (!trimmed) throw new Error(`${label} is required.`);
	if (!SAFE_PATH_TOKEN.test(trimmed) || trimmed === "." || trimmed === ".." || trimmed.includes("/") || trimmed.includes("\\")) {
		throw new Error(`${label} must be a safe file name using only letters, numbers, dots, underscores, and hyphens.`);
	}
	return trimmed;
}

function normalizeProfileName(name: string): string {
	const trimmed = name.trim();
	const stem = trimmed.endsWith(".json") ? trimmed.slice(0, -5) : trimmed;
	return normalizePathToken(stem, "Profile name");
}

function normalizeProviderName(provider: string): string {
	return normalizePathToken(provider, "Provider");
}

function validateSubagentProfile(filePath: string, parsed: Record<string, unknown>): SubagentProfileFile {
	const subagents = parsed.subagents;
	if (!subagents || typeof subagents !== "object" || Array.isArray(subagents)) {
		throw new Error(`Profile '${filePath}' must contain a 'subagents' object.`);
	}
	const agentOverrides = (subagents as Record<string, unknown>).agentOverrides;
	if (!agentOverrides || typeof agentOverrides !== "object" || Array.isArray(agentOverrides)) {
		throw new Error(`Profile '${filePath}' must contain 'subagents.agentOverrides' as an object.`);
	}
	for (const [name, value] of Object.entries(agentOverrides)) {
		if (!value || typeof value !== "object" || Array.isArray(value)) {
			throw new Error(`Profile '${filePath}' has invalid override '${name}'; expected an object.`);
		}
		const override = value as Record<string, unknown>;
		const model = override.model;
		if (model !== undefined && typeof model !== "string") {
			throw new Error(`Profile '${filePath}' has invalid model for '${name}'; expected a string.`);
		}
		const thinking = override.thinking;
		if (thinking !== undefined && thinking !== false && typeof thinking !== "string") {
			throw new Error(`P
```