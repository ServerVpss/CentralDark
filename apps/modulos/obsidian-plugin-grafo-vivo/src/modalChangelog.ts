// Modal de changelog: mostra as mudanças entre versão local e remota
// e oferece os botões "Atualizar agora" e "Depois".

import { App, Modal } from "obsidian";

export interface DadosChangelog {
  versaoLocal: string;
  versaoRemota: string;
  changelog: string; // markdown/texto simples
}

export class ModalChangelog extends Modal {
  private confirmado = false;

  constructor(
    app: App,
    private dados: DadosChangelog,
    private aoConfirmar: () => Promise<void> | void,
    private aoAdiar: () => Promise<void> | void,
  ) {
    super(app);
  }

  onOpen() {
    const { contentEl, titleEl } = this;
    titleEl.setText(`🚀 Grafo Vivo — atualização disponível`);

    contentEl.createEl("p", {
      text: `Versão instalada: ${this.dados.versaoLocal}  →  Nova versão: ${this.dados.versaoRemota}`,
      cls: "cd-modal-versoes",
    });

    contentEl.createEl("h4", { text: "O que mudou" });
    const box = contentEl.createDiv({ cls: "cd-modal-changelog" });
    box.setText(this.dados.changelog || "Sem changelog publicado pra esta versão.");

    const botoes = contentEl.createDiv({ cls: "cd-modal-botoes" });

    const btnDepois = botoes.createEl("button", { text: "Depois" });
    btnDepois.addEventListener("click", async () => {
      this.confirmado = true;
      await this.aoAdiar();
      this.close();
    });

    const btnAgora = botoes.createEl("button", {
      text: "Atualizar agora",
      cls: "mod-cta",
    });
    btnAgora.addEventListener("click", async () => {
      this.confirmado = true;
      this.close();
      await this.aoConfirmar();
    });
  }

  onClose() {
    this.contentEl.empty();
    // Se fechou pelo X sem clicar, trata como "Depois"
    if (!this.confirmado) {
      Promise.resolve(this.aoAdiar()).catch(() => {});
    }
  }
}
