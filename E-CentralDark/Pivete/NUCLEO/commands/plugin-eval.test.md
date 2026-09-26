# COMANDO - plugin-eval.test.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\plugin-eval\tests\plugin-eval.test.js
**SHA:** f101cce8d62a7c5b
**Timestamp:** 2026-08-26T18:40:46.795402
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- defaultPrompt: ["Route the request first."],
- defaultPrompt: [
- dryRun: true,
- const run = await execFileAsync(

### Ouro Bruto (primeiros 5000 chars)
```
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import test from "node:test";
import { promisify } from "node:util";

import { analyzePath, explainBudget } from "../src/core/analyze.js";
import { initializeBenchmark, runBenchmark } from "../src/core/benchmark.js";
import { provisionBenchmarkWorkspace } from "../src/core/benchmark-workspace.js";
import { parseCodexJsonStream, summarizeCodexEvents } from "../src/core/benchmark-events.js";
import { compareResults } from "../src/core/compare.js";
import { buildWorkflowGuide } from "../src/core/workflow-guide.js";
import { parseFrontmatter } from "../src/lib/frontmatter.js";
import { formatCommandPath } from "../src/lib/files.js";
import { renderPayload } from "../src/renderers/index.js";

const execFileAsync = promisify(execFile);
const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const fixturesRoot = path.join(repoRoot, "fixtures");
const cliPath = path.join(repoRoot, "scripts", "plugin-eval.js");
const nodeBin = process.execPath;

async function makeTempDir(prefix) {
  return fs.mkdtemp(path.join(os.tmpdir(), `${prefix}-`));
}

async function writeSkillFixture(rootPath, { description, bodyLines }) {
  await fs.mkdir(rootPath, { recursive: true });
  const body = Array.from({ length: bodyLines }, (_, index) => `Line ${index + 1}`).join("\n");
  await fs.writeFile(
    path.join(rootPath, "SKILL.md"),
    `---\nname: temp-skill\ndescription: ${description}\n---\n\n# Temp Skill\n\n${body}\n`,
    "utf8",
  );
}

async function writeBlockScalarSkillFixture(rootPath, { style = ">", descriptionLines, bodyLines = 3 }) {
  await fs.mkdir(rootPath, { recursive: true });
  const description = descriptionLines.map((line) => `  ${line}`).join("\n");
  const body = Array.from({ length: bodyLines }, (_, index) => `Line ${index + 1}`).join("\n");
  await fs.writeFile(
    path.join(rootPath, "SKILL.md"),
    `---\nname: temp-skill\ndescription: ${style}\n${description}\n---\n\n# Temp Skill\n\n${body}\n`,
    "utf8",
  );
}

async function writePluginBudgetFixture(rootPath) {
  await fs.mkdir(path.join(rootPath, ".codex-plugin"), { recursive: true });
  await fs.writeFile(
    path.join(rootPath, ".codex-plugin", "plugin.json"),
    JSON.stringify(
      {
        name: "policy-aware-plugin",
        version: "0.1.0",
        description: "Evaluate policy-aware plugin budgets.",
        author: {
          name: "Plugin Eval",
        },
        homepage: "https://example.com/",
        license: "MIT",
        keywords: ["fixture"],
        skills: "./skills/",
        interface: {
          displayName: "Policy Aware Plugin",
          shortDescription: "Fixture for policy-aware budgets",
          longDescription: "Fixture for policy-aware budget tests.",
          developerName: "Plugin Eval",
          category: "Developer Tools",
          capabilities: ["Read"],
          defaultPrompt: ["Route the request first."],
          brandColor: "#0B7285",
          composerIcon: "./assets/icon.svg",
          logo: "./assets/logo.svg",
          screenshots: [],
        },
      },
      null,
      2,
    ),
    "utf8",
  );

  await writeSkillFixture(path.join(rootPath, "skills", "router"), {
    description: "Route fixture requests.",
    bodyLines: 3,
  });
  await fs.mkdir(path.join(rootPath, "skills", "router", "agents"), { recursive: true });
  await fs.writeFile(
    path.join(rootPath, "skills", "router", "agents", "openai.yaml"),
    "policy:\n  allow_implicit_invocation: true\n",
    "utf8",
  );

  await writeSkillFixture(path.join(rootPath, "skills", "specialist"), {
    description: `Specialist fixture ${"x".repeat(500)}`,
    bodyLines: 200,
  });
  await fs.mkdir(path.join(rootPath, "skills", "specialist", "agents"), { recursive: true });
  await fs.writeFile(
    path.join(rootPath, "skills", "specialist", "agents", "openai.yaml"),
    "policy:\n  allow_implicit_invocation: false\n",
    "utf8",
  );
}

async function copyDirectory(source, destination) {
  await fs.cp(source, destination, { recursive: true });
}

async function createFakeCodexExecutable(rootPath) {
  const binDir = path.join(rootPath, "bin");
  const executablePath = path.join(binDir, "codex");
  await fs.mkdir(binDir, { recursive: true });
  await fs.writeFile(
    executablePath,
    `#!/bin/sh
if [ "$1" = "--version" ]; then
  echo "codex-cli fake-test"
  exit 0
fi

if [ "$1" = "exec" ]; then
  final=""
  workspace=""
  while [ "$#" -gt 0 ]; do
    if [ "$1" = "--output-last-message" ]; then
      shift
      final="$1"
    elif [ "$1" = "--cd" ]; then
      shift
      workspace="$1"
    fi
    shift
  done

  mkdir -p "$(dirname "$final")"
  printf "Implemented benchmark fixture.\\n" > "$final"
  printf 'export const generated = 1;\\n' > "$workspace/generated.ts"
  printf 'import { generated } from "./generated";\\nexport de
```