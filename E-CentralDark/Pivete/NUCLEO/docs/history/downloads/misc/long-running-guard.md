# OUTRO - long-running-guard.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\runs\shared\long-running-guard.ts
**SHA:** 512a6885f426cfc3
**Timestamp:** 2026-08-28T02:24:57.730184
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const targetStart = command[cursor]!;
- if (targetStart === "&" || targetStart === "|" || targetStart === ";") continue;
- if (targetStart === "(" || targetStart === ")") continue;

### Ouro Bruto (primeiros 5000 chars)
```
import type { ResolvedControlConfig } from "../../shared/types.ts";

interface LongRunningNoticeMetrics {
	startedAt: number;
	now: number;
	turns: number;
	tokens: number;
}

type LongRunningTriggerReason = "time_threshold" | "turn_threshold" | "token_threshold";

interface FailedMutatingAttempt {
	tool: string;
	path?: string;
	error: string;
	ts: number;
}

interface MutatingFailureState {
	consecutiveFailures: number;
	lastFailureAt?: number;
	recentFailures: FailedMutatingAttempt[];
	lastMutatingPath?: string;
	repeatedPathFailures: number;
}

const MUTATING_BASH_PATTERNS = [
	/(^|[;&|()\s])rm\s+/,
	/(^|[;&|()\s])mv\s+/,
	/(^|[;&|()\s])cp\s+/,
	/(^|[;&|()\s])mkdir\s+/,
	/(^|[;&|()\s])touch\s+/,
	/(^|[;&|()\s])git\s+apply\b/,
	/(^|[;&|()\s])patch\s+/,
	/(^|[;&|()\s])sed\s+[^\n;&|]*\s-i\b/,
	/(^|[;&|()\s])perl\s+[^\n;&|]*\s-pi\b/,
	/(^|[;&|()]|\n)\s*tee\s+[^|&;]+/,
	/\b(writeFile|writeFileSync|appendFile|appendFileSync)\b/,
	/\bwrite_text\s*\(/,
	/\bopen\s*\([^)]*,\s*["'][wa]/,
];

const MUTATING_FAILURE_HINTS = [
	"failed",
	"error",
	"no exact match",
	"did not match",
	"malformed",
	"rejected",
	"unable",
	"cannot",
	"could not",
];

export function resolveCurrentPath(toolName: string | undefined, args: Record<string, unknown> | undefined): string | undefined {
	if (!toolName || !args) return undefined;
	const direct = ["path", "file", "filename", "target", "cwd"];
	for (const key of direct) {
		const value = args[key];
		if (typeof value === "string" && value.trim()) return value.trim();
	}
	if (toolName === "bash") {
		const command = typeof args.command === "string" ? args.command : undefined;
		if (!command) return undefined;
		const redirect = command.match(/(?:>|>>|tee\s+)(\S+)/);
		if (redirect?.[1]) return redirect[1];
	}
	return undefined;
}

function hasUnquotedFileRedirection(command: string): boolean {
	let inSingle = false;
	let inDouble = false;
	for (let i = 0; i < command.length; i++) {
		const char = command[i]!;
		if (char === "'" && !inDouble) {
			inSingle = !inSingle;
			continue;
		}
		if (char === '"' && !inSingle) {
			inDouble = !inDouble;
			continue;
		}
		if (inSingle || inDouble) continue;
		if (char !== ">") continue;
		if (command[i - 1] === "-") continue;
		const isDouble = command[i + 1] === ">";
		let cursor = i + (isDouble ? 2 : 1);
		while (cursor < command.length && /\s/.test(command[cursor]!)) cursor++;
		if (cursor >= command.length) continue;
		const targetStart = command[cursor]!;
		if (targetStart === "&" || targetStart === "|" || targetStart === ";") continue;
		if (targetStart === "(" || targetStart === ")") continue;
		return true;
	}
	return false;
}

function unquotedShellText(command: string): string {
	let inSingle = false;
	let inDouble = false;
	let escaped = false;
	let result = "";
	for (const char of command) {
		if (escaped) {
			result += inSingle || inDouble ? "_" : char;
			escaped = false;
			continue;
		}
		if (char === "\\" && !inSingle) {
			escaped = true;
			result += inDouble ? "_" : char;
			continue;
		}
		if (char === "'" && !inDouble) {
			inSingle = !inSingle;
			continue;
		}
		if (char === '"' && !inSingle) {
			inDouble = !inDouble;
			continue;
		}
		result += inSingle || inDouble ? "_" : char;
	}
	return result;
}

function hasMutatingGitCommand(command: string): boolean {
	const unquoted = unquotedShellText(command);
	for (const segment of unquoted.split(/(?:&&|\|\||[;|()\n])/)) {
		const trimmed = segment.trim();
		if (!trimmed || /^(?:echo|printf)\b/.test(trimmed)) continue;
		if (/^git\s+(?:(?:(?:-C|--git-dir|--work-tree)\s+\S+|(?:--git-dir|--work-tree)=\S+|--paginate)\s+)*(?:add|commit|push)\b/.test(trimmed)) return true;
	}
	return false;
}

export function isMutatingBashCommand(command: string): boolean {
	return hasUnquotedFileRedirection(command)
		|| hasMutatingGitCommand(command)
		|| MUTATING_BASH_PATTERNS.some((pattern) => pattern.test(command));
}

export function isMutatingTool(toolName: string | undefined, args: Record<string, unknown> | undefined): boolean {
	if (!toolName) return false;
	if (toolName === "edit" || toolName === "write") return true;
	if (toolName === "cursor") {
		const activityTitle = typeof args?.activityTitle === "string" ? args.activityTitle : "";
		return /^Cursor (?:edit|write)\b/i.test(activityTitle);
	}
	if (toolName !== "bash") return false;
	const command = typeof args?.command === "string" ? args.command : "";
	if (!command.trim()) return false;
	return isMutatingBashCommand(command);
}

export function didMutatingToolFail(text: string): boolean {
	const lowered = text.toLowerCase();
	return MUTATING_FAILURE_HINTS.some((hint) => lowered.includes(hint));
}

export function nextLongRunningTrigger(
	config: ResolvedControlConfig,
	metrics: LongRunningNoticeMetrics,
): LongRunningTriggerReason | undefined {
	if (metrics.now - metrics.startedAt >= config.activeNoticeAfterMs) return "time_threshold";
	if (config.activeNoticeAfterTurns !== undefined && metrics.turns >= config.activeNoticeAf
```