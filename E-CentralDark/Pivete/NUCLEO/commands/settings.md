# COMANDO - settings.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\watchdog\settings.ts
**SHA:** efcb29fd65b30d57
**Timestamp:** 2026-08-28T02:25:00.037428
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- showDuringRun: false,
- if ("showDuringRun" in input) patch.showDuringRun = parseBoolean(input.showDuringRun, `${field}.showDuringRun`, meta);

### Ouro Bruto (primeiros 5000 chars)
```
import * as fs from "node:fs";
import * as path from "node:path";
import { THINKING_LEVELS, type ThinkingLevel } from "../shared/model-info.ts";
import { getAgentDir, getProjectConfigDir } from "../shared/utils.ts";
import {
	WATCHDOG_DELIVERY_MODES,
	WATCHDOG_LATE_WARNING_POLICIES,
	WATCHDOG_WARNING_SEVERITIES,
	type ResolvedWatchdogConfig,
	type WatchdogAsyncCompletionConfig,
	type WatchdogAutoFollowConfig,
	type WatchdogChildOverrideConfig,
	type WatchdogChildrenConfig,
	type WatchdogDeliveryMode,
	type WatchdogEndpointConfig,
	type WatchdogCadenceConfig,
	type WatchdogGuidanceConfig,
	type WatchdogLateWarningPolicy,
	type WatchdogScopeConfig,
	type WatchdogLspConfig,
	type WatchdogSettingsError,
	type WatchdogSettingsResult,
	type WatchdogSettingsSource,
	type WatchdogSeverity,
	type WatchdogSyncBacklog,
} from "./types.ts";

type WatchdogAutoFollowPatch = Partial<WatchdogAutoFollowConfig>;
type WatchdogGuidancePatch = Partial<WatchdogGuidanceConfig>;
type WatchdogScopePatch = Partial<WatchdogScopeConfig>;
type WatchdogCadencePatch = Partial<WatchdogCadenceConfig>;
type WatchdogEndpointPatch = Partial<WatchdogEndpointConfig>;
type WatchdogChildOverridePatch = Partial<WatchdogChildOverrideConfig>;
type WatchdogChildrenPatch = Partial<Omit<WatchdogChildrenConfig, "autoFollow" | "overrides">> & {
	autoFollow?: WatchdogAutoFollowPatch;
	overrides?: Record<string, WatchdogChildOverridePatch>;
};
type WatchdogAsyncCompletionPatch = Partial<WatchdogAsyncCompletionConfig>;
type WatchdogLspPatch = Partial<WatchdogLspConfig>;

export type WatchdogSettingsWriteScope = "user" | "project";
export type WatchdogModelSettingsTarget =
	| { kind: "main" }
	| { kind: "children" }
	| { kind: "child"; agent: string };

export interface WatchdogModelSettingsWrite {
	scope: WatchdogSettingsWriteScope;
	cwd?: string;
	target: WatchdogModelSettingsTarget;
	model?: string | null;
	thinking?: ThinkingLevel | false | null;
}

type WatchdogConfigPatch = Partial<Omit<ResolvedWatchdogConfig, "guidance" | "autoFollow" | "scope" | "cadence" | "main" | "children" | "asyncCompletion" | "lsp">> & {
	guidance?: WatchdogGuidancePatch;
	autoFollow?: WatchdogAutoFollowPatch;
	scope?: WatchdogScopePatch;
	cadence?: WatchdogCadencePatch;
	main?: WatchdogEndpointPatch;
	children?: WatchdogChildrenPatch;
	asyncCompletion?: WatchdogAsyncCompletionPatch;
	lsp?: WatchdogLspPatch;
};

interface ParseMeta {
	scope: "user" | "project" | "session";
	path?: string;
}

export const DEFAULT_WATCHDOG_CONFIG: ResolvedWatchdogConfig = {
	enabled: false,
	delivery: "held",
	showDuringRun: false,
	syncBacklog: "off",
	agentEndTimeoutMs: 30_000,
	lateWarningPolicy: "show-stale-no-autofollow",
	severityThreshold: "concern",
	maxWarnings: null,
	guidance: {
		watchdogMd: true,
		systemPromptPath: null,
	},
	autoFollow: {
		blockers: true,
		maxAttempts: 3,
		stalemateRepeats: 3,
	},
	scope: {
		enabled: true,
	},
	cadence: {
		everyNTools: null,
	},
	main: {
		enabled: false,
	},
	children: {
		enabled: false,
		watchdogTailTimeoutMs: 120_000,
		autoFollow: {
			blockers: true,
			maxAttempts: 3,
			stalemateRepeats: 3,
		},
		overrides: {},
	},
	asyncCompletion: {
		enabled: false,
		autoFollowBlockers: false,
	},
	lsp: {
		enabled: true,
		timeoutMs: 3_000,
		maxFiles: 20,
		maxDiagnostics: 50,
	},
	compactAtPercent: 80,
	reviewRetryDelayMs: 1_000,
	maxReviewFailures: 3,
};

const WATCHDOG_FIELDS = new Set([
	"enabled",
	"delivery",
	"showDuringRun",
	"syncBacklog",
	"agentEndTimeoutMs",
	"lateWarningPolicy",
	"severityThreshold",
	"maxWarnings",
	"guidance",
	"autoFollow",
	"scope",
	"cadence",
	"main",
	"children",
	"asyncCompletion",
	"lsp",
	"compactAtPercent",
	"reviewRetryDelayMs",
	"maxReviewFailures",
]);
const GUIDANCE_FIELDS = new Set(["watchdogMd", "systemPromptPath"]);
const AUTO_FOLLOW_FIELDS = new Set(["blockers", "maxAttempts", "stalemateRepeats"]);
const SCOPE_FIELDS = new Set(["enabled"]);
const CADENCE_FIELDS = new Set(["everyNTools"]);
const ENDPOINT_FIELDS = new Set(["enabled", "model", "thinking"]);
const CHILDREN_FIELDS = new Set(["enabled", "model", "thinking", "watchdogTailTimeoutMs", "autoFollow", "overrides"]);
const CHILD_OVERRIDE_FIELDS = new Set(["enabled", "model", "thinking"]);
const ASYNC_COMPLETION_FIELDS = new Set(["enabled", "autoFollowBlockers"]);
const LSP_FIELDS = new Set(["enabled", "timeoutMs", "maxFiles", "maxDiagnostics"]);

function cloneDefaultConfig(): ResolvedWatchdogConfig {
	return {
		...DEFAULT_WATCHDOG_CONFIG,
		guidance: { ...DEFAULT_WATCHDOG_CONFIG.guidance },
		autoFollow: { ...DEFAULT_WATCHDOG_CONFIG.autoFollow },
		scope: { ...DEFAULT_WATCHDOG_CONFIG.scope },
		cadence: { ...DEFAULT_WATCHDOG_CONFIG.cadence },
		main: { ...DEFAULT_WATCHDOG_CONFIG.main },
		children: {
			...DEFAULT_WATCHDOG_CONFIG.children,
			autoFollow: { ...DEFAULT_WATCHDOG_CONFIG.children.autoFollow },
			overrides: {},
		},
		asyncCompletion: { ...DEFAULT_WATCHDOG_CONFIG.asyncCompletion },
		lsp: { ...DEFAULT_WATCHDOG_CONFIG.lsp },
	};

```