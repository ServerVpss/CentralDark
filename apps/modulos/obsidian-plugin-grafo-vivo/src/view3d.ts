import { ItemView, WorkspaceLeaf } from "obsidian";

export const VIEW_TYPE_GRAFO_3D = "centraldark-grafo-3d-view";

export class Grafo3DView extends ItemView {
  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
  }

  getViewType() {
    return VIEW_TYPE_GRAFO_3D;
  }

  getDisplayText() {
    return "Grafo 3D · Jarvis";
  }

  getIcon() {
    return "orbit";
  }

  async onOpen() {
    const root = this.containerEl.children[1] as HTMLElement;
    root.empty();

    const iframe = root.createEl("iframe");
    iframe.src = "https://grafo.centralldark.com/";
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "0";
    iframe.style.backgroundColor = "#000308";
    iframe.setAttribute("allowfullscreen", "true");

    const fallback = root.createEl("p");
    fallback.setText("Se o iframe não carregar, acesse o ");
    fallback.createEl("a", {
      text: "Grafo 3D aqui",
      href: "https://grafo.centralldark.com/",
    });
    fallback.appendText(".");
  }

  async onClose() {
    const root = this.containerEl.children[1] as HTMLElement;
    if (root) {
      root.empty();
    }
  }
}
