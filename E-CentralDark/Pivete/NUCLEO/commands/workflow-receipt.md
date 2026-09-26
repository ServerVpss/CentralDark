# COMANDO - workflow-receipt.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\workflows\workflow-receipt.ts
**SHA:** d8776bd6ebf7e828
**Timestamp:** 2026-08-28T02:25:00.297706
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- const KEY_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;

### Ouro Bruto (primeiros 5000 chars)
```
import * as fs from "node:fs";
import * as path from "node:path";
import { writePrivateAtomicJson } from "../shared/atomic-json.ts";
import type { ExternalCliReceiptMetadata, WorkflowReceipt, WorkflowReceiptEntry, WorkflowReceiptState } from "../shared/types.ts";
import type { WorkflowReceiptResumeReference, WorkflowScriptChildResult } from "./scripted-workflow.ts";
import { parseWorkflowChildSummary } from "./workflow-child-summary.ts";

export type { WorkflowReceipt, WorkflowReceiptEntry, WorkflowReceiptState } from "../shared/types.ts";

export const WORKFLOW_RECEIPT_VERSION = 1;
export const WORKFLOW_RECEIPT_FILE = "workflow-receipt.json";

const KEY_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;

function assertSafeRunId(value: string, label: string): string {
	const normalized = value.trim();
	if (!normalized || path.basename(normalized) !== normalized || normalized === "." || normalized === "..") {
		throw new Error(`${label} must be an exact workflow run id, not a path or prefix.`);
	}
	return normalized;
}

function assertKey(value: string, label: string): string {
	if (!KEY_PATTERN.test(value)) throw new Error(`${label} is invalid.`);
	return value;
}

export function workflowReceiptPath(asyncDirRoot: string, workflowRunId: string): string {
	return path.join(asyncDirRoot, assertSafeRunId(workflowRunId, "workflowRunId"), WORKFLOW_RECEIPT_FILE);
}

export function buildWorkflowReceipt(input: {
	workflowRunId: string;
	state: WorkflowReceiptState;
	children: WorkflowScriptChildResult[];
	workflowChildren?: WorkflowReceipt["workflowChildren"];
	createdAt?: number;
}): WorkflowReceipt {
	const workflowRunId = assertSafeRunId(input.workflowRunId, "workflowRunId");
	if (input.workflowChildren?.workflowRunId !== undefined && input.workflowChildren.workflowRunId !== workflowRunId) throw new Error("workflowChildren workflowRunId does not match its receipt.");
	const entries: Record<string, WorkflowReceiptEntry> = Object.create(null) as Record<string, WorkflowReceiptEntry>;
	for (const child of input.children) {
		const key = assertKey(child.key, "workflow receipt child key");
		if (entries[key]) throw new Error(`Workflow receipt has duplicate child key '${key}'.`);
		const runIds = [...new Set((child.continuation?.runIds ?? (child.runId ? [child.runId] : [])).filter((runId) => typeof runId === "string" && runId.trim()).map((runId) => runId.trim()))];
		const latestRunId = runIds.at(-1);
		const resumability = child.resumability ?? { state: "not-resumable", reason: child.runId ? "resumability was not recorded" : "child produced no run id" };
		if (resumability.state === "resumable" && !latestRunId) throw new Error(`Workflow receipt child '${key}' is resumable but has no retained run id.`);
		const base = {
			key,
			...(child.agent ? { agent: child.agent } : {}),
			...(child.requestedContext ? { requestedContext: child.requestedContext } : {}),
			...(child.resolvedContext ? { resolvedContext: child.resolvedContext } : {}),
			...(child.outputReference ? { outputReference: child.outputReference } : {}),
			...(child.externalAdapter ? { externalAdapter: child.externalAdapter } : {}),
			continuation: { runIds },
		};
		entries[key] = resumability.state === "resumable"
			? { ...base, latestRunId: latestRunId!, resumability }
			: { ...base, ...(latestRunId ? { latestRunId } : {}), resumability };
	}
	return { version: WORKFLOW_RECEIPT_VERSION, workflowRunId, state: input.state, createdAt: input.createdAt ?? Date.now(), entries, ...(input.workflowChildren ? { workflowChildren: input.workflowChildren } : {}) };
}

export function writeWorkflowReceipt(asyncDir: string, receipt: WorkflowReceipt): string {
	const receiptPath = path.join(asyncDir, WORKFLOW_RECEIPT_FILE);
	writePrivateAtomicJson(receiptPath, receipt);
	return receiptPath;
}

const EXTERNAL_CLI_CAPABILITIES = {
	stop: true,
	steer: false,
	resume: false,
	structuredOutput: false,
	toolEvents: false,
	supervisor: "unsupported",
	forkContext: false,
	extensionBindings: false,
} as const;

function parseExternalCliReceiptMetadata(value: unknown, key: string, source: string): ExternalCliReceiptMetadata | undefined {
	if (value === undefined) return undefined;
	const label = `Invalid workflow receipt '${source}': entry '${key}' externalAdapter`;
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be an object.`);
	const metadata = value as Record<string, unknown>;
	const unknownMetadata = Object.keys(metadata).filter((field) => !["adapter", "capabilities", "safety", "outputArtifacts", "handoff", "supervisor", "nonResumableReason"].includes(field));
	if (unknownMetadata.length > 0) throw new Error(`${label} has unsupported fields: ${unknownMetadata.join(", ")}.`);
	const adapter = metadata.adapter;
	if (!adapter || typeof adapter !== "object" || Array.isArray(adapter)) throw new Error(`${label}.adapter must be an object.`);
	const adapterRecord = adapter as Record<string, unknown>;
	const unknownAdapter = Ob
```