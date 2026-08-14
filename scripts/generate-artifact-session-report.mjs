#!/usr/bin/env node
// Gera o primeiro artefato nativo do schema universal: o relatório da
// sessão 2026-08-08 (MOTOR-TESTE + CentralDark). Não importa
// core/orchestrator.mjs de propósito — aquele arquivo escuta HTTP e roda um
// loop infinito ao ser importado (sem guard de entrypoint), então qualquer
// script que precise só das funções puras usa schema.mjs + session-report.mjs
// diretamente, exatamente como o orchestrator vai fazer em produção via
// construirArtefatoDedicado(). Reconstruído a partir de evidência real do
// GitHub (commits, PRs, timestamps) — não é cópia do Claude Artifact desta
// sessão, que serviu só de referência visual.

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildArtifactRecord } from '../apps/modulos/artifacts-builder/core/schema.mjs';
import { renderSessionReportHtml, renderSessionReportCss } from '../apps/modulos/artifacts-builder/core/session-report.mjs';

const BASE = dirname(dirname(fileURLToPath(import.meta.url)));
const SLUG = 'motor-teste-centraldark-relatorio-sessao-20260808';
const OUT = join(BASE, 'apps/modulos/artifacts-builder/public', SLUG);

const data = {
  summary: 'Do npm quebrado em casa até o gate de finalização do Hermes fechando falso-verde por falso-verde no remoto — o que mudou, quem mexeu, e o que ainda está esperando decisão.',
  stats: [
    { n: '3/3', label: 'PRs acompanhadas ao vivo, todas mergeadas' },
    { n: '3/5', label: 'diagnósticos da #196 já resolvidos' },
    { n: '5', label: 'recibos postados no repo real' },
    { n: '2', label: 'bugs reais achados no MOTOR-TESTE' },
    { n: '1', label: 'causa raiz confirmada, sem canal seguro pra corrigir sozinho' },
    { n: '1', label: 'teoria própria descartada a tempo, com prova' },
  ],
  timeline: [
    { time: '03:36', kind: 'neutral', msg: 'início da série test→fix do gate de finalização Hermes', sha: 'c0f48fc', status: '' },
    { time: '04:06', kind: 'merge', msg: 'PR #705 mergeia (lupa-conformance)', sha: '03c1436', status: 'MERGE' },
    { time: '04:29', kind: 'merge', msg: 'PR #704 mergeia — gate de finalização fechado', sha: '2a1eb20', status: 'MERGE' },
    { time: '05:42', kind: 'merge', msg: 'PR #662 mergeia — SEGREDO/SOL/PIVETE', sha: '7509860', status: 'MERGE' },
    { time: '05:58', kind: 'warn', msg: 'commit acidental sem escopo', sha: '12d1643', status: 'ERRO' },
    { time: '05:59', kind: 'merge', msg: 'revertido — 17 segundos depois, sozinho', sha: '20813d3', status: 'AUTOCORRIGIDO' },
  ],
  motorTeste: [
    'npm install tinha ficado pela metade numa sessão anterior — binários nativos Windows corrompidos silenciosamente (@parcel/watcher, @swc/core, @next/swc). npm ci limpo resolveu.',
    'Sobraram dois bugs de código real: import quebrado em quotaStrategies.ts e colisão de migration (134 duplicado). Corrigidos na marra — depois substituídos pela correção oficial já mergeada rio acima (PR #9688 no repo do OmniRoute).',
    'Dashboard testado com prova HTTP real: login, sessão, API de settings, jobs de fundo — tudo 200.',
  ],
  centralDark: [
    'Leitura completa dos 5 documentos canônicos de governança antes de qualquer ação (LEIA-ME-IA.md, AGENTS.md, contrato de reconciliação, JARVIS-ORQUESTRACAO, boot universal).',
    'Gate real da meta-lupa (scripts/meta_lupa.py) rodado contra a própria análise — primeira rodada bateu em SECRET_DETECTADO por um IP literal no input, corrigido, segunda rodada APROVAR.',
    'Colisão de escopo real achada entre duas PRs abertas no mesmo arquivo (orchestrator.mjs do Hermes-Core), triagem de um lote de 4 PRs históricas com identidade de escritor honesta (UNKNOWN quando não provável), e reavaliação da issue #196 com fato medido agora em vez do relato de 22/07.',
  ],
  evolution: {
    before: 'Relatório de sessão só existia como Claude Artifact — dependente de claude.ai, sem schema, sem digest, sem lugar no CentralDark.',
    change: 'Schema universal de artefato + reaproveitamento do que a PR #668 já provou (sanitização, digest SHA-256, artifact != aprovação) portado pro artifacts-builder existente.',
    after: 'Primeiro artefato nativo do CentralDark, renderer dedicado por tipo, biblioteca continua servida pelo mesmo módulo — sem produto paralelo.',
  },
  pending: [
    { owner_type: 'human', desc: 'Raiz da VPS 569 commits atrás desde que o webhook foi aposentado (21/07, PR #287) — sem substituto. deploy-operational-guards.sh', owner: 'SEGREDO/CHEFE' },
    { owner_type: 'agent', desc: 'docs/AUDITORIAS/AUDITORIA-FLUXO-DE-OURO.md nunca foi escrito — issue #144', owner: 'Codex + Claude' },
    { owner_type: 'human', desc: 'Rotação de PAT + remoção de secret hardcoded — issue #190', owner: 'SEGREDO/CHEFE' },
    { owner_type: 'none', desc: 'Biblioteca /artefatos com filtros completos, API REST (GET /api/artifacts/*) e renderer 3D — deferidos deste PR, não fabricados como PASS', owner: 'próxima rodada' },
  ],
  evidence: [
    { type: 'PR', ref: '#704', result: 'MERGED 04:29:37Z', url: 'https://github.com/ServerVpss/CentralDark/pull/704' },
    { type: 'PR', ref: '#705', result: 'MERGED 04:06:41Z', url: 'https://github.com/ServerVpss/CentralDark/pull/705' },
    { type: 'PR', ref: '#662', result: 'MERGED 05:42:34Z', url: 'https://github.com/ServerVpss/CentralDark/pull/662' },
    { type: 'ISSUE', ref: '#196', result: '3/5 diagnósticos resolvidos, reavaliado', url: 'https://github.com/ServerVpss/CentralDark/issues/196' },
    { type: 'ISSUE', ref: '#144', result: 'arquivo de auditoria confirmado ausente', url: 'https://github.com/ServerVpss/CentralDark/issues/144' },
    { type: 'PR', ref: '#668', result: 'gold reaproveitado (Draft, não mergeada)', url: 'https://github.com/ServerVpss/CentralDark/pull/668' },
  ],
};

