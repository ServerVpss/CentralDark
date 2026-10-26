// CentralDark VS Code Restore: private local terminal receiver, no separate agent/daemon.
// Disabled unless the local owner explicitly pairs and enables it. Tailscale Serve may
// privately expose this *loopback* port; never listen on 0.0.0.0.
import * as vscode from "vscode";
import * as http from "node:http";
import { createHash, timingSafeEqual } from "node:crypto";

const SECRET_KEY = "centraldark.remoteTerminal.pairingSecret";
const ID_KEY = "centraldark.remoteTerminal.deviceId";
const MAX_BODY = 4096;
const MAX_OUTPUT = 4096;
const COMMAND_LIMIT = 800;
const REQUEST_ID_RE = /^[a-f0-9-]{36}$/i;
const DEVICE_ID_RE = /^[a-z0-9][a-z0-9_-]{0,63}$/;
let server: http.Server | undefined;
const inflight = new Set<number>();
const seenIds = new Set<string>();
function sha(text: string): string { return createHash("sha256").update(text).digest("hex"); }
function tokenMatches(supplied: string, expected: string): boolean {
  if (!supplied || !expected) return false;
  return timingSafeEqual(Buffer.from(sha(supplied), "hex"), Buffer.from(sha(expected), "hex"));
}
function json(res: http.ServerResponse, code: number, value: Record<string, unknown>): void {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.writeHead(code);
  res.end(JSON.stringify(value));
}
async function bodyJson(req: http.IncomingMessage): Promise<Record<string, unknown>> {
  let value = "";
  for await (const chunk of req) {
    value += String(chunk);
    if (value.length > MAX_BODY) throw new Error("BODY_TOO_LARGE");
  }
  const data: unknown = JSON.parse(value);
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("INVALID_BODY");
  return data as Record<string, unknown>;
}
async function terminalList(): Promise<{ name: string; pid: number | null; shellIntegration: boolean }[]> {
  return Promise.all(vscode.window.terminals.slice(0, 50).map(async terminal => ({
    name: terminal.name.slice(0, 80),
    pid: (await terminal.processId) ?? null,
    shellIntegration: Boolean(terminal.shellIntegration),
  })));
}
async function execute(payload: Record<string, unknown>, deviceId: string): Promise<Record<string, unknown>> {
  const requestId = typeof payload.requestId === "string" ? payload.requestId : "";
  const at = typeof payload.at === "string" ? Date.parse(payload.at) : NaN;
  const pid = payload.pid;
  const command = payload.command;
  const commandHash = payload.commandHash;
  if (!REQUEST_ID_RE.test(requestId) || !Number.isFinite(at) || Math.abs(Date.now() - at) > 20_000
    || typeof pid !== "number" || !Number.isSafeInteger(pid) || pid <= 0
    || typeof command !== "string" || !command.length || command.length > COMMAND_LIMIT
    || /[\r\n\0]/.test(command) || commandHash !== sha(command)) {
    return { ok: false, status: "INVALID_COMMAND_ENVELOPE", deviceId, requestId };
  }
  if (seenIds.has(requestId)) return { ok: false, status: "REPLAY_BLOCKED", deviceId, requestId };
  seenIds.add(requestId);
  if (seenIds.size > 500) {
    const first = seenIds.values().next().value;
    if (first) seenIds.delete(first);
  }
  let selected: vscode.Terminal | undefined;
  for (const terminal of vscode.window.terminals) {
    if (await terminal.processId === pid) { selected = terminal; break; }
  }
  if (!selected) return { ok: false, status: "TERMINAL_PID_NOT_FOUND", deviceId, requestId };
  if (!selected.shellIntegration) return { ok: false, status: "SHELL_INTEGRATION_UNAVAILABLE", deviceId, requestId };
  if (inflight.has(pid)) return { ok: false, status: "TERMINAL_BUSY", deviceId, requestId };
  inflight.add(pid);
  let dispatched = false;
  try {
    const choice = await vscode.window.showWarningMessage(
      "CentralDark remoto solicita execução única em " + selected.name + " (PID " + pid + "): " + command,
      { modal: true, detail: "Aprovar apenas se o terminal estiver livre. Nenhuma outra sessão será criada." },
      "Executar uma vez"
    );
    if (choice !== "Executar uma vez") {
      return { ok: false, status: "LOCAL_CONSENT_DENIED", deviceId, requestId, localConsent: false };
    }
    if (!vscode.window.terminals.includes(selected) || await selected.processId !== pid || !selected.shellIntegration) {
      return { ok: false, status: "TERMINAL_CHANGED", deviceId, requestId, localConsent: true };
    }
    const shell = selected.shellIntegration;
    let execution: vscode.TerminalShellExecution | undefined;
    let finishListener: vscode.Disposable | undefined;
    let resolveEnd: ((code: number | undefined) => void) | undefined;
    const ended = new Promise<number | undefined>(resolve => { resolveEnd = resolve; });
    finishListener = vscode.window.onDidEndTerminalShellExecution(event => {
      if (event.terminal === selected && event.execution === execution) {
        finishListener?.dispose();
        inflight.delete(pid);
        resolveEnd?.(event.exitCode);
      }
    });
    selected.show(false);
    execution = shell.executeCommand(command);
    dispatched = true;
    let output = "";
    // Streaming completes when the shell finishes; never promote missing exit code to PASS.
    const stream = (async () => {
      for await (const chunk of execution!.read()) {
        if (output.length < MAX_OUTPUT) output += chunk.slice(0, MAX_OUTPUT - output.length);
      }
    })();
    let timeoutId: NodeJS.Timeout | undefined;
    const timeout = new Promise<"TIMEOUT">(resolve => { timeoutId = setTimeout(() => resolve("TIMEOUT"), 30_000); });
    const end = await Promise.race([ended, timeout]);
    if (timeoutId) clearTimeout(timeoutId);
    if (end === "TIMEOUT") {
      // Command may still be running. Do not release PID lock or automatically retry.
      void stream.catch(() => {});
      return { ok: false, status: "EXECUTION_OUTCOME_UNKNOWN", deviceId, requestId, localConsent: true };
    }
    await stream.catch(() => {});
    if (typeof end !== "number") {
      return { ok: false, status: "EXIT_CODE_UNKNOWN", deviceId, requestId, localConsent: true, output: output.slice(0, MAX_OUTPUT) };
    }
    return {
      ok: end === 0, status: "EXECUTED", deviceId, requestId, localConsent: true,
      pid, exitCode: end, output: output.slice(0, MAX_OUTPUT),
      observedAt: new Date().toISOString(),
    };
  } catch {
    return { ok: false, status: dispatched ? "EXECUTION_OUTCOME_UNKNOWN" : "DISPATCH_FAILED", deviceId, requestId };
  } finally {
    if (!dispatched) inflight.delete(pid);
  }
}

