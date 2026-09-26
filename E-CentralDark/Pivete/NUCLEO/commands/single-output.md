# COMANDO - single-output.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\runs\shared\single-output.ts
**SHA:** b1060085f217b7d0
**Timestamp:** 2026-08-28T02:24:58.099973
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- export function injectOutputPathSystemPrompt(systemPrompt: string, outputPath: string | undefined, capabilities?: OutputInstructionCapabilities): string {
- beforeRun: SingleOutputSnapshot | undefined,
- let changedSinceStart = false;
- changedSinceStart = !beforeRun?.exists

### Ouro Bruto (primeiros 5000 chars)
```
import * as fs from "node:fs";
import * as path from "node:path";
import type { Message } from "@earendil-works/pi-ai";
import type { OutputMode, SavedOutputReference } from "../../shared/types.ts";
import { hasMutationToolCapability } from "./completion-guard.ts";

export interface SingleOutputSnapshot {
	exists: boolean;
	mtimeMs?: number;
	size?: number;
}

/**
 * Content the child itself sent to the configured output path, taken from its
 * last `write` tool call whose tool result reports success. Unlike reading the
 * path from disk, this cannot be polluted by a sibling run writing the same
 * path (#420); requiring the successful tool result keeps failed, cancelled,
 * or unanswered write calls from counting as authored output. Returns
 * undefined when no such write exists (e.g. bash or edit-based construction),
 * in which case callers must not assume file authorship.
 */
export function extractChildWrittenOutput(
	messages: Message[] | undefined,
	outputPath: string | undefined,
	cwd?: string,
): string | undefined {
	if (!messages?.length || !outputPath) return undefined;
	const resolvedTarget = path.resolve(cwd ?? ".", outputPath);
	const comparableTarget = process.platform === "win32" ? resolvedTarget.toLowerCase() : resolvedTarget;
	const successfulCallIds = new Set<string>();
	for (const message of messages) {
		if (message.role === "toolResult" && message.isError === false && typeof message.toolCallId === "string") {
			successfulCallIds.add(message.toolCallId);
		}
	}
	let content: string | undefined;
	for (const message of messages) {
		if (message.role !== "assistant") continue;
		for (const part of message.content) {
			if (part.type !== "toolCall" || part.name !== "write" || !successfulCallIds.has(part.id)) continue;
			const args = typeof part.arguments === "object" && part.arguments !== null && !Array.isArray(part.arguments)
				? part.arguments as Record<string, unknown>
				: {};
			if (typeof args.path !== "string" || typeof args.content !== "string") continue;
			const resolvedWritePath = path.resolve(cwd ?? ".", args.path);
			const comparableWritePath = process.platform === "win32" ? resolvedWritePath.toLowerCase() : resolvedWritePath;
			if (comparableWritePath !== comparableTarget) continue;
			content = args.content;
		}
	}
	return content;
}

export function normalizeSingleOutputOverride(
	output: string | boolean | undefined,
	defaultOutput: string | undefined,
): string | false | undefined {
	if (output === false || output === "false") return false;
	if (output === true || output === "true") return defaultOutput;
	if (typeof output === "string" && output.length > 0) return output;
	return undefined;
}

export function resolveSingleOutputPath(
	output: string | boolean | undefined,
	runtimeCwd: string,
	requestedCwd?: string,
	relativeBaseDir?: string,
): string | undefined {
	if (typeof output !== "string" || !output || output === "false" || output === "true") return undefined;
	if (path.isAbsolute(output)) return output;
	if (relativeBaseDir) return path.resolve(relativeBaseDir, output);
	const baseCwd = requestedCwd
		? (path.isAbsolute(requestedCwd) ? requestedCwd : path.resolve(runtimeCwd, requestedCwd))
		: runtimeCwd;
	return path.resolve(baseCwd, output);
}

interface OutputInstructionCapabilities {
	tools?: string[];
	mcpDirectTools?: string[];
}

function formatOutputPathInstruction(outputPath: string, capabilities?: OutputInstructionCapabilities): string {
	const delivery = !capabilities || hasMutationToolCapability(capabilities.tools, capabilities.mcpDirectTools)
		? `Write your findings to exactly this path: ${outputPath}`
		: [
			"Return the complete artifact in your final response.",
			`The runtime will persist it to exactly this path: ${outputPath}`,
			"Do not call contact_supervisor merely because no write-capable tool is available.",
		].join("\n");
	return [
		delivery,
		"This path is authoritative for this run.",
		"Ignore any other output filename or output path mentioned elsewhere, including output destinations in the base agent prompt, system prompt, or task instructions.",
	].join("\n");
}

export function injectSingleOutputInstruction(task: string, outputPath: string | undefined, capabilities?: OutputInstructionCapabilities): string {
	if (!outputPath) return task;
	return `${task}\n\n---\n**Output:**\n${formatOutputPathInstruction(outputPath, capabilities)}`;
}

export function injectOutputPathSystemPrompt(systemPrompt: string, outputPath: string | undefined, capabilities?: OutputInstructionCapabilities): string {
	if (!outputPath) return systemPrompt;
	const instruction = `Runtime output path override:\n${formatOutputPathInstruction(outputPath, capabilities)}`;
	return systemPrompt ? `${systemPrompt}\n\n${instruction}` : instruction;
}

function countLines(text: string): number {
	if (!text) return 0;
	const newlineMatches = text.match(/\r\n|\r|\n/g);
	return (newlineMatches?.length ?? 0) + (/[\r\n]$/.test(text) ? 0 : 1);
}

function formatByte
```