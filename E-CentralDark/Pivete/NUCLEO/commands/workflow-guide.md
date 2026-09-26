# COMANDO - workflow-guide.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\plugin-eval\src\core\workflow-guide.js
**SHA:** 50a4e259eea67936
**Timestamp:** 2026-08-26T18:40:45.886276
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const chatPrompt = chatPromptForGoal(goal, target);
- requestedChatPrompt: options.request || null,
- chatPrompt: routedRequest,

### Ouro Bruto (primeiros 5000 chars)
```
import path from "node:path";

import { formatCommandPath, pathExists, relativePath } from "../lib/files.js";
import { createWorkflowGuideNextAction } from "./presentation.js";
import { resolveTarget } from "./target.js";

function shellQuote(value) {
  return `'${String(value).replaceAll("'", "'\\''")}'`;
}

function benchmarkConfigPath(target) {
  return path.join(target.path, ".plugin-eval", "benchmark.json");
}

function usageLogPath(target) {
  return path.join(target.path, ".plugin-eval", "benchmark-usage.jsonl");
}

function targetLabel(target) {
  if (target.kind === "plugin") {
    return "plugin";
  }
  if (target.kind === "skill") {
    return "skill";
  }
  return "target";
}

function chatPromptForGoal(goal, target) {
  const label = targetLabel(target);
  if (goal === "analysis") {
    return `Give me a full analysis of this ${label}, including benchmark setup.`;
  }
  if (goal === "evaluate") {
    return `Evaluate this ${label}.`;
  }
  if (goal === "budget") {
    return `Explain the token budget for this ${label}.`;
  }
  if (goal === "measure") {
    return `Measure the real token usage of this ${label}.`;
  }
  if (goal === "benchmark") {
    return `Help me benchmark this ${label}.`;
  }
  return "What should I run next?";
}

function requestSignal(phrases, reason) {
  return {
    phrases,
    reason,
  };
}

function inferGoalFromRequest(requestText) {
  const normalized = String(requestText || "")
    .trim()
    .toLowerCase();

  if (!normalized) {
    return null;
  }

  const signals = [
    [
      "analysis",
      requestSignal(
        [
          "full analysis",
          "full eval",
          "full evaluation",
          "analyze this",
          "analysis of",
          "give me an analysis",
          "deep analysis",
          "deep dive",
        ],
        "it asks for a fuller analysis flow instead of only a single report or benchmark step",
      ),
    ],
    [
      "measure",
      requestSignal(
        [
          "measure the real token usage",
          "real token usage",
          "observed usage",
          "actual token usage",
          "measure token usage",
        ],
        "it asks for measured or observed token usage",
      ),
    ],
    [
      "benchmark",
      requestSignal(
        [
          "benchmark",
          "dry-run",
          "dry run",
          "starter scenario",
          "scenario",
        ],
        "it asks for a benchmark flow or scenario harness",
      ),
    ],
    [
      "budget",
      requestSignal(
        [
          "explain the token budget",
          "token budget",
          "context cost",
          "cost feels heavy",
          "why is this expensive",
        ],
        "it asks why the target feels expensive before measuring live usage",
      ),
    ],
    [
      "evaluate",
      requestSignal(
        [
          "evaluate",
          "audit",
          "review",
          "score",
          "report on",
          "why did this score",
          "what should i fix first",
          "fix first",
        ],
        "it asks for the overall evaluation report or prioritized findings from it",
      ),
    ],
    [
      "next",
      requestSignal(
        [
          "what should i run next",
          "what next",
          "where should i start",
          "where do i start",
          "start here",
          "i'm not sure",
        ],
        "it asks for the best next step instead of a specific workflow",
      ),
    ],
  ];

  for (const [goal, signal] of signals) {
    if (signal.phrases.some((phrase) => normalized.includes(phrase))) {
      return {
        goal,
        reason: signal.reason,
      };
    }
  }

  return null;
}

function workflowLabel(goal, target) {
  if (goal === "analysis") {
    return target.kind === "plugin" ? "Full Plugin Analysis" : "Full Skill Analysis";
  }
  if (goal === "evaluate") {
    return target.kind === "plugin" ? "Evaluate Plugin" : "Evaluate Skill";
  }
  if (goal === "budget") {
    return "Explain Token Budget";
  }
  if (goal === "measure") {
    return "Measure Real Token Usage";
  }
  if (goal === "benchmark") {
    return "Benchmark With Starter Scenarios";
  }
  return "Start Here";
}

function commandsForGoal(goal, target, status) {
  const commandTargetPath = formatCommandPath(target.path);
  const commandConfigPath = formatCommandPath(benchmarkConfigPath(target));
  const commandUsagePath = formatCommandPath(usageLogPath(target));

  if (goal === "analysis") {
    if (!status.hasBenchmarkConfig) {
      return [
        `plugin-eval analyze ${commandTargetPath} --format markdown`,
        `plugin-eval init-benchmark ${commandTargetPath}`,
        `plugin-eval benchmark ${commandTargetPath} --config ${commandConfigPath}`,
      ];
    }

    if (!status.hasUsageLog) {
      return [
        `plugin-eval analyze ${commandTargetPath} --format markdown`,
        `plugin-eval benchmark ${commandTargetPath} --config ${commandConfigPath}`,
      ];
    
```