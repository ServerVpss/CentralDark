# OUTRO - skills.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\agents\skills.ts
**SHA:** e17c0b224da5b264
**Timestamp:** 2026-08-28T02:24:51.472609
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- ): { resolved: ResolvedSkill[]; missing: string[] } {
- const missing: string[] = [];
- ): { resolved: ResolvedSkill[]; missing: string[] } {
- missing: fallback.missing,

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Skill resolution and caching for subagent extension
 */

import { execSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { parseFrontmatter } from "./frontmatter.ts";
import { getAgentDir, getProjectConfigDir } from "../shared/utils.ts";

export type SkillSource =
	| "project"
	| "user"
	| "project-package"
	| "user-package"
	| "project-settings"
	| "user-settings"
	| "extension"
	| "builtin"
	| "unknown";

interface ResolvedSkill {
	name: string;
	path: string;
	content: string;
	description?: string;
	source: SkillSource;
}

interface SkillCacheEntry {
	mtime: number;
	skill: ResolvedSkill;
}

interface CachedSkillEntry {
	name: string;
	filePath: string;
	source: SkillSource;
	description?: string;
	order: number;
}

interface SkillSearchPath {
	path: string;
	source: SkillSource;
}

const skillCache = new Map<string, SkillCacheEntry>();
const MAX_CACHE_SIZE = 50;

let loadSkillsCache: { cwd: string; agentDir: string; skills: CachedSkillEntry[]; timestamp: number } | null = null;
const LOAD_SKILLS_CACHE_TTL_MS = 5000;

const SUBAGENT_ORCHESTRATION_SKILL = "pi-subagents";

const SOURCE_PRIORITY: Record<SkillSource, number> = {
	project: 700,
	"project-settings": 650,
	"project-package": 600,
	user: 300,
	"user-settings": 250,
	"user-package": 200,
	extension: 150,
	builtin: 100,
	unknown: 0,
};

function stripSkillFrontmatter(content: string): string {
	const normalized = content.replace(/\r\n/g, "\n");
	if (!normalized.startsWith("---")) return normalized;

	const endIndex = normalized.indexOf("\n---", 3);
	if (endIndex === -1) return normalized;

	return normalized.slice(endIndex + 4).trim();
}

function isWithinPath(filePath: string, dir: string): boolean {
	const relative = path.relative(dir, filePath);
	return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function readOptionalJsonFile(filePath: string, label: string): unknown {
	try {
		return JSON.parse(fs.readFileSync(filePath, "utf-8"));
	} catch (error) {
		const code = typeof error === "object" && error !== null && "code" in error
			? (error as { code?: unknown }).code
			: undefined;
		if (code === "ENOENT") return null;
		const message = error instanceof Error ? error.message : String(error);
		throw new Error(`Failed to read ${label} '${filePath}': ${message}`, {
			cause: error instanceof Error ? error : undefined,
		});
	}
}

function readJsonFileBestEffort(filePath: string): unknown {
	try {
		return JSON.parse(fs.readFileSync(filePath, "utf-8"));
	} catch {
		// Package scans over installed dependencies are opportunistic.
		return null;
	}
}

function extractSkillPathsFromPackageRoot(packageRoot: string, source: SkillSource, bestEffort = false): SkillSearchPath[] {
	const packageJsonPath = path.join(packageRoot, "package.json");
	const pkg = bestEffort
		? readJsonFileBestEffort(packageJsonPath)
		: readOptionalJsonFile(packageJsonPath, "package manifest");
	if (!pkg || typeof pkg !== "object" || Array.isArray(pkg)) return [];
	const pi = (pkg as { pi?: unknown }).pi;
	if (!pi || typeof pi !== "object" || Array.isArray(pi)) return [];
	const skills = (pi as { skills?: unknown }).skills;
	if (!Array.isArray(skills)) return [];
	return skills
		.filter((entry): entry is string => typeof entry === "string")
		.map((entry) => ({ path: path.resolve(packageRoot, entry), source }));
}

let cachedGlobalNpmRoot: string | null = null;

function getGlobalNpmRoot(): string | null {
	const offline = process.env.PI_OFFLINE?.toLowerCase();
	if (offline === "1" || offline === "true" || offline === "yes") return null;
	if (cachedGlobalNpmRoot !== null) return cachedGlobalNpmRoot;

	const windowsGlobalRoot = process.platform === "win32" && process.env.APPDATA
		? path.join(process.env.APPDATA, "npm", "node_modules")
		: undefined;
	if (windowsGlobalRoot) {
		try {
			if (fs.statSync(windowsGlobalRoot).isDirectory()) {
				cachedGlobalNpmRoot = fs.realpathSync(windowsGlobalRoot);
				return cachedGlobalNpmRoot;
			}
		} catch {
			// Fall through if the directory disappears while resolving it.
		}
	}

	try {
		cachedGlobalNpmRoot = fs.realpathSync(execSync("npm root -g", { encoding: "utf-8", timeout: 5000, windowsHide: true }).trim());
		return cachedGlobalNpmRoot;
	} catch {
		// Global npm root is optional in constrained environments.
		cachedGlobalNpmRoot = ""; // Empty string means "tried but failed"
		return null;
	}
}

function collectInstalledPackageSkillPaths(cwd: string, agentDir: string): SkillSearchPath[] {
	const projectConfigDir = getProjectConfigDir(cwd);
	const dirs: SkillSearchPath[] = [
		{ path: path.join(projectConfigDir, "npm", "node_modules"), source: "project-package" },
		{ path: path.join(agentDir, "npm", "node_modules"), source: "user-package" },
	];

	const globalRoot = getGlobalNpmRoot();
	if (globalRoot) {
		dirs.push({ path: globalRoot, source: "user-package" });
	}

	const results: SkillSearchPath[]
```