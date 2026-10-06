// View do HUD canônico dentro do mesmo plugin Grafo Vivo.
// Reutiliza o HUD.html do vault; não cria painel, runtime ou fonte de verdade paralela.

import { ItemView, WorkspaceLeaf } from "obsidian";
import type GrafoVivoPlugin from "./main";

export const VIEW_TYPE_HUD_CENTRALDARK = "centraldark-hud-live-view";

function toFileUrl(fullPath: string): string {
  const normalized = fullPath.replace(/\\/g, "/");
  const parts = normalized.split("/");
  const encoded = parts.map((part, index) => {
    if (index === 0 && /^[A-Za-z]:$/.test(part)) return part;
    return encodeURIComponent(part);
  }).join("/");
  return `file:///${encoded}`;
}

export class HudCentralDarkView extends ItemView {
  plugin: GrafoVivoPlugin;
  private iframe: HTMLIFrameElement | null = null;
  private statusEl: HTMLSpanElement | null = null;

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
    root.style.display = "flex";
    root.style.flexDirection = "column";
    root.style.height = "100%";
    root.style.minHeight = "0";

    const toolbar = root.createDiv({ cls: "cd-grafo-toolbar" });
    const title = toolbar.createEl("strong", { text: "HUD · LIVE" });
    title.style.marginRight = "auto";

    const reload = toolbar.createEl("button", { text: "🔄", cls: "cd-grafo-btn" });
    reload.setAttr("aria-label", "Recarregar HUD");
    reload.addEventListener("click", () => this.carregarHud());

    this.statusEl = toolbar.createEl("span", { cls: "cd-grafo-status", text: "…" });

    this.iframe = root.createEl("iframe");
    this.iframe.setAttr("title", "HUD CentralDark LIVE");
    this.iframe.style.border = "0";
    this.iframe.style.width = "100%";
    this.iframe.style.height = "100%";
    this.iframe.style.flex = "1 1 auto";
    this.iframe.style.minHeight = "0";
    this.iframe.style.background = "transparent";

    await this.carregarHud();
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
