# COMANDO - artifacts.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\shared\artifacts.ts
**SHA:** ccca09e94181458b
**Timestamp:** 2026-08-28T02:24:58.540416
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- function globMatchesPath(pattern: string, filePath: string): boolean {
- function normalizePattern(pattern: string): string {
- function patternMatchesArtifactPath(pattern: string, artifactPath: string): boolean {
- const pattern = negated ? line.slice(1) : line;
- const pattern = negated ? entry.slice(1) : entry;

### Ouro Bruto (primeiros 5000 chars)
```
import * as fs from "node:fs";
import * as path from "node:path";
import { CHAIN_RUNS_DIR, TEMP_ARTIFACTS_DIR, type ArtifactPaths, type ArtifactDirPreference } from "./types.ts";
import { getAgentDir } from "./utils.ts";
const CLEANUP_MARKER_FILE = ".last-cleanup";
export const PROJECT_SUBAGENTS_RELATIVE_DIR = ".pi/subagents";

const PROJECT_ARTIFACT_PATHS = [
	`${PROJECT_SUBAGENTS_RELATIVE_DIR}/artifacts/output.md`,
	`${PROJECT_SUBAGENTS_RELATIVE_DIR}/artifacts/run_worker_input.md`,
	`${PROJECT_SUBAGENTS_RELATIVE_DIR}/artifacts/run_worker_output.md`,
	`${PROJECT_SUBAGENTS_RELATIVE_DIR}/artifacts/run_worker.jsonl`,
	`${PROJECT_SUBAGENTS_RELATIVE_DIR}/artifacts/run_worker_transcript.jsonl`,
	`${PROJECT_SUBAGENTS_RELATIVE_DIR}/artifacts/run_worker_meta.json`,
	`${PROJECT_SUBAGENTS_RELATIVE_DIR}/artifacts/progress/run/progress.md`,
	`${PROJECT_SUBAGENTS_RELATIVE_DIR}/artifacts/outputs/output.md`,
	`${PROJECT_SUBAGENTS_RELATIVE_DIR}/artifacts/outputs/run/output.md`,
	`${PROJECT_SUBAGENTS_RELATIVE_DIR}/chain-runs/run.json`,
];

function globMatchesPath(pattern: string, filePath: string): boolean {
	let expression = "^";
	for (let index = 0; index < pattern.length; index += 1) {
		const character = pattern[index];
		if (character === undefined) break;
		if (character === "*" && pattern[index + 1] === "*") {
			index += 1;
			if (pattern[index + 1] === "/") {
				index += 1;
				expression += "(?:.*/)?";
			} else {
				expression += ".*";
			}
		} else if (character === "*") {
			expression += "[^/]*";
		} else if (character === "?") {
			expression += "[^/]";
		} else if (character === "[") {
			const end = pattern.indexOf("]", index + 1);
			if (end === -1) expression += "\\[";
			else {
				expression += pattern.slice(index, end + 1);
				index = end;
			}
		} else {
			expression += character.replace(/[|\\{}()[\]^$+?.]/g, "\\$&");
		}
	}
	try {
		return new RegExp(`${expression}$`).test(filePath);
	} catch {
		return false;
	}
}

function normalizePattern(pattern: string): string {
	return pattern.replace(/^\.\//, "").replace(/^\//, "").replace(/\/+$/, "");
}

function patternMatchesArtifactPath(pattern: string, artifactPath: string): boolean {
	const normalized = normalizePattern(pattern);
	return normalized === PROJECT_SUBAGENTS_RELATIVE_DIR
		|| normalized === "*"
		|| artifactPath.startsWith(`${normalized}/`)
		|| globMatchesPath(normalized, artifactPath);
}

function ignoreFileExcludesProjectArtifacts(filePath: string): boolean {
	if (!fs.existsSync(filePath)) return false;
	try {
		const excluded = new Set<string>();
		for (const rawLine of fs.readFileSync(filePath, "utf-8").split(/\r?\n/)) {
			const line = rawLine.trim();
			if (!line || line.startsWith("#")) continue;
			const negated = line.startsWith("!");
			const pattern = negated ? line.slice(1) : line;
			for (const artifactPath of PROJECT_ARTIFACT_PATHS) {
				if (!patternMatchesArtifactPath(pattern, artifactPath)) continue;
				if (negated) excluded.delete(artifactPath);
				else excluded.add(artifactPath);
			}
		}
		return excluded.size === PROJECT_ARTIFACT_PATHS.length;
	} catch {
		return false;
	}
}

function filesIncludeProjectArtifacts(files: unknown): boolean | undefined {
	if (!Array.isArray(files)) return undefined;
	const included = new Set<string>();
	for (const entry of files) {
		if (typeof entry !== "string") continue;
		const negated = entry.startsWith("!");
		const pattern = negated ? entry.slice(1) : entry;
		for (const artifactPath of PROJECT_ARTIFACT_PATHS) {
			if (!patternMatchesArtifactPath(pattern, artifactPath)) continue;
			if (negated) included.delete(artifactPath);
			else included.add(artifactPath);
		}
	}
	return included.size > 0;
}

/** Returns a package-publishing warning when project artifacts can enter npm packages. */
export function getProjectArtifactPackagingWarning(cwd: string): string | undefined {
	const packagePath = path.join(cwd, "package.json");
	if (!fs.existsSync(packagePath)) return undefined;

	let packageJson: Record<string, unknown>;
	try {
		const parsed: unknown = JSON.parse(fs.readFileSync(packagePath, "utf-8"));
		if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return undefined;
		packageJson = parsed as Record<string, unknown>;
	} catch {
		return undefined;
	}

	const filesIncludeArtifacts = filesIncludeProjectArtifacts(packageJson.files);
	if (filesIncludeArtifacts === false) return undefined;

	const npmIgnorePath = path.join(cwd, ".npmignore");
	const ignorePath = fs.existsSync(npmIgnorePath) ? npmIgnorePath : path.join(cwd, ".gitignore");
	if (filesIncludeArtifacts === undefined && ignoreFileExcludesProjectArtifacts(ignorePath)) return undefined;

	return "Project-scoped subagent artifacts can be included when this package is published. Add '.pi/subagents/' to .npmignore, restrict package.json files, or set artifactDir to 'session' or 'temp'.";
}

export function getProjectSubagentsDir(cwd: string): string {
	return path.join(cwd, PROJECT_SUBAGENTS_RELATIVE_DIR);
```