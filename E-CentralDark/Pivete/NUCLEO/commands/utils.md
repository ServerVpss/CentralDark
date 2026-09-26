# COMANDO - utils.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\core@10.71.0@@@1\build\cjs\tracing\vercel-ai\utils.js
**SHA:** 9312313bdf2ccf06
**Timestamp:** 2026-08-28T02:21:52.176121
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- if (typeof prompt === "string") {
- exports.requestMessagesFromPrompt = requestMessagesFromPrompt;

### Ouro Bruto (primeiros 5000 chars)
```
Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const genAiAttributes = require('../ai/gen-ai-attributes.js');
const utils = require('../ai/utils.js');
const string = require('../../utils/string.js');
const constants = require('./constants.js');
const vercelAiAttributes = require('./vercel-ai-attributes.js');

function accumulateTokensForParent(span, tokenAccumulator) {
  const parentSpanId = span.parent_span_id;
  if (!parentSpanId) {
    return;
  }
  const inputTokens = span.data[genAiAttributes.GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE];
  const outputTokens = span.data[genAiAttributes.GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE];
  if (typeof inputTokens === "number" || typeof outputTokens === "number") {
    const existing = tokenAccumulator.get(parentSpanId) || { inputTokens: 0, outputTokens: 0 };
    if (typeof inputTokens === "number") {
      existing.inputTokens += inputTokens;
    }
    if (typeof outputTokens === "number") {
      existing.outputTokens += outputTokens;
    }
    tokenAccumulator.set(parentSpanId, existing);
  }
}
function applyAccumulatedTokens(spanOrTrace, tokenAccumulator) {
  const accumulated = tokenAccumulator.get(spanOrTrace.span_id);
  if (!accumulated || !spanOrTrace.data) {
    return;
  }
  if (accumulated.inputTokens > 0) {
    spanOrTrace.data[genAiAttributes.GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE] = accumulated.inputTokens;
  }
  if (accumulated.outputTokens > 0) {
    spanOrTrace.data[genAiAttributes.GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE] = accumulated.outputTokens;
  }
  if (accumulated.inputTokens > 0 || accumulated.outputTokens > 0) {
    spanOrTrace.data["gen_ai.usage.total_tokens"] = accumulated.inputTokens + accumulated.outputTokens;
  }
}
function buildToolDescriptionMap(spans) {
  const toolDescriptions = /* @__PURE__ */ new Map();
  for (const span of spans) {
    const availableTools = span.data[genAiAttributes.GEN_AI_REQUEST_AVAILABLE_TOOLS_ATTRIBUTE];
    if (typeof availableTools !== "string") {
      continue;
    }
    try {
      const tools = JSON.parse(availableTools);
      for (const tool of tools) {
        if (tool.name && tool.description && !toolDescriptions.has(tool.name)) {
          toolDescriptions.set(tool.name, tool.description);
        }
      }
    } catch {
    }
  }
  return toolDescriptions;
}
function applyToolDescriptionsAndTokens(spans, tokenAccumulator) {
  const toolDescriptions = buildToolDescriptionMap(spans);
  for (const span of spans) {
    if (span.op === "gen_ai.execute_tool") {
      const toolName = span.data[genAiAttributes.GEN_AI_TOOL_NAME_ATTRIBUTE];
      if (typeof toolName === "string") {
        const description = toolDescriptions.get(toolName);
        if (description) {
          span.data[genAiAttributes.GEN_AI_TOOL_DESCRIPTION_ATTRIBUTE] = description;
        }
      }
    }
    if (span.op === "gen_ai.invoke_agent") {
      applyAccumulatedTokens(span, tokenAccumulator);
    }
  }
}
function _INTERNAL_getSpanContextForToolCallId(toolCallId) {
  return constants.toolCallSpanContextMap.get(toolCallId);
}
function _INTERNAL_cleanupToolCallSpanContext(toolCallId) {
  constants.toolCallSpanContextMap.delete(toolCallId);
}
function convertAvailableToolsToJsonString(tools) {
  const toolObjects = tools.map((tool) => {
    if (typeof tool === "string") {
      try {
        return JSON.parse(tool);
      } catch {
        return tool;
      }
    }
    return tool;
  });
  return JSON.stringify(toolObjects);
}
function filterMessagesArray(input) {
  return input.filter(
    (m) => !!m && typeof m === "object" && "role" in m && "content" in m
  );
}
function convertUserInputToMessagesFormat(userInput) {
  try {
    const p = JSON.parse(userInput);
    if (!!p && typeof p === "object") {
      let { messages } = p;
      const { prompt, system } = p;
      const result = [];
      if (typeof system === "string") {
        result.push({ role: "system", content: system });
      }
      if (typeof messages === "string") {
        try {
          messages = JSON.parse(messages);
        } catch {
        }
      }
      if (Array.isArray(messages)) {
        result.push(...filterMessagesArray(messages));
        return result;
      }
      if (Array.isArray(prompt)) {
        result.push(...filterMessagesArray(prompt));
        return result;
      }
      if (typeof prompt === "string") {
        result.push({ role: "user", content: prompt });
      }
      if (result.length > 0) {
        return result;
      }
    }
  } catch {
  }
  return [];
}
function requestMessagesFromPrompt(span, attributes, enableTruncation) {
  if (typeof attributes[vercelAiAttributes.AI_PROMPT_ATTRIBUTE] === "string" && !attributes[genAiAttributes.GEN_AI_INPUT_MESSAGES_ATTRIBUTE] && !attributes[vercelAiAttributes.AI_PROMPT_MESSAGES_ATTRIBUTE]) {
    const userInput = attributes[vercelAiAttributes.AI_PROMPT_ATTRIBUTE];
    const messages = convertUserInputToMessagesFormat(userInput);
    if (messages.length) {
      const { s
```

---

# COMANDO - utils.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\core@10.71.0@@@1\build\esm\tracing\vercel-ai\utils.js
**SHA:** 510ccf7a9557c6d7
**Timestamp:** 2026-08-28T02:22:06.369793
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- if (typeof prompt === "string") {

### Ouro Bruto (primeiros 5000 chars)
```
import { GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE, GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE, GEN_AI_TOOL_NAME_ATTRIBUTE, GEN_AI_TOOL_DESCRIPTION_ATTRIBUTE, GEN_AI_INPUT_MESSAGES_ATTRIBUTE, GEN_AI_SYSTEM_INSTRUCTIONS_ATTRIBUTE, GEN_AI_INPUT_MESSAGES_ORIGINAL_LENGTH_ATTRIBUTE, GEN_AI_REQUEST_AVAILABLE_TOOLS_ATTRIBUTE } from '../ai/gen-ai-attributes.js';
import { extractSystemInstructions, getTruncatedJsonString } from '../ai/utils.js';
import { stringify } from '../../utils/string.js';
import { toolCallSpanContextMap } from './constants.js';
import { AI_PROMPT_ATTRIBUTE, AI_PROMPT_MESSAGES_ATTRIBUTE } from './vercel-ai-attributes.js';

function accumulateTokensForParent(span, tokenAccumulator) {
  const parentSpanId = span.parent_span_id;
  if (!parentSpanId) {
    return;
  }
  const inputTokens = span.data[GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE];
  const outputTokens = span.data[GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE];
  if (typeof inputTokens === "number" || typeof outputTokens === "number") {
    const existing = tokenAccumulator.get(parentSpanId) || { inputTokens: 0, outputTokens: 0 };
    if (typeof inputTokens === "number") {
      existing.inputTokens += inputTokens;
    }
    if (typeof outputTokens === "number") {
      existing.outputTokens += outputTokens;
    }
    tokenAccumulator.set(parentSpanId, existing);
  }
}
function applyAccumulatedTokens(spanOrTrace, tokenAccumulator) {
  const accumulated = tokenAccumulator.get(spanOrTrace.span_id);
  if (!accumulated || !spanOrTrace.data) {
    return;
  }
  if (accumulated.inputTokens > 0) {
    spanOrTrace.data[GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE] = accumulated.inputTokens;
  }
  if (accumulated.outputTokens > 0) {
    spanOrTrace.data[GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE] = accumulated.outputTokens;
  }
  if (accumulated.inputTokens > 0 || accumulated.outputTokens > 0) {
    spanOrTrace.data["gen_ai.usage.total_tokens"] = accumulated.inputTokens + accumulated.outputTokens;
  }
}
function buildToolDescriptionMap(spans) {
  const toolDescriptions = /* @__PURE__ */ new Map();
  for (const span of spans) {
    const availableTools = span.data[GEN_AI_REQUEST_AVAILABLE_TOOLS_ATTRIBUTE];
    if (typeof availableTools !== "string") {
      continue;
    }
    try {
      const tools = JSON.parse(availableTools);
      for (const tool of tools) {
        if (tool.name && tool.description && !toolDescriptions.has(tool.name)) {
          toolDescriptions.set(tool.name, tool.description);
        }
      }
    } catch {
    }
  }
  return toolDescriptions;
}
function applyToolDescriptionsAndTokens(spans, tokenAccumulator) {
  const toolDescriptions = buildToolDescriptionMap(spans);
  for (const span of spans) {
    if (span.op === "gen_ai.execute_tool") {
      const toolName = span.data[GEN_AI_TOOL_NAME_ATTRIBUTE];
      if (typeof toolName === "string") {
        const description = toolDescriptions.get(toolName);
        if (description) {
          span.data[GEN_AI_TOOL_DESCRIPTION_ATTRIBUTE] = description;
        }
      }
    }
    if (span.op === "gen_ai.invoke_agent") {
      applyAccumulatedTokens(span, tokenAccumulator);
    }
  }
}
function _INTERNAL_getSpanContextForToolCallId(toolCallId) {
  return toolCallSpanContextMap.get(toolCallId);
}
function _INTERNAL_cleanupToolCallSpanContext(toolCallId) {
  toolCallSpanContextMap.delete(toolCallId);
}
function convertAvailableToolsToJsonString(tools) {
  const toolObjects = tools.map((tool) => {
    if (typeof tool === "string") {
      try {
        return JSON.parse(tool);
      } catch {
        return tool;
      }
    }
    return tool;
  });
  return JSON.stringify(toolObjects);
}
function filterMessagesArray(input) {
  return input.filter(
    (m) => !!m && typeof m === "object" && "role" in m && "content" in m
  );
}
function convertUserInputToMessagesFormat(userInput) {
  try {
    const p = JSON.parse(userInput);
    if (!!p && typeof p === "object") {
      let { messages } = p;
      const { prompt, system } = p;
      const result = [];
      if (typeof system === "string") {
        result.push({ role: "system", content: system });
      }
      if (typeof messages === "string") {
        try {
          messages = JSON.parse(messages);
        } catch {
        }
      }
      if (Array.isArray(messages)) {
        result.push(...filterMessagesArray(messages));
        return result;
      }
      if (Array.isArray(prompt)) {
        result.push(...filterMessagesArray(prompt));
        return result;
      }
      if (typeof prompt === "string") {
        result.push({ role: "user", content: prompt });
      }
      if (result.length > 0) {
        return result;
      }
    }
  } catch {
  }
  return [];
}
function requestMessagesFromPrompt(span, attributes, enableTruncation) {
  if (typeof attributes[AI_PROMPT_ATTRIBUTE] === "string" && !attributes[GEN_AI_INPUT_MESSAGES_ATTRIBUTE] && !attributes[AI_PROMPT_MESSAGES_ATTRIBUTE]) {
    const userInput = attributes[AI_PROMPT_ATTRIBUTE];
    const messages
```

---

# COMANDO - utils.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\shared\utils.ts
**SHA:** 77884a7dd863bb6e
**Timestamp:** 2026-08-28T02:24:59.369330
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const start = Math.max(0, stat.size - tailBytes);
- function writePrompt(agent: string, prompt: string): { dir: string; path: string } {
- const scanStart = lastAssistantTextIndex >= 0 ? lastAssistantTextIndex + 1 : 0;
- if (typeof args.prompt === "string" && args.prompt.trim().length > 0) return previewDisplayText(args.prompt, 60);

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * General utility functions for the subagent extension
 */

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import type { Message } from "@earendil-works/pi-ai";
import { previewDisplayText, sanitizeDisplayText, truncateDisplayText } from "./display-text.ts";
import { formatToolCall } from "./formatters.ts";
import type { AgentProgress, AsyncStatus, Details, DisplayItem, ErrorInfo, NestedRunSummary, SingleResult, ToolCallSummary, Usage } from "./types.ts";

// ============================================================================
// File System Utilities
// ============================================================================

const DEFAULT_CONFIG_DIR_NAME = ".pi";
const PI_CODING_AGENT_PACKAGE_NAME = "@earendil-works/pi-coding-agent";
export const PI_CODING_AGENT_PACKAGE_ROOT_ENV = "PI_SUBAGENTS_PI_CODING_AGENT_PACKAGE_ROOT";
export const PROMPT_REDACTED = "[prompt redacted]";

export function resolveWatchPath(
	watchPath: string,
	nativeRealpath: (filePath: string) => string = fs.realpathSync.native,
): string {
	// libuv's Windows watcher cannot mix 8.3 registration paths with long event paths.
	try {
		return nativeRealpath(watchPath);
	} catch {
		return watchPath;
	}
}

function validConfigDirName(value: unknown): string | undefined {
	return typeof value === "string" && value.trim() ? value : undefined;
}

function readConfigDirNameFromPackageRoot(packageRoot: string | undefined): string | undefined {
	if (!packageRoot) return undefined;
	try {
		const pkg = JSON.parse(fs.readFileSync(path.join(packageRoot, "package.json"), "utf-8")) as {
			name?: unknown;
			piConfig?: { configDir?: unknown };
		};
		if (pkg.name !== PI_CODING_AGENT_PACKAGE_NAME) return undefined;
		return validConfigDirName(pkg.piConfig?.configDir);
	} catch {
		return undefined;
	}
}

function resolveConfigDirNameFromPackageJson(entryPoint = process.argv[1], packageRoot = process.env[PI_CODING_AGENT_PACKAGE_ROOT_ENV]): string | undefined {
	const packageRootValue = readConfigDirNameFromPackageRoot(packageRoot);
	if (packageRootValue) return packageRootValue;
	if (!entryPoint) return undefined;
	try {
		let dir = path.dirname(fs.realpathSync(entryPoint));
		while (dir !== path.dirname(dir)) {
			const value = readConfigDirNameFromPackageRoot(dir);
			if (value) return value;
			dir = path.dirname(dir);
		}
	} catch {
		// Package metadata lookup is best-effort; detached runners must not fail here.
	}
	return undefined;
}

export function resolveConfigDirName(codingAgentModule?: unknown, entryPoint?: string, packageRoot?: string): string {
	const moduleValue = codingAgentModule && typeof codingAgentModule === "object"
		? validConfigDirName((codingAgentModule as { CONFIG_DIR_NAME?: unknown }).CONFIG_DIR_NAME)
		: undefined;
	return moduleValue
		?? resolveConfigDirNameFromPackageJson(entryPoint, packageRoot)
		?? DEFAULT_CONFIG_DIR_NAME;
}

let cachedConfigDirName: { entryPoint: string | undefined; packageRoot: string | undefined; value: string } | undefined;

export function getConfigDirName(): string {
	const entryPoint = process.argv[1];
	const packageRoot = process.env[PI_CODING_AGENT_PACKAGE_ROOT_ENV];
	if (cachedConfigDirName
		&& cachedConfigDirName.entryPoint === entryPoint
		&& cachedConfigDirName.packageRoot === packageRoot) {
		return cachedConfigDirName.value;
	}
	const value = resolveConfigDirName(undefined, entryPoint, packageRoot);
	cachedConfigDirName = { entryPoint, packageRoot, value };
	return value;
}

export function getProjectConfigDir(projectRoot: string): string {
	return path.join(projectRoot, getConfigDirName());
}

export function getAgentDir(): string {
	const configured = process.env.PI_CODING_AGENT_DIR;
	if (configured === "~") return os.homedir();
	if (configured?.startsWith("~/")) return path.join(os.homedir(), configured.slice(2));
	return configured || path.join(os.homedir(), getConfigDirName(), "agent");
}

const statusCache = new Map<string, { mtime: number; ctime: number; size: number; ino: number; status: AsyncStatus }>();
const MAX_STATUS_CACHE_ENTRIES = 512;

export function pruneStatusCacheForAsyncRoot(asyncDirRoot: string, runIds: Iterable<string>): number {
	const root = path.resolve(asyncDirRoot);
	const currentStatusPaths = new Set(
		Array.from(runIds, (runId) => path.resolve(root, runId, "status.json")),
	);
	let removed = 0;
	for (const statusPath of statusCache.keys()) {
		const resolved = path.resolve(statusPath);
		const relative = path.relative(root, resolved);
		if (relative && !relative.startsWith("..") && !path.isAbsolute(relative) && !currentStatusPaths.has(resolved)) {
			statusCache.delete(statusPath);
			removed++;
		}
	}
	return removed;
}

function getErrorMessage(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}

export function resolveChildCwd(baseCwd: string, childCwd: string | undefined): string {
	if (!childCwd) return baseCwd;
	return path.isAbsolute(childCwd
```