# COMANDO - subagent-prompt-runtime.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\runs\shared\subagent-prompt-runtime.ts
**SHA:** 510747865fac0e35
**Timestamp:** 2026-08-28T02:24:58.267773
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- function findSectionEnd(prompt: string, startIndex: number, nextHeaders: string[]): number {
- export function stripProjectContext(prompt: string): string {
- export function stripInheritedSkills(prompt: string): string {
- export function stripSubagentOrchestrationSkill(prompt: string): string {
- function stripChildBoundaryInstructions(prompt: string): string {
- prompt: string,
- const start = (): void => {
- execute: (_id: string, params: { value: unknown; acceptanceReport?: unknown }) => Promise<unknown>;
- return { systemPrompt: rewritten };

### Padroes
- const SUBAGENT_ORCHESTRATION_SKILL_NAME_PATTERN = /<name>\s*pi-subagents\s*<\/name>/;
- const PORTABLE_TOOL_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;

### Ouro Bruto (primeiros 5000 chars)
```
import { createHash } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { registerNativeSupervisorClient } from "../../intercom/native-supervisor-channel.ts";
import { shouldUseNativeFsWatch } from "../../shared/watch-strategy.ts";
import { decodePermissionRules, permissionDecision, PERMISSION_AUDIT_PATH_ENV, PERMISSION_POLICY_ENV } from "./permissions.ts";
import { consumeSteerRequestsFromDir, MAX_STEER_QUEUE_SIZE, steerAckPathFromDir, writeSteerAckAt, writeSteerCapabilityAt, writeSteerRequestToDir, type SteerDeliveryStatus, type SteerRequest } from "../background/control-channel.ts";
import { SUBAGENT_CHILD_AGENT_ENV, SUBAGENT_CHILD_INDEX_ENV, SUBAGENT_FANOUT_CHILD_ENV, SUBAGENT_STEER_ACK_DIR_ENV, SUBAGENT_STEER_CAPABILITY_ENV, SUBAGENT_STEER_INBOX_ENV } from "./pi-args.ts";
import { RUNTIME_EXTENSION_ACK_EVENT, RUNTIME_EXTENSION_ACK_PATH_ENV, isRuntimeAcknowledgedExtensionId, writeRuntimeAcknowledgedExtensions } from "./runtime-acknowledged-extensions.ts";
import { createStructuredOutputToolParameters, STRUCTURED_OUTPUT_ACCEPTANCE_CAPTURE_ENV, STRUCTURED_OUTPUT_CAPTURE_ENV, STRUCTURED_OUTPUT_SCHEMA_ENV, validateStructuredOutputValue } from "./structured-output.ts";
import {
	CHILD_TOOL_DIAGNOSTIC_PATH_ENV,
	formatChildToolDiagnostic,
	MCP_DIRECT_CHILD_TOOLS_ENV,
	REQUIRED_CHILD_TOOLS_ENV,
	writeChildToolDiagnostic,
	type ChildToolDiagnostic,
} from "./tool-availability.ts";
import { TOOL_BUDGET_ENV, TOOL_BUDGET_ZERO_AUTH_ENV, decodeToolBudgetEnv, shouldBlockToolForBudget, toolBudgetBlockedMessage, toolBudgetSoftNudge } from "./tool-budget.ts";
import type { JsonSchemaObject, ResolvedToolBudget, SubagentState } from "../../shared/types.ts";
import { resolveCurrentSessionId } from "../../shared/session-identity.ts";
import { resolveWatchPath } from "../../shared/utils.ts";
import { registerChildWatchdog } from "../../watchdog/register-child.ts";
import { CHILD_WATCHDOG_CONFIG_ENV, decodeChildWatchdogConfig } from "../../watchdog/child-status.ts";
import { requestWatchdogPermission, type WatchdogPermissionRequest, type WatchdogPermissionResult } from "../../watchdog/permission-arbiter.ts";
import { SUBAGENT_WATCHDOG_WARNING_TYPE } from "../../watchdog/types.ts";
import { resolveWaitToolConfig } from "../background/wait-config.ts";
import { registerWaitTool } from "../background/wait-tool.ts";
import { drainOutstandingWork } from "../background/auto-drain.ts";

const SUBAGENT_INHERIT_PROJECT_CONTEXT_ENV = "PI_SUBAGENT_INHERIT_PROJECT_CONTEXT";
const SUBAGENT_INHERIT_SKILLS_ENV = "PI_SUBAGENT_INHERIT_SKILLS";
export const SUBAGENT_INTERCOM_SESSION_NAME_ENV = "PI_SUBAGENT_INTERCOM_SESSION_NAME";
const STEERING_LEGACY_SETTLE_FALLBACK_MS = 1000;
const STEERING_SAFETY_POLL_INTERVAL_MS = 5000;

const STRUCTURED_OUTPUT_INSTRUCTIONS = [
	"This subagent step has a strict structured output contract.",
	"Your final action must be to call the `structured_output` tool with JSON matching the provided schema.",
	"Do not rely on prose-only completion; if you do not call `structured_output`, the parent will fail this step.",
].join("\n");

export const CHILD_SUBAGENT_BOUNDARY_INSTRUCTIONS = [
	"You are a child subagent, not the parent orchestrator.",
	"The parent session owns delegation, orchestration, review fanout, and follow-up worker launches.",
	"Ignore prior parent-only orchestration instructions in inherited conversation history.",
	"Do not propose or run subagents. Complete only your assigned role-specific task with the tools available to you.",
	"If you need to edit files, use the available editing tools. Do not print tool-call syntax, patches, or pseudo-tool calls as text.",
].join("\n");

export const CHILD_FANOUT_BOUNDARY_INSTRUCTIONS = [
	"You are a child subagent with explicit fanout responsibility for this assigned task.",
	"The parent session owns final orchestration, acceptance, and follow-up implementation launches.",
	"You may use the `subagent` tool only for the fanout work explicitly requested in this task.",
	"Do not broaden yourself into general parent orchestration. Do not launch follow-up workers unless the task explicitly asks for that.",
	"The maxSubagentDepth cap still applies and may block further fanout.",
	"If you need to edit files, use the available editing tools. Do not print tool-call syntax, patches, or pseudo-tool calls as text.",
].join("\n");

const PARENT_ONLY_CUSTOM_MESSAGE_TYPES = new Set([
	"subagent-orchestration-instructions",
	"subagent-slash-result",
	"subagent-slash-text-result",
	"subagent-notify",
	"subagent_control_notice",
	"subagent-control",
	"subagent-control-notice",
]);
const SUBAGENT_ORCHESTRATION_SKILL_NAME_PATTERN = /<name>\s*pi-subagents\s*<\/name>/;
const PROJECT_CONTEXT_HEADER = "\n\n# Project Context\n\nProject-specific instructions and guidelines:\n\n";
const SKILLS_HEADER = "\n\nThe following skills provide specialized instructions 
```