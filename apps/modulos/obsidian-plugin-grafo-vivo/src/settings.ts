// Configurações do plugin: URL do JSON e intervalo de refresh.

import { App, PluginSettingTab, Setting } from "obsidian";
import type GrafoVivoPlugin from "./main";

export interface GrafoVivoSettings {
  urlGrafo: string;
  intervaloSegundos: number;
  abrirNotaAoClicar: boolean;
}

export const DEFAULT_SETTINGS: GrafoVivoSettings = {
  urlGrafo: "https://kagejpghnwdfymddwxuf.supabase.co/functions/v1/graph-data",
  intervaloSegundos: 15,
  abrirNotaAoClicar: true,
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
        txt
          .setValue(String(this.plugin.settings.intervaloSegundos))
          .onChange(async (v) => {
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
  }
}
