# MISSAO - doctor.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\extension\doctor.ts
**SHA:** 469af277db5e4c26
**Timestamp:** 2026-08-28T02:24:52.032681
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- return [`- usage: ${formatRunFanoutBudget(getRunFanoutBudgetSnapshot(inherited)).replace(/^Run fan-out: /, "")}`, `- root run: ${inherited.rootRunId}`, "- reset boundary: cumulative claims are never r

### Ouro Bruto (primeiros 5000 chars)
```
import * as fs from "node:fs";
import * as path from "node:path";
import { discoverAgentsAll, type AgentSource } from "../agents/agents.ts";
import { isAsyncAvailable } from "../runs/background/async-execution.ts";
import { formatSpawnBudgetSummary, getSpawnBudgetSnapshot } from "../runs/shared/spawn-budget.ts";
import { getActiveAsyncCapacitySnapshot, resolveAbandonedSlotReleaseAfterMs, resolveMaxActiveAsyncRunsPerSession } from "../runs/background/active-async-capacity.ts";
import { decodeRunFanoutBudgetDescriptor, formatRunFanoutBudget, getRunFanoutBudgetSnapshot, RUN_FANOUT_BUDGET_ENV } from "../runs/shared/run-fanout-budget.ts";
import { diagnoseIntercomBridge, type IntercomBridgeDiagnostic } from "../intercom/intercom-bridge.ts";
import { discoverAvailableSkills, type SkillSource } from "../agents/skills.ts";
import {
	DIRS,
	CHAIN_RUNS_DIR,
	TEMP_ROOT_DIR,
	type ExtensionConfig,
	type SubagentState,
	normalizeMaxSubagentSpawnsPerRun,
	resolveMaxSubagentSpawnsPerRun,
} from "../shared/types.ts";

interface DoctorPaths {
	tempRootDir: string;
	asyncDir: string;
	resultsDir: string;
	chainRunsDir: string;
}

interface DoctorDeps {
	isAsyncAvailable: () => boolean;
	discoverAgentsAll: typeof discoverAgentsAll;
	discoverAvailableSkills: typeof discoverAvailableSkills;
	diagnoseIntercomBridge: typeof diagnoseIntercomBridge;
}

interface DoctorReportInput {
	cwd: string;
	config: ExtensionConfig;
	state: SubagentState;
	context?: "fresh" | "fork";
	requestedSessionDir?: string;
	currentSessionFile?: string | null;
	currentSessionId?: string | null;
	orchestratorTarget?: string;
	sessionError?: string;
	expandTilde?: (value: string) => string;
	paths?: DoctorPaths;
	deps?: Partial<DoctorDeps>;
}

function defaultPaths(): DoctorPaths {
	return {
		tempRootDir: TEMP_ROOT_DIR,
		asyncDir: DIRS.async,
		resultsDir: DIRS.results,
		chainRunsDir: CHAIN_RUNS_DIR,
	};
}

const DEFAULT_DEPS: DoctorDeps = {
	isAsyncAvailable,
	discoverAgentsAll,
	discoverAvailableSkills,
	diagnoseIntercomBridge,
};

function errorText(error: unknown): string {
	return error instanceof Error ? `${error.name}: ${error.message}` : String(error);
}

function lineFromCheck(label: string, check: () => string): string {
	try {
		return check();
	} catch (error) {
		return `- ${label}: failed — ${errorText(error)}`;
	}
}

function formatExistingDirectory(label: string, dirPath: string): string {
	try {
		if (!fs.existsSync(dirPath)) return `- ${label}: missing (${dirPath})`;
		const stats = fs.statSync(dirPath);
		if (!stats.isDirectory()) throw new Error(`not a directory: ${dirPath}`);
		fs.accessSync(dirPath, fs.constants.R_OK | fs.constants.W_OK);
		return `- ${label}: ok (${dirPath})`;
	} catch (error) {
		return `- ${label}: failed (${dirPath}) — ${errorText(error)}`;
	}
}

function formatSourceCounts(counts: Record<AgentSource, number>): string {
	return `builtin ${counts.builtin}, package ${counts.package}, user ${counts.user}, project ${counts.project}`;
}

function formatSkillSourceCounts(skills: Array<{ source: SkillSource }>): string {
	const counts = new Map<SkillSource, number>();
	for (const skill of skills) counts.set(skill.source, (counts.get(skill.source) ?? 0) + 1);
	const ordered: SkillSource[] = [
		"project",
		"project-settings",
		"project-package",
		"user",
		"user-settings",
		"user-package",
		"extension",
		"builtin",
		"unknown",
	];
	const parts = ordered
		.map((source) => `${source} ${counts.get(source) ?? 0}`)
		.filter((part) => !part.endsWith(" 0"));
	return parts.length > 0 ? parts.join(", ") : "none";
}

function formatConfiguredSessionDir(input: DoctorReportInput): string {
	if (input.requestedSessionDir) {
		return path.resolve(input.expandTilde?.(input.requestedSessionDir) ?? input.requestedSessionDir);
	}
	if (input.config.defaultSessionDir) {
		return path.resolve(input.expandTilde?.(input.config.defaultSessionDir) ?? input.config.defaultSessionDir);
	}
	return "not configured";
}

function formatSessionLines(input: DoctorReportInput): string[] {
	const sessionFile = input.currentSessionFile ?? null;
	const lines = [
		lineFromCheck("configured session dir", () => `- configured session dir: ${formatConfiguredSessionDir(input)}`),
		`- current session file: ${sessionFile ?? "not available"}`,
		`- current session dir: ${sessionFile ? path.dirname(sessionFile) : "not available"}`,
		`- current session id: ${input.currentSessionId ?? input.state.currentSessionId ?? "not available"}`,
	];
	if (input.sessionError) lines.push(`- session manager: failed — ${input.sessionError}`);
	return lines;
}

function formatDiscovery(input: DoctorReportInput, deps: DoctorDeps): string[] {
	return [
		lineFromCheck("agents", () => {
			const discovered = deps.discoverAgentsAll(input.cwd);
			const agentCounts = {
				builtin: discovered.builtin.length,
				package: discovered.package?.length ?? 0,
				user: discovered.user.length,
				project: discovered.project.length,
				runtime: 0,
			};
			const diagnostics = discov
```