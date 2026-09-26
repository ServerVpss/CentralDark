# COMANDO - prompt-workflows.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\slash\prompt-workflows.ts
**SHA:** b059fd64c7710688
**Timestamp:** 2026-08-28T02:24:59.435257
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: PromptWorkflowRunner;

### Ouro Bruto (primeiros 5000 chars)
```
import * as fs from "node:fs";
import * as path from "node:path";
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { parseFrontmatter } from "../agents/frontmatter.ts";
import type { SubagentParamsLike } from "../runs/foreground/subagent-executor.ts";
import { getPromptDirectories } from "../shared/prompt-resources.ts";

interface PromptWorkflow {
	name: string;
	description: string;
	body: string;
	filePath: string;
	agent: string;
	context?: "fresh" | "fork";
	model?: string;
	skill?: string | string[] | false;
	cwd?: string;
	chain?: string;
}

type PromptWorkflowRunner = (params: SubagentParamsLike, ctx: ExtensionContext) => Promise<void>;

const RESERVED_COMMAND_NAMES = new Set([
	"chain-prompts",
	"prompt-workflow",
	"run",
	"chain",
	"parallel",
	"run-chain",
	"subagents-doctor",
	"subagents-models",
]);

function readPromptFiles(cwd: string): string[] {
	const files: string[] = [];
	for (const dir of Object.values(getPromptDirectories(cwd))) {
		let entries: fs.Dirent[];
		try {
			entries = fs.readdirSync(dir, { withFileTypes: true });
		} catch {
			continue;
		}
		for (const entry of entries) {
			if (entry.isFile() && entry.name.endsWith(".md")) files.push(path.join(dir, entry.name));
		}
	}
	return files;
}

function firstNonEmptyLine(value: string): string {
	return value.split(/\r?\n/).map((line) => line.trim()).find(Boolean) ?? "Prompt workflow";
}

function stringField(frontmatter: Record<string, string>, key: string): string | undefined {
	const value = frontmatter[key]?.trim();
	return value ? value : undefined;
}

function booleanField(frontmatter: Record<string, string>, key: string): boolean | undefined {
	const value = frontmatter[key]?.trim().toLowerCase();
	if (value === "true" || value === "yes" || value === "1") return true;
	if (value === "false" || value === "no" || value === "0") return false;
	return undefined;
}

function parseSkill(value: string | undefined): string | string[] | false | undefined {
	if (!value) return undefined;
	if (value === "false") return false;
	const parts = value.split(",").map((part) => part.trim()).filter(Boolean);
	return parts.length > 1 ? parts : parts[0];
}

function parseAgent(frontmatter: Record<string, string>): string {
	const subagent = stringField(frontmatter, "subagent");
	if (!subagent || subagent === "true") return "delegate";
	return subagent;
}

function loadPromptWorkflow(filePath: string): PromptWorkflow | undefined {
	const content = fs.readFileSync(filePath, "utf-8");
	const { frontmatter, body } = parseFrontmatter(content);
	const name = path.basename(filePath, ".md");
	if (!name || RESERVED_COMMAND_NAMES.has(name)) return undefined;
	const model = stringField(frontmatter, "model");
	const skill = parseSkill(stringField(frontmatter, "skill"));
	const cwd = stringField(frontmatter, "cwd");
	const chain = stringField(frontmatter, "chain");
	return {
		name,
		description: stringField(frontmatter, "description") ?? firstNonEmptyLine(body),
		body,
		filePath,
		agent: parseAgent(frontmatter),
		...(booleanField(frontmatter, "inheritContext") === true || booleanField(frontmatter, "fork") === true ? { context: "fork" as const } : {}),
		...(booleanField(frontmatter, "fresh") === true ? { context: "fresh" as const } : {}),
		...(model ? { model } : {}),
		...(skill !== undefined ? { skill } : {}),
		...(cwd ? { cwd } : {}),
		...(chain ? { chain } : {}),
	};
}

export function discoverPromptWorkflows(cwd: string): PromptWorkflow[] {
	const workflows = new Map<string, PromptWorkflow>();
	for (const file of readPromptFiles(cwd)) {
		const workflow = loadPromptWorkflow(file);
		if (workflow) workflows.set(workflow.name, workflow);
	}
	return [...workflows.values()].sort((a, b) => a.name.localeCompare(b.name));
}

function shellWords(input: string): string[] {
	const words: string[] = [];
	let current = "";
	let quote: "'" | '"' | undefined;
	let escaped = false;
	for (const ch of input) {
		if (escaped) {
			current += ch;
			escaped = false;
			continue;
		}
		if (ch === "\\") {
			escaped = true;
			continue;
		}
		if (quote) {
			if (ch === quote) quote = undefined;
			else current += ch;
			continue;
		}
		if (ch === "'" || ch === '"') {
			quote = ch;
			continue;
		}
		if (/\s/.test(ch)) {
			if (current) {
				words.push(current);
				current = "";
			}
			continue;
		}
		current += ch;
	}
	if (current) words.push(current);
	return words;
}

function substituteArgs(template: string, args: string[]): string {
	const all = args.join(" ");
	return template
		.replace(/\$ARGUMENTS/g, all)
		.replace(/\$@/g, all)
		.replace(/\$\{(\d+):-([^}]*)\}/g, (_match, index: string, fallback: string) => args[Number(index) - 1] || fallback)
		.replace(/\$(\d+)/g, (_match, index: string) => args[Number(index) - 1] ?? "");
}

function parseRuntimeOptions(words: string[]): { args: string[]; agentOverride?: string; fork?: boolean; fresh?: boolean; bg?: boolean } {
	const args: string[] = [];
	let agentOverri
```