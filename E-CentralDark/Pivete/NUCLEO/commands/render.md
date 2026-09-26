# COMANDO - render.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\tui\render.ts
**SHA:** 12f18d57297e43e4
**Timestamp:** 2026-08-28T02:24:59.741132
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- start: number;
- const start = childFlatIndexes.length ? Math.min(...childFlatIndexes) : flatCursor;
- const start = node.flatIndex ?? flatCursor;
- let start = 0;
- spans.push({ stepIndex, start: group.start, count: group.count, isParallel: true });
- spans.push({ stepIndex, start: flatIndex, count: flatIndex < stepCount ? 1 : 0, isParallel: false });
- const groupStart = span?.start ?? 0;
- : job.parallelGroups?.find((group) => group.start === 0);
- function nestedRunName(run: NestedRunSummary): string {
- function nestedRunSeed(run: NestedRunSummary): number | undefined {

### Padroes
- const ansiStylePattern = /\x1b\[[0-9;]*m/y;
- const ansiEscapePattern = /\x1b\[[0-9;]*m/g;
- const liveOutputWordSignalPattern = /\b(?:access denied|denied|error|exception|fail(?:ed|ure)?|fatal|panic|rejected|timeout|timed out|unable|warning)\b/i;
- const liveOutputCodeSignalPattern = /\bE[A-Z0-9_]{2,}\b/;
- "pattern: repeated short status lines",

### Contratos
- const aggregate = formatNestedAggregate(items);
- const aggregate = formatNestedAggregate(items.slice(index));
- const aggregate = formatNestedAggregate([...(child.steps?.flatMap((step) => step.children ?? []) ?? []), ...(child.children ?? [])]);

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Rendering functions for subagent results
 */

import * as path from "node:path";
import { createHash } from "node:crypto";
import type { AgentToolResult } from "@earendil-works/pi-agent-core";
import { getMarkdownTheme, keyText, type ExtensionContext } from "@earendil-works/pi-coding-agent";
import { Container, Markdown, Spacer, Text, visibleWidth, type Component } from "@earendil-works/pi-tui";
import {
	type AgentProgress,
	type AsyncJobState,
	type AsyncJobStep,
	type AsyncParallelGroupStatus,
	type Details,
	type NestedRunSummary,
	type NestedStepSummary,
	type WorkflowNodeStatus,
	type MainWindowRendererConfig,
	MAX_WIDGET_JOBS,
	WIDGET_ANIMATION_INTERVAL_MS,
	WIDGET_KEY,
} from "../shared/types.ts";
import { previewDisplayText, sanitizeDisplayText, truncateDisplayText } from "../shared/display-text.ts";
import { FLEET_OPEN_SHORTCUT, formatShortcutLabel } from "../shared/shortcuts.ts";
import { formatTokens, formatUsage, formatDuration, formatModelThinking, formatToolCall, formatTokenUsage, shortenPath } from "../shared/formatters.ts";
import { getDisplayItems, getSingleResultOutput, PROMPT_REDACTED } from "../shared/utils.ts";
import { flatToLogicalStepIndex } from "../runs/background/parallel-groups.ts";
import { formatNestedAggregate } from "../runs/shared/nested-render.ts";
import { aggregateStepStatus, formatActivityLabel, formatAgentRunningLabel, formatParallelOutcome } from "../shared/status-format.ts";
import { contextModeBadge, contextModePrefix } from "../runs/shared/context-mode.ts";
import { buildWorkflowChatProgressRows, type WorkflowChatProgressRow } from "../workflows/chat-progress.ts";
import { encodeAsyncStatusSnapshotWidget } from "../runs/background/async-status-snapshot.ts";

type Theme = ExtensionContext["ui"]["theme"];

interface MainWindowRenderLayout {
	horizontalSpacing: number;
	compactResultMaxLines?: number;
}

function resolveMainWindowRenderLayout(config?: MainWindowRendererConfig): MainWindowRenderLayout {
	return {
		horizontalSpacing: config?.horizontalSpacing ?? 2,
		...(config?.compactResultMaxLines !== undefined ? { compactResultMaxLines: config.compactResultMaxLines } : {}),
	};
}

function mainWindowIndent(layout: MainWindowRenderLayout, level: number): string {
	return " ".repeat(Math.max(0, layout.horizontalSpacing * level));
}

function capCompactMainWindowResult(component: Component, layout: MainWindowRenderLayout, theme: Theme, enabled: boolean): Component {
	const maxLines = layout.compactResultMaxLines;
	if (!enabled || maxLines === undefined) return component;
	const capped = new Container();
	capped.render = (width: number): string[] => {
		const lines = component.render(width);
		if (lines.length <= maxLines) return lines;
		const visibleRows = maxLines === 1 ? 1 : maxLines - 1;
		const hiddenCount = lines.length - visibleRows;
		const hint = theme.fg("accent", `… ${hiddenCount} rows hidden · ${liveDetailKeyText()} expands`);
		if (maxLines === 1) return [truncLine(`${lines[0] ?? ""} ${hint}`, width)];
		return [...lines.slice(0, visibleRows), truncLine(hint, width)];
	};
	return capped;
}

function liveDetailKeyText(): string {
	return keyText("app.tools.expand");
}

export function liveDetailHintText(): string {
	return `Press ${liveDetailKeyText()} for live detail · ${formatShortcutLabel(FLEET_OPEN_SHORTCUT)} Fleet`;
}

function foregroundSingleHintText(shortcut?: string): string {
	if (!shortcut) return liveDetailHintText();
	const label = formatShortcutLabel(shortcut);
	return `${liveDetailHintText()} · ${label} to run in background`;
}

function getTermWidth(): number {
	return process.stdout.columns || 120;
}

const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
const ansiStylePattern = /\x1b\[[0-9;]*m/y;

/**
 * Truncate a line to maxWidth, preserving ANSI styling through the ellipsis.
 * 
 * pi-tui's truncateToWidth adds \x1b[0m before ellipsis which resets all styling,
 * causing background color bleed in the TUI. This implementation tracks active
 * ANSI styles and re-applies them before the ellipsis.
 * 
 * Uses Intl.Segmenter for proper Unicode/emoji handling (not char-by-char).
 */
export function truncLine(text: string, maxWidth: number): string {
	if (maxWidth <= 0) return "";
	if (visibleWidth(text) <= maxWidth) return text;

	const targetWidth = maxWidth - 1;
	let result = "";
	let currentWidth = 0;
	let activeStyles: string[] = [];
	let i = 0;

	while (i < text.length) {
		ansiStylePattern.lastIndex = i;
		const ansiMatch = ansiStylePattern.exec(text);
		if (ansiMatch) {
			const code = ansiMatch[0];
			result += code;

			if (code === "\x1b[0m" || code === "\x1b[m") {
				activeStyles = [];
			} else {
				activeStyles.push(code);
			}
			i += code.length;
			continue;
		}

		let end = text.indexOf("\x1b[", i);
		if (end === i) end = text.indexOf("\x1b[", i + 2);
		if (end === -1) end = text.length;
		const textPortion = text.slice(i, end);
		for (const seg of segmenter.segment(textPortion)) {
			const g
```