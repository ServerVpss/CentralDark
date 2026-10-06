// HUD CentralDark dentro do mesmo plugin Grafo Vivo.
// Projeta o HUD.html e o runtime Hermes original sem criar segundo painel/runtime/owner.
// Fontes: Hermes Desktop local (transport/SSH) + Hermes VPS via SSH.

import { ItemView, Platform, WorkspaceLeaf } from "obsidian";
import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import type GrafoVivoPlugin from "./main";

export const VIEW_TYPE_HUD_CENTRALDARK = "centraldark-hud-live-view";

type LiveState = "PASS" | "WARN" | "FAIL" | "UNKNOWN";

type HermesProbe = {
  gateway: LiveState;
  serve: LiveState;
  mcp: LiveState;
  a2a: LiveState;
  webhook: LiveState;
  cron: LiveState;
  model: string;
  gatewayPid: string;
  servePid: string;
  checkedAt: string;
};

const EMPTY_PROBE: HermesProbe = {
  gateway: "UNKNOWN",
  serve: "UNKNOWN",
  mcp: "UNKNOWN",
  a2a: "UNKNOWN",
  webhook: "UNKNOWN",
  cron: "UNKNOWN",
  model: "UNKNOWN",
  gatewayPid: "—",
  servePid: "—",
  checkedAt: "—",
};

function toFileUrl(fullPath: string): string {
  const normalized = fullPath.replace(/\\/g, "/");
  const parts = normalized.split("/");
  const encoded = parts.map((part, index) => {
    if (index === 0 && /^[A-Za-z]:$/.test(part)) return part;
    return encodeURIComponent(part);
  }).join("/");
  return `file:///${encoded}`;
}

function sanitizeLogLine(line: string): string {
  return line
    .replace(/(Bearer\s+)[A-Za-z0-9._~+\/-]+/gi, "$1[REDACTED]")
    .replace(/((?:api[_-]?key|token|secret|password)\s*[=:]\s*)[^\s,;]+/gi, "$1[REDACTED]")
    .replace(/xp_[A-Za-z0-9_-]{12,}/g, "[REDACTED]");
}

function stateIcon(state: LiveState): string {
  if (state === "PASS") return "🟢";
  if (state === "WARN") return "🟡";
  if (state === "FAIL") return "🔴";
  return "⚪";
}

function stateClass(state: LiveState): string {
  return `cd-hermes-${state.toLowerCase()}`;
}

function execText(command: string, args: string[], timeoutMs = 9000): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(command, args, {
      windowsHide: true,
      timeout: timeoutMs,
      maxBuffer: 1024 * 1024,
      encoding: "utf8",
    }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(String(stderr || stdout || error.message).trim()));
        return;
      }
      resolve(String(stdout || stderr || ""));
    });
  });
}

export class HudCentralDarkView extends ItemView {
  plugin: GrafoVivoPlugin;

  private iframe: HTMLIFrameElement | null = null;
  private statusEl: HTMLSpanElement | null = null;
  private cardsEl: HTMLElement | null = null;
  private logsEl: HTMLElement | null = null;
  private sourceEl: HTMLElement | null = null;
  private timer: number | null = null;
  private refreshInFlight = false;
  private lastLogSignature = "";
  private probe: HermesProbe = { ...EMPTY_PROBE };

