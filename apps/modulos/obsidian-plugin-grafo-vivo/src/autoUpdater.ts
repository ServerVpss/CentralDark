// Auto-atualizador do plugin.
// Busca manifest.json remoto via edge function pública `plugin-release`
// (que proxya o repo privado no GitHub) e, se a versão for maior,
// baixa main.js + manifest.json + styles.css direto pra pasta do plugin.

import { Notice, requestUrl } from "obsidian";
import type GrafoVivoPlugin from "./main";

export interface UpdateInfo {
  versaoRemota: string;
  versaoLocal: string;
  temAtualizacao: boolean;
}

export class AutoAtualizador {
  plugin: GrafoVivoPlugin;
  timer: number | null = null;

  constructor(plugin: GrafoVivoPlugin) {
    this.plugin = plugin;
  }

  iniciar() {
    if (!this.plugin.settings.autoUpdateAtivo) return;
    window.setTimeout(() => this.checarEAtualizar(true), 5000);
    const intervaloMs = Math.max(5, this.plugin.settings.autoUpdateIntervaloMinutos) * 60 * 1000;
    this.timer = window.setInterval(() => this.checarEAtualizar(true), intervaloMs);
  }

  parar() {
    if (this.timer !== null) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
  }

  private urlArquivo(nome: string): string {
    const base = this.plugin.settings.autoUpdateBaseUrl.replace(/\/+$/, "");
    const sep = base.includes("?") ? "&" : "?";
    return `${base}${sep}arquivo=${encodeURIComponent(nome)}&t=${Date.now()}`;
  }

  async checarAtualizacao(): Promise<UpdateInfo | null> {
    try {
      const resp = await requestUrl({ url: this.urlArquivo("manifest.json"), method: "GET" });
      const manifestRemoto = resp.json as { version: string };
      const versaoLocal = this.plugin.manifest.version;
      const versaoRemota = manifestRemoto.version;
      return {
        versaoLocal,
        versaoRemota,
        temAtualizacao: this.compararVersoes(versaoRemota, versaoLocal) > 0,
      };
    } catch (e) {
      console.warn("[GrafoVivo] Falha checando update:", e);
      return null;
    }
  }

  async checarEAtualizar(silencioso = false) {
    const info = await this.checarAtualizacao();
    if (!info) {
      if (!silencioso) new Notice("❌ Falha ao checar atualização do Grafo Vivo.");
      return;
    }
    if (!info.temAtualizacao) {
      if (!silencioso) new Notice(`✅ Grafo Vivo já está na última versão (${info.versaoLocal}).`);
      return;
    }
    new Notice(`🚀 Atualizando Grafo Vivo: ${info.versaoLocal} → ${info.versaoRemota}...`);
    const ok = await this.baixarArquivos();
    if (ok) {
      new Notice(`✅ Grafo Vivo atualizado pra ${info.versaoRemota}. Recarregando...`, 6000);
      await this.recarregarPlugin();
    } else {
      new Notice("❌ Falha baixando arquivos da atualização.");
    }
  }

  private async baixarArquivos(): Promise<boolean> {
    const adapter = this.plugin.app.vault.adapter;
    const dir = this.plugin.manifest.dir;
    if (!dir) return false;

    const arquivos = ["main.js", "manifest.json", "styles.css"];
    try {
      for (const nome of arquivos) {
        try {
          const resp = await requestUrl({ url: this.urlArquivo(nome), method: "GET" });
          if (resp.status >= 400) {
            if (nome === "styles.css") continue;
            throw new Error(`HTTP ${resp.status} em ${nome}`);
          }
          await adapter.write(`${dir}/${nome}`, resp.text);
        } catch (e) {
          if (nome === "styles.css") continue;
          throw e;
        }
      }
      return true;
    } catch (e) {
      console.error("[GrafoVivo] Erro baixando update:", e);
      return false;
    }
  }

  private async recarregarPlugin() {
    const id = this.plugin.manifest.id;
    // @ts-ignore — API interna do Obsidian
    const plugins = this.plugin.app.plugins;
    try {
      await plugins.disablePlugin(id);
      await plugins.enablePlugin(id);
    } catch (e) {
      new Notice("⚠️ Baixei a atualização, mas falhei ao recarregar. Desligue e ligue o plugin manualmente.");
      console.error(e);
    }
  }

  private compararVersoes(a: string, b: string): number {
    const pa = a.split(".").map((n) => parseInt(n, 10) || 0);
    const pb = b.split(".").map((n) => parseInt(n, 10) || 0);
    const len = Math.max(pa.length, pb.length);
    for (let i = 0; i < len; i++) {
      const da = pa[i] ?? 0;
      const db = pb[i] ?? 0;
      if (da > db) return 1;
      if (da < db) return -1;
    }
    return 0;
  }
}
