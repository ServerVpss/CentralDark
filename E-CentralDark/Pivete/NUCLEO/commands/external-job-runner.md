# COMANDO - external-job-runner.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\runs\shared\external-job-runner.ts
**SHA:** 1978d02e0cb7a727
**Timestamp:** 2026-08-28T02:24:57.708630
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- export function externalJobPromptDigest(prompt: string): string {
- prompt: string;
- prompt: input.prompt,
- start: {
- prompt: input.prompt,

### Ouro Bruto (primeiros 5000 chars)
```
import { createHash } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import { ExternalJobProviderError, type ExternalJobHandle, type ExternalJobResult, type ExternalJobState } from "../../api/external-job-provider.ts";
import type { ExternalJobStatus } from "../../shared/types.ts";
import { requestExternalJobOperation } from "./external-job-bridge.ts";

const STATUS_POLL_INTERVAL_MS = 1_000;

export interface ExternalJobRunResult {
	output: string;
	exitCode: number;
	error?: string;
	timedOut?: boolean;
	stopped?: boolean;
	externalJob: ExternalJobStatus;
}

export function externalJobPromptDigest(prompt: string): string {
	return createHash("sha256").update(prompt).digest("hex");
}

export function externalJobStableJson(value: unknown): string {
	if (value === null || typeof value !== "object") return JSON.stringify(value);
	if (Array.isArray(value)) return `[${value.map(externalJobStableJson).join(",")}]`;
	const record = value as Record<string, unknown>;
	return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${externalJobStableJson(record[key])}`).join(",")}}`;
}

export function externalJobFollowUpRequestDigest(input: { provider: string; parentProviderJobId: string; promptDigest: string; options: Record<string, unknown> }): string {
	return createHash("sha256")
		.update(externalJobStableJson({ provider: input.provider, parentProviderJobId: input.parentProviderJobId, promptDigest: input.promptDigest, options: input.options }))
		.digest("hex");
}

export function externalJobFollowUpRequestId(requestDigest: string): string {
	return `follow-up-${requestDigest.slice(0, 48)}`;
}

export function externalJobFollowUpRunId(requestDigest: string): string {
	const hex = requestDigest.padEnd(32, "0").slice(0, 32).split("");
	hex[12] = "4";
	hex[16] = ((Number.parseInt(hex[16]!, 16) & 0x3) | 0x8).toString(16);
	const value = hex.join("");
	return `${value.slice(0, 8)}-${value.slice(8, 12)}-${value.slice(12, 16)}-${value.slice(16, 20)}-${value.slice(20, 32)}`;
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function terminal(state: ExternalJobState): boolean {
	return state === "completed" || state === "failed" || state === "stopped" || state === "blocked";
}

function formatError(error: ExternalJobProviderError, provider: string): string {
	const blocking = error.blockingJobId ? ` Blocking provider job: ${error.blockingJobId}.` : "";
	return `External-job provider '${provider}' failed closed (${error.code}): ${error.message}.${blocking}`;
}

function isNotFound(error: unknown): boolean {
	return typeof error === "object" && error !== null && "code" in error && (error as NodeJS.ErrnoException).code === "ENOENT";
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function malformedStatus(statusPath: string): ExternalJobProviderError {
	return new ExternalJobProviderError(`Malformed external-job status '${statusPath}'. Refusing to redispatch the prompt.`, { code: "status-unreadable" });
}

function parseExternalJobStatus(value: unknown, statusPath: string): ExternalJobStatus {
	if (!isRecord(value)) throw malformedStatus(statusPath);
	const provider = value.provider;
	const promptDigest = value.promptDigest;
	const state = value.state;
	if (typeof provider !== "string" || provider.length === 0) throw malformedStatus(statusPath);
	if (typeof promptDigest !== "string" || promptDigest.length === 0) throw malformedStatus(statusPath);
	if (state !== "queued" && state !== "running" && state !== "completed" && state !== "failed" && state !== "stopped" && state !== "blocked") throw malformedStatus(statusPath);
	if (value.options !== undefined && !isRecord(value.options)) throw malformedStatus(statusPath);
	const providerJobId = value.providerJobId;
	const handleUrl = value.handleUrl;
	const conversationUrl = value.conversationUrl;
	const resultArtifactPath = value.resultArtifactPath;
	const failureCode = value.failureCode;
	const failureMessage = value.failureMessage;
	const blockingJobId = value.blockingJobId;
	const startedAt = value.startedAt;
	const updatedAt = value.updatedAt;
	if (providerJobId !== undefined && (typeof providerJobId !== "string" || providerJobId.length === 0)) throw malformedStatus(statusPath);
	if (handleUrl !== undefined && typeof handleUrl !== "string") throw malformedStatus(statusPath);
	if (conversationUrl !== undefined && typeof conversationUrl !== "string") throw malformedStatus(statusPath);
	if (resultArtifactPath !== undefined && typeof resultArtifactPath !== "string") throw malformedStatus(statusPath);
	if (failureCode !== undefined && typeof failureCode !== "string") throw malformedStatus(statusPath);
	if (failureMessage !== undefined && typeof failureMessage !== "string") throw malformedStatus(statusPath);
	if (blockingJobId !== undefined && typeof blockingJobId !== "s
```