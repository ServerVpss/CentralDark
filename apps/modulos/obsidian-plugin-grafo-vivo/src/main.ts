// Plugin CentralDark Grafo Vivo — ponto de entrada.
// Registra a view lateral, o comando de abertura e o auto-atualizador.

import { Plugin, WorkspaceLeaf } from "obsidian";
import { GrafoVivoView, VIEW_TYPE_GRAFO_VIVO } from "./view";
import { DEFAULT_SETTINGS, GrafoVivoSettings, GrafoVivoSettingTab } from "./settings";
import { AutoAtualizador } from "./autoUpdater";

export default class GrafoVivoPlugin extends Plugin {
  settings: GrafoVivoSettings = DEFAULT_SETTINGS;
  autoUpdater!: AutoAtualizador;

  async onload() {
    await this.carregarSettings();

    this.registerView(
      VIEW_TYPE_GRAFO_VIVO,
      (leaf) => new GrafoVivoView(leaf, this),
    );

    this.addRibbonIcon("git-fork", "Abrir Grafo Vivo CentralDark", () => {
      this.ativarView();
    });

    this.addCommand({
      id: "abrir-grafo-vivo",
      name: "Abrir Grafo Vivo",
      callback: () => this.ativarView(),
    });

    this.addCommand({
      id: "checar-atualizacao-grafo-vivo",
      name: "Checar atualização do plugin agora",
      callback: () => this.autoUpdater.checarEAtualizar(false),
    });

    this.addSettingTab(new GrafoVivoSettingTab(this.app, this));

    // Auto-update inicia depois do onload pra não travar o boot.
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
      await leaf?.setViewState({ type: VIEW_TYPE_GRAFO_VIVO, active: true });
    }
    if (leaf) workspace.revealLeaf(leaf);
  }

  async carregarSettings() {
    this.settings = Object.assign({}, SETTINGS_PADRAO, await this.loadData());
    // Migração automática de URLs antigas do grafo (ex: painel-data.json → graph-data.json).
    const { URLS_DEPRECIADAS } = await import("./settings");
    if (URLS_DEPRECIADAS.includes(this.settings.urlGrafo)) {
      this.settings.urlGrafo = SETTINGS_PADRAO.urlGrafo;
      await this.salvarSettings();
    }
  }

  async salvarSettings() {
    await this.saveData(this.settings);
  }
}
