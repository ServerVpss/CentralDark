// View 3D do Grafo Jarvis — renderiza o ecossistema CentralDark em 3D
// Usa 3d-force-graph bundleado via esbuild (npm dep, não CDN)
// Consome /api/graph do graph-panel (PM2 porta 3030)

import { ItemView, WorkspaceLeaf, Notice, requestUrl, Platform } from "obsidian";
import ForceGraph3D from "3d-force-graph";
import SpriteText from "three-spritetext";
import * as THREE from "three";

export const VIEW_TYPE_GRAFO_3D = "centraldark-grafo-3d-view";

// Paleta Esmeralda — mesma do vault.html
const PALETTE: Record<string, string> = {
  core: "#00eaff",
  bots: "#ffb020",
  edge: "#c084fc",
  infra: "#00ffa3",
  web: "#4da6ff",
  ia: "#ff6ec7",
  dados: "#facc15",
  default: "#7f9db9",
};

function colorFor(group: string): string {
  const g = (group || "default").toLowerCase();
  return PALETTE[g] || `hsl(${Math.abs(hashCode(g)) % 360}, 86%, 64%)`;
}

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function isOnline(st?: string): boolean {
  return (st || "").toLowerCase() === "online";
}

function isDown(st?: string): boolean {
  return /erro|stop|down|off|fail|dead|crash/.test((st || "").toLowerCase());
}

function isAgent(n: any): boolean {
  return /agente|agent|bot|mcp|hermes|guardiao|elite|zentinel|worker|memoria|respiracao/.test(
    String((n && (n.group + " " + n.type + " " + n.pm2 + " " + n.id)) || "").toLowerCase()
  );
}

interface NoData {
  id: string;
  label?: string;
  group?: string;
  type?: string;
  status?: string;
  pm2?: string;
  size?: number;
  cpu?: number;
  memMB?: number;
  restarts?: number;
  uptimeMin?: number;
  x?: number;
  y?: number;
  z?: number;
}

interface LinkData {
  source: string;
  target: string;
  weight?: number;
  label?: string;
}

interface GraphData {
  nodes: NoData[];
  edges: LinkData[];
}

