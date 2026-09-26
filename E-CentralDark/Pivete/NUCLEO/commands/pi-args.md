# COMANDO - pi-args.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\runs\shared\pi-args.ts
**SHA:** 4489f0ebc6c50d85
**Timestamp:** 2026-08-28T02:24:57.969612
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const taggedPrompt = input.childAgentName

### Ouro Bruto (primeiros 5000 chars)
```
import { createHash } from "node:crypto";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import {
	encodeNestedPathEnv,
	parseNestedPathEnv,
	type NestedPathEntry,
} from "./nested-path.ts";
import {
	resolveMcpDirectToolSelections,
	type ResolvedMcpDirectToolSelection,
} from "./mcp-direct-tool-allowlist.ts";
import { resolvePiPackageRoot } from "./pi-spawn.ts";
import { encodeExtensionBindings, PI_SUBAGENT_EXTENSION_BINDINGS_ENV, type ExtensionBindings } from "./extension-bindings.ts";
import { RUNTIME_EXTENSION_ACK_PATH_ENV } from "./runtime-acknowledged-extensions.ts";
import {
	STRUCTURED_OUTPUT_ACCEPTANCE_CAPTURE_ENV,
	STRUCTURED_OUTPUT_CAPTURE_ENV,
	STRUCTURED_OUTPUT_SCHEMA_ENV,
} from "./structured-output.ts";
import {
	TEMP_ROOT_DIR,
	type JsonSchemaObject,
	type LaunchResolvedChildExtensionsV1,
	type ResolvedToolBudget,
	type RunFanoutBudgetDescriptor,
} from "../../shared/types.ts";
import { THINKING_LEVELS } from "../../shared/model-info.ts";
import { decodeThinkingCeiling, intersectThinkingCeilings, SUBAGENT_THINKING_CEILING_ENV } from "../../shared/thinking-ceiling.ts";
import { encodeRunFanoutBudgetDescriptor, RUN_FANOUT_BUDGET_ENV } from "./run-fanout-budget.ts";
import {
	TOOL_BUDGET_ENV,
	TOOL_BUDGET_ZERO_AUTH_ENV,
	encodeToolBudgetEnv,
} from "./tool-budget.ts";
import {
	CHILD_TOOL_DIAGNOSTIC_PATH_ENV,
	MCP_DIRECT_CHILD_TOOLS_ENV,
	REQUIRED_CHILD_TOOLS_ENV,
} from "./tool-availability.ts";
import {
	CHILD_WATCHDOG_CONFIG_ENV,
	encodeChildWatchdogConfig,
	type ChildWatchdogConfig,
} from "../../watchdog/child-status.ts";
import { WAIT_TOOL_ENABLED_ENV } from "../background/wait-config.ts";
import {
	PI_CODING_AGENT_PACKAGE_ROOT_ENV,
	getAgentDir,
} from "../../shared/utils.ts";
import {
	encodePermissionRules,
	PERMISSION_AUDIT_PATH_ENV,
	PERMISSION_POLICY_ENV,
	type PermissionRules,
} from "./permissions.ts";
import {
	SUBAGENT_CAPABILITY_CEILING_ENV,
	capabilityCeilingAgentRestrictionSources,
	decodeSubagentCapabilityCeiling,
	encodeSubagentCapabilityCeiling,
	intersectSubagentCapabilityCeilings,
	isAgentAllowedByCapabilityCeiling,
	type ResolvedSubagentCapabilityCeiling,
	type SubagentCapabilityAudit,
} from "./capability-ceiling.ts";

const TASK_ARG_LIMIT = 8000;

/**
 * Env override for how the task text reaches the child process. Endpoint
 * protection (EDR) pre-execution command-line scanning may deny exec of
 * children whose argv embeds a long natural-language task, which surfaces
 * as an immediate zero-activity SIGKILL. File delivery keeps the task out
 * of argv entirely.
 */
export const SUBAGENT_TASK_DELIVERY_ENV = "PI_SUBAGENT_TASK_DELIVERY";

export type SubagentTaskDelivery = "auto" | "file";

export function resolveSubagentTaskDelivery(
	env: NodeJS.ProcessEnv = process.env,
): SubagentTaskDelivery {
	return env[SUBAGENT_TASK_DELIVERY_ENV]?.trim().toLowerCase() === "file"
		? "file"
		: "auto";
}

function shouldDeliverTaskViaFile(
	task: string,
	delivery: SubagentTaskDelivery,
): boolean {
	return delivery === "file" || task.length > TASK_ARG_LIMIT;
}
const MAX_LAUNCH_RESOLVED_EXTENSION_IDS = 32;
const PROMPT_RUNTIME_EXTENSION_PATH = path.join(
	path.dirname(fileURLToPath(import.meta.url)),
	"subagent-prompt-runtime.ts",
);
const FANOUT_CHILD_EXTENSION_PATH = path.join(
	path.dirname(fileURLToPath(import.meta.url)),
	"..",
	"..",
	"extension",
	"fanout-child.ts",
);
const FAST_MODE_EXTENSION_PATH = path.join(
	path.dirname(fileURLToPath(import.meta.url)),
	"fast-mode-extension.ts",
);
const FAST_MODE_ALLOWED_MODELS = new Set([
	"openai-codex/gpt-5.6-luna",
	"openai-codex/gpt-5.6-sol",
]);
export const SUBAGENT_CHILD_ENV = "PI_SUBAGENT_CHILD";
export const SUBAGENT_ORCHESTRATOR_TARGET_ENV =
	"PI_SUBAGENT_ORCHESTRATOR_TARGET";
export const SUBAGENT_ORCHESTRATOR_SESSION_ID_ENV =
	"PI_SUBAGENT_ORCHESTRATOR_SESSION_ID";
export const SUBAGENT_SUPERVISOR_CHANNEL_DIR_ENV =
	"PI_SUBAGENT_SUPERVISOR_CHANNEL_DIR";
export const SUBAGENT_RUN_ID_ENV = "PI_SUBAGENT_RUN_ID";
export const SUBAGENT_CHILD_AGENT_ENV = "PI_SUBAGENT_CHILD_AGENT";
export const SUBAGENT_CHILD_INDEX_ENV = "PI_SUBAGENT_CHILD_INDEX";
export const SUBAGENT_FANOUT_CHILD_ENV = "PI_SUBAGENT_FANOUT_CHILD";
export const SUBAGENT_PARENT_EVENT_SINK_ENV = "PI_SUBAGENT_PARENT_EVENT_SINK";
export const SUBAGENT_PARENT_CONTROL_INBOX_ENV =
	"PI_SUBAGENT_PARENT_CONTROL_INBOX";
export const SUBAGENT_PARENT_ROOT_RUN_ID_ENV = "PI_SUBAGENT_PARENT_ROOT_RUN_ID";
export const SUBAGENT_PARENT_RUN_ID_ENV = "PI_SUBAGENT_PARENT_RUN_ID";
export const SUBAGENT_PARENT_CHILD_INDEX_ENV = "PI_SUBAGENT_PARENT_CHILD_INDEX";
export const SUBAGENT_PARENT_DEPTH_ENV = "PI_SUBAGENT_PARENT_DEPTH";
export const SUBAGENT_PARENT_PATH_ENV = "PI_SUBAGENT_PARENT_PATH";
export const SUBAGENT_PARENT_CAPABILITY_TOKEN_ENV =
	"PI_SUBAGENT_PARENT_CAPABILITY_TOKEN";
export const SUBAGENT_PARENT_SESSION_ENV = "PI_SUBAGENT_PARENT_SESSION";
export const SUBAGENT_STEER_INBOX_E
```