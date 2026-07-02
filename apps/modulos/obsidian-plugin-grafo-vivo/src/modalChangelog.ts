// Modal que mostra o changelog entre a versão instalada e a nova.
// Botões: "Atualizar agora" e "Depois".

import { App, Modal, Setting } from "obsidian";

export interface EntradaChangelog {
  versao: string;
  data: string | null;
  mudancas: string[];
}

export class ModalChangelog extends Modal {
  private versaoLocal: string;
  private versaoRemota: string;
  private entradas: EntradaChangelog[];
  private aoConfirmar: () => void | Promise<void>;
  private aoAdiar: () => void;

  constructor(
    app: App,
    versaoLocal: string,
    versaoRemota: string,
    entradas: EntradaChangelog[],
    aoConfirmar: () => void | Promise<void>,
    aoAdiar: () => void,
  ) {
    super(app);
    this.versaoLocal = versaoLocal;
    this.versaoRemota = versaoRemota;
    this.entradas = entradas;
    this.aoConfirmar = aoConfirmar;
    this.aoAdiar = aoAdiar;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("cd-grafo-changelog");

    contentEl.createEl("h2", { text: "🚀 Atualização disponível" });
    contentEl.createEl("p", {
      text: `Sua versão: ${this.versaoLocal} → Nova: ${this.versaoRemota}`,
      cls: "cd-grafo-changelog-header",
    });

    const container = contentEl.createDiv({ cls: "cd-grafo-changelog-lista" });
    if (this.entradas.length === 0) {
      container.createEl("p", { text: "Sem changelog disponível pra essa versão." });
    } else {
      for (const entrada of this.entradas) {
        const bloco = container.createDiv({ cls: "cd-grafo-changelog-bloco" });
        const titulo = `v${entrada.versao}` + (entrada.data ? ` — ${entrada.data}` : "");
        bloco.createEl("h3", { text: titulo });
        const ul = bloco.createEl("ul");
        for (const mud of entrada.mudancas) {
          ul.createEl("li", { text: mud });
        }
      }
    }

    new Setting(contentEl)
      .addButton((btn) =>
        btn.setButtonText("Depois").onClick(() => {
          this.aoAdiar();
          this.close();
        }),
      )
      .addButton((btn) =>
        btn
          .setButtonText("Atualizar agora")
          .setCta()
          .onClick(async () => {
            this.close();
            await this.aoConfirmar();
          }),
      );
  }

  onClose(): void {
    this.contentEl.empty();
  }
}
