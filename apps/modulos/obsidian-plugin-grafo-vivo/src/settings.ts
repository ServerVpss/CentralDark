// Aba de configurações do plugin: parâmetros do grafo + painel de auto-update
// (status + logs + botões checar/rollback/limpar).

import { App, PluginSettingTab, Setting } from "obsidian";
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
  autoUpdateBaseUrl: "https://kagejpghnwdfymddwxuf.supabase.co/functions/v1/plugin-release",
  autoUpdateIntervaloMinutos: 60,
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

    // ============ AUTO-UPDATE ============
    containerEl.createEl("h3", { text: "🔄 Auto-update" });

    new Setting(containerEl)
      .setName("Ativar auto-update")
      .setDesc("Checa atualizações periodicamente e no boot do Obsidian")
      .addToggle((t) =>
        t.setValue(this.plugin.settings.autoUpdateAtivo).onChange(async (v) => {
          this.plugin.settings.autoUpdateAtivo = v;
          await this.plugin.salvarSettings();
          if (v) this.plugin.autoUpdater?.iniciar();
          else this.plugin.autoUpdater?.parar();
        }),
      );

    new Setting(containerEl)
      .setName("Endpoint de release")
      .setDesc("Edge function que serve manifest, main.js, styles.css, checksums.json e changelog.json")
      .addText((t) =>
        t.setValue(this.plugin.settings.autoUpdateBaseUrl).onChange(async (v) => {
          this.plugin.settings.autoUpdateBaseUrl = v;
          await this.plugin.salvarSettings();
        }),
      );

    new Setting(containerEl)
      .setName("Intervalo de checagem (minutos)")
      .addText((t) =>
        t.setValue(String(this.plugin.settings.autoUpdateIntervaloMinutos)).onChange(async (v) => {
          this.plugin.settings.autoUpdateIntervaloMinutos = Math.max(5, Number(v) || 60);
          await this.plugin.salvarSettings();
        }),
      );

    // ============ STATUS ============
    containerEl.createEl("h3", { text: "📊 Status" });
    const statusBox = containerEl.createDiv({ cls: "cd-status-box" });
    this.renderizarStatus(statusBox);
    this.unsubStatus = this.plugin.autoUpdater?.onStatusChange(() => this.renderizarStatus(statusBox)) ?? null;

    // ============ AÇÕES ============
    new Setting(containerEl)
      .setName("Checar agora")
      .setDesc("Roda uma checagem manual imediata")
      .addButton((b) =>
        b.setButtonText("Checar").setCta().onClick(async () => {
          await this.plugin.autoUpdater?.checar({ mostrarNotice: true });
        }),
      );

    new Setting(containerEl)
      .setName("Rollback")
      .setDesc("Restaura a última versão salva em .backup/")
      .addButton((b) =>
        b.setButtonText("Voltar versão").setWarning().onClick(async () => {
          await this.plugin.autoUpdater?.rollback();
        }),
      );

    // ============ LOGS ============
    containerEl.createEl("h3", { text: "📜 Logs de diagnóstico" });
    const acoes = containerEl.createDiv({ cls: "cd-log-acoes" });
    const btnAtualizar = acoes.createEl("button", { text: "Atualizar" });
    const btnLimpar = acoes.createEl("button", { text: "Limpar logs" });
    const logBox = containerEl.createDiv({ cls: "cd-log-box" });
    const renderLogs = () => this.renderizarLogs(logBox);
    btnAtualizar.addEventListener("click", renderLogs);
    btnLimpar.addEventListener("click", async () => {
      await this.plugin.autoUpdater?.logger.limpar();
      renderLogs();
    });
    renderLogs();
    this.unsubLog = this.plugin.autoUpdater?.logger.onChange(renderLogs) ?? null;
  }

  hide() {
    this.unsubStatus?.();
    this.unsubLog?.();
    this.unsubStatus = null;
    this.unsubLog = null;
  }

  private renderizarStatus(box: HTMLElement) {
    box.empty();
    const s = this.plugin.autoUpdater?.status;
    if (!s) {
      box.createEl("p", { text: "Auto-updater não inicializado." });
      return;
    }
    const row = (k: string, v: string, cls?: string) => {
      const r = box.createDiv({ cls: "cd-status-row" });
      r.createSpan({ text: k, cls: "cd-status-k" });
      r.createSpan({ text: v, cls: `cd-status-v ${cls ?? ""}` });
    };
    row("Versão local", s.versaoLocal);
    row("Versão remota", s.versaoRemota ?? "—");
    row("Última checagem", s.ultimaChecagem ? formatarData(s.ultimaChecagem) : "nunca");
    row(
      "Última aplicação",
      s.ultimaAplicacaoTs
        ? `${formatarData(s.ultimaAplicacaoTs)} — ${s.ultimaAplicacaoOk ? "✅ sucesso" : "❌ falhou"}`
        : "nunca aplicou",
      s.ultimaAplicacaoOk === false ? "cd-erro" : s.ultimaAplicacaoOk ? "cd-ok" : "",
    );
    row(
      "Status",
      s.mensagemStatus,
      s.atualizacaoPendente ? "cd-aviso" : "",
    );
  }

  private renderizarLogs(box: HTMLElement) {
    box.empty();
    const entradas = this.plugin.autoUpdater?.logger.listar() ?? [];
    if (entradas.length === 0) {
      box.createEl("p", { text: "Sem registros ainda.", cls: "cd-log-vazio" });
      return;
    }
    for (const e of entradas.slice(0, 80)) {
      const linha = box.createDiv({ cls: `cd-log-linha cd-log-${e.nivel}` });
      linha.createSpan({ text: formatarData(e.ts), cls: "cd-log-ts" });
      linha.createSpan({ text: `[${e.etapa}]`, cls: "cd-log-etapa" });
      linha.createSpan({ text: e.mensagem, cls: "cd-log-msg" });
      if (e.detalhes) {
        const det = linha.createEl("details");
        det.createEl("summary", { text: "detalhes" });
        det.createEl("pre", { text: e.detalhes });
      }
    }
  }
}
