// Plugin CentralDark Grafo Vivo — ponto de entrada.
// Registra views, comandos, Hub de conhecimento e autoatualizador.

import { Notice, Platform, Plugin, TFile, WorkspaceLeaf } from "obsidian";
import { GrafoVivoView, VIEW_TYPE_GRAFO_VIVO } from "./view";
import { Grafo3DView, VIEW_TYPE_GRAFO_3D } from "./view3d";
import { HudCentralDarkView, VIEW_TYPE_HUD_CENTRALDARK } from "./hud";
import { DEFAULT_SETTINGS, GrafoVivoSettings, GrafoVivoSettingTab } from "./settings";
import { AutoAtualizador } from "./autoUpdater";
import { SemanticClient } from "./semantic";
import { KnowledgeHubClient } from "./knowledgeHub";
import { installCentralDarkDateFormatting } from "../../../../central-horario/frontend";

installCentralDarkDateFormatting();

export default class GrafoVivoPlugin extends Plugin {
  settings: GrafoVivoSettings = DEFAULT_SETTINGS;
  autoUpdater!: AutoAtualizador;
  semanticClient: SemanticClient | null = null;
  knowledgeHubClient: KnowledgeHubClient | null = null;
  private pendingKnowledgeSync = new Map<string, number>();

  async onload() {
    await this.loadSettings();
    this.knowledgeHubClient = new KnowledgeHubClient(this);

    this.registerView(
      VIEW_TYPE_GRAFO_VIVO,
      (leaf) => new GrafoVivoView(leaf, this),
    );

    this.registerView(
      VIEW_TYPE_GRAFO_3D,
      (leaf) => new Grafo3DView(leaf, this),
    );

    this.registerView(
      VIEW_TYPE_HUD_CENTRALDARK,
      (leaf) => new HudCentralDarkView(leaf, this),
    );

    this.registerEvent(this.app.vault.on("create", (file) => this.agendarKnowledgeAutoSync(file)));
    this.registerEvent(this.app.vault.on("modify", (file) => this.agendarKnowledgeAutoSync(file)));

    this.addRibbonIcon("git-fork", "Abrir Grafo Vivo CentralDark", () => {
      this.ativarView();
    });

    this.addRibbonIcon("orbit", "Abrir Grafo 3D · Jarvis", () => {
      this.ativarView3D();
    });

    this.addRibbonIcon("layout-dashboard", "Abrir HUD CentralDark", () => {
      this.ativarHud();
    });

    this.addCommand({
      id: "abrir-grafo-3d",
      name: "Abrir Grafo 3D · Jarvis",
      callback: () => this.ativarView3D(),
    });

    this.addCommand({
      id: "abrir-grafo-vivo",
      name: "Abrir Grafo Vivo CentralDark",
      callback: () => this.ativarView(),
    });

    this.addCommand({
      id: "abrir-hud-centraldark",
      name: "Abrir HUD CentralDark",
      callback: () => this.ativarHud(),
    });

    this.addCommand({
      id: "publicar-nota-no-hub-centraldark",
      name: "Enviar nota ativa para o Hub de conhecimento",
      callback: async () => {
        try {
          const receipt = await this.knowledgeHubClient!.publishActiveNote();
          const eventId = receipt.event_id || "evento aceito";
          const status = receipt.status || "CANDIDATE";
          new Notice(`Hub CentralDark: ${status} · ${eventId}`, 10000);
        } catch (error: any) {
          new Notice(`Hub CentralDark indisponível: ${error?.message || error}`, 10000);
        }
      },
    });

    this.addCommand({
      id: "checar-atualizacao-grafo-vivo",
      name: "Checar atualização do plugin agora",
      callback: () => this.autoUpdater.checarComPrompt(),
    });

    this.addCommand({
      id: "rollback-grafo-vivo",
      name: "Rollback: voltar para a versão anterior do plugin",
      callback: () => this.autoUpdater.fazerRollback(),
    });

    if (Platform.isDesktopApp) {
      this.semanticClient = new SemanticClient(this.settings);

      this.addCommand({
        id: "semantic-expand-selection",
        name: "Semântica local: expandir seleção/linha",
        editorCallback: async (editor) => {
          const text = editor.getSelection().trim() || editor.getLine(editor.getCursor().line).trim();
          if (!text) {
            new Notice("Sem texto para expansão semântica.");
            return;
          }
          try {
            const result = await this.semanticClient!.expand(text, 8);
            const terms = Array.isArray(result?.candidates)
              ? result.candidates.map((item: any) => item?.term).filter(Boolean)
              : [];
            new Notice(
              terms.length ? `Semântica local: ${terms.join(", ")}` : "Sem candidatos semânticos conhecidos.",
              10000,
            );
          } catch (error: any) {
            new Notice(`Semântica local indisponível: ${error?.message || error}`, 10000);
          }
        },
      });

      this.addCommand({
        id: "semantic-model-info",
        name: "Semântica local: verificar modelo",
        callback: async () => {
          try {
            const info = await this.semanticClient!.modelInfo();
            new Notice(`${info?.model_id || "modelo desconhecido"} · ${info?.loaded === true ? "LOADED" : "UNKNOWN"}`, 10000);
          } catch (error: any) {
            new Notice(`Semântica local indisponível: ${error?.message || error}`, 10000);
          }
        },
      });
    }

    this.addSettingTab(new GrafoVivoSettingTab(this.app, this));

    this.autoUpdater = new AutoAtualizador(this);
    this.autoUpdater.iniciar();
  }

