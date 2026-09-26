# OUTRO - mcp-direct-tool-allowlist.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\runs\shared\mcp-direct-tool-allowlist.ts
**SHA:** dd45f619c22dbadb
**Timestamp:** 2026-08-28T02:24:57.753189
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- const missing = new Set<string>();
- const missing = getMissingEnvVars(definition.url);

### Ouro Bruto (primeiros 5000 chars)
```
import { createHash } from "node:crypto";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { getAgentDir, getProjectConfigDir } from "../../shared/utils.ts";

const CACHE_VERSION = 1;
const CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const BUILTIN_TOOL_NAMES = new Set(["read", "bash", "edit", "write", "grep", "find", "ls", "mcp"]);
const GENERIC_GLOBAL_CONFIG_PATH = path.join(os.homedir(), ".config", "mcp", "mcp.json");
const IMPORT_PATHS = {
	cursor: [path.join(os.homedir(), ".cursor", "mcp.json")],
	"claude-code": [
		path.join(os.homedir(), ".claude", "mcp.json"),
		path.join(os.homedir(), ".claude.json"),
		path.join(os.homedir(), ".claude", "claude_desktop_config.json"),
	],
	"claude-desktop": [path.join(os.homedir(), "Library", "Application Support", "Claude", "claude_desktop_config.json")],
	codex: [path.join(os.homedir(), ".codex", "config.json")],
	windsurf: [path.join(os.homedir(), ".windsurf", "mcp.json")],
	vscode: [".vscode/mcp.json"],
} as const;

type ToolPrefix = "server" | "none" | "short";
type ImportKind = keyof typeof IMPORT_PATHS;

interface ServerEntry {
	command?: string;
	args?: string[];
	socket?: string;
	env?: Record<string, string>;
	cwd?: string;
	url?: string;
	headers?: Record<string, string>;
	requestHeadersCommand?: {
		command: string;
		args?: string[];
		env?: Record<string, string>;
		timeoutMs?: number;
	};
	auth?: "oauth" | "bearer" | false;
	bearerToken?: string;
	bearerTokenEnv?: string;
	exposeResources?: boolean;
	includeTools?: string[];
	excludeTools?: string[];
	protocolVersion?: string;
	directTools?: boolean | string[];
}

interface McpConfig {
	mcpServers: Record<string, ServerEntry>;
	imports?: ImportKind[];
	settings?: {
		toolPrefix?: ToolPrefix;
		directTools?: boolean;
	};
}

interface CachedTool {
	name?: string;
}

interface CachedResource {
	uri?: string;
	name?: string;
}

interface ServerCacheEntry {
	configHash?: string;
	tools?: CachedTool[];
	resources?: CachedResource[];
	cachedAt?: number;
}

interface MetadataCache {
	version: number;
	servers: Record<string, ServerCacheEntry>;
}

export interface ResolvedMcpDirectToolSelection { name: string; selector: string }

export function resolveMcpDirectToolSelections(mcpDirectTools: string[] | undefined, cwd = process.cwd()): ResolvedMcpDirectToolSelection[] {
	if (!mcpDirectTools?.length) return [];

	try {
		const config = loadMcpConfig(cwd);
		const cache = loadMetadataCache();
		if (!cache) return [];
		return resolveDirectToolSelections(config, cache, getToolPrefix(config.settings?.toolPrefix), mcpDirectTools);
	} catch {
		return [];
	}
}

function loadMetadataCache(): MetadataCache | null {
	const cachePath = path.join(getAgentDir(), "mcp-cache.json");
	let parsed: unknown;
	try {
		parsed = JSON.parse(fs.readFileSync(cachePath, "utf-8"));
	} catch {
		return null;
	}

	if (!parsed || typeof parsed !== "object") return null;
	const raw = parsed as Record<string, unknown>;
	if (raw.version !== CACHE_VERSION || !raw.servers || typeof raw.servers !== "object" || Array.isArray(raw.servers)) {
		return null;
	}
	return raw as unknown as MetadataCache;
}

function loadMcpConfig(cwd: string): McpConfig {
	let config: McpConfig = { mcpServers: {} };
	for (const sourcePath of getConfigPaths(cwd)) {
		const loaded = readConfig(sourcePath);
		if (!loaded) continue;
		config = mergeConfigs(config, expandImports(loaded, cwd));
	}
	return config;
}

function getConfigPaths(cwd: string): string[] {
	const piGlobalPath = path.join(getAgentDir(), "mcp.json");
	const projectPath = path.resolve(cwd, ".mcp.json");
	const projectPiPath = path.resolve(getProjectConfigDir(cwd), "mcp.json");
	const sources: string[] = [];
	if (GENERIC_GLOBAL_CONFIG_PATH !== piGlobalPath) sources.push(GENERIC_GLOBAL_CONFIG_PATH);
	sources.push(piGlobalPath);
	if (projectPath !== piGlobalPath) sources.push(projectPath);
	if (projectPiPath !== piGlobalPath && projectPiPath !== projectPath) sources.push(projectPiPath);
	return sources;
}

function readConfig(configPath: string): McpConfig | null {
	let parsed: unknown;
	try {
		parsed = JSON.parse(fs.readFileSync(configPath, "utf-8"));
	} catch {
		return null;
	}
	return validateConfig(parsed);
}

function validateConfig(raw: unknown): McpConfig {
	if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { mcpServers: {} };
	const obj = raw as Record<string, unknown>;
	const servers = obj.mcpServers ?? obj["mcp-servers"] ?? {};
	return {
		mcpServers: servers && typeof servers === "object" && !Array.isArray(servers) ? servers as Record<string, ServerEntry> : {},
		imports: Array.isArray(obj.imports) ? obj.imports.filter((value): value is ImportKind => isImportKind(value)) : undefined,
		settings: obj.settings && typeof obj.settings === "object" && !Array.isArray(obj.settings)
			? obj.settings as McpConfig["settings"]
			: undefined,
	};
}

function mergeConfigs(base: McpConfig, next: McpConfig): McpConfig {
	const imports =
```