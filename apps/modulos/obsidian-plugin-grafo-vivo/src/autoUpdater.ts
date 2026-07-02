// Auto-update do plugin CentralDark Grafo Vivo.
// Fluxo: checa manifest remoto -> compara versão -> baixa arquivos -> valida SHA-256
// -> faz backup -> aplica -> força reload. Tudo logado via LoggerAutoUpdate.

import { Notice, Plugin, requestUrl } from "obsidian";
import { LoggerAutoUpdate } from "./logger";
import { ModalChangelog } from "./modalChangelog";

export interface StatusAutoUpdate {
  ultimaChecagem: number | null;      // epoch ms
  versaoLocal: string;
  versaoRemota: string | null;
  ultimaAplicacaoOk: boolean | null;  // null = nunca aplicou
  ultimaAplicacaoTs: number | null;
  mensagemStatus: string;             // texto humano da última checagem
  atualizacaoPendente: boolean;
}

interface ManifestRemoto {
  version: string;
  minAppVersion?: string;
}

interface Checksums {
  "main.js"?: string;
  "manifest.json"?: string;
  "styles.css"?: string;
}

const ARQUIVOS_UPDATE = ["main.js", "manifest.json", "styles.css"] as const;
type ArquivoUpdate = typeof ARQUIVOS_UPDATE[number];

export class AutoUpdater {
  private intervalId: number | null = null;
  status: StatusAutoUpdate;
  private listeners: Set<(s: StatusAutoUpdate) => void> = new Set();

  constructor(
    private plugin: Plugin & { settings: any; salvarSettings: () => Promise<void> },
    public logger: LoggerAutoUpdate,
  ) {
    this.status = {
      ultimaChecagem: null,
      versaoLocal: plugin.manifest.version,
      versaoRemota: null,
      ultimaAplicacaoOk: null,
      ultimaAplicacaoTs: null,
      mensagemStatus: "Nenhuma checagem feita ainda",
      atualizacaoPendente: false,
    };
  }

