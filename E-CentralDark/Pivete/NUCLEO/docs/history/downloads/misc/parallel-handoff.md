# OUTRO - parallel-handoff.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\runs\shared\parallel-handoff.ts
**SHA:** 68422bff6163bba7
**Timestamp:** 2026-08-28T02:24:57.887117
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- throw new Error(`Parallel handoff manifest belongs to a different run: ${input.manifestPath}`);

### Gaps
- throw new Error(`Async run '${runId}' required managed worktree cwd is missing: ${requiredCwd}`, { cause: error instanceof Error ? error : undefined });

### Ouro Bruto (primeiros 5000 chars)
```
import * as fs from "node:fs";
import * as path from "node:path";
import { writeAtomicJson } from "../../shared/atomic-json.ts";
import type {
	ParallelHandoffGroup,
	ParallelHandoffManifest,
	ParallelHandoffReference,
	SubagentResultStatus,
} from "../../shared/types.ts";
import type {
	WorktreeCleanupReport,
	WorktreeDiff,
	WorktreeSetup,
	WorktreeCleanupIntent,
} from "./worktree.ts";
import { cleanupWorktrees } from "./worktree.ts";

export interface ParallelHandoffResult {
	agent: string;
	status: SubagentResultStatus;
	summary: string;
	outputPath?: string;
	structuredOutput?: unknown;
	structuredOutputPath?: string;
	sessionPath?: string;
}

function readManifest(manifestPath: string): ParallelHandoffManifest | undefined {
	if (!fs.existsSync(manifestPath)) return undefined;
	const parsed = JSON.parse(fs.readFileSync(manifestPath, "utf-8")) as ParallelHandoffManifest;
	if (parsed.version !== 1 || !Array.isArray(parsed.groups)) {
		throw new Error(`Invalid parallel handoff manifest: ${manifestPath}`);
	}
	return parsed;
}

function resolveExistingPath(candidate: string): string {
	try {
		return fs.realpathSync(candidate);
	} catch {
		return path.resolve(candidate);
	}
}

function pathInside(root: string, candidate: string): boolean {
	const relative = path.relative(root, candidate);
	return relative === "" || (relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative));
}

export function resolveRetainedWorktreeCwd(manifestPath: string, runId: string, childIndex: number): string | undefined {
	const manifest = readManifest(manifestPath);
	if (!manifest) return undefined;
	if (manifest.runId !== runId) throw new Error(`Managed worktree handoff belongs to run '${manifest.runId}', not '${runId}'.`);
	const match = manifest.groups
		.flatMap((group) => group.children.map((child) => ({ group, child })))
		.find(({ child }) => child.index === childIndex);
	if (!match) return undefined;
	const cleanup = match.group.cleanup.tasks.find((task) => task.index === match.child.taskIndex);
	if (!cleanup) throw new Error(`Async run '${runId}' child ${childIndex} has no managed worktree cleanup record.`);
	const relativeCwd = path.relative(resolveExistingPath(match.group.repoRoot), resolveExistingPath(manifest.cwd));
	if (path.isAbsolute(relativeCwd) || relativeCwd === ".." || relativeCwd.startsWith(`..${path.sep}`)) throw new Error(`Async run '${runId}' has an invalid managed worktree cwd.`);
	const requiredCwd = path.join(cleanup.path, relativeCwd);
	if (cleanup.worktreeRemoved || cleanup.branchRemoved) throw new Error(`Async run '${runId}' required managed worktree was removed: ${requiredCwd}`);
	let worktreeRoot = "";
	let resolvedRequiredCwd = "";
	try {
		const rootStat = fs.lstatSync(cleanup.path);
		if (!rootStat.isDirectory() || rootStat.isSymbolicLink()) throw new Error("worktree root is not a directory");
		worktreeRoot = fs.realpathSync(cleanup.path);
		if (!fs.statSync(requiredCwd).isDirectory()) throw new Error("path is not a directory");
		resolvedRequiredCwd = fs.realpathSync(requiredCwd);
	} catch (error) {
		throw new Error(`Async run '${runId}' required managed worktree cwd is missing: ${requiredCwd}`, { cause: error instanceof Error ? error : undefined });
	}
	if (!pathInside(worktreeRoot, resolvedRequiredCwd)) throw new Error(`Async run '${runId}' has an invalid managed worktree cwd.`);
	return requiredCwd;
}

function referenceFor(manifestPath: string, manifest: ParallelHandoffManifest): ParallelHandoffReference {
	const children = manifest.groups.flatMap((group) => group.children);
	return {
		version: 1,
		path: manifestPath,
		groupCount: manifest.groups.length,
		childCount: children.length,
		changedPatches: children.filter((child) => child.patch.changed).length,
		cleanupState: manifest.groups.every((group) => group.cleanup.state === "complete") ? "complete" : "partial",
	};
}

function safeHandoffAgentName(agent: string): string {
	return agent.replace(/[^\w.-]/g, "_");
}

function missingDiff(input: { manifestPath: string; stepIndex: number; taskIndex: number; agent: string; branch?: string }): WorktreeDiff {
	const patchPath = path.join(path.dirname(input.manifestPath), `missing-diff-step-${input.stepIndex}-task-${input.taskIndex}-${safeHandoffAgentName(input.agent)}.patch`);
	try {
		fs.mkdirSync(path.dirname(patchPath), { recursive: true });
		fs.writeFileSync(patchPath, "", "utf-8");
	} catch {
		// Handoff records the artifact failure below; patch creation remains best-effort.
	}
	return {
		index: input.taskIndex,
		agent: input.agent,
		branch: input.branch ?? "",
		diffStat: "",
		filesChanged: 0,
		insertions: 0,
		deletions: 0,
		patchPath,
		error: "diff artifact unavailable; no patch was captured",
	};
}

export function writeParallelHandoffGroup(input: {
	manifestPath: string;
	runId: string;
	mode: "single" | "parallel" | "chain";
	source: "foreground" | "async";
	cwd: string;
	stepIndex: number;
	flatStartIndex: number;
	setup: WorktreeSetup;
```