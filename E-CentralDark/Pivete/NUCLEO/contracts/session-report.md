# CONTRATO - session-report.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\apps\modulos\artifacts-builder\core\session-report.mjs
**SHA:** d41a0d89c4f09ad4
**Timestamp:** 2026-08-28T02:56:07.739832
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1px; background: var(--line);
- .block-head { display: flex; gap: .7rem; align-items: baseline; border-left: 3px solid var(--primary); padding-left: .8rem; margin-bottom: 1rem; }
- .tl-row { display: grid; grid-template-columns: 80px 16px 1fr auto; align-items: center; gap: .8rem; padding: .6rem 1rem; min-width: 420px; }
- .evolution { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr; gap: .8rem; align-items: start; }
- .ledger { display: flex; flex-direction: column; gap: .5rem; }
- .ledger-row { display: grid; grid-template-columns: auto 1fr auto; gap: .8rem; align-items: center;
- .evidence-grid { display: grid; gap: .5rem; }
- .evidence { display: grid; grid-template-columns: auto 1fr auto; gap: .8rem; align-items: center; text-decoration: none;
- .sign { font-family: var(--mono); font-size: .72rem; color: var(--faint); display: flex; flex-wrap: wrap; gap: .5rem 1rem; }

### Ouro Bruto (primeiros 5000 chars)
```
// 📄 Renderer nativo do tipo `session-report`.
//
// Primeiro renderer diferenciado do Artifacts Builder — até aqui todo
// artefato caía no mesmo template de cards genéricos independente do
// `tipo` declarado (achado registrado no contrato). Este é o primeiro que
// realmente varia por capacidade, como pedido: 2D sempre, 3D só quando
// acrescenta compreensão de verdade (aqui não acrescenta — é um relatório
// para ler, não um grafo espacial — então este tipo é 3D_NOT_APPLICABLE,
// declarado, não omitido).
//
// Paleta: reaproveita os tokens já em produção em core/orchestrator.mjs
// (bg #0a0f0d, surface #101a15, line #294235, text #eef8f1, muted #9fb8aa,
// primary #34d399) — a mesma família BLACK + GREEN, sem tema novo.

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

function fmtPct(part, total) {
  if (!total) return '—';
  return `${Math.round((part / total) * 100)}%`;
}

const STATE_COLOR = { PROVED: '#34d399', PARTIAL: '#f2c14e', BLOCKED: '#f87171', UNPROVEN: '#9fb8aa', HISTORICAL: '#6b8577' };

function statChip(n, label) {
  return `<div class="chip"><div class="chip-n">${escapeHtml(n)}</div><div class="chip-l">${escapeHtml(label)}</div></div>`;
}

function timelineRow(ev) {
  const dotColor = ev.kind === 'merge' ? 'var(--primary)' : ev.kind === 'warn' ? '#f2c14e' : '#5c7568';
  return `<div class="tl-row">
    <span class="tl-time">${escapeHtml(ev.time)}</span>
    <span class="tl-dot" style="background:${dotColor}"></span>
    <span class="tl-msg">${escapeHtml(ev.msg)} <code class="sha">${escapeHtml(ev.sha)}</code></span>
    <span class="tl-status" style="color:${dotColor}">${escapeHtml(ev.status)}</span>
  </div>`;
}

function ledgerRow(row) {
  const pillClass = row.owner_type === 'human' ? 'human' : row.owner_type === 'agent' ? 'agent' : 'none';
  return `<div class="ledger-row">
    <span class="pill ${pillClass}">${escapeHtml(row.owner_type)}</span>
    <span class="desc">${escapeHtml(row.desc)}</span>
    <span class="owner">${escapeHtml(row.owner)}</span>
  </div>`;
}

function evidenceRow(ev) {
  const href = escapeHtml(ev.url);
  return `<a class="evidence" href="${href}" target="_blank" rel="noopener noreferrer">
    <span class="ev-type">${escapeHtml(ev.type)}</span>
    <span class="ev-ref">${escapeHtml(ev.ref)}</span>
    <span class="ev-result">${escapeHtml(ev.result)}</span>
  </a>`;
}

/** Constrói o HTML humano do relatório de sessão. `record` é o resultado
 * de `buildArtifactRecord()` (schema.mjs) já com digests calculados. */
export function renderSessionReportHtml(record, data) {
  const stateColor = STATE_COLOR[record.state] ?? STATE_COLOR.UNPROVEN;
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${escapeHtml(record.title)} · CentralDark</title>
<meta name="description" content="${escapeHtml(data.summary)}"/>
<link rel="stylesheet" href="style.css"/>
</head>
<body>
<div class="rail"></div>
<main class="page">
  <header class="masthead">
    <div class="eyebrow">RELATÓRIO DE SESSÃO · ARTIFACT #${escapeHtml(record.artifact_id)} · <span style="color:${stateColor}">${escapeHtml(record.state)}</span></div>
    <h1>${escapeHtml(record.title)}</h1>
    <p>${escapeHtml(data.summary)}</p>
  </header>

  <section class="stats">
    ${data.stats.map(s => statChip(s.n, s.label)).join('\n    ')}
  </section>

  <section class="block">
    <div class="block-head"><span class="tag">Timeline</span><h2>Eventos reais, do commit ao merge</h2></div>
    <div class="timeline">
      ${data.timeline.map(timelineRow).join('\n      ')}
    </div>
  </section>

  <section class="block">
    <div class="block-head"><span class="tag">Local</span><h2>MOTOR-TESTE</h2></div>
    <div class="card"><p>${data.motorTeste.map(escapeHtml).join('</p><p>')}</p></div>
  </section>

  <section class="block">
    <div class="block-head"><span class="tag">Remoto</span><h2>ServerVpss/CentralDark</h2></div>
    <div class="card"><p>${data.centralDark.map(escapeHtml).join('</p><p>')}</p></div>
  </section>

  <section class="block">
    <div class="block-head"><span class="tag">Evolução</span><h2>Antes → mudança → depois</h2></div>
    <div class="evolution">
      <div class="ev-col"><div class="ev-h">Antes</div><p>${escapeHtml(data.evolution.before)}</p></div>
      <div class="ev-arrow">→</div>
      <div class="ev-col"><div class="ev-h">Mudança</div><p>${escapeHtml(data.evolution.change)}</p></div>
      <div class="ev-arrow">→</div>
      <div class="ev-col"><div class="ev-h">Depois</div><p>${escapeHtml(data.evolution.after)}</p></div>
    </div>
  </section>

  <section class="block">
    <div class="block-head"><span class="tag">Pendente</span><h2>O que ainda está em aberto</h2></div>
    <div class="ledger">
      ${data.pending.map(ledgerRow).join('\n      '
```