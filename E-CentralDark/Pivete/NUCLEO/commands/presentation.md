# COMANDO - presentation.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\plugin-eval\src\core\presentation.js
**SHA:** 274beb483bee0c99
**Timestamp:** 2026-08-26T18:40:45.212565
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- chatPrompt: "What should I fix first?",
- chatPrompt: `Measure the real token usage of this ${labelName}.`,
- chatPrompt: "What should I run next?",
- chatPrompt: "What should I fix first?",
- chatPrompt: "What should I run next?",
- chatPrompt: startHere?.chatPrompt || guide.recommendedWorkflow?.chatPrompt,
- chatPrompt: `What should I run next?`,
- chatPrompt: `Measure the real token usage of this ${labelName}.`,
- chatPrompt: `Evaluate this ${labelName}.`,
- chatPrompt: `Help me benchmark this ${targetLabel(payload.target)}.`,

### Ouro Bruto (primeiros 5000 chars)
```
import { formatCommandPath, relativePath } from "../lib/files.js";
import { enrichSummary } from "./scoring.js";

function shellQuote(value) {
  return `'${String(value).replaceAll("'", "'\\''")}'`;
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

function targetTypeLabel(target) {
  if (target.kind === "plugin") {
    return "plugin";
  }
  if (target.kind === "skill") {
    return "skill";
  }
  return "item";
}

function buildStartCommand(target, chatPrompt) {
  return `plugin-eval start ${formatCommandPath(target.path)} --request ${shellQuote(chatPrompt)} --format markdown`;
}

function hasStructuralFailures(result) {
  return result.checks.some(
    (check) =>
      check.status === "fail" &&
      (check.category === "manifest" || check.category === "skill-structure"),
  );
}

function hasBudgetPressure(result) {
  return ["heavy", "excessive"].includes(result.budgets?.trigger_cost_tokens?.band) ||
    ["heavy", "excessive"].includes(result.budgets?.invoke_cost_tokens?.band);
}

function hasWarningsOrFailures(result) {
  return result.checks.some((check) => check.status === "fail" || check.status === "warn");
}

export function createEvaluationNextAction(result) {
  const labelName = targetLabel(result.target);

  if (hasStructuralFailures(result)) {
    return {
      label: "Fix structural issues first",
      why: "Failing manifest or skill structure issues reduce trust and can invalidate later measurements.",
      command: buildStartCommand(result.target, "What should I fix first?"),
      chatPrompt: "What should I fix first?",
    };
  }

  if (!result.observedUsage?.sampleCount && hasBudgetPressure(result)) {
    return {
      label: "Measure real token usage next",
      why: "The static budget looks heavy, so live usage is the fastest way to confirm whether the cost is acceptable.",
      command: buildStartCommand(result.target, `Measure the real token usage of this ${labelName}.`),
      chatPrompt: `Measure the real token usage of this ${labelName}.`,
    };
  }

  if (result.observedUsage?.sampleCount) {
    return {
      label: "Review the measurement plan",
      why: "You already have observed usage, so the highest-value next step is deciding what to instrument or improve.",
      command: buildStartCommand(result.target, "What should I run next?"),
      chatPrompt: "What should I run next?",
    };
  }

  if (hasWarningsOrFailures(result)) {
    return {
      label: "Fix the top findings and rerun the report",
      why: "A short pass on the highest-value findings will improve trust, readability, and the signal quality of future benchmarks.",
      command: buildStartCommand(result.target, "What should I fix first?"),
      chatPrompt: "What should I fix first?",
    };
  }

  return {
    label: "Choose the next workflow from chat",
    why: "The report is clean enough that the best next step depends on whether you want budgets, benchmarks, or comparisons.",
    command: buildStartCommand(result.target, "What should I run next?"),
    chatPrompt: "What should I run next?",
  };
}

export function applyEvaluationPresentation(result) {
  result.summary = enrichSummary(result, result.summary);
  if (!result.nextAction) {
    result.nextAction = createEvaluationNextAction(result);
  }
  return result;
}

export function createWorkflowGuideNextAction(guide) {
  const startHere = guide.startHere || guide.recommendedWorkflow;
  return {
    label: startHere?.label || guide.recommendedWorkflow?.label || "Start here",
    why: startHere?.routingExplanation || guide.recommendedWorkflow?.summary || guide.beginnerSummary,
    command: startHere?.firstCommand || guide.recommendedWorkflow?.firstCommand,
    chatPrompt: startHere?.chatPrompt || guide.recommendedWorkflow?.chatPrompt,
  };
}

export function createMeasurementPlanNextAction(plan) {
  const toolset = plan.toolsets.find((entry) => plan.recommendedToolsets.includes(entry.id)) || plan.toolsets[0];
  const targetKind = targetTypeLabel(plan.target);

  return {
    label: toolset ? `Start with ${toolset.label}` : "Decide what to measure next",
    why: toolset
      ? toolset.goal
      : "A small measurement pass will turn the current report into a more trustworthy workflow decision.",
    command: buildStartCommand(plan.target, `What should I run next?`),
    chatPrompt: `What should I run next?`,
    ...(toolset ? { toolsetId: toolset.id } : {}),
    ...(toolset
      ? {}
      : {
          why: `Use Plugin Eval to decide the next measurement move for this ${targetKind}.`,
        }),
  };
}

export function createBudgetNextAction(payload) {
  const labelName = targetLabel(payload.target);
  const hasHeavyBudget = ["heavy", "excessive"].includes(payload.budgets?.trigger_cost_tokens?.band) ||
    ["heavy", "excessive"].includes(payload.budgets?.invoke_cost_tokens?.band);

  if (hasHeavyBudget) {
    return {
  
```