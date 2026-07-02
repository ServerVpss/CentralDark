// Plugin CentralDark Grafo Vivo — ponto de entrada.
// Registra a view lateral, comandos e o auto-atualizador.

import { Plugin, WorkspaceLeaf } from "obsidian";
import { GrafoVivoView, VIEW_TYPE_GRAFO_VIVO } from "./view";
import { DEFAULT_SETTINGS, GrafoVivoSettings, GrafoVivoSettingTab } from "./settings";
import { AutoAtualizador } from "./autoUpdater";

export default class GrafoVivoPlugin extends Plugin {
  settings: GrafoVivoSettings = DEFAULT_SETTINGS;
  autoUpdater!: AutoAtualizador;

  async onload() {
    await this.loadSettings();

    this.registerView(
      VIEW_TYPE_GRAFO_VIVO,
      (leaf) => new GrafoVivoView(leaf, this),
    );

    this.addRibbonIcon("git-fork", "Abrir Grafo Vivo CentralDark", () => {
      this.ativarView();
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

    this.addSettingTab(new GrafoVivoSettingTab(this.app, this));

    this.autoUpdater = new AutoAtualizador(this);
    this.autoUpdater.iniciar();
  }

  async onunload() {
    this.autoUpdater?.parar();
  }

  async ativarView() {
    const { workspace } = this.app;
    let leaf: WorkspaceLeaf | null =
      workspace.getLeavesOfType(VIEW_TYPE_GRAFO_VIVO)[0] ?? null;
    if (!leaf) {
      leaf = workspace.getRightLeaf(false);
      if (leaf) await leaf.setViewState({ type: VIEW_TYPE_GRAFO_VIVO, active: true });
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
