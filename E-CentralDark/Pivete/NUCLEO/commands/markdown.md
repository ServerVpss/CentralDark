# COMANDO - markdown.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\plugin-eval\src\renderers\markdown.js
**SHA:** 5d146b3f6e1fd891
**Timestamp:** 2026-08-26T18:40:46.745297
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- ? [`- Suggested prompt: ${result.improvementBrief.suggestedPrompt}`]
- `# Benchmark Run: ${benchmarkPayload.target.name}`,

### Riscos
- `- Risk: ${result.summary.riskLevel}`,
- ? result.summary.riskReasons.map((item) => `- Risk: ${item}`)
- `- Risk: ${diff.riskBefore} -> ${diff.riskAfter}`,

### Ouro Bruto (primeiros 5000 chars)
```
import {
  applyEvaluationPresentation,
  createBenchmarkRunNextAction,
  createBenchmarkTemplateNextAction,
  createBudgetNextAction,
  createComparisonNextAction,
  createEvaluationNextAction,
  createMeasurementPlanNextAction,
  createWorkflowGuideNextAction,
} from "../core/presentation.js";
import { enrichSummary } from "../core/scoring.js";

function detailsBlock(summary, body) {
  const content = Array.isArray(body) ? body.join("\n") : body;
  if (!content || content.trim().length === 0) {
    return "";
  }

  return [`<details>`, `<summary>${summary}</summary>`, "", content, `</details>`].join("\n");
}

function section(title, lines) {
  return [`## ${title}`, ...lines].join("\n");
}

function renderNextAction(nextAction) {
  if (!nextAction) {
    return ["- No recommended next step."];
  }

  return [
    `- ${nextAction.label}`,
    `- Why: ${nextAction.why}`,
    ...(nextAction.chatPrompt ? [`- Chat request: "${nextAction.chatPrompt}"`] : []),
    ...(nextAction.command ? [`- Local command: \`${nextAction.command}\``] : []),
  ];
}

function renderBudgets(budgets) {
  const lines = [
    `- trigger_cost_tokens: ${budgets.trigger_cost_tokens.value} (${budgets.trigger_cost_tokens.band})`,
    `- invoke_cost_tokens: ${budgets.invoke_cost_tokens.value} (${budgets.invoke_cost_tokens.band})`,
    `- deferred_cost_tokens: ${budgets.deferred_cost_tokens.value} (${budgets.deferred_cost_tokens.band})`,
  ];

  if (budgets.explicit_only_invoke_cost_tokens) {
    lines.push(
      `- explicit_only_invoke_cost_tokens: ${budgets.explicit_only_invoke_cost_tokens.value} (${budgets.explicit_only_invoke_cost_tokens.band}, unscored)`,
    );
  }

  lines.push(`- total_tokens: ${budgets.total_tokens.value} (${budgets.total_tokens.band})`);

  if (budgets.invocation_policy?.explicit_only_skill_count > 0) {
    lines.push(
      `- invocation_policy: ${budgets.invocation_policy.implicit_skill_count} implicit skill(s), ${budgets.invocation_policy.explicit_only_skill_count} explicit-only skill(s)`,
    );
  }

  return lines.join("\n");
}

function renderObservedUsage(observedUsage) {
  if (!observedUsage) {
    return "- No observed usage supplied.";
  }

  const comparison = observedUsage.estimateComparison;
  return [
    `- samples: ${observedUsage.sampleCount}`,
    `- observed_input_tokens_avg: ${observedUsage.inputTokens.average}`,
    `- observed_output_tokens_avg: ${observedUsage.outputTokens.average}`,
    `- observed_total_tokens_avg: ${observedUsage.totalTokens.average}`,
    ...(observedUsage.cachedTokens.total > 0
      ? [`- observed_cached_tokens_avg: ${observedUsage.cachedTokens.average}`]
      : []),
    ...(comparison
      ? [
          `- estimated_active_tokens: ${comparison.estimatedActiveTokens}`,
          `- estimate_vs_observed_input_delta: ${comparison.deltaTokens}`,
          `- estimate_vs_observed_input_ratio: ${comparison.deltaRatio} (${comparison.band})`,
        ]
      : []),
  ].join("\n");
}

function renderFindingList(findings, emptyLabel) {
  if (!findings || findings.length === 0) {
    return [`- ${emptyLabel}`];
  }

  return findings.map((finding) => {
    const parts = [`- [${finding.status}/${finding.severity}] ${finding.message}`];
    if (finding.why) {
      parts.push(`Why: ${finding.why}`);
    }
    if (finding.remediation?.length > 0) {
      parts.push(`Fix: ${finding.remediation.join(" ")}`);
    }
    return parts.join(" ");
  });
}

function renderChecks(checks) {
  if (checks.length === 0) {
    return "No checks recorded.";
  }

  return checks
    .map((check) => {
      const parts = [`- [${check.status.toUpperCase()}] ${check.id}: ${check.message}`];
      if (check.why) {
        parts.push(`Why: ${check.why}`);
      }
      if (check.evidence?.length > 0) {
        parts.push(`Evidence: ${check.evidence.join(" ")}`);
      }
      if (check.remediation?.length > 0) {
        parts.push(`Remediation: ${check.remediation.join(" ")}`);
      }
      return parts.join(" ");
    })
    .join("\n");
}

function renderMetrics(metrics) {
  if (metrics.length === 0) {
    return "No metrics recorded.";
  }

  return metrics
    .map((metric) => `- ${metric.id}: ${metric.value} ${metric.unit} (${metric.band})`)
    .join("\n");
}

function renderDeductions(summary) {
  if (!summary.deductions || summary.deductions.length === 0) {
    return "No deductions were applied.";
  }

  return summary.deductions
    .map(
      (entry) =>
        `- -${entry.penalty} points: ${entry.id} [${entry.status}/${entry.severity}] ${entry.message}`,
    )
    .join("\n");
}

function renderCategoryDeductions(summary) {
  if (!summary.categoryDeductions || summary.categoryDeductions.length === 0) {
    return "No category deductions recorded.";
  }

  return summary.categoryDeductions
    .map(
      (entry) =>
        `- ${entry.category}: -${entry.totalPenalty} points across ${entry.checks} check${entry.checks === 1 ? "" : "s"}`,
    )
    .join("\n");
}

function renderWorkflowGu
```