export class Grafo3DView extends ItemView {
  private container: HTMLDivElement | null = null;
  private graph: any = null;
  private graphData: GraphData = { nodes: [], edges: [] };
  private statusEl: HTMLSpanElement | null = null;
  private statsEl: HTMLSpanElement | null = null;
  private rotating = false;
  private labelScale = 1;      // multiplicador de tamanho de fonte dos rótulos
  private labelsAlwaysOn = true; // rótulos sempre visíveis
  private selected: any = null;
  private pollTimer: number | null = null;
  private sectorSprites: Record<string, SpriteText> = {};
  private scene: THREE.Scene | null = null;

  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
  }

  getViewType() { return VIEW_TYPE_GRAFO_3D; }
  getDisplayText() { return "Grafo 3D · Jarvis"; }
  getIcon() { return "orbit"; }

  async onOpen() {
    const root = this.containerEl.children[1] as HTMLElement;
    root.empty();
    root.addClass("cd-grafo-vivo-root");

    // Toolbar
    const toolbar = root.createDiv({ cls: "cd-grafo-toolbar" });

    const btnRot = toolbar.createEl("button", { text: "🌀 rotação", cls: "cd-grafo-btn" });
    btnRot.addEventListener("click", () => {
      this.rotating = !this.rotating;
      try { this.graph.controls().autoRotate = this.rotating; } catch {}
      btnRot.setText(this.rotating ? "🌀 ON" : "🌀 rotação");
    });

    const btnReset = toolbar.createEl("button", { text: "⛶ reset", cls: "cd-grafo-btn" });
    btnReset.addEventListener("click", () => this.resetCamera());

    const btnReload = toolbar.createEl("button", { text: "🔄", cls: "cd-grafo-btn" });
    btnReload.setAttr("aria-label", "Recarregar agora");
    btnReload.addEventListener("click", () => this.carregar());

    // Controle de tamanho da fonte dos rótulos
    const btnFontMenos = toolbar.createEl("button", { text: "A−", cls: "cd-grafo-btn" });
    btnFontMenos.setAttr("aria-label", "Diminuir fonte");
    btnFontMenos.addEventListener("click", () => { this.labelScale = Math.max(0.5, this.labelScale - 0.2); this.aplicarEscalaLabels(); });
    const btnFontMais = toolbar.createEl("button", { text: "A+", cls: "cd-grafo-btn" });
    btnFontMais.setAttr("aria-label", "Aumentar fonte");
    btnFontMais.addEventListener("click", () => { this.labelScale = Math.min(3, this.labelScale + 0.2); this.aplicarEscalaLabels(); });
    const btnLabels = toolbar.createEl("button", { text: "🏷️ labels", cls: "cd-grafo-btn" });
    btnLabels.addEventListener("click", () => { this.labelsAlwaysOn = !this.labelsAlwaysOn; this.aplicarEscalaLabels(); btnLabels.setText(this.labelsAlwaysOn ? "🏷️ ON" : "🏷️ off"); });

    this.statusEl = toolbar.createEl("span", { cls: "cd-grafo-status", text: "…" });
    this.statsEl = toolbar.createEl("span", { cls: "cd-grafo-status", text: "" });

    // Container 3D
    this.container = root.createDiv({ cls: "cd-grafo-canvas" });

    // Primeira carga
    await this.carregar();

    // Poll a cada 5s
    this.pollTimer = window.setInterval(() => this.carregar(), 5000);

    // Pulse loop
    const pulseLoop = () => {
      this.pulseNodes();
      this.updateSectorLabels();
      requestAnimationFrame(pulseLoop);
    };
    requestAnimationFrame(pulseLoop);
  }

  async onClose() {
    if (this.pollTimer !== null) {
      window.clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    if (this.graph) {
      try { this.graph._destructor?.(); } catch {}
      this.graph = null;
    }
    this.sectorSprites = {};
  }

  private async carregar() {
    try {
      const resp = await requestUrl({
        url: "https://grafo.centralldark.com/api/graph",
        method: "GET",
      });
      if (resp.status < 200 || resp.status >= 300) throw new Error(`HTTP ${resp.status}`);
      const raw = resp.json;
      this.processarDados(raw);
      if (this.statusEl) this.statusEl.setText(`🟢 ${this.graphData.nodes.length} nós`);
    } catch (e: any) {
      if (this.statusEl) this.statusEl.setText(`🔴 erro: ${e.message ?? e}`);
      console.error("[Grafo3D] falha ao carregar", e);
    }
  }

  private processarDados(raw: any) {
    const nodesBrutos = Array.isArray(raw.nodes) ? raw.nodes : [];
    const edgesBrutas = Array.isArray(raw.edges)
      ? raw.edges
      : Array.isArray(raw.links)
        ? raw.links
        : [];

    const nodes: NoData[] = nodesBrutos.map((n: any) => ({
      id: String(n.id),
      label: n.label || n.id,
      group: n.group || n.type || "default",
      type: n.type,
      status: n.status,
      pm2: n.pm2,
      size: n.size || n.val || 3,
      cpu: n.cpu,
      memMB: n.memMB,
      restarts: n.restarts,
      uptimeMin: n.uptimeMin,
    }));

    const nodeSet = new Set(nodes.map((n) => n.id));
    const edges: LinkData[] = edgesBrutas
      .map((e: any) => {
        const source = e.source ?? e.from;
        const target = e.target ?? e.to;
        if (source == null || target == null) return null;
        return {
          source: String(source),
          target: String(target),
          weight: typeof e.weight === "number" ? e.weight : 1,
          label: e.label,
        };
      })
      .filter((e: LinkData | null): e is LinkData =>
        e !== null && nodeSet.has(e.source) && nodeSet.has(e.target)
      );

    this.graphData = { nodes, edges };
    this.render();
  }

  private render() {
    if (!this.container) return;

    const dados = {
      nodes: this.graphData.nodes.map((n) => ({ ...n })),
      links: this.graphData.edges.map((e) => ({ source: e.source, target: e.target, weight: e.weight })),
    };

    if (!this.graph) {
      this.graph = ForceGraph3D()(this.container)
        .backgroundColor("#02120c")
        .showNavInfo(false)
        .nodeId("id")
        .nodeThreeObject((n: any) => this.criarNo3D(n))
        .linkSource("source")
        .linkTarget("target")
        .linkColor(() => "#10b98144")
        .linkWidth(0.5)
        .linkOpacity(0.4)
        .linkDirectionalParticles((l: any) => 2 + Math.min(4, Number(l.weight) || 1))
        .linkDirectionalParticleSpeed(0.006)
        .linkDirectionalParticleWidth(1.4)
        .linkDirectionalParticleColor((l: any) => {
          const src = typeof l.source === "object" ? l.source : this.graphData.nodes.find((n) => n.id === l.source);
          return src ? colorFor(src.group) : "#5eead4";
        })
        .nodeLabel((n: any) =>
          `<div style="font-family:ui-monospace,monospace;background:#02120cee;color:${colorFor(n.group)};padding:4px 9px;border:1px solid ${colorFor(n.group)}66;border-radius:5px;font-size:12px">${n.label} · <span style="opacity:.7">${n.group}</span></div>`
        )
        .onNodeClick((n: any) => {
          this.selected = n;
          this.focusNode(n, 120);
        })
        .warmupTicks(80)
        .cooldownTime(7000);

      // Luzes
      this.scene = this.graph.scene();
      const amb = new THREE.AmbientLight(0x88ddff, 0.65);
      const dir = new THREE.DirectionalLight(0xffffff, 0.85);
      dir.position.set(80, 120, 160);
      this.scene.add(amb);
      this.scene.add(dir);

      // Controles
      try {
        this.graph.controls().enableDamping = true;
        this.graph.controls().dampingFactor = 0.06;
        this.graph.controls().autoRotateSpeed = 0.7;
      } catch {}

      // Dimensões
      this.graph.width(this.container.clientWidth).height(this.container.clientHeight);

      // Resize observer
      const ro = new ResizeObserver(() => {
        if (this.graph && this.container) {
          this.graph.width(this.container.clientWidth).height(this.container.clientHeight);
        }
      });
      ro.observe(this.container);

      this.resetCamera();
    }

    this.graph.graphData(dados);
    this.atualizarStats();
  }

  private criarNo3D(n: any): THREE.Group {
    const col = colorFor(n.group);
    const r = 3 + (Number(n.size) || 0) * 0.3;
    const group = new THREE.Group();

    // Núcleo
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(r, 24, 16),
      new THREE.MeshPhongMaterial({
        color: col,
        emissive: col,
        emissiveIntensity: 0.6,
        shininess: 80,
      })
    );
    group.add(core);

    // Shell wireframe
    const shell = new THREE.Mesh(
      new THREE.IcosahedronGeometry(r * 1.6, 1),
      new THREE.MeshBasicMaterial({
        color: col,
        wireframe: true,
        transparent: true,
        opacity: 0.15,
        depthWrite: false,
      })
    );
    group.add(shell);

    // Label
    const txt = new SpriteText(String(n.label || n.id || ""));
    const baseH = isAgent(n) ? 3.4 : 2.5;
    n.__labelBase = baseH;
    txt.textHeight = baseH * this.labelScale;
    txt.color = "#bfefff";
    txt.position.y = r * 2.15;
    txt.material.depthWrite = false;
    group.add(txt);
    n.__label = txt;

    // Ícone de agente
    if (isAgent(n)) {
      const icon = new SpriteText("🤖");
      icon.textHeight = 4.5;
      icon.position.y = r * 2.15 + 5;
      icon.material.depthWrite = false;
      group.add(icon);
      n.__icon = icon;
    }

    // Guarda referências
    n.__obj = group;
    n.__core = core;
    n.__shell = shell;
    n.__label = txt;
    n.__radius = r;

    this.aplicarVisual(n);
    return group;
  }

  private aplicarVisual(n: any) {
    const col = colorFor(n.group);
    const st = String(n.status || "").toLowerCase();
    const core = n.__core;
    const shell = n.__shell;
    const label = n.__label;

    if (!core || !core.material) return;

    if (isOnline(st)) {
      core.material.color.set(col);
      core.material.emissive.set(col);
      core.material.emissiveIntensity = 0.6;
    } else if (isDown(st)) {
      core.material.color.set("#ff2244");
      core.material.emissive.set("#ff2244");
      core.material.emissiveIntensity = 0.9;
    } else {
      core.material.color.set("#586a78");
      core.material.emissive.set("#586a78");
      core.material.emissiveIntensity = 0.18;
    }

    if (shell && shell.material) {
      shell.material.color.set(isDown(st) ? "#ff2244" : st ? col : "#586a78");
      shell.material.opacity = isOnline(st) ? 0.17 : 0.10;
    }

    if (label) {
      label.color = isDown(st) ? "#ff2244" : "#bfefff";
    }
  }

  private pulseNodes() {
    const t = Date.now();
    this.graphData.nodes.forEach((n: any) => {
      const core = n.__core;
      const shell = n.__shell;
      const obj = n.__obj;
      if (!core || !core.material) return;

      const st = String(n.status || "").toLowerCase();
      const h = hashCode(n.id);

      if (isOnline(st)) {
        const col = colorFor(n.group);
        const v = 0.65 + 0.25 * Math.sin(t * 0.006 + h);
        core.material.color.set(col);
        core.material.emissive.set(col);
        core.material.emissiveIntensity = v;
        if (obj) {
          const s = 1 + 0.12 * Math.sin(t * 0.004 + h);
          obj.scale.set(s, s, s);
        }
      } else if (isDown(st)) {
        const on = Math.floor(t / 160 + h) % 2 === 0;
        core.material.color.set(on ? "#ff2244" : "#3b0610");
        core.material.emissive.set("#ff2244");
        core.material.emissiveIntensity = on ? 1.25 : 0.16;
        if (shell) shell.material.opacity = on ? 0.24 : 0.07;
        if (obj) {
          const s2 = on ? 1.15 : 0.9;
          obj.scale.set(s2, s2, s2);
        }
      } else {
        core.material.color.set("#586a78");
        core.material.emissive.set("#586a78");
        core.material.emissiveIntensity = 0.12;
        if (obj) obj.scale.set(1, 1, 1);
      }
    });
  }


  private aplicarEscalaLabels(): void {
    this.graphData.nodes.forEach((n: any) => {
      const t = n.__label;
      if (t) {
        const base = n.__labelBase || 2.5;
        t.textHeight = base * this.labelScale;
        t.visible = this.labelsAlwaysOn;
      }
    });
  }

  private groupSummary(): Record<string, { total: number; on: number; down: number; nodes: any[] }> {
    const m: Record<string, any> = {};
    this.graphData.nodes.forEach((n: any) => {
      const g = String(n.group || "default");
      if (!m[g]) m[g] = { total: 0, on: 0, down: 0, nodes: [] };
      m[g].total++;
      m[g].nodes.push(n);
      if (isOnline(n.status)) m[g].on++;
      else if (isDown(n.status)) m[g].down++;
    });
    return m;
  }

  private centroid(arr: any[]): { x: number; y: number; z: number } {
    let cx = 0, cy = 0, cz = 0, n = 0;
    (arr || []).forEach((a) => {
      if (isFinite(a.x) && isFinite(a.y) && isFinite(a.z)) {
        cx += a.x; cy += a.y; cz += a.z; n++;
      }
    });
    if (n) { cx /= n; cy /= n; cz /= n; }
    return { x: cx, y: cy, z: cz };
  }

  private updateSectorLabels() {
    if (!this.graph || !this.scene) return;
    const m = this.groupSummary();
    const seen: Record<string, boolean> = {};

    Object.keys(m).forEach((g) => {
      seen[g] = true;
      let sp = this.sectorSprites[g];
      if (!sp) {
        sp = new SpriteText(g.toUpperCase());
        sp.textHeight = 7;
        sp.color = colorFor(g);
        sp.strokeColor = "rgba(0,0,0,.9)";
        sp.strokeWidth = 2;
        sp.material.depthWrite = false;
        this.scene!.add(sp);
        this.sectorSprites[g] = sp;
      }
      const c = this.centroid(m[g].nodes);
      sp.position.set(c.x, c.y + 24, c.z);
      sp.visible = true;
      sp.color = colorFor(g);
    });

    Object.keys(this.sectorSprites).forEach((g) => {
      if (!seen[g]) {
        this.scene!.remove(this.sectorSprites[g]);
        try { this.sectorSprites[g].dispose?.(); } catch {}
        delete this.sectorSprites[g];
      }
    });
  }

  private atualizarStats() {
    if (!this.statsEl) return;
    const on = this.graphData.nodes.filter((n) => isOnline(n.status)).length;
    const down = this.graphData.nodes.filter((n) => isDown(n.status)).length;
    this.statsEl.setText(`🟢${on} 🔴${down} · ${this.graphData.edges.length} links`);
  }

  private focusPoint(p: { x: number; y: number; z: number }, dist: number) {
    if (!this.graph) return;
    this.graph.cameraPosition(
      { x: p.x + dist * 0.55, y: p.y + dist * 0.28, z: p.z + dist },
      { x: p.x, y: p.y, z: p.z },
      1000
    );
  }

  private focusNode(n: any, dist: number) {
    this.focusPoint({ x: n.x || 0, y: n.y || 0, z: n.z || 0 }, dist);
  }

  private resetCamera() {
    this.focusPoint({ x: 0, y: 0, z: 0 }, 260);
  }

  onResize() {
    if (this.graph && this.container) {
      this.graph.width(this.container.clientWidth).height(this.container.clientHeight);
    }
  }
}