async function handle(req: http.IncomingMessage, res: http.ServerResponse, context: vscode.ExtensionContext): Promise<void> {
  const configuredId = context.globalState.get<string>(ID_KEY, "");
  const expectedToken = await context.secrets.get(SECRET_KEY);
  const supplied = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!configuredId || !expectedToken || !tokenMatches(supplied, expectedToken)
    || req.headers["x-centraldark-device-id"] !== configuredId) {
    json(res, 401, { ok: false, status: "AUTH_REQUIRED" });
    return;
  }
  if (req.method === "GET" && req.url === "/status") {
    json(res, 200, { ok: true, status: "READY", deviceId: configuredId,
      terminalCount: vscode.window.terminals.length, controlProven: false });
    return;
  }
  if (req.method === "GET" && req.url === "/terminals") {
    json(res, 200, { ok: true, status: "TERMINALS_READ", deviceId: configuredId,
      terminals: await terminalList() });
    return;
  }
  if (req.method === "POST" && req.url === "/execute") {
    try { json(res, 200, await execute(await bodyJson(req), configuredId)); }
    catch { json(res, 400, { ok: false, status: "INVALID_BODY", deviceId: configuredId }); }
    return;
  }
  json(res, 404, { ok: false, status: "UNKNOWN_ROUTE" });
}

