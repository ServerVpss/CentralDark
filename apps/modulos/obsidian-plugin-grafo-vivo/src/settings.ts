// Configurações do plugin: grafo, Hub de conhecimento, semântica local, auto-update e rollback.

import { App, Notice, Platform, PluginSettingTab, Setting } from "obsidian";
import type GrafoVivoPlugin from "./main";

export interface GrafoVivoSettings {
  urlGrafo: string;
  intervaloSegundos: number;
  abrirNotaAoClicar: boolean;
  knowledgeHubPublishEnabled: boolean;
  knowledgeHubAutoSyncEnabled: boolean;
  knowledgeHubAutoSyncDelaySeconds: number;
  knowledgeHubUrl: string;
  knowledgeHubToken: string;
  brainManifestUrl: string;
  autoUpdateAtivo: boolean;
  autoUpdateBaseUrl: string;
  autoUpdateIntervaloMinutos: number;
  semanticRepoRoot: string;
  semanticPython: string;
  hermesSshHost: string;
  hermesLiveRefreshMs: number;
}

export const DEFAULT_SETTINGS: GrafoVivoSettings = {
  // Padrão 2026: plugin consome o mesmo Grafo Vivo e envia matéria candidata ao Hub único.
  // mode=vivo = PM2 operacional (leve, tempo real). UI full: /api/graph
  urlGrafo: "https://api.centralldark.com/api/graph?mode=vivo",
  intervaloSegundos: 15,
  abrirNotaAoClicar: true,
  knowledgeHubPublishEnabled: true,
  knowledgeHubAutoSyncEnabled: true,
  knowledgeHubAutoSyncDelaySeconds: 12,
  knowledgeHubUrl: "https://api.centralldark.com/memoria/ingest",
  knowledgeHubToken: "",
  brainManifestUrl: "https://api.centralldark.com/memoria/manifest?scope=brain&mode=vivo",
  autoUpdateAtivo: true,
  autoUpdateBaseUrl: "https://kagejpghnwdfymddwxuf.supabase.co/functions/v1/plugin-release",
  autoUpdateIntervaloMinutos: 10,
  semanticRepoRoot: "",
  semanticPython: "",
  hermesSshHost: "Segredo-VPS",
  hermesLiveRefreshMs: 1500,
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
      .setDesc("Frequência com que o grafo busca novos dados. Mínimo: 5 s.")
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

    containerEl.createEl("h3", { text: "Hub único de conhecimento" });

    new Setting(containerEl)
      .setName("Permitir envio de notas ao Hub")
      .setDesc("O envio cria matéria CANDIDATE; o plugin nunca escreve diretamente na main.")
      .addToggle((tg) =>
        tg.setValue(this.plugin.settings.knowledgeHubPublishEnabled).onChange(async (v) => {
          this.plugin.settings.knowledgeHubPublishEnabled = v;
          await this.plugin.saveSettings();
        }),
      );

    new Setting(containerEl)
      .setName("Auto-sync de notas para o Hub")
      .setDesc("Ao criar/modificar nota Markdown, envia snapshot candidato pela API. Não executa anexos nem promove verdade sem CI/receipt.")
      .addToggle((tg) =>
        tg.setValue(this.plugin.settings.knowledgeHubAutoSyncEnabled).onChange(async (v) => {
          this.plugin.settings.knowledgeHubAutoSyncEnabled = v;
          await this.plugin.saveSettings();
        }),
      );

    new Setting(containerEl)
      .setName("Atraso do auto-sync (segundos)")
      .setDesc("Debounce para não enviar a cada tecla. Mínimo: 2 s.")
      .addText((txt) =>
        txt.setValue(String(this.plugin.settings.knowledgeHubAutoSyncDelaySeconds)).onChange(async (v) => {
          this.plugin.settings.knowledgeHubAutoSyncDelaySeconds = Math.max(2, parseInt(v, 10) || 12);
          await this.plugin.saveSettings();
        }),
      );

    new Setting(containerEl)
      .setName("URL de ingestão do Hub")
      .setDesc("Endpoint único de ingestão da Memória API.")
      .addText((txt) =>
        txt
          .setPlaceholder("https://api.centralldark.com/memoria/ingest")
          .setValue(this.plugin.settings.knowledgeHubUrl)
          .onChange(async (v) => {
            this.plugin.settings.knowledgeHubUrl = v.trim();
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("URL do manifesto BRAIN")
      .setDesc("Leitura do índice vivo que a API gera a partir de BRAIN/Git/CI/CD/VPS.")
      .addText((txt) =>
        txt
          .setPlaceholder("https://api.centralldark.com/memoria/manifest?scope=brain&mode=vivo")
          .setValue(this.plugin.settings.brainManifestUrl)
          .onChange(async (v) => {
            this.plugin.settings.brainManifestUrl = v.trim();
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("Token local do Hub")
      .setDesc("Fica apenas nas configurações locais do Obsidian. Não versionar nem colar no repositório.")
      .addText((txt) => {
        txt.inputEl.type = "password";
        txt
          .setPlaceholder("MEMORIA_INGEST_TOKEN")
          .setValue(this.plugin.settings.knowledgeHubToken)
          .onChange(async (v) => {
            this.plugin.settings.knowledgeHubToken = v.trim();
            await this.plugin.saveSettings();
          });
      });

    if (Platform.isDesktopApp) {
      containerEl.createEl("h3", { text: "Hermes LIVE no HUD" });

      new Setting(containerEl)
        .setName("Host SSH do Hermes")
        .setDesc("Binding variável usado só para ler o runtime Hermes remoto. Ex.: alias da VPS em ~/.ssh/config.")
        .addText((txt) =>
          txt
            .setPlaceholder("Segredo-VPS")
            .setValue(this.plugin.settings.hermesSshHost)
            .onChange(async (v) => {
              this.plugin.settings.hermesSshHost = v.trim() || "Segredo-VPS";
              await this.plugin.saveSettings();
            }),
        );

      new Setting(containerEl)
        .setName("Atualização Hermes LIVE (ms)")
        .setDesc("Frequência da projeção do gateway/logs no HUD. Mínimo: 1000 ms.")
        .addText((txt) =>
          txt.setValue(String(this.plugin.settings.hermesLiveRefreshMs)).onChange(async (v) => {
            this.plugin.settings.hermesLiveRefreshMs = Math.max(1000, parseInt(v, 10) || 1500);
            await this.plugin.saveSettings();
          }),
        );

      containerEl.createEl("h3", { text: "Semântica local" });

      new Setting(containerEl)
        .setName("Raiz do CentralDark")
        .setDesc("Diretório local do repositório que contém infra/mcp/semantic_bridge.py. Vazio = usa CENTRALDARK_REPO_ROOT; não baixa modelo nem usa rede.")
        .addText((txt) =>
          txt
            .setPlaceholder("E:/CentralDark ou /caminho/CentralDark")
            .setValue(this.plugin.settings.semanticRepoRoot)
            .onChange(async (v) => {
              this.plugin.settings.semanticRepoRoot = v.trim();
              await this.plugin.saveSettings();
            }),
        );

      new Setting(containerEl)
        .setName("Python semântico")
        .setDesc("Executável Python local. Vazio = SEMANTIC_PYTHON ou python/python3.")
        .addText((txt) =>
          txt.setValue(this.plugin.settings.semanticPython).onChange(async (v) => {
            this.plugin.settings.semanticPython = v.trim();
            await this.plugin.saveSettings();
          }),
        );
    }

    containerEl.createEl("h3", { text: "Autoatualização" });

    new Setting(containerEl)
      .setName("Autoatualizar plugin")
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
      .setDesc("Mínimo: 5 min.")
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
          new Notice("Checando atualização...");
          await this.plugin.autoUpdater.checarComPrompt();
        }),
      );

    containerEl.createEl("h3", { text: "Rollback" });

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
      .setName("Voltar para a versão anterior")
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
