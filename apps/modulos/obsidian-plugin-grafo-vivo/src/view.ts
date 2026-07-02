// View lateral que renderiza o grafo vivo com force-graph.

import { ItemView, WorkspaceLeaf, Notice, requestUrl } from "obsidian";
import ForceGraph from "force-graph";
import type GrafoVivoPlugin from "./main";

export const VIEW_TYPE_GRAFO_VIVO = "centraldark-grafo-vivo-view";

interface NoGrafo {
  id: string;
  label?: string;
  category?: string;
  obsidian_path?: string;
  x?: number;
  y?: number;
}

interface ArestaGrafo {
  source: string;
  target: string;
  ativa?: boolean;
}

interface DadosGrafo {
  nodes: NoGrafo[];
  edges: ArestaGrafo[];
}

// Paleta por categoria — segue vibe do tema Esmeralda + Obsidian dark.
const CORES: Record<string, string> = {
  bot: "#10b981",
  mcp: "#3b82f6",
  edge: "#a855f7",
  supabase: "#22c55e",
  vps: "#f97316",
  ia: "#ec4899",
  modulo: "#eab308",
  doc: "#94a3b8",
  default: "#64748b",
};

export class GrafoVivoView extends ItemView {
  plugin: GrafoVivoPlugin;
  private container: HTMLDivElement | null = null;
  private grafo: any = null;
  private statusEl: HTMLSpanElement | null = null;
  private filtroAtual: string = "todos";

  constructor(leaf: WorkspaceLeaf, plugin: GrafoVivoPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType() { return VIEW_TYPE_GRAFO_VIVO; }
  getDisplayText() { return "Grafo Vivo CentralDark"; }
  getIcon() { return "git-fork"; }

  async onOpen() {
    const root = this.containerEl.children[1] as HTMLElement;
    root.empty();
    root.addClass("cd-grafo-vivo-root");

    // Toolbar: filtro + status.
    const toolbar = root.createDiv({ cls: "cd-grafo-toolbar" });
    const select = toolbar.createEl("select", { cls: "cd-grafo-filtro" });
    ["todos", "bot", "mcp", "edge", "supabase", "vps", "ia", "modulo"].forEach((cat) => {
      const opt = select.createEl("option", { value: cat, text: cat });
      if (cat === "todos") opt.selected = true;
    });
    select.addEventListener("change", () => {
      this.filtroAtual = select.value;
      this.aplicarFiltro();
    });

    const btnReload = toolbar.createEl("button", { text: "🔄", cls: "cd-grafo-btn" });
    btnReload.setAttr("aria-label", "Recarregar agora");
    btnReload.addEventListener("click", () => this.carregar());

    this.statusEl = toolbar.createEl("span", { cls: "cd-grafo-status", text: "…" });

    // Container do grafo.
    this.container = root.createDiv({ cls: "cd-grafo-canvas" });

    // Primeira carga + refresh periódico.
    await this.carregar();
    this.registerInterval(
      window.setInterval(() => this.carregar(), this.plugin.settings.intervaloSegundos * 1000),
    );
  }

  async onClose() {
    if (this.grafo) {
      try { this.grafo._destructor?.(); } catch { /* noop */ }
      this.grafo = null;
    }
  }

  private async carregar() {
    if (!this.container) return;
    try {
      // Usa requestUrl do Obsidian pra ignorar CORS (funciona desktop e mobile).
      const resp = await requestUrl({ url: this.plugin.settings.urlGrafo, method: "GET" });
      if (resp.status < 200 || resp.status >= 300) throw new Error(`HTTP ${resp.status}`);
      const dados: DadosGrafo = resp.json;
      this.render(dados);
      const hora = new Date().toLocaleTimeString("pt-BR");
      if (this.statusEl) this.statusEl.setText(`🟢 ${dados.nodes.length} nós • ${hora}`);
    } catch (e: any) {
      if (this.statusEl) this.statusEl.setText(`🔴 erro: ${e.message ?? e}`);
      console.error("[GrafoVivo] falha ao carregar", e);
    }
  }

  private dadosCache: DadosGrafo | null = null;

  private render(dados: DadosGrafo) {
    if (!this.container) return;
    this.dadosCache = dados;

    const filtrados = this.filtrar(dados);

    if (!this.grafo) {
      this.grafo = ForceGraph()(this.container)
        .backgroundColor("transparent")
        .nodeLabel((n: any) => `${n.label ?? n.id}${n.category ? ` (${n.category})` : ""}`)
        .nodeRelSize(6)
        // Nós desenhados na mão: pulso vivo + halo por categoria.
        .nodeCanvasObject((n: any, ctx: CanvasRenderingContext2D, escala: number) => {
          const cor = CORES[n.category ?? "default"] ?? CORES.default;
          const t = (performance.now() % 2000) / 2000; // 0→1 cíclico
          const pulso = 0.5 + 0.5 * Math.sin(t * Math.PI * 2);
          const raioBase = 6;
          const raio = raioBase + pulso * 2;
          // Halo brilhando
          ctx.beginPath();
          ctx.arc(n.x, n.y, raio + 6, 0, 2 * Math.PI);
          ctx.fillStyle = cor + Math.floor(pulso * 60 + 20).toString(16).padStart(2, "0");
          ctx.fill();
          // Núcleo
          ctx.beginPath();
          ctx.arc(n.x, n.y, raio, 0, 2 * Math.PI);
          ctx.fillStyle = cor;
          ctx.shadowColor = cor;
          ctx.shadowBlur = 12;
          ctx.fill();
          ctx.shadowBlur = 0;
          // Label
          if (escala > 1.5) {
            ctx.fillStyle = "#e2e8f0";
            ctx.font = `${10 / escala}px sans-serif`;
            ctx.textAlign = "center";
            ctx.fillText(n.label ?? n.id, n.x, n.y + raio + 8 / escala);
          }
        })
        .nodePointerAreaPaint((n: any, cor: string, ctx: CanvasRenderingContext2D) => {
          ctx.fillStyle = cor;
          ctx.beginPath();
          ctx.arc(n.x, n.y, 10, 0, 2 * Math.PI);
          ctx.fill();
        })
        .linkColor((l: any) => (l.ativa ? "rgba(52, 211, 153, 0.55)" : "rgba(148, 163, 184, 0.28)"))
        .linkWidth((l: any) => (l.ativa ? 2.2 : 0.9))
        .linkDirectionalParticles((l: any) => (l.ativa ? 5 : 1))
        .linkDirectionalParticleSpeed(0.009)
        .linkDirectionalParticleWidth((l: any) => (l.ativa ? 3.5 : 1.6))
        .linkDirectionalParticleColor((l: any) => (l.ativa ? "#34d399" : "#64748b"))
        .onNodeClick((n: any) => this.aoClicarNo(n))
        .cooldownTicks(120)
        .warmupTicks(40);

      // Loop de re-render pra manter o pulso animado mesmo parado.
      const animar = () => {
        if (!this.grafo) return;
        this.grafo.d3ReheatSimulation?.();
        this.grafo.nodeRelSize(6); // trigger re-paint
        requestAnimationFrame(animar);
      };
      requestAnimationFrame(animar);
    }

    this.grafo.graphData(filtrados);
    this.ajustarTamanho();
  }

  private aplicarFiltro() {
    if (this.dadosCache) this.render(this.dadosCache);
  }

  private filtrar(dados: DadosGrafo): DadosGrafo {
    if (this.filtroAtual === "todos") return dados;
    const nodes = dados.nodes.filter((n) => n.category === this.filtroAtual);
    const ids = new Set(nodes.map((n) => n.id));
    const edges = dados.edges.filter((e) => ids.has(e.source) && ids.has(e.target));
    return { nodes, edges };
  }

  private ajustarTamanho() {
    if (!this.grafo || !this.container) return;
    const r = this.container.getBoundingClientRect();
    this.grafo.width(r.width).height(r.height);
  }

  private aoClicarNo(n: any) {
    if (!this.plugin.settings.abrirNotaAoClicar) return;
    if (n.obsidian_path) {
      this.app.workspace.openLinkText(n.obsidian_path, "", false);
    } else {
      new Notice(`Nó ${n.label ?? n.id} — sem nota vinculada`);
    }
  }

  onResize() { this.ajustarTamanho(); }
}