  onStatusChange(cb: (s: StatusAutoUpdate) => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private emitirStatus() {
    this.listeners.forEach((l) => l(this.status));
  }

  iniciar() {
    if (!this.plugin.settings.autoUpdateAtivo) {
      this.logger.registrar({ nivel: "info", etapa: "boot", mensagem: "Auto-update desativado nas configurações" });
      return;
    }
    // Primeira checagem no boot (com pequeno delay pro Obsidian terminar de carregar).
    window.setTimeout(() => this.checarNoBoot(), 4000);

    const min = Math.max(5, Number(this.plugin.settings.autoUpdateIntervaloMinutos) || 60);
    this.intervalId = window.setInterval(() => {
      this.checar({ mostrarNotice: false }).catch(() => {});
    }, min * 60 * 1000);
  }

  parar() {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // Checagem no boot: se houver update, abre modal changelog automaticamente.
  private async checarNoBoot() {
    const res = await this.checar({ mostrarNotice: false });
    if (res.atualizacaoDisponivel && res.changelog !== undefined) {
      this.abrirModalChangelog(res.versaoRemota!, res.changelog);
    }
  }

  private abrirModalChangelog(versaoRemota: string, changelog: string) {
    const modal = new ModalChangelog(
      this.plugin.app,
      { versaoLocal: this.status.versaoLocal, versaoRemota, changelog },
      async () => { await this.aplicarAtualizacao(); },
      async () => {
        this.logger.registrar({
          nivel: "info", etapa: "boot",
          mensagem: `Atualização ${versaoRemota} adiada pelo usuário`,
        });
      },
    );
    modal.open();
  }

  async checar(opts: { mostrarNotice?: boolean } = {}): Promise<{
    atualizacaoDisponivel: boolean;
    versaoRemota: string | null;
    changelog?: string;
  }> {
    const mostrarNotice = opts.mostrarNotice !== false;
    const baseUrl = this.plugin.settings.autoUpdateBaseUrl as string;
    this.status.ultimaChecagem = Date.now();

    await this.logger.registrar({
      nivel: "info", etapa: "checagem",
      mensagem: `Checando atualização em ${baseUrl}`,
    });

    try {
      const url = `${baseUrl}?arquivo=manifest.json&_t=${Date.now()}`;
      const resp = await requestUrl({ url, method: "GET" });
      if (resp.status < 200 || resp.status >= 300) {
        throw new Error(`HTTP ${resp.status}`);
      }
      const remoto: ManifestRemoto = resp.json ?? JSON.parse(resp.text);
      this.status.versaoRemota = remoto.version;

      const cmp = compararVersoes(remoto.version, this.status.versaoLocal);
      if (cmp <= 0) {
        this.status.atualizacaoPendente = false;
        this.status.mensagemStatus = `Já está na última versão (${this.status.versaoLocal})`;
        await this.logger.registrar({
          nivel: "sucesso", etapa: "checagem",
          mensagem: this.status.mensagemStatus,
        });
        if (mostrarNotice) new Notice(`✅ Grafo Vivo já está na última versão (${this.status.versaoLocal})`);
        this.emitirStatus();
        return { atualizacaoDisponivel: false, versaoRemota: remoto.version };
      }

      // Tenta buscar changelog (opcional).
      let changelog = "";
      try {
        const cl = await requestUrl({ url: `${baseUrl}?arquivo=changelog.json&_t=${Date.now()}`, method: "GET" });
        if (cl.status >= 200 && cl.status < 300) {
          const j = cl.json ?? JSON.parse(cl.text);
          changelog = j?.[remoto.version] ?? j?.changelog ?? "";
        }
      } catch { /* changelog é opcional */ }

      this.status.atualizacaoPendente = true;
      this.status.mensagemStatus = `Nova versão disponível: ${remoto.version}`;
      await this.logger.registrar({
        nivel: "info", etapa: "checagem",
        mensagem: `Atualização disponível: ${this.status.versaoLocal} → ${remoto.version}`,
      });
      if (mostrarNotice) {
        this.notificarUpdateDisponivel(remoto.version, changelog);
      }
      this.emitirStatus();
      return { atualizacaoDisponivel: true, versaoRemota: remoto.version, changelog };

    } catch (e: any) {
      const msg = e?.message ?? String(e);
      this.status.mensagemStatus = `Falha na checagem: ${msg}`;
      await this.logger.registrar({
        nivel: "erro", etapa: "checagem",
        mensagem: this.status.mensagemStatus,
        detalhes: e?.stack ?? String(e),
      });
      if (mostrarNotice) this.notificarErro("Falha ao checar atualização", msg);
      this.emitirStatus();
      return { atualizacaoDisponivel: false, versaoRemota: null };
    }
  }

  private notificarUpdateDisponivel(versao: string, changelog: string) {
    const n = new Notice("", 15000);
    const el = n.noticeEl;
    el.empty();
    el.createEl("div", { text: `🚀 Grafo Vivo ${versao} disponível` });
    const botoes = el.createDiv({ cls: "cd-notice-botoes" });
    const btnVer = botoes.createEl("button", { text: "Ver changelog" });
    btnVer.addEventListener("click", () => {
      this.abrirModalChangelog(versao, changelog);
      n.hide();
    });
    const btnDepois = botoes.createEl("button", { text: "Depois" });
    btnDepois.addEventListener("click", () => n.hide());
  }

  private notificarErro(titulo: string, msg: string) {
    const n = new Notice("", 12000);
    const el = n.noticeEl;
    el.empty();
    el.createEl("div", { text: `⚠️ ${titulo}` });
    el.createEl("div", { text: msg, cls: "cd-notice-msg" });
    const btn = el.createEl("button", { text: "Ver detalhes do erro", cls: "cd-notice-btn-erro" });
    btn.addEventListener("click", () => {
      this.abrirModalErro();
      n.hide();
    });
  }

  private abrirModalErro() {
    const ultimo = this.logger.ultimoErro();
    // Abre um modal simples com os detalhes.
    const { Modal } = require("obsidian");
    const m = new Modal(this.plugin.app);
    m.titleEl.setText("Detalhes do erro do auto-update");
    if (!ultimo) {
      m.contentEl.createEl("p", { text: "Nenhum erro registrado." });
    } else {
      m.contentEl.createEl("p", { text: `Etapa: ${ultimo.etapa}` });
      m.contentEl.createEl("p", { text: `Quando: ${new Date(ultimo.ts).toLocaleString("pt-BR")}` });
      m.contentEl.createEl("p", { text: `Mensagem: ${ultimo.mensagem}` });
      if (ultimo.detalhes) {
        const pre = m.contentEl.createEl("pre", { cls: "cd-modal-erro-detalhes" });
        pre.setText(ultimo.detalhes);
      }
      const abrir = m.contentEl.createEl("button", { text: "Abrir logs completos" });
      abrir.addEventListener("click", () => {
        m.close();
        // @ts-ignore setting API
        this.plugin.app.setting.open();
        // @ts-ignore
        this.plugin.app.setting.openTabById(this.plugin.manifest.id);
      });
    }
    m.open();
  }

  async aplicarAtualizacao(): Promise<boolean> {
    const baseUrl = this.plugin.settings.autoUpdateBaseUrl as string;
    const adapter = this.plugin.app.vault.adapter;
    // @ts-ignore
    const pluginDir: string = this.plugin.manifest.dir ?? `.obsidian/plugins/${this.plugin.manifest.id}`;

    try {
      // 1) Baixa checksums (opcional mas recomendado).
      let checksums: Checksums = {};
      try {
        const cs = await requestUrl({ url: `${baseUrl}?arquivo=checksums.json&_t=${Date.now()}`, method: "GET" });
        if (cs.status >= 200 && cs.status < 300) {
          checksums = cs.json ?? JSON.parse(cs.text);
          await this.logger.registrar({
            nivel: "info", etapa: "hash",
            mensagem: "Checksums remotos carregados",
            detalhes: JSON.stringify(checksums, null, 2),
          });
        }
      } catch {
        await this.logger.registrar({
          nivel: "aviso", etapa: "hash",
          mensagem: "Sem checksums.json remoto — atualização prosseguirá sem verificação de integridade",
        });
      }

      // 2) Baixa arquivos e valida hash.
      const conteudos: Record<ArquivoUpdate, string> = {} as any;
      for (const arq of ARQUIVOS_UPDATE) {
        await this.logger.registrar({ nivel: "info", etapa: "download", mensagem: `Baixando ${arq}` });
        try {
          const r = await requestUrl({ url: `${baseUrl}?arquivo=${arq}&_t=${Date.now()}`, method: "GET" });
          if (r.status < 200 || r.status >= 300) throw new Error(`HTTP ${r.status}`);
          const texto = r.text;
          conteudos[arq] = texto;

          const esperado = checksums[arq];
          if (esperado) {
            const calculado = await sha256(texto);
            if (calculado !== esperado.toLowerCase()) {
              throw new Error(`SHA-256 divergente em ${arq}\nEsperado: ${esperado}\nRecebido: ${calculado}`);
            }
            await this.logger.registrar({
              nivel: "sucesso", etapa: "hash",
              mensagem: `${arq}: hash OK`,
            });
          }
        } catch (e: any) {
          if (arq === "styles.css") {
            // styles é opcional em alguns releases
            await this.logger.registrar({
              nivel: "aviso", etapa: "download",
              mensagem: `styles.css ausente/erro (ignorado): ${e?.message ?? e}`,
            });
            continue;
          }
          throw new Error(`Falha ao baixar/validar ${arq}: ${e?.message ?? e}`);
        }
      }

      // 3) Backup dos arquivos atuais.
      const backupDir = `${pluginDir}/.backup`;
      if (!(await adapter.exists(backupDir))) {
        await adapter.mkdir(backupDir);
      }
      for (const arq of ARQUIVOS_UPDATE) {
        const origem = `${pluginDir}/${arq}`;
        if (await adapter.exists(origem)) {
          const atual = await adapter.read(origem);
          await adapter.write(`${backupDir}/${arq}`, atual);
        }
      }
      await this.logger.registrar({ nivel: "sucesso", etapa: "backup", mensagem: "Backup da versão atual salvo em .backup/" });

      // 4) Aplica novos arquivos.
      for (const arq of ARQUIVOS_UPDATE) {
        if (conteudos[arq] !== undefined) {
          await adapter.write(`${pluginDir}/${arq}`, conteudos[arq]);
        }
      }
      await this.logger.registrar({ nivel: "sucesso", etapa: "aplicar", mensagem: "Arquivos novos gravados" });

      this.status.ultimaAplicacaoOk = true;
      this.status.ultimaAplicacaoTs = Date.now();
      this.status.atualizacaoPendente = false;
      this.status.mensagemStatus = `Atualizado para ${this.status.versaoRemota ?? "?"}`;
      this.emitirStatus();

      new Notice("✅ Grafo Vivo atualizado. Recarregando plugin…", 5000);
      await this.recarregarPlugin();
      return true;

    } catch (e: any) {
      const msg = e?.message ?? String(e);
      this.status.ultimaAplicacaoOk = false;
      this.status.ultimaAplicacaoTs = Date.now();
      this.status.mensagemStatus = `Falha ao aplicar: ${msg}`;
      await this.logger.registrar({
        nivel: "erro", etapa: "aplicar",
        mensagem: msg,
        detalhes: e?.stack ?? String(e),
      });
      this.notificarErro("Falha ao aplicar atualização", msg);
      this.emitirStatus();
      return false;
    }
  }

  async rollback(): Promise<boolean> {
    const adapter = this.plugin.app.vault.adapter;
    // @ts-ignore
    const pluginDir: string = this.plugin.manifest.dir ?? `.obsidian/plugins/${this.plugin.manifest.id}`;
    const backupDir = `${pluginDir}/.backup`;
    try {
      if (!(await adapter.exists(backupDir))) {
        throw new Error("Nenhum backup disponível");
      }
      for (const arq of ARQUIVOS_UPDATE) {
        const bkp = `${backupDir}/${arq}`;
        if (await adapter.exists(bkp)) {
          const c = await adapter.read(bkp);
          await adapter.write(`${pluginDir}/${arq}`, c);
        }
      }
      await this.logger.registrar({ nivel: "sucesso", etapa: "rollback", mensagem: "Rollback aplicado" });
      new Notice("↩️ Rollback aplicado. Recarregando plugin…", 5000);
      await this.recarregarPlugin();
      return true;
    } catch (e: any) {
      await this.logger.registrar({
        nivel: "erro", etapa: "rollback",
        mensagem: e?.message ?? String(e),
        detalhes: e?.stack,
      });
      new Notice(`❌ Rollback falhou: ${e?.message ?? e}`);
      return false;
    }
  }

  private async recarregarPlugin() {
    // @ts-ignore API interna do Obsidian
    const plugins = this.plugin.app.plugins;
    const id = this.plugin.manifest.id;

    // Defer pra sair do callstack atual (senão o plugin se desabilita no meio
    // do próprio callback e o Obsidian trava no "Recarregando plugin...").
    setTimeout(async () => {
      try {
        await plugins.disablePlugin(id);
        // Força o Obsidian a reler o manifest.json do disco — sem isso ele
        // reabilita com a versão em cache e continua achando que tem update.
        if (typeof plugins.loadManifests === "function") {
          try { await plugins.loadManifests(); } catch { /* best-effort */ }
        }
        await new Promise((r) => setTimeout(r, 300));
        await plugins.enablePlugin(id);
        new Notice("✅ Grafo Vivo recarregado com a nova versão", 4000);
      } catch (e) {
        console.error("[GrafoVivo] falha ao recarregar plugin", e);
        new Notice("⚠️ Reinicie o Obsidian pra concluir a atualização", 8000);
      }
    }, 200);
  }
}

// SHA-256 hex.
async function sha256(texto: string): Promise<string> {
  const enc = new TextEncoder().encode(texto);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Compara versões semver simples. Retorna >0 se a>b, <0 se a<b, 0 se iguais.
export function compararVersoes(a: string, b: string): number {
  const pa = a.split(".").map((n) => parseInt(n, 10) || 0);
  const pb = b.split(".").map((n) => parseInt(n, 10) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const x = pa[i] ?? 0, y = pb[i] ?? 0;
    if (x !== y) return x - y;
  }
  return 0;
}
