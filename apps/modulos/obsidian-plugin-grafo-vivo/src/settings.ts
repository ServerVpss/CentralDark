// Configurações do plugin: URL do JSON, refresh, auto-update e rollback.

import { App, Notice, PluginSettingTab, Setting } from "obsidian";
import type GrafoVivoPlugin from "./main";

export interface GrafoVivoSettings {
  urlGrafo: string;
  intervaloSegundos: number;
  abrirNotaAoClicar: boolean;
  autoUpdateAtivo: boolean;
  autoUpdateBaseUrl: string;
  autoUpdateIntervaloMinutos: number;
}

export const DEFAULT_SETTINGS: GrafoVivoSettings = {
  urlGrafo: "https://kagejpghnwdfymddwxuf.supabase.co/functions/v1/graph-data",
  intervaloSegundos: 15,
  abrirNotaAoClicar: true,
  autoUpdateAtivo: true,
  autoUpdateBaseUrl: "https://kagejpghnwdfymddwxuf.supabase.co/functions/v1/plugin-release",
  autoUpdateIntervaloMinutos: 10,
};

export class GrafoVivoSettingTab extends PluginSettingTab {
  plugin: GrafoVivoPlugin;

  constructor(app: App, plugin: GrafoVivoPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "CentralDark Grafo Vivo" });

    new Setting(containerEl)
      .setName("URL do grafo")
      .setDesc("Endpoint que retorna o JSON {nodes, edges}.")
      .addText((txt) =>
        txt
          .setValue(this.plugin.settings.urlGrafo)
          .onChange(async (v) => {
            this.plugin.settings.urlGrafo = v.trim();
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("Intervalo de atualização (segundos)")
      .setDesc("Frequência com que o grafo busca novos dados. Mínimo 5s.")
      .addText((txt) =>
        txt.setValue(String(this.plugin.settings.intervaloSegundos)).onChange(async (v) => {
          this.plugin.settings.intervaloSegundos = Math.max(5, parseInt(v, 10) || 30);
          await this.plugin.saveSettings();
        }),
      );

    new Setting(containerEl)
      .setName("Abrir nota ao clicar no nó")
      .addToggle((tg) =>
        tg.setValue(this.plugin.settings.abrirNotaAoClicar).onChange(async (v) => {
          this.plugin.settings.abrirNotaAoClicar = v;
          await this.plugin.saveSettings();
        }),
      );

    containerEl.createEl("h3", { text: "🚀 Auto-atualização" });

    new Setting(containerEl)
      .setName("Auto-atualizar plugin")
      .setDesc("Mostra o changelog e pergunta antes de atualizar.")
      .addToggle((tg) =>
        tg.setValue(this.plugin.settings.autoUpdateAtivo).onChange(async (v) => {
          this.plugin.settings.autoUpdateAtivo = v;
          await this.plugin.saveSettings();
          if (v) this.plugin.autoUpdater.iniciar();
          else this.plugin.autoUpdater.parar();
        }),
      );

    new Setting(containerEl)
      .setName("URL do endpoint de release")
      .addText((txt) =>
        txt.setValue(this.plugin.settings.autoUpdateBaseUrl).onChange(async (v) => {
          this.plugin.settings.autoUpdateBaseUrl = v.trim();
          await this.plugin.saveSettings();
        }),
      );

    new Setting(containerEl)
      .setName("Intervalo de checagem (minutos)")
      .setDesc("Mínimo 5min.")
      .addText((txt) =>
        txt.setValue(String(this.plugin.settings.autoUpdateIntervaloMinutos)).onChange(async (v) => {
          this.plugin.settings.autoUpdateIntervaloMinutos = Math.max(5, parseInt(v, 10) || 10);
          await this.plugin.saveSettings();
        }),
      );

    new Setting(containerEl)
      .setName("Checar atualização agora")
      .setDesc(`Versão instalada: ${this.plugin.manifest.version}`)
      .addButton((btn) =>
        btn.setButtonText("Checar agora").setCta().onClick(async () => {
          new Notice("🔎 Checando atualização...");
          await this.plugin.autoUpdater.checarComPrompt();
        }),
      );

    containerEl.createEl("h3", { text: "↩️ Rollback" });

    const areaRollback = containerEl.createDiv();
    this.renderizarRollback(areaRollback);
  }

  private async renderizarRollback(container: HTMLElement) {
    container.empty();
    const backup = await this.plugin.autoUpdater.temBackup();
    const desc = backup
      ? `Backup disponível: v${backup.versao}`
      : "Nenhum backup ainda — o primeiro será criado na próxima atualização.";

    new Setting(container)
      .setName("Voltar pra versão anterior")
      .setDesc(desc)
      .addButton((btn) => {
        btn.setButtonText("Fazer rollback").setWarning();
        if (!backup) btn.setDisabled(true);
        btn.onClick(async () => {
          await this.plugin.autoUpdater.fazerRollback();
        });
      });
  }
}
