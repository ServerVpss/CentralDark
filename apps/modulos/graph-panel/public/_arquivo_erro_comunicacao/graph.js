// Grafo CentralDark — renderizador force-graph
// Efeito de partículas fluindo nas arestas + cor por status/categoria + destaque no hover.
// Mantém compat com o /api/graph atual (nodes/edges do server.js).

const graphEl = document.getElementById("graph");
const nodesEl = document.getElementById("nodes");
const edgesEl = document.getElementById("edges");
const communitiesEl = document.getElementById("communities");
const updatedEl = document.getElementById("updated");
const reportEl = document.getElementById("report");
const auditEl = document.getElementById("audit");
const historyEl = document.getElementById("history");

let fg = null;
let dadosGrafo = { nodes: [], links: [] };
let noHover = null;
let vizinhos = new Set();
let arestasVizinhas = new Set();

function escapeHtml(v) {
  return String(v).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}
function markdown(md) {
  return escapeHtml(md)
    .replace(/^# (.*)$/gm, "<h1>$1</h1>")
    .replace(/^## (.*)$/gm, "<h2>$1</h2>")
    .replace(/^### (.*)$/gm, "<h3>$1</h3>")
    .replace(/^- (.*)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>")
    .replace(/\n\n/g, "</p><p>").replace(/^/, "<p>").replace(/$/, "</p>");
}
async function getJson(path) {
  const r = await fetch(path, { cache: "no-store" });
  if (!r.ok) throw new Error(`Falha em ${path}`);
  return r.json();
}

// Paleta por status/categoria — bate o olho e entende a saúde
const CORES_STATUS = {
  online: "#10b981",   // verde
  healthy: "#10b981",
  ok: "#10b981",
  degraded: "#f59e0b", // amarelo
  warning: "#f59e0b",
  unstable: "#f59e0b",
  errored: "#ef4444",  // vermelho
  down: "#ef4444",
  offline: "#ef4444",
  stopped: "#ef4444",
};
const CORES_CATEGORIA = {
  ia: "#a78bfa",
  bot: "#38bdf8",
  mcp: "#22d3ee",
  edge: "#818cf8",
  supabase: "#34d399",
  vps: "#60a5fa",
  modulo: "#f472b6",
  doc: "#94a3b8",
  gateway: "#fbbf24",
  servico: "#e879f9",
  monitoramento: "#fb7185",
  orquestrador: "#facc15",
};
function corDoNo(n) {
  const st = String(n.status || "").toLowerCase();
  if (CORES_STATUS[st]) return CORES_STATUS[st];
  const cat = String(n.category || n.group || n.type || "").toLowerCase();
  if (CORES_CATEGORIA[cat]) return CORES_CATEGORIA[cat];
  return "#64748b"; // cinza-azulado neutro
}
function ehCritico(n) {
  const st = String(n.status || "").toLowerCase();
  return st === "errored" || st === "down" || st === "offline" || st === "stopped";
}

function normalizar(graph) {
  const nodes = (graph.nodes || []).map(n => ({
    ...n,
    id: n.id,
    label: n.label || n.id,
  }));
  const idsValidos = new Set(nodes.map(n => n.id));
  // O server pode entregar `edges` com {from,to} (vis) OU {source,target} (force). Aceita ambos.
  const links = (graph.edges || graph.links || [])
    .map(e => ({
      ...e,
      source: e.source ?? e.from,
      target: e.target ?? e.to,
      value: e.value ?? e.weight ?? 1,
    }))
    .filter(e => idsValidos.has(e.source) && idsValidos.has(e.target));
  return { nodes, links };
}

function indexarVizinhos(no) {
  vizinhos = new Set();
  arestasVizinhas = new Set();
  if (!no) return;
  vizinhos.add(no.id);
  for (const l of dadosGrafo.links) {
    const s = typeof l.source === "object" ? l.source.id : l.source;
    const t = typeof l.target === "object" ? l.target.id : l.target;
    if (s === no.id) { vizinhos.add(t); arestasVizinhas.add(l); }
    else if (t === no.id) { vizinhos.add(s); arestasVizinhas.add(l); }
  }
}

function renderGraph(graph) {
  dadosGrafo = normalizar(graph);
  const largura = graphEl.clientWidth || 800;
  const altura = graphEl.clientHeight || 600;

  if (!fg) {
    fg = ForceGraph()(graphEl)
      .backgroundColor("rgba(0,0,0,0)")
      .width(largura).height(altura)
      .nodeRelSize(5)
      .nodeLabel(n => n.label || n.id)
      .nodeCanvasObject((node, ctx, scale) => {
        const cor = corDoNo(node);
        const foco = noHover ? vizinhos.has(node.id) : true;
        const alpha = foco ? 1 : 0.15;
        const r = 5 + Math.min(6, (node.val || node.size || 0) / 4);

        // Pulso vivo em nó crítico
        if (ehCritico(node)) {
          const t = (Date.now() % 1400) / 1400;
          const rp = r + t * 12;
          ctx.beginPath();
          ctx.arc(node.x, node.y, rp, 0, 2 * Math.PI);
          ctx.strokeStyle = `rgba(239,68,68,${(1 - t) * 0.55 * alpha})`;
          ctx.lineWidth = 2 / scale;
          ctx.stroke();
        }

        // Nó
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
        ctx.fillStyle = cor + (alpha < 1 ? "26" : "");
        ctx.globalAlpha = alpha;
        ctx.fill();
        ctx.lineWidth = 1.2 / scale;
        ctx.strokeStyle = "rgba(255,255,255,.35)";
        ctx.stroke();

        // Label
        const fs = Math.max(10 / scale, 3);
        ctx.font = `${fs}px Inter, system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillStyle = `rgba(238,248,241,${0.85 * alpha})`;
        ctx.fillText(node.label || node.id, node.x, node.y + r + 2);
        ctx.globalAlpha = 1;
      })
      .linkColor(l => {
        if (noHover && !arestasVizinhas.has(l)) return "rgba(148,163,184,.08)";
        return "rgba(110,231,183,.35)";
      })
      .linkWidth(l => (noHover && arestasVizinhas.has(l) ? 2 : 0.8))
      .linkDirectionalParticles(l => {
        if (noHover && !arestasVizinhas.has(l)) return 0;
        return Math.min(4, Math.max(1, Math.ceil((l.value || 1) / 2)));
      })
      .linkDirectionalParticleSpeed(l => 0.003 + (l.value || 1) * 0.0008)
      .linkDirectionalParticleWidth(2)
      .linkDirectionalParticleColor(l => {
        if (noHover && arestasVizinhas.has(l)) return "#fde68a";
        return "#10b981";
      })
      .linkDirectionalArrowLength(3)
      .linkDirectionalArrowRelPos(1)
      .onNodeHover(n => {
        noHover = n || null;
        indexarVizinhos(noHover);
        graphEl.style.cursor = n ? "pointer" : "default";
      })
      .onNodeClick(n => {
        fg.centerAt(n.x, n.y, 600);
        fg.zoom(2.2, 600);
      })
      .warmupTicks(120)
      .cooldownTicks(300)
      .cooldownTime(8000)
      .autoPauseRedraw(true)
      .d3AlphaDecay(0.035)
      .d3VelocityDecay(0.5);

    // Física — espalhar bem, sem sobreposição
    if (fg.d3Force) {
      const chg = fg.d3Force("charge");
      if (chg) chg.strength(-600).distanceMax(800);
      const lnk = fg.d3Force("link");
      if (lnk) lnk.distance(60).strength(0.25);
      const ctr = fg.d3Force("center");
      if (ctr && ctr.strength) ctr.strength(0.04);
      if (window.d3 && window.d3.forceCollide) {
        fg.d3Force("collide", window.d3.forceCollide(14));
      }
    }

    const ajustar = () => fg.width(graphEl.clientWidth).height(graphEl.clientHeight || 600);
    if (window.ResizeObserver) new ResizeObserver(ajustar).observe(graphEl);
    window.addEventListener("resize", ajustar);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) fg.pauseAnimation(); else fg.resumeAnimation();
    });
  }

  fg.graphData(dadosGrafo);
}

async function loadAll() {
  const [graph, stats, report, audit, history] = await Promise.all([
    getJson("/api/graph"), getJson("/api/stats"), getJson("/api/report"),
    getJson("/api/audit"), getJson("/api/history"),
  ]);
  renderGraph(graph);
  nodesEl.textContent = stats.nodes ?? 0;
  edgesEl.textContent = stats.edges ?? 0;
  communitiesEl.textContent = stats.communities ?? 0;
  updatedEl.textContent = stats.modifiedAt ? new Date(stats.modifiedAt).toLocaleString("pt-BR") : "—";
  reportEl.innerHTML = markdown(report.markdown || "");
  auditEl.innerHTML = markdown(audit.markdown || "");
  historyEl.innerHTML = (history.items || [])
    .map(i => `<li>${escapeHtml(i.file)}<br>${escapeHtml(new Date(i.updatedAt).toLocaleString("pt-BR"))}</li>`)
    .join("") || "<li>Sem histórico ainda.</li>";
}

async function startRun(mode) {
  const r = await fetch(`/api/run?mode=${mode}`, { method: "POST" });
  const data = await r.json();
  alert(data.message || "Run solicitado.");
}

document.getElementById("refresh").addEventListener("click", loadAll);
document.getElementById("runLovable").addEventListener("click", () => startRun("lovable"));
document.getElementById("runGraphifyy").addEventListener("click", () => startRun("graphifyy"));

async function loadStatus() {
  const statusEl = document.getElementById("live-status");
  try {
    const s = await getJson("/api/status");
    let html = `<p><strong>Sistema:</strong> ${s.system.load} | RAM: ${s.system.mem}</p>`;
    html += `<p><strong>PM2 online:</strong> ${s.pm2.filter(p => p.status === "online").length}/${s.pm2.length}</p>`;
    if (s.claude?.length) {
      html += `<p><strong>🤖 Claude:</strong></p><ul>`;
      s.claude.forEach(c => { html += `<li>CPU:${c.cpu}% ${c.cmd.slice(0, 40)}</li>`; });
      html += `</ul>`;
    } else {
      html += `<p>🤖 Claude: aguardando...</p>`;
    }
    html += `<small>${new Date(s.time).toLocaleString("pt-BR")}</small>`;
    statusEl.innerHTML = html;
  } catch {
    statusEl.innerHTML = `<p>Offline</p>`;
  }
}
loadStatus();
setInterval(loadStatus, 5000);
loadAll().catch(err => { reportEl.textContent = `Falha ao carregar painel: ${err.message}`; });