  async onunload() {
    for (const timeoutId of this.pendingKnowledgeSync.values()) {
      window.clearTimeout(timeoutId);
    }
    this.pendingKnowledgeSync.clear();
    this.semanticClient?.stop();
    this.semanticClient = null;
    this.knowledgeHubClient = null;
    this.autoUpdater?.parar();
  }

  private agendarKnowledgeAutoSync(file: unknown) {
    if (!this.settings.knowledgeHubAutoSyncEnabled) return;
    if (!(file instanceof TFile)) return;
    if (file.extension !== "md") return;
    if (!this.knowledgeHubClient) return;

    const previous = this.pendingKnowledgeSync.get(file.path);
    if (previous) window.clearTimeout(previous);

    const delayMs = Math.max(2, this.settings.knowledgeHubAutoSyncDelaySeconds || 12) * 1000;
    const timeoutId = window.setTimeout(async () => {
      this.pendingKnowledgeSync.delete(file.path);
      try {
        const receipt = await this.knowledgeHubClient!.publishFile(file, {
          kind: "obsidian.note.autosync",
          provenance: "Obsidian Grafo Vivo — auto-sync local por criação/modificação de nota",
          syncMode: "auto",
          metadata: {
            route: "OBSIDIAN_PLUGIN -> MEMORIA_API -> BRAIN_LEDGER",
            manifest_hint: this.settings.brainManifestUrl,
          },
        });
        if (receipt.event_id) {
          console.log(`[CentralDark Grafo Vivo] nota sincronizada: ${file.path} -> ${receipt.event_id}`);
        }
      } catch (error) {
        console.warn("[CentralDark Grafo Vivo] auto-sync falhou", file.path, error);
      }
    }, delayMs);

    this.pendingKnowledgeSync.set(file.path, timeoutId);
  }

  async ativarView() {
    const { workspace } = this.app;
    let leaf: WorkspaceLeaf | null = workspace.getLeavesOfType(VIEW_TYPE_GRAFO_VIVO)[0] ?? null;
    if (!leaf) {
      leaf = workspace.getRightLeaf(false);
      if (leaf) await leaf.setViewState({ type: VIEW_TYPE_GRAFO_VIVO, active: true });
    }
    if (leaf) workspace.revealLeaf(leaf);
  }

  async ativarView3D() {
    const { workspace } = this.app;
    let leaf: WorkspaceLeaf | null = workspace.getLeavesOfType(VIEW_TYPE_GRAFO_3D)[0] ?? null;
    if (!leaf) {
      leaf = workspace.getRightLeaf(false);
      if (leaf) await leaf.setViewState({ type: VIEW_TYPE_GRAFO_3D, active: true });
    }
    if (leaf) workspace.revealLeaf(leaf);
  }

  async ativarHud() {
    const { workspace } = this.app;
    let leaf: WorkspaceLeaf | null = workspace.getLeavesOfType(VIEW_TYPE_HUD_CENTRALDARK)[0] ?? null;
    if (!leaf) {
      leaf = workspace.getRightLeaf(false);
      if (leaf) await leaf.setViewState({ type: VIEW_TYPE_HUD_CENTRALDARK, active: true });
    }
    if (leaf) workspace.revealLeaf(leaf);
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