const record = buildArtifactRecord({
  artifact_type: 'session-report',
  title: 'MOTOR-TESTE + CentralDark — Relatório de Sessão 2026-08-08',
  slug: SLUG,
  purpose: {
    what: 'Relatório nativo CentralDark da sessão de 08/08/2026 (MOTOR-TESTE local + CentralDark remoto).',
    why: 'Substituir a dependência do Claude Artifact por um artefato que mora, é validado e é servido dentro do próprio CentralDark.',
    for_whom: 'SEGREDO/CHEFE e qualquer agente que precise retomar o contexto da sessão sem reconstruir a investigação.',
  },
  story: {
    before: 'MOTOR-TESTE fora do ar, npm install corrompido; CentralDark com colisões de escopo não sinalizadas.',
    change: 'Diagnóstico real (não achismo) de cada bloqueio, correções onde seguro, causa raiz registrada onde não.',
    after: 'MOTOR-TESTE rodando com prova HTTP; CentralDark com 3 PRs fechadas e 3/5 diagnósticos da #196 resolvidos.',
  },
  producer: {
    agent: 'claude',
    role: 'EXECUTOR',
    model: 'claude-sonnet-5',
    writer_session: 'UNKNOWN', // honesto: sem mecanismo de trailer/sessão provável nesta rodada
  },
  mission_id: 'CENTRALDARK-ARTEFATO-UNIVERSAL-20260808',
  source: {
    repository: 'ServerVpss/CentralDark',
    branch: 'feat/artifacts-universal-schema-20260808',
    head_sha: '1e41ea5f584cafa81618272454b180e398ab16ee',
    issue: null,
    pull_request: null, // preenchido depois de abrir o PR (não se auto-referencia antes de existir)
    source_refs: data.evidence.map((e) => e.url),
  },
  state: 'PROVED',
  evidence: data.evidence,
  relations: {
    parent_artifact: null,
    related_artifacts: [],
    packages: ['25', '28', '34', '36'],
    modules: ['apps/modulos/artifacts-builder'],
  },
});

if (!record.validation.ok) {
  console.error('BLOQUEADO — validação falhou:', record.validation.errors);
  process.exit(1);
}

await mkdir(OUT, { recursive: true });
await writeFile(join(OUT, 'index.html'), renderSessionReportHtml(record, data), 'utf8');
await writeFile(join(OUT, 'style.css'), renderSessionReportCss(), 'utf8');
await writeFile(join(OUT, 'app.js'), '// renderer dedicado: sem JS de runtime, HTML já vem pronto do build\n', 'utf8');
await writeFile(join(OUT, 'manifest.json'), JSON.stringify(record, null, 2), 'utf8');

console.log('ARTIFACT_BUILT', SLUG);
console.log('state', record.state);
console.log('artifact_id', record.artifact_id);
console.log('content_digest', record.content_digest);
console.log('receipt_digest', record.receipt_digest);
