# OUTRO - chain-serializer.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\agents\chain-serializer.ts
**SHA:** 16b128bff8d0a3cb
**Timestamp:** 2026-08-28T02:24:51.098366
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const sectionStart = match.index! + match[0].length + lineEndOffset;

### Ouro Bruto (primeiros 5000 chars)
```
import type { ChainConfig, ChainStepConfig } from "./agents.ts";
import { buildRuntimeName, frontmatterNameForConfig, parsePackageName } from "./identity.ts";
import { parseFrontmatter } from "./frontmatter.ts";
import { ChainOutputValidationError, validateChainOutputBindings } from "../runs/shared/chain-outputs.ts";
import { validateAcceptanceInput } from "../runs/shared/acceptance.ts";
import { validateToolBudgetConfig } from "../runs/shared/tool-budget.ts";
import type { ChainStep } from "../shared/settings.ts";
import type { AgentSource } from "./agents.ts";

function parseStepBody(agent: string, sectionBody: string): ChainStepConfig {
	const lines = sectionBody.split("\n");
	const blankIndex = lines.findIndex((line) => line.trim() === "");
	const configLines = blankIndex === -1 ? lines : lines.slice(0, blankIndex);
	const task = (blankIndex === -1 ? "" : lines.slice(blankIndex + 1).join("\n")).trim();

	const step: ChainStepConfig = { agent, task };
	for (const line of configLines) {
		const match = line.match(/^([\w-]+):\s*(.*)$/);
		if (!match) continue;
		const [keyValue, rawValueValue] = match.slice(1);
		if (keyValue === undefined || rawValueValue === undefined) continue;
		const key = keyValue.trim().toLowerCase();
		const rawValue = rawValueValue.trim();

		if (key === "output") {
			if (rawValue === "false") step.output = false;
			else if (rawValue) step.output = rawValue;
			continue;
		}
		if (key === "phase") {
			if (rawValue) step.phase = rawValue;
			continue;
		}
		if (key === "label") {
			if (rawValue) step.label = rawValue;
			continue;
		}
		if (key === "as") {
			if (rawValue) step.as = rawValue;
			continue;
		}
		if (key === "outputschema") {
			if (rawValue.startsWith("{") || rawValue.startsWith("[")) {
				throw new Error("Inline outputSchema values are not supported in .chain.md files; use a schema file path.");
			}
			if (rawValue) step.outputSchema = rawValue;
			continue;
		}
		if (key === "outputmode") {
			if (rawValue === "inline" || rawValue === "file-only") step.outputMode = rawValue;
			continue;
		}
		if (key === "reads") {
			if (rawValue === "false") {
				step.reads = false;
			} else {
				const reads = rawValue
					.split(",")
					.map((v) => v.trim())
					.filter(Boolean);
				step.reads = reads.length > 0 ? reads : false;
			}
			continue;
		}
		if (key === "model") {
			if (rawValue) step.model = rawValue;
			continue;
		}
		if (key === "skills") {
			if (rawValue === "false") {
				step.skills = false;
			} else {
				const skills = rawValue
					.split(",")
					.map((v) => v.trim())
					.filter(Boolean);
				step.skills = skills.length > 0 ? skills : false;
			}
			continue;
		}
		if (key === "progress") {
			if (rawValue === "true") step.progress = true;
			else if (rawValue === "false") step.progress = false;
			continue;
		}
		if (key === "toolbudget") {
			let parsed: unknown;
			try {
				parsed = JSON.parse(rawValue);
			} catch (error) {
				const message = error instanceof Error ? error.message : String(error);
				throw new Error(`Invalid toolBudget in .chain.md step '${agent}': ${message}`);
			}
			const validation = validateToolBudgetConfig(parsed, `toolBudget for step '${agent}'`);
			if (validation.error) throw new Error(validation.error);
			const toolBudget = parsed as ChainStepConfig["toolBudget"];
			if (toolBudget !== undefined) step.toolBudget = toolBudget;
		}
	}

	return step;
}

export function parseChain(content: string, source: AgentSource, filePath: string): ChainConfig {
	const { frontmatter, body } = parseFrontmatter(content);
	if (!frontmatter.name || !frontmatter.description) {
		throw new Error("Chain frontmatter must include name and description");
	}

	const matches = [...body.matchAll(/^##\s+(.+)[^\S\n]*$/gm)];
	const steps: ChainStepConfig[] = [];

	for (let i = 0; i < matches.length; i++) {
		const match = matches[i]!;
		const agent = match[1]!.trim();
		const lineEndOffset = body[match.index! + match[0].length] === "\n" ? 1 : 0;
		const sectionStart = match.index! + match[0].length + lineEndOffset;
		const sectionEnd = i + 1 < matches.length ? matches[i + 1]!.index! : body.length;
		const sectionBody = body.slice(sectionStart, sectionEnd).trimEnd();
		steps.push(parseStepBody(agent, sectionBody));
	}

	const localName = frontmatter.name;
	const parsedPackage = parsePackageName(frontmatter.package, `Chain '${localName}' package`);
	if (parsedPackage.error) throw new Error(parsedPackage.error);
	const packageName = parsedPackage.packageName;
	const extraFields: Record<string, string> = {};
	for (const [key, value] of Object.entries(frontmatter)) {
		if (key === "name" || key === "package" || key === "description") continue;
		extraFields[key] = value;
	}

	return {
		name: buildRuntimeName(localName, packageName),
		localName,
		...(packageName !== undefined ? { packageName } : {}),
		description: frontmatter.description,
		source,
		filePath,
		steps,
		...(Object.keys(extraFields).length > 0 ? { extraFields } : {})
```