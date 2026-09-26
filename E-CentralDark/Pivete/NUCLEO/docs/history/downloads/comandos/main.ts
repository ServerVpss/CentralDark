// Plugin CentralDark Grafo Vivo — ponto de entrada.
// Registra a view lateral, comandos e o auto-atualizador.

import { Notice, Platform, Plugin, WorkspaceLeaf } from "obsidian";
import { GrafoVivoView, VIEW_TYPE_GRAFO_VIVO } from "./view";
import { Grafo3DView, VIEW_TYPE_GRAFO_3D } from "./view3d";
import { DEFAULT_SETTINGS, GrafoVivoSettings, GrafoVivoSettingTab } from "./settings";
import { AutoAtualizador } from "./autoUpdater";
import { SemanticClient } from "./semantic";

export default class GrafoVivoPlugin extends Plugin {
  settings: GrafoVivoSettings = DEFAULT_SETTINGS;
  autoUpdater!: AutoAtualizador;
  semanticClient: SemanticClient | null = null;

  async onload() {
    await this.loadSettings();

    this.registerView(
      VIEW_TYPE_GRAFO_VIVO,
      (leaf) => new GrafoVivoView(leaf, this),
    );

    this.registerView(
      VIEW_TYPE_GRAFO_3D,
      (leaf) => new Grafo3DView(leaf),
    );

    this.addRibbonIcon("git-fork", "Abrir Grafo Vivo CentralDark", () => {
      this.ativarView();
    });

    this.addRibbonIcon("orbit", "Abrir Grafo 3D · Jarvis", () => {
      this.ativarView3D();
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
      id: "checar-atualizacao-grafo-vivo",
      name: "Checar atualização do plugin agora",
      callback: () => this.autoUpdater.checarComPrompt(),
    });

    this.addCommand({
      id: "rollback-grafo-vivo",
      name: "↩️ Rollback: voltar pra versão anterior do plugin",
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
    this.semanticClient?.stop();
    this.semanticClient = null;
    this.autoUpdater?.parar();
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

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
