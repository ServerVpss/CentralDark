// Plugin CentralDark Grafo Vivo — ponto de entrada.
// Registra a view lateral e o comando de abertura.

import { Plugin, WorkspaceLeaf } from "obsidian";
import { GrafoVivoView, VIEW_TYPE_GRAFO_VIVO } from "./view";
import { DEFAULT_SETTINGS, GrafoVivoSettings, GrafoVivoSettingTab } from "./settings";

export default class GrafoVivoPlugin extends Plugin {
  settings: GrafoVivoSettings = DEFAULT_SETTINGS;

  async onload() {
    await this.loadSettings();

    // Registra a view custom.
    this.registerView(
      VIEW_TYPE_GRAFO_VIVO,
      (leaf) => new GrafoVivoView(leaf, this),
    );

    // Ícone na barra lateral esquerda.
    this.addRibbonIcon("git-fork", "Abrir Grafo Vivo CentralDark", () => {
      this.ativarView();
    });

    // Comando na paleta de comandos.
    this.addCommand({
      id: "abrir-grafo-vivo",
      name: "Abrir Grafo Vivo CentralDark",
      callback: () => this.ativarView(),
    });

    this.addSettingTab(new GrafoVivoSettingTab(this.app, this));
  }

  async onunload() {
    // Obsidian já cuida de desmontar as views registradas.
  }

  async ativarView() {
    const { workspace } = this.app;

    let leaf: WorkspaceLeaf | null = workspace.getLeavesOfType(VIEW_TYPE_GRAFO_VIVO)[0] ?? null;

    if (!leaf) {
      // Abre na sidebar direita por padrão.
      leaf = workspace.getRightLeaf(false);
      if (leaf) {
        await leaf.setViewState({ type: VIEW_TYPE_GRAFO_VIVO, active: true });
      }
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