export async function startRemoteTerminal(context: vscode.ExtensionContext): Promise<void> {
  if (server) return;
  const config = vscode.workspace.getConfiguration("centraldark.restore");
  if (!config.get<boolean>("remoteTerminalEnabled", false)) return;
  const deviceId = context.globalState.get<string>(ID_KEY, "");
  const secret = await context.secrets.get(SECRET_KEY);
  if (!DEVICE_ID_RE.test(deviceId) || !secret || secret.length < 32) return;
  const port = config.get<number>("remoteTerminalPort", 8719);
  if (!Number.isInteger(port) || port < 1024 || port > 65535) return;
  const candidate = http.createServer((req, res) => { void handle(req, res, context).catch(() =>
    json(res, 500, { ok: false, status: "INTERNAL_ERROR" })); });
  try {
    await new Promise<void>((resolve, reject) => {
      candidate.once("error", reject);
      candidate.listen(port, "127.0.0.1", () => {
        candidate.off("error", reject);
        resolve();
      });
    });
    server = candidate;
    context.subscriptions.push(new vscode.Disposable(() => { server?.close(); server = undefined; }));
  } catch { candidate.close(); }
}

export async function configureRemoteTerminal(context: vscode.ExtensionContext): Promise<void> {
  const id = await vscode.window.showInputBox({
    title: "CentralDark — dispositivo VS Code pareado",
    placeHolder: "Ex.: segredo",
    prompt: "ID ja autorizado no MCP; letras minusculas, numeros, _ e -.",
    validateInput: value => DEVICE_ID_RE.test(value) ? undefined : "ID invalido",
  });
  if (!id) return;
  const secret = await vscode.window.showInputBox({
    title: "CentralDark — segredo de pareamento",
    password: true,
    placeHolder: "Segredo gerado e guardado no cofre autorizado",
    prompt: "Minimo 32 caracteres. Nao enviar em chat nem registrar em Git.",
    validateInput: value => value.length >= 32 ? undefined : "Minimo 32 caracteres",
  });
  if (!secret) return;
  await context.globalState.update(ID_KEY, id);
  await context.secrets.store(SECRET_KEY, secret);
  await vscode.workspace.getConfiguration("centraldark.restore")
    .update("remoteTerminalEnabled", true, vscode.ConfigurationTarget.Global);
  await startRemoteTerminal(context);
  void vscode.window.showInformationMessage("CentralDark: receptor local pareado em 127.0.0.1; acesso externo exige Tailscale Serve privado e MCP autorizado.");
}
export async function remoteTerminalStatus(context: vscode.ExtensionContext): Promise<void> {
  const output = vscode.window.createOutputChannel("CentralDark — Terminal Remoto");
  const secret = await context.secrets.get(SECRET_KEY);
  output.appendLine("ID: " + (context.globalState.get<string>(ID_KEY, "NAO_PAREADO")));
  output.appendLine("PAREAMENTO: " + (secret && secret.length >= 32 ? "CONFIGURADO" : "AUSENTE"));
  output.appendLine("RECEPTOR_LOOPBACK: " + (server?.listening ? "LISTENING" : "INATIVO"));
  for (const term of await terminalList()) {
    output.appendLine("TERMINAL " + term.name + " PID=" + (term.pid ?? "UNKNOWN") + " shellIntegration=" + term.shellIntegration);
  }
  output.appendLine("REDE_TAILSCALE: NAO_PROVADA_NESTE_COMANDO");
  output.show(true);
}
