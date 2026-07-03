#!/usr/bin/env node
/**
 * Nota viva do Grafo no Obsidian — lê graph-data.json e escreve uma nota Markdown
 * que renderiza no Obsidian (Mermaid nativo): topologia focada + saúde dos processos + anomalias.
 * O Pivete só VISUALIZA no Obsidian; a nota é 100% gerada (nunca editada à mão).
 *
 * Roda junto do loop (a cada 5min). Uso: node obsidian-nota.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';

const GRAPH = '/root/CentralDark/apps/modulos/status/graph-data.json';
const NOTA  = '/root/CentralDark/docs/BRAIN/00 - Mapa do Sistema/GRAFO-VIVO.md';

const mid   = s => String(s).replace(/[^a-zA-Z0-9]/g, '_');           // id seguro pro Mermaid
const clean = l => String(l || '')                                    // tira dot do label
  .replace(/^[\u{1F7E2}\u{1F534}\u{1F7E1}⚪]\s*/u, '')                  // dot de status (pair-aware)
  .replace(/[\uD800-\uDFFF�]/g, '').trim();                           // limpa lixo de corrupção
const dot   = st => ({ online: '🟢', stopped: '🔴', errored: '🟡', launching: '🟡' }[st] || '⚪');

function main() {
  const g = JSON.parse(readFileSync(GRAPH, 'utf8'));
  const nodes = g.nodes || [];
  const edges = g.edges || [];
  const byId = new Map(nodes.map(n => [n.id, n]));
  const s = g.stats || {};
  const agoraBR = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

  // Subgrafo FOCADO pra Mermaid ficar legível: núcleo + gateways + orquestradores + monitorados vivos
  const gruposFoco = new Set(['core', 'edge-ia', 'monitoramento']);
  const tiposFoco  = new Set(['orquestrador', 'gateway', 'storage']);
  const foco = nodes.filter(n => n.status || gruposFoco.has(n.group) || tiposFoco.has(n.type));
  const focoIds = new Set(foco.map(n => n.id));
  const arestasFoco = edges.filter(e => focoIds.has(e.from) && focoIds.has(e.to));

  // Monitorados (com status vivo) → tabela de saúde
  const monitorados = nodes.filter(n => n.status).sort((a, b) => a.label.localeCompare(b.label));
  const caidos = monitorados.filter(n => n.status !== 'online');

  // ── Mermaid ──
  const linhasNos = foco.map(n => {
    const lbl = (n.status ? dot(n.status) + ' ' : '') + clean(n.label);
    return `    ${mid(n.id)}["${lbl.replace(/"/g, "'")}"]`;
  });
  const linhasArestas = arestasFoco.map(e => {
    const lab = (e.label || '').slice(0, 22).replace(/[\[\]"|]/g, '');
    return lab ? `    ${mid(e.from)} -->|${lab}| ${mid(e.to)}` : `    ${mid(e.from)} --> ${mid(e.to)}`;
  });
  const classesCaidos = caidos.length
    ? `\n    classDef caido stroke:#ef4444,stroke-width:3px,color:#ef4444;\n    class ${caidos.map(n => mid(n.id)).join(',')} caido;`
    : '';

  // ── tabela de saúde ──
  const tabela = monitorados.map(n =>
    `| ${dot(n.status)} | ${clean(n.label)} | \`${n.pm2 || '—'}\` | ${n.status} |`
  ).join('\n');

  // ── anomalias ──
  const anomalias = caidos.length
    ? caidos.map(n => `- 🔴 **${clean(n.label)}** (\`${n.pm2}\`) — status \`${n.status}\`. Investigar: \`pm2 describe ${n.pm2}\``).join('\n')
    : '✅ Nenhuma anomalia — todos os processos monitorados estão online.';

  const fluxos = (s.fluxos_criticos || []).map(f => `- ${f}`).join('\n') || '_(sem fluxos registrados)_';

  const md = `---
title: "Grafo Vivo — Visão em Tempo Real"
date: 2026-07-03
tags: ["grafo", "arquitetura", "saude", "tempo-real", "mermaid", "sistema"]
updated: ${new Date().toISOString().slice(0, 10)}
---

# 🕸️ Grafo Vivo — Visão em Tempo Real

> Nota **gerada automaticamente** a cada 5min a partir de \`graph-data.json\` (estado real do PM2 + gateway).
> Não edite à mão — é sobrescrita. Mesmo grafo de \`status.centralldark.com\`, aqui dentro do Obsidian.

\`\`\`
┌────────────────────────────────────────────────────────┐
│  🕸️ GRAFO VIVO · atualizado ${agoraBR.padEnd(24)}│
│  ${String(s.total_nodes ?? nodes.length).padStart(3)} nós · ${String(s.total_edges ?? edges.length).padStart(3)} arestas · ${String(s.online ?? 0).padStart(2)} 🟢 online · ${String(s.offline ?? 0).padStart(2)} 🔴 off       │
│  ${String(s.processos_vivos ?? 0).padStart(2)} processos PM2 · ${String(s.gateway_req_15min ?? 0).padStart(3)} req ChatGPT/15min                │
└────────────────────────────────────────────────────────┘
\`\`\`

## 🗺️ Topologia (quem chama quem — núcleo)

\`\`\`mermaid
flowchart LR
${linhasNos.join('\n')}
${linhasArestas.join('\n')}${classesCaidos}
\`\`\`

> Vermelho = processo caído. Diagrama focado no núcleo; a saúde completa está na tabela abaixo.

## 🩺 Saúde dos processos monitorados

| | Nó | Processo PM2 | Status |
|--|----|----|----|
${tabela}

## 🚨 Anomalias

${anomalias}

## 🔀 Fluxos críticos

${fluxos}

---
🔗 [[00-MAPA]] · [[02-ARQUITETURA]] · [[MAPA-DOS-BOTS]] · painel: status.centralldark.com
`;

  writeFileSync(NOTA, md);
  console.log(`[obsidian-nota] ✅ ${monitorados.length} monitorados · ${caidos.length} caído(s) · nota atualizada`);
}

main();
