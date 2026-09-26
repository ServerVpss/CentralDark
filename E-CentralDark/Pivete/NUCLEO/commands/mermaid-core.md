# COMANDO - mermaid-core.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\scripts\grafo-vivo\mermaid-core.mjs
**SHA:** 5ba7501cf841d2b2
**Timestamp:** 2026-08-28T02:57:35.322111
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const start = stack.indexOf(id);

### Ouro Bruto (primeiros 5000 chars)
```
import crypto from 'node:crypto';

const GROUPS_FOCUS = new Set(['core', 'edge-ia', 'monitoramento']);
const TYPES_FOCUS = new Set(['orquestrador', 'gateway', 'storage']);

export function safeMermaidId(value) {
  return String(value ?? '').replace(/[^a-zA-Z0-9]/g, '_') || 'node';
}

export function cleanGraphLabel(value) {
  return String(value ?? '')
    .replace(/^[\u{1F7E2}\u{1F534}\u{1F7E1}⚪]\s*/u, '')
    .replace(/[\uD800-\uDFFF�]/g, '')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/["`<>[\]{}]/g, "'")
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function statusDot(status) {
  return ({ online: '🟢', stopped: '🔴', errored: '🟡', launching: '🟡' }[status] || '⚪');
}

function compareText(a, b) {
  return String(a).localeCompare(String(b), 'en');
}

function normalizedNode(node = {}) {
  return {
    id: String(node.id ?? ''),
    label: cleanGraphLabel(node.label),
    group: String(node.group ?? ''),
    type: String(node.type ?? ''),
    status: String(node.status ?? ''),
    pm2: String(node.pm2 ?? ''),
  };
}

function normalizedEdge(edge = {}) {
  return {
    from: String(edge.from ?? ''),
    to: String(edge.to ?? ''),
    label: cleanGraphLabel(edge.label).slice(0, 22),
  };
}

export function semanticGraphPayload(graph = {}) {
  const nodes = (Array.isArray(graph.nodes) ? graph.nodes : [])
    .map(normalizedNode)
    .filter((node) => node.id)
    .sort((a, b) => compareText(a.id, b.id));

  const edges = (Array.isArray(graph.edges) ? graph.edges : [])
    .map(normalizedEdge)
    .filter((edge) => edge.from && edge.to)
    .sort((a, b) => compareText(`${a.from}\u0000${a.to}\u0000${a.label}`, `${b.from}\u0000${b.to}\u0000${b.label}`));

  const stats = graph.stats && typeof graph.stats === 'object' ? graph.stats : {};
  const fluxos = (Array.isArray(stats.fluxos_criticos) ? stats.fluxos_criticos : [])
    .map((item) => String(item))
    .sort(compareText);

  return {
    nodes,
    edges,
    stats: {
      total_nodes: Number(stats.total_nodes ?? nodes.length),
      total_edges: Number(stats.total_edges ?? edges.length),
      online: Number(stats.online ?? 0),
      offline: Number(stats.offline ?? 0),
      processos_vivos: Number(stats.processos_vivos ?? 0),
      gateway_req_15min: Number(stats.gateway_req_15min ?? 0),
      fluxos_criticos: fluxos,
    },
  };
}

export function computeGraphFingerprint(graph = {}) {
  const payload = JSON.stringify(semanticGraphPayload(graph));
  return crypto.createHash('sha256').update(payload).digest('hex');
}

function findCycleNodes(nodeIds, edges) {
  const adjacency = new Map([...nodeIds].map((id) => [id, []]));
  for (const edge of edges) {
    if (adjacency.has(edge.from) && adjacency.has(edge.to)) adjacency.get(edge.from).push(edge.to);
  }
  for (const list of adjacency.values()) list.sort(compareText);

  const visiting = new Set();
  const visited = new Set();
  const cycleNodes = new Set();

  function visit(id, stack) {
    if (visiting.has(id)) {
      const start = stack.indexOf(id);
      for (const node of stack.slice(Math.max(0, start))) cycleNodes.add(node);
      cycleNodes.add(id);
      return;
    }
    if (visited.has(id)) return;

    visiting.add(id);
    stack.push(id);
    for (const next of adjacency.get(id) || []) visit(next, stack);
    stack.pop();
    visiting.delete(id);
    visited.add(id);
  }

  for (const id of [...nodeIds].sort(compareText)) visit(id, []);
  return [...cycleNodes].sort(compareText);
}

export function auditGraphRelations(graph = {}) {
  const payload = semanticGraphPayload(graph);
  const nodeIds = new Set(payload.nodes.map((node) => node.id));
  const edgeKeys = new Set();
  const duplicates = [];
  const dangling = [];
  const selfLoops = [];
  const degree = new Map(payload.nodes.map((node) => [node.id, 0]));

  for (const edge of payload.edges) {
    const key = `${edge.from}\u0000${edge.to}\u0000${edge.label}`;
    if (edgeKeys.has(key)) duplicates.push(edge);
    else edgeKeys.add(key);

    if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) dangling.push(edge);
    if (edge.from === edge.to) selfLoops.push(edge);
    if (degree.has(edge.from)) degree.set(edge.from, degree.get(edge.from) + 1);
    if (degree.has(edge.to)) degree.set(edge.to, degree.get(edge.to) + 1);
  }

  const validEdges = payload.edges.filter((edge) => nodeIds.has(edge.from) && nodeIds.has(edge.to));
  const isolatedNodes = [...degree.entries()]
    .filter(([, count]) => count === 0)
    .map(([id]) => id)
    .sort(compareText);

  return {
    dangling_edges: dangling,
    duplicate_edges: duplicates,
    self_loops: selfLoops,
    cycle_nodes: findCycleNodes(nodeIds, validEdges),
    isolated_nodes: isolatedNodes,
  };
}

export function buildGraphProjection(graph = {}) {
  const payload = semanticGraphPayload(graph);

  const focusNodes = payload.nodes.filter(
    (node) => node.status || GROUPS_FOCUS.has(node.group) || TYPES_FOCUS.has(node.type),
  );
  const focusIds = new Set(focusNodes.map((node) => 
```