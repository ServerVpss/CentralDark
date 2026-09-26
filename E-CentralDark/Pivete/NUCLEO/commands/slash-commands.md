# COMANDO - slash-commands.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\slash\slash-commands.ts
**SHA:** f6ea74d095a139ba
**Timestamp:** 2026-08-28T02:24:59.551009
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: () => Promise<T>,
- function formatAsyncStopTarget(run: AsyncRunSummary): StopSelectorTarget {
- const start = Math.max(0, Math.min(this.selected - maxRows + 1, Math.max(0, this.targets.length - maxRows)));
- const detachForegroundRun = (args: string, ctx: ExtensionContext): void => {
- run: async (params, ctx) => {

### Ouro Bruto (primeiros 5000 chars)
```
import { randomUUID } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import { keyText, type ExtensionAPI, type ExtensionContext } from "@earendil-works/pi-coding-agent";
import { Key, matchesKey, truncateToWidth, type Component, type KeyId, type TUI } from "@earendil-works/pi-tui";
import { BUILTIN_AGENT_NAMES, discoverAgents, discoverAgentsAll, findBlockingAgentDiagnostic, formatUnknownAgentError, resolveAgentName, unknownAgentDiagnosticContext, type AgentConfig, type AgentDiscoveryDiagnostic, type AgentScope, type UnknownAgentDiagnosticContext } from "../agents/agents.ts";
import { listRuntimeAgentConfigs, mergeRuntimeAgents } from "../agents/runtime-agent-registry.ts";
import { resolveExistingReadPaths } from "../shared/settings.ts";
import {
	DEFAULT_PROVIDER_MODELS_MAX_AGE_DAYS,
	applySubagentProfile,
	checkSubagentProfile,
	generateProfilesForProvider,
	listSubagentProfiles,
	readSubagentProfile,
	refreshProviderModelCatalog,
} from "../profiles/profiles.ts";
import type { SubagentParamsLike } from "../runs/foreground/subagent-executor.ts";
import { findModelInfo, toModelInfo } from "../shared/model-info.ts";
import { formatTokens, shortenPath } from "../shared/formatters.ts";
import { listAsyncRuns, formatAsyncRunProgressLabel, type AsyncRunSummary } from "../runs/background/async-status.ts";
import { encodeInspectReply, handleInspectRpcArgs, INSPECT_WIDGET_KEY } from "../runs/background/inspect-rpc.ts";
import { listScheduledRunSummaries } from "../runs/background/scheduled-runs.ts";
import { SUBAGENT_FANOUT_CHILD_ENV } from "../runs/shared/pi-args.ts";
import { FLEET_OPEN_SHORTCUT } from "../shared/shortcuts.ts";
import type { SlashSubagentResponse, SlashSubagentUpdate } from "./slash-bridge.ts";
import { registerPromptWorkflowCommands } from "./prompt-workflows.ts";
import { openSubagentsAdmin } from "./subagents-admin.ts";
import { SUBAGENT_GUIDE_TOPICS } from "../extension/subagent-guide.ts";
import { openSubagentFleet } from "../tui/fleet.ts";
import {
	applySlashUpdate,
	buildSlashInitialResult,
	failSlashResult,
	finalizeSlashResult,
	resolveSlashMessageDetails,
} from "./slash-live-state.ts";
import {
	SLASH_RESULT_TYPE,
	SLASH_TEXT_RESULT_TYPE,
	SLASH_SUBAGENT_CANCEL_EVENT,
	SLASH_SUBAGENT_REQUEST_EVENT,
	SLASH_SUBAGENT_RESPONSE_EVENT,
	SLASH_SUBAGENT_STARTED_EVENT,
	SLASH_SUBAGENT_UPDATE_EVENT,
	DIRS,
	type Details,
	type FleetKeybindingsConfig,
	type JsonSchemaObject,
	type SingleResult,
	type SubagentState,
	type Usage,
} from "../shared/types.ts";

interface InlineConfig {
	output?: string | false;
	outputMode?: "inline" | "file-only";
	reads?: string[] | false;
	model?: string;
	skill?: string[] | false;
}

const parseInlineConfig = (raw: string): InlineConfig => {
	const config: InlineConfig = {};
	for (const part of raw.split(",")) {
		const trimmed = part.trim();
		if (!trimmed) continue;
		const eq = trimmed.indexOf("=");
		if (eq === -1) continue;
		const key = trimmed.slice(0, eq).trim();
		const val = trimmed.slice(eq + 1).trim();
		switch (key) {
			case "output": config.output = val === "false" ? false : val; break;
			case "outputMode": if (val === "inline" || val === "file-only") config.outputMode = val; break;
			case "reads": config.reads = val === "false" ? false : val.split("+").filter(Boolean); break;
			case "model": config.model = val || undefined; break;
			case "skill": case "skills": config.skill = val === "false" ? false : val.split("+").filter(Boolean); break;
		}
	}
	return config;
};

const parseAgentToken = (token: string): { name: string; config: InlineConfig } => {
	const bracket = token.indexOf("[");
	if (bracket === -1) return { name: token, config: {} };
	const end = token.lastIndexOf("]");
	return { name: token.slice(0, bracket), config: parseInlineConfig(token.slice(bracket + 1, end !== -1 ? end : undefined)) };
};

const extractExecutionFlags = (rawArgs: string): { args: string; bg: boolean; fork: boolean } => {
	let args = rawArgs.trim();
	let bg = false;
	let fork = false;

	while (true) {
		if (args.endsWith(" --bg") || args === "--bg") {
			bg = true;
			args = args === "--bg" ? "" : args.slice(0, -5).trim();
			continue;
		}
		if (args.endsWith(" --fork") || args === "--fork") {
			fork = true;
			args = args === "--fork" ? "" : args.slice(0, -7).trim();
			continue;
		}
		break;
	}

	return { args, bg, fork };
};

function discoverSlashAgents(pi: ExtensionAPI, cwd: string, scope: AgentScope): { agents: AgentConfig[]; agentDiagnostics?: AgentDiscoveryDiagnostic[]; unknownAgentDiagnosticContext: UnknownAgentDiagnosticContext } {
	const discovered = discoverAgents(cwd, scope);
	if (listRuntimeAgentConfigs(pi).length === 0) return { ...discovered, unknownAgentDiagnosticContext: unknownAgentDiagnosticContext(discovered) };
	const all = discoverAgentsAll(cwd);
	const configuredAgents: AgentConfig[] = [
		...all.builtin,
		...all.package,
		...(scope !== "project" ? all.user : []),
		...(scope !== "user" ? all.proj
```