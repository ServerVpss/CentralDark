// Auto-atualizador com changelog, verificação de integridade SHA-256,
// backup automático e rollback.

import { Notice, requestUrl } from "obsidian";
import type GrafoVivoPlugin from "./main";
import { ModalChangelog, EntradaChangelog } from "./modalChangelog";

interface Checksums {
  versao: string;
  arquivos: Record<string, string>;
}

interface Changelog {
  versoes: EntradaChangelog[];
}

const ARQUIVOS = ["main.js", "manifest.json", "styles.css"] as const;

export class AutoAtualizador {
  plugin: GrafoVivoPlugin;
  timer: number | null = null;

  constructor(plugin: GrafoVivoPlugin) {
    this.plugin = plugin;
  }

  iniciar() {
    if (!this.plugin.settings.autoUpdateAtivo) return;
    // Ao boot: espera 5s e checa uma vez com prompt visual.
    window.setTimeout(() => this.checarComPrompt(), 5000);
    const intervaloMs =
      Math.max(5, this.plugin.settings.autoUpdateIntervaloMinutos) * 60 * 1000;
    // Nas checagens periódicas também mostra prompt (não força).
    this.timer = window.setInterval(() => this.checarComPrompt(), intervaloMs);
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

  private async sha256(texto: string): Promise<string> {
    const buf = new TextEncoder().encode(texto);
    const hash = await crypto.subtle.digest("SHA-256", buf);
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  // ---- Fluxo principal ----

  async checarComPrompt() {
    const info = await this.buscarInfoRemota();
    if (!info) return;

    if (!info.temAtualizacao) return; // silencioso quando já tá atualizado

    // Filtra changelog: só versões > local e <= remota
    const entradas = info.changelog.filter(
      (e) =>
        this.compararVersoes(e.versao, info.versaoLocal) > 0 &&
        this.compararVersoes(e.versao, info.versaoRemota) <= 0,
    );

    new ModalChangelog(
      this.plugin.app,
      info.versaoLocal,
      info.versaoRemota,
      entradas,
      () => this.atualizarAgora(info.versaoRemota),
      () => new Notice("⏰ Atualização adiada. Você pode rodar depois em 'Checar agora'."),
    ).open();
  }

  async checarEAtualizar(silencioso = false) {
    // Fluxo direto (sem modal) usado pelo botão manual e comando "Checar agora".
    const info = await this.buscarInfoRemota();
    if (!info) {
      if (!silencioso) new Notice("❌ Falha ao checar atualização.");
      return;
    }
    if (!info.temAtualizacao) {
      if (!silencioso)
        new Notice(`✅ Grafo Vivo já está na última versão (${info.versaoLocal}).`);
      return;
    }
    await this.atualizarAgora(info.versaoRemota);
  }

  private async buscarInfoRemota(): Promise<
    | {
        versaoLocal: string;
        versaoRemota: string;
        temAtualizacao: boolean;
        changelog: EntradaChangelog[];
      }
    | null
  > {
    try {
      const resp = await requestUrl({ url: this.urlArquivo("manifest.json"), method: "GET" });
      const manifestRemoto = resp.json as { version: string };
      const versaoLocal = this.plugin.manifest.version;
      const versaoRemota = manifestRemoto.version;

      let changelog: EntradaChangelog[] = [];
      try {
        const rc = await requestUrl({ url: this.urlArquivo("changelog.json"), method: "GET" });
        const parsed = rc.json as Changelog;
        changelog = parsed.versoes || [];
      } catch {
        // sem changelog, ok
      }

      return {
        versaoLocal,
        versaoRemota,
        temAtualizacao: this.compararVersoes(versaoRemota, versaoLocal) > 0,
        changelog,
      };
    } catch (e) {
      console.warn("[GrafoVivo] Falha checando update:", e);
      return null;
    }
  }

  private async atualizarAgora(versaoRemota: string) {
    const versaoAntiga = this.plugin.manifest.version;
    new Notice(`🚀 Atualizando: ${versaoAntiga} → ${versaoRemota}...`);

    // 1. Baixa checksums
    let checksums: Checksums | null = null;
    try {
      const rc = await requestUrl({ url: this.urlArquivo("checksums.json"), method: "GET" });
      checksums = rc.json as Checksums;
    } catch {
      new Notice("⚠️ Sem checksums.json — atualização abortada por segurança.");
      return;
    }

    // 2. Baixa cada arquivo em memória + valida hash
    const baixados: Record<string, string> = {};
    for (const nome of ARQUIVOS) {
      try {
        const resp = await requestUrl({ url: this.urlArquivo(nome), method: "GET" });
        if (resp.status >= 400) {
          if (nome === "styles.css") continue;
          new Notice(`❌ Falha baixando ${nome} (HTTP ${resp.status}).`);
          return;
        }
        const conteudo = resp.text;
        const hashEsperado = checksums.arquivos[nome];
        if (!hashEsperado) {
          if (nome === "styles.css") {
            baixados[nome] = conteudo;
            continue;
          }
          new Notice(`❌ Checksum ausente pra ${nome}.`);
          return;
        }
        const hashObtido = await this.sha256(conteudo);
        if (hashObtido !== hashEsperado) {
          new Notice(`❌ Integridade FALHOU em ${nome}. Atualização abortada.`);
          console.error(`[GrafoVivo] hash divergente ${nome}: esperado ${hashEsperado}, obtido ${hashObtido}`);
          return;
        }
        baixados[nome] = conteudo;
      } catch (e) {
        if (nome === "styles.css") continue;
        console.error(`[GrafoVivo] erro baixando ${nome}:`, e);
        new Notice(`❌ Erro baixando ${nome}.`);
        return;
      }
    }

    // 3. Backup da versão atual antes de sobrescrever
    const okBackup = await this.fazerBackup(versaoAntiga);
    if (!okBackup) {
      new Notice("⚠️ Falha criando backup — atualização abortada.");
      return;
    }

    // 4. Escreve os arquivos novos
    const adapter = this.plugin.app.vault.adapter;
    const dir = this.plugin.manifest.dir!;
    try {
      for (const [nome, conteudo] of Object.entries(baixados)) {
        await adapter.write(`${dir}/${nome}`, conteudo);
      }
    } catch (e) {
      console.error("[GrafoVivo] falha escrevendo arquivos:", e);
      new Notice("❌ Falha escrevendo arquivos. Tente rollback.");
      return;
    }

    new Notice(`✅ Atualizado pra ${versaoRemota}. Recarregando plugin...`, 5000);
    await this.recarregarPlugin();
  }

  // ---- Backup e rollback ----

  private pastaBackup(): string {
    return `${this.plugin.manifest.dir}/.backup`;
  }

  private async fazerBackup(versaoAtual: string): Promise<boolean> {
    const adapter = this.plugin.app.vault.adapter;
    const dir = this.plugin.manifest.dir!;
    const backup = this.pastaBackup();
    try {
      // @ts-ignore — adapter tem mkdir
      if (!(await adapter.exists(backup))) await adapter.mkdir(backup);

      const meta: { versao: string; feitoEm: string; arquivos: string[] } = {
        versao: versaoAtual,
        feitoEm: new Date().toISOString(),
        arquivos: [],
      };
      for (const nome of ARQUIVOS) {
        const caminho = `${dir}/${nome}`;
        if (await adapter.exists(caminho)) {
          const conteudo = await adapter.read(caminho);
          await adapter.write(`${backup}/${nome}`, conteudo);
          meta.arquivos.push(nome);
        }
      }
      await adapter.write(`${backup}/backup-info.json`, JSON.stringify(meta, null, 2));
      return true;
    } catch (e) {
      console.error("[GrafoVivo] backup falhou:", e);
      return false;
    }
  }

  async temBackup(): Promise<{ versao: string } | null> {
    try {
      const adapter = this.plugin.app.vault.adapter;
      const info = `${this.pastaBackup()}/backup-info.json`;
      if (!(await adapter.exists(info))) return null;
      const txt = await adapter.read(info);
      const meta = JSON.parse(txt) as { versao: string };
      return { versao: meta.versao };
    } catch {
      return null;
    }
  }

  async fazerRollback() {
    const backup = await this.temBackup();
    if (!backup) {
      new Notice("⚠️ Não tem backup pra restaurar.");
      return;
    }
    const adapter = this.plugin.app.vault.adapter;
    const dir = this.plugin.manifest.dir!;
    const bkp = this.pastaBackup();
    try {
      new Notice(`↩️ Restaurando versão ${backup.versao}...`);
      for (const nome of ARQUIVOS) {
        const orig = `${bkp}/${nome}`;
        if (await adapter.exists(orig)) {
          const conteudo = await adapter.read(orig);
          await adapter.write(`${dir}/${nome}`, conteudo);
        }
      }
      new Notice(`✅ Rollback pra ${backup.versao} feito. Recarregando...`, 5000);
      await this.recarregarPlugin();
    } catch (e) {
      console.error("[GrafoVivo] rollback falhou:", e);
      new Notice("❌ Rollback falhou. Reinstale o plugin manualmente.");
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
      new Notice("⚠️ Baixei mas falhei ao recarregar. Desligue e ligue o plugin manualmente.");
      console.error(e);
    }
  }
}