  constructor(leaf: WorkspaceLeaf, plugin: GrafoVivoPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType() { return VIEW_TYPE_HUD_CENTRALDARK; }
  getDisplayText() { return "HUD CentralDark"; }
  getIcon() { return "layout-dashboard"; }

  async onOpen() {
    const root = this.containerEl.children[1] as HTMLElement;
    root.empty();
    root.addClass("cd-hud-live-root");

    const toolbar = root.createDiv({ cls: "cd-grafo-toolbar cd-hud-toolbar" });
    const title = toolbar.createEl("strong", { text: "🪬 HUD · HERMES LIVE" });
    title.style.marginRight = "auto";

    const reload = toolbar.createEl("button", { text: "🔄", cls: "cd-grafo-btn" });
    reload.setAttr("aria-label", "Recarregar HUD e runtime Hermes");
    reload.addEventListener("click", () => void this.refreshAll());

    this.statusEl = toolbar.createEl("span", { cls: "cd-grafo-status", text: "…" });

    this.cardsEl = root.createDiv({ cls: "cd-hermes-status-grid" });
    this.renderStatusCards();

    const frame = root.createDiv({ cls: "cd-hud-frame" });
    this.iframe = frame.createEl("iframe");
    this.iframe.setAttr("title", "HUD CentralDark LIVE");
    this.iframe.addClass("cd-hud-iframe");

    const logPanel = root.createDiv({ cls: "cd-hermes-log-panel" });
    const logHeader = logPanel.createDiv({ cls: "cd-hermes-log-header" });
    logHeader.createEl("strong", { text: "📡 HERMES ORIGINAL · LIVE STREAM" });
    this.sourceEl = logHeader.createSpan({ text: "SSH + Desktop" });

    this.logsEl = logPanel.createDiv({ cls: "cd-hermes-log-stream" });
    this.logsEl.createDiv({
      cls: "cd-hermes-log-line cd-hermes-log-info",
      text: "Aguardando primeira leitura do runtime…",
    });

    await this.carregarHud();
    await this.refreshHermesLive();
    this.startLiveLoop();
  }

  async onClose() {
    this.stopLiveLoop();
  }

  private startLiveLoop() {
    this.stopLiveLoop();
    const interval = Math.max(1000, this.plugin.settings.hermesLiveRefreshMs || 1500);
    this.timer = window.setInterval(() => void this.refreshHermesLive(), interval);
  }

  private stopLiveLoop() {
    if (this.timer !== null) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
  }

  private async refreshAll() {
    await Promise.all([this.carregarHud(), this.refreshHermesLive()]);
  }

  private renderStatusCards() {
    if (!this.cardsEl) return;
    this.cardsEl.empty();

    const cards: Array<[string, string, LiveState]> = [
      ["🧠 GATEWAY", this.probe.gatewayPid === "—" ? "gateway" : `PID ${this.probe.gatewayPid}`, this.probe.gateway],
      ["🌐 SERVE", this.probe.servePid === "—" ? ":9119" : `PID ${this.probe.servePid} · :9119`, this.probe.serve],
      ["🔌 MCP", ":9100", this.probe.mcp],
      ["🛰️ A2A", ":9900", this.probe.a2a],
      ["🪝 WEBHOOK", ":8644", this.probe.webhook],
      ["⏰ CRON", "scheduler", this.probe.cron],
      ["🧬 MODEL", this.probe.model, this.probe.model === "UNKNOWN" ? "UNKNOWN" : "PASS"],
    ];

    for (const [label, detail, state] of cards) {
      const card = this.cardsEl.createDiv({ cls: `cd-hermes-status-card ${stateClass(state)}` });
      const head = card.createDiv({ cls: "cd-hermes-status-head" });
      head.createSpan({ text: stateIcon(state) });
      head.createEl("strong", { text: label });
      card.createDiv({ cls: "cd-hermes-status-detail", text: detail });
    }
  }

  private classifyLog(line: string): string {
    const lower = line.toLowerCase();
    if (/error|fatal|traceback|failed|timed out|timeout/.test(lower)) return "cd-hermes-log-error";
    if (/warning|warn|degraded|misrouted|retry|reconnect/.test(lower)) return "cd-hermes-log-warn";
    if (/connected|healthy|ready|running|complete|completed|pass|listening|recovered|accepted/.test(lower)) return "cd-hermes-log-pass";
    return "cd-hermes-log-info";
  }

  private renderLogs(lines: string[]) {
    if (!this.logsEl) return;

    const clean = lines.map(sanitizeLogLine).filter(Boolean).slice(-90);
    const signature = clean.slice(-16).join("\n");
    if (signature === this.lastLogSignature) return;
    this.lastLogSignature = signature;

    this.logsEl.empty();
    for (const line of clean) {
      this.logsEl.createDiv({
        cls: `cd-hermes-log-line ${this.classifyLog(line)}`,
        text: line,
      });
    }
    this.logsEl.scrollTop = this.logsEl.scrollHeight;
  }

  private async refreshHermesLive() {
    if (!Platform.isDesktopApp || this.refreshInFlight) return;
    this.refreshInFlight = true;

    try {
      const alias = (this.plugin.settings.hermesSshHost || "Segredo-VPS").trim();
      const localLines = await this.readDesktopTransportTail();

      const remoteScript = [
        "echo __STATUS__",
        "G=$(pgrep -f 'hermes.*gateway run' | head -1); [ -n \"$G\" ] && echo GATEWAY=PASS:$G || echo GATEWAY=FAIL:-",
        "S=$(pgrep -f 'hermes.*serve.*9119' | head -1); [ -n \"$S\" ] && echo SERVE=PASS:$S || echo SERVE=FAIL:-",
        "ss -ltn 2>/dev/null | grep -q ':9100 ' && echo MCP=PASS || echo MCP=FAIL",
        "ss -ltn 2>/dev/null | grep -q ':9900 ' && echo A2A=PASS || echo A2A=FAIL",
        "ss -ltn 2>/dev/null | grep -q ':8644 ' && echo WEBHOOK=PASS || echo WEBHOOK=FAIL",
        "hermes cron list 2>/dev/null | grep -q '\\[active\\]' && echo CRON=PASS || echo CRON=WARN",
        "M=$(grep -m1 -E '^[[:space:]]*default:' /root/.hermes/config.yaml 2>/dev/null | sed 's/.*default:[[:space:]]*//'); echo MODEL=${M:-UNKNOWN}",
        "echo __LOGS__",
        "tail -n 16 /root/.hermes/logs/gui.log 2>/dev/null | sed 's/^/[GUI] /'",
        "tail -n 12 /root/.hermes/logs/gateway.log 2>/dev/null | sed 's/^/[GATEWAY] /'",
        "tail -n 12 /root/.hermes/logs/agent.log 2>/dev/null | sed 's/^/[AGENT] /'",
        "tail -n 6 /root/.hermes/logs/errors.log 2>/dev/null | sed 's/^/[ERRORS] /'",
      ].join("; ");

      const remote = await execText("ssh", [
        "-o", "BatchMode=yes",
        "-o", "ConnectTimeout=4",
        alias,
        remoteScript,
      ]);

      const all = remote.split(/\r?\n/);
      const statusStart = all.indexOf("__STATUS__");
      const logStart = all.indexOf("__LOGS__");
      const statusLines = all.slice(statusStart + 1, logStart >= 0 ? logStart : undefined);
      const remoteLogs = logStart >= 0 ? all.slice(logStart + 1) : [];

      const next: HermesProbe = {
        ...EMPTY_PROBE,
        checkedAt: new Date().toLocaleTimeString("pt-BR"),
      };

      for (const line of statusLines) {
        if (line.startsWith("GATEWAY=")) {
          const payload = line.slice(8);
          const [state, pid] = payload.split(":");
          next.gateway = state === "PASS" ? "PASS" : "FAIL";
          next.gatewayPid = pid || "—";
        } else if (line.startsWith("SERVE=")) {
          const payload = line.slice(6);
          const [state, pid] = payload.split(":");
          next.serve = state === "PASS" ? "PASS" : "FAIL";
          next.servePid = pid || "—";
        } else if (line === "MCP=PASS") next.mcp = "PASS";
        else if (line === "MCP=FAIL") next.mcp = "FAIL";
        else if (line === "A2A=PASS") next.a2a = "PASS";
        else if (line === "A2A=FAIL") next.a2a = "FAIL";
        else if (line === "WEBHOOK=PASS") next.webhook = "PASS";
        else if (line === "WEBHOOK=FAIL") next.webhook = "FAIL";
        else if (line === "CRON=PASS") next.cron = "PASS";
        else if (line === "CRON=WARN") next.cron = "WARN";
        else if (line.startsWith("MODEL=")) next.model = line.slice(6).trim() || "UNKNOWN";
      }

      this.probe = next;
      this.renderStatusCards();
      this.renderLogs([
        ...localLines.map((line) => `[DESKTOP] ${line}`),
        ...remoteLogs,
      ]);
      if (this.sourceEl) this.sourceEl.setText(`🟢 ${alias} · ${next.checkedAt}`);
    } catch (error: any) {
      this.probe = {
        ...this.probe,
        gateway: "UNKNOWN",
        serve: "UNKNOWN",
        mcp: "UNKNOWN",
        a2a: "UNKNOWN",
        webhook: "UNKNOWN",
        cron: "UNKNOWN",
        checkedAt: new Date().toLocaleTimeString("pt-BR"),
      };
      this.renderStatusCards();

      if (this.sourceEl) this.sourceEl.setText("🟡 SSH indisponível");
      const localLines = await this.readDesktopTransportTail();
      this.renderLogs([
        ...localLines.map((line) => `[DESKTOP] ${line}`),
        `[HUD] WARN ${error?.message || error}`,
      ]);
    } finally {
      this.refreshInFlight = false;
    }
  }

  private async readDesktopTransportTail(): Promise<string[]> {
    try {
      const root = process.env.LOCALAPPDATA || join(homedir(), "AppData", "Local");
      const path = join(root, "hermes", "logs", "desktop.log");
      const raw = await readFile(path, "utf8");
      return raw.split(/\r?\n/).filter(Boolean).slice(-12);
    } catch {
      return [];
    }
  }

  private async carregarHud() {
    if (!this.iframe) return;

    const adapter = this.app.vault.adapter as any;
    const candidates = ["HUD.html", "docs/HUD/HUD.html"];
    let hudPath: string | null = null;

    for (const candidate of candidates) {
      try {
        if (await adapter.exists(candidate)) {
          hudPath = candidate;
          break;
        }
      } catch {
        // tenta o próximo binding conhecido
      }
    }

    if (!hudPath) {
      if (this.statusEl) this.statusEl.setText("🔴 HUD.html não encontrado");
      this.iframe.srcdoc = "<h2 style='font-family:sans-serif;padding:24px'>HUD.html não encontrado no vault.</h2>";
      return;
    }

    try {
      if (typeof adapter.getFullPath === "function") {
        const fullPath = adapter.getFullPath(hudPath);
        this.iframe.removeAttribute("srcdoc");
        this.iframe.src = toFileUrl(fullPath);
      } else {
        const html = await adapter.read(hudPath);
        this.iframe.removeAttribute("src");
        this.iframe.srcdoc = html;
      }

      const stat = await adapter.stat(hudPath);
      const stamp = stat?.mtime ? new Date(stat.mtime).toLocaleTimeString("pt-BR") : "LIVE";
      if (this.statusEl) this.statusEl.setText(`🟢 ${hudPath} · ${stamp}`);
    } catch (error: any) {
      if (this.statusEl) this.statusEl.setText(`🔴 ${error?.message || error}`);
      console.error("[HUD CentralDark] falha ao abrir HUD.html", error);
    }
  }
}
