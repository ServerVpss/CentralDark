import * as Sentry from "@sentry/node";
type TelemetryContext = {
    transport?: "stdio" | "http";
    phase?: string;
    tool?: string;
    throttleKey?: string;
    throttleMs?: number;
};
type SanitizableEvent = {
    request?: unknown;
    user?: unknown;
    extra?: unknown;
    breadcrumbs?: unknown[];
    contexts?: Record<string, unknown>;
};
export declare function isMcpTelemetryDisabled(env?: NodeJS.ProcessEnv): boolean;
export declare function scrubSensitiveValue(value: string): string;
export declare function sanitizeSentryEvent<T extends SanitizableEvent>(event: T): T | null;
export declare function initMcpTelemetry(context?: TelemetryContext): boolean;
export declare function captureMcpException(error: unknown, context?: TelemetryContext): void;
export declare function throttleAllows(throttleKey: string, throttleMs: number): boolean;
export declare function captureMcpMessage(message: string, level?: Sentry.SeverityLevel, context?: TelemetryContext): void;
export declare function flushMcpTelemetry(timeoutMs?: number): Promise<void>;
export {};
