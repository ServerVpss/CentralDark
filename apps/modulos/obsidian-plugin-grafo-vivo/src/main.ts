// Entry point do plugin CentralDark Grafo Vivo.
// Orquestra: view do grafo + auto-updater + logger + tab de configs.

import { Plugin, WorkspaceLeaf } from "obsidian";
import { GrafoVivoView, VIEW_TYPE_GRAFO_VIVO } from "./view";
import { GrafoVivoSettings, GrafoVivoSettingTab, SETTINGS_PADRAO } from "./settings";
import { AutoUpdater } from "./autoUpdater";
import { LoggerAutoUpdate } from "./logger";

export default class GrafoVivoPlugin extends Plugin {
  settings!: GrafoVivoSettings;
  autoUpdater!: AutoUpdater;
  logger!: LoggerAutoUpdate;

  async onload() {
    await this.carregarSettings();

    this.logger = new LoggerAutoUpdate(this);
    await this.logger.carregar();
    this.autoUpdater = new AutoUpdater(this as any, this.logger);

    this.registerView(VIEW_TYPE_GRAFO_VIVO, (leaf) => new GrafoVivoView(leaf, this));

    this.addRibbonIcon("git-fork", "Abrir Grafo Vivo", () => this.ativarView());

    this.addCommand({
      id: "abrir-grafo-vivo",
      name: "Abrir Grafo Vivo",
      callback: () => this.ativarView(),
    });

    this.addCommand({
      id: "checar-atualizacao-grafo-vivo",
      name: "Checar atualização do plugin",
      callback: () => this.autoUpdater.checar({ mostrarNotice: true }),
    });

    this.addCommand({
      id: "rollback-grafo-vivo",
      name: "Rollback do plugin (voltar versão)",
      callback: () => this.autoUpdater.rollback(),
    });

    this.addSettingTab(new GrafoVivoSettingTab(this.app, this));

    // Log de boot pra sempre ter um rastro.
    await this.logger.registrar({
      nivel: "info", etapa: "boot",
      mensagem: `Plugin carregado v${this.manifest.version}`,
    });

    // Dispara auto-updater (que faz checagem no boot com delay).
    this.autoUpdater.iniciar();
  }

  onunload() {
    this.autoUpdater?.parar();
  }

  async ativarView() {
    const { workspace } = this.app;
    let leaf: WorkspaceLeaf | null = workspace.getLeavesOfType(VIEW_TYPE_GRAFO_VIVO)[0] ?? null;
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
