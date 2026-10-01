#!/usr/bin/env node
/**
 * Nota viva do Grafo no Obsidian — lê graph-data.json e escreve uma nota Markdown
 * que renderiza no Obsidian (Mermaid nativo): topologia focada + saúde + auditoria.
 *
 * O Mermaid é projeção derivada do estado observado, nunca fonte de verdade.
 * A nota só é regravada quando o fingerprint semântico muda.
 */
import { existsSync, readFileSync } from 'node:fs';

import { atomicWriteUtf8Sync } from '../memory-linker/fs-safe.mjs';
import {
  buildGraphProjection,
  cleanGraphLabel,
  extractGraphFingerprint,
  statusDot,
} from './mermaid-core.mjs';

const ROOT = process.env.CENTRALDARK_ROOT || '/root/CentralDark';
const GRAPH_RELATIVE = 'apps/modulos/status/graph-data.json';
const GRAPH = `${ROOT}/${GRAPH_RELATIVE}`;
const PRIMARY_NOTE = `${ROOT}/docs/BRAIN/00-MAPA-SISTEMA/02-GRAFOS/GRAFO-VIVO.md`;
const LEGACY_NOTE = `${ROOT}/docs/BRAIN/00 - Mapa do Sistema/GRAFO-VIVO.md`;
const NOTE_TARGETS = [PRIMARY_NOTE, LEGACY_NOTE];

function edgeText(edge) {
  const label = edge.label ? ` (${edge.label})` : '';
  return `\`${edge.from} -> ${edge.to}\`${label}`;
}

function buildAuditMarkdown(audit) {
  const lines = [];

  for (const edge of audit.dangling_edges) {
    lines.push(`- 🔴 **Aresta órfã:** ${edgeText(edge)} referencia nó ausente.`);
  }
  for (const edge of audit.duplicate_edges) {
    lines.push(`- 🟡 **Aresta duplicada:** ${edgeText(edge)} aparece mais de uma vez.`);
  }
  for (const edge of audit.self_loops) {
    lines.push(`- 🟡 **Self-loop:** ${edgeText(edge)}. Pode ser legítimo, mas merece inspeção.`);
  }
  if (audit.cycle_nodes.length) {
    lines.push(`- 🟡 **Ciclo dirigido detectado:** ${audit.cycle_nodes.map((id) => `\`${id}\``).join(', ')}. Ciclo é achado, não erro automático.`);
  }
  if (audit.isolated_nodes.length) {
    lines.push(`- ⚪ **Nós isolados:** ${audit.isolated_nodes.slice(0, 20).map((id) => `\`${id}\``).join(', ')}${audit.isolated_nodes.length > 20 ? '…' : ''}.`);
  }

  return lines.length
    ? lines.join('\n')
    : '✅ Nenhum achado estrutural básico: sem aresta órfã, duplicada, self-loop, ciclo dirigido ou nó isolado.';
}

function main() {
  const g = JSON.parse(readFileSync(GRAPH, 'utf8'));
  const projection = buildGraphProjection(g);

  if (!projection.validation.ok) {
    throw new Error(`MERMAID_STRUCTURAL_VALIDATION_FAILED:${projection.validation.errors.join(',')}`);
  }

  const previousFingerprints = NOTE_TARGETS.map((path) => {
    const previous = existsSync(path) ? readFileSync(path, 'utf8') : '';
    return extractGraphFingerprint(previous);
  });
  if (previousFingerprints.every((fingerprint) => fingerprint === projection.fingerprint)) {
    console.log(`[obsidian-nota] NO_CHANGE · targets=${NOTE_TARGETS.length} · fingerprint=${projection.fingerprint.slice(0, 12)} · WRITE=UNCHANGED`);
    return;
  }

  const s = projection.stats;
  const monitorados = projection.monitored;
  const caidos = projection.down;
  const agoraBR = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

  const tabela = monitorados.map((node) =>
    `| ${statusDot(node.status)} | ${cleanGraphLabel(node.label)} | \`${node.pm2 || '—'}\` | ${node.status} |`
  ).join('\n');

  const anomalias = caidos.length
    ? caidos.map((node) => `- 🔴 **${cleanGraphLabel(node.label)}** (\`${node.pm2 || '—'}\`) — status \`${node.status}\`.`).join('\n')
    : '✅ Nenhuma anomalia de processo — todos os processos monitorados estão online.';

  const fluxos = s.fluxos_criticos.map((flow) => `- ${flow}`).join('\n') || '_(sem fluxos registrados)_';
  const auditMd = buildAuditMarkdown(projection.audit);

  const md = `---
title: "Grafo Vivo — Visão em Tempo Real"
status: "DERIVED_CURRENT_PROJECTION"
date: 2026-07-03
tags: ["grafo", "arquitetura", "saude", "tempo-real", "mermaid", "sistema"]
updated: ${new Date().toISOString().slice(0, 10)}
source: "apps/modulos/status/graph-data.json"
source_class: "RUNTIME_DERIVED"
source_rule: "LIVE_GRAPH_DATA -> BRAIN_PROJECTION; GRAPH != AUTHORITY"
owner: "scripts/grafo-vivo/obsidian-nota.mjs"
writer: "CentralDark-GrafoVivo/cron-grafo-unificado"
authority: false
primary_projection: "docs/BRAIN/00-MAPA-SISTEMA/02-GRAFOS/GRAFO-VIVO.md"
legacy_compat_mirror: "docs/BRAIN/00 - Mapa do Sistema/GRAFO-VIVO.md"
---

# 🕸️ Grafo Vivo — Visão em Tempo Real

> Nota **gerada automaticamente** a partir de \`graph-data.json\`.
> **Mermaid não é verdade:** é uma projeção visual derivada do estado observado. O desenho nunca sobrescreve o canônico.

\`\`\`
┌────────────────────────────────────────────────────────┐
│  🕸️ GRAFO VIVO · atualizado ${agoraBR.padEnd(24)}│
│  ${String(s.total_nodes ?? projection.nodes.length).padStart(3)} nós · ${String(s.total_edges ?? projection.edges.length).padStart(3)} arestas · ${String(s.online ?? 0).padStart(2)} 🟢 online · ${String(s.offline ?? 0).padStart(2)} 🔴 off       │
│  ${String(s.processos_vivos ?? 0).padStart(2)} processos PM2 · ${String(s.gateway_req_15min ?? 0).padStart(3)} req ChatGPT/15min                │
└────────────────────────────────────────────────────────┘
\`\`\`

## 🗺️ Topologia (quem chama quem — núcleo)

\`\`\`mermaid
${projection.mermaid}
\`\`\`

> Vermelho = processo caído. O diagrama é derivado; divergência visual vira achado para investigação, não autoridade.

## 🔎 Auditoria visual das relações

${auditMd}

## 🩺 Saúde dos processos monitorados

| | Nó | Processo PM2 | Status |
|--|----|----|----|
${tabela}

## 🚨 Anomalias

${anomalias}

## 🔀 Fluxos críticos

${fluxos}

## 🧾 Receipt da projeção

\`\`\`text
PROJECTION_SOURCE=${GRAPH_RELATIVE}
PRIMARY_PROJECTION=docs/BRAIN/00-MAPA-SISTEMA/02-GRAFOS/GRAFO-VIVO.md
LEGACY_COMPAT_MIRROR=docs/BRAIN/00 - Mapa do Sistema/GRAFO-VIVO.md
FRESHNESS_KEY=GRAPH_FINGERPRINT
GRAPH_FINGERPRINT=${projection.fingerprint}
MERMAID_KIND=flowchart
MERMAID_STRUCTURAL_VALIDATION=PASS
VISUAL_IS_TRUTH=false
FOCUS_NODES=${projection.focus_nodes.length}
FOCUS_EDGES=${projection.focus_edges.length}
DANGLING_EDGES=${projection.audit.dangling_edges.length}
DUPLICATE_EDGES=${projection.audit.duplicate_edges.length}
SELF_LOOPS=${projection.audit.self_loops.length}
CYCLE_NODES=${projection.audit.cycle_nodes.length}
ISOLATED_NODES=${projection.audit.isolated_nodes.length}
WRITE=UPDATED
\`\`\`

---
🔗 [[00-MAPA]] · [[02-ARQUITETURA]] · [[MAPA-DOS-BOTS]] · painel: status.centralldark.com
`;

  const writeStates = NOTE_TARGETS.map((path) => ({
    path,
    state: atomicWriteUtf8Sync(path, md),
  }));
  console.log(`[obsidian-nota] SYNCED · ${monitorados.length} monitorados · ${caidos.length} caído(s) · fingerprint=${projection.fingerprint.slice(0, 12)} · ${writeStates.map((item) => `${item.path}:${item.state}`).join(' · ')}`);
}

main();
