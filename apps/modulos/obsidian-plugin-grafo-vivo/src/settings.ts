// Configurações do plugin: URL do JSON, refresh e auto-update.

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
      .setDesc("Endpoint que retorna o JSON {nodes, edges} do ecossistema.")
      .addText((txt) =>
        txt
          .setPlaceholder("https://kagejpghnwdfymddwxuf.supabase.co/functions/v1/graph-data")
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
          const n = Math.max(5, parseInt(v, 10) || 30);
          this.plugin.settings.intervaloSegundos = n;
          await this.plugin.saveSettings();
        }),
      );

    new Setting(containerEl)
      .setName("Abrir nota ao clicar no nó")
      .setDesc("Se o nó tiver campo obsidian_path, clique abre a nota correspondente.")
      .addToggle((tg) =>
        tg.setValue(this.plugin.settings.abrirNotaAoClicar).onChange(async (v) => {
          this.plugin.settings.abrirNotaAoClicar = v;
          await this.plugin.saveSettings();
        }),
      );

    containerEl.createEl("h3", { text: "🚀 Auto-atualização" });

    new Setting(containerEl)
      .setName("Auto-atualizar plugin")
      .setDesc("Baixa novas versões automaticamente. Chega de zip.")
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
      .setDesc("Edge function que serve manifest.json, main.js e styles.css.")
      .addText((txt) =>
        txt.setValue(this.plugin.settings.autoUpdateBaseUrl).onChange(async (v) => {
          this.plugin.settings.autoUpdateBaseUrl = v.trim();
          await this.plugin.saveSettings();
        }),
      );

    new Setting(containerEl)
      .setName("Intervalo de checagem (minutos)")
      .setDesc("De quanto em quanto tempo checar versão nova. Mínimo 5min.")
      .addText((txt) =>
        txt.setValue(String(this.plugin.settings.autoUpdateIntervaloMinutos)).onChange(async (v) => {
          const n = Math.max(5, parseInt(v, 10) || 10);
          this.plugin.settings.autoUpdateIntervaloMinutos = n;
          await this.plugin.saveSettings();
        }),
      );

    new Setting(containerEl)
      .setName("Checar atualização agora")
      .setDesc(`Versão instalada: ${this.plugin.manifest.version}`)
      .addButton((btn) =>
        btn
          .setButtonText("Checar agora")
          .setCta()
          .onClick(async () => {
            new Notice("🔎 Checando atualização...");
            await this.plugin.autoUpdater.checarEAtualizar(false);
          }),
      );
  }
}
