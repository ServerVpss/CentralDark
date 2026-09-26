# AGENTE - subagent-control.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\runs\shared\subagent-control.ts
**SHA:** 245294f546b08e5a
**Timestamp:** 2026-08-28T02:24:58.189867
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- `Run: ${runTarget}${event.index !== undefined ? ` step ${event.index + 1}` : ""}`,
- `Run: ${runTarget}${event.index !== undefined ? ` step ${event.index + 1}` : ""}`,
- `Run: ${runTarget}${event.index !== undefined ? ` step ${event.index + 1}` : ""}`,

### Ouro Bruto (primeiros 5000 chars)
```
import {
	type ActivityState,
	type ControlConfig,
	type ControlEvent,
	type ControlEventType,
	type ControlNotificationChannel,
	type ResolvedControlConfig,
} from "../../shared/types.ts";
import { isToolTimeoutExempt } from "./tool-timeout.ts";
import { createHash } from "node:crypto";
import { previewDisplayText } from "../../shared/display-text.ts";

const CONTROL_EVENT_TYPES: ControlEventType[] = ["active_long_running", "needs_attention"];
const CONTROL_NOTIFICATION_CHANNELS: ControlNotificationChannel[] = ["event", "async", "intercom"];
const DEFAULT_NOTIFY_ON: ControlEventType[] = ["active_long_running", "needs_attention"];

export const DEFAULT_CONTROL_CONFIG: ResolvedControlConfig = {
	enabled: true,
	needsAttentionAfterMs: 60_000,
	needsAttentionAfterMsIsExplicit: false,
	activeNoticeAfterMs: 240_000,
	failedToolAttemptsBeforeAttention: 3,
	notifyOn: DEFAULT_NOTIFY_ON,
	notifyChannels: CONTROL_NOTIFICATION_CHANNELS,
};

function parsePositiveInt(value: unknown): number | undefined {
	if (typeof value !== "number") return undefined;
	if (!Number.isFinite(value) || !Number.isInteger(value) || value < 1) return undefined;
	return value;
}

function parseControlList<T extends string>(value: unknown, allowed: readonly T[]): T[] | undefined {
	if (!Array.isArray(value)) return undefined;
	if (value.length === 0) return [];
	const allowedSet = new Set(allowed);
	const parsed = value.filter((entry): entry is T => typeof entry === "string" && allowedSet.has(entry as T));
	return parsed.length > 0 ? Array.from(new Set(parsed)) : undefined;
}

export function resolveControlConfig(
	globalConfig?: ControlConfig,
	override?: ControlConfig,
): ResolvedControlConfig {
	const enabled = override?.enabled ?? globalConfig?.enabled ?? DEFAULT_CONTROL_CONFIG.enabled;
	const overrideNeedsAttentionAfterMs = parsePositiveInt(override?.needsAttentionAfterMs);
	const globalNeedsAttentionAfterMs = parsePositiveInt(globalConfig?.needsAttentionAfterMs);
	const needsAttentionAfterMs = overrideNeedsAttentionAfterMs
		?? globalNeedsAttentionAfterMs
		?? DEFAULT_CONTROL_CONFIG.needsAttentionAfterMs;
	const needsAttentionAfterMsIsExplicit = overrideNeedsAttentionAfterMs !== undefined
		|| globalNeedsAttentionAfterMs !== undefined;
	const activeNoticeAfterMs = parsePositiveInt(override?.activeNoticeAfterMs)
		?? parsePositiveInt(globalConfig?.activeNoticeAfterMs)
		?? DEFAULT_CONTROL_CONFIG.activeNoticeAfterMs;
	const activeNoticeAfterTurns = parsePositiveInt(override?.activeNoticeAfterTurns)
		?? parsePositiveInt(globalConfig?.activeNoticeAfterTurns);
	const activeNoticeAfterTokens = parsePositiveInt(override?.activeNoticeAfterTokens)
		?? parsePositiveInt(globalConfig?.activeNoticeAfterTokens);
	const failedToolAttemptsBeforeAttention = parsePositiveInt(override?.failedToolAttemptsBeforeAttention)
		?? parsePositiveInt(globalConfig?.failedToolAttemptsBeforeAttention)
		?? DEFAULT_CONTROL_CONFIG.failedToolAttemptsBeforeAttention;
	const notifyOn = parseControlList(override?.notifyOn, CONTROL_EVENT_TYPES)
		?? parseControlList(globalConfig?.notifyOn, CONTROL_EVENT_TYPES)
		?? DEFAULT_CONTROL_CONFIG.notifyOn;
	const notifyChannels = parseControlList(override?.notifyChannels, CONTROL_NOTIFICATION_CHANNELS)
		?? parseControlList(globalConfig?.notifyChannels, CONTROL_NOTIFICATION_CHANNELS)
		?? DEFAULT_CONTROL_CONFIG.notifyChannels;
	return {
		enabled,
		needsAttentionAfterMs,
		needsAttentionAfterMsIsExplicit,
		activeNoticeAfterMs,
		activeNoticeAfterTurns,
		activeNoticeAfterTokens,
		failedToolAttemptsBeforeAttention,
		notifyOn: [...notifyOn],
		notifyChannels: [...notifyChannels],
	};
}

function scaledNeedsAttentionAfterMs(config: ResolvedControlConfig, thinking?: string | false): number {
	if (config.needsAttentionAfterMsIsExplicit !== false) return config.needsAttentionAfterMs;
	switch (thinking) {
		case "medium":
			return config.needsAttentionAfterMs * 2;
		case "high":
			return config.needsAttentionAfterMs * 5;
		case "xhigh":
		case "max":
			return config.needsAttentionAfterMs * 10;
		default:
			return config.needsAttentionAfterMs;
	}
}

export function deriveActivityState(input: {
	config: ResolvedControlConfig;
	startedAt: number;
	lastActivityAt?: number;
	currentTool?: string;
	thinking?: string | false;
	now?: number;
}): ActivityState | undefined {
	if (!input.config.enabled || input.currentTool) return undefined;
	const now = input.now ?? Date.now();
	const lastActivity = input.lastActivityAt ?? input.startedAt;
	const ageMs = Math.max(0, now - lastActivity);
	return ageMs > scaledNeedsAttentionAfterMs(input.config, input.thinking) ? "needs_attention" : undefined;
}

export function shouldEmitOpenToolAttention(input: {
	config: ResolvedControlConfig;
	currentTool?: string;
	currentToolStartedAt?: number;
	now?: number;
}): boolean {
	if (!input.config.enabled || !input.currentTool || input.currentToolStartedAt === undefined) return false;
	if (isToolTimeoutExempt(input.currentTool)) return false;
	const now = i
```