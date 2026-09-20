import { randomUUID } from "node:crypto";
import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import path from "node:path";
import readline from "node:readline";

export type SemanticAdapterSettings = {
  semanticRepoRoot: string;
  semanticPython: string;
};

type Pending = {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
  timer: ReturnType<typeof setTimeout>;
};

/**
 * Desktop-only bridge to the canonical CentralDark semantic core.
 *
 * One Python process remains alive for the plugin session so the GloVe matrix
 * is loaded once. Perception only: no note write, memory promotion, or network.
 */
export class SemanticClient {
  private child: ChildProcessWithoutNullStreams | null = null;
  private reader: readline.Interface | null = null;
  private readonly pending = new Map<string, Pending>();

  constructor(private readonly settings: SemanticAdapterSettings) {}

  private repoRoot(): string {
    const configured = this.settings.semanticRepoRoot.trim() || process.env.CENTRALDARK_REPO_ROOT || "";
    if (!configured) throw new Error("SEMANTIC_REPO_ROOT_NOT_CONFIGURED");
    return configured;
  }

  private python(): string {
    return this.settings.semanticPython.trim() || process.env.SEMANTIC_PYTHON || (process.platform === "win32" ? "python" : "python3");
  }

  private bridgePath(): string {
    return process.env.SEMANTIC_BRIDGE_PATH || path.join(this.repoRoot(), "infra", "mcp", "semantic_bridge.py");
  }

  private rejectAll(error: Error): void {
    for (const item of this.pending.values()) {
      clearTimeout(item.timer);
      item.reject(error);
    }
    this.pending.clear();
  }

  private ensureBridge(): ChildProcessWithoutNullStreams {
    if (this.child && !this.child.killed) return this.child;
    const child = spawn(this.python(), [this.bridgePath(), "--serve"], {
      cwd: this.repoRoot(),
      env: process.env,
      stdio: ["pipe", "pipe", "pipe"],
      windowsHide: true,
    });
    this.child = child;
    this.reader = readline.createInterface({ input: child.stdout });
    this.reader.on("line", (line) => {
      let payload: any;
      try {
        payload = JSON.parse(line);
      } catch {
        return;
      }
      const item = this.pending.get(payload?.id);
      if (!item) return;
      this.pending.delete(payload.id);
      clearTimeout(item.timer);
      if (payload.ok === true) item.resolve(payload.result);
      else item.reject(new Error(`${payload.error || "SEMANTIC_ERROR"}: ${payload.message || ""}`.trim()));
    });
    child.stderr.on("data", () => {});
    child.on("error", (error) => {
      this.rejectAll(error);
      this.child = null;
    });
    child.on("exit", (code, signal) => {
      this.rejectAll(new Error(`SEMANTIC_BRIDGE_EXIT code=${code ?? "null"} signal=${signal ?? "null"}`));
      this.reader?.close();
      this.reader = null;
      this.child = null;
    });
    return child;
  }

  call(operation: string, args: Record<string, unknown> = {}): Promise<any> {
    const child = this.ensureBridge();
    const id = randomUUID();
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`SEMANTIC_BRIDGE_TIMEOUT operation=${operation}`));
      }, 60_000);
      this.pending.set(id, { resolve, reject, timer });
      child.stdin.write(`${JSON.stringify({ id, operation, args })}\n`, (error) => {
        if (!error) return;
        this.pending.delete(id);
        clearTimeout(timer);
        reject(error);
      });
    });
  }

  async expand(text: string, topK = 8): Promise<any> {
    return this.call("semantic_expand", { text, top_k: topK });
  }

  async modelInfo(): Promise<any> {
    return this.call("semantic_model_info", {});
  }

  stop(): void {
    this.reader?.close();
    this.reader = null;
    if (this.child && !this.child.killed) this.child.kill();
    this.child = null;
    this.rejectAll(new Error("SEMANTIC_BRIDGE_STOPPED"));
  }
}
