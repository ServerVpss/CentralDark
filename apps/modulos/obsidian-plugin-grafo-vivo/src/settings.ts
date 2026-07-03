// Configurações do plugin: URL do JSON, refresh e auto-update.

import { App, Notice, PluginSettingTab, Setting } from "obsidian";
import type GrafoVivoPlugin from "./main";
import { formatarData } from "./logger";

export interface GrafoVivoSettings {
  urlGrafo: string;
  intervaloSegundos: number;
  abrirNotaAoClicar: boolean;
  autoUpdateAtivo: boolean;
  autoUpdateBaseUrl: string;
  autoUpdateIntervaloMinutos: number;
}

export const SETTINGS_PADRAO: GrafoVivoSettings = {
  urlGrafo: "https://status.centralldark.com/graph-data.json",
  intervaloSegundos: 30,
  abrirNotaAoClicar: true,
  autoUpdateAtivo: true,
  autoUpdateBaseUrl:
    "https://raw.githubusercontent.com/ServerVpss/CentralDark/main/apps/modulos/obsidian-plugin-grafo-vivo",
  autoUpdateIntervaloMinutos: 10,
};

// URLs antigas que precisam ser migradas automaticamente pra graph-data.json.
export const URLS_DEPRECIADAS = [
  "https://status.centralldark.com/painel-data.json",
];

export class GrafoVivoSettingTab extends PluginSettingTab {
  private unsubStatus: (() => void) | null = null;
  private unsubLog: (() => void) | null = null;

  constructor(app: App, private plugin: GrafoVivoPlugin) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "Grafo Vivo — Configurações" });

    new Setting(containerEl)
      .setName("URL do grafo")
      .setDesc("Endpoint JSON do painel vivo")
      .addText((t) =>
        t.setValue(this.plugin.settings.urlGrafo).onChange(async (v) => {
          this.plugin.settings.urlGrafo = v;
          await this.plugin.salvarSettings();
        }),
      );

    new Setting(containerEl)
      .setName("Intervalo de refresh do grafo (segundos)")
      .addText((t) =>
        t.setValue(String(this.plugin.settings.intervaloSegundos)).onChange(async (v) => {
          this.plugin.settings.intervaloSegundos = Math.max(5, Number(v) || 30);
          await this.plugin.salvarSettings();
        }),
      );

    new Setting(containerEl)
      .setName("Abrir nota ao clicar no nó")
      .addToggle((t) =>
        t.setValue(this.plugin.settings.abrirNotaAoClicar).onChange(async (v) => {
          this.plugin.settings.abrirNotaAoClicar = v;
          await this.plugin.salvarSettings();
        }),
      );

    containerEl.createEl("h3", { text: "🚀 Auto-atualização" });

    new Setting(containerEl)
      .setName("Auto-atualizar plugin")
      .setDesc("Baixa novas versões automaticamente do GitHub. Chega de zip.")
      .addToggle((tg) =>
        tg.setValue(this.plugin.settings.autoUpdateAtivo).onChange(async (v) => {
          this.plugin.settings.autoUpdateAtivo = v;
          await this.plugin.saveSettings();
          if (v) this.plugin.autoUpdater.iniciar();
          else this.plugin.autoUpdater.parar();
        }),
      );

    new Setting(containerEl)
      .setName("URL base do repositório")
      .setDesc("Caminho raw do GitHub onde ficam main.js/manifest.json/styles.css.")
      .addText((txt) =>
        txt
          .setValue(this.plugin.settings.autoUpdateBaseUrl)
          .onChange(async (v) => {
            this.plugin.settings.autoUpdateBaseUrl = v.trim();
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("Intervalo de checagem (minutos)")
      .setDesc("De quanto em quanto tempo checar se saiu versão nova. Mínimo 5min.")
      .addText((txt) =>
        txt
          .setValue(String(this.plugin.settings.autoUpdateIntervaloMinutos))
          .onChange(async (v) => {
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
