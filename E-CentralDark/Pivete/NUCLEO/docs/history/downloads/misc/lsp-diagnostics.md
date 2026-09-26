# OUTRO - lsp-diagnostics.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\watchdog\lsp-diagnostics.ts
**SHA:** cffcb229043aaf1f
**Timestamp:** 2026-08-28T02:24:59.995290
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const bodyStart = headerEnd + 4;

### Ouro Bruto (primeiros 5000 chars)
```
import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { createHash } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import { pathToFileURL } from "node:url";
import type {
	WatchdogLspConfig,
	WatchdogLspDiagnostic,
	WatchdogLspDiagnosticSeverity,
	WatchdogLspResult,
	WatchdogWarning,
} from "./types.ts";
export interface WatchdogLspRequest {
	cwd: string;
	root: string;
	changedPaths: string[];
	config: WatchdogLspConfig;
	signal?: AbortSignal;
}
export type WatchdogLspDiagnosticsFunction = (request: WatchdogLspRequest) => Promise<WatchdogLspResult> | WatchdogLspResult;
interface TargetFile {
	relPath: string;
	absPath: string;
	uri: string;
	languageId: string;
}
interface LspCommand {
	command: string;
	args: string[];
	label: string;
}
type JsonRpcId = number | string;
type JsonRpcMessage = {
	jsonrpc?: string;
	id?: JsonRpcId | null;
	method?: string;
	params?: unknown;
	result?: unknown;
	error?: { message?: string; code?: number };
};
type LspDiagnostic = {
	range?: {
		start?: { line?: number; character?: number };
	};
	severity?: number;
	code?: string | number;
	source?: string;
	message?: string;
};
const TS_JS_EXTENSIONS = new Map<string, string>([
	[".ts", "typescript"],
	[".tsx", "typescriptreact"],
	[".mts", "typescript"],
	[".cts", "typescript"],
	[".js", "javascript"],
	[".jsx", "javascriptreact"],
	[".mjs", "javascript"],
	[".cjs", "javascript"],
]);
const PROVIDER_NAME = "typescript-language-server";
const MAX_MESSAGE_LENGTH = 500;
const MAX_STDERR_LENGTH = 2_000;
const SHUTDOWN_TIMEOUT_MS = 250;
function normalizeRelPath(value: string): string {
	return value.replaceAll(path.sep, "/").replace(/^\.\//, "");
}
function isPathInsideRoot(absPath: string, root: string): boolean {
	const rel = path.relative(root, absPath);
	return rel === "" || (!rel.startsWith("..") && !path.isAbsolute(rel));
}
function languageIdForPath(filePath: string): string | undefined {
	return TS_JS_EXTENSIONS.get(path.extname(filePath).toLowerCase());
}

function trimDiagnosticMessage(message: string): string {
	const normalized = message.replace(/\s+/g, " ").trim();
	return normalized.length > MAX_MESSAGE_LENGTH ? `${normalized.slice(0, MAX_MESSAGE_LENGTH - 1)}…` : normalized;
}

function severityFromLsp(value: number | undefined): WatchdogLspDiagnosticSeverity {
	if (value === 1) return "error";
	if (value === 2) return "warning";
	if (value === 3) return "info";
	return "hint";
}

function pathExecutable(filePath: string): boolean {
	try {
		const stat = fs.statSync(filePath);
		if (!stat.isFile()) return false;
		if (process.platform === "win32") return true;
		fs.accessSync(filePath, fs.constants.X_OK);
		return true;
	} catch {
		return false;
	}
}

function pathExecutableNames(name: string): string[] {
	if (process.platform !== "win32") return [name];
	const extensions = (process.env.PATHEXT ?? ".EXE;.CMD;.BAT").split(";").filter(Boolean);
	return [name, ...extensions.map((ext) => `${name}${ext.toLowerCase()}`), ...extensions.map((ext) => `${name}${ext.toUpperCase()}`)];
}

function resolveTypeScriptLanguageServer(root: string): LspCommand | undefined {
	for (const name of pathExecutableNames(PROVIDER_NAME)) {
		const local = path.join(root, "node_modules", ".bin", name);
		if (pathExecutable(local)) return { command: local, args: ["--stdio"], label: `${PROVIDER_NAME} (project)` };
	}
	for (const dir of (process.env.PATH ?? "").split(path.delimiter).filter(Boolean)) {
		for (const name of pathExecutableNames(PROVIDER_NAME)) {
			const candidate = path.join(dir, name);
			if (pathExecutable(candidate)) return { command: candidate, args: ["--stdio"], label: PROVIDER_NAME };
		}
	}
	return undefined;
}

function collectTargetFiles(root: string, changedPaths: string[], maxFiles: number): { targets: TargetFile[]; skippedPaths: string[] } {
	const targets: TargetFile[] = [];
	const skippedPaths: string[] = [];
	for (const changedPath of changedPaths) {
		const relPath = normalizeRelPath(changedPath);
		const absPath = path.resolve(root, relPath);
		const languageId = languageIdForPath(absPath);
		if (!languageId || !isPathInsideRoot(absPath, root)) {
			skippedPaths.push(relPath);
			continue;
		}
		let stat: fs.Stats;
		try {
			stat = fs.statSync(absPath);
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code === "ENOENT") {
				skippedPaths.push(relPath);
				continue;
			}
			throw error;
		}
		if (!stat.isFile()) {
			skippedPaths.push(relPath);
			continue;
		}
		if (targets.length >= maxFiles) {
			skippedPaths.push(relPath);
			continue;
		}
		targets.push({ relPath, absPath, uri: pathToFileURL(absPath).href, languageId });
	}
	return { targets, skippedPaths };
}

function diagnosticIdentity(diagnostic: WatchdogLspDiagnostic): string {
	return createHash("sha256")
		.update([
			diagnostic.path,
			diagnostic.severity,
			diagnostic.source,
			diagnostic.code ?? "",
			diagnostic.message,
		].join("\n"))
		.digest("hex");
}


```