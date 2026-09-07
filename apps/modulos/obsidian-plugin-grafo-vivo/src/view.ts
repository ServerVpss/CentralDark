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

interface DadosForceGraph {
  nodes: NoGrafo[];
  links: ArestaGrafo[];
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
  private origemEl: HTMLSpanElement | null = null;
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

    // Toolbar: filtro + origem + status.
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

    this.origemEl = toolbar.createEl("span", { cls: "cd-grafo-source", text: this.formatarOrigem() });
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
    const origem = this.formatarOrigem();
    if (this.origemEl) this.origemEl.setText(origem);
    try {
      // Usa requestUrl do Obsidian pra ignorar CORS (funciona desktop e mobile).
      const resp = await requestUrl({ url: this.plugin.settings.urlGrafo, method: "GET" });
      if (resp.status < 200 || resp.status >= 300) throw new Error(`HTTP ${resp.status}`);
      const dados = this.normalizarDados(resp.json);
      this.render(dados);
      const hora = new Date().toLocaleTimeString("pt-BR");
      if (this.statusEl) this.statusEl.setText(`🟢 ${dados.nodes.length} nós • ${origem} • ${hora}`);
    } catch (e: any) {
      if (this.statusEl) this.statusEl.setText(`🔴 ${origem} • erro: ${e.message ?? e}`);
      console.error("[GrafoVivo] falha ao carregar", e);
    }
  }

  private formatarOrigem(): string {
    const url = this.plugin.settings.urlGrafo?.trim();
    if (!url) return "origem: sem URL";
    try {
      const parsed = new URL(url);
      const path = parsed.pathname === "/" ? "" : parsed.pathname;
      return `origem: ${parsed.host}${path}`;
    } catch {
      return `origem: ${url}`;
    }
  }

  // Mapa de tipos/grupos vindos do graph-data.json → categorias de cor do plugin.
  private mapearCategoria(tipo?: string, grupo?: string): string {
    const chave = (tipo ?? grupo ?? "").toLowerCase();
    if (!chave) return "doc";
    if (chave.includes("bot")) return "bot";
    if (chave.includes("mcp") || chave === "orquestrador" || chave === "core") return "mcp";
    if (chave.includes("edge") || chave.includes("function")) return "edge";
    if (chave.includes("supabase") || chave.includes("db")) return "supabase";
    if (chave.includes("vps") || chave.includes("server")) return "vps";
    if (chave.includes("ia") || chave.includes("ai") || chave.includes("gpt") || chave.includes("claude") || chave.includes("gemini")) return "ia";
    if (chave.includes("modulo") || chave.includes("module") || chave.includes("app")) return "modulo";
    return "doc";
  }

  // Normaliza o JSON bruto: aceita schema antigo (category/source/target/ativa)
  // e o novo do status.centralldark.com (type/group/from/to/weight).
  private normalizarDados(bruto: any): DadosGrafo {
    if (!bruto || typeof bruto !== "object") {
      return { nodes: [], edges: [] };
    }
    const nodesBrutos = Array.isArray(bruto.nodes) ? bruto.nodes : [];
    const edgesBrutas = Array.isArray(bruto.edges)
      ? bruto.edges
      : Array.isArray(bruto.links)
        ? bruto.links
        : [];

    const nodes: NoGrafo[] = nodesBrutos.map((n: any) => ({
      id: String(n.id),
      label: n.label ?? n.id,
      category: n.category ?? this.mapearCategoria(n.type, n.group),
      obsidian_path: n.obsidian_path,
    }));

    const edges: ArestaGrafo[] = edgesBrutas.map((e: any) => {
      const source = e.source ?? e.from;
      const target = e.target ?? e.to;
      const peso = typeof e.weight === "number" ? e.weight : undefined;
      const ativa = e.ativa ?? (peso !== undefined ? peso >= 3 : true);
      if (source === undefined || target === undefined || source === null || target === null) {
        return null;
      }
      return { source: String(source), target: String(target), ativa };
    }).filter((e): e is ArestaGrafo => Boolean(e?.source && e?.target));

    return { nodes, edges };
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
        .nodeRelSize(7)
        // Nós desenhados na mão: pulso vivo + halo por categoria.
        .nodeCanvasObject((n: any, ctx: CanvasRenderingContext2D, escala: number) => {
          const cor = CORES[n.category ?? "default"] ?? CORES.default;
          const t = (performance.now() % 2000) / 2000; // 0→1 cíclico
          const pulso = 0.5 + 0.5 * Math.sin(t * Math.PI * 2);
          const raioBase = 6.5;
          const raio = raioBase + pulso * 2.4;
          // Halo brilhando
          ctx.beginPath();
          ctx.arc(n.x, n.y, raio + 7, 0, 2 * Math.PI);
          ctx.fillStyle = cor + Math.floor(pulso * 60 + 20).toString(16).padStart(2, "0");
          ctx.fill();
          // Núcleo
          ctx.beginPath();
          ctx.arc(n.x, n.y, raio, 0, 2 * Math.PI);
          ctx.fillStyle = cor;
          ctx.shadowColor = cor;
          ctx.shadowBlur = 14;
          ctx.fill();
          ctx.shadowBlur = 0;
          // Label maior e mais cedo, para aparecer melhor no Obsidian.
          if (escala > 0.55) {
            const label = String(n.label ?? n.id);
            const fontSize = 13 / escala;
            const paddingX = 4 / escala;
            const paddingY = 2 / escala;
            ctx.font = `700 ${fontSize}px sans-serif`;
            const largura = ctx.measureText(label).width;
            const x = n.x - largura / 2 - paddingX;
            const y = n.y + raio + 5 / escala;
            ctx.fillStyle = "rgba(15, 23, 42, 0.72)";
            ctx.fillRect(x, y, largura + paddingX * 2, fontSize + paddingY * 2);
            ctx.fillStyle = "#f8fafc";
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.fillText(label, n.x, y + paddingY);
          }
        })
        .nodePointerAreaPaint((n: any, cor: string, ctx: CanvasRenderingContext2D) => {
          ctx.fillStyle = cor;
          ctx.beginPath();
          ctx.arc(n.x, n.y, 12, 0, 2 * Math.PI);
          ctx.fill();
        })
        .linkColor((l: any) => (l.ativa ? "rgba(52, 211, 153, 0.65)" : "rgba(148, 163, 184, 0.4)"))
        .linkWidth((l: any) => (l.ativa ? 2.4 : 1.1))
        .linkDirectionalParticles((l: any) => (l.ativa ? 5 : 2))
        .linkDirectionalParticleSpeed(0.009)
        .linkDirectionalParticleWidth((l: any) => (l.ativa ? 3.5 : 2))
        .linkDirectionalParticleColor((l: any) => (l.ativa ? "#34d399" : "#94a3b8"))
        .onNodeClick((n: any) => this.aoClicarNo(n))
        .cooldownTicks(120)
        .warmupTicks(40);

      // Loop de re-render pra manter o pulso animado mesmo parado.
      const animar = () => {
        if (!this.grafo) return;
        this.grafo.d3ReheatSimulation?.();
        this.grafo.nodeRelSize(7); // trigger re-paint
        requestAnimationFrame(animar);
      };
      requestAnimationFrame(animar);
    }

    this.grafo.graphData(this.paraForceGraph(filtrados));
    this.ajustarTamanho();
  }

  private paraForceGraph(dados: DadosGrafo): DadosForceGraph {
    return {
      nodes: dados.nodes.map((n) => ({ ...n })),
      links: dados.edges.map((e) => ({ ...e })),
    };
  }

  private aplicarFiltro() {
    if (this.dadosCache) this.render(this.dadosCache);
  }

  private filtrar(dados: DadosGrafo): DadosGrafo {
    const todosNodes = dados?.nodes ?? [];
    const todasEdges = dados?.edges ?? [];
    if (this.filtroAtual === "todos") return { nodes: todosNodes, edges: todasEdges };
    const nodes = todosNodes.filter((n) => n.category === this.filtroAtual);
    const ids = new Set(nodes.map((n) => n.id));
    const edges = todasEdges.filter((e) => ids.has(this.idEndpoint(e.source)) && ids.has(this.idEndpoint(e.target)));
    return { nodes, edges };
  }

  private idEndpoint(valor: any): string {
    return typeof valor === "object" && valor !== null ? String(valor.id ?? "") : String(valor ?? "");
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
