import { invoke, isTauri } from "@tauri-apps/api/core";

type DiagnosticState = "start" | "ok" | "pending" | "error";

// Two filters: renderer limits what crosses IPC; Rust allows only fixed codes.
export async function recordDiagnostic(
  action: string, state: DiagnosticState, reason?: unknown, traceId?: string,
): Promise<string | null> {
  if (!isTauri()) return null;
  const raw = typeof reason === "string" ? reason : reason instanceof Error ? reason.message : "";
  const code = /^(?:[A-Z][A-Z0-9_]{1,79}|[a-z][a-z0-9_]{1,63})$/.test(raw) ? raw : "";
  try {
    return await invoke<string | null>("record_remote_diagnostic", { action, state, code, traceId: traceId ?? null });
  } catch {
    // Do not recursively report a failure of the logger itself.
    return null;
  }
}

export async function observeDiagnostic<T>(action: string, operation: Promise<T>): Promise<T> {
  try {
    const value = await operation;
    void recordDiagnostic(action, "ok");
    return value;
  } catch (error) {
    void recordDiagnostic(action, "error", error);
    throw error;
  }
}
