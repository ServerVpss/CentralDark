const graphEl = document.getElementById("graph");
const nodesEl = document.getElementById("nodes");
const edgesEl = document.getElementById("edges");
const communitiesEl = document.getElementById("communities");
const updatedEl = document.getElementById("updated");
const reportEl = document.getElementById("report");
const auditEl = document.getElementById("audit");
const historyEl = document.getElementById("history");
let network;

function escapeHtml(value) { return String(value).replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char])); }
function markdown(md) { return escapeHtml(md).replace(/^# (.*)$/gm, "<h1>$1</h1>").replace(/^## (.*)$/gm, "<h2>$1</h2>").replace(/^### (.*)$/gm, "<h3>$1</h3>").replace(/^- (.*)$/gm, "<li>$1</li>").replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>").replace(/\n\n/g, "</p><p>").replace(/^/, "<p>").replace(/$/, "</p>"); }
async function getJson(path) { const response = await fetch(path, { cache: "no-store" }); if (!response.ok) throw new Error(`Falha em ${path}`); return response.json(); }

function renderGraph(graph) {
  const nodes = new vis.DataSet((graph.nodes || []).map((node) => ({ ...node, shape: node.shape || "dot", size: node.size || 18, font: { color: "#eef8f1", size: 13 }, color: node.color || { background: "#34d399", border: "#0f5138" } })));
  const edges = new vis.DataSet((graph.edges || []).map((edge) => ({ ...edge, arrows: edge.arrows || "to", color: edge.color || "#6ee7b7", font: { color: "#9fb8aa", size: 10, strokeWidth: 0 } })));
  if (network) network.destroy();
  network = new vis.Network(graphEl, { nodes, edges }, { autoResize: true, physics: { stabilization: true, barnesHut: { gravitationalConstant: -24000, springLength: 130 } }, interaction: { hover: true, navigationButtons: true, keyboard: true }, nodes: { borderWidth: 2 }, edges: { smooth: { type: "dynamic" } } });
}

async function loadAll() {
  const [graph, stats, report, audit, history] = await Promise.all([getJson("/api/graph"), getJson("/api/stats"), getJson("/api/report"), getJson("/api/audit"), getJson("/api/history")]);
  renderGraph(graph);
  nodesEl.textContent = stats.nodes ?? 0;
  edgesEl.textContent = stats.edges ?? 0;
  communitiesEl.textContent = stats.communities ?? 0;
  updatedEl.textContent = stats.modifiedAt ? new Date(stats.modifiedAt).toLocaleString("pt-BR") : "—";
  reportEl.innerHTML = markdown(report.markdown || "");
  auditEl.innerHTML = markdown(audit.markdown || "");
  historyEl.innerHTML = (history.items || []).map((item) => `<li>${escapeHtml(item.file)}<br>${escapeHtml(new Date(item.updatedAt).toLocaleString("pt-BR"))}</li>`).join("") || "<li>Sem histórico ainda.</li>";
}
async function startRun(mode) { const response = await fetch(`/api/run?mode=${mode}`, { method: "POST" }); const data = await response.json(); alert(data.message || "Run solicitado."); }
document.getElementById("refresh").addEventListener("click", loadAll);
document.getElementById("runLovable").addEventListener("click", () => startRun("lovable"));
document.getElementById("runGraphifyy").addEventListener("click", () => startRun("graphifyy"));
loadAll().catch((error) => { reportEl.textContent = `Falha ao carregar painel: ${error.message}`; });